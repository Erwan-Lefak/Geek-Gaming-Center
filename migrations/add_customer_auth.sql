-- Add customer authentication fields
-- Run this as postgres user or table owner

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS password text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified timestamp without time zone,
ADD COLUMN IF NOT EXISTS password_reset_token text UNIQUE,
ADD COLUMN IF NOT EXISTS password_reset_expires timestamp without time zone,
ADD COLUMN IF NOT EXISTS how_did_you_find_us text,
ADD COLUMN IF NOT EXISTS how_did_you_find_us_details text;

CREATE INDEX IF NOT EXISTS idx_customers_password_reset_token ON customers(password_reset_token);
