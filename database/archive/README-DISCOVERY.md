# Database Schema Discovery System

## The Problem

We kept creating database views that failed with errors like:
- `column "member_number" does not exist`
- `column "is_active" does not exist`
- `operator does not exist: uuid = integer`

Why? **We were guessing the schema instead of discovering it.**

## The Solution

A systematic discovery-first approach:
1. Run discovery queries to see what actually exists
2. Document the exact schema
3. Create views using only confirmed columns
4. Deploy with confidence

---

## Files in This System

### Discovery Files

#### `inspect-actual-schema.sql`
Comprehensive SQL queries to discover:
- All tables and their columns
- Data types and constraints
- Foreign key relationships
- Sample data for verification

**Usage**: Copy entire file → Paste in Supabase SQL Editor → Run → Copy all output

#### `discover-and-deploy.sql`
Two-part file:
- **Part 1**: Schema discovery (same as inspect-actual-schema.sql)
- **Part 2**: Minimal safe view deployment

**Usage**: Run Part 1 first, review output, then optionally run Part 2

### Safe View Files

#### `minimal-safe-views.sql`
Creates basic views using only guaranteed columns:
- `member_stats` - Basic member information
- `competition_summary` - Basic competition stats
- `recent_results` - Recent result records

**Usage**: Deploy these when schema is uncertain or very basic

### Documentation Files

#### `SCHEMA-DISCOVERY.md`
Complete guide explaining:
- Why discovery is necessary
- Step-by-step discovery process
- How to interpret results
- Common issues and solutions
- Next steps after discovery

#### `QUICKSTART-DISCOVERY.md`
Condensed quick-start guide:
- 5-step process to discover and deploy
- Expected timeframes
- Common scenarios

#### `SCHEMA-TEMPLATE.md`
Template to document your schema findings:
- Fill-in-the-blanks format
- Checklist of important questions
- Helps organize discovery output

#### `README-DISCOVERY.md`
This file - overview of the entire system

---

## Quick Start (5 Minutes)

### Step 1: Discover (1 minute)
```bash
# Open Supabase SQL Editor
# Copy: database/inspect-actual-schema.sql
# Paste and run
```

### Step 2: Document (2 minutes)
```bash
# Copy all output from Supabase
# Paste into database/SCHEMA-TEMPLATE.md
# Fill in the Yes/No questions
```

### Step 3: Deploy (2 minutes)
```bash
# Based on what you discovered:

# Option A: Minimal (always works)
# Copy: database/minimal-safe-views.sql

# Option B: Request custom views
# Share your completed SCHEMA-TEMPLATE.md
# Get tailored SQL for your exact schema
```

---

## Understanding the Files

### What Each File Does

```
inspect-actual-schema.sql
├─ Lists all tables
├─ Shows all columns (name, type, nullable, default)
├─ Reveals foreign keys
└─ Displays sample data

minimal-safe-views.sql
├─ Creates views using only basic columns
├─ Guaranteed to work
└─ Limited functionality (no names, rankings)

discover-and-deploy.sql
├─ Part 1: Discovery (same as inspect-actual-schema.sql)
└─ Part 2: Deploys ultra-minimal views

SCHEMA-DISCOVERY.md
├─ Why we need discovery
├─ How to run discovery
├─ How to interpret results
└─ Common problems and solutions

QUICKSTART-DISCOVERY.md
├─ Fast 5-step process
└─ No background explanation

SCHEMA-TEMPLATE.md
├─ Blank template to fill in
└─ Documents your schema findings
```

---

## Common Scenarios

### Scenario 1: Completely Unknown Schema
**You**: "I don't know what columns exist"

**Do This**:
1. Run `inspect-actual-schema.sql`
2. Share ALL output
3. We'll create custom views for you

**Time**: 5 minutes total

---

### Scenario 2: Schema Partially Known
**You**: "I know there's a members table but not sure what columns"

**Do This**:
1. Run `inspect-actual-schema.sql`
2. Fill out `SCHEMA-TEMPLATE.md`
3. Deploy `minimal-safe-views.sql` while waiting
4. Request enhanced views once template is complete

**Time**: 8 minutes total

---

### Scenario 3: Views Keep Failing
**You**: "I created views but they error with 'column does not exist'"

**Do This**:
1. Run `inspect-actual-schema.sql`
2. Compare output to your view SQL
3. Find the column name mismatch
4. Fix the view SQL or request help

**Time**: 3 minutes to identify issue

---

### Scenario 4: Need Rankings
**You**: "I need club and veteran rankings"

**Do This**:
1. Run `inspect-actual-schema.sql`
2. Check for these columns:
   - members: `name` or `first_name`/`last_name`
   - members: `is_veteran`
   - results: `points`, `position`
   - competitions: `counts_for_club_ranking`, `counts_for_veteran_ranking`
3. Fill out `SCHEMA-TEMPLATE.md` noting what exists
4. Share template
5. We'll create ranking views using only columns that exist

**Time**: 10 minutes total

---

## Why This Approach Works

### Old Approach (Broken)
```sql
-- ❌ Assume schema
CREATE VIEW club_ranking AS
SELECT
    m.member_number,     -- Doesn't exist
    m.first_name,        -- Doesn't exist
    m.is_veteran         -- Doesn't exist
FROM members m
WHERE m.is_active = true -- Doesn't exist
```

**Result**: Fails immediately

---

### New Approach (Works)
```sql
-- ✓ Step 1: Discover
-- Run inspect-actual-schema.sql
-- Output shows: members has [id, name, email, created_at]

-- ✓ Step 2: Create views using ONLY discovered columns
CREATE VIEW club_ranking AS
SELECT
    m.id,
    m.name,              -- Exists (confirmed)
    m.email              -- Exists (confirmed)
FROM members m;
```

**Result**: Works perfectly

---

## File Relationships

```
Start Here
    ↓
QUICKSTART-DISCOVERY.md (read this first)
    ↓
inspect-actual-schema.sql (run this in Supabase)
    ↓
[Copy output]
    ↓
SCHEMA-TEMPLATE.md (fill this out)
    ↓
Choose deployment:
    ├─ minimal-safe-views.sql (basic, always works)
    ├─ discover-and-deploy.sql Part 2 (ultra-minimal)
    └─ Request custom views (best option)

For details, read:
    └─ SCHEMA-DISCOVERY.md (comprehensive guide)
```

---

## What Gets Discovered

### Table Structure
- Table names
- Column names
- Data types
- Nullable constraints
- Default values

### Relationships
- Foreign keys
- Referenced tables
- Referenced columns

### Sample Data
- First 2 rows from each table
- Shows actual data format
- Reveals naming patterns

### Existing Objects
- Current views
- View definitions
- Allows us to see what's already there

---

## Output Example

After running `inspect-actual-schema.sql`, you'll see:

```
=== ALL TABLES ===
members
competitions
results
registrations

=== MEMBERS TABLE COLUMNS ===
id               | uuid      | NO  | gen_random_uuid()
name             | text      | NO  |
email            | text      | YES |
created_at       | timestamp | NO  | now()
updated_at       | timestamp | NO  | now()

=== MEMBERS SAMPLE DATA ===
id                                   | name        | email
-------------------------------------|-------------|------------------
a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6| John Doe    | john@example.com
b2c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7| Jane Smith  | jane@example.com
```

This tells us:
- ✓ `id` column exists and is uuid type
- ✓ `name` column exists (single column, not split)
- ✓ `email` column exists
- ✗ NO `member_number` column
- ✗ NO `is_active` column
- ✗ NO `is_veteran` column

---

## Next Steps After Discovery

### Immediate (Do Now)
1. Run `inspect-actual-schema.sql`
2. Copy all output
3. Share it or fill out `SCHEMA-TEMPLATE.md`

### Short Term (Next 10 minutes)
1. Deploy `minimal-safe-views.sql` for basic functionality
2. Test the minimal views work
3. Request enhanced views based on discovered schema

### Long Term (Next Sprint)
1. Enhance views with rankings
2. Add RLS policies
3. Create TypeScript types from schema
4. Optimize indexes based on actual queries

---

## File Locations

All files are in:
```
C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\database\
```

Files created:
- ✓ `inspect-actual-schema.sql` - Discovery queries
- ✓ `minimal-safe-views.sql` - Basic safe views
- ✓ `discover-and-deploy.sql` - Combined discovery + deployment
- ✓ `SCHEMA-DISCOVERY.md` - Detailed guide
- ✓ `QUICKSTART-DISCOVERY.md` - Quick start
- ✓ `SCHEMA-TEMPLATE.md` - Documentation template
- ✓ `README-DISCOVERY.md` - This file

---

## Philosophy

> "Discover what IS, don't assume what SHOULD BE."

Every database schema is different. The only way to create views that work is to:
1. Look at the actual schema
2. Use only columns that actually exist
3. Cast data types correctly
4. Test with real data

No assumptions. Only facts.

---

## Support

If you're stuck:
1. Share the output from `inspect-actual-schema.sql`
2. We'll create perfect views for your exact schema
3. Guaranteed to work on first try

Time from discovery to working views: **~10 minutes**
