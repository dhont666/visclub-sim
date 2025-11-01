# 🚀 HYBRIDE SETUP - Complete Implementatie Guide

**Visclub SiM Website - Volledige Functionaliteit voor €0 per maand**

---

## 📋 Overzicht

```
┌─────────────────────────────────────────────────────────┐
│                    HYBRIDE ARCHITECTUUR                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Belgian Hosting                Railway.app              │
│  ┌──────────────┐              ┌──────────────┐        │
│  │   Website    │◄────────────►│  Backend API │        │
│  │  (Static)    │   HTTPS      │  (Node.js)   │        │
│  │              │              │              │        │
│  │ - HTML/CSS   │              │ - Express    │        │
│  │ - JavaScript │              │ - JWT Auth   │        │
│  │ - Admin UI   │              │ - REST API   │        │
│  └──────────────┘              └───────┬──────┘        │
│                                        │                │
│                                        │ SQL            │
│                                        ▼                │
│                         Supabase                        │
│                         ┌──────────────┐               │
│                         │  PostgreSQL  │               │
│                         │  Database    │               │
│                         │              │               │
│                         │ - Members    │               │
│                         │ - Results    │               │
│                         │ - Rankings   │               │
│                         └──────────────┘               │
│                                                          │
│  Bot (Railway)                                          │
│  ┌──────────────┐                                      │
│  │ Webbeheerder │                                      │
│  │     Bot      │                                      │
│  │              │                                      │
│  │ - Emails     │                                      │
│  │ - Cron Jobs  │                                      │
│  │ - Social     │                                      │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
```

**Kosten: €0/maand** (gratis tiers)

---

## ⏱️ Totale Implementatie Tijd

- **Supabase Setup:** 30-45 minuten
- **Railway Backend:** 45-60 minuten
- **Website Aanpassingen:** 15-30 minuten
- **Testing:** 30-45 minuten
- **Bot Deployment:** 30 minuten (optioneel)

**Totaal: 3-4 uur**

---

## DEEL 1: SUPABASE DATABASE SETUP

### Stap 1.1: Account Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Klik **"Start your project"**
3. Kies login methode:
   - GitHub (aanbevolen - snelste)
   - Google
   - Email

4. **Verifieer je email** (check spam folder!)

### Stap 1.2: Nieuw Project Maken

1. Klik **"New project"**
2. Kies een **organization** (maak nieuwe aan):
   - Naam: `visclub-sim` of je voorkeur

3. **Project Settings:**
   ```
   Name:        visclub-sim-db
   Database Password: [GENEREER STERK WACHTWOORD]
                      ⚠️ BEWAAR DIT GOED!
   Region:      Europe (West) - eu-west-1
   Pricing:     Free tier (€0/maand)
   ```

4. Klik **"Create new project"**
5. ⏱️ Wacht 2-3 minuten terwijl database wordt opgezet

### Stap 1.3: Database Schema Aanmaken

**In Supabase Dashboard:**

1. Klik links op **"SQL Editor"**
2. Klik **"New query"**
3. **Kopieer en plak dit schema:**

```sql
-- =============================================
-- VISCLUB SIM DATABASE SCHEMA - PostgreSQL
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- MEMBERS TABLE
-- =============================================
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    member_number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    is_veteran BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    join_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COMPETITIONS TABLE
-- =============================================
CREATE TABLE competitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255),
    type VARCHAR(50),
    counts_for_club_ranking BOOLEAN DEFAULT TRUE,
    counts_for_veteran_ranking BOOLEAN DEFAULT FALSE,
    registration_deadline DATE,
    max_participants INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- RESULTS TABLE
-- =============================================
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    position INTEGER,
    points INTEGER,
    weight_kg DECIMAL(10, 2),
    fish_count INTEGER DEFAULT 0,
    is_absent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, member_id)
);

-- =============================================
-- REGISTRATIONS TABLE
-- =============================================
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, member_id)
);

-- =============================================
-- PERMITS TABLE
-- =============================================
CREATE TABLE permits (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    permit_type VARCHAR(100) NOT NULL,
    application_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ADMIN USERS TABLE
-- =============================================
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_members_active ON members(is_active);
CREATE INDEX idx_members_veteran ON members(is_veteran);
CREATE INDEX idx_competitions_date ON competitions(date);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_results_competition ON results(competition_id);
CREATE INDEX idx_results_member ON results(member_id);
CREATE INDEX idx_registrations_competition ON registrations(competition_id);
CREATE INDEX idx_registrations_member ON registrations(member_id);

-- =============================================
-- VIEWS - RANKINGS
-- =============================================

-- Club Ranking View (best 15 of 20 competitions)
CREATE VIEW club_ranking AS
SELECT
    m.id,
    m.member_number,
    m.name,
    COUNT(r.id) as competitions_participated,
    SUM(r.points) as total_points,
    AVG(r.points) as average_points,
    (
        SELECT SUM(sub.points)
        FROM (
            SELECT r2.points
            FROM results r2
            WHERE r2.member_id = m.id
            AND r2.is_absent = FALSE
            ORDER BY r2.points ASC
            LIMIT 15
        ) sub
    ) as best_15_points
FROM members m
LEFT JOIN results r ON m.id = r.member_id
LEFT JOIN competitions c ON r.competition_id = c.id
WHERE c.counts_for_club_ranking = TRUE
  AND r.is_absent = FALSE
GROUP BY m.id, m.member_number, m.name
ORDER BY best_15_points ASC NULLS LAST;

-- Veteran Ranking View (all competitions count)
CREATE VIEW veteran_ranking AS
SELECT
    m.id,
    m.member_number,
    m.name,
    COUNT(r.id) as competitions_participated,
    SUM(r.points) as total_points,
    AVG(r.points) as average_points
FROM members m
LEFT JOIN results r ON m.id = r.member_id
LEFT JOIN competitions c ON r.competition_id = c.id
WHERE m.is_veteran = TRUE
  AND c.counts_for_veteran_ranking = TRUE
  AND r.is_absent = FALSE
GROUP BY m.id, m.member_number, m.name
ORDER BY total_points ASC NULLS LAST;

-- Recent Results View
CREATE VIEW recent_results AS
SELECT
    c.id as competition_id,
    c.name as competition_name,
    c.date as competition_date,
    c.location,
    m.id as member_id,
    m.member_number,
    m.name as member_name,
    r.position,
    r.points,
    r.weight_kg,
    r.fish_count
FROM results r
JOIN competitions c ON r.competition_id = c.id
JOIN members m ON r.member_id = m.id
WHERE r.is_absent = FALSE
ORDER BY c.date DESC, r.position ASC;

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permits_updated_at BEFORE UPDATE ON permits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email, full_name, role)
VALUES (
    'admin',
    '$2b$10$rBV2xwFfX.6.zLLRRQXGce7qYhJpXKvJqXXHKqGKXQXXXXXXXXXXXX', -- Change this!
    'admin@visclubsim.be',
    'Admin User',
    'admin'
);

-- Insert sample members
INSERT INTO members (member_number, name, email, phone, is_veteran, is_active, join_date)
VALUES
    ('M001', 'Jan Janssen', 'jan@example.com', '0412345678', FALSE, TRUE, '2020-01-15'),
    ('M002', 'Piet Pieters', 'piet@example.com', '0487654321', TRUE, TRUE, '2015-03-20'),
    ('M003', 'Klaas Klaassen', 'klaas@example.com', '0498765432', FALSE, TRUE, '2021-05-10');

COMMENT ON DATABASE postgres IS 'Visclub SiM Database';
```

4. Klik **"Run"** (of druk Ctrl+Enter)
5. ✅ Je moet zien: "Success. No rows returned"

### Stap 1.4: Database Connection String Ophalen

1. Klik links op **"Project Settings"** (tandwiel icoon)
2. Klik **"Database"** in het menu
3. Scroll naar beneden naar **"Connection string"**
4. Kies **"URI"**
5. Kopieer de connection string:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

6. **⚠️ BEWAAR DEZE STRING VEILIG!**
   - Noteer in een wachtwoord manager
   - Je hebt deze nodig voor Railway

### Stap 1.5: API Keys Ophalen

1. Klik links op **"Project Settings"**
2. Klik **"API"**
3. **Kopieer deze keys:**

```
Project URL:     https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ BEWAAR DIT VEILIG!**

---

## ✅ Checkpoint 1: Database Klaar!

Je hebt nu:
- ✅ Supabase account
- ✅ PostgreSQL database
- ✅ Complete schema
- ✅ Connection string
- ✅ API keys

**Tijd: ~30-45 minuten**

---

## DEEL 2: RAILWAY BACKEND DEPLOYMENT

### Stap 2.1: Railway Account Maken

1. Ga naar [railway.app](https://railway.app)
2. Klik **"Login"**
3. Kies **"Login with GitHub"** (aanbevolen)
4. **Autoriseer Railway** toegang tot je GitHub

### Stap 2.2: Project Voorbereiden voor Deployment

**Op je lokale computer:**

1. Open je project directory
2. **Maak een `.env.example` bestand:**

```bash
# .env.example - Template voor environment variables

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (genereer een sterke random string)
JWT_SECRET=your_super_secret_jwt_key_change_this

# CORS (je website domein)
CORS_ORIGIN=https://jouwdomein.be

# Email (optioneel - voor bot)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Facebook (optioneel - voor bot)
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_ACCESS_TOKEN=your_access_token

# YouTube (optioneel - voor bot)
YOUTUBE_API_KEY=your_api_key
```

3. **Check je `package.json`** in root directory:

Moet er zo uitzien (maak aan als niet bestaat):

```json
{
  "name": "vissersclub-sim-website",
  "version": "1.0.0",
  "description": "Visclub SiM Website en Admin Panel",
  "main": "server/api.js",
  "scripts": {
    "start": "node server/api.js",
    "dev": "nodemon server/api.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  }
}
```

**⚠️ BELANGRIJK:** Voeg `pg` (PostgreSQL client) toe aan dependencies!

4. **Installeer PostgreSQL dependency:**

```bash
npm install pg
```

### Stap 2.3: Backend Code Aanpassen voor PostgreSQL

**Check of `server/api.js` bestaat. Ik zie in CLAUDE.md dat het zou moeten bestaan.**

Als het NIET bestaat, laat het me weten en ik maak het aan!

Als het WEL bestaat, moet je SQLite vervangen door PostgreSQL:

**In `server/api.js`, vervang SQLite code door:**

```javascript
// Top van het bestand
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Database connected:', res.rows[0].now);
    }
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// ... rest van je API code
```

**⚠️ Als je nog geen `server/api.js` hebt, zeg het me dan - ik maak een complete versie!**

### Stap 2.4: Git Repository Maken (Voor Railway Deployment)

**Optie A: Gebruik GitHub (Aanbevolen)**

```bash
# In je project directory
git init
git add .
git commit -m "Initial commit - Visclub SiM"

# Maak repository op GitHub.com
# Dan:
git remote add origin https://github.com/jouw-username/visclub-sim.git
git branch -M main
git push -u origin main
```

**Optie B: Direct deployment (zonder Git)**
- Railway ondersteunt ook directory upload
- Minder flexibel, maar werkt ook

### Stap 2.5: Deploy naar Railway

**In Railway Dashboard:**

1. Klik **"New Project"**
2. Kies **"Deploy from GitHub repo"**
3. Selecteer je `visclub-sim` repository
4. Railway detecteert automatisch Node.js!
5. Klik **"Deploy"**

**Of zonder GitHub:**
1. Klik **"New Project"**
2. Kies **"Empty Project"**
3. Klik **"+ New"** → **"Empty Service"**
4. Upload je project directory

### Stap 2.6: Environment Variables Instellen

**In Railway project:**

1. Klik op je service
2. Klik **"Variables"** tab
3. Klik **"+ New Variable"**
4. **Voeg deze toe:**

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
(Plak je Supabase connection string!)

JWT_SECRET=jouw_super_geheime_random_string_hier_123456
(Genereer een sterke random string)

CORS_ORIGIN=https://jouwdomein.be
(Je Belgian Hosting domein)

NODE_ENV=production
```

5. Klik **"Add"** voor elke variabele

### Stap 2.7: Custom Domain (Railway Subdomain)

1. In Railway, klik je service
2. Klik **"Settings"**
3. Scroll naar **"Networking"**
4. Klik **"Generate Domain"**
5. Je krijgt: `visclub-sim-production.up.railway.app`

**⚠️ BEWAAR DEZE URL! Dit is je API endpoint!**

### Stap 2.8: Test de Backend

**In je browser, ga naar:**

```
https://jouw-app.up.railway.app/api/health
```

**Of een test endpoint:**

```
https://jouw-app.up.railway.app/api/members
```

✅ Als je JSON response ziet → **Backend werkt!**

---

## ✅ Checkpoint 2: Backend Online!

Je hebt nu:
- ✅ Railway account
- ✅ Backend gedeployed
- ✅ Environment variables ingesteld
- ✅ Railway URL
- ✅ Database verbinding werkt

**Tijd: ~45-60 minuten**

---

## DEEL 3: WEBSITE AANPASSEN (Belgian Hosting)

### Stap 3.1: Admin Panel API URL Wijzigen

**Bewerk `admin/admin-auth.js`:**

```javascript
// Zoek deze regel (ongeveer regel 15-20):
const USE_LOCAL_MODE = true;  // WIJZIG NAAR false

// Voeg toe (als nog niet bestaat):
const API_BASE_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ GEBRUIK JE RAILWAY URL!

class AdminAuth {
    constructor() {
        this.USE_LOCAL_MODE = false;  // BACKEND MODE!
        this.API_URL = API_BASE_URL;
        this.token = localStorage.getItem('admin_token');
    }

    // ... rest van de code
}
```

**Bewerk `admin/data-api.js`:**

```javascript
// Zoek:
const USE_BACKEND = false;  // WIJZIG NAAR true

// Voeg toe:
const BACKEND_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ GEBRUIK JE RAILWAY URL!

const dataAPI = {
    useBackend: true,  // BACKEND MODE!
    backendUrl: BACKEND_URL,

    // ... rest van de code blijft hetzelfde
};
```

### Stap 3.2: Test Lokaal

**Voor je upload naar Belgian Hosting:**

```bash
# Open in browser (gebruik lokale HTTP server)
python -m http.server 8000

# Ga naar:
http://localhost:8000/admin/login.html

# Test:
1. Login (admin / admin123)
2. Check browser console (F12) voor errors
3. Check of API calls naar Railway gaan
4. Verifieer dat data van database komt
```

### Stap 3.3: Upload naar Belgian Hosting

**Via cPanel File Manager:**

1. Login op Belgian Hosting cPanel
2. Open **File Manager**
3. Ga naar `public_html`
4. **Upload alle bestanden:**
   - Alle HTML pagina's
   - `style.css`
   - `script.js`
   - `.htaccess`
   - `contact-handler.php`
   - **Hele `admin/` directory** (met aangepaste bestanden!)
   - `images/` directory

5. **NIET uploaden:**
   - `node_modules/`
   - `server/`
   - `bot/` (deployen we apart)
   - `database/`
   - `.git/`
   - `.env`

### Stap 3.4: Test Live Website

**Ga naar je domein:**

```
https://jouwdomein.be
```

**Test deze dingen:**

- [ ] Home page laadt
- [ ] Navigatie werkt
- [ ] Kalender toont data
- [ ] SSL certificaat werkt (groen slotje)

**Test Admin Panel:**

```
https://jouwdomein.be/admin/login.html
```

- [ ] Login werkt
- [ ] Dashboard laadt
- [ ] Data komt van database (niet LocalStorage)
- [ ] Wijzigingen worden opgeslagen
- [ ] Check browser console voor errors (F12)

**Check Network Tab (F12 → Network):**
- API calls gaan naar `https://jouw-app.up.railway.app/api/...`
- Status 200 OK
- JSON responses komen terug

---

## ✅ Checkpoint 3: Website + Backend Connected!

Je hebt nu:
- ✅ Website op Belgian Hosting
- ✅ Admin panel werkt met backend
- ✅ Data persistent in database
- ✅ SSL werkt
- ✅ API calls werken

**Tijd: ~15-30 minuten**

---

## DEEL 4: BOT DEPLOYMENT (Optioneel)

### Stap 4.1: Bot Voorbereiden

**In `bot/` directory, check `package.json`:**

```json
{
  "name": "visclub-sim-bot",
  "version": "1.0.0",
  "main": "webbeheerder-bot.js",
  "scripts": {
    "start": "node webbeheerder-bot.js"
  },
  "dependencies": {
    "node-fetch": "^2.6.7",
    "nodemailer": "^6.9.7",
    "node-cron": "^3.0.2",
    "dotenv": "^16.3.1"
  }
}
```

### Stap 4.2: Deploy Bot naar Railway

**Nieuwe service in Railway:**

1. In je Railway project, klik **"+ New"**
2. Kies **"GitHub Repo"** (zelfde repo)
3. Onder **"Root Directory"**: typ `bot`
4. Railway deployet nu alleen de bot directory!

**Environment variables voor bot:**

```
API_URL=https://jouw-backend.up.railway.app/api
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jouw-email@gmail.com
SMTP_PASS=jouw-app-wachtwoord
FACEBOOK_PAGE_ID=jouw-page-id
FACEBOOK_ACCESS_TOKEN=jouw-token
```

### Stap 4.3: Scheduled Jobs Instellen

**In Railway bot service:**

1. Klik **"Settings"**
2. Scroll naar **"Cron Schedule"**
3. Voeg toe (bijvoorbeeld):

```
0 8 * * * - Dagelijks om 8:00 (notificaties)
0 18 * * 5 - Vrijdag 18:00 (weekend reminder)
```

---

## ✅ ALLES KLAAR! 🎉

---

## 📊 FINALE CHECKLIST

### Database (Supabase)
- [ ] Account aangemaakt
- [ ] Database schema uitgevoerd
- [ ] Connection string opgeslagen
- [ ] Test query uitgevoerd

### Backend (Railway)
- [ ] Account aangemaakt
- [ ] Backend gedeployed
- [ ] Environment variables ingesteld
- [ ] Railway URL genoteerd
- [ ] Health check werkt

### Website (Belgian Hosting)
- [ ] Alle bestanden geupload
- [ ] Admin panel API URL aangepast
- [ ] SSL certificaat actief
- [ ] Website bereikbaar
- [ ] Admin login werkt
- [ ] Data persistent

### Bot (Railway) - Optioneel
- [ ] Bot gedeployed
- [ ] Environment variables ingesteld
- [ ] Scheduled jobs geconfigureerd

---

## 🎯 WAT NU?

### Test Alles Grondig

1. **Publieke Website:**
   - [ ] Alle pagina's laden
   - [ ] Formulieren werken
   - [ ] Kalender toont data

2. **Admin Panel:**
   - [ ] Login werkt
   - [ ] Leden toevoegen/bewerken
   - [ ] Wedstrijden aanmaken
   - [ ] Resultaten invoeren
   - [ ] Klassement bekijken

3. **Database:**
   - Check in Supabase dashboard
   - Zie je nieuwe data verschijnen?

### Performance

1. Test snelheid:
   - Website laadt < 3 seconden
   - API responses < 500ms

2. Check errors:
   - Browser console (F12)
   - Railway logs
   - Supabase logs

---

## 💰 Kosten Overzicht

```
Belgian Hosting:        €X/maand (je gekozen pakket)
Railway (Backend):      €0/maand (500 uur gratis)
Railway (Bot):          €0/maand (500 uur gratis)
Supabase (Database):    €0/maand (500MB gratis)
─────────────────────────────────────────────────
TOTAAL EXTRA:           €0/maand! 🎉
```

**Gratis tier limieten:**
- Railway: 500 uur/maand (ruim genoeg!)
- Supabase: 500MB opslag (jaren data!)
- Railway: 100GB bandwidth

**Voor een visclub website: Ruim voldoende!**

---

## 🚀 Volgende Stappen

1. **Documentatie**
   - Noteer alle URLs en wachtwoorden
   - Maak backup

2. **Monitoring**
   - Check Railway dashboard wekelijks
   - Monitor database groei in Supabase

3. **Updates**
   - Git push naar main → Auto-deploy op Railway!
   - Supabase backups zijn automatisch

---

Succes met je deployment! Laat me weten als je ergens vastloopt! 🎣
