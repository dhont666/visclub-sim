# DATABASE CONNECTION FIX - Visclub SiM

## 🔴 PROBLEEM

```
Response status: 500
Response data: { success: false, error: "Database connection failed" }
```

De API werkt, maar kan geen verbinding maken met de database.

---

## ✅ OPLOSSING IN 3 STAPPEN

### STAP 1: Upload Test Script

1. Upload bestand: `api/test-db-connection.php` naar `public_html/api/`

2. Open in browser: `https://www.visclubsim.be/api/test-db-connection.php`

3. Het script toont precies wat er mis is!

---

### STAP 2: Check Database in Plesk

1. **Log in op Plesk** (https://cloud86.eu:8443 of jouw Plesk URL)

2. **Ga naar Databases**

3. **Controleer**:
   - Bestaat de database `visclubsim`?
   - Bestaat de gebruiker `VisclubDhont`?
   - Klopt het wachtwoord?

4. **Als database NIET bestaat**:
   - Klik "Add Database"
   - Database naam: `visclubsim` (kleine letters!)
   - Username: `VisclubDhont`
   - Password: `Kutwijf666` (of kies een nieuwe)
   - Klik "OK"

5. **Noteer de exacte namen** (hoofdletters maken uit op Linux!)

---

### STAP 3: Update api/config.php

1. Open via Plesk File Manager: `public_html/api/config.php`

2. Pas regels 32-35 aan met de EXACTE waarden uit Plesk:

```php
define('DB_HOST', 'localhost');  // Meestal 'localhost'
define('DB_NAME', 'visclubsim'); // ← EXACT zoals in Plesk
define('DB_USER', 'VisclubDhont'); // ← EXACT zoals in Plesk
define('DB_PASS', 'Kutwijf666'); // ← Wachtwoord uit Plesk
```

⚠️ **LET OP**:
- Gebruik KLEINE letters voor database naam (Linux is case-sensitive!)
- Gebruik GEEN spaties
- Kopieer EXACT uit Plesk

3. Sla op

---

### STAP 4: Import Database Schema

1. **Ga naar phpMyAdmin** (via Plesk → Databases → phpMyAdmin)

2. **Selecteer database** `visclubsim` in het linker menu

3. **Klik op "Import" tab**

4. **Kies bestand**: `database/COMPLETE-SCHEMA.sql`
   - Kijk op je computer in:
   - `C:\Users\kevin\Desktop\Viswebsite2\vissersclub-sim-website\database\COMPLETE-SCHEMA.sql`

5. **Klik "Go"**

6. **Verifieer**: Je zou nu deze tabellen moeten zien:
   - admin_users
   - members
   - registrations
   - permits
   - competitions
   - results
   - contact_messages
   - draws

---

## 🧪 TESTEN

### Test 1: Database Connection Script
```
https://www.visclubsim.be/api/test-db-connection.php
```
Verwacht: Alle ✅ groene checkmarks

### Test 2: API Health Check
```
https://www.visclubsim.be/api/health
```
Verwacht:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T...",
  "database": "connected"
}
```

### Test 3: Test Permit Creation
1. Ga naar: `https://www.visclubsim.be/visvergunning.html`
2. Vul formulier in
3. Klik "Verstuur Aanvraag"
4. Verwacht: Groene success message (GEEN 500 error!)

---

## 🔍 TROUBLESHOOTING

### Probleem: "Access denied for user"
**Oplossing**: Wachtwoord klopt niet
- Reset wachtwoord in Plesk → Databases
- Update `api/config.php` met nieuwe wachtwoord

### Probleem: "Unknown database"
**Oplossing**: Database bestaat niet
- Maak database aan in Plesk → Databases → Add Database
- Of pas `DB_NAME` aan naar bestaande database

### Probleem: "Can't connect to MySQL server"
**Oplossing**: Verkeerde host
- Probeer `'127.0.0.1'` in plaats van `'localhost'`
- Of probeer volledige hostname uit Plesk

### Probleem: "No such file or directory"
**Oplossing**: MySQL socket probleem
- Contact Cloud86 support
- Vraag correcte DB_HOST waarde

### Probleem: Tables niet gevonden
**Oplossing**: Schema niet geïmporteerd
- Import `database/COMPLETE-SCHEMA.sql` via phpMyAdmin
- Verifieer dat alle 8 tabellen bestaan

---

## 📋 CHECKLIST

Database Setup:
- [ ] Database bestaat in Plesk
- [ ] Database user bestaat in Plesk
- [ ] Wachtwoord is correct
- [ ] api/config.php heeft juiste credentials
- [ ] Database schema is geïmporteerd (8 tabellen)

Testing:
- [ ] test-db-connection.php toont alle ✅
- [ ] /api/health geeft 200 OK
- [ ] Permit formulier werkt zonder 500 error

Cleanup:
- [ ] Verwijder api/test-db-connection.php na testen (veiligheid!)

---

## 💡 SNELLE DEBUG

Run deze query in phpMyAdmin om te testen:

```sql
-- Test of database werkt
SELECT COUNT(*) as total_permits FROM permits;
SELECT COUNT(*) as total_members FROM members;
SELECT COUNT(*) as total_admins FROM admin_users;
```

Als deze werken, is de database OK!

---

## 🆘 NOG STEEDS NIET WERKEND?

Stuur mij:
1. Screenshot van test-db-connection.php resultaat
2. Screenshot van Plesk → Databases
3. Eerste 40 regels van api/config.php (zonder wachtwoord!)
4. Error message uit browser console

Dan help ik verder!

---

**Let op**: Verwijder `api/test-db-connection.php` na testen voor veiligheid!
