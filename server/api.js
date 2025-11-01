/**
 * Visclub SiM Backend API
 * Express.js REST API with PostgreSQL database
 * Supports JWT authentication and CRUD operations
 *
 * IMPORTANT: This file is deprecated. Use server/api-supabase.js instead for better compatibility.
 */

require('dotenv').config();

// Check if we should use Supabase Client instead
if (!process.env.DATABASE_URL && (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)) {
    console.log('⚠️  DATABASE_URL not found, but SUPABASE_URL and SUPABASE_SERVICE_KEY are set');
    console.log('   Redirecting to Supabase Client API (server/api-supabase.js)');
    console.log('   This uses HTTPS and works on all platforms!\n');
    require('./api-supabase.js');
    return;
}

if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('');
    console.error('Options:');
    console.error('  1. Set DATABASE_URL for direct PostgreSQL connection:');
    console.error('     DATABASE_URL=postgresql://user:pass@host:port/db');
    console.error('');
    console.error('  2. OR use Supabase Client API (recommended):');
    console.error('     SUPABASE_URL=https://xxx.supabase.co');
    console.error('     SUPABASE_SERVICE_KEY=eyJ...');
    console.error('     Then run: npm start (uses server/api-supabase.js)');
    console.error('');
    console.error('See MIGRATION-GUIDE.md for details');
    console.error('');
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        console.log('Starting server (PostgreSQL mode)...');

        // Use DATABASE_URL directly without modification
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        // Test database connection with retry logic
        let connected = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!connected && attempts < maxAttempts) {
            attempts++;
            try {
                console.log(`Database connection attempt ${attempts}/${maxAttempts}...`);
                const client = await pool.connect();
                try {
                    const res = await client.query('SELECT NOW()');
                    console.log('✅ Database connected successfully');
                    console.log('   Server time:', res.rows[0].now);
                    connected = true;
                } finally {
                    client.release();
                }
            } catch (err) {
                console.error(`❌ Database connection attempt ${attempts} failed:`, err.message);

                // Specific error handling based on error code
                if (err.code === 'ECONNREFUSED') {
                    console.error('\n🔥 CONNECTION REFUSED ERROR - Common fixes:');
                    console.error('  1. Use Supabase TRANSACTION pooler (port 6543) instead of Session pooler (port 5432)');
                    console.error('     ❌ Wrong: postgresql://...@db.xxx.supabase.co:5432/postgres');
                    console.error('     ✅ Right: postgresql://...@aws-0-eu-west-1.pooler.supabase.com:6543/postgres');
                    console.error('  2. Get connection string from: Supabase Dashboard → Database → Connection Pooling → Transaction');
                    console.error('  3. Railway/Render often block direct PostgreSQL port (5432)\n');
                } else if (err.code === '28P01') {
                    console.error('\n🔑 AUTHENTICATION ERROR:');
                    console.error('  1. Check DATABASE_URL password is correct');
                    console.error('  2. Verify you\'re using the pooler username (postgres.projectref) not just "postgres"');
                    console.error('  3. Reset database password in Supabase if needed\n');
                } else if (err.code === 'ENOTFOUND') {
                    console.error('\n🌐 DNS/NETWORK ERROR:');
                    console.error('  1. Check internet connection');
                    console.error('  2. Verify Supabase hostname is correct');
                    console.error('  3. Try different network or VPN\n');
                }

                if (attempts >= maxAttempts) {
                    console.error('\n❌ All database connection attempts failed after', maxAttempts, 'tries');
                    console.error('\nGeneral troubleshooting:');
                    console.error('  • DATABASE_URL format: postgresql://user:password@host:port/database');
                    console.error('  • Check environment variables are loaded (process.env.DATABASE_URL)');
                    console.error('  • Verify Supabase project is not paused');
                    console.error('  • Check deployment platform firewall/network settings\n');
                    process.exit(1);
                } else {
                    console.log(`   Retrying in 2 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        // =============================================
        // MIDDLEWARE
        // =============================================

        app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }));

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Request logging
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });

        // =============================================
        // JWT AUTHENTICATION MIDDLEWARE
        // =============================================

        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

        function authenticateToken(req, res, next) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                return res.status(401).json({ error: 'Access token required' });
            }

            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(403).json({ error: 'Invalid or expired token' });
                }
                req.user = user;
                next();
            });
        }

        // =============================================
        // ROUTES - AUTHENTICATION
        // =============================================

        // Health check
        app.get('/api/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Login
        app.post('/api/auth/login', async (req, res) => {
            try {
                const { username, password } = req.body;

                if (!username || !password) {
                    return res.status(400).json({ error: 'Username and password required' });
                }

                // Query admin user
                const result = await pool.query(
                    'SELECT * FROM admin_users WHERE username = $1 AND is_active = true',
                    [username]
                );

                if (result.rows.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const user = result.rows[0];

                // Verify password
                const validPassword = await bcrypt.compare(password, user.password_hash);

                if (!validPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Update last login
                await pool.query(
                    'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                    [user.id]
                );

                // Generate JWT
                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role
                    }
                });

            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Verify token
        app.get('/api/auth/verify', authenticateToken, (req, res) => {
            res.json({ valid: true, user: req.user });
        });

        // =============================================
        // ROUTES - MEMBERS
        // =============================================

        // Get all members
        app.get('/api/members', authenticateToken, async (req, res) => {
            try {
                const result = await pool.query(
                    'SELECT * FROM members ORDER BY member_number ASC'
                );
                res.json(result.rows);
            } catch (error) {
                console.error('Error fetching members:', error);
                res.status(500).json({ error: 'Failed to fetch members' });
            }
        });

        // Get single member
        app.get('/api/members/:id', authenticateToken, async (req, res) => {
            try {
                const { id } = req.params;
                const result = await pool.query(
                    'SELECT * FROM members WHERE id = $1',
                    [id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Member not found' });
                }

                res.json(result.rows[0]);
            } catch (error) {
                console.error('Error fetching member:', error);
                res.status(500).json({ error: 'Failed to fetch member' });
            }
        });

        // Create member
        app.post('/api/members', authenticateToken, async (req, res) => {
            try {
                const {
                    member_number, name, email, phone, address,
                    is_veteran, is_active, join_date, notes
                } = req.body;

                const result = await pool.query(
                    `INSERT INTO members
                    (member_number, name, email, phone, address, is_veteran, is_active, join_date, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *`,
                    [member_number, name, email, phone, address, is_veteran || false, is_active !== false, join_date, notes]
                );

                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error('Error creating member:', error);
                if (error.code === '23505') { // Unique violation
                    res.status(400).json({ error: 'Member number already exists' });
                } else {
                    res.status(500).json({ error: 'Failed to create member' });
                }
            }
        });

        // Update member
        app.put('/api/members/:id', authenticateToken, async (req, res) => {
            try {
                const { id } = req.params;
                const {
                    member_number, name, email, phone, address,
                    is_veteran, is_active, join_date, notes
                } = req.body;

                const result = await pool.query(
                    `UPDATE members
                    SET member_number = $1, name = $2, email = $3, phone = $4, address = $5,
                        is_veteran = $6, is_active = $7, join_date = $8, notes = $9,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $10
                    RETURNING *`,
                    [member_number, name, email, phone, address, is_veteran, is_active, join_date, notes, id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Member not found' });
                }

                res.json(result.rows[0]);
            } catch (error) {
                console.error('Error updating member:', error);
                res.status(500).json({ error: 'Failed to update member' });
            }
        });

        // Delete member
        app.delete('/api/members/:id', authenticateToken, async (req, res) => {
            try {
                const { id } = req.params;
                const result = await pool.query(
                    'DELETE FROM members WHERE id = $1 RETURNING *',
                    [id]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Member not found' });
                }

                res.json({ message: 'Member deleted successfully' });
            } catch (error) {
                console.error('Error deleting member:', error);
                res.status(500).json({ error: 'Failed to delete member' });
            }
        });

        // =============================================
        // ROUTES - COMPETITIONS
        // =============================================

        // Get all competitions
        app.get('/api/competitions', authenticateToken, async (req, res) => {
            try {
                const result = await pool.query(
                    'SELECT * FROM competitions ORDER BY date DESC'
                );
                res.json(result.rows);
            } catch (error) {
                console.error('Error fetching competitions:', error);
                res.status(500).json({ error: 'Failed to fetch competitions' });
            }
        });

        // Create competition
        app.post('/api/competitions', authenticateToken, async (req, res) => {
            try {
                const {
                    name, date, location, type,
                    counts_for_club_ranking, counts_for_veteran_ranking,
                    registration_deadline, max_participants, status, notes
                } = req.body;

                const result = await pool.query(
                    `INSERT INTO competitions
                    (name, date, location, type, counts_for_club_ranking, counts_for_veteran_ranking,
                     registration_deadline, max_participants, status, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *`,
                    [name, date, location, type, counts_for_club_ranking !== false,
                     counts_for_veteran_ranking || false, registration_deadline,
                     max_participants, status || 'scheduled', notes]
                );

                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error('Error creating competition:', error);
                res.status(500).json({ error: 'Failed to create competition' });
            }
        });

        // =============================================
        // ROUTES - RESULTS
        // =============================================

        // Get results for a competition
        app.get('/api/competitions/:id/results', authenticateToken, async (req, res) => {
            try {
                const { id } = req.params;
                const result = await pool.query(
                    `SELECT r.*, m.name as member_name, m.member_number
                     FROM results r
                     JOIN members m ON r.member_id = m.id
                     WHERE r.competition_id = $1
                     ORDER BY r.position ASC`,
                    [id]
                );
                res.json(result.rows);
            } catch (error) {
                console.error('Error fetching results:', error);
                res.status(500).json({ error: 'Failed to fetch results' });
            }
        });

        // Create result
        app.post('/api/results', authenticateToken, async (req, res) => {
            try {
                const {
                    competition_id, member_id, position, points,
                    weight_kg, fish_count, is_absent, notes
                } = req.body;

                const result = await pool.query(
                    `INSERT INTO results
                    (competition_id, member_id, position, points, weight_kg, fish_count, is_absent, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *`,
                    [competition_id, member_id, position, points, weight_kg, fish_count || 0, is_absent || false, notes]
                );

                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error('Error creating result:', error);
                if (error.code === '23505') {
                    res.status(400).json({ error: 'Result already exists for this member and competition' });
                } else {
                    res.status(500).json({ error: 'Failed to create result' });
                }
            }
        });

        // =============================================
        // ROUTES - RANKINGS
        // =============================================

        // Get club ranking
        app.get('/api/rankings/club', authenticateToken, async (req, res) => {
            try {
                const result = await pool.query(
                    'SELECT * FROM club_ranking ORDER BY best_15_points ASC NULLS LAST'
                );
                res.json(result.rows);
            } catch (error) {
                console.error('Error fetching club ranking:', error);
                res.status(500).json({ error: 'Failed to fetch club ranking' });
            }
        });

        // Get veteran ranking
        app.get('/api/rankings/veteran', authenticateToken, async (req, res) => {
            try {
                const result = await pool.query(
                    'SELECT * FROM veteran_ranking ORDER BY total_points ASC NULLS LAST'
                );
                res.json(result.rows);
            } catch (error) {
                console.error('Error fetching veteran ranking:', error);
                res.status(500).json({ error: 'Failed to fetch veteran ranking' });
            }
        });

        // =============================================
        // ROUTES - REGISTRATIONS
        // =============================================

        // Get registrations
        app.get('/api/registrations', authenticateToken, async (req, res) => {
            try {
                const result = await pool.query(
                    `SELECT r.*, m.name as member_name, m.member_number, c.name as competition_name, c.date as competition_date
                     FROM registrations r
                     JOIN members m ON r.member_id = m.id
                     JOIN competitions c ON r.competition_id = c.id
                     ORDER BY r.registration_date DESC`
                );
                res.json(result.rows);
            } catch (error) {
                console.error('Error fetching registrations:', error);
                res.status(500).json({ error: 'Failed to fetch registrations' });
            }
        });

        // Create registration
        app.post('/api/registrations', authenticateToken, async (req, res) => {
            try {
                const {
                    competition_id, member_id, status, payment_status, payment_date, notes
                } = req.body;

                const result = await pool.query(
                    `INSERT INTO registrations
                    (competition_id, member_id, status, payment_status, payment_date, notes)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *`,
                    [competition_id, member_id, status || 'pending', payment_status || 'unpaid', payment_date, notes]
                );

                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error('Error creating registration:', error);
                if (error.code === '23505') {
                    res.status(400).json({ error: 'Registration already exists' });
                } else {
                    res.status(500).json({ error: 'Failed to create registration' });
                }
            }
        });

        // =============================================
        // ERROR HANDLING
        // =============================================

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });

        // Error handler
        app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });

        // =============================================
        // START SERVER
        // =============================================

        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════');
            console.log('  🎣 Visclub SiM API Server');
            console.log('═══════════════════════════════════════');
            console.log(`  Port: ${PORT}`);
            console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  Time: ${new Date().toISOString()}`);
            console.log('═══════════════════════════════════════');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, closing server...');
            pool.end(() => {
                console.log('Database connection closed');
                process.exit(0);
            });
        });

    } catch (err) {
        console.error('❌ Server startup error:', err);
        process.exit(1);
    }
}

startServer();
