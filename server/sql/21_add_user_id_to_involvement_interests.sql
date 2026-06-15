-- Add user_id column to involvement_interests to link submissions to authenticated users
ALTER TABLE involvement_interests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Index for looking up interests by user
CREATE INDEX IF NOT EXISTS idx_involvement_interests_user_id
  ON involvement_interests (user_id)
  WHERE user_id IS NOT NULL;
