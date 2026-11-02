/**
 * ffa.js - pure game logic for 13 Card free-for-all (Chinese Poker, you plus 1 to 3 NPCs).
 * Strict ES5. No DOM, no network. Loads as a classic script (window.FFA) and in node (module.exports).
 *
 * Rules as built (standard Chinese Poker):
 *  - 13 cards each, set as front (3), middle (5), back (5). Back >= middle >= front or it is a FOUL.
 *  - Front ranks trips > pair > high card only (no straights or flushes). Middle and back use normal 5-card ranks.
 *  - Every pair of players is compared. Each row won +1, lost -1, tie 0. Winning all three rows adds +3 (scoop, 6 total).
 *  - A fouled player pays 6 to every non-fouled opponent and collects nothing. Two fouls in one pair score 0.
 *  - Royalties are NOT in this version. See OPTIONS.royalties (hook only).
 *  - One point is worth the ante in coins.
 *
 * The evaluator here is an ES5 port of the ranking in games/cards/poker/shared/evaluator.js (category first,
 * then kickers). That file is an ES module so a classic script (and file://) cannot load it.
 */
(function (root) {
    'use strict';

    var has = Object.prototype.hasOwnProperty;

    // Hook for a later version. Not used: no royalties are paid.
    var OPTIONS = { royalties: false, scoopBonus: 3, foulPenalty: 6 };

    var STORE_KEY = 'fong.13card.save';
    var START_BANK = 100;
    var ANTES = [1, 2, 5];
    var MAX_BANK = 1000000000;
    var ROW_NAMES = ['front', 'mid', 'back'];

    // ---------- cards ----------
    var SUITS = ['S', 'H', 'D', 'C'];
    var LABELS = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

    function rankLabel(r) { return has.call(LABELS, r) ? LABELS[r] : String(r); }

    function makeDeck() {
        var d = [];
        for (var s = 0; s < 4; s++) {
            for (var r = 2; r <= 14; r++) { d.push({ id: rankLabel(r) + SUITS[s], rank: r, suit: SUITS[s] }); }
        }
        return d;
    }

    function shuffle(arr, rng) {
        rng = rng || Math.random;
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    // ---------- evaluator ----------
    // Groups of equal rank, biggest group first, then higher rank first.
    function groupRanks(cards) {
        var counts = {}, i, k;
        for (i = 0; i < cards.length; i++) {
            k = cards[i].rank;
            counts[k] = (counts[k] || 0) + 1;
        }
        var g = [];
        for (k in counts) { if (has.call(counts, k)) { g.push({ rank: +k, count: counts[k] }); } }
        g.sort(function (a, b) { return b.count - a.count || b.rank - a.rank; });
        return g;
    }

    function pack(cat, kick) {
        var s = cat * 1e10;
        for (var i = 0; i < kick.length; i++) { s += kick[i] * Math.pow(100, 4 - i); }
        return s;
    }

    var NAMES5 = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'];

    function eval5(cards) {
        var g = groupRanks(cards), i;
        var kick = [];
        for (i = 0; i < g.length; i++) { kick.push(g[i].rank); }
        var flush = true;
        for (i = 1; i < 5; i++) { if (cards[i].suit !== cards[0].suit) { flush = false; } }
        var straight = false;
        if (g.length === 5) {
            if (kick[0] - kick[4] === 4) { straight = true; }
            else if (kick[0] === 14 && kick[1] === 5 && kick[4] === 2) { straight = true; kick = [5, 4, 3, 2, 1]; }
        }
        var cat;
        if (straight && flush) { cat = 8; }
        else if (g[0].count === 4) { cat = 7; }
        else if (g[0].count === 3 && g.length === 2) { cat = 6; }
        else if (flush) { cat = 5; }
        else if (straight) { cat = 4; }
        else if (g[0].count === 3) { cat = 3; }
        else if (g[0].count === 2 && g[1].count === 2) { cat = 2; }
        else if (g[0].count === 2) { cat = 1; }
        else { cat = 0; }
        var name = NAMES5[cat];
        if (cat === 8 && kick[0] === 14) { name = 'Royal Flush'; }
        return { cat: cat, name: name, score: pack(cat, kick) };
    }

    // Front row: trips (3) > pair (1) > high card (0). Category numbers match eval5 so rows compare directly.
    function eval3(cards) {
        var g = groupRanks(cards), kick = [], i;
        for (i = 0; i < g.length; i++) { kick.push(g[i].rank); }
        var cat = 0, name = 'High Card';
        if (g[0].count === 3) { cat = 3; name = 'Three of a Kind'; }
        else if (g[0].count === 2) { cat = 1; name = 'Pair'; }
        return { cat: cat, name: name, score: pack(cat, kick) };
    }

    function evalRow(cards) {
        if (cards && cards.length === 3) { return eval3(cards); }
        if (cards && cards.length === 5) { return eval5(cards); }
        return { cat: -1, name: 'Invalid', score: -1 };
    }

    function cmp(a, b) { return a > b ? 1 : (a < b ? -1 : 0); }

    // ---------- arrangement ----------
    // rows: { front: [3 cards], mid: [5], back: [5] }
    function validShape(rows) {
        if (!rows || !rows.front || !rows.mid || !rows.back) { return false; }
        if (rows.front.length !== 3 || rows.mid.length !== 5 || rows.back.length !== 5) { return false; }
        var seen = {}, all = rows.front.concat(rows.mid, rows.back);
        for (var i = 0; i < all.length; i++) {
            if (!all[i] || typeof all[i].id !== 'string' || has.call(seen, all[i].id)) { return false; }
            seen[all[i].id] = true;
        }
        return true;
    }

    // A foul is a misordered row or a bad shape.
    function isFoul(rows) {
        if (!validShape(rows)) { return true; }
        var f = eval3(rows.front).score, m = eval5(rows.mid).score, b = eval5(rows.back).score;
        return m < f || b < m;
    }

    function describe(rows) {
        return { front: evalRow(rows.front), mid: evalRow(rows.mid), back: evalRow(rows.back), foul: isFoul(rows) };
    }

    // ---------- scoring ----------
    // Two non-fouled players. Returns points from A's side: rows [f,m,b] each -1/0/1, scoop -1/0/1, total.
    function scorePair(rowsA, rowsB) {
        var r = [], wins = 0, losses = 0, sum = 0;
        for (var i = 0; i < 3; i++) {
            var k = ROW_NAMES[i];
            var c = cmp(evalRow(rowsA[k]).score, evalRow(rowsB[k]).score);
            r.push(c); sum += c;
            if (c > 0) { wins++; } else if (c < 0) { losses++; }
        }
        var scoop = wins === 3 ? 1 : (losses === 3 ? -1 : 0);
        return { rows: r, scoop: scoop, total: sum + scoop * OPTIONS.scoopBonus };
    }

    // players: [{id, rows}] (rows null or misordered = foul). ante: coins per point.
    // Returns pairs (a vs b, points from a's side), owes (loser to winner), points and coins per player,
    // rowTotals per player (sum of row results vs every opponent, for the per-row flashes), fouls.
    function scoreRound(players, ante) {
        ante = ante > 0 ? ante : 1;
        var fouls = {}, points = {}, rowTotals = {}, pairs = [], owes = [], i, j;
        for (i = 0; i < players.length; i++) {
            fouls[players[i].id] = isFoul(players[i].rows);
            points[players[i].id] = 0;
            rowTotals[players[i].id] = [0, 0, 0];
        }
        for (i = 0; i < players.length; i++) {
            for (j = i + 1; j < players.length; j++) {
                var A = players[i], B = players[j], p;
                if (fouls[A.id] && fouls[B.id]) {
                    p = { rows: [0, 0, 0], scoop: 0, total: 0, note: 'both foul' };
                } else if (fouls[A.id]) {
                    p = { rows: [0, 0, 0], scoop: 0, total: -OPTIONS.foulPenalty, note: 'foul' };
                } else if (fouls[B.id]) {
                    p = { rows: [0, 0, 0], scoop: 0, total: OPTIONS.foulPenalty, note: 'foul' };
                } else {
                    p = scorePair(A.rows, B.rows);
                    p.note = p.scoop ? 'scoop' : '';
                    for (var k = 0; k < 3; k++) {
                        rowTotals[A.id][k] += p.rows[k];
                        rowTotals[B.id][k] -= p.rows[k];
                    }
                }
                p.a = A.id; p.b = B.id;
                pairs.push(p);
                points[A.id] += p.total;
                points[B.id] -= p.total;
                if (p.total > 0) { owes.push({ from: B.id, to: A.id, points: p.total }); }
                else if (p.total < 0) { owes.push({ from: A.id, to: B.id, points: -p.total }); }
            }
        }
        var coins = {};
        for (i = 0; i < players.length; i++) { coins[players[i].id] = points[players[i].id] * ante; }
        return { pairs: pairs, owes: owes, points: points, coins: coins, rowTotals: rowTotals, fouls: fouls, ante: ante };
    }

    // ---------- settlement ----------
    // Input: nets {id: coins} (sum 0) and ids (order). Output: [{from, to, coins}], conserves totals.
    // Tie rule (Wayne's example): when every payer's debt splits into whole coins in proportion to what each
    // receiver is owed, each payer pays every receiver that share (A and D each pay B 1 and C 1).
    // Otherwise fewest transfers: match equal debt and credit first, then largest debtor pays largest creditor.
    function settle(nets, ids) {
        var debtors = [], creditors = [], total = 0, i, j;
        for (i = 0; i < ids.length; i++) {
            var n = has.call(nets, ids[i]) ? Math.round(nets[ids[i]]) : 0;
            if (n < 0) { debtors.push({ id: ids[i], amt: -n }); }
            else if (n > 0) { creditors.push({ id: ids[i], amt: n }); total += n; }
        }
        var out = [];
        if (!debtors.length || !creditors.length) { return out; }

        var whole = true;
        for (i = 0; i < debtors.length; i++) {
            for (j = 0; j < creditors.length; j++) {
                if ((debtors[i].amt * creditors[j].amt) % total !== 0) { whole = false; }
            }
        }
        if (whole) {
            for (i = 0; i < debtors.length; i++) {
                for (j = 0; j < creditors.length; j++) {
                    var c = debtors[i].amt * creditors[j].amt / total;
                    if (c > 0) { out.push({ from: debtors[i].id, to: creditors[j].id, coins: c }); }
                }
            }
            return out;
        }

        // exact matches first
        for (i = 0; i < debtors.length; i++) {
            for (j = 0; j < creditors.length; j++) {
                if (debtors[i].amt > 0 && debtors[i].amt === creditors[j].amt) {
                    out.push({ from: debtors[i].id, to: creditors[j].id, coins: debtors[i].amt });
                    debtors[i].amt = 0; creditors[j].amt = 0;
                }
            }
        }
        // then greedy, largest first
        function big(list) {
            var b = null;
            for (var q = 0; q < list.length; q++) { if (list[q].amt > 0 && (!b || list[q].amt > b.amt)) { b = list[q]; } }
            return b;
        }
        var guard = 20;
        while (guard-- > 0) {
            var d = big(debtors), cr = big(creditors);
            if (!d || !cr) { break; }
            var x = d.amt < cr.amt ? d.amt : cr.amt;
            out.push({ from: d.id, to: cr.id, coins: x });
            d.amt -= x; cr.amt -= x;
        }
        return out;
    }

    // ---------- bankroll save (one key, versioned, tamper-safe) ----------
    var BANK_IDS = ['you', 'n1', 'n2', 'n3'];

    function defaultState() {
        return { v: 1, ante: 1, npcs: 3, skip: false, rounds: 0, bank: { you: START_BANK, n1: START_BANK, n2: START_BANK, n3: START_BANK } };
    }

    function cleanInt(x, lo, hi, dflt) {
        if (typeof x !== 'number' || x !== x || x === Infinity || x === -Infinity) { return dflt; }
        x = Math.round(x);
        return x < lo ? lo : (x > hi ? hi : x);
    }

    function sanitizeState(o) {
        var s = defaultState();
        if (!o || typeof o !== 'object' || Object.prototype.toString.call(o) === '[object Array]') { return s; }
        if (o.v !== 1) { return s; }
        if (has.call(o, 'ante') && ANTES.indexOf(o.ante) >= 0) { s.ante = o.ante; }
        if (has.call(o, 'npcs')) { s.npcs = cleanInt(o.npcs, 1, 3, 3); }
        if (has.call(o, 'skip')) { s.skip = o.skip === true; }
        if (has.call(o, 'rounds')) { s.rounds = cleanInt(o.rounds, 0, MAX_BANK, 0); }
        if (has.call(o, 'bank') && o.bank && typeof o.bank === 'object') {
            for (var i = 0; i < BANK_IDS.length; i++) {
                var id = BANK_IDS[i];
                if (has.call(o.bank, id)) { s.bank[id] = cleanInt(o.bank[id], -MAX_BANK, MAX_BANK, START_BANK); }
            }
        }
        return s;
    }

    function loadState(storage) {
        var raw = null;
        try { raw = storage.getItem(STORE_KEY); } catch (e) { raw = null; }
        if (typeof raw !== 'string' || raw.length > 20000) { return defaultState(); }
        var o = null;
        try { o = JSON.parse(raw); } catch (e2) { return defaultState(); }
        return sanitizeState(o);
    }

    function saveState(storage, state) {
        try { storage.setItem(STORE_KEY, JSON.stringify(sanitizeState(state))); return true; } catch (e) { return false; }
    }

    function resetBanks(state) {
        for (var i = 0; i < BANK_IDS.length; i++) { state.bank[BANK_IDS[i]] = START_BANK; }
        state.rounds = 0;
        return state;
    }

    // ---------- NPC roster ----------
    var NPCS = [
        { id: 'n1', name: 'Dana', personality: 'cautious', blurb: 'Plays it safe with even rows.',
          face: { bg: '#fde68a', skin: '#8d5524', hair: '#2a1a10', style: 'curly', glasses: true, hat: 'none', hatColor: '#000000', shirt: '#e07a5f' } },
        { id: 'n2', name: 'Rafi', personality: 'greedy', blurb: 'Loads up the back row.',
          face: { bg: '#bae6fd', skin: '#ffdbac', hair: '#b45f2a', style: 'short', glasses: false, hat: 'cap', hatColor: '#2563eb', shirt: '#16a34a' } },
        { id: 'n3', name: 'Mina', personality: 'balanced', blurb: 'Spreads strength across the rows.',
          face: { bg: '#fbcfe8', skin: '#e0ac69', hair: '#1c1c1c', style: 'long', glasses: false, hat: 'beanie', hatColor: '#f59e0b', shirt: '#7c3aed' } }
    ];

    // ---------- NPC search ----------
    // All masks with 5 bits out of 13 (1287) and, for each, the 5-bit masks that do not overlap it (56 each).
    var MASKS5 = null, DISJOINT = null;

    function popcount(m) { var c = 0; while (m) { c += m & 1; m >>= 1; } return c; }

    function initTables() {
        if (MASKS5) { return; }
        MASKS5 = [];
        var m, i, j;
        for (m = 0; m < 8192; m++) { if (popcount(m) === 5) { MASKS5.push(m); } }
        DISJOINT = [];
        for (i = 0; i < MASKS5.length; i++) {
            var list = [];
            for (j = 0; j < MASKS5.length; j++) { if ((MASKS5[i] & MASKS5[j]) === 0) { list.push(j); } }
            DISJOINT.push(list);
        }
    }

    function subset(cards, mask) {
        var out = [];
        for (var i = 0; i < cards.length; i++) { if (mask & (1 << i)) { out.push(cards[i]); } }
        return out;
    }

    function idxOf(mask, cards) {
        var out = [];
        for (var i = 0; i < cards.length; i++) { if (mask & (1 << i)) { out.push(i); } }
        out.sort(function (a, b) { return cards[b].rank - cards[a].rank; });
        return out;
    }

    // true if triple a is better than triple b for this personality. Triples are [back, mid, front] scores.
    function better(personality, a, b) {
        if (!b) { return true; }
        var sa = [a[0] / 1e10, a[1] / 1e10, a[2] / 1e10], sb = [b[0] / 1e10, b[1] / 1e10, b[2] / 1e10], x, y;
        if (personality === 'greedy') {
            // strongest back, then middle, then front
            for (var i = 0; i < 3; i++) { if (a[i] !== b[i]) { return a[i] > b[i]; } }
            return false;
        }
        if (personality === 'cautious') {
            // even rows: smallest hand-category gap between neighbouring rows (back-mid plus mid-front),
            // then the stronger total. Kickers do not count toward the gap.
            x = Math.floor(sa[0]) - Math.floor(sa[2]); y = Math.floor(sb[0]) - Math.floor(sb[2]);
            if (x !== y) { return x < y; }
            return sa[0] + sa[1] + sa[2] > sb[0] + sb[1] + sb[2];
        }
        // balanced: weighted total, middle and back count a little more
        x = sa[0] * 1.2 + sa[1] * 1.1 + sa[2];
        y = sb[0] * 1.2 + sb[1] * 1.1 + sb[2];
        return x > y;
    }

    // Returns { front: [idx], mid: [idx], back: [idx] } into the 13 cards. Always legal (a legal one always exists:
    // take the best back, then the best middle of what is left, the front 3 can never beat that middle).
    function arrange(cards, personality) {
        initTables();
        var s5 = new Array(8192), i, j;
        for (i = 0; i < MASKS5.length; i++) { s5[MASKS5[i]] = eval5(subset(cards, MASKS5[i])).score; }
        var s3 = {};
        function front3(mask) {
            if (!has.call(s3, mask)) { s3[mask] = eval3(subset(cards, mask)).score; }
            return s3[mask];
        }
        var best = null, bestM = null;
        for (i = 0; i < MASKS5.length; i++) {
            var back = MASKS5[i], sb = s5[back], rem = 8191 ^ back, list = DISJOINT[i];
            for (j = 0; j < list.length; j++) {
                var mid = MASKS5[list[j]], sm = s5[mid];
                if (sm > sb) { continue; }
                var front = rem ^ mid, sf = front3(front);
                if (sf > sm) { continue; }
                var t = [sb, sm, sf];
                if (better(personality, t, best)) { best = t; bestM = [front, mid, back]; }
            }
        }
        return { front: idxOf(bestM[0], cards), mid: idxOf(bestM[1], cards), back: idxOf(bestM[2], cards) };
    }

    function rowsFromIdx(cards, idx) {
        function pick(a) { var o = []; for (var i = 0; i < a.length; i++) { o.push(cards[a[i]]); } return o; }
        return { front: pick(idx.front), mid: pick(idx.mid), back: pick(idx.back) };
    }

    // Plain starting layout for the human: cards high to low, first 3 front, next 5 middle, last 5 back.
    function plainRows(cards) {
        var c = cards.slice().sort(function (a, b) { return b.rank - a.rank; });
        return { front: c.slice(0, 3), mid: c.slice(3, 8), back: c.slice(8, 13) };
    }

    var api = {
        OPTIONS: OPTIONS, STORE_KEY: STORE_KEY, START_BANK: START_BANK, ANTES: ANTES, ROW_NAMES: ROW_NAMES,
        NPCS: NPCS, BANK_IDS: BANK_IDS,
        rankLabel: rankLabel, makeDeck: makeDeck, shuffle: shuffle,
        eval3: eval3, eval5: eval5, evalRow: evalRow, validShape: validShape, isFoul: isFoul, describe: describe,
        scorePair: scorePair, scoreRound: scoreRound, settle: settle,
        defaultState: defaultState, sanitizeState: sanitizeState, loadState: loadState, saveState: saveState, resetBanks: resetBanks,
        arrange: arrange, rowsFromIdx: rowsFromIdx, plainRows: plainRows
    };
    root.FFA = api;
    if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
