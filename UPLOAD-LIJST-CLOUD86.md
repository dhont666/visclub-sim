# Upload Lijst voor Cloud86 Deployment

## ✅ Git Backup Voltooid!
Alle wijzigingen zijn gecommit en gepusht naar GitHub.
Commit: `feat: Implementeer database integratie voor contactformulier en inschrijvingen`

---

## 📤 Bestanden om te Uploaden naar Cloud86

### Stap 1: Upload deze Frontend Bestanden

**Root directory:**
```
📄 contact.html                  ← Contactformulier met database integratie
📄 script.js                     ← Inschrijf formulier met database integratie
```

**Admin directory (`/admin/`):**
```
📄 admin/index.html              ← Updated navigatie menu
📄 admin/contact-berichten.html  ← Database integratie + terug knop
📄 admin/inschrijvingen.html     ← 🆕 NIEUWE PAGINA!
```

### Stap 2: Upload Backend Bestanden

**API directory (`/api/`):**
```
📄 api/index.php                 ← 6 nieuwe endpoints + CORS fix
📄 api/.htaccess                 ← 🆕 Apache configuratie (BELANGRIJK!)
📄 api/test.php                  ← 🆕 Test script om API te checken
```

### Stap 3: Database Schema (HANDMATIG uitvoeren in phpMyAdmin)

```
📄 database/mysql-schema.sql     ← Bevat nieuwe tabellen (zie hieronder)
```

**NIET importeren als je al data hebt!** Voer in plaats daarvan alleen deze SQL uit:

```sql
-- Kopieer deze queries en voer uit in phpMyAdmin:

CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    replied_at TIMESTAMP NULL,
    reply_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE public_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    partner_first_name VARCHAR(100),
    partner_last_name VARCHAR(100),
    competition_date VARCHAR(20) NOT NULL,
    competition_name VARCHAR(255) NOT NULL,
    registration_type VARCHAR(20) DEFAULT 'solo',
    payment_method VARCHAR(20) DEFAULT 'qr',
    payment_reference VARCHAR(50),
    amount VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_competition_date (competition_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🚀 Upload Procedure (Stap voor Stap)

### Optie A: Via Cloud86 Plesk File Manager

1. Log in op Cloud86 Plesk
2. Ga naar **Files** → **File Manager**
3. Navigeer naar `public_html/`
4. Upload de bestanden naar de juiste locaties:
   - `contact.html` → in root (`public_html/`)
   - `script.js` → in root (`public_html/`)
   - `admin/index.html` → in `public_html/admin/`
   - `admin/contact-berichten.html` → in `public_html/admin/`
   - `admin/inschrijvingen.html` → in `public_html/admin/` (NIEUWE PAGINA!)
   - `api/index.php` → in `public_html/api/`

### Optie B: Via FTP/SFTP (FileZilla, WinSCP, etc.)

1. Verbind met Cloud86 via FTP
   - Host: `ftp.jouwdomein.be` (of via Plesk)
   - Gebruik je FTP credentials
2. Upload de bestanden naar dezelfde locaties als hierboven

---

## 🗄️ Database Setup (na upload)

### Stap 1: Maak Database Backup (BELANGRIJK!)

1. Log in op Cloud86 Plesk
2. Ga naar **Databases** → **phpMyAdmin**
3. Selecteer je database
4. Klik op **Export**
5. Klik op **Go** (of "Uitvoeren")
6. Sla het bestand op als backup

### Stap 2: Voeg Nieuwe Tabellen Toe

1. Blijf in phpMyAdmin
2. Klik op **SQL** tab
3. Kopieer en plak de SQL queries hierboven
4. Klik op **Go** (of "Uitvoeren")
5. Controleer of beide tabellen zijn aangemaakt:
   - `contact_messages`
   - `public_registrations`

---

## ✅ Test Checklist (na deployment)

Voer deze tests uit om te controleren of alles werkt:

### 1. Test Contactformulier
- [ ] Ga naar `https://visclubsim.be/contact.html`
- [ ] Vul het formulier in
- [ ] Klik op "Versturen"
- [ ] Verwacht: "✅ Bedankt voor je bericht!"
- [ ] Controleer in phpMyAdmin: tabel `contact_messages` bevat nieuwe rij

### 2. Test Inschrijf Formulier
- [ ] Ga naar `https://visclubsim.be/inschrijven.html`
- [ ] Kies een wedstrijd
- [ ] Vul je naam in
- [ ] Kies betaalwijze
- [ ] Klik op "Verzenden"
- [ ] Verwacht: Bevestigingsmelding
- [ ] Controleer in phpMyAdmin: tabel `public_registrations` bevat nieuwe rij

### 3. Test Admin Panel - Contact Berichten
- [ ] Log in op `https://visclubsim.be/admin/`
- [ ] Klik op "Contact Berichten"
- [ ] Verwacht: Je ziet de test berichten
- [ ] Test: Filter op "Ongelezen"
- [ ] Test: Klik op "Terug naar Dashboard" knop

### 4. Test Admin Panel - Inschrijvingen
- [ ] Zorg dat je ingelogd bent in admin
- [ ] Klik op "Inschrijvingen" in het menu
- [ ] Verwacht: Je ziet de test inschrijvingen
- [ ] Test: Filter op "In Behandeling"
- [ ] Test: Klik op "oog" icoon om details te zien
- [ ] Test: Klik op "✓" icoon om als betaald te markeren
- [ ] Test: Klik op "Terug naar Dashboard" knop

---

## 🔧 Configuratie Controleren

### Voor je uploadt, controleer deze bestanden:

**1. `api/config.php`** - Database credentials moeten kloppen:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'jouw_echte_database_naam');     // ⚠️ CHECK DIT
define('DB_USER', 'jouw_echte_database_gebruiker'); // ⚠️ CHECK DIT
define('DB_PASS', 'jouw_echte_database_wachtwoord'); // ⚠️ CHECK DIT
define('JWT_SECRET', 'jouw_geheime_sleutel');       // ⚠️ CHECK DIT
```

**2. `config.js`** - API URL moet kloppen:
```javascript
const API_BASE_URL = 'https://visclubsim.be/api';  // ⚠️ CHECK DIT
```

**3. `admin/config.js`** - API URL moet kloppen:
```javascript
const API_BASE_URL = 'https://visclubsim.be/api';  // ⚠️ CHECK DIT
```

---

## 📊 Samenvatting van Wijzigingen

| Bestand | Wat is er veranderd? |
|---------|---------------------|
| `contact.html` | ✅ Formulier verzend naar database via API |
| `script.js` | ✅ Inschrijf formulier verzend naar database via API |
| `admin/index.html` | ✅ "Inschrijvingen" menu item toegevoegd |
| `admin/contact-berichten.html` | ✅ Database integratie + "Terug" knop |
| `admin/inschrijvingen.html` | 🆕 **NIEUWE PAGINA** - Overzicht inschrijvingen |
| `api/index.php` | ✅ 6 nieuwe endpoints toegevoegd |
| `database/mysql-schema.sql` | ✅ 2 nieuwe tabellen toegevoegd |

---

## 🆘 Troubleshooting

### "Endpoint not found" error
- Controleer of `.htaccess` file aanwezig is in root directory
- Check Apache mod_rewrite (normaal enabled op Cloud86)

### "Database connection failed"
- Controleer `api/config.php` database credentials
- Log in op Plesk → Databases → check database naam en gebruiker

### Geen berichten/inschrijvingen zichtbaar in admin
- Open browser developer tools (F12)
- Check Console tab voor JavaScript errors
- Check Network tab → kijk naar API calls
- Controleer of JWT token geldig is (admin opnieuw inloggen)

### CORS errors
- Controleer `api/config.php` → `cors.allowed_origins`
- Voeg je domain toe: `'https://visclubsim.be'`

---

## 📞 Ondersteuning

Bij problemen:
1. Check browser console (F12 → Console tab)
2. Check Network tab (F12 → Network tab)
3. Check PHP error logs in Plesk (Logs → Error Log)
4. Check phpMyAdmin of tabellen zijn aangemaakt
5. Test API endpoints met Postman/curl

---

## ✨ Klaar!

Na deze stappen heb je:
- ✅ Werkend contactformulier met database opslag
- ✅ Werkend inschrijf formulier met database opslag
- ✅ Admin panel om contactberichten te bekijken
- ✅ Admin panel om inschrijvingen te bekijken en beheren
- ✅ Alle data veilig opgeslagen in MySQL database
- ✅ Git backup van alle wijzigingen

**Veel succes met de deployment! 🎉**
