<?php
/**
 * VISCLUB SIM - Password Hash Generator
 *
 * INSTRUCTIONS:
 * 1. Upload this file to: public_html/generate-admin-hashes.php
 * 2. Visit: https://www.visclubsim.be/generate-admin-hashes.php
 * 3. Copy the SQL INSERT statements
 * 4. Run them in phpMyAdmin
 * 5. DELETE this file immediately after use!
 *
 * SECURITY WARNING: Delete this file after use!
 */

header('Content-Type: text/plain; charset=utf-8');

echo "═══════════════════════════════════════════════════════════════\n";
echo "VISCLUB SIM - ADMIN PASSWORD HASH GENERATOR\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

// Admin users with their passwords
$users = [
    [
        'username' => 'kevin.dhont',
        'password' => 'KevinDhont2026!',
        'email' => 'kevin.dhont@visclubsim.be',
        'full_name' => 'Kevin Dhont'
    ],
    [
        'username' => 'kevin.vandun',
        'password' => 'KevinVD2026!',
        'email' => 'kevin.vandun@visclubsim.be',
        'full_name' => 'Kevin van dun'
    ],
    [
        'username' => 'maarten.borghs',
        'password' => 'MaartenB2026!',
        'email' => 'maarten.borghs@visclubsim.be',
        'full_name' => 'Maarten Borghs'
    ]
];

echo "STEP 1: Delete existing users\n";
echo "────────────────────────────────────────────────────────────────\n";
echo "DELETE FROM admin_users WHERE username IN ('kevin.dhont', 'kevin.vandun', 'maarten.borghs');\n\n";

echo "STEP 2: Insert new users with hashed passwords\n";
echo "────────────────────────────────────────────────────────────────\n";

foreach ($users as $user) {
    $hash = password_hash($user['password'], PASSWORD_BCRYPT);

    echo "-- User: {$user['username']} | Password: {$user['password']}\n";
    echo "INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active) VALUES\n";
    echo "('{$user['username']}', '{$hash}', '{$user['email']}', '{$user['full_name']}', 'admin', 1);\n\n";
}

echo "STEP 3: Verify users were created\n";
echo "────────────────────────────────────────────────────────────────\n";
echo "SELECT id, username, email, full_name, role, is_active, created_at FROM admin_users;\n\n";

echo "═══════════════════════════════════════════════════════════════\n";
echo "DONE!\n";
echo "═══════════════════════════════════════════════════════════════\n\n";

echo "NEXT STEPS:\n";
echo "1. Copy ALL the SQL statements above\n";
echo "2. Go to phpMyAdmin\n";
echo "3. Click 'SQL' tab\n";
echo "4. Paste the statements\n";
echo "5. Click 'Go'\n";
echo "6. DELETE this file: generate-admin-hashes.php\n\n";

echo "LOGIN CREDENTIALS:\n";
foreach ($users as $user) {
    echo "  Username: {$user['username']}  |  Password: {$user['password']}\n";
}

echo "\n⚠️  WARNING: DELETE THIS FILE AFTER USE! ⚠️\n";
echo "This file contains sensitive password information!\n";
?>
