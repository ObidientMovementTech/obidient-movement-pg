-- Migration: Unify profile completion formula
-- Aligns the DB trigger with the canonical 12-field list used by the frontend
-- Fields: profileImage, name, phone, gender, ageRange, stateOfOrigin,
--         votingState, votingLGA, votingWard, votingPU, isVoter, willVote

-- Replace the profile completion function
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_record users)
RETURNS INTEGER AS $$
DECLARE
    completed INTEGER := 0;
    total INTEGER := 12;
BEGIN
    IF user_record."profileImage" IS NOT NULL AND user_record."profileImage" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record.name IS NOT NULL AND user_record.name != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record.phone IS NOT NULL AND user_record.phone != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record.gender IS NOT NULL AND user_record.gender != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."ageRange" IS NOT NULL AND user_record."ageRange" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."stateOfOrigin" IS NOT NULL AND user_record."stateOfOrigin" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."votingState" IS NOT NULL AND user_record."votingState" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."votingLGA" IS NOT NULL AND user_record."votingLGA" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."votingWard" IS NOT NULL AND user_record."votingWard" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."votingPU" IS NOT NULL AND user_record."votingPU" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."isVoter" IS NOT NULL AND user_record."isVoter" != '' THEN
        completed := completed + 1;
    END IF;

    IF user_record."willVote" IS NOT NULL AND user_record."willVote" != '' THEN
        completed := completed + 1;
    END IF;

    RETURN LEAST(100, (completed * 100) / total);
END;
$$ LANGUAGE plpgsql;

-- The trigger already exists and references this function, so no need to recreate it.
-- Just backfill all existing users by touching them to re-fire the trigger:
UPDATE users SET "updatedAt" = NOW();
