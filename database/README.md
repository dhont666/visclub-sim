# 🗄️ Database Setup - Visclub SiM

Complete Supabase PostgreSQL database setup.

---

## 🚀 Quick Start (Production Setup)

Voer deze bestanden uit **in volgorde** in Supabase SQL Editor:

### 1️⃣ Schema Migration
```bash
File: FIX-SCHEMA-OPTION-A.sql
```
**Wat het doet:**
- ✅ Fix UUID type mismatches
- ✅ Add missing columns (name, member_number, is_veteran)
- ✅ Create foreign key constraints

### 2️⃣ Deploy Database Views
```bash
File: DEPLOY-VIEWS-FINAL.sql
```
**Wat het doet:**
- ✅ Create 5 production views with SECURITY INVOKER
- ✅ club_ranking, veteran_ranking, recent_results, upcoming_competitions, member_statistics

### 3️⃣ Security Policies
```bash
File: FIX-RLS-OPTIMIZATION.sql
```
**Wat het doet:**
- ✅ Enable RLS on all tables
- ✅ Create optimized security policies (1 per table)
- ✅ FORCE ROW LEVEL SECURITY

### 4️⃣ Test Data (Optional)
```bash
File: TEST-DATA.sql
```
**Wat het doet:**
- ✅ Add 5 test members
- ✅ Add 16 test competitions
- ✅ Add 50+ test results

---

## 📁 Essential Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `FIX-SCHEMA-OPTION-A.sql` | Schema migration (UUID fix) | First time setup |
| `DEPLOY-VIEWS-FINAL.sql` | Database views deployment | After schema fix |
| `FIX-RLS-OPTIMIZATION.sql` | Security policies (optimized) | After views |
| `TEST-DATA.sql` | Add test data | For testing |
| `verify-schema.js` | Verification script | After setup |
| `check-schema.js` | Schema inspection | Troubleshooting |

---

## 🔍 Verification

After setup, run:

```bash
node verify-schema.js
```

**Expected output:**
```
✅ All tables exist
✅ All views created
✅ Database schema is complete!
```

---

## 📊 Database Schema

### Tables:
- **members** - Member information (UUID id)
- **competitions** - Competition data (INTEGER id)
- **results** - Competition results (UUID member_id → members.id)
- **registrations** - Competition registrations (UUID member_id → members.id)
- **permits** - Permit applications

### Views:
- **club_ranking** - Best 15 out of 20 competitions
- **veteran_ranking** - Veteran ranking (min 5 competitions)
- **recent_results** - Last 10 competitions with JSON results
- **upcoming_competitions** - Future competitions + registration counts
- **member_statistics** - Comprehensive member statistics (18 metrics)

---

## 🔒 Security (RLS)

### Public Access (anon/authenticated):
- ✅ READ active members
- ✅ READ scheduled/completed competitions
- ✅ READ confirmed registrations
- ✅ READ all results
- ✅ READ all views

### Service Role Access:
- ✅ FULL access to all tables
- ✅ INSERT, UPDATE, DELETE operations

**Policy Type:** Single consolidated policy per table (optimized)

---

## 🛠️ Troubleshooting

**"column does not exist" error:**
→ Run `FIX-SCHEMA-OPTION-A.sql`

**"permission denied" error:**
→ Run `FIX-RLS-OPTIMIZATION.sql`

**Views are empty:**
→ Normal if no data. Run `TEST-DATA.sql` for test data

**Supabase warnings:**
→ Already fixed in current scripts

---

## 📂 Archive Folder

Old/deprecated files zijn verplaatst naar `archive/`:
- Discovery scripts
- Old view versions
- Documentation iterations
- Schema exploration files

**Gebruik deze NIET** - ze zijn alleen voor referentie.

---

## ✅ Setup Checklist

- [ ] Run `FIX-SCHEMA-OPTION-A.sql` in Supabase
- [ ] Run `DEPLOY-VIEWS-FINAL.sql` in Supabase
- [ ] Run `FIX-RLS-OPTIMIZATION.sql` in Supabase
- [ ] (Optional) Run `TEST-DATA.sql` for test data
- [ ] Run `node verify-schema.js` locally
- [ ] Check Supabase Dashboard (should show 0 warnings)
- [ ] Test views with SELECT queries

---

## 🎯 Next Steps

After database setup:
1. Configure `.env` with SUPABASE_URL and SUPABASE_SERVICE_KEY
2. Start backend: `npm start`
3. Test admin panel: `http://localhost:3000/admin/`
4. Add real members and competitions via admin interface
5. Deploy to production

---

**Status:** ✅ Production Ready
**Warnings:** 0
**Last Updated:** November 2025
