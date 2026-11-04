/* Author: Claude. Design date: 2026-11-02.
   Merged into the blend tables by js/recipes.js (any window global starting with NightliteBlendsExtra_ is picked up).
   Nightlite Choir+ extra blends, set MORE.
   21 new choirers: 7 three-ingredient, 5 mixed, 4 with several blends, 3 big blends, 2 grand blends.
   Tiers live in js/worlds/tiers.js (not here). Ingredients are base ids or blend ids (existing or in this file), no cycles.
   Every note is C major pentatonic (C D E G A). Strict ES5. Data only, no network. */
(function (w) {
    var N = null;
    w.NightliteBlendsExtra_MORE = {
        chars: [
            /* ---- tier 2: three friends ---- */
            { id: 'pebblepuff', name: 'Pebblepuff', role: 'pebble tick', blend: ['puddlet', 'hedgey', 'clopsy'],
              look: 'Round grey-blue pebble body with a leaf, a sprout and a cheerful grin.',
              clue: 'Pitter-patter on a leafy path.',
              art: { body: 'round', color: '#b8c4d4', eyes: 'dots', mouth: 'grin', acc: 'leaf', accColor: '#8fd09a', acc2: 'sprout', acc2Color: '#6fbf7a', cheeks: true },
              synth: { kind: 'drum', voice: 'tick', pitch: 1, amp: 0.5, pattern: 'x.x...x.x.x...x.' } },
            { id: 'fernibell', name: 'Fernibell', role: 'fern bell', blend: ['hedgey', 'glintwand', 'glimmow'],
              look: 'Leafy green bush with a glowing antenna and tiny star sparkles.',
              clue: 'A leafy bush hung with starlight.',
              art: { body: 'bush', color: '#9ad7a8', eyes: 'twinkle', mouth: 'smile', acc: 'antenna', accColor: '#fff6c4', acc2: 'sparkles', acc2Color: '#fff3b0', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.5, decays: true, a: 0.003, d: 0.9, amp: 0.4,
                       seq: [84, N, N, 88, N, N, 91, N, N, 88, N, N, 84, N, N, N] } },
            { id: 'thimblepop', name: 'Thimblepop', role: 'sewing clap', blend: ['skeinie', 'tocklet', 'ringhum'],
              look: 'Tin-blue box body with a pink ring band, a doll bow and button eyes.',
              clue: 'Stitch, tick and hum in the sewing basket.',
              art: { body: 'square', color: '#9fbfd8', eyes: 'button', mouth: 'o', acc: 'ringband', accColor: '#ffb7dc', acc2: 'bow', acc2Color: '#e59ab4' },
              synth: { kind: 'drum', voice: 'clap', pitch: 1, amp: 0.5, pattern: '....x.......x..x' } },
            { id: 'moondrizzle', name: 'Moondrizzle', role: 'slow drip', blend: ['dozemoon', 'puddlet', 'tocklet'],
              look: 'Pale blue drop with a nightcap and a little wind-up key.',
              clue: 'A sleepy moon and a ticking toy by the puddle.',
              art: { body: 'drop', color: '#cfe0f4', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#9bd0ff', acc2: 'windkey', acc2Color: '#e8b25a', cheeks: true },
              synth: { kind: 'drum', voice: 'drip', pitch: 1, amp: 0.55, pattern: 'x....x...x...x..' } },
            { id: 'wobblenook', name: 'Wobblenook', role: 'soft tom roll', blend: ['mossle', 'tocklet', 'ringhum'],
              look: 'Wide green-tan body with a wind-up key and a pink ring.',
              clue: 'A mossy hum, a ticking toy and a humming drum.',
              art: { body: 'wide', color: '#bcd4a0', eyes: 'big', mouth: 'hum', acc: 'windkey', accColor: '#e8b25a', acc2: 'ringband', acc2Color: '#ffb7dc', cheeks: true },
              synth: { kind: 'drum', voice: 'tom', pitch: 0.9, amp: 0.6, pattern: 'x..x..x...x.x...' } },
            { id: 'lanternip', name: 'Lanternip', role: 'lullaby sweep', blend: ['glimmow', 'dozemoon', 'twirltail'],
              look: 'Violet comet body with a warm glow antenna and a sleepy nightcap.',
              clue: 'A glowing sleepy comet drifts by.',
              art: { body: 'comet', color: '#d4b8ff', eyes: 'sleepy', mouth: 'smile', acc: 'antenna', accColor: '#ffe98a', acc2: 'nightcap', acc2Color: '#9bd0ff' },
              synth: { kind: 'drum', voice: 'whoosh', pitch: 1, amp: 0.4, pattern: 'x...............' } },
            { id: 'buttonbeam', name: 'Buttonbeam', role: 'music box', blend: ['mallowhorn', 'glintwand', 'mossle'],
              look: 'Cream plush body with a gold horn, button eyes and a little moss sprout.',
              clue: 'A fluffy horn, a star wand and a mossy friend.',
              art: { body: 'plush', color: '#f7ead2', eyes: 'button', mouth: 'smile', acc: 'horn', accColor: '#f0cf86', acc2: 'sprout', acc2Color: '#8fd09a', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.3, decays: true, a: 0.005, d: 0.6, amp: 0.45,
                       seq: [76, 79, 81, 79, N, N, 76, N, 72, N, 76, 79, N, 81, N, N] } },

            /* ---- tier 3: four friends, or a blend plus friends ---- */
            { id: 'tumbleglow', name: 'Tumbleglow', role: 'lazy hat', blend: ['hedgey', 'glimmow', 'clopsy', 'dozemoon'],
              look: 'Round yellow-green body that looks half asleep, with a nightcap and a firefly.',
              clue: 'Four drowsy friends tumble about in the dark.',
              art: { body: 'round', color: '#e4eca0', eyes: 'sleepy', mouth: 'grin', acc: 'nightcap', accColor: '#ffd36b', acc2: 'firefly', acc2Color: '#fff6c4', cheeks: true },
              synth: { kind: 'drum', voice: 'hat', pitch: 1, amp: 0.4, pattern: '..x...x...x...xx' } },
            { id: 'marbleroll', name: 'Marbleroll', role: 'marble pluck', blend: ['puddlet', 'skeinie', 'twirltail', 'mossle'],
              look: 'Glassy blue drop with swirly pink streaks and yarn braids.',
              clue: 'Drip, yarn, swirl and moss roll along together.',
              art: { body: 'drop', color: '#a8c8f4', eyes: 'happy', mouth: 'open', acc: 'braids', accColor: '#ffb7a0', acc2: 'swirl', acc2Color: '#ff9fcf', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', decays: true, a: 0.004, d: 0.22, lp: 2200, amp: 0.5,
                       seq: [67, N, 69, 72, N, 69, N, 67, 64, N, 67, N, 69, N, N, N] } },
            { id: 'cuddlecog', name: 'Cuddlecog', role: 'heartbeat tick', blend: ['glowfluff', 'tocklet', 'mossle'],
              look: 'Soft yellow plush body with a wind-up key and a little moss sprout.',
              clue: 'A cuddly glow, a ticking toy and a mossy hum.',
              art: { body: 'plush', color: '#fff0b8', eyes: 'happy', mouth: 'smile', acc: 'windkey', accColor: '#e8b25a', acc2: 'sprout', acc2Color: '#8fd09a', cheeks: true },
              synth: { kind: 'drum', voice: 'click', pitch: 0.8, amp: 0.45, pattern: 'x..x....x..x....' } },
            { id: 'wispberry', name: 'Wispberry', role: 'berry voice', blend: ['yarnkite', 'hushbush', 'glimmow'],
              look: 'Blue-green ghostly body with sky-blue braids, a swirl and a firefly.',
              clue: 'A kite, a bush and a glow whisper a tune.',
              art: { body: 'ghost', color: '#bfe6f0', eyes: 'big', mouth: 'o', acc: 'braids', accColor: '#8fd0e8', acc2: 'firefly', acc2Color: '#ffe98a', cheeks: true },
              synth: { kind: 'voice', amp: 0.55,
                       seq: [[72, 'u', 2], N, [76, 'u', 2], N, [79, 'u', 3], N, N, N, [76, 'u', 2], N, [74, 'u', 2], N, [72, 'u', 3], N, N, N] } },
            { id: 'starstitch', name: 'Starstitch', role: 'stitch arpeggio', blend: ['streakle', 'skeinie', 'ringhum'],
              look: 'Lilac star with stitched patches, a ring band and yarn braids.',
              clue: 'A comet streak, a yarn doll and a humming ring.',
              art: { body: 'star', color: '#d8c4f4', eyes: 'button', mouth: 'smile', acc: 'ringband', accColor: '#a8c4ff', acc2: 'braids', acc2Color: '#e8b25a', cheeks: true, patch: '#ffb7dc' },
              synth: { kind: 'tone', wave: 'saw', decays: true, a: 0.004, d: 0.18, lp: 2000, amp: 0.35,
                       seq: [72, 76, 79, 76, 72, 76, 79, N, 74, 79, 81, 79, 74, 79, 81, N] } },

            /* ---- tier 4: several blends ---- */
            { id: 'cloudhopper', name: 'Cloudhopper', role: 'sky pad', blend: ['tintrot', 'lilybop', 'hushbush', 'dozemoon'],
              look: 'Round pale-blue cloud body with a nightcap, a tiny pony mane and a pond flower.',
              clue: 'Hop from toy to pond to bush to moon.',
              art: { body: 'round', color: '#dcecf8', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#c9a8ff', acc2: 'flower', acc2Color: '#ffb7dc', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', harm: 0.1, a: 0.5, d: 1.1, lp: 1400, vib: 1, amp: 0.55, chord: [0, 7, 12],
                       seq: [[64, 8], N, N, N, N, N, N, N, [67, 8], N, N, N, N, N, N, N] } },
            { id: 'briarbop', name: 'Briarbop', role: 'skip bass', blend: ['trotleaf', 'nodlight', 'patterpop', 'mallowhorn'],
              look: 'Wide green body with a leafy mane and a bulb antenna, bouncing with a grin.',
              clue: 'Four bouncy friends skip down the garden path.',
              art: { body: 'wide', color: '#a8d890', eyes: 'happy', mouth: 'grin', acc: 'mane', accColor: '#6fbf7a', acc2: 'antenna', acc2Color: '#ffe98a', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', decays: true, a: 0.01, d: 0.3, lp: 900, amp: 0.7,
                       seq: [43, N, 48, N, 50, N, 48, N, 45, N, 48, N, 43, N, N, N] } },
            { id: 'pipewhirl', name: 'Pipewhirl', role: 'pipe lead', blend: ['warblestar', 'halohum', 'tootlepip', 'twirltail'],
              look: 'Pink star body with a gold horn and a swirling tail, mouth wide in song.',
              clue: 'Stars, halos and toy tunes twirl into one whistle.',
              art: { body: 'star', color: '#ffc8e8', eyes: 'twinkle', mouth: 'open', acc: 'horn', accColor: '#f0cf86', acc2: 'swirl', acc2Color: '#c9a8ff', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.1, a: 0.08, d: 0.5, vib: 1, amp: 0.4,
                       seq: [[84, 3], N, N, [88, 2], N, [91, 3], N, N, [93, 2], N, [91, 2], N, [88, 3], N, N, N] } },
            { id: 'ticklebloom', name: 'Ticklebloom', role: 'bloom bells', blend: ['dewglint', 'glowfluff', 'tintrot', 'puddlet'],
              look: 'Light blue drop with a big pink flower and golden sparkles.',
              clue: 'Dew, glow, tin and drops bloom into tiny bells.',
              art: { body: 'drop', color: '#b8e0f8', eyes: 'happy', mouth: 'open', acc: 'flower', accColor: '#ffb7dc', acc2: 'sparkles', acc2Color: '#fff3b0', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.8, decays: true, a: 0.002, d: 0.5, amp: 0.45,
                       seq: [79, N, 84, N, 88, N, 84, 79, N, 81, N, 86, N, 84, N, N] } },

            /* ---- tier 5: big blends ---- */
            { id: 'dreamlantern', name: 'Dreamlantern', role: 'dream choir', blend: ['nodlight', 'cozynub', 'streakle', 'hushbush', 'glimmow'],
              look: 'Round lilac body with a nightcap, a glowing firefly and a swirl tail.',
              clue: 'Every sleepy, glowing thing sings one lullaby.',
              art: { body: 'round', color: '#e0d0f8', eyes: 'sleepy', mouth: 'hum', acc: 'nightcap', accColor: '#ffd36b', acc2: 'firefly', acc2Color: '#fff6c4', cheeks: true },
              synth: { kind: 'layers', amp: 0.65, layers: [
                  { kind: 'voice', amp: 0.6, seq: [[64, 'o', 4], N, N, N, [67, 'o', 4], N, N, N, [69, 'o', 4], N, N, N, [67, 'o', 4], N, N, N] },
                  { kind: 'tone', wave: 'tri', harm: 0.1, decays: true, a: 0.02, d: 0.5, amp: 0.4, seq: [72, N, 76, 79, N, 76, 72, N, 74, N, 79, 81, N, 79, 74, N] }
              ] } },
            { id: 'carouselle', name: 'Carouselle', role: 'carousel organ', blend: ['tootlepip', 'tintrot', 'bounceboom', 'yarnkite', 'mallowhorn'],
              look: 'Cream pony head with a gold mane, a tall top hat and a star on the cheek.',
              clue: 'The whole toy box spins round and round.',
              art: { body: 'pony', color: '#f8e4c8', eyes: 'happy', mouth: 'grin', acc: 'tophat', accColor: '#e59ab4', acc2: 'mane', acc2Color: '#e8b25a', cheeks: true, mark: 'star' },
              synth: { kind: 'layers', amp: 0.65, layers: [
                  { kind: 'tone', wave: 'square', decays: true, a: 0.003, d: 0.14, lp: 2200, amp: 0.35, seq: [72, 76, 79, 76, 81, 79, 76, 72, 74, 79, 81, 79, 86, 81, 79, 74] },
                  { kind: 'drum', voice: 'wood', pitch: 1, amp: 0.4, pattern: 'x...x...x...x.x.' }
              ] } },
            { id: 'meadowsong', name: 'Meadowsong', role: 'meadow strum', blend: ['sprizzle', 'lilybop', 'trotleaf', 'mossweave', 'hedgey'],
              look: 'Soft green body with a big flower, leaf mane and yarn patch.',
              clue: 'Rain, pond, hop and yarn all strum on the grass.',
              art: { body: 'round', color: '#b4e0a0', eyes: 'happy', mouth: 'smile', acc: 'flower', accColor: '#ffd36b', acc2: 'leaf', acc2Color: '#6fbf7a', cheeks: true, patch: '#e8a5b4' },
              synth: { kind: 'tone', wave: 'tri', decays: true, a: 0.005, d: 0.35, lp: 1800, amp: 0.5, chord: [0, 7],
                       seq: [60, N, 64, N, 67, N, 64, N, 69, N, 67, N, 64, N, 62, N] } },

            /* ---- tier 6: grand blends ---- */
            { id: 'auroraloom', name: 'Auroraloom', role: 'aurora choir', blend: ['jubilume', 'glimmerjig', 'cozynub', 'warblestar', 'dreamlantern'],
              look: 'Wide shimmering body with a golden sun, sparkles and soft colors.',
              clue: 'The brightest, cosiest songs weave one sky of color.',
              art: { body: 'wide', color: '#d8f0e8', eyes: 'twinkle', mouth: 'hum', acc: 'sun', accColor: '#ffd36b', acc2: 'sparkles', acc2Color: '#c9a8ff', cheeks: true },
              synth: { kind: 'layers', amp: 0.6, layers: [
                  { kind: 'tone', wave: 'sine', harm: 0.1, a: 0.8, d: 1.4, lp: 1500, vib: 1, amp: 0.5, chord: [0, 7, 12], seq: [[67, 8], N, N, N, N, N, N, N, [64, 8], N, N, N, N, N, N, N] },
                  { kind: 'voice', amp: 0.45, seq: [N, N, [84, 'a', 3], N, N, N, N, N, N, N, [88, 'a', 3], N, N, N, N, N] }
              ] } },
            { id: 'lullaquilt', name: 'Lullaquilt', role: 'lullaby heartbeat', blend: ['dreamlantern', 'carouselle', 'meadowsong', 'bounceboom', 'jubilume'],
              look: 'Patchwork round body with a nightcap, a pink scarf and stitched patches.',
              clue: 'Dream, carousel and meadow tuck the whole choir in.',
              art: { body: 'round', color: '#f4dcec', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#9bd0ff', acc2: 'scarf', acc2Color: '#ffb7dc', cheeks: true, patch: '#bfe6ff' },
              synth: { kind: 'layers', amp: 0.6, layers: [
                  { kind: 'tone', wave: 'tri', harm: 0.1, a: 0.3, d: 1, lp: 600, amp: 0.6, seq: [[48, 4], N, N, N, [55, 4], N, N, N, [52, 4], N, N, N, [48, 4], N, N, N] },
                  { kind: 'drum', voice: 'thrum', pitch: 0.8, amp: 0.35, pattern: 'x.....x.........' }
              ] } }
        ]
    };
})(window);
