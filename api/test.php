<?php
/**
 * API Test Script
 * Test if the API is working correctly
 *
 * Access via: https://visclubsim.be/api/test.php
 */

// Enable error display for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

echo json_encode([
    'status' => 'OK',
    'message' => 'API is werkend!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'tests' => [
        'php_running' => true,
        'json_encode' => function_exists('json_encode'),
        'pdo_available' => class_exists('PDO'),
        'curl_available' => function_exists('curl_init'),
        'config_file' => file_exists(__DIR__ . '/config.php'),
        'database_file' => file_exists(__DIR__ . '/database.php'),
        'auth_file' => file_exists(__DIR__ . '/auth.php'),
        'index_file' => file_exists(__DIR__ . '/index.php'),
    ]
], JSON_PRETTY_PRINT);
