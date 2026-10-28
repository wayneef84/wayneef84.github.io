/* Candy pack: sweet treats. Bright, bouncy and a little sparkly (96 BPM). */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'candy', order: 9, label: 'Candy', icon: '🍬', color: '#e63946',
        theme: { bg1: '#fff3c9', bg2: '#ffb3c1', panel: '#fffaf0', text: '#4a1f2a', accent: '#e63946', slot: '#ffffff' },
        fx: { emoji: '🍬', count: 12, dir: 'fall' },
        bpm: 96,
        chars: [
            { id: 'cn_gumdrop', name: 'Gumdrop', type: 'beats', art: { body: 'round', color: '#ff8fa3', eyes: 'happy', mouth: 'smile', acc: 'sprout', accColor: '#6fcf6f', cheeks: true },
              synth: { kind: 'drum', voice: 'tick', pitch: 0.7, pattern: 'x.x.x.x.x.x.x.xx' } },
            { id: 'cn_lolly', name: 'Lolly', type: 'beats', art: { body: 'drop', color: '#ffd23f', eyes: 'big', mouth: 'o', acc: 'bow', accColor: '#e63946' },
              synth: { kind: 'drum', voice: 'shaker', pattern: '..x...x...x...xx' } },
            { id: 'cn_fizzy', name: 'Fizzy', type: 'effects', art: { body: 'square', color: '#a0e7e5', eyes: 'dots', mouth: 'grin', acc: 'antenna', accColor: '#ff8fa3' },
              synth: { kind: 'noise', lp: 7000, hp: 4200, lfo: 2, depth: 0.5, drops: 26, amp: 0.55 } },
            { id: 'cn_crinkle', name: 'Crinkle', type: 'effects', art: { body: 'wide', color: '#ffb347', eyes: 'sleepy', mouth: 'smile', acc: 'bow', accColor: '#7a5cd1' },
              synth: { kind: 'noise', lp: 4800, hp: 2400, lfo: 9, depth: 0.95, amp: 0.5 } },
            { id: 'cn_truffle', name: 'Truffle', type: 'melodies', art: { body: 'round', color: '#8a5a3c', eyes: 'happy', mouth: 'grin', acc: 'ears', accColor: '#6b4329', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', decays: true, d: 0.5, chord: [0, 4], seq: [60, N, 64, N, 67, N, 72, N, 71, N, 67, N, 64, N, 62, N] } },
            { id: 'cn_taffy', name: 'Taffy', type: 'melodies', art: { body: 'tall', color: '#9b6bff', eyes: 'big', mouth: 'open', acc: 'flower', accColor: '#ffd1f0' },
              synth: { kind: 'tone', wave: 'sine', harm: 0.6, decays: true, d: 0.22, amp: 0.9, seq: [79, 83, 86, N, 79, 83, 88, N, 77, 81, 84, N, 79, 83, 86, N] } },
            { id: 'cn_mint', name: 'Mint', type: 'vocals', art: { body: 'round', color: '#b8f5d2', eyes: 'dots', mouth: 'smile', acc: 'snowcap', accColor: '#ffffff', cheeks: true },
              synth: { kind: 'voice', seq: [[72, 'a', 2], N, [76, 'a', 2], N, [79, 'e', 4], N, N, N, [77, 'e', 2], N, [74, 'a', 2], N, [72, 'o', 4], N, N, N] } },
            { id: 'cn_sprinkle', name: 'Sprinkle', type: 'vocals', art: { body: 'drop', color: '#ffb8e1', eyes: 'happy', mouth: 'open', acc: 'sun', accColor: '#ffd23f', cheeks: true },
              synth: { kind: 'voice', seq: [[79, 'e', 1], [81, 'e', 1], [84, 'a', 2], N, [81, 'e', 1], [79, 'e', 1], [76, 'a', 2], N, [79, 'e', 1], [81, 'e', 1], [84, 'a', 4], N, N, N, N, N] } }
        ]
    });
})(window);
