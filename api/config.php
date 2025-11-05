<?php
/**
 * Visclub SiM - PHP API Configuration
 * Database and JWT configuration
 */

// Error reporting (disable in production!)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database Configuration
define('DB_HOST', 'localhost');  // Cloud86 MySQL host
define('DB_NAME', 'your_database_name');  // Set in Cloud86 Plesk
define('DB_USER', 'your_database_user');  // Set in Cloud86 Plesk
define('DB_PASS', 'your_database_password');  // Set in Cloud86 Plesk
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration
define('JWT_SECRET', 'CHANGE_THIS_TO_STRONG_SECRET_KEY_64_CHARACTERS_MINIMUM_LENGTH_XXXX');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours in seconds

// CORS Configuration
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'https://your-cloud86-domain.com',  // Update with your Cloud86 domain
];

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
