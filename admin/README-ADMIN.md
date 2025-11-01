# Visclub SiM - Admin Panel Handleiding

## 🚀 Snel Starten

### 1. Inloggen

Open `admin/login.html` in je browser en log in met:

- **Gebruiker**: `admin` | **Wachtwoord**: `admin123`
- **Gebruiker**: `visclub` | **Wachtwoord**: `visclub2026`

### 2. Overzicht Dashboard

Na het inloggen zie je het hoofddashboard met:
- **Statistieken**: Totaal aantal inschrijvingen, betalingen, etc.
- **Snelle acties**: Knoppen voor veel gebruikte functies
- **Navigatie**: Linkermenu om tussen secties te schakelen

## 📋 Functies

### ✅ Volledig Werkend

#### **Inschrijvingen Beheer**
- ➕ Nieuwe inschrijving toevoegen
- ✏️ Inschrijving bewerken (naam, email, betaalstatus)
- 🗑️ Inschrijving verwijderen
- 📊 Overzicht van alle inschrijvingen
- 📥 Exporteren naar CSV

**Hoe te gebruiken:**
1. Klik op "Inschrijvingen" in het menu
2. Gebruik "Nieuwe Inschrijving" knop om een inschrijving toe te voegen
3. Klik op ✏️ icoon om te bewerken
4. Klik op 🗑️ icoon om te verwijderen

#### **Leden Beheer**
- ➕ Nieuw lid toevoegen
- ✏️ Lid bewerken (naam, email, telefoon)
- 🗑️ Lid verwijderen
- 📊 Overzicht van alle leden
- 📥 Exporteren naar CSV

**Hoe te gebruiken:**
1. Navigeer naar de leden sectie (wordt geladen in hetzelfde dashboard)
2. Gebruik "Nieuw Lid" knop
3. Bewerk/verwijder via iconen in de tabel

#### **Betalingen Beheer**
- 📊 Overzicht van alle betalingen
- ✅ Markeer betaling als "Betaald"
- 📥 Exporteren naar CSV

**Hoe te gebruiken:**
1. Betalingen worden automatisch aangemaakt bij inschrijvingen
2. Klik op "Markeer Betaald" knop om status te wijzigen

#### **Vergunningen Beheer**
- 📊 Overzicht van vergunningsaanvragen
- ✅ Goedkeuren van vergunningen
- 👁️ Bekijk details
- 🗑️ Verwijderen

**Toegang:**
- Via `admin/vergunningen.html`

#### **Contact Berichten**
- 📧 Ontvangen berichten bekijken
- ✅ Markeren als gelezen
- 🗑️ Verwijderen

**Toegang:**
- Via `admin/contact-berichten.html`

#### **Plaatsentrekking**
- 🎲 Automatische trekking van visplaatsen
- 📊 Resultaten bekijken
- 📥 Exporteren

**Toegang:**
- Via `admin/plaatsentrekking.html`

#### **Data Beheer**
- 🧹 Alle data wissen
- 📊 Overzicht van aantallen
- ⚠️ Waarschuwing bij verwijderen

**Toegang:**
- Via "Data Wissen" link onderaan het menu
- Of rechtstreeks: `admin/clear-data.html`

## 🗄️ Data Opslag

Alle data wordt opgeslagen in **Browser LocalStorage**:

| Data Type | LocalStorage Key | Beschrijving |
|-----------|------------------|--------------|
| Inschrijvingen | `mock_registrations` | Wedstrijdinschrijvingen |
| Leden | `mock_members` | Clubleden |
| Betalingen | `mock_payments` | Betalingsgegevens |
| Vergunningen | `mock_permits` | Visvergunning aanvragen |
| Wedstrijden | `mock_competitions` | Wedstrijdkalender |
| Berichten | `mock_contact_messages` | Contactformulier berichten |

### Data Wissen

⚠️ **LET OP**: Alle data zit in de browser. Als je de browser cache wist of een andere browser gebruikt, is de data weg!

Om alle data te wissen:
1. Ga naar `admin/clear-data.html`
2. Bekijk het overzicht van huidige data
3. Klik op "Wis ALLE Data"
4. Bevestig twee keer (veiligheid)

## 📤 Data Exporteren

### Exporteer naar CSV

Elke tabel heeft een "Exporteer CSV" knop:
- **Inschrijvingen**: Exporteert alle inschrijvingen
- **Leden**: Exporteert alle leden
- **Betalingen**: Exporteert alle betalingen

### Exporteer Alles (JSON)

Voor een volledige backup:
1. Gebruik de "Exporteer Data" functie
2. Krijg een JSON bestand met ALLE data
3. Bewaar dit bestand als backup

## 🔧 Technische Details

### Bestandsstructuur

```
admin/
├── login.html              # Login pagina
├── index.html              # Hoofddashboard
├── contact-berichten.html  # Contact berichten
├── vergunningen.html       # Vergunning beheer
├── plaatsentrekking.html   # Plaatsentrekking
├── klassement-beheer.html  # Klassement beheer
├── admin-chat.html         # AI chat assistent
├── clear-data.html         # Data wissen tool
├── admin-script.js         # Hoofdlogica
├── admin-auth.js           # Authenticatie
├── data-api.js             # Data opslag API
├── admin-badges.js         # Notificatie badges
└── admin-style.css         # Styling
```

### Lokale Modus vs Backend API

Het admin panel draait momenteel in **lokale modus**:
- ✅ Geen backend server nodig
- ✅ Werkt direct in browser
- ✅ Data in LocalStorage
- ❌ Data niet gedeeld tussen browsers/computers
- ❌ Geen automatische backup

Om te schakelen naar **backend API modus**:
1. In `admin/login.html`: Zet `USE_LOCAL_MODE = false`
2. In `admin/admin-auth.js`: Zet `this.USE_LOCAL_MODE = false`
3. Start backend: `npm start` (in hoofdmap)
4. Backend draait op `http://localhost:3000`

## 🐛 Problemen Oplossen

### "DataAPI not loaded"
- Ververs de pagina (F5)
- Check browser console (F12) voor errors
- Zorg dat JavaScript niet geblokkeerd is

### Data is verdwenen
- Check of je dezelfde browser gebruikt
- Data zit in LocalStorage van de browser
- Gebruik andere browser = nieuwe lege data
- Maak regelmatig backups via Export functie

### Functie werkt niet
1. Open browser console (F12)
2. Bekijk rode error messages
3. Ververs de pagina
4. Als het blijft: clear browser cache

### Login werkt niet
- Check of credentials correct zijn:
  - `admin` / `admin123`
  - `visclub` / `visclub2026`
- Hoofdlettergevoelig!
- Geen spaties voor/na username

## 💡 Tips

1. **Regelmatige Backups**: Exporteer data wekelijks naar JSON
2. **Test Data**: Gebruik "Data Wissen" om opnieuw te beginnen met schone lei
3. **Browser Console**: Open met F12 om logs te zien (handig bij troubleshooting)
4. **Dezelfde Browser**: Gebruik altijd dezelfde browser voor consistente data
5. **Screenshots**: Maak screenshots van belangrijke data als extra backup

## 📞 Support

Voor problemen of vragen:
- Check browser console (F12) voor error messages
- Lees deze handleiding zorgvuldig door
- Test eerst met "Data Wissen" en verse data

## 🔐 Beveiliging

**Let op**: Dit is een lokaal development systeem. Voor productie:
- Gebruik backend API modus
- Sterke wachtwoorden
- HTTPS verbinding
- Server-side validatie
- Regelmatige database backups

## 📅 Volgende Stappen

Voor productie-gebruik:
1. Schakel over naar backend API
2. Deploy backend server
3. Configureer echte database (SQLite/PostgreSQL)
4. Implementeer email notificaties
5. Backup systeem opzetten
