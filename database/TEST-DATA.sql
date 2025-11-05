-- =============================================================================
-- TEST DATA - Add sample data to test the views
-- =============================================================================
-- This adds realistic test data to verify that all views work correctly
-- Safe to run multiple times (uses INSERT ... ON CONFLICT DO NOTHING)
-- =============================================================================

-- =============================================================================
-- STEP 1: Add Test Members
-- =============================================================================

INSERT INTO members (id, user_id, name, member_number, is_veteran, is_active, joined_at)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Jan Janssen', 'M001', false, true, '2023-01-15'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 'Piet Pieters', 'M002', true, true, '2022-03-20'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 'Klaas De Vries', 'M003', false, true, '2023-06-10'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 'Marie Van Damme', 'M004', true, true, '2021-08-05'),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 'Tom Maes', 'M005', false, true, '2023-09-12')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 2: Add Test Competitions
-- =============================================================================

INSERT INTO competitions (name, date, location, type, counts_for_club_ranking, counts_for_veteran_ranking, status, registration_deadline, max_participants)
VALUES
    ('Voorjaarswedstrijd 2024', '2024-03-15', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2024-03-10', 30),
    ('Veteranentornooi 2024', '2024-04-20', 'Wedstrijdvijver SiM', 'veteran', false, true, 'completed', '2024-04-15', 20),
    ('Zomerwedstrijd 2024', '2024-06-10', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2024-06-05', 30),
    ('Herfstcompetitie 2024', '2024-09-25', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2024-09-20', 30),
    ('Eindejaarswedstrijd 2024', '2024-12-15', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2024-12-10', 30),
    ('Nieuwjaarswedstrijd 2025', '2025-01-20', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-01-15', 30),
    ('Veteranen Voorjaar 2025', '2025-03-15', 'Wedstrijdvijver SiM', 'veteran', false, true, 'completed', '2025-03-10', 20),
    ('Lentewedstrijd 2025', '2025-04-10', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-04-05', 30),
    ('Meiwedstrijd 2025', '2025-05-15', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-05-10', 30),
    ('Zomertornooi 2025', '2025-07-20', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-07-15', 30),
    ('Augustuswedstrijd 2025', '2025-08-25', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-08-20', 30),
    ('Septemberwedstrijd 2025', '2025-09-30', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-09-25', 30),
    ('Oktoberwedstrijd 2025', '2025-10-15', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-10-10', 30),
    ('Novemberwedstrijd 2025', '2025-11-20', 'Wedstrijdvijver SiM', 'club', true, false, 'completed', '2025-11-15', 30),
    -- Future competitions
    ('Kerstwedstrijd 2025', '2025-12-20', 'Wedstrijdvijver SiM', 'club', true, false, 'scheduled', '2025-12-15', 30),
    ('Nieuwjaarswedstrijd 2026', '2026-01-10', 'Wedstrijdvijver SiM', 'club', true, false, 'scheduled', '2026-01-05', 30)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 3: Add Test Results (For Club Ranking - needs 10+ competitions)
-- =============================================================================
-- Member 1: Jan Janssen (will be in top ranking)
INSERT INTO results (competition_id, member_id, position, points, weight_kg, fish_count, is_absent)
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 1, 1, 5.5, 3, false FROM competitions WHERE name = 'Voorjaarswedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 2, 2, 4.8, 2, false FROM competitions WHERE name = 'Zomerwedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 1, 1, 6.2, 4, false FROM competitions WHERE name = 'Herfstcompetitie 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 3, 3, 3.9, 2, false FROM competitions WHERE name = 'Eindejaarswedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 1, 1, 7.1, 5, false FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 2, 2, 5.3, 3, false FROM competitions WHERE name = 'Lentewedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 1, 1, 6.8, 4, false FROM competitions WHERE name = 'Meiwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 4, 4, 4.2, 2, false FROM competitions WHERE name = 'Zomertornooi 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 2, 2, 5.9, 3, false FROM competitions WHERE name = 'Augustuswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 1, 1, 6.5, 4, false FROM competitions WHERE name = 'Septemberwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 3, 3, 4.7, 2, false FROM competitions WHERE name = 'Oktoberwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 2, 2, 5.4, 3, false FROM competitions WHERE name = 'Novemberwedstrijd 2025'
ON CONFLICT DO NOTHING;

-- Member 2: Piet Pieters (veteran)
INSERT INTO results (competition_id, member_id, position, points, weight_kg, fish_count, is_absent)
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 1, 1, 8.2, 6, false FROM competitions WHERE name = 'Veteranentornooi 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 2, 2, 7.5, 5, false FROM competitions WHERE name = 'Veteranen Voorjaar 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 3, 3, 4.5, 3, false FROM competitions WHERE name = 'Zomerwedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 5, 5, 3.8, 2, false FROM competitions WHERE name = 'Herfstcompetitie 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 2, 2, 6.1, 4, false FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, 4, 4, 4.9, 3, false FROM competitions WHERE name = 'Lentewedstrijd 2025'
ON CONFLICT DO NOTHING;

-- Member 3: Klaas De Vries
INSERT INTO results (competition_id, member_id, position, points, weight_kg, fish_count, is_absent)
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 4, 4, 3.2, 2, false FROM competitions WHERE name = 'Voorjaarswedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 5, 5, 2.9, 1, false FROM competitions WHERE name = 'Zomerwedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 6, 6, 2.5, 1, false FROM competitions WHERE name = 'Herfstcompetitie 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 5, 5, 3.1, 2, false FROM competitions WHERE name = 'Eindejaarswedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 7, 7, 2.3, 1, false FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 4, 4, 3.5, 2, false FROM competitions WHERE name = 'Lentewedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 8, 8, 2.1, 1, false FROM competitions WHERE name = 'Meiwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 6, 6, 2.8, 2, false FROM competitions WHERE name = 'Zomertornooi 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 5, 5, 3.2, 2, false FROM competitions WHERE name = 'Augustuswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 7, 7, 2.6, 1, false FROM competitions WHERE name = 'Septemberwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 6, 6, 2.9, 2, false FROM competitions WHERE name = 'Oktoberwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, 5, 5, 3.3, 2, false FROM competitions WHERE name = 'Novemberwedstrijd 2025'
ON CONFLICT DO NOTHING;

-- Member 4: Marie Van Damme (veteran)
INSERT INTO results (competition_id, member_id, position, points, weight_kg, fish_count, is_absent)
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 3, 3, 6.8, 4, false FROM competitions WHERE name = 'Veteranentornooi 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 1, 1, 7.9, 5, false FROM competitions WHERE name = 'Veteranen Voorjaar 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 2, 2, 5.2, 3, false FROM competitions WHERE name = 'Voorjaarswedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 3, 3, 4.7, 3, false FROM competitions WHERE name = 'Zomerwedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 4, 4, 4.1, 2, false FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, 3, 3, 4.8, 3, false FROM competitions WHERE name = 'Lentewedstrijd 2025'
ON CONFLICT DO NOTHING;

-- Member 5: Tom Maes
INSERT INTO results (competition_id, member_id, position, points, weight_kg, fish_count, is_absent)
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 10, 10, 1.5, 1, false FROM competitions WHERE name = 'Zomerwedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 0, 43, 0, 0, false FROM competitions WHERE name = 'Herfstcompetitie 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 12, 12, 1.2, 1, false FROM competitions WHERE name = 'Eindejaarswedstrijd 2024'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 11, 11, 1.4, 1, false FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 9, 9, 1.8, 1, false FROM competitions WHERE name = 'Lentewedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 10, 10, 1.6, 1, false FROM competitions WHERE name = 'Meiwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 13, 13, 1.1, 1, false FROM competitions WHERE name = 'Zomertornooi 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 11, 11, 1.5, 1, false FROM competitions WHERE name = 'Augustuswedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 12, 12, 1.3, 1, false FROM competitions WHERE name = 'Septemberwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 10, 10, 1.7, 1, false FROM competitions WHERE name = 'Oktoberwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid, 14, 14, 0.9, 1, false FROM competitions WHERE name = 'Novemberwedstrijd 2025'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 4: Add Test Registrations
-- =============================================================================
INSERT INTO registrations (competition_id, member_id, registration_date, status, payment_status)
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, '2025-12-10', 'confirmed', 'paid' FROM competitions WHERE name = 'Kerstwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid, '2025-12-11', 'confirmed', 'paid' FROM competitions WHERE name = 'Kerstwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid, '2025-12-12', 'pending', 'pending' FROM competitions WHERE name = 'Kerstwedstrijd 2025'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, '2026-01-02', 'confirmed', 'paid' FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2026'
UNION ALL
SELECT id, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid, '2026-01-03', 'confirmed', 'paid' FROM competitions WHERE name = 'Nieuwjaarswedstrijd 2026'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
DECLARE
    member_count INTEGER;
    comp_count INTEGER;
    result_count INTEGER;
    reg_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO member_count FROM members;
    SELECT COUNT(*) INTO comp_count FROM competitions;
    SELECT COUNT(*) INTO result_count FROM results;
    SELECT COUNT(*) INTO reg_count FROM registrations;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ TEST DATA ADDED SUCCESSFULLY!';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Database now contains:';
    RAISE NOTICE '  👤 % members', member_count;
    RAISE NOTICE '  🏆 % competitions', comp_count;
    RAISE NOTICE '  📊 % results', result_count;
    RAISE NOTICE '  📝 % registrations', reg_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Now test the views with:';
    RAISE NOTICE '';
    RAISE NOTICE '  SELECT * FROM club_ranking;';
    RAISE NOTICE '  SELECT * FROM veteran_ranking;';
    RAISE NOTICE '  SELECT * FROM recent_results;';
    RAISE NOTICE '  SELECT * FROM upcoming_competitions;';
    RAISE NOTICE '  SELECT * FROM member_statistics;';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
