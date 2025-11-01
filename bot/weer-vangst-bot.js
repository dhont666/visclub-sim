/**
 * Visclub SiM - Weer & Vangst Bot
 *
 * Deze bot geeft advies over:
 * - Beste vistijden per seizoen en vissoort
 * - Weersomstandigheden (luchtdruk, wind, temperatuur)
 * - Beste aas per seizoen en doelvis
 * - Maanfase invloeden
 */

class WeerVangstBot {
    constructor() {
        this.name = "Vis Advies Bot";
        this.version = "1.0.0";
        this.enabled = true;

        // Kennisbank opgebouwd uit onderzoek
        this.kennisbank = {
            vissoorten: {
                karper: {
                    naam: "Karper",
                    beschrijving: "Populaire doelvis voor wedstrijdvissen",
                    seizoenen: {
                        lente: {
                            maanden: ["maart", "april", "mei"],
                            activiteit: "hoog",
                            tips: [
                                "Vanaf maart wanneer watertemperatuur stijgt beginnen karpers weer voedsel te zoeken",
                                "Lente is een uitstekend seizoen om te karpervissen",
                                "Karpers zijn actiever naarmate het water warmer wordt"
                            ],
                            aas: ["boilies", "mais", "wormen", "maden"]
                        },
                        zomer: {
                            maanden: ["juni", "juli", "augustus"],
                            activiteit: "zeer hoog",
                            tips: [
                                "Vanaf augustus gaan karpers volop azen - dit is DE periode!",
                                "Tijdens zomermaanden aast karper het liefst tijdens frissere momenten: 's avonds, 's nachts en 's morgens",
                                "Onweersbuien zorgen voor extra activiteit",
                                "Genoeg zuurstof in water is cruciaal"
                            ],
                            aas: ["boilies", "mais", "tijgernoten", "pellets"]
                        },
                        herfst: {
                            maanden: ["september", "oktober", "november"],
                            activiteit: "hoog",
                            tips: [
                                "September is een prachtige maand om te karpervissen",
                                "Niet meer zo warm en genoeg zuurstof in het water",
                                "Karpers blijven actief azen tot oktober",
                                "Goede periode voor mooie vangsten"
                            ],
                            aas: ["boilies", "mais", "tijgernoten"]
                        },
                        winter: {
                            maanden: ["december", "januari", "februari"],
                            activiteit: "laag",
                            tips: [
                                "Karpers zijn minder actief in koud water",
                                "Metabolisme vertraagt bij lage temperaturen",
                                "Moeilijker seizoen voor karpervissen"
                            ],
                            aas: ["kleine boilies", "maden"]
                        }
                    }
                },
                snoekbaars: {
                    naam: "Snoekbaars",
                    beschrijving: "Populaire roofvis",
                    gesloten_tijd: "1 april tot laatste zaterdag van mei",
                    seizoenen: {
                        voorjaar: {
                            tips: [
                                "Gesloten tijd: 1 april tot eind mei",
                                "Eind maart en begin seizoen (eind mei): gebruik klein aas zoals speldaas",
                                "Snoekbaarzen zijn lichtschuw met extreem goede ogen"
                            ],
                            aas: ["klein aas", "speldaas", "kleine shads (5-10cm)"]
                        },
                        zomer: {
                            maanden: ["juni", "juli", "augustus"],
                            tips: [
                                "Bewolking en minder lichte omstandigheden zijn perfect",
                                "In juni-augustus werkt aas van 5-10cm goed",
                                "Beetje bewolking is ideaal voor snoekbaars"
                            ],
                            aas: ["shads 5-10cm", "softbaits", "dode visjes"]
                        },
                        najaar: {
                            tips: [
                                "Vanaf september mag groter aas gebruikt worden",
                                "Snoekbaars is actief in najaar",
                                "Grotere prooien worden nu geaccepteerd"
                            ],
                            aas: ["grotere shads", "grotere softbaits", "stukjes vis"]
                        }
                    },
                    weer: {
                        licht: "Lichtschuw - beetje bewolking is perfect",
                        beste_condities: "Bewolkt, niet te helder"
                    }
                },
                brasem: {
                    naam: "Brasem",
                    beschrijving: "Populaire witvis voor wedstrijden",
                    seizoenen: {
                        lente: {
                            activiteit: "hoog",
                            tips: [
                                "In lente en zomer zijn brasems actiever en meer aasgericht",
                                "Goede periode voor brasemvangsten"
                            ],
                            aas: ["maden", "casters", "wormen", "brood"]
                        },
                        zomer: {
                            activiteit: "zeer hoog",
                            tips: [
                                "Brood werkt vooral goed in de zomermaanden",
                                "Brasems zijn zeer actief in warmer water",
                                "Beste periode voor brasemvissen"
                            ],
                            aas: ["maden", "casters", "wormen", "brood"]
                        },
                        winter: {
                            activiteit: "laag",
                            tips: [
                                "In koudere maanden vaak rustiger",
                                "Minder aasgericht",
                                "Gebruik natuurlijke aas met sterke geur"
                            ],
                            aas: ["wormen", "maden"]
                        }
                    },
                    aas_tips: {
                        maden_casters: "Populair, waarbij casters soms beter werkt in heldere wateren",
                        brood: "Vooral goed in zomermaanden",
                        wormen: "Natuurlijk aas dat aantrekkelijk is vanwege beweging en geur"
                    }
                }
            },

            weer_condities: {
                luchtdruk: {
                    laag: {
                        waarde: "< 1000 hPa",
                        effect: "Zeer goed voor vissen!",
                        tips: [
                            "Lage luchtdruk gaat vaak gepaard met bewolkt of stormachtig weer",
                            "Karpers zijn actiever bij lage luchtdruk",
                            "Vissen zoeken meer voedsel en bijten gretiger",
                            "Vaak HET moment waarop karpers los gaan!",
                            "Dalende luchtdruk kan voedseldrift bij roofvissen opwekken"
                        ]
                    },
                    normaal: {
                        waarde: "1000-1020 hPa",
                        effect: "Goede vismogelijkheden",
                        tips: [
                            "Stabiele omstandigheden",
                            "Normaal visgedrag",
                            "Goede kansen op vangst"
                        ]
                    },
                    hoog: {
                        waarde: "> 1020 hPa",
                        effect: "Moeilijker vissen",
                        tips: [
                            "Bij hoge luchtdruk zijn karpers vaak passiever",
                            "Vissen liggen vaak hoger in de waterkolom",
                            "Eetlust vermindert",
                            "Meer geduld nodig voor beet"
                        ]
                    },
                    beste_moment: "Net voordat weersverandering plaatsvindt - dalende luchtdruk is ideaal!"
                },

                wind: {
                    zuidwest: {
                        effect: "Zeer goed",
                        tips: [
                            "Dalende en lage luchtdruk met zuid-west wind is over het algemeen goed",
                            "Wind duwt aasvisjes naar de windkant",
                            "Roofvissen volgen hun prooi naar de windkant"
                        ]
                    },
                    algemeen: "Vis vaak aan de windkant waar wind naartoe waait - daar verzamelt het aas zich"
                },

                temperatuur: {
                    effect: "Temperatuur beïnvloedt metabolisme van vissen",
                    koud_water: [
                        "Vissen zijn minder actief",
                        "Langzamer metabolisme",
                        "Minder voedsel nodig"
                    ],
                    warm_water: [
                        "Vissen zijn agressiever en actiever",
                        "Sneller metabolisme",
                        "Meer voedsel nodig",
                        "Let op zuurstofgehalte!"
                    ]
                },

                beste_condities: [
                    "Lage/dalende luchtdruk (< 1000-1010 hPa)",
                    "Wind uit zuid-west hoek",
                    "Licht bewolkt (vooral voor snoekbaars)",
                    "Net voor weersverandering",
                    "Na onweersbui (vooral voor karper)"
                ]
            },

            aas_overzicht: {
                karper: {
                    populair: ["boilies", "mais", "tijgernoten"],
                    details: {
                        boilies: "Ontwikkeld voor gericht karpervissen, verkrijgbaar in alle kleuren, soorten, smaken en maten",
                        tijgernoten: "Onderschat maar heerlijke aroma, ongevoelig voor andere vissoorten",
                        mais: "Klassiek en effectief karpenaas"
                    }
                },
                brasem: {
                    populair: ["maden", "casters", "wormen", "brood"],
                    details: {
                        maden_casters: "Casters werken soms beter in heldere wateren",
                        brood: "Vooral goed in zomermaanden",
                        wormen: "Aantrekkelijk vanwege beweging en geur"
                    }
                },
                snoekbaars: {
                    populair: ["shads", "softbaits", "dode visjes"],
                    details: {
                        shads: "Favoriet bij snoekbaars vissen",
                        dode_visjes: "40% van vissers noemt dit als beste aas",
                        maat: "Juni-augustus: 5-10cm, vanaf september: groter formaat"
                    }
                }
            }
        };
    }

    /**
     * Verwerk vraag van gebruiker
     */
    processQuestion(question) {
        question = question.toLowerCase();

        // Weer gerelateerde vragen
        if (this.isWeatherQuestion(question)) {
            return this.getWeatherAdvice(question);
        }

        // Aas gerelateerde vragen
        if (this.isBaitQuestion(question)) {
            return this.getBaitAdvice(question);
        }

        // Vissoort specifieke vragen
        if (question.includes('karper')) {
            return this.getCarpAdvice(question);
        }

        if (question.includes('snoekbaars')) {
            return this.getPikePerchAdvice(question);
        }

        if (question.includes('brasem')) {
            return this.getBreamAdvice(question);
        }

        // Seizoen gerelateerde vragen
        if (this.isSeasonQuestion(question)) {
            return this.getSeasonAdvice(question);
        }

        // Luchtdruk vragen
        if (question.includes('luchtdruk')) {
            return this.getAirPressureAdvice();
        }

        // Wind vragen
        if (question.includes('wind')) {
            return this.getWindAdvice();
        }

        // Algemene help
        return this.getGeneralHelp();
    }

    isWeatherQuestion(q) {
        return q.includes('weer') || q.includes('wind') || q.includes('luchtdruk') ||
               q.includes('temperatuur') || q.includes('regen');
    }

    isBaitQuestion(q) {
        return q.includes('aas') || q.includes('lokaas') || q.includes('boilie') ||
               q.includes('mais') || q.includes('maden') || q.includes('wormen');
    }

    isSeasonQuestion(q) {
        const seizoenen = ['lente', 'zomer', 'herfst', 'winter', 'voorjaar', 'najaar',
                          'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
                          'september', 'oktober', 'november', 'december', 'januari', 'februari'];
        return seizoenen.some(s => q.includes(s));
    }

    getWeatherAdvice(question) {
        const advice = {
            title: "🌤️ Weer & Vangst Advies",
            sections: []
        };

        // Luchtdruk advies
        advice.sections.push({
            subtitle: "📊 Luchtdruk",
            content: [
                "**Beste moment:** Net voordat weersverandering plaatsvindt!",
                "",
                "**Lage luchtdruk (< 1000 hPa):** ✅ UITSTEKEND",
                "• Karpers zijn zeer actief",
                "• Vissen zoeken meer voedsel",
                "• Vaak HET moment om te vissen!",
                "",
                "**Hoge luchtdruk (> 1020 hPa):** ⚠️ MOEILIJK",
                "• Vissen zijn passiever",
                "• Liggen hoger in waterkolom",
                "• Verminderde eetlust"
            ]
        });

        // Wind advies
        advice.sections.push({
            subtitle: "💨 Wind",
            content: [
                "**Zuid-West wind:** ✅ Ideaal!",
                "• Wind duwt aasvisjes naar de windkant",
                "• Roofvissen volgen hun prooi",
                "• Vis aan de windkant voor beste resultaat",
                "",
                "**Algemene tip:** Zoek de kant op waar wind naartoe waait"
            ]
        });

        // Temperatuur
        advice.sections.push({
            subtitle: "🌡️ Temperatuur",
            content: [
                "**Warm water:** Vissen actiever en agressiever",
                "**Koud water:** Vissen minder actief",
                "",
                "💡 In zomer: Vis tijdens frissere momenten (avond/nacht/ochtend)"
            ]
        });

        return advice;
    }

    getBaitAdvice(question) {
        const advice = {
            title: "🎣 Aas Advies",
            sections: []
        };

        if (question.includes('karper')) {
            advice.sections.push({
                subtitle: "Karper Aas",
                content: [
                    "**Populaire keuzes:**",
                    "• Boilies - verkrijgbaar in alle smaken en maten",
                    "• Mais - klassiek en effectief",
                    "• Tijgernoten - onderschat maar zeer effectief!",
                    "",
                    "**Seizoen tips:**",
                    "• Lente/Zomer: Grotere boilies, mais, tijgernoten",
                    "• Winter: Kleinere boilies, maden"
                ]
            });
        } else if (question.includes('snoekbaars')) {
            advice.sections.push({
                subtitle: "Snoekbaars Aas",
                content: [
                    "**Top keuzes:**",
                    "• Shads en softbaits (favoriet!)",
                    "• Dode visjes en stukjes vis (40% favoriet)",
                    "",
                    "**Maat is belangrijk:**",
                    "• Juni-Augustus: 5-10 cm",
                    "• September-Mei: Groter formaat",
                    "• Eind maart/begin seizoen: Klein speldaas"
                ]
            });
        } else if (question.includes('brasem')) {
            advice.sections.push({
                subtitle: "Brasem Aas",
                content: [
                    "**Beste aas:**",
                    "• Maden en casters (casters beter in helder water)",
                    "• Brood (vooral goed in zomermaanden!)",
                    "• Wormen (geur en beweging werken goed)",
                    "",
                    "**Tip:** Brasem is actiefst in lente/zomer"
                ]
            });
        } else {
            // Algemeen overzicht
            advice.sections.push({
                subtitle: "Aas per Doelvis",
                content: [
                    "**Karper:** Boilies, mais, tijgernoten",
                    "**Snoekbaars:** Shads, softbaits, dode visjes",
                    "**Brasem:** Maden, casters, wormen, brood",
                    "",
                    "💡 Vraag specifiek naar een vissoort voor gedetailleerd advies!"
                ]
            });
        }

        return advice;
    }

    getCarpAdvice(question) {
        const currentMonth = new Date().getMonth(); // 0-11
        let seizoen = "lente";

        if (currentMonth >= 2 && currentMonth <= 4) seizoen = "lente";
        else if (currentMonth >= 5 && currentMonth <= 7) seizoen = "zomer";
        else if (currentMonth >= 8 && currentMonth <= 10) seizoen = "herfst";
        else seizoen = "winter";

        const seizoenData = this.kennisbank.vissoorten.karper.seizoenen[seizoen];

        return {
            title: "🐟 Karper Vissen - Advies",
            sections: [
                {
                    subtitle: `Huidig seizoen: ${seizoen.toUpperCase()}`,
                    content: [
                        `**Activiteit:** ${seizoenData.activiteit}`,
                        "",
                        "**Tips voor dit seizoen:**",
                        ...seizoenData.tips.map(t => `• ${t}`),
                        "",
                        "**Aanbevolen aas:**",
                        seizoenData.aas.join(", ")
                    ]
                },
                {
                    subtitle: "🌤️ Beste Weersomstandigheden",
                    content: [
                        "• Lage/dalende luchtdruk (< 1010 hPa)",
                        "• Na onweersbuien",
                        "• In zomer: Koelere momenten (avond/nacht/ochtend)",
                        "• Wind uit zuid-west hoek"
                    ]
                }
            ]
        };
    }

    getPikePerchAdvice(question) {
        return {
            title: "🎣 Snoekbaars Vissen - Advies",
            sections: [
                {
                    subtitle: "⚠️ Gesloten Tijd",
                    content: [
                        "**LET OP:** 1 april tot laatste zaterdag van mei",
                        "Respecteer de gesloten tijd!"
                    ]
                },
                {
                    subtitle: "🎯 Beste Condities",
                    content: [
                        "**Licht:** Beetje bewolkt is perfect!",
                        "• Snoekbaars is lichtschuw",
                        "• Extreem goede ogen",
                        "• Minder lichte omstandigheden = beter"
                    ]
                },
                {
                    subtitle: "🪱 Aas Keuze",
                    content: [
                        "**Populair:**",
                        "• Shads en softbaits (favoriet)",
                        "• Dode visjes (40% van vissers)",
                        "",
                        "**Maat per seizoen:**",
                        "• Juni-Augustus: 5-10 cm",
                        "• September en later: Groter formaat",
                        "• Eind maart/begin seizoen: Klein speldaas"
                    ]
                }
            ]
        };
    }

    getBreamAdvice(question) {
        const currentMonth = new Date().getMonth();
        const isZomer = currentMonth >= 5 && currentMonth <= 7;

        return {
            title: "🐠 Brasem Vissen - Advies",
            sections: [
                {
                    subtitle: "🎣 Beste Aas",
                    content: [
                        "**Top keuzes:**",
                        "• Maden en casters",
                        "  → Casters werken beter in helder water",
                        isZomer ? "• **Brood (UITSTEKEND in zomer!)** 🌞" : "• Brood (vooral goed in zomermaanden)",
                        "• Wormen (beweging en geur trekken brasem aan)",
                    ]
                },
                {
                    subtitle: "📅 Seizoen Advies",
                    content: [
                        "**Lente/Zomer:** ✅ Beste periode!",
                        "• Brasems zeer actief",
                        "• Meer aasgericht",
                        "",
                        "**Winter:** ⚠️ Moeilijker",
                        "• Vaak rustiger",
                        "• Minder actief"
                    ]
                }
            ]
        };
    }

    getSeasonAdvice(question) {
        return {
            title: "📅 Seizoen Overzicht",
            sections: [
                {
                    subtitle: "🌸 Lente (Maart-Mei)",
                    content: [
                        "**Karper:** Wordt actief vanaf maart, goede periode",
                        "**Brasem:** Zeer actief en aasgericht",
                        "**Snoekbaars:** Gesloten vanaf 1 april!"
                    ]
                },
                {
                    subtitle: "☀️ Zomer (Juni-Augustus)",
                    content: [
                        "**Karper:** BESTE PERIODE! Vooral augustus",
                        "  → Vis tijdens frisse momenten (avond/nacht)",
                        "**Brasem:** Zeer actief, brood werkt uitstekend",
                        "**Snoekbaars:** Open vanaf eind mei, klein aas 5-10cm"
                    ]
                },
                {
                    subtitle: "🍂 Herfst (September-November)",
                    content: [
                        "**Karper:** September prachtig! Genoeg zuurstof",
                        "**Snoekbaars:** Groter aas vanaf september",
                        "**Algemeen:** Goede periode voor vissen"
                    ]
                },
                {
                    subtitle: "❄️ Winter (December-Februari)",
                    content: [
                        "**Karper:** Minder actief, moeilijker seizoen",
                        "**Algemeen:** Vissen zijn passiever",
                        "**Tip:** Gebruik kleiner aas"
                    ]
                }
            ]
        };
    }

    getAirPressureAdvice() {
        return {
            title: "📊 Luchtdruk & Vissen",
            sections: [
                {
                    subtitle: "De invloed van luchtdruk",
                    content: [
                        "**🎯 BESTE MOMENT:**",
                        "Net voordat een weersverandering plaatsvindt!",
                        "Dalende luchtdruk = voedseldrift bij roofvissen",
                        "",
                        "**✅ Lage luchtdruk (< 1000 hPa):**",
                        "• Bewolkt/stormachtig weer",
                        "• Karpers ZEER actief",
                        "• Vissen zoeken meer voedsel",
                        "• Gretiger bijten",
                        "• DIT is vaak HET moment!",
                        "",
                        "**⚠️ Hoge luchtdruk (> 1020 hPa):**",
                        "• Karpers passiever",
                        "• Liggen hoger in waterkolom",
                        "• Verminderde eetlust",
                        "• Meer geduld nodig"
                    ]
                }
            ]
        };
    }

    getWindAdvice() {
        return {
            title: "💨 Wind & Vissen",
            sections: [
                {
                    subtitle: "Windrichting & Visgedrag",
                    content: [
                        "**✅ Zuid-West wind:** IDEAAL!",
                        "• Gecombineerd met lage luchtdruk = perfect",
                        "",
                        "**🎯 Waarom wind belangrijk is:**",
                        "• Wind duwt aasvisjes naar de windkant",
                        "• Roofvissen volgen hun prooi",
                        "• Zoek altijd de windkant op!",
                        "",
                        "**💡 Praktische tip:**",
                        "Ga zitten aan de kant waar de wind naartoe waait.",
                        "Daar verzamelt het voedsel en de vis!"
                    ]
                }
            ]
        };
    }

    getGeneralHelp() {
        return {
            title: "🤖 Vis Advies Bot - Help",
            sections: [
                {
                    subtitle: "Wat kan ik je vertellen?",
                    content: [
                        "**Vissoorten:**",
                        "• Karper vissen",
                        "• Snoekbaars vissen",
                        "• Brasem vissen",
                        "",
                        "**Weersomstandigheden:**",
                        "• Beste luchtdruk voor vissen",
                        "• Windrichting en invloed",
                        "• Temperatuur effecten",
                        "",
                        "**Aas advies:**",
                        "• Beste aas per vissoort",
                        "• Aas per seizoen",
                        "",
                        "**Seizoenen:**",
                        "• Beste vistijden per maand",
                        "• Seizoen overzicht",
                        "",
                        "💡 **Voorbeeldvragen:**",
                        "• \"Wat is de beste tijd om karper te vissen?\"",
                        "• \"Welk aas voor snoekbaars in de zomer?\"",
                        "• \"Hoe beïnvloedt luchtdruk het vissen?\"",
                        "• \"Beste weersomstandigheden voor vissen?\""
                    ]
                }
            ]
        };
    }

    /**
     * Haal huidige weersvoorspelling op
     */
    async getWeatherForecast(location = "Merksplas") {
        // Dit zou een echte API call zijn naar OpenWeather of KNMI
        // Voor nu een voorbeeld response
        return {
            location: location,
            current: {
                temp: 15,
                pressure: 1015,
                wind: "ZW 3 m/s",
                conditions: "Licht bewolkt"
            },
            forecast: [
                { day: "Vandaag", temp: 15, pressure: 1015, conditions: "Bewolkt" },
                { day: "Morgen", temp: 14, pressure: 1008, conditions: "Regen" },
                { day: "Overmorgen", temp: 16, pressure: 1020, conditions: "Zonnig" }
            ]
        };
    }

    /**
     * Genereer vis-advies op basis van weer
     */
    generateWeatherBasedAdvice(weatherData) {
        const advice = [];

        if (weatherData.current.pressure < 1010) {
            advice.push("✅ Lage luchtdruk - UITSTEKENDE vismogelijkheden!");
        } else if (weatherData.current.pressure > 1020) {
            advice.push("⚠️ Hoge luchtdruk - Moeilijkere omstandigheden");
        }

        if (weatherData.current.wind.includes("ZW") || weatherData.current.wind.includes("Z")) {
            advice.push("💨 Goede windrichting voor vissen");
        }

        return advice;
    }

    /**
     * Format advies voor weergave
     */
    formatAdvice(adviceObject) {
        let formatted = `<div class="bot-advice">`;
        formatted += `<h3>${adviceObject.title}</h3>`;

        adviceObject.sections.forEach(section => {
            if (section.subtitle) {
                formatted += `<h4>${section.subtitle}</h4>`;
            }
            formatted += `<div class="advice-content">`;
            section.content.forEach(line => {
                formatted += `<p>${line}</p>`;
            });
            formatted += `</div>`;
        });

        formatted += `</div>`;
        return formatted;
    }
}

// Export voor gebruik in browser en Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeerVangstBot;
}
