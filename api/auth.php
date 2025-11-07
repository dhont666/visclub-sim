<?php
/**
 * Visclub SiM - JWT Authentication Helper
 * JWT token generation and validation
 */

class Auth {
    private static $config = null;

    public static function init() {
        // Only load config once (cached)
        if (self::$config === null) {
            self::$config = require __DIR__ . '/config.php';
        }
    }

    /**
     * Generate JWT token
     */
    public static function generateToken($payload) {
        self::init();

        $header = json_encode(['typ' => 'JWT', 'alg' => self::$config['jwt']['algorithm']]);
        $payload = json_encode(array_merge($payload, [
            'iat' => time(),
            'exp' => time() + self::$config['jwt']['expiration']
        ]));

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            self::$config['jwt']['secret'],
            true
        );
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Verify JWT token
     */
    public static function verifyToken($token) {
        self::init();

        if (empty($token)) {
            return false;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($header, $payload, $signature) = $parts;

        // Verify signature
        $validSignature = hash_hmac(
            'sha256',
            $header . "." . $payload,
            self::$config['jwt']['secret'],
            true
        );
        $base64UrlSignature = self::base64UrlEncode($validSignature);

        if ($signature !== $base64UrlSignature) {
            return false;
        }

        // Decode payload
        $payloadData = json_decode(self::base64UrlDecode($payload), true);

        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Get token from Authorization header
     */
    public static function getBearerToken() {
        $headers = self::getAuthorizationHeader();

        if (!empty($headers)) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Get Authorization header
     */
    private static function getAuthorizationHeader() {
        $headers = null;

        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );

            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        return $headers;
    }

    /**
     * Verify password hash
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Hash password
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    /**
     * Middleware: Require authentication
     */
    public static function requireAuth() {
        $token = self::getBearerToken();
        $payload = self::verifyToken($token);

        if (!$payload) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Unauthorized - Invalid or expired token'
            ]);
            exit;
        }

        return $payload;
    }
}
