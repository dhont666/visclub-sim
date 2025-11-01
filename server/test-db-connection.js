/**
 * Database Connection Tester
 * Tests and validates DATABASE_URL before deployment
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
    console.log('🔍 Testing Database Connection...\n');

    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
        console.error('❌ ERROR: DATABASE_URL not found in environment variables');
        console.error('   Make sure you have a .env file with DATABASE_URL set\n');
        process.exit(1);
    }

    // Parse DATABASE_URL (safely hide password)
    let urlInfo;
    try {
        const url = new URL(process.env.DATABASE_URL);
        urlInfo = {
            protocol: url.protocol,
            username: url.username,
            password: url.password ? '***hidden***' : 'MISSING',
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search
        };

        console.log('📋 Connection String Info:');
        console.log('   Protocol:', urlInfo.protocol);
        console.log('   Username:', urlInfo.username);
        console.log('   Password:', urlInfo.password);
        console.log('   Hostname:', urlInfo.hostname);
        console.log('   Port:    ', urlInfo.port);
        console.log('   Database:', urlInfo.pathname);
        console.log('   Options: ', urlInfo.search || 'none');
        console.log('');

        // Validate common issues
        const issues = [];

        // Check username format for pooler
        if (urlInfo.port === '6543') {
            if (!urlInfo.username.includes('.')) {
                issues.push({
                    level: 'ERROR',
                    message: `Username "${urlInfo.username}" is incorrect for Transaction pooler (port 6543)`,
                    fix: 'Username should be: postgres.pvdebaqcqlkhibnxnwpf (not just "postgres")'
                });
            }
        }

        // Check port
        if (urlInfo.port !== '5432' && urlInfo.port !== '6543' && urlInfo.port !== '5433') {
            issues.push({
                level: 'WARNING',
                message: `Unusual port: ${urlInfo.port}`,
                fix: 'Expected 5432 (direct), 6543 (transaction pooler), or 5433 (session pooler)'
            });
        }

        // Recommend port 6543 for production
        if (urlInfo.port === '5432' && urlInfo.hostname.includes('supabase.co')) {
            issues.push({
                level: 'WARNING',
                message: 'Using direct connection (port 5432) - may fail on Railway/Render',
                fix: 'For production deployment, use Transaction pooler (port 6543)'
            });
        }

        // Check hostname format
        if (urlInfo.port === '6543' && !urlInfo.hostname.includes('pooler.supabase.com')) {
            issues.push({
                level: 'ERROR',
                message: `Hostname "${urlInfo.hostname}" is incorrect for pooler`,
                fix: 'Should be: aws-0-eu-west-1.pooler.supabase.com (or similar region)'
            });
        }

        // Display issues
        if (issues.length > 0) {
            console.log('⚠️  Configuration Issues Found:\n');
            issues.forEach((issue, i) => {
                console.log(`${i + 1}. [${issue.level}] ${issue.message}`);
                console.log(`   → Fix: ${issue.fix}\n`);
            });

            const hasErrors = issues.some(i => i.level === 'ERROR');
            if (hasErrors) {
                console.log('❌ Please fix the errors above before testing connection\n');

                // Show example
                console.log('✅ Example correct DATABASE_URL for Transaction pooler:');
                console.log('   postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres\n');

                process.exit(1);
            }
        } else {
            console.log('✅ Configuration looks good!\n');
        }

    } catch (err) {
        console.error('❌ ERROR: Invalid DATABASE_URL format');
        console.error('   Expected format: postgresql://user:password@host:port/database');
        console.error('   Error:', err.message, '\n');
        process.exit(1);
    }

    // Test actual connection
    console.log('🔌 Testing connection to database...\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000
    });

    try {
        const start = Date.now();
        const client = await pool.connect();
        const duration = Date.now() - start;

        try {
            // Test query
            const res = await client.query('SELECT NOW(), current_database(), current_user');
            const row = res.rows[0];

            console.log('✅ CONNECTION SUCCESSFUL!\n');
            console.log('   Connection time:', duration + 'ms');
            console.log('   Server time:    ', row.now);
            console.log('   Database:       ', row.current_database);
            console.log('   User:           ', row.current_user);
            console.log('');

            // Test if we can see tables
            console.log('🔍 Checking database schema...');
            const tables = await client.query(`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            `);

            if (tables.rows.length > 0) {
                console.log(`✅ Found ${tables.rows.length} tables:`);
                tables.rows.forEach(t => console.log(`   - ${t.table_name}`));
            } else {
                console.log('⚠️  No tables found - database might be empty');
                console.log('   Run: npm run init-db');
            }
            console.log('');

            console.log('🎉 All checks passed! Your database connection is working correctly.\n');

        } finally {
            client.release();
        }

    } catch (err) {
        console.error('❌ CONNECTION FAILED\n');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('');

        // Specific troubleshooting
        if (err.code === '28P01') {
            console.error('🔑 AUTHENTICATION ERROR - Password or username is wrong\n');
            console.error('Common fixes:');
            console.error('  1. Verify password is correct in DATABASE_URL');
            console.error('  2. For Transaction pooler (port 6543), username MUST be:');
            console.error('     postgres.pvdebaqcqlkhibnxnwpf (not just "postgres")');
            console.error('  3. Check for special characters in password - they need URL encoding:');
            console.error('     @ → %40   # → %23   $ → %24   % → %25   & → %26');
            console.error('  4. Copy connection string from Supabase:');
            console.error('     Settings → Database → Connection Pooling → Transaction mode');
            console.error('');

            // Try to show what username is being used
            console.error('Your current username:', urlInfo.username);
            if (!urlInfo.username.includes('.')) {
                console.error('❌ This is WRONG! Username must include project reference.');
                console.error('✅ Should be: postgres.pvdebaqcqlkhibnxnwpf');
            }
            console.error('');

        } else if (err.code === 'ECONNREFUSED') {
            console.error('🔥 CONNECTION REFUSED - Server is not accepting connections\n');
            console.error('Common fixes:');
            console.error('  1. Use Transaction pooler (port 6543) instead of direct connection (port 5432)');
            console.error('  2. Check Supabase project is not paused');
            console.error('  3. Check network/firewall settings');
            console.error('');

        } else if (err.code === 'ENOTFOUND') {
            console.error('🌐 DNS ERROR - Hostname not found\n');
            console.error('Common fixes:');
            console.error('  1. Check hostname spelling in DATABASE_URL');
            console.error('  2. Verify internet connection');
            console.error('  3. Check DNS settings');
            console.error('');

        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
            console.error('⏱️  TIMEOUT - Connection timed out\n');
            console.error('Common fixes:');
            console.error('  1. Check internet connection');
            console.error('  2. Try different network');
            console.error('  3. Check firewall settings');
            console.error('');

        } else {
            console.error('Unknown error - see message above for details\n');
        }

        process.exit(1);

    } finally {
        await pool.end();
    }
}

// Run test
testConnection().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
