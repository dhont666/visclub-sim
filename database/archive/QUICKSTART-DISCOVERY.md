# Quick Start: Schema Discovery

Stop guessing. Start discovering.

---

## 1. Open Supabase SQL Editor

Go to your Supabase project → SQL Editor

---

## 2. Run Discovery Query

Copy **ALL** of this file and paste it into SQL Editor:

```
database/inspect-actual-schema.sql
```

Click **Run**

---

## 3. Copy the Output

Scroll through the results and copy **EVERYTHING**:
- All tables list
- Members columns
- Competitions columns
- Results columns
- Registrations columns
- Foreign keys
- Sample data

---

## 4. Share the Output

Paste the output here or in a text file.

We'll then create views that:
- Use the EXACT column names that exist
- Cast data types correctly
- Don't reference columns that don't exist

---

## 5. Deploy Safe Views

Once we have the schema, run ONE of these:

### Option A: Absolute Minimal (Always Works)
```sql
-- Copy database/minimal-safe-views.sql
-- This uses only id, created_at, updated_at
```

### Option B: Ultra Minimal (Guaranteed)
```sql
-- Copy database/discover-and-deploy.sql
-- Run PART 2 only (after discovery)
-- This creates basic functional views
```

### Option C: Custom Enhanced (Best)
```sql
-- We'll create custom views based on your actual schema
-- These will include proper rankings, names, and filters
```

---

## What We'll Discover

From the discovery query, we'll learn:

### About Members Table
- ✓ Does `name` exist (single) or `first_name`/`last_name` (split)?
- ✓ Is there `member_number`?
- ✓ Is there `is_active`?
- ✓ Is there `is_veteran`?
- ✓ What's the ID type? (uuid vs integer)

### About Competitions Table
- ✓ What columns exist? (name, date, location, type, status?)
- ✓ Is there `counts_for_club_ranking`?
- ✓ Is there `counts_for_veteran_ranking`?
- ✓ What's the ID type?

### About Results Table
- ✓ What columns exist? (position, points, weight, species?)
- ✓ What are the foreign key column types?
- ✓ How do they link to members and competitions?

---

## Why This Works

### Before (Failing)
```sql
-- ❌ This fails because we guessed wrong
CREATE VIEW club_ranking AS
SELECT
    m.member_number,  -- Column doesn't exist
    m.first_name      -- Column doesn't exist
FROM members m;
```

### After (Working)
```sql
-- ✓ This works because we discovered first
CREATE VIEW club_ranking AS
SELECT
    m.id,
    m.name  -- We know this exists from discovery
FROM members m;
```

---

## Expected Time

- Discovery query: **30 seconds**
- Copy output: **1 minute**
- Create custom views: **5 minutes**
- Deploy and test: **2 minutes**

**Total: ~8 minutes to working views**

---

## Common Discovery Results

### Scenario 1: Basic Schema
```
members: id (uuid), name (text), email (text)
competitions: id (uuid), name (text), date (date)
results: id (uuid), member_id (uuid), competition_id (uuid), points (integer)
```
→ We'll create simple ranking views

### Scenario 2: Extended Schema
```
members: id, name, email, member_number, is_veteran
competitions: id, name, date, location, counts_for_club_ranking
results: id, member_id, competition_id, position, points, weight
```
→ We'll create full ranking views with filters

### Scenario 3: Split Name Schema
```
members: id, first_name, last_name, email
competitions: id, title (not "name"), event_date (not "date")
results: id, member_id, competition_id, rank (not "position")
```
→ We'll adapt to your exact column names

---

## Ready?

1. Open Supabase SQL Editor
2. Copy `database/inspect-actual-schema.sql`
3. Run it
4. Share the output

Then we'll create perfect views that actually work.

---

## File Locations

All files are in: `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\database\`

- `inspect-actual-schema.sql` - Run this first
- `minimal-safe-views.sql` - Basic fallback views
- `discover-and-deploy.sql` - Discovery + deployment combined
- `SCHEMA-DISCOVERY.md` - Detailed guide
- `QUICKSTART-DISCOVERY.md` - This file
