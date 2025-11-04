# Admin Panel Update Instructies

## Wat is er veranderd?

De admin panel gebruikt nu **standaard Supabase backend** in plaats van LocalStorage.

## Nieuwe Files

1. **config.js** - Auto-detecteert of je lokaal of in productie draait
   - Lokaal: gebruikt `http://localhost:3000/api`
   - Productie: gebruikt je eigen domein + `/api`

2. **Updated data-api.js** - Heeft nu offline fallback en sync functionaliteit

## Hoe te gebruiken

### 1. Laad config.js in ALLE admin HTML files

Voeg dit toe in de `<head>` sectie van ELKE admin HTML file:

```html
<!-- Load config first, before any other scripts -->
<script src="config.js"></script>
```

### 2. Files die geüpdatet moeten worden:

- [x] login.html (✅ DONE)
- [ ] index.html
- [ ] plaatsentrekking.html
- [ ] leden.html
- [ ] settings.html
- [ ] vergunningen.html
- [ ] weging.html
- [ ] contact-berichten.html
- [ ] klassement-beheer.html
- [ ] admin-chat.html

### 3. Voor index.html specifiek

Aangezien index.html inline scripts heeft, voeg dit toe aan het begin van het `<head>`:

```html
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard - Visclub SiM</title>
<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="admin-style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!-- Load config FIRST -->
<script src="config.js"></script>
<script src="data-api.js"></script>
<script src="admin-auth.js"></script>
</head>
```

## Database Setup

### 1. Run Schema in Supabase

1. Ga naar Supabase Dashboard → SQL Editor
2. Open `database/schema.sql`
3. Run het hele bestand
4. Open `database/rls-policies.sql`
5. Run het hele bestand

### 2. Configureer Environment Variables

In je project root (of waar de backend draait), zorg dat `.env` heeft:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Port
PORT=3000
```

### 3. Test de Backend API

```bash
cd server
npm start
```

Ga naar http://localhost:3000/api/health - zou moeten responderen met status.

### 4. Test Admin Login

1. Open http://localhost:3000/admin/login.html
2. Login met:
   - Username: `admin`
   - Password: `admin123`

Als het werkt, zie je in de console:
```
🔧 Configuration loaded: { environment: 'development', ... }
📊 DataAPI initialized - using Backend API
🌐 API Base URL: http://localhost:3000/api
✅ Backend API is reachable
```

## Offline Modus

Als de backend NIET bereikbaar is:
- Je ziet een **oranje banner** bovenaan: "Backend niet bereikbaar - Offline modus actief"
- Alle wijzigingen worden opgeslagen in een **offline queue**
- Wanneer backend weer online komt, worden wijzigingen **automatisch gesynchroniseerd**

## Productie Deployment

De configuratie detecteert **automatisch** of je in productie of development bent:

- **Localhost** → gebruikt `http://localhost:3000/api`
- **Productie** → gebruikt `https://jouw-domein.com/api`

Geen handmatige configuratie nodig! 🎉

## Troubleshooting

### "Backend API unavailable"
- Check of `npm start` draait
- Check of `SUPABASE_URL` en `SUPABASE_SERVICE_KEY` correct zijn in `.env`
- Check firewall/CORS settings

### "JWT_SECRET must be set"
- Voeg toe aan `.env`: `JWT_SECRET=maak-dit-minstens-32-karakters-lang`
- Herstart de server

### Login werkt niet
- Check of database schema correct is aangemaakt
- Check of admin user bestaat in `admin_users` tabel
- Check console voor error messages

## Next Steps

1. ✅ Database schema aangemaakt
2. ✅ RLS policies toegevoegd
3. ✅ Config systeem opgezet
4. ✅ Data-API updated met offline support
5. ✅ Login.html updated
6. ⏳ Andere HTML files updaten
7. ⏳ Migratie script maken voor bestaande data
8. ⏳ Security fixes toevoegen (rate limiting, JWT validation)
