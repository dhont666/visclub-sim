-- =============================================================================
-- SCHEMA FIX - OPTION A: Change results.member_id to UUID
-- =============================================================================
-- This fixes the type mismatch between members.id (UUID) and results.member_id (INTEGER)
-- After this, you can properly join members and results tables
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- Backup recommendation: Export results table first (just in case)
-- =============================================================================

-- =============================================================================
-- STEP 1: Check current state
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '🔍 SCHEMA FIX - OPTION A';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'About to change results.member_id from INTEGER to UUID';
    RAISE NOTICE '';

    -- Check if results table has data
    DECLARE
        row_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO row_count FROM results;
        RAISE NOTICE 'Current results table has % rows', row_count;

        IF row_count > 0 THEN
            RAISE NOTICE '⚠️  WARNING: Table has data - migration will attempt conversion';
        ELSE
            RAISE NOTICE '✅ Table is empty - safe to change type';
        END IF;
    END;

    RAISE NOTICE '';
    RAISE NOTICE 'Starting schema changes...';
    RAISE NOTICE '';
END $$;

-- =============================================================================
-- STEP 2: Drop foreign key constraint (if exists)
-- =============================================================================
DO $$
BEGIN
    -- Try to drop the constraint, ignore if it doesn't exist
    BEGIN
        ALTER TABLE results DROP CONSTRAINT IF EXISTS results_member_id_fkey;
        RAISE NOTICE '✅ Dropped foreign key constraint (if existed)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  No foreign key to drop (this is OK)';
    END;
END $$;

-- =============================================================================
-- STEP 3: Change member_id column type to UUID
-- =============================================================================
DO $$
BEGIN
    -- Attempt to change the column type
    BEGIN
        ALTER TABLE results
        ALTER COLUMN member_id TYPE uuid
        USING member_id::text::uuid;

        RAISE NOTICE '✅ Changed results.member_id from INTEGER to UUID';
    EXCEPTION
        WHEN invalid_text_representation THEN
            RAISE NOTICE '❌ ERROR: Cannot convert existing member_id values to UUID';
            RAISE NOTICE 'This means you have integer IDs that are not valid UUIDs';
            RAISE NOTICE 'Solution: Clear results table first with: DELETE FROM results;';
            RAISE EXCEPTION 'Migration failed - see messages above';
        WHEN OTHERS THEN
            RAISE NOTICE '❌ ERROR: %', SQLERRM;
            RAISE EXCEPTION 'Migration failed';
    END;
END $$;

-- =============================================================================
-- STEP 4: Create foreign key constraint
-- =============================================================================
DO $$
BEGIN
    BEGIN
        ALTER TABLE results
        ADD CONSTRAINT results_member_id_fkey
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

        RAISE NOTICE '✅ Created foreign key constraint';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Could not create foreign key: %', SQLERRM;
        RAISE NOTICE 'This might be OK if you want to add it manually later';
    END;
END $$;

-- =============================================================================
-- STEP 5: Do the same for registrations.member_id
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking registrations table...';

    -- Check if member_id column exists in registrations
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registrations'
        AND column_name = 'member_id'
    ) THEN
        RAISE NOTICE 'Found registrations.member_id - changing to UUID...';

        -- Drop constraint
        BEGIN
            ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_member_id_fkey;
            RAISE NOTICE '✅ Dropped registrations foreign key';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️  No foreign key to drop';
        END;

        -- Change type
        BEGIN
            ALTER TABLE registrations
            ALTER COLUMN member_id TYPE uuid
            USING member_id::text::uuid;

            RAISE NOTICE '✅ Changed registrations.member_id to UUID';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Could not change registrations.member_id: %', SQLERRM;
        END;

        -- Add constraint
        BEGIN
            ALTER TABLE registrations
            ADD CONSTRAINT registrations_member_id_fkey
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

            RAISE NOTICE '✅ Created registrations foreign key';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not create foreign key: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '⚠️  registrations.member_id column does not exist';
    END IF;
END $$;

-- =============================================================================
-- STEP 6: Add name column to members table
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Adding name column to members table...';

    -- Check if name column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'name'
    ) THEN
        ALTER TABLE members ADD COLUMN name VARCHAR(255);
        RAISE NOTICE '✅ Added members.name column';
    ELSE
        RAISE NOTICE '✅ members.name already exists';
    END IF;

    -- Add member_number column if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'member_number'
    ) THEN
        ALTER TABLE members ADD COLUMN member_number VARCHAR(20) UNIQUE;
        RAISE NOTICE '✅ Added members.member_number column';
    ELSE
        RAISE NOTICE '✅ members.member_number already exists';
    END IF;

    -- Add is_veteran column if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members'
        AND column_name = 'is_veteran'
    ) THEN
        ALTER TABLE members ADD COLUMN is_veteran BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added members.is_veteran column';
    ELSE
        RAISE NOTICE '✅ members.is_veteran already exists';
    END IF;
END $$;

-- =============================================================================
-- STEP 7: Verify the changes
-- =============================================================================
DO $$
DECLARE
    member_id_type TEXT;
    results_member_id_type TEXT;
    registrations_member_id_type TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ VERIFICATION';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';

    -- Get data types
    SELECT data_type INTO member_id_type
    FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'id';

    SELECT data_type INTO results_member_id_type
    FROM information_schema.columns
    WHERE table_name = 'results' AND column_name = 'member_id';

    SELECT data_type INTO registrations_member_id_type
    FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'member_id';

    RAISE NOTICE 'members.id type: %', member_id_type;
    RAISE NOTICE 'results.member_id type: %', results_member_id_type;
    RAISE NOTICE 'registrations.member_id type: %', COALESCE(registrations_member_id_type, 'N/A');
    RAISE NOTICE '';

    -- Check if types match
    IF member_id_type = results_member_id_type THEN
        RAISE NOTICE '✅ SUCCESS! Types now match!';
        RAISE NOTICE '';
        RAISE NOTICE 'You can now:';
        RAISE NOTICE '1. Join members and results tables';
        RAISE NOTICE '2. Deploy full database views with member names';
        RAISE NOTICE '3. Create rankings with proper member information';
        RAISE NOTICE '';
        RAISE NOTICE 'Next step: Run DEPLOY-VIEWS-FINAL.sql';
    ELSE
        RAISE NOTICE '❌ Types still do not match!';
        RAISE NOTICE 'Please review the error messages above';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;

-- =============================================================================
-- ALTERNATIVE: If the above fails because of existing data
-- =============================================================================
-- If you see errors about invalid UUID conversion, run this first:
--
-- DELETE FROM results;  -- This clears all results data
--
-- Then run this entire script again.
-- =============================================================================
