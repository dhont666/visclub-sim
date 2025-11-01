# Deployment Guide - Visclub SiM Website naar Belgian Hosting

## Inhoudsopgave
1. [Package Analyse](#package-analyse)
2. [Wat Kan & Niet Kan](#wat-kan--niet-kan)
3. [Voorbereiding](#voorbereiding)
4. [Stap-voor-Stap Deployment](#stap-voor-stap-deployment)
5. [Na Deployment](#na-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Package Analyse

### Belgian Hosting Medium Linux Package

**Typische specificaties:**
- **Diskruimte**: 500 MB - 1 GB
- **Bandbreedte**: 10-15 GB/maand
- **Control Panel**: cPanel
- **PHP Support**: Ja (PHP 7.4 - 8.x)
- **MySQL/MariaDB**: Ja
- **Node.js**: **MEESTAL NIET** op shared hosting
- **Email accounts**: Meerdere
- **SSL Certificaat**: Gratis Let's Encrypt

**✅ GESCHIKT VOOR:**
- Statische HTML/CSS/JavaScript websites
- PHP applicaties
- MySQL databases

**❌ NIET GESCHIKT VOOR:**
- Node.js/Express backend (vereist VPS)
- SQLite databases (geen persistente opslag)
- Real-time WebSocket applicaties

---

## Wat Kan & Niet Kan

### ✅ WAT JE KUNT HOSTEN (Shared Hosting)

**Publieke Website (100% compatibel):**
- `home.html`, `kalender.html`, `klassement.html`, etc.
- `style.css` en alle CSS bestanden
- `script.js`, `klassement-data.js`, `vijverkaart.js`
- Alle afbeeldingen en media
- Contact formulier (met PHP backend)

**Admin Panel (BEPERKT):**
- Admin HTML pagina's
- Admin JavaScript (client-side)
- **LocalStorage mode MOET gebruikt worden** (geen backend API)

### ❌ WAT NIET KAN (Vereist VPS/Cloud Hosting)

- Node.js/Express backend (`server/api.js`)
- SQLite database
- Bot systeem (`bot/webbeheerder-bot.js`, `bot/weer-vangst-bot.js`)
- Backend API endpoints
- JWT authenticatie via backend

---

## Voorbereiding

### Stap 1: Maak een Deployment Versie

Maak een "production" versie van je website zonder backend-afhankelijkheden:

```bash
# Maak een deployment directory
mkdir deployment
```

### Stap 2: Converteer Admin Panel naar LocalStorage Mode

1. Open `admin/login.html`
2. Zorg dat deze regel staat:
```javascript
const USE_LOCAL_MODE = true;
```

3. Open `admin/admin-auth.js`
4. Zorg dat deze regel staat:
```javascript
this.USE_LOCAL_MODE = true;
```

### Stap 3: Verwijder Backend Referenties

Verwijder of comment deze regels uit je bestanden:
- Alle `fetch('/api/...')` calls die naar Node.js backend gaan
- Vervang door LocalStorage operaties via `dataAPI`

### Stap 4: Test Lokaal in LocalStorage Mode

```bash
# Open in browser met file:// protocol
# Of gebruik een simpele HTTP server
python -m http.server 8000
# Ga naar http://localhost:8000
```

---

## Stap-voor-Stap Deployment

### STAP 1: Login op cPanel

1. Ga naar je Belgian Hosting cPanel (meestal `https://jouwdomein.be/cpanel` of `https://jouwdomein.be:2083`)
2. Log in met je credentials

### STAP 2: Bestandsbeheer (File Manager)

1. Klik op **"File Manager"** in cPanel
2. Navigeer naar **`public_html`** (of `www` directory)
3. Dit is je website root directory

### STAP 3: Upload Bestanden

**Optie A: Via cPanel File Manager (Aanbevolen voor beginners)**

1. Klik op **"Upload"** bovenaan
2. Sleep je bestanden naar de upload zone:

**Structuur in `public_html`:**
```
public_html/
├── index.html (redirect naar home.html)
├── home.html
├── kalender.html
├── klassement.html
├── inschrijven.html
├── inschrijvingen.html
├── leden.html
├── visvergunning.html
├── contact.html
├── weer.html
├── gallerij.html
├── route.html
├── style.css
├── script.js
├── klassement-data.js
├── vijverkaart.js
├── admin/
│   ├── login.html
│   ├── index.html
│   ├── plaatsentrekking.html
│   ├── klassement-beheer.html
│   ├── vergunningen.html
│   ├── contact-berichten.html
│   ├── admin-chat.html
│   ├── admin-nav.html
│   ├── admin-script.js
│   ├── admin-auth.js
│   ├── data-api.js
│   ├── admin-badges.js
│   └── admin-style.css (indien aanwezig)
├── images/ (alle afbeeldingen)
├── assets/ (indien aanwezig)
└── .htaccess (zie hieronder)
```

**Optie B: Via FTP (Voor gevorderden)**

1. Download een FTP client (FileZilla - gratis)
2. Credentials vind je in cPanel onder "FTP Accounts"
3. Verbind met je server
4. Upload alle bestanden naar `public_html`

### STAP 4: Maak .htaccess bestand

In `public_html`, maak een bestand `.htaccess` met deze inhoud:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirect root to home.html
DirectoryIndex home.html

# Error pages
ErrorDocument 404 /home.html

# Enable gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
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

### STAP 5: Installeer SSL Certificaat (HTTPS)

1. In cPanel, ga naar **"SSL/TLS Status"**
2. Klik op **"Run AutoSSL"** (gratis Let's Encrypt certificaat)
3. Wacht tot het certificaat is geïnstalleerd
4. Je website is nu bereikbaar via `https://jouwdomein.be`

### STAP 6: Test de Website

1. Ga naar `https://jouwdomein.be`
2. Test alle pagina's:
   - ✓ Home page laadt
   - ✓ Navigatie werkt
   - ✓ Kalender toont data
   - ✓ Formulieren werken
   - ✓ Klassement laadt

3. Test Admin Panel:
   - Ga naar `https://jouwdomein.be/admin/login.html`
   - Log in met: `admin` / `admin123`
   - Check dat LocalStorage mode werkt

### STAP 7: Configureer Email (Voor Contact Formulier)

**Optie A: PHP mail() functie gebruiken**

Maak een `contact-handler.php`:

```php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars($_POST['message']);

    $to = "info@jouwvisclub.be"; // WIJZIG NAAR JOUW EMAIL
    $subject = "Contact formulier: " . $name;
    $body = "Naam: $name\nEmail: $email\n\nBericht:\n$message";
    $headers = "From: noreply@jouwdomein.be\r\n";
    $headers .= "Reply-To: $email\r\n";

    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["success" => true, "message" => "Bericht verzonden!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Fout bij verzenden."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Methode niet toegestaan"]);
}
?>
```

Update `contact.html` om naar dit PHP script te POSTen.

**Optie B: Email account aanmaken in cPanel**

1. cPanel → **"Email Accounts"**
2. Maak account aan: `info@jouwdomein.be`
3. Configureer forwarding indien gewenst

---

## Na Deployment

### Bestandsrechten Controleren

In File Manager, klik rechts op bestanden:
- **Directories**: 755
- **Bestanden**: 644
- **`.htaccess`**: 644

### Performance Optimalisatie

1. **Afbeeldingen comprimeren**: Gebruik TinyPNG of ImageOptim
2. **CSS/JS minificeren**: Gebruik online tools
3. **Caching**: Al ingesteld via `.htaccess`

### Monitoring

1. **Google Analytics**: Voeg tracking code toe aan alle pagina's
2. **Uptime Monitoring**: Gebruik UptimeRobot (gratis)
3. **Error Logs**: Check in cPanel onder "Error Log"

### Backup

1. cPanel → **"Backup"**
2. Download regelmatig een volledige backup
3. Of gebruik automatic backups (indien beschikbaar in je package)

---

## Troubleshooting

### Probleem: 404 Error op home.html

**Oplossing:**
- Check of `.htaccess` correct is
- Verifieer dat `DirectoryIndex home.html` aanwezig is

### Probleem: Admin login werkt niet

**Oplossing:**
1. Open browser console (F12)
2. Check of `USE_LOCAL_MODE = true`
3. Verifieer dat LocalStorage enabled is in browser
4. Check `admin-auth.js` en `data-api.js` zijn correct uploaded

### Probleem: Contact formulier werkt niet

**Oplossing:**
- Implementeer `contact-handler.php` (zie boven)
- Check PHP mail() functie werkt op server
- Verifieer email instellingen in cPanel

### Probleem: CSS/JavaScript laadt niet

**Oplossing:**
- Check bestandspaden (gebruik relatieve paden)
- Verifieer bestandsrechten (644)
- Clear browser cache (Ctrl+F5)

### Probleem: Admin data gaat verloren

**Dit is normaal met LocalStorage!**
- Data zit in browser LocalStorage (niet op server)
- Elke browser/computer heeft eigen data
- Voor productie: migreer naar PHP/MySQL backend

---

## Alternatief: Volledige Functionaliteit (VPS Vereist)

Als je **alle functionaliteit** wilt (Node.js, SQLite, Bot):

### Opties:

**1. VPS bij Belgian Hosting**
- Prijs: ~€15-30/maand
- Volledige root access
- Node.js installeren mogelijk
- Meer configuratie vereist

**2. Cloud Hosting Alternatieven**
- **Netlify** (gratis tier): Voor static sites
- **Vercel** (gratis tier): Voor static + serverless functions
- **Railway.app**: Voor Node.js apps (€5-10/maand)
- **DigitalOcean**: VPS vanaf $6/maand

**3. Hybride Oplossing**
- Static site op Belgian Hosting
- Backend API op Railway/Vercel
- Database op PlanetScale (gratis MySQL)

---

## Samenvatting

### ✅ Kan Direct op Belgian Hosting Medium Linux:
- Volledige publieke website
- Admin panel (LocalStorage mode)
- Contact formulier (met PHP)
- SSL/HTTPS

### ⚠️ Vereist Aanpassingen:
- Admin panel moet LocalStorage gebruiken
- Contact formulier → PHP backend
- Geen real-time bot functionaliteit

### ❌ Vereist Upgrade naar VPS:
- Node.js/Express backend
- SQLite database
- Bot systeem
- Backend API

---

## Volgende Stappen

1. **Test lokaal in LocalStorage mode**
2. **Upload naar Belgian Hosting**
3. **Configureer SSL**
4. **Test alle functionaliteit**
5. **Beslis of VPS nodig is voor extra features**

Vragen? Check de troubleshooting sectie of neem contact op met Belgian Hosting support voor specifieke package details.
