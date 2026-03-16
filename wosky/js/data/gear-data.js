/**
 * WOSKY_3169 — Chief Gear Cost Data  v1.0
 * Strict ES5 — no const/let/arrow functions/fetch.
 * Copyright (c) 2026. All Rights Reserved.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  HOW TO UPDATE THIS FILE WHEN THE GAME CHANGES                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  costs[index]         Add new tiers/steps if game adds them      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * VERIFICATION STATUS
 *   verified: true  — mostly accurate, check edge cases
 */

var WOSKY_GEAR_DATA = {

    meta: {
        version: '1.0'
    },

    /* ── Troop Groups ─────────────────────────────────────────────────────── */
    troopGroups: [
        { key: 'infantry', label: 'Infantry',  emoji: '\u2694\uFE0F',  cssClass: 'group-infantry' },
        { key: 'lancer',   label: 'Lancer',    emoji: '\uD83C\uDFC7',  cssClass: 'group-lancer'   },
        { key: 'marksman', label: 'Marksman',  emoji: '\uD83C\uDFAF',  cssClass: 'group-marksman' }
    ],

    /* ── Pieces ───────────────────────────────────────────────────────────── */
    pieces: [
        { key: 'helm',    label: 'Helm',    emoji: '\uD83E\uDE96', troopType: 'lancer'   },
        { key: 'chest',   label: 'Chest',   emoji: '\uD83D\uDEE1\uFE0F', troopType: 'infantry' },
        { key: 'ring',    label: 'Ring',    emoji: '\uD83D\uDC8D', troopType: 'marksman' },
        { key: 'legs',    label: 'Legs',    emoji: '\uD83E\uDDB5', troopType: 'infantry'   },
        { key: 'offhand', label: 'Offhand', emoji: '\uD83D\uDDE1\uFE0F', troopType: 'lancer' },
        { key: 'neck',    label: 'Neck',    emoji: '\uD83D\uDCFF', troopType: 'marksman' }
    ],

    /* ── Costs ────────────────────────────────────────────────────────────── */
    /*   a = Hardened Alloy, s = Polishing Solution, d = Design Plans, m = Lunar Amber */
    /* Each index corresponds to the row number (1 to 105).                      */
    costs: [
        { idx: 0,   id: 'none',            label: 'None (Not Started)',  a: 0, s: 0, d: 0, m: 0 },
        { idx: 1,   id: 'green',           label: 'Green',               a: 1500, s: 15, d: 0, m: 0 },
        { idx: 2,   id: 'green-1',         label: 'Green \u26051',       a: 3800, s: 40, d: 0, m: 0 },
        { idx: 3,   id: 'blue',            label: 'Blue',                a: 7000, s: 70, d: 0, m: 0 },
        { idx: 4,   id: 'blue-1',          label: 'Blue \u26051',       a: 9700, s: 95, d: 0, m: 0 },
        { idx: 5,   id: 'blue-2',          label: 'Blue \u26052',       a: 0, s: 0, d: 45, m: 0 },
        { idx: 6,   id: 'blue-3',          label: 'Blue \u26053',       a: 0, s: 0, d: 50, m: 0 },
        { idx: 7,   id: 'purple',          label: 'Purple',              a: 0, s: 0, d: 60, m: 0 },
        { idx: 8,   id: 'purple-1',        label: 'Purple \u26051',     a: 0, s: 0, d: 70, m: 0 },
        { idx: 9,   id: 'purple-2',        label: 'Purple \u26052',     a: 6500, s: 65, d: 40, m: 0 },
        { idx: 10,  id: 'purple-3',        label: 'Purple \u26053',     a: 8000, s: 80, d: 50, m: 0 },
        { idx: 11,  id: 'purple-t1',       label: 'Purple T1',           a: 10000, s: 95, d: 60, m: 0 },
        { idx: 12,  id: 'purple-t1-1',     label: 'Purple T1 \u26051',  a: 11000, s: 110, d: 70, m: 0 },
        { idx: 13,  id: 'purple-t1-2',     label: 'Purple T1 \u26052',  a: 13000, s: 130, d: 85, m: 0 },
        { idx: 14,  id: 'purple-t1-3',     label: 'Purple T1 \u26053',  a: 15000, s: 160, d: 100, m: 0 },
        { idx: 15,  id: 'gold',            label: 'Gold',                a: 22000, s: 220, d: 40, m: 0 },
        { idx: 16,  id: 'gold-1',          label: 'Gold \u26051',       a: 23000, s: 230, d: 40, m: 0 },
        { idx: 17,  id: 'gold-2',          label: 'Gold \u26052',       a: 25000, s: 250, d: 45, m: 0 },
        { idx: 18,  id: 'gold-3',          label: 'Gold \u26053',       a: 26000, s: 260, d: 45, m: 0 },
        { idx: 19,  id: 'gold-t1',         label: 'Gold T1',             a: 28000, s: 280, d: 45, m: 0 },
        { idx: 20,  id: 'gold-t1-1',       label: 'Gold T1 \u26051',    a: 28000, s: 280, d: 55, m: 0 },
        { idx: 21,  id: 'gold-t1-2',       label: 'Gold T1 \u26052',    a: 32000, s: 320, d: 55, m: 0 },
        { idx: 22,  id: 'gold-t1-3',       label: 'Gold T1 \u26053',    a: 35000, s: 340, d: 55, m: 0 },
        { idx: 23,  id: 'gold-t2',         label: 'Gold T2',             a: 38000, s: 360, d: 55, m: 0 },
        { idx: 24,  id: 'gold-t2-1',       label: 'Gold T2 \u26051',    a: 43000, s: 430, d: 75, m: 0 },
        { idx: 25,  id: 'gold-t2-2',       label: 'Gold T2 \u26052',    a: 45000, s: 460, d: 80, m: 0 },
        { idx: 26,  id: 'gold-t2-3',       label: 'Gold T2 \u26053',    a: 48000, s: 500, d: 85, m: 0 },

        { idx: 27,  id: 'pink-0-s1',       label: 'Pink 0 Step 1',       a: 12500, s: 132, d: 21, m: 2 },
        { idx: 28,  id: 'pink-0-s2',       label: 'Pink 0 Step 2',       a: 12500, s: 132, d: 21, m: 2 },
        { idx: 29,  id: 'pink-0-s3',       label: 'Pink 0 Step 3',       a: 12500, s: 132, d: 21, m: 2 },
        { idx: 30,  id: 'pink-1',          label: 'Pink 1',              a: 12500, s: 134, d: 22, m: 4 },
        { idx: 31,  id: 'pink-1-s1',       label: 'Pink 1 Step 1',       a: 13000, s: 140, d: 22, m: 2 },
        { idx: 32,  id: 'pink-1-s2',       label: 'Pink 1 Step 2',       a: 13000, s: 140, d: 22, m: 2 },
        { idx: 33,  id: 'pink-1-s3',       label: 'Pink 1 Step 3',       a: 13000, s: 140, d: 22, m: 2 },
        { idx: 34,  id: 'pink-2',          label: 'Pink 2',              a: 13000, s: 140, d: 24, m: 4 },
        { idx: 35,  id: 'pink-2-s1',       label: 'Pink 2 Step 1',       a: 13500, s: 147, d: 23, m: 2 },
        { idx: 36,  id: 'pink-2-s2',       label: 'Pink 2 Step 2',       a: 13500, s: 147, d: 23, m: 2 },
        { idx: 37,  id: 'pink-2-s3',       label: 'Pink 2 Step 3',       a: 13500, s: 147, d: 23, m: 2 },
        { idx: 38,  id: 'pink-3',          label: 'Pink 3',              a: 13500, s: 149, d: 26, m: 4 },
        { idx: 39,  id: 'pink-3-s1',       label: 'Pink 3 Step 1',       a: 14000, s: 155, d: 25, m: 2 },
        { idx: 40,  id: 'pink-3-s2',       label: 'Pink 3 Step 2',       a: 14000, s: 155, d: 25, m: 2 },
        { idx: 41,  id: 'pink-3-s3',       label: 'Pink 3 Step 3',       a: 14000, s: 155, d: 25, m: 2 },
        { idx: 42,  id: 'pink-t1',         label: 'Pink T1',             a: 14000, s: 155, d: 25, m: 4 },
        { idx: 43,  id: 'pink-t1-s1',      label: 'Pink T1 Step 1',      a: 14750, s: 167, d: 27, m: 3 },
        { idx: 44,  id: 'pink-t1-s2',      label: 'Pink T1 Step 2',      a: 14750, s: 167, d: 27, m: 3 },
        { idx: 45,  id: 'pink-t1-s3',      label: 'Pink T1 Step 3',      a: 14750, s: 167, d: 27, m: 3 },
        { idx: 46,  id: 'pink-t1-1',       label: 'Pink T1 ★1',         a: 14750, s: 169, d: 29, m: 6 },
        { idx: 47,  id: 'pink-t1-1-s1',    label: 'Pink T1 ★1 Step 1',  a: 15250, s: 175, d: 28, m: 3 },
        { idx: 48,  id: 'pink-t1-1-s2',    label: 'Pink T1 ★1 Step 2',  a: 15250, s: 175, d: 28, m: 3 },
        { idx: 49,  id: 'pink-t1-1-s3',    label: 'Pink T1 ★1 Step 3',  a: 15250, s: 175, d: 28, m: 3 },
        { idx: 50,  id: 'pink-t1-2',       label: 'Pink T1 ★2',         a: 15250, s: 175, d: 31, m: 6 },
        { idx: 51,  id: 'pink-t1-2-s1',    label: 'Pink T1 ★2 Step 1',  a: 15750, s: 182, d: 30, m: 3 },
        { idx: 52,  id: 'pink-t1-2-s2',    label: 'Pink T1 ★2 Step 2',  a: 15750, s: 182, d: 30, m: 3 },
        { idx: 53,  id: 'pink-t1-2-s3',    label: 'Pink T1 ★2 Step 3',  a: 15750, s: 182, d: 30, m: 3 },
        { idx: 54,  id: 'pink-t1-3',       label: 'Pink T1 ★3',         a: 15750, s: 184, d: 30, m: 6 },
        { idx: 55,  id: 'pink-t1-3-s1',    label: 'Pink T1 ★3 Step 1',  a: 16250, s: 190, d: 31, m: 3 },
        { idx: 56,  id: 'pink-t1-3-s2',    label: 'Pink T1 ★3 Step 2',  a: 16250, s: 190, d: 31, m: 3 },
        { idx: 57,  id: 'pink-t1-3-s3',    label: 'Pink T1 ★3 Step 3',  a: 16250, s: 190, d: 31, m: 3 },
        { idx: 58,  id: 'pink-t2',         label: 'Pink T2',             a: 16250, s: 190, d: 32, m: 6 },
        { idx: 59,  id: 'pink-t2-s1',      label: 'Pink T2 Step 1',      a: 17000, s: 202, d: 33, m: 5 },
        { idx: 60,  id: 'pink-t2-s2',      label: 'Pink T2 Step 2',      a: 17000, s: 202, d: 33, m: 5 },
        { idx: 61,  id: 'pink-t2-s3',      label: 'Pink T2 Step 3',      a: 17000, s: 202, d: 33, m: 5 },
        { idx: 62,  id: 'pink-t2-1',       label: 'Pink T2 ★1',         a: 17000, s: 204, d: 36, m: 5 },
        { idx: 63,  id: 'pink-t2-1-s1',    label: 'Pink T2 ★1 Step 1',  a: 17500, s: 210, d: 35, m: 5 },
        { idx: 64,  id: 'pink-t2-1-s2',    label: 'Pink T2 ★1 Step 2',  a: 17500, s: 210, d: 35, m: 5 },
        { idx: 65,  id: 'pink-t2-1-s3',    label: 'Pink T2 ★1 Step 3',  a: 17500, s: 210, d: 35, m: 5 },
        { idx: 66,  id: 'pink-t2-2',       label: 'Pink T2 ★2',         a: 17500, s: 210, d: 35, m: 5 },
        { idx: 67,  id: 'pink-t2-2-s1',    label: 'Pink T2 ★2 Step 1',  a: 18000, s: 217, d: 36, m: 5 },
        { idx: 68,  id: 'pink-t2-2-s2',    label: 'Pink T2 ★2 Step 2',  a: 18000, s: 217, d: 36, m: 5 },
        { idx: 69,  id: 'pink-t2-2-s3',    label: 'Pink T2 ★2 Step 3',  a: 18000, s: 217, d: 36, m: 5 },
        { idx: 70,  id: 'pink-t2-3',       label: 'Pink T2 ★3',         a: 18000, s: 219, d: 37, m: 5 },
        { idx: 71,  id: 'pink-t2-3-s1',    label: 'Pink T2 ★3 Step 1',  a: 18500, s: 225, d: 37, m: 5 },
        { idx: 72,  id: 'pink-t2-3-s2',    label: 'Pink T2 ★3 Step 2',  a: 18500, s: 225, d: 37, m: 5 },
        { idx: 73,  id: 'pink-t2-3-s3',    label: 'Pink T2 ★3 Step 3',  a: 18500, s: 225, d: 37, m: 5 },
        { idx: 74,  id: 'pink-t3',         label: 'Pink T3',             a: 18500, s: 225, d: 39, m: 5 },
        { idx: 75,  id: 'pink-t3-s1',      label: 'Pink T3 Step 1',      a: 19250, s: 237, d: 40, m: 6 },
        { idx: 76,  id: 'pink-t3-s2',      label: 'Pink T3 Step 2',      a: 19250, s: 237, d: 40, m: 6 },
        { idx: 77,  id: 'pink-t3-s3',      label: 'Pink T3 Step 3',      a: 19250, s: 237, d: 40, m: 6 },
        { idx: 78,  id: 'pink-t3-1',       label: 'Pink T3 ★1',         a: 19250, s: 239, d: 40, m: 7 },
        { idx: 79,  id: 'pink-t3-1-s1',    label: 'Pink T3 ★1 Step 1',  a: 20000, s: 247, d: 41, m: 6 },
        { idx: 80,  id: 'pink-t3-1-s2',    label: 'Pink T3 ★1 Step 2',  a: 20000, s: 247, d: 41, m: 6 },
        { idx: 81,  id: 'pink-t3-1-s3',    label: 'Pink T3 ★1 Step 3',  a: 20000, s: 247, d: 41, m: 6 },
        { idx: 82,  id: 'pink-t3-2',       label: 'Pink T3 ★2',         a: 20000, s: 249, d: 42, m: 7 },
        { idx: 83,  id: 'pink-t3-2-s1',    label: 'Pink T3 ★2 Step 1',  a: 20750, s: 257, d: 42, m: 6 },
        { idx: 84,  id: 'pink-t3-2-s2',    label: 'Pink T3 ★2 Step 2',  a: 20750, s: 257, d: 42, m: 6 },
        { idx: 85,  id: 'pink-t3-2-s3',    label: 'Pink T3 ★2 Step 3',  a: 20750, s: 257, d: 42, m: 6 },
        { idx: 86,  id: 'pink-t3-3',       label: 'Pink T3 ★3',         a: 20750, s: 259, d: 44, m: 7 },
        { idx: 87,  id: 'pink-t3-3-s1',    label: 'Pink T3 ★3 Step 1',  a: 24000, s: 300, d: 50, m: 8 },
        { idx: 88,  id: 'pink-t3-3-s2',    label: 'Pink T3 ★3 Step 2',  a: 24000, s: 300, d: 50, m: 8 },
        { idx: 89,  id: 'pink-t3-3-s3',    label: 'Pink T3 ★3 Step 3',  a: 24000, s: 300, d: 50, m: 8 },
        { idx: 90,  id: 'pink-t4',         label: 'Pink T4',             a: 24000, s: 300, d: 50, m: 8 },
        { idx: 91,  id: 'pink-t4-s1',      label: 'Pink T4 Step 1',      a: 28000, s: 330, d: 55, m: 8 },
        { idx: 92,  id: 'pink-t4-s2',      label: 'Pink T4 Step 2',      a: 28000, s: 330, d: 55, m: 8 },
        { idx: 93,  id: 'pink-t4-s3',      label: 'Pink T4 Step 3',      a: 28000, s: 330, d: 55, m: 8 },
        { idx: 94,  id: 'pink-t4-1',       label: 'Pink T4 ★1',         a: 28000, s: 330, d: 55, m: 8 },
        { idx: 95,  id: 'pink-t4-1-s1',    label: 'Pink T4 ★1 Step 1',  a: 32000, s: 360, d: 60, m: 8 },
        { idx: 96,  id: 'pink-t4-1-s2',    label: 'Pink T4 ★1 Step 2',  a: 32000, s: 360, d: 60, m: 8 },
        { idx: 97,  id: 'pink-t4-1-s3',    label: 'Pink T4 ★1 Step 3',  a: 32000, s: 360, d: 60, m: 8 },
        { idx: 98,  id: 'pink-t4-2',       label: 'Pink T4 ★2',         a: 32000, s: 360, d: 60, m: 8 },
        { idx: 99,  id: 'pink-t4-2-s1',    label: 'Pink T4 ★2 Step 1',  a: 36000, s: 390, d: 65, m: 8 },
        { idx: 100, id: 'pink-t4-2-s2',    label: 'Pink T4 ★2 Step 2',  a: 36000, s: 390, d: 65, m: 8 },
        { idx: 101, id: 'pink-t4-2-s3',    label: 'Pink T4 ★2 Step 3',  a: 36000, s: 390, d: 65, m: 8 }

    ],
    /* ══════════════════════════════════════════════════════════════════════ */
    /*  API                                                                  */
    /* ══════════════════════════════════════════════════════════════════════ */

    getCostByIndex: function (idx) {
        if (idx < 0 || idx >= this.costs.length) {
            return { a: 0, s: 0, d: 0, m: 0 };
        }
        return this.costs[idx];
    },

    getIndexById: function (id) {
        for (var i = 0; i < this.costs.length; i++) {
            if (this.costs[i].id === id) return this.costs[i].idx;
        }
        return 0; // Default to 'none'
    },

    calcRange: function (fromIdx, toIdx) {
        var totA = 0, totS = 0, totD = 0, totM = 0;

        // Ensure bounds
        if (fromIdx < 0) fromIdx = 0;
        if (toIdx >= this.costs.length) toIdx = this.costs.length - 1;

        // Sum costs from fromIdx+1 to toIdx
        for (var i = fromIdx + 1; i <= toIdx; i++) {
            var c = this.costs[i];
            totA += c.a;
            totS += c.s;
            totD += c.d;
            totM += c.m;
        }

        return {
            a: totA,
            s: totS,
            d: totD,
            m: totM
        };
    },

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
