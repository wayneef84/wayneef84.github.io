/**
 * WOSKY_3169 — Hero Gear Data  v1.0
 * Strict ES5 — no const/let/arrow functions/fetch.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  HOW TO UPDATE THIS FILE                                            ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  meta.maxForgeLevel    raise when new forge levels are confirmed     ║
 * ║  meta.statFlipPoints   update if the game changes stat milestones    ║
 * ║  forgeCosts[level]     fill in verified values; set verified: true   ║
 * ║  empowerCosts[n]       full data already verified — only fix typos   ║
 * ║  troopGroups / pieces  add/rename as needed                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * EMPOWERMENT STAGES
 *   Stage 1  E0   → E100   (empowerCosts index  1–100)
 *   Stage 2  E101 → E200   (empowerCosts index 101–200)
 *   Verified: true for all empowerment data (sourced from WarMachine).
 *
 * FLIP POINTS — stat bonuses change at these empowerment milestones:
 *   Stat flips:       E20, E60, E80, E100  (in-game bonus thresholds)
 *   Free milestones:  E101, E120, E140, E160, E180, E200  (cost = 0)
 *
 * FORGE COSTS — ⚠ NOT YET VERIFIED. Fill in when data is available.
 *   Resources: Gear XP (as XP-10 and XP-100 items), Hero Stones, Mithril.
 *
 * XP DISPLAY
 *   Total XP is presented as:  [N × XP-100] + [M × XP-10] + [R remaining]
 */

var WOSKY_HERO_GEAR_DATA = {

    /* ── Meta ─────────────────────────────────────────────────────────────── */
    meta: {
        version:         '1.0',
        maxForgeLevel:   30,     /* ⚠ UNVERIFIED — update when confirmed in-game */
        maxEmpowerment:  200,    /* E0–E200 (two stages)                          */
        statFlipPoints:  [20, 60, 80, 100],  /* stat bonuses change at these E values */
        stageBreak:      100,    /* empowerment stage 1 ends at E100              */
        /* Stage-2 zero-cost milestones (free upgrades): */
        freeFlips:       [101, 120, 140, 160, 180, 200]
    },

    /* ── Troop Groups ─────────────────────────────────────────────────────── */
    troopGroups: [
        { key: 'infantry', label: 'Infantry',  emoji: '\u2694\uFE0F',  cssClass: 'group-infantry' },
        { key: 'lancer',   label: 'Lancer',    emoji: '\uD83C\uDFC7',  cssClass: 'group-lancer'   },
        { key: 'marksman', label: 'Marksman',  emoji: '\uD83C\uDFAF',  cssClass: 'group-marksman' }
    ],

    /* ── Pieces ───────────────────────────────────────────────────────────── */
    /* All three troop types share the same 4 piece slots.                    */
    pieces: [
        { key: 'goggles', label: 'Goggles', emoji: '\uD83E\uDD7D' },
        { key: 'gloves',  label: 'Gloves',  emoji: '\uD83E\uDDE4' },
        { key: 'belt',    label: 'Belt',    emoji: '\uD83E\uDEA2' },
        { key: 'boots',   label: 'Boots',   emoji: '\uD83D\uDC62' }
    ],

    /* ── Forge Costs ──────────────────────────────────────────────────────── */
    /* forgeCosts[n] = cost to upgrade FROM forge level n TO n+1              */
    /* ⚠ ALL VALUES UNVERIFIED — update with in-game screenshots.             */
    forgeCosts: {
        1:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        2:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        3:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        4:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        5:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        6:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        7:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        8:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        9:  { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        10: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        11: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        12: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        13: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        14: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        15: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        16: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        17: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        18: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        19: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        20: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        21: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        22: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        23: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        24: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        25: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        26: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        27: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        28: { xp: 0, hero_stones: 0, mithril: 0, verified: false },
        29: { xp: 0, hero_stones: 0, mithril: 0, verified: false }
        /* Add more levels as they are unlocked and verified */
    },

    /* ── Empowerment Costs ────────────────────────────────────────────────── */
    /*                                                                         */
    /* empowerCosts[n] = Gear XP to advance from E(n-1) to E(n).             */
    /* Index 0 is unused (starting point).                                     */
    /* 0 cost = free milestone / flip point.                                   */
    /* Verified: true — sourced directly from WarMachine in-game data.         */
    /*                                                                         */
    /* Stage 1: E1–E100                                                        */
    /* Stage 2: E101–E200 (higher costs; free flips at E101, 120, 140, 160,   */
    /*          180, 200)                                                       */
    /*                                                                         */
    empowerCosts: [
        /* idx 0 — unused */
        0,
        /* ── Stage 1: E1–E100 ── */
        10,    /* E1   */
        15,    /* E2   */
        20,    /* E3   */
        25,    /* E4   */
        30,    /* E5   */
        35,    /* E6   */
        45,    /* E7   */
        45,    /* E8   */
        50,    /* E9   */
        55,    /* E10  */
        60,    /* E11  */
        65,    /* E12  */
        70,    /* E13  */
        75,    /* E14  */
        80,    /* E15  */
        85,    /* E16  */
        90,    /* E17  */
        95,    /* E18  */
        100,   /* E19  */
        105,   /* E20  ← stat flip */
        110,   /* E21  */
        115,   /* E22  */
        120,   /* E23  */
        125,   /* E24  */
        130,   /* E25  */
        135,   /* E26  */
        140,   /* E27  */
        145,   /* E28  */
        150,   /* E29  */
        160,   /* E30  */
        170,   /* E31  */
        180,   /* E32  */
        190,   /* E33  */
        200,   /* E34  */
        210,   /* E35  */
        220,   /* E36  */
        230,   /* E37  */
        240,   /* E38  */
        250,   /* E39  */
        270,   /* E40  */
        290,   /* E41  */
        310,   /* E42  */
        330,   /* E43  */
        350,   /* E44  */
        370,   /* E45  */
        390,   /* E46  */
        410,   /* E47  */
        430,   /* E48  */
        450,   /* E49  */
        470,   /* E50  */
        490,   /* E51  */
        510,   /* E52  */
        530,   /* E53  */
        550,   /* E54  */
        570,   /* E55  */
        590,   /* E56  */
        610,   /* E57  */
        630,   /* E58  */
        630,   /* E59  */
        680,   /* E60  ← stat flip */
        700,   /* E61  */
        740,   /* E62  */
        770,   /* E63  */
        800,   /* E64  */
        830,   /* E65  */
        860,   /* E66  */
        890,   /* E67  */
        920,   /* E68  */
        950,   /* E69  */
        990,   /* E70  */
        1030,  /* E71  */
        1070,  /* E72  */
        1110,  /* E73  */
        1150,  /* E74  */
        1190,  /* E75  */
        1230,  /* E76  */
        1270,  /* E77  */
        1310,  /* E78  */
        1350,  /* E79  */
        1400,  /* E80  ← stat flip */
        1450,  /* E81  */
        1500,  /* E82  */
        1550,  /* E83  */
        1600,  /* E84  */
        1650,  /* E85  */
        1700,  /* E86  */
        1750,  /* E87  */
        1800,  /* E88  */
        1850,  /* E89  */
        1900,  /* E90  */
        1950,  /* E91  */
        2000,  /* E92  */
        2050,  /* E93  */
        2100,  /* E94  */
        2150,  /* E95  */
        2200,  /* E96  */
        2250,  /* E97  */
        2300,  /* E98  */
        2350,  /* E99  */
        2400,  /* E100 ← stat flip / stage break */
        /* ── Stage 2: E101–E200 ── */
        0,     /* E101 ← free (flip reward) */
        2500,  /* E102 */
        2550,  /* E103 */
        2600,  /* E104 */
        2650,  /* E105 */
        2700,  /* E106 */
        2750,  /* E107 */
        2800,  /* E108 */
        2850,  /* E109 */
        2900,  /* E110 */
        2950,  /* E111 */
        3000,  /* E112 */
        3050,  /* E113 */
        3100,  /* E114 */
        3150,  /* E115 */
        3200,  /* E116 */
        3250,  /* E117 */
        3300,  /* E118 */
        3350,  /* E119 */
        0,     /* E120 ← free flip */
        3500,  /* E121 */
        3550,  /* E122 */
        3600,  /* E123 */
        3650,  /* E124 */
        3700,  /* E125 */
        3750,  /* E126 */
        3800,  /* E127 */
        3850,  /* E128 */
        3900,  /* E129 */
        3950,  /* E130 */
        4000,  /* E131 */
        4050,  /* E132 */
        4100,  /* E133 */
        4150,  /* E134 */
        4200,  /* E135 */
        4250,  /* E136 */
        4300,  /* E137 */
        4350,  /* E138 */
        4400,  /* E139 */
        0,     /* E140 ← free flip */
        4450,  /* E141 */
        4500,  /* E142 */
        4550,  /* E143 */
        4600,  /* E144 */
        4650,  /* E145 */
        4700,  /* E146 */
        4750,  /* E147 */
        4800,  /* E148 */
        4850,  /* E149 */
        4900,  /* E150 */
        4950,  /* E151 */
        5000,  /* E152 */
        5050,  /* E153 */
        5100,  /* E154 */
        5150,  /* E155 */
        5200,  /* E156 */
        5250,  /* E157 */
        5300,  /* E158 */
        5350,  /* E159 */
        0,     /* E160 ← free flip */
        5500,  /* E161 */
        5600,  /* E162 */
        5700,  /* E163 */
        5800,  /* E164 */
        5900,  /* E165 */
        6000,  /* E166 */
        6100,  /* E167 */
        6200,  /* E168 */
        6300,  /* E169 */
        6400,  /* E170 */
        6500,  /* E171 */
        6600,  /* E172 */
        6700,  /* E173 */
        6800,  /* E174 */
        6900,  /* E175 */
        7000,  /* E176 */
        7100,  /* E177 */
        7200,  /* E178 */
        7300,  /* E179 */
        0,     /* E180 ← free flip */
        7500,  /* E181 */
        7600,  /* E182 */
        7700,  /* E183 */
        7800,  /* E184 */
        7900,  /* E185 */
        8000,  /* E186 */
        8100,  /* E187 */
        8200,  /* E188 */
        8300,  /* E189 */
        8400,  /* E190 */
        8500,  /* E191 */
        8600,  /* E192 */
        8700,  /* E193 */
        8800,  /* E194 */
        8900,  /* E195 */
        9000,  /* E196 */
        9100,  /* E197 */
        9200,  /* E198 */
        9300,  /* E199 */
        0      /* E200 ← free flip / max */
    ],

    /* ══════════════════════════════════════════════════════════════════════ */
    /*  API                                                                   */
    /* ══════════════════════════════════════════════════════════════════════ */

    /** XP cost to advance from E(n-1) to E(n). Returns 0 if out of range. */
    getEmpowerCost: function (n) {
        if (n < 1 || n > this.meta.maxEmpowerment) return 0;
        return this.empowerCosts[n] || 0;
    },

    /** True if E(n) is a free-flip milestone (zero XP cost). */
    isFreeFlip: function (n) {
        var ff = this.meta.freeFlips;
        for (var i = 0; i < ff.length; i++) {
            if (ff[i] === n) return true;
        }
        return false;
    },

    /** True if E(n) is a stat-bonus flip point. */
    isStatFlip: function (n) {
        var sf = this.meta.statFlipPoints;
        for (var i = 0; i < sf.length; i++) {
            if (sf[i] === n) return true;
        }
        return false;
    },

    /** Next stat flip point above currentE, or null if already at/past all. */
    nextStatFlip: function (currentE) {
        var sf = this.meta.statFlipPoints;
        for (var i = 0; i < sf.length; i++) {
            if (sf[i] > currentE) return sf[i];
        }
        return null;
    },

    /**
     * calcEmpower(fromE, toE)
     * Returns { xp, freeFlipsCrossed[], statFlipsCrossed[], verified }
     * XP is total Gear XP needed (excludes free-flip steps).
     */
    calcEmpower: function (fromE, toE) {
        var maxE = this.meta.maxEmpowerment;
        if (toE > maxE) toE = maxE;
        if (toE <= fromE) return { xp: 0, freeFlipsCrossed: [], statFlipsCrossed: [], verified: true };

        var totalXP = 0;
        var freeFlipsCrossed = [];
        var statFlipsCrossed = [];

        for (var e = fromE + 1; e <= toE; e++) {
            var cost = this.getEmpowerCost(e);
            totalXP += cost;
            if (this.isFreeFlip(e)) freeFlipsCrossed.push(e);
            if (this.isStatFlip(e)) statFlipsCrossed.push(e);
        }

        return {
            xp:               totalXP,
            freeFlipsCrossed: freeFlipsCrossed,
            statFlipsCrossed: statFlipsCrossed,
            verified:         true
        };
    },

    /**
     * calcForge(fromLevel, toLevel)
     * Returns { xp, hero_stones, mithril, verified }
     * ⚠ All costs are currently 0 / unverified — update forgeCosts first.
     */
    calcForge: function (fromLevel, toLevel) {
        var maxF = this.meta.maxForgeLevel;
        if (toLevel > maxF) toLevel = maxF;
        if (toLevel <= fromLevel) return { xp: 0, hero_stones: 0, mithril: 0, verified: true };

        var totXP = 0, totStones = 0, totMithril = 0, allVerified = true;

        for (var f = fromLevel; f < toLevel; f++) {
            var c = this.forgeCosts[f];
            if (!c) continue;
            totXP      += c.xp      || 0;
            totStones  += c.hero_stones || 0;
            totMithril += c.mithril || 0;
            if (c.verified === false) allVerified = false;
        }

        return { xp: totXP, hero_stones: totStones, mithril: totMithril, verified: allVerified };
    },

    /** Format XP as "N×100 + M×10 (+ R)" for display. */
    fmtXP: function (xp) {
        if (xp === 0) return '0';
        var h = Math.floor(xp / 100);
        var t = Math.floor((xp % 100) / 10);
        var r = xp % 10;
        var parts = [];
        if (h) parts.push(h + '\xD7XP-100');
        if (t) parts.push(t + '\xD7XP-10');
        if (r) parts.push(r + ' XP');
        return parts.join(' + ');
    }
};
