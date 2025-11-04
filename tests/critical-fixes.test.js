/**
 * CRITICAL SECURITY TESTS
 * Run these tests to verify critical vulnerabilities are fixed
 *
 * Usage: node tests/critical-fixes.test.js
 *
 * Or with test framework:
 * npm install --save-dev jest supertest
 * npm test
 */

const assert = require('assert');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_USERNAME = 'admin';
const TEST_PASSWORD = 'admin123';

console.log('🧪 RUNNING CRITICAL SECURITY TESTS');
console.log('==================================\n');

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    testsRun++;
    try {
        fn();
        testsPassed++;
        console.log(`✅ PASS: ${name}`);
    } catch (error) {
        testsFailed++;
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}\n`);
    }
}

// ==============================================
// TEST 1: Check if rate-limit package is installed
// ==============================================
test('express-rate-limit package is installed', () => {
    try {
        require('express-rate-limit');
    } catch (e) {
        throw new Error('express-rate-limit package not found. Run: npm install express-rate-limit');
    }
});

// ==============================================
// TEST 2: Verify JWT_SECRET is not a weak value
// ==============================================
test('JWT_SECRET is not using weak default value', () => {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
    }

    if (JWT_SECRET.length < 32) {
        throw new Error(`JWT_SECRET is too short (${JWT_SECRET.length} chars). Minimum: 32 chars`);
    }

    const weakSecrets = [
        'your-secret-key-change-this-in-production',
        'your-super-secret-jwt-key-at-least-32-characters-long',
        'change-me',
        'secret',
        'jwt-secret',
        'test-secret'
    ];

    for (const weak of weakSecrets) {
        if (JWT_SECRET.includes(weak)) {
            throw new Error(`JWT_SECRET contains weak/example value: "${weak}"`);
        }
    }
});

// ==============================================
// TEST 3: Check configuration consistency
// ==============================================
test('USE_LOCAL_MODE configuration is consistent', () => {
    const fs = require('fs');
    const path = require('path');

    // Read config.js
    const configPath = path.join(__dirname, '..', 'admin', 'config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Check for USE_LOCAL_MODE: false in config.js
    if (!configContent.includes('USE_LOCAL_MODE: false')) {
        throw new Error('config.js should have USE_LOCAL_MODE: false for production');
    }

    // Read admin-auth.js
    const authPath = path.join(__dirname, '..', 'admin', 'admin-auth.js');
    const authContent = fs.readFileSync(authPath, 'utf8');

    // Check that admin-auth.js doesn't override USE_LOCAL_MODE
    if (authContent.includes('this.USE_LOCAL_MODE = true')) {
        throw new Error('admin-auth.js still has USE_LOCAL_MODE = true. This should be removed or set to false.');
    }
});

// ==============================================
// TEST 4: Check for hardcoded credentials
// ==============================================
test('No hardcoded credentials in login.html', () => {
    const fs = require('fs');
    const path = require('path');

    const loginPath = path.join(__dirname, '..', 'admin', 'login.html');
    const loginContent = fs.readFileSync(loginPath, 'utf8');

    // Check for LOCAL_ADMINS object
    if (loginContent.includes('LOCAL_ADMINS') && loginContent.includes('admin123')) {
        throw new Error('login.html contains hardcoded credentials (LOCAL_ADMINS). Remove for production!');
    }

    // Check for hardcoded passwords
    const suspiciousPasswords = ['admin123', 'visclub2026', 'password'];
    for (const pwd of suspiciousPasswords) {
        if (loginContent.includes(pwd)) {
            console.warn(`   ⚠️ Warning: login.html may contain hardcoded password "${pwd}"`);
        }
    }
});

// ==============================================
// TEST 5: Verify SUPABASE environment variables
// ==============================================
test('Required SUPABASE environment variables are set', () => {
    const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];

    for (const envVar of required) {
        if (!process.env[envVar]) {
            throw new Error(`${envVar} environment variable is not set`);
        }

        if (process.env[envVar].trim() === '') {
            throw new Error(`${envVar} environment variable is empty`);
        }
    }

    // Validate SUPABASE_URL format
    const url = process.env.SUPABASE_URL;
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
        throw new Error('SUPABASE_URL should be a valid Supabase URL (https://xxx.supabase.co)');
    }
});

// ==============================================
// TEST 6: Check for .env in git
// ==============================================
test('.env file is not tracked in git', () => {
    const { execSync } = require('child_process');

    try {
        // Check if .env is in git index
        const result = execSync('git ls-files .env', { encoding: 'utf8', cwd: __dirname + '/..' });

        if (result.trim() === '.env') {
            throw new Error('.env file is tracked in git! This is a CRITICAL security issue. Remove it from git history and rotate all secrets!');
        }
    } catch (e) {
        // If git command fails, .env is not tracked (which is good)
        if (!e.message.includes('not tracked')) {
            // Re-throw if it's a different error
            throw e;
        }
    }
});

// ==============================================
// TEST 7: Check CORS configuration
// ==============================================
test('CORS_ORIGIN is properly configured', () => {
    const CORS_ORIGIN = process.env.CORS_ORIGIN;

    if (!CORS_ORIGIN) {
        console.warn('   ⚠️ Warning: CORS_ORIGIN not set. May cause CORS issues.');
    }

    if (CORS_ORIGIN === '*') {
        console.warn('   ⚠️ Warning: CORS_ORIGIN is "*" (allows all origins). Only use in development!');
    }

    if (CORS_ORIGIN && CORS_ORIGIN !== '*') {
        try {
            new URL(CORS_ORIGIN);
        } catch (e) {
            throw new Error(`CORS_ORIGIN "${CORS_ORIGIN}" is not a valid URL`);
        }
    }
});

// ==============================================
// TEST 8: Check package.json for security packages
// ==============================================
test('Security packages are installed', () => {
    const fs = require('fs');
    const path = require('path');

    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const requiredPackages = [
        'express-rate-limit',
        'bcrypt',
        'jsonwebtoken',
        'cors',
        '@supabase/supabase-js'
    ];

    const recommendedPackages = [
        'helmet',
        'express-validator',
        'winston'
    ];

    const missing = [];
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    for (const pkg of requiredPackages) {
        if (!dependencies[pkg]) {
            missing.push(pkg);
        }
    }

    if (missing.length > 0) {
        throw new Error(`Missing required packages: ${missing.join(', ')}. Run: npm install ${missing.join(' ')}`);
    }

    // Check recommended (warn only)
    for (const pkg of recommendedPackages) {
        if (!dependencies[pkg]) {
            console.warn(`   ⚠️ Recommended package not installed: ${pkg}`);
        }
    }
});

// ==============================================
// TEST 9: Database schema validation
// ==============================================
test('Database schema has proper constraints', () => {
    const fs = require('fs');
    const path = require('path');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Check for essential constraints
    const requiredConstraints = [
        'UNIQUE(member_number)',
        'UNIQUE(username)',
        'CHECK (position > 0)',
        'CHECK (points > 0)',
        'REFERENCES'
    ];

    for (const constraint of requiredConstraints) {
        if (!schemaContent.includes(constraint)) {
            console.warn(`   ⚠️ Schema might be missing constraint: ${constraint}`);
        }
    }

    // Check for indexes
    if (!schemaContent.includes('CREATE INDEX')) {
        throw new Error('Schema has no indexes! Performance will be terrible.');
    }
});

// ==============================================
// TEST 10: RLS policies validation
// ==============================================
test('Row Level Security policies are enabled', () => {
    const fs = require('fs');
    const path = require('path');

    const rlsPath = path.join(__dirname, '..', 'database', 'rls-policies.sql');

    if (!fs.existsSync(rlsPath)) {
        throw new Error('rls-policies.sql file not found! Database is INSECURE!');
    }

    const rlsContent = fs.readFileSync(rlsPath, 'utf8');

    // Check RLS is enabled on critical tables
    const criticalTables = ['admin_users', 'members', 'permits', 'contact_messages'];

    for (const table of criticalTables) {
        if (!rlsContent.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)) {
            throw new Error(`RLS not enabled on ${table} table! Data is exposed!`);
        }
    }

    // Check for service_role policies
    if (!rlsContent.includes("auth.role() = 'service_role'")) {
        throw new Error('RLS policies missing service_role checks!');
    }
});

// ==============================================
// PRINT RESULTS
// ==============================================
console.log('\n==================================');
console.log('TEST RESULTS');
console.log('==================================');
console.log(`Total Tests:  ${testsRun}`);
console.log(`✅ Passed:    ${testsPassed}`);
console.log(`❌ Failed:    ${testsFailed}`);
console.log('==================================\n');

if (testsFailed > 0) {
    console.log('❌ CRITICAL ISSUES FOUND!');
    console.log('Fix all failures before deploying to production.\n');
    process.exit(1);
} else {
    console.log('✅ ALL CRITICAL TESTS PASSED!');
    console.log('Application is closer to production-ready.');
    console.log('Review warnings above and run integration tests.\n');
    process.exit(0);
}
