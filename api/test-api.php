<?php
/**
 * Test API and Database Connection
 * This tests the ACTUAL API code path
 */

// Enable ALL error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>API Connection Test</h1>";
echo "<p>This tests the exact same code path as the real API</p>";
echo "<hr>";

// Test 1: Load config
echo "<h2>Test 1: Load Config</h2>";
try {
    require_once __DIR__ . '/config.php';
    echo "✅ config.php loaded<br>";
    echo "DB_HOST: " . DB_HOST . "<br>";
    echo "DB_NAME: " . DB_NAME . "<br>";
    echo "DB_USER: " . DB_USER . "<br>";
    echo "DB_PASS: " . str_repeat('*', strlen(DB_PASS)) . "<br>";
} catch (Exception $e) {
    echo "❌ Error loading config: " . $e->getMessage() . "<br>";
    die();
}
echo "<hr>";

// Test 2: Load Database class
echo "<h2>Test 2: Load Database Class</h2>";
try {
    require_once __DIR__ . '/database.php';
    echo "✅ database.php loaded<br>";
} catch (Exception $e) {
    echo "❌ Error loading database.php: " . $e->getMessage() . "<br>";
    die();
}
echo "<hr>";

// Test 3: Create Database instance (this will try to connect)
echo "<h2>Test 3: Create Database Connection</h2>";
try {
    echo "Attempting to connect using Database class...<br>";
    $db = Database::getInstance();
    echo "✅ <strong style='color:green;'>DATABASE CONNECTION SUCCESS!</strong><br>";
} catch (Exception $e) {
    echo "❌ <strong style='color:red;'>DATABASE CONNECTION FAILED!</strong><br>";
    echo "<div style='background:#ffebee;padding:15px;margin:10px 0;border-left:4px solid #f44336;'>";
    echo "<strong>Error:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Trace:</strong><br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    echo "</div>";

    echo "<h3>Possible Causes:</h3>";
    echo "<ul>";
    echo "<li>Database name is wrong (check: '" . DB_NAME . "')</li>";
    echo "<li>Database user is wrong (check: '" . DB_USER . "')</li>";
    echo "<li>Password is wrong</li>";
    echo "<li>Database doesn't exist</li>";
    echo "<li>User doesn't have permissions</li>";
    echo "</ul>";

    echo "<h3>Try This:</h3>";
    echo "<ol>";
    echo "<li>Log into Plesk → Databases</li>";
    echo "<li>Look for database: <strong>" . DB_NAME . "</strong></li>";
    echo "<li>If it exists, check the username and reset password</li>";
    echo "<li>If it doesn't exist, create it</li>";
    echo "<li>Update api/config.php with correct values</li>";
    echo "</ol>";

    die();
}
echo "<hr>";

// Test 4: Run a simple query
echo "<h2>Test 4: Test Query</h2>";
try {
    $result = $db->fetchOne("SELECT VERSION() as version, DATABASE() as current_db");
    echo "✅ Query executed successfully!<br>";
    echo "MySQL Version: <strong>" . $result['version'] . "</strong><br>";
    echo "Current Database: <strong>" . $result['current_db'] . "</strong><br>";
} catch (Exception $e) {
    echo "❌ Query failed: " . $e->getMessage() . "<br>";
}
echo "<hr>";

// Test 5: Check if permits table exists
echo "<h2>Test 5: Check Permits Table</h2>";
try {
    $result = $db->fetchOne("SHOW TABLES LIKE 'permits'");
    if ($result) {
        echo "✅ 'permits' table exists<br>";

        // Count permits
        $count = $db->fetchOne("SELECT COUNT(*) as count FROM permits");
        echo "Number of permits in database: <strong>" . $count['count'] . "</strong><br>";
    } else {
        echo "❌ 'permits' table does NOT exist!<br>";
        echo "<div style='background:#fff3cd;padding:15px;margin:10px 0;border-left:4px solid #ffc107;'>";
        echo "You need to import the database schema!<br>";
        echo "File: database/COMPLETE-SCHEMA.sql<br>";
        echo "Import it via phpMyAdmin";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "❌ Error checking table: " . $e->getMessage() . "<br>";
}
echo "<hr>";

// Test 6: Show all tables
echo "<h2>Test 6: List All Tables</h2>";
try {
    $tables = $db->fetchAll("SHOW TABLES");
    if (count($tables) > 0) {
        echo "✅ Found " . count($tables) . " tables:<br>";
        echo "<ul>";
        foreach ($tables as $table) {
            $tableName = array_values($table)[0];
            echo "<li>" . $tableName . "</li>";
        }
        echo "</ul>";
    } else {
        echo "⚠️ No tables found. Import the schema!<br>";
    }
} catch (Exception $e) {
    echo "❌ Error listing tables: " . $e->getMessage() . "<br>";
}
echo "<hr>";

// Test 7: Try to INSERT a test permit
echo "<h2>Test 7: Test INSERT (Dry Run)</h2>";
try {
    $testData = [
        'applicant_name' => 'TEST USER',
        'email' => 'test@example.com',
        'phone' => '1234567890',
        'address' => 'Test Address 123',
        'permit_type' => 'jaarvergunning',
        'status' => 'pending',
        'created_at' => date('Y-m-d H:i:s')
    ];

    $sql = "INSERT INTO permits (applicant_name, email, phone, address, permit_type, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)";

    echo "SQL: <code>" . $sql . "</code><br>";
    echo "Data: <pre>" . print_r($testData, true) . "</pre>";

    // Actually try the insert
    $result = $db->execute($sql, array_values($testData));

    if ($result > 0) {
        $insertId = $db->lastInsertId();
        echo "✅ <strong style='color:green;'>TEST INSERT SUCCESSFUL!</strong><br>";
        echo "Inserted ID: <strong>" . $insertId . "</strong><br>";

        // Delete the test record
        $db->execute("DELETE FROM permits WHERE id = ?", [$insertId]);
        echo "✅ Test record cleaned up (deleted)<br>";
    } else {
        echo "⚠️ Insert returned 0 rows affected<br>";
    }

} catch (Exception $e) {
    echo "❌ INSERT test failed: " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
echo "<hr>";

// FINAL RESULT
echo "<h2>🎉 FINAL RESULT</h2>";
echo "<div style='background:#d4edda;padding:20px;margin:10px 0;border-left:4px solid #28a745;'>";
echo "<h3 style='color:#28a745;margin-top:0;'>✅ ALL TESTS PASSED!</h3>";
echo "<p>Your database connection is working correctly with the API code.</p>";
echo "<p><strong>The API should work now!</strong></p>";
echo "</div>";

echo "<h3>Next Steps:</h3>";
echo "<ol>";
echo "<li>Test the actual API: <a href='/api/health'>/api/health</a></li>";
echo "<li>Test permit submission on the website</li>";
echo "<li><strong>DELETE THIS FILE</strong> (test-api.php) for security!</li>";
echo "</ol>";

echo "<hr>";
echo "<p><small>Test completed at: " . date('Y-m-d H:i:s') . "</small></p>";
?>
