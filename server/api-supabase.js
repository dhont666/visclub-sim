/**
 * Visclub SiM Backend API - Supabase Client Version
 * Uses @supabase/supabase-js instead of direct PostgreSQL connection
 * Works on ALL deployment platforms (uses HTTPS instead of PostgreSQL protocol)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// SUPABASE CLIENT INITIALIZATION
// =============================================

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: Missing required environment variables');
    console.error('   Required: SUPABASE_URL and SUPABASE_SERVICE_KEY');
    console.error('   Get these from: Supabase Dashboard → Settings → API');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

console.log('✅ Supabase client initialized');
console.log('   URL:', process.env.SUPABASE_URL);

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
app.get('/api/health', async (req, res) => {
    try {
        // Test Supabase connection
        const { data, error } = await supabase
            .from('admin_users')
            .select('id')
            .limit(1);

        if (error) throw error;

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Query admin user using Supabase client
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = data;

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

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
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .order('member_number', { ascending: true });

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Get single member
app.get('/api/members/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Member not found' });
            }
            throw error;
        }

        res.json(data);
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

        const { data, error } = await supabase
            .from('members')
            .insert({
                member_number,
                name,
                email,
                phone,
                address,
                is_veteran: is_veteran || false,
                is_active: is_active !== false,
                join_date,
                notes
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Member number already exists' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Failed to create member' });
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

        const { data, error } = await supabase
            .from('members')
            .update({
                member_number,
                name,
                email,
                phone,
                address,
                is_veteran,
                is_active,
                join_date,
                notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Member not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Delete member
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('members')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Member not found' });
            }
            throw error;
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
        const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        res.json(data || []);
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

        const { data, error } = await supabase
            .from('competitions')
            .insert({
                name,
                date,
                location,
                type,
                counts_for_club_ranking: counts_for_club_ranking !== false,
                counts_for_veteran_ranking: counts_for_veteran_ranking || false,
                registration_deadline,
                max_participants,
                status: status || 'scheduled',
                notes
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
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
        const { data, error } = await supabase
            .from('results')
            .select(`
                *,
                members (
                    name,
                    member_number
                )
            `)
            .eq('competition_id', id)
            .order('position', { ascending: true });

        if (error) throw error;

        // Flatten the response for backward compatibility
        const flattenedData = (data || []).map(result => ({
            ...result,
            member_name: result.members?.name,
            member_number: result.members?.member_number
        }));

        res.json(flattenedData);
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

        const { data, error } = await supabase
            .from('results')
            .insert({
                competition_id,
                member_id,
                position,
                points,
                weight_kg,
                fish_count: fish_count || 0,
                is_absent: is_absent || false,
                notes
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Result already exists for this member and competition' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating result:', error);
        res.status(500).json({ error: 'Failed to create result' });
    }
});

// =============================================
// ROUTES - RANKINGS
// =============================================

// Get club ranking
app.get('/api/rankings/club', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('club_ranking')
            .select('*')
            .order('best_15_points', { ascending: true, nullsFirst: false });

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching club ranking:', error);
        res.status(500).json({ error: 'Failed to fetch club ranking' });
    }
});

// Get veteran ranking
app.get('/api/rankings/veteran', authenticateToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('veteran_ranking')
            .select('*')
            .order('total_points', { ascending: true, nullsFirst: false });

        if (error) throw error;

        res.json(data || []);
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
        const { data, error } = await supabase
            .from('registrations')
            .select(`
                *,
                members (
                    name,
                    member_number
                ),
                competitions (
                    name,
                    date
                )
            `)
            .order('registration_date', { ascending: false });

        if (error) throw error;

        // Flatten the response
        const flattenedData = (data || []).map(reg => ({
            ...reg,
            member_name: reg.members?.name,
            member_number: reg.members?.member_number,
            competition_name: reg.competitions?.name,
            competition_date: reg.competitions?.date
        }));

        res.json(flattenedData);
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

        const { data, error } = await supabase
            .from('registrations')
            .insert({
                competition_id,
                member_id,
                status: status || 'pending',
                payment_status: payment_status || 'unpaid',
                payment_date,
                notes
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Registration already exists' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating registration:', error);
        res.status(500).json({ error: 'Failed to create registration' });
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
    console.log('  (Supabase Client Version)');
    console.log('═══════════════════════════════════════');
    console.log(`  Port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Time: ${new Date().toISOString()}`);
    console.log('  Connection: HTTPS (Supabase Client)');
    console.log('═══════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    process.exit(0);
});
