# 🎯 START HIER - Hybride Setup in 4 Stappen

**Volledige functionaliteit voor €0 per maand!**

---

## ✅ Wat Je Nodig Hebt

- [ ] Belgian Hosting account (heb je al)
- [ ] GitHub account (voor Railway deployment)
- [ ] Email adres
- [ ] 3-4 uur tijd

---

## 🚀 DE 4 STAPPEN

```
STAP 1: SUPABASE (Database)     → 30-45 min
STAP 2: RAILWAY (Backend API)   → 45-60 min
STAP 3: WEBSITE (Belgian Hosting) → 15-30 min
STAP 4: TESTEN                   → 30-45 min
════════════════════════════════════════════
TOTAAL:                          3-4 uur
```

---

## STAP 1: SUPABASE DATABASE 🗄️

### 1.1 Account Aanmaken

1. Ga naar **[supabase.com](https://supabase.com)**
2. Klik **"Start your project"**
3. Login met **GitHub** (makkelijkst)
4. Verifieer je email

### 1.2 Project Maken

1. Klik **"New project"**
2. Vul in:
   ```
   Name: visclub-sim-db
   Database Password: [GENEREER EN BEWAAR!]
   Region: Europe (West)
   Pricing: Free
   ```
3. Klik **"Create new project"**
4. ⏱️ Wacht 2-3 minuten

### 1.3 Database Schema

1. Klik links: **"SQL Editor"**
2. Klik **"New query"**
3. **Open in je project:** `HYBRIDE_SETUP_COMPLETE_GUIDE_NL.md`
4. **Kopieer het SQL schema** (zoek naar "CREATE TABLE members")
5. **Plak in Supabase SQL Editor**
6. Klik **"Run"**
7. ✅ Moet zien: "Success. No rows returned"

### 1.4 Connection String Ophalen

1. Klik **"Project Settings"** (tandwiel)
2. Klik **"Database"**
3. Scroll naar **"Connection string"**
4. Kies **"URI"**
5. **KOPIEER EN BEWAAR:**
   ```
   postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

**✅ Database klaar!**

---

## STAP 2: RAILWAY BACKEND 🚂

### 2.1 Dependencies Installeren

**Op je computer, in project directory:**

```bash
# Installeer Node.js dependencies
npm install

# Check dat deze geïnstalleerd zijn:
# ✓ express
# ✓ cors
# ✓ jsonwebtoken
# ✓ bcrypt
# ✓ pg (PostgreSQL client)
# ✓ dotenv
```

### 2.2 Test Lokaal (Optioneel)

```bash
# Maak .env bestand (kopieer van .env.example)
cp .env.example .env

# Bewerk .env:
# - Plak je Supabase DATABASE_URL
# - Zet een JWT_SECRET
# - Zet CORS_ORIGIN=http://localhost:8000

# Start backend
npm start

# Test in browser:
# http://localhost:3000/api/health
```

### 2.3 GitHub Repository

**Als je nog geen GitHub repo hebt:**

```bash
# In je project directory
git init
git add .
git commit -m "Initial commit - Visclub SiM hybride setup"

# Ga naar github.com
# Klik "+ New repository"
# Naam: visclub-sim
# Klik "Create repository"

# Terug in terminal:
git remote add origin https://github.com/jouw-username/visclub-sim.git
git branch -M main
git push -u origin main
```

### 2.4 Railway Account & Deployment

1. Ga naar **[railway.app](https://railway.app)**
2. Klik **"Login"**
3. Kies **"Login with GitHub"**
4. Autoriseer Railway

**Deploy Project:**

1. Klik **"New Project"**
2. Kies **"Deploy from GitHub repo"**
3. Selecteer je **visclub-sim** repository
4. Railway detecteert Node.js automatisch!
5. Klik **"Deploy"**

### 2.5 Environment Variables

**In Railway project:**

1. Klik je service
2. Klik **"Variables"** tab
3. Klik **"+ New Variable"**

**Voeg toe (één voor één):**

```
DATABASE_URL=postgresql://postgres:[PASS]@db.xxxxx.supabase.co:5432/postgres
(Je Supabase connection string!)

JWT_SECRET=super-geheime-random-string-minimaal-32-karakters
(Genereer een sterke random string!)

CORS_ORIGIN=https://jouwdomein.be
(Je Belgian Hosting domein!)

NODE_ENV=production
```

### 2.6 Railway URL Krijgen

1. In je Railway service
2. Klik **"Settings"**
3. Scroll naar **"Networking"**
4. Klik **"Generate Domain"**
5. **BEWAAR DEZE URL:**
   ```
   https://visclub-sim-production.up.railway.app
   ```

### 2.7 Test Backend

**Open in browser:**
```
https://jouw-app.up.railway.app/api/health
```

✅ **Moet JSON zien:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T...",
  "environment": "production"
}
```

**✅ Backend online!**

---

## STAP 3: WEBSITE ONLINE 🌐

### 3.1 Admin Panel Aanpassen

**Bewerk `admin/admin-auth.js`:**

```javascript
// Zoek regel ~15-20:
const USE_LOCAL_MODE = false;  // WIJZIG NAAR false!

// Voeg toe:
const API_BASE_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ GEBRUIK JE RAILWAY URL!
```

**Bewerk `admin/data-api.js`:**

```javascript
// Zoek:
const USE_BACKEND = true;  // WIJZIG NAAR true!

// Voeg toe:
const BACKEND_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ GEBRUIK JE RAILWAY URL!
```

### 3.2 Upload naar Belgian Hosting

**Via cPanel File Manager:**

1. Login op Belgian Hosting cPanel
2. Open **"File Manager"**
3. Ga naar **`public_html`**

**Upload deze bestanden/directories:**

✅ Alle HTML bestanden (home.html, kalender.html, etc.)
✅ style.css, script.js, klassement-data.js, vijverkaart.js
✅ .htaccess
✅ contact-handler.php
✅ **Admin directory** (met aangepaste bestanden!)
✅ images/ directory
✅ assets/ (indien aanwezig)

❌ **NIET uploaden:**
- node_modules/
- server/
- bot/
- database/
- tests/
- .git/
- .env
- package.json

### 3.3 SSL Installeren

1. In cPanel, zoek **"SSL/TLS Status"**
2. Klik **"Run AutoSSL"**
3. Wacht 1-2 minuten
4. ✅ Groen vinkje bij je domein

**✅ Website online!**

---

## STAP 4: TESTEN ✅

### 4.1 Test Website

**Open in browser:**
```
https://jouwdomein.be
```

**Check:**
- [ ] Website laadt
- [ ] SSL werkt (groen slotje)
- [ ] Navigatie werkt
- [ ] Alle pagina's laden

### 4.2 Test Admin Panel

**Ga naar:**
```
https://jouwdomein.be/admin/login.html
```

**Test:**
1. Login: `admin` / `admin123`
2. Dashboard laadt
3. **Open browser console (F12)**
4. Check Network tab:
   - API calls gaan naar Railway URL
   - Status 200 OK
   - JSON responses
5. Test functionaliteit:
   - Leden toevoegen
   - Wedstrijd aanmaken
   - Data wordt opgeslagen

### 4.3 Check Database

**In Supabase dashboard:**

1. Klik **"Table Editor"**
2. Klik **"members"** table
3. Zie je de test member die je toevoegde?
4. ✅ Data persistent!

---

## 🎉 KLAAR! ALLES WERKT!

```
✅ Database  → Supabase (PostgreSQL)
✅ Backend   → Railway (Node.js API)
✅ Website   → Belgian Hosting
✅ Admin     → Verbonden met backend
✅ SSL       → Let's Encrypt
✅ Kosten    → €0 extra per maand!
```

---

## 📋 SNELLE REFERENTIE

### URLs

```
Website:         https://jouwdomein.be
Admin:           https://jouwdomein.be/admin/
Backend API:     https://jouw-app.up.railway.app/api
Database:        Supabase dashboard
```

### Credentials

```
Admin Login:     admin / admin123 (WIJZIG DIT!)
Supabase:        [Je email]
Railway:         GitHub login
Belgian Hosting: [Je cPanel credentials]
```

### Belangrijke Files

```
Backend:        server/api.js
Database Schema: Supabase SQL Editor
Environment:    Railway Variables
Admin Config:   admin/admin-auth.js
                admin/data-api.js
```

---

## 🔄 Updates Doen

**Code wijzigen en deployen:**

```bash
# Maak wijzigingen in je code
# Commit naar Git:
git add .
git commit -m "Beschrijving van wijziging"
git push

# Railway detecteert automatisch en deployet!
# Check Railway dashboard voor deploy status
```

---

## 💡 TIPS

**Wachtwoorden wijzigen:**
1. Bewerk `admin/login.html`
2. Wijzig de validUsers object
3. Upload nieuwe versie

**Database backups:**
- Supabase doet dit automatisch!
- Check: Settings → Backups

**Monitoring:**
- Railway: Logs tab in dashboard
- Supabase: Logs & Reports
- Check wekelijks voor errors

**Kosten checken:**
- Railway: Usage tab (500 uur gratis)
- Supabase: Usage tab (500MB gratis)
- Beide ruim voldoende voor visclub!

---

## 🆘 HULP NODIG?

**Probleem met...**

**Database:** Check `HYBRIDE_SETUP_COMPLETE_GUIDE_NL.md` → Deel 1
**Backend:** Check `HYBRIDE_SETUP_COMPLETE_GUIDE_NL.md` → Deel 2
**Website:** Check `SNELSTART_DEPLOYMENT_NL.md`
**Admin:** Check browser console (F12) voor errors

**Stuck?** Check de volledige guide:
→ `HYBRIDE_SETUP_COMPLETE_GUIDE_NL.md`

---

**Succes! 🎣**
