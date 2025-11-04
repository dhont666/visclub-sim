-- =============================================================================
-- VISCLUB SiM DATABASE SCHEMA
-- =============================================================================
-- PostgreSQL/Supabase schema for fishing club management
-- Lower score wins: 1st place = 1 point, absent = 50 points

-- =============================================================================
-- TABLES
-- =============================================================================

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    member_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    postal_code VARCHAR(10),
    city VARCHAR(100),
    birth_date DATE,
    is_veteran BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    join_date DATE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255) DEFAULT 'Wedstrijdvijver SiM',
    type VARCHAR(50), -- 'club', 'veteran', 'special'
    counts_for_club_ranking BOOLEAN DEFAULT true,
    counts_for_veteran_ranking BOOLEAN DEFAULT false,
    registration_deadline TIMESTAMPTZ,
    max_participants INTEGER,
    entry_fee DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    weather_conditions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations
CREATE TABLE IF NOT EXISTS registrations (
    id BIGSERIAL PRIMARY KEY,
    competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled, waitlist
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, refunded
    payment_date TIMESTAMPTZ,
    payment_method VARCHAR(50), -- cash, bank_transfer, online
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, member_id)
);

-- Competition Results
CREATE TABLE IF NOT EXISTS results (
    id BIGSERIAL PRIMARY KEY,
    competition_id BIGINT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position > 0),
    points INTEGER NOT NULL CHECK (points > 0),
    weight_kg DECIMAL(10, 3), -- Total weight in kg (3 decimals for precision)
    fish_count INTEGER DEFAULT 0 CHECK (fish_count >= 0),
    largest_fish_kg DECIMAL(10, 3),
    is_absent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(competition_id, member_id),
    UNIQUE(competition_id, position)
);

-- Permits (Visvergunningen)
CREATE TABLE IF NOT EXISTS permits (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT REFERENCES members(id) ON DELETE SET NULL,
    application_date TIMESTAMPTZ DEFAULT NOW(),
    permit_type VARCHAR(50) NOT NULL, -- 'annual', 'daily', 'special'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
    approval_date TIMESTAMPTZ,
    approved_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    fee_amount DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    payment_date TIMESTAMPTZ,
    permit_number VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived
    replied_at TIMESTAMPTZ,
    replied_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    reply_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_members_veteran ON members(is_veteran) WHERE is_veteran = true;
CREATE INDEX IF NOT EXISTS idx_members_member_number ON members(member_number);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(last_name, first_name);

-- Competitions indexes
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date DESC);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_club_ranking ON competitions(counts_for_club_ranking) WHERE counts_for_club_ranking = true;
CREATE INDEX IF NOT EXISTS idx_competitions_veteran_ranking ON competitions(counts_for_veteran_ranking) WHERE counts_for_veteran_ranking = true;

-- Registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_competition ON registrations(competition_id);
CREATE INDEX IF NOT EXISTS idx_registrations_member ON registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment ON registrations(payment_status);

-- Results indexes
CREATE INDEX IF NOT EXISTS idx_results_competition ON results(competition_id);
CREATE INDEX IF NOT EXISTS idx_results_member ON results(member_id);
CREATE INDEX IF NOT EXISTS idx_results_position ON results(position);
CREATE INDEX IF NOT EXISTS idx_results_points ON results(points);

-- Permits indexes
CREATE INDEX IF NOT EXISTS idx_permits_member ON permits(member_id);
CREATE INDEX IF NOT EXISTS idx_permits_status ON permits(status);
CREATE INDEX IF NOT EXISTS idx_permits_dates ON permits(start_date, end_date);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);

-- =============================================================================
-- VIEWS FOR RANKINGS
-- =============================================================================

-- Club Ranking (best 15 out of 20 competitions)
CREATE OR REPLACE VIEW club_ranking AS
WITH member_results AS (
    SELECT
        r.member_id,
        m.first_name,
        m.last_name,
        m.member_number,
        r.competition_id,
        r.points,
        c.date AS competition_date,
        ROW_NUMBER() OVER (PARTITION BY r.member_id ORDER BY r.points ASC) as rank_within_member
    FROM results r
    JOIN members m ON r.member_id = m.id
    JOIN competitions c ON r.competition_id = c.id
    WHERE c.counts_for_club_ranking = true
      AND c.status = 'completed'
      AND m.is_active = true
      AND r.is_absent = false
),
best_results AS (
    SELECT
        member_id,
        first_name,
        last_name,
        member_number,
        points,
        competition_date
    FROM member_results
    WHERE rank_within_member <= 15
)
SELECT
    member_id,
    first_name || ' ' || last_name AS member_name,
    member_number,
    SUM(points) as total_points,
    COUNT(*) as competitions_counted,
    ROUND(AVG(points)::numeric, 2) as avg_points,
    MIN(points) as best_score,
    MAX(points) as worst_score,
    ROW_NUMBER() OVER (ORDER BY SUM(points) ASC) as ranking_position
FROM best_results
GROUP BY member_id, first_name, last_name, member_number
HAVING COUNT(*) >= 10  -- At least 10 competitions to be ranked
ORDER BY total_points ASC, avg_points ASC;

-- Veteran Ranking (all competitions count)
CREATE OR REPLACE VIEW veteran_ranking AS
SELECT
    m.id as member_id,
    m.first_name || ' ' || m.last_name AS member_name,
    m.member_number,
    SUM(r.points) as total_points,
    COUNT(*) as competitions_count,
    ROUND(AVG(r.points)::numeric, 2) as avg_points,
    MIN(r.points) as best_score,
    MAX(r.points) as worst_score,
    ROW_NUMBER() OVER (ORDER BY SUM(r.points) ASC) as ranking_position
FROM members m
JOIN results r ON m.id = r.member_id
JOIN competitions c ON r.competition_id = c.id
WHERE m.is_veteran = true
  AND m.is_active = true
  AND c.counts_for_veteran_ranking = true
  AND c.status = 'completed'
  AND r.is_absent = false
GROUP BY m.id, m.first_name, m.last_name, m.member_number
HAVING COUNT(*) >= 5  -- At least 5 competitions to be ranked
ORDER BY total_points ASC, avg_points ASC;

-- Recent Competition Results
CREATE OR REPLACE VIEW recent_results AS
SELECT
    c.id as competition_id,
    c.name as competition_name,
    c.date as competition_date,
    c.location,
    json_agg(
        json_build_object(
            'position', r.position,
            'member_name', m.first_name || ' ' || m.last_name,
            'member_number', m.member_number,
            'points', r.points,
            'weight_kg', r.weight_kg,
            'fish_count', r.fish_count
        ) ORDER BY r.position ASC
    ) as results
FROM competitions c
JOIN results r ON c.id = r.competition_id
JOIN members m ON r.member_id = m.id
WHERE c.status = 'completed'
GROUP BY c.id, c.name, c.date, c.location
ORDER BY c.date DESC
LIMIT 10;

-- Upcoming Competitions with Registration Count
CREATE OR REPLACE VIEW upcoming_competitions AS
SELECT
    c.id,
    c.name,
    c.date,
    c.start_time,
    c.location,
    c.type,
    c.registration_deadline,
    c.max_participants,
    c.entry_fee,
    COUNT(r.id) as registered_count,
    c.max_participants - COUNT(r.id) as spots_remaining,
    CASE
        WHEN COUNT(r.id) >= c.max_participants THEN true
        ELSE false
    END as is_full
FROM competitions c
LEFT JOIN registrations r ON c.id = r.competition_id
    AND r.status IN ('pending', 'confirmed')
WHERE c.date >= CURRENT_DATE
  AND c.status = 'scheduled'
GROUP BY c.id, c.name, c.date, c.start_time, c.location, c.type,
         c.registration_deadline, c.max_participants, c.entry_fee
ORDER BY c.date ASC;

-- Member Statistics
CREATE OR REPLACE VIEW member_statistics AS
SELECT
    m.id as member_id,
    m.first_name || ' ' || m.last_name AS member_name,
    m.member_number,
    m.is_veteran,
    COUNT(DISTINCT r.competition_id) as total_competitions,
    COUNT(DISTINCT CASE WHEN r.position = 1 THEN r.competition_id END) as first_places,
    COUNT(DISTINCT CASE WHEN r.position <= 3 THEN r.competition_id END) as podium_finishes,
    ROUND(AVG(r.points)::numeric, 2) as avg_points,
    MIN(r.points) as best_score,
    SUM(r.weight_kg) as total_weight_kg,
    SUM(r.fish_count) as total_fish_caught,
    MAX(r.largest_fish_kg) as personal_best_fish_kg
FROM members m
LEFT JOIN results r ON m.id = r.member_id
WHERE m.is_active = true
GROUP BY m.id, m.first_name, m.last_name, m.member_number, m.is_veteran;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON competitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permits_updated_at BEFORE UPDATE ON permits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate member ranking position
CREATE OR REPLACE FUNCTION get_member_ranking(p_member_id BIGINT, p_ranking_type VARCHAR DEFAULT 'club')
RETURNS TABLE(
    ranking_position INTEGER,
    total_points INTEGER,
    competitions_counted INTEGER,
    avg_points NUMERIC
) AS $$
BEGIN
    IF p_ranking_type = 'veteran' THEN
        RETURN QUERY
        SELECT
            vr.ranking_position::INTEGER,
            vr.total_points::INTEGER,
            vr.competitions_count::INTEGER,
            vr.avg_points
        FROM veteran_ranking vr
        WHERE vr.member_id = p_member_id;
    ELSE
        RETURN QUERY
        SELECT
            cr.ranking_position::INTEGER,
            cr.total_points::INTEGER,
            cr.competitions_counted::INTEGER,
            cr.avg_points
        FROM club_ranking cr
        WHERE cr.member_id = p_member_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to register member for competition with validation
CREATE OR REPLACE FUNCTION register_for_competition(
    p_competition_id BIGINT,
    p_member_id BIGINT,
    p_payment_status VARCHAR DEFAULT 'unpaid'
)
RETURNS JSONB AS $$
DECLARE
    v_registration_id BIGINT;
    v_current_registrations INTEGER;
    v_max_participants INTEGER;
    v_registration_deadline TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- Get competition details
    SELECT max_participants, registration_deadline
    INTO v_max_participants, v_registration_deadline
    FROM competitions
    WHERE id = p_competition_id;

    -- Check if competition exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Competition not found'
        );
    END IF;

    -- Check registration deadline
    IF v_registration_deadline IS NOT NULL AND NOW() > v_registration_deadline THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Registration deadline has passed'
        );
    END IF;

    -- Check if competition is full
    SELECT COUNT(*)
    INTO v_current_registrations
    FROM registrations
    WHERE competition_id = p_competition_id
      AND status IN ('pending', 'confirmed');

    IF v_max_participants IS NOT NULL AND v_current_registrations >= v_max_participants THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Competition is full',
            'registered', v_current_registrations,
            'max', v_max_participants
        );
    END IF;

    -- Insert registration
    INSERT INTO registrations (competition_id, member_id, payment_status, status)
    VALUES (p_competition_id, p_member_id, p_payment_status, 'confirmed')
    RETURNING id INTO v_registration_id;

    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_registration_id,
        'spots_remaining', v_max_participants - v_current_registrations - 1
    );

EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Already registered for this competition'
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEED DATA (optional - for testing)
-- =============================================================================

-- Insert default admin user (password: admin123)
-- Password hash generated with: bcrypt.hash('admin123', 10)
INSERT INTO admin_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@visclubsim.be',
    '$2b$10$rW8E7Y0szqeF/NX5r7mMYO.LLXwXJvVZqrLvqLp5pLO9VQy.6rGKS',
    'Administrator',
    'superadmin'
) ON CONFLICT (username) DO NOTHING;

-- Sample member (for testing)
INSERT INTO members (member_number, first_name, last_name, email, is_active)
VALUES ('001', 'Test', 'Member', 'test@visclubsim.be', true)
ON CONFLICT (member_number) DO NOTHING;

COMMENT ON TABLE admin_users IS 'Admin users with authentication credentials';
COMMENT ON TABLE members IS 'Club members and their information';
COMMENT ON TABLE competitions IS 'Fishing competitions and events';
COMMENT ON TABLE registrations IS 'Member registrations for competitions';
COMMENT ON TABLE results IS 'Competition results and scores';
COMMENT ON TABLE permits IS 'Fishing permit applications and approvals';
COMMENT ON TABLE contact_messages IS 'Contact form submissions';

COMMENT ON VIEW club_ranking IS 'Club ranking based on best 15 out of 20 competitions';
COMMENT ON VIEW veteran_ranking IS 'Veteran ranking with all competitions counted';
COMMENT ON VIEW recent_results IS 'Recent competition results with winners';
COMMENT ON VIEW upcoming_competitions IS 'Upcoming competitions with registration info';
COMMENT ON VIEW member_statistics IS 'Comprehensive member performance statistics';
