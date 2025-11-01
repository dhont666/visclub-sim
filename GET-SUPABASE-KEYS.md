# How to Get Your Supabase API Keys

## 🔑 Step-by-Step Guide

### Step 1: Open Supabase Dashboard

Click this link (or copy-paste in browser):
```
https://supabase.com/dashboard/project/pvdebaqcqlkhibnxnwpf/settings/api
```

If you're not logged in, log in to your Supabase account first.

### Step 2: Find the API Settings Page

You should see a page titled **"API Settings"** with sections:
1. **Project URL**
2. **Project API keys**
3. **JWT Settings**

### Step 3: Copy the Required Values

You need **TWO** values:

#### 1. Project URL
Look for the section "Configuration" → "Project URL"

It should be:
```
https://pvdebaqcqlkhibnxnwpf.supabase.co
```

**Copy this entire URL.**

#### 2. Service Role Key (Secret)
Look for the section "Project API keys"

You'll see TWO keys:
- ❌ **anon** `public` - This is NOT the one you need
- ✅ **service_role** `secret` - **THIS IS THE ONE YOU NEED**

The service_role key:
- Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
- Is very long (300+ characters)
- Has a 👁️ (eye) icon to reveal it
- Says "This key has the ability to bypass Row Level Security"

**Click the 👁️ icon to reveal the key, then copy the ENTIRE key.**

### Step 4: Verify You Have Both Values

Before continuing, make sure you have:

✅ **SUPABASE_URL**:
```
https://pvdebaqcqlkhibnxnwpf.supabase.co
```

✅ **SUPABASE_SERVICE_KEY** (example format):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZGViYXFjcWxraGlibnhud3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDQ1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT**:
- The service_role key is SECRET - never commit it to git!
- It should be at least 200+ characters long
- If you copied the `anon` key by mistake, go back and copy the `service_role` key instead

## 🚀 Next Steps

Now that you have both keys, follow these instructions based on where you want to deploy:

### For Railway:

1. Go to: https://railway.app/dashboard
2. Open your project
3. Click on your service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add these TWO variables:

```
SUPABASE_URL
https://pvdebaqcqlkhibnxnwpf.supabase.co

SUPABASE_SERVICE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZGViYXFjcWxraGlibnhud3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDQ1NTc2MDAwfQ.your-actual-key-here
```

7. **REMOVE** the old `DATABASE_URL` variable (if it exists)
8. Click **Deploy** or push your code to trigger a redeploy

### For Render:

1. Go to: https://dashboard.render.com/
2. Open your Web Service
3. Click **Environment** in the left menu
4. Click **Add Environment Variable**
5. Add these TWO variables (same as above)
6. **DELETE** the old `DATABASE_URL` variable
7. Click **Save Changes** (Render auto-redeploys)

### For Local Development (.env file):

1. Open your `.env` file (or create one from `.env.example`)
2. Add these lines:

```bash
SUPABASE_URL=https://pvdebaqcqlkhibnxnwpf.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
JWT_SECRET=your-jwt-secret-key
PORT=3000
```

3. Save the file
4. Run: `npm start`

## ✅ Verify It Works

After deploying, check your logs. You should see:

```
✅ Supabase client initialized
   URL: https://pvdebaqcqlkhibnxnwpf.supabase.co
🎣 Visclub SiM API Server
   (Supabase Client Version)
   Port: 3000
   Connection: HTTPS (Supabase Client)
```

Test the health endpoint:
```bash
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## ❓ Troubleshooting

### Can't find the API settings page?

Direct link: https://supabase.com/dashboard/project/pvdebaqcqlkhibnxnwpf/settings/api

Or navigate manually:
1. Go to https://supabase.com/dashboard
2. Click on your project "pvdebaqcqlkhibnxnwpf"
3. Click the ⚙️ Settings icon (bottom left)
4. Click "API" in the settings menu

### Can't see the service_role key?

Click the 👁️ (eye) icon next to the key to reveal it. The key is hidden by default for security.

### Copied the wrong key?

Make sure you copied the **service_role** key (marked as `secret`), NOT the **anon** key (marked as `public`).

The service_role key is needed for the backend API to have full database access.

### Still getting errors?

1. Double-check both values are set correctly (no extra spaces)
2. Make sure you REMOVED the old `DATABASE_URL` variable
3. Make sure you redeployed after setting the variables
4. Check deployment logs for specific error messages

## 📸 Visual Guide

When you open the API settings page, you should see:

```
┌─────────────────────────────────────────┐
│ API Settings                             │
├─────────────────────────────────────────┤
│                                          │
│ Configuration                            │
│ ┌─────────────────────────────────────┐ │
│ │ URL                                 │ │
│ │ https://pvdebaqcqlkhibnxnwpf.supa… │ │ ← COPY THIS
│ └─────────────────────────────────────┘ │
│                                          │
│ Project API keys                         │
│ ┌─────────────────────────────────────┐ │
│ │ anon                         public │ │ ← NOT THIS ONE
│ │ eyJhbGc...                    👁️   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ service_role                 secret │ │ ← COPY THIS ONE
│ │ eyJhbGc...                    👁️   │ │
│ └─────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

Click the 👁️ icon next to **service_role** and copy the entire revealed key!

## 🎉 You're Done!

Once you have both keys set up in your deployment platform, your app will:
- ✅ Connect via HTTPS (no more ECONNREFUSED errors)
- ✅ Work on ALL platforms (Railway, Render, Vercel, etc.)
- ✅ Be more secure and scalable
- ✅ Handle all API requests correctly

Need more help? Check `MIGRATION-GUIDE.md` for detailed deployment instructions!
