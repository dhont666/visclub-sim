<?php
/**
 * Visclub SiM - PHP REST API
 * Main API router and endpoints
 */

// Load dependencies first
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/auth.php';

// CORS Configuration (Secure)
$config = require __DIR__ . '/config.php';
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if origin is allowed
if (in_array($origin, $config['cors']['allowed_origins'])) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} elseif ($origin === '') {
    // Allow requests with no origin (e.g., Postman, curl)
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

// Helper function to sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Helper function to validate boolean
function validateBoolean($value) {
    if ($value === 'true' || $value === '1' || $value === 1 || $value === true) {
        return true;
    }
    if ($value === 'false' || $value === '0' || $value === 0 || $value === false) {
        return false;
    }
    return null;
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

        // Rate limiting: Check failed login attempts
        session_start();
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $rateLimitKey = 'login_attempts_' . md5($ip);

        if (!isset($_SESSION[$rateLimitKey])) {
            $_SESSION[$rateLimitKey] = ['count' => 0, 'first_attempt' => time()];
        }

        $attempts = $_SESSION[$rateLimitKey];
        $timeWindow = 900; // 15 minutes

        // Reset if time window passed
        if (time() - $attempts['first_attempt'] > $timeWindow) {
            $_SESSION[$rateLimitKey] = ['count' => 0, 'first_attempt' => time()];
            $attempts = $_SESSION[$rateLimitKey];
        }

        // Block if too many attempts
        if ($attempts['count'] >= 5) {
            $waitTime = $timeWindow - (time() - $attempts['first_attempt']);
            sendError("Too many login attempts. Try again in " . ceil($waitTime / 60) . " minutes.", 429);
        }

        $user = $db->fetchOne(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
            [$input['username']]
        );

        // Constant-time comparison to prevent timing attacks
        $loginSuccess = false;
        if ($user) {
            $loginSuccess = Auth::verifyPassword($input['password'], $user['password_hash']);
        } else {
            // Hash a dummy password to keep timing consistent
            Auth::verifyPassword('dummy_password_to_keep_timing_consistent', '$2y$10$dummyhash');
        }

        if (!$loginSuccess) {
            // Increment failed attempts
            $_SESSION[$rateLimitKey]['count']++;

            // Log failed attempt
            error_log("Failed login attempt for username: " . $input['username'] . " from IP: " . $ip);

            sendError('Invalid credentials', 401);
        }

        // Reset rate limit on successful login
        unset($_SESSION[$rateLimitKey]);

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

        // Sanitize and validate query parameters
        $active = isset($_GET['active']) ? validateBoolean($_GET['active']) : null;
        $veteran = isset($_GET['veteran']) ? validateBoolean($_GET['veteran']) : null;

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
    // PUBLIC CONTACT MESSAGES ENDPOINTS (NO AUTH REQUIRED)
    // =============================================================================

    // POST /public/contact
    if ($path === 'public/contact' && $method === 'POST') {
        // Validate required fields
        $required = ['name', 'email', 'subject', 'message'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                sendError("Field '$field' is required", 400);
            }
        }

        // Sanitize inputs
        $name = sanitizeInput($input['name']);
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        $subject = sanitizeInput($input['subject']);
        $message = sanitizeInput($input['message']);

        if (!$email) {
            sendError('Invalid email address', 400);
        }

        // Insert into database
        $sql = 'INSERT INTO contact_messages (name, email, subject, message, status)
                VALUES (?, ?, ?, ?, ?)';

        $params = [$name, $email, $subject, $message, 'unread'];

        $db->execute($sql, $params);
        $newId = $db->lastInsertId();

        sendResponse([
            'success' => true,
            'message' => 'Contact bericht ontvangen',
            'id' => $newId
        ], 201);
    }

    // GET /contact-messages (Protected - Admin only)
    if ($path === 'contact-messages' && $method === 'GET') {
        Auth::requireAuth();

        $status = $_GET['status'] ?? null;

        $sql = 'SELECT * FROM contact_messages';
        $params = [];

        if ($status) {
            $sql .= ' WHERE status = ?';
            $params[] = $status;
        }

        $sql .= ' ORDER BY created_at DESC';

        $messages = $db->fetchAll($sql, $params);
        sendResponse(['success' => true, 'data' => $messages]);
    }

    // PUT /contact-messages/:id (Protected - Admin only)
    if (preg_match('/^contact-messages\/(\d+)$/', $path, $matches) && $method === 'PUT') {
        Auth::requireAuth();

        $id = $matches[1];

        $sql = 'UPDATE contact_messages SET ';
        $updates = [];
        $params = [];

        if (isset($input['status'])) {
            $updates[] = 'status = ?';
            $params[] = $input['status'];
        }

        if (isset($input['reply_message'])) {
            $updates[] = 'reply_message = ?';
            $updates[] = 'replied_at = NOW()';
            $params[] = $input['reply_message'];
        }

        if (empty($updates)) {
            sendError('No fields to update', 400);
        }

        $sql .= implode(', ', $updates) . ' WHERE id = ?';
        $params[] = $id;

        $rowCount = $db->execute($sql, $params);

        if ($rowCount === 0) {
            sendError('Message not found', 404);
        }

        $message = $db->fetchOne('SELECT * FROM contact_messages WHERE id = ?', [$id]);
        sendResponse(['success' => true, 'data' => $message]);
    }

    // =============================================================================
    // PUBLIC REGISTRATION ENDPOINTS (NO AUTH REQUIRED)
    // =============================================================================

    // POST /public/register
    if ($path === 'public/register' && $method === 'POST') {
        // Validate required fields
        $required = ['firstName', 'lastName', 'competition'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                sendError("Field '$field' is required", 400);
            }
        }

        // Sanitize inputs
        $firstName = sanitizeInput($input['firstName']);
        $lastName = sanitizeInput($input['lastName']);
        $email = !empty($input['email']) ? filter_var($input['email'], FILTER_VALIDATE_EMAIL) : null;
        $phone = sanitizeInput($input['phone'] ?? '');
        $partnerFirstName = sanitizeInput($input['partnerFirstName'] ?? '');
        $partnerLastName = sanitizeInput($input['partnerLastName'] ?? '');
        $competition = sanitizeInput($input['competition']);
        $paymentMethod = sanitizeInput($input['paymentMethod'] ?? 'qr');
        $paymentReference = sanitizeInput($input['paymentReference'] ?? '');
        $amount = sanitizeInput($input['amount'] ?? '');
        $remarks = sanitizeInput($input['remarks'] ?? '');

        // Determine competition date and name from competition string
        // Expected format: "date - name" or index from calendarData
        $competitionDate = '';
        $competitionName = '';

        if (strpos($competition, ' - ') !== false) {
            list($competitionDate, $competitionName) = explode(' - ', $competition, 2);
        } else {
            // If it's just a number, use it as-is
            $competitionDate = $competition;
            $competitionName = $competition;
        }

        // Determine registration type
        $registrationType = (!empty($partnerFirstName) && !empty($partnerLastName)) ? 'koppel' : 'solo';

        // Insert into database
        $sql = 'INSERT INTO public_registrations
                (first_name, last_name, email, phone, partner_first_name, partner_last_name,
                 competition_date, competition_name, registration_type, payment_method,
                 payment_reference, amount, remarks, payment_status, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        $params = [
            $firstName,
            $lastName,
            $email,
            $phone,
            $partnerFirstName,
            $partnerLastName,
            $competitionDate,
            $competitionName,
            $registrationType,
            $paymentMethod,
            $paymentReference,
            $amount,
            $remarks,
            'pending',
            'pending'
        ];

        $db->execute($sql, $params);
        $newId = $db->lastInsertId();

        sendResponse([
            'success' => true,
            'message' => 'Inschrijving ontvangen',
            'id' => $newId,
            'reference' => $paymentReference
        ], 201);
    }

    // GET /public-registrations (Protected - Admin only)
    if ($path === 'public-registrations' && $method === 'GET') {
        Auth::requireAuth();

        $competitionDate = $_GET['competition_date'] ?? null;
        $status = $_GET['status'] ?? null;

        $sql = 'SELECT * FROM public_registrations';
        $params = [];
        $conditions = [];

        if ($competitionDate) {
            $conditions[] = 'competition_date = ?';
            $params[] = $competitionDate;
        }

        if ($status) {
            $conditions[] = 'status = ?';
            $params[] = $status;
        }

        if (!empty($conditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY created_at DESC';

        $registrations = $db->fetchAll($sql, $params);
        sendResponse(['success' => true, 'data' => $registrations]);
    }

    // PUT /public-registrations/:id (Protected - Admin only)
    if (preg_match('/^public-registrations\/(\d+)$/', $path, $matches) && $method === 'PUT') {
        Auth::requireAuth();

        $id = $matches[1];

        $sql = 'UPDATE public_registrations SET ';
        $updates = [];
        $params = [];

        if (isset($input['status'])) {
            $updates[] = 'status = ?';
            $params[] = $input['status'];
        }

        if (isset($input['payment_status'])) {
            $updates[] = 'payment_status = ?';
            $params[] = $input['payment_status'];
        }

        if (empty($updates)) {
            sendError('No fields to update', 400);
        }

        $sql .= implode(', ', $updates) . ' WHERE id = ?';
        $params[] = $id;

        $rowCount = $db->execute($sql, $params);

        if ($rowCount === 0) {
            sendError('Registration not found', 404);
        }

        $registration = $db->fetchOne('SELECT * FROM public_registrations WHERE id = ?', [$id]);
        sendResponse(['success' => true, 'data' => $registration]);
    }

    // =============================================================================
    // 404 - Route not found
    // =============================================================================
    sendError('Endpoint not found', 404);

} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    sendError('Internal server error', 500);
}
