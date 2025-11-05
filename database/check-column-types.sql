-- Check column types in all tables
SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('members', 'competitions', 'results', 'registrations')
  AND column_name IN ('id', 'member_id', 'competition_id')
ORDER BY table_name, column_name;
