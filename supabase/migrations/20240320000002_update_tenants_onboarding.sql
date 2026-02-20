-- Migration to add onboarding fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS reporting_period TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#0fbd66',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
