-- =============================================================================
-- CREATE DATABASE VIEWS - COMPATIBLE WITH EXISTING SCHEMA
-- =============================================================================
-- This version works with existing schema:
--   members.name (not first_name/last_name)
--   Handles empty tables gracefully
-- Safe to run multiple times (uses CREATE OR REPLACE)

-- =============================================================================
-- DROP EXISTING VIEWS
-- =============================================================================

DROP VIEW IF EXISTS club_ranking CASCADE;
DROP VIEW IF EXISTS veteran_ranking CASCADE;
DROP VIEW IF EXISTS recent_results CASCADE;
DROP VIEW IF EXISTS upcoming_competitions CASCADE;
DROP VIEW IF EXISTS member_statistics CASCADE;

-- =============================================================================
-- VIEWS FOR RANKINGS (Compatible with existing schema)
-- =============================================================================

-- Club Ranking (best 15 out of 20 competitions)
CREATE OR REPLACE VIEW club_ranking AS
WITH member_results AS (
    SELECT
        r.member_id,
        m.name AS member_name,
        m.member_number,
        r.competition_id,
        r.points,
        c.date AS competition_date,
        ROW_NUMBER() OVER (PARTITION BY r.member_id ORDER BY r.points ASC) as rank_within_member
    FROM results r
    JOIN members m ON r.member_id = m.id
    JOIN competitions c ON r.competition_id = c.id
    WHERE COALESCE(c.counts_for_club_ranking, true) = true
      AND COALESCE(c.status, 'completed') = 'completed'
      AND COALESCE(m.is_active, true) = true
      AND COALESCE(r.is_absent, false) = false
),
best_results AS (
    SELECT
        member_id,
        member_name,
        member_number,
        points,
        competition_date
    FROM member_results
    WHERE rank_within_member <= 15
)
SELECT
    member_id,
    member_name,
    member_number,
    SUM(points) as total_points,
    COUNT(*) as competitions_counted,
    ROUND(AVG(points)::numeric, 2) as avg_points,
    MIN(points) as best_score,
    MAX(points) as worst_score,
    ROW_NUMBER() OVER (ORDER BY SUM(points) ASC) as ranking_position
FROM best_results
GROUP BY member_id, member_name, member_number
HAVING COUNT(*) >= 10
ORDER BY total_points ASC, avg_points ASC;

-- Veteran Ranking (all competitions count)
CREATE OR REPLACE VIEW veteran_ranking AS
SELECT
    m.id as member_id,
    m.name AS member_name,
    m.member_number,
    SUM(r.points) as total_points,
    COUNT(*) as competitions_count,
    ROUND(AVG(r.points)::numeric, 2) as avg_points,
    MIN(r.points) as best_score,
    MAX(r.points) as worst_score,
    ROW_NUMBER() OVER (ORDER BY SUM(r.points) ASC) as ranking_position
FROM members m
JOIN results r ON m.id = r.member_id
JOIN competitions c ON r.competition_id = c.id
WHERE COALESCE(m.is_veteran, false) = true
  AND COALESCE(m.is_active, true) = true
  AND COALESCE(c.counts_for_veteran_ranking, false) = true
  AND COALESCE(c.status, 'completed') = 'completed'
  AND COALESCE(r.is_absent, false) = false
GROUP BY m.id, m.name, m.member_number
HAVING COUNT(*) >= 5
ORDER BY total_points ASC, avg_points ASC;

-- Recent Competition Results
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
                'member_name', m.name,
                'member_number', m.member_number,
                'points', r.points,
                'weight_kg', r.weight_kg,
                'fish_count', r.fish_count
            ) ORDER BY r.position ASC
        ) FILTER (WHERE r.id IS NOT NULL),
        '[]'::json
    ) as results
FROM competitions c
LEFT JOIN results r ON c.id = r.competition_id
LEFT JOIN members m ON r.member_id = m.id
WHERE COALESCE(c.status, 'completed') = 'completed'
GROUP BY c.id, c.name, c.date, c.location
ORDER BY c.date DESC
LIMIT 10;

-- Upcoming Competitions with Registration Count
CREATE OR REPLACE VIEW upcoming_competitions AS
SELECT
    c.id,
    c.name,
    c.date,
    c.start_time,
    COALESCE(c.location, 'Wedstrijdvijver SiM') as location,
    c.type,
    c.registration_deadline,
    c.max_participants,
    c.entry_fee,
    COUNT(r.id) as registered_count,
    COALESCE(c.max_participants - COUNT(r.id), 999) as spots_remaining,
    CASE
        WHEN c.max_participants IS NOT NULL AND COUNT(r.id) >= c.max_participants THEN true
        ELSE false
    END as is_full
FROM competitions c
LEFT JOIN registrations r ON c.id = r.competition_id
    AND COALESCE(r.status, 'pending') IN ('pending', 'confirmed')
WHERE c.date >= CURRENT_DATE
  AND COALESCE(c.status, 'scheduled') = 'scheduled'
GROUP BY c.id, c.name, c.date, c.start_time, c.location, c.type,
         c.registration_deadline, c.max_participants, c.entry_fee
ORDER BY c.date ASC;

-- Member Statistics
CREATE OR REPLACE VIEW member_statistics AS
SELECT
    m.id as member_id,
    m.name AS member_name,
    m.member_number,
    COALESCE(m.is_veteran, false) as is_veteran,
    COUNT(DISTINCT r.competition_id) as total_competitions,
    COUNT(DISTINCT CASE WHEN r.position = 1 THEN r.competition_id END) as first_places,
    COUNT(DISTINCT CASE WHEN r.position <= 3 THEN r.competition_id END) as podium_finishes,
    COALESCE(ROUND(AVG(r.points)::numeric, 2), 0) as avg_points,
    COALESCE(MIN(r.points), 0) as best_score,
    COALESCE(SUM(r.weight_kg), 0) as total_weight_kg,
    COALESCE(SUM(r.fish_count), 0) as total_fish_caught,
    COALESCE(MAX(r.largest_fish_kg), 0) as personal_best_fish_kg
FROM members m
LEFT JOIN results r ON m.id = r.member_id
WHERE COALESCE(m.is_active, true) = true
GROUP BY m.id, m.name, m.member_number, m.is_veteran;

-- =============================================================================
-- GRANT PERMISSIONS ON VIEWS
-- =============================================================================

GRANT SELECT ON club_ranking TO service_role;
GRANT SELECT ON veteran_ranking TO service_role;
GRANT SELECT ON recent_results TO service_role;
GRANT SELECT ON upcoming_competitions TO service_role;
GRANT SELECT ON member_statistics TO service_role;

GRANT SELECT ON club_ranking TO anon;
GRANT SELECT ON veteran_ranking TO anon;
GRANT SELECT ON recent_results TO anon;
GRANT SELECT ON upcoming_competitions TO anon;
GRANT SELECT ON member_statistics TO anon;

-- =============================================================================
-- VERIFICATION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ All views successfully created!';
    RAISE NOTICE '';
    RAISE NOTICE 'Views created (compatible with existing schema):';
    RAISE NOTICE '  ✅ club_ranking - Best 15 of 20 competitions';
    RAISE NOTICE '  ✅ veteran_ranking - All veteran competitions';
    RAISE NOTICE '  ✅ recent_results - Last 10 completed competitions';
    RAISE NOTICE '  ✅ upcoming_competitions - Future competitions with counts';
    RAISE NOTICE '  ✅ member_statistics - Comprehensive member stats';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Views use COALESCE for null-safety';
    RAISE NOTICE '📊 Views work with empty tables';
    RAISE NOTICE '📊 Views compatible with members.name column';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 You can now query these views!';
    RAISE NOTICE '';
END $$;
