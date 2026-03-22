/**
 * PROPRIETARY AND CONFIDENTIAL. (c) 2026 Fong Family Arcade / Wayne Edmond Fong. Do not distribute.
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
    /* Each index corresponds to the row number (0 to 46).                      */
    costs: [
        { idx: 0,  id: "none",            label: "None",            a: 0,      s: 0,    d: 0,   m: 0,  stat_bonus: 0,      deploy_cap: 0,    power: 0,       svs_score: 0 },
        { idx: 1,  id: "green",           label: "Green",           a: 1500,   s: 15,   d: 0,   m: 0,  stat_bonus: 9.35,   deploy_cap: 0,    power: 224400,  svs_score: 1125 },
        { idx: 2,  id: "green-1",         label: "Green \u2605",    a: 3800,   s: 40,   d: 0,   m: 0,  stat_bonus: 12.75,  deploy_cap: 0,    power: 306000,  svs_score: 1875 },
        { idx: 3,  id: "blue",            label: "Blue",            a: 7000,   s: 70,   d: 0,   m: 0,  stat_bonus: 17.00,  deploy_cap: 0,    power: 408000,  svs_score: 3000 },
        { idx: 4,  id: "blue-1",          label: "Blue \u2605",     a: 9700,   s: 95,   d: 0,   m: 0,  stat_bonus: 21.25,  deploy_cap: 0,    power: 510000,  svs_score: 4500 },
        { idx: 5,  id: "blue-2",          label: "Blue \u2605\u2605",a: 0,      s: 0,    d: 45,  m: 0,  stat_bonus: 25.50,  deploy_cap: 0,    power: 612000,  svs_score: 5100 },
        { idx: 6,  id: "blue-3",          label: "Blue \u2605\u2605\u2605",a: 0,s: 0,   d: 50,  m: 0,  stat_bonus: 29.75,  deploy_cap: 0,    power: 714000,  svs_score: 5440 },
        { idx: 7,  id: "purple",          label: "Purple",          a: 0,      s: 0,    d: 60,  m: 0,  stat_bonus: 34.00,  deploy_cap: 0,    power: 816000,  svs_score: 3230 },
        { idx: 8,  id: "purple-1",        label: "Purple \u2605",   a: 0,      s: 0,    d: 70,  m: 0,  stat_bonus: 36.89,  deploy_cap: 0,    power: 885360,  svs_score: 3230 },
        { idx: 9,  id: "purple-2",        label: "Purple \u2605\u2605",a: 6500,s: 65,   d: 40,  m: 0,  stat_bonus: 39.78,  deploy_cap: 0,    power: 954720,  svs_score: 3225 },
        { idx: 10, id: "purple-3",        label: "Purple \u2605\u2605\u2605",a: 8000,s: 80, d: 50,m: 0, stat_bonus: 42.67,  deploy_cap: 0,    power: 1024080, svs_score: 3225 },
        { idx: 11, id: "purple-t1",       label: "Purple T1",       a: 10000,  s: 95,   d: 60,  m: 0,  stat_bonus: 45.56,  deploy_cap: 0,    power: 1093440, svs_score: 3440 },
        { idx: 12, id: "purple-t1-1",     label: "Purple T1 \u2605",a: 11000,  s: 110,  d: 70,  m: 0,  stat_bonus: 48.45,  deploy_cap: 0,    power: 1162800, svs_score: 3440 },
        { idx: 13, id: "purple-t1-2",     label: "Purple T1 \u2605\u2605",a: 13000,s: 130,d: 85,m: 0, stat_bonus: 51.34,  deploy_cap: 0,    power: 1232160, svs_score: 4085 },
        { idx: 14, id: "purple-t1-3",     label: "Purple T1 \u2605\u2605\u2605",a: 15000,s: 160,d: 100,m: 0,stat_bonus: 54.23,deploy_cap: 0,  power: 1301520, svs_score: 4085 },
        { idx: 15, id: "gold",            label: "Gold",            a: 22000,  s: 220,  d: 40,  m: 0,  stat_bonus: 56.78,  deploy_cap: 0,    power: 1362720, svs_score: 6250 },
        { idx: 16, id: "gold-1",          label: "Gold \u2605",     a: 23000,  s: 230,  d: 40,  m: 0,  stat_bonus: 59.33,  deploy_cap: 0,    power: 1423920, svs_score: 6250 },
        { idx: 17, id: "gold-2",          label: "Gold \u2605\u2605",a: 25000, s: 250,  d: 45,  m: 0,  stat_bonus: 61.88,  deploy_cap: 0,    power: 1485120, svs_score: 6250 },
        { idx: 18, id: "gold-3",          label: "Gold \u2605\u2605\u2605",a: 26000,s: 260,d: 45,m: 0, stat_bonus: 64.43,  deploy_cap: 0,    power: 1546320, svs_score: 6250 },
        { idx: 19, id: "gold-t1",         label: "Gold T1",         a: 28000,  s: 280,  d: 45,  m: 0,  stat_bonus: 66.98,  deploy_cap: 0,    power: 1607520, svs_score: 6250 },
        { idx: 20, id: "gold-t1-1",       label: "Gold T1 \u2605",  a: 30000,  s: 300,  d: 55,  m: 0,  stat_bonus: 69.53,  deploy_cap: 0,    power: 1668720, svs_score: 6250 },
        { idx: 21, id: "gold-t1-2",       label: "Gold T1 \u2605\u2605",a: 32000,s: 320,d: 55,  m: 0,  stat_bonus: 72.08,  deploy_cap: 0,    power: 1729920, svs_score: 6250 },
        { idx: 22, id: "gold-t1-3",       label: "Gold T1 \u2605\u2605\u2605",a: 35000,s: 340,d: 55,m: 0,stat_bonus: 74.63, deploy_cap: 0,    power: 1791120, svs_score: 6250 },
        { idx: 23, id: "gold-t2",         label: "Gold T2",         a: 38000,  s: 390,  d: 55,  m: 0,  stat_bonus: 77.18,  deploy_cap: 0,    power: 1852320, svs_score: 6250 },
        { idx: 24, id: "gold-t2-1",       label: "Gold T2 \u2605",  a: 43000,  s: 430,  d: 75,  m: 0,  stat_bonus: 79.73,  deploy_cap: 0,    power: 1913520, svs_score: 6250 },
        { idx: 25, id: "gold-t2-2",       label: "Gold T2 \u2605\u2605",a: 45000,s: 460,d: 80,  m: 0,  stat_bonus: 82.28,  deploy_cap: 0,    power: 1974720, svs_score: 6250 },
        { idx: 26, id: "gold-t2-3",       label: "Gold T2 \u2605\u2605\u2605",a: 48000,s: 500,d: 85,m: 0,stat_bonus: 85.00, deploy_cap: 0,    power: 2040000, svs_score: 6250 },
        { idx: 27, id: "pink",             label: "Pink",             a: 50000,  s: 530,  d: 85,  m: 10, stat_bonus: 89.25,  deploy_cap: 40,   power: 2142000, svs_score: 9560 },
        { idx: 28, id: "pink-1",           label: "Pink \u2605",      a: 52000,  s: 560,  d: 90,  m: 10, stat_bonus: 93.50,  deploy_cap: 80,   power: 2244000, svs_score: 9560 },
        { idx: 29, id: "pink-2",           label: "Pink \u2605\u2605",a: 54000,  s: 590,  d: 95,  m: 10, stat_bonus: 97.75,  deploy_cap: 120,  power: 2346000, svs_score: 9560 },
        { idx: 30, id: "pink-3",           label: "Pink \u2605\u2605\u2605",a: 56000,s: 620,d: 100,m: 10,stat_bonus: 102.00, deploy_cap: 160,  power: 2448000, svs_score: 9560 },
        { idx: 31, id: "pink-t1",          label: "Pink T1",          a: 59000,  s: 670,  d: 110, m: 15, stat_bonus: 106.25, deploy_cap: 290,  power: 2550000, svs_score: 9560 },
        { idx: 32, id: "pink-t1-1",        label: "Pink T1 \u2605",   a: 61000,  s: 700,  d: 115, m: 15, stat_bonus: 110.50, deploy_cap: 330,  power: 2652000, svs_score: 9560 },
        { idx: 33, id: "pink-t1-2",        label: "Pink T1 \u2605\u2605",a: 63000,s: 730, d: 120, m: 15, stat_bonus: 114.75, deploy_cap: 370,  power: 2754000, svs_score: 9560 },
        { idx: 34, id: "pink-t1-3",        label: "Pink T1 \u2605\u2605\u2605",a: 65000,s: 760,d: 125,m: 15,stat_bonus: 119.00,deploy_cap: 410,  power: 2856000, svs_score: 9560 },
        { idx: 35, id: "pink-t2",          label: "Pink T2",          a: 68000,  s: 810,  d: 135, m: 20, stat_bonus: 123.25, deploy_cap: 540,  power: 2958000, svs_score: 9560 },
        { idx: 36, id: "pink-t2-1",        label: "Pink T2 \u2605",   a: 70000,  s: 840,  d: 140, m: 20, stat_bonus: 127.50, deploy_cap: 580,  power: 3060000, svs_score: 9560 },
        { idx: 37, id: "pink-t2-2",        label: "Pink T2 \u2605\u2605",a: 72000,s: 870, d: 145, m: 20, stat_bonus: 131.75, deploy_cap: 620,  power: 3162000, svs_score: 9560 },
        { idx: 38, id: "pink-t2-3",        label: "Pink T2 \u2605\u2605\u2605",a: 74000,s: 900,d: 150,m: 20,stat_bonus: 136.00,deploy_cap: 660,  power: 3264000, svs_score: 9560 },
        { idx: 39, id: "pink-t3",          label: "Pink T3",          a: 77000,  s: 950,  d: 160, m: 25, stat_bonus: 140.25, deploy_cap: 790,  power: 3366000, svs_score: 9560 },
        { idx: 40, id: "pink-t3-1",        label: "Pink T3 \u2605",   a: 80000,  s: 990,  d: 165, m: 25, stat_bonus: 144.50, deploy_cap: 830,  power: 3468000, svs_score: 9560 },
        { idx: 41, id: "pink-t3-2",        label: "Pink T3 \u2605\u2605",a: 83000,s: 1030,d: 170, m: 25, stat_bonus: 148.75, deploy_cap: 870,  power: 3570000, svs_score: 9560 },
        { idx: 42, id: "pink-t3-3",        label: "Pink T3 \u2605\u2605\u2605",a: 86000,s: 1070,d: 180,m: 25,stat_bonus: 153.00,deploy_cap: 910,  power: 3672000, svs_score: 9560 },
        { idx: 43, id: "pink-t4",          label: "Pink T4",          a: 120000, s: 1500, d: 250, m: 40, stat_bonus: 161.50, deploy_cap: 1050, power: 3876000, svs_score: 0 },
        { idx: 44, id: "pink-t4-1",        label: "Pink T4 \u2605",   a: 140000, s: 1650, d: 275, m: 40, stat_bonus: 170.00, deploy_cap: 1100, power: 4080000, svs_score: 0 },
        { idx: 45, id: "pink-t4-2",        label: "Pink T4 \u2605\u2605",a: 160000,s: 1800,d: 300, m: 40, stat_bonus: 178.50, deploy_cap: 1150, power: 4284000, svs_score: 0 },
        { idx: 46, id: "pink-t4-3",        label: "Pink T4 \u2605\u2605\u2605",a: 180000,s: 1950,d: 325,m: 40,stat_bonus: 187.00,deploy_cap: 1200, power: 4488000, svs_score: 0 }
    ],
    /* ══════════════════════════════════════════════════════════════════════ */
    /*  API                                                                  */
    /* ══════════════════════════════════════════════════════════════════════ */

    getCostByIndex: function (idx) {
        if (idx < 0 || idx >= this.costs.length) {
            return { a: 0, s: 0, d: 0, m: 0, svs_score: 0 };
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
        var totA = 0, totS = 0, totD = 0, totM = 0, totSvs = 0;

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
            totSvs += c.svs_score;
        }

        return {
            a: totA,
            s: totS,
            d: totD,
            m: totM,
            svs: totSvs
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
