<?php
/**
 * Visclub SiM - PHP API Configuration
 * Database and JWT configuration
 */

// Error reporting
// ⚠️  SECURITY: Set display_errors to 0 in production!
// Development: Show all errors
// Production: Log errors, don't display
$isProduction = !in_array($_SERVER['SERVER_NAME'] ?? 'localhost', ['localhost', '127.0.0.1']);

if ($isProduction) {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);  // Don't show errors to users
    ini_set('log_errors', 1);      // Log errors to file
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);  // Show errors in development
}

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================
// ⚠️  TODO: Update these values in Cloud86 Plesk!
// Get these from: Plesk → Databases → Your Database
//
// IMPORTANT: Voor Cloud86/Plesk gebruik je meestal:
// - DB_HOST: 'localhost' (ZONDER poort!)
// - Als localhost niet werkt, probeer: '127.0.0.1'
// - De poort (3306) wordt automatisch gebruikt, niet in hostname zetten!
define('DB_HOST', 'localhost');  // Cloud86 MySQL host (gebruik localhost, NIET localhost:3306)
define('DB_NAME', 'visclubsim');  // Fixed: lowercase for Linux case-sensitivity!
define('DB_USER', 'VisclubDhont');
define('DB_PASS', 'Kutwijf666');
define('DB_CHARSET', 'utf8mb4');

// Security check: Prevent deployment with default credentials
if (DB_NAME === 'your_database_name' || DB_USER === 'your_database_user') {
    die('ERROR: Please configure database credentials in api/config.php before deploying!');
}

// =============================================================================
// JWT CONFIGURATION
// =============================================================================
// ⚠️  CRITICAL: This JWT secret is cryptographically secure
// Generated with secrets.token_hex(32) - Do NOT share or commit to Git!
// Keep this secret safe - it signs all authentication tokens
define('JWT_SECRET', '74e9f9f50f73f82244aa025a6b98152cbcb21d57a6a21f6050464a0ebe9fed0e');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours in seconds

// Security check: Prevent deployment with default JWT secret
if (JWT_SECRET === 'CHANGE_THIS_TO_STRONG_SECRET_KEY_64_CHARACTERS_MINIMUM_LENGTH_XXXX' || strlen(JWT_SECRET) < 64) {
    die('ERROR: Please set a strong JWT_SECRET (64+ characters) in api/config.php before deploying!');
}

// =============================================================================
// CORS CONFIGURATION
// =============================================================================
// ⚠️  TODO: Update with your actual domain!
// Only these origins can access your API
$allowed_origins = [
    'http://localhost:3000',           // Local development
    'http://localhost:8000',           // Local development (alt port)
    'http://127.0.0.1:3000',          // Local development (IP)
    'https://visclubsim.be',          // Production domain
    'https://www.visclubsim.be',      // Production domain (with www)
];

// CORS configured for: visclubsim.be

// Timezone
date_default_timezone_set('Europe/Brussels');

// API Version
define('API_VERSION', '1.0.0');

// Rate Limiting (optional - simple implementation)
define('RATE_LIMIT_ENABLED', false);
define('RATE_LIMIT_MAX_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 900); // 15 minutes

return [
    'db' => [
        'host' => DB_HOST,
        'name' => DB_NAME,
        'user' => DB_USER,
        'pass' => DB_PASS,
        'charset' => DB_CHARSET
    ],
    'jwt' => [
        'secret' => JWT_SECRET,
        'algorithm' => JWT_ALGORITHM,
        'expiration' => JWT_EXPIRATION
    ],
    'cors' => [
        'allowed_origins' => $allowed_origins
    ]
];
