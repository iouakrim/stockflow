-- CRITICAL FIX: Disable RLS temporarily to allow administrative signup
-- Once the flow is confirmed working, you can re-enable with proper policies.

ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses DISABLE ROW LEVEL SECURITY;

-- If you prefer to keep RLS ON, use these instead:
-- CREATE POLICY "allow_all" ON public.tenants FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "allow_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "allow_all" ON public.warehouses FOR ALL USING (true) WITH CHECK (true);
