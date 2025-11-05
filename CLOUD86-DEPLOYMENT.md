# 🚀 Cloud86 Deployment Guide - Complete Setup

**Volledige migratie van Node.js/Supabase naar PHP/MySQL op Cloud86**

**Totale kosten: €23.40/jaar (€1.95/maand)**

---

## 📋 Overzicht

### Wat hebben we gemaakt?

1. ✅ **MySQL Database Schema** (`database/mysql-schema.sql`)
   - 6 tabellen (members, competitions, results, registrations, permits, admin_users)
   - 5 views (club_ranking, veteran_ranking, recent_results, upcoming_competitions, member_statistics)
   - 2 default admin users

2. ✅ **PHP REST API** (`api/` directory)
   - `config.php` - Database en JWT configuratie
   - `database.php` - PDO database connectie class
   - `auth.php` - JWT authenticatie helper
   - `index.php` - Alle API endpoints (15+)

3. ✅ **Frontend Updates**
   - `config.js` - API URL updated naar Cloud86
   - `admin/config.js` - API URL updated naar Cloud86

---

## 🎯 Deployment Stappen

### STAP 1: Cloud86 Account Aanmaken (5 minuten)

1. Ga naar [cloud86.io](https://cloud86.io/web-hosting/)
2. Kies **Basic pakket** (€1.95/maand)
3. Registreer domein of gebruik bestaand domein
4. Kies betalingsmethode
5. Ontvang login gegevens via email

---

### STAP 2: MySQL Database Aanmaken (5 minuten)

1. **Log in op Plesk**
   - URL: `https://plesk.cloud86.io` (check je email voor exacte URL)
   - Gebruikersnaam: Je Cloud86 email
   - Wachtwoord: Uit welkomstmail

2. **Create Database**
   - Klik **Databases** in zijbalk
   - Klik **Add Database**
   - Database naam: `visclub_sim` (of andere naam)
   - Klik **OK**

3. **Noteer gegevens:**
   ```
   Database Host: localhost
   Database Name: visclub_sim
   Database User: [automatisch aangemaakt]
   Database Password: [automatisch gegenereerd]
   ```

4. **Import Schema**
   - Klik op de database naam
   - Klik **phpMyAdmin**
   - Klik **Import** tab
   - Upload `database/mysql-schema.sql`
   - Klik **Go**
   - ✅ Succes! Alle tabellen en views zijn aangemaakt

5. **Verifieer:**
   - Klik **Structure** tab
   - Je moet zien:
     - 6 tabellen (admin_users, members, competitions, results, registrations, permits)
     - 5 views (club_ranking, veteran_ranking, recent_results, upcoming_competitions, member_statistics)

---

### STAP 3: PHP API Configureren (10 minuten)

1. **Update `api/config.php`**

   Open `api/config.php` en update:

   ```php
   // Database Configuration
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'visclub_sim');  // ← Jouw database naam
   define('DB_USER', 'visclub_sim_user');  // ← Jouw database user
   define('DB_PASS', 'xxxxxxxxxxxx');  // ← Jouw database password

   // JWT Configuration
   define('JWT_SECRET', 'YOUR_STRONG_64_CHARACTER_SECRET_KEY_HERE_CHANGE_THIS_IMMEDIATELY');  // ← Genereer sterke key!

   // CORS Configuration
   $allowed_origins = [
       'http://localhost:3000',
       'https://your-cloud86-domain.com',  // ← Jouw Cloud86 domein!
   ];
   ```

2. **Genereer sterke JWT_SECRET:**

   **Optie A - Online generator:**
   - Ga naar [randomkeygen.com](https://randomkeygen.com/)
   - Gebruik "Fort Knox Password" (64+ karakters)

   **Optie B - PHP:**
   ```php
   echo bin2hex(random_bytes(32));
   ```

   **Optie C - Linux/Mac:**
   ```bash
   openssl rand -hex 32
   ```

3. **Upload API Files via FTP**

   **FTP Gegevens (in Plesk):**
   - Host: `ftp.cloud86.io` (check Plesk voor exacte host)
   - Username: Je Cloud86 username
   - Password: Je FTP wachtwoord
   - Port: 21 (FTP) of 22 (SFTP)

   **Upload de `api/` folder:**
   ```
   /httpdocs/api/config.php
   /httpdocs/api/database.php
   /httpdocs/api/auth.php
   /httpdocs/api/index.php
   ```

4. **Test API**

   Open browser: `https://your-cloud86-domain.com/api/health`

   **Verwacht:**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-05T10:30:00Z",
     "version": "1.0.0"
   }
   ```

   ✅ **API werkt!**

---

### STAP 4: Frontend Deployen (10 minuten)

1. **Update `config.js` en `admin/config.js`**

   Vervang `'https://your-cloud86-domain.com/api'` met je echte domein:

   ```javascript
   API_BASE_URL: isLocal
       ? 'http://localhost/vissersclub-sim-website/api'
       : 'https://www.visclub-sim.be/api',  // ← Jouw domein!
   ```

2. **Upload Frontend Files via FTP**

   Upload naar `/httpdocs/`:
   ```
   /httpdocs/index.html
   /httpdocs/home.html
   /httpdocs/kalender.html
   /httpdocs/klassement.html
   /httpdocs/leden.html
   /httpdocs/inschrijven.html
   /httpdocs/visvergunning.html
   /httpdocs/contact.html
   /httpdocs/gallerij.html
   /httpdocs/weer.html
   /httpdocs/route.html
   /httpdocs/config.js
   /httpdocs/script.js
   /httpdocs/style.css
   /httpdocs/klassement-data.js
   /httpdocs/images/
   /httpdocs/admin/
   ```

3. **Upload Admin Panel**

   Upload `admin/` folder:
   ```
   /httpdocs/admin/login.html
   /httpdocs/admin/index.html
   /httpdocs/admin/plaatsentrekking.html
   /httpdocs/admin/klassement-beheer.html
   /httpdocs/admin/vergunningen.html
   /httpdocs/admin/contact-berichten.html
   /httpdocs/admin/config.js
   /httpdocs/admin/admin-script.js
   /httpdocs/admin/admin-auth.js
   /httpdocs/admin/data-api.js
   /httpdocs/admin/style.css
   ```

---

### STAP 5: SSL Certificate (GRATIS via Cloud86) (5 minuten)

1. **Activeer SSL in Plesk**
   - Ga naar **SSL/TLS Certificates**
   - Klik **Install Certificate**
   - Selecteer **Let's Encrypt** (GRATIS!)
   - Vink aan: "Secure the domain"
   - Klik **Get it free**
   - Wacht 1-2 minuten

2. **Force HTTPS Redirect**

   In Plesk:
   - Ga naar **Hosting Settings**
   - Vink aan: "Permanent SEO-safe 301 redirect from HTTP to HTTPS"
   - Klik **OK**

3. **Verifieer:**
   - Open `https://www.visclub-sim.be`
   - Controleer groene hangslot in browser

---

### STAP 6: Testen (15 minuten)

#### Test 1: API Health Check
```bash
curl https://www.visclub-sim.be/api/health
```

**Verwacht:** `{"status":"ok",...}`

#### Test 2: Admin Login
1. Ga naar `https://www.visclub-sim.be/admin/login.html`
2. Login met:
   - Username: `admin`
   - Password: `admin123`
3. ✅ Je moet ingelogd worden

#### Test 3: Database Query
1. Login in admin panel
2. Ga naar **Leden** pagina
3. Zie je de leden lijst? (kan leeg zijn)
4. ✅ API verbinding werkt!

#### Test 4: Create Member
1. Klik **Nieuw Lid Toevoegen**
2. Vul gegevens in
3. Klik **Opslaan**
4. ✅ Lid moet verschijnen in lijst

---

## 🔒 Security Checklist

**NA deployment, DIRECT doen:**

- [ ] `JWT_SECRET` vervangen door sterke 64+ karakter key
- [ ] Database wachtwoord is sterk (niet "password123")
- [ ] `error_reporting` uitzetten in productie (`api/config.php`)
- [ ] Admin wachtwoorden veranderen (database: admin_users tabel)
- [ ] CORS origins beperken tot alleen jouw domein
- [ ] HTTPS force redirect enabled
- [ ] Backup strategie opzetten (Plesk Backup Manager)

---

## 🎨 Admin Wachtwoord Veranderen

**Via phpMyAdmin:**

1. Open **phpMyAdmin** in Plesk
2. Klik **admin_users** tabel
3. Klik **Edit** bij admin user
4. Genereer nieuw password hash:

   **PHP code om hash te maken:**
   ```php
   <?php
   echo password_hash('JE_NIEUWE_WACHTWOORD', PASSWORD_BCRYPT);
   ?>
   ```

5. Plak de hash in `password_hash` kolom
6. Klik **Go**
7. ✅ Wachtwoord gewijzigd!

---

## 📂 File Structure op Cloud86

```
/httpdocs/
├── api/
│   ├── config.php          (Database + JWT config)
│   ├── database.php        (PDO connection)
│   ├── auth.php            (JWT helper)
│   └── index.php           (API endpoints)
├── admin/
│   ├── login.html
│   ├── index.html
│   ├── config.js           (API URL)
│   ├── admin-script.js
│   └── ...
├── images/
├── index.html
├── home.html
├── config.js               (API URL)
├── script.js
├── style.css
└── ...
```

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

**Oorzaak:** Verkeerde database gegevens in `api/config.php`

**Fix:**
1. Check `DB_NAME`, `DB_USER`, `DB_PASS` in `config.php`
2. Verifieer in Plesk → Databases
3. Test verbinding in phpMyAdmin

---

### Error: "500 Internal Server Error"

**Oorzaak:** PHP syntax error of missing dependency

**Fix:**
1. Check PHP error log in Plesk → **Logs**
2. Zorg dat `config.php` correct is
3. Check file permissions (644 voor .php files)

---

### Error: "CORS policy blocked"

**Oorzaak:** Frontend domein niet in `$allowed_origins`

**Fix:**
1. Open `api/config.php`
2. Voeg je domein toe aan `$allowed_origins`:
   ```php
   $allowed_origins = [
       'https://www.visclub-sim.be',
       'https://visclub-sim.be'
   ];
   ```

---

### Error: "Unauthorized - Invalid token"

**Oorzaak:** JWT_SECRET mismatch of verlopen token

**Fix:**
1. Check `JWT_SECRET` in `api/config.php`
2. Log opnieuw in via admin panel
3. Clear browser localStorage

---

## 📊 Performance Optimalisatie

### PHP Opcode Cache (Plesk)

1. Ga naar **PHP Settings** in Plesk
2. Vink aan: **opcache**
3. Klik **OK**
4. ✅ PHP code wordt gecached = sneller!

### Browser Caching (.htaccess)

Create `/httpdocs/.htaccess`:

```apache
# Enable GZIP compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 💰 Kosten Overzicht

| Item | Kosten |
|------|---------|
| **Cloud86 Basic Hosting** | €1.95/maand = €23.40/jaar |
| **SSL Certificaat** | GRATIS (Let's Encrypt) |
| **Domeinnaam** | GRATIS (1e jaar bij Cloud86) |
| **MySQL Database** | GRATIS (inbegrepen) |
| **Bandwidth** | GRATIS (unlimited) |
| **Email (10 accounts)** | GRATIS (inbegrepen) |
| **TOTAAL** | **€23.40/jaar** |

**Besparing vs Railway setup:** €60/jaar!

---

## 🎉 Je Bent Klaar!

✅ **Website live op Cloud86**
✅ **PHP API werkend**
✅ **MySQL database geconfigureerd**
✅ **SSL certificaat actief**
✅ **Admin panel toegankelijk**

**Website URL:** `https://www.visclub-sim.be`
**Admin Panel:** `https://www.visclub-sim.be/admin/`

**Login:**
- Username: `admin`
- Password: `admin123` (VERANDER DIT!)

---

## 📞 Support

**Cloud86 Support:**
- Help center: https://support.cloud86.io
- Email: support@cloud86.io
- Live chat (via website)

**Handig:**
- Plesk documentatie: https://docs.plesk.com/
- PHP documentatie: https://www.php.net/manual/

---

**Veel succes met je Visclub SiM website! 🎣**
