/* Robo pack: friendly little robots. Beeps, whirs and chip tunes (104 BPM). */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'robo', order: 8, label: 'Robo', icon: '🤖', color: '#6f86a8',
        theme: { bg1: '#2b3a55', bg2: '#10182b', panel: '#1e2b45', text: '#e8f4ff', accent: '#2fd0f0', slot: '#2a3b5e' },
        fx: { emoji: '⚙️', count: 9, dir: 'drift' },
        bpm: 104,
        chars: [
            { id: 'rb_beepo', name: 'Beepo', type: 'beats', art: { body: 'square', color: '#9db4d0', eyes: 'big', mouth: 'smile', acc: 'antenna', accColor: '#2fd0f0' },
              synth: { kind: 'drum', voice: 'wood', pitch: 0.75, pattern: 'x.x.x...x.x.x..x' } },
            { id: 'rb_clank', name: 'Clank', type: 'beats', art: { body: 'round', color: '#c3a98a', eyes: 'dots', mouth: 'grin', acc: 'ears', accColor: '#8a6d4a' },
              synth: { kind: 'drum', voice: 'kick', pitch: 1.1, pattern: 'x...x...x..xx...' } },
            { id: 'rb_whirr', name: 'Whirr', type: 'effects', art: { body: 'wide', color: '#7fa3c8', eyes: 'sleepy', mouth: 'o', acc: 'antenna', accColor: '#ffd23f' },
              synth: { kind: 'noise', lp: 2600, hp: 900, lfo: 6, depth: 0.85, amp: 0.6 } },
            { id: 'rb_static', name: 'Static', type: 'effects', art: { body: 'tall', color: '#b9c3d1', eyes: 'dots', mouth: 'smile', acc: 'shades' },
              synth: { kind: 'noise', lp: 6500, hp: 3500, lfo: 3, depth: 0.7, drops: 18, amp: 0.55 } },
            { id: 'rb_chip', name: 'Chip', type: 'melodies', art: { body: 'square', color: '#6fd6a0', eyes: 'big', mouth: 'grin', acc: 'antenna', accColor: '#ff7bb0' },
              synth: { kind: 'tone', wave: 'square', decays: true, d: 0.14, amp: 0.8, seq: [72, 76, 79, 84, 79, 76, 72, N, 74, 77, 81, 86, 81, 77, 74, N] } },
            { id: 'rb_volt', name: 'Volt', type: 'melodies', art: { body: 'round', color: '#ffd23f', eyes: 'happy', mouth: 'smile', acc: 'antenna', accColor: '#e8743b' },
              synth: { kind: 'tone', wave: 'saw', lp: 700, d: 0.3, seq: [[36, 2], N, [36, 2], N, [43, 2], N, [41, 2], N, [36, 2], N, [36, 2], N, [46, 2], N, [43, 2], N] } },
            { id: 'rb_dot', name: 'Dot', type: 'vocals', art: { body: 'drop', color: '#f0a6c8', eyes: 'big', mouth: 'o', acc: 'bow', accColor: '#2fd0f0', cheeks: true },
              synth: { kind: 'voice', seq: [[67, 'e', 1], N, [67, 'e', 1], N, [72, 'e', 1], N, [71, 'e', 1], N, [67, 'e', 1], N, [64, 'e', 1], N, [67, 'a', 3], N, N, N] } },
            { id: 'rb_bolt', name: 'Bolt', type: 'vocals', art: { body: 'tall', color: '#8fb8ff', eyes: 'dots', mouth: 'open', acc: 'beanie', accColor: '#ff6f61' },
              synth: { kind: 'voice', seq: [[48, 'a', 2], N, [48, 'a', 1], N, [55, 'a', 2], N, N, N, [53, 'o', 2], N, [50, 'o', 2], N, [48, 'u', 4], N, N, N] } }
        ]
    });
})(window);
