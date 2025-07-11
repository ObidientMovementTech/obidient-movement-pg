-- Voting Bloc Messages table
-- This replaces the MongoDB VotingBlocMessage model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "votingBlocMessages" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "votingBlocId" UUID NOT NULL, -- References votingBlocs table (to be created)
    "fromUser" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "toUser" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    "messageType" VARCHAR(20) DEFAULT 'private' CHECK ("messageType" IN ('private', 'response')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX "idx_votingBlocMessages_votingBlocId" ON "votingBlocMessages"("votingBlocId");
CREATE INDEX "idx_votingBlocMessages_fromUser" ON "votingBlocMessages"("fromUser");
CREATE INDEX "idx_votingBlocMessages_toUser" ON "votingBlocMessages"("toUser");
CREATE INDEX "idx_votingBlocMessages_messageType" ON "votingBlocMessages"("messageType");
CREATE INDEX "idx_votingBlocMessages_status" ON "votingBlocMessages"(status);
CREATE INDEX "idx_votingBlocMessages_createdAt" ON "votingBlocMessages"("createdAt");

-- Composite indexes for common queries
CREATE INDEX "idx_votingBlocMessages_bloc_to_user" ON "votingBlocMessages"("votingBlocId", "toUser");
CREATE INDEX "idx_votingBlocMessages_bloc_from_to" ON "votingBlocMessages"("votingBlocId", "fromUser", "toUser");

-- Update trigger for updatedAt column
CREATE TRIGGER "updateVotingBlocMessagesUpdatedAt" BEFORE UPDATE ON "votingBlocMessages" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();
