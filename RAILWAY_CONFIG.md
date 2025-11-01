# 🚂 RAILWAY CONFIGURATIE - Visclub SiM

## JE SPECIFIEKE GEGEVENS

### Supabase Database
```
Project URL: https://pvdebaqcqlkhibnxnwpf.supabase.co
Database URL: postgresql://postgres:Kutwijf666!@db.pvdebaqcqlkhibnxnwpf.supabase.co:5432/postgres

Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZGViYXFjcWxraGlibnhud3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDcwOTksImV4cCI6MjA3NzUyMzA5OX0.xke-8ClnstEKPLRabr8nZ6uzcG2vrReURb_O3zIjXH8

Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZGViYXFjcWxraGlibnhud3BmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk0NzA5OSwiZXhwIjoyMDc3NTIzMDk5fQ.9qdxbABfJQJbGl5haSyNl3EMEEpaMu4_qjEErjpbzBE
```

---

## STAP-VOOR-STAP: RAILWAY DEPLOYMENT

### Stap 1: GitHub Repository Maken

Als je nog geen GitHub repo hebt:

```bash
# Open terminal/command prompt in je project directory
cd C:\Users\kevin\Desktop\VIsWEBSITE\vissersclub-sim-website

# Initialiseer Git (als nog niet gedaan)
git init

# Voeg alle bestanden toe
git add .

# Maak eerste commit
git commit -m "Initial commit - Visclub SiM hybride setup"
```

**Ga naar GitHub.com:**
1. Klik op "+" → "New repository"
2. Repository naam: `visclub-sim`
3. Kies: Private (aanbevolen) of Public
4. **Klik NIET op:** "Initialize with README"
5. Klik "Create repository"

**Koppel je lokale repo aan GitHub:**
```bash
# Vervang 'jouw-username' door je GitHub username
git remote add origin https://github.com/jouw-username/visclub-sim.git
git branch -M main
git push -u origin main
```

---

### Stap 2: Railway Account & Project

1. Ga naar **[railway.app](https://railway.app)**
2. Klik **"Login"**
3. Kies **"Login with GitHub"**
4. Autoriseer Railway toegang tot je GitHub account
5. Klik **"New Project"**
6. Kies **"Deploy from GitHub repo"**
7. Zoek en selecteer: **visclub-sim**
8. Railway detecteert automatisch Node.js! ✅
9. Klik **"Deploy"**
10. Wacht 2-3 minuten voor eerste deployment

---

### Stap 3: Environment Variables Instellen

**In je Railway project:**

1. Klik op je service (ziet eruit als een kaart)
2. Klik op **"Variables"** tab (bovenaan)
3. Klik **"+ New Variable"**

**Voeg deze variables toe (één voor één):**

#### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres:Kutwijf666!@db.pvdebaqcqlkhibnxnwpf.supabase.co:5432/postgres
```

#### Variable 2: JWT_SECRET
**Genereer eerst een sterke random string:**
```bash
# Op je computer, run dit commando:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Kopieer de output en gebruik als JWT_SECRET:
```
Key: JWT_SECRET
Value: [DE GEGENEREERDE STRING HIER]
```

**Voorbeeld output:**
```
a3f5b8c2d1e7f9a4b6c8d2e5f7a9b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8
```

#### Variable 3: CORS_ORIGIN
```
Key: CORS_ORIGIN
Value: https://jouwdomein.be
```
⚠️ **VERVANG `jouwdomein.be` door je ECHTE Belgian Hosting domein!**

#### Variable 4: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variable 5: PORT (Optioneel - Railway zet dit meestal automatisch)
```
Key: PORT
Value: 3000
```

#### Variable 6: SUPABASE_URL (Optioneel - voor toekomstige features)
```
Key: SUPABASE_URL
Value: https://pvdebaqcqlkhibnxnwpf.supabase.co
```

#### Variable 7: SUPABASE_ANON_KEY (Optioneel)
```
Key: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZGViYXFjcWxraGlibnhud3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NDcwOTksImV4cCI6MjA3NzUyMzA5OX0.xke-8ClnstEKPLRabr8nZ6uzcG2vrReURb_O3zIjXH8
```

---

### Stap 4: Domain Genereren

1. In je Railway service
2. Klik **"Settings"** (tandwiel icon)
3. Scroll naar **"Networking"** sectie
4. Klik **"Generate Domain"**
5. Je krijgt een URL zoals:
   ```
   https://visclub-sim-production.up.railway.app
   ```
6. **KOPIEER DEZE URL - JE HEBT HEM NODIG!** 📋

---

### Stap 5: Test Je Backend

Open in je browser:
```
https://jouw-railway-url.up.railway.app/api/health
```

✅ **Success!** Je zou JSON moeten zien:
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:34:56.789Z",
  "environment": "production"
}
```

❌ **Error?** Check:
- Railway logs (Logs tab in dashboard)
- Environment variables zijn correct ingesteld
- DATABASE_URL bevat het juiste wachtwoord
- Redeploy: Settings → Deploy → "Redeploy"

---

### Stap 6: Update Admin Panel Code

**NU MOET JE JE CODE AANPASSEN MET JE RAILWAY URL!**

#### Bestand 1: admin/admin-auth.js

Open `admin/admin-auth.js` en wijzig:

```javascript
// ZOEK REGEL ~17:
this.USE_LOCAL_MODE = true; // ← WIJZIG NAAR false

// ZOEK REGEL ~21:
this.API_BASE_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ WIJZIG DIT NAAR JE RAILWAY URL!
```

**Na wijziging:**
```javascript
this.USE_LOCAL_MODE = false;
this.API_BASE_URL = 'https://visclub-sim-production.up.railway.app/api';
```

#### Bestand 2: admin/data-api.js

Open `admin/data-api.js` en wijzig:

```javascript
// ZOEK REGEL ~14:
this.USE_LOCAL_MODE = true; // ← WIJZIG NAAR false

// ZOEK REGEL ~18:
this.API_BASE_URL = 'https://jouw-app.up.railway.app/api';
// ☝️ WIJZIG DIT NAAR JE RAILWAY URL!
```

**Na wijziging:**
```javascript
this.USE_LOCAL_MODE = false;
this.API_BASE_URL = 'https://visclub-sim-production.up.railway.app/api';
```

---

### Stap 7: Deploy naar Belgian Hosting

**Nu kun je uploaden naar Belgian Hosting!**

1. Login op Belgian Hosting cPanel
2. Open File Manager
3. Ga naar `public_html/`
4. Upload de aangepaste admin bestanden
5. Upload alle andere website bestanden (zie DEPLOYMENT_CHECKLIST.md)

---

## 🔄 UPDATES DOEN

### Code wijzigen en opnieuw deployen:

```bash
# Maak je wijzigingen in de code
# Commit naar Git:
git add .
git commit -m "Beschrijving van wijziging"
git push

# Railway detecteert automatisch en deployet!
# Check Railway dashboard voor deploy status
```

---

## 📊 MONITORING

### Railway Dashboard Checken

1. **Usage Tab:**
   - Gratis tier: 500 uur/maand
   - Check maandelijks je usage

2. **Logs Tab:**
   - Real-time logs van je backend
   - Check voor errors
   - Debug problemen

3. **Metrics Tab:**
   - CPU gebruik
   - Memory gebruik
   - Request statistics

### Supabase Dashboard Checken

1. **Database Tab:**
   - Check database grootte
   - Gratis tier: 500MB

2. **Logs Tab:**
   - Query logs
   - Error logs

---

## 🚨 COMMON ISSUES

### Issue: "Railway app keeps crashing"
**Check:**
```bash
# Railway Logs tab - zoek naar error messages
# Vaak: DATABASE_URL is incorrect
# Of: Missing environment variable
```

### Issue: "CORS error in browser"
**Fix:**
1. Railway Variables → Check CORS_ORIGIN
2. Moet matchen met je website domein
3. Redeploy na wijziging

### Issue: "Can't connect to database"
**Fix:**
```bash
# Test je connection string:
# Railway Logs → zoek naar "database connection" errors
# Check dat wachtwoord correct is in DATABASE_URL
```

---

## 📞 SUPPORT

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

**Supabase Support:**
- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs

---

## ✅ CHECKLIST

- [ ] GitHub repo aangemaakt en code gepusht
- [ ] Railway project aangemaakt
- [ ] Alle environment variables ingesteld
- [ ] Domain gegenereerd
- [ ] Health check succesvol
- [ ] admin-auth.js aangepast met Railway URL
- [ ] data-api.js aangepast met Railway URL
- [ ] Bestanden geüpload naar Belgian Hosting
- [ ] Website werkt
- [ ] Admin panel werkt
- [ ] Data wordt opgeslagen in database

---

**🎉 KLAAR! JE BACKEND IS LIVE!**
