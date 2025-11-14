<?php
/**
 * Search for specific permit
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$email = $_GET['email'] ?? 'kevin666dhont@gmail.com';

try {
    $db = Database::getInstance();

    // Search by email
    $permits = $db->fetchAll(
        'SELECT * FROM permits WHERE email LIKE ? ORDER BY application_date DESC',
        ['%' . $email . '%']
    );

    echo json_encode([
        'success' => true,
        'search' => $email,
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
