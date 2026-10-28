/* Spring pack. Adding a season = copy this file, change the data, add a script tag in index.html. */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'spring', order: 1, label: 'Spring', icon: '🌸', color: '#ec5fa6',
        theme: { bg1: '#ffd6e8', bg2: '#bff0d0', panel: '#fff4f9', text: '#3a2a3f', accent: '#e0559a', slot: '#ffffff' },
        fx: { emoji: '🌸', count: 14, dir: 'fall' },
        bpm: 100,
        chars: [
            { id: 'sp_bud', name: 'Bud', type: 'beats', art: { body: 'round', color: '#f8a5c2', eyes: 'happy', mouth: 'smile', acc: 'flower', accColor: '#ff6fa5', cheeks: true },
              synth: { kind: 'drum', voice: 'kick', pattern: 'x...x...x...x...' } },
            { id: 'sp_drizzle', name: 'Drizzle', type: 'beats', art: { body: 'drop', color: '#8ecbff', eyes: 'big', mouth: 'o', acc: 'bow', accColor: '#ffffff' },
              synth: { kind: 'drum', voice: 'tick', pitch: 1.2, pattern: 'x.x.xxx.x.x.xxx.' } },
            { id: 'sp_breeze', name: 'Breeze', type: 'effects', art: { body: 'wide', color: '#b8ecd0', eyes: 'sleepy', mouth: 'smile', acc: 'leaf', accColor: '#6fcf6f' },
              synth: { kind: 'noise', lp: 1200, hp: 200, lfo: 2, depth: 0.8, amp: 0.7 } },
            { id: 'sp_chirp', name: 'Chirp', type: 'effects', art: { body: 'round', color: '#ffe27a', eyes: 'big', mouth: 'open', acc: 'sprout' },
              synth: { kind: 'tone', wave: 'sine', decays: true, d: 0.12, amp: 0.6, seq: [84, N, 88, 91, N, N, 88, N, 84, N, N, 91, 88, N, N, N] } },
            { id: 'sp_daisy', name: 'Daisy', type: 'melodies', art: { body: 'tall', color: '#fff1c9', eyes: 'dots', mouth: 'smile', acc: 'flower', accColor: '#ffffff', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', decays: true, d: 0.5, seq: [72, N, 76, N, 79, N, 76, N, 74, N, 79, N, 76, N, 72, N] } },
            { id: 'sp_clover', name: 'Clover', type: 'melodies', art: { body: 'square', color: '#8fdc7c', eyes: 'happy', mouth: 'grin', acc: 'leaf', accColor: '#3fae4a' },
              synth: { kind: 'tone', wave: 'sine', harm: 0.3, decays: true, d: 0.8, chord: [0, 7], seq: [67, N, N, N, 72, N, N, N, 64, N, N, N, 69, N, N, N] } },
            { id: 'sp_lulu', name: 'Lulu', type: 'vocals', art: { body: 'round', color: '#cdb4ff', eyes: 'dots', mouth: 'o', acc: 'bow', accColor: '#ff7bb0', cheeks: true },
              synth: { kind: 'voice', seq: [[64, 'o', 4], N, N, N, [67, 'o', 4], N, N, N, [69, 'o', 4], N, N, N, [67, 'o', 4], N, N, N] } },
            { id: 'sp_bloom', name: 'Bloom', type: 'vocals', art: { body: 'drop', color: '#ffc4a3', eyes: 'happy', mouth: 'open', acc: 'flower', accColor: '#ff8fb8' },
              synth: { kind: 'voice', seq: [[72, 'a', 2], N, [74, 'a', 2], N, [76, 'a', 4], N, N, N, [74, 'a', 2], N, [72, 'a', 2], N, [67, 'a', 4], N, N, N] } }
        ]
    });
})(window);
