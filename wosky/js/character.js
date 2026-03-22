/**
 * WOSKY_3169 — Character Management Module
 * Strict ES5 — no const/let/arrow functions/fetch/template literals.
 *
 * Exposes: window.WOSKY_CHARS
 *
 * localStorage keys:
 *   wosky_characters  — JSON array of character objects
 *   wosky_active_id   — string ID of the active character
 */

(function () {
    'use strict';

    /* ── Default Character (WarMachine) ─────────────────────────────────── */
    var DEFAULT_CHARACTER = {
        id: '1710000000000',
        playerId: '3169-WarMachine',
        name: 'WarMachine',
        state: 3169,
        alliance: 'SKY',
        furnaceLevel: 'FC3',
        power: 370065289,
        troops: {
            infantry: { tier: 10, count: 1077387 },
            lancer:   { tier: 10, count: 640699 },
            marksman: { tier: 10, count: 876141 },
            focus: '50/25/25 Infantry'
        },
        materials: {
            fire_crystals:      16780,
            mithril:            115,
            hardened_alloy:     0,
            polishing_solution: 0,
            design_plans:       0,
            lunar_amber:        0,
            charm_designs:      0,
            charm_guides:       0,
            charm_secrets:      0,
            taming_manual:      0,
            energizing_potion:  0,
            sigils:             0,
            books_of_knowledge: 0
        },
        gear: {
            ring:    { tier: 1, stars: 0 },
            offhand: { tier: 1, stars: 0 },
            chest:   { tier: 1, stars: 3 },
            legs:    { tier: 1, stars: 3 },
            helm:    { tier: 1, stars: 0 },
            neck:    { tier: 1, stars: 0 }
        },
        charms: {
            legs:    [ { level: 10, step: 3 }, { level: 7, step: 3 }, { level: 6, step: 3 } ],
            offhand: [ { level: 9,  step: 3 }, { level: 9, step: 3 }, { level: 8, step: 3 } ],
            chest:   [ { level: 6,  step: 3 }, { level: 6, step: 3 }, { level: 6, step: 3 } ],
            neck:    [ { level: 8,  step: 3 }, { level: 6, step: 3 }, { level: 5, step: 3 } ],
            helm:    [ { level: 5,  step: 3 }, { level: 5, step: 3 }, { level: 5, step: 3 } ],
            ring:    [ { level: 5,  step: 3 }, { level: 5, step: 3 }, { level: 5, step: 3 } ]
        },
        heroGear: {
            infantry: {
                goggles: { f: 11, e: 12  },
                gloves:  { f: 15, e: 100 },
                belt:    { f: 15, e: 79  },
                boots:   { f: 11, e: 20  }
            },
            marksman: {
                goggles: { f: 12, e: 39 },
                boots:   { f: 13, e: 59 },
                gloves:  { f: 5,  e: 0  },
                belt:    { f: 10, e: 0  }
            },
            lancer: {
                goggles: { f: 12, e: 39 },
                boots:   { f: 13, e: 59 },
                gloves:  { f: 5,  e: 0  },
                belt:    { f: 10, e: 0  }
            }
        },
        warAcademy: {
            flameStrike:    { level: 6 },
            flameTomahawk:  { level: 4 },
            fcFloor:        5000
        },
        plans: {
            gear:       { ring: null, offhand: null, chest: null, legs: null, helm: null, neck: null },
            charms:     { legs: null, offhand: null, chest: null, neck: null, helm: null, ring: null },
            heroGear:   { infantry: null, marksman: null, lancer: null },
            warAcademy: null,
            troops:     null
        }
    };

    /* ── Storage Keys ────────────────────────────────────────────────────── */
    var KEY_CHARS   = 'wosky_characters';
    var KEY_ACTIVE  = 'wosky_active_id';

    /* ── Helpers ─────────────────────────────────────────────────────────── */
    function load() {
        try {
            var raw = localStorage.getItem(KEY_CHARS);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function persist(chars) {
        try {
            localStorage.setItem(KEY_CHARS, JSON.stringify(chars));
        } catch (e) { /* storage full — surface silently */ }
    }

    function fire(id) {
        try {
            var evt = document.createEvent('Event');
            evt.initEvent('wosky:character-changed', true, true);
            evt.characterId = id;
            document.dispatchEvent(evt);
        } catch (e) {}
    }

    function generateId() {
        return String(Date.now()) + String(Math.floor(Math.random() * 1000));
    }

    /* ── Init: seed default if empty ─────────────────────────────────────── */
    function init() {
        var chars = load();
        if (!chars || chars.length === 0) {
            persist([ DEFAULT_CHARACTER ]);
            localStorage.setItem(KEY_ACTIVE, DEFAULT_CHARACTER.id);
        }
    }

    init();

    /* ── Public API ──────────────────────────────────────────────────────── */
    var WOSKY_CHARS = {

        getAll: function () {
            return load() || [];
        },

        getActiveId: function () {
            return localStorage.getItem(KEY_ACTIVE) || '';
        },

        getActive: function () {
            var id = WOSKY_CHARS.getActiveId();
            var chars = WOSKY_CHARS.getAll();
            for (var i = 0; i < chars.length; i++) {
                if (chars[i].id === id) return chars[i];
            }
            return chars.length ? chars[0] : null;
        },

        setActive: function (id) {
            localStorage.setItem(KEY_ACTIVE, id);
            fire(id);
        },

        /* Upsert by id */
        save: function (charObj) {
            var chars = WOSKY_CHARS.getAll();
            var found = false;
            for (var i = 0; i < chars.length; i++) {
                if (chars[i].id === charObj.id) {
                    chars[i] = charObj;
                    found = true;
                    break;
                }
            }
            if (!found) chars.push(charObj);
            persist(chars);
            fire(charObj.id);
        },

        /* Save only the charms section of the active character */
        saveCharms: function (charId, charmsObj) {
            var chars = WOSKY_CHARS.getAll();
            for (var i = 0; i < chars.length; i++) {
                if (chars[i].id === charId) {
                    chars[i].charms = charmsObj;
                    persist(chars);
                    return;
                }
            }
        },

        /* Save a plan section */
        savePlan: function (charId, planKey, planData) {
            var chars = WOSKY_CHARS.getAll();
            for (var i = 0; i < chars.length; i++) {
                if (chars[i].id === charId) {
                    if (!chars[i].plans) chars[i].plans = {};
                    chars[i].plans[planKey] = planData;
                    persist(chars);
                    return;
                }
            }
        },

        create: function (name, playerId) {
            var newChar = {
                id:           generateId(),
                playerId:     playerId || '',
                name:         name || 'New Character',
                state:        0,
                alliance:     '',
                furnaceLevel: '',
                power:        0,
                troops: {
                    infantry: { tier: 1, count: 0 },
                    lancer:   { tier: 1, count: 0 },
                    marksman: { tier: 1, count: 0 },
                    focus: ''
                },
                materials: {
                    fire_crystals: 0, mithril: 0, hardened_alloy: 0,
                    polishing_solution: 0, design_plans: 0, lunar_amber: 0,
                    charm_designs: 0, charm_guides: 0, charm_secrets: 0,
                    taming_manual: 0, energizing_potion: 0,
                    sigils: 0, books_of_knowledge: 0
                },
                gear: {
                    ring:    { tier: 1, stars: 0 }, offhand: { tier: 1, stars: 0 },
                    chest:   { tier: 1, stars: 0 }, legs:    { tier: 1, stars: 0 },
                    helm:    { tier: 1, stars: 0 }, neck:    { tier: 1, stars: 0 }
                },
                charms: {
                    legs:    [ { level: 1, step: 0 }, { level: 1, step: 0 }, { level: 1, step: 0 } ],
                    offhand: [ { level: 1, step: 0 }, { level: 1, step: 0 }, { level: 1, step: 0 } ],
                    chest:   [ { level: 1, step: 0 }, { level: 1, step: 0 }, { level: 1, step: 0 } ],
                    neck:    [ { level: 1, step: 0 }, { level: 1, step: 0 }, { level: 1, step: 0 } ],
                    helm:    [ { level: 1, step: 0 }, { level: 1, step: 0 }, { level: 1, step: 0 } ],
                    ring:    [ { level: 1, step: 0 }, { level: 1, step: 0 }, { level: 1, step: 0 } ]
                },
                heroGear: {
                    infantry: { goggles: { f: 1, e: 0 }, gloves: { f: 1, e: 0 }, belt: { f: 1, e: 0 }, boots: { f: 1, e: 0 } },
                    marksman: { goggles: { f: 1, e: 0 }, boots:  { f: 1, e: 0 }, gloves: { f: 1, e: 0 }, belt: { f: 1, e: 0 } },
                    lancer:   { goggles: { f: 1, e: 0 }, boots:  { f: 1, e: 0 }, gloves: { f: 1, e: 0 }, belt: { f: 1, e: 0 } }
                },
                warAcademy: { flameStrike: { level: 0 }, flameTomahawk: { level: 0 }, fcFloor: 5000 },
                plans: {
                    gear: { ring: null, offhand: null, chest: null, legs: null, helm: null, neck: null },
                    charms: { legs: null, offhand: null, chest: null, neck: null, helm: null, ring: null },
                    heroGear: { infantry: null, marksman: null, lancer: null },
                    warAcademy: null, troops: null
                }
            };
            WOSKY_CHARS.save(newChar);
            return newChar;
        },

        remove: function (id) {
            var chars = WOSKY_CHARS.getAll();
            var remaining = [];
            for (var i = 0; i < chars.length; i++) {
                if (chars[i].id !== id) remaining.push(chars[i]);
            }
            persist(remaining);
            /* If we deleted the active, switch to first available */
            if (WOSKY_CHARS.getActiveId() === id) {
                var newActive = remaining.length ? remaining[0].id : '';
                localStorage.setItem(KEY_ACTIVE, newActive);
                fire(newActive);
            }
        },

        exportAll: function () {
            var payload = {
                version: '1',
                exported: new Date().toISOString(),
                characters: WOSKY_CHARS.getAll()
            };
            return JSON.stringify(payload, null, 2);
        },

        importAll: function (jsonString) {
            try {
                var parsed = JSON.parse(jsonString);
                var chars = parsed.characters || (Array.isArray(parsed) ? parsed : [parsed]);
                if (!chars.length) return false;
                persist(chars);
                localStorage.setItem(KEY_ACTIVE, chars[0].id);
                fire(chars[0].id);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    window.WOSKY_CHARS = WOSKY_CHARS;

})();
