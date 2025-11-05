-- =====================================================
-- SUPABASE SCHEMA DISCOVERY
-- =====================================================
-- Run this in Supabase SQL Editor to discover ACTUAL columns
-- Copy the entire output and share it back
-- =====================================================

-- 1. DISCOVER ALL TABLES
-- =====================================================
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 2. DISCOVER MEMBERS TABLE COLUMNS
-- =====================================================
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'members'
ORDER BY ordinal_position;

-- =====================================================
-- 3. DISCOVER COMPETITIONS TABLE COLUMNS
-- =====================================================
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'competitions'
ORDER BY ordinal_position;

-- =====================================================
-- 4. DISCOVER RESULTS TABLE COLUMNS
-- =====================================================
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'results'
ORDER BY ordinal_position;

-- =====================================================
-- 5. DISCOVER REGISTRATIONS TABLE COLUMNS
-- =====================================================
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'registrations'
ORDER BY ordinal_position;

-- =====================================================
-- 6. DISCOVER ANY OTHER TABLES WE MIGHT HAVE MISSED
-- =====================================================
SELECT
    t.table_name,
    COUNT(c.column_name) as column_count,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
    ON t.table_name = c.table_name
    AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- =====================================================
-- 7. DISCOVER EXISTING VIEWS
-- =====================================================
SELECT
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 8. DISCOVER FOREIGN KEY RELATIONSHIPS
-- =====================================================
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 9. SAMPLE DATA FROM EACH TABLE (to understand structure)
-- =====================================================

-- Members sample (first 2 rows, all columns)
SELECT * FROM members LIMIT 2;

-- Competitions sample (first 2 rows, all columns)
SELECT * FROM competitions LIMIT 2;

-- Results sample (first 2 rows, all columns)
SELECT * FROM results LIMIT 2;

-- Registrations sample (first 2 rows, all columns)
SELECT * FROM registrations LIMIT 2;

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. Copy this entire SQL file
-- 2. Paste into Supabase SQL Editor
-- 3. Run it
-- 4. Copy ALL the output (every table result)
-- 5. Share it back so we can see EXACTLY what exists
-- =====================================================
