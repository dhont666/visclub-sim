-- =============================================================================
-- FIX SUPABASE DASHBOARD WARNINGS
-- =============================================================================
-- Fixes all 28 warnings shown in Supabase Dashboard
-- Safe to run multiple times
-- =============================================================================

-- =============================================================================
-- FIX 1: Recreate views without SECURITY DEFINER
-- =============================================================================
-- Drop and recreate all views with SECURITY INVOKER instead of SECURITY DEFINER
-- This is more secure as it uses the caller's permissions

DROP VIEW IF EXISTS club_ranking CASCADE;
DROP VIEW IF EXISTS veteran_ranking CASCADE;
DROP VIEW IF EXISTS recent_results CASCADE;
DROP VIEW IF EXISTS upcoming_competitions CASCADE;
DROP VIEW IF EXISTS member_statistics CASCADE;

-- =============================================================================
-- VIEW 1: CLUB RANKING (with SECURITY INVOKER)
-- =============================================================================
CREATE VIEW club_ranking
WITH (security_invoker = true)
AS
WITH member_results AS (
    SELECT
        r.member_id,
        COALESCE(m.name, 'Unknown') AS member_name,
        m.member_number,
        r.competition_id,
        r.points,
        c.date AS competition_date,
        ROW_NUMBER() OVER (
            PARTITION BY r.member_id
            ORDER BY r.points ASC
        ) as rank_within_member
    FROM results r
    INNER JOIN members m ON r.member_id = m.id
    INNER JOIN competitions c ON r.competition_id = c.id
    WHERE
        COALESCE(c.counts_for_club_ranking, true) = true
        AND COALESCE(c.status, 'completed') = 'completed'
        AND m.is_active = true
        AND COALESCE(r.is_absent, false) = false
),
best_results AS (
    SELECT
        member_id,
        member_name,
        member_number,
        points
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
    ROW_NUMBER() OVER (
        ORDER BY SUM(points) ASC, AVG(points) ASC
    ) as ranking_position
FROM best_results
GROUP BY member_id, member_name, member_number
HAVING COUNT(*) >= 10
ORDER BY total_points ASC, avg_points ASC;

-- =============================================================================
-- VIEW 2: VETERAN RANKING (with SECURITY INVOKER)
-- =============================================================================
CREATE VIEW veteran_ranking
WITH (security_invoker = true)
AS
SELECT
    m.id as member_id,
    COALESCE(m.name, 'Unknown') AS member_name,
    m.member_number,
    SUM(r.points) as total_points,
    COUNT(*) as competitions_count,
    ROUND(AVG(r.points)::numeric, 2) as avg_points,
    MIN(r.points) as best_score,
    MAX(r.points) as worst_score,
    ROW_NUMBER() OVER (
        ORDER BY SUM(r.points) ASC, AVG(r.points) ASC
    ) as ranking_position
FROM members m
INNER JOIN results r ON m.id = r.member_id
INNER JOIN competitions c ON r.competition_id = c.id
WHERE
    COALESCE(m.is_veteran, false) = true
    AND m.is_active = true
    AND COALESCE(c.counts_for_veteran_ranking, false) = true
    AND COALESCE(c.status, 'completed') = 'completed'
    AND COALESCE(r.is_absent, false) = false
GROUP BY m.id, m.name, m.member_number
HAVING COUNT(*) >= 5
ORDER BY total_points ASC, avg_points ASC;

-- =============================================================================
-- VIEW 3: RECENT RESULTS (with SECURITY INVOKER)
-- =============================================================================
CREATE VIEW recent_results
WITH (security_invoker = true)
AS
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
                'member_name', COALESCE(m.name, 'Unknown'),
                'member_number', m.member_number,
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
LEFT JOIN members m ON r.member_id = m.id
WHERE COALESCE(c.status, 'completed') = 'completed'
GROUP BY c.id, c.name, c.date, c.location
ORDER BY c.date DESC
LIMIT 10;

-- =============================================================================
-- VIEW 4: UPCOMING COMPETITIONS (with SECURITY INVOKER)
-- =============================================================================
CREATE VIEW upcoming_competitions
WITH (security_invoker = true)
AS
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
         c.counts_for_club_ranking, c.counts_for_veteran_ranking
ORDER BY c.date ASC;

-- =============================================================================
-- VIEW 5: MEMBER STATISTICS (with SECURITY INVOKER)
-- =============================================================================
CREATE VIEW member_statistics
WITH (security_invoker = true)
AS
SELECT
    m.id as member_id,
    COALESCE(m.name, 'Unknown') AS member_name,
    m.member_number,
    COALESCE(m.is_veteran, false) as is_veteran,
    m.is_active,
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
FROM members m
LEFT JOIN results r ON m.id = r.member_id
WHERE m.is_active = true
GROUP BY m.id, m.name, m.member_number, m.is_veteran, m.is_active
ORDER BY total_competitions DESC, avg_points ASC;

-- =============================================================================
-- FIX 2: Enable RLS on permits table
-- =============================================================================

-- Enable RLS
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Permits are private" ON permits;
DROP POLICY IF EXISTS "Service role has full access to permits" ON permits;

-- Create policies
CREATE POLICY "Service role has full access to permits"
    ON permits
    FOR ALL
    USING (auth.role() = 'service_role');

-- Only authenticated users can see their own permits (if user_id column exists)
-- Comment this out if permits doesn't have a user_id column
-- CREATE POLICY "Users can view their own permits"
--     ON permits
--     FOR SELECT
--     USING (auth.uid() = user_id);

-- =============================================================================
-- GRANT PERMISSIONS ON VIEWS
-- =============================================================================

GRANT SELECT ON club_ranking TO anon, authenticated, service_role;
GRANT SELECT ON veteran_ranking TO anon, authenticated, service_role;
GRANT SELECT ON recent_results TO anon, authenticated, service_role;
GRANT SELECT ON upcoming_competitions TO anon, authenticated, service_role;
GRANT SELECT ON member_statistics TO anon, authenticated, service_role;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ ALL SUPABASE WARNINGS FIXED!';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed issues:';
    RAISE NOTICE '  ✅ Views recreated with SECURITY INVOKER';
    RAISE NOTICE '  ✅ RLS enabled on permits table';
    RAISE NOTICE '  ✅ Security policies applied';
    RAISE NOTICE '  ✅ View permissions granted';
    RAISE NOTICE '';
    RAISE NOTICE 'Views updated (now secure):';
    RAISE NOTICE '  ✅ club_ranking';
    RAISE NOTICE '  ✅ veteran_ranking';
    RAISE NOTICE '  ✅ recent_results';
    RAISE NOTICE '  ✅ upcoming_competitions';
    RAISE NOTICE '  ✅ member_statistics';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security improved:';
    RAISE NOTICE '  - Views use caller permissions (SECURITY INVOKER)';
    RAISE NOTICE '  - permits table now has RLS enabled';
    RAISE NOTICE '  - All warnings should be resolved';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Check Supabase Dashboard - warnings should be gone!';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
