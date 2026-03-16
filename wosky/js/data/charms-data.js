/**
 * WOSKY_3169 — Chief Charms Cost Data  v2.0
 * Strict ES5 — no const/let/arrow functions/fetch.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  HOW TO UPDATE THIS FILE WHEN THE GAME CHANGES                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  meta.stepsPerLevel   change if game adds/removes upgrade steps  ║
 * ║  meta.maxLevel        raise when new charm levels are added      ║
 * ║  meta.svsPtsPerLevel  update if SvS scoring formula changes      ║
 * ║  pieces[].troopType   reassign a piece to a different troop grp  ║
 * ║  troopGroups          add/rename/reorder troop groups            ║
 * ║  costs[level][step]   correct any value; set verified: true      ║
 * ║  milestones           update cumulative stat% / power per level  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * VERIFICATION STATUS
 *   verified: true  — confirmed against live in-game data
 *   verified: false — best estimate; must be checked before SvS math
 *
 * ⚠  Level 1 step 4 remainder cost is UNVERIFIED.
 * ⚠  Level 2 Design (d) values are UNVERIFIED.
 *    Update both when you can screenshot the in-game upgrade screen.
 */

var WOSKY_CHARMS_DATA = {

    /* ── Meta ────────────────────────────────────────────────────────────── */
    /* Edit these numbers here — the calculator reads everything from meta.   */
    meta: {
        version:        '2.0',
        maxLevel:       16,
        stepsPerLevel:  4,       /* steps 1–N per level. Raise to 10 etc if needed */
        svsPtsPerLevel: 70       /* SvS points awarded when a charm level completes */
    },

    /* ── Troop Groups ─────────────────────────────────────────────────────── */
    /* Each group needs a unique key. Add or rename groups freely.            */
    /* The cssClass drives the left-border accent colour in wosky.css.        */
    troopGroups: [
        { key: 'infantry', label: 'Infantry',  emoji: '\u2694\uFE0F',  cssClass: 'group-infantry' },
        { key: 'lancer',   label: 'Lancer',    emoji: '\uD83C\uDFC7',  cssClass: 'group-lancer'   },
        { key: 'marksman', label: 'Marksman',  emoji: '\uD83C\uDFAF',  cssClass: 'group-marksman' }
    ],

    /* ── Pieces ───────────────────────────────────────────────────────────── */
    /* troopType must exactly match a key in troopGroups above.               */
    /* Reorder rows here to change the display order within each group.       */
    pieces: [
        { key: 'helm',    label: 'Helm',    emoji: '\uD83E\uDE96', troopType: 'infantry' },
        { key: 'chest',   label: 'Chest',   emoji: '\uD83D\uDEE1\uFE0F', troopType: 'infantry' },
        { key: 'ring',    label: 'Ring',    emoji: '\uD83D\uDC8D', troopType: 'lancer'   },
        { key: 'legs',    label: 'Legs',    emoji: '\uD83E\uDDB5', troopType: 'lancer'   },
        { key: 'offhand', label: 'Offhand', emoji: '\uD83D\uDDE1\uFE0F', troopType: 'marksman' },
        { key: 'neck',    label: 'Neck',    emoji: '\uD83D\uDCFF', troopType: 'marksman' }
    ],

    /* ── Milestones ───────────────────────────────────────────────────────── */
    /* Cumulative stat % and power across ALL 18 charms combined.             */
    milestones: {
        1:  { stat:   9.00, power:  20570 },
        2:  { stat:  12.00, power:  28800 },
        3:  { stat:  16.00, power:  37000 },
        4:  { stat:  19.00, power:  45200 },
        5:  { stat:  25.00, power:  57600 },
        6:  { stat:  30.00, power:  70000 },
        7:  { stat:  35.00, power:  82400 },
        8:  { stat:  40.00, power:  96000 },
        9:  { stat:  45.00, power: 107200 },
        10: { stat:  50.00, power: 119600 },
        11: { stat:  55.00, power: 132000 },
        12: { stat:  64.00, power: 144000 },
        13: { stat:  73.00, power: 156800 },
        14: { stat:  82.00, power: 169200 },
        15: { stat:  91.00, power: 181600 },
        16: { stat: 100.00, power: 194000 }
    },

    /* ── Costs ────────────────────────────────────────────────────────────── */
    /*                                                                         */
    /* costs[level][step] = { d, g, s, verified }                             */
    /*   d = Charm Designs   g = Charm Guides   s = Charm Secrets (L12+)      */
    /*   verified: true  — confirmed in-game                                   */
    /*   verified: false — estimate; flag shows in results                     */
    /*                                                                         */
    /* step 0 = start of a level (nothing paid yet, no entry here)            */
    /* step N (= stepsPerLevel) = level fully complete                        */
    costs: {

        /* ── Level 1 ── ⚠ step 4 remainder is UNVERIFIED */
        1: {
            1: { d: 10,  g: 12,  s: 0, verified: true  },
            2: { d: 10,  g: 13,  s: 0, verified: true  },
            3: { d: 10,  g: 14,  s: 0, verified: true  },
            4: { d:  2,  g:  2,  s: 0, verified: false } /* ⚠ UNVERIFIED remainder */
        },

        /* ── Level 2 ── ⚠ ALL d values UNVERIFIED — verify in-game */
        2: {
            1: { d:  3,  g: 10,  s: 0, verified: false },
            2: { d:  4,  g: 10,  s: 0, verified: false },
            3: { d:  4,  g: 10,  s: 0, verified: false },
            4: { d:  4,  g: 10,  s: 0, verified: false }
        },

        /* ── Level 3 ── */
        3: {
            1: { d: 10,  g: 15,  s: 0, verified: true },
            2: { d: 10,  g: 15,  s: 0, verified: true },
            3: { d: 10,  g: 15,  s: 0, verified: true },
            4: { d: 10,  g: 15,  s: 0, verified: true }
        },

        /* ── Level 4 ── */
        4: {
            1: { d: 25,  g: 20,  s: 0, verified: true },
            2: { d: 25,  g: 20,  s: 0, verified: true },
            3: { d: 25,  g: 20,  s: 0, verified: true },
            4: { d: 25,  g: 20,  s: 0, verified: true }
        },

        /* ── Level 5 ── */
        5: {
            1: { d: 50,  g: 25,  s: 0, verified: true },
            2: { d: 50,  g: 25,  s: 0, verified: true },
            3: { d: 50,  g: 25,  s: 0, verified: true },
            4: { d: 50,  g: 25,  s: 0, verified: true }
        },

        /* ── Level 6 ── */
        6: {
            1: { d: 75,  g: 30,  s: 0, verified: true },
            2: { d: 75,  g: 30,  s: 0, verified: true },
            3: { d: 75,  g: 30,  s: 0, verified: true },
            4: { d: 75,  g: 30,  s: 0, verified: true }
        },

        /* ── Level 7 ── */
        7: {
            1: { d: 100, g: 35,  s: 0, verified: true },
            2: { d: 100, g: 35,  s: 0, verified: true },
            3: { d: 100, g: 35,  s: 0, verified: true },
            4: { d: 100, g: 35,  s: 0, verified: true }
        },

        /* ── Level 8 ── */
        8: {
            1: { d: 100, g: 50,  s: 0, verified: true },
            2: { d: 100, g: 50,  s: 0, verified: true },
            3: { d: 100, g: 50,  s: 0, verified: true },
            4: { d: 100, g: 50,  s: 0, verified: true }
        },

        /* ── Level 9 ── */
        9: {
            1: { d: 100, g: 75,  s: 0, verified: true },
            2: { d: 100, g: 75,  s: 0, verified: true },
            3: { d: 100, g: 75,  s: 0, verified: true },
            4: { d: 100, g: 75,  s: 0, verified: true }
        },

        /* ── Level 10 ── */
        10: {
            1: { d: 105, g: 105, s: 0, verified: true },
            2: { d: 105, g: 105, s: 0, verified: true },
            3: { d: 105, g: 105, s: 0, verified: true },
            4: { d: 105, g: 105, s: 0, verified: true }
        },

        /* ── Level 11 ── */
        11: {
            1: { d: 105, g: 140, s: 0, verified: true },
            2: { d: 105, g: 140, s: 0, verified: true },
            3: { d: 105, g: 140, s: 0, verified: true },
            4: { d: 105, g: 140, s: 0, verified: true }
        },

        /* ── Level 12 — Charm Secrets introduced ── */
        12: {
            1: { d: 112, g: 145, s:  3, verified: true },
            2: { d: 112, g: 145, s:  3, verified: true },
            3: { d: 113, g: 145, s:  3, verified: true },
            4: { d: 113, g: 145, s:  3, verified: true }
        },

        /* ── Level 13 ── */
        13: {
            1: { d: 112, g: 145, s:  7, verified: true },
            2: { d: 112, g: 145, s:  7, verified: true },
            3: { d: 113, g: 145, s:  8, verified: true },
            4: { d: 113, g: 145, s:  8, verified: true }
        },

        /* ── Level 14 ── */
        14: {
            1: { d: 125, g: 150, s: 11, verified: true },
            2: { d: 125, g: 150, s: 11, verified: true },
            3: { d: 125, g: 150, s: 11, verified: true },
            4: { d: 125, g: 150, s: 12, verified: true }
        },

        /* ── Level 15 ── */
        15: {
            1: { d: 125, g: 150, s: 17, verified: true },
            2: { d: 125, g: 150, s: 17, verified: true },
            3: { d: 125, g: 150, s: 17, verified: true },
            4: { d: 125, g: 150, s: 18, verified: true }
        },

        /* ── Level 16 (current max) ── */
        16: {
            1: { d: 137, g: 162, s: 25, verified: true },
            2: { d: 137, g: 162, s: 25, verified: true },
            3: { d: 138, g: 163, s: 25, verified: true },
            4: { d: 138, g: 163, s: 25, verified: true }
        }
    },

    /* ══════════════════════════════════════════════════════════════════════ */
    /*  API — do not edit below unless you know what you're doing            */
    /* ══════════════════════════════════════════════════════════════════════ */

    /** Returns the cost for one step at a level. Safe — returns zeroes if missing. */
    getCost: function (level, step) {
        var lvl = this.costs[level];
        if (!lvl) return { d: 0, g: 0, s: 0, verified: true };
        var stp = lvl[step];
        if (!stp) return { d: 0, g: 0, s: 0, verified: true };
        return stp;
    },

    /**
     * Returns true if any step in the range contains unverified data.
     * Used to show a warning flag in results.
     */
    rangeHasUnverified: function (fromLevel, fromStep, toLevel, toStep) {
        var stepsPerLevel = this.meta.stepsPerLevel;
        var maxLevel      = this.meta.maxLevel;
        var curLevel = fromLevel;
        var curStep  = fromStep;
        if (toLevel > maxLevel) { toLevel = maxLevel; toStep = stepsPerLevel; }

        while (curLevel < toLevel || (curLevel === toLevel && curStep < toStep)) {
            curStep++;
            if (curStep > stepsPerLevel) { curStep = 1; curLevel++; }
            if (curLevel > toLevel) break;
            if (curLevel === toLevel && curStep > toStep) break;
            if (this.getCost(curLevel, curStep).verified === false) return true;
        }
        return false;
    },

    /**
     * calcRange(fromLevel, fromStep, toLevel, toStep)
     * Returns total { d, g, s, svs_pts, hasUnverified }.
     *
     * fromStep 0 = start of fromLevel (about to pay step 1).
     * toStep N  = level fully complete (all stepsPerLevel steps paid).
     */
    calcRange: function (fromLevel, fromStep, toLevel, toStep) {
        var stepsPerLevel = this.meta.stepsPerLevel;
        var maxLevel      = this.meta.maxLevel;
        var totD = 0, totG = 0, totS = 0, levelsCompleted = 0, unverified = false;
        var curLevel = fromLevel;
        var curStep  = fromStep;

        if (toLevel > maxLevel) { toLevel = maxLevel; toStep = stepsPerLevel; }

        while (curLevel < toLevel || (curLevel === toLevel && curStep < toStep)) {
            curStep++;
            if (curStep > stepsPerLevel) { curStep = 1; curLevel++; }
            if (curLevel > toLevel) break;
            if (curLevel === toLevel && curStep > toStep) break;

            var cost = this.getCost(curLevel, curStep);
            totD += cost.d;
            totG += cost.g;
            totS += cost.s;
            if (cost.verified === false) unverified = true;
            if (curStep === stepsPerLevel) levelsCompleted++;
        }

        return {
            d:           totD,
            g:           totG,
            s:           totS,
            svs_pts:     levelsCompleted * this.meta.svsPtsPerLevel,
            hasUnverified: unverified
        };
    },

    /**
     * Returns the pieces array organised into troop groups.
     * Result: [ { meta: {key,label,emoji,cssClass}, pieces: [...] }, ... ]
     */
    getPiecesByGroup: function () {
        var groupMap = {};
        var groupOrder = [];
        var i, j, tg = this.troopGroups;

        for (i = 0; i < tg.length; i++) {
            groupMap[tg[i].key] = { meta: tg[i], pieces: [] };
            groupOrder.push(tg[i].key);
        }

        var pieces = this.pieces;
        for (j = 0; j < pieces.length; j++) {
            var p = pieces[j];
            if (groupMap[p.troopType]) {
                groupMap[p.troopType].pieces.push(p);
            }
        }

        var result = [];
        for (i = 0; i < groupOrder.length; i++) {
            result.push(groupMap[groupOrder[i]]);
        }
        return result;
    }
};
