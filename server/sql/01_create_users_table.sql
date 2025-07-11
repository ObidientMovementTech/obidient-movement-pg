-- Users table - Core authentication and user data
-- This replaces the MongoDB User model

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    "passwordHash" VARCHAR(255) NOT NULL,
    "profileImage" TEXT,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    "kycStatus" VARCHAR(20) DEFAULT 'unsubmitted' CHECK ("kycStatus" IN ('unsubmitted', 'draft', 'pending', 'approved', 'rejected')),
    "twoFactorEnabled" BOOLEAN DEFAULT FALSE,
    "twoFactorSecret" VARCHAR(255),
    "twoFactorQRCode" TEXT,
    otp VARCHAR(10),
    "otpExpiry" TIMESTAMP WITH TIME ZONE,
    "otpPurpose" VARCHAR(50),
    "pendingEmail" VARCHAR(255),
    "kycRejectionReason" TEXT,
    "hasTakenCauseSurvey" BOOLEAN DEFAULT FALSE,
    "countryOfResidence" VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX "idx_users_kycStatus" ON users("kycStatus");
CREATE INDEX "idx_users_emailVerified" ON users("emailVerified");
CREATE INDEX "idx_users_createdAt" ON users("createdAt");

-- Personal information table (replaces personalInfo subdocument)
CREATE TABLE "userPersonalInfo" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "firstName" VARCHAR(100),
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "userName" VARCHAR(100),
    "phoneNumber" VARCHAR(50),
    "countryCode" VARCHAR(10),
    gender VARCHAR(20),
    lga VARCHAR(100), -- Local Government Area
    ward VARCHAR(100),
    "ageRange" VARCHAR(20),
    "stateOfOrigin" VARCHAR(100),
    "votingEngagementState" VARCHAR(100),
    citizenship VARCHAR(50) CHECK (citizenship IN ('Nigerian Citizen', 'Diasporan', 'Foreigner')),
    "isVoter" VARCHAR(10) CHECK ("isVoter" IN ('Yes', 'No')),
    "willVote" VARCHAR(10) CHECK ("willVote" IN ('Yes', 'No')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId")
);

-- Onboarding data table (replaces onboardingData subdocument)
CREATE TABLE "userOnboardingData" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Security validation
    "profilePictureUrl" TEXT,
    -- Demographics
    ethnicity VARCHAR(100),
    religion VARCHAR(100),
    occupation VARCHAR(100),
    "levelOfEducation" VARCHAR(100),
    "maritalStatus" VARCHAR(50),
    -- Political preferences
    "partyAffiliation" VARCHAR(100),
    -- Engagement and mobilization
    "isVolunteering" VARCHAR(10) CHECK ("isVolunteering" IN ('Yes', 'No')),
    "pastElectionParticipation" VARCHAR(100),
    -- Voting behavior
    "likelyToVote" VARCHAR(100),
    "isRegistered" VARCHAR(10) CHECK ("isRegistered" IN ('Yes', 'No')),
    "registrationDate" DATE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId")
);

-- KYC information table (replaces validID subdocument)
CREATE TABLE "userKycInfo" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "selfieImageUrl" TEXT,
    "idType" VARCHAR(50) CHECK ("idType" IN ('NIN', 'Driver''s License', 'International Passport', 'Voter''s Card')),
    "idNumber" VARCHAR(100),
    "idImageUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId")
);

-- Notification preferences table
CREATE TABLE "userNotificationPreferences" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email BOOLEAN DEFAULT TRUE,
    push BOOLEAN DEFAULT TRUE,
    broadcast BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId")
);

-- Detailed notification settings table
CREATE TABLE "userNotificationSettings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Email settings
    "emailAccountUpdates" BOOLEAN DEFAULT TRUE,
    "emailNewCauses" BOOLEAN DEFAULT TRUE,
    "emailCauseUpdates" BOOLEAN DEFAULT TRUE,
    "emailSurveysPolls" BOOLEAN DEFAULT TRUE,
    "emailLeadersUpdates" BOOLEAN DEFAULT TRUE,
    -- Push settings
    "pushAccountUpdates" BOOLEAN DEFAULT TRUE,
    "pushNewCauses" BOOLEAN DEFAULT TRUE,
    "pushCauseUpdates" BOOLEAN DEFAULT TRUE,
    "pushSurveysPolls" BOOLEAN DEFAULT TRUE,
    "pushLeadersUpdates" BOOLEAN DEFAULT TRUE,
    -- Website settings
    "desktopNotifications" BOOLEAN DEFAULT FALSE,
    "soundAlerts" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("userId")
);

-- Update trigger function for updatedAt columns
CREATE OR REPLACE FUNCTION "updateUpdatedAtColumn"()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers for all tables
CREATE TRIGGER "updateUsersUpdatedAt" BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateUserPersonalInfoUpdatedAt" BEFORE UPDATE ON "userPersonalInfo" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateUserOnboardingDataUpdatedAt" BEFORE UPDATE ON "userOnboardingData" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateUserKycInfoUpdatedAt" BEFORE UPDATE ON "userKycInfo" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateUserNotificationPreferencesUpdatedAt" BEFORE UPDATE ON "userNotificationPreferences" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();

CREATE TRIGGER "updateUserNotificationSettingsUpdatedAt" BEFORE UPDATE ON "userNotificationSettings" 
    FOR EACH ROW EXECUTE FUNCTION "updateUpdatedAtColumn"();
