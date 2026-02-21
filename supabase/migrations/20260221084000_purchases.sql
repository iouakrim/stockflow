-- 1. Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  reference_number TEXT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  status TEXT DEFAULT 'received',
  notes TEXT,
  received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Purchase Items
CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL,
  unit_cost DECIMAL(12, 2) NOT NULL,
  total_cost DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_purchases_tenant ON purchases(tenant_id);
CREATE INDEX idx_purchase_items_tenant ON purchase_items(tenant_id);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for purchases" ON purchases
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for purchase_items" ON purchase_items
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- 3. RPC for Atomic Purchase
CREATE OR REPLACE FUNCTION process_purchase(
  p_tenant_id UUID,
  p_warehouse_id UUID,
  p_supplier_id UUID,
  p_received_by UUID,
  p_reference_number TEXT,
  p_items JSONB, -- Array of {product_id, quantity, unit_cost, total_cost}
  p_notes TEXT DEFAULT ''
) RETURNS UUID AS $$
DECLARE
  v_purchase_id UUID;
  v_total_amount DECIMAL(12, 2) := 0;
  v_item JSONB;
  v_current_stock INT;
  v_old_cost DECIMAL(12, 2);
BEGIN
  -- Validate items
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'A purchase must contain at least one item.';
  END IF;

  -- Calculate total amount
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_total_amount := v_total_amount + (v_item->>'total_cost')::DECIMAL;
  END LOOP;

  -- Create purchase record
  INSERT INTO purchases (tenant_id, warehouse_id, supplier_id, reference_number, total_amount, notes, received_by)
  VALUES (p_tenant_id, p_warehouse_id, p_supplier_id, p_reference_number, v_total_amount, p_notes, p_received_by)
  RETURNING id INTO v_purchase_id;

  -- Process items, update stock and log movements
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Insert purchase item
    INSERT INTO purchase_items (tenant_id, purchase_id, product_id, quantity, unit_cost, total_cost)
    VALUES (
      p_tenant_id,
      v_purchase_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INT,
      (v_item->>'unit_cost')::DECIMAL,
      (v_item->>'total_cost')::DECIMAL
    );

    -- Ensure product exists in this warehouse, or insert with 0 stock
    INSERT INTO warehouse_stock (tenant_id, warehouse_id, product_id, stock_quantity)
    VALUES (p_tenant_id, p_warehouse_id, (v_item->>'product_id')::UUID, 0)
    ON CONFLICT (warehouse_id, product_id) DO NOTHING;

    -- Add to stock
    UPDATE warehouse_stock
    SET stock_quantity = stock_quantity + (v_item->>'quantity')::INT
    WHERE warehouse_id = p_warehouse_id AND product_id = (v_item->>'product_id')::UUID
    RETURNING stock_quantity INTO v_current_stock;

    -- Log movement
    INSERT INTO stock_movements (tenant_id, product_id, warehouse_id, type, quantity, reference_id, notes, created_by)
    VALUES (
      p_tenant_id,
      (v_item->>'product_id')::UUID,
      p_warehouse_id,
      'in',
      (v_item->>'quantity')::INT,
      v_purchase_id,
      'Purchase Receipt: ' || COALESCE(p_reference_number, v_purchase_id::text),
      p_received_by
    );

    -- Optional: Update Average Cost Price (PUMP) on Product level
    -- (This is a simplified approach updating the global product's cost_price to the latest purchase cost)
    UPDATE products
    SET cost_price = (v_item->>'unit_cost')::DECIMAL
    WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id;
    
  END LOOP;

  RETURN v_purchase_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
