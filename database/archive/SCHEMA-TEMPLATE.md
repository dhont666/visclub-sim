# Schema Discovery Template

Fill this out based on the output from `inspect-actual-schema.sql`

---

## Discovery Date
**Date**: _______________

---

## Members Table

### Columns Found
```
Column Name          | Data Type | Nullable | Default
---------------------|-----------|----------|----------
id                   | uuid      | NO       |
created_at           | timestamp | NO       | now()
updated_at           | timestamp | NO       | now()
[ADD ROWS BELOW]
```

### Key Questions
- [ ] Name format: Single `name` column OR split `first_name`/`last_name`?
- [ ] Has `member_number`? YES / NO
- [ ] Has `is_active`? YES / NO
- [ ] Has `is_veteran`? YES / NO
- [ ] Has `email`? YES / NO
- [ ] Has `phone`? YES / NO
- [ ] ID column type: uuid / integer / bigint / text

---

## Competitions Table

### Columns Found
```
Column Name                  | Data Type | Nullable | Default
-----------------------------|-----------|----------|----------
id                           | uuid      | NO       |
created_at                   | timestamp | NO       | now()
updated_at                   | timestamp | NO       | now()
[ADD ROWS BELOW]
```

### Key Questions
- [ ] Has `name`? YES / NO
- [ ] Has `date`? YES / NO (data type: ________)
- [ ] Has `location`? YES / NO
- [ ] Has `type`? YES / NO
- [ ] Has `status`? YES / NO
- [ ] Has `counts_for_club_ranking`? YES / NO
- [ ] Has `counts_for_veteran_ranking`? YES / NO
- [ ] ID column type: uuid / integer / bigint / text

---

## Results Table

### Columns Found
```
Column Name          | Data Type | Nullable | Default
---------------------|-----------|----------|----------
id                   | uuid      | NO       |
created_at           | timestamp | NO       | now()
updated_at           | timestamp | NO       | now()
member_id            | uuid      | NO       |
competition_id       | uuid      | NO       |
[ADD ROWS BELOW]
```

### Key Questions
- [ ] Has `position`? YES / NO (data type: ________)
- [ ] Has `points`? YES / NO (data type: ________)
- [ ] Has `weight`? YES / NO (data type: ________)
- [ ] Has `species`? YES / NO
- [ ] Foreign key `member_id` type: uuid / integer / bigint / text
- [ ] Foreign key `competition_id` type: uuid / integer / bigint / text

---

## Registrations Table

### Exists?
- [ ] YES - Fill out columns below
- [ ] NO - Skip this section

### Columns Found
```
Column Name          | Data Type | Nullable | Default
---------------------|-----------|----------|----------
[ADD ROWS]
```

---

## Foreign Key Relationships

```
Table           | Column          | References Table | References Column
----------------|-----------------|------------------|------------------
results         | member_id       | members          | id
results         | competition_id  | competitions     | id
[ADD MORE IF FOUND]
```

---

## Sample Data Preview

### Members (first 2 rows)
```
[PASTE SAMPLE DATA HERE]
```

### Competitions (first 2 rows)
```
[PASTE SAMPLE DATA HERE]
```

### Results (first 2 rows)
```
[PASTE SAMPLE DATA HERE]
```

---

## Data Type Summary

### ID Column Types
- Members.id: ____________
- Competitions.id: ____________
- Results.id: ____________
- Results.member_id: ____________
- Results.competition_id: ____________

### Join Compatibility
All ID columns use the same type? YES / NO

If NO, we'll need explicit casting in joins:
```sql
-- Example if members.id is uuid and results.member_id is text:
m.id::text = r.member_id

-- Example if both are uuid:
m.id = r.member_id
```

---

## Ranking Requirements

### Club Ranking
Can we create it? Check these:
- [ ] results.points exists
- [ ] results.member_id exists
- [ ] competitions has filtering column (counts_for_club_ranking or type)
- [ ] members.name or first_name/last_name exists

### Veteran Ranking
Can we create it? Check these:
- [ ] results.points exists
- [ ] results.member_id exists
- [ ] members.is_veteran exists OR another way to identify veterans
- [ ] competitions has filtering column (counts_for_veteran_ranking)

---

## Notes and Observations

```
[ADD ANY NOTES ABOUT THE SCHEMA HERE]

Examples:
- Date columns use timestamp with timezone
- All IDs are UUIDs with default gen_random_uuid()
- No soft deletes (no deleted_at column)
- Name is stored as single column, not split
- No member numbers assigned yet
- Competitions don't have status tracking
```

---

## Recommended View Approach

Based on discoveries above:

- [ ] **Minimal views** (only id, created_at, updated_at)
- [ ] **Basic views** (includes names, dates, but no rankings)
- [ ] **Standard views** (includes rankings with simple logic)
- [ ] **Full views** (includes rankings, filters, veteran support)

---

## Next Steps

1. Share this completed template
2. We'll create SQL for the recommended view approach
3. Deploy and test views
4. Iterate if needed
