# Schema Discovery Guide

## The Problem We're Solving

We've been creating database views that fail because we've been **assuming columns exist** instead of **discovering what actually exists**.

Common mistakes we made:
- Assumed `member_number` exists → IT DOESN'T
- Assumed `is_active` exists → IT DOESN'T
- Assumed `first_name` and `last_name` exist → THEY DON'T
- Assumed ID columns are UUIDs → might be integers
- Used columns in joins without checking data types

## The Solution: Discover First, Assume Nothing

We now follow a **3-step process**:

1. **DISCOVER** - Query the actual schema to see what exists
2. **VERIFY** - Review the output and confirm column names and types
3. **DEPLOY** - Create views using only confirmed columns

---

## Step 1: Discover the Actual Schema

### Option A: Quick Discovery (Recommended First)

Run this in Supabase SQL Editor:

```sql
-- File: inspect-actual-schema.sql
```

Copy the **entire file** `database/inspect-actual-schema.sql` and paste it into Supabase.

This will show you:
- All tables in your database
- All columns in members, competitions, results, registrations
- Foreign key relationships
- Sample data from each table
- Existing views (if any)

### Option B: Complete Discovery + Deployment

Run this in Supabase SQL Editor:

```sql
-- File: discover-and-deploy.sql (PART 1 ONLY)
```

Copy `database/discover-and-deploy.sql` but **ONLY run PART 1** (the discovery section).

**DO NOT run PART 2** until you've reviewed the discovery output.

---

## Step 2: Review the Discovery Output

### What to Look For

After running the discovery queries, review the output and note:

#### Members Table
- [ ] What is the ID column type? (uuid, integer, bigint)
- [ ] Is there a `name` column (single) or `first_name`/`last_name` (split)?
- [ ] Is there a `member_number` column?
- [ ] Is there an `is_active` column?
- [ ] Is there an `is_veteran` column?
- [ ] What other columns exist? (email, phone, address, etc.)

#### Competitions Table
- [ ] What is the ID column type?
- [ ] Is there a `name` column?
- [ ] Is there a `date` column? (date, timestamp, timestamptz)
- [ ] Is there a `location` column?
- [ ] Is there a `type` column?
- [ ] Is there a `status` column?
- [ ] Is there a `counts_for_club_ranking` column?
- [ ] Is there a `counts_for_veteran_ranking` column?

#### Results Table
- [ ] What is the ID column type?
- [ ] What is the `member_id` column type?
- [ ] What is the `competition_id` column type?
- [ ] Is there a `position` column?
- [ ] Is there a `points` column?
- [ ] Is there a `weight` column?
- [ ] Is there a `species` column?

#### Registrations Table
- [ ] Does this table exist?
- [ ] What columns does it have?
- [ ] How does it relate to members and competitions?

### Document Your Findings

Create a simple text file with your findings:

```
ACTUAL SCHEMA DISCOVERED ON [DATE]

MEMBERS TABLE:
- id: uuid
- name: text (NOT split into first_name/last_name)
- email: text
- phone: text
- created_at: timestamptz
- updated_at: timestamptz
- NO member_number column
- NO is_active column
- NO is_veteran column

COMPETITIONS TABLE:
- id: uuid
- name: text
- date: date
- location: text
- created_at: timestamptz
- updated_at: timestamptz
- NO type column
- NO status column
- NO counts_for_club_ranking column

RESULTS TABLE:
- id: uuid
- member_id: uuid (foreign key to members.id)
- competition_id: uuid (foreign key to competitions.id)
- position: integer
- points: integer
- created_at: timestamptz
- updated_at: timestamptz
```

---

## Step 3: Deploy Safe Views

### Option A: Use Minimal Safe Views

If your schema is very basic, use the minimal views:

```sql
-- File: minimal-safe-views.sql
```

This creates views using **only guaranteed columns** (id, created_at, updated_at).

### Option B: Run Part 2 of discover-and-deploy.sql

Once you've confirmed the schema, run **PART 2** of `discover-and-deploy.sql`.

This creates ultra-minimal views that will work with any schema.

### Option C: Request Enhanced Views

Share your schema discovery output, and we'll create **enhanced views** tailored to your exact schema.

The enhanced views will include:
- Proper column names (name vs first_name/last_name)
- Correct data type casting (uuid::text vs integer conversions)
- Only columns that actually exist
- Proper join conditions
- Club and veteran rankings (if supporting columns exist)

---

## Common Issues and Solutions

### Issue: "column does not exist"

**Cause**: View references a column that doesn't exist in your schema

**Solution**:
1. Re-run discovery queries to confirm column names
2. Check for typos (e.g., `member_number` vs `memberNumber`)
3. Use the exact column name from discovery output

### Issue: "operator does not exist: uuid = integer"

**Cause**: Joining columns with incompatible types

**Solution**:
1. Check data types from discovery output
2. Use explicit casting: `m.id::text = r.member_id::text`
3. Or ensure both sides match: `m.id::uuid = r.member_id::uuid`

### Issue: "function avg(uuid) does not exist"

**Cause**: Trying to use aggregate function on wrong data type

**Solution**:
1. Confirm column data type from discovery output
2. Only use AVG, SUM, etc. on numeric columns
3. Use COUNT for non-numeric columns

### Issue: Views created but return empty results

**Cause**: Data might not exist, or joins are incorrect

**Solution**:
1. Check sample data from discovery queries
2. Verify foreign key relationships are correct
3. Test joins separately before adding to views

---

## Next Steps After Discovery

1. **Run discovery queries** in Supabase
2. **Copy ALL output** and save it
3. **Share the output** so we can create perfect views
4. **Deploy minimal views** to ensure basic functionality works
5. **Request enhanced views** with proper rankings, names, and filtering

---

## Why This Approach Works

### Before (Assumption-Based)
```sql
-- We ASSUMED these columns exist:
SELECT
    m.member_number,  -- DOESN'T EXIST
    m.first_name,     -- DOESN'T EXIST
    m.is_active       -- DOESN'T EXIST
FROM members m
WHERE m.is_veteran = 1;  -- DOESN'T EXIST
```

### After (Discovery-Based)
```sql
-- We DISCOVERED these columns actually exist:
SELECT
    m.id,
    m.name,           -- EXISTS (single column, not split)
    m.email,          -- EXISTS
    m.created_at      -- GUARANTEED to exist
FROM members m;
```

---

## File Reference

### Discovery Files
- `inspect-actual-schema.sql` - Comprehensive schema inspection queries
- `discover-and-deploy.sql` - Discovery + minimal view deployment

### Safe View Files
- `minimal-safe-views.sql` - Basic views using only guaranteed columns

### Documentation
- `SCHEMA-DISCOVERY.md` - This guide

---

## Quick Start Commands

```bash
# 1. Open Supabase SQL Editor
# 2. Copy and paste this file:
database/inspect-actual-schema.sql

# 3. Run it and copy ALL output
# 4. Share the output

# 5. Then deploy minimal views:
database/minimal-safe-views.sql

# 6. Or deploy ultra-minimal views:
database/discover-and-deploy.sql (PART 2 only)
```

---

## Philosophy

**DISCOVER what exists, don't ASSUME what should exist.**

Every database schema is different. The only way to create views that work is to first discover the actual structure, then build views based on reality, not assumptions.
