/* Author: Claude. Design date: 2026-11-01.
   Merged into the blend tables by js/recipes.js (any window global starting with NightliteBlendsExtra_ is picked up).
   Nightlite Choir+ extra blends, set CLAUDE.
   15 new choirers: 6 two-ingredient, 4 three, 3 four, 2 five. Ingredients are base ids or blend ids (existing or in this file).
   Every note is C major pentatonic (C D E G A). Strict ES5. Data only, no network. */
(function (w) {
    var N = null;
    w.NightliteBlendsExtra_CLAUDE = {
        chars: [
            /* ---- 2 ingredients (tier 1) ---- */
            { id: 'lilybop', name: 'Lilybop', role: 'bloop bass', blend: ['mossle', 'puddlet'], tier: 1,
              look: 'Green water drop (Puddlet) with a pond-lily flower and leaf (Mossle sprout and moss green).',
              clue: 'Pond friends make a bubbly low bloop.',
              art: { body: 'drop', color: '#7ccf9a', eyes: 'happy', mouth: 'o', acc: 'flower', accColor: '#ffb7dc', acc2: 'leaf', acc2Color: '#4f9a62', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.5, decays: true, a: 0.005, d: 0.28, lp: 600, amp: 0.8,
                       seq: [36, N, N, 43, N, N, 36, N, 40, N, N, 43, N, 45, N, N] } },
            { id: 'tintrot', name: 'Tintrot', role: 'march drum', blend: ['clopsy', 'tocklet'], tier: 1,
              look: 'Tin-grey hobby horse (Clopsy) with a golden mane and a wind-up key (Cogwick).',
              clue: 'Wooden and tin toys march together.',
              art: { body: 'pony', color: '#9db4c0', eyes: 'big', mouth: 'smile', acc: 'mane', accColor: '#e8b25a', acc2: 'windkey', acc2Color: '#e8b25a' },
              synth: { kind: 'drum', voice: 'wood', pitch: 0.8, amp: 0.65, pattern: 'x...x.x.x...x.xx' } },
            { id: 'streakle', name: 'Streakle', role: 'comet lead', blend: ['glintwand', 'twirltail'], tier: 1,
              look: 'Lilac comet head and pink swirl tail (Twirltail) with sparkles from the star wand (Glintwand).',
              clue: 'A sparkly wand chases a comet.',
              art: { body: 'comet', color: '#c9a8ff', eyes: 'twinkle', mouth: 'open', acc: 'swirl', accColor: '#ffd9ee', acc2: 'sparkles', acc2Color: '#fff3b0' },
              synth: { kind: 'tone', wave: 'saw', decays: true, a: 0.004, d: 0.26, lp: 3000, amp: 0.45,
                       seq: [79, 81, 84, N, 88, N, 84, N, 81, N, 79, N, 76, N, N, N] } },
            { id: 'glowfluff', name: 'Glowfluff', role: 'cuddle pad', blend: ['glimmow', 'mallowhorn'], tier: 1,
              look: 'Cream plush body (Fluffhorn) tinted glowing yellow with a little glow antenna (Glimmow).',
              clue: 'Warm glow meets a fluffy dreamer.',
              art: { body: 'plush', color: '#fff2b0', eyes: 'happy', mouth: 'smile', acc: 'antenna', accColor: '#fff6c4', acc2: 'tuft', acc2Color: '#ffe58a', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', harm: 0.1, a: 0.6, d: 1.2, lp: 1200, vib: 1, amp: 0.7, chord: [0, 7, 12],
                       seq: [[60, 8], N, N, N, N, N, N, N, [57, 8], N, N, N, N, N, N, N] } },
            { id: 'hushbush', name: 'Hushbush', role: 'breeze texture', blend: ['hedgey', 'dozemoon'], tier: 1,
              look: 'Blue-green leafy bush (Shrublet) wearing a sleepy nightcap (Dozemoon) with a firefly.',
              clue: 'Sleepy moon naps in a leafy bush.',
              art: { body: 'bush', color: '#4f7f8a', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#9bd27a', acc2: 'firefly', acc2Color: '#ffe98a' },
              synth: { kind: 'noise', lp: 700, hp: 120, lfo: 2, depth: 0.85, drops: 0, amp: 0.45 } },
            { id: 'yarnkite', name: 'Yarnkite', role: 'kite voice', blend: ['skeinie', 'twirltail'], tier: 1,
              look: 'Rag doll (Skeinie) with button eyes and sky-blue yarn braids, trailing a pink swirl tail (Twirltail).',
              clue: 'Yarn dolly rides a swirly tail.',
              art: { body: 'doll', color: '#ffb7a0', eyes: 'button', mouth: 'open', acc: 'braids', accColor: '#8fd0e8', acc2: 'swirl', acc2Color: '#ff9fcf', cheeks: true },
              synth: { kind: 'voice', amp: 0.65,
                       seq: [[79, 'e', 2], N, [76, 'e', 2], N, [74, 'e', 2], N, [76, 'e', 2], N, [72, 'e', 3], N, N, [69, 'e', 2], N, [72, 'e', 2], N, N] } },

            /* ---- 3 ingredients ---- */
            { id: 'nodlight', name: 'Nodlight', role: 'night-light arpeggio', blend: ['mossle', 'glimmow', 'dozemoon'], tier: 1,
              look: 'Soft green round body (Mossle) with a sleepy nightcap (Dozemoon) and a glowing firefly (Glimmow).',
              clue: 'Sleepy things who glow in the dark.',
              art: { body: 'round', color: '#c8e6a0', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#ffe58a', acc2: 'firefly', acc2Color: '#fff6c4', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', harm: 0.1, decays: true, a: 0.02, d: 0.5, amp: 0.55,
                       seq: [60, 64, 67, 69, 67, 64, 60, N, 62, 67, 69, 72, 69, 67, 62, N] } },
            { id: 'tootlepip', name: 'Tootlepip', role: 'toy piano', blend: ['clopsy', 'skeinie', 'mallowhorn'], tier: 1,
              look: 'Cream hobby-horse head (Clopsy) with a star cheek, a doll bow (Skeinie) and a gold horn (Fluffhorn).',
              clue: 'Toy box friends play a tiny tune.',
              art: { body: 'pony', color: '#f5e0c8', eyes: 'happy', mouth: 'grin', acc: 'bow', accColor: '#e59ab4', acc2: 'horn', acc2Color: '#f0cf86', cheeks: true, mark: 'star' },
              synth: { kind: 'tone', wave: 'square', decays: true, a: 0.003, d: 0.12, lp: 2400, amp: 0.45,
                       seq: [72, N, 76, N, 79, N, 76, 72, N, 74, N, 79, N, 76, N, N] } },
            { id: 'sprizzle', name: 'Sprizzle', role: 'rain shaker', blend: ['mossweave', 'puddlet', 'hedgey'], tier: 2,
              look: 'Leafy bush body (Shrublet) with raindrop sparkles (Puddlet) and a woolly pink patch (Mossweave).',
              clue: 'Rainy puddles, mossy yarn and leafy rattles.',
              art: { body: 'bush', color: '#8fc79a', eyes: 'dots', mouth: 'smile', acc: 'leaf', accColor: '#a9e0a0', acc2: 'sparkles', acc2Color: '#bfe6ff', cheeks: true, patch: '#e8a5b4' },
              synth: { kind: 'drum', voice: 'shaker', pitch: 1, amp: 0.5, pattern: '.x.x.xx..x.x.xx.' } },
            { id: 'warblestar', name: 'Warblestar', role: 'whistle lead', blend: ['twirlwisp', 'glintwand', 'ringhum'], tier: 2,
              look: 'Pink star body (Glintwand) with a thin planet ring (Ringhum) and a swirl tail (Twirlwisp).',
              clue: 'Singing blend, shiny star, humming planet.',
              art: { body: 'star', color: '#ffc4e4', eyes: 'twinkle', mouth: 'hum', acc: 'ringband', accColor: '#a8c4ff', acc2: 'swirl', acc2Color: '#ff9fcf', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.05, a: 0.1, d: 0.6, vib: 1, amp: 0.45,
                       seq: [[88, 3], N, N, [91, 2], N, [93, 3], N, N, [91, 2], N, [88, 2], N, [84, 3], N, N, N] } },

            /* ---- 4 ingredients ---- */
            { id: 'patterpop', name: 'Patterpop', role: 'bubble beat', blend: ['puddlet', 'ringhum', 'tocklet', 'hedgey'], tier: 1,
              look: 'Blue-grey box body (Cogwick) with a drip-blue color (Puddlet), a bulb antenna and a leaf.',
              clue: 'Splash, hum, tick and rustle make rain music.',
              art: { body: 'square', color: '#a8d8f0', eyes: 'big', mouth: 'o', acc: 'antenna', accColor: '#ffe98a', acc2: 'leaf', acc2Color: '#7fd6a0' },
              synth: { kind: 'drum', voice: 'pop', pitch: 1, amp: 0.6, pattern: '.x..x.x..x..x.xx' } },
            { id: 'bounceboom', name: 'Bounceboom', role: 'kick drum', blend: ['trotleaf', 'tockmoon', 'dewglint', 'glimmow'], tier: 2,
              look: 'Round green-tan body (Trotleaf) with a gold cap (Tockmoon), a leaf (Dewglint drop) and a grin.',
              clue: 'Hop, tick, drip and glow all stomp.',
              art: { body: 'wide', color: '#b8d4a0', eyes: 'dots', mouth: 'grin', acc: 'beanie', accColor: '#e8b25a', acc2: 'leaf', acc2Color: '#a9e0a0', cheeks: true },
              synth: { kind: 'drum', voice: 'kick', pitch: 1, amp: 0.85, pattern: 'x.....x...x.x...' } },
            { id: 'cozynub', name: 'Cozynub', role: 'blanket bass', blend: ['mossweave', 'halohum', 'dozemoon', 'mallowhorn'], tier: 2,
              look: 'Soft lilac round body (Mossweave shape) with a nightcap (Dozemoon) and a fluffy pink scarf (Fluffhorn).',
              clue: 'Cozy blankets, sleepy moon, soft cuddles.',
              art: { body: 'round', color: '#e8d8f4', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#9bd0ff', acc2: 'scarf', acc2Color: '#ffb7dc', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', harm: 0.1, a: 0.1, d: 0.8, lp: 500, vib: 1, amp: 0.75,
                       seq: [[33, 4], N, N, N, [36, 2], N, [40, 2], N, [43, 4], N, N, N, [40, 2], N, [36, 2], N] } },

            /* ---- 5 ingredients ---- */
            { id: 'glimmerjig', name: 'Glimmerjig', role: 'sparkle bells', blend: ['glimmow', 'hedgey', 'skeinie', 'tocklet', 'glintwand'], tier: 1,
              look: 'Pale gold star body with sparkles (Glintwand), a glow antenna (Glimmow) and a happy grin.',
              clue: 'Five shiny things twinkle and jiggle.',
              art: { body: 'star', color: '#fff0b0', eyes: 'twinkle', mouth: 'grin', acc: 'sparkles', accColor: '#ffd9ee', acc2: 'antenna', acc2Color: '#fff6c4', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.6, decays: true, a: 0.002, d: 1.2, amp: 0.45, chord: [0, 12],
                       seq: [N, 88, N, N, 93, N, 96, N, N, 91, N, 88, N, N, 93, N] } },
            { id: 'jubilume', name: 'Jubilume', role: 'big choir', blend: ['mossweave', 'halohum', 'dewglint', 'trotleaf', 'twirlwisp'], tier: 2,
              look: 'Pink plush-like body (Twirlwisp) with a golden sun (Halohum glow) and sparkles (Dewglint).',
              clue: 'Every colorful blend sings one big song.',
              art: { body: 'wide', color: '#ffd6f0', eyes: 'happy', mouth: 'open', acc: 'sun', accColor: '#ffd36b', acc2: 'sparkles', acc2Color: '#bfe6ff', cheeks: true },
              synth: { kind: 'layers', amp: 0.7, layers: [
                  { kind: 'voice', amp: 0.8, seq: [[60, 'a', 4], N, N, N, [64, 'a', 4], N, N, N, [67, 'a', 4], N, N, N, [64, 'a', 4], N, N, N] },
                  { kind: 'voice', amp: 0.6, seq: [N, N, [79, 'o', 2], N, N, N, [81, 'o', 2], N, N, N, [84, 'o', 2], N, N, N, [81, 'o', 2], N] }
              ] } }
        ]
    };
})(window);
