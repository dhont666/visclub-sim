/**
 * Visclub SiM - Admin Dashboard JavaScript
 * Now using DataAPI for real data persistence
 */

// Global data cache (loaded from DataAPI)
let allRegistrations = [];
let allMembers = [];
let allPayments = [];

// Initialize everything when DOM is ready
window.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Admin Dashboard initializing...');

    // Wait for DataAPI to be ready (with retry)
    let retries = 0;
    while (!window.dataAPI && retries < 10) {
        console.log('⏳ Waiting for DataAPI to load...');
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }

    if (!window.dataAPI) {
        console.error('❌ DataAPI not loaded after 1 second!');
        alert('Database systeem kon niet worden geladen. Ververs de pagina.');
        return;
    }

    console.log('✅ DataAPI ready');

    // Initialize navigation first
    initializeNavigation();

    // Initialize event listeners
    initializeEventListeners();

    // Load initial dashboard data
    await loadDashboardData();

    // Load registrations table if visible
    const regTable = document.getElementById('registrationsTable');
    if (regTable) {
        await loadRegistrationsTable();
    }

    console.log('✅ Admin Dashboard initialized');
});

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    console.log(`📍 Found ${navItems.length} navigation items`);

    navItems.forEach(item => {
        // Alleen preventDefault voor items met een data-section attribuut
        // Links naar andere pagina's (.html) laten we gewoon werken
        if (item.dataset.section) {
            item.addEventListener('click', function(e) {
                e.preventDefault();

                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));

                // Add active class to clicked item
                this.classList.add('active');

                // Get section to show
                const section = this.dataset.section;
                console.log(`🔄 Switching to section: ${section}`);
                switchSection(section);
            });
        } else {
            // Voor normale links (naar andere HTML pagina's) doen we niets
            // De browser navigeert gewoon normaal
            console.log(`🔗 Link to: ${item.href}`);
        }
    });
}

window.switchSection = function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update page title
    updatePageTitle(sectionName);

    // Load section data
    loadSectionData(sectionName);
}

function updatePageTitle(section) {
    const titles = {
        'overview': { title: 'Overzicht', subtitle: 'Dashboard statistieken en recente activiteit' },
        'registrations': { title: 'Inschrijvingen', subtitle: 'Beheer alle wedstrijdinschrijvingen' },
        'payments': { title: 'Betalingen', subtitle: 'Overzicht van alle betalingen en openstaande bedragen' },
        'competitions': { title: 'Wedstrijden', subtitle: 'Wedstrijden beheren en aanpassen' },
        'draw': { title: 'Plaatsentrekking', subtitle: 'Automatische trekking van visplaatsen' },
        'members': { title: 'Leden', subtitle: 'Ledenbeheer en visvergunningen' },
        'permits': { title: 'Vergunningen', subtitle: 'Beheer visvergunning aanvragen en goedkeuringen' },
        'emails': { title: 'Email Notificaties', subtitle: 'Verstuur berichten naar leden en deelnemers' },
        'bot': { title: 'Vis Advies Bot', subtitle: 'AI bot configuratie en analytics' },
        'settings': { title: 'Instellingen', subtitle: 'Algemene configuratie en beheer' }
    };

    const titleInfo = titles[section] || titles['overview'];
    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');

    if (titleEl) titleEl.textContent = titleInfo.title;
    if (subtitleEl) subtitleEl.textContent = titleInfo.subtitle;
}

// Load data for sections
function loadSectionData(section) {
    switch(section) {
        case 'registrations':
            loadRegistrationsTable();
            break;
        case 'payments':
            loadPaymentsTable();
            break;
        case 'competitions':
            loadCompetitionsGrid();
            break;
        case 'members':
            loadMembersTable();
            break;
        case 'permits':
            loadPermitsTable();
            break;
    }
}

// Load registrations table
async function loadRegistrationsTable() {
    const tbody = document.getElementById('registrationsTable');
    if (!tbody) return;

    // Reload data from API
    allRegistrations = await window.dataAPI.getRegistrations();

    tbody.innerHTML = '';

    if (allRegistrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">Geen inschrijvingen gevonden</td></tr>';
        return;
    }

    allRegistrations.forEach(reg => {
        const row = document.createElement('tr');
        const regDate = reg.registeredAt ? reg.registeredAt.split('T')[0] : reg.date || '';

        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>#${reg.id}</td>
            <td><strong>${reg.name}</strong></td>
            <td>${reg.email}</td>
            <td>${reg.competition}</td>
            <td><span class="status-badge">${reg.type === 'solo' ? 'Individueel' : 'Koppel'}</span></td>
            <td><span class="status-badge ${reg.paid ? 'paid' : 'pending'}">${reg.paid ? 'Betaald' : 'Openstaand'}</span></td>
            <td>${regDate}</td>
            <td>
                <button class="btn-small" onclick="editRegistration(${reg.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-small" onclick="deleteRegistration(${reg.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    console.log(`📋 Loaded ${allRegistrations.length} registrations into table`);
}

// Load payments table
async function loadPaymentsTable() {
    const tbody = document.getElementById('paymentsTable');
    if (!tbody) return;

    // Reload data from API
    allPayments = await window.dataAPI.getPayments();

    tbody.innerHTML = '';

    if (allPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">Geen betalingen gevonden</td></tr>';
        return;
    }

    allPayments.forEach(payment => {
        const row = document.createElement('tr');
        const paymentDate = payment.createdAt ? payment.createdAt.split('T')[0] : payment.date || '';

        row.innerHTML = `
            <td><code>${payment.reference}</code></td>
            <td>${payment.name}</td>
            <td>${payment.competition}</td>
            <td><strong>€${payment.amount}</strong></td>
            <td><span class="status-badge ${payment.status}">${payment.status === 'paid' ? 'Betaald' : 'Openstaand'}</span></td>
            <td>${paymentDate}</td>
            <td>
                <button class="btn-small" onclick="markPaid(${payment.id})">
                    ${payment.status === 'paid' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-money-bill-wave"></i> Markeer Betaald'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    console.log(`💰 Loaded ${allPayments.length} payments into table`);
}

// Load competitions grid
function loadCompetitionsGrid() {
    const grid = document.getElementById('competitionsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="competition-card">
            <h4>07-03-2026</h4>
            <p>Vrije Gewone Wedstrijd</p>
            <span class="status-badge">12 ingeschreven</span>
        </div>
        <div class="competition-card">
            <h4>14-03-2026</h4>
            <p>Vrije Koppelwedstrijd</p>
            <span class="status-badge">6 koppels</span>
        </div>
    `;
}

// Load members table
async function loadMembersTable() {
    const tbody = document.getElementById('membersTable');
    if (!tbody) return;

    // Reload data from API
    allMembers = await window.dataAPI.getMembers();

    tbody.innerHTML = '';

    if (allMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">Geen leden gevonden</td></tr>';
        return;
    }

    allMembers.forEach(member => {
        const row = document.createElement('tr');
        const fullName = `${member.firstName} ${member.lastName}`;

        row.innerHTML = `
            <td>#${member.memberNumber}</td>
            <td><strong>${fullName}</strong></td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td><span class="status-badge paid">${member.membershipType}</span></td>
            <td>${member.validUntil}</td>
            <td>
                <button class="btn-small" onclick="editMember(${member.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-small" onclick="deleteMember(${member.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });

    console.log(`👥 Loaded ${allMembers.length} members into table`);
}

// Load initial dashboard data
async function loadDashboardData() {
    try {
        console.log('📊 Loading dashboard data...');

        if (!window.dataAPI) {
            throw new Error('DataAPI niet beschikbaar');
        }

        // Load all data from API
        console.log('🔄 Fetching data from API...');
        allRegistrations = await window.dataAPI.getRegistrations();
        console.log(`✅ Loaded ${allRegistrations.length} registrations`);

        allMembers = await window.dataAPI.getMembers();
        console.log(`✅ Loaded ${allMembers.length} members`);

        allPayments = await window.dataAPI.getPayments();
        console.log(`✅ Loaded ${allPayments.length} payments`);

        // Update statistics
        await updateDashboardStats();

        // Update recent activity
        updateRecentActivity();

        // Update upcoming competition
        updateUpcomingCompetition();

        console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        alert(`Fout bij laden van data: ${error.message}\n\nCheck de browser console (F12) voor details.`);
    }
}

// Update dashboard statistics
async function updateDashboardStats() {
    const stats = await window.dataAPI.getStatistics();

    // Update stat cards if they exist
    const statElements = {
        totalRegistrations: document.querySelector('.stat-card.blue h3'),
        paidCount: document.querySelector('.stat-card.green h3'),
        pendingCount: document.querySelector('.stat-card.orange h3')
    };

    if (statElements.totalRegistrations) {
        statElements.totalRegistrations.textContent = stats.totalRegistrations;
    }
    if (statElements.paidCount) {
        statElements.paidCount.textContent = stats.paidCount;
    }
    if (statElements.pendingCount) {
        statElements.pendingCount.textContent = stats.pendingCount;
    }

    console.log('📈 Statistics updated:', stats);
}

// Action functions (exposed globally for onclick handlers)
window.showNewRegistration = async function showNewRegistration() {
    // Load calendar data from parent window or script.js
    let competitions = [];

    console.log('📅 CalendarData beschikbaar?', !!window.calendarData);

    if (window.calendarData && window.calendarData.length > 0) {
        console.log('📅 CalendarData geladen, aantal events:', window.calendarData.length);

        // Filter only competitions (no meetings or BBQ)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        competitions = window.calendarData.filter(event => {
            // Parse datum (DD-MM-YYYY format)
            const [day, month, year] = event.datum.split('-').map(Number);
            const eventDate = new Date(year, month - 1, day);
            eventDate.setHours(0, 0, 0, 0);

            // Only include future competitions (not meetings or BBQ)
            return eventDate >= today &&
                   event.type !== 'vergadering' &&
                   event.type !== 'bbq';
        });

        console.log('📅 Gefilterde wedstrijden:', competitions.length);
    } else {
        console.warn('⚠️ CalendarData niet beschikbaar! Fallback naar demo data.');
        // Fallback to demo data
        competitions = [
            { datum: "21-02-2026", wedstrijdtype: "Clubwedstrijd", dag: "Zaterdag", type: "clubwedstrijd" },
            { datum: "28-02-2026", wedstrijdtype: "Vrije Gewone Wedstrijd", dag: "Zaterdag", type: "vrije-gewone" },
            { datum: "07-03-2026", wedstrijdtype: "Clubwedstrijd", dag: "Zaterdag", type: "clubwedstrijd" },
            { datum: "14-03-2026", wedstrijdtype: "Vrije Koppelwedstrijd", dag: "Zaterdag", type: "vrije-koppel" }
        ];
    }

    // Load members for autocomplete
    const members = await window.dataAPI.getMembers();
    console.log('👥 Leden geladen:', members.length);

    // Build members datalist
    let membersDatalist = '';
    const memberMap = {}; // Voor email lookup
    members.forEach(member => {
        const fullName = `${member.firstName} ${member.lastName}`;
        membersDatalist += `<option value="${fullName}" data-email="${member.email}">`;
        memberMap[fullName.toLowerCase()] = member.email;
    });

    // Build competition options
    let competitionOptions = '<option value="">Kies wedstrijd</option>';
    if (competitions.length === 0) {
        competitionOptions += '<option value="" disabled>Geen toekomstige wedstrijden gevonden</option>';
    } else {
        competitions.forEach(comp => {
            competitionOptions += `<option value="${comp.datum} - ${comp.wedstrijdtype}" data-type="${comp.type}">${comp.datum} - ${comp.wedstrijdtype} (${comp.dag})</option>`;
        });
    }

    const newRegForm = `
        <div id="newRegModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px;">Nieuwe Inschrijving</h3>
                <form id="newRegistrationForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Naam *</label>
                        <input type="text" id="regName" list="membersList" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;" placeholder="Typ een naam...">
                        <datalist id="membersList">
                            ${membersDatalist}
                        </datalist>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
                        <input type="email" id="regEmail" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Wedstrijd *</label>
                        <select id="regCompetition" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                            ${competitionOptions}
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Type <span style="color: #999; font-size: 12px;">(automatisch ingesteld)</span></label>
                        <select id="regType" required disabled style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; background: #f5f5f5;">
                            <option value="">Selecteer eerst een wedstrijd</option>
                            <option value="solo">Solo</option>
                            <option value="koppel">Koppel</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: #2c5f7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-save"></i> Opslaan
                        </button>
                        <button type="button" onclick="closeModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', newRegForm);

    // Auto-fill email when name is selected
    document.getElementById('regName').addEventListener('input', function(e) {
        const enteredName = e.target.value.toLowerCase().trim();
        const emailField = document.getElementById('regEmail');

        // Check if entered name matches a member
        if (memberMap[enteredName]) {
            emailField.value = memberMap[enteredName];
            console.log('✅ Email auto-filled voor:', enteredName);
        }
    });

    // Also check on blur (when user leaves the field)
    document.getElementById('regName').addEventListener('blur', function(e) {
        const enteredName = e.target.value.toLowerCase().trim();
        const emailField = document.getElementById('regEmail');

        if (memberMap[enteredName] && !emailField.value) {
            emailField.value = memberMap[enteredName];
        }
    });

    // Auto-set type based on competition selection
    document.getElementById('regCompetition').addEventListener('change', function(e) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const competitionType = selectedOption.getAttribute('data-type');
        const typeSelect = document.getElementById('regType');

        if (competitionType) {
            // Determine if it's a koppel competition
            const isKoppel = competitionType.includes('koppel') ||
                           competitionType === 'vrije-koppel' ||
                           competitionType === 'nachtkoppel';

            typeSelect.value = isKoppel ? 'koppel' : 'solo';
            typeSelect.disabled = false;
        } else {
            typeSelect.value = '';
            typeSelect.disabled = true;
        }
    });

    document.getElementById('newRegistrationForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const regData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            phone: document.getElementById('regPhone') ? document.getElementById('regPhone').value : '',
            competition: document.getElementById('regCompetition').value,
            type: document.getElementById('regType').value,
            paid: false
        };

        // Add via API
        const newReg = await window.dataAPI.addRegistration(regData);

        if (newReg) {
            await loadRegistrationsTable();
            await updateDashboardStats();
            closeModal();
            alert('✅ Inschrijving succesvol toegevoegd!');
        } else {
            alert('❌ Fout bij toevoegen inschrijving');
        }
    });
}

window.closeModal = function closeModal() {
    const modal = document.getElementById('newRegModal');
    if (modal) modal.remove();
}

window.exportRegistrations = function exportRegistrations() {
    window.dataAPI.exportToCSV(allRegistrations, 'inschrijvingen');
}

window.exportMembers = function exportMembers() {
    window.dataAPI.exportToCSV(allMembers, 'leden');
}

window.exportData = function exportData() {
    const data = {
        registrations: allRegistrations,
        payments: allPayments,
        members: allMembers
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visclub-sim-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('✅ Alle data geëxporteerd naar JSON!');
}

// Download ALL data including localStorage
window.downloadAllData = function downloadAllData() {
    // Collect all data from localStorage
    const allData = {
        timestamp: new Date().toISOString(),
        registrations: allRegistrations,
        payments: allPayments,
        members: allMembers,
        weighings: JSON.parse(localStorage.getItem('weighings') || '[]'),
        draws: {},
        permits: JSON.parse(localStorage.getItem('permits') || '[]'),
        contactMessages: JSON.parse(localStorage.getItem('contactMessages') || '[]'),
        calendarData: window.calendarData || []
    };

    // Collect all draw data
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('draw_')) {
            allData.draws[key] = JSON.parse(localStorage.getItem(key));
        }
    });

    // Create JSON file
    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visclub-sim-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('✅ Volledige database backup gedownload!');
}


async function editRegistration(id) {
    const reg = allRegistrations.find(r => r.id === id);
    if (!reg) {
        alert('⚠️  Inschrijving niet gevonden');
        return;
    }

    const editForm = `
        <div id="editRegModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px;">Inschrijving Bewerken #${id}</h3>
                <form id="editRegistrationForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Naam *</label>
                        <input type="text" id="editName" value="${reg.name}" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
                        <input type="email" id="editEmail" value="${reg.email}" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Betaling Status</label>
                        <select id="editPaid" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                            <option value="false" ${!reg.paid ? 'selected' : ''}>Openstaand</option>
                            <option value="true" ${reg.paid ? 'selected' : ''}>Betaald</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: #2c5f7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-save"></i> Opslaan
                        </button>
                        <button type="button" onclick="closeEditModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', editForm);

    document.getElementById('editRegistrationForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const updates = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            paid: document.getElementById('editPaid').value === 'true'
        };

        // Update via API
        const updated = await window.dataAPI.updateRegistration(id, updates);

        if (updated) {
            await loadRegistrationsTable();
            await updateDashboardStats();
            closeEditModal();
            alert('✅ Inschrijving bijgewerkt!');
        } else {
            alert('❌ Fout bij bijwerken inschrijving');
        }
    });
}

function closeEditModal() {
    const modal = document.getElementById('editRegModal');
    if (modal) modal.remove();
}

async function deleteRegistration(id) {
    if (confirm('⚠️ Weet je zeker dat je deze inschrijving wilt verwijderen?\n\nDit kan niet ongedaan gemaakt worden.')) {
        const success = await window.dataAPI.deleteRegistration(id);

        if (success) {
            await loadRegistrationsTable();
            await updateDashboardStats();
            alert('✅ Inschrijving verwijderd!');
        } else {
            alert('❌ Fout bij verwijderen inschrijving');
        }
    }
}

async function markPaid(paymentId) {
    const payment = allPayments.find(p => p.id === paymentId);
    if (!payment) {
        alert('⚠️  Betaling niet gevonden');
        return;
    }

    if (confirm(`💰 Markeer betaling ${payment.reference} als betaald?`)) {
        const updated = await window.dataAPI.updatePaymentStatus(paymentId, 'paid', 'cash');

        if (updated) {
            await loadPaymentsTable();
            await loadRegistrationsTable();
            await updateDashboardStats();
            alert('✅ Betaling gemarkeerd als betaald!');
        } else {
            alert('❌ Fout bij bijwerken betaling');
        }
    }
}

async function editMember(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) {
        alert('⚠️  Lid niet gevonden');
        return;
    }

    const fullName = `${member.firstName} ${member.lastName}`;

    const editForm = `
        <div id="editMemberModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px;">Lid Bewerken #${member.memberNumber}</h3>
                <form id="editMemberForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Voornaam *</label>
                        <input type="text" id="editMemberFirstName" value="${member.firstName}" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Achternaam *</label>
                        <input type="text" id="editMemberLastName" value="${member.lastName}" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
                        <input type="email" id="editMemberEmail" value="${member.email}" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Telefoon</label>
                        <input type="tel" id="editMemberPhone" value="${member.phone}" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: #2c5f7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-save"></i> Opslaan
                        </button>
                        <button type="button" onclick="closeMemberModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', editForm);

    document.getElementById('editMemberForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const updates = {
            firstName: document.getElementById('editMemberFirstName').value,
            lastName: document.getElementById('editMemberLastName').value,
            email: document.getElementById('editMemberEmail').value,
            phone: document.getElementById('editMemberPhone').value
        };

        const updated = await window.dataAPI.updateMember(memberId, updates);

        if (updated) {
            await loadMembersTable();
            closeMemberModal();
            alert('✅ Lid bijgewerkt!');
        } else {
            alert('❌ Fout bij bijwerken lid');
        }
    });
}

function closeMemberModal() {
    const modal = document.getElementById('editMemberModal') || document.getElementById('addMemberModal');
    if (modal) modal.remove();
}

async function deleteMember(memberId) {
    if (confirm('⚠️ Weet je zeker dat je dit lid wilt verwijderen?\n\nDit kan niet ongedaan gemaakt worden.')) {
        const success = await window.dataAPI.deleteMember(memberId);

        if (success) {
            await loadMembersTable();
            alert('✅ Lid verwijderd!');
        } else {
            alert('❌ Fout bij verwijderen lid');
        }
    }
}

function addCompetition() {
    alert('📅 Nieuwe wedstrijd toevoegen\n\nVoeg wedstrijden toe via de kalender pagina of bewerk script.js');
}

function importCalendar() {
    alert('📥 Kalender importeren\n\nDeze functie wordt binnenkort toegevoegd.\nMomenteel beheer je wedstrijden via script.js');
}

function addMember() {
    const addForm = `
        <div id="addMemberModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px;">Nieuw Lid Toevoegen</h3>
                <form id="addMemberForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Naam *</label>
                        <input type="text" id="newMemberName" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
                        <input type="email" id="newMemberEmail" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Telefoon *</label>
                        <input type="tel" id="newMemberPhone" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Type *</label>
                        <select id="newMemberType" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                            <option value="Jaarlid">Jaarlid</option>
                            <option value="Jeugd">Jeugd</option>
                            <option value="Senior">Senior</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: #2c5f7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-save"></i> Opslaan
                        </button>
                        <button type="button" onclick="closeMemberModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', addForm);

    document.getElementById('addMemberForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const [firstName, ...lastNameParts] = document.getElementById('newMemberName').value.trim().split(' ');
        const lastName = lastNameParts.join(' ') || firstName;

        const memberData = {
            firstName: firstName,
            lastName: lastName,
            email: document.getElementById('newMemberEmail').value,
            phone: document.getElementById('newMemberPhone').value,
            membershipType: document.getElementById('newMemberType').value
        };

        const newMember = await window.dataAPI.addMember(memberData);

        if (newMember) {
            await loadMembersTable();
            closeMemberModal();
            alert('✅ Nieuw lid toegevoegd!');
        } else {
            alert('❌ Fout bij toevoegen lid');
        }
    });
}

// Admin draw functionality
let adminDrawResults = [];

function startAdminDraw() {
    const competition = document.getElementById('drawCompetition').value;

    if (confirm(`Start plaatsentrekking voor:\n${competition}\n\nDoorgaan?`)) {
        // Simulate drawing
        const resultsDiv = document.getElementById('drawResults');
        resultsDiv.innerHTML = '<div class="loading">Trekking bezig...</div>';
        resultsDiv.style.display = 'block';

        setTimeout(() => {
            // Use real registrations from database - filter by selected competition
            const participants = allRegistrations.filter(r => r.competition === competition);

            if (participants.length === 0) {
                resultsDiv.innerHTML = '<div class="error-message" style="padding: 30px; text-align: center; color: #dc3545;"><i class="fas fa-exclamation-triangle"></i><p>Geen deelnemers gevonden voor deze wedstrijd!</p></div>';
                return;
            }

            const spots = shuffleArray(Array.from({ length: 43 }, (_, i) => i + 1));

            // Store results for pond map
            adminDrawResults = participants.map((p, i) => ({
                participant: { name: p.name, type: p.type, id: p.id },
                spot: spots[i],
                competition: competition
            }));

            // Save results to localStorage for homepage display
            localStorage.setItem('latest_draw_results', JSON.stringify({
                competition: competition,
                date: new Date().toISOString(),
                results: adminDrawResults
            }));

            let html = '<h3>Trekking Resultaten</h3>';

            // Add pond map
            html += `
                <div class="pond-map-container">
                    <h4><i class="fas fa-map-marked-alt"></i> Vijverkaart - Wedstrijdvijver SiM</h4>
                    <div class="pond-svg-wrapper">
                        <svg id="adminPondMap" viewBox="0 0 600 1000" xmlns="http://www.w3.org/2000/svg">
                            <rect class="pond-shape" x="50" y="50" width="500" height="900" rx="10" ry="10"/>
                            <g id="adminFishingSpots"></g>
                        </svg>
                    </div>
                    <div class="map-legend">
                        <div class="legend-item">
                            <div class="legend-circle occupied">12</div>
                            <span>Bezet (Geloot)</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-circle available">5</div>
                            <span>Beschikbaar</span>
                        </div>
                    </div>
                </div>
            `;

            // Add results list
            html += '<h4 style="margin-top: 2rem;"><i class="fas fa-list"></i> Deelnemers & Plaatsnummers</h4>';
            html += '<div class="results-list">';
            participants.forEach((p, i) => {
                html += `
                    <div class="result-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <span class="result-name" style="flex: 1; font-weight: 600;">${p.name}</span>
                        <span class="result-spot" style="padding: 6px 12px; background: #2c5f7d; color: white; border-radius: 6px; margin-right: 10px;">Plaats ${spots[i]}</span>
                        <button class="btn-small" onclick="editDrawSpot(${i})" style="padding: 6px 12px; background: #ffc107; border: none; border-radius: 6px; cursor: pointer;">
                            <i class="fas fa-edit"></i> Wijzig
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            html += '<div style="display: flex; gap: 10px; margin-top: 20px;">';
            html += '<button class="btn btn-primary" onclick="exportDrawResults()"><i class="fas fa-download"></i> Exporteer Resultaten</button>';
            html += '<button class="btn btn-primary" onclick="publishDrawResults()" style="background: #28a745;"><i class="fas fa-check"></i> Publiceer op Homepage</button>';
            html += '</div>';

            resultsDiv.innerHTML = html;

            // Initialize and update pond map
            initializeAdminPondMap();
            updateAdminPondMap();
        }, 2000);
    }
}

// Initialize admin pond map in rectangular layout
function initializeAdminPondMap() {
    const spotsContainer = document.getElementById('adminFishingSpots');
    if (!spotsContainer) return;

    spotsContainer.innerHTML = '';

    const spots = [];

    // Links: plaatsen 1-15 (plaats 15 boven, plaats 1 onder)
    for (let i = 0; i < 15; i++) {
        spots.push({
            number: 15 - i, // Omgekeerde volgorde: 15, 14, 13, ... 2, 1
            x: 50,
            y: 110 + (i * 56) // Van boven naar onder, 56px spacing
        });
    }

    // Boven (kort deel rechts): plaatsen 16-21 (van links naar rechts)
    for (let i = 0; i < 6; i++) {
        spots.push({
            number: 16 + i,
            x: 130 + (i * 68),
            y: 50
        });
    }

    // Rechts: plaatsen 22-37 (van boven naar onder)
    for (let i = 0; i < 16; i++) {
        spots.push({
            number: 22 + i,
            x: 550,
            y: 110 + (i * 53)
        });
    }

    // Onder: plaatsen 38-43 (van rechts naar links)
    for (let i = 0; i < 6; i++) {
        spots.push({
            number: 38 + i,
            x: 470 - (i * 68),
            y: 950
        });
    }

    // Create SVG elements for each spot
    spots.forEach(spot => {
        const spotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        spotGroup.classList.add('spot', 'available');
        spotGroup.setAttribute('data-spot', spot.number);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', spot.x);
        circle.setAttribute('cy', spot.y);
        circle.setAttribute('r', '18');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', spot.x);
        text.setAttribute('y', spot.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = spot.number;

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `Plaats ${spot.number} - Beschikbaar`;
        spotGroup.appendChild(title);

        spotGroup.appendChild(circle);
        spotGroup.appendChild(text);
        spotsContainer.appendChild(spotGroup);
    });
}

// Update admin pond map with draw results
function updateAdminPondMap() {
    adminDrawResults.forEach(result => {
        const spotElement = document.querySelector(`#adminFishingSpots [data-spot="${result.spot}"]`);
        if (spotElement) {
            spotElement.classList.remove('available');
            spotElement.classList.add('occupied');

            const title = spotElement.querySelector('title');
            if (title) {
                title.textContent = `Plaats ${result.spot} - ${result.participant.name}`;
            }
        }
    });
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function exportDrawResults() {
    if (adminDrawResults.length === 0) {
        alert('⚠️ Geen trekking resultaten om te exporteren!');
        return;
    }

    // Create CSV data
    let csv = 'Plaats,Naam,Type\n';
    adminDrawResults
        .sort((a, b) => a.spot - b.spot)
        .forEach(result => {
            csv += `${result.spot},"${result.participant.name}",${result.participant.type}\n`;
        });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plaatsentrekking-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    alert('✅ Trekking resultaten geëxporteerd naar CSV!');
}

// Edit individual draw spot
function editDrawSpot(index) {
    const result = adminDrawResults[index];
    const currentSpot = result.spot;

    const newSpot = prompt(`Wijzig plaats voor ${result.participant.name}\n\nHuidige plaats: ${currentSpot}\nVoer nieuwe plaats in (1-43):`, currentSpot);

    if (newSpot === null) return; // Cancel clicked

    const spotNumber = parseInt(newSpot);
    if (isNaN(spotNumber) || spotNumber < 1 || spotNumber > 43) {
        alert('❌ Ongeldige plaats! Kies een nummer tussen 1 en 43.');
        return;
    }

    // Check if spot is already taken
    const existingSpot = adminDrawResults.find((r, i) => r.spot === spotNumber && i !== index);
    if (existingSpot) {
        if (!confirm(`⚠️ Plaats ${spotNumber} is al toegewezen aan ${existingSpot.participant.name}.\n\nWilt u deze plaatsen omwisselen?`)) {
            return;
        }
        // Swap spots
        existingSpot.spot = currentSpot;
    }

    // Update spot
    result.spot = spotNumber;

    // Save to localStorage
    localStorage.setItem('latest_draw_results', JSON.stringify({
        competition: result.competition,
        date: new Date().toISOString(),
        results: adminDrawResults
    }));

    // Refresh display
    updateAdminPondMap();
    alert(`✅ Plaats gewijzigd! ${result.participant.name} heeft nu plaats ${spotNumber}.`);

    // Reload the draw to show updated results
    startAdminDraw();
}

// Publish draw results to homepage
function publishDrawResults() {
    if (adminDrawResults.length === 0) {
        alert('⚠️ Geen trekking resultaten om te publiceren!');
        return;
    }

    if (confirm(`📢 Publiceer trekking resultaten?\n\nDe resultaten worden zichtbaar op de homepage voor alle bezoekers.\n\nDoorgaan?`)) {
        // Save with published flag
        localStorage.setItem('published_draw_results', JSON.stringify({
            competition: adminDrawResults[0].competition,
            date: new Date().toISOString(),
            results: adminDrawResults,
            published: true
        }));

        alert('✅ Trekking resultaten gepubliceerd!\n\nDe resultaten zijn nu zichtbaar op de homepage.');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#registrationsTable input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }

    // Email form
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const recipients = document.querySelector('#emailForm select').value;
            const subject = document.querySelector('#emailForm input[type="text"]').value;
            const message = document.querySelector('#emailForm textarea').value;

            if (!subject || !message) {
                alert('⚠️ Vul alle velden in!');
                return;
            }

            if (confirm(`📧 Email versturen?\n\nOntvangers: ${recipients}\nOnderwerp: ${subject}\n\nDoorgaan?`)) {
                // Simuleer email verzending
                const loadingMsg = document.createElement('div');
                loadingMsg.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000; text-align: center;';
                loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #2c5f7d;"></i><p style="margin-top: 15px;">Email wordt verstuurd...</p>';
                document.body.appendChild(loadingMsg);

                setTimeout(() => {
                    loadingMsg.remove();
                    alert('✅ Email succesvol verzonden!');
                    emailForm.reset();
                }, 2000);
            }
        });
    }
}

// =============================================
// PERMITS MANAGEMENT
// =============================================

// Global permits cache
let allPermits = [];

// Load permits table
async function loadPermitsTable() {
    const tbody = document.getElementById('permitsTable');
    if (!tbody) return;

    allPermits = await window.dataAPI.getPermits();

    tbody.innerHTML = '';

    if (allPermits.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">Geen vergunningsaanvragen</td></tr>';
        updatePermitsStats();
        return;
    }

    allPermits.forEach(permit => {
        const row = document.createElement('tr');
        const appliedDate = permit.appliedAt ? new Date(permit.appliedAt).toLocaleDateString('nl-NL') : '';
        const fullName = `${permit.firstName} ${permit.lastName}`;

        const statusBadge = {
            'pending': '<span class="status-badge pending">In Behandeling</span>',
            'approved': '<span class="status-badge paid">Goedgekeurd</span>',
            'rejected': '<span class="status-badge">Afgekeurd</span>'
        }[permit.status] || '<span class="status-badge">Onbekend</span>';

        const permitTypeLabel = {
            'jaarvergunning': 'Jaarvergunning',
            'wedstrijdvisser': 'Wedstrijdvisser'
        }[permit.permitType] || permit.permitType;

        row.innerHTML = `
            <td>#${permit.id}</td>
            <td><strong>${fullName}</strong></td>
            <td>${permit.email}</td>
            <td>${permitTypeLabel}</td>
            <td>${permit.isYouth ? '<i class="fas fa-check" style="color: #28a745;"></i> Ja' : 'Nee'}</td>
            <td><strong>€${permit.amount}</strong></td>
            <td>${statusBadge}</td>
            <td>${appliedDate}</td>
            <td>
                <button class="btn-small" onclick="viewPermit(${permit.id})" title="Bekijk Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${permit.status === 'pending' ? `
                    <button class="btn-small" onclick="approvePermit(${permit.id})" title="Goedkeuren" style="background: #28a745;">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="btn-small" onclick="deletePermit(${permit.id})" title="Verwijderen">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updatePermitsStats();
    console.log(`📋 Loaded ${allPermits.length} permits into table`);
}

// Update permits statistics
function updatePermitsStats() {
    const totalEl = document.getElementById('permits-total');
    const pendingEl = document.getElementById('permits-pending');
    const approvedEl = document.getElementById('permits-approved');

    if (totalEl) totalEl.textContent = allPermits.length;
    if (pendingEl) pendingEl.textContent = allPermits.filter(p => p.status === 'pending').length;
    if (approvedEl) approvedEl.textContent = allPermits.filter(p => p.status === 'approved').length;
}

// Add new permit
function addPermit() {
    const modal = `
        <div id="permitModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin-bottom: 20px;">Nieuwe Vergunning Toevoegen</h3>
                <form id="addPermitForm">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Voornaam *</label>
                            <input type="text" id="permitFirstName" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Achternaam *</label>
                            <input type="text" id="permitLastName" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email *</label>
                        <input type="email" id="permitEmail" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Telefoon</label>
                        <input type="tel" id="permitPhone" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Geboortedatum</label>
                        <input type="date" id="permitBirthdate" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Type Vergunning *</label>
                        <select id="permitType" required style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px;">
                            <option value="jaarvergunning">Jaarvergunning (€75,00)</option>
                            <option value="wedstrijdvisser">Wedstrijdvisser (€60,00)</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="permitYouth" style="margin-right: 10px; width: 20px; height: 20px;">
                            <span style="font-weight: 600;">Jeugd (-16 jaar) - 50% korting</span>
                        </label>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" style="flex: 1; padding: 12px; background: #2c5f7d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-save"></i> Opslaan
                        </button>
                        <button type="button" onclick="closePermitModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> Annuleren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);

    document.getElementById('addPermitForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const permitData = {
            firstName: document.getElementById('permitFirstName').value,
            lastName: document.getElementById('permitLastName').value,
            email: document.getElementById('permitEmail').value,
            phone: document.getElementById('permitPhone').value,
            birthdate: document.getElementById('permitBirthdate').value,
            permitType: document.getElementById('permitType').value,
            isYouth: document.getElementById('permitYouth').checked
        };

        const newPermit = await window.dataAPI.addPermit(permitData);

        if (newPermit) {
            await loadPermitsTable();
            closePermitModal();
            alert(`✅ Vergunning toegevoegd!\n\nType: ${permitData.permitType}\nBedrag: €${newPermit.amount}`);
        } else {
            alert('❌ Fout bij toevoegen vergunning');
        }
    });
}

function closePermitModal() {
    const modal = document.getElementById('permitModal');
    if (modal) modal.remove();
}

// View permit details
function viewPermit(id) {
    const permit = allPermits.find(p => p.id === id);
    if (!permit) {
        alert('⚠️  Vergunning niet gevonden');
        return;
    }

    const fullName = `${permit.firstName} ${permit.lastName}`;
    const appliedDate = new Date(permit.appliedAt).toLocaleString('nl-NL');
    const approvedDate = permit.approvedAt ? new Date(permit.approvedAt).toLocaleString('nl-NL') : '-';

    const permitTypeLabel = permit.permitType === 'jaarvergunning' ? 'Jaarvergunning' : 'Wedstrijdvisser';

    alert(`📄 Vergunning Details\n\n` +
        `Naam: ${fullName}\n` +
        `Email: ${permit.email}\n` +
        `Telefoon: ${permit.phone}\n` +
        `Type: ${permitTypeLabel}\n` +
        `Jeugd: ${permit.isYouth ? 'Ja' : 'Nee'}\n` +
        `Bedrag: €${permit.amount}\n` +
        `Status: ${permit.status}\n` +
        `Aangevraagd: ${appliedDate}\n` +
        `Goedgekeurd: ${approvedDate}\n` +
        `\nNotities: ${permit.notes || 'Geen'}`);
}

// Approve permit
async function approvePermit(id) {
    if (confirm('✅ Vergunning goedkeuren?\n\nDe aanvrager zal een bevestiging ontvangen.')) {
        const updated = await window.dataAPI.updatePermit(id, {
            status: 'approved',
            notes: 'Vergunning goedgekeurd'
        });

        if (updated) {
            await loadPermitsTable();
            alert('✅ Vergunning goedgekeurd!');
        } else {
            alert('❌ Fout bij goedkeuren vergunning');
        }
    }
}

// Delete permit
async function deletePermit(id) {
    if (confirm('⚠️ Weet je zeker dat je deze vergunning wilt verwijderen?\n\nDit kan niet ongedaan gemaakt worden.')) {
        const success = await window.dataAPI.deletePermit(id);

        if (success) {
            await loadPermitsTable();
            alert('✅ Vergunning verwijderd!');
        } else {
            alert('❌ Fout bij verwijderen vergunning');
        }
    }
}

// Export permits
function exportPermits() {
    window.dataAPI.exportToCSV(allPermits, 'vergunningen');
}

// =============================================
// BOT TESTING FUNCTIONALITY
// =============================================

// Load bot script for testing
function loadBotForTesting() {
    // Check if bot is already loaded
    if (typeof WeerVangstBot === 'undefined') {
        // Load bot script dynamically
        const script = document.createElement('script');
        script.src = '../bot/weer-vangst-bot.js';
        script.onload = function() {
            console.log('✅ WeerVangstBot loaded for testing');
            window.testBot = new WeerVangstBot();
        };
        document.head.appendChild(script);
    } else {
        window.testBot = new WeerVangstBot();
    }
}

// Test bot with a question
function testBotQuestion(question) {
    const responseArea = document.getElementById('testResponseArea');

    if (!responseArea) return;

    // Show loading state
    responseArea.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #667eea;"></i>
            <p style="margin-top: 16px; color: #666;">Bot denkt na...</p>
        </div>
    `;

    // Initialize bot if needed
    if (typeof window.testBot === 'undefined') {
        loadBotForTesting();

        // Wait for bot to load
        setTimeout(() => testBotQuestion(question), 500);
        return;
    }

    // Get bot response
    setTimeout(() => {
        const response = window.testBot.processQuestion(question);

        // Format and display response
        let html = `
            <div style="margin-bottom: 16px; padding: 12px; background: #667eea; color: white; border-radius: 8px;">
                <strong>Vraag:</strong> ${question}
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef;">
        `;

        if (response.title) {
            html += `<h3 style="color: #667eea; margin-bottom: 16px;">${response.title}</h3>`;

            response.sections.forEach(section => {
                if (section.subtitle) {
                    html += `<h4 style="color: #333; margin: 16px 0 8px 0;">${section.subtitle}</h4>`;
                }

                section.content.forEach(line => {
                    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    line = line.replace(/• /g, '&bull; ');

                    if (line.trim() === '') {
                        html += '<br/>';
                    } else {
                        html += `<p style="margin: 6px 0; line-height: 1.6;">${line}</p>`;
                    }
                });
            });
        } else {
            html += `<p>${response}</p>`;
        }

        html += '</div>';

        responseArea.innerHTML = html;
    }, 600);
}

// Initialize bot testing when bot section is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Pre-load bot if on bot page
    const botSection = document.getElementById('section-bot');
    if (botSection) {
        loadBotForTesting();
    }
});

// Update recent activity list
function updateRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;

    const activities = [];

    // Add recent members
    allMembers.slice(-5).reverse().forEach(member => {
        activities.push({
            icon: 'fa-user-plus',
            iconColor: '#28a745',
            text: `Nieuw lid: ${member.firstName} ${member.lastName}`,
            time: member.createdAt ? timeAgo(new Date(member.createdAt)) : 'Recent',
            type: 'member'
        });
    });

    // Add recent registrations
    allRegistrations.slice(-10).reverse().forEach(reg => {
        const isPaid = reg.paid || reg.payment_status === 'paid';
        activities.push({
            icon: isPaid ? 'fa-check-circle' : 'fa-clock',
            iconColor: isPaid ? '#28a745' : '#ffc107',
            text: `${reg.name} ingeschreven voor ${reg.competition}`,
            subtext: isPaid ? 'Betaald' : 'Openstaand',
            time: reg.registeredAt ? timeAgo(new Date(reg.registeredAt)) : 'Recent',
            type: 'registration'
        });
    });

    // Check for recent draws
    if (window.calendarData) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        window.calendarData.forEach(comp => {
            const [day, month, year] = comp.datum.split('-').map(Number);
            const compDate = new Date(year, month - 1, day);
            compDate.setHours(0, 0, 0, 0);

            if (compDate >= today) {
                const drawKey = `draw_${comp.datum.replace(/-/g, '_')}`;
                const savedDraw = localStorage.getItem(drawKey);
                if (savedDraw) {
                    const drawData = JSON.parse(savedDraw);
                    activities.push({
                        icon: 'fa-random',
                        iconColor: '#667eea',
                        text: `Loting uitgevoerd: ${comp.wedstrijdtype}`,
                        subtext: `${drawData.results.length} deelnemers`,
                        time: drawData.timestamp ? timeAgo(new Date(drawData.timestamp)) : 'Recent',
                        type: 'draw'
                    });
                }
            }
        });
    }

    // Sort by most recent and limit to 15
    activities.sort((a, b) => {
        if (a.time === b.time) return 0;
        return a.time.includes('minuten') || a.time.includes('uur') ? -1 : 1;
    });

    const recentActivities = activities.slice(0, 15);

    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #999;">
                <i class="fas fa-history" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>Nog geen recente activiteit</p>
            </div>
        `;
        return;
    }

    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item" style="display: flex; gap: 15px; padding: 12px; border-bottom: 1px solid #f0f0f0;">
            <div style="width: 40px; height: 40px; background: ${activity.iconColor}22; color: ${activity.iconColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <p style="margin: 0; font-weight: 600; color: #333; font-size: 14px;">${activity.text}</p>
                ${activity.subtext ? `<p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">${activity.subtext}</p>` : ''}
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #999;">${activity.time}</p>
            </div>
        </div>
    `).join('');

    console.log('✅ Recent activity updated:', recentActivities.length, 'items');
}

// Update upcoming competition info
function updateUpcomingCompetition() {
    const statCard = document.querySelector('.stat-card.purple');
    if (!statCard || !window.calendarData) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find upcoming competitions
    const upcomingCompetitions = window.calendarData.filter(event => {
        const [day, month, year] = event.datum.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today &&
               event.type !== 'vergadering' &&
               event.type !== 'bbq';
    }).sort((a, b) => {
        const [dayA, monthA, yearA] = a.datum.split('-').map(Number);
        const [dayB, monthB, yearB] = b.datum.split('-').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA - dateB;
    });

    const count = upcomingCompetitions.length;
    const nextComp = upcomingCompetitions[0];

    const countEl = statCard.querySelector('h3');
    const trendEl = statCard.querySelector('small.trend');

    if (countEl) countEl.textContent = count;

    if (trendEl && nextComp) {
        const [day, month, year] = nextComp.datum.split('-').map(Number);
        const nextDate = new Date(year, month - 1, day);
        const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

        let timeText = '';
        if (daysUntil === 0) {
            timeText = 'Vandaag!';
        } else if (daysUntil === 1) {
            timeText = 'Morgen';
        } else if (daysUntil <= 7) {
            timeText = `Over ${daysUntil} dagen`;
        } else {
            timeText = nextComp.datum;
        }

        trendEl.innerHTML = `<i class="fas fa-calendar"></i> ${timeText} - ${nextComp.wedstrijdtype}`;
    }

    console.log('✅ Upcoming competition updated:', nextComp?.wedstrijdtype || 'None');
}

// Helper: Time ago function
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        jaar: 31536000,
        maand: 2592000,
        week: 604800,
        dag: 86400,
        uur: 3600,
        minuut: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);
        if (interval >= 1) {
            return interval === 1 ? `1 ${name} geleden` : `${interval} ${name === 'maand' ? 'maanden' : name + 'en'} geleden`;
        }
    }

    return 'Zojuist';
}

console.log('✅ Admin Dashboard loaded successfully');
