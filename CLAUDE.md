# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visclub SiM (Vissersclub Sint-Martens-Latem) is a fishing club website with integrated competition management, member administration, and permit applications. The project consists of:

1. **Public Website** - Static HTML pages for members and visitors
2. **Admin Panel** - Web-based management interface for club administrators
3. **Backend API** - Express.js REST API with SQLite database
4. **Bot System** - Automated notifications and social media integration

## Commands

### Development Server

```bash
# Start main API server (Express + SQLite)
npm start
# or
npm run dev

# Start legacy simple HTTP server (for static files only)
npm run legacy-server
```

### Database Management

```bash
# Initialize database with schema and sample data
npm run init-db

# The database file is located at:
# database/visclub.db
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

**Main API Server** (`server/api.js`):
- Express.js REST API
- JWT-based authentication
- Rate limiting on login endpoints (max 5 attempts per 15 minutes)
- CORS enabled (configurable via `CORS_ORIGIN` env var)

**API Endpoints Structure**:
- `/api/auth/*` - Authentication (login, token verification)
- `/api/members/*` - Member CRUD operations
- `/api/competitions/*` - Competition management
- `/api/results/*` - Competition results
- `/api/rankings/*` - Rankings (club/veteran)
- Requires JWT token in `Authorization: Bearer <token>` header for protected routes

**Database Initialization** (`server/init-db.js`):
- Creates tables from schema
- Hashes admin passwords with bcrypt
- Initializes sample data for testing

**Helper Scripts**:
- `server/add-upcoming-competitions.js` - Populate competitions from calendar data
- `server/clean-demo-data.js` - Remove test data

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

### Environment Variables

Copy `.env.example` to `.env` and configure:

**Backend API**:
```bash
PORT=3000
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

**Weather API**:
```bash
WEATHER_API_KEY=your_openweathermap_key
```

**Bank Details** (for registration forms):
```bash
BANK_IBAN=BE00000000000000
BANK_NAME=Visclub SiM
```

**Bot System** (see `bot/.env`):
- Facebook Graph API credentials
- YouTube Data API credentials
- SMTP email configuration
- See `bot/README.md` for detailed setup

### Deployment

**Netlify Configuration** (`netlify.toml`):
- Root redirect: `/` → `/home.html`
- Static site deployment (no build step)
- Security headers configured
- Cache control for static assets
- 404 fallback to home.html

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
2. Run database helper: `node server/add-upcoming-competitions.js`
3. Or manually insert via admin panel

### Database Schema Changes
1. Modify `database/schema.sql`
2. Backup existing database: `database/visclub.db`
3. Run `npm run init-db` to recreate (WARNING: deletes existing data)
4. Or use SQL ALTER statements to migrate

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
3. Start backend: `npm start`
4. Navigate to `http://localhost:3000/admin/`

### Bot Development
- Bot has its own `package.json` and dependencies
- Use `npm run dev` in bot directory for hot-reload
- Configure all API keys before testing social media features
- Email testing can be done with fake SMTP servers (e.g., Mailtrap)
- ❌ Server startup error: TypeError [ERR_INVALID_URL]: Invalid URL
    at new NodeError (node:internal/errors:405:5)
    at new URL (node:internal/url:676:13)
    at startServer (/app/server/api.js:22:23)
    at Object.<anonymous> (/app/server/api.js:508:1)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
    at Module.load (node:internal/modules/cjs/loader:1203:32)
    at Module._load (node:internal/modules/cjs/loader:1019:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:128:12)
    at node:internal/main/run_main_module:28:49 {
  input: 'undefined',
  code: 'ERR_INVALID_URL'
}