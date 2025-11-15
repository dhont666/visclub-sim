# Database Quick Fixes - Visclub SiM

## Problem: Data Not Being Saved or Retrieved

### Most Likely Cause
The database tables don't exist or are missing columns.

---

## SOLUTION 1: Import Complete Schema (RECOMMENDED)

### Step-by-Step:

1. **Login to phpMyAdmin**
   - URL: `https://your-plesk-url/phpmyadmin` or via Plesk -> Databases
   - Username: `VisclubDhont`
   - Password: `Kutwijf666`

2. **Select Database**
   - Click on `visclubsim` in left sidebar
   - If it doesn't exist, create it first:
     ```sql
     CREATE DATABASE visclubsim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```

3. **Import Schema**
   - Click "Import" tab at top
   - Click "Choose File" button
   - Navigate to: `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\database\COMPLETE-SCHEMA.sql`
   - Click "Go" button at bottom
   - Wait for "Import has been successfully finished" message

4. **Verify Tables Were Created**
   - Click on `visclubsim` database in left sidebar
   - You should see 8 tables:
     - admin_users
     - competitions
     - contact_messages
     - members
     - permits
     - public_registrations
     - registrations
     - results

5. **Test the API**
   - Open: `https://visclubsim.be/api/health`
   - Should return: `{"status":"ok","timestamp":"...","version":"1.0.0"}`

---

## SOLUTION 2: Add Performance Indexes (After importing schema)

1. **In phpMyAdmin, select `visclubsim` database**

2. **Click "SQL" tab**

3. **Copy and paste the ENTIRE contents of:**
   `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\database\RECOMMENDED-FIXES.sql`

4. **Click "Go"**

5. **Wait for completion** (should take 5-10 seconds)

---

## SOLUTION 3: Fix Member Visibility Issue

### If new members are not showing up:

**Step 1: Check if members exist in database**
```sql
SELECT id, name, is_active, created_at
FROM members
ORDER BY id DESC
LIMIT 10;
```

**Step 2: Check inactive members**
```sql
SELECT id, name, is_active
FROM members
WHERE is_active = 0 OR is_active IS NULL;
```

**Step 3: Fix inactive members**
```sql
UPDATE members
SET is_active = 1
WHERE is_active IS NULL OR is_active = 0;
```

**Step 4: Check frontend filters**
- Open browser DevTools (F12)
- Go to Network tab
- Refresh members page
- Look for API call to `/api/members`
- Check if it has `?active=true` parameter
- If yes, that's filtering out inactive members

---

## Verification Queries

### Run these in phpMyAdmin to verify everything is working:

```sql
-- 1. Check all tables exist
SHOW TABLES;

-- 2. Count rows in each table
SELECT 'admin_users' as table_name, COUNT(*) as count FROM admin_users
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'permits', COUNT(*) FROM permits
UNION ALL SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL SELECT 'public_registrations', COUNT(*) FROM public_registrations;

-- 3. Check recent permits
SELECT id, applicant_name, email, status, application_date
FROM permits
ORDER BY application_date DESC
LIMIT 5;

-- 4. Check recent registrations
SELECT id, first_name, last_name, competition_name, created_at
FROM public_registrations
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check admin users
SELECT id, username, email, full_name, is_active
FROM admin_users;
```

---

## Common Errors and Fixes

### Error: "Table 'visclubsim.xxx' doesn't exist"

**Fix:** Import `database/COMPLETE-SCHEMA.sql` (see Solution 1)

---

### Error: "Unknown column 'xxx' in 'field list'"

**Fix:** Missing column in table. Import `database/COMPLETE-SCHEMA.sql` or add column manually:

```sql
-- Example: Add approved_by to permits table
ALTER TABLE permits
ADD COLUMN approved_by VARCHAR(100) DEFAULT NULL;
```

---

### Error: "Duplicate entry '1-1' for key 'idx_unique_registration'"

**Fix:** Trying to register same member for same competition twice. This is correct behavior (prevents duplicates).

To allow updates instead of duplicates, the API should use:
```sql
INSERT ... ON DUPLICATE KEY UPDATE ...
```

---

### Error: "Access denied for user 'xxx'@'localhost'"

**Fix:** Wrong database credentials in `api/config.php`

Check lines 32-35:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'visclubsim');
define('DB_USER', 'VisclubDhont');
define('DB_PASS', 'Kutwijf666');
```

Verify these match your Cloud86/Plesk database settings.

---

## Testing Checklist

After importing schema and fixes:

- [ ] Can login to admin panel (`/admin/login.html`)
- [ ] Can view members list (`/admin/leden.html`)
- [ ] Can add new member (appears in list immediately)
- [ ] Can view permits list (`/admin/vergunningen.html`)
- [ ] Can view registrations (`/admin/inschrijvingen.html`)
- [ ] Public permit form works (`/visvergunning.html`)
- [ ] Public registration form works (`/inschrijven.html`)
- [ ] Contact form works (`/contact.html`)

---

## Files Created

All files are located in:
`C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\`

### Essential Files:

1. **database/COMPLETE-SCHEMA.sql**
   - Complete database schema with all tables and views
   - Import this first!

2. **database/RECOMMENDED-FIXES.sql**
   - Performance indexes
   - Unique constraints
   - Data integrity checks
   - Import this after COMPLETE-SCHEMA.sql

3. **database/TROUBLESHOOTING-GUIDE.md**
   - Detailed troubleshooting steps
   - Common issues and solutions
   - Diagnostic queries

4. **DATABASE-ANALYSIS-REPORT.md**
   - Full analysis of database and API
   - Query optimization suggestions
   - Schema mismatches
   - Security analysis

5. **DATABASE-QUICK-FIXES.md** (this file)
   - Quick reference for common fixes

---

## Next Steps

1. **Import Schema**
   - File: `database/COMPLETE-SCHEMA.sql`
   - Via: phpMyAdmin -> Import

2. **Import Fixes**
   - File: `database/RECOMMENDED-FIXES.sql`
   - Via: phpMyAdmin -> SQL tab

3. **Test Everything**
   - Use testing checklist above
   - Check browser console for errors
   - Check Network tab for API responses

4. **If Issues Persist**
   - Check `database/TROUBLESHOOTING-GUIDE.md`
   - Check PHP error logs
   - Add debug logging to `api/index.php`

---

## Support

**Database Config:** `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\api\config.php`

**API Endpoints:** `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\api\index.php`

**Full Analysis:** `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\DATABASE-ANALYSIS-REPORT.md`

**Troubleshooting:** `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\database\TROUBLESHOOTING-GUIDE.md`

---

**Last Updated:** 2025-11-15
**Database:** visclubsim (MySQL)
**API Version:** 1.0.0
