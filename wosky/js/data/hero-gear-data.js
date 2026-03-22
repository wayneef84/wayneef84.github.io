/**
 * WOSKY_3169 — Hero Gear Data  v1.2
 * Strict ES5 — no const/let/arrow functions/fetch.
 *
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  HOW TO UPDATE THIS FILE                                            ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║  meta.maxForgeLevel        raise when new forge levels are unlocked  ║
 * ║  meta.empowerGates         update if forge/mithril/mythic reqs change║
 * ║  meta.statFlipPoints       update if game adds/removes flip points   ║
 * ║  forgeCosts[n]             add higher-level rows when unlocked       ║
 * ║  empowerCosts              full E1–E200 data — only fix typos        ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * THREE UPGRADE AXES PER PIECE
 *   F  Forge level    F1–F20 (verified). XP + Hero Stones; F11+ adds Mythic gear.
 *   E  Empowerment    E0–E200 (XP verified). Requires forge level + gate unlock.
 *
 * EMPOWERMENT GATES — paid ONCE to unlock each empowerment range:
 *   Gate  E1   (start):  F10 · 0 Mithril · 1 Mythic piece
 *   Gate  E20  →  E21+:  F11 · 10 Mithril · 3 Mythic pieces
 *   Gate  E40  →  E41+:  F12 · 20 Mithril · 5 Mythic pieces
 *   Gate  E60  →  E61+:  F13 · 30 Mithril · 5 Mythic pieces
 *   Gate  E80  →  E81+:  F14 · 40 Mithril · 10 Mythic pieces
 *   Gate  E100 → E101+:  F? (⚠ unverified) · 50 Mithril · 10 Mythic pieces
 *
 * MITHRIL = HARD RESOURCE. No farming assumed. Calculator flags shortfall.
 *
 * VERIFIED STATUS
 *   Empowerment XP (E1–E200):  verified (WarMachine in-game)
 *   Forge costs (F1–F20):      verified (WarMachine in-game)
 *   Empowerment gates:         verified except E101+ forge req
 */

var WOSKY_HERO_GEAR_DATA = {

    /* ── Meta ─────────────────────────────────────────────────────────────── */
    meta: {
        version:        '1.2',
        maxForgeLevel:  20,     /* highest verified forge level — update when more unlocked */
        maxEmpowerment: 200,

        /* Empowerment stat-bonus milestones — piece_variant:true means the exact
           stat type (Atk vs Health etc.) can vary per piece; update per-piece
           overrides in pieces[] when you have that data.                        */
        statFlipPoints: [20, 40, 60, 80, 100],
        flipBonuses: {
            20:  { label: '+20% Atk / Def',           piece_variant: true },
            40:  { label: '+7.5% Hero Health / Atk',  piece_variant: true },
            60:  { label: '+30% Atk / Def',           piece_variant: true },
            80:  { label: '+15% Hero Health / Atk',   piece_variant: true },
            100: { label: '+50% Atk / Def',           piece_variant: true }
        },

        stageBreak:     100,    /* E100 = stage 1 / stage 2 boundary */
        freeFlips:      [101, 120, 140, 160, 180, 200],

        /*
         * empowerGates — each gate must be unlocked (one-time cost) before the
         * piece can be empowered into the next range.
         *
         *   minE / maxE   empowerment range this gate covers
         *   requiredF     minimum forge level needed
         *   mithril       Mithril cost to unlock this gate
         *   mythic        Mythic hero gear pieces sacrificed
         *
         * The calculator checks which gates fall within (fromE, toE] and sums
         * the Mithril + Mythic costs for each crossed gate.
         */
        empowerGates: [
            { minE:   1, maxE:  20, requiredF: 10, mithril:  0, mythic:  1, verified: true  },
            { minE:  21, maxE:  40, requiredF: 11, mithril: 10, mythic:  2, verified: true  },
            { minE:  41, maxE:  60, requiredF: 12, mithril: 20, mythic:  3, verified: true  },
            { minE:  61, maxE:  80, requiredF: 13, mithril: 30, mythic:  4, verified: true  },
            { minE:  81, maxE: 100, requiredF: 14, mithril: 40, mythic:  5, verified: true  },
            { minE: 101, maxE: 200, requiredF: 100, mithril: 50, mythic: 10, verified: false } /* ⚠ F? unverified */
        ]
    },

    /* ── Troop Groups ─────────────────────────────────────────────────────── */
    troopGroups: [
        { key: 'infantry', label: 'Infantry',  emoji: '\u2694\uFE0F',  cssClass: 'group-infantry' },
        { key: 'lancer',   label: 'Lancer',    emoji: '\uD83C\uDFC7',  cssClass: 'group-lancer'   },
        { key: 'marksman', label: 'Marksman',  emoji: '\uD83C\uDFAF',  cssClass: 'group-marksman' }
    ],

    /* ── Pieces ───────────────────────────────────────────────────────────── */
    pieces: [
        { key: 'goggles', label: 'Goggles', emoji: '\uD83E\uDD7D' },
        { key: 'gloves',  label: 'Gloves',  emoji: '\uD83E\uDDE4' },
        { key: 'belt',    label: 'Belt',    emoji: '\uD83E\uDEA2' },
        { key: 'boots',   label: 'Boots',   emoji: '\uD83D\uDC62' }
    ],

    /* ── Forge Costs ──────────────────────────────────────────────────────── */
    /*                                                                         */
    /* forgeCosts[n] = cost to upgrade FROM forge level n TO n+1.             */
    /*   xp          = n × 10 Gear XP                                          */
    /*   hero_stones = n Hero Stones                                            */
    /*   mythic_gear = max(0, n–10) Mythic gear pieces (required F11+)         */
    /*                                                                         */
    /* Example: to go F10 → F11 costs 110 XP, 11 Hero Stones, 1 Mythic piece. */
    /* verified: true — sourced from WarMachine in-game data.                  */
    forgeCosts: {
        1:  { xp:  10, hero_stones:  1, mythic_gear:  0, verified: true },
        2:  { xp:  20, hero_stones:  2, mythic_gear:  0, verified: true },
        3:  { xp:  30, hero_stones:  3, mythic_gear:  0, verified: true },
        4:  { xp:  40, hero_stones:  4, mythic_gear:  0, verified: true },
        5:  { xp:  50, hero_stones:  5, mythic_gear:  0, verified: true },
        6:  { xp:  60, hero_stones:  6, mythic_gear:  0, verified: true },
        7:  { xp:  70, hero_stones:  7, mythic_gear:  0, verified: true },
        8:  { xp:  80, hero_stones:  8, mythic_gear:  0, verified: true },
        9:  { xp:  90, hero_stones:  9, mythic_gear:  0, verified: true },
        10: { xp: 100, hero_stones: 10, mythic_gear:  0, verified: true },
        11: { xp: 110, hero_stones: 11, mythic_gear:  1, verified: true },
        12: { xp: 120, hero_stones: 12, mythic_gear:  2, verified: true },
        13: { xp: 130, hero_stones: 13, mythic_gear:  3, verified: true },
        14: { xp: 140, hero_stones: 14, mythic_gear:  4, verified: true },
        15: { xp: 150, hero_stones: 15, mythic_gear:  5, verified: true },
        16: { xp: 160, hero_stones: 16, mythic_gear:  6, verified: true },
        17: { xp: 170, hero_stones: 17, mythic_gear:  7, verified: true },
        18: { xp: 180, hero_stones: 18, mythic_gear:  8, verified: true },
        19: { xp: 190, hero_stones: 19, mythic_gear:  9, verified: true },
        20: { xp: 200, hero_stones: 20, mythic_gear: 10, verified: true }
        /* Add higher levels here when they are unlocked and verified */
    },

    /* ── Empowerment Costs ────────────────────────────────────────────────── */
    /* empowerCosts[n] = Gear XP to advance from E(n-1) to E(n).              */
    /* 0 = free milestone (flip point or stage-2 gate reward).                 */
    /* Stage 1: E1–E100 | Stage 2: E101–E200                                   */
    empowerCosts: [
        /* idx 0 — unused */
        0,
        /* ── Stage 1: E1–E100 ── */
        10, 15, 20, 25, 30, 35, 45, 45, 50, 55,       /* E1–E10   */
        60, 65, 70, 75, 80, 85, 90, 95, 100, 105,     /* E11–E20  ← stat flip */
        110, 115, 120, 125, 130, 135, 140, 145, 150, 160, /* E21–E30 */
        170, 180, 190, 200, 210, 220, 230, 240, 250, 270, /* E31–E40 */
        290, 310, 330, 350, 370, 390, 410, 430, 450, 470, /* E41–E50 */
        490, 510, 530, 550, 570, 590, 610, 630, 630, 680, /* E51–E60  ← stat flip */
        700, 740, 770, 800, 830, 860, 890, 920, 950, 990, /* E61–E70 */
        1030, 1070, 1110, 1150, 1190, 1230, 1270, 1310, 1350, 1400, /* E71–E80 ← stat flip */
        1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, /* E81–E90 */
        1950, 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400, /* E91–E100 ← stat flip */
        /* ── Stage 2: E101–E200 ── */
        0,     /* E101 ← free (flip reward) */
        2500, 2550, 2600, 2650, 2700, 2750, 2800, 2850, 2900, /* E102–E110 */
        2950, 3000, 3050, 3100, 3150, 3200, 3250, 3300, 3350, /* E111–E119 */
        0,     /* E120 ← free flip */
        3500, 3550, 3600, 3650, 3700, 3750, 3800, 3850, 3900, /* E121–E129 */
        3950, 4000, 4050, 4100, 4150, 4200, 4250, 4300, 4350, /* E130–E138 */
        4400,  /* E139 */
        0,     /* E140 ← free flip */
        4450, 4500, 4550, 4600, 4650, 4700, 4750, 4800, 4850, /* E141–E149 */
        4900, 4950, 5000, 5050, 5100, 5150, 5200, 5250, 5300, /* E150–E158 */
        5350,  /* E159 */
        0,     /* E160 ← free flip */
        5500, 5600, 5700, 5800, 5900, 6000, 6100, 6200, 6300, /* E161–E169 */
        6400, 6500, 6600, 6700, 6800, 6900, 7000, 7100, 7200, /* E170–E178 */
        7300,  /* E179 */
        0,     /* E180 ← free flip */
        7500, 7600, 7700, 7800, 7900, 8000, 8100, 8200, 8300, /* E181–E189 */
        8400, 8500, 8600, 8700, 8800, 8900, 9000, 9100, 9200, /* E190–E198 */
        9300,  /* E199 */
        0      /* E200 ← free flip / max */
    ],

    /* ══════════════════════════════════════════════════════════════════════ */
    /*  API                                                                   */
    /* ══════════════════════════════════════════════════════════════════════ */

    getEmpowerCost: function (n) {
        if (n < 1 || n > this.meta.maxEmpowerment) return 0;
        return this.empowerCosts[n] || 0;
    },

    isFreeFlip: function (n) {
        var ff = this.meta.freeFlips;
        for (var i = 0; i < ff.length; i++) { if (ff[i] === n) return true; }
        return false;
    },

    isStatFlip: function (n) {
        var sf = this.meta.statFlipPoints;
        for (var i = 0; i < sf.length; i++) { if (sf[i] === n) return true; }
        return false;
    },

    nextStatFlip: function (currentE) {
        var sf = this.meta.statFlipPoints;
        for (var i = 0; i < sf.length; i++) { if (sf[i] > currentE) return sf[i]; }
        return null;
    },

    /** Returns the bonus label for a flip point, or '' if none. */
    getFlipBonus: function (e) {
        var b = this.meta.flipBonuses[e];
        return b ? b.label : '';
    },

    /**
     * getGateForE(e) — returns the gate object that covers empowerment level e.
     */
    getGateForE: function (e) {
        var gates = this.meta.empowerGates;
        for (var i = 0; i < gates.length; i++) {
            if (e >= gates[i].minE && e <= gates[i].maxE) return gates[i];
        }
        return null;
    },

    /**
     * forgeGateWarning(currentF, targetE)
     * Returns warning string if currentF is below the required forge level for targetE,
     * or null if the forge level is sufficient.
     */
    forgeGateWarning: function (currentF, targetE) {
        var gate = this.getGateForE(targetE);
        if (!gate) return null;
        if (currentF >= gate.requiredF) return null;
        return 'F' + gate.requiredF + ' req' + (gate.verified === false ? ' \u26A0\uFE0F' : '');
    },

    /**
     * calcEmpower(fromE, toE)
     * Returns total XP + lists of free-flip and stat-flip milestones crossed.
     */
    calcEmpower: function (fromE, toE) {
        var maxE = this.meta.maxEmpowerment;
        if (toE > maxE) toE = maxE;
        if (toE <= fromE) return { xp: 0, freeFlipsCrossed: [], statFlipsCrossed: [], verified: true };
        var totalXP = 0, freeFlips = [], statFlips = [];
        for (var e = fromE + 1; e <= toE; e++) {
            totalXP += this.getEmpowerCost(e);
            if (this.isFreeFlip(e)) freeFlips.push(e);
            if (this.isStatFlip(e)) statFlips.push(e);
        }
        return { xp: totalXP, freeFlipsCrossed: freeFlips, statFlipsCrossed: statFlips, verified: true };
    },

    /**
     * calcForge(fromLevel, toLevel)
     * Returns { xp, hero_stones, mythic_gear, verified }
     */
    calcForge: function (fromLevel, toLevel) {
        var maxF = this.meta.maxForgeLevel;
        if (toLevel > maxF) toLevel = maxF;
        if (toLevel <= fromLevel) return { xp: 0, hero_stones: 0, mythic_gear: 0, verified: true };
        var totXP = 0, totStones = 0, totMythic = 0, allVerified = true;
        for (var f = fromLevel; f < toLevel; f++) {
            var c = this.forgeCosts[f];
            if (!c) { allVerified = false; continue; }
            totXP     += c.xp         || 0;
            totStones += c.hero_stones || 0;
            totMythic += c.mythic_gear || 0;
            if (c.verified === false) allVerified = false;
        }
        return { xp: totXP, hero_stones: totStones, mythic_gear: totMythic, verified: allVerified };
    },

    /**
     * calcGateCosts(fromE, toE)
     * Returns the total one-time gate unlock costs (Mithril + Mythic pieces)
     * for all empowerment gates crossed going from fromE to toE.
     * Also returns list of gate warnings if forge level is insufficient.
     *
     * gatesCrossed: array of gate objects whose minE is within (fromE, toE]
     */
    calcGateCosts: function (fromE, toE) {
        var maxE = this.meta.maxEmpowerment;
        if (toE > maxE) toE = maxE;
        var totMithril = 0, totMythic = 0, allVerified = true;
        var gatesCrossed = [];
        var gates = this.meta.empowerGates;

        for (var i = 0; i < gates.length; i++) {
            var g = gates[i];
            /* A gate is "crossed" when we move INTO its range for the first time:
               i.e., fromE is below the gate's minE and toE reaches into its range. */
            if (fromE < g.minE && toE >= g.minE) {
                totMithril += g.mithril;
                totMythic  += g.mythic;
                if (g.verified === false) allVerified = false;
                gatesCrossed.push(g);
            }
        }

        return {
            mithril:      totMithril,
            mythic:       totMythic,
            gatesCrossed: gatesCrossed,
            verified:     allVerified
        };
    },

    /**
     * levelXpPerStep(l) — Gear XP cost to advance from L(l-1) to L(l).
     * Source: verified game table (fox). Milestones (L20/40/60/80/100) cost
     * Mithril+Mythic, no XP. Full L1→L100 = 502,000 XP per piece.
     *
     *   L2–L19  : 2500 + (l-2)×50      (2500 … 3350)
     *   L21–L39 : 3500 + (l-21)×50     (3500 … 4400)
     *   L41–L59 : 4450 + (l-41)×50     (4450 … 5350)
     *   L61–L79 : 5500 + (l-61)×100    (5500 … 7300)
     *   L81–L99 : 7500 + (l-81)×100    (7500 … 9300)
     *   Milestones (L1, L20, L40, L60, L80, L100): 0
     */
    levelXpPerStep: function (l) {
        if (l <= 1 || l === 20 || l === 40 || l === 60 || l === 80 || l === 100) return 0;
        if (l >= 2  && l <= 19)  return 2500 + (l - 2)  * 50;
        if (l >= 21 && l <= 39)  return 3500 + (l - 21) * 50;
        if (l >= 41 && l <= 59)  return 4450 + (l - 41) * 50;
        if (l >= 61 && l <= 79)  return 5500 + (l - 61) * 100;
        if (l >= 81 && l <= 99)  return 7500 + (l - 81) * 100;
        return 0;
    },

    /**
     * calcLevel(fromL, toL) — total Gear XP to go from level fromL to toL.
     * fromL / toL are plain level numbers (1–100).
     */
    calcLevel: function (fromL, toL) {
        var maxL = 100;
        if (toL > maxL) toL = maxL;
        if (toL <= fromL) return { xp: 0 };
        var totalXP = 0;
        for (var l = fromL + 1; l <= toL; l++) {
            totalXP += this.levelXpPerStep(l);
        }
        return { xp: totalXP };
    },

    /** Format XP as "N×XP-100 + M×XP-10 (+ R)" */
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
