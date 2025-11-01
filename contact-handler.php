<?php
/**
 * Contact Formulier Handler voor Visclub SiM
 *
 * Dit script verwerkt het contact formulier en verstuurt emails
 * naar de visclub administrator.
 */

// ===============================================
// CONFIGURATIE - WIJZIG DEZE INSTELLINGEN!
// ===============================================

// Email waar berichten naartoe gestuurd worden
define('ADMIN_EMAIL', 'info@jouwvisclub.be'); // WIJZIG DIT!

// Email afzender (meestal noreply@jouwdomein.be)
define('FROM_EMAIL', 'noreply@jouwdomein.be'); // WIJZIG DIT!

// Website naam
define('SITE_NAME', 'Visclub SiM');

// reCAPTCHA (optioneel - voor spam bescherming)
define('RECAPTCHA_ENABLED', false); // Zet op true als je reCAPTCHA gebruikt
define('RECAPTCHA_SECRET_KEY', ''); // Vul in als RECAPTCHA_ENABLED = true

// ===============================================
// SECURITY HEADERS
// ===============================================

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// ===============================================
// FUNCTIES
// ===============================================

/**
 * Valideer email adres
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Sanitize input
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

/**
 * Verifieer reCAPTCHA (indien enabled)
 */
function verifyRecaptcha($response) {
    if (!RECAPTCHA_ENABLED) {
        return true;
    }

    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => RECAPTCHA_SECRET_KEY,
        'response' => $response,
        'remoteip' => $_SERVER['REMOTE_ADDR']
    ];

    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $resultJson = json_decode($result);

    return $resultJson->success === true;
}

/**
 * Log errors (indien nodig voor debugging)
 */
function logError($message) {
    // Uncomment deze regel om errors te loggen
    // error_log(date('[Y-m-d H:i:s] ') . $message . "\n", 3, __DIR__ . '/contact-errors.log');
}

/**
 * Response versturen
 */
function sendResponse($success, $message, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===============================================
// MAIN SCRIPT
// ===============================================

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Alleen POST requests zijn toegestaan.', 405);
}

// Check Content-Type (accept both form data and JSON)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isJson = strpos($contentType, 'application/json') !== false;

// Get POST data
if ($isJson) {
    $jsonData = file_get_contents('php://input');
    $postData = json_decode($jsonData, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        sendResponse(false, 'Ongeldige JSON data.', 400);
    }
} else {
    $postData = $_POST;
}

// Validate required fields
$requiredFields = ['name', 'email', 'message'];
$errors = [];

foreach ($requiredFields as $field) {
    if (!isset($postData[$field]) || empty(trim($postData[$field]))) {
        $errors[] = "Het veld '{$field}' is verplicht.";
    }
}

if (!empty($errors)) {
    sendResponse(false, implode(' ', $errors), 400);
}

// Sanitize input
$name = sanitizeInput($postData['name']);
$email = sanitizeInput($postData['email']);
$phone = isset($postData['phone']) ? sanitizeInput($postData['phone']) : '';
$subject = isset($postData['subject']) ? sanitizeInput($postData['subject']) : 'Contact formulier';
$message = sanitizeInput($postData['message']);

// Validate email
if (!validateEmail($email)) {
    sendResponse(false, 'Ongeldig email adres.', 400);
}

// Validate name length
if (strlen($name) < 2 || strlen($name) > 100) {
    sendResponse(false, 'Naam moet tussen 2 en 100 karakters zijn.', 400);
}

// Validate message length
if (strlen($message) < 10 || strlen($message) > 5000) {
    sendResponse(false, 'Bericht moet tussen 10 en 5000 karakters zijn.', 400);
}

// Verify reCAPTCHA (if enabled)
if (RECAPTCHA_ENABLED) {
    $recaptchaResponse = $postData['recaptcha'] ?? '';

    if (empty($recaptchaResponse)) {
        sendResponse(false, 'Gelieve de reCAPTCHA te voltooien.', 400);
    }

    if (!verifyRecaptcha($recaptchaResponse)) {
        sendResponse(false, 'reCAPTCHA verificatie mislukt.', 400);
    }
}

// Rate limiting - simple IP-based check
$ipFile = sys_get_temp_dir() . '/contact_rate_' . md5($_SERVER['REMOTE_ADDR']);
$currentTime = time();

if (file_exists($ipFile)) {
    $lastSubmit = (int)file_get_contents($ipFile);

    // Minimum 60 seconden tussen submissions van hetzelfde IP
    if (($currentTime - $lastSubmit) < 60) {
        sendResponse(false, 'Gelieve even te wachten voordat u opnieuw een bericht verstuurt.', 429);
    }
}

// Compose email
$emailSubject = SITE_NAME . ' - ' . $subject;

$emailBody = "Nieuw contact bericht ontvangen via website\n\n";
$emailBody .= "==============================================\n\n";
$emailBody .= "Van: {$name}\n";
$emailBody .= "Email: {$email}\n";

if (!empty($phone)) {
    $emailBody .= "Telefoon: {$phone}\n";
}

$emailBody .= "\n==============================================\n\n";
$emailBody .= "Bericht:\n\n";
$emailBody .= $message;
$emailBody .= "\n\n==============================================\n";
$emailBody .= "Verzonden op: " . date('d/m/Y \o\m H:i:s') . "\n";
$emailBody .= "IP Adres: " . $_SERVER['REMOTE_ADDR'] . "\n";
$emailBody .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Onbekend') . "\n";

// Email headers
$headers = [];
$headers[] = 'From: ' . FROM_EMAIL;
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'X-Mailer: PHP/' . phpversion();
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';

// Send email
$mailSent = mail(ADMIN_EMAIL, $emailSubject, $emailBody, implode("\r\n", $headers));

if ($mailSent) {
    // Update rate limiting file
    file_put_contents($ipFile, $currentTime);

    // Send success response
    sendResponse(true, 'Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.');
} else {
    // Log error
    logError("Failed to send email from {$email}");

    // Send error response
    sendResponse(false, 'Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het later opnieuw.', 500);
}

// ===============================================
// AUTO-REPLY (OPTIONEEL)
// ===============================================

/**
 * Uncomment onderstaande code om een automatisch antwoord te sturen naar de afzender
 */

/*
$autoReplySubject = "Bedankt voor uw bericht - " . SITE_NAME;

$autoReplyBody = "Beste {$name},\n\n";
$autoReplyBody .= "Bedankt voor uw bericht aan " . SITE_NAME . ".\n\n";
$autoReplyBody .= "We hebben uw bericht goed ontvangen en zullen zo snel mogelijk reageren.\n\n";
$autoReplyBody .= "Dit is een automatisch bericht, gelieve hier niet op te antwoorden.\n\n";
$autoReplyBody .= "Met vriendelijke groet,\n";
$autoReplyBody .= SITE_NAME . "\n";

$autoReplyHeaders = [];
$autoReplyHeaders[] = 'From: ' . FROM_EMAIL;
$autoReplyHeaders[] = 'X-Mailer: PHP/' . phpversion();
$autoReplyHeaders[] = 'MIME-Version: 1.0';
$autoReplyHeaders[] = 'Content-Type: text/plain; charset=UTF-8';

mail($email, $autoReplySubject, $autoReplyBody, implode("\r\n", $autoReplyHeaders));
*/

?>
