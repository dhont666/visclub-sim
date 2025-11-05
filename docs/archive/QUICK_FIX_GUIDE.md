# QUICK FIX GUIDE - CRITICAL ISSUES ONLY
**Time Required:** 1-2 hours
**Priority:** MUST FIX BEFORE DEPLOYMENT

---

## FIX #1: Install Missing Packages (5 minutes)

```bash
cd C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website

# Install critical missing packages
npm install express-rate-limit helmet winston express-validator

# Verify installation
npm list express-rate-limit
```

**Verify:** Server should now start without "Cannot find module" errors.

---

## FIX #2: Remove Configuration Conflicts (10 minutes)

### File: `admin/admin-auth.js`

**FIND (Line 17):**
```javascript
this.USE_LOCAL_MODE = true; // ← WIJZIG NAAR false VOOR DEPLOYMENT!
```

**REPLACE WITH:**
```javascript
// Always use config from window.APP_CONFIG
this.USE_LOCAL_MODE = window.APP_CONFIG ? window.APP_CONFIG.USE_LOCAL_MODE : false;
```

**OR BETTER - Delete lines 16-22 entirely:**
```javascript
// DELETE THESE LINES:
// this.USE_LOCAL_MODE = true;
// this.API_BASE_URL = 'https://jouw-app.up.railway.app/api';
```

**REPLACE WITH:**
```javascript
// Get configuration from global config (loaded before this script)
const config = window.APP_CONFIG || { USE_LOCAL_MODE: false };
this.USE_LOCAL_MODE = config.USE_LOCAL_MODE;
this.API_BASE_URL = config.API_BASE_URL;
```

### File: `admin/config.js`

**VERIFY Line 24 is:**
```javascript
USE_LOCAL_MODE: false,  // ✅ Always use Supabase backend
```

**If not, change it to `false`.**

---

## FIX #3: Secure Login Page (15 minutes)

### File: `admin/login.html`

**FIND (Lines 89-95):**
```javascript
const LOCAL_ADMINS = {
    'admin': 'admin123',
    'visclub': 'visclub2026',
    'kevin.dhont': 'visclub2026',
    'maarten.borghs': 'visclub2026',
    'kevin.vandun': 'visclub2026'
};
```

**OPTION A - Force Backend Only (RECOMMENDED):**
```javascript
// Remove LOCAL_ADMINS entirely
// Change the login logic to ONLY use backend

if (USE_LOCAL_MODE) {
    // For development only - use localStorage-based mock
    // WARNING: This should NEVER be enabled in production!
    alert('Local mode is enabled. This is only for development!');
    // ... existing local login code BUT without hardcoded credentials
} else {
    // Backend API login (production)
    try {
        const response = await fetch(`${API_URL}/login`, {
            // ... existing code
        });
        // ...
    } catch (error) {
        // ...
    }
}
```

**OPTION B - Minimum Fix (Still not ideal):**
If you MUST keep local mode for development:

1. Move credentials to a separate file NOT in git
2. Load dynamically only if in development
3. Add big warning banner

```javascript
// Only load if in development
if (USE_LOCAL_MODE && window.location.hostname === 'localhost') {
    console.warn('🚨 LOCAL MODE ENABLED - DEVELOPMENT ONLY!');
    // Load credentials from separate file
    const script = document.createElement('script');
    script.src = 'local-credentials.js';  // Add to .gitignore!
    document.head.appendChild(script);
}
```

**BEST FIX:** Remove entire local mode logic from login.html and force backend authentication.

---

## FIX #4: Add Input Validation (30 minutes)

### File: `server/api-supabase.js`

Add at the top:
```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
```

**Update Members POST endpoint (Line 334):**

**BEFORE:**
```javascript
app.post('/api/members', authenticateToken, async (req, res) => {
    try {
        const {
            member_number, name, email, phone, address,
            is_veteran, is_active, join_date, notes
        } = req.body;

        const { data, error } = await supabase
            .from('members')
            .insert({
                member_number,
                name,
                // ...
```

**AFTER:**
```javascript
app.post('/api/members',
    authenticateToken,
    [
        body('member_number').trim().notEmpty().isLength({ max: 20 })
            .withMessage('Member number is required (max 20 chars)'),
        body('name').trim().notEmpty().isLength({ min: 2, max: 255 })
            .escape()
            .withMessage('Name is required (2-255 chars)'),
        body('email').optional({ nullable: true }).isEmail().normalizeEmail()
            .withMessage('Invalid email format'),
        body('phone').optional({ nullable: true }).trim()
            .matches(/^[0-9+\-\s()]*$/)
            .withMessage('Invalid phone format'),
        body('is_veteran').optional().isBoolean(),
        body('is_active').optional().isBoolean(),
    ],
    validateRequest,
    async (req, res) => {
        try {
            const {
                member_number, name, email, phone, address,
                is_veteran, is_active, join_date, notes
            } = req.body;

            // IMPORTANT: Sanitize address and notes (can't use .escape() on optional fields)
            const sanitizedAddress = address ? address.trim().substring(0, 500) : null;
            const sanitizedNotes = notes ? notes.trim().substring(0, 2000) : null;

            const { data, error } = await supabase
                .from('members')
                .insert({
                    member_number: member_number.trim(),
                    name: name.trim(),
                    email: email ? email.trim().toLowerCase() : null,
                    phone: phone ? phone.trim() : null,
                    address: sanitizedAddress,
                    is_veteran: is_veteran || false,
                    is_active: is_active !== false,
                    join_date,
                    notes: sanitizedNotes
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    return res.status(400).json({ error: 'Member number already exists' });
                }
                throw error;
            }

            res.status(201).json(data);
        } catch (error) {
            console.error('Error creating member:', error);
            res.status(500).json({ error: 'Failed to create member' });
        }
    }
);
```

**Do the same for:**
- `PUT /api/members/:id`
- `POST /api/competitions`
- `POST /api/results`
- `POST /api/registrations`

---

## FIX #5: Add HTML Escaping in Frontend (20 minutes)

### File: `admin/admin-script.js`

Add at the top:
```javascript
// HTML escape function to prevent XSS
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

**Update loadRegistrationsTable function (Line 160):**

**BEFORE:**
```javascript
row.innerHTML = `
    <td><input type="checkbox"></td>
    <td>#${reg.id}</td>
    <td><strong>${reg.name}</strong></td>
    <td>${reg.email}</td>
    <td>${reg.competition}</td>
    // ...
`;
```

**AFTER:**
```javascript
row.innerHTML = `
    <td><input type="checkbox"></td>
    <td>#${escapeHtml(reg.id)}</td>
    <td><strong>${escapeHtml(reg.name)}</strong></td>
    <td>${escapeHtml(reg.email)}</td>
    <td>${escapeHtml(reg.competition)}</td>
    // ...
`;
```

**Apply escapeHtml() to ALL user data displayed in:**
- `loadRegistrationsTable()`
- `loadPaymentsTable()`
- `loadMembersTable()`
- `loadPermitsTable()`
- Any other function that displays user input

---

## FIX #6: Verify Environment Variables (5 minutes)

Create a startup validation script:

### File: `server/validate-env.js`

```javascript
/**
 * Validate environment variables before starting server
 * Run with: node server/validate-env.js
 */

const REQUIRED_ENV_VARS = {
    'SUPABASE_URL': 'Supabase project URL',
    'SUPABASE_SERVICE_KEY': 'Supabase service role key',
    'JWT_SECRET': 'JWT signing secret (min 32 chars)',
    'CORS_ORIGIN': 'Allowed CORS origin'
};

const WEAK_SECRETS = [
    'your-secret-key-change-this-in-production',
    'your-super-secret-jwt-key-at-least-32-characters-long',
    'change-me',
    'secret',
    'jwt-secret'
];

console.log('🔍 Validating environment variables...\n');

let errors = [];
let warnings = [];

// Check required variables
for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
        errors.push(`❌ ${key} is not set (${description})`);
    } else if (process.env[key].trim() === '') {
        errors.push(`❌ ${key} is empty (${description})`);
    } else {
        console.log(`✅ ${key} is set`);
    }
}

// Validate JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (JWT_SECRET) {
    if (JWT_SECRET.length < 32) {
        errors.push(`❌ JWT_SECRET is too short (${JWT_SECRET.length} chars). Minimum: 32`);
    }

    for (const weak of WEAK_SECRETS) {
        if (JWT_SECRET.includes(weak)) {
            errors.push(`❌ JWT_SECRET contains weak/example value: "${weak}"`);
        }
    }

    if (JWT_SECRET === process.env.JWT_SECRET_OLD) {
        warnings.push(`⚠️ JWT_SECRET hasn't been changed from example`);
    }
}

// Validate SUPABASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL;
if (SUPABASE_URL && !SUPABASE_URL.startsWith('https://')) {
    errors.push(`❌ SUPABASE_URL must start with https://`);
}

// Validate CORS_ORIGIN
const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (CORS_ORIGIN === '*') {
    warnings.push(`⚠️ CORS_ORIGIN is "*" (allows all origins). Only use in development!`);
}

// Print results
console.log('\n' + '='.repeat(50));
if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:\n');
    errors.forEach(err => console.log(`   ${err}`));
}

if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:\n');
    warnings.forEach(warn => console.log(`   ${warn}`));
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All environment variables are valid!\n');
}

console.log('='.repeat(50) + '\n');

process.exit(errors.length > 0 ? 1 : 0);
```

**Update `package.json`:**
```json
{
    "scripts": {
        "start": "node server/validate-env.js && node server/api-supabase.js",
        "dev": "node server/validate-env.js && nodemon server/api-supabase.js",
        "test": "node tests/critical-fixes.test.js"
    }
}
```

---

## FIX #7: Run Tests (5 minutes)

```bash
# Run the critical fixes test
node tests/critical-fixes.test.js

# If all pass, you're good!
# If any fail, fix them before deploying
```

---

## VERIFICATION CHECKLIST

After applying all fixes, verify:

- [ ] Server starts without errors: `npm start`
- [ ] All tests pass: `node tests/critical-fixes.test.js`
- [ ] Login works with backend (not local mode)
- [ ] Cannot login with hardcoded credentials
- [ ] XSS payloads in name field are escaped
- [ ] Rate limiting works (try 6 login attempts quickly)
- [ ] Environment variables are validated on startup
- [ ] No sensitive data in git: `git status` (should not show .env)

---

## DEPLOYMENT

Once all fixes are applied and tested:

1. **Set environment variables** in your hosting platform:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiI...
   JWT_SECRET=<generate-new-32+-char-secret>
   CORS_ORIGIN=https://visclubsim.be
   NODE_ENV=production
   PORT=3000
   ```

2. **Generate new JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Deploy:**
   ```bash
   git add .
   git commit -m "fix: Apply critical security fixes"
   git push origin master
   ```

4. **Test production:**
   - Login with admin account
   - Test creating a member
   - Test rate limiting
   - Check logs for errors

---

## NEXT STEPS (Not Urgent)

After deployment, schedule time to fix:
- Password complexity requirements
- Proper logging with Winston
- Email verification
- Password reset functionality
- API documentation
- E2E tests

---

**Estimated Time:** 1-2 hours for all critical fixes
**Priority:** Complete before production deployment
