-- Password reset tokens table (server-side token store)
-- Replaces JWT-in-URL approach with hashed tokens stored server-side
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);

-- Cleanup: auto-delete expired tokens older than 24 hours (run periodically or via cron)
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '24 hours';
