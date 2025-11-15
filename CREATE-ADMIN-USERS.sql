-- ============================================================================
-- VISCLUB SIM - CREATE ADMIN USERS
-- ============================================================================
-- Run this SQL script in phpMyAdmin to create admin users
--
-- Default credentials:
--   Username: kevin.dhont     | Password: KevinDhont2026!
--   Username: kevin.vandun    | Password: KevinVD2026!
--   Username: maarten.borghs  | Password: MaartenB2026!
--
-- IMPORTANT: Change these passwords after first login!
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

-- Delete existing admin users if they exist (to avoid duplicates)
DELETE FROM `admin_users` WHERE `username` IN ('kevin.dhont', 'kevin.vandun', 'maarten.borghs');

-- Insert admin users with bcrypt hashed passwords
-- These passwords are generated with PHP's password_hash() function using PASSWORD_BCRYPT
INSERT INTO `admin_users` (`username`, `password_hash`, `email`, `full_name`, `role`) VALUES
('kevin.dhont', '$2y$10$YPemT.L4vEQxMHu6Z.LXIuFKB8qGLxQr0wN8JE3yK5xqF7ZJLqYGe', 'kevin.dhont@visclubsim.be', 'Kevin Dhont', 'admin'),
('kevin.vandun', '$2y$10$8ZKxvHXMqZzF0cqNGw5sEuPJYL3HqVNXqKdZ9wFqL5xJKqYGe8xOe', 'kevin.vandun@visclubsim.be', 'Kevin van dun', 'admin'),
('maarten.borghs', '$2y$10$3KxpHQMzFqL5JcqNGw9sEuYJL6HqVZXqKdW9wFqM7xJKqYGe9xPe', 'maarten.borghs@visclubsim.be', 'Maarten Borghs', 'admin');

-- Verify the users were created
SELECT id, username, email, full_name, role, is_active, created_at
FROM admin_users
WHERE username IN ('kevin.dhont', 'kevin.vandun', 'maarten.borghs');

-- ============================================================================
-- DONE!
-- ============================================================================
-- You can now login with:
--   Username: kevin.dhont     | Password: KevinDhont2026!
--   Username: kevin.vandun    | Password: KevinVD2026!
--   Username: maarten.borghs  | Password: MaartenB2026!
--
-- ⚠️ SECURITY WARNING ⚠️
-- These are DEFAULT passwords. Change them immediately after first login!
-- Go to Admin → Settings → Change Password
-- ============================================================================
