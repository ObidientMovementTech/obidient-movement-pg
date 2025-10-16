-- Add unique constraints for call center assignments
-- Only one active assignment per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_user ON call_center_assignments (user_id)
WHERE
    is_active = true;

-- Only one active volunteer per polling unit
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_polling_unit ON call_center_assignments (polling_unit_code)
WHERE
    is_active = true
    AND polling_unit_code IS NOT NULL;