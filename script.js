// ============================================
// TEST MODUS - Wijzig hier de test datum
// ============================================
const TEST_MODE = true; // Zet op false voor productie (NU AAN voor 2026 data)
const TEST_DATE = new Date('2026-01-15'); // Fictieve "vandaag" datum voor testen - begin 2026

// Functie om de huidige datum te krijgen (test of echt)
function getCurrentDate() {
    return TEST_MODE ? new Date(TEST_DATE) : new Date();
}

// Make TEST_MODE and getCurrentDate globally available
window.TEST_MODE = TEST_MODE;
window.getCurrentDate = getCurrentDate;

console.log('🧪 TEST MODUS:', TEST_MODE ? 'AAN - Test datum: ' + TEST_DATE.toLocaleDateString('nl-NL') : 'UIT');

// ============================================

// Calendar data from the CSV
const calendarData = [
    { datum: "23-01-2026", dag: "Vrijdag", wedstrijdtype: "Statutaire vergadering", maand: "Januari", tijd: "19:00u", prijs: "Gratis", type: "vergadering" },
    { datum: "21-02-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Februari", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "28-02-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Februari", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "07-03-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Maart", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "14-03-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Koppelwedstrijd", maand: "Maart", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "21-03-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Maart", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "28-03-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Maart", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "30-03-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 1", maand: "Maart", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "04-04-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "April", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "06-04-2026", dag: "Maandag", wedstrijdtype: "Koppelwedstrijd (Paasmaandag)", maand: "April", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "11-04-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "April", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "13-04-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 2", maand: "April", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "18-04-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "April", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "20-04-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 3", maand: "April", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "25-04-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "April", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "01-05-2026", dag: "Vrijdag", wedstrijdtype: "Koppelwedstrijd (Dag van de Arbeid)", maand: "Mei", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "02-05-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Mei", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "09-05-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Mei", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "14-05-2026", dag: "Donderdag", wedstrijdtype: "Koppelwedstrijd (O.L.H. Hemelvaart)", maand: "Mei", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "16-05-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Mei", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "23-05-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Mei", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "25-05-2026", dag: "Maandag", wedstrijdtype: "Vrije Koppelwedstrijd (Pinkstermaandag)", maand: "Mei", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "30-05-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Mei", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "01-06-2026", dag: "Maandag", wedstrijdtype: "Veteranen Koppelwedstrijd", maand: "Juni", tijd: "10:00u", prijs: "€20,00", type: "veteranen" },
    { datum: "03-06-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juni", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "06-06-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Juni", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "08-06-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 4", maand: "Juni", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "10-06-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juni", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "13-06-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Juni", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "15-06-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 5", maand: "Juni", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "17-06-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juni", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "20-06-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Koppelwedstrijd", maand: "Juni", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "24-06-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juni", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "27-06-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Juni", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "01-07-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juli", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "04-07-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Juli", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "06-07-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 6", maand: "Juli", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "08-07-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juli", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "11-07-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Juli", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "15-07-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juli", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "18-07-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd + BBQ", maand: "Juli", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "21-07-2026", dag: "Dinsdag", wedstrijdtype: "Koppelwedstrijd (Nationale Feestdag)", maand: "Juli", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "22-07-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juli", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "25-07-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Juli", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "27-07-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 7", maand: "Juli", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "29-07-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Juli", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "01-08-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "05-08-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Augustus", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "07-08-2026", dag: "Vrijdag", wedstrijdtype: "Nachtkoppelwedstrijd (3x 3u met 2x 1u pauze)", maand: "Augustus", tijd: "21:00u", prijs: "€30,00", type: "nachtkoppel" },
    { datum: "10-08-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 8", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "12-08-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Augustus", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "15-08-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "17-08-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 9", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "19-08-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Augustus", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "22-08-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Gewone Wedstrijd", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "vrije-gewone" },
    { datum: "26-08-2026", dag: "Woensdag", wedstrijdtype: "Avondwedstrijd", maand: "Augustus", tijd: "18:00u", prijs: "€10,00", type: "avondwedstrijd" },
    { datum: "29-08-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "31-08-2026", dag: "Maandag", wedstrijdtype: "Veteranenwedstrijd 10 (Sluitingsprijs)", maand: "Augustus", tijd: "11:00u", prijs: "€10,00", type: "veteranen" },
    { datum: "05-09-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "September", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "12-09-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "September", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "19-09-2026", dag: "Zaterdag", wedstrijdtype: "Vrije Koppelwedstrijd", maand: "September", tijd: "11:00u", prijs: "€20,00", type: "vrije-koppel" },
    { datum: "26-09-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "September", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "03-10-2026", dag: "Zaterdag", wedstrijdtype: "Clubwedstrijd", maand: "Oktober", tijd: "11:00u", prijs: "€10,00", type: "clubwedstrijd" },
    { datum: "06-10-2026", dag: "Dinsdag", wedstrijdtype: "Kermiswedstrijd", maand: "Oktober", tijd: "11:00u", prijs: "€10,00", type: "kermis" },
    { datum: "10-10-2026", dag: "Zaterdag", wedstrijdtype: "Criterium 1", maand: "Oktober", tijd: "11:00u", prijs: "€10,00", type: "criterium" },
    { datum: "17-10-2026", dag: "Zaterdag", wedstrijdtype: "Criterium 2", maand: "Oktober", tijd: "11:00u", prijs: "€10,00", type: "criterium" },
    { datum: "24-10-2026", dag: "Zaterdag", wedstrijdtype: "Criterium 3", maand: "Oktober", tijd: "11:00u", prijs: "€10,00", type: "criterium" },
    { datum: "07-11-2026", dag: "Zaterdag", wedstrijdtype: "Criterium 4", maand: "November", tijd: "11:00u", prijs: "€10,00", type: "criterium" },
    { datum: "14-11-2026", dag: "Zaterdag", wedstrijdtype: "Criterium 5 (Sluitingswedstrijd)", maand: "November", tijd: "11:00u", prijs: "€10,00", type: "criterium" },
    { datum: "04-12-2026", dag: "Vrijdag", wedstrijdtype: "Statutaire vergadering", maand: "December", tijd: "19:00u", prijs: "Gratis", type: "vergadering" }
];

// Make calendarData globally available
window.calendarData = calendarData;
console.log('📅 Calendar data loaded:', calendarData.length, 'events');

// DOM Elements
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('backToTop');
const calendarBody = document.getElementById('calendarBody');
const filterButtons = document.querySelectorAll('.filter-btn');
const competitionSelect = document.getElementById('competition');

// Mobile Navigation Toggle
hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scrolling and active nav link (only for anchor links)
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');

        // Only prevent default and do smooth scrolling for anchor links (starting with #)
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        }
        // For regular page links (.html files), let the browser handle navigation normally
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const backToTop = document.getElementById('backToTop');
    if (navbar && window.scrollY > 100) {
        navbar.classList.add('scrolled');
        if (backToTop) backToTop.classList.add('visible');
    } else {
        if (navbar) navbar.classList.remove('scrolled');
        if (backToTop) backToTop.classList.remove('visible');
    }
});

// Back to top button
backToTop?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Check if registration is open (always open for future competitions)
function isRegistrationOpen(dateString) {
    const [day, month, year] = dateString.split('-');
    const competitionDate = new Date(year, month - 1, day);
    const now = getCurrentDate();
    const hoursUntilCompetition = (competitionDate - now) / (1000 * 60 * 60);

    // Registration is always open as long as competition hasn't started yet
    return hoursUntilCompetition > 0;
}

// Get time until registration opens (not used anymore - registration always open)
function getTimeUntilRegistration(dateString) {
    // Registration is always open for future competitions, so this always returns null
    return null;
}

// Load calendar data
function loadCalendar(filter = 'all') {
    if (!calendarBody) return;

    calendarBody.innerHTML = '';

    const filteredData = filter === 'all'
        ? calendarData
        : calendarData.filter(event => event.type === filter);

    filteredData.forEach(event => {
        const row = document.createElement('tr');
        const canRegister = isRegistrationOpen(event.datum);

        let buttonHtml;
        if (canRegister) {
            buttonHtml = `<button class="btn btn-primary btn-sm" onclick="quickRegister('${event.wedstrijdtype}', '${event.datum}')">
                <i class="fas fa-check-circle"></i> Inschrijven
            </button>`;
        } else {
            buttonHtml = `<button class="btn btn-secondary btn-sm" disabled>
                <i class="fas fa-times-circle"></i> Gesloten
            </button>`;
        }

        row.innerHTML = `
            <td>${event.datum}</td>
            <td>${event.dag}</td>
            <td><span class="event-type ${event.type}">${event.wedstrijdtype}</span></td>
            <td>${event.tijd}</td>
            <td><strong>${event.prijs}</strong></td>
            <td>${buttonHtml}</td>
        `;
        calendarBody.appendChild(row);
    });

    // Update calendar every minute to refresh registration status
    setTimeout(() => loadCalendar(filter), 60000);
}

// Filter calendar
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');

        // Filter calendar
        const filter = this.dataset.filter;
        loadCalendar(filter);
    });
});

// Populate competition select
function populateCompetitionSelect() {
    if (!competitionSelect) return;

    competitionSelect.innerHTML = '<option value="">Kies een wedstrijd</option>';

    const now = getCurrentDate();
    let nextCompetitionIndex = -1;
    let firstUpcomingFound = false;

    calendarData.forEach((event, index) => {
        if (event.type !== 'vergadering' && event.type !== 'bbq') {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${event.datum} - ${event.wedstrijdtype}`;
            competitionSelect.appendChild(option);

            // Find the first upcoming competition
            if (!firstUpcomingFound) {
                const [day, month, year] = event.datum.split('-').map(Number);
                const eventDate = new Date(year, month - 1, day);

                if (eventDate >= now) {
                    nextCompetitionIndex = competitionSelect.options.length - 1; // Index in select
                    firstUpcomingFound = true;
                }
            }
        }
    });

    // Auto-select the next upcoming competition
    if (nextCompetitionIndex > 0) {
        competitionSelect.selectedIndex = nextCompetitionIndex;
    }
}

// Quick register function
function quickRegister(competitionName, date) {
    // Check if we're on the same page with registration form
    const registrationSection = document.getElementById('inschrijven');
    if (registrationSection) {
        // On same page - scroll to form
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = registrationSection.offsetTop - navHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Pre-select the competition
        setTimeout(() => {
            const selectOptions = competitionSelect.options;
            for (let i = 0; i < selectOptions.length; i++) {
                if (selectOptions[i].textContent.includes(date)) {
                    competitionSelect.selectedIndex = i;
                    break;
                }
            }
        }, 500);
    } else {
        // On different page - redirect to registration page with competition info
        // Store competition info in sessionStorage
        sessionStorage.setItem('preselectedCompetition', JSON.stringify({
            name: competitionName,
            date: date
        }));
        // Redirect to registration page
        window.location.href = 'inschrijven.html';
    }
}

// Show/hide partner fields based on competition type (automatic detection)
function checkIfKoppelWedstrijd() {
    const partnerGroup = document.getElementById('partnerGroup');
    const partnerFirstName = document.getElementById('partnerFirstName');
    const partnerLastName = document.getElementById('partnerLastName');

    if (!competitionSelect || !partnerGroup) return;

    const selectedOption = competitionSelect.options[competitionSelect.selectedIndex];
    if (!selectedOption || !selectedOption.textContent) return;

    const selectedText = selectedOption.textContent.toLowerCase();
    const isKoppel = selectedText.includes('koppel');

    if (isKoppel) {
        partnerGroup.style.display = 'block';
        if (partnerFirstName) partnerFirstName.required = true;
        if (partnerLastName) partnerLastName.required = true;
    } else {
        partnerGroup.style.display = 'none';
        if (partnerFirstName) partnerFirstName.required = false;
        if (partnerLastName) partnerLastName.required = false;
    }
}

// Listen for competition selection changes
competitionSelect?.addEventListener('change', checkIfKoppelWedstrijd);

// Also check on page load (for pre-selected competition)
window.addEventListener('load', () => {
    setTimeout(checkIfKoppelWedstrijd, 500);
});

// Registration Form Submission
const registrationForm = document.getElementById('registrationForm');
registrationForm?.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // Check if registration is still open
    const selectedCompetition = competitionSelect.options[competitionSelect.selectedIndex];
    if (selectedCompetition) {
        const competitionDate = selectedCompetition.textContent.split(' - ')[0];
        if (!isRegistrationOpen(competitionDate)) {
            alert('Sorry, de inschrijving voor deze wedstrijd is gesloten. De wedstrijd is al gestart of afgelopen.');
            return;
        }
    }

    console.log('Registration data:', data);

    // Get competition fee
    const competitionFee = data.competition ? getCompetitionFeeFromSelect(data.competition) : '€10,00';

    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Check payment method
    const paymentMethod = data.paymentMethod || 'qr';

    if (paymentMethod === 'onsite') {
        // Show onsite payment confirmation
        showOnsitePaymentConfirmation(competitionFee, referenceNumber, data);
    } else {
        // Show QR payment modal
        showPaymentModal(competitionFee, referenceNumber, data);
    }

    // Reset form
    this.reset();
    const partnerGroup = document.getElementById('partnerGroup');
    if (partnerGroup) partnerGroup.style.display = 'none';
});

// Generate reference number
function generateReferenceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INS-${year}-${month}-${random}`;
}

// Get competition fee from select
function getCompetitionFeeFromSelect(competitionIndex) {
    if (!competitionIndex) return '€10,00';
    const event = calendarData[competitionIndex];
    return event ? event.prijs : '€10,00';
}

// Save registration to database via API
async function saveRegistrationToDatabase(registrationData, reference, amount, paymentMethod) {
    // Get competition info from select
    const competitionSelect = document.getElementById('competition');
    const selectedOption = competitionSelect.options[competitionSelect.selectedIndex];
    const competitionText = selectedOption ? selectedOption.textContent : registrationData.competition;

    const data = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email || '',
        phone: registrationData.phone || '',
        partnerFirstName: registrationData.partnerFirstName || '',
        partnerLastName: registrationData.partnerLastName || '',
        competition: competitionText,
        paymentMethod: paymentMethod,
        paymentReference: reference,
        amount: amount,
        remarks: registrationData.remarks || ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}/public/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✅ Inschrijving opgeslagen in database:', result);
            return result;
        } else {
            console.error('❌ Fout bij opslaan inschrijving:', result.error);
            // Fallback to localStorage if API fails
            saveRegistrationToLocalStorage(registrationData, reference, amount, paymentMethod);
            return null;
        }
    } catch (error) {
        console.error('Error saving registration:', error);
        // Fallback to localStorage if API fails
        saveRegistrationToLocalStorage(registrationData, reference, amount, paymentMethod);
        return null;
    }
}

// Fallback: Save registration to localStorage
function saveRegistrationToLocalStorage(registrationData, reference, amount, paymentMethod) {
    const registration = {
        id: Date.now().toString(),
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email || '',
        phone: registrationData.phone || '',
        competition: registrationData.competition,
        partner: registrationData.partnerFirstName ? `${registrationData.partnerFirstName} ${registrationData.partnerLastName}` : '',
        type: registrationData.partnerFirstName ? 'koppel' : 'solo',
        remarks: registrationData.remarks || '',
        reference: reference,
        amount: amount,
        paymentMethod: paymentMethod,
        paid: false,
        date: new Date().toISOString(),
        status: 'pending'
    };

    let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
    registrations.push(registration);
    localStorage.setItem('registrations', JSON.stringify(registrations));

    console.log('📝 Inschrijving opgeslagen in localStorage (fallback):', registration);
    return registration;
}

// Show onsite payment confirmation (betalen ter plaatse)
async function showOnsitePaymentConfirmation(amount, reference, registrationData) {
    // Save to database
    await saveRegistrationToDatabase(registrationData, reference, amount, 'onsite');

    alert(`✅ Inschrijving succesvol!

Naam: ${registrationData.firstName} ${registrationData.lastName}
${registrationData.partnerFirstName ? 'Partner: ' + registrationData.partnerFirstName + ' ' + registrationData.partnerLastName : ''}

Referentie: ${reference}
Bedrag: ${amount}

💰 Betaal ter plaatse op de dag van de wedstrijd.

Je ontvangt een bevestigingsmail.

Tot dan! 🎣`);
}

// Show payment modal
async function showPaymentModal(amount, reference, registrationData) {
    // Save to database first
    await saveRegistrationToDatabase(registrationData, reference, amount, 'qr');

    const modal = document.getElementById('paymentModal');
    const qrcodeContainer = document.getElementById('qrcode');

    // Clear previous QR code
    qrcodeContainer.innerHTML = '';

    // Set amount
    document.getElementById('paymentAmount').textContent = amount;
    document.getElementById('paymentReference').textContent = reference;

    // Update bank account (voeg hier je echte rekeningnummer toe)
    document.getElementById('bankAccount').textContent = 'BE00 0000 0000 0000'; // Vervang met echt nummer

    // Generate QR code for payment
    // Using EPC QR Code standard for SEPA payments
    const beneficiary = 'Visclub SiM';
    const iban = 'BE00000000000000'; // Vervang met echt IBAN
    const amountNum = amount.replace('€', '').replace(',', '.');

    // EPC QR Code format
    const epcData = [
        'BCD',           // Service Tag
        '002',           // Version
        '1',             // Character set (1 = UTF-8)
        'SCT',           // Identification
        '',              // BIC (optional)
        beneficiary,     // Beneficiary name
        iban,            // Beneficiary account
        `EUR${amountNum}`, // Amount
        '',              // Purpose (optional)
        reference,       // Reference
        '',              // Beneficiary to originator information
        ''               // Remittance information
    ].join('\n');

    // Generate QR code
    new QRCode(qrcodeContainer, {
        text: epcData,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    // Show modal
    modal.classList.add('active');

    // Store registration data for later
    sessionStorage.setItem('lastRegistration', JSON.stringify({
        ...registrationData,
        amount,
        reference,
        timestamp: new Date().toISOString()
    }));
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const btn = element.nextElementSibling;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.background = 'var(--success)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Kopiëren mislukt. Selecteer de tekst handmatig.');
    });
}

// Print payment details
function printPayment() {
    window.print();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    console.log('Contact data:', data);

    // Save message to localStorage for admin panel
    const message = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: data.contactName || 'Onbekend',
        email: data.contactEmail || 'geen@email.com',
        subject: data.contactSubject || 'Geen onderwerp',
        message: data.contactMessage || '',
        date: new Date().toISOString(),
        status: 'unread'
    };

    // Get existing messages
    const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    messages.push(message);
    localStorage.setItem('contact_messages', JSON.stringify(messages));

    // Show success message
    alert('✅ Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.');

    // Reset form
    this.reset();
});

// Open Maps button
const openMapsBtn = document.getElementById('openMapsBtn');
openMapsBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    // Actual address for Visclub SiM
    const location = 'Nijverheidsstraat 6, 2330 Merksplas, België';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank');
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.about-card, .stat-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Weather App
async function loadWeather() {
    const weatherContainer = document.getElementById('weatherContainer');
    if (!weatherContainer) return;

    try {
        // Using OpenWeatherMap API - Free tier
        const API_KEY = ''; // You'll need to add your API key here
        const city = 'Merksplas,BE';

        // For demo purposes, showing a static weather display
        // In production, uncomment below and add API key
        /*
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=nl`);
        const data = await response.json();
        */

        // Demo data for Merksplas
        const data = {
            main: {
                temp: 15,
                feels_like: 13,
                humidity: 75,
                pressure: 1013
            },
            weather: [{
                description: 'gedeeltelijk bewolkt',
                icon: '02d'
            }],
            wind: {
                speed: 12
            },
            name: 'Merksplas'
        };

        weatherContainer.innerHTML = `
            <div class="weather-current">
                <div class="weather-main">
                    <div class="weather-icon">
                        <i class="fas fa-cloud-sun"></i>
                    </div>
                    <div>
                        <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                        <div class="weather-description">${data.weather[0].description}</div>
                    </div>
                </div>
                <div class="weather-location">
                    <h3><i class="fas fa-map-marker-alt"></i> ${data.name}</h3>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail-item">
                    <i class="fas fa-temperature-low"></i>
                    <strong>${Math.round(data.main.feels_like)}°C</strong>
                    <span>Gevoelstemperatuur</span>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-tint"></i>
                    <strong>${data.main.humidity}%</strong>
                    <span>Luchtvochtigheid</span>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-wind"></i>
                    <strong>${Math.round(data.wind.speed)} km/u</strong>
                    <span>Windsnelheid</span>
                </div>
                <div class="weather-detail-item">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <strong>${data.main.pressure} hPa</strong>
                    <span>Luchtdruk</span>
                </div>
            </div>
            <div style="text-align: center; margin-top: 1rem; opacity: 0.8; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> Weergegevens worden elk uur bijgewerkt
            </div>
        `;
    } catch (error) {
        console.error('Error loading weather:', error);
        weatherContainer.innerHTML = `
            <div class="weather-loading">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Kon weergegevens niet laden. Probeer het later opnieuw.</p>
            </div>
        `;
    }
}

// Permit Form Submission
// NOTE: visvergunning.html has its own submit handler that uses the API
// Only add this localStorage-based handler if the page doesn't have one already
const permitForm = document.getElementById('permitForm');
if (permitForm && !permitForm.dataset.hasCustomHandler) {
    permitForm.addEventListener('submit', function(e) {
        e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    console.log('Permit application data:', data);

    // Get existing applications to check for duplicates
    const applications = JSON.parse(localStorage.getItem('mock_permits') || '[]');

    // Check for duplicates by email or rijksregisternummer
    const duplicate = applications.find(app =>
        app.email.toLowerCase() === (data.email || '').toLowerCase() ||
        (app.rijksregisternummer && data.rijksregisternummer && app.rijksregisternummer === data.rijksregisternummer)
    );

    if (duplicate) {
        alert(`⚠️ Je hebt al een vergunning aangevraagd!\n\nEr bestaat al een aanvraag met dit email adres of rijksregisternummer.\nStatus: ${duplicate.status === 'pending' ? 'In Afwachting' : duplicate.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}\n\nNeem contact op met de administratie voor meer informatie.`);
        return;
    }

    // Save permit application to localStorage for admin approval
    const permitApplication = {
        id: 'permit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        street: data.street || '',
        city: data.city || '',
        postal: data.postal || '',
        birthdate: data.birthdate || '',
        rijksregisternummer: data.rijksregisternummer || '',
        permitType: data.permitType || '',
        remarks: data.remarks || '',
        applicationDate: new Date().toISOString(),
        status: 'pending', // pending, approved, rejected
        approvedBy: null,
        approvedDate: null
    };

    // Add to existing applications array (already loaded above)
    applications.push(permitApplication);
    localStorage.setItem('mock_permits', JSON.stringify(applications));

    // Show success message
    alert('✅ Bedankt voor je aanvraag! Je aanvraag is ontvangen en wordt zo snel mogelijk behandeld door onze administratie.\n\nJe ontvangt bericht zodra je vergunning is goedgekeurd.');

    // Reset form
    this.reset();
    });
}

// Load published draw results on homepage
function loadPublishedDrawResults() {
    const drawData = localStorage.getItem('published_draw_results');

    if (!drawData) {
        return; // No published results
    }

    try {
        const data = JSON.parse(drawData);

        if (!data.published || !data.results || data.results.length === 0) {
            return;
        }

        // Show the section
        const section = document.getElementById('drawResultsSection');
        if (section) {
            section.style.display = 'block';
        }

        // Update title
        const titleEl = document.getElementById('drawCompetitionTitle');
        if (titleEl) {
            titleEl.textContent = data.competition;
        }

        // Build results HTML
        const container = document.getElementById('drawResultsContainer');
        if (container) {
            let html = '<div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">';
            html += '<h3 style="margin-bottom: 20px; color: #2c5f7d;"><i class="fas fa-list-ol"></i> Gelote Plaatsen</h3>';
            html += '<div style="display: grid; gap: 10px;">';

            // Sort by spot number
            const sortedResults = data.results.sort((a, b) => a.spot - b.spot);

            sortedResults.forEach(result => {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2c5f7d;">
                        <div>
                            <strong style="font-size: 18px; color: #2c5f7d;">Plaats ${result.spot}</strong>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; font-size: 16px;">${result.participant.name}</div>
                            <div style="font-size: 14px; color: #666;">${result.participant.type === 'solo' ? 'Individueel' : 'Koppel'}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            html += `<div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px; text-align: center;">`;
            html += `<i class="fas fa-info-circle" style="color: #0066cc;"></i> `;
            html += `<span style="color: #0066cc;">Geloot op ${new Date(data.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>`;
            html += `</div>`;
            html += '</div>';

            container.innerHTML = html;
        }

    } catch (error) {
        console.error('Error loading draw results:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCalendar();
    populateCompetitionSelect();
    loadWeather();
    loadPublishedDrawResults();
});
