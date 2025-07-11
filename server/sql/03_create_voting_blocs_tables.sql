-- Voting Blocs tables
-- This replaces the MongoDB VotingBloc model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main voting blocs table
CREATE TABLE "votingBlocs" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    goals TEXT[], -- Array of strings
    "targetCandidate" VARCHAR(255) NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('National', 'State', 'LG', 'Ward')),
    
    -- Location metadata
    "locationState" VARCHAR(100) NOT NULL,
    "locationLga" VARCHAR(100) NOT NULL,
    "locationWard" VARCHAR(100),
    
    "bannerImageUrl" TEXT DEFAULT '',
    "richDescription" TEXT DEFAULT '',
    "joinCode" VARCHAR(50) UNIQUE NOT NULL,
    creator UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metrics (denormalized for performance)
    "totalMembers" INTEGER DEFAULT 0,
    "weeklyGrowth" INTEGER DEFAULT 0,
    "monthlyGrowth" INTEGER DEFAULT 0,
    "engagementScore" INTEGER DEFAULT 0,
    "metricsLastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voting bloc toolkits table
CREATE TABLE "votingBlocToolkits" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "votingBlocId" UUID NOT NULL REFERENCES "votingBlocs"(id) ON DELETE CASCADE,
    label VARCHAR(255),
    url TEXT,
    type VARCHAR(20) CHECK (type IN ('Toolkit', 'Policy')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voting bloc members table (many-to-many relationship)
CREATE TABLE "votingBlocMembers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "votingBlocId" UUID NOT NULL REFERENCES "votingBlocs"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "joinDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("votingBlocId", "userId") -- Prevent duplicate memberships
);

-- Voting bloc member metadata table
CREATE TABLE "votingBlocMemberMetadata" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "votingBlocId" UUID NOT NULL REFERENCES "votingBlocs"(id) ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "joinDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "decisionTag" VARCHAR(20) DEFAULT 'Undecided' CHECK ("decisionTag" IN ('Undecided', 'Not-interested', 'Committed', 'Voted')),
    "contactTag" VARCHAR(30) DEFAULT 'No Response' CHECK ("contactTag" IN ('No Response', 'Messaged recently', 'Called recently', 'Not Reachable')),
    "lastContactDate" TIMESTAMP WITH TIME ZONE,
    "engagementLevel" VARCHAR(10) DEFAULT 'Medium' CHECK ("engagementLevel" IN ('Low', 'Medium', 'High')),
    notes TEXT DEFAULT '',
    
    -- Member location (can be different from bloc location)
    "memberLocationState" VARCHAR(100),
    "memberLocationLga" VARCHAR(100),
    "memberLocationWard" VARCHAR(100),
    
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("votingBlocId", "userId") -- One metadata record per member per bloc
);

-- Voting bloc invitations table
CREATE TABLE "votingBlocInvitations" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "votingBlocId" UUID NOT NULL REFERENCES "votingBlocs"(id) ON DELETE CASCADE,
    "invitedBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "invitedUser" UUID REFERENCES users(id) ON DELETE CASCADE, -- For existing users
    "invitedEmail" VARCHAR(255), -- For non-existing users invited by email
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    "inviteType" VARCHAR(20) DEFAULT 'email' CHECK ("inviteType" IN ('email', 'whatsapp', 'sms', 'link')),
    message TEXT, -- Custom invitation message
    "inviteDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "responseDate" TIMESTAMP WITH TIME ZONE, -- Date when invitation was accepted/declined
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either invitedUser or invitedEmail is provided
    CHECK (("invitedUser" IS NOT NULL) OR ("invitedEmail" IS NOT NULL))
);

-- Create indexes for performance
CREATE INDEX "idx_votingBlocs_creator" ON "votingBlocs"(creator);
CREATE INDEX "idx_votingBlocs_location" ON "votingBlocs"("locationState", "locationLga", "locationWard");
CREATE INDEX "idx_votingBlocs_scope" ON "votingBlocs"(scope);
CREATE INDEX "idx_votingBlocs_status" ON "votingBlocs"(status);
CREATE INDEX "idx_votingBlocs_joinCode" ON "votingBlocs"("joinCode");

CREATE INDEX "idx_votingBlocToolkits_blocId" ON "votingBlocToolkits"("votingBlocId");
CREATE INDEX "idx_votingBlocMembers_blocId" ON "votingBlocMembers"("votingBlocId");
CREATE INDEX "idx_votingBlocMembers_userId" ON "votingBlocMembers"("userId");
CREATE INDEX "idx_votingBlocMemberMetadata_blocId" ON "votingBlocMemberMetadata"("votingBlocId");
CREATE INDEX "idx_votingBlocMemberMetadata_userId" ON "votingBlocMemberMetadata"("userId");
CREATE INDEX "idx_votingBlocInvitations_blocId" ON "votingBlocInvitations"("votingBlocId");
CREATE INDEX "idx_votingBlocInvitations_invitedBy" ON "votingBlocInvitations"("invitedBy");
CREATE INDEX "idx_votingBlocInvitations_invitedUser" ON "votingBlocInvitations"("invitedUser");
CREATE INDEX "idx_votingBlocInvitations_status" ON "votingBlocInvitations"(status);

-- Update triggers for updatedAt columns
CREATE TRIGGER "updateVotingBlocsUpdatedAt" BEFORE UPDATE ON "votingBlocs" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateVotingBlocToolkitsUpdatedAt" BEFORE UPDATE ON "votingBlocToolkits" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateVotingBlocMembersUpdatedAt" BEFORE UPDATE ON "votingBlocMembers" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateVotingBlocMemberMetadataUpdatedAt" BEFORE UPDATE ON "votingBlocMemberMetadata" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateVotingBlocInvitationsUpdatedAt" BEFORE UPDATE ON "votingBlocInvitations" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();
