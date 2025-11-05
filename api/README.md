# 🔌 Visclub SiM - PHP REST API

**Complete PHP/MySQL backend voor Cloud86 shared hosting**

---

## 📋 Overzicht

Deze API vervangt de Node.js/Supabase backend met een PHP/MySQL oplossing die werkt op Cloud86 shared hosting (€1.95/maand).

### Wat doet deze API?

- ✅ JWT authenticatie voor admin panel
- ✅ Member management (CRUD operations)
- ✅ Competition management
- ✅ Results tracking
- ✅ Rankings (club & veteran)
- ✅ Registration management
- ✅ Statistics endpoints

---

## 📂 File Structure

```
api/
├── config.php          # Database + JWT configuratie
├── database.php        # PDO database connection class
├── auth.php            # JWT authenticatie helper
├── index.php           # Main API router + endpoints
└── README.md           # Deze file
```

---

## 🚀 Setup

### 1. Database Configuratie

Open `config.php` en update:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');      // ← Cloud86 database naam
define('DB_USER', 'your_database_user');      // ← Cloud86 database user
define('DB_PASS', 'your_database_password');  // ← Cloud86 database password
```

### 2. JWT Secret

**BELANGRIJK:** Verander dit naar een sterke random key!

```php
define('JWT_SECRET', 'YOUR_STRONG_64_CHARACTER_SECRET_KEY_HERE');
```

Genereer met:
```php
echo bin2hex(random_bytes(32));
```

### 3. CORS Origins

Update `$allowed_origins` met je domein:

```php
$allowed_origins = [
    'https://www.visclub-sim.be',  // ← Jouw domein
];
```

### 4. Upload naar Cloud86

Upload alle files naar `/httpdocs/api/` via FTP.

---

## 🔌 API Endpoints

### Public Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-05T10:30:00Z",
  "version": "1.0.0"
}
```

---

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@visclub-sim.be",
    "fullName": "Administrator",
    "role": "admin"
  }
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

### Members Endpoints (Protected)

**All endpoints require:** `Authorization: Bearer {token}`

#### Get All Members
```http
GET /api/members
GET /api/members?active=true
GET /api/members?veteran=true
```

#### Get Member by ID
```http
GET /api/members/1
```

#### Create Member
```http
POST /api/members
Content-Type: application/json

{
  "name": "Jan Janssen",
  "member_number": "M001",
  "email": "jan@example.com",
  "phone": "0499123456",
  "is_veteran": false,
  "is_active": true
}
```

#### Update Member
```http
PUT /api/members/1
Content-Type: application/json

{
  "name": "Jan Janssen Updated",
  "email": "jan.new@example.com"
}
```

#### Delete Member
```http
DELETE /api/members/1
```

---

### Competitions Endpoints (Protected)

#### Get All Competitions
```http
GET /api/competitions
GET /api/competitions?status=upcoming
```

#### Create Competition
```http
POST /api/competitions
Content-Type: application/json

{
  "name": "Wintercompetitie 2025",
  "date": "2025-12-15",
  "location": "Vijver De Gavers",
  "status": "upcoming",
  "max_participants": 50,
  "registration_deadline": "2025-12-10"
}
```

---

### Results Endpoints (Protected)

#### Get Results for Competition
```http
GET /api/competitions/1/results
```

#### Submit Result
```http
POST /api/results
Content-Type: application/json

{
  "competition_id": 1,
  "member_id": 5,
  "points": 3,
  "weight": 2.450,
  "fish_count": 12,
  "is_absent": false
}
```

---

### Rankings Endpoints (Protected)

#### Get Club Ranking
```http
GET /api/rankings/club
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "member_id": 1,
      "member_name": "Jan Janssen",
      "member_number": "M001",
      "total_points": 45,
      "competitions_counted": 15,
      "avg_points": 3.0,
      "best_score": 1,
      "worst_score": 7,
      "ranking_position": 1
    }
  ]
}
```

#### Get Veteran Ranking
```http
GET /api/rankings/veteran
```

---

### Registrations Endpoints (Protected)

#### Get Registrations
```http
GET /api/registrations
GET /api/registrations?competition_id=1
```

#### Create Registration
```http
POST /api/registrations
Content-Type: application/json

{
  "competition_id": 1,
  "member_id": 5,
  "status": "registered",
  "payment_status": "pending"
}
```

---

### Statistics Endpoints (Protected)

#### Member Statistics
```http
GET /api/statistics/members
```

#### Upcoming Competitions
```http
GET /api/statistics/upcoming
```

#### Recent Results
```http
GET /api/statistics/recent
```

---

## 🔒 Authentication

Alle protected endpoints vereisen een JWT token in de Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is 24 uur geldig (configureerbaar in `config.php`).

---

## 🛠️ Testing

### Via Browser

```
https://your-cloud86-domain.com/api/health
```

### Via cURL

```bash
# Health check
curl https://your-cloud86-domain.com/api/health

# Login
curl -X POST https://your-cloud86-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get members (with token)
curl https://your-cloud86-domain.com/api/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Via Postman

1. Import deze collection URL
2. Set environment variable `API_URL` = `https://your-cloud86-domain.com/api`
3. Login om token te krijgen
4. Gebruik token in andere requests

---

## 🐛 Troubleshooting

### "Database connection failed"

Check `config.php`:
- Is `DB_NAME`, `DB_USER`, `DB_PASS` correct?
- Test via phpMyAdmin in Plesk

### "500 Internal Server Error"

Check PHP error log in Plesk:
- Plesk → Logs → Error Log
- Zoek naar PHP errors

### "CORS policy blocked"

Update `$allowed_origins` in `config.php` met je frontend domein.

### "Unauthorized - Invalid token"

- Token verlopen? Log opnieuw in
- JWT_SECRET gewijzigd? Oude tokens zijn ongeldig
- Token correct in header? `Authorization: Bearer {token}`

---

## 📊 Performance Tips

1. **Enable OPcache** in Plesk PHP Settings
2. **Use indexes** - Database schema heeft al indexes
3. **Cache results** - Frontend heeft 5 minuten cache
4. **Optimize queries** - Views zijn al geoptimaliseerd

---

## 🔐 Security Checklist

- [ ] Sterke `JWT_SECRET` (64+ karakters)
- [ ] Sterke database wachtwoorden
- [ ] CORS beperkt tot eigen domein
- [ ] `error_reporting` uit in productie
- [ ] HTTPS enabled (SSL certificaat)
- [ ] Admin wachtwoorden gewijzigd

---

## 📝 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 📞 Support

**Cloud86 hosting vragen:**
- https://support.cloud86.io

**PHP API vragen:**
- Check CLOUD86-DEPLOYMENT.md voor deployment guide
- Check database/README.md voor database schema

---

**Versie:** 1.0.0
**Laatst gewijzigd:** 2025-01-05
