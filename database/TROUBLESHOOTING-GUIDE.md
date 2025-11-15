# Database Troubleshooting Guide - Visclub SiM

## Quick Diagnostics

### 1. Check if Database Exists

```sql
SHOW DATABASES LIKE 'visclubsim';
```

**Expected:** 1 row returned
**If empty:** Database doesn't exist - create it first

---

### 2. Check if Tables Exist

```sql
USE visclubsim;
SHOW TABLES;
```

**Expected:** 8 tables
- admin_users
- competitions
- contact_messages
- members
- permits
- public_registrations
- registrations
- results

**If missing:** Import `database/COMPLETE-SCHEMA.sql`

---

### 3. Check Table Structure

```sql
-- Check members table
DESCRIBE members;

-- Check permits table
DESCRIBE permits;

-- Check registrations table
DESCRIBE registrations;

-- Check public_registrations table
DESCRIBE public_registrations;
```

**Compare with:** `database/COMPLETE-SCHEMA.sql`

---

### 4. Check for Data

```sql
-- Count rows in each table
SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'permits', COUNT(*) FROM permits
UNION ALL SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL SELECT 'public_registrations', COUNT(*) FROM public_registrations
UNION ALL SELECT 'competitions', COUNT(*) FROM competitions
UNION ALL SELECT 'results', COUNT(*) FROM results
UNION ALL SELECT 'contact_messages', COUNT(*) FROM contact_messages;
```

---

## Common Issues and Fixes

### Issue: "Table doesn't exist" Error

**Error Message:**
```
Table 'visclubsim.members' doesn't exist
Table 'visclubsim.permits' doesn't exist
```

**Cause:** Tables not created in database

**Fix:**
1. Go to phpMyAdmin
2. Select database `visclubsim`
3. Click "Import" tab
4. Choose file: `database/COMPLETE-SCHEMA.sql`
5. Click "Go"

---

### Issue: "Column 'xxx' doesn't exist"

**Error Message:**
```
Unknown column 'approved_by' in 'field list'
Unknown column 'payment_amount' in 'field list'
```

**Cause:** Missing columns in table

**Fix Option 1 - Add Missing Columns:**
```sql
-- For permits table
ALTER TABLE permits
ADD COLUMN approved_by VARCHAR(100) DEFAULT NULL,
ADD COLUMN approved_date DATETIME DEFAULT NULL,
ADD COLUMN rejected_by VARCHAR(100) DEFAULT NULL,
ADD COLUMN rejected_date DATETIME DEFAULT NULL,
ADD COLUMN rejection_reason TEXT DEFAULT NULL;

-- For registrations table
ALTER TABLE registrations
ADD COLUMN payment_date DATETIME DEFAULT NULL,
ADD COLUMN payment_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN payment_method VARCHAR(50) DEFAULT NULL;
```

**Fix Option 2 - Recreate Table:**
1. Export existing data: `SELECT * FROM permits INTO OUTFILE '/tmp/permits_backup.csv';`
2. Drop table: `DROP TABLE permits;`
3. Import schema: Run CREATE TABLE from `COMPLETE-SCHEMA.sql`
4. Import data back

---

### Issue: New Members Not Visible

**Symptoms:**
- Member added in admin panel
- Member not showing in members list
- No error messages

**Debugging Steps:**

**Step 1: Check if member was inserted**
```sql
-- Show last 10 members
SELECT id, name, is_active, created_at
FROM members
ORDER BY id DESC
LIMIT 10;
```

**Step 2: Check is_active status**
```sql
-- Show inactive members
SELECT id, name, is_active, created_at
FROM members
WHERE is_active = 0 OR is_active IS NULL;
```

**Step 3: Check API query**
```sql
-- Simulate API query with active filter
SELECT * FROM members WHERE is_active = 1 ORDER BY name ASC;

-- Simulate API query without filter
SELECT * FROM members ORDER BY name ASC;
```

**Common Causes:**

1. **Frontend is filtering by active=true**
   - Check browser DevTools -> Network tab
   - Look for: `GET /api/members?active=true`
   - Fix: Remove filter or set is_active=1 for new members

2. **is_active column is NULL or 0**
   ```sql
   -- Fix: Update is_active to 1
   UPDATE members SET is_active = 1 WHERE is_active IS NULL OR is_active = 0;
   ```

3. **Wrong default value in INSERT**
   - Check `api/index.php` line 324: `$input['is_active'] ?? true`
   - Should default to `true` (which becomes 1 in database)

---

### Issue: Permits Not Saving

**Symptoms:**
- Submit permit form
- Get success message
- Permit not in database

**Debugging Steps:**

**Step 1: Check if permits table exists**
```sql
SHOW TABLES LIKE 'permits';
```

**Step 2: Check table structure**
```sql
DESCRIBE permits;
```

**Expected columns:**
- id, applicant_name, email, phone, address, permit_type, member_id, status, notes
- approved_by, approved_date, rejected_by, rejected_date, rejection_reason
- application_date, created_at, updated_at

**Step 3: Test INSERT manually**
```sql
INSERT INTO permits (applicant_name, email, phone, address, permit_type, notes, status)
VALUES ('Test User', 'test@example.com', '0123456789', 'Test Address', 'algemeen', 'Test notes', 'pending');

-- Check if it was inserted
SELECT * FROM permits ORDER BY id DESC LIMIT 1;
```

**Step 4: Check PHP error logs**
```bash
# On server, check PHP error log
tail -f /var/log/php_error.log

# Or in Plesk: Logs -> Error Logs
```

**Common Causes:**

1. **Missing columns** (see "Column doesn't exist" issue above)
2. **PHP errors** (check error logs)
3. **Database connection failed** (check `api/config.php`)

---

### Issue: Registrations Not Saving

**Same debugging steps as permits:**

**Check table:**
```sql
DESCRIBE registrations;
```

**Test INSERT:**
```sql
-- Get a valid competition_id and member_id first
SELECT id FROM competitions LIMIT 1;
SELECT id FROM members LIMIT 1;

-- Then insert (replace 1 and 1 with actual IDs)
INSERT INTO registrations (competition_id, member_id, status, payment_status, notes)
VALUES (1, 1, 'registered', 'pending', 'Test registration');

SELECT * FROM registrations ORDER BY id DESC LIMIT 1;
```

---

### Issue: Duplicate Registrations

**Symptoms:**
- Same member can register multiple times for same competition
- Duplicate entries in database

**Fix:**
```sql
-- Add unique constraint
ALTER TABLE registrations
ADD UNIQUE INDEX idx_unique_registration (competition_id, member_id);

-- Remove existing duplicates first
DELETE r1 FROM registrations r1
INNER JOIN registrations r2
WHERE r1.id < r2.id
AND r1.competition_id = r2.competition_id
AND r1.member_id = r2.member_id;
```

---

### Issue: Slow Queries

**Symptoms:**
- API takes 5+ seconds to respond
- Page loads slowly
- Database CPU usage high

**Debugging:**

**Step 1: Enable slow query log**
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.5; -- Log queries > 0.5 seconds
```

**Step 2: Check slow queries**
```sql
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

**Step 3: Analyze query**
```sql
-- Use EXPLAIN to see query execution plan
EXPLAIN SELECT * FROM registrations
INNER JOIN members ON registrations.member_id = members.id
INNER JOIN competitions ON registrations.competition_id = competitions.id;
```

**Fix: Add indexes**
```sql
-- Import recommended indexes
-- File: database/RECOMMENDED-FIXES.sql
-- Or add specific indexes:
CREATE INDEX idx_member_id ON registrations(member_id);
CREATE INDEX idx_competition_id ON registrations(competition_id);
```

---

### Issue: Foreign Key Constraint Failed

**Error Message:**
```
Cannot add or update a child row: a foreign key constraint fails
```

**Cause:**
- Trying to insert registration with non-existent competition_id or member_id
- Trying to delete competition that has registrations

**Fix:**
```sql
-- Check if competition exists
SELECT id, name FROM competitions WHERE id = 123;

-- Check if member exists
SELECT id, name FROM members WHERE id = 456;

-- To delete competition with registrations, delete registrations first
DELETE FROM registrations WHERE competition_id = 123;
DELETE FROM competitions WHERE id = 123;

-- Or use CASCADE DELETE (already in schema)
```

---

### Issue: "Access Denied" Database Connection Error

**Error Message:**
```
Access denied for user 'xxx'@'localhost'
```

**Check:**
1. Database credentials in `api/config.php`
   ```php
   define('DB_HOST', 'localhost');  // Correct?
   define('DB_NAME', 'visclubsim');  // Correct?
   define('DB_USER', 'VisclubDhont'); // Correct?
   define('DB_PASS', 'Kutwijf666');  // Correct?
   ```

2. Database user exists and has permissions
   ```sql
   -- Check users
   SELECT User, Host FROM mysql.user WHERE User = 'VisclubDhont';

   -- Grant permissions if needed
   GRANT ALL PRIVILEGES ON visclubsim.* TO 'VisclubDhont'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

## Data Verification Queries

### Check Member Data Integrity

```sql
-- Members without email
SELECT id, name FROM members WHERE email IS NULL OR email = '';

-- Members without member_number
SELECT id, name FROM members WHERE member_number IS NULL OR member_number = '';

-- Duplicate member numbers
SELECT member_number, COUNT(*) as count
FROM members
WHERE member_number IS NOT NULL
GROUP BY member_number
HAVING count > 1;

-- Duplicate emails
SELECT email, COUNT(*) as count
FROM members
WHERE email IS NOT NULL
GROUP BY email
HAVING count > 1;
```

### Check Registration Data Integrity

```sql
-- Registrations without valid competition
SELECT r.id, r.competition_id
FROM registrations r
LEFT JOIN competitions c ON r.competition_id = c.id
WHERE c.id IS NULL;

-- Registrations without valid member
SELECT r.id, r.member_id
FROM registrations r
LEFT JOIN members m ON r.member_id = m.id
WHERE m.id IS NULL;

-- Duplicate registrations
SELECT competition_id, member_id, COUNT(*) as count
FROM registrations
GROUP BY competition_id, member_id
HAVING count > 1;
```

### Check Permit Data Integrity

```sql
-- Permits with invalid email
SELECT id, applicant_name, email
FROM permits
WHERE email NOT LIKE '%@%';

-- Permits linked to non-existent members
SELECT p.id, p.applicant_name, p.member_id
FROM permits p
WHERE p.member_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM members m WHERE m.id = p.member_id);

-- Permits approved but no approved_date
SELECT id, applicant_name, status, approved_date
FROM permits
WHERE status = 'approved' AND approved_date IS NULL;
```

---

## Performance Optimization

### Check Missing Indexes

```sql
-- Show all indexes
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'visclubsim'
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;
```

### Add Missing Indexes

```sql
-- Import all recommended indexes
-- File: database/RECOMMENDED-FIXES.sql

-- Or add specific indexes:
CREATE INDEX idx_registration_date ON registrations(registration_date DESC);
CREATE INDEX idx_application_date ON permits(application_date DESC);
CREATE INDEX idx_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_name ON members(name);
```

### Optimize Tables

```sql
-- Analyze tables (updates statistics for query optimizer)
ANALYZE TABLE members;
ANALYZE TABLE registrations;
ANALYZE TABLE permits;
ANALYZE TABLE competitions;
ANALYZE TABLE results;

-- Optimize tables (defragments and reclaims space)
OPTIMIZE TABLE members;
OPTIMIZE TABLE registrations;
OPTIMIZE TABLE permits;
```

---

## Backup and Restore

### Create Backup

**Via phpMyAdmin:**
1. Select database `visclubsim`
2. Click "Export" tab
3. Choose "Quick" export method
4. Format: SQL
5. Click "Go"

**Via Command Line:**
```bash
mysqldump -u VisclubDhont -p visclubsim > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Backup

**Via phpMyAdmin:**
1. Select database `visclubsim`
2. Click "Import" tab
3. Choose backup file
4. Click "Go"

**Via Command Line:**
```bash
mysql -u VisclubDhont -p visclubsim < backup_20261115_120000.sql
```

---

## Useful Queries for Debugging

### Show Recent Activity

```sql
-- Recent permits
SELECT id, applicant_name, email, status, application_date
FROM permits
ORDER BY application_date DESC
LIMIT 10;

-- Recent registrations
SELECT id, first_name, last_name, competition_name, created_at
FROM public_registrations
ORDER BY created_at DESC
LIMIT 10;

-- Recent contact messages
SELECT id, name, email, subject, created_at
FROM contact_messages
ORDER BY created_at DESC
LIMIT 10;
```

### Show Statistics

```sql
-- Members by status
SELECT
    CASE
        WHEN is_active = 1 THEN 'Active'
        WHEN is_active = 0 THEN 'Inactive'
        ELSE 'Unknown'
    END as status,
    COUNT(*) as count
FROM members
GROUP BY is_active;

-- Permits by status
SELECT status, COUNT(*) as count
FROM permits
GROUP BY status;

-- Registrations by competition
SELECT
    competition_name,
    COUNT(*) as registration_count
FROM public_registrations
GROUP BY competition_name
ORDER BY competition_name;
```

---

## Reset Database (DANGER!)

**WARNING: This will DELETE ALL DATA!**

```sql
-- Drop all tables
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS public_registrations;
DROP TABLE IF EXISTS permits;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS competitions;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS admin_users;

-- Drop all views
DROP VIEW IF EXISTS club_ranking;
DROP VIEW IF EXISTS veteran_ranking;
DROP VIEW IF EXISTS recent_results;
DROP VIEW IF EXISTS member_statistics;
DROP VIEW IF EXISTS upcoming_competitions;

-- Then import COMPLETE-SCHEMA.sql to recreate everything
```

---

## Contact for Help

If issues persist:

1. **Check logs:**
   - PHP error log: `/var/log/php_error.log`
   - MySQL error log: `/var/log/mysql/error.log`
   - Apache/Nginx access log: `/var/log/apache2/access.log`

2. **Add debug logging in API:**
   ```php
   // In api/index.php
   error_log("Debug: " . json_encode($data));
   ```

3. **Test with curl:**
   ```bash
   curl -X GET https://visclubsim.be/api/members
   curl -X GET https://visclubsim.be/api/permits
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for JavaScript errors
   - Check Network tab for API request/response

---

**Last Updated:** 2025-11-15
