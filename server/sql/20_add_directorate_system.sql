-- ═══════════════════════════════════════════════════════════════════
-- Migration 20: Directorate Head System
-- Adds assignedDirectorate to users + directorate to involvement_interests
-- ═══════════════════════════════════════════════════════════════════

-- 1. Add assignedDirectorate column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS "assignedDirectorate" VARCHAR(50);

-- 2. Add directorate column to involvement_interests (for volunteer department choice)
ALTER TABLE involvement_interests ADD COLUMN IF NOT EXISTS directorate VARCHAR(50);

-- 3. Enforce one head per directorate (unique partial index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_unique_directorate_head
  ON users ("assignedDirectorate")
  WHERE designation = 'Directorate Head' AND "assignedDirectorate" IS NOT NULL;

-- 4. Index for looking up directorate heads quickly
CREATE INDEX IF NOT EXISTS idx_users_directorate_head_lookup
  ON users (designation, "assignedDirectorate")
  WHERE designation = 'Directorate Head';

-- 5. Index on involvement_interests.directorate for filtering
CREATE INDEX IF NOT EXISTS idx_involvement_interests_directorate
  ON involvement_interests (directorate)
  WHERE directorate IS NOT NULL;
