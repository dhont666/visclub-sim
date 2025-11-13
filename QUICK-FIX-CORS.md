# 🚨 QUICK FIX - CORS & API Connection Problemen

## ❌ Probleem
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading
the remote resource at https://www.visclubsim.be/api/auth/login.
(Reason: CORS header 'Access-Control-Allow-Origin' missing)

Kan geen verbinding maken met de server.
```

## ✅ Oplossing (Stap voor Stap)

### Stap 1: Upload Nieuwe API Bestanden

Upload deze 3 bestanden naar Cloud86:

```
📄 api/index.php      ← Updated met betere CORS headers
📄 api/.htaccess      ← 🆕 NIEUW! Apache configuratie
📄 api/test.php       ← 🆕 NIEUW! Test script
```

**Via Plesk File Manager:**
1. Log in op Cloud86 Plesk
2. Ga naar **Files** → **File Manager**
3. Navigeer naar `public_html/api/`
4. Upload alle 3 bestanden

**Via FTP:**
1. Verbind met je FTP account
2. Ga naar `public_html/api/`
3. Upload alle 3 bestanden
4. Overschrijf `index.php` als gevraagd

---

### Stap 2: Test of API Draait

Open in je browser:
```
https://visclubsim.be/api/test.php
```

**✅ VERWACHT RESULTAAT:**
Je moet een JSON response zien zoals:
```json
{
    "status": "OK",
    "message": "API is werkend!",
    "timestamp": "2025-01-13 12:34:56",
    "php_version": "8.1.0",
    "tests": {
        "php_running": true,
        "json_encode": true,
        "pdo_available": true,
        "curl_available": true,
        "config_file": true,
        "database_file": true,
        "auth_file": true,
        "index_file": true
    }
}
```

**❌ ALS JE EEN ERROR ZIET:**
- Error 404 = Bestand niet geüpload
- Error 500 = PHP error (check error logs in Plesk)
- Download prompt = MIME type verkeerd (negeer, API werkt)
- Blanco pagina = PHP error (check error logs)

---

### Stap 3: Test de Health Endpoint

Open in je browser:
```
https://visclubsim.be/api/health
```

**✅ VERWACHT RESULTAAT:**
```json
{
    "status": "ok",
    "timestamp": "2025-01-13T12:34:56Z",
    "version": "1.0.0"
}
```

**❌ ALS DIT NIET WERKT:**
- Check of `.htaccess` correct is geüpload
- Check of mod_rewrite enabled is in Apache (normaal enabled op Cloud86)

---

### Stap 4: Test Admin Login

1. Ga naar: `https://visclubsim.be/admin/`
2. Probeer in te loggen met admin credentials
3. Open browser Developer Tools (F12) → Network tab
4. Kijk naar de login request

**✅ VERWACHT:**
- Request naar `/api/auth/login` slaagt (status 200)
- Response bevat `token` en `user` data
- Je wordt ingelogd en doorgestuurd naar dashboard

**❌ ALS HET NOG STEEDS FAALT:**

**Check 1: Database Credentials**
Controleer `api/config.php`:
```php
define('DB_NAME', 'jouw_echte_database_naam');
define('DB_USER', 'jouw_echte_database_gebruiker');
define('DB_PASS', 'jouw_echte_wachtwoord');
```

**Check 2: Database Tabellen**
Log in op phpMyAdmin en controleer of deze tabel bestaat:
- `admin_users` (moet admin gebruikers bevatten)

**Check 3: PHP Error Logs**
Ga naar Plesk → Logs → Error Log
Kijk naar recente fouten

---

## 🔍 Debugging Checklist

Als admin login nog steeds niet werkt:

### 1. Check API Response in Browser Console

Open Developer Tools (F12) → Console tab en voer uit:
```javascript
fetch('https://visclubsim.be/api/health')
  .then(r => r.json())
  .then(data => console.log('API Health:', data))
  .catch(err => console.error('API Error:', err));
```

### 2. Check CORS Headers

Open Developer Tools (F12) → Network tab:
1. Refresh de admin login pagina
2. Probeer in te loggen
3. Klik op de `/api/auth/login` request
4. Klik op "Headers" tab
5. Scroll naar "Response Headers"

**Je MOET deze headers zien:**
```
Access-Control-Allow-Origin: https://visclubsim.be
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

**Als deze NIET aanwezig zijn:**
- `.htaccess` is niet correct geüpload
- Of mod_headers is niet enabled (contact Cloud86 support)

### 3. Test Login Direct in Browser Console

Open Developer Tools (F12) → Console tab en voer uit:
```javascript
fetch('https://visclubsim.be/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => console.log('Login Response:', data))
.catch(err => console.error('Login Error:', err));
```

**✅ Verwacht:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    ...
  }
}
```

**❌ Als je error krijgt:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```
= Database heeft geen admin users OF wachtwoord is verkeerd

---

## 🛠️ Veelvoorkomende Fixes

### Fix 1: Database Niet Gevonden
```
Error: SQLSTATE[HY000] [1049] Unknown database
```

**Oplossing:**
1. Log in op Plesk → Databases
2. Noteer de exacte database naam
3. Update `api/config.php` met deze naam

### Fix 2: Admin User Bestaat Niet
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Oplossing:**
1. Log in op phpMyAdmin
2. Ga naar tabel `admin_users`
3. Controleer of er een gebruiker met username `admin` bestaat
4. Als niet, importeer het volledige `database/mysql-schema.sql` bestand

### Fix 3: JWT Secret Error
```
ERROR: Please set a strong JWT_SECRET
```

**Oplossing:**
De JWT_SECRET in `api/config.php` is al correct geconfigureerd.
Als je deze error ziet, is het bestand niet correct geüpload.

---

## 📝 Samenvatting Benodigde Uploads

**Deze bestanden MOETEN op Cloud86 staan:**

```
✅ api/index.php         (updated - CORS fix)
✅ api/.htaccess         (NIEUW - Apache config)
✅ api/test.php          (NIEUW - test script)
✅ api/config.php        (met correcte DB credentials!)
✅ api/database.php      (moet al aanwezig zijn)
✅ api/auth.php          (moet al aanwezig zijn)
```

**En je database moet deze tabellen hebben:**
```
✅ admin_users           (met minstens 1 gebruiker)
✅ members
✅ competitions
✅ results
✅ registrations
✅ permits
✅ contact_messages      (NIEUW)
✅ public_registrations  (NIEUW)
```

---

## 🆘 Nog Steeds Niet Werkend?

**Controleer deze dingen:**

1. **PHP Versie**: Moet PHP 7.4 of hoger zijn
   - Check in Plesk → PHP Settings

2. **Mod_Rewrite**: Moet enabled zijn
   - Check in Plesk → Apache & nginx Settings

3. **File Permissions**:
   - `api/` directory: 755
   - `api/*.php` files: 644
   - `api/.htaccess`: 644

4. **Error Logs**:
   - Plesk → Logs → Error Log
   - Kijk naar PHP errors rond de tijd van je test

5. **Database Connection**:
   Test met dit commando in phpMyAdmin SQL tab:
   ```sql
   SELECT * FROM admin_users LIMIT 1;
   ```
   Als dit faalt, zijn je database credentials verkeerd.

---

## ✅ Success Criteria

Admin panel werkt goed als:
- ✅ `https://visclubsim.be/api/test.php` toont JSON
- ✅ `https://visclubsim.be/api/health` toont JSON
- ✅ Je kunt inloggen op `https://visclubsim.be/admin/`
- ✅ Na login zie je het admin dashboard
- ✅ Je kunt naar "Contact Berichten" navigeren
- ✅ Je kunt naar "Inschrijvingen" navigeren

Als al deze dingen werken, is alles goed! 🎉
