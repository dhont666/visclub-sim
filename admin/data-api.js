/**
 * Visclub SiM - Data API
 * Handles all data operations - can work with localStorage OR backend API
 */

class DataAPI {
    constructor() {
        // ============================================
        // LOAD CONFIGURATION
        // ============================================

        // Get configuration from config.js (loaded before this file)
        this.config = window.APP_CONFIG || {
            USE_LOCAL_MODE: false,  // Default: use backend
            API_BASE_URL: window.location.origin + '/api',
            ENABLE_OFFLINE_FALLBACK: true,
            DEBUG: false
        };

        this.USE_LOCAL_MODE = this.config.USE_LOCAL_MODE;
        this.API_BASE_URL = this.config.API_BASE_URL;
        this.apiAvailable = true;
        this.offlineQueue = [];

        this.cache = {
            registrations: null,
            members: null,
            payments: null,
            permits: null,
            competitions: null,
            rankings: {
                club: null,
                veteran: null,
                recent: null
            },
            lastUpdate: {}
        };

        const mode = this.USE_LOCAL_MODE ? 'Local Storage' : 'Backend API';
        console.log(`📊 DataAPI initialized - using ${mode}`);
        console.log(`🌐 API Base URL: ${this.API_BASE_URL}`);

        if (this.USE_LOCAL_MODE) {
            this.initializeMockData();
        } else {
            // Check API connectivity on startup
            this.checkAPIConnection();
        }
    }

    // Check if backend API is reachable
    async checkAPIConnection() {
        try {
            const token = localStorage.getItem('visclubsim_token');
            const response = await fetch(`${this.API_BASE_URL}/health`, {
                method: 'GET',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                signal: AbortSignal.timeout(5000)  // 5 second timeout
            });

            this.apiAvailable = response.ok;

            if (!this.apiAvailable && this.config.ENABLE_OFFLINE_FALLBACK) {
                console.warn('⚠️ Backend API unavailable, offline fallback enabled');
                this.showOfflineNotice();
                this.startOfflineRetry();
            } else if (this.apiAvailable) {
                console.log('✅ Backend API is reachable');
                this.hideOfflineNotice();
                this.syncOfflineQueue();
            }
        } catch (error) {
            this.apiAvailable = false;
            if (this.config.ENABLE_OFFLINE_FALLBACK) {
                console.warn('⚠️ Backend API unreachable, offline mode enabled:', error.message);
                this.showOfflineNotice();
                this.startOfflineRetry();
            } else {
                console.error('❌ Backend API unreachable and offline mode disabled:', error);
            }
        }
    }

    // Show offline notice banner
    showOfflineNotice() {
        let notice = document.getElementById('offline-notice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'offline-notice';
            notice.innerHTML = `
                <div style="background: #ff9800; color: white; padding: 10px; text-align: center; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">
                    ⚠️ Backend niet bereikbaar - Offline modus actief. Wijzigingen worden later gesynchroniseerd.
                </div>
            `;
            document.body.insertBefore(notice, document.body.firstChild);
        }
    }

    // Hide offline notice banner
    hideOfflineNotice() {
        const notice = document.getElementById('offline-notice');
        if (notice) {
            notice.remove();
        }
    }

    // Retry connection periodically
    startOfflineRetry() {
        if (this.retryInterval) return;  // Already running

        this.retryInterval = setInterval(async () => {
            await this.checkAPIConnection();
            if (this.apiAvailable) {
                clearInterval(this.retryInterval);
                this.retryInterval = null;
            }
        }, this.config.OFFLINE_RETRY_INTERVAL || 30000);
    }

    // Sync operations that were queued while offline
    async syncOfflineQueue() {
        const queueKey = 'offline_queue';
        const storedQueue = localStorage.getItem(queueKey);

        if (storedQueue) {
            this.offlineQueue = JSON.parse(storedQueue);
        }

        if (this.offlineQueue.length > 0 && this.apiAvailable) {
            console.log(`🔄 Syncing ${this.offlineQueue.length} offline operations...`);

            const successfulOps = [];
            const failedOps = [];

            for (const operation of this.offlineQueue) {
                try {
                    await this.executeQueuedOperation(operation);
                    successfulOps.push(operation);
                    console.log('✅ Synced operation:', operation.type);
                } catch (error) {
                    console.error('❌ Failed to sync operation:', operation.type, error);
                    failedOps.push(operation);
                }
            }

            // Keep only failed operations in queue
            this.offlineQueue = failedOps;
            localStorage.setItem(queueKey, JSON.stringify(failedOps));

            if (successfulOps.length > 0) {
                alert(`✅ ${successfulOps.length} offline wijzigingen gesynchroniseerd!`);
            }
        }
    }

    // Execute a queued operation
    async executeQueuedOperation(operation) {
        const { method, endpoint, data } = operation;

        const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('visclubsim_token')}`
            },
            body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }

    // Queue operation for later sync
    queueOperation(method, endpoint, data) {
        const operation = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            method,
            endpoint,
            data
        };

        this.offlineQueue.push(operation);
        localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));

        console.log('📋 Operation queued for sync:', operation);
    }

    // Initialize empty data if localStorage is empty
    initializeMockData() {
        // Initialize with empty arrays - no demo data
        if (!localStorage.getItem('mock_registrations')) {
            localStorage.setItem('mock_registrations', JSON.stringify([]));
        }
        if (!localStorage.getItem('mock_members')) {
            localStorage.setItem('mock_members', JSON.stringify([]));
        }
        if (!localStorage.getItem('mock_payments')) {
            localStorage.setItem('mock_payments', JSON.stringify([]));
        }
        if (!localStorage.getItem('mock_permits')) {
            localStorage.setItem('mock_permits', JSON.stringify([]));
        }
        if (!localStorage.getItem('mock_competitions')) {
            localStorage.setItem('mock_competitions', JSON.stringify([]));
        }
        if (!localStorage.getItem('mock_contact_messages')) {
            localStorage.setItem('mock_contact_messages', JSON.stringify([]));
        }
        console.log('✅ Data storage initialized (empty)');
    }

    // Get authentication token
    getToken() {
        if (this.USE_LOCAL_MODE) {
            return 'mock-token';
        }
        return localStorage.getItem('visclubsim_token') || sessionStorage.getItem('visclubsim_token');
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (!this.USE_LOCAL_MODE) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Error handling
    handleError(error, operation) {
        console.error(`❌ Error during ${operation}:`, error);

        // Only redirect to login if using backend and it's a 401 error
        if (!this.USE_LOCAL_MODE && error.status === 401) {
            console.log('🔐 Unauthorized - redirecting to login');
            window.location.href = '/admin/login.html';
        }
    }

    // Load data (from localStorage or backend API)
    async load(type) {
        if (this.USE_LOCAL_MODE) {
            // Load from localStorage
            try {
                const data = JSON.parse(localStorage.getItem(`mock_${type}`) || '[]');
                this.cache[type] = data;
                console.log(`✅ Loaded ${data.length} ${type} from Local Storage`);
                return data;
            } catch (error) {
                this.handleError(error, `loading ${type}`);
                return [];
            }
        } else {
            // Load from backend API
            try {
                const response = await fetch(`${this.API_BASE_URL}/${type}`, {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                });

                if (!response.ok) {
                    throw { status: response.status, message: await response.text() };
                }

                const result = await response.json();
                // API returns {success: true, data: [...]} format
                const data = result.data || result || [];
                this.cache[type] = data;
                console.log(`✅ Loaded ${data.length} ${type} from Backend API`);
                return data;
            } catch (error) {
                this.handleError(error, `loading ${type}`);
                return [];
            }
        }
    }

    // Save data (to localStorage or backend API)
    async save(type, data) {
        if (this.USE_LOCAL_MODE) {
            // Save to localStorage
            console.log(`💾 Saving ${data.length} ${type} to Local Storage...`);
            try {
                localStorage.setItem(`mock_${type}`, JSON.stringify(data));
                this.cache[type] = data;
                console.log(`✅ ${type} saved successfully to Local Storage`);
                return true;
            } catch (error) {
                this.handleError(error, `saving ${type}`);
                return false;
            }
        } else {
            // Save to backend API
            console.log(`💾 Saving ${data.length} ${type} to Backend API...`);
            try {
                const response = await fetch(`${this.API_BASE_URL}/${type}`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw { status: response.status, message: await response.text() };
                }

                this.cache[type] = data;
                console.log(`✅ ${type} saved successfully to Backend API`);
                return true;
            } catch (error) {
                this.handleError(error, `saving ${type}`);
                return false;
            }
        }
    }

    // --- Registrations ---
    async getRegistrations() {
        return await this.load('registrations');
    }

    async addRegistration(newReg) {
        const registrations = await this.getRegistrations();
        const newId = registrations.length > 0 ? Math.max(...registrations.map(r => r.id)) + 1 : 1;
        const registration = { ...newReg, id: newId, registeredAt: new Date().toISOString() };
        registrations.push(registration);
        await this.save('registrations', registrations);
        return registration;
    }

    async updateRegistration(id, updates) {
        const registrations = await this.getRegistrations();
        const index = registrations.findIndex(r => r.id === id);
        if (index > -1) {
            registrations[index] = { ...registrations[index], ...updates };
            await this.save('registrations', registrations);
            return true;
        }
        return false;
    }

    async deleteRegistration(id) {
        let registrations = await this.getRegistrations();
        registrations = registrations.filter(r => r.id !== id);
        await this.save('registrations', registrations);
        return true;
    }

    // --- Members ---
    async getMembers() {
        return await this.load('members');
    }

    async addMember(newMember) {
        const members = await this.getMembers();
        const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        const memberNumber = String(newId).padStart(3, '0');
        const member = {
            ...newMember,
            id: newId,
            memberNumber,
            validUntil: '2026-12-31', // Mocked value
            joinedAt: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        members.push(member);
        await this.save('members', members);
        return member;
    }

    async updateMember(id, updates) {
        const members = await this.getMembers();
        const index = members.findIndex(m => m.id === id);
        if (index > -1) {
            members[index] = { ...members[index], ...updates };
            await this.save('members', members);
            return true;
        }
        return false;
    }

    async deleteMember(id) {
        console.log('🗑️ deleteMember called with ID:', id);

        // Get member info before deleting
        const members = await this.getMembers();
        const member = members.find(m => m.id === id || String(m.id) === String(id));

        if (!member) {
            throw new Error('Lid niet gevonden');
        }

        console.log('Found member to delete:', member.name);

        // 1. Delete from members list
        const filteredMembers = members.filter(m => m.id !== id && String(m.id) !== String(id));
        await this.save('members', filteredMembers);
        console.log('✅ Deleted from members list');

        // 2. Delete all registrations for this member
        let registrations = await this.getRegistrations();
        const beforeRegCount = registrations.length;
        registrations = registrations.filter(r =>
            !(r.email && member.email && r.email.toLowerCase() === member.email.toLowerCase()) &&
            !(r.memberNumber && r.memberNumber === member.memberNumber) &&
            !(r.name && member.name && r.name.toLowerCase() === member.name.toLowerCase())
        );
        await this.save('registrations', registrations);
        console.log(`✅ Deleted ${beforeRegCount - registrations.length} registrations`);

        // 3. Delete permit if exists
        let permits = await this.getPermits();
        const beforePermitCount = permits.length;
        permits = permits.filter(p =>
            !(p.email && member.email && p.email.toLowerCase() === member.email.toLowerCase())
        );
        await this.save('permits', permits);
        console.log(`✅ Deleted ${beforePermitCount - permits.length} permits`);

        console.log('✅ Member completely deleted from all systems');
        return true;
    }

    // --- Payments ---
    async getPayments() {
        // Payments are now tracked via public_registrations table
        // Map registrations to payment format for backward compatibility
        if (!this.USE_LOCAL_MODE && this.API_BASE_URL) {
            try {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`${this.API_BASE_URL}/public-registrations`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    // Map to payment format
                    return result.data.map(reg => ({
                        id: reg.id,
                        registrationId: reg.id,
                        amount: reg.amount || '0',
                        status: reg.payment_status || 'pending',
                        method: reg.payment_method || 'qr',
                        reference: reg.payment_reference || '',
                        paidAt: reg.payment_status === 'paid' ? reg.created_at : null,
                        createdAt: reg.created_at
                    }));
                }
            } catch (error) {
                console.error('Error fetching payments from API:', error);
            }
        }

        // Fallback to localStorage
        return await this.load('payments');
    }

    async updatePaymentStatus(id, status, method) {
        // Update payment status via public_registrations endpoint
        if (!this.USE_LOCAL_MODE && this.API_BASE_URL) {
            try {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`${this.API_BASE_URL}/public-registrations/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        payment_status: status,
                        payment_method: method
                    })
                });

                const result = await response.json();
                return result.success;
            } catch (error) {
                console.error('Error updating payment status:', error);
                return false;
            }
        }

        // Fallback to localStorage
        const payments = await this.load('payments');
        const index = payments.findIndex(p => p.id === id);
        if (index > -1) {
            payments[index] = { ...payments[index], status, method, paidAt: new Date().toISOString() };
            await this.save('payments', payments);
            return true;
        }
        return false;
    }

    // --- Permits ---
    async getPermits() {
        // Try API first if not in local mode
        if (!this.USE_LOCAL_MODE && this.API_BASE_URL) {
            try {
                const token = this.getToken();
                if (token) {
                    console.log('🔍 Fetching permits from API:', `${this.API_BASE_URL}/permits`);
                    const response = await fetch(`${this.API_BASE_URL}/permits`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('📡 API Response status:', response.status);

                    if (response.ok) {
                        const result = await response.json();
                        console.log('📦 API Response data:', result);
                        if (result.success) {
                            console.log('✅ Fetched permits from API:', result.data);
                            // Transform API data to match expected format
                            return result.data.map(permit => {
                                // Parse address: "Street 123, City PostalCode" or "Street 123, PostalCode City"
                                let street = '', city = '', postal = '';
                                if (permit.address) {
                                    const parts = permit.address.split(',');
                                    street = parts[0]?.trim() || '';
                                    if (parts[1]) {
                                        // Extract city and postal from "PostalCode City" or "City PostalCode"
                                        const cityPart = parts[1].trim();
                                        const match = cityPart.match(/(\d{4})\s*(.+)|(.+?)\s*(\d{4})/);
                                        if (match) {
                                            postal = match[1] || match[4] || '';
                                            city = match[2] || match[3] || '';
                                        } else {
                                            city = cityPart;
                                        }
                                    }
                                }

                                // Parse name: "FirstName LastName"
                                const nameParts = (permit.applicant_name || '').split(' ');
                                const firstName = nameParts[0] || '';
                                const lastName = nameParts.slice(1).join(' ') || '';

                                return {
                                    id: permit.id,
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: permit.email,
                                    phone: permit.phone || '',
                                    street: street,
                                    city: city,
                                    postal: postal,
                                    permitType: permit.permit_type || 'jaarvergunning',
                                    status: permit.status,
                                    applicationDate: permit.application_date || permit.created_at,
                                    approvedAt: permit.approved_date,
                                    approvedBy: permit.approved_by || null,
                                    approvedDate: permit.approved_date || null,
                                    notes: permit.notes || '',
                                    remarks: permit.notes || '', // Alias for compatibility
                                    birthdate: null, // Not stored in permits table
                                    rijksregisternummer: null // Stored in notes field
                                };
                            });
                        } else {
                            console.warn('⚠️ API returned success=false:', result);
                        }
                    } else {
                        console.error('❌ API request failed:', response.status, response.statusText);
                        const errorText = await response.text();
                        console.error('Error response:', errorText);
                    }
                } else {
                    console.warn('⚠️ No admin token found, using localStorage');
                }
            } catch (error) {
                console.error('❌ Error fetching permits from API:', error);
            }
        } else {
            console.log('📂 Using LOCAL_MODE, loading from localStorage');
        }

        // Fallback to localStorage
        console.log('⬇️ Falling back to localStorage for permits');
        return await this.load('permits');
    }

    async addPermit(newPermit) {
        const permits = await this.getPermits();
        const newId = permits.length > 0 ? Math.max(...permits.map(p => p.id)) + 1 : 1;
        const amount = newPermit.permitType === 'jaarvergunning' ? 75 : 60;
        const finalAmount = newPermit.isYouth ? amount / 2 : amount;

        const permit = {
            ...newPermit,
            id: newId,
            amount: finalAmount.toFixed(2),
            status: 'pending',
            appliedAt: new Date().toISOString()
        };
        permits.push(permit);
        await this.save('permits', permits);
        return permit;
    }

    async updatePermit(id, updates) {
        // Try API first if not in local mode
        if (!this.USE_LOCAL_MODE && this.API_BASE_URL) {
            try {
                const token = this.getToken();
                if (token) {
                    console.log('🔄 Updating permit via API:', id, updates);
                    const response = await fetch(`${this.API_BASE_URL}/permits/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updates)
                    });

                    console.log('📡 Update response status:', response.status);

                    if (response.ok) {
                        const result = await response.json();
                        console.log('📦 Update result:', result);
                        if (result.success) {
                            console.log('✅ Permit updated via API');
                            return true;
                        }
                    } else {
                        const errorText = await response.text();
                        console.error('❌ API update failed:', response.status, errorText);
                    }
                } else {
                    console.warn('⚠️ No token found for API update');
                }
            } catch (error) {
                console.error('❌ Error updating permit via API:', error);
            }
        }

        // Fallback to localStorage
        const permits = await this.getPermits();
        const index = permits.findIndex(p => p.id === id);
        if (index > -1) {
            permits[index] = { ...permits[index], ...updates };
            if (updates.status === 'approved') {
                permits[index].approvedAt = new Date().toISOString();
            }
            await this.save('permits', permits);
            return true;
        }
        return false;
    }

    async deletePermit(id) {
        console.log('🗑️ deletePermit called with ID:', id, typeof id);

        // Try API first if not in local mode
        if (!this.USE_LOCAL_MODE && this.API_BASE_URL) {
            try {
                const token = this.getToken();
                if (token) {
                    console.log('🔍 Deleting permit via API:', `${this.API_BASE_URL}/permits/${id}`);
                    const response = await fetch(`${this.API_BASE_URL}/permits/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('📡 API Delete Response status:', response.status);

                    if (response.ok) {
                        const result = await response.json();
                        console.log('📦 API Delete Response:', result);
                        if (result.success) {
                            console.log('✅ Deleted permit via API');
                            return true;
                        } else {
                            throw new Error(result.error || 'API returned success=false');
                        }
                    } else {
                        const errorText = await response.text();
                        throw new Error(`API delete failed with status ${response.status}: ${errorText}`);
                    }
                } else {
                    throw new Error('No authentication token found');
                }
            } catch (error) {
                console.error('❌ Error deleting permit via API:', error);
                // If backend fails and offline fallback is disabled, throw error
                if (!this.config.ENABLE_OFFLINE_FALLBACK) {
                    throw error;
                }
                // Otherwise fall through to localStorage fallback
                console.warn('⚠️ Falling back to localStorage delete');
            }
        }

        // Fallback to localStorage
        let permits = await this.getPermits();
        console.log('📋 Current permits before delete:', permits.length);
        console.log('All permit IDs:', permits.map(p => ({ id: p.id, type: typeof p.id })));

        // Filter using both strict and loose comparison
        const beforeCount = permits.length;
        permits = permits.filter(p => p.id !== id && String(p.id) !== String(id));
        const afterCount = permits.length;

        const removedCount = beforeCount - afterCount;
        console.log(`Removed ${removedCount} permit(s)`);

        if (removedCount === 0) {
            throw new Error('Permit niet gevonden in lokale opslag');
        }

        await this.save('permits', permits);
        console.log('✅ Permits saved to storage');
        return true;
    }

    // --- Competitions ---
    async getCompetitions() {
        return await this.load('competitions');
    }

    // --- Statistics ---
    async getStatistics() {
        const registrations = await this.getRegistrations();
        const payments = await this.getPayments();

        const totalRegistrations = registrations.length;
        const paidCount = payments.filter(p => p.status === 'paid').length;
        const pendingCount = payments.filter(p => p.status === 'pending').length;

        return {
            totalRegistrations,
            paidCount,
            pendingCount
        };
    }

    // --- Rankings (Mocked) ---
    async getClubRanking() {
        console.log('Returning mocked club ranking');
        return [
            { name: 'Deelnemer A', points: 100 },
            { name: 'Deelnemer B', points: 90 },
            { name: 'Deelnemer C', points: 80 }
        ];
    }

    async getVeteranRanking() {
        console.log('Returning mocked veteran ranking');
        return [
            { name: 'Veteraan X', points: 70 },
            { name: 'Veteraan Y', points: 60 }
        ];
    }

    async getRecentResults() {
        console.log('Returning mocked recent results');
        return [
            { competition: 'Wedstrijd 1', date: '2025-10-28', winner: 'Deelnemer A' },
            { competition: 'Wedstrijd 2', date: '2025-10-27', winner: 'Deelnemer B' }
        ];
    }

    // --- CSV Export ---
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('Geen data om te exporteren.');
            return;
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName])).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        alert(`✅ ${filename} geëxporteerd naar CSV!`);
    }

    // --- Contact Messages ---
    async getContactMessages() {
        return await this.load('contact_messages');
    }

    async addContactMessage(newMessage) {
        const messages = await this.getContactMessages();
        const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
        const message = {
            ...newMessage,
            id: newId,
            createdAt: new Date().toISOString(),
            status: 'unread'
        };
        messages.push(message);
        await this.save('contact_messages', messages);
        return message;
    }

    async updateContactMessage(id, updates) {
        const messages = await this.getContactMessages();
        const index = messages.findIndex(m => m.id === id);
        if (index > -1) {
            messages[index] = { ...messages[index], ...updates };
            await this.save('contact_messages', messages);
            return true;
        }
        return false;
    }

    async deleteContactMessage(id) {
        let messages = await this.getContactMessages();
        messages = messages.filter(m => m.id !== id);
        await this.save('contact_messages', messages);
        return true;
    }

    async markMessageAsRead(id) {
        return await this.updateContactMessage(id, { status: 'read', readAt: new Date().toISOString() });
    }

    // Clear cache (not strictly needed for localStorage, but good practice)
    clearCache() {
        this.cache = {
            registrations: null,
            members: null,
            payments: null,
            permits: null,
            competitions: null,
            contact_messages: null,
            rankings: {
                club: null,
                veteran: null,
                recent: null
            }
        };
        console.log('🧹 Cache cleared');
    }
}

// Global instance
const dataAPI = new DataAPI();

// Make dataAPI globally accessible
window.dataAPI = dataAPI;