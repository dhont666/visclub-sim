-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- Supabase security policies for Visclub SiM database
-- These policies control who can read/write data based on authentication

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ADMIN USERS POLICIES (Most Restrictive)
-- =============================================================================

-- Only service role can access admin_users
-- This prevents clients from reading password hashes
CREATE POLICY "Admin users are private"
    ON admin_users
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Admin users are private" ON admin_users IS
    'Admin users table is only accessible by service role (backend API)';

-- =============================================================================
-- MEMBERS POLICIES
-- =============================================================================

-- Public can view active members (for public website member list)
CREATE POLICY "Active members are publicly viewable"
    ON members
    FOR SELECT
    USING (is_active = true);

-- Service role can do everything with members
CREATE POLICY "Service role has full access to members"
    ON members
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Active members are publicly viewable" ON members IS
    'Active members are visible on public website';

-- =============================================================================
-- COMPETITIONS POLICIES
-- =============================================================================

-- Public can view scheduled and completed competitions
CREATE POLICY "Public competitions are viewable"
    ON competitions
    FOR SELECT
    USING (status IN ('scheduled', 'completed', 'ongoing'));

-- Service role can manage all competitions
CREATE POLICY "Service role can manage competitions"
    ON competitions
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Public competitions are viewable" ON competitions IS
    'Public can see scheduled, ongoing, and completed competitions';

-- =============================================================================
-- REGISTRATIONS POLICIES
-- =============================================================================

-- Public can view confirmed registrations (for showing who's registered)
CREATE POLICY "Confirmed registrations are viewable"
    ON registrations
    FOR SELECT
    USING (status = 'confirmed');

-- Service role can manage all registrations
CREATE POLICY "Service role can manage registrations"
    ON registrations
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Confirmed registrations are viewable" ON registrations IS
    'Public can see who is registered for competitions';

-- =============================================================================
-- RESULTS POLICIES
-- =============================================================================

-- Public can view all results (for rankings and competition results)
CREATE POLICY "Results are publicly viewable"
    ON results
    FOR SELECT
    USING (true);

-- Service role can manage results
CREATE POLICY "Service role can manage results"
    ON results
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Results are publicly viewable" ON results IS
    'All competition results are public for transparency';

-- =============================================================================
-- PERMITS POLICIES
-- =============================================================================

-- Only service role can access permits (contains personal information)
CREATE POLICY "Permits are private"
    ON permits
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Permits are private" ON permits IS
    'Permits contain personal info and are only accessible by backend';

-- =============================================================================
-- CONTACT MESSAGES POLICIES
-- =============================================================================

-- Only service role can access contact messages
CREATE POLICY "Contact messages are private"
    ON contact_messages
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON POLICY "Contact messages are private" ON contact_messages IS
    'Contact messages are only accessible by admins via backend';

-- =============================================================================
-- ADDITIONAL SECURITY CONFIGURATIONS
-- =============================================================================

-- Disable direct access to views (they inherit table policies)
-- Views are read-only by design, so we only need SELECT policies

-- Club ranking view: Public can read
ALTER VIEW club_ranking SET (security_invoker = true);
ALTER VIEW veteran_ranking SET (security_invoker = true);
ALTER VIEW recent_results SET (security_invoker = true);
ALTER VIEW upcoming_competitions SET (security_invoker = true);
ALTER VIEW member_statistics SET (security_invoker = true);

-- =============================================================================
-- TESTING POLICIES (Optional)
-- =============================================================================

-- Test that anonymous users can read public data
-- Run these queries to verify policies work:

/*
-- As anonymous user (should succeed):
SELECT * FROM members WHERE is_active = true;
SELECT * FROM competitions WHERE status = 'scheduled';
SELECT * FROM results;

-- As anonymous user (should fail):
SELECT * FROM admin_users;
SELECT * FROM permits;
SELECT * FROM contact_messages;

-- As service role (should succeed - all queries):
-- (Set authorization header with service role key)
*/

-- =============================================================================
-- NOTES
-- =============================================================================

/*
IMPORTANT: These policies assume you're using Supabase's authentication system.

For this application:
- Frontend (public website) uses ANON key → Can read public data
- Backend API uses SERVICE_ROLE key → Full access to everything
- Admin panel connects via backend API → Inherits service role permissions

Security model:
1. Public data (members, competitions, results) → Readable by anyone
2. Private data (admin_users, permits, messages) → Only via backend API
3. Write operations → Always via backend API with JWT authentication

To apply these policies:
1. Run this SQL file in Supabase SQL Editor after schema.sql
2. Test with both anon and service_role keys
3. Verify admin panel can write via API
4. Verify public website can only read
*/
