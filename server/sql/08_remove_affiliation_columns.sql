-- Remove organizationAffiliations and politicalPartyAffiliation columns from users table
-- These fields are no longer needed in the signup form

ALTER TABLE users DROP COLUMN IF EXISTS "organizationAffiliations";
ALTER TABLE users DROP COLUMN IF EXISTS "politicalPartyAffiliation";
