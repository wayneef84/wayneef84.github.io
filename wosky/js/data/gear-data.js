/**
 * WOSKY_3169 — Chief Gear Data Module
 * Strict ES5 — no const/let/arrow functions/fetch/template literals.
 *
 * Exposes: window.WOSKY_GEAR_DATA
 *
 * Position encoding: integer 0–106 = number of completed upgrade steps.
 *   0   = nothing upgraded yet
 *   1   = Green tier done
 *   26  = Gold T2-3 done (all lower tiers complete)
 *   106 = Red T4-2 fully complete (maximum / Red T4-3 state)
 *
 * calcRange(fromPos, toPos):
 *   Sums costs for steps at indices [fromPos … toPos-1].
 *   i.e. from "currently at fromPos" to "target toPos".
 */

(function () {
    'use strict';

    /* ── Step data (106 entries, index 0-105) ─────────────────────────────
       Each entry: { ha, ps, dp, la, seg, gl, sl }
         ha  = Hardened Alloy
         ps  = Polishing Solution
         dp  = Design Plans
         la  = Lunar Amber
         seg = segment key (for grouping)
         gl  = optgroup label
         sl  = option label (within the optgroup)
    ────────────────────────────────────────────────────────────────────── */
    var S = [
        /* ── Lower tiers (1 step each, idx 0-25) ──────────────────────── */
        /* idx 0  pos→1  */ {ha:1500,  ps:15,  dp:0,   la:0, seg:'green',       gl:'Green Quality',   sl:'Green'},
        /* idx 1  pos→2  */ {ha:3800,  ps:40,  dp:0,   la:0, seg:'green-1',     gl:'Green Quality',   sl:'Green-1'},
        /* idx 2  pos→3  */ {ha:7000,  ps:70,  dp:0,   la:0, seg:'blue',        gl:'Blue Quality',    sl:'Blue'},
        /* idx 3  pos→4  */ {ha:9700,  ps:95,  dp:0,   la:0, seg:'blue-1',      gl:'Blue Quality',    sl:'Blue-1'},
        /* idx 4  pos→5  */ {ha:0,     ps:0,   dp:45,  la:0, seg:'blue-2',      gl:'Blue Quality',    sl:'Blue-2'},
        /* idx 5  pos→6  */ {ha:0,     ps:0,   dp:50,  la:0, seg:'blue-3',      gl:'Blue Quality',    sl:'Blue-3'},
        /* idx 6  pos→7  */ {ha:0,     ps:0,   dp:60,  la:0, seg:'purple',      gl:'Purple Quality',  sl:'Purple'},
        /* idx 7  pos→8  */ {ha:0,     ps:0,   dp:70,  la:0, seg:'purple-1',    gl:'Purple Quality',  sl:'Purple-1'},
        /* idx 8  pos→9  */ {ha:6500,  ps:65,  dp:40,  la:0, seg:'purple-2',    gl:'Purple Quality',  sl:'Purple-2'},
        /* idx 9  pos→10 */ {ha:8000,  ps:80,  dp:50,  la:0, seg:'purple-3',    gl:'Purple Quality',  sl:'Purple-3'},
        /* idx 10 pos→11 */ {ha:10000, ps:95,  dp:60,  la:0, seg:'purple-T1',   gl:'Purple Quality',  sl:'Purple T1'},
        /* idx 11 pos→12 */ {ha:11000, ps:110, dp:70,  la:0, seg:'purple-T1-1', gl:'Purple Quality',  sl:'Purple T1-1'},
        /* idx 12 pos→13 */ {ha:13000, ps:130, dp:85,  la:0, seg:'purple-T1-2', gl:'Purple Quality',  sl:'Purple T1-2'},
        /* idx 13 pos→14 */ {ha:15000, ps:160, dp:100, la:0, seg:'purple-T1-3', gl:'Purple Quality',  sl:'Purple T1-3'},
        /* idx 14 pos→15 */ {ha:22000, ps:220, dp:40,  la:0, seg:'gold',        gl:'Gold Quality',    sl:'Gold'},
        /* idx 15 pos→16 */ {ha:23000, ps:230, dp:40,  la:0, seg:'gold-1',      gl:'Gold Quality',    sl:'Gold-1'},
        /* idx 16 pos→17 */ {ha:25000, ps:250, dp:45,  la:0, seg:'gold-2',      gl:'Gold Quality',    sl:'Gold-2'},
        /* idx 17 pos→18 */ {ha:26000, ps:260, dp:45,  la:0, seg:'gold-3',      gl:'Gold Quality',    sl:'Gold-3'},
        /* idx 18 pos→19 */ {ha:28000, ps:280, dp:45,  la:0, seg:'gold-T1',     gl:'Gold Quality',    sl:'Gold T1'},
        /* idx 19 pos→20 */ {ha:28000, ps:280, dp:55,  la:0, seg:'gold-T1-1',   gl:'Gold Quality',    sl:'Gold T1-1'},
        /* idx 20 pos→21 */ {ha:32000, ps:320, dp:55,  la:0, seg:'gold-T1-2',   gl:'Gold Quality',    sl:'Gold T1-2'},
        /* idx 21 pos→22 */ {ha:35000, ps:340, dp:55,  la:0, seg:'gold-T1-3',   gl:'Gold Quality',    sl:'Gold T1-3'},
        /* idx 22 pos→23 */ {ha:38000, ps:360, dp:55,  la:0, seg:'gold-T2',     gl:'Gold Quality',    sl:'Gold T2'},
        /* idx 23 pos→24 */ {ha:43000, ps:430, dp:75,  la:0, seg:'gold-T2-1',   gl:'Gold Quality',    sl:'Gold T2-1'},
        /* idx 24 pos→25 */ {ha:45000, ps:460, dp:80,  la:0, seg:'gold-T2-2',   gl:'Gold Quality',    sl:'Gold T2-2'},
        /* idx 25 pos→26 */ {ha:48000, ps:500, dp:85,  la:0, seg:'gold-T2-3',   gl:'Gold Quality',    sl:'Gold T2-3'},

        /* ── Red quality — multi-step segments ────────────────────────── */
        /* Red-0 (4 steps, idx 26-29) */
        /* idx 26 pos→27 */ {ha:12500, ps:132, dp:21, la:2, seg:'red-0', gl:'Red-0 (4 steps)',   sl:'Step 1/4'},
        /* idx 27 pos→28 */ {ha:12500, ps:132, dp:21, la:2, seg:'red-0', gl:'Red-0 (4 steps)',   sl:'Step 2/4'},
        /* idx 28 pos→29 */ {ha:12500, ps:132, dp:21, la:2, seg:'red-0', gl:'Red-0 (4 steps)',   sl:'Step 3/4'},
        /* idx 29 pos→30 */ {ha:12500, ps:134, dp:22, la:4, seg:'red-0', gl:'Red-0 (4 steps)',   sl:'Step 4/4'},
        /* Red-1 (4 steps, idx 30-33) */
        /* idx 30 pos→31 */ {ha:13000, ps:140, dp:22, la:2, seg:'red-1', gl:'Red-1 (4 steps)',   sl:'Step 1/4'},
        /* idx 31 pos→32 */ {ha:13000, ps:140, dp:22, la:2, seg:'red-1', gl:'Red-1 (4 steps)',   sl:'Step 2/4'},
        /* idx 32 pos→33 */ {ha:13000, ps:140, dp:22, la:2, seg:'red-1', gl:'Red-1 (4 steps)',   sl:'Step 3/4'},
        /* idx 33 pos→34 */ {ha:13000, ps:140, dp:24, la:4, seg:'red-1', gl:'Red-1 (4 steps)',   sl:'Step 4/4'},
        /* Red-2 (4 steps, idx 34-37) */
        /* idx 34 pos→35 */ {ha:13500, ps:147, dp:23, la:2, seg:'red-2', gl:'Red-2 (4 steps)',   sl:'Step 1/4'},
        /* idx 35 pos→36 */ {ha:13500, ps:147, dp:23, la:2, seg:'red-2', gl:'Red-2 (4 steps)',   sl:'Step 2/4'},
        /* idx 36 pos→37 */ {ha:13500, ps:147, dp:23, la:2, seg:'red-2', gl:'Red-2 (4 steps)',   sl:'Step 3/4'},
        /* idx 37 pos→38 */ {ha:13500, ps:149, dp:26, la:4, seg:'red-2', gl:'Red-2 (4 steps)',   sl:'Step 4/4'},
        /* Red-3 (4 steps, idx 38-41) */
        /* idx 38 pos→39 */ {ha:14000, ps:155, dp:25, la:2, seg:'red-3', gl:'Red-3 (4 steps)',   sl:'Step 1/4'},
        /* idx 39 pos→40 */ {ha:14000, ps:155, dp:25, la:2, seg:'red-3', gl:'Red-3 (4 steps)',   sl:'Step 2/4'},
        /* idx 40 pos→41 */ {ha:14000, ps:155, dp:25, la:2, seg:'red-3', gl:'Red-3 (4 steps)',   sl:'Step 3/4'},
        /* idx 41 pos→42 */ {ha:14000, ps:155, dp:25, la:4, seg:'red-3', gl:'Red-3 (4 steps)',   sl:'Step 4/4'},
        /* Red T1 (4 steps, idx 42-45) */
        /* idx 42 pos→43 */ {ha:14750, ps:167, dp:27, la:3, seg:'red-T1',   gl:'Red T1 (4 steps)',   sl:'Step 1/4'},
        /* idx 43 pos→44 */ {ha:14750, ps:167, dp:27, la:3, seg:'red-T1',   gl:'Red T1 (4 steps)',   sl:'Step 2/4'},
        /* idx 44 pos→45 */ {ha:14750, ps:167, dp:27, la:3, seg:'red-T1',   gl:'Red T1 (4 steps)',   sl:'Step 3/4'},
        /* idx 45 pos→46 */ {ha:14750, ps:169, dp:29, la:6, seg:'red-T1',   gl:'Red T1 (4 steps)',   sl:'Step 4/4'},
        /* Red T1-1 (4 steps, idx 46-49) */
        /* idx 46 pos→47 */ {ha:15250, ps:175, dp:28, la:3, seg:'red-T1-1', gl:'Red T1-1 (4 steps)', sl:'Step 1/4'},
        /* idx 47 pos→48 */ {ha:15250, ps:175, dp:28, la:3, seg:'red-T1-1', gl:'Red T1-1 (4 steps)', sl:'Step 2/4'},
        /* idx 48 pos→49 */ {ha:15250, ps:175, dp:28, la:3, seg:'red-T1-1', gl:'Red T1-1 (4 steps)', sl:'Step 3/4'},
        /* idx 49 pos→50 */ {ha:15250, ps:175, dp:31, la:6, seg:'red-T1-1', gl:'Red T1-1 (4 steps)', sl:'Step 4/4'},
        /* Red T1-2 (4 steps, idx 50-53) */
        /* idx 50 pos→51 */ {ha:15750, ps:182, dp:30, la:3, seg:'red-T1-2', gl:'Red T1-2 (4 steps)', sl:'Step 1/4'},
        /* idx 51 pos→52 */ {ha:15750, ps:182, dp:30, la:3, seg:'red-T1-2', gl:'Red T1-2 (4 steps)', sl:'Step 2/4'},
        /* idx 52 pos→53 */ {ha:15750, ps:182, dp:30, la:3, seg:'red-T1-2', gl:'Red T1-2 (4 steps)', sl:'Step 3/4'},
        /* idx 53 pos→54 */ {ha:15750, ps:184, dp:30, la:6, seg:'red-T1-2', gl:'Red T1-2 (4 steps)', sl:'Step 4/4'},
        /* Red T1-3 (4 steps, idx 54-57) */
        /* idx 54 pos→55 */ {ha:16250, ps:190, dp:31, la:3, seg:'red-T1-3', gl:'Red T1-3 (4 steps)', sl:'Step 1/4'},
        /* idx 55 pos→56 */ {ha:16250, ps:190, dp:31, la:3, seg:'red-T1-3', gl:'Red T1-3 (4 steps)', sl:'Step 2/4'},
        /* idx 56 pos→57 */ {ha:16250, ps:190, dp:31, la:3, seg:'red-T1-3', gl:'Red T1-3 (4 steps)', sl:'Step 3/4'},
        /* idx 57 pos→58 */ {ha:16250, ps:190, dp:32, la:6, seg:'red-T1-3', gl:'Red T1-3 (4 steps)', sl:'Step 4/4'},
        /* Red T2 (4 steps, idx 58-61) */
        /* idx 58 pos→59 */ {ha:17000, ps:202, dp:33, la:5, seg:'red-T2',   gl:'Red T2 (4 steps)',   sl:'Step 1/4'},
        /* idx 59 pos→60 */ {ha:17000, ps:202, dp:33, la:5, seg:'red-T2',   gl:'Red T2 (4 steps)',   sl:'Step 2/4'},
        /* idx 60 pos→61 */ {ha:17000, ps:202, dp:33, la:5, seg:'red-T2',   gl:'Red T2 (4 steps)',   sl:'Step 3/4'},
        /* idx 61 pos→62 */ {ha:17000, ps:204, dp:36, la:5, seg:'red-T2',   gl:'Red T2 (4 steps)',   sl:'Step 4/4'},
        /* Red T2-1 (4 steps, idx 62-65) */
        /* idx 62 pos→63 */ {ha:17500, ps:210, dp:35, la:5, seg:'red-T2-1', gl:'Red T2-1 (4 steps)', sl:'Step 1/4'},
        /* idx 63 pos→64 */ {ha:17500, ps:210, dp:35, la:5, seg:'red-T2-1', gl:'Red T2-1 (4 steps)', sl:'Step 2/4'},
        /* idx 64 pos→65 */ {ha:17500, ps:210, dp:35, la:5, seg:'red-T2-1', gl:'Red T2-1 (4 steps)', sl:'Step 3/4'},
        /* idx 65 pos→66 */ {ha:17500, ps:210, dp:35, la:5, seg:'red-T2-1', gl:'Red T2-1 (4 steps)', sl:'Step 4/4'},
        /* Red T2-2 (4 steps, idx 66-69) */
        /* idx 66 pos→67 */ {ha:18000, ps:217, dp:36, la:5, seg:'red-T2-2', gl:'Red T2-2 (4 steps)', sl:'Step 1/4'},
        /* idx 67 pos→68 */ {ha:18000, ps:217, dp:36, la:5, seg:'red-T2-2', gl:'Red T2-2 (4 steps)', sl:'Step 2/4'},
        /* idx 68 pos→69 */ {ha:18000, ps:217, dp:36, la:5, seg:'red-T2-2', gl:'Red T2-2 (4 steps)', sl:'Step 3/4'},
        /* idx 69 pos→70 */ {ha:18000, ps:219, dp:37, la:5, seg:'red-T2-2', gl:'Red T2-2 (4 steps)', sl:'Step 4/4'},
        /* Red T2-3 (4 steps, idx 70-73) */
        /* idx 70 pos→71 */ {ha:18500, ps:225, dp:37, la:5, seg:'red-T2-3', gl:'Red T2-3 (4 steps)', sl:'Step 1/4'},
        /* idx 71 pos→72 */ {ha:18500, ps:225, dp:37, la:5, seg:'red-T2-3', gl:'Red T2-3 (4 steps)', sl:'Step 2/4'},
        /* idx 72 pos→73 */ {ha:18500, ps:225, dp:37, la:5, seg:'red-T2-3', gl:'Red T2-3 (4 steps)', sl:'Step 3/4'},
        /* idx 73 pos→74 */ {ha:18500, ps:225, dp:39, la:5, seg:'red-T2-3', gl:'Red T2-3 (4 steps)', sl:'Step 4/4'},
        /* Red T3 (4 steps, idx 74-77) */
        /* idx 74 pos→75 */ {ha:19250, ps:237, dp:40, la:6, seg:'red-T3',   gl:'Red T3 (4 steps)',   sl:'Step 1/4'},
        /* idx 75 pos→76 */ {ha:19250, ps:237, dp:40, la:6, seg:'red-T3',   gl:'Red T3 (4 steps)',   sl:'Step 2/4'},
        /* idx 76 pos→77 */ {ha:19250, ps:237, dp:40, la:6, seg:'red-T3',   gl:'Red T3 (4 steps)',   sl:'Step 3/4'},
        /* idx 77 pos→78 */ {ha:19250, ps:239, dp:40, la:7, seg:'red-T3',   gl:'Red T3 (4 steps)',   sl:'Step 4/4'},
        /* Red T3-1 (4 steps, idx 78-81) */
        /* idx 78 pos→79 */ {ha:20000, ps:247, dp:41, la:6, seg:'red-T3-1', gl:'Red T3-1 (4 steps)', sl:'Step 1/4'},
        /* idx 79 pos→80 */ {ha:20000, ps:247, dp:41, la:6, seg:'red-T3-1', gl:'Red T3-1 (4 steps)', sl:'Step 2/4'},
        /* idx 80 pos→81 */ {ha:20000, ps:247, dp:41, la:6, seg:'red-T3-1', gl:'Red T3-1 (4 steps)', sl:'Step 3/4'},
        /* idx 81 pos→82 */ {ha:20000, ps:249, dp:42, la:7, seg:'red-T3-1', gl:'Red T3-1 (4 steps)', sl:'Step 4/4'},
        /* Red T3-2 (4 steps, idx 82-85) */
        /* idx 82 pos→83 */ {ha:20750, ps:257, dp:42, la:6, seg:'red-T3-2', gl:'Red T3-2 (4 steps)', sl:'Step 1/4'},
        /* idx 83 pos→84 */ {ha:20750, ps:257, dp:42, la:6, seg:'red-T3-2', gl:'Red T3-2 (4 steps)', sl:'Step 2/4'},
        /* idx 84 pos→85 */ {ha:20750, ps:257, dp:42, la:6, seg:'red-T3-2', gl:'Red T3-2 (4 steps)', sl:'Step 3/4'},
        /* idx 85 pos→86 */ {ha:20750, ps:259, dp:44, la:7, seg:'red-T3-2', gl:'Red T3-2 (4 steps)', sl:'Step 4/4'},
        /* Red T3-3 (5 steps, idx 86-90) — 5th step transitions to T4 */
        /* idx 86 pos→87 */ {ha:24000, ps:300, dp:50, la:8, seg:'red-T3-3', gl:'Red T3-3 (5 steps)', sl:'Step 1/5'},
        /* idx 87 pos→88 */ {ha:24000, ps:300, dp:50, la:8, seg:'red-T3-3', gl:'Red T3-3 (5 steps)', sl:'Step 2/5'},
        /* idx 88 pos→89 */ {ha:24000, ps:300, dp:50, la:8, seg:'red-T3-3', gl:'Red T3-3 (5 steps)', sl:'Step 3/5'},
        /* idx 89 pos→90 */ {ha:24000, ps:300, dp:50, la:8, seg:'red-T3-3', gl:'Red T3-3 (5 steps)', sl:'Step 4/5'},
        /* idx 90 pos→91 */ {ha:24000, ps:300, dp:50, la:8, seg:'red-T3-3', gl:'Red T3-3 (5 steps)', sl:'Step 5/5'},
        /* Red T4 (5 steps, idx 91-95) — 5th step transitions to T4-1 */
        /* idx 91 pos→92 */ {ha:28000, ps:330, dp:55, la:8, seg:'red-T4',   gl:'Red T4 (5 steps)',   sl:'Step 1/5'},
        /* idx 92 pos→93 */ {ha:28000, ps:330, dp:55, la:8, seg:'red-T4',   gl:'Red T4 (5 steps)',   sl:'Step 2/5'},
        /* idx 93 pos→94 */ {ha:28000, ps:330, dp:55, la:8, seg:'red-T4',   gl:'Red T4 (5 steps)',   sl:'Step 3/5'},
        /* idx 94 pos→95 */ {ha:28000, ps:330, dp:55, la:8, seg:'red-T4',   gl:'Red T4 (5 steps)',   sl:'Step 4/5'},
        /* idx 95 pos→96 */ {ha:28000, ps:330, dp:55, la:8, seg:'red-T4',   gl:'Red T4 (5 steps)',   sl:'Step 5/5'},
        /* Red T4-1 (5 steps, idx 96-100) — 5th step transitions to T4-2 */
        /* idx 96  pos→97  */ {ha:32000, ps:360, dp:60, la:8, seg:'red-T4-1', gl:'Red T4-1 (5 steps)', sl:'Step 1/5'},
        /* idx 97  pos→98  */ {ha:32000, ps:360, dp:60, la:8, seg:'red-T4-1', gl:'Red T4-1 (5 steps)', sl:'Step 2/5'},
        /* idx 98  pos→99  */ {ha:32000, ps:360, dp:60, la:8, seg:'red-T4-1', gl:'Red T4-1 (5 steps)', sl:'Step 3/5'},
        /* idx 99  pos→100 */ {ha:32000, ps:360, dp:60, la:8, seg:'red-T4-1', gl:'Red T4-1 (5 steps)', sl:'Step 4/5'},
        /* idx 100 pos→101 */ {ha:32000, ps:360, dp:60, la:8, seg:'red-T4-1', gl:'Red T4-1 (5 steps)', sl:'Step 5/5'},
        /* Red T4-2 (5 steps, idx 101-105) — pos 106 = Red T4-3 MAX */
        /* idx 101 pos→102 */ {ha:36000, ps:390, dp:65, la:8, seg:'red-T4-2', gl:'Red T4-2 (5 steps)', sl:'Step 1/5'},
        /* idx 102 pos→103 */ {ha:36000, ps:390, dp:65, la:8, seg:'red-T4-2', gl:'Red T4-2 (5 steps)', sl:'Step 2/5'},
        /* idx 103 pos→104 */ {ha:36000, ps:390, dp:65, la:8, seg:'red-T4-2', gl:'Red T4-2 (5 steps)', sl:'Step 3/5'},
        /* idx 104 pos→105 */ {ha:36000, ps:390, dp:65, la:8, seg:'red-T4-2', gl:'Red T4-2 (5 steps)', sl:'Step 4/5'},
        /* idx 105 pos→106 */ {ha:36000, ps:390, dp:65, la:8, seg:'red-T4-2', gl:'Red T4-2 (5 steps)', sl:'Step 5/5 \u2014 MAX (Red T4-3)'}
    ];

    /* ── Optgroup boundaries [from, to) — step indices ────────────────── */
    var GROUPS = [
        {label: 'Green Quality',    from: 0,   to: 2},
        {label: 'Blue Quality',     from: 2,   to: 6},
        {label: 'Purple Quality',   from: 6,   to: 14},
        {label: 'Gold Quality',     from: 14,  to: 26},
        {label: 'Red-0 (4 steps)',  from: 26,  to: 30},
        {label: 'Red-1 (4 steps)',  from: 30,  to: 34},
        {label: 'Red-2 (4 steps)',  from: 34,  to: 38},
        {label: 'Red-3 (4 steps)',  from: 38,  to: 42},
        {label: 'Red T1 (4 steps)', from: 42,  to: 46},
        {label: 'Red T1-1 (4 steps)', from: 46, to: 50},
        {label: 'Red T1-2 (4 steps)', from: 50, to: 54},
        {label: 'Red T1-3 (4 steps)', from: 54, to: 58},
        {label: 'Red T2 (4 steps)', from: 58,  to: 62},
        {label: 'Red T2-1 (4 steps)', from: 62, to: 66},
        {label: 'Red T2-2 (4 steps)', from: 66, to: 70},
        {label: 'Red T2-3 (4 steps)', from: 70, to: 74},
        {label: 'Red T3 (4 steps)', from: 74,  to: 78},
        {label: 'Red T3-1 (4 steps)', from: 78, to: 82},
        {label: 'Red T3-2 (4 steps)', from: 82, to: 86},
        {label: 'Red T3-3 (5 steps)', from: 86, to: 91},
        {label: 'Red T4 (5 steps)',   from: 91, to: 96},
        {label: 'Red T4-1 (5 steps)', from: 96, to: 101},
        {label: 'Red T4-2 (5 steps)', from: 101, to: 106}
    ];

    /* ── Public API ──────────────────────────────────────────────────────── */
    window.WOSKY_GEAR_DATA = {

        steps: S,
        groups: GROUPS,
        MAX_POS: 106,

        /* Sum costs from step index [fromPos] to [toPos-1] inclusive.
           fromPos = current completed count, toPos = target completed count. */
        calcRange: function (fromPos, toPos) {
            var r = {ha: 0, ps: 0, dp: 0, la: 0};
            if (toPos <= fromPos) return r;
            for (var i = fromPos; i < toPos; i++) {
                r.ha += S[i].ha;
                r.ps += S[i].ps;
                r.dp += S[i].dp;
                r.la += S[i].la;
            }
            return r;
        },

        /* Build <option> elements for a <select>.
           Inserts a "Start" option (value 0) then one <optgroup> per group. */
        buildOptions: function (selectEl) {
            var html = '<option value="0">\u2014 Start (nothing upgraded) \u2014</option>';
            for (var g = 0; g < GROUPS.length; g++) {
                var grp = GROUPS[g];
                html += '<optgroup label="' + grp.label + '">';
                for (var i = grp.from; i < grp.to; i++) {
                    var pos = i + 1; /* position = step index + 1 */
                    html += '<option value="' + pos + '">' + S[i].sl + '</option>';
                }
                html += '</optgroup>';
            }
            selectEl.innerHTML = html;
        }
    };

})();
