-- Refresh tokens for token rotation
-- Each refresh token is single-use; reuse indicates token theft

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(128) NOT NULL UNIQUE,
  family_id     VARCHAR(64) NOT NULL,  -- groups tokens in a rotation chain
  expires_at    TIMESTAMPTZ NOT NULL,
  used_at       TIMESTAMPTZ DEFAULT NULL,  -- NULL = active, set = consumed
  revoked       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens (family_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens (user_id);

-- Cleanup: delete expired tokens older than 14 days (run periodically)
-- DELETE FROM refresh_tokens WHERE expires_at < NOW() - INTERVAL '14 days';
