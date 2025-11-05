# 🚀 Deployment Checklist - Visclub SiM Website

## ✅ Wat is er gedaan (Optimalisaties)

### 1. Database Schema ✅
- **`database/schema.sql`** - Complete PostgreSQL schema met:
  - Alle tabellen (members, competitions, registrations, results, permits, etc.)
  - Indexes voor performance
  - Views voor rankings (club_ranking, veteran_ranking)
  - Triggers voor automatic timestamps
  - Functies voor complexe operaties
  - Seed data voor testen

### 2. Security (RLS Policies) ✅
- **`database/rls-policies.sql`** - Row Level Security:
  - Public kan enkel publieke data lezen (members, competitions, results)
  - Privé data (admin_users, permits, messages) alleen via backend API
  - Service role heeft volledige toegang

### 3. Backend API Security Fixes ✅
- **Rate limiting** toegevoegd:
  - 100 requests/15min voor algemene API
  - 5 login attempts/15min voor auth endpoints
- **JWT validation** verbeterd:
  - Minimaal 32 characters vereist
  - Fail-fast bij ontbrekende/zwakke secrets
  - Duidelijke error codes (TOKEN_EXPIRED, INVALID_TOKEN, etc.)
- **CORS whitelist** geconfigureerd:
  - Geen wildcard (*) meer in productie
  - Expliciete domain whitelist
  - Logging van blocked requests
- **Input sanitization**:
  - Password/token logging verboden
  - Payload size limits (10MB)
  - Request body validation

### 4. Admin Panel Improvements ✅
- **Automatic environment detection** (`admin/config.js`):
  - Localhost → `http://localhost:3000/api`
  - Productie → automatisch eigen domein
- **Offline fallback** (`admin/data-api.js`):
  - Offline queue voor wanneer backend down is
  - Automatische synchronisatie wanneer online
  - Visual feedback (oranje banner)
- **Config centralization**:
  - Eén configuratie bestand voor hele admin panel
  - Geen hardcoded URLs meer

### 5. Documentation ✅
- **UPDATE_ADMIN_FILES.md** - Instructies voor HTML files updaten
- **.env.example** - Gedetailleerde environment configuratie
- **DEPLOYMENT_CHECKLIST.md** (dit bestand)

## 📋 Nog Te Doen Voor Deployment

### 1. Database Setup
```bash
# Stap 1: Open Supabase Dashboard → SQL Editor
# Stap 2: Run database/schema.sql (ALLE tabellen worden aangemaakt)
# Stap 3: Run database/rls-policies.sql (Security wordt ingesteld)
```

### 2. Environment Variables
```bash
# Stap 1: Kopieer .env.example naar .env
cp .env.example .env

# Stap 2: Genereer JWT secret (minimaal 32 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Stap 3: Vul .env in met:
# - SUPABASE_URL (van Supabase Dashboard)
# - SUPABASE_SERVICE_KEY (van Supabase Dashboard → API settings)
# - JWT_SECRET (gegenereerde waarde uit stap 2)
# - CORS_ORIGIN (je productie domein)
```

### 3. Install Dependencies
```bash
# Backend dependencies (inclusief express-rate-limit)
npm install

# Check of alles geïnstalleerd is:
npm list express-rate-limit
npm list @supabase/supabase-js
npm list bcrypt
npm list jsonwebtoken
```

### 4. Admin Panel HTML Files Updaten
Alle admin HTML files moeten `config.js` laden. Doe dit voor:

```
admin/index.html
admin/plaatsentrekking.html
admin/leden.html
admin/settings.html
admin/vergunningen.html
admin/weging.html
admin/contact-berichten.html
admin/klassement-beheer.html
admin/admin-chat.html
```

Voeg dit toe in `<head>` van ELKE file:
```html
<!-- Load config first -->
<script src="config.js"></script>
<script src="data-api.js"></script>
<script src="admin-auth.js"></script>
```

### 5. Public Website Optimization
Voeg `config.js` toe voor public website om ook Supabase te gebruiken:

```javascript
// public/config.js
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : `${window.location.origin}/api`,
    CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};
```

Laad in alle HTML files:
```html
<script src="config.js"></script>
```

### 6. Test Locally
```bash
# Start backend API
npm start

# Je zou moeten zien:
# ✅ Supabase client initialized
# ✅ JWT_SECRET validated (length: XX characters)
# 🚀 Server running on http://localhost:3000
```

Open admin panel:
```
http://localhost:3000/admin/login.html

Login: admin
Password: admin123
```

Check console voor:
```
🔧 Configuration loaded: { environment: 'development', ... }
📊 DataAPI initialized - using Backend API
✅ Backend API is reachable
```

### 7. Git Commit & Push

**BELANGRIJK:** Check eerst of `.env` NIET in git zit:
```bash
# .env moet in .gitignore staan
cat .gitignore | grep .env

# Als .env niet in .gitignore staat, voeg toe:
echo ".env" >> .gitignore
```

Commit alle changes:
```bash
git add .
git commit -m "feat: Complete Supabase migration and security improvements

- Add complete database schema with RLS policies
- Implement rate limiting and JWT validation
- Add admin panel offline fallback
- Centralize configuration with auto-detection
- Improve CORS security with whitelist
- Add comprehensive documentation"

git push origin master
```

## 🔒 Security Checklist

- [ ] `.env` is NIET in git
- [ ] JWT_SECRET is minimaal 32 characters en uniek
- [ ] SUPABASE_SERVICE_KEY wordt alleen server-side gebruikt
- [ ] CORS_ORIGIN is ingesteld op je productie domein (niet '*')
- [ ] RLS policies zijn actief in Supabase
- [ ] Admin wachtwoorden zijn gewijzigd van defaults
- [ ] Rate limiting is actief

## 📊 Performance Checklist

- [ ] Database indexes zijn aangemaakt (via schema.sql)
- [ ] Views zijn aangemaakt voor rankings
- [ ] Caching is geïmplementeerd in data-api.js
- [ ] Payload size limits zijn ingesteld (10MB)
- [ ] Supabase connection pooling is gebruikt

## 🌐 Public Website Updates Needed

### Files to Update:
1. **home.html, kalender.html, klassement.html, etc.**
   - Load config.js
   - Use API instead of hardcoded data

2. **script.js**
   - Move calendarData to database
   - Fetch from /api/competitions

3. **klassement-data.js**
   - Remove hardcoded rankings
   - Fetch from /api/rankings/club en /api/rankings/veteran

### Example Updates:

**Before (script.js):**
```javascript
const calendarData = [ /* 38KB hardcoded data */ ];
```

**After (script.js):**
```javascript
async function loadCalendar() {
    const response = await fetch(`${CONFIG.API_BASE_URL}/competitions?upcoming=true`);
    const data = await response.json();
    return data;
}
```

**Before (klassement-data.js):**
```javascript
function calculateRanking(results) {
    // Complex client-side calculation
}
```

**After (klassement-data.js):**
```javascript
async function loadRankings(type = 'club') {
    const response = await fetch(`${CONFIG.API_BASE_URL}/rankings/${type}`);
    return await response.json();
}
```

## 🚀 Deployment to Production

### Option 1: Netlify (Static Frontend) + Backend API elsewhere
1. Frontend: Deploy to Netlify (auto via git push)
2. Backend: Deploy to Railway/Render/Heroku
3. Set CORS_ORIGIN to Netlify URL

### Option 2: All-in-one (Vercel/Railway)
1. Deploy entire project
2. Set environment variables in dashboard
3. Ensure backend API starts on deployment

### Environment Variables for Production:
```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-strong-random-secret-min-32-chars
CORS_ORIGIN=https://visclubsim.be,https://www.visclubsim.be
PORT=3000
```

## 🧹 Cleanup Tasks

### Remove Legacy Code
```bash
# Optional: Remove migration script (not needed per user request)
rm database/migrate-localstorage.js

# Remove old localStorage-only code (after testing API works)
# Check admin-script.js for localStorage references
```

### Test & Verify
- [ ] Test admin login works
- [ ] Test member CRUD works via API
- [ ] Test rankings load from database
- [ ] Test offline mode works (disable backend)
- [ ] Test rate limiting (try 6 login attempts)
- [ ] Test CORS (try from different domain)

## 📚 Additional Resources

- Supabase Docs: https://supabase.com/docs
- Rate Limiting: https://www.npmjs.com/package/express-rate-limit
- JWT Best Practices: https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/

## 🆘 Troubleshooting

### Server won't start
- Check if JWT_SECRET is set and ≥32 chars
- Check if SUPABASE_URL and SUPABASE_SERVICE_KEY are correct
- Run: `npm install` to ensure dependencies are installed

### Admin panel shows "Backend unreachable"
- Check if `npm start` is running
- Check if PORT is correct (default 3000)
- Check browser console for CORS errors

### Database queries fail
- Check if schema.sql was run successfully
- Check if RLS policies are enabled
- Check if SERVICE_KEY (not ANON_KEY) is used in backend

### Rate limiting too strict
- Adjust in server/api-supabase.js:
  - apiLimiter: max: 100 (general API)
  - authLimiter: max: 5 (login attempts)

## ✅ Final Steps

1. [ ] Database schema deployed
2. [ ] RLS policies deployed
3. [ ] Backend API running
4. [ ] Admin panel tested
5. [ ] Public website updated
6. [ ] Git committed & pushed
7. [ ] Production deployed
8. [ ] DNS configured
9. [ ] SSL certificate active
10. [ ] Monitoring setup

---

**🎉 Klaar! Je Visclub SiM website is nu production-ready!**
