# 🚀 Setup Instructies - Visclub SiM

## ✅ Wat al gedaan is:

- ✅ Alle security fixes toegepast
- ✅ Packages geïnstalleerd (express-rate-limit, helmet, etc.)
- ✅ JWT secret gegenereerd (sterk, 64 karakters)
- ✅ Server configuratie klaar
- ✅ .env bestand aangemaakt

## ⚠️ Nog te doen (10 minuten):

### Stap 1: Supabase Service Key Ophalen (5 min)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Selecteer je project**: pvdebaqcqlkhibnxnwpf
3. **Ga naar Settings** (tandwiel icoon links onderaan)
4. **Klik op "API"** in het menu
5. **Kopieer de "service_role" key** (NIET de "anon" key!)
   - Het is een lange string die begint met `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Dit is de **geheime** key die alleen server-side gebruikt mag worden

### Stap 2: Service Key Toevoegen aan .env (2 min)

1. **Open `.env`** in de root van het project
2. **Zoek deze regel:**
   ```env
   SUPABASE_SERVICE_KEY=eyJ...YOUR_ACTUAL_SERVICE_KEY_HERE
   ```
3. **Vervang de hele waarde** met je echte service_role key van Supabase
4. **Save het bestand**

⚠️ **LET OP:** De huidige waarde in .env lijkt 2 JWT tokens aan elkaar geplakt te zijn. Vervang met alleen de service_role key!

### Stap 3: Database Verificatie (2 min)

```bash
# Test of de connectie werkt:
node database/verify-schema.js
```

**Verwachte output als alles goed is:**
```
🔍 Verifying Supabase Database Schema...

📋 Checking Tables:
   ✅ admin_users (1 rows)
   ✅ members (0 rows)
   ✅ competitions (0 rows)
   ... etc

📊 Checking Views:
   ✅ club_ranking
   ✅ veteran_ranking
   ... etc

✅ Database schema is complete and ready!
```

**Als tabellen ontbreken:**
1. Ga naar Supabase Dashboard → SQL Editor
2. Open en run `database/schema.sql` (maakt tabellen aan)
3. Open en run `database/rls-policies.sql` (security policies)
4. Run verificatie script opnieuw

### Stap 4: Server Starten (1 min)

```bash
# Start de backend API server
npm start

# Of vanuit de root directory:
cd server && node api-supabase.js
```

**Verwachte output:**
```
✅ Supabase client initialized
   URL: https://pvdebaqcqlkhibnxnwpf.supabase.co
✅ JWT_SECRET validated (length: 64 characters)
═══════════════════════════════════════
  🎣 Visclub SiM API Server
  (Supabase Client Version)
═══════════════════════════════════════
  Port: 3000
  Environment: development
  Time: 2025-11-04T18:41:12.190Z
  Connection: HTTPS (Supabase Client)
═══════════════════════════════════════
```

### Stap 5: Admin Panel Testen (2 min)

1. **Open browser:** http://localhost:3000/admin/login.html
2. **Login met credentials uit database** (niet meer hardcoded!)
   - Als je nog geen admin user hebt, voeg er één toe via Supabase Dashboard

**Check console voor:**
```
🔧 Admin Login Configured: { mode: 'Backend API', ... }
```

---

## 🔧 Troubleshooting

### Error: "Invalid API key"
**Probleem:** Service key is niet correct

**Oplossing:**
1. Check of je de **service_role** key hebt (niet anon key)
2. Check of de key VOLLEDIG gekopieerd is (vaak zijn ze 200+ karakters)
3. Check of er geen extra spaties of enters in .env staan
4. De key moet beginnen met: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`

### Error: "relation members already exists"
**Probleem:** Tabellen bestaan al

**Oplossing:**
- ✅ Dit is GOED! Het betekent dat je database al schema heeft
- Skip het runnen van schema.sql
- Run alleen `node database/verify-schema.js` om te verifiëren

### Error: "JWT_SECRET is using a known weak value"
**Probleem:** .env heeft een example waarde

**Oplossing:**
- ✅ Dit is al opgelost! Je .env heeft nu een sterke 64-char secret
- Als je toch deze error ziet, check of .env correct geladen wordt

### Server start niet
**Mogelijke oorzaken:**
1. Port 3000 is al in gebruik
   - Oplossing: Verander PORT in .env naar 3001
2. .env wordt niet gevonden
   - Check of .env in de root van het project staat (niet in server/)
3. Packages niet geïnstalleerd
   - Run: `npm install`

---

## 📊 Huidige Status

### ✅ Voltooid:
- Server configuratie
- Security fixes (6/6 critical issues)
- Input validation
- Rate limiting
- XSS protection
- JWT validation
- Helmet security headers
- Configuration management

### ⏳ Nog te doen:
- Supabase service key correct instellen
- Database schema verifiëren
- Admin user aanmaken in database

### 🎯 Productie Ready na:
- Correcte service key (5 min)
- Database verificatie (2 min)
- Test admin login (2 min)

**Totale tijd:** ~10 minuten

---

## 🔑 Belangrijke Keys

Je hebt 2 verschillende JWT keys:

1. **Supabase Service Role Key** (in .env)
   - Van Supabase Dashboard → Settings → API
   - Gebruikt door backend API om database te benaderen
   - MOET geheim blijven!

2. **JWT Secret** (in .env)
   - Voor authenticatie tokens die de backend genereert
   - Gebruikt om admin sessies te beveiligen
   - Al gegenereerd: `fcd418011745fcae2e0bfceb3943c9954bbc219d04e198f94bf28db637807ddb`

**Niet in de war brengen!** Deze zijn verschillend en hebben verschillende functies.

---

## 🆘 Hulp nodig?

**Error messages:**
- Check de console output voor specifieke errors
- Run `node database/verify-schema.js` voor database diagnostics
- Check `.env` file syntax (geen extra spaties, quotes, etc.)

**Quick checks:**
```bash
# 1. Is .env correct?
cat .env | grep SUPABASE_SERVICE_KEY

# 2. Zijn packages geïnstalleerd?
npm list express-rate-limit

# 3. Werkt Supabase connectie?
node database/verify-schema.js

# 4. Start de server?
cd server && node api-supabase.js
```

---

## 🎉 Als alles werkt:

Je zou moeten zien:
- ✅ Server draait op port 3000
- ✅ Database connectie werkt
- ✅ Admin login werkt
- ✅ Alle security features actief

**Dan ben je klaar voor development!** 🚀

---

**Volgende stap:** Lees `DEPLOYMENT_CHECKLIST.md` voor productie deployment.
