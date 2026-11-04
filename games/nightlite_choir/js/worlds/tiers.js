/* Author: Claude. Design date: 2026-11-02.
   Blend tiers for Nightlite Choir+: 1 grey, 2 green, 3 blue, 4 purple, 5 gold, 6 red.
   Counts across all 42 blends: 12 / 10 / 8 / 6 / 4 / 2. Higher tier means more ingredients or more blends as ingredients.
   Loaded before js/recipes.js. Strict ES5. Data only. */
(function (w) {
    w.NightliteTiers = {
        /* tier 1 (grey): two friends */
        mossweave: 1, halohum: 1, dewglint: 1, trotleaf: 1, tockmoon: 1, twirlwisp: 1,
        lilybop: 1, tintrot: 1, streakle: 1, glowfluff: 1, hushbush: 1, yarnkite: 1,
        /* tier 2 (green): three friends */
        nodlight: 2, tootlepip: 2, sprizzle: 2,
        pebblepuff: 2, fernibell: 2, thimblepop: 2, moondrizzle: 2, wobblenook: 2, lanternip: 2, buttonbeam: 2,
        /* tier 3 (blue): four friends, or a blend plus friends */
        warblestar: 3, patterpop: 3, glimmerjig: 3,
        tumbleglow: 3, marbleroll: 3, cuddlecog: 3, wispberry: 3, starstitch: 3,
        /* tier 4 (purple): several blends */
        cozynub: 4, bounceboom: 4,
        cloudhopper: 4, briarbop: 4, pipewhirl: 4, ticklebloom: 4,
        /* tier 5 (gold): five friends, mostly blends */
        jubilume: 5,
        dreamlantern: 5, carouselle: 5, meadowsong: 5,
        /* tier 6 (red): five blends */
        auroraloom: 6, lullaquilt: 6
    };
})(window);
