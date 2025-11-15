<?php
/**
 * Database Connection Test Script
 * Upload this to public_html/api/ and visit it in your browser
 * URL: https://www.visclubsim.be/api/test-db-connection.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Connection Test</h1>";
echo "<hr>";

// Step 1: Check if config.php exists
echo "<h2>Step 1: Check config.php</h2>";
if (file_exists(__DIR__ . '/config.php')) {
    echo "✅ config.php exists<br>";
    require_once __DIR__ . '/config.php';
} else {
    echo "❌ config.php NOT FOUND!<br>";
    die("ERROR: config.php is missing. Upload it to the api/ folder.");
}

// Step 2: Show configuration (hide password)
echo "<h2>Step 2: Configuration</h2>";
echo "DB_HOST: <strong>" . DB_HOST . "</strong><br>";
echo "DB_NAME: <strong>" . DB_NAME . "</strong><br>";
echo "DB_USER: <strong>" . DB_USER . "</strong><br>";
echo "DB_PASS: <strong>" . str_repeat('*', strlen(DB_PASS)) . "</strong> (hidden)<br>";
echo "DB_CHARSET: <strong>" . DB_CHARSET . "</strong><br>";
echo "<hr>";

// Step 3: Check if MySQLi extension is loaded
echo "<h2>Step 3: Check MySQLi Extension</h2>";
if (extension_loaded('mysqli')) {
    echo "✅ MySQLi extension is loaded<br>";
} else {
    echo "❌ MySQLi extension is NOT loaded!<br>";
    die("ERROR: MySQLi PHP extension is not installed. Contact your hosting provider.");
}
echo "<hr>";

// Step 4: Try to connect
echo "<h2>Step 4: Test Database Connection</h2>";
echo "Attempting to connect to MySQL...<br>";

// Suppress errors and capture them
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    echo "❌ <strong>CONNECTION FAILED!</strong><br>";
    echo "<div style='background:#ffebee;padding:15px;margin:10px 0;border-left:4px solid #f44336;'>";
    echo "<strong>Error:</strong> " . $conn->connect_error . "<br>";
    echo "<strong>Error Number:</strong> " . $conn->connect_errno . "<br>";
    echo "</div>";

    echo "<h3>Common Solutions:</h3>";
    echo "<ul>";
    echo "<li><strong>Error 1045 (Access denied):</strong> Wrong username or password</li>";
    echo "<li><strong>Error 2002 (Connection refused):</strong> Wrong host (try '127.0.0.1' instead of 'localhost')</li>";
    echo "<li><strong>Error 2005 (Unknown MySQL server):</strong> MySQL server is down</li>";
    echo "</ul>";

    echo "<h3>Steps to Fix:</h3>";
    echo "<ol>";
    echo "<li>Log into Plesk</li>";
    echo "<li>Go to <strong>Databases</strong></li>";
    echo "<li>Check the database name, username, and reset password if needed</li>";
    echo "<li>Update <code>api/config.php</code> with the correct values</li>";
    echo "</ol>";

    die();
} else {
    echo "✅ <strong>Connected to MySQL server!</strong><br>";
}

// Step 5: Select database
echo "<h2>Step 5: Select Database</h2>";
if (!$conn->select_db(DB_NAME)) {
    echo "❌ <strong>DATABASE NOT FOUND!</strong><br>";
    echo "<div style='background:#ffebee;padding:15px;margin:10px 0;border-left:4px solid #f44336;'>";
    echo "<strong>Error:</strong> Database '" . DB_NAME . "' does not exist<br>";
    echo "</div>";

    echo "<h3>Available Databases:</h3>";
    $result = $conn->query("SHOW DATABASES");
    if ($result) {
        echo "<ul>";
        while ($row = $result->fetch_row()) {
            echo "<li>" . htmlspecialchars($row[0]) . "</li>";
        }
        echo "</ul>";
    }

    echo "<h3>Steps to Fix:</h3>";
    echo "<ol>";
    echo "<li>Check the list of available databases above</li>";
    echo "<li>Update <code>DB_NAME</code> in <code>api/config.php</code> to match one of them</li>";
    echo "<li>OR create the database in Plesk → Databases → Add Database</li>";
    echo "</ol>";

    $conn->close();
    die();
} else {
    echo "✅ <strong>Database '" . DB_NAME . "' selected successfully!</strong><br>";
}

// Step 6: Check tables
echo "<h2>Step 6: Check Tables</h2>";
$result = $conn->query("SHOW TABLES");
if ($result && $result->num_rows > 0) {
    echo "✅ <strong>Found " . $result->num_rows . " tables:</strong><br>";
    echo "<ul>";
    while ($row = $result->fetch_row()) {
        echo "<li>" . htmlspecialchars($row[0]) . "</li>";
    }
    echo "</ul>";
} else {
    echo "⚠️ <strong>No tables found in database!</strong><br>";
    echo "<div style='background:#fff3cd;padding:15px;margin:10px 0;border-left:4px solid #ffc107;'>";
    echo "The database exists but is empty. You need to import the schema.<br>";
    echo "</div>";

    echo "<h3>Steps to Fix:</h3>";
    echo "<ol>";
    echo "<li>Log into Plesk → Databases → phpMyAdmin</li>";
    echo "<li>Select database: <strong>" . DB_NAME . "</strong></li>";
    echo "<li>Click <strong>Import</strong></li>";
    echo "<li>Upload file: <code>database/COMPLETE-SCHEMA.sql</code></li>";
    echo "<li>Click <strong>Go</strong></li>";
    echo "</ol>";
}

// Step 7: Test a simple query
echo "<h2>Step 7: Test Query</h2>";
$result = $conn->query("SELECT VERSION() as mysql_version");
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ MySQL Version: <strong>" . $row['mysql_version'] . "</strong><br>";
} else {
    echo "❌ Query failed: " . $conn->error . "<br>";
}

// Close connection
$conn->close();

echo "<hr>";
echo "<h2>✅ ALL TESTS PASSED!</h2>";
echo "<div style='background:#d4edda;padding:15px;margin:10px 0;border-left:4px solid #28a745;'>";
echo "<strong>SUCCESS!</strong> Your database connection is working correctly.<br>";
echo "The API should now work. Test it at: <a href='/api/health'>https://www.visclubsim.be/api/health</a>";
echo "</div>";

echo "<hr>";
echo "<p><small>Test completed at: " . date('Y-m-d H:i:s') . "</small></p>";
echo "<p><small>⚠️ <strong>SECURITY:</strong> Delete this file after testing!</small></p>";
?>
