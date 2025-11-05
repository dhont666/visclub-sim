-- =====================================================
-- MINIMAL SAFE VIEWS
-- =====================================================
-- These views use ONLY guaranteed columns that exist in ALL PostgreSQL tables
-- They will work even with a minimal schema
-- =====================================================

-- =====================================================
-- DROP EXISTING VIEWS (if any)
-- =====================================================
DROP VIEW IF EXISTS club_ranking CASCADE;
DROP VIEW IF EXISTS veteran_ranking CASCADE;
DROP VIEW IF EXISTS recent_results CASCADE;
DROP VIEW IF EXISTS competition_summary CASCADE;
DROP VIEW IF EXISTS member_stats CASCADE;

-- =====================================================
-- VIEW 1: MINIMAL MEMBER STATS
-- =====================================================
-- Shows basic member information with result counts
-- Uses ONLY: id, created_at from guaranteed columns
-- Assumes: members.name, results.member_id, results.points exist
-- =====================================================
CREATE OR REPLACE VIEW member_stats AS
SELECT
    m.id,
    m.created_at as member_since,
    COUNT(r.id) as total_competitions,
    ROUND(AVG(r.points), 2) as average_points
FROM members m
LEFT JOIN results r ON m.id::text = r.member_id::text
GROUP BY m.id, m.created_at
ORDER BY total_competitions DESC;

-- =====================================================
-- VIEW 2: MINIMAL COMPETITION SUMMARY
-- =====================================================
-- Shows competitions with basic stats
-- Uses ONLY: id, created_at from guaranteed columns
-- Assumes: competitions.date, results.competition_id exist
-- =====================================================
CREATE OR REPLACE VIEW competition_summary AS
SELECT
    c.id,
    c.created_at,
    COUNT(r.id) as participant_count,
    MIN(r.points) as best_score,
    MAX(r.points) as worst_score,
    ROUND(AVG(r.points), 2) as average_score
FROM competitions c
LEFT JOIN results r ON c.id::text = r.competition_id::text
GROUP BY c.id, c.created_at
ORDER BY c.created_at DESC;

-- =====================================================
-- VIEW 3: MINIMAL RECENT RESULTS
-- =====================================================
-- Shows most recent competition results
-- Uses ONLY guaranteed columns and basic assumptions
-- =====================================================
CREATE OR REPLACE VIEW recent_results AS
SELECT
    r.id,
    r.member_id,
    r.competition_id,
    r.points,
    r.created_at as result_date
FROM results r
ORDER BY r.created_at DESC
LIMIT 100;

-- =====================================================
-- TESTING QUERIES
-- =====================================================
-- Run these to verify views work

-- Test 1: Member stats
SELECT * FROM member_stats LIMIT 5;

-- Test 2: Competition summary
SELECT * FROM competition_summary LIMIT 5;

-- Test 3: Recent results
SELECT * FROM recent_results LIMIT 10;

-- =====================================================
-- NOTES:
-- =====================================================
-- These views are INTENTIONALLY minimal
-- They use only the most basic columns that must exist
--
-- After running inspect-actual-schema.sql, we can:
-- 1. Add name columns if they exist
-- 2. Add filtering columns (is_active, is_veteran) if they exist
-- 3. Add competition details (date, location, type) if they exist
-- 4. Add proper ranking logic once we know the column structure
-- =====================================================
