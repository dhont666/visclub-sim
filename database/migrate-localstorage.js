/**
 * LocalStorage to Supabase Migration Script
 *
 * This script migrates data from browser localStorage to Supabase database.
 *
 * USAGE:
 * 1. Export localStorage data from admin panel (admin-script.js has downloadAllData())
 * 2. Save the JSON file as 'backup-data.json' in this directory
 * 3. Configure .env with SUPABASE_URL and SUPABASE_SERVICE_KEY
 * 4. Run: node database/migrate-localstorage.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// =============================================
// CONFIGURATION
// =============================================

const BACKUP_FILE = path.join(__dirname, 'backup-data.json');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// =============================================
// HELPER FUNCTIONS
// =============================================

async function checkConnection() {
    console.log('🔌 Checking Supabase connection...');
    const { data, error } = await supabase
        .from('members')
        .select('id')
        .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned (OK)
        console.error('❌ Connection failed:', error.message);
        return false;
    }

    console.log('✅ Connected to Supabase');
    return true;
}

function loadBackupData() {
    console.log(`📂 Loading backup data from ${BACKUP_FILE}...`);

    if (!fs.existsSync(BACKUP_FILE)) {
        console.error(`❌ Error: Backup file not found: ${BACKUP_FILE}`);
        console.log('\n📝 To export localStorage data:');
        console.log('   1. Open admin panel in browser');
        console.log('   2. Open browser console (F12)');
        console.log('   3. Run: window.downloadAllData()');
        console.log('   4. Save the downloaded JSON file as database/backup-data.json');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    console.log('✅ Backup data loaded');

    return data;
}

// =============================================
// MIGRATION FUNCTIONS
// =============================================

async function migrateMembers(members) {
    if (!members || members.length === 0) {
        console.log('⏭️  No members to migrate');
        return;
    }

    console.log(`\n👥 Migrating ${members.length} members...`);

    let success = 0;
    let failed = 0;

    for (const member of members) {
        try {
            // Transform localStorage format to database format
            const dbMember = {
                member_number: member.memberNumber || member.id,
                first_name: member.firstName || member.name?.split(' ')[0] || 'Unknown',
                last_name: member.lastName || member.name?.split(' ').slice(1).join(' ') || 'Unknown',
                email: member.email,
                phone: member.phone,
                address: member.address,
                postal_code: member.postalCode,
                city: member.city,
                birth_date: member.birthDate,
                is_veteran: member.isVeteran || false,
                is_active: member.status === 'active' || member.isActive !== false,
                join_date: member.joinedAt || member.joinDate,
                notes: member.notes
            };

            const { error } = await supabase
                .from('members')
                .upsert(dbMember, {
                    onConflict: 'member_number'
                });

            if (error) throw error;

            success++;
            process.stdout.write(`✓`);
        } catch (error) {
            failed++;
            console.error(`\n❌ Failed to migrate member ${member.memberNumber || member.id}:`, error.message);
        }
    }

    console.log(`\n✅ Members: ${success} succeeded, ${failed} failed`);
}

async function migrateRegistrations(registrations) {
    if (!registrations || registrations.length === 0) {
        console.log('⏭️  No registrations to migrate');
        return;
    }

    console.log(`\n📋 Migrating ${registrations.length} registrations...`);

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const reg of registrations) {
        try {
            // Find member by email or name
            const { data: member } = await supabase
                .from('members')
                .select('id')
                .or(`email.eq.${reg.email},first_name.eq.${reg.name?.split(' ')[0]}`)
                .limit(1)
                .single();

            if (!member) {
                console.log(`\n⚠️  Member not found for registration: ${reg.name || reg.email}`);
                skipped++;
                continue;
            }

            // Find or create competition
            // Note: You may need to adjust this based on your competition data structure
            const competitionDate = reg.competition || reg.date || reg.wedstrijd;

            const { data: competition } = await supabase
                .from('competitions')
                .select('id')
                .eq('date', competitionDate)
                .limit(1)
                .single();

            if (!competition) {
                console.log(`\n⚠️  Competition not found for date: ${competitionDate}`);
                skipped++;
                continue;
            }

            const dbRegistration = {
                member_id: member.id,
                competition_id: competition.id,
                registration_date: reg.timestamp || reg.registrationDate || new Date().toISOString(),
                status: reg.status === 'betaald' ? 'confirmed' : 'pending',
                payment_status: reg.paymentStatus || (reg.status === 'betaald' ? 'paid' : 'unpaid'),
                payment_date: reg.paymentDate,
                payment_method: reg.paymentMethod,
                notes: reg.notes
            };

            const { error } = await supabase
                .from('registrations')
                .upsert(dbRegistration, {
                    onConflict: 'competition_id,member_id'
                });

            if (error) throw error;

            success++;
            process.stdout.write(`✓`);
        } catch (error) {
            failed++;
            console.error(`\n❌ Failed to migrate registration:`, error.message);
        }
    }

    console.log(`\n✅ Registrations: ${success} succeeded, ${failed} failed, ${skipped} skipped`);
}

async function migratePermits(permits) {
    if (!permits || permits.length === 0) {
        console.log('⏭️  No permits to migrate');
        return;
    }

    console.log(`\n📄 Migrating ${permits.length} permits...`);

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const permit of permits) {
        try {
            // Find member by email or name
            const { data: member } = await supabase
                .from('members')
                .select('id')
                .or(`email.eq.${permit.email},first_name.eq.${permit.name?.split(' ')[0]}`)
                .limit(1)
                .single();

            if (!member) {
                console.log(`\n⚠️  Member not found for permit: ${permit.name || permit.email}`);
                skipped++;
                continue;
            }

            const dbPermit = {
                member_id: member.id,
                application_date: permit.timestamp || permit.applicationDate || new Date().toISOString(),
                permit_type: permit.type || permit.vergunningType || 'annual',
                start_date: permit.startDate,
                end_date: permit.endDate,
                status: permit.status || 'pending',
                fee_amount: permit.amount || permit.bedrag,
                payment_status: permit.paymentStatus || 'unpaid',
                payment_date: permit.paymentDate,
                notes: permit.opmerkingen || permit.notes
            };

            const { error } = await supabase
                .from('permits')
                .insert(dbPermit);

            if (error) throw error;

            success++;
            process.stdout.write(`✓`);
        } catch (error) {
            failed++;
            console.error(`\n❌ Failed to migrate permit:`, error.message);
        }
    }

    console.log(`\n✅ Permits: ${success} succeeded, ${failed} failed, ${skipped} skipped`);
}

async function migrateContactMessages(messages) {
    if (!messages || messages.length === 0) {
        console.log('⏭️  No contact messages to migrate');
        return;
    }

    console.log(`\n📧 Migrating ${messages.length} contact messages...`);

    let success = 0;
    let failed = 0;

    for (const msg of messages) {
        try {
            const dbMessage = {
                name: msg.name,
                email: msg.email,
                phone: msg.phone || msg.telefoon,
                subject: msg.subject || msg.onderwerp,
                message: msg.message || msg.bericht,
                status: msg.status || 'new',
                created_at: msg.timestamp || msg.date || new Date().toISOString()
            };

            const { error } = await supabase
                .from('contact_messages')
                .insert(dbMessage);

            if (error) throw error;

            success++;
            process.stdout.write(`✓`);
        } catch (error) {
            failed++;
            console.error(`\n❌ Failed to migrate contact message:`, error.message);
        }
    }

    console.log(`\n✅ Contact messages: ${success} succeeded, ${failed} failed`);
}

// =============================================
// MAIN MIGRATION FUNCTION
// =============================================

async function migrate() {
    console.log('🚀 Starting LocalStorage to Supabase Migration\n');
    console.log('='.repeat(60));

    // Step 1: Check connection
    const connected = await checkConnection();
    if (!connected) {
        process.exit(1);
    }

    // Step 2: Load backup data
    const backupData = loadBackupData();

    console.log('\n📊 Backup Data Summary:');
    console.log(`   Members: ${backupData.members?.length || 0}`);
    console.log(`   Registrations: ${backupData.registrations?.length || 0}`);
    console.log(`   Permits: ${backupData.permits?.length || 0}`);
    console.log(`   Contact Messages: ${backupData.contactMessages?.length || 0}`);

    // Step 3: Confirm migration
    console.log('\n⚠️  This will insert data into your Supabase database.');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Starting migration...\n');
    console.log('='.repeat(60));

    // Step 4: Migrate data
    await migrateMembers(backupData.members);
    await migrateRegistrations(backupData.registrations);
    await migratePermits(backupData.permits);
    await migrateContactMessages(backupData.contactMessages);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed!\n');
}

// =============================================
// RUN MIGRATION
// =============================================

migrate().catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
});
