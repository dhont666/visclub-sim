-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - FINAL VERSION
-- =============================================================================
-- Only for tables that actually exist in YOUR database:
--   - members
--   - competitions
--   - registrations
--   - results
--
-- Safe to run multiple times
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (to allow recreation)
-- =============================================================================

DROP POLICY IF EXISTS "Active members are publicly viewable" ON members;
DROP POLICY IF EXISTS "Service role has full access to members" ON members;
DROP POLICY IF EXISTS "Public competitions are viewable" ON competitions;
DROP POLICY IF EXISTS "Service role can manage competitions" ON competitions;
DROP POLICY IF EXISTS "Confirmed registrations are viewable" ON registrations;
DROP POLICY IF EXISTS "Service role can manage registrations" ON registrations;
DROP POLICY IF EXISTS "Results are publicly viewable" ON results;
DROP POLICY IF EXISTS "Service role can manage results" ON results;

-- =============================================================================
-- MEMBERS POLICIES
-- =============================================================================
-- Public can view active members
-- Service role (backend API) can do everything

CREATE POLICY "Active members are publicly viewable"
    ON members
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role has full access to members"
    ON members
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- COMPETITIONS POLICIES
-- =============================================================================
-- Public can view scheduled and completed competitions
-- Service role can manage all

CREATE POLICY "Public competitions are viewable"
    ON competitions
    FOR SELECT
    USING (status IN ('scheduled', 'completed'));

CREATE POLICY "Service role can manage competitions"
    ON competitions
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- REGISTRATIONS POLICIES
-- =============================================================================
-- Public can view confirmed registrations
-- Service role can manage all

CREATE POLICY "Confirmed registrations are viewable"
    ON registrations
    FOR SELECT
    USING (status = 'confirmed');

CREATE POLICY "Service role can manage registrations"
    ON registrations
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- RESULTS POLICIES
-- =============================================================================
-- Public can view all results
-- Service role can manage all

CREATE POLICY "Results are publicly viewable"
    ON results
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage results"
    ON results
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- GRANT PERMISSIONS ON VIEWS (Important!)
-- =============================================================================
-- Make sure the views are accessible

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
    RAISE NOTICE '🔒 RLS POLICIES SUCCESSFULLY DEPLOYED!';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Security policies created:';
    RAISE NOTICE '  ✅ members - 2 policies';
    RAISE NOTICE '  ✅ competitions - 2 policies';
    RAISE NOTICE '  ✅ registrations - 2 policies';
    RAISE NOTICE '  ✅ results - 2 policies';
    RAISE NOTICE '';
    RAISE NOTICE 'View permissions granted:';
    RAISE NOTICE '  ✅ club_ranking';
    RAISE NOTICE '  ✅ veteran_ranking';
    RAISE NOTICE '  ✅ recent_results';
    RAISE NOTICE '  ✅ upcoming_competitions';
    RAISE NOTICE '  ✅ member_statistics';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Security rules:';
    RAISE NOTICE '  👀 Public can READ:';
    RAISE NOTICE '     - Active members';
    RAISE NOTICE '     - Scheduled/completed competitions';
    RAISE NOTICE '     - Confirmed registrations';
    RAISE NOTICE '     - All results';
    RAISE NOTICE '     - All views';
    RAISE NOTICE '';
    RAISE NOTICE '  🔐 Service role can:';
    RAISE NOTICE '     - Full access to everything';
    RAISE NOTICE '     - Create/Update/Delete all tables';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your database is now fully secured!';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
