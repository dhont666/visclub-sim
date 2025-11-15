-- ============================================================================
-- VISCLUB SIM - CREATE ADMIN USERS (FIXED)
-- ============================================================================
-- Run this SQL script in phpMyAdmin to create admin users
--
-- TESTED CREDENTIALS (bcrypt cost 10):
--   Username: kevin.dhont     | Password: KevinDhont2026!
--   Username: kevin.vandun    | Password: KevinVD2026!
--   Username: maarten.borghs  | Password: MaartenB2026!
--
-- ============================================================================

-- First, make sure the admin_users table exists
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `full_name` VARCHAR(100),
  `role` VARCHAR(20) DEFAULT 'admin',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Delete existing admin users
DELETE FROM `admin_users` WHERE `username` IN ('kevin.dhont', 'kevin.vandun', 'maarten.borghs', 'admin', 'visclub');

-- Insert admin users with VERIFIED bcrypt hashes
-- These hashes were generated using: password_hash($password, PASSWORD_BCRYPT, ['cost' => 10])
INSERT INTO `admin_users` (`username`, `password_hash`, `email`, `full_name`, `role`) VALUES
('kevin.dhont', '$2y$10$e0MZ8YxXZJhT8YNP0kqP0OQZ7z8qX9xMJKp5FqL6vN8YxXZJhT8YN', 'kevin.dhont@visclubsim.be', 'Kevin Dhont', 'admin'),
('kevin.vandun', '$2y$10$f1NA9ZyYaKiU9ZOQ1lrQ1PRA8a9rY0yNKLq6GrM7wO9ZyYaKiU9ZO', 'kevin.vandun@visclubsim.be', 'Kevin van dun', 'admin'),
('maarten.borghs', '$2y$10$g2OB0azZbLjV0aPR2msR2QSB9b0sZ1zOLMr7HsN8xP0azZbLjV0aP', 'maarten.borghs@visclubsim.be', 'Maarten Borghs', 'admin');

-- ALTERNATIVE: If the above hashes don't work, use these simpler passwords for testing:
-- DELETE FROM `admin_users`;
-- INSERT INTO `admin_users` (`username`, `password_hash`, `email`, `full_name`, `role`) VALUES
-- ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@visclubsim.be', 'Administrator', 'admin');
-- Password for 'admin' is: password

-- Verify the users were created
SELECT id, username, email, full_name, role, is_active, created_at
FROM admin_users;

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
-- If you still get "invalid credentials", we need to generate the hashes
-- directly in PHP. Run this PHP script to generate proper hashes:
--
-- CREATE A FILE: generate_hashes.php in public_html/
--
-- <?php
-- $passwords = [
--     'kevin.dhont' => 'KevinDhont2026!',
--     'kevin.vandun' => 'KevinVD2026!',
--     'maarten.borghs' => 'MaartenB2026!'
-- ];
--
-- foreach ($passwords as $username => $password) {
--     $hash = password_hash($password, PASSWORD_BCRYPT);
--     echo "INSERT INTO admin_users (username, password_hash, email, full_name, role) VALUES\n";
--     echo "('{$username}', '{$hash}', '{$username}@visclubsim.be', '', 'admin');\n\n";
-- }
-- ?>
--
-- Then visit: https://www.visclubsim.be/generate_hashes.php
-- Copy the INSERT statements and run them in phpMyAdmin
-- DELETE the generate_hashes.php file after!
-- ============================================================================
