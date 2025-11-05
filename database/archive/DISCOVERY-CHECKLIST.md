# Schema Discovery Checklist

Use this checklist to discover your schema in under 5 minutes.

---

## Pre-Flight Check

- [ ] Supabase project is accessible
- [ ] SQL Editor is open
- [ ] Ready to copy/paste

---

## Step 1: Run Discovery Query

- [ ] Open file: `database/inspect-actual-schema.sql`
- [ ] Copy entire file contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button
- [ ] Wait for results to load (~10 seconds)

---

## Step 2: Document Members Table

From the "MEMBERS TABLE COLUMNS" result:

- [ ] ID column type: uuid / integer / bigint ___________
- [ ] Has `name` column: YES / NO
- [ ] Has `first_name` and `last_name`: YES / NO
- [ ] Has `member_number`: YES / NO
- [ ] Has `email`: YES / NO
- [ ] Has `phone`: YES / NO
- [ ] Has `is_active`: YES / NO
- [ ] Has `is_veteran`: YES / NO

---

## Step 3: Document Competitions Table

From the "COMPETITIONS TABLE COLUMNS" result:

- [ ] ID column type: uuid / integer / bigint ___________
- [ ] Has `name` column: YES / NO
- [ ] Has `date` column: YES / NO
- [ ] Date type: date / timestamp / timestamptz ___________
- [ ] Has `location`: YES / NO
- [ ] Has `type`: YES / NO
- [ ] Has `status`: YES / NO
- [ ] Has `counts_for_club_ranking`: YES / NO
- [ ] Has `counts_for_veteran_ranking`: YES / NO

---

## Step 4: Document Results Table

From the "RESULTS TABLE COLUMNS" result:

- [ ] ID column type: uuid / integer / bigint ___________
- [ ] Has `member_id`: YES / NO
- [ ] `member_id` type: uuid / integer / bigint ___________
- [ ] Has `competition_id`: YES / NO
- [ ] `competition_id` type: uuid / integer / bigint ___________
- [ ] Has `position`: YES / NO
- [ ] Has `points`: YES / NO
- [ ] Has `weight`: YES / NO
- [ ] Has `species`: YES / NO

---

## Step 5: Check Foreign Keys

From the "FOREIGN KEY RELATIONSHIPS" result:

- [ ] results.member_id → members.id: CONFIRMED
- [ ] results.competition_id → competitions.id: CONFIRMED
- [ ] Any other foreign keys: ___________________________

---

## Step 6: Verify Join Compatibility

Check if we need type casting:

- [ ] All ID columns same type: YES / NO
- [ ] If NO, we'll need: `::text` casting / `::uuid` casting

---

## Step 7: Determine View Complexity

Based on findings above, mark which view level you can support:

- [ ] **Level 1**: Ultra-minimal (id, created_at, updated_at only)
- [ ] **Level 2**: Basic (adds name, date, but no rankings)
- [ ] **Level 3**: Standard (adds rankings with basic logic)
- [ ] **Level 4**: Full (rankings, filters, veteran support)

### Requirements for Each Level

**Level 1**: No requirements (always possible)

**Level 2**: Requires
- [ ] members.name (or first_name/last_name)
- [ ] competitions.name
- [ ] competitions.date

**Level 3**: Requires everything from Level 2 plus
- [ ] results.points
- [ ] results.position

**Level 4**: Requires everything from Level 3 plus
- [ ] members.is_veteran OR way to identify veterans
- [ ] competitions.counts_for_club_ranking OR similar filter
- [ ] competitions.counts_for_veteran_ranking OR similar filter

---

## Step 8: Deploy Appropriate Views

Based on level determined above:

### For Level 1 (Ultra-Minimal)
- [ ] Copy `database/minimal-safe-views.sql`
- [ ] Paste into Supabase SQL Editor
- [ ] Run
- [ ] Verify with: `SELECT * FROM member_stats LIMIT 5;`

### For Level 2-4 (Enhanced)
- [ ] Share completed checklist
- [ ] Request custom view SQL
- [ ] Deploy custom views
- [ ] Test with sample queries

---

## Step 9: Verification

Run these queries to verify views work:

```sql
-- Check views were created
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

- [ ] Views listed: _________________________________

```sql
-- Test member_stats view
SELECT * FROM member_stats LIMIT 5;
```

- [ ] Returns data without errors: YES / NO

```sql
-- Test competition_summary view
SELECT * FROM competition_summary LIMIT 5;
```

- [ ] Returns data without errors: YES / NO

```sql
-- Test recent_results view
SELECT * FROM recent_results LIMIT 5;
```

- [ ] Returns data without errors: YES / NO

---

## Step 10: Document and Share

- [ ] Copy discovery output to text file
- [ ] Save as: `schema-discovered-YYYY-MM-DD.txt`
- [ ] Note which views were deployed
- [ ] Note any errors encountered

---

## Common Issues

### Issue: "column does not exist"
- [ ] Re-check column name spelling
- [ ] Verify column exists in discovery output
- [ ] Check if column is in different table

### Issue: "operator does not exist"
- [ ] Check ID column types match
- [ ] Add `::text` casting if types differ
- [ ] Example: `m.id::text = r.member_id::text`

### Issue: "function does not exist"
- [ ] Check you're using function on correct type
- [ ] AVG/SUM only work on numeric columns
- [ ] Use COUNT for non-numeric columns

---

## Success Criteria

All of these should be true:

- [ ] Discovery query ran without errors
- [ ] All table structures documented
- [ ] Foreign keys confirmed
- [ ] At least Level 1 views deployed
- [ ] All deployed views return data
- [ ] No errors when querying views

---

## Time Tracking

- Discovery query run: __________ (should be <1 min)
- Documentation completed: __________ (should be <3 min)
- Views deployed: __________ (should be <2 min)
- Verification completed: __________ (should be <1 min)

**Total time**: __________ (target: <7 minutes)

---

## Next Actions

After completing checklist:

- [ ] If Level 1 deployed: Request Level 2+ views
- [ ] If Level 2+ deployed: Test with actual queries
- [ ] Create TypeScript types from schema
- [ ] Plan RLS policies based on schema
- [ ] Document schema for team

---

## Notes

```
[Add any observations or issues here]





```

---

## Completion

- [ ] Checklist 100% complete
- [ ] Views working in Supabase
- [ ] Ready for application integration

**Completed by**: _______________
**Date**: _______________
**Time taken**: _______________
