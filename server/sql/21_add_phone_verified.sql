-- Migration: Add phone_verified column to users table
-- This enables phone-only signup flow where users verify via SMS OTP

ALTER TABLE users ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN DEFAULT FALSE;

-- Add index for querying by phone verification status
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users ("phoneVerified");

-- Comment for documentation
COMMENT ON COLUMN users."phoneVerified" IS 'Whether the user phone number has been verified via SMS OTP';
