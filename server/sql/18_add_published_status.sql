-- Add 'published' to newsletter status enum
-- Published = visible on public page but no emails sent yet

ALTER TABLE newsletters DROP CONSTRAINT IF EXISTS newsletters_status_check;

ALTER TABLE newsletters ADD CONSTRAINT newsletters_status_check
  CHECK (status IN ('draft', 'published', 'scheduled', 'sending', 'sent', 'archived'));
