# Pre-Deployment Checklist - Visclub SiM Website

## ✅ Checklist Voor Upload

Print deze lijst en vink af terwijl je werkt!

### 1. Code Voorbereiding

- [ ] **Admin LocalStorage Mode geactiveerd**
  - [ ] `admin/login.html`: `USE_LOCAL_MODE = true`
  - [ ] `admin/admin-auth.js`: `this.USE_LOCAL_MODE = true`

- [ ] **Test Admin Panel Lokaal**
  - [ ] Login werkt met `admin` / `admin123`
  - [ ] Dashboard laadt
  - [ ] Data wordt opgeslagen in LocalStorage
  - [ ] Geen console errors (F12)

- [ ] **Test Publieke Website Lokaal**
  - [ ] Alle pagina's laden correct
  - [ ] Navigatie werkt
  - [ ] Kalender toont competities
  - [ ] Klassement toont data
  - [ ] Formulieren werken

- [ ] **Afbeeldingen Geoptimaliseerd**
  - [ ] Afbeeldingen gecomprimeerd (< 500KB per afbeelding)
  - [ ] Correct formaat gebruikt (JPG voor foto's, PNG voor logo's)

- [ ] **Code Opgeschoond**
  - [ ] Geen console.log() statements in productie code
  - [ ] Geen test/debug code
  - [ ] Commentaar verwijderd waar niet nodig

### 2. Bestandsstructuur

- [ ] **Alle benodigde bestanden aanwezig:**

**Root Directory:**
```
□ index.html
□ home.html
□ kalender.html
□ klassement.html
□ inschrijven.html
□ inschrijvingen.html
□ leden.html
□ visvergunning.html
□ contact.html
□ weer.html
□ gallerij.html
□ route.html
□ style.css
□ script.js
□ klassement-data.js
□ vijverkaart.js
```

**Admin Directory:**
```
□ admin/login.html
□ admin/index.html
□ admin/plaatsentrekking.html
□ admin/klassement-beheer.html
□ admin/vergunningen.html
□ admin/contact-berichten.html
□ admin/admin-chat.html
□ admin/admin-nav.html
□ admin/admin-script.js
□ admin/admin-auth.js
□ admin/data-api.js
□ admin/admin-badges.js
```

**Assets:**
```
□ images/ directory (alle afbeeldingen)
□ assets/ directory (indien aanwezig)
```

- [ ] **NIET uploaden:**
  - [ ] `node_modules/` (indien aanwezig)
  - [ ] `tests/` (optioneel)
  - [ ] `.git/` directory
  - [ ] `server/` directory (Node.js backend werkt niet op shared hosting)
  - [ ] `bot/` directory (werkt niet op shared hosting)
  - [ ] `database/` directory (SQLite werkt niet op shared hosting)
  - [ ] `.env` bestanden
  - [ ] `package.json`, `package-lock.json`

### 3. Configuratie Bestanden

- [ ] **`.htaccess` voorbereid**
  - [ ] HTTPS redirect ingesteld
  - [ ] DirectoryIndex naar home.html
  - [ ] Caching headers
  - [ ] Security headers

- [ ] **Contact Formulier**
  - [ ] PHP handler script gemaakt (`contact-handler.php`)
  - [ ] Email adres ingesteld in PHP script
  - [ ] `contact.html` wijst naar PHP handler

### 4. Belgian Hosting Account

- [ ] **Account Informatie Klaar**
  - [ ] cPanel login URL: ___________________________
  - [ ] Gebruikersnaam: ___________________________
  - [ ] Wachtwoord: ___________________________
  - [ ] FTP gegevens (optioneel): ___________________________

- [ ] **Domein Geconfigureerd**
  - [ ] Domeinnaam: ___________________________
  - [ ] DNS wijst naar Belgian Hosting servers
  - [ ] Domein geactiveerd in cPanel

### 5. Veiligheid

- [ ] **Wachtwoorden Aanpassen**
  - [ ] Admin panel default wachtwoorden gewijzigd
  - [ ] In `admin/login.html`: Verander default credentials!

- [ ] **Gevoelige Informatie Verwijderd**
  - [ ] Geen API keys in code
  - [ ] Geen database credentials
  - [ ] Geen persoonlijke test data

### 6. Testing (NA upload)

Vink af NA deployment:

- [ ] **Website Toegankelijk**
  - [ ] `https://jouwdomein.be` laadt
  - [ ] Geen SSL warnings
  - [ ] HTTP redirect naar HTTPS werkt

- [ ] **Alle Pagina's Testen**
  - [ ] Home page
  - [ ] Kalender
  - [ ] Klassement
  - [ ] Inschrijven
  - [ ] Inschrijvingen overzicht
  - [ ] Leden
  - [ ] Visvergunning aanvraag
  - [ ] Contact
  - [ ] Weer
  - [ ] Galerij
  - [ ] Route

- [ ] **Admin Panel Testen**
  - [ ] Login pagina laadt
  - [ ] Kan inloggen
  - [ ] Dashboard werkt
  - [ ] Data opslaan werkt
  - [ ] Admin navigatie werkt

- [ ] **Formulieren Testen**
  - [ ] Contact formulier verstuurt email
  - [ ] Inschrijvingsformulier werkt
  - [ ] Validatie werkt

- [ ] **Verschillende Browsers**
  - [ ] Chrome/Edge
  - [ ] Firefox
  - [ ] Safari (indien beschikbaar)
  - [ ] Mobiele browser

- [ ] **Verschillende Apparaten**
  - [ ] Desktop
  - [ ] Tablet
  - [ ] Smartphone

### 7. Performance

- [ ] **Laadtijd Testen**
  - [ ] Website laadt in < 3 seconden
  - [ ] Afbeeldingen laden correct
  - [ ] Geen broken links

- [ ] **Google PageSpeed Insights**
  - [ ] Test op: https://pagespeed.web.dev/
  - [ ] Score > 80 (ideaal)

### 8. Backup & Rollback Plan

- [ ] **Lokale Backup**
  - [ ] Volledige website backup gemaakt
  - [ ] Opgeslagen op: ___________________________
  - [ ] Datum backup: ___________________________

- [ ] **Rollback Plan**
  - [ ] Weet hoe bestanden te verwijderen in cPanel
  - [ ] Oude versie bewaard (indien update)

### 9. Monitoring & Onderhoud

- [ ] **Analytics Setup**
  - [ ] Google Analytics code toegevoegd (optioneel)
  - [ ] Tracking werkt

- [ ] **Uptime Monitoring**
  - [ ] UptimeRobot account aangemaakt (optioneel)
  - [ ] Website toegevoegd aan monitoring

- [ ] **Regular Maintenance Plan**
  - [ ] Wekelijkse backup schedule
  - [ ] Maandelijkse content update
  - [ ] SSL certificaat vernieuwing (automatisch)

---

## Quick Reference

### Default Admin Credentials (WIJZIG DEZE!)
```
Username: admin
Password: admin123
```

### Belgian Hosting Support
```
Website: https://www.belgianhosting.be
Support: Via cPanel ticket systeem
```

### Emergency Contacts
```
Webmaster: ___________________________
Hosting Support: ___________________________
```

---

## Na Succesvolle Deployment

- [ ] Deel website URL met leden
- [ ] Update social media met nieuwe URL
- [ ] Informeer leden over admin panel (indien relevant)
- [ ] Plan content updates
- [ ] Monitor eerste week voor issues

---

**Laatste check datum:** ____ / ____ / 2025

**Deployment uitgevoerd door:** ___________________________

**Status:** □ Klaar voor deployment  □ Deployment geslaagd  □ Issues gevonden

**Notities:**
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________
