-- Create voting bloc broadcasts table
CREATE TABLE IF NOT EXISTS "votingBlocBroadcasts" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "votingBlocId" UUID NOT NULL REFERENCES "votingBlocs"(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    "messageType" VARCHAR(20) DEFAULT 'announcement' CHECK ("messageType" IN ('announcement', 'update', 'reminder')),
    channels JSONB DEFAULT '[]'::jsonb, -- Array of channel types: email, whatsapp, sms, in-app
    "sentBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voting_bloc_broadcasts_voting_bloc_id ON "votingBlocBroadcasts"("votingBlocId");
CREATE INDEX IF NOT EXISTS idx_voting_bloc_broadcasts_sent_by ON "votingBlocBroadcasts"("sentBy");
CREATE INDEX IF NOT EXISTS idx_voting_bloc_broadcasts_created_at ON "votingBlocBroadcasts"("createdAt");
CREATE INDEX IF NOT EXISTS idx_voting_bloc_broadcasts_message_type ON "votingBlocBroadcasts"("messageType");

-- Create trigger for updatedAt
CREATE OR REPLACE FUNCTION update_voting_bloc_broadcasts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_voting_bloc_broadcasts_updated_at
    BEFORE UPDATE ON "votingBlocBroadcasts"
    FOR EACH ROW
    EXECUTE FUNCTION update_voting_bloc_broadcasts_updated_at();

-- Add constraint to ensure channels array contains valid values
ALTER TABLE "votingBlocBroadcasts"
ADD CONSTRAINT check_valid_channels CHECK (
    channels IS NULL OR (
        channels::jsonb ? 'email' OR
        channels::jsonb ? 'whatsapp' OR
        channels::jsonb ? 'sms' OR
        channels::jsonb ? 'in-app' OR
        jsonb_array_length(channels) = 0
    )
);
