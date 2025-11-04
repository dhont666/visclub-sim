/**
 * Verify Database Schema
 * Checks if all required tables and views exist in Supabase
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function verifySchema() {
    console.log('🔍 Verifying Supabase Database Schema...\n');

    const requiredTables = [
        'admin_users',
        'members',
        'competitions',
        'registrations',
        'results',
        'permits',
        'contact_messages'
    ];

    const requiredViews = [
        'club_ranking',
        'veteran_ranking',
        'recent_results',
        'upcoming_competitions',
        'member_statistics'
    ];

    let allGood = true;

    // Check tables
    console.log('📋 Checking Tables:');
    for (const table of requiredTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error && error.code !== 'PGRST116') {
                console.log(`   ❌ ${table}: ${error.message}`);
                allGood = false;
            } else {
                const count = await getTableCount(table);
                console.log(`   ✅ ${table} (${count} rows)`);
            }
        } catch (err) {
            console.log(`   ❌ ${table}: ${err.message}`);
            allGood = false;
        }
    }

    // Check views
    console.log('\n📊 Checking Views:');
    for (const view of requiredViews) {
        try {
            const { data, error } = await supabase
                .from(view)
                .select('*')
                .limit(1);

            if (error && error.code !== 'PGRST116') {
                console.log(`   ❌ ${view}: ${error.message}`);
                allGood = false;
            } else {
                console.log(`   ✅ ${view}`);
            }
        } catch (err) {
            console.log(`   ❌ ${view}: ${err.message}`);
            allGood = false;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (allGood) {
        console.log('✅ Database schema is complete and ready!');
        console.log('\n🚀 You can now start the server with: npm start');
    } else {
        console.log('⚠️  Some tables/views are missing or have errors');
        console.log('\n📝 Next steps:');
        console.log('   1. Go to Supabase Dashboard → SQL Editor');
        console.log('   2. Run database/schema.sql (if tables are missing)');
        console.log('   3. Run database/rls-policies.sql (for security)');
        console.log('   4. Run this script again to verify');
    }
    console.log('='.repeat(50));
}

async function getTableCount(table) {
    try {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        return error ? '?' : count || 0;
    } catch {
        return '?';
    }
}

verifySchema().catch(err => {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
});
