-- Migration: Add soft delete to products table
-- Adds a 'status' column with default 'active', allowing soft delete via status = 'deleted'

ALTER TABLE products
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Index for efficient filtering of non-deleted products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(tenant_id, status);

-- Comment for clarity
COMMENT ON COLUMN products.status IS 'Soft delete: active | deleted';
