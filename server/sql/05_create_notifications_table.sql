-- Notifications table
-- This replaces the MongoDB Notification model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'broadcast', 
        'adminBroadcast', 
        'invite', 
        'supporterUpdate', 
        'system', 
        'votingBlocBroadcast', 
        'votingBlocMessage'
    )),
    title VARCHAR(255),
    message TEXT NOT NULL,
    "relatedCause" UUID, -- References causes table (to be created later)
    "relatedVotingBloc" UUID REFERENCES "votingBlocs"(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX "idx_notifications_recipient" ON notifications(recipient);
CREATE INDEX "idx_notifications_type" ON notifications(type);
CREATE INDEX "idx_notifications_read" ON notifications(read);
CREATE INDEX "idx_notifications_createdAt" ON notifications("createdAt");
CREATE INDEX "idx_notifications_relatedVotingBloc" ON notifications("relatedVotingBloc");

-- Composite indexes for common queries
CREATE INDEX "idx_notifications_recipient_read" ON notifications(recipient, read);
CREATE INDEX "idx_notifications_recipient_type" ON notifications(recipient, type);
CREATE INDEX "idx_notifications_recipient_createdAt" ON notifications(recipient, "createdAt");

-- Update trigger for updatedAt column
CREATE TRIGGER "updateNotificationsUpdatedAt" BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();
