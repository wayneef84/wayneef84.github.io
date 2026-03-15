/**
 * WOSKY_3169 — Chief Charms Cost Data
 * Strict ES5 — no const/let/arrow functions/fetch.
 *
 * SOURCE: In-game data provided by WarMachine (State 3169).
 *
 * Structure:
 *   Each charm level has 4 sub-steps (1, 2, 3, 4).
 *   Steps 1–3 carry the bulk of the cost; step 4 carries any remainder.
 *   "step 0" = start of a level (nothing paid yet).
 *   "step 4" = level fully completed.
 *
 *   User notation "10.3" means level=10, step=3 (one step before complete).
 *
 * Resources per step:
 *   d = Charm Designs
 *   g = Charm Guides
 *   s = Charm Secrets  (0 before level 12)
 *
 * SvS scoring: 70 pts per charm LEVEL completed (step 1→4 all done).
 *
 * milestones[level] = cumulative { stat (%), power } after that level is fully done.
 *   These are the TOTAL across all 18 charm slots combined.
 *
 * NOTES:
 *   Level 2 D values (marked UNVERIFIED) could not be read clearly from source — verify.
 *   Level 1 Step 4 values also uncertain — verify against in-game.
 *   Max level in table: 16. Caps at 16 for calcRange.
 */

var WOSKY_CHARMS_DATA = {

    svs_pts_per_level: 70,

    pieces: [
        { key: 'legs',    label: 'Legs'    },
        { key: 'offhand', label: 'Offhand' },
        { key: 'chest',   label: 'Chest'   },
        { key: 'neck',    label: 'Neck'    },
        { key: 'helm',    label: 'Helm'    },
        { key: 'ring',    label: 'Ring'    }
    ],

    /**
     * milestones[level] — cumulative stat/power after that level is fully done.
     * "stat" is the total % stat bonus from all 18 charms combined.
     * "power" is the total power contribution from all 18 charms combined.
     */
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

    /**
     * costs[level][step] = { d, g, s }
     * step: 1, 2, 3, or 4.  (0 = start of level, costs nothing)
     */
    costs: {
        /* ── Level 1 ── */
        1: {
            1: { d: 10,  g: 12,  s: 0 },
            2: { d: 10,  g: 13,  s: 0 },
            3: { d: 10,  g: 14,  s: 0 },
            4: { d:  2,  g:  2,  s: 0 }   /* UNVERIFIED — remainder step */
        },
        /* ── Level 2 ── UNVERIFIED D values — check in-game before using */
        2: {
            1: { d:  3,  g: 10,  s: 0 },  /* UNVERIFIED */
            2: { d:  4,  g: 10,  s: 0 },  /* UNVERIFIED */
            3: { d:  4,  g: 10,  s: 0 },  /* UNVERIFIED */
            4: { d:  4,  g: 10,  s: 0 }   /* UNVERIFIED */
        },
        /* ── Level 3 ── */
        3: {
            1: { d: 10,  g: 15,  s: 0 },
            2: { d: 10,  g: 15,  s: 0 },
            3: { d: 10,  g: 15,  s: 0 },
            4: { d: 10,  g: 15,  s: 0 }
        },
        /* ── Level 4 ── */
        4: {
            1: { d: 25,  g: 20,  s: 0 },
            2: { d: 25,  g: 20,  s: 0 },
            3: { d: 25,  g: 20,  s: 0 },
            4: { d: 25,  g: 20,  s: 0 }
        },
        /* ── Level 5 ── */
        5: {
            1: { d: 50,  g: 25,  s: 0 },
            2: { d: 50,  g: 25,  s: 0 },
            3: { d: 50,  g: 25,  s: 0 },
            4: { d: 50,  g: 25,  s: 0 }
        },
        /* ── Level 6 ── */
        6: {
            1: { d: 75,  g: 30,  s: 0 },
            2: { d: 75,  g: 30,  s: 0 },
            3: { d: 75,  g: 30,  s: 0 },
            4: { d: 75,  g: 30,  s: 0 }
        },
        /* ── Level 7 ── */
        7: {
            1: { d: 100, g: 35,  s: 0 },
            2: { d: 100, g: 35,  s: 0 },
            3: { d: 100, g: 35,  s: 0 },
            4: { d: 100, g: 35,  s: 0 }
        },
        /* ── Level 8 ── */
        8: {
            1: { d: 100, g: 50,  s: 0 },
            2: { d: 100, g: 50,  s: 0 },
            3: { d: 100, g: 50,  s: 0 },
            4: { d: 100, g: 50,  s: 0 }
        },
        /* ── Level 9 ── */
        9: {
            1: { d: 100, g: 75,  s: 0 },
            2: { d: 100, g: 75,  s: 0 },
            3: { d: 100, g: 75,  s: 0 },
            4: { d: 100, g: 75,  s: 0 }
        },
        /* ── Level 10 ── */
        10: {
            1: { d: 105, g: 105, s: 0 },
            2: { d: 105, g: 105, s: 0 },
            3: { d: 105, g: 105, s: 0 },
            4: { d: 105, g: 105, s: 0 }
        },
        /* ── Level 11 ── */
        11: {
            1: { d: 105, g: 140, s: 0 },
            2: { d: 105, g: 140, s: 0 },
            3: { d: 105, g: 140, s: 0 },
            4: { d: 105, g: 140, s: 0 }
        },
        /* ── Level 12 — Charm Secrets introduced ── */
        12: {
            1: { d: 112, g: 145, s: 3 },
            2: { d: 112, g: 145, s: 3 },
            3: { d: 113, g: 145, s: 3 },
            4: { d: 113, g: 145, s: 3 }
        },
        /* ── Level 13 ── */
        13: {
            1: { d: 112, g: 145, s: 7 },
            2: { d: 112, g: 145, s: 7 },
            3: { d: 113, g: 145, s: 8 },
            4: { d: 113, g: 145, s: 8 }
        },
        /* ── Level 14 ── */
        14: {
            1: { d: 125, g: 150, s: 11 },
            2: { d: 125, g: 150, s: 11 },
            3: { d: 125, g: 150, s: 11 },
            4: { d: 125, g: 150, s: 12 }
        },
        /* ── Level 15 ── */
        15: {
            1: { d: 125, g: 150, s: 17 },
            2: { d: 125, g: 150, s: 17 },
            3: { d: 125, g: 150, s: 17 },
            4: { d: 125, g: 150, s: 18 }
        },
        /* ── Level 16 (max) ── */
        16: {
            1: { d: 137, g: 162, s: 25 },
            2: { d: 137, g: 162, s: 25 },
            3: { d: 138, g: 163, s: 25 },
            4: { d: 138, g: 163, s: 25 }
        }
    },

    /** getCost — returns cost for one step. Zeroes if level/step not in table. */
    getCost: function (level, step) {
        var lvl = this.costs[level];
        if (!lvl) return { d: 0, g: 0, s: 0 };
        var stp = lvl[step];
        if (!stp) return { d: 0, g: 0, s: 0 };
        return stp;
    },

    /**
     * calcRange(fromLevel, fromStep, toLevel, toStep)
     *
     * Returns total { d, g, s, svs_pts } to upgrade from fromLevel.fromStep
     * to toLevel.toStep.
     *
     * fromStep = 0  → charm is at the START of fromLevel (about to do step 1).
     * fromStep = 4  → level fully complete (nothing left to pay at fromLevel).
     * toStep   = 4  → want the charm fully at toLevel.
     *
     * A level completion (svs_pts) is counted when step 4 of a level is paid.
     */
    calcRange: function (fromLevel, fromStep, toLevel, toStep) {
        var MAX_LEVEL = 16;
        var totD = 0, totG = 0, totS = 0, levelsCompleted = 0;
        var curLevel = fromLevel;
        var curStep  = fromStep;

        /* Cap targets */
        if (toLevel > MAX_LEVEL) { toLevel = MAX_LEVEL; }
        if (toLevel === MAX_LEVEL && toStep > 4) { toStep = 4; }

        while (curLevel < toLevel || (curLevel === toLevel && curStep < toStep)) {
            curStep++;
            if (curStep > 4) {
                curStep = 1;
                curLevel++;
            }

            if (curLevel > toLevel) break;
            if (curLevel === toLevel && curStep > toStep) break;

            var cost = this.getCost(curLevel, curStep);
            totD += cost.d;
            totG += cost.g;
            totS += cost.s;

            /* Level completed when step 4 is paid */
            if (curStep === 4) levelsCompleted++;
        }

        return {
            d:        totD,
            g:        totG,
            s:        totS,
            svs_pts:  levelsCompleted * this.svs_pts_per_level
        };
    }
};
