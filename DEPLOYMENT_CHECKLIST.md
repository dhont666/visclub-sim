# 🚀 DEPLOYMENT CHECKLIST - Visclub SiM

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Supabase Database Setup
- [ ] Supabase account aangemaakt
- [ ] Project aangemaakt: `visclub-sim-db`
- [ ] Database schema geïmporteerd (alle CREATE TABLE statements uitgevoerd)
- [ ] Connection string gekopieerd en bewaard
- [ ] Database wachtwoord veilig opgeslagen

**Je credentials:**
```
Supabase URL: https://pvdebaqcqlkhibnxnwpf.supabase.co
Database URL: postgresql://postgres:[PASSWORD]@db.pvdebaqcqlkhibnxnwpf.supabase.co:5432/postgres
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Railway Backend Setup
- [ ] Railway account aangemaakt (via GitHub)
- [ ] GitHub repository gemaakt en code gepusht
- [ ] Railway project aangemaakt
- [ ] Repository gekoppeld aan Railway
- [ ] Environment variables ingesteld (zie hieronder)
- [ ] Domain gegenereerd en genoteerd
- [ ] Health check test succesvol: `https://jouw-app.up.railway.app/api/health`

**Railway Environment Variables:**
```bash
DATABASE_URL=postgresql://postgres:Kutwijf666!@db.pvdebaqcqlkhibnxnwpf.supabase.co:5432/postgres
JWT_SECRET=[GENEREER EEN STERKE RANDOM STRING]
CORS_ORIGIN=https://jouwdomein.be
NODE_ENV=production
PORT=3000
```

**JWT Secret genereren:**
```bash
# Op je computer:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Code Aanpassingen VOOR Deployment
- [ ] **admin/admin-auth.js** aangepast:
  - `USE_LOCAL_MODE = false`
  - `API_BASE_URL = 'https://jouw-railway-app.up.railway.app/api'`

- [ ] **admin/data-api.js** aangepast:
  - `USE_LOCAL_MODE = false`
  - `API_BASE_URL = 'https://jouw-railway-app.up.railway.app/api'`

- [ ] **admin/login.html** bekeken en admin wachtwoorden gewijzigd (indien gewenst)

---

### 4. Belgian Hosting Deployment
- [ ] cPanel inloggegevens getest
- [ ] File Manager geopend
- [ ] Oude bestanden in `public_html/` verwijderd (indien aanwezig)
- [ ] Nieuwe bestanden geüpload (zie lijst hieronder)
- [ ] SSL certificaat geactiveerd (Auto SSL)
- [ ] Website bereikbaar via HTTPS

**✅ UPLOAD DEZE BESTANDEN:**
```
✓ Alle HTML bestanden (*.html)
✓ style.css
✓ script.js
✓ klassement-data.js
✓ vijverkaart.js
✓ .htaccess
✓ contact-handler.php
✓ admin/ directory (VOLLEDIGE directory)
✓ images/ directory
✓ assets/ (indien aanwezig)
✓ bot/ directory (alleen de client-side bestanden)
```

**❌ NIET UPLOADEN:**
```
✗ node_modules/
✗ server/
✗ database/
✗ .git/
✗ .env
✗ package.json
✗ package-lock.json
✗ tests/
```

---

## 🧪 TESTING CHECKLIST

### Website Tests
- [ ] **Homepage** laadt: `https://jouwdomein.be`
- [ ] SSL werkt (groen slotje in browser)
- [ ] Navigatie werkt naar alle pagina's
- [ ] Kalender pagina toont wedstrijden
- [ ] Contact formulier werkt
- [ ] Geen console errors in browser (F12)

### Admin Panel Tests
- [ ] **Admin login** bereikbaar: `https://jouwdomein.be/admin/login.html`
- [ ] Login werkt met admin credentials
- [ ] Dashboard laadt zonder errors
- [ ] **Browser console check (F12):**
  - Network tab: API calls gaan naar Railway URL
  - Geen 404 errors
  - Geen CORS errors
  - Status 200 OK op API calls

- [ ] **Functionaliteit tests:**
  - [ ] Lid toevoegen werkt
  - [ ] Wedstrijd aanmaken werkt
  - [ ] Data blijft behouden na refresh
  - [ ] Plaatsentrekking werkt
  - [ ] Contact berichten verschijnen

### Database Tests
- [ ] Supabase dashboard openen
- [ ] Table Editor → members table bekijken
- [ ] Test lid die je toevoegde is zichtbaar
- [ ] Data is persistent (niet weg na refresh)

### Railway Backend Tests
- [ ] Railway dashboard: Logs tab bekijken
- [ ] Geen errors in logs
- [ ] Health endpoint werkt: `https://jouw-app.up.railway.app/api/health`
- [ ] Deployment status is "Success"

---

## 📝 POST-DEPLOYMENT

### Security
- [ ] Alle admin wachtwoorden zijn gewijzigd van defaults
- [ ] .env bestand is NIET gecommit naar Git
- [ ] Railway environment variables zijn ingesteld
- [ ] JWT_SECRET is een sterke random string
- [ ] Database password is sterk en veilig opgeslagen

### Monitoring Setup
- [ ] Railway usage bekeken (gratis tier: 500 uur/maand)
- [ ] Supabase usage bekeken (gratis tier: 500MB database)
- [ ] Reminder in kalender: wekelijkse check van logs

### Documentation
- [ ] Railway URL gedocumenteerd
- [ ] Supabase credentials veilig opgeslagen
- [ ] Admin credentials gedocumenteerd
- [ ] cPanel credentials genoteerd

---

## 🔧 CONFIGURATIE SAMENVATTING

### URLs
```
Website:      https://jouwdomein.be
Admin Panel:  https://jouwdomein.be/admin/
Backend API:  https://jouw-app.up.railway.app/api
Supabase:     https://pvdebaqcqlkhibnxnwpf.supabase.co
Railway:      https://railway.app/project/[jouw-project-id]
```

### Credentials
```
Admin Login:
  - admin / admin123
  - kevin.dhont / visclub2026
  - maarten.borghs / visclub2026
  - kevin.vandun / visclub2026

Supabase:
  - Email: [je email]
  - Password: [je password]
  - Database Password: Kutwijf666!

Railway:
  - Login via GitHub

Belgian Hosting:
  - cPanel: [je credentials]
```

### Important Files to Remember
```
Backend Config:
  - server/api.js (API routes)
  - .env.example (template voor environment variables)

Admin Config:
  - admin/admin-auth.js (AUTH configuratie)
  - admin/data-api.js (DATA configuratie)
  - admin/login.html (login credentials)

Database:
  - database/schema.sql (database structuur)
```

---

## 🚨 TROUBLESHOOTING

### "CORS Error" in browser console
**Oplossing:**
1. Check Railway environment variables
2. CORS_ORIGIN moet je Belgian Hosting domein zijn
3. Redeploy Railway app na wijziging

### "401 Unauthorized" errors
**Oplossing:**
1. Check of JWT_SECRET in Railway matcht
2. Login opnieuw in admin panel
3. Check browser console voor token errors

### Admin panel laadt maar data verschijnt niet
**Oplossing:**
1. Check browser console (F12)
2. Verify API_BASE_URL in admin-auth.js en data-api.js
3. Check USE_LOCAL_MODE is false in beide bestanden
4. Test Railway health endpoint

### Database connection errors
**Oplossing:**
1. Check DATABASE_URL in Railway environment variables
2. Test connection string in Supabase dashboard
3. Verify database password is correct

### Railway deployment fails
**Oplossing:**
1. Check Railway logs voor error messages
2. Verify package.json heeft correct "start" script
3. Check alle dependencies zijn in package.json
4. Redeploy: Git commit + push

---

## 📞 SUPPORT

**Stuck?** Check deze guides:
- Supabase setup: `START_HIER_HYBRIDE.md` → Stap 1
- Railway setup: `START_HIER_HYBRIDE.md` → Stap 2
- Website upload: `START_HIER_HYBRIDE.md` → Stap 3
- Volledige guide: `HYBRIDE_SETUP_COMPLETE_GUIDE_NL.md`

---

## ✅ DEPLOYMENT STATUS

**Deployment Datum:** ____ / ____ / 20____

**Uitgevoerd door:** ________________________

**Status:**
- [ ] Database ready
- [ ] Backend deployed
- [ ] Website online
- [ ] Admin werkt
- [ ] Tests passed
- [ ] Monitoring setup

**Opmerkingen:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**🎉 KLAAR! JE WEBSITE IS LIVE!**
