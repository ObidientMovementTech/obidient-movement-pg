-- Add assignedCountry column to users table for Diaspora Coordinators
ALTER TABLE users ADD COLUMN IF NOT EXISTS "assignedCountry" VARCHAR(100);

-- Add assigned_country column to coordinator_assignment_log
ALTER TABLE coordinator_assignment_log ADD COLUMN IF NOT EXISTS assigned_country VARCHAR(100);

-- Index for looking up diaspora coordinators by country
CREATE INDEX IF NOT EXISTS idx_users_assigned_country ON users ("assignedCountry") WHERE "assignedCountry" IS NOT NULL;
