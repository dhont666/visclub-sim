# Migration Guide: PostgreSQL → Supabase Client

## 🎯 Why This Migration?

Your deployment platform (Railway/Render) **blocks direct PostgreSQL connections** to Supabase, causing:
```
Error: connect ECONNREFUSED 18.202.64.2:6543
```

The solution: **Use Supabase JavaScript Client** which uses HTTPS instead of PostgreSQL protocol.

## ✅ Benefits

| Feature | Old (PostgreSQL) | New (Supabase Client) |
|---------|-----------------|----------------------|
| **Protocol** | PostgreSQL (port 6543/5432) | HTTPS (port 443) |
| **Works on Railway/Render** | ❌ Blocked | ✅ Works |
| **Works everywhere** | ⚠️ Platform-dependent | ✅ All platforms |
| **Firewall issues** | ❌ Common | ✅ None |
| **Security** | Good | Better (RLS support) |
| **Serverless-friendly** | ⚠️ Limited | ✅ Excellent |

## 🚀 Migration Steps

### Step 1: Get Supabase API Keys

1. Go to: https://supabase.com/dashboard/project/pvdebaqcqlkhibnxnwpf/settings/api
2. Copy the following values:
   - **Project URL**: `https://pvdebaqcqlkhibnxnwpf.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with eyJ)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with eyJ)

⚠️ **IMPORTANT**: Use the **service_role** key for the backend API (not the anon key!)

### Step 2: Update Environment Variables

**On Railway:**
1. Go to your project → Variables
2. Update/add these variables:
   ```
   SUPABASE_URL=https://pvdebaqcqlkhibnxnwpf.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key-here
   JWT_SECRET=your-jwt-secret
   ```
3. Remove `DATABASE_URL` (no longer needed!)
4. Click **Deploy**

**On Render:**
1. Go to your Web Service → Environment
2. Update/add the same variables as above
3. Remove `DATABASE_URL`
4. Save Changes (auto-redeploys)

**Locally (.env file):**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add:
SUPABASE_URL=https://pvdebaqcqlkhibnxnwpf.supabase.co
SUPABASE_SERVICE_KEY=your-actual-service-role-key
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

### Step 3: Test Locally (Optional but Recommended)

```bash
# Install dependencies (already done if you ran npm install)
npm install

# Start the new Supabase-based API
npm start

# You should see:
# ✅ Supabase client initialized
#    URL: https://pvdebaqcqlkhibnxnwpf.supabase.co
# 🎣 Visclub SiM API Server
#    (Supabase Client Version)
#    Connection: HTTPS (Supabase Client)
```

Test the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T...",
  "environment": "development",
  "database": "connected"
}
```

### Step 4: Deploy

The updated `package.json` now uses the Supabase version by default:
```json
{
  "main": "server/api-supabase.js",
  "scripts": {
    "start": "node server/api-supabase.js"
  }
}
```

**Railway/Render will automatically:**
1. Run `npm install` (installs @supabase/supabase-js)
2. Run `npm start` (starts server/api-supabase.js)
3. Connect via HTTPS (no more connection refused errors!)

### Step 5: Verify Deployment

Check your deployment logs. You should see:
```
✅ Supabase client initialized
   URL: https://pvdebaqcqlkhibnxnwpf.supabase.co
🎣 Visclub SiM API Server
   (Supabase Client Version)
   Port: 3000
   Connection: HTTPS (Supabase Client)
```

❌ **NOT this:**
```
Error: connect ECONNREFUSED
```

## 📋 What Changed?

### Code Changes

**Old (server/api.js - PostgreSQL):**
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Query
const result = await pool.query('SELECT * FROM members');
const members = result.rows;
```

**New (server/api-supabase.js - Supabase Client):**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Query
const { data: members, error } = await supabase
    .from('members')
    .select('*');
```

### API Endpoints (No Changes!)

All API endpoints remain **exactly the same**:
- ✅ `POST /api/auth/login`
- ✅ `GET /api/members`
- ✅ `POST /api/members`
- ✅ `GET /api/competitions`
- ✅ `GET /api/rankings/club`
- etc.

The **frontend doesn't need any changes** - it still calls the same API endpoints!

## 🔄 Rollback (If Needed)

If you need to switch back to the old PostgreSQL version:

```bash
# Use the old API
npm run start:pg

# Or update package.json:
"start": "node server/api.js"
```

But you'll still have the `ECONNREFUSED` error on Railway/Render.

## ❓ Troubleshooting

### Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY

**Problem:**
```
❌ ERROR: Missing required environment variables
   Required: SUPABASE_URL and SUPABASE_SERVICE_KEY
```

**Solution:**
1. Make sure you set the environment variables in your deployment platform
2. Check spelling (must be exactly `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`)
3. Redeploy after setting variables

### Error: Invalid API key

**Problem:**
```
Error: Invalid API key
```

**Solution:**
1. Make sure you're using the **service_role** key (not anon key)
2. Copy the entire key including the `eyJ...` part
3. No spaces or line breaks in the key

### Login still failing

**Problem:**
Login returns 401 Unauthorized

**Solution:**
1. Check that `admin_users` table exists in Supabase
2. Verify passwords are hashed with bcrypt
3. Check JWT_SECRET is set correctly
4. Test with known credentials

### Database connection failed

**Problem:**
Health check returns database: "error"

**Solution:**
1. Verify SUPABASE_URL is correct
2. Verify SUPABASE_SERVICE_KEY is valid
3. Check Supabase project is not paused
4. Check table permissions (RLS policies)

## 🎓 Learning Resources

- Supabase JS Client Docs: https://supabase.com/docs/reference/javascript/
- Query Examples: https://supabase.com/docs/reference/javascript/select
- Authentication: https://supabase.com/docs/guides/auth

## 🎉 Success Checklist

- [ ] Got SUPABASE_URL from dashboard
- [ ] Got SUPABASE_SERVICE_KEY from dashboard (service_role, not anon)
- [ ] Updated environment variables on deployment platform
- [ ] Removed DATABASE_URL (no longer needed)
- [ ] Deployed successfully
- [ ] No more ECONNREFUSED errors
- [ ] API health check returns "connected"
- [ ] Login works
- [ ] All endpoints respond correctly

## 📞 Still Having Issues?

If you're still getting errors:

1. Check deployment logs for specific error messages
2. Test the health endpoint: `https://your-app.railway.app/api/health`
3. Verify environment variables are set correctly
4. Make sure Supabase project is active

The new API uses **HTTPS (port 443)** which works on **all platforms** without network restrictions!
