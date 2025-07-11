-- Admin Broadcasts table
-- This replaces the MongoDB AdminBroadcast model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main admin broadcasts table
CREATE TABLE "adminBroadcasts" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    "sentBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX "idx_adminBroadcasts_sentBy" ON "adminBroadcasts"("sentBy");
CREATE INDEX "idx_adminBroadcasts_createdAt" ON "adminBroadcasts"("createdAt");

-- Update trigger for updatedAt column
CREATE TRIGGER "updateAdminBroadcastsUpdatedAt" BEFORE UPDATE ON "adminBroadcasts" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();
