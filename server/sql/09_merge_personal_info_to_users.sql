-- Migration: Merge userPersonalInfo into users table
-- This eliminates the need for a separate personal info table and simplifies KYC

-- Step 1: Add personal info columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "userName" VARCHAR(100);

ALTER TABLE users ADD COLUMN IF NOT EXISTS "countryCode" VARCHAR(10);

ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

ALTER TABLE users ADD COLUMN IF NOT EXISTS lga VARCHAR(100);
-- Local Government Area
ALTER TABLE users ADD COLUMN IF NOT EXISTS ward VARCHAR(100);

ALTER TABLE users ADD COLUMN IF NOT EXISTS "ageRange" VARCHAR(20);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS "stateOfOrigin" VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS "votingEngagementState" VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS citizenship VARCHAR(50) CHECK (
    citizenship IN (
        'Nigerian Citizen',
        'Diasporan',
        'Foreigner'
    )
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS "isVoter" VARCHAR(10) CHECK ("isVoter" IN ('Yes', 'No'));

ALTER TABLE users
ADD COLUMN IF NOT EXISTS "willVote" VARCHAR(10) CHECK ("willVote" IN ('Yes', 'No'));

-- Step 2: Migrate existing data from userPersonalInfo to users
UPDATE users
SET
    "userName" = upi."userName",
    "countryCode" = upi."countryCode",
    gender = upi.gender,
    lga = upi.lga,
    ward = upi.ward,
    "ageRange" = upi."ageRange",
    "stateOfOrigin" = upi."stateOfOrigin",
    "votingEngagementState" = upi."votingEngagementState",
    citizenship = upi.citizenship,
    "isVoter" = upi."isVoter",
    "willVote" = upi."willVote",
    -- Update phone if phoneNumber exists and phone is null/empty
    phone = COALESCE(
        NULLIF(users.phone, ''),
        upi."phoneNumber",
        users.phone
    )
FROM "userPersonalInfo" upi
WHERE
    users.id = upi."userId";

-- Step 3: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_gender ON users (gender);

CREATE INDEX IF NOT EXISTS idx_users_lga ON users (lga);

CREATE INDEX IF NOT EXISTS idx_users_state_of_origin ON users ("stateOfOrigin");

CREATE INDEX IF NOT EXISTS idx_users_citizenship ON users (citizenship);

-- Step 4: Drop the userPersonalInfo table (commented out for safety)
-- Uncomment this after verifying data migration
-- DROP TABLE IF EXISTS "userPersonalInfo";

-- Step 5: Add a profile completion status column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS "profileCompletionPercentage" INTEGER DEFAULT 0;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_record users)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 15; -- Total number of profile fields we're tracking
BEGIN
    -- Basic required fields (higher weight)
    IF user_record.name IS NOT NULL AND user_record.name != '' THEN
        completion_score := completion_score + 2;
    END IF;
    
    IF user_record.email IS NOT NULL AND user_record.email != '' THEN
        completion_score := completion_score + 2;
    END IF;
    
    IF user_record.phone IS NOT NULL AND user_record.phone != '' THEN
        completion_score := completion_score + 2;
    END IF;
    
    -- Profile image
    IF user_record."profileImage" IS NOT NULL AND user_record."profileImage" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    -- Personal info fields (1 point each)
    IF user_record."userName" IS NOT NULL AND user_record."userName" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record.gender IS NOT NULL AND user_record.gender != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record.lga IS NOT NULL AND user_record.lga != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record.ward IS NOT NULL AND user_record.ward != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record."ageRange" IS NOT NULL AND user_record."ageRange" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record."stateOfOrigin" IS NOT NULL AND user_record."stateOfOrigin" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record."votingEngagementState" IS NOT NULL AND user_record."votingEngagementState" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record.citizenship IS NOT NULL AND user_record.citizenship != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record."isVoter" IS NOT NULL AND user_record."isVoter" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record."willVote" IS NOT NULL AND user_record."willVote" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF user_record."countryOfResidence" IS NOT NULL AND user_record."countryOfResidence" != '' THEN
        completion_score := completion_score + 1;
    END IF;
    
    -- Calculate percentage (max score is 18, so we normalize to 100)
    RETURN LEAST(100, (completion_score * 100) / 18);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion percentage on user updates
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW."profileCompletionPercentage" := calculate_profile_completion(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion calculation
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON users;

CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- Update existing users' profile completion percentage
UPDATE users SET "updatedAt" = NOW();
-- This will trigger the profile completion calculation

-- Add comment for documentation
COMMENT ON COLUMN users."profileCompletionPercentage" IS 'Automatically calculated percentage of profile completion (0-100)';