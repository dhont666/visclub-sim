# 🤖 Visclub SiM - Webbeheerder Bot

Automatische bot voor het beheren van de Visclub SiM website, social media en inschrijvingen.

## Functionaliteiten

### ✅ Geïmplementeerd

- **Inschrijvingen Beheer**
  - Automatisch toevoegen van nieuwe inschrijvingen
  - Bijwerken van website data
  - Genereren van overzichtsrapporten

- **Website Updates**
  - Auto-sync van inschrijvingsdata naar website
  - Realtime updates van deelnemerslijsten

- **Email Notificaties**
  - Bevestigingsmails bij inschrijving
  - Reminder emails (7 dagen voor wedstrijd)

- **Social Media Integration**
  - Facebook posts (configuratie vereist)
  - YouTube community posts (configuratie vereist)

### 🔄 Te Configureren

- Facebook Graph API access token
- YouTube Data API credentials
- SMTP email configuratie
- Automatische planning (cron jobs)

## Installatie

```bash
cd bot
npm install
```

## Configuratie

### 1. Environment Variables

Maak een `.env` bestand aan in de `bot/` folder:

```env
# Facebook
FB_PAGE_ID=visclubsim
FB_ACCESS_TOKEN=your_facebook_access_token_here

# YouTube
YOUTUBE_CHANNEL_ID=@visclubsim
YOUTUBE_API_KEY=your_youtube_api_key_here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=SimVisclub@gmail.com
SMTP_PASS=your_gmail_app_password_here
EMAIL_FROM=SimVisclub@gmail.com

# Algemeen
NOTIFICATION_DAYS_BEFORE=7
```

### 2. Facebook Access Token

1. Ga naar [Facebook Developers](https://developers.facebook.com/)
2. Maak een app aan voor je pagina
3. Vraag een Page Access Token aan
4. Voeg token toe aan `.env`

### 3. YouTube API

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een project aan
3. Activeer YouTube Data API v3
4. Genereer API credentials
5. Voeg toe aan `.env`

## Gebruik

### Start de bot

```bash
npm start
```

### Development mode (met auto-reload)

```bash
npm run dev
```

### Handmatige taken

```javascript
const WebbeheerderBot = require('./webbeheerder-bot');
const bot = new WebbeheerderBot();

// Voeg inschrijving toe
await bot.addRegistration('2026-03-07', {
    firstName: 'Jan',
    lastName: 'Janssens',
    email: 'jan@example.com',
    phone: '+32 123 45 67 89',
    type: 'solo',
    partner: null
});

// Genereer rapport
await bot.generateReport();

// Stuur reminders
await bot.sendUpcomingReminders();
```

## Automatische Taken

De bot voert automatisch de volgende taken uit:

| Taak | Frequentie | Beschrijving |
|------|-----------|--------------|
| Data sync | Elk uur | Synchroniseert inschrijvingen met website |
| Reminders | Dagelijks 09:00 | Stuurt emails 7 dagen voor wedstrijd |
| Social media | Bij mijlpaal | Post elke 5 inschrijvingen |
| Backup | Dagelijks 23:00 | Backup van alle data |

## API Endpoints (toekomstig)

De bot kan uitgebreid worden met een REST API:

```javascript
POST /api/registrations     // Nieuwe inschrijving
GET  /api/registrations     // Alle inschrijvingen
GET  /api/competitions      // Alle wedstrijden
POST /api/draw              // Start plaatsentrekking
GET  /api/stats             // Statistieken
```

## Data Structuur

### Inschrijving

```json
{
  "id": 1234567890,
  "competitionDate": "2026-03-07",
  "participant": {
    "firstName": "Jan",
    "lastName": "Janssens",
    "email": "jan@example.com",
    "phone": "+32 123 45 67 89",
    "type": "solo|koppel",
    "partner": "Piet Peters" // optioneel
  },
  "registeredAt": "2026-02-20T14:30:00.000Z",
  "status": "active|cancelled"
}
```

## Logging

Alle acties worden gelogd naar de console:

- ✅ Succesvol
- ⚠️  Waarschuwing
- ❌ Fout
- 📧 Email verzonden
- 📱 Social media post
- 📊 Data update

## Troubleshooting

### Bot start niet

- Check of Node.js geïnstalleerd is: `node --version`
- Installeer dependencies: `npm install`

### Emails worden niet verstuurd

- Controleer SMTP configuratie in `.env`
- Test email server connectie
- Check firewall instellingen

### Social media posts falen

- Verificeer API tokens
- Check API rate limits
- Controleer permissions

## Toekomstige Features

- [ ] WhatsApp notificaties
- [ ] SMS reminders
- [ ] Instagram integration
- [ ] Automatische foto uploads
- [ ] Weersverwachtingen in reminders
- [ ] Automatische uitslagen publicatie
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Admin dashboard
- [ ] Mobile app API

## Support

Voor vragen of problemen:
- Email: SimVisclub@gmail.com
- Facebook: [Visclub SiM](https://www.facebook.com/visclubsim)

## Licentie

MIT License - Vrij te gebruiken en aan te passen voor Visclub SiM
