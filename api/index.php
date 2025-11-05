<?php
/**
 * Visclub SiM - PHP REST API
 * Main API router and endpoints
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load dependencies
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path); // Remove /api prefix if exists
$path = trim($path, '/');
$segments = explode('/', $path);

// Get database instance
$db = Database::getInstance();

// Parse JSON body for POST/PUT requests
$input = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $input = json_decode(file_get_contents('php://input'), true);
}

// Helper function to send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Helper function to send error
function sendError($message, $statusCode = 400) {
    sendResponse(['success' => false, 'error' => $message], $statusCode);
}

// =============================================================================
// ROUTING
// =============================================================================

try {
    // Health check
    if ($path === 'health' && $method === 'GET') {
        sendResponse([
            'status' => 'ok',
            'timestamp' => date('Y-m-d\TH:i:s\Z'),
            'version' => API_VERSION
        ]);
    }

    // =============================================================================
    // AUTH ENDPOINTS
    // =============================================================================

    // POST /auth/login
    if ($path === 'auth/login' && $method === 'POST') {
        if (empty($input['username']) || empty($input['password'])) {
            sendError('Username and password required', 400);
        }

        $user = $db->fetchOne(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
            [$input['username']]
        );

        if (!$user || !Auth::verifyPassword($input['password'], $user['password_hash'])) {
            sendError('Invalid credentials', 401);
        }

        // Update last login
        $db->execute(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [$user['id']]
        );

        $token = Auth::generateToken([
            'userId' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]);

        sendResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'fullName' => $user['full_name'],
                'role' => $user['role']
            ]
        ]);
    }

    // GET /auth/verify
    if ($path === 'auth/verify' && $method === 'GET') {
        $payload = Auth::requireAuth();
        sendResponse([
            'success' => true,
            'user' => $payload
        ]);
    }

    // =============================================================================
    // MEMBERS ENDPOINTS (Protected)
    // =============================================================================

    // GET /members
    if ($path === 'members' && $method === 'GET') {
        Auth::requireAuth();

        $active = isset($_GET['active']) ? $_GET['active'] === 'true' : null;
        $veteran = isset($_GET['veteran']) ? $_GET['veteran'] === 'true' : null;

        $sql = 'SELECT * FROM members WHERE 1=1';
        $params = [];

        if ($active !== null) {
            $sql .= ' AND is_active = ?';
            $params[] = $active;
        }

        if ($veteran !== null) {
            $sql .= ' AND is_veteran = ?';
            $params[] = $veteran;
        }

        $sql .= ' ORDER BY name ASC';

        $members = $db->fetchAll($sql, $params);
        sendResponse(['success' => true, 'data' => $members]);
    }

    // GET /members/:id
    if (preg_match('/^members\/(\d+)$/', $path, $matches) && $method === 'GET') {
        Auth::requireAuth();

        $id = $matches[1];
        $member = $db->fetchOne('SELECT * FROM members WHERE id = ?', [$id]);

        if (!$member) {
            sendError('Member not found', 404);
        }

        sendResponse(['success' => true, 'data' => $member]);
    }

    // POST /members
    if ($path === 'members' && $method === 'POST') {
        Auth::requireAuth();

        $required = ['name'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                sendError("Field '$field' is required", 400);
            }
        }

        $sql = 'INSERT INTO members (name, member_number, email, phone, address, city, postal_code, birth_date, is_veteran, is_active, joined_at, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        $params = [
            $input['name'],
            $input['member_number'] ?? null,
            $input['email'] ?? null,
            $input['phone'] ?? null,
            $input['address'] ?? null,
            $input['city'] ?? null,
            $input['postal_code'] ?? null,
            $input['birth_date'] ?? null,
            $input['is_veteran'] ?? false,
            $input['is_active'] ?? true,
            $input['joined_at'] ?? date('Y-m-d'),
            $input['notes'] ?? null
        ];

        $db->execute($sql, $params);
        $newId = $db->lastInsertId();

        $member = $db->fetchOne('SELECT * FROM members WHERE id = ?', [$newId]);
        sendResponse(['success' => true, 'data' => $member], 201);
    }

    // PUT /members/:id
    if (preg_match('/^members\/(\d+)$/', $path, $matches) && $method === 'PUT') {
        Auth::requireAuth();

        $id = $matches[1];

        $sql = 'UPDATE members SET
                name = ?, member_number = ?, email = ?, phone = ?,
                address = ?, city = ?, postal_code = ?, birth_date = ?,
                is_veteran = ?, is_active = ?, notes = ?
                WHERE id = ?';

        $params = [
            $input['name'] ?? null,
            $input['member_number'] ?? null,
            $input['email'] ?? null,
            $input['phone'] ?? null,
            $input['address'] ?? null,
            $input['city'] ?? null,
            $input['postal_code'] ?? null,
            $input['birth_date'] ?? null,
            $input['is_veteran'] ?? false,
            $input['is_active'] ?? true,
            $input['notes'] ?? null,
            $id
        ];

        $rowCount = $db->execute($sql, $params);

        if ($rowCount === 0) {
            sendError('Member not found', 404);
        }

        $member = $db->fetchOne('SELECT * FROM members WHERE id = ?', [$id]);
        sendResponse(['success' => true, 'data' => $member]);
    }

    // DELETE /members/:id
    if (preg_match('/^members\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
        Auth::requireAuth();

        $id = $matches[1];
        $rowCount = $db->execute('DELETE FROM members WHERE id = ?', [$id]);

        if ($rowCount === 0) {
            sendError('Member not found', 404);
        }

        sendResponse(['success' => true, 'message' => 'Member deleted']);
    }

    // =============================================================================
    // COMPETITIONS ENDPOINTS (Protected)
    // =============================================================================

    // GET /competitions
    if ($path === 'competitions' && $method === 'GET') {
        Auth::requireAuth();

        $status = $_GET['status'] ?? null;

        $sql = 'SELECT * FROM competitions';
        $params = [];

        if ($status) {
            $sql .= ' WHERE status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY date DESC';

        $competitions = $db->fetchAll($sql, $params);
        sendResponse(['success' => true, 'data' => $competitions]);
    }

    // POST /competitions
    if ($path === 'competitions' && $method === 'POST') {
        Auth::requireAuth();

        $required = ['name', 'date'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                sendError("Field '$field' is required", 400);
            }
        }

        $sql = 'INSERT INTO competitions (name, date, location, description, status, counts_for_club_ranking, counts_for_veteran_ranking, max_participants, registration_deadline, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        $params = [
            $input['name'],
            $input['date'],
            $input['location'] ?? null,
            $input['description'] ?? null,
            $input['status'] ?? 'upcoming',
            $input['counts_for_club_ranking'] ?? true,
            $input['counts_for_veteran_ranking'] ?? true,
            $input['max_participants'] ?? null,
            $input['registration_deadline'] ?? null,
            $input['notes'] ?? null
        ];

        $db->execute($sql, $params);
        $newId = $db->lastInsertId();

        $competition = $db->fetchOne('SELECT * FROM competitions WHERE id = ?', [$newId]);
        sendResponse(['success' => true, 'data' => $competition], 201);
    }

    // =============================================================================
    // RESULTS ENDPOINTS (Protected)
    // =============================================================================

    // GET /competitions/:id/results
    if (preg_match('/^competitions\/(\d+)\/results$/', $path, $matches) && $method === 'GET') {
        Auth::requireAuth();

        $competitionId = $matches[1];

        $sql = 'SELECT r.*, m.name as member_name, m.member_number
                FROM results r
                INNER JOIN members m ON r.member_id = m.id
                WHERE r.competition_id = ?
                ORDER BY r.points ASC';

        $results = $db->fetchAll($sql, [$competitionId]);
        sendResponse(['success' => true, 'data' => $results]);
    }

    // POST /results
    if ($path === 'results' && $method === 'POST') {
        Auth::requireAuth();

        $required = ['competition_id', 'member_id', 'points'];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                sendError("Field '$field' is required", 400);
            }
        }

        $sql = 'INSERT INTO results (competition_id, member_id, points, weight, fish_count, is_absent, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                points = VALUES(points),
                weight = VALUES(weight),
                fish_count = VALUES(fish_count),
                is_absent = VALUES(is_absent),
                notes = VALUES(notes)';

        $params = [
            $input['competition_id'],
            $input['member_id'],
            $input['points'],
            $input['weight'] ?? null,
            $input['fish_count'] ?? 0,
            $input['is_absent'] ?? false,
            $input['notes'] ?? null
        ];

        $db->execute($sql, $params);
        sendResponse(['success' => true, 'message' => 'Result saved'], 201);
    }

    // =============================================================================
    // RANKINGS ENDPOINTS (Protected)
    // =============================================================================

    // GET /rankings/club
    if ($path === 'rankings/club' && $method === 'GET') {
        Auth::requireAuth();

        $rankings = $db->fetchAll('SELECT * FROM club_ranking');
        sendResponse(['success' => true, 'data' => $rankings]);
    }

    // GET /rankings/veteran
    if ($path === 'rankings/veteran' && $method === 'GET') {
        Auth::requireAuth();

        $rankings = $db->fetchAll('SELECT * FROM veteran_ranking');
        sendResponse(['success' => true, 'data' => $rankings]);
    }

    // =============================================================================
    // REGISTRATIONS ENDPOINTS (Protected)
    // =============================================================================

    // GET /registrations
    if ($path === 'registrations' && $method === 'GET') {
        Auth::requireAuth();

        $competitionId = $_GET['competition_id'] ?? null;

        $sql = 'SELECT reg.*, m.name as member_name, c.name as competition_name, c.date as competition_date
                FROM registrations reg
                INNER JOIN members m ON reg.member_id = m.id
                INNER JOIN competitions c ON reg.competition_id = c.id';

        $params = [];

        if ($competitionId) {
            $sql .= ' WHERE reg.competition_id = ?';
            $params[] = $competitionId;
        }

        $sql .= ' ORDER BY reg.registration_date DESC';

        $registrations = $db->fetchAll($sql, $params);
        sendResponse(['success' => true, 'data' => $registrations]);
    }

    // POST /registrations
    if ($path === 'registrations' && $method === 'POST') {
        Auth::requireAuth();

        $required = ['competition_id', 'member_id'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                sendError("Field '$field' is required", 400);
            }
        }

        $sql = 'INSERT INTO registrations (competition_id, member_id, status, payment_status, notes)
                VALUES (?, ?, ?, ?, ?)';

        $params = [
            $input['competition_id'],
            $input['member_id'],
            $input['status'] ?? 'registered',
            $input['payment_status'] ?? 'pending',
            $input['notes'] ?? null
        ];

        $db->execute($sql, $params);
        $newId = $db->lastInsertId();

        $registration = $db->fetchOne('SELECT * FROM registrations WHERE id = ?', [$newId]);
        sendResponse(['success' => true, 'data' => $registration], 201);
    }

    // =============================================================================
    // STATISTICS ENDPOINTS (Protected)
    // =============================================================================

    // GET /statistics/members
    if ($path === 'statistics/members' && $method === 'GET') {
        Auth::requireAuth();

        $stats = $db->fetchAll('SELECT * FROM member_statistics ORDER BY member_name');
        sendResponse(['success' => true, 'data' => $stats]);
    }

    // GET /statistics/upcoming
    if ($path === 'statistics/upcoming' && $method === 'GET') {
        Auth::requireAuth();

        $upcoming = $db->fetchAll('SELECT * FROM upcoming_competitions');
        sendResponse(['success' => true, 'data' => $upcoming]);
    }

    // GET /statistics/recent
    if ($path === 'statistics/recent' && $method === 'GET') {
        Auth::requireAuth();

        $recent = $db->fetchAll('SELECT * FROM recent_results');
        sendResponse(['success' => true, 'data' => $recent]);
    }

    // =============================================================================
    // 404 - Route not found
    // =============================================================================
    sendError('Endpoint not found', 404);

} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}
