<?php
/**
 * View all permits in database (HTML version for easy viewing)
 * Access: https://visclubsim.be/api/view-permits.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: text/html; charset=UTF-8');

?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Permits - Database</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c5f7d;
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background: #2c5f7d;
            color: white;
        }
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        .status-pending {
            background: #fff3cd;
            color: #856404;
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
        }
        .status-approved {
            background: #d4edda;
            color: #155724;
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
        }
        .status-rejected {
            background: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Permits in Database</h1>

        <?php
        try {
            $db = Database::getInstance();

            // Get all permits
            $permits = $db->fetchAll('SELECT * FROM permits ORDER BY application_date DESC');
            $count = count($permits);

            echo "<div class='success'>";
            echo "✅ <strong>Database verbinding OK!</strong><br>";
            echo "Totaal aantal permits in database: <strong>$count</strong>";
            echo "</div>";

            if ($count > 0) {
                echo "<table>";
                echo "<thead>";
                echo "<tr>";
                echo "<th>ID</th>";
                echo "<th>Naam</th>";
                echo "<th>Email</th>";
                echo "<th>Telefoon</th>";
                echo "<th>Adres</th>";
                echo "<th>Type</th>";
                echo "<th>Status</th>";
                echo "<th>Aanvraag Datum</th>";
                echo "</tr>";
                echo "</thead>";
                echo "<tbody>";

                foreach ($permits as $permit) {
                    $statusClass = 'status-' . $permit['status'];
                    $statusLabel = $permit['status'] === 'pending' ? 'In Afwachting' :
                                   ($permit['status'] === 'approved' ? 'Goedgekeurd' : 'Afgewezen');

                    echo "<tr>";
                    echo "<td>{$permit['id']}</td>";
                    echo "<td>" . htmlspecialchars($permit['applicant_name']) . "</td>";
                    echo "<td>" . htmlspecialchars($permit['email']) . "</td>";
                    echo "<td>" . htmlspecialchars($permit['phone'] ?? '-') . "</td>";
                    echo "<td>" . htmlspecialchars($permit['address'] ?? '-') . "</td>";
                    echo "<td>" . htmlspecialchars($permit['permit_type'] ?? '-') . "</td>";
                    echo "<td><span class='$statusClass'>$statusLabel</span></td>";
                    echo "<td>" . date('d-m-Y H:i', strtotime($permit['application_date'])) . "</td>";
                    echo "</tr>";
                }

                echo "</tbody>";
                echo "</table>";

                // Show notes if any
                echo "<h2 style='margin-top: 30px;'>Details & Opmerkingen</h2>";
                foreach ($permits as $permit) {
                    if (!empty($permit['notes'])) {
                        echo "<div style='background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #2c5f7d;'>";
                        echo "<strong>" . htmlspecialchars($permit['applicant_name']) . " (ID: {$permit['id']})</strong><br>";
                        echo "<pre style='white-space: pre-wrap; margin: 10px 0 0 0;'>" . htmlspecialchars($permit['notes']) . "</pre>";
                        echo "</div>";
                    }
                }
            } else {
                echo "<div class='warning'>";
                echo "⚠️ <strong>Geen permits gevonden in database</strong><br>";
                echo "Dit betekent dat permit aanvragen nog niet worden opgeslagen.";
                echo "</div>";
            }

        } catch (Exception $e) {
            echo "<div class='error'>";
            echo "❌ <strong>Database Error:</strong><br>";
            echo htmlspecialchars($e->getMessage());
            echo "</div>";
        }
        ?>

        <div class="warning" style="margin-top: 30px;">
            <strong>⚠️ BELANGRIJK:</strong> Verwijder dit bestand na testen! Het toont alle permit data zonder authenticatie.
        </div>
    </div>
</body>
</html>
