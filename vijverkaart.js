/**
 * Vijverkaart - Visvijver Plattegrond Functionaliteit
 * Handelt toewijzingen, visualisatie en publicatie
 */

class Vijverkaart {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            interactive: options.interactive !== false, // Default true
            showLegend: options.showLegend !== false,   // Default true
            showHeader: options.showHeader !== false,   // Default true
            onPlaatsClick: options.onPlaatsClick || null
        };
        this.toewijzingen = {}; // { plaatsNr: { naam, email } }
    }

    // Render de volledige vijverkaart
    render(toewijzingen = {}) {
        this.toewijzingen = toewijzingen;

        let html = '<div class="vijverkaart-container">';

        // Header
        if (this.options.showHeader) {
            html += `
                <div class="vijverkaart-header">
                    <h3><i class="fas fa-map-marked-alt"></i> Vijverkaart - De Aa in Geel</h3>
                    <p>43 visplaatsen rondom de vijver</p>
                </div>
            `;
        }

        // Vijver met plaatsen
        html += '<div class="vijver">';

        // Genereer alle 43 plaatsen
        for (let i = 1; i <= 43; i++) {
            const toewijzing = this.toewijzingen[i];
            const isBezet = !!toewijzing;
            const statusClass = isBezet ? 'bezet' : 'vrij';

            html += `
                <div class="visplaats ${statusClass}"
                     data-plaats="${i}"
                     ${this.options.interactive ? `onclick="window.vijverkaart.handlePlaatsClick(${i})"` : ''}>
                    ${i}
                    ${isBezet ? `<div class="visplaats-tooltip">${toewijzing.naam}</div>` : ''}
                </div>
            `;
        }

        html += '</div>'; // .vijver

        // Legende
        if (this.options.showLegend) {
            const aantalBezet = Object.keys(this.toewijzingen).length;
            const aantalVrij = 43 - aantalBezet;

            html += `
                <div class="vijverkaart-legende">
                    <div class="legende-item">
                        <div class="legende-icon bezet"></div>
                        <span>Bezet (${aantalBezet})</span>
                    </div>
                    <div class="legende-item">
                        <div class="legende-icon vrij"></div>
                        <span>Vrij (${aantalVrij})</span>
                    </div>
                </div>
            `;
        }

        html += '</div>'; // .vijverkaart-container

        this.container.innerHTML = html;
        window.vijverkaart = this; // Global reference voor onclick
    }

    // Handle klik op een plaats (voor admin)
    handlePlaatsClick(plaatsNr) {
        if (this.options.onPlaatsClick) {
            this.options.onPlaatsClick(plaatsNr, this.toewijzingen[plaatsNr]);
        }
    }

    // Update toewijzingen en re-render
    updateToewijzingen(toewijzingen) {
        this.toewijzingen = toewijzingen;
        this.render(toewijzingen);
    }

    // Automatisch vrije plaatsen toewijzen aan deelnemers
    autoToewijzen(deelnemers) {
        const bezettePlaatsen = new Set(Object.keys(this.toewijzingen).map(Number));
        const vrijePlaatsen = [];

        // Vind alle vrije plaatsen
        for (let i = 1; i <= 43; i++) {
            if (!bezettePlaatsen.has(i)) {
                vrijePlaatsen.push(i);
            }
        }

        // Shuffle vrije plaatsen voor random toewijzing
        for (let i = vrijePlaatsen.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [vrijePlaatsen[i], vrijePlaatsen[j]] = [vrijePlaatsen[j], vrijePlaatsen[i]];
        }

        // Wijs deelnemers toe aan vrije plaatsen
        const nieuweToewijzingen = { ...this.toewijzingen };
        deelnemers.forEach((deelnemer, index) => {
            if (index < vrijePlaatsen.length) {
                nieuweToewijzingen[vrijePlaatsen[index]] = {
                    naam: deelnemer.naam,
                    email: deelnemer.email
                };
            }
        });

        return nieuweToewijzingen;
    }

    // Exporteer toewijzingen naar JSON
    exportToewijzingen() {
        return {
            datum: new Date().toISOString(),
            wedstrijd: this.options.wedstrijdNaam || 'Onbekend',
            toewijzingen: this.toewijzingen,
            aantalDeelnemers: Object.keys(this.toewijzingen).length
        };
    }

    // Sla toewijzingen op in localStorage voor home pagina
    publiceerNaarHomepage(wedstrijdInfo) {
        const data = {
            ...this.exportToewijzingen(),
            wedstrijdNaam: wedstrijdInfo.naam,
            wedstrijdDatum: wedstrijdInfo.datum,
            wedstrijdType: wedstrijdInfo.type,
            gepubliceerdOp: new Date().toISOString()
        };

        localStorage.setItem('vijverkaart_actueel', JSON.stringify(data));
        console.log('✅ Vijverkaart gepubliceerd naar homepage');
        return data;
    }

    // Laad gepubliceerde vijverkaart (voor home pagina)
    static laadGepubliceerd() {
        const data = localStorage.getItem('vijverkaart_actueel');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Fout bij laden vijverkaart:', e);
                return null;
            }
        }
        return null;
    }

    // Verwijder gepubliceerde vijverkaart
    static verwijderGepubliceerd() {
        localStorage.removeItem('vijverkaart_actueel');
        console.log('🗑️ Vijverkaart verwijderd van homepage');
    }
}

// Helper functie om vijverkaart te tonen op home pagina
function toonVijverkaartOpHome() {
    const data = Vijverkaart.laadGepubliceerd();

    if (!data) {
        console.log('Geen gepubliceerde vijverkaart gevonden');
        return false;
    }

    // Check of wedstrijd nog actueel is (max 1 dag oud)
    const gepubliceerd = new Date(data.gepubliceerdOp);
    const nu = new Date();
    const verschilUren = (nu - gepubliceerd) / (1000 * 60 * 60);

    if (verschilUren > 24) {
        console.log('Vijverkaart is verlopen (> 24 uur oud)');
        Vijverkaart.verwijderGepubliceerd();
        return false;
    }

    // Maak container aan als die er nog niet is
    let container = document.getElementById('homepage-vijverkaart');
    if (!container) {
        // Voeg toe boven de hero sectie
        const heroSection = document.querySelector('.hero-section') || document.querySelector('.hero');
        if (heroSection) {
            container = document.createElement('div');
            container.id = 'homepage-vijverkaart';
            container.style.marginBottom = '40px';
            heroSection.parentNode.insertBefore(container, heroSection);
        } else {
            console.error('Hero sectie niet gevonden');
            return false;
        }
    }

    // Render vijverkaart
    const vijverkaart = new Vijverkaart('homepage-vijverkaart', {
        interactive: false,
        showHeader: true
    });

    // Update header met wedstrijd info
    vijverkaart.render(data.toewijzingen);

    // Voeg wedstrijd info toe aan header
    const header = container.querySelector('.vijverkaart-header');
    if (header) {
        header.innerHTML = `
            <h3><i class="fas fa-map-marked-alt"></i> Actuele Plaatsentrekking</h3>
            <p><strong>${data.wedstrijdNaam}</strong> - ${data.wedstrijdDatum}</p>
            <p style="font-size: 12px; color: #999; margin-top: 5px;">
                ${data.aantalDeelnemers} deelnemers • Laatst bijgewerkt: ${new Date(data.gepubliceerdOp).toLocaleString('nl-NL')}
            </p>
        `;
    }

    console.log('✅ Vijverkaart getoond op homepage');
    return true;
}

// Auto-load op home pagina - DISABLED (handled by home.html inline script)
// if (window.location.pathname.includes('home.html') || window.location.pathname === '/') {
//     window.addEventListener('DOMContentLoaded', () => {
//         setTimeout(toonVijverkaartOpHome, 500); // Wacht op DOM volledig geladen
//     });
// }
