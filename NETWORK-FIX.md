# Network Connection Fix - ECONNREFUSED on Port 6543

## 🔥 Error You're Getting

```
Error: connect ECONNREFUSED 18.202.64.2:6543
code: 'ECONNREFUSED'
```

This means your **deployment platform is blocking outbound connections to Supabase**.

## 🎯 Root Cause

Railway, Render, and some other platforms have **network restrictions** that block certain PostgreSQL connections due to:
1. IPv6/IPv4 routing issues
2. Firewall rules blocking PostgreSQL ports
3. VPC/network isolation policies
4. Regional routing problems

## ✅ Solutions (Try in Order)

### Solution 1: Switch to Supavisor Pooler (IPv4)

Supabase has a newer connection pooler called **Supavisor** that works better with restrictive hosting platforms.

**Get the Supavisor connection string:**

1. Go to: https://supabase.com/dashboard/project/pvdebaqcqlkhibnxnwpf/settings/database
2. Under **Connection string**, select **Session pooling** mode
3. Look for the connection string with **port 5432** and hostname ending in `.pooler.supabase.com`
4. Copy it

The format should be:
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?supa=base-pooler.x
```

Update your `DATABASE_URL` with this string.

### Solution 2: Use Supabase REST API Instead

If database connections are completely blocked, you can use Supabase's REST API instead of direct PostgreSQL connections.

We'll need to refactor the backend to use `@supabase/supabase-js` client library.

**Pros:**
- Works on ALL platforms (uses HTTPS)
- No network restrictions
- Built-in Row Level Security

**Cons:**
- Requires code refactoring
- Slightly different API

Would you like me to implement this?

### Solution 3: Deploy to Different Platform

Some platforms work better with Supabase than others:

| Platform | Supabase Support | Notes |
|----------|-----------------|-------|
| **Vercel** | ✅ Excellent | Recommended for Next.js/Node.js |
| **Netlify Functions** | ✅ Excellent | Good for serverless |
| **Cloudflare Workers** | ✅ Good | Requires Hyperdrive or REST API |
| **Fly.io** | ✅ Excellent | Full networking support |
| **Railway** | ⚠️ Mixed | Sometimes blocks PostgreSQL |
| **Render** | ⚠️ Mixed | IPv6 issues common |
| **Heroku** | ✅ Good | Works but expensive |

### Solution 4: Use Supabase Edge Functions

Deploy your API **directly to Supabase** as Edge Functions (runs on Deno).

**Pros:**
- No network issues (runs in same infrastructure)
- Fast
- Free tier available

**Cons:**
- Uses Deno instead of Node.js
- Need to refactor code slightly

## 🔧 Quick Test: Which Platform Are You Using?

Create a test file to diagnose the issue:

```bash
npm run test-db
```

This will show:
- Your current DATABASE_URL configuration
- Which hostname/port is being used
- Network connectivity test results

## 📋 Recommended Actions

### Immediate Fix (Choose One):

**Option A: Switch to Vercel/Fly.io** (Easiest)
1. Deploy to Vercel or Fly.io instead
2. Both have excellent Supabase support
3. No code changes needed

**Option B: Use Supabase Client Library** (Most Reliable)
1. Refactor backend to use `@supabase/supabase-js`
2. Uses HTTPS instead of PostgreSQL protocol
3. Works on ALL platforms

**Option C: Deploy as Supabase Edge Functions** (Best Performance)
1. Move API to Supabase Edge Functions
2. Zero network issues
3. Co-located with database

### Long-term Fix:

I recommend **Option B** (Supabase Client Library) because:
- ✅ Works everywhere
- ✅ Better security (Row Level Security)
- ✅ Easier to maintain
- ✅ Serverless-friendly

## 🚀 Implementation Help

Would you like me to:

1. **Refactor to use Supabase Client Library?**
   - Convert all SQL queries to Supabase JS API
   - Update authentication to use Supabase Auth
   - Keep the same Express.js API endpoints

2. **Create Vercel deployment config?**
   - Add `vercel.json`
   - Set up serverless functions
   - Deploy with one command

3. **Convert to Supabase Edge Functions?**
   - Rewrite API for Deno runtime
   - Deploy to Supabase infrastructure
   - Update frontend to use new endpoints

Let me know which solution you prefer!

## 🔍 Debugging: Check Your Current Setup

Run these commands to diagnose:

```bash
# Test database connection
npm run test-db

# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Test network connectivity (if you have shell access)
nc -zv aws-0-eu-west-1.pooler.supabase.com 6543
telnet aws-0-eu-west-1.pooler.supabase.com 6543
curl -v telnet://aws-0-eu-west-1.pooler.supabase.com:6543
```

## 📞 Platform-Specific Workarounds

### Railway
Railway has known issues with PostgreSQL connections. Try:
1. Use Session pooler (port 5432) instead of Transaction (port 6543)
2. Or migrate to Vercel/Fly.io

### Render
Render sometimes blocks IPv6. Try:
1. Request IPv4-only networking in Render support
2. Or use Supabase REST API approach

### Both Platforms Failing?
If both Railway AND Render are blocking connections, the best solution is to **use Supabase Client Library** which uses HTTPS and works everywhere.
