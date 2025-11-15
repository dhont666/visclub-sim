-- ============================================================================
-- VISCLUB SIM - DIAGNOSTIC QUERIES
-- ============================================================================
-- Run these queries in phpMyAdmin to diagnose database issues
-- Copy and paste each section separately to see results
-- ============================================================================

-- ============================================================================
-- 1. CHECK DATABASE EXISTS
-- ============================================================================
SHOW DATABASES LIKE 'visclubsim';
-- Expected: 1 row
-- If empty: Database doesn't exist - create it first


-- ============================================================================
-- 2. USE DATABASE
-- ============================================================================
USE visclubsim;


-- ============================================================================
-- 3. CHECK ALL TABLES
-- ============================================================================
SHOW TABLES;
-- Expected: 8 tables
-- admin_users, competitions, contact_messages, members, permits,
-- public_registrations, registrations, results


-- ============================================================================
-- 4. CHECK TABLE ROW COUNTS
-- ============================================================================
SELECT 'admin_users' as table_name, COUNT(*) as row_count FROM admin_users
UNION ALL
SELECT 'members', COUNT(*) FROM members
UNION ALL
SELECT 'competitions', COUNT(*) FROM competitions
UNION ALL
SELECT 'results', COUNT(*) FROM results
UNION ALL
SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'public_registrations', COUNT(*) FROM public_registrations
UNION ALL
SELECT 'permits', COUNT(*) FROM permits
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages;


-- ============================================================================
-- 5. CHECK TABLE STRUCTURES
-- ============================================================================

-- Members table
DESCRIBE members;
-- Expected columns: id, name, member_number, email, phone, address, city,
-- postal_code, birth_date, is_veteran, is_active, joined_at, notes,
-- created_at, updated_at

-- Permits table
DESCRIBE permits;
-- Expected columns: id, applicant_name, email, phone, address, permit_type,
-- member_id, status, notes, approved_by, approved_date, rejected_by,
-- rejected_date, rejection_reason, application_date, created_at, updated_at

-- Registrations table
DESCRIBE registrations;
-- Expected columns: id, competition_id, member_id, status, payment_status,
-- payment_date, payment_amount, payment_method, notes, registration_date,
-- created_at, updated_at

-- Public registrations table
DESCRIBE public_registrations;
-- Expected columns: id, first_name, last_name, email, phone,
-- partner_first_name, partner_last_name, competition_date, competition_name,
-- registration_type, payment_method, payment_reference, amount, remarks,
-- payment_status, status, created_at, updated_at

-- Contact messages table
DESCRIBE contact_messages;
-- Expected columns: id, name, email, subject, message, status, reply_message,
-- replied_at, created_at, updated_at

-- Competitions table
DESCRIBE competitions;
-- Expected columns: id, name, date, location, description, status,
-- counts_for_club_ranking, counts_for_veteran_ranking, max_participants,
-- registration_deadline, notes, created_at, updated_at

-- Results table
DESCRIBE results;
-- Expected columns: id, competition_id, member_id, points, weight, fish_count,
-- is_absent, notes, created_at, updated_at

-- Admin users table
DESCRIBE admin_users;
-- Expected columns: id, username, password_hash, email, full_name, role,
-- is_active, last_login, created_at, updated_at


-- ============================================================================
-- 6. CHECK FOR VIEWS
-- ============================================================================
SHOW FULL TABLES WHERE Table_type = 'VIEW';
-- Expected: 5 views
-- club_ranking, veteran_ranking, recent_results, member_statistics,
-- upcoming_competitions


-- ============================================================================
-- 7. CHECK INDEXES
-- ============================================================================
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
    INDEX_TYPE,
    CASE WHEN NON_UNIQUE = 0 THEN 'UNIQUE' ELSE 'NOT UNIQUE' END as UNIQUENESS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'visclubsim'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;


-- ============================================================================
-- 8. CHECK FOREIGN KEYS
-- ============================================================================
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'visclubsim'
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;


-- ============================================================================
-- 9. CHECK AUTO_INCREMENT VALUES
-- ============================================================================
SELECT
    TABLE_NAME,
    AUTO_INCREMENT,
    TABLE_ROWS as 'Estimated Rows'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND AUTO_INCREMENT IS NOT NULL
ORDER BY TABLE_NAME;


-- ============================================================================
-- 10. CHECK RECENT DATA
-- ============================================================================

-- Recent members
SELECT id, name, member_number, is_active, created_at
FROM members
ORDER BY id DESC
LIMIT 10;

-- Recent permits
SELECT id, applicant_name, email, status, application_date
FROM permits
ORDER BY id DESC
LIMIT 10;

-- Recent public registrations
SELECT id, first_name, last_name, competition_name, status, created_at
FROM public_registrations
ORDER BY id DESC
LIMIT 10;

-- Recent contact messages
SELECT id, name, email, subject, status, created_at
FROM contact_messages
ORDER BY id DESC
LIMIT 10;

-- Admin users
SELECT id, username, email, full_name, role, is_active, last_login
FROM admin_users
ORDER BY id;


-- ============================================================================
-- 11. CHECK DATA INTEGRITY
-- ============================================================================

-- Check for inactive members
SELECT id, name, member_number, is_active, created_at
FROM members
WHERE is_active = 0 OR is_active IS NULL;

-- Check for members without email
SELECT id, name, member_number
FROM members
WHERE email IS NULL OR email = '';

-- Check for permits with invalid status
SELECT id, applicant_name, status
FROM permits
WHERE status NOT IN ('pending', 'approved', 'rejected');

-- Check for registrations without valid competition
SELECT r.id, r.competition_id, r.member_id
FROM registrations r
LEFT JOIN competitions c ON r.competition_id = c.id
WHERE c.id IS NULL;

-- Check for registrations without valid member
SELECT r.id, r.competition_id, r.member_id
FROM registrations r
LEFT JOIN members m ON r.member_id = m.id
WHERE m.id IS NULL;

-- Check for duplicate registrations
SELECT competition_id, member_id, COUNT(*) as duplicate_count
FROM registrations
GROUP BY competition_id, member_id
HAVING duplicate_count > 1;


-- ============================================================================
-- 12. CHECK MEMBER VISIBILITY ISSUE
-- ============================================================================

-- Count members by active status
SELECT
    CASE
        WHEN is_active = 1 THEN 'Active'
        WHEN is_active = 0 THEN 'Inactive'
        ELSE 'NULL/Unknown'
    END as status,
    COUNT(*) as count
FROM members
GROUP BY is_active;

-- Show all members with their active status
SELECT id, name, member_number, is_active, is_veteran, created_at
FROM members
ORDER BY id DESC;

-- Test API query with active filter (what frontend might be doing)
SELECT * FROM members WHERE is_active = 1 ORDER BY name ASC;

-- Test API query without filter
SELECT * FROM members ORDER BY name ASC;


-- ============================================================================
-- 13. CHECK PERMITS DATA
-- ============================================================================

-- Permits by status
SELECT status, COUNT(*) as count
FROM permits
GROUP BY status;

-- Permits with missing approved_date but status = approved
SELECT id, applicant_name, status, approved_date, approved_by
FROM permits
WHERE status = 'approved' AND (approved_date IS NULL OR approved_by IS NULL);

-- Permits with linked members
SELECT p.id, p.applicant_name, p.member_id, m.name as member_name
FROM permits p
LEFT JOIN members m ON p.member_id = m.id
WHERE p.member_id IS NOT NULL;


-- ============================================================================
-- 14. CHECK REGISTRATIONS DATA
-- ============================================================================

-- Registrations by competition
SELECT
    c.name as competition_name,
    c.date as competition_date,
    COUNT(r.id) as registration_count
FROM competitions c
LEFT JOIN registrations r ON c.id = r.competition_id
GROUP BY c.id, c.name, c.date
ORDER BY c.date DESC;

-- Public registrations by status
SELECT status, COUNT(*) as count
FROM public_registrations
GROUP BY status;

-- Public registrations by payment status
SELECT payment_status, COUNT(*) as count
FROM public_registrations
GROUP BY payment_status;


-- ============================================================================
-- 15. CHECK DATABASE SIZE
-- ============================================================================
SELECT
    TABLE_NAME,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)',
    TABLE_ROWS as 'Estimated Rows',
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS 'Data Size (MB)',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) AS 'Index Size (MB)'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;


-- ============================================================================
-- 16. CHECK FOR MISSING INDEXES (Performance)
-- ============================================================================

-- Tables without indexes (excluding PRIMARY)
SELECT DISTINCT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND TABLE_TYPE = 'BASE TABLE'
AND TABLE_NAME NOT IN (
    SELECT DISTINCT TABLE_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'visclubsim'
    AND INDEX_NAME != 'PRIMARY'
);


-- ============================================================================
-- 17. TEST VIEW QUERIES
-- ============================================================================

-- Test club_ranking view
SELECT * FROM club_ranking LIMIT 10;

-- Test veteran_ranking view
SELECT * FROM veteran_ranking LIMIT 10;

-- Test recent_results view
SELECT * FROM recent_results LIMIT 10;

-- Test member_statistics view
SELECT * FROM member_statistics LIMIT 10;

-- Test upcoming_competitions view
SELECT * FROM upcoming_competitions LIMIT 10;


-- ============================================================================
-- 18. CHECK COLUMN TYPES (Look for mismatches)
-- ============================================================================

-- Check boolean columns (should be TINYINT(1))
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'visclubsim'
AND COLUMN_NAME IN ('is_active', 'is_veteran', 'is_absent',
    'counts_for_club_ranking', 'counts_for_veteran_ranking')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check numeric columns (should be INT or DECIMAL)
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'visclubsim'
AND COLUMN_NAME IN ('points', 'weight', 'fish_count', 'payment_amount')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Check date/time columns
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'visclubsim'
AND COLUMN_NAME IN ('created_at', 'updated_at', 'application_date',
    'registration_date', 'approved_date', 'rejected_date')
ORDER BY TABLE_NAME, COLUMN_NAME;


-- ============================================================================
-- 19. CHECK FOR ORPHANED RECORDS
-- ============================================================================

-- Results without valid competition
SELECT r.id, r.competition_id, r.member_id
FROM results r
LEFT JOIN competitions c ON r.competition_id = c.id
WHERE c.id IS NULL;

-- Results without valid member
SELECT r.id, r.competition_id, r.member_id
FROM results r
LEFT JOIN members m ON r.member_id = m.id
WHERE m.id IS NULL;

-- Permits with member_id but member doesn't exist
SELECT p.id, p.applicant_name, p.member_id
FROM permits p
WHERE p.member_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM members m WHERE m.id = p.member_id);


-- ============================================================================
-- 20. FINAL SUMMARY
-- ============================================================================

-- Database summary
SELECT
    'Database Name' as info_type,
    DATABASE() as value
UNION ALL
SELECT
    'Total Tables',
    COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND TABLE_TYPE = 'BASE TABLE'
UNION ALL
SELECT
    'Total Views',
    COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND TABLE_TYPE = 'VIEW'
UNION ALL
SELECT
    'Total Members',
    COUNT(*)
FROM members
UNION ALL
SELECT
    'Active Members',
    COUNT(*)
FROM members
WHERE is_active = 1
UNION ALL
SELECT
    'Total Permits',
    COUNT(*)
FROM permits
UNION ALL
SELECT
    'Pending Permits',
    COUNT(*)
FROM permits
WHERE status = 'pending'
UNION ALL
SELECT
    'Total Registrations',
    COUNT(*)
FROM registrations
UNION ALL
SELECT
    'Total Public Registrations',
    COUNT(*)
FROM public_registrations
UNION ALL
SELECT
    'Total Competitions',
    COUNT(*)
FROM competitions
UNION ALL
SELECT
    'Total Results',
    COUNT(*)
FROM results;


-- ============================================================================
-- DONE!
-- ============================================================================
-- Review all results above to identify issues
--
-- Common issues to look for:
-- 1. Missing tables (SHOW TABLES should return 8)
-- 2. Missing columns (DESCRIBE should match schema)
-- 3. Missing views (should have 5 views)
-- 4. Missing indexes (check INFORMATION_SCHEMA.STATISTICS)
-- 5. Inactive members (is_active = 0 or NULL)
-- 6. Orphaned records (JOIN returns NULL)
-- 7. Wrong column types (TEXT instead of DATETIME, etc.)
-- 8. Missing foreign keys
-- 9. AUTO_INCREMENT issues (NULL or too low)
--
-- If you find issues, run:
-- 1. database/COMPLETE-SCHEMA.sql (to create missing tables/columns)
-- 2. database/RECOMMENDED-FIXES.sql (to add indexes and constraints)
-- ============================================================================
