/**
 * Nightlite Choir+ - stage layout data (strict ES5, no DOM, tested by tests/nightlite.test.js).
 * Each world has its own stage: Garden 8 friends, Attic 9, Observatory 10.
 * spots(worldId) gives { x, y, s } per spot in percent of the scene box (x 0..100 left to right, y 0..100 top to bottom).
 * (x, y) is the CENTER of the friend. s is the depth scale 0.7..1.0: back rows are higher and smaller.
 * A friend is SIZE_PCT * s percent of the scene width wide (square). The scene box is ASPECT wide per 1 high (5:4),
 * so 1% of height is 0.8% of width when you compare distances.
 * Spot order is also the order the star map joins the friends in, and the order tap-to-add fills them.
 */
(function (w) {
    var SIZE_PCT = 25;
    var ASPECT = 1.25;

    function r1(n) { return Math.round(n * 10) / 10; }
    function row(y, s, xs) {
        var out = [], i;
        for (i = 0; i < xs.length; i++) out.push({ x: xs[i], y: y, s: s });
        return out;
    }
    // Garden: three staggered rows on a gentle hill (3 at the back, 2 in the middle, 3 at the front)
    var GARDEN = [].concat(row(27, 0.72, [18, 50, 82]), row(53, 0.86, [34, 66]), row(80, 1, [16, 50, 84]));
    // Attic: three shelf levels with three toys each, the lower the shelf the nearer and bigger
    var ATTIC = [].concat(row(24, 0.72, [22, 50, 78]), row(52, 0.86, [14, 50, 86]), row(80, 1, [22, 50, 78]));
    // Observatory: ten friends in three bent rows (3, 4, 3) like a constellation, high ones small, low ones big
    var OBS = [{ x: 22, y: 28, s: 0.72 }, { x: 50, y: 20, s: 0.7 }, { x: 78, y: 28, s: 0.72 },
               { x: 12, y: 57, s: 0.86 }, { x: 37, y: 51, s: 0.84 }, { x: 63, y: 51, s: 0.84 }, { x: 88, y: 57, s: 0.86 },
               { x: 22, y: 84, s: 1 }, { x: 50, y: 78, s: 0.97 }, { x: 78, y: 84, s: 1 }];
    var DATA = { garden: GARDEN, attic: ATTIC, observatory: OBS };

    function has(id) { return typeof id === 'string' && Object.prototype.hasOwnProperty.call(DATA, id); }
    function cap(id) { return has(id) ? DATA[id].length : GARDEN.length; }
    function spots(id) {
        var src = has(id) ? DATA[id] : GARDEN, out = [], i;
        for (i = 0; i < src.length; i++) out.push({ x: src[i].x, y: src[i].y, s: src[i].s });
        return out;
    }
    // Attic shelf planks: y percent of the feet of each shelf level (decoration only)
    function shelves(id) {
        var out = [], list, i, ys = [];
        if (id !== 'attic') return out;
        list = DATA.attic;
        for (i = 0; i < list.length; i++) {
            var y = r1(list[i].y + (SIZE_PCT * list[i].s / 2) / ASPECT * 0.92);
            if (ys.indexOf(y) < 0) { ys.push(y); out.push(y); }
        }
        return out;
    }
    function isWorld(id) { return has(id); }

    w.NightliteLayout = { cap: cap, spots: spots, shelves: shelves, isWorld: isWorld, SIZE_PCT: SIZE_PCT, ASPECT: ASPECT };
    if (typeof module !== 'undefined' && module.exports) module.exports = w.NightliteLayout;
})(typeof window !== 'undefined' ? window : this);
