/* Toxic pack: glowing green slime and lab goo. Silly and squelchy, nothing scary (108 BPM). */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'toxic', order: 7, label: 'Toxic', icon: '🧪', color: '#58b012',
        theme: { bg1: '#d7ff7a', bg2: '#2f9a4a', panel: '#f4ffd9', text: '#1d3a10', accent: '#3f9a0c', slot: '#ffffff' },
        fx: { emoji: '🧪', count: 12, dir: 'rise' },
        bpm: 108,
        chars: [
            { id: 'tx_gloop', name: 'Gloop', type: 'beats', art: { body: 'round', color: '#7dff3a', eyes: 'big', mouth: 'open', acc: 'antenna', accColor: '#b6ff6a' },
              synth: { kind: 'drum', voice: 'pop', pitch: 0.45, pattern: 'x..x.x..x..x.x.x' } },
            { id: 'tx_splotch', name: 'Splotch', type: 'beats', art: { body: 'wide', color: '#a6e22e', eyes: 'dots', mouth: 'grin', acc: 'sprout' },
              synth: { kind: 'drum', voice: 'clap', pattern: '..x...x...x..xx.' } },
            { id: 'tx_fizz', name: 'Fizz', type: 'effects', art: { body: 'drop', color: '#c9ff5c', eyes: 'happy', mouth: 'o', acc: 'bow', accColor: '#3fd16a' },
              synth: { kind: 'noise', lp: 3200, hp: 1400, lfo: 4, depth: 0.8, drops: 20, amp: 0.7 } },
            { id: 'tx_burble', name: 'Burble', type: 'effects', art: { body: 'round', color: '#39c46a', eyes: 'sleepy', mouth: 'smile', acc: 'leaf', accColor: '#8dff7a' },
              synth: { kind: 'noise', lp: 380, hp: 50, lfo: 5, depth: 0.95, drops: 9, amp: 0.9 } },
            { id: 'tx_zappy', name: 'Zappy', type: 'melodies', art: { body: 'square', color: '#e4ff3a', eyes: 'big', mouth: 'grin', acc: 'antenna', accColor: '#7dff3a' },
              synth: { kind: 'tone', wave: 'square', lp: 1400, vib: 1, decays: true, d: 0.18, seq: [64, N, 67, N, 71, 67, N, 64, 62, N, 65, N, 69, 65, N, N] } },
            { id: 'tx_wobble', name: 'Wobble', type: 'melodies', art: { body: 'tall', color: '#6ee08a', eyes: 'dots', mouth: 'smile', acc: 'shades' },
              synth: { kind: 'tone', wave: 'saw', lp: 800, vib: 1, chord: [0, 3], d: 0.5, seq: [[40, 3], N, N, [43, 3], N, N, [38, 4], N, N, N, [43, 2], N, [45, 2], N, N, N] } },
            { id: 'tx_gooey', name: 'Gooey', type: 'vocals', art: { body: 'drop', color: '#9cf04a', eyes: 'happy', mouth: 'open', acc: 'sprout', cheeks: true },
              synth: { kind: 'voice', seq: [[55, 'u', 2], N, [58, 'u', 2], N, [55, 'a', 2], N, N, N, [60, 'u', 4], N, N, N, [57, 'a', 2], N, N, N] } },
            { id: 'tx_blorp', name: 'Blorp', type: 'vocals', art: { body: 'ghost', color: '#4fd8b0', eyes: 'big', mouth: 'o', acc: 'bow', accColor: '#e4ff3a' },
              synth: { kind: 'voice', seq: [[48, 'o', 1], N, [52, 'o', 1], N, [48, 'o', 1], N, N, N, [55, 'e', 3], N, N, N, [52, 'u', 3], N, N, N] } }
        ]
    });
})(window);
