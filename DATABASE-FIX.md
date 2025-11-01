# Database Connection Fix - Password Authentication Failed (28P01)

## 🔥 Je krijgt deze error:

```
❌ Database connection error: error: password authentication failed for user "postgres"
code: '28P01'
```

## ✅ De Oplossing

De **username is fout**! Je gebruikt waarschijnlijk `postgres`, maar voor de Transaction pooler (poort 6543) moet de username zijn: **`postgres.pvdebaqcqlkhibnxnwpf`**

### Stap 1: Ga naar je Supabase Dashboard

1. Open: https://supabase.com/dashboard/project/pvdebaqcqlkhibnxnwpf
2. Ga naar: **Settings** (tandwiel icoon links)
3. Klik op: **Database**
4. Scroll naar beneden naar: **Connection Pooling**

### Stap 2: Kopieer de JUISTE connection string

Onder "Connection Pooling" zie je **twee** mode opties:

- ❌ **Session mode** (poort 5433) - NIET DEZE!
- ✅ **Transaction mode** (poort 6543) - **DEZE GEBRUIKEN!**

Klik op **Transaction** en kopieer de hele URI. Deze ziet er zo uit:

```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Let op deze details:**
- Username: `postgres.pvdebaqcqlkhibnxnwpf` (niet alleen `postgres`!)
- Host: `aws-0-eu-west-1.pooler.supabase.com` (niet `db.xxx.supabase.co`!)
- Poort: `6543` (niet `5432`!)

### Stap 3: Vervang [YOUR-PASSWORD]

Vervang `[YOUR-PASSWORD]` met je echte database wachtwoord.

**LET OP:** Als je wachtwoord speciale tekens heeft zoals `@`, `#`, `$`, `%`, of `&`, moet je ze URL-encoden:

| Karakter | Vervang door |
|----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |

**Voorbeeld:**
- Wachtwoord: `my$ecret@123`
- URL-encoded: `my%24ecret%40123`
- Volledige URL: `postgresql://postgres.pvdebaqcqlkhibnxnwpf:my%24ecret%40123@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`

### Stap 4: Update je DATABASE_URL

**Op Railway:**
1. Ga naar je project dashboard
2. Klik op je service
3. Klik op **Variables** tab
4. Update `DATABASE_URL` met de nieuwe connection string
5. Klik **Deploy** (Railway redeploys automatisch)

**Op Render:**
1. Ga naar je Web Service dashboard
2. Klik op **Environment** in het menu links
3. Update de `DATABASE_URL` environment variable
4. Klik **Save Changes**
5. Render redeploys automatisch

**Lokaal (in je .env file):**
```bash
DATABASE_URL=postgresql://postgres.pvdebaqcqlkhibnxnwpf:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

### Stap 5: Test je connection

**Lokaal testen:**
```bash
npm run test-db
```

Dit script valideert je DATABASE_URL en test de connectie. Je zou moeten zien:

```
✅ CONNECTION SUCCESSFUL!
   Connection time: 250ms
   Server time:     2025-11-01 10:30:00
   Database:        postgres
   User:            postgres.pvdebaqcqlkhibnxnwpf
```

## 🔍 Veelvoorkomende Fouten

### Fout 1: Verkeerde Username Format

❌ **FOUT:**
```
postgresql://postgres:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
                ^^^^^^^^
```

✅ **JUIST:**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
                ^^^^^^^^^^^^^^^^^^^^^^^^
```

### Fout 2: Verkeerde Host

❌ **FOUT:**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:password@db.pvdebaqcqlkhibnxnwpf.supabase.co:6543/postgres
                                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

✅ **JUIST:**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
                                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

### Fout 3: Verkeerde Poort

❌ **FOUT:**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:password@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
                                                                                         ^^^^
```

✅ **JUIST:**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:password@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
                                                                                         ^^^^
```

### Fout 4: Speciale Karakters in Wachtwoord

Als je wachtwoord `Pass@2024!` is:

❌ **FOUT:**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:Pass@2024!@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

✅ **JUIST (URL-encoded):**
```
postgresql://postgres.pvdebaqcqlkhibnxnwpf:Pass%402024%21@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

## 🎯 Snelle Checklist

- [ ] Username is `postgres.pvdebaqcqlkhibnxnwpf` (met project reference)
- [ ] Host is `aws-0-eu-west-1.pooler.supabase.com` (pooler hostname)
- [ ] Poort is `6543` (Transaction mode)
- [ ] Wachtwoord is correct
- [ ] Speciale karakters in wachtwoord zijn URL-encoded
- [ ] DATABASE_URL is updated in deployment platform
- [ ] Service is opnieuw gedeployed

## 📞 Nog Steeds Problemen?

Run het test script voor gedetailleerde diagnostics:

```bash
npm run test-db
```

Het script zal:
1. Je DATABASE_URL parsen en valideren
2. Configuratie problemen detecteren
3. Verbinding testen
4. Database tabellen controleren
5. Specifieke error oplossingen geven

## 🔗 Nuttige Links

- Supabase Dashboard: https://supabase.com/dashboard/project/pvdebaqcqlkhibnxnwpf/settings/database
- Connection Pooling Docs: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- URL Encoding Tool: https://www.urlencoder.org/
