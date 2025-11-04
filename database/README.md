# Database Setup - Visclub SiM

## 📊 Database Files Overzicht

| File | Gebruik | Wanneer |
|------|---------|---------|
| `schema.sql` | Complete database setup | **Eerste keer setup** |
| `create-views-only.sql` | Alleen views aanmaken | **Tabellen bestaan al** ✅ |
| `update-rls-only.sql` | Alleen security policies | **Tabellen bestaan al** ✅ |
| `rls-policies.sql` | Volledige RLS setup | Eerste keer (na schema.sql) |
| `verify-schema.js` | Verificatie script | **Altijd** |

## 🎯 Welk bestand moet ik gebruiken?

### ✅ JE KRIJGT ERROR: "relation members already exists"

**Dit betekent:** Je tabellen bestaan al! Gebruik deze files:

```bash
# Stap 1: Views aanmaken
# Kopieer HELE inhoud van create-views-only.sql
# Plak in Supabase Dashboard → SQL Editor → Run

# Stap 2: Security policies toevoegen
# Kopieer HELE inhoud van update-rls-only.sql
# Plak in Supabase Dashboard → SQL Editor → Run

# Stap 3: Verificatie
node verify-schema.js
```

**Verwachte output:**
```
✅ club_ranking
✅ veteran_ranking
✅ recent_results
✅ upcoming_competitions
✅ member_statistics
```

### ❌ TABELLEN BESTAAN NIET (Eerste keer)

**Gebruik:** `schema.sql` (complete setup)

```bash
# Stap 1: Complete database setup
# Kopieer HELE inhoud van schema.sql
# Plak in Supabase Dashboard → SQL Editor → Run

# Stap 2: Verificatie
node verify-schema.js
```

## 🔍 Verificatie Script

```bash
# Controleer of alles werkt:
node verify-schema.js
```

**Als alles goed is:**
```
🔍 Verifying Supabase Database Schema...

📋 Checking Tables:
   ✅ admin_users (1 rows)
   ✅ members (X rows)
   ✅ competitions (X rows)
   ✅ registrations (X rows)
   ✅ results (X rows)
   ✅ permits (X rows)
   ✅ contact_messages (X rows)

📊 Checking Views:
   ✅ club_ranking
   ✅ veteran_ranking
   ✅ recent_results
   ✅ upcoming_competitions
   ✅ member_statistics

✅ Database schema is complete and ready!
```

**Als je "Invalid API key" ziet:**
→ Fix je SUPABASE_SERVICE_KEY in .env (zie SETUP_INSTRUCTIONS.md)

## 🔒 Security (RLS Policies)

### Wat zijn RLS Policies?

Row Level Security = wie mag wat zien/doen in de database.

### Onze Security Setup:

| Tabel | Public | Service Role |
|-------|--------|--------------|
| `admin_users` | ❌ Niks | ✅ Alles |
| `members` | 📖 Lezen (active only) | ✅ Alles |
| `competitions` | 📖 Lezen (public only) | ✅ Alles |
| `registrations` | 📖 Lezen (confirmed only) | ✅ Alles |
| `results` | 📖 Lezen | ✅ Alles |
| `permits` | ❌ Niks | ✅ Alles |
| `contact_messages` | ❌ Niks | ✅ Alles |

**Service Role = Backend API**
**Public = Website bezoekers**

## 📊 Views (Database Queries)

### `club_ranking`
- **Doel:** Clubklassement (best 15 van 20 wedstrijden)
- **Gebruikt door:** klassement.html
- **Update:** Automatisch bij nieuwe results

### `veteran_ranking`
- **Doel:** Veteraan klassement (alle wedstrijden)
- **Gebruikt door:** klassement.html
- **Update:** Automatisch bij nieuwe results

### `recent_results`
- **Doel:** Laatste 10 wedstrijd uitslagen
- **Gebruikt door:** home.html
- **Update:** Automatisch bij nieuwe results

### `upcoming_competitions`
- **Doel:** Toekomstige wedstrijden met aantal inschrijvingen
- **Gebruikt door:** kalender.html, inschrijven.html
- **Update:** Real-time

### `member_statistics`
- **Doel:** Complete member statistieken (totalen, gemiddeldes, etc.)
- **Gebruikt door:** leden.html, admin dashboard
- **Update:** Real-time

## 🛠️ Troubleshooting

### Error: "relation already exists"
✅ **Dit is normaal!** Gebruik `create-views-only.sql` en `update-rls-only.sql`

### Error: "permission denied for table"
❌ **RLS policies ontbreken.** Run `update-rls-only.sql`

### Error: "relation does not exist"
❌ **Tabellen ontbreken.** Run `schema.sql`

### Error: "Invalid API key"
❌ **Service key incorrect.** Fix SUPABASE_SERVICE_KEY in .env

### Views returnen geen data
⚠️ **Normale situatie als database leeg is.** Voeg data toe via admin panel.

## 📝 Database Schema

### Tabellen:

```
admin_users
├── id (primary key)
├── username (unique)
├── email (unique)
├── password_hash (bcrypt)
├── role (admin, superadmin)
└── is_active

members
├── id (primary key)
├── member_number (unique)
├── first_name, last_name
├── email, phone
├── is_veteran, is_active
└── join_date

competitions
├── id (primary key)
├── name, date, location
├── type (club, veteran, special)
├── counts_for_club_ranking
├── counts_for_veteran_ranking
├── max_participants
└── status

registrations
├── id (primary key)
├── competition_id → competitions
├── member_id → members
├── payment_status
└── registration_date

results
├── id (primary key)
├── competition_id → competitions
├── member_id → members
├── position, points
├── weight_kg, fish_count
└── is_absent

permits
├── id (primary key)
├── member_id → members
├── permit_type (annual, daily)
├── start_date, end_date
├── status (pending, approved)
└── fee_amount

contact_messages
├── id (primary key)
├── name, email, phone
├── subject, message
└── status (new, read, replied)
```

## 🔗 Relaties:

```
members
  ↓
  ├─→ registrations ←─┐
  ├─→ results ←───────┤
  └─→ permits         │
                      │
                competitions
```

## 🎯 Volgende Stappen

Na database setup:

1. ✅ Run `node verify-schema.js` (moet alles groen zijn)
2. ✅ Start server: `npm start`
3. ✅ Test admin login: http://localhost:3000/admin/login.html
4. ✅ Voeg test data toe via admin panel
5. ✅ Test rankings op website

## 💡 Tips

- **Backups:** Supabase maakt automatisch dagelijkse backups
- **Migrations:** Gebruik altijd separate SQL files voor changes
- **Testing:** Test altijd eerst in development, dan production
- **RLS:** Policies kunnen niet omzeild worden via Supabase client
- **Views:** Zijn read-only en updaten automatisch

---

**Hulp nodig?** Check `SETUP_INSTRUCTIONS.md` of run `node verify-schema.js`
