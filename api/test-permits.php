<?php
/**
 * Quick test to see permits in database
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    $db = Database::getInstance();

    // Get all permits
    $permits = $db->fetchAll('SELECT * FROM permits ORDER BY application_date DESC');

    echo json_encode([
        'success' => true,
        'count' => count($permits),
        'permits' => $permits
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
