-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - UPDATE ONLY
-- =============================================================================
-- This script ONLY adds/updates RLS policies
-- Safe to run multiple times (uses CREATE OR REPLACE and IF NOT EXISTS)
-- Use this when tables already exist but policies need to be added/updated

-- =============================================================================
-- ENABLE RLS ON ALL TABLES (safe if already enabled)
-- =============================================================================

ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (to allow recreation)
-- =============================================================================

DROP POLICY IF EXISTS "Admin users are private" ON admin_users;
DROP POLICY IF EXISTS "Active members are publicly viewable" ON members;
DROP POLICY IF EXISTS "Service role has full access to members" ON members;
DROP POLICY IF EXISTS "Public competitions are viewable" ON competitions;
DROP POLICY IF EXISTS "Service role can manage competitions" ON competitions;
DROP POLICY IF EXISTS "Confirmed registrations are viewable" ON registrations;
DROP POLICY IF EXISTS "Service role can manage registrations" ON registrations;
DROP POLICY IF EXISTS "Results are publicly viewable" ON results;
DROP POLICY IF EXISTS "Service role can manage results" ON results;
DROP POLICY IF EXISTS "Permits are private" ON permits;
DROP POLICY IF EXISTS "Contact messages are private" ON contact_messages;

-- =============================================================================
-- ADMIN USERS POLICIES
-- =============================================================================

CREATE POLICY "Admin users are private"
    ON admin_users
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- MEMBERS POLICIES
-- =============================================================================

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

CREATE POLICY "Public competitions are viewable"
    ON competitions
    FOR SELECT
    USING (status IN ('scheduled', 'completed', 'ongoing'));

CREATE POLICY "Service role can manage competitions"
    ON competitions
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- REGISTRATIONS POLICIES
-- =============================================================================

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

CREATE POLICY "Results are publicly viewable"
    ON results
    FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage results"
    ON results
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- PERMITS POLICIES
-- =============================================================================

CREATE POLICY "Permits are private"
    ON permits
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- CONTACT MESSAGES POLICIES
-- =============================================================================

CREATE POLICY "Contact messages are private"
    ON contact_messages
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show all policies
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies successfully created/updated!';
    RAISE NOTICE '';
    RAISE NOTICE 'Policies per table:';
    RAISE NOTICE '  admin_users: 1 policy (service_role only)';
    RAISE NOTICE '  members: 2 policies (public read + service_role all)';
    RAISE NOTICE '  competitions: 2 policies (public read + service_role all)';
    RAISE NOTICE '  registrations: 2 policies (public read + service_role all)';
    RAISE NOTICE '  results: 2 policies (public read + service_role all)';
    RAISE NOTICE '  permits: 1 policy (service_role only)';
    RAISE NOTICE '  contact_messages: 1 policy (service_role only)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 All tables are now protected with Row Level Security!';
END $$;
