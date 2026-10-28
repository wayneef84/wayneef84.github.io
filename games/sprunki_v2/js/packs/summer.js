/* Summer pack. */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'summer', order: 2, label: 'Summer', icon: '☀️', color: '#ff8c1a',
        theme: { bg1: '#7fdcff', bg2: '#ffe9a0', panel: '#fffbe8', text: '#0f3b5a', accent: '#ff7a1a', slot: '#ffffff' },
        fx: { emoji: '✨', count: 12, dir: 'drift' },
        bpm: 100,
        chars: [
            { id: 'su_sandy', name: 'Sandy', type: 'beats', art: { body: 'wide', color: '#f5c27a', eyes: 'dots', mouth: 'grin', acc: 'shades' },
              synth: { kind: 'drum', voice: 'tom', pitch: 1.3, pattern: 'x..x..x.x..x..x.' } },
            { id: 'su_pop', name: 'Pop', type: 'beats', art: { body: 'round', color: '#ff8a65', eyes: 'big', mouth: 'open', acc: 'sun', accColor: '#ffd23f' },
              synth: { kind: 'drum', voice: 'pop', pattern: 'x.x...x.x.x...x.' } },
            { id: 'su_surf', name: 'Surf', type: 'effects', art: { body: 'wide', color: '#4fd1d9', eyes: 'sleepy', mouth: 'smile' },
              synth: { kind: 'noise', lp: 700, lfo: 1, depth: 0.9, amp: 0.8 } },
            { id: 'su_cicada', name: 'Cicada', type: 'effects', art: { body: 'square', color: '#c8e65a', eyes: 'big', mouth: 'o', acc: 'antenna', accColor: '#ff7a1a' },
              synth: { kind: 'tone', wave: 'square', lp: 3000, decays: true, d: 0.05, amp: 0.35, seq: [96, 96, N, 96, 96, N, 96, N, 96, 96, N, 96, 96, N, N, N] } },
            { id: 'su_mango', name: 'Mango', type: 'melodies', art: { body: 'drop', color: '#ffb347', eyes: 'happy', mouth: 'smile', acc: 'leaf', accColor: '#3fae4a', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', decays: true, d: 0.25, seq: [72, N, 76, N, 79, N, 81, N, 79, N, 76, N, 74, N, 72, N] } },
            { id: 'su_coral', name: 'Coral', type: 'melodies', art: { body: 'tall', color: '#ff7f9e', eyes: 'dots', mouth: 'smile', acc: 'bow', accColor: '#ffffff' },
              synth: { kind: 'tone', wave: 'tri', harm: 0.4, decays: true, d: 0.35, chord: [0, 12], seq: [64, N, 67, N, N, 64, 67, N, 69, N, N, 69, 67, N, N, N] } },
            { id: 'su_sunny', name: 'Sunny', type: 'vocals', art: { body: 'round', color: '#ffe14d', eyes: 'happy', mouth: 'open', acc: 'sun', accColor: '#ff9f1c' },
              synth: { kind: 'voice', seq: [[69, 'a', 2], N, [72, 'a', 2], N, [76, 'a', 4], N, N, N, [72, 'a', 2], N, [69, 'a', 4], N, N, N, N, N] } },
            { id: 'su_breezy', name: 'Breezy', type: 'vocals', art: { body: 'tall', color: '#7fd6ff', eyes: 'sleepy', mouth: 'o', acc: 'flower', accColor: '#ff9f1c' },
              synth: { kind: 'voice', seq: [[60, 'o', 4], N, N, N, [64, 'o', 4], N, N, N, [67, 'o', 4], N, N, N, [64, 'o', 4], N, N, N] } }
        ]
    });
})(window);
