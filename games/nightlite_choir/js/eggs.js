/*
 * Nightlite Choir+: egg rules. No DOM here, so tests/nightlite.test.js can run it. Strict ES5.
 * Tiers 1 to 6 (grey, green, blue, purple, gold, red). Every blend has one tier (js/worlds/tiers.js).
 * An egg rolls a TIER first, then picks a blend of that tier (3 times as likely to be one you do not have).
 *  - A tier you own completely is "depleted": its share moves up to the next tier that still has something new.
 *  - Luck is a bonus in percent points. It moves that much of the odds from the lowest live tier up into the higher live tiers,
 *    in proportion to their normal odds. Selling a repeat (a blend you already had) banks luck, more for a rarer tier.
 *    Luck is spent by the next egg. Special eggs add their own boost to that one egg.
 */
(function (w) {
    'use strict';
    var TIER_ODDS = [50, 28, 14, 6, 1.9, 0.1];                     // percent, grey to red (sums to 100)
    var TIER_NAMES = ['grey', 'green', 'blue', 'purple', 'gold', 'red'];
    var TIER_COLORS = ['#b4bac4', '#7ed17a', '#6aa8ff', '#b07cff', '#ffc94a', '#ff5a5a'];
    var SELL_LUCK = [0.5, 1, 2, 4, 8, 16];                         // percent points banked by a repeat of that tier
    var LUCK_CAP = 60;                                             // most luck (percent points) that can ever be in play
    var NEW_WEIGHT = 3;                                            // inside a tier, a blend you lack is 3 times as likely
    // Special eggs. boost is in percent points of luck for that one egg. w is the weight of the roll (plain is the rest).
    var EGG_KINDS = [
        { id: 'plain', name: 'Plain egg', boost: 0, w: 78 },
        { id: 'spots', name: 'Pattern egg', boost: 5, w: 12 },
        { id: 'sparkle', name: 'Sparkle egg', boost: 12, w: 6 },
        { id: 'rainbow', name: 'Rainbow egg', boost: 25, w: 3.5 },
        { id: 'golden', name: 'Golden egg', boost: 45, w: 0.5 }
    ];
    var EGG_COLORS = ['#fbf0d8', '#f9d6e2', '#d3e8ff', '#d6f3d2', '#e6d9ff', '#ffe3c2', '#cdf1ee', '#fde9a8'];
    var EGG_PATTERNS = 3;                                          // spots, stripes, zigzag (pattern egg only)

    function tierOf(id, map) {
        var t = map && Object.prototype.hasOwnProperty.call(map, id) ? map[id] : 1;
        return (t >= 1 && t <= 6 && t === Math.floor(t)) ? t : 1;
    }
    // counts: array of 6 { total, owned }. Returns array of 6 percentages (sum 100), tier index 0..5.
    function odds(counts, luck, extra) {
        var p = TIER_ODDS.slice(), live = [], dead = [], i, j, moved, lowest, hi, sum, L, tot = 0;
        for (i = 0; i < 6; i++) {
            if (counts[i] && counts[i].total > 0 && counts[i].owned < counts[i].total) live.push(i); else dead.push(i);
        }
        if (!live.length) return p;                                // everything owned: nothing to steer
        // a depleted tier hands its share to the next live tier above (or the nearest live one below when none is above)
        for (i = 0; i < dead.length; i++) {
            j = dead[i]; hi = -1;
            for (moved = j + 1; moved < 6; moved++) if (live.indexOf(moved) >= 0) { hi = moved; break; }
            if (hi < 0) for (moved = j - 1; moved >= 0; moved--) if (live.indexOf(moved) >= 0) { hi = moved; break; }
            p[hi] += p[j]; p[j] = 0;
        }
        L = Math.max(0, Math.min(LUCK_CAP, (luck || 0) + (extra || 0)));
        lowest = live[0];
        sum = 0;
        for (i = 1; i < live.length; i++) sum += p[live[i]];
        if (L > 0 && live.length > 1 && sum > 0) {
            moved = Math.min(L, p[lowest]);
            p[lowest] -= moved;
            for (i = 1; i < live.length; i++) p[live[i]] += moved * p[live[i]] / sum;
        }
        for (i = 0; i < 6; i++) tot += p[i];
        for (i = 0; i < 6; i++) p[i] = p[i] * 100 / tot;
        return p;
    }
    function rollIndex(rnd, weights) {
        var tot = 0, i, r;
        for (i = 0; i < weights.length; i++) tot += weights[i];
        r = rnd() * tot;
        for (i = 0; i < weights.length; i++) { if (r < weights[i]) return i; r -= weights[i]; }
        for (i = weights.length - 1; i > 0; i--) if (weights[i] > 0) return i;       // float leftovers: the last real choice
        return 0;
    }
    // items: [{ id, tier (1..6), owned }]. Returns { id, tier, isNew } or null when there are no items.
    function rollBlend(rnd, items, luck, extra) {
        var counts = [], i, p, tierIdx, pool = [], wt = [], k;
        if (!items.length) return null;
        for (i = 0; i < 6; i++) counts.push({ total: 0, owned: 0 });
        for (i = 0; i < items.length; i++) { counts[items[i].tier - 1].total++; if (items[i].owned) counts[items[i].tier - 1].owned++; }
        p = odds(counts, luck, extra);
        for (i = 0; i < 6; i++) if (!counts[i].total) p[i] = 0;    // a tier with no blends cannot come up
        tierIdx = rollIndex(rnd, p);
        for (i = 0; i < items.length; i++) if (items[i].tier - 1 === tierIdx) { pool.push(items[i]); wt.push(items[i].owned ? 1 : NEW_WEIGHT); }
        k = rollIndex(rnd, wt);
        return { id: pool[k].id, tier: pool[k].tier, isNew: !pool[k].owned };
    }
    // A new egg's look: { kind, color (index), pattern (index) }
    function rollEgg(rnd) {
        var k = rollIndex(rnd, EGG_KINDS.map(function (e) { return e.w; }));
        return { kind: EGG_KINDS[k].id, color: Math.floor(rnd() * EGG_COLORS.length) % EGG_COLORS.length, pattern: Math.floor(rnd() * EGG_PATTERNS) % EGG_PATTERNS };
    }
    function kindById(id) {
        var i;
        for (i = 0; i < EGG_KINDS.length; i++) if (EGG_KINDS[i].id === id) return EGG_KINDS[i];
        return EGG_KINDS[0];
    }
    function isKind(id) { var i; for (i = 0; i < EGG_KINDS.length; i++) if (EGG_KINDS[i].id === id) return true; return false; }
    function sellLuck(tier) { return SELL_LUCK[(tier >= 1 && tier <= 6 ? tier : 1) - 1]; }
    function addLuck(have, gain) { return Math.min(LUCK_CAP, Math.max(0, (have || 0) + gain)); }

    w.NightliteEggs = { TIER_ODDS: TIER_ODDS, TIER_NAMES: TIER_NAMES, TIER_COLORS: TIER_COLORS, SELL_LUCK: SELL_LUCK, LUCK_CAP: LUCK_CAP, EGG_KINDS: EGG_KINDS,
                        EGG_COLORS: EGG_COLORS, EGG_PATTERNS: EGG_PATTERNS, tierOf: tierOf, odds: odds, rollBlend: rollBlend, rollEgg: rollEgg,
                        kindById: kindById, isKind: isKind, sellLuck: sellLuck, addLuck: addLuck };
})(window);
