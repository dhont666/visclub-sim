-- =============================================================================
-- DATABASE VIEWS - CORRECT VERSION FOR YOUR ACTUAL SCHEMA
-- =============================================================================
-- Based on actual schema discovery
--
-- CRITICAL FINDINGS:
-- 1. members.id is UUID, but results.member_id is INTEGER (NO JOIN POSSIBLE!)
-- 2. members table has NO "name" column (only id, user_id, joined_at, is_active)
-- 3. competitions.id is INTEGER (matches results.competition_id)
--
-- PROBLEM: Cannot create views that join members and results due to type mismatch!
-- SOLUTION: We can only create views that DON'T join members to results
-- =============================================================================

-- Drop existing views
DROP VIEW IF EXISTS club_ranking CASCADE;
DROP VIEW IF EXISTS veteran_ranking CASCADE;
DROP VIEW IF EXISTS recent_results CASCADE;
DROP VIEW IF EXISTS upcoming_competitions CASCADE;
DROP VIEW IF EXISTS member_statistics CASCADE;
DROP VIEW IF EXISTS competition_summary CASCADE;
DROP VIEW IF EXISTS active_members CASCADE;

-- =============================================================================
-- VIEW 1: ACTIVE MEMBERS (Simple - No Joins)
-- =============================================================================
-- Shows all active members
-- No name field available, only user_id

CREATE OR REPLACE VIEW active_members AS
SELECT
    id as member_id,
    user_id,
    joined_at,
    is_active
FROM members
WHERE is_active = true
ORDER BY joined_at DESC;

-- =============================================================================
-- VIEW 2: UPCOMING COMPETITIONS (With Registration Counts)
-- =============================================================================
-- Shows future competitions with registration information
-- No member joins needed

CREATE OR REPLACE VIEW upcoming_competitions AS
SELECT
    c.id,
    c.name,
    c.date,
    COALESCE(c.location, 'Wedstrijdvijver SiM') as location,
    c.type,
    c.registration_deadline,
    c.max_participants,
    COALESCE(c.counts_for_club_ranking, false) as counts_for_club_ranking,
    COALESCE(c.counts_for_veteran_ranking, false) as counts_for_veteran_ranking,
    c.status,
    COUNT(r.id) as registered_count,
    CASE
        WHEN c.max_participants IS NOT NULL
        THEN c.max_participants - COUNT(r.id)
        ELSE 999
    END as spots_remaining,
    CASE
        WHEN c.max_participants IS NOT NULL AND COUNT(r.id) >= c.max_participants
        THEN true
        ELSE false
    END as is_full
FROM competitions c
LEFT JOIN registrations r
    ON c.id = r.competition_id
    AND COALESCE(r.status, 'pending') IN ('pending', 'confirmed')
WHERE c.date >= CURRENT_DATE
  AND COALESCE(c.status, 'scheduled') = 'scheduled'
GROUP BY c.id, c.name, c.date, c.location, c.type,
         c.registration_deadline, c.max_participants,
         c.counts_for_club_ranking, c.counts_for_veteran_ranking, c.status
ORDER BY c.date ASC;

-- =============================================================================
-- VIEW 3: COMPETITION SUMMARY (Without Member Names)
-- =============================================================================
-- Shows competitions with result counts
-- Cannot include member names due to type mismatch

CREATE OR REPLACE VIEW competition_summary AS
SELECT
    c.id as competition_id,
    c.name as competition_name,
    c.date as competition_date,
    COALESCE(c.location, 'Wedstrijdvijver SiM') as location,
    c.type,
    c.status,
    COUNT(r.id) as result_count,
    COUNT(DISTINCT r.member_id) as unique_participants,
    COALESCE(AVG(r.points), 0)::numeric(10,2) as avg_points,
    COALESCE(MIN(r.points), 0) as best_score,
    COALESCE(MAX(r.points), 0) as worst_score,
    COALESCE(SUM(r.weight_kg), 0)::numeric(10,3) as total_weight_kg,
    COALESCE(SUM(r.fish_count), 0) as total_fish_caught
FROM competitions c
LEFT JOIN results r ON c.id = r.competition_id
WHERE COALESCE(c.status, 'completed') = 'completed'
GROUP BY c.id, c.name, c.date, c.location, c.type, c.status
ORDER BY c.date DESC;

-- =============================================================================
-- VIEW 4: RECENT RESULTS (Basic - No Member Names)
-- =============================================================================
-- Last 10 completed competitions with results
-- Member IDs only (no names due to type mismatch)

CREATE OR REPLACE VIEW recent_results AS
SELECT
    c.id as competition_id,
    c.name as competition_name,
    c.date as competition_date,
    COALESCE(c.location, 'Wedstrijdvijver SiM') as location,
    COALESCE(
        json_agg(
            json_build_object(
                'position', r.position,
                'member_id', r.member_id,
                'points', r.points,
                'weight_kg', COALESCE(r.weight_kg, 0),
                'fish_count', COALESCE(r.fish_count, 0),
                'is_absent', COALESCE(r.is_absent, false)
            ) ORDER BY r.position ASC
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'::json
    ) as results
FROM competitions c
LEFT JOIN results r ON c.id = r.competition_id
WHERE COALESCE(c.status, 'completed') = 'completed'
GROUP BY c.id, c.name, c.date, c.location
ORDER BY c.date DESC
LIMIT 10;

-- =============================================================================
-- VIEW 5: MEMBER RESULT STATS (By member_id)
-- =============================================================================
-- Statistics per member_id (cannot get names)
-- Groups by integer member_id from results table

CREATE OR REPLACE VIEW member_result_stats AS
SELECT
    r.member_id,
    COUNT(DISTINCT r.competition_id) as total_competitions,
    COUNT(DISTINCT CASE WHEN r.position = 1 THEN r.competition_id END) as first_places,
    COUNT(DISTINCT CASE WHEN r.position = 2 THEN r.competition_id END) as second_places,
    COUNT(DISTINCT CASE WHEN r.position = 3 THEN r.competition_id END) as third_places,
    COUNT(DISTINCT CASE WHEN r.position <= 3 THEN r.competition_id END) as podium_finishes,
    COALESCE(ROUND(AVG(r.points)::numeric, 2), 0) as avg_points,
    COALESCE(MIN(r.points), 0) as best_score,
    COALESCE(MAX(r.points), 0) as worst_score,
    COALESCE(SUM(r.weight_kg), 0)::numeric(10,3) as total_weight_kg,
    COALESCE(ROUND(AVG(r.weight_kg)::numeric, 3), 0) as avg_weight_kg,
    COALESCE(SUM(r.fish_count), 0) as total_fish_caught,
    COALESCE(ROUND(AVG(r.fish_count)::numeric, 1), 0) as avg_fish_per_competition,
    COUNT(DISTINCT CASE WHEN COALESCE(r.is_absent, false) = false THEN r.competition_id END) as competitions_attended,
    COUNT(DISTINCT CASE WHEN COALESCE(r.is_absent, false) = true THEN r.competition_id END) as competitions_absent
FROM results r
GROUP BY r.member_id
ORDER BY total_competitions DESC, avg_points ASC;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

GRANT SELECT ON active_members TO service_role, anon, authenticated;
GRANT SELECT ON upcoming_competitions TO service_role, anon, authenticated;
GRANT SELECT ON competition_summary TO service_role, anon, authenticated;
GRANT SELECT ON recent_results TO service_role, anon, authenticated;
GRANT SELECT ON member_result_stats TO service_role, anon, authenticated;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ DATABASE VIEWS DEPLOYED SUCCESSFULLY!';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Views created (based on YOUR actual schema):';
    RAISE NOTICE '  ✅ active_members';
    RAISE NOTICE '  ✅ upcoming_competitions';
    RAISE NOTICE '  ✅ competition_summary';
    RAISE NOTICE '  ✅ recent_results';
    RAISE NOTICE '  ✅ member_result_stats';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT LIMITATION:';
    RAISE NOTICE '  Cannot join members to results (type mismatch)';
    RAISE NOTICE '  members.id = UUID';
    RAISE NOTICE '  results.member_id = INTEGER';
    RAISE NOTICE '';
    RAISE NOTICE '📝 SCHEMA ISSUES FOUND:';
    RAISE NOTICE '  1. members table has no "name" column';
    RAISE NOTICE '  2. members.id (UUID) vs results.member_id (INTEGER)';
    RAISE NOTICE '  3. You need to fix schema or add mapping table';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '  Option A: Add name column to members table';
    RAISE NOTICE '  Option B: Create member_profiles table with mapping';
    RAISE NOTICE '  Option C: Change results.member_id to UUID';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
