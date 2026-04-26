-- Login attempt tracking for account lockout
-- Lock account for 30 minutes after 8 failed attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  success BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_recent
  ON login_attempts(user_id, attempted_at DESC);

-- Cleanup: periodically delete attempts older than 24 hours
-- DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours';
