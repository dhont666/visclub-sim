-- =============================================================================
-- VISCLUB SIM - MySQL DATABASE SCHEMA
-- =============================================================================
-- Converted from PostgreSQL (Supabase) to MySQL
-- For use with Cloud86 shared hosting
-- =============================================================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS public_registrations;
DROP TABLE IF EXISTS permits;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS competitions;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS admin_users;

-- =============================================================================
-- TABLE 1: ADMIN USERS
-- =============================================================================
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 2: MEMBERS
-- =============================================================================
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    member_number VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    birth_date DATE,
    is_veteran BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_member_number (member_number),
    INDEX idx_active (is_active),
    INDEX idx_veteran (is_veteran),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 3: COMPETITIONS
-- =============================================================================
CREATE TABLE competitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(200),
    description TEXT,
    status VARCHAR(20) DEFAULT 'upcoming',
    counts_for_club_ranking BOOLEAN DEFAULT TRUE,
    counts_for_veteran_ranking BOOLEAN DEFAULT TRUE,
    max_participants INT,
    registration_deadline DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_club_ranking (counts_for_club_ranking),
    INDEX idx_veteran_ranking (counts_for_veteran_ranking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 4: RESULTS
-- =============================================================================
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    competition_id INT NOT NULL,
    member_id INT NOT NULL,
    points INT NOT NULL,
    weight DECIMAL(10,3),
    fish_count INT DEFAULT 0,
    is_absent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_competition_member (competition_id, member_id),
    INDEX idx_competition (competition_id),
    INDEX idx_member (member_id),
    INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 5: REGISTRATIONS
-- =============================================================================
CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    competition_id INT NOT NULL,
    member_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered',
    payment_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (competition_id, member_id),
    INDEX idx_competition (competition_id),
    INDEX idx_member (member_id),
    INDEX idx_status (status),
    INDEX idx_payment (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 6: PERMITS
-- =============================================================================
CREATE TABLE permits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    applicant_name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    permit_type VARCHAR(50),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    approved_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_member (member_id),
    INDEX idx_status (status),
    INDEX idx_application_date (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 7: CONTACT MESSAGES (Public form submissions)
-- =============================================================================
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread',
    replied_at TIMESTAMP NULL,
    reply_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE 8: PUBLIC REGISTRATIONS (Front-end competition registrations)
-- =============================================================================
CREATE TABLE public_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    partner_first_name VARCHAR(100),
    partner_last_name VARCHAR(100),
    competition_date VARCHAR(20) NOT NULL,
    competition_name VARCHAR(255) NOT NULL,
    registration_type VARCHAR(20) DEFAULT 'solo',
    payment_method VARCHAR(20) DEFAULT 'qr',
    payment_reference VARCHAR(50),
    amount VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    remarks TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_competition_date (competition_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- VIEW 1: CLUB RANKING (Best 15 out of 20 competitions)
CREATE OR REPLACE VIEW club_ranking AS
WITH member_results AS (
    SELECT
        r.member_id,
        COALESCE(m.name, 'Unknown') AS member_name,
        m.member_number,
        r.competition_id,
        r.points,
        c.date AS competition_date,
        ROW_NUMBER() OVER (
            PARTITION BY r.member_id
            ORDER BY r.points ASC
        ) as rank_within_member
    FROM results r
    INNER JOIN members m ON r.member_id = m.id
    INNER JOIN competitions c ON r.competition_id = c.id
    WHERE
        COALESCE(c.counts_for_club_ranking, TRUE) = TRUE
        AND COALESCE(c.status, 'completed') = 'completed'
        AND m.is_active = TRUE
        AND COALESCE(r.is_absent, FALSE) = FALSE
),
best_results AS (
    SELECT
        member_id,
        member_name,
        member_number,
        points
    FROM member_results
    WHERE rank_within_member <= 15
)
SELECT
    member_id,
    member_name,
    member_number,
    SUM(points) as total_points,
    COUNT(*) as competitions_counted,
    ROUND(AVG(points), 2) as avg_points,
    MIN(points) as best_score,
    MAX(points) as worst_score,
    ROW_NUMBER() OVER (
        ORDER BY SUM(points) ASC, AVG(points) ASC
    ) as ranking_position
FROM best_results
GROUP BY member_id, member_name, member_number
HAVING COUNT(*) >= 10
ORDER BY total_points ASC, avg_points ASC;

-- VIEW 2: VETERAN RANKING (All competitions)
CREATE OR REPLACE VIEW veteran_ranking AS
SELECT
    m.id as member_id,
    COALESCE(m.name, 'Unknown') AS member_name,
    m.member_number,
    SUM(r.points) as total_points,
    COUNT(*) as competitions_count,
    ROUND(AVG(r.points), 2) as avg_points,
    MIN(r.points) as best_score,
    MAX(r.points) as worst_score,
    ROW_NUMBER() OVER (
        ORDER BY SUM(r.points) ASC, AVG(r.points) ASC
    ) as ranking_position
FROM members m
INNER JOIN results r ON m.id = r.member_id
INNER JOIN competitions c ON r.competition_id = c.id
WHERE
    m.is_veteran = TRUE
    AND m.is_active = TRUE
    AND COALESCE(c.counts_for_veteran_ranking, TRUE) = TRUE
    AND COALESCE(c.status, 'completed') = 'completed'
    AND COALESCE(r.is_absent, FALSE) = FALSE
GROUP BY m.id, m.name, m.member_number
HAVING COUNT(*) >= 5
ORDER BY total_points ASC, avg_points ASC;

-- VIEW 3: RECENT RESULTS (Last 5 competitions)
CREATE OR REPLACE VIEW recent_results AS
SELECT
    c.id as competition_id,
    c.name as competition_name,
    c.date as competition_date,
    m.id as member_id,
    COALESCE(m.name, 'Unknown') AS member_name,
    m.member_number,
    r.points,
    r.weight,
    r.fish_count,
    r.is_absent,
    ROW_NUMBER() OVER (
        PARTITION BY c.id
        ORDER BY r.points ASC
    ) as position
FROM results r
INNER JOIN competitions c ON r.competition_id = c.id
INNER JOIN members m ON r.member_id = m.id
WHERE c.id IN (
    SELECT id
    FROM competitions
    WHERE status = 'completed'
    ORDER BY date DESC
    LIMIT 5
)
ORDER BY c.date DESC, r.points ASC;

-- VIEW 4: UPCOMING COMPETITIONS (with registration counts)
CREATE OR REPLACE VIEW upcoming_competitions AS
SELECT
    c.id,
    c.name,
    c.date,
    c.location,
    c.description,
    c.max_participants,
    c.registration_deadline,
    COUNT(reg.id) as registered_count,
    CASE
        WHEN c.max_participants IS NOT NULL THEN c.max_participants - COUNT(reg.id)
        ELSE NULL
    END as spots_remaining
FROM competitions c
LEFT JOIN registrations reg ON c.id = reg.competition_id AND reg.status = 'registered'
WHERE c.date >= CURDATE()
    AND c.status IN ('upcoming', 'open')
GROUP BY c.id, c.name, c.date, c.location, c.description, c.max_participants, c.registration_deadline
ORDER BY c.date ASC;

-- VIEW 5: MEMBER STATISTICS (comprehensive stats per member)
CREATE OR REPLACE VIEW member_statistics AS
SELECT
    m.id as member_id,
    COALESCE(m.name, 'Unknown') AS member_name,
    m.member_number,
    m.is_veteran,
    COUNT(DISTINCT r.competition_id) as competitions_participated,
    SUM(CASE WHEN r.points = 1 THEN 1 ELSE 0 END) as first_place_count,
    SUM(CASE WHEN r.points <= 3 THEN 1 ELSE 0 END) as top_three_count,
    ROUND(AVG(r.points), 2) as avg_points,
    MIN(r.points) as best_score,
    MAX(r.points) as worst_score,
    SUM(COALESCE(r.weight, 0)) as total_weight_caught,
    ROUND(AVG(COALESCE(r.weight, 0)), 3) as avg_weight_per_competition,
    SUM(COALESCE(r.fish_count, 0)) as total_fish_caught,
    SUM(CASE WHEN r.is_absent = TRUE THEN 1 ELSE 0 END) as absences
FROM members m
LEFT JOIN results r ON m.id = r.member_id
WHERE m.is_active = TRUE
GROUP BY m.id, m.name, m.member_number, m.is_veteran
ORDER BY m.name;

-- =============================================================================
-- INITIAL DATA: ADMIN USERS
-- =============================================================================
-- Admin accounts for Visclub SiM management
-- Passwords are securely hashed with bcrypt
INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active)
VALUES
    ('kevin.dhont', '$2b$12$uytyI7ZVvyBYfrdDkreG9u9cDeWgIG2g3w6dCrbWMcWwvHwl9Em9G', 'kevin.dhont@visclub-sim.be', 'Kevin Dhont', 'admin', TRUE),
    ('kevin.vandun', '$2b$12$7g3nQrRUAYIIYDNMI74r4ufQE5vsS3/zb8anikCGhr874MsIFUeGS', 'kevin.vandun@visclub-sim.be', 'Kevin van dun', 'admin', TRUE),
    ('maarten.borghs', '$2b$12$566Uf8m5ByfFjjA3PVvemOBLLSEsva/zktUuA3bnkE1U2Nhk18VWO', 'maarten.borghs@visclub-sim.be', 'Maarten Borghs', 'admin', TRUE);

-- =============================================================================
-- DONE!
-- =============================================================================
-- Next steps:
-- 1. Create MySQL database in Cloud86 Plesk
-- 2. Run this SQL file to create all tables and views
-- 3. Upload PHP API files
-- 4. Update frontend config.js with Cloud86 URL
-- =============================================================================
