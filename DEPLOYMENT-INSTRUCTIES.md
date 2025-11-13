# Deployment Instructies - Visclub SiM Website

## Wat is er gewijzigd?

### 1. Database Schema Updates
Het database schema is uitgebreid met twee nieuwe tabellen:

- **`contact_messages`** - Voor contactformulier berichten
- **`public_registrations`** - Voor wedstrijd inschrijvingen van de public website

**Bestand**: `database/mysql-schema.sql`

### 2. PHP API Endpoints
Nieuwe public endpoints toegevoegd (geen authenticatie vereist):

- **POST `/api/public/contact`** - Contact formulier submissions
- **POST `/api/public/register`** - Wedstrijd inschrijvingen

Nieuwe admin endpoints (authenticatie vereist):

- **GET `/api/contact-messages`** - Haal alle contactberichten op
- **PUT `/api/contact-messages/:id`** - Update bericht status
- **GET `/api/public-registrations`** - Haal alle inschrijvingen op
- **PUT `/api/public-registrations/:id`** - Update inschrijving status

**Bestand**: `api/index.php`

### 3. Frontend Integratie
- `contact.html` - Formulier slaat nu op in database via API
- `script.js` - Inschrijf formulier slaat nu op in database via API
- `admin/contact-berichten.html` - Toont nu berichten uit database

## Deployment Stappen naar Cloud86

### Stap 1: Upload Bestanden naar Cloud86

Upload de volgende bestanden via FTP/SFTP of Plesk File Manager:

```
api/index.php                       (geüpdate)
database/mysql-schema.sql           (geüpdate)
contact.html                        (geüpdate)
script.js                          (geüpdate)
admin/contact-berichten.html       (geüpdate)
```

### Stap 2: Database Schema Updaten

1. Log in op Cloud86 Plesk
2. Ga naar **Databases** → **phpMyAdmin**
3. Selecteer je visclub database
4. Voer de volgende SQL queries uit om de nieuwe tabellen toe te voegen:

```sql
-- Tabel voor contactberichten
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    replied_at TIMESTAMP NULL,
    reply_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel voor public inschrijvingen
CREATE TABLE public_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    partner_first_name VARCHAR(100),
    partner_last_name VARCHAR(100),
    competition_date VARCHAR(20) NOT NULL,
    competition_name VARCHAR(255) NOT NULL,
    registration_type VARCHAR(20) DEFAULT 'solo',
    payment_method VARCHAR(20) DEFAULT 'qr',
    payment_reference VARCHAR(50),
    amount VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_competition_date (competition_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**OPTIONEEL**: Als je de hele database opnieuw wilt opzetten, kun je het volledige `database/mysql-schema.sql` bestand importeren. **LET OP**: Dit verwijdert alle bestaande data!

### Stap 3: Configuratie Controleren

Zorg ervoor dat `api/config.php` correct is geconfigureerd:

```php
// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'jouw_database_naam');
define('DB_USER', 'jouw_database_gebruiker');
define('DB_PASS', 'jouw_database_wachtwoord');

// JWT Secret
define('JWT_SECRET', 'jouw_geheime_sleutel_64+_karakters');
```

En dat `config.js` en `admin/config.js` de juiste API URL hebben:

```javascript
const API_BASE_URL = 'https://visclubsim.be/api';
```

### Stap 4: Test de Functionaliteit

1. **Test Contact Formulier**:
   - Ga naar `https://visclubsim.be/contact.html`
   - Vul het formulier in en verstuur
   - Controleer in phpMyAdmin of het bericht in de `contact_messages` tabel staat

2. **Test Inschrijf Formulier**:
   - Ga naar `https://visclubsim.be/inschrijven.html`
   - Doe een test inschrijving
   - Controleer in phpMyAdmin of de inschrijving in de `public_registrations` tabel staat

3. **Test Admin Panel**:
   - Log in op `https://visclubsim.be/admin/`
   - Ga naar "Contact Berichten"
   - Controleer of de berichten worden geladen
   - Test de status updates (markeer als gelezen, etc.)

## Troubleshooting

### "Endpoint not found" Error
- Controleer of de `.htaccess` file correct is in de root directory
- Zorg dat mod_rewrite enabled is in Apache (meestal standaard op Cloud86)

### "Database connection failed"
- Controleer database credentials in `api/config.php`
- Zorg dat de database gebruiker de juiste rechten heeft

### CORS Errors
- Controleer `api/config.php` → `cors.allowed_origins` array
- Voeg je domain toe: `'https://visclubsim.be'`

### API Returns 500 Error
- Check PHP error logs in Plesk → "Logs" → "Error Log"
- Controleer of alle required PHP extensies aanwezig zijn (PDO, mbstring, etc.)

## Nieuwe Admin Panel Pagina's Nodig?

Er zijn nu twee nieuwe secties waar je mogelijk pagina's voor wilt maken:

1. **Inschrijvingen Overzicht** - Pagina om alle public inschrijvingen te bekijken
2. **Contact Berichten** - Al gemaakt! (`admin/contact-berichten.html`)

De contact berichten pagina is al compleet. Voor inschrijvingen kun je een vergelijkbare pagina maken die de `public_registrations` tabel toont.

## Volgende Stappen

Na deployment kun je de volgende verbeteringen overwegen:

1. ✅ "Terug naar Dashboard" knoppen toevoegen aan alle admin pagina's
2. ✅ Overall wedstrijden dropdown implementeren
3. Email notificaties instellen bij nieuwe contactberichten/inschrijvingen
4. Automatische bevestigingsmails voor inschrijvingen
5. Payment status tracking en verificatie
6. Export functionaliteit voor inschrijvingen (CSV/Excel)

## Ondersteuning

Bij problemen:
- Check de browser console voor JavaScript errors
- Check de PHP error logs in Plesk
- Controleer de netwerk tab in de browser developer tools voor API calls
