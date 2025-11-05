# VISCLUB SIM - PRIORITIZED ACTION PLAN
**Generated:** November 4, 2025
**Goal:** Make application production-ready
**Total Time:** 3-4 hours for critical fixes

---

## 🔴 CRITICAL PRIORITY (DO FIRST)
**Must complete before ANY deployment**
**Time Required:** 2-3 hours

### Action 1: Install Missing Packages ⏱️ 5 minutes
```bash
cd C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website
npm install express-rate-limit helmet winston express-validator
npm list express-rate-limit  # Verify installation
```

**Verify:** Run `npm start` - server should start without "Cannot find module" error

---

### Action 2: Setup Environment Variables ⏱️ 10 minutes

**Step 1:** Copy example file
```bash
cp .env.example .env
```

**Step 2:** Edit `.env` file with real values:
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to JWT_SECRET
```

**Step 3:** Fill in Supabase credentials from dashboard:
```
SUPABASE_URL=https://pvdebaqcqlkhibnxnwpf.supabase.co
SUPABASE_SERVICE_KEY=<from Supabase Dashboard → Settings → API>
JWT_SECRET=<generated from above command>
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
PORT=3000
```

**Verify:** Run `node tests/critical-fixes.test.js` - environment var tests should pass

---

### Action 3: Fix Configuration Conflicts ⏱️ 10 minutes

**File:** `admin/admin-auth.js`

**Find and DELETE lines 16-22:**
```javascript
// DELETE THIS SECTION:
this.USE_LOCAL_MODE = true; // ← WIJZIG NAAR false VOOR DEPLOYMENT!

// Railway backend API URL
// Vervang door je Railway app URL (krijg je na deployment)
this.API_BASE_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ WIJZIG DIT NAAR JE RAILWAY URL!
```

**Replace with:**
```javascript
// Always use configuration from window.APP_CONFIG
const config = window.APP_CONFIG || {
    USE_LOCAL_MODE: false,
    API_BASE_URL: window.location.origin + '/api'
};

this.USE_LOCAL_MODE = config.USE_LOCAL_MODE;
this.API_BASE_URL = config.API_BASE_URL;
```

**Verify:**
- Open `admin/login.html` in browser
- Check console - should say "USE_LOCAL_MODE: false"

---

### Action 4: Remove Hardcoded Credentials ⏱️ 15 minutes

**File:** `admin/login.html`

**Option A - Production Fix (Recommended):**

Find the login form submit handler (around line 96) and **DELETE** the entire `if (USE_LOCAL_MODE)` block:

```javascript
// DELETE LINES 100-132 (the entire if (USE_LOCAL_MODE) block)
// Keep only the else block for backend authentication
```

Replace with:
```javascript
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;

    // Always use backend API
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            console.log('✅ Login successful');
            localStorage.setItem('visclubsim_token', data.token);
            localStorage.setItem('visclubsim_admin', JSON.stringify(data.user));
            localStorage.setItem('admin_name', data.user.full_name || data.user.username);

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        } else {
            document.getElementById('errorMsg').textContent = data.error || 'Login failed';
            document.getElementById('errorMsg').style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('errorMsg').textContent = 'Cannot connect to server';
        document.getElementById('errorMsg').style.display = 'block';
    }
});
```

**Also DELETE lines 154-162** (the console.log of available accounts)

**Verify:**
- Cannot login with "admin/admin123"
- Login only works with backend API
- No credentials visible in page source

---

### Action 5: Add Basic Input Validation ⏱️ 1 hour

**File:** `server/api-supabase.js`

**Step 1:** Add validation middleware at top of file (after requires):
```javascript
const { body, validationResult } = require('express-validator');

// Validation helper
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

// HTML sanitization helper
const sanitizeString = (str, maxLength = 255) => {
    if (!str) return null;
    return String(str)
        .trim()
        .replace(/[<>]/g, '')  // Remove HTML tags
        .substring(0, maxLength);
};
```

**Step 2:** Update POST /api/members (replace lines 334-369):
```javascript
app.post('/api/members',
    authenticateToken,
    [
        body('member_number').trim().notEmpty().isLength({ max: 20 }),
        body('first_name').trim().notEmpty().isLength({ min: 2, max: 255 }),
        body('last_name').trim().notEmpty().isLength({ min: 2, max: 255 }),
        body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
        body('phone').optional({ nullable: true }).trim().matches(/^[0-9+\-\s()]*$/),
        body('is_veteran').optional().isBoolean(),
        body('is_active').optional().isBoolean(),
    ],
    validateRequest,
    async (req, res) => {
        try {
            const {
                member_number, first_name, last_name, email, phone,
                address, postal_code, city, is_veteran, is_active,
                join_date, notes
            } = req.body;

            const { data, error } = await supabase
                .from('members')
                .insert({
                    member_number: member_number.trim(),
                    first_name: sanitizeString(first_name, 255),
                    last_name: sanitizeString(last_name, 255),
                    email: email ? email.trim().toLowerCase() : null,
                    phone: phone ? sanitizeString(phone, 50) : null,
                    address: sanitizeString(address, 500),
                    postal_code: sanitizeString(postal_code, 10),
                    city: sanitizeString(city, 100),
                    is_veteran: is_veteran || false,
                    is_active: is_active !== false,
                    join_date,
                    notes: sanitizeString(notes, 2000)
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

**Step 3:** Repeat for PUT /api/members/:id (similar validation)

**Verify:**
- Try to create member with empty name → should fail with validation error
- Try to create member with `<script>alert('xss')</script>` in name → should be sanitized

---

### Action 6: Add Frontend HTML Escaping ⏱️ 30 minutes

**File:** `admin/admin-script.js`

**Step 1:** Add escape function at the top (after DOMContentLoaded):
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

// Make it globally available
window.escapeHtml = escapeHtml;
```

**Step 2:** Update loadRegistrationsTable (around line 160):

Find:
```javascript
row.innerHTML = `
    <td><input type="checkbox"></td>
    <td>#${reg.id}</td>
    <td><strong>${reg.name}</strong></td>
    <td>${reg.email}</td>
```

Replace with:
```javascript
row.innerHTML = `
    <td><input type="checkbox"></td>
    <td>#${escapeHtml(reg.id)}</td>
    <td><strong>${escapeHtml(reg.name)}</strong></td>
    <td>${escapeHtml(reg.email)}</td>
```

**Step 3:** Do the same for:
- `loadMembersTable()` - escape all member data
- `loadPaymentsTable()` - escape payment data
- `loadPermitsTable()` - escape permit data

**Verify:**
- Create member with name: `<script>alert('xss')</script>`
- View in members table
- Should display as text, not execute

---

### Action 7: Run Security Tests ⏱️ 5 minutes

```bash
# Run automated tests
node tests/critical-fixes.test.js

# Should show:
# Total Tests:  10
# ✅ Passed:    10
# ❌ Failed:    0
```

**If any tests fail:**
- Read the error message
- Fix the issue
- Re-run tests

---

### Action 8: Manual Verification ⏱️ 15 minutes

Test these scenarios:

**1. Authentication:**
- [ ] Start server: `npm start`
- [ ] Open: http://localhost:3000/admin/login.html
- [ ] Try login with "admin/admin123" → Should fail
- [ ] Try 6 failed logins quickly → Should be rate limited
- [ ] Create admin user in Supabase admin_users table
- [ ] Login with real admin → Should work

**2. Input Validation:**
- [ ] Login to admin panel
- [ ] Try to create member with empty name → Should show validation error
- [ ] Try to create member with invalid email → Should show validation error
- [ ] Create member with valid data → Should work

**3. XSS Prevention:**
- [ ] Create member with name: `<img src=x onerror=alert(1)>`
- [ ] View in members table
- [ ] Should display as text (escaped), not execute

**4. Configuration:**
- [ ] Check browser console
- [ ] Should see: "USE_LOCAL_MODE: false"
- [ ] Should see: "Backend API mode enabled"

---

## 🟡 HIGH PRIORITY (WEEK 1)
**Important for security but not blocking**
**Time Required:** 1-2 days

### Action 9: Reduce JWT Token Expiration ⏱️ 15 minutes

**File:** `server/api-supabase.js` (Line 263)

Change from 24h to 1h:
```javascript
const token = jwt.sign(
    {
        id: user.id,
        username: user.username,
        role: user.role
    },
    JWT_SECRET,
    { expiresIn: '1h' }  // Changed from '24h'
);
```

---

### Action 10: Add Proper Logging ⏱️ 1 hour

**File:** `server/api-supabase.js`

See QUICK_FIX_GUIDE.md section "FIX #2.3: Insufficient Logging" for full implementation.

---

### Action 11: Add Account Lockout ⏱️ 2 hours

Implement account lockout after 5 failed login attempts.
See SECURITY_AUDIT_REPORT.md section "2.4" for full implementation.

---

### Action 12: Add HTTPS Enforcement ⏱️ 30 minutes

**File:** `server/api-supabase.js`

Add after middleware setup:
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
    });
}
```

---

### Action 13: Add Security Headers ⏱️ 15 minutes

```javascript
const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            connectSrc: ["'self'", process.env.SUPABASE_URL]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true
    }
}));
```

---

## 🟢 MEDIUM PRIORITY (MONTH 1)
**Nice to have, improves user experience**
**Time Required:** 2-3 days

- Email verification system
- Password reset flow
- API pagination
- Request/response logging
- Performance monitoring
- Database backups automation
- API documentation (Swagger)

---

## 🔵 LOW PRIORITY (FUTURE)
**Technical debt and improvements**

- TypeScript migration
- E2E test suite (Playwright)
- Frontend build process (Vite)
- Code splitting and optimization
- Internationalization (i18n)

---

## PROGRESS TRACKING

Mark items as you complete them:

### Critical (Must Do):
- [ ] Action 1: Install packages
- [ ] Action 2: Setup .env
- [ ] Action 3: Fix configuration
- [ ] Action 4: Remove credentials
- [ ] Action 5: Add validation
- [ ] Action 6: Add HTML escaping
- [ ] Action 7: Run tests (all pass)
- [ ] Action 8: Manual verification

### High Priority (Week 1):
- [ ] Action 9: Reduce JWT expiration
- [ ] Action 10: Add logging
- [ ] Action 11: Account lockout
- [ ] Action 12: HTTPS enforcement
- [ ] Action 13: Security headers

### Deployment Ready When:
- [ ] All critical actions complete
- [ ] All tests pass (10/10)
- [ ] Manual verification passed
- [ ] Production environment variables set
- [ ] Database schema deployed
- [ ] Admin user created
- [ ] Monitoring configured

---

## DEPLOYMENT CHECKLIST

Before deploying to production:

**1. Environment Setup:**
- [ ] Production .env configured
- [ ] SUPABASE_URL points to production
- [ ] SUPABASE_SERVICE_KEY is service role key
- [ ] JWT_SECRET is strong (32+ chars, random)
- [ ] CORS_ORIGIN is production domain
- [ ] NODE_ENV=production

**2. Database:**
- [ ] schema.sql executed in Supabase
- [ ] rls-policies.sql executed in Supabase
- [ ] Admin user created with strong password
- [ ] Test queries work
- [ ] RLS policies tested

**3. Security:**
- [ ] All security tests pass
- [ ] Hardcoded credentials removed
- [ ] Local mode disabled
- [ ] Input validation active
- [ ] HTTPS enforced
- [ ] Security headers enabled

**4. Testing:**
- [ ] Can login with admin account
- [ ] Can create/edit/delete members
- [ ] Rate limiting works (test 6 login attempts)
- [ ] XSS payloads are escaped
- [ ] Invalid input is rejected

**5. Monitoring:**
- [ ] Health check endpoint works
- [ ] Logs are being written
- [ ] Uptime monitoring configured
- [ ] Error tracking setup

**6. Documentation:**
- [ ] README updated
- [ ] API documentation available
- [ ] Environment variables documented
- [ ] Deployment process documented

---

## ROLLBACK PLAN

If something goes wrong after deployment:

**Immediate Actions:**
1. Revert to previous version
2. Check logs for errors
3. Verify database integrity
4. Test authentication flow

**Prevention:**
- Test in staging first
- Deploy during low-traffic hours
- Have database backup ready
- Monitor closely for first hour

---

## GETTING HELP

**If stuck on a fix:**
1. Read the detailed explanation in SECURITY_AUDIT_REPORT.md
2. Check QUICK_FIX_GUIDE.md for step-by-step instructions
3. Review test failures for hints
4. Check browser console for errors

**If tests keep failing:**
1. Read error message carefully
2. Verify file changes saved
3. Restart server
4. Clear browser cache
5. Check .env file exists and has values

---

## SUCCESS CRITERIA

You're ready to deploy when:
✅ All 10 security tests pass
✅ Manual verification complete
✅ No hardcoded credentials
✅ Input validation working
✅ Server starts without errors
✅ Can login and use admin panel
✅ Production environment configured

**Estimated completion time:** 3-4 hours for critical work

---

**Start here:** Action 1 (Install Packages)
**End goal:** Production-ready secure application
**Next review:** After critical fixes applied
