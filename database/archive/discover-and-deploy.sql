-- =====================================================
-- DISCOVER AND DEPLOY: Complete Schema Discovery + Safe View Creation
-- =====================================================
-- PART 1: Run this FIRST to discover what exists
-- PART 2: Only deploy views AFTER confirming columns exist
-- =====================================================

-- =====================================================
-- PART 1: SCHEMA DISCOVERY
-- =====================================================

-- Step 1: List all tables
SELECT '=== ALL TABLES ===' as discovery_step;
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Step 2: Members table structure
SELECT '=== MEMBERS TABLE COLUMNS ===' as discovery_step;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'members'
ORDER BY ordinal_position;

-- Step 3: Competitions table structure
SELECT '=== COMPETITIONS TABLE COLUMNS ===' as discovery_step;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competitions'
ORDER BY ordinal_position;

-- Step 4: Results table structure
SELECT '=== RESULTS TABLE COLUMNS ===' as discovery_step;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'results'
ORDER BY ordinal_position;

-- Step 5: Registrations table structure
SELECT '=== REGISTRATIONS TABLE COLUMNS ===' as discovery_step;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'registrations'
ORDER BY ordinal_position;

-- Step 6: Check foreign key relationships
SELECT '=== FOREIGN KEY RELATIONSHIPS ===' as discovery_step;
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Step 7: Sample data to understand structure
SELECT '=== MEMBERS SAMPLE DATA ===' as discovery_step;
SELECT * FROM members LIMIT 2;

SELECT '=== COMPETITIONS SAMPLE DATA ===' as discovery_step;
SELECT * FROM competitions LIMIT 2;

SELECT '=== RESULTS SAMPLE DATA ===' as discovery_step;
SELECT * FROM results LIMIT 2;

SELECT '=== REGISTRATIONS SAMPLE DATA ===' as discovery_step;
SELECT * FROM registrations LIMIT 2;

-- =====================================================
-- STOP HERE: Review the output above
-- =====================================================
-- DO NOT RUN PART 2 until you've confirmed:
-- 1. Which columns exist in each table
-- 2. The data types of ID columns (uuid vs integer)
-- 3. Whether name columns are split (first_name/last_name) or single (name)
-- 4. Whether optional columns exist (is_active, is_veteran, member_number, etc.)
-- =====================================================

-- =====================================================
-- PART 2: SAFE VIEW DEPLOYMENT (Run AFTER schema discovery)
-- =====================================================

-- Clean up any existing views
DO $$
BEGIN
    DROP VIEW IF EXISTS club_ranking CASCADE;
    DROP VIEW IF EXISTS veteran_ranking CASCADE;
    DROP VIEW IF EXISTS recent_results CASCADE;
    DROP VIEW IF EXISTS competition_summary CASCADE;
    DROP VIEW IF EXISTS member_stats CASCADE;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- ULTRA-MINIMAL VIEW 1: Basic Member List
-- =====================================================
-- This should work with ANY schema that has a members table
CREATE OR REPLACE VIEW member_stats AS
SELECT
    id,
    created_at,
    updated_at
FROM members
ORDER BY created_at DESC;

COMMENT ON VIEW member_stats IS 'Minimal member view - expand after schema discovery';

-- =====================================================
-- ULTRA-MINIMAL VIEW 2: Basic Competition List
-- =====================================================
-- This should work with ANY schema that has a competitions table
CREATE OR REPLACE VIEW competition_summary AS
SELECT
    id,
    created_at,
    updated_at
FROM competitions
ORDER BY created_at DESC;

COMMENT ON VIEW competition_summary IS 'Minimal competition view - expand after schema discovery';

-- =====================================================
-- ULTRA-MINIMAL VIEW 3: Basic Results List
-- =====================================================
-- This should work with ANY schema that has a results table
CREATE OR REPLACE VIEW recent_results AS
SELECT
    id,
    created_at,
    updated_at
FROM results
ORDER BY created_at DESC
LIMIT 100;

COMMENT ON VIEW recent_results IS 'Minimal results view - expand after schema discovery';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to confirm views were created successfully

SELECT '=== VERIFYING VIEWS CREATED ===' as verification_step;

SELECT
    table_name as view_name,
    'SUCCESS' as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('member_stats', 'competition_summary', 'recent_results')
ORDER BY table_name;

-- Test the views
SELECT '=== TESTING MEMBER_STATS VIEW ===' as verification_step;
SELECT * FROM member_stats LIMIT 3;

SELECT '=== TESTING COMPETITION_SUMMARY VIEW ===' as verification_step;
SELECT * FROM competition_summary LIMIT 3;

SELECT '=== TESTING RECENT_RESULTS VIEW ===' as verification_step;
SELECT * FROM recent_results LIMIT 3;

-- =====================================================
-- NEXT STEPS AFTER DEPLOYMENT
-- =====================================================
-- 1. Share the output from PART 1 (schema discovery)
-- 2. We'll create ENHANCED views based on actual columns
-- 3. The enhanced views will include:
--    - Proper member names
--    - Competition details (date, location, type)
--    - Results with positions and points
--    - Club and veteran rankings
--    - Join conditions using correct data types
-- =====================================================
