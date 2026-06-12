-- Newsletters Table
-- Standalone newsletter system (separate from blog)

CREATE TABLE IF NOT EXISTS newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    preview_text VARCHAR(300),
    featured_image_url VARCHAR(1000),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'archived')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_failed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletters_slug ON newsletters(slug);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_sent_at ON newsletters(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletters_author_id ON newsletters(author_id);

-- Composite index for public listing (only sent newsletters shown publicly)
CREATE INDEX IF NOT EXISTS idx_newsletters_public_listing ON newsletters(status, sent_at DESC) WHERE status = 'sent';

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_newsletters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletters_updated_at ON newsletters;
CREATE TRIGGER newsletters_updated_at
    BEFORE UPDATE ON newsletters
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletters_updated_at();

-- Add newsletter opt-out fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_opt_out BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid();

-- Index for unsubscribe token lookups
CREATE INDEX IF NOT EXISTS idx_users_unsubscribe_token ON users(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;
