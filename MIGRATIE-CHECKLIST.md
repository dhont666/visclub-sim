# ✅ Migratie Checklist - Node.js naar PHP

**Van: Railway (Node.js + Supabase) → Cloud86 (PHP + MySQL)**
**Kosten: €83.40/jaar → €23.40/jaar (€60 besparing!)**

---

## 📋 Wat is er gemaakt?

### ✅ Nieuwe Files (Klaar om te deployen!)

1. **Database**
   - `database/mysql-schema.sql` - Complete MySQL database schema

2. **PHP API** (nieuwe `api/` folder)
   - `api/config.php` - Database + JWT configuratie
   - `api/database.php` - PDO database class
   - `api/auth.php` - JWT authenticatie
   - `api/index.php` - Alle API endpoints (15+)
   - `api/README.md` - API documentatie

3. **Frontend Updates**
   - `config.js` - API URL aangepast
   - `admin/config.js` - API URL aangepast

4. **Documentatie**
   - `CLOUD86-DEPLOYMENT.md` - Complete deployment guide
   - `MIGRATIE-CHECKLIST.md` - Deze file

---

## 🎯 Deployment Stappen (1 uur totaal)

### STAP 1: Cloud86 Account (5 min) ⏱️

- [ ] Ga naar [cloud86.io/web-hosting/](https://cloud86.io/web-hosting/)
- [ ] Kies **Basic pakket** (€1.95/maand)
- [ ] Registreer account
- [ ] Noteer login gegevens

**Kosten:** €1.95/maand = €23.40/jaar

---

### STAP 2: MySQL Database (10 min) ⏱️

- [ ] Log in op Plesk (link in welkomstmail)
- [ ] Ga naar **Databases** → **Add Database**
- [ ] Database naam: `visclub_sim`
- [ ] Noteer:
  ```
  Host: localhost
  Database: visclub_sim
  User: [auto-generated]
  Password: [auto-generated]
  ```
- [ ] Open **phpMyAdmin**
- [ ] Klik **Import**
- [ ] Upload `database/mysql-schema.sql`
- [ ] Klik **Go**
- [ ] ✅ Verifieer: 6 tabellen + 5 views aangemaakt

---

### STAP 3: PHP API Configureren (15 min) ⏱️

#### 3a. Update `api/config.php`

- [ ] Open `api/config.php` in editor
- [ ] Update database gegevens:
  ```php
  define('DB_NAME', 'visclub_sim');  // Jouw database naam
  define('DB_USER', '...');           // Van stap 2
  define('DB_PASS', '...');           // Van stap 2
  ```
- [ ] Genereer sterke JWT secret:
  ```bash
  # Online: https://randomkeygen.com (gebruik Fort Knox)
  # Of PHP: echo bin2hex(random_bytes(32));
  ```
- [ ] Plak JWT secret:
  ```php
  define('JWT_SECRET', 'jouw_64_character_secret_hier');
  ```
- [ ] Update CORS origins:
  ```php
  $allowed_origins = [
      'https://www.visclub-sim.be',  // Jouw domein
  ];
  ```
- [ ] Sla op

#### 3b. Upload API via FTP

**FTP gegevens:**
- [ ] Host: `ftp.cloud86.io` (check Plesk)
- [ ] User: Je Cloud86 username
- [ ] Pass: FTP wachtwoord (in Plesk)

**Upload naar `/httpdocs/api/`:**
- [ ] `api/config.php`
- [ ] `api/database.php`
- [ ] `api/auth.php`
- [ ] `api/index.php`

#### 3c. Test API

- [ ] Open: `https://jouw-domein.com/api/health`
- [ ] Verwacht: `{"status":"ok",...}`
- [ ] ✅ API werkt!

---

### STAP 4: Frontend Deployen (15 min) ⏱️

#### 4a. Update Config Files

**File 1: `config.js`**
- [ ] Open `config.js`
- [ ] Zoek: `'https://your-cloud86-domain.com/api'`
- [ ] Vervang door: `'https://www.visclub-sim.be/api'` (jouw domein)
- [ ] Sla op

**File 2: `admin/config.js`**
- [ ] Open `admin/config.js`
- [ ] Zoek: `'https://your-cloud86-domain.com/api'`
- [ ] Vervang door: `'https://www.visclub-sim.be/api'` (jouw domein)
- [ ] Sla op

#### 4b. Upload Frontend via FTP

**Upload naar `/httpdocs/`:**

**Root files:**
- [ ] `index.html`
- [ ] `home.html`
- [ ] `kalender.html`
- [ ] `klassement.html`
- [ ] `leden.html`
- [ ] `inschrijven.html`
- [ ] `inschrijvingen.html`
- [ ] `visvergunning.html`
- [ ] `contact.html`
- [ ] `gallerij.html`
- [ ] `weer.html`
- [ ] `route.html`
- [ ] `config.js` (aangepast!)
- [ ] `script.js`
- [ ] `style.css`
- [ ] `klassement-data.js`

**Folders:**
- [ ] `images/` (hele folder)
- [ ] `admin/` (hele folder)

---

### STAP 5: SSL Certificate (5 min) ⏱️

- [ ] Ga naar Plesk → **SSL/TLS Certificates**
- [ ] Klik **Install Certificate**
- [ ] Selecteer **Let's Encrypt** (GRATIS!)
- [ ] Vink aan: "Secure the domain"
- [ ] Klik **Get it free**
- [ ] Wacht 1-2 minuten
- [ ] Ga naar **Hosting Settings**
- [ ] Vink aan: "Permanent SEO-safe 301 redirect from HTTP to HTTPS"
- [ ] Klik **OK**
- [ ] ✅ Test: `https://www.visclub-sim.be` (moet groene hangslot tonen)

---

### STAP 6: Testen (10 min) ⏱️

#### Test 1: Website Laden
- [ ] Open `https://www.visclub-sim.be`
- [ ] Website laadt correct?
- [ ] Geen errors in browser console?

#### Test 2: Admin Login
- [ ] Open `https://www.visclub-sim.be/admin/login.html`
- [ ] Login:
  - Username: `admin`
  - Password: `admin123`
- [ ] Succesvol ingelogd?
- [ ] Dashboard laadt?

#### Test 3: Database Query
- [ ] Klik **Leden** in admin
- [ ] Lijst laadt? (kan leeg zijn)
- [ ] Geen errors?

#### Test 4: Create Member
- [ ] Klik **Nieuw Lid**
- [ ] Vul gegevens in:
  - Naam: Test Gebruiker
  - Lidnummer: T001
- [ ] Klik **Opslaan**
- [ ] Lid verschijnt in lijst?
- [ ] ✅ Database write werkt!

---

### STAP 7: Security (10 min) ⏱️

**BELANGRIJK - Direct na deployment:**

#### 7a. Admin Wachtwoord Veranderen

**Via phpMyAdmin:**
- [ ] Open Plesk → Databases → phpMyAdmin
- [ ] Klik tabel `admin_users`
- [ ] Klik **Edit** bij admin user

**Genereer nieuwe password hash:**
```php
<?php
echo password_hash('JE_NIEUWE_WACHTWOORD', PASSWORD_BCRYPT);
?>
```

- [ ] Plak hash in `password_hash` kolom
- [ ] Klik **Go**
- [ ] Test nieuwe wachtwoord in admin login

#### 7b. Error Reporting Uitzetten

- [ ] Open `api/config.php`
- [ ] Verander:
  ```php
  error_reporting(0);
  ini_set('display_errors', 0);
  ```
- [ ] Upload via FTP

#### 7c. Security Checklist

- [ ] JWT_SECRET is sterk (64+ karakters)
- [ ] Database wachtwoord is sterk
- [ ] Admin wachtwoord gewijzigd (niet meer `admin123`)
- [ ] CORS beperkt tot alleen jouw domein
- [ ] HTTPS redirect enabled
- [ ] Error reporting uit in productie

---

## 🗑️ Oude Services Opruimen

**Na succesvolle deployment:**

### Railway Account
- [ ] Log in op [railway.app](https://railway.app)
- [ ] Ga naar project settings
- [ ] Klik **Delete Project**
- [ ] Bevestig
- [ ] ✅ Geen kosten meer!

### Supabase Account (OPTIONEEL)
- [ ] Log in op [supabase.com](https://supabase.com)
- [ ] Ga naar project settings
- [ ] Klik **Delete Project**
- [ ] Of: Bewaar voor backup/development

**💡 Tip:** Behoud Supabase gratis account voor development/testing!

---

## 💰 Kosten Vergelijking

### Voor (Railway + Supabase):
```
Railway:   €5.00/maand
Supabase:  €0.00/maand
Hosting:   €0.00/maand (nog niet)
─────────────────────
Totaal:    €5.00/maand = €60/jaar
```

### Na (Cloud86 alleen):
```
Cloud86:   €1.95/maand
Railway:   €0.00/maand (verwijderd)
Supabase:  €0.00/maand (verwijderd)
─────────────────────
Totaal:    €1.95/maand = €23.40/jaar
```

**Besparing: €36.60/jaar (61% goedkoper!)**

---

## 📂 File Overzicht

### Nieuwe Files (Deploy deze!)

```
api/
├── config.php          ← UPDATE: Database + JWT credentials
├── database.php        ← Ready
├── auth.php            ← Ready
└── index.php           ← Ready

database/
└── mysql-schema.sql    ← Import via phpMyAdmin

config.js               ← UPDATE: Cloud86 domain
admin/config.js         ← UPDATE: Cloud86 domain
```

### Oude Files (Niet meer nodig)

```
server/api-supabase.js     ← Node.js backend (vervangen)
railway.json               ← Railway config (niet meer nodig)
Procfile                   ← Railway startup (niet meer nodig)
RAILWAY-DEPLOYMENT.md      ← Railway guide (niet meer nodig)
```

---

## 🐛 Problemen Oplossen

### "Cannot connect to database"
**Check:** `api/config.php` database gegevens correct?
**Test:** phpMyAdmin werkt?

### "500 Internal Server Error"
**Check:** Plesk → Logs → Error Log
**Fix:** Vaak PHP syntax error of ontbrekende file

### "CORS blocked"
**Check:** `api/config.php` → `$allowed_origins` bevat jouw domein?

### "Unauthorized"
**Check:** JWT_SECRET niet veranderd na token generatie?
**Fix:** Log opnieuw in

### "Admin login werkt niet"
**Check:** Browser console voor errors
**Check:** API health check werkt? (`/api/health`)
**Check:** Database admin_users tabel bestaat?

---

## 📞 Hulp Nodig?

### Cloud86 Support
- Help Center: https://support.cloud86.io
- Live Chat: Via cloud86.io website
- Email: support@cloud86.io

### Documentatie
- `CLOUD86-DEPLOYMENT.md` - Volledige deployment guide
- `api/README.md` - API documentatie
- `database/README.md` - Database schema info

### Handige Links
- Plesk Docs: https://docs.plesk.com/
- PHP Manual: https://www.php.net/manual/
- MySQL Docs: https://dev.mysql.com/doc/

---

## ✅ Finale Checklist

Vink af als deployment compleet is:

**Cloud86 Setup:**
- [ ] Account aangemaakt
- [ ] Database gecreëerd en schema geïmporteerd
- [ ] API geconfigureerd en geüpload
- [ ] Frontend geüpload
- [ ] SSL certificaat geactiveerd

**Testing:**
- [ ] Website laadt (HTTPS)
- [ ] Admin login werkt
- [ ] Database queries werken
- [ ] Create/update/delete werkt

**Security:**
- [ ] Admin wachtwoord veranderd
- [ ] JWT_SECRET sterk en uniek
- [ ] Error reporting uit
- [ ] CORS beperkt

**Cleanup:**
- [ ] Railway project verwijderd (optioneel)
- [ ] Oude documentatie gearchiveerd

---

## 🎉 Klaar!

Je hebt succesvol gemigreerd van:
- ❌ Node.js + Express
- ❌ PostgreSQL + Supabase
- ❌ Railway hosting (€60/jaar)

Naar:
- ✅ PHP + PDO
- ✅ MySQL database
- ✅ Cloud86 hosting (€23.40/jaar)

**Besparing: €36.60/jaar!**

**Website URL:** `https://www.visclub-sim.be`
**Admin Panel:** `https://www.visclub-sim.be/admin/`

**Proficiat! 🎣**
