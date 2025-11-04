/**
 * Visclub SiM - Admin Authenticatie Systeem (Mocked for Local Storage)
 * Beveiligingssysteem voor admin.visclubsim.be subdomein
 */

class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.authComplete = false;

        // ============================================
        // CONFIGURATION - Uses global APP_CONFIG
        // ============================================

        // Get configuration from config.js (loaded before this file)
        this.config = window.APP_CONFIG || {
            USE_LOCAL_MODE: false,  // Default: use backend API
            API_BASE_URL: window.location.origin + '/api'
        };

        this.USE_LOCAL_MODE = this.config.USE_LOCAL_MODE;
        this.API_BASE_URL = this.config.API_BASE_URL;

        console.log('🔐 AdminAuth initialized:', {
            mode: this.USE_LOCAL_MODE ? 'Local Storage' : 'Backend API',
            apiUrl: this.API_BASE_URL
        });

        this.init();
    }

    init() {
        // Wacht tot DOM geladen is voordat auth check wordt gedaan
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkAuthentication();
            });
        } else {
            // DOM is al geladen
            this.checkAuthentication();
        }
    }

    async checkAuthentication() {
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.includes('login.html');

        console.log('🔐 Checking authentication...', { currentPage, isLoginPage });

        // Check zowel localStorage als sessionStorage voor backward compatibility
        const storedToken = localStorage.getItem('visclubsim_token') || sessionStorage.getItem('visclubsim_token');
        const storedUser = localStorage.getItem('visclubsim_admin') || sessionStorage.getItem('visclubsim_admin');

        console.log('🔑 Token found:', !!storedToken, 'User found:', !!storedUser);

        if (this.USE_LOCAL_MODE) {
            // Lokale modus - check alleen of er een token is
            if (storedToken && storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                    this.currentUser.token = storedToken;
                    this.updateUserDisplay();
                    console.log('✅ Lokale authenticatie succesvol', this.currentUser);

                    // Set flag that authentication is complete
                    this.authComplete = true;
                    if (isLoginPage) {
                        console.log('🔄 Already logged in, redirecting to dashboard...');
                        window.location.href = 'index.html';
                    }
                } catch (e) {
                    console.error('❌ Fout bij lokale authenticatie:', e);
                    this.clearAuth();
                    if (!isLoginPage) {
                        console.log('🔄 Redirecting to login...');
                        window.location.href = 'login.html';
                    }
                }
            } else {
                this.currentUser = null;
                if (!isLoginPage) {
                    console.log('⚠️ Geen lokale authenticatie gevonden, redirect naar login');
                    window.location.href = 'login.html';
                } else {
                    console.log('📄 On login page, no redirect needed');
                }
            }
        } else {
            // Backend API modus
            if (storedToken) {
                try {
                    const response = await fetch(`${this.API_BASE_URL}/auth/verify`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        this.currentUser = { ...data.user, token: storedToken };
                        this.updateUserDisplay();
                        if (isLoginPage) {
                            window.location.href = 'index.html';
                        }
                    } else {
                        console.warn('Token verificatie mislukt, omleiden naar login.');
                        this.clearAuth();
                        if (!isLoginPage) {
                            window.location.href = 'login.html';
                        }
                    }
                } catch (e) {
                    console.error('Fout bij token verificatie:', e);
                    this.clearAuth();
                    if (!isLoginPage) {
                        window.location.href = 'login.html';
                    }
                }
            } else {
                this.currentUser = null;
                if (!isLoginPage) {
                    window.location.href = 'login.html';
                }
            }
        }
    }

    clearAuth() {
        localStorage.removeItem('visclubsim_admin');
        localStorage.removeItem('visclubsim_token');
        localStorage.removeItem('admin_name');
        sessionStorage.removeItem('visclubsim_admin');
        sessionStorage.removeItem('visclubsim_token');
        this.currentUser = null;
    }

    async login(username, password) {
        console.log('🔒 Login poging voor:', username);

        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                const sessionUser = {
                    ...data.user,
                    token: data.token,
                    loginTime: new Date().toISOString()
                };
                sessionStorage.setItem('visclubsim_admin', JSON.stringify(sessionUser));

                localStorage.setItem('admin_name', sessionUser.name); // Store name for display
                this.currentUser = sessionUser;
                console.log(`✅ Admin ingelogd: ${sessionUser.username}`);
                return { success: true, user: sessionUser };
            } else {
                console.error('❌ Inlogfout:', data.error || data.message);
                return { success: false, error: data.error || data.message || 'Onbekende inlogfout' };
            }
        } catch (error) {
            console.error('❌ Netwerkfout bij inloggen:', error);
            return { success: false, error: 'Kan geen verbinding maken met de server' };
        }
    }

    async logout() {
        console.log('🚪 Uitloggen...');

        if (!this.USE_LOCAL_MODE) {
            // Als backend API gebruikt wordt, roep logout endpoint aan
            const token = localStorage.getItem('visclubsim_token') || sessionStorage.getItem('visclubsim_token');
            if (token) {
                try {
                    await fetch(`${this.API_BASE_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (error) {
                    console.error('Error calling logout API:', error);
                }
            }
        }

        // Clear alle auth data
        this.clearAuth();
        window.location.href = 'login.html';
    }

    // getToken is no longer needed as authentication is mocked
    // getToken() {
    //     return sessionStorage.getItem('visclubsim_token');
    // }

    getCurrentUser() {
        return this.currentUser;
    }

    isSuperAdmin() {
        return this.currentUser && this.currentUser.role === 'super-admin';
    }

    updateUserDisplay() {
        if (this.currentUser) {
            const adminNameElement = document.getElementById('adminName');
            if (adminNameElement) {
                adminNameElement.textContent = this.currentUser.name;
            }

            const adminEmailElement = document.getElementById('adminEmail');
            if (adminEmailElement) {
                adminEmailElement.textContent = this.currentUser.email || '';
            }

            const adminRoleElement = document.getElementById('adminRole');
            if (adminRoleElement) {
                const roleText = this.currentUser.role === 'super-admin' ? 'Super Admin' : 'Admin';
                adminRoleElement.textContent = roleText;
            }
        }
    }
}

// Globale instance - maak beschikbaar op window object
const adminAuth = new AdminAuth();
window.adminAuth = adminAuth; // Explicitly set on window for cross-script access

// Helper functie voor logout button
function adminLogout() {
    if (confirm('Weet je zeker dat je wilt uitloggen?')) {
        adminAuth.logout();
    }
}