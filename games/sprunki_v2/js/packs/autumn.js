/* Autumn pack. */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'autumn', order: 3, label: 'Autumn', icon: '🍂',
        theme: { bg1: '#f6b26b', bg2: '#8c4a2f', panel: '#fff0dc', text: '#3d2314', accent: '#c4561a', slot: '#fff8ee' },
        fx: { emoji: '🍂', count: 14, dir: 'fall' },
        bpm: 100,
        chars: [
            { id: 'au_acorn', name: 'Acorn', type: 'beats', art: { body: 'round', color: '#c98b4e', eyes: 'dots', mouth: 'smile', acc: 'leaf', accColor: '#e8743b' },
              synth: { kind: 'layers', layers: [{ kind: 'drum', voice: 'kick', pattern: 'x.......x.x.....' }, { kind: 'drum', voice: 'snare', pattern: '....x.......x...' }] } },
            { id: 'au_rustle', name: 'Rustle', type: 'beats', art: { body: 'wide', color: '#f0a04b', eyes: 'happy', mouth: 'grin', acc: 'leaf', accColor: '#b8431a' },
              synth: { kind: 'drum', voice: 'shaker', pattern: 'x.xxx.xxx.xxx.xx' } },
            { id: 'au_gust', name: 'Gust', type: 'effects', art: { body: 'drop', color: '#b9a58f', eyes: 'sleepy', mouth: 'o' },
              synth: { kind: 'noise', lp: 500, hp: 100, lfo: 1, depth: 0.85, amp: 0.9 } },
            { id: 'au_crunch', name: 'Crunch', type: 'effects', art: { body: 'square', color: '#a8643a', eyes: 'big', mouth: 'open', acc: 'ears', accColor: '#8a4a22' },
              synth: { kind: 'drum', voice: 'wood', pitch: 0.8, pattern: 'x...x.x.....x...' } },
            { id: 'au_maple', name: 'Maple', type: 'melodies', art: { body: 'tall', color: '#e8743b', eyes: 'dots', mouth: 'smile', acc: 'leaf', accColor: '#f5b83d', cheeks: true },
              synth: { kind: 'tone', wave: 'saw', lp: 1400, a: 0.02, decays: true, d: 0.5, seq: [62, N, 64, N, 67, N, 64, N, 62, N, 69, N, 67, N, 64, N] } },
            { id: 'au_amber', name: 'Amber', type: 'melodies', art: { body: 'square', color: '#f5b83d', eyes: 'sleepy', mouth: 'smile', acc: 'beanie', accColor: '#8a4a22' },
              synth: { kind: 'tone', wave: 'tri', lp: 800, decays: true, d: 0.4, seq: [45, N, N, 45, N, N, 52, N, 45, N, N, 45, N, 50, N, N] } },
            { id: 'au_harvey', name: 'Harvey', type: 'vocals', art: { body: 'wide', color: '#d9a566', eyes: 'sleepy', mouth: 'o', acc: 'beanie', accColor: '#7a3b6e' },
              synth: { kind: 'voice', seq: [[52, 'u', 4], N, N, N, [55, 'u', 4], N, N, N, [57, 'u', 4], N, N, N, [55, 'u', 4], N, N, N] } },
            { id: 'au_nutmeg', name: 'Nutmeg', type: 'vocals', art: { body: 'drop', color: '#b5733c', eyes: 'happy', mouth: 'open', acc: 'ears', accColor: '#8a4a22' },
              synth: { kind: 'voice', seq: [[64, 'e', 2], N, [67, 'e', 2], N, [69, 'e', 4], N, N, N, [67, 'e', 2], N, [64, 'e', 4], N, N, N, N, N] } }
        ]
    });
})(window);
