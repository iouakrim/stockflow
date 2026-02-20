-- Schema for StockFlow Pro

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants (Organizations)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles (Extends Supabase Auth Auth.Users)
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cashier');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'cashier'::user_role NOT NULL,
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

-- 3.5. Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5. Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  barcode TEXT,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.0,
  unit TEXT DEFAULT 'kg',
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, barcode),
  UNIQUE(tenant_id, sku)
);

-- 5. Stock Movements (Audit for all inventory changes)
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

-- 6. Customers
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

-- 7. Sales
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'credit', 'bank_transfer');

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
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

-- 8. Sale Items
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

-- 9. Credit Payments
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

-- 10. Audit Logs
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

-- Indexes
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_sales_tenant_date ON sales(tenant_id, created_at DESC);
CREATE INDEX idx_customers_tenant ON customers(tenant_id);

-- RLS Configuration
-- Helper function to get the current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = auth.uid();
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Base Policy: Users can only see and modify rows matching their tenant_id
-- (A more granular setup would handle CRUD explicitly, but this serves as the foundational multi-tenant barrier)

CREATE POLICY "Tenant isolation for products" ON products
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for sales" ON sales
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for customers" ON customers
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

-- RPC: Atomic Sale Execution
CREATE OR REPLACE FUNCTION process_sale(
  p_tenant_id UUID,
  p_cashier_id UUID,
  p_customer_id UUID,
  p_payment_method payment_method,
  p_items JSONB -- Array of {product_id, quantity, unit_price, total_price}
) RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_total DECIMAL(12, 2) := 0;
  v_item JSONB;
  v_receipt_number TEXT;
  v_stock_quantity INT;
BEGIN
  -- Generate receipt number
  v_receipt_number := 'RCP-' || to_char(NOW(), 'YYYYMMDDHH24MISS');

  -- Calculate total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_total := v_total + (v_item->>'total_price')::DECIMAL;
  END LOOP;

  -- Create sale
  INSERT INTO sales (tenant_id, receipt_number, customer_id, cashier_id, subtotal, total, amount_paid, payment_method)
  VALUES (p_tenant_id, v_receipt_number, p_customer_id, p_cashier_id, v_total, v_total, v_total, p_payment_method)
  RETURNING id INTO v_sale_id;

  -- Process items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Verify stock
    SELECT stock_quantity INTO v_stock_quantity FROM products WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id FOR UPDATE;
    
    IF v_stock_quantity < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_id';
    END IF;

    -- Insert sale item
    INSERT INTO sale_items (tenant_id, sale_id, product_id, quantity, unit_price, total_price)
    VALUES (
      p_tenant_id, 
      v_sale_id, 
      (v_item->>'product_id')::UUID, 
      (v_item->>'quantity')::INT, 
      (v_item->>'unit_price')::DECIMAL, 
      (v_item->>'total_price')::DECIMAL
    );

    -- Reduce product stock
    UPDATE products 
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT 
    WHERE id = (v_item->>'product_id')::UUID AND tenant_id = p_tenant_id;

    -- Record stock movement
    INSERT INTO stock_movements (tenant_id, product_id, type, quantity, reference_id, created_by)
    VALUES (
      p_tenant_id,
      (v_item->>'product_id')::UUID,
      'sale',
      -(v_item->>'quantity')::INT,
      v_sale_id,
      p_cashier_id
    );
  END LOOP;

  -- Handle customer credit if applicable
  IF p_payment_method = 'credit' AND p_customer_id IS NOT NULL THEN
    UPDATE customers 
    SET credit_balance = credit_balance + v_total 
    WHERE id = p_customer_id AND tenant_id = p_tenant_id;
  END IF;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
