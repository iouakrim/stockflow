-- =========================================================================================
-- WIPE AND REBUILD STOCKFLOW PRO DATABASE SCHEMA
-- This script completely drops existing tables and rebuilds the schema from scratch.
-- DANGER: CONTAINS DROP SCHEMA COMMAND
-- =========================================================================================

-- 1. COMPLETE WIPE (Safe Drop)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant access to public schema
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supabase default role grants for the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- =========================================================================================
-- SYSTEM TABLES
-- =========================================================================================

-- 1. Tenants (Organizations)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tax_id TEXT,
  currency TEXT DEFAULT 'DH',
  reporting_period TEXT DEFAULT 'monthly',
  brand_color TEXT DEFAULT '#0fbd66',
  logo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles (Extends Supabase Auth Auth.Users)
CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'manager', 'cashier');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'cashier'::user_role NOT NULL,
  warehouse_access UUID[] DEFAULT '{}'::UUID[], -- Array of warehouse IDs this user can access
  preferred_language TEXT DEFAULT 'fr',
  preferred_palette TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Warehouses / Locations
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT, -- e.g., 'Grains', 'Fertilizers', 'Equipment'
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Products (Global Dictionary)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  barcode TEXT,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  unit TEXT DEFAULT 'kg',
  -- Note: stock_quantity and low_stock_threshold are intentionally removed here!
  -- They are now managed strictly within warehouse_stock
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, barcode),
  UNIQUE(tenant_id, sku)
);

-- 6. Warehouse Stock (Per-depot quantities)
CREATE TABLE warehouse_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(warehouse_id, product_id)
);

-- 7. Stock Movements (Audit for all inventory changes)
CREATE TYPE movement_type AS ENUM ('in', 'out', 'adjustment', 'sale', 'return');

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT,
  type movement_type NOT NULL,
  quantity INT NOT NULL, -- positive for 'in', negative for 'out'
  reference_id UUID, -- can link to a sale_id or purchase_order_id
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  credit_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Sales
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'credit', 'bank_transfer');

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE RESTRICT NOT NULL, -- Mandatory link to Depot
  receipt_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  cashier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  payment_method payment_method NOT NULL DEFAULT 'cash'::payment_method,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, receipt_number)
);

-- 10. Sale Items
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Credit Payments
CREATE TABLE credit_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  notes TEXT,
  received_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================================
-- INDEXES
-- =========================================================================================
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_sales_tenant_date ON sales(tenant_id, created_at DESC);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX idx_warehouse_stock_lookup ON warehouse_stock(warehouse_id, product_id);

-- =========================================================================================
-- RLS CONFIGURATION & SECURITY
-- =========================================================================================

-- Helper function to get the current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has access to a specific warehouse
CREATE OR REPLACE FUNCTION user_has_warehouse_access(w_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
  v_access UUID[];
BEGIN
  SELECT role, warehouse_access INTO v_role, v_access FROM public.profiles WHERE id = auth.uid();
  
  -- Super-admin always has access
  IF v_role = 'super-admin' THEN
    RETURN TRUE;
  END IF;

  -- Admin might have full access or restricted, depending on your business rules. 
  -- Assuming full access for admin as well for now.
  IF v_role = 'admin' THEN
      RETURN TRUE;
  END IF;

  -- Otherwise, check if the warehouse_id is in the user's access array
  IF w_id = ANY(v_access) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disable RLS for tenants, profiles, warehouses to allow simple sign up logic temporarily
-- You can lock these down later once Auth flows are rock solid
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses DISABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- TENANT ISOLATION POLICIES
CREATE POLICY "Tenant isolation for suppliers" ON suppliers FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for products" ON products FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for customers" ON customers FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for sales" ON sales FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for sale_items" ON sale_items FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for stock_movements" ON stock_movements FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for credit_payments" ON credit_payments FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for audit_logs" ON audit_logs FOR ALL USING (tenant_id = get_current_tenant_id()) WITH CHECK (tenant_id = get_current_tenant_id());

-- WAREHOUSE ISOLATION POLICIES (Extra layer of security for multi-depot operations)
CREATE POLICY "Warehouse isolation for warehouse_stock" ON warehouse_stock 
    FOR ALL 
    USING (tenant_id = get_current_tenant_id() AND user_has_warehouse_access(warehouse_id)) 
    WITH CHECK (tenant_id = get_current_tenant_id() AND user_has_warehouse_access(warehouse_id));

-- =========================================================================================
-- DATABASE FUNCTIONS & TRIGGERS (RPCs)
-- =========================================================================================

-- RPC: Atomic Sale Execution with Warehouse support
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
  v_stock_quantity INT;
BEGIN
  -- 1. Security Check: Does this user have access to sell from this warehouse?
  IF NOT user_has_warehouse_access(p_warehouse_id) THEN
    RAISE EXCEPTION 'Access Denied: You do not have permission to process sales for this warehouse.';
  END IF;

  -- 2. Generate receipt number
  v_receipt_number := 'RCP-' || to_char(NOW(), 'YYYYMMDDHH24MISS');

  -- 3. Calculate subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_subtotal := v_subtotal + (v_item->>'total_price')::DECIMAL;
  END LOOP;

  -- 4. Calculate grand total
  v_total := v_subtotal - p_discount;
  IF v_total < 0 THEN
      v_total := 0;
  END IF;

  -- 5. Create sale record linked to specific warehouse
  INSERT INTO sales (tenant_id, warehouse_id, receipt_number, customer_id, cashier_id, subtotal, discount, total, amount_paid, payment_method)
  VALUES (
    p_tenant_id, 
    p_warehouse_id, 
    v_receipt_number, 
    p_customer_id, 
    p_cashier_id, 
    v_subtotal, 
    p_discount, 
    v_total, 
    CASE WHEN p_payment_method = 'credit' THEN 0 ELSE v_total END, 
    p_payment_method
  )
  RETURNING id INTO v_sale_id;

  -- 6. Process items and update stock PER WAREHOUSE
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Verify stock in the specific warehouse
    SELECT stock_quantity INTO v_stock_quantity 
    FROM warehouse_stock 
    WHERE product_id = (v_item->>'product_id')::UUID 
      AND warehouse_id = p_warehouse_id 
      AND tenant_id = p_tenant_id 
    FOR UPDATE;
    
    IF v_stock_quantity IS NULL OR v_stock_quantity < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock in warehouse for product %', v_item->>'product_id';
    END IF;

    -- Insert sale item
    INSERT INTO sale_items (tenant_id, sale_id, product_id, quantity, unit_price, total_price)
    VALUES (
      p_tenant_id, v_sale_id, (v_item->>'product_id')::UUID, 
      (v_item->>'quantity')::INT, (v_item->>'unit_price')::DECIMAL, (v_item->>'total_price')::DECIMAL
    );

    -- Reduce local warehouse stock
    UPDATE warehouse_stock 
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT 
    WHERE product_id = (v_item->>'product_id')::UUID 
      AND warehouse_id = p_warehouse_id;

    -- Record stock movement
    INSERT INTO stock_movements (tenant_id, warehouse_id, product_id, type, quantity, reference_id, created_by)
    VALUES (
      p_tenant_id, p_warehouse_id, (v_item->>'product_id')::UUID, 
      'sale', -(v_item->>'quantity')::INT, v_sale_id, p_cashier_id
    );
  END LOOP;

  -- 7. Handle customer credit if applicable
  IF p_payment_method = 'credit' AND p_customer_id IS NOT NULL THEN
    UPDATE customers SET credit_balance = credit_balance + v_total 
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;
  END IF;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================================
-- GRANT PERMISSIONS (CRITICAL FOR SUPABASE AUTH REST API)
-- =========================================================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

