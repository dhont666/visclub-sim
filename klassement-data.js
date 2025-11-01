/**
 * Klassement Data Management
 * Gebruikt localStorage voor opslag
 */

// ============================================
// DATA STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    MEMBERS: 'mock_members', // Changed to use same storage as admin panel
    RESULTS: 'visclub_results',
    COMPETITIONS: 'visclub_competitions'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Haal data uit localStorage
 */
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Sla data op in localStorage
 */
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Bereken klassement (laagste score wint)
 */
function calculateRanking(results, type = 'club', maxCompetitions = null) {
    const memberScores = {};

    // Groepeer resultaten per lid
    results.forEach(result => {
        if (!memberScores[result.memberId]) {
            memberScores[result.memberId] = {
                memberId: result.memberId,
                memberName: result.memberName,
                scores: [],
                competitions: 0
            };
        }
        memberScores[result.memberId].scores.push(result.points);
    });

    // Bereken totalen
    const ranking = Object.values(memberScores).map(member => {
        // Sorteer scores (laagste eerst)
        member.scores.sort((a, b) => a - b);

        // Voor clubklassement: beste 15 van 20
        const countedScores = maxCompetitions
            ? member.scores.slice(0, maxCompetitions)
            : member.scores;

        const totalPoints = countedScores.reduce((sum, score) => sum + score, 0);
        const avgPoints = countedScores.length > 0
            ? (totalPoints / countedScores.length).toFixed(2)
            : 0;

        return {
            memberId: member.memberId,
            memberName: member.memberName,
            totalPoints,
            competitions: countedScores.length,
            avgPoints: parseFloat(avgPoints),
            allScores: member.scores
        };
    });

    // Sorteer op totaal punten (laagste eerst)
    ranking.sort((a, b) => a.totalPoints - b.totalPoints);

    // Voeg rang toe
    ranking.forEach((member, index) => {
        member.rank = index + 1;
    });

    return ranking;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render klassement tabel
 */
function renderRanking(ranking, bodyId, statsPrefix) {
    const tbody = document.getElementById(bodyId);

    if (!tbody) return;

    if (ranking.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-info-circle" style="font-size: 32px; margin-bottom: 10px;"></i>
                    <p>Nog geen resultaten beschikbaar</p>
                    <p style="font-size: 14px; margin-top: 10px;">
                        <a href="admin/klassement-beheer.html">Resultaten invoeren</a>
                    </p>
                </td>
            </tr>
        `;
        return;
    }

    // Update statistieken
    document.getElementById(`${statsPrefix}-participants`).textContent = ranking.length;
    document.getElementById(`${statsPrefix}-competitions`).textContent =
        ranking[0]?.competitions || 0;
    const avgPoints = ranking.reduce((sum, m) => sum + m.avgPoints, 0) / ranking.length;
    document.getElementById(`${statsPrefix}-avg-points`).textContent = avgPoints.toFixed(2);

    // Render tabel rijen
    tbody.innerHTML = ranking.map(member => {
        const rankClass = member.rank <= 3 ? `rank-${member.rank}` : 'rank-other';
        const rankIcon = member.rank <= 3
            ? `<i class="fas fa-trophy"></i>`
            : member.rank;

        return `
            <tr>
                <td>
                    <div class="rank-medal ${rankClass}">
                        ${rankIcon}
                    </div>
                </td>
                <td><strong>${member.memberName}</strong></td>
                <td><span class="points-badge">${member.totalPoints}</span></td>
                <td>${member.competitions}</td>
                <td>${member.avgPoints}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Load en render clubklassement
 */
function loadClubRanking() {
    const results = getData(STORAGE_KEYS.RESULTS)
        .filter(r => r.competitionType === 'clubwedstrijd');

    const ranking = calculateRanking(results, 'club', 15); // Beste 15
    renderRanking(ranking, 'club-ranking-body', 'club');
}

/**
 * Load en render veteranenklassement
 */
function loadVeteranRanking() {
    const results = getData(STORAGE_KEYS.RESULTS)
        .filter(r => r.competitionType === 'veteranen');

    const ranking = calculateRanking(results, 'veteran', 7); // Beste 7 van 11 wedstrijden
    renderRanking(ranking, 'vet-ranking-body', 'vet');
}

// ============================================
// TAB SWITCHING
// ============================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;

            // Update active states
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadClubRanking();
    loadVeteranRanking();

    // Auto refresh elke 30 seconden
    setInterval(() => {
        loadClubRanking();
        loadVeteranRanking();
    }, 30000);
});

// ============================================
// DEMO DATA - REMOVED
// ============================================
// Demo data is verwijderd. Data wordt nu beheerd via het admin panel.
