-- ============================================================================
-- VISCLUB SIM - RECOMMENDED DATABASE FIXES
-- ============================================================================
-- This file contains all recommended fixes and optimizations
-- Run these queries in phpMyAdmin AFTER importing COMPLETE-SCHEMA.sql
-- ============================================================================

USE `visclubsim`;

-- ============================================================================
-- 1. ADD PERFORMANCE INDEXES
-- ============================================================================

-- Registrations table indexes
CREATE INDEX IF NOT EXISTS idx_registration_date ON registrations(registration_date DESC);
CREATE INDEX IF NOT EXISTS idx_member_id ON registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_competition_id ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_status ON registrations(status);

-- Permits table indexes
CREATE INDEX IF NOT EXISTS idx_application_date ON permits(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_status ON permits(status);
CREATE INDEX IF NOT EXISTS idx_email ON permits(email);
CREATE INDEX IF NOT EXISTS idx_member_id ON permits(member_id);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_email ON contact_messages(email);

-- Public registrations indexes
CREATE INDEX IF NOT EXISTS idx_competition_date ON public_registrations(competition_date);
CREATE INDEX IF NOT EXISTS idx_created_at ON public_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status ON public_registrations(status);
CREATE INDEX IF NOT EXISTS idx_payment_status ON public_registrations(payment_status);

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_active_veteran ON members(is_active, is_veteran);
CREATE INDEX IF NOT EXISTS idx_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_member_number ON members(member_number);

-- Competitions indexes
CREATE INDEX IF NOT EXISTS idx_date ON competitions(date);
CREATE INDEX IF NOT EXISTS idx_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_date_status ON competitions(date, status);

-- Results indexes (some may already exist from foreign keys)
CREATE INDEX IF NOT EXISTS idx_competition_id ON results(competition_id);
CREATE INDEX IF NOT EXISTS idx_member_id ON results(member_id);
CREATE INDEX IF NOT EXISTS idx_points ON results(points);
CREATE INDEX IF NOT EXISTS idx_member_points ON results(member_id, points);
CREATE INDEX IF NOT EXISTS idx_is_absent ON results(is_absent);

-- ============================================================================
-- 2. ADD UNIQUE CONSTRAINTS TO PREVENT DUPLICATES
-- ============================================================================

-- Prevent duplicate registrations (same member, same competition)
ALTER TABLE registrations
ADD UNIQUE INDEX IF NOT EXISTS idx_unique_registration (competition_id, member_id);

-- Prevent duplicate results (same member, same competition)
-- This should already exist from the schema, but add if missing
ALTER TABLE results
ADD UNIQUE INDEX IF NOT EXISTS idx_unique_result (competition_id, member_id);

-- ============================================================================
-- 3. ADD SOFT DELETE COLUMNS (OPTIONAL - for audit trail)
-- ============================================================================

-- Add deleted_at column to permits (for soft deletes)
ALTER TABLE permits
ADD COLUMN IF NOT EXISTS deleted_at DATETIME DEFAULT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

-- Add deleted_at column to registrations
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS deleted_at DATETIME DEFAULT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

-- Add deleted_at column to public_registrations
ALTER TABLE public_registrations
ADD COLUMN IF NOT EXISTS deleted_at DATETIME DEFAULT NULL,
ADD INDEX IF NOT EXISTS idx_deleted_at (deleted_at);

-- ============================================================================
-- 4. VERIFY AND FIX COLUMN TYPES
-- ============================================================================

-- Ensure boolean columns are TINYINT(1)
ALTER TABLE members
MODIFY COLUMN is_active TINYINT(1) DEFAULT 1,
MODIFY COLUMN is_veteran TINYINT(1) DEFAULT 0;

ALTER TABLE admin_users
MODIFY COLUMN is_active TINYINT(1) DEFAULT 1;

ALTER TABLE results
MODIFY COLUMN is_absent TINYINT(1) DEFAULT 0;

ALTER TABLE competitions
MODIFY COLUMN counts_for_club_ranking TINYINT(1) DEFAULT 1,
MODIFY COLUMN counts_for_veteran_ranking TINYINT(1) DEFAULT 1;

-- Ensure numeric columns are correct type
ALTER TABLE results
MODIFY COLUMN points INT(11) NOT NULL,
MODIFY COLUMN weight DECIMAL(10,2) DEFAULT NULL,
MODIFY COLUMN fish_count INT(11) DEFAULT 0;

ALTER TABLE registrations
MODIFY COLUMN payment_amount DECIMAL(10,2) DEFAULT NULL;

-- ============================================================================
-- 5. VERIFY TIMESTAMP DEFAULTS
-- ============================================================================

-- Ensure created_at and updated_at have correct defaults
ALTER TABLE members
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE competitions
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE results
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE registrations
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
MODIFY COLUMN registration_date DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE permits
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
MODIFY COLUMN application_date DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE contact_messages
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE public_registrations
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE admin_users
MODIFY COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================================================
-- 6. ADD FOREIGN KEY CONSTRAINTS (if not already present)
-- ============================================================================

-- Results table foreign keys
ALTER TABLE results
ADD CONSTRAINT IF NOT EXISTS fk_results_competition
FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
ADD CONSTRAINT IF NOT EXISTS fk_results_member
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Registrations table foreign keys
ALTER TABLE registrations
ADD CONSTRAINT IF NOT EXISTS fk_registrations_competition
FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
ADD CONSTRAINT IF NOT EXISTS fk_registrations_member
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Permits table foreign key
ALTER TABLE permits
ADD CONSTRAINT IF NOT EXISTS fk_permits_member
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;

-- ============================================================================
-- 7. VERIFY DATA INTEGRITY
-- ============================================================================

-- Check for orphaned records in results (results without competitions)
SELECT r.id, r.competition_id, r.member_id
FROM results r
LEFT JOIN competitions c ON r.competition_id = c.id
WHERE c.id IS NULL;

-- Check for orphaned records in registrations
SELECT reg.id, reg.competition_id, reg.member_id
FROM registrations reg
LEFT JOIN competitions c ON reg.competition_id = c.id
LEFT JOIN members m ON reg.member_id = m.id
WHERE c.id IS NULL OR m.id IS NULL;

-- Check for permits without linked members
SELECT p.id, p.applicant_name, p.member_id
FROM permits p
WHERE p.member_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM members m WHERE m.id = p.member_id);

-- ============================================================================
-- 8. DIAGNOSTIC QUERIES
-- ============================================================================

-- Show all tables with row counts
SELECT
    'admin_users' as table_name,
    COUNT(*) as row_count,
    MAX(id) as max_id
FROM admin_users
UNION ALL
SELECT 'members', COUNT(*), MAX(id) FROM members
UNION ALL
SELECT 'competitions', COUNT(*), MAX(id) FROM competitions
UNION ALL
SELECT 'results', COUNT(*), MAX(id) FROM results
UNION ALL
SELECT 'registrations', COUNT(*), MAX(id) FROM registrations
UNION ALL
SELECT 'public_registrations', COUNT(*), MAX(id) FROM public_registrations
UNION ALL
SELECT 'permits', COUNT(*), MAX(id) FROM permits
UNION ALL
SELECT 'contact_messages', COUNT(*), MAX(id) FROM contact_messages;

-- Show AUTO_INCREMENT values
SELECT
    TABLE_NAME,
    AUTO_INCREMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND AUTO_INCREMENT IS NOT NULL
ORDER BY TABLE_NAME;

-- Show all indexes
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
    INDEX_TYPE,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'visclubsim'
GROUP BY TABLE_NAME, INDEX_NAME, INDEX_TYPE, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- Show all foreign keys
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

-- Show all views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- ============================================================================
-- 9. CHECK FOR INACTIVE MEMBERS (Debugging member visibility)
-- ============================================================================

-- Show all members with their active status
SELECT id, name, member_number, is_active, is_veteran, created_at
FROM members
ORDER BY created_at DESC
LIMIT 20;

-- Show only inactive members
SELECT id, name, member_number, is_active, created_at
FROM members
WHERE is_active = 0 OR is_active IS NULL;

-- Count members by active status
SELECT
    is_active,
    COUNT(*) as count
FROM members
GROUP BY is_active;

-- ============================================================================
-- 10. PERFORMANCE ANALYSIS
-- ============================================================================

-- Show table sizes
SELECT
    TABLE_NAME,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)',
    TABLE_ROWS as 'Estimated Rows'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'visclubsim'
AND TABLE_TYPE = 'BASE TABLE'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;

-- ============================================================================
-- 11. OPTIONAL: RESET AUTO_INCREMENT (Only if needed!)
-- ============================================================================

-- CAUTION: Only run these if you know what you're doing!
-- These will reset the AUTO_INCREMENT counters

-- ALTER TABLE admin_users AUTO_INCREMENT = 1;
-- ALTER TABLE members AUTO_INCREMENT = 1;
-- ALTER TABLE competitions AUTO_INCREMENT = 1;
-- ALTER TABLE results AUTO_INCREMENT = 1;
-- ALTER TABLE registrations AUTO_INCREMENT = 1;
-- ALTER TABLE public_registrations AUTO_INCREMENT = 1;
-- ALTER TABLE permits AUTO_INCREMENT = 1;
-- ALTER TABLE contact_messages AUTO_INCREMENT = 1;

-- ============================================================================
-- 12. ENABLE QUERY LOGGING (For debugging)
-- ============================================================================

-- Enable general query log (logs ALL queries - use carefully!)
-- SET GLOBAL general_log = 'ON';
-- SET GLOBAL log_output = 'TABLE';
--
-- View logged queries:
-- SELECT * FROM mysql.general_log ORDER BY event_time DESC LIMIT 100;
--
-- Disable when done:
-- SET GLOBAL general_log = 'OFF';

-- Enable slow query log (logs queries slower than long_query_time)
-- SET GLOBAL slow_query_log = 'ON';
-- SET GLOBAL long_query_time = 0.1; -- Log queries taking > 0.1 seconds
--
-- View slow queries:
-- SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 100;

-- ============================================================================
-- DONE!
-- ============================================================================
-- All recommended fixes and optimizations have been applied.
--
-- NEXT STEPS:
-- 1. Run the diagnostic queries above to verify everything is correct
-- 2. Test all API endpoints to ensure they work correctly
-- 3. Monitor query performance using slow query log
-- 4. Add logging to api/index.php to debug member visibility issues
-- ============================================================================
