# Deployment Notities - Cloud86

## Database Configuratie Fix

### Probleem
De 500 error op `/api/auth/login` werd veroorzaakt door een **case-sensitivity issue** met de database naam.

### Oplossing
De database naam moet **lowercase** zijn op Linux servers!

**In `api/config.php` aanpassen:**
```php
// ❌ FOUT (hoofdletter V):
define('DB_NAME', 'Visclubsim');

// ✅ CORRECT (kleine letters):
define('DB_NAME', 'visclubsim');
```

### Database Details (getest via test-db-connection.php)
- **Correcte database naam**: `visclubsim` (kleine letters!)
- **Host**: `localhost`
- **Gebruiker**: `VisclubDhont`
- **Tabellen aanwezig**: 13 tabellen
  - ✅ admin_users (3 users)
  - ✅ members
  - ✅ competitions
  - ✅ permits
  - ✅ contact_messages
  - ✅ public_registrations
  - ✅ registrations
  - ✅ results
  - ✅ club_ranking
  - ✅ veteran_ranking
  - ✅ member_statistics
  - ✅ upcoming_competitions
  - ✅ recent_results

### Deployment Stappen

1. **Upload alle nieuwe files naar Cloud86** (via FTP/Plesk File Manager)
   - Alle files in `/admin/` folder
   - `config.js` (root)
   - Alle files in `/api/` folder

2. **Update api/config.php op de server**
   ```php
   define('DB_NAME', 'visclubsim');  // LET OP: kleine letters!
   ```

3. **Verwijder test files van de server** (bevatten credentials!)
   - ❌ DELETE: `/api/test-db-connection.php`
   - ❌ DELETE: `/api/debug.php`

4. **Test de login**
   - Ga naar: https://visclubsim.be/admin/login.html
   - Login credentials: (zie admin_users tabel)
   - De 500 error zou nu opgelost moeten zijn!

## Opgeloste Issues in deze deployment

### ✅ Vergunningen Popup
- Modal sluit nu correct bij klikken op "Sluiten" of "Annuleren"
- Fix: `closeModal()` reset nu zowel CSS class als display style

### ✅ Plaatsentrekking Wedstrijden
- Dropdown toont nu correct alle aankomende wedstrijden
- Fix: config.js pad gecorrigeerd naar `../config.js`

### ✅ Config.js Loading
- Alle admin pages laden nu correct de configuratie
- Fix: 12 HTML files ge-update met correct relative path

### ✅ Inschrijvingen Pagina
- Laadt correct van API (`/public-registrations`)
- Kan inschrijvingen bekijken en als betaald markeren

### ✅ Database Connection
- Database naam gefixed: `visclubsim` (lowercase)
- Login endpoint zou nu moeten werken zonder 500 error

## Security Waarschuwing 🔒

**BELANGRIJK**:
- `api/config.php` staat in `.gitignore` en wordt NIET gecommit
- Upload NOOIT credentials naar Git!
- Gebruik `api/config.php.example` als template voor nieuwe installaties
- Verwijder alle test/debug scripts van productie server!

## Na Deployment Testen

Test deze functionaliteit:
- [ ] Admin login werkt (geen 500 error meer)
- [ ] Vergunningen popup sluit correct
- [ ] Plaatsentrekking toont wedstrijden
- [ ] Contact formulier submissions zichtbaar in admin
- [ ] Inschrijvingen zichtbaar in admin
- [ ] Permits aanvragen werkt en is zichtbaar in admin

## Support

Bij problemen:
1. Check browser console voor JavaScript errors
2. Check API endpoints: https://visclubsim.be/api/health
3. Controleer database connectie met phpMyAdmin in Plesk

---
Laatste update: 2025-11-14
