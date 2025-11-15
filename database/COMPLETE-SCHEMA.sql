-- ============================================================================
-- VISCLUB SIM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This is the COMPLETE schema for the Visclub SiM website
-- Generated based on API endpoints in api/index.php
--
-- IMPORTANT: Run this in phpMyAdmin to create all necessary tables
-- ============================================================================

-- Database setup
CREATE DATABASE IF NOT EXISTS `visclubsim` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `visclubsim`;

-- ============================================================================
-- 1. ADMIN USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `full_name` VARCHAR(100),
  `role` VARCHAR(20) DEFAULT 'admin',
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `members` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `member_number` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(10) DEFAULT NULL,
  `birth_date` DATE DEFAULT NULL,
  `is_veteran` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `joined_at` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_member_number` (`member_number`),
  INDEX `idx_name` (`name`),
  INDEX `idx_email` (`email`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_is_veteran` (`is_veteran`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. COMPETITIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `competitions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'upcoming',
  `counts_for_club_ranking` TINYINT(1) DEFAULT 1,
  `counts_for_veteran_ranking` TINYINT(1) DEFAULT 1,
  `max_participants` INT(11) DEFAULT NULL,
  `registration_deadline` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. RESULTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `results` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) NOT NULL,
  `member_id` INT(11) NOT NULL,
  `points` INT(11) NOT NULL,
  `weight` DECIMAL(10,2) DEFAULT NULL,
  `fish_count` INT(11) DEFAULT 0,
  `is_absent` TINYINT(1) DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_competition_member` (`competition_id`, `member_id`),
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_points` (`points`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. REGISTRATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `competition_id` INT(11) NOT NULL,
  `member_id` INT(11) NOT NULL,
  `status` VARCHAR(20) DEFAULT 'registered',
  `payment_status` VARCHAR(20) DEFAULT 'pending',
  `payment_date` DATETIME DEFAULT NULL,
  `payment_amount` DECIMAL(10,2) DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `registration_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_competition_id` (`competition_id`),
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. PUBLIC REGISTRATIONS TABLE (from public website)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `public_registrations` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `partner_first_name` VARCHAR(100) DEFAULT NULL,
  `partner_last_name` VARCHAR(100) DEFAULT NULL,
  `competition_date` VARCHAR(50) NOT NULL,
  `competition_name` VARCHAR(255) NOT NULL,
  `registration_type` VARCHAR(20) DEFAULT 'solo',
  `payment_method` VARCHAR(50) DEFAULT 'qr',
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `amount` VARCHAR(20) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `payment_status` VARCHAR(20) DEFAULT 'pending',
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_competition_date` (`competition_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. PERMITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `permits` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `applicant_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `permit_type` VARCHAR(50) DEFAULT 'algemeen',
  `member_id` INT(11) DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `approved_by` VARCHAR(100) DEFAULT NULL,
  `approved_date` DATETIME DEFAULT NULL,
  `rejected_by` VARCHAR(100) DEFAULT NULL,
  `rejected_date` DATETIME DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `application_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_application_date` (`application_date`),
  FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. CONTACT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'unread',
  `reply_message` TEXT DEFAULT NULL,
  `replied_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. VIEWS FOR RANKINGS
-- ============================================================================

-- Club Ranking View (best 15 out of 20 competitions)
DROP VIEW IF EXISTS `club_ranking`;
CREATE VIEW `club_ranking` AS
SELECT
    m.id,
    m.name,
    m.member_number,
    COUNT(r.id) as competitions_participated,
    SUM(r.points) as total_points_all,
    (
        SELECT SUM(points)
        FROM (
            SELECT points
            FROM results r2
            INNER JOIN competitions c2 ON r2.competition_id = c2.id
            WHERE r2.member_id = m.id
            AND c2.counts_for_club_ranking = 1
            AND r2.is_absent = 0
            ORDER BY points ASC
            LIMIT 15
        ) as best_15
    ) as total_points_best_15,
    (
        SELECT COUNT(*)
        FROM results r2
        INNER JOIN competitions c2 ON r2.competition_id = c2.id
        WHERE r2.member_id = m.id
        AND c2.counts_for_club_ranking = 1
        AND r2.is_absent = 0
    ) as valid_competitions
FROM members m
LEFT JOIN results r ON m.id = r.member_id
LEFT JOIN competitions c ON r.competition_id = c.id AND c.counts_for_club_ranking = 1
WHERE m.is_active = 1
GROUP BY m.id, m.name, m.member_number
HAVING valid_competitions > 0
ORDER BY total_points_best_15 ASC, total_points_all ASC;

-- Veteran Ranking View (all competitions count)
DROP VIEW IF EXISTS `veteran_ranking`;
CREATE VIEW `veteran_ranking` AS
SELECT
    m.id,
    m.name,
    m.member_number,
    COUNT(r.id) as competitions_participated,
    SUM(CASE WHEN r.is_absent = 0 THEN r.points ELSE 0 END) as total_points
FROM members m
INNER JOIN results r ON m.id = r.member_id
INNER JOIN competitions c ON r.competition_id = c.id
WHERE m.is_veteran = 1
AND m.is_active = 1
AND c.counts_for_veteran_ranking = 1
GROUP BY m.id, m.name, m.member_number
HAVING competitions_participated > 0
ORDER BY total_points ASC;

-- Recent Results View (for dashboard)
DROP VIEW IF EXISTS `recent_results`;
CREATE VIEW `recent_results` AS
SELECT
    r.id,
    r.competition_id,
    r.member_id,
    r.points,
    r.weight,
    r.fish_count,
    r.is_absent,
    m.name as member_name,
    m.member_number,
    c.name as competition_name,
    c.date as competition_date
FROM results r
INNER JOIN members m ON r.member_id = m.id
INNER JOIN competitions c ON r.competition_id = c.id
ORDER BY c.date DESC, r.points ASC
LIMIT 100;

-- Member Statistics View
DROP VIEW IF EXISTS `member_statistics`;
CREATE VIEW `member_statistics` AS
SELECT
    m.id,
    m.name as member_name,
    m.member_number,
    COUNT(r.id) as total_competitions,
    COUNT(CASE WHEN r.is_absent = 0 THEN 1 END) as competitions_attended,
    SUM(CASE WHEN r.is_absent = 0 THEN r.points ELSE 0 END) as total_points,
    AVG(CASE WHEN r.is_absent = 0 THEN r.points ELSE NULL END) as average_points,
    SUM(CASE WHEN r.weight IS NOT NULL THEN r.weight ELSE 0 END) as total_weight,
    SUM(r.fish_count) as total_fish,
    COUNT(CASE WHEN r.points = 1 THEN 1 END) as first_places,
    COUNT(CASE WHEN r.points = 2 THEN 1 END) as second_places,
    COUNT(CASE WHEN r.points = 3 THEN 1 END) as third_places
FROM members m
LEFT JOIN results r ON m.id = r.member_id
WHERE m.is_active = 1
GROUP BY m.id, m.name, m.member_number
ORDER BY m.name;

-- Upcoming Competitions View
DROP VIEW IF EXISTS `upcoming_competitions`;
CREATE VIEW `upcoming_competitions` AS
SELECT
    c.*,
    COUNT(reg.id) as registration_count
FROM competitions c
LEFT JOIN registrations reg ON c.id = reg.competition_id
WHERE c.status = 'upcoming' OR c.date >= CURDATE()
GROUP BY c.id
ORDER BY c.date ASC
LIMIT 10;

-- ============================================================================
-- 10. INSERT DEFAULT ADMIN USERS
-- ============================================================================
-- Delete existing test users
DELETE FROM `admin_users` WHERE `username` IN ('kevin.dhont', 'kevin.vandun', 'maarten.borghs', 'admin', 'visclub');

-- Insert admin users with bcrypt hashed passwords
-- IMPORTANT: These passwords should be changed after first login!
INSERT INTO `admin_users` (`username`, `password_hash`, `email`, `full_name`, `role`) VALUES
('kevin.dhont', '$2y$10$YPemT.L4vEQxMHu6Z.LXIuFKB8qGLxQr0wN8JE3yK5xqF7ZJLqYGe', 'kevin.dhont@visclubsim.be', 'Kevin Dhont', 'admin'),
('kevin.vandun', '$2y$10$8ZKxvHXMqZzF0cqNGw5sEuPJYL3HqVNXqKdZ9wFqL5xJKqYGe8xOe', 'kevin.vandun@visclubsim.be', 'Kevin van dun', 'admin'),
('maarten.borghs', '$2y$10$3KxpHQMzFqL5JcqNGw9sEuYJL6HqVZXqKdW9wFqM7xJKqYGe9xPe', 'maarten.borghs@visclubsim.be', 'Maarten Borghs', 'admin');

-- ============================================================================
-- 11. SAMPLE DATA (OPTIONAL - for testing)
-- ============================================================================
-- Uncomment below to insert test data

-- Sample Members
-- INSERT INTO `members` (`name`, `member_number`, `email`, `is_veteran`, `is_active`) VALUES
-- ('Jan Janssen', 'M001', 'jan.janssen@example.com', 0, 1),
-- ('Piet Pieters', 'M002', 'piet.pieters@example.com', 1, 1),
-- ('Koen Koens', 'M003', 'koen.koens@example.com', 0, 1);

-- Sample Competition
-- INSERT INTO `competitions` (`name`, `date`, `location`, `status`) VALUES
-- ('Voorjaarswedstrijd 2026', '2026-03-15', 'Vijver De Plas', 'upcoming');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the schema was created correctly

SELECT 'admin_users table' as table_name, COUNT(*) as row_count FROM admin_users
UNION ALL
SELECT 'members table', COUNT(*) FROM members
UNION ALL
SELECT 'competitions table', COUNT(*) FROM competitions
UNION ALL
SELECT 'results table', COUNT(*) FROM results
UNION ALL
SELECT 'registrations table', COUNT(*) FROM registrations
UNION ALL
SELECT 'public_registrations table', COUNT(*) FROM public_registrations
UNION ALL
SELECT 'permits table', COUNT(*) FROM permits
UNION ALL
SELECT 'contact_messages table', COUNT(*) FROM contact_messages;

-- Show all tables
SHOW TABLES;

-- Show all views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- ============================================================================
-- DONE!
-- ============================================================================
-- Database schema is complete. All tables, views, and indexes are created.
--
-- NEXT STEPS:
-- 1. Update api/config.php with your database credentials
-- 2. Test the API endpoints
-- 3. Login to admin panel and change default passwords
-- 4. Add your member data
-- ============================================================================
