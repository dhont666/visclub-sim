# PROBLEMEN & OPLOSSINGEN - Visclub SiM

## 🔴 HOOFDPROBLEEM: Niets werkt op live server

Gebaseerd op de console logs zie ik:

```
✅ GET https://www.visclubsim.be/api/permits → 200 OK (werkt!)
❌ DELETE https://www.visclubsim.be/api/permits/10 → 404 Not Found
❌ POST https://www.visclubsim.be/api/permits → 400 Bad Request
```

---

## 🔍 DIAGNOSE

### Probleem 1: DELETE endpoint geeft 404
**Oorzaak**: De API route werkt lokaal maar niet op de server
**Mogelijke redenen**:
1. `.htaccess` is niet geüpload of werkt niet
2. `api/index.php` is niet correct geüpload
3. URL rewriting werkt niet op Cloud86

### Probleem 2: POST endpoint geeft 400
**Oorzaak**: De data die verstuurd wordt is niet correct
**Mogelijke redenen**:
1. JSON format klopt niet
2. Required fields ontbreken
3. Validatie faalt

---

## ✅ OPLOSSINGEN

### STAP 1: Check of API files geüpload zijn

Upload deze bestanden naar `public_html/api/`:

```
api/
├── index.php       ← KRITISCH! Bevat alle routes
├── config.php      ← Database configuratie
├── database.php    ← Database connectie
├── auth.php        ← Authenticatie
└── .htaccess       ← URL rewriting (BELANGRIJK!)
```

### STAP 2: Check .htaccess in api/ folder

Maak bestand: `api/.htaccess`

```apache
# Visclub SiM API - URL Rewriting
RewriteEngine On

# Allow CORS preflight
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=204,L]

# Route all requests to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Prevent directory listing
Options -Indexes

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### STAP 3: Check of api/config.php correct is

Verifieer dat deze instellingen kloppen:

```php
<?php
return [
    'database' => [
        'host' => 'localhost',
        'name' => 'JOUW_DATABASE_NAAM',  // ← CHECK DIT!
        'user' => 'JOUW_DATABASE_USER',   // ← CHECK DIT!
        'pass' => 'JOUW_DATABASE_WACHTWOORD' // ← CHECK DIT!
    ],
    'jwt' => [
        'secret' => 'JOUW_GEHEIME_SLEUTEL',  // ← VERANDER DIT!
        'expiry' => 86400
    ],
    'cors' => [
        'allowed_origins' => [
            'https://visclubsim.be',
            'https://www.visclubsim.be'
        ]
    ]
];
```

### STAP 4: Test API handmatig

Open in browser: `https://www.visclubsim.be/api/health`

**Verwacht resultaat**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T10:30:00Z",
  "database": "connected"
}
```

**Als je 404 krijgt**: API files zijn niet correct geüpload
**Als je 500 krijgt**: Database configuratie is fout
**Als je JSON ziet**: API werkt!

### STAP 5: Check database tabellen

Log in op phpMyAdmin en run:

```sql
-- Check of tabellen bestaan
SHOW TABLES;

-- Check permits tabel
DESCRIBE permits;

-- Check of er data is
SELECT COUNT(*) FROM permits;
SELECT COUNT(*) FROM members;
SELECT COUNT(*) FROM registrations;
```

---

## 🚨 MEEST WAARSCHIJNLIJKE OORZAAK

**Je hebt waarschijnlijk ALLEEN de HTML/JS files geüpload, maar NIET de API files!**

### Checklist - Heb je deze allemaal geüpload?

**API Folder** (`public_html/api/`):
- [ ] api/index.php
- [ ] api/config.php
- [ ] api/database.php
- [ ] api/auth.php
- [ ] api/.htaccess

**Admin Folder** (`public_html/admin/`):
- [ ] admin/config.js
- [ ] admin/admin-auth.js
- [ ] admin/admin-script.js
- [ ] admin/data-api.js
- [ ] admin/vergunningen.html
- [ ] (+ alle andere admin HTML files)

**Public Folder** (`public_html/`):
- [ ] config.js
- [ ] inschrijven.html
- [ ] visvergunning.html

---

## 🔧 SNELLE FIX

### Optie A: Upload ALLE API bestanden

1. Upload de volledige `api/` folder naar `public_html/api/`
2. Verifieer dat `api/.htaccess` aanwezig is
3. Update `api/config.php` met je database credentials
4. Test `https://www.visclubsim.be/api/health`

### Optie B: Check Apache mod_rewrite

Als de API files WEL geüpload zijn maar DELETE nog steeds 404 geeft:

1. Log in op Plesk
2. Ga naar "Apache & nginx Settings"
3. Zorg dat mod_rewrite AAN staat
4. Restart Apache

---

## 📝 DEBUG STAPPEN

1. **Open browser console (F12)**
2. **Ga naar Network tab**
3. **Probeer een actie** (bijv. vergunning verwijderen)
4. **Check de failed requests**:
   - Wat is de exacte URL?
   - Wat is de response?
   - Wat is de status code?

5. **Stuur mij de volgende info**:
   - Screenshot van Network tab
   - Volledige URL die faalt
   - Response body van de failed request

---

## 🎯 VERWACHTE RESULTATEN NA FIX

- ✅ `GET /api/permits` → 200 OK
- ✅ `POST /api/permits` → 201 Created
- ✅ `PUT /api/permits/:id` → 200 OK
- ✅ `DELETE /api/permits/:id` → 200 OK
- ✅ Admin panel toont data
- ✅ Formulieren werken
- ✅ Verwijderen werkt

---

## 💡 TIP

Als NIETS werkt, begin opnieuw:

1. **Backup huidige server bestanden**
2. **Upload complete project folder**
3. **Configureer database in api/config.php**
4. **Import database schema** (`database/COMPLETE-SCHEMA.sql`)
5. **Test API health endpoint**
6. **Test admin login**

---

Laat me weten welke van deze stappen je al gedaan hebt, dan kan ik verder helpen!
