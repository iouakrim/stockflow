-- Add missing RLS policies for multi-tenancy

CREATE POLICY "Tenant isolation for sale_items" ON sale_items
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for stock_movements" ON stock_movements
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for credit_payments" ON credit_payments
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "Tenant isolation for audit_logs" ON audit_logs
  FOR ALL
  USING (tenant_id = get_current_tenant_id())
  WITH CHECK (tenant_id = get_current_tenant_id());
