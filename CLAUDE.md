# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visclub SiM (Vissersclub Sint-Martens-Latem) is a fishing club website with integrated competition management, member administration, and permit applications. The project consists of:

1. **Public Website** - Static HTML pages for members and visitors
2. **Admin Panel** - Web-based management interface for club administrators
3. **Backend API** - PHP REST API with MySQL database
4. **Bot System** - Automated notifications and social media integration

## Architecture Overview

**⚠️ IMPORTANT: This project has migrated from Node.js/Express/SQLite to PHP/MySQL**

The application now runs on:
- **Backend**: PHP 7.4+ with MySQL database
- **Hosting**: Cloud86 shared hosting with Plesk
- **Database**: MySQL (managed via Plesk/phpMyAdmin)
- **Frontend**: Static HTML/CSS/JavaScript

### Local Development

For local development, you can use PHP's built-in server:

```bash
# Start PHP development server
php -S localhost:8000

# Or use any local PHP/MySQL environment (XAMPP, MAMP, etc.)
```

### Database Management

```bash
# The database schema is located at:
# database/mysql-schema.sql

# To initialize the database:
# 1. Log into Cloud86 Plesk → Databases → phpMyAdmin
# 2. Create a new database (e.g., visclub_sim)
# 3. Import the mysql-schema.sql file
# 4. Update api/config.php with database credentials
```

### Bot System

```bash
cd bot
npm install
npm start        # Start bot
npm run dev      # Development mode with auto-reload
```

## Architecture

### Data Flow and Storage

The project uses **multiple data storage layers** depending on the context:

1. **SQLite Database** (`database/visclub.db`)
   - Primary data store for members, competitions, results, and admin users
   - Used by backend API (`server/api.js`)
   - Schema defined in `database/schema.sql`
   - Includes views for rankings: `club_ranking`, `veteran_ranking`, `recent_results`

2. **LocalStorage (Browser)**
   - Used by admin panel when running standalone (without backend)
   - Managed by `admin/data-api.js` which provides abstraction layer
   - Mock data initialized if empty

3. **JSON Files** (`data/`)
   - Legacy/fallback data storage
   - Files: `members.json`, `registrations.json`, `payments.json`, `permits.json`
   - May be used for data import/export

### Frontend Architecture

**Public Pages** (root directory):
- `index.html` - Entry point (redirects to home.html)
- `home.html` - Main landing page
- `kalender.html` - Competition calendar
- `inschrijven.html` - Competition registration form
- `inschrijvingen.html` - Registration overview
- `klassement.html` - Rankings display (club and veteran)
- `leden.html` - Member information
- `visvergunning.html` - Permit application form
- `contact.html` - Contact form
- `weer.html` - Weather forecast
- `gallerij.html` - Photo gallery
- `route.html` - Location/directions

**Shared Assets**:
- `script.js` - Main frontend JavaScript (handles calendar data, form submissions, etc.)
- `style.css` - Main stylesheet
- `klassement-data.js` - Ranking data structure

**Calendar Data Structure** (`script.js`):
- Competition calendar is hardcoded in JavaScript as `calendarData` array
- Test mode available: Set `TEST_MODE = true` and configure `TEST_DATE` to simulate specific dates
- Used to show upcoming competitions, registration deadlines, etc.

### Admin Panel Architecture

Located in `admin/` directory:

**Entry Point**:
- `login.html` - Admin authentication (uses JWT from backend API)
- `index.html` - Main dashboard after login

**Admin Pages**:
- `plaatsentrekking.html` - Competition draw/spot assignment
- `klassement-beheer.html` - Rankings management
- `vergunningen.html` - Permit applications management
- `contact-berichten.html` - Contact messages
- `admin-chat.html` - AI assistant interface

**Admin JavaScript**:
- `admin-script.js` - Main admin dashboard logic
- `admin-auth.js` - Authentication handling (JWT tokens)
- `data-api.js` - Data persistence abstraction (LocalStorage or backend API)
- `admin-badges.js` - Notification badge system

**Navigation**:
- `admin-nav.html` - Shared navigation component loaded into all admin pages

### Backend API Architecture

**Main API Server** (`api/index.php`):
- PHP REST API with MySQL database
- JWT-based authentication using Firebase JWT library
- Rate limiting on login endpoints (max 5 attempts per 15 minutes)
- CORS configured in `api/config.php`
- PDO prepared statements for SQL injection protection
- Bcrypt password hashing for security

**API Configuration** (`api/config.php`):
- Database credentials (DB_HOST, DB_NAME, DB_USER, DB_PASS)
- JWT secret key and expiration settings
- CORS allowed origins
- Environment detection (development/production)
- Security checks to prevent deployment with default credentials

**API Endpoints Structure**:
- `/api/health` - Health check endpoint
- `/api/auth/login` - Authentication (returns JWT token)
- `/api/members/*` - Member CRUD operations
- `/api/competitions/*` - Competition management
- `/api/results/*` - Competition results
- `/api/rankings/*` - Rankings (club/veteran)
- Requires JWT token in `Authorization: Bearer <token>` header for protected routes

**Database Schema** (`database/mysql-schema.sql`):
- Complete schema with all tables and views
- Pre-configured admin users with bcrypt hashed passwords
- Ranking views (club_ranking, veteran_ranking, recent_results)
- Import this file into MySQL to initialize the database

### Bot System Architecture

Located in `bot/` directory:

**Bot Files**:
- `webbeheerder-bot.js` - Main automation bot for registrations, emails, social media
- `weer-vangst-bot.js` - Weather and catch reporting bot
- `bot-chat-interface.js` - Chat UI for bot interaction
- `bot-chat-interface.css` - Chat UI styling

**Bot Features**:
- Email notifications for registrations and reminders
- Facebook and YouTube social media posting
- Automated data synchronization
- Registration management
- Requires `.env` configuration in bot directory (see `bot/README.md`)

### Scoring System

**Important**: Lower score wins!

- 1st place = 1 point
- 2nd place = 2 points
- 3rd place = 3 points, etc.
- Caught nothing = 43 points
- Absent = 50 points

**Ranking Types**:
1. **Club Ranking** (`counts_for_club_ranking = 1`)
   - Best 15 out of 20 competitions count
   - View: `club_ranking`

2. **Veteran Ranking** (`counts_for_veteran_ranking = 1`)
   - All competitions count
   - Only for members with `is_veteran = 1`
   - View: `veteran_ranking`

## Configuration

### PHP API Configuration

**Backend API** (`api/config.php`):
Update these critical settings before deployment:

```php
// Database credentials (get from Cloud86 Plesk)
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');  // ⚠️  CHANGE THIS
define('DB_USER', 'your_database_user');  // ⚠️  CHANGE THIS
define('DB_PASS', 'your_database_password'); // ⚠️  CHANGE THIS

// JWT Secret (use a 64+ character random string)
define('JWT_SECRET', 'your_secret_key_here'); // ⚠️  CHANGE THIS

// CORS allowed origins
$allowed_origins = [
    'https://visclubsim.be',
    'https://www.visclubsim.be',
];
```

**Contact Form** (`contact-handler.php`):
```php
define('ADMIN_EMAIL', 'info@visclub-sim.be');
define('FROM_EMAIL', 'noreply@visclub-sim.be');
define('RECAPTCHA_ENABLED', false); // Set to true and add keys for production
```

**Frontend Configuration** (`config.js` and `admin/config.js`):
```javascript
const API_BASE_URL = 'https://visclubsim.be/api';
```

**Bot System** (see `bot/.env`):
- Facebook Graph API credentials
- YouTube Data API credentials
- SMTP email configuration
- See `bot/README.md` for detailed setup

### Deployment

**Cloud86 Hosting** (PHP/MySQL Shared Hosting):
1. Upload files via FTP/SFTP or Plesk File Manager
2. Place files in `public_html/` directory
3. Create MySQL database via Plesk
4. Import `database/mysql-schema.sql` via phpMyAdmin
5. Update `api/config.php` with actual database credentials
6. Ensure `.htaccess` files are uploaded for security headers and redirects
7. Test the application at your domain

**Security Checklist Before Deployment**:
- ✅ Update database credentials in `api/config.php`
- ✅ Generate and set a strong JWT_SECRET (64+ characters)
- ✅ Verify admin user passwords in database (see `database/ADMIN-CREDENTIALS.md`)
- ✅ Update CORS allowed origins with your actual domain
- ✅ Update contact form email addresses
- ✅ Enable HTTPS via Plesk (Let's Encrypt)
- ✅ Test all API endpoints after deployment

## Code Organization Patterns

### Frontend Pages
- Navigation is consistent across pages (inline HTML)
- Forms use JavaScript for client-side validation before submission
- Data fetched from backend API or LocalStorage via DataAPI abstraction
- Admin pages load `admin-nav.html` for shared navigation

### Admin Panel Data Access
- Always use `window.dataAPI` to access/modify data
- DataAPI automatically handles LocalStorage or backend API calls
- Cache is maintained in DataAPI for performance
- Always check if `dataAPI` is loaded before using it

### Authentication Flow
1. Login via `admin/login.html` → POST `/api/auth/login`
2. JWT token stored in `localStorage`
3. Token included in all API requests via `Authorization` header
4. `admin-auth.js` handles token validation and auto-redirect if expired

### Database Queries
- Use prepared statements in backend API (via better-sqlite3)
- Views (`club_ranking`, `veteran_ranking`) handle complex ranking logic
- SQLite transactions for multi-step operations

## Development Tips

### Testing with Different Dates
In `script.js`, enable test mode to simulate specific dates:
```javascript
const TEST_MODE = true;
const TEST_DATE = new Date('2026-02-20'); // Simulate this date as "today"
```

### Adding New Competitions
1. Update `calendarData` array in `script.js`
2. Manually insert via admin panel
3. Or add directly via phpMyAdmin SQL interface

### Database Schema Changes
1. Modify `database/mysql-schema.sql`
2. Backup existing database via Plesk/phpMyAdmin
3. For new installations: Import the updated schema
4. For existing databases: Use SQL ALTER statements via phpMyAdmin to migrate

### Admin Panel Development

**Local Mode (Default)**:
- Admin panel configured to run WITHOUT backend API by default
- Uses LocalStorage for all data persistence
- Login credentials (in `admin/login.html`):
  - Username: `admin`, Password: `admin123`
  - Username: `visclub`, Password: `visclub2026`
- To use: Simply open `admin/login.html` in browser

**Backend API Mode**:
To switch to backend API mode:
1. In `admin/login.html`: Set `USE_LOCAL_MODE = false`
2. In `admin/admin-auth.js`: Set `this.USE_LOCAL_MODE = false`
3. Configure database credentials in `api/config.php`
4. Start PHP server: `php -S localhost:8000`
5. Navigate to `http://localhost:8000/admin/`

### Bot Development
- Bot has its own `package.json` and dependencies
- Use `npm run dev` in bot directory for hot-reload
- Configure all API keys before testing social media features
- Email testing can be done with fake SMTP servers (e.g., Mailtrap)