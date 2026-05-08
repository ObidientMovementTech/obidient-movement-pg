-- App downloads tracking table
-- Logs every APK download with user info for monitoring

CREATE TABLE IF NOT EXISTS app_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_downloads_user_id ON app_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_app_downloads_downloaded_at ON app_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_app_downloads_version ON app_downloads(version);

-- Seed initial app settings (uses existing app_settings table)
INSERT INTO app_settings (key, value, updated_at) VALUES
  ('app_current_version', '1.0.0', NOW()),
  ('app_file_size', '', NOW()),
  ('app_release_notes', 'Initial release of the Obidient Movement mobile app.', NOW()),
  ('app_s3_key', '', NOW()),
  ('app_released_at', '', NOW())
ON CONFLICT (key) DO NOTHING;
