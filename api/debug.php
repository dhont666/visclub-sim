<?php
/**
 * API Debug Script
 * Test database connection and configuration
 *
 * Access via: https://visclubsim.be/api/debug.php
 * DELETE THIS FILE AFTER TESTING! (contains sensitive info)
 */

// Enable error display
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'tests' => []
];

// Test 1: Config file exists
$results['tests']['config_exists'] = file_exists(__DIR__ . '/config.php');

if ($results['tests']['config_exists']) {
    try {
        require_once __DIR__ . '/config.php';
        $results['tests']['config_loaded'] = true;

        // Show config values (REMOVE AFTER DEBUG!)
        $results['config'] = [
            'DB_HOST' => DB_HOST,
            'DB_NAME' => DB_NAME,
            'DB_USER' => DB_USER,
            'DB_PASS_LENGTH' => strlen(DB_PASS), // Don't show actual password
            'DB_CHARSET' => DB_CHARSET
        ];

    } catch (Exception $e) {
        $results['tests']['config_loaded'] = false;
        $results['config_error'] = $e->getMessage();
    }
}

// Test 2: PDO available
$results['tests']['pdo_available'] = class_exists('PDO');

// Test 3: MySQL driver available
$results['tests']['mysql_driver'] = in_array('mysql', PDO::getAvailableDrivers());

// Test 4: Try database connection
if ($results['tests']['config_loaded']) {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;

        // First try without database name to see if we can connect to MySQL at all
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        $results['tests']['mysql_connection'] = true;

        // Get list of databases
        $stmt = $pdo->query('SHOW DATABASES');
        $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $results['available_databases'] = $databases;

        // Check if our database exists (case-sensitive check)
        $results['tests']['database_exists'] = in_array(DB_NAME, $databases);

        if (!$results['tests']['database_exists']) {
            // Try to find similar database names
            $similar = array_filter($databases, function($db) {
                return stripos($db, 'vis') !== false || stripos($db, 'club') !== false;
            });
            $results['similar_databases'] = array_values($similar);
        }

        // Try to connect to the specific database
        if ($results['tests']['database_exists']) {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            $results['tests']['database_connection'] = true;

            // Get list of tables
            $stmt = $pdo->query('SHOW TABLES');
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $results['database_tables'] = $tables;

            // Check for required tables
            $requiredTables = ['admin_users', 'members', 'competitions', 'permits', 'contact_messages', 'public_registrations'];
            $results['required_tables'] = [];
            foreach ($requiredTables as $table) {
                $results['required_tables'][$table] = in_array($table, $tables);
            }

        } else {
            $results['tests']['database_connection'] = false;
            $results['error'] = "Database '" . DB_NAME . "' does not exist!";
        }

    } catch (PDOException $e) {
        $results['tests']['mysql_connection'] = false;
        $results['connection_error'] = $e->getMessage();
    }
}

// Test 5: Check file permissions
$results['file_permissions'] = [
    'config.php' => is_readable(__DIR__ . '/config.php'),
    'database.php' => is_readable(__DIR__ . '/database.php'),
    'auth.php' => is_readable(__DIR__ . '/auth.php'),
    'index.php' => is_readable(__DIR__ . '/index.php'),
];

echo json_encode($results, JSON_PRETTY_PRINT);
