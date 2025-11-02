-- Optimize location queries for large datasets (up to 90M records)
-- These indexes will significantly speed up DISTINCT queries on state and lga columns

-- Index for state queries (used when fetching available states)
CREATE INDEX IF NOT EXISTS idx_inec_voters_state ON inec_voters (state)
WHERE
    state IS NOT NULL;

-- Composite index for state + lga queries (used when fetching LGAs for a state)
CREATE INDEX IF NOT EXISTS idx_inec_voters_state_lga ON inec_voters (state, lga)
WHERE
    state IS NOT NULL
    AND lga IS NOT NULL;

-- Index for phone_number validation (ensures we only count voters with valid phone numbers)
CREATE INDEX IF NOT EXISTS idx_inec_voters_phone_valid ON inec_voters (phone_number)
WHERE
    phone_number IS NOT NULL
    AND phone_number != '';

-- Analyze tables to update statistics for query planner
ANALYZE inec_voters;

-- Display index information
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE
    tablename = 'inec_voters'
ORDER BY indexname;