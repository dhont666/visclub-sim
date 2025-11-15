<?php
/**
 * DEBUG VERSION of Database Class
 * Shows FULL error messages instead of hiding them
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Connection Debug</h1>";
echo "<hr>";

// Load config
echo "<h2>Step 1: Load Config</h2>";
$config = require_once __DIR__ . '/config.php';
echo "✅ Config loaded<br>";
echo "Host: " . $config['db']['host'] . "<br>";
echo "Name: " . $config['db']['name'] . "<br>";
echo "User: " . $config['db']['user'] . "<br>";
echo "Pass: " . str_repeat('*', strlen($config['db']['pass'])) . "<br>";
echo "Charset: " . $config['db']['charset'] . "<br>";
echo "<hr>";

// Try PDO connection
echo "<h2>Step 2: Test PDO Connection</h2>";

try {
    echo "Creating DSN string...<br>";
    $dsn = sprintf(
        "mysql:host=%s;dbname=%s;charset=%s",
        $config['db']['host'],
        $config['db']['name'],
        $config['db']['charset']
    );
    echo "DSN: <code>" . $dsn . "</code><br><br>";

    echo "Setting PDO options...<br>";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    echo "Options set<br><br>";

    echo "Attempting PDO connection...<br>";
    $pdo = new PDO(
        $dsn,
        $config['db']['user'],
        $config['db']['pass'],
        $options
    );

    echo "<div style='background:#d4edda;padding:20px;margin:10px 0;border-left:4px solid #28a745;'>";
    echo "<h3 style='color:#28a745;margin-top:0;'>✅ PDO CONNECTION SUCCESS!</h3>";
    echo "</div>";

    // Test query
    echo "<h2>Step 3: Test Query</h2>";
    $stmt = $pdo->query("SELECT VERSION() as version, DATABASE() as db_name");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "MySQL Version: <strong>" . $result['version'] . "</strong><br>";
    echo "Database Name: <strong>" . $result['db_name'] . "</strong><br>";

} catch (PDOException $e) {
    echo "<div style='background:#ffebee;padding:20px;margin:10px 0;border-left:4px solid #f44336;'>";
    echo "<h3 style='color:#f44336;margin-top:0;'>❌ PDO CONNECTION FAILED!</h3>";

    echo "<h4>Error Details:</h4>";
    echo "<strong>Message:</strong> " . $e->getMessage() . "<br>";
    echo "<strong>Code:</strong> " . $e->getCode() . "<br>";
    echo "<strong>File:</strong> " . $e->getFile() . ":" . $e->getLine() . "<br>";

    echo "<h4>Stack Trace:</h4>";
    echo "<pre style='background:#fff;padding:10px;overflow:auto;'>" . $e->getTraceAsString() . "</pre>";

    echo "</div>";

    // Analyze the error
    echo "<h3>🔍 Error Analysis</h3>";
    $errorMsg = $e->getMessage();

    if (strpos($errorMsg, 'Access denied') !== false) {
        echo "<div style='background:#fff3cd;padding:15px;border-left:4px solid #ffc107;'>";
        echo "<strong>CAUSE:</strong> Wrong username or password<br><br>";
        echo "<strong>SOLUTION:</strong><br>";
        echo "1. Go to Plesk → Databases<br>";
        echo "2. Find user: <strong>" . $config['db']['user'] . "</strong><br>";
        echo "3. Reset the password<br>";
        echo "4. Update api/config.php line 35 with new password<br>";
        echo "</div>";
    }
    else if (strpos($errorMsg, 'Unknown database') !== false) {
        echo "<div style='background:#fff3cd;padding:15px;border-left:4px solid #ffc107;'>";
        echo "<strong>CAUSE:</strong> Database doesn't exist<br><br>";
        echo "<strong>SOLUTION:</strong><br>";
        echo "Option A: Create the database<br>";
        echo "1. Go to Plesk → Databases → Add Database<br>";
        echo "2. Name: <strong>" . $config['db']['name'] . "</strong><br>";
        echo "3. User: <strong>" . $config['db']['user'] . "</strong><br>";
        echo "4. Set password and save<br><br>";

        echo "Option B: Use existing database<br>";
        echo "1. Go to Plesk → Databases<br>";
        echo "2. Find an existing database name<br>";
        echo "3. Update api/config.php line 33 with that name<br>";
        echo "</div>";
    }
    else if (strpos($errorMsg, "Can't connect") !== false || strpos($errorMsg, 'Connection refused') !== false) {
        echo "<div style='background:#fff3cd;padding:15px;border-left:4px solid #ffc107;'>";
        echo "<strong>CAUSE:</strong> Can't reach MySQL server<br><br>";
        echo "<strong>SOLUTION:</strong><br>";
        echo "1. Try changing DB_HOST in api/config.php to:<br>";
        echo "   - <code>127.0.0.1</code> instead of <code>localhost</code><br>";
        echo "   - Or check Plesk for the correct hostname<br>";
        echo "2. Contact Cloud86 support if problem persists<br>";
        echo "</div>";
    }
    else {
        echo "<div style='background:#fff3cd;padding:15px;border-left:4px solid #ffc107;'>";
        echo "<strong>UNKNOWN ERROR</strong><br><br>";
        echo "Copy the error message above and:<br>";
        echo "1. Search Google for the error<br>";
        echo "2. Contact Cloud86 support<br>";
        echo "3. Or send me the full error message<br>";
        echo "</div>";
    }

    die();
}

echo "<hr>";
echo "<h2>✅ ALL TESTS PASSED!</h2>";
echo "<p>The database connection works with PDO!</p>";
echo "<p><strong>Next:</strong> The real API should work now. If not, there might be a different issue.</p>";
?>
