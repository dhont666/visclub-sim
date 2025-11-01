/**
 * Visclub SiM - Data API
 * Handles all data operations - can work with localStorage OR backend API
 */

class DataAPI {
    constructor() {
        // ============================================
        // CONFIGURATIE - WIJZIG DIT VOOR DEPLOYMENT
        // ============================================

        // ONTWIKKELING (Lokaal): Zet op true
        // PRODUCTIE (Railway): Zet op false
        this.USE_LOCAL_MODE = true; // ← WIJZIG NAAR false VOOR DEPLOYMENT!

        // Railway backend API URL
        // Vervang door je Railway app URL (krijg je na deployment)
        this.API_BASE_URL = 'https://jouw-app.up.railway.app/api';
        // ☝️ WIJZIG DIT NAAR JE RAILWAY URL!

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
            }
        };

        const mode = this.USE_LOCAL_MODE ? 'Local Storage' : 'Backend API';
        console.log(`📊 DataAPI initialized - using ${mode}`);

        if (this.USE_LOCAL_MODE) {
            this.initializeMockData();
        }
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

                const data = await response.json();
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
        let members = await this.getMembers();
        members = members.filter(m => m.id !== id);
        await this.save('members', members);
        return true;
    }

    // --- Payments ---
    async getPayments() {
        return await this.load('payments');
    }

    async updatePaymentStatus(id, status, method) {
        const payments = await this.getPayments();
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
        let permits = await this.getPermits();
        permits = permits.filter(p => p.id !== id);
        await this.save('permits', permits);
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