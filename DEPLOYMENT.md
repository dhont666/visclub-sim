# Deployment Guide - Visclub SiM

## Database Connection Issues - ECONNREFUSED Fix

### Problem
```
Error: connect ECONNREFUSED 54.247.26.119:5432
```

This error occurs when deploying to Railway, Render, or similar platforms because they often block direct PostgreSQL connections on port 5432.

### ✅ Solution: Use Transaction Pooler (Port 6543)

**Step 1: Get the correct connection string from Supabase**

1. Go to your Supabase Dashboard
2. Navigate to: **Settings → Database**
3. Scroll to **Connection Pooling**
4. Copy the **Transaction** connection string (port 6543)

**Step 2: Update your DATABASE_URL**

❌ **WRONG (Session mode - port 5432):**
```
postgresql://postgres:[PASSWORD]@db.pvdebaqcqlkhibnxnwpf.supabase.co:5432/postgres
```

✅ **CORRECT (Transaction mode - port 6543):**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Step 3: Set environment variable in your deployment platform**

**Railway:**
```bash
# In Railway dashboard → Variables
DATABASE_URL=postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Render:**
```bash
# In Render dashboard → Environment
DATABASE_URL=postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Local .env file:**
```bash
DATABASE_URL=postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

### Key Differences

| Feature | Session Mode (5432) | Transaction Mode (6543) |
|---------|-------------------|----------------------|
| **Host** | `db.xxx.supabase.co` | `aws-0-eu-west-1.pooler.supabase.com` |
| **Port** | 5432 | 6543 |
| **Username** | `postgres` | `postgres.projectref` |
| **Use Case** | Direct connection, localhost | Cloud deployment, serverless |
| **Railway/Render** | ❌ Often blocked | ✅ Works |

## Other Common Errors

### Error: password authentication failed (28P01)

**Causes:**
1. Wrong password in DATABASE_URL
2. Using wrong username format (should be `postgres.projectref` for pooler)
3. Password contains special characters that need URL encoding

**Fix:**
```bash
# If password has special chars like @#$%, URL encode them:
# @ → %40
# # → %23
# $ → %24

# Example:
# Password: my$ecret@123
# Encoded:  my%24ecret%40123
DATABASE_URL=postgresql://postgres.projectref:my%24ecret%40123@...
```

### Error: ENOTFOUND

**Causes:**
1. DNS resolution failed
2. Wrong hostname
3. Network/firewall blocking

**Fix:**
- Verify the hostname is correct
- Check internet connection
- Try from different network

## Deployment Platforms

### Railway

1. Create new project from GitHub repo
2. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres.projectref:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   PORT=3000
   ```
3. Railway will auto-detect start command from `package.json`
4. Deploy

### Render

1. Create new Web Service
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add environment variables (same as Railway)
5. Deploy

### Netlify (Static Site Only)

The `netlify.toml` is configured for the **static frontend only**. For the backend API, deploy to Railway/Render separately.

```toml
# This deploys only HTML/CSS/JS files
# API must be deployed separately
```

## Environment Variables Reference

```bash
# Required
DATABASE_URL=postgresql://postgres.projectref:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
JWT_SECRET=change-this-to-a-very-long-random-string
NODE_ENV=production
PORT=3000

# Optional
CORS_ORIGIN=https://your-frontend-domain.com
SUPABASE_URL=https://pvdebaqcqlkhibnxnwpf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing Connection Locally

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Edit .env and add your credentials
nano .env

# 3. Install dependencies
npm install

# 4. Test database connection
npm start

# Expected output:
# Starting server...
# Database connection attempt 1/3...
# ✅ Database connected successfully
#    Server time: 2025-11-01T...
# 🎣 Visclub SiM API Server
```

## Troubleshooting Checklist

- [ ] Using Transaction pooler (port 6543), not Session (port 5432)
- [ ] Username format is `postgres.projectref` not just `postgres`
- [ ] Password is correct and URL-encoded if it has special characters
- [ ] Supabase project is active (not paused)
- [ ] Environment variable is set in deployment platform
- [ ] SSL is enabled (`ssl: { rejectUnauthorized: false }`)
- [ ] Deployment platform allows outbound connections to Supabase

## Support

If you're still having issues:

1. Check Supabase status: https://status.supabase.com/
2. Check deployment platform status
3. View deployment logs for detailed error messages
4. Test connection with `psql` command line tool:
   ```bash
   psql "postgresql://postgres.projectref:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
   ```
