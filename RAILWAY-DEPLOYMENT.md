# 🚂 Railway Deployment Guide

Complete guide voor het deployen van de Visclub SiM backend naar Railway.

---

## 🚀 Quick Deploy (5 minuten)

### Stap 1: Railway Project Aanmaken

1. Ga naar [railway.app](https://railway.app)
2. Log in met je account
3. Klik **"New Project"**
4. Selecteer **"Deploy from GitHub repo"**
5. Kies: `dhont666/visclub-sim`
6. Railway detecteert automatisch Node.js

---

### Stap 2: Environment Variables Instellen

In Railway Dashboard → **Variables** tab, voeg toe:

```bash
# Required Variables
PORT=3000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://pvdebaqcqlkhibnxnwpf.supabase.co
SUPABASE_SERVICE_KEY=<your-service-key>

# JWT Configuration
JWT_SECRET=<your-64-char-secret>

# CORS Configuration
CORS_ORIGIN=https://jouw-website.be,http://localhost:3000

# Optional: Database Config
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**⚠️ BELANGRIJK:**
- Kopieer `SUPABASE_SERVICE_KEY` uit je `.env` file
- Kopieer `JWT_SECRET` uit je `.env` file
- Update `CORS_ORIGIN` met je echte domein

---

### Stap 3: Deploy Settings

Railway detecteert automatisch:
- ✅ `package.json` → Node.js project
- ✅ `start` script → `node server/api-supabase.js`
- ✅ Dependencies → Automatisch geïnstalleerd

**Custom Settings (indien nodig):**
- Start Command: `node server/api-supabase.js`
- Build Command: (leeg laten)
- Install Command: `npm install`

---

### Stap 4: Deploy!

1. Klik **"Deploy"**
2. Wacht 2-3 minuten
3. Railway build het project
4. Deploy is klaar!

---

## 🔗 Je Railway URL Krijgen

Na deployment:
1. Ga naar **Settings** tab
2. Scroll naar **Domains**
3. Klik **"Generate Domain"**
4. Je krijgt: `https://visclub-sim-production.up.railway.app`

**Deze URL gebruiken in je frontend!**

---

## ✅ Verificatie

Test je Railway backend:

### 1. Health Check
```bash
curl https://jouw-project.up.railway.app/api/health
```

**Verwacht:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T10:00:00.000Z"
}
```

### 2. Test Supabase Connection
```bash
curl https://jouw-project.up.railway.app/api/members
```

**Verwacht:**
- Status 200 of 401 (auth required)
- JSON response

### 3. Test CORS
Open browser console op je website:
```javascript
fetch('https://jouw-project.up.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Verwacht:** Geen CORS errors

---

## 🔧 Troubleshooting

### Error: "Application failed to respond"
**Oorzaak:** Port binding issue
**Fix:**
```javascript
// In server/api-supabase.js
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Error: "Invalid API key"
**Oorzaak:** `SUPABASE_SERVICE_KEY` niet ingesteld
**Fix:** Check Railway Variables tab

### Error: "CORS policy blocked"
**Oorzaak:** `CORS_ORIGIN` incorrect
**Fix:** Update `CORS_ORIGIN` in Railway Variables:
```
CORS_ORIGIN=https://jouw-website.be
```

### Error: "Module not found"
**Oorzaak:** Dependencies niet geïnstalleerd
**Fix:** Railway rebuild triggeren:
```bash
git commit --allow-empty -m "Trigger rebuild"
git push origin master
```

---

## 📊 Railway Dashboard

### Tabs Overzicht:

**Deployments:**
- Build logs bekijken
- Deploy history
- Rollback naar vorige versie

**Metrics:**
- CPU usage
- Memory usage
- Request counts

**Variables:**
- Environment variables
- Secrets management

**Settings:**
- Domain configuration
- Deploy settings
- Danger zone (delete)

---

## 🔄 Updates Deployen

Railway auto-deploy bij elke push naar `master`:

```bash
# Make changes
git add .
git commit -m "Update backend"
git push origin master

# Railway automatically:
# 1. Detects push
# 2. Pulls code
# 3. Installs dependencies
# 4. Redeploys
```

**Deployment tijd:** ~2-3 minuten

---

## 💰 Railway Pricing

**Starter Plan (FREE):**
- $5 credit/month
- ~500 uur uptime
- Perfect voor development/testing

**Developer Plan ($5/month):**
- $5 credit + $5/month
- ~1000 uur uptime
- Voor production

**Estimated Cost:** $2-5/month voor je backend

---

## 🌐 Custom Domain (Optioneel)

Gebruik je eigen domein:

1. Railway Dashboard → **Settings** → **Domains**
2. Klik **"Custom Domain"**
3. Voer in: `api.jouw-website.be`
4. Voeg CNAME record toe bij Belgian Hosting:
   ```
   Type: CNAME
   Name: api
   Value: jouw-project.up.railway.app
   ```
5. Wacht op DNS propagatie (5-60 min)

**Result:** `https://api.jouw-website.be`

---

## 🔐 Security Checklist

Na deployment:

- [ ] `JWT_SECRET` is sterk (64+ characters)
- [ ] `SUPABASE_SERVICE_KEY` is correct
- [ ] `CORS_ORIGIN` bevat alleen jouw domein
- [ ] `NODE_ENV=production` ingesteld
- [ ] Health check werkt
- [ ] HTTPS is enabled (automatisch via Railway)
- [ ] Rate limiting is actief
- [ ] Helmet security headers enabled

---

## 📝 Environment Variables Checklist

```bash
# Required (MUST HAVE)
✅ PORT
✅ NODE_ENV
✅ SUPABASE_URL
✅ SUPABASE_SERVICE_KEY
✅ JWT_SECRET
✅ CORS_ORIGIN

# Optional
⚪ DATABASE_URL (als je Railway Postgres gebruikt)
⚪ LOG_LEVEL (default: info)
```

---

## 🎯 Next Steps

Na Railway deployment:

1. ✅ Test alle API endpoints
2. ✅ Update frontend `config.js` met Railway URL
3. ✅ Deploy frontend naar Belgian Hosting
4. ✅ Test volledige flow (frontend → backend → database)
5. ✅ Monitor logs eerste dagen
6. ✅ Setup error alerting (optioneel)

---

## 📞 Support

**Railway Issues:**
- [Railway Discord](https://discord.gg/railway)
- [Railway Docs](https://docs.railway.app)

**Project Issues:**
- Check Railway logs
- Check Supabase logs
- Test lokaal eerst

---

**Status:** Ready for deployment! 🚀
**Estimated Time:** 5 minuten
**Difficulty:** Easy

Let's deploy! 🎉
