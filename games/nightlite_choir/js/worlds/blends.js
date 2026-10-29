/* Blend creatures (Milestone 3). Data only, like the worlds: look is an art-generator spec, sound is a synth spec.
   Not a world: blends have no door. They are made in the Mixing pot or hatched from an egg, then placed on any stage.
   Each blend has two parents from DIFFERENT worlds (ids as in js/worlds/*.js). The recipe table is invented here.
   Every note is C major pentatonic (C D E G A). One job each, distinct from the 12 base creatures.
   Tempo of a blend = tempo of its first parent's world (set in app.js), so the "first creature placed sets the tempo" rule still holds. */
(function (w) {
    var N = null;
    w.NightliteBlends = {
        label: 'Blends', chip: 'Blends', icon: '🌈',
        chars: [
            { id: 'mossweave', name: 'Mossweave', role: 'wobble bass', blend: ['mossle', 'skeinie'],
              art: { body: 'round', color: '#9bb56a', eyes: 'button', mouth: 'stitch', acc: 'braids', accColor: '#e0b252', acc2: 'sprout', cheeks: true, patch: '#e8a5b4' },
              synth: { kind: 'tone', wave: 'tri', harm: 0.15, a: 0.08, d: 0.7, lp: 700, vib: 1, amp: 0.8,
                       seq: [[48, 3], N, N, [52, 3], N, N, [55, 2], N, [57, 3], N, N, [55, 3], N, N, [52, 2], N] } },
            { id: 'halohum', name: 'Halohum', role: 'glow arpeggio', blend: ['glimmow', 'ringhum'],
              art: { body: 'ghost', color: '#cfe0ff', eyes: 'big', mouth: 'hum', acc: 'antenna', accColor: '#fff0b8', acc2: 'ringband', acc2Color: '#ffb7dc' },
              synth: { kind: 'tone', wave: 'sine', harm: 0.1, a: 0.15, d: 0.9, vib: 1, amp: 0.5, chord: [0, 7],
                       seq: [[72, 2], N, [76, 2], N, [79, 2], N, [81, 2], N, [79, 2], N, [76, 2], N, [74, 2], N, [72, 2], N] } },
            { id: 'dewglint', name: 'Dewglint', role: 'droplet marimba', blend: ['puddlet', 'glintwand'],
              art: { body: 'drop', color: '#9fd8f2', eyes: 'twinkle', mouth: 'smile', acc: 'wand', accColor: '#fff3b0', acc2: 'sparkles', acc2Color: '#ffd9ee', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.7, decays: true, a: 0.002, d: 0.22, amp: 0.6,
                       seq: [79, N, 81, 84, N, 81, N, 79, N, 76, N, 79, 81, N, 76, N] } },
            { id: 'trotleaf', name: 'Trotleaf', role: 'hop bass', blend: ['hedgey', 'clopsy'],
              art: { body: 'pony', color: '#8dba7a', eyes: 'dots', mouth: 'smile', acc: 'mane', accColor: '#3f8a58', acc2: 'leaf', acc2Color: '#a9e0a0', mark: 'star' },
              synth: { kind: 'tone', wave: 'square', a: 0.004, d: 0.12, decays: true, lp: 900, amp: 0.7,
                       seq: [55, N, N, 60, N, 64, N, N, 60, N, N, 55, N, 57, N, N] } },
            { id: 'tockmoon', name: 'Tockmoon', role: 'chord stabs', blend: ['tocklet', 'dozemoon'],
              art: { body: 'moon', color: '#b4c6d8', eyes: 'big', mouth: 'grille', acc: 'nightcap', accColor: '#e8b25a', acc2: 'windkey' },
              synth: { kind: 'tone', wave: 'saw', decays: true, a: 0.003, d: 0.35, lp: 1500, amp: 0.55, chord: [0, 7, 12],
                       seq: [N, N, 60, N, N, N, N, N, N, N, 64, N, N, N, 67, N] } },
            { id: 'twirlwisp', name: 'Twirlwisp', role: 'ooh voice', blend: ['mallowhorn', 'twirltail'],
              art: { body: 'plush', color: '#e0d0ff', eyes: 'happy', mouth: 'open', acc: 'swirl', accColor: '#ff9fcf', acc2: 'horn', acc2Color: '#f6d98a', cheeks: true },
              synth: { kind: 'voice', amp: 0.7,
                       seq: [[72, 'o', 3], N, N, N, [76, 'o', 2], N, [79, 'o', 3], N, N, N, [81, 'o', 2], N, [79, 'o', 2], N, N, N] } }
        ]
    };
})(window);
