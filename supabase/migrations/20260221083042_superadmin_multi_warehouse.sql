-- ==============================================================================
-- STRATEGIC MIGRATION: TRUE MULTI-WAREHOUSE & SUPER-ADMIN ARCHITECTURE
-- ==============================================================================

-- 1. EXTEND ROLES
-- Note: PostgreSQL requires closing transactions around ALTER TYPE if active, 
-- but in Supabase SQL editor it generally works.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super-admin';

-- 2. PROFILE ACCESS MAPPING
-- Store exactly which warehouses a user can manage (ignored for super-admin who sees all)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS warehouse_access UUID[] DEFAULT '{}'::UUID[];

-- 3. WAREHOUSE STOCK (THE CORE OF MULTI-DEPOT)
-- Track stock per product per warehouse.
CREATE TABLE IF NOT EXISTS warehouse_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(warehouse_id, product_id)
);

-- Note: We intentionally leave `stock_quantity` on `products` as a "Global Total" 
-- OR we can choose to ignore it. Let's create a function to automatically 
-- aggregate stock_quantity on `products` when `warehouse_stock` changes.

CREATE OR REPLACE FUNCTION update_global_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE products SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM warehouse_stock WHERE product_id = OLD.product_id) WHERE id = OLD.product_id;
    RETURN OLD;
  ELSE
    UPDATE products SET stock_quantity = (SELECT COALESCE(SUM(stock_quantity), 0) FROM warehouse_stock WHERE product_id = NEW.product_id) WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_global_stock ON warehouse_stock;
CREATE TRIGGER trigger_sync_global_stock
AFTER INSERT OR UPDATE OR DELETE ON warehouse_stock
FOR EACH ROW EXECUTE FUNCTION update_global_product_stock();

-- Migrate existing global stock to the FIRST warehouse available (if fixing existing data)
-- (Users will need to create a warehouse first if none exists)
DO $$
DECLARE
  v_default_warehouse UUID;
  v_prod RECORD;
BEGIN
  -- Grab any warehouse for the tenant
  SELECT id INTO v_default_warehouse FROM warehouses LIMIT 1;
  
  IF v_default_warehouse IS NOT NULL THEN
    FOR v_prod IN SELECT * FROM products WHERE stock_quantity > 0 LOOP
      INSERT INTO warehouse_stock (tenant_id, warehouse_id, product_id, stock_quantity)
      VALUES (v_prod.tenant_id, v_default_warehouse, v_prod.id, v_prod.stock_quantity)
      ON CONFLICT (warehouse_id, product_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;


-- 4. RLS POLICIES FOR WAREHOUSE ISOLATION

CREATE OR REPLACE FUNCTION user_has_warehouse_access(w_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
  v_access UUID[];
BEGIN
  SELECT role, warehouse_access INTO v_role, v_access FROM public.profiles WHERE id = auth.uid();
  IF v_role = 'super-admin' THEN
    RETURN TRUE;
  ELSE
    RETURN w_id = ANY(v_access);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Warehouse isolation for stock" ON warehouse_stock
  FOR ALL
  USING (tenant_id = get_current_tenant_id() AND user_has_warehouse_access(warehouse_id))
  WITH CHECK (tenant_id = get_current_tenant_id() AND user_has_warehouse_access(warehouse_id));

-- Add warehouse_id to sales table to know where the sale happened
ALTER TABLE sales ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT;

-- 5. UPGRADED 'process_sale' RPC (ATOMIC SALE)
DROP FUNCTION IF EXISTS process_sale(UUID, UUID, UUID, payment_method, JSONB, DECIMAL);

CREATE OR REPLACE FUNCTION process_sale(
  p_tenant_id UUID,
  p_cashier_id UUID,
  p_warehouse_id UUID,
  p_customer_id UUID,
  p_payment_method payment_method,
  p_items JSONB, -- Array of {product_id, quantity, unit_price, total_price}
  p_discount DECIMAL(12, 2) DEFAULT 0.0
) RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_subtotal DECIMAL(12, 2) := 0;
  v_total DECIMAL(12, 2) := 0;
  v_item JSONB;
  v_receipt_number TEXT;
  v_local_stock INT;
BEGIN
  IF p_warehouse_id IS NULL THEN
    RAISE EXCEPTION 'A warehouse must be selected to process a sale.';
  END IF;

  IF NOT user_has_warehouse_access(p_warehouse_id) THEN
    RAISE EXCEPTION 'Access denied to warehouse %', p_warehouse_id;
  END IF;

  v_receipt_number := 'RCP-' || to_char(NOW(), 'YYYYMMDDHH24MISS');

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'total_price')::DECIMAL;
  END LOOP;

  v_total := v_subtotal - p_discount;
  IF v_total < 0 THEN v_total := 0; END IF;

  INSERT INTO sales (tenant_id, warehouse_id, receipt_number, customer_id, cashier_id, subtotal, discount, total, amount_paid, payment_method)
  VALUES (p_tenant_id, p_warehouse_id, v_receipt_number, p_customer_id, p_cashier_id, v_subtotal, p_discount, v_total, v_total, p_payment_method)
  RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Verify local stock at the SPECIFIC WAREHOUSE
    SELECT stock_quantity INTO v_local_stock FROM warehouse_stock 
    WHERE product_id = (v_item->>'product_id')::UUID AND warehouse_id = p_warehouse_id FOR UPDATE;
    
    IF v_local_stock IS NULL OR v_local_stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock in this warehouse for product %', v_item->>'product_id';
    END IF;

    -- Record item
    INSERT INTO sale_items (tenant_id, sale_id, product_id, quantity, unit_price, total_price)
    VALUES (
      p_tenant_id, v_sale_id, (v_item->>'product_id')::UUID, 
      (v_item->>'quantity')::INT, (v_item->>'unit_price')::DECIMAL, (v_item->>'total_price')::DECIMAL
    );

    -- Reduce local stock
    UPDATE warehouse_stock 
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT 
    WHERE product_id = (v_item->>'product_id')::UUID AND warehouse_id = p_warehouse_id;

    -- Record stock movement
    INSERT INTO stock_movements (tenant_id, warehouse_id, product_id, type, quantity, reference_id, created_by)
    VALUES (
      p_tenant_id, p_warehouse_id, (v_item->>'product_id')::UUID, 
      'sale', -(v_item->>'quantity')::INT, v_sale_id, p_cashier_id
    );
  END LOOP;

  IF p_payment_method = 'credit' AND p_customer_id IS NOT NULL THEN
    UPDATE customers SET credit_balance = credit_balance + v_total 
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;
  END IF;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
