-- Migration: RLS Optimization with Role-Based Access Control
-- Description: Replaces simple tenant isolation policies with granular RBAC policies based on user roles (admin, manager, cashier).

-- 1. Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_current_user_role() RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing simple policies
DROP POLICY IF EXISTS "Tenant isolation for products" ON products;
DROP POLICY IF EXISTS "Tenant isolation for sales" ON sales;
DROP POLICY IF EXISTS "Tenant isolation for customers" ON customers;

-- 3. Products RBAC Policies
CREATE POLICY "Products viewable by everyone in tenant" ON products
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Products modifiable by admin and manager" ON products
  FOR ALL USING (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'))
  WITH CHECK (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'));

-- 4. Customers RBAC Policies
CREATE POLICY "Customers viewable by everyone in tenant" ON customers
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Customers insertable by everyone in tenant" ON customers
  FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Customers updatable by everyone in tenant" ON customers
  FOR UPDATE USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Customers deletable by admin and manager" ON customers
  FOR DELETE USING (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'));

-- 5. Sales RBAC Policies
CREATE POLICY "Sales viewable by everyone in tenant" ON sales
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Sales modifiable by admin and manager" ON sales
  FOR ALL USING (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'))
  WITH CHECK (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'));

-- 6. Stock Movements RBAC Policies
CREATE POLICY "Stock movements viewable by everyone in tenant" ON stock_movements
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Stock movements modifiable by admin and manager" ON stock_movements
  FOR ALL USING (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'))
  WITH CHECK (tenant_id = get_current_tenant_id() AND get_current_user_role() IN ('admin', 'manager'));
