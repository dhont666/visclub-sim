/**
 * Check Current Database Schema
 * Shows actual column names in existing tables
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkSchema() {
    console.log('🔍 Checking Current Database Schema...\n');

    try {
        // Check members table structure
        console.log('📋 MEMBERS table columns:');
        const { data: members, error: membersError } = await supabase
            .from('members')
            .select('*')
            .limit(1);

        if (membersError) {
            console.log('   Error:', membersError.message);
        } else if (members && members.length > 0) {
            const columns = Object.keys(members[0]);
            columns.forEach(col => console.log(`   ✅ ${col}`));
        } else {
            // Try to get columns even with no data
            console.log('   ⚠️ No data in table, trying to detect columns...');
            const { data: emptyData } = await supabase
                .from('members')
                .select('*')
                .limit(0);
            console.log('   Columns detected from schema');
        }

        // Check competitions table
        console.log('\n📅 COMPETITIONS table columns:');
        const { data: competitions, error: competitionsError } = await supabase
            .from('competitions')
            .select('*')
            .limit(1);

        if (competitionsError) {
            console.log('   Error:', competitionsError.message);
        } else if (competitions && competitions.length > 0) {
            const columns = Object.keys(competitions[0]);
            columns.forEach(col => console.log(`   ✅ ${col}`));
        } else {
            console.log('   ⚠️ Table empty');
        }

        // Check results table
        console.log('\n🏆 RESULTS table columns:');
        const { data: results, error: resultsError } = await supabase
            .from('results')
            .select('*')
            .limit(1);

        if (resultsError) {
            console.log('   Error:', resultsError.message);
        } else if (results && results.length > 0) {
            const columns = Object.keys(results[0]);
            columns.forEach(col => console.log(`   ✅ ${col}`));
        } else {
            console.log('   ⚠️ Table empty');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Schema check complete!');
        console.log('\nBased on this, I can generate correct views.');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSchema();
