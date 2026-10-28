/* Halloween pack: silly-spooky friends. (Real "horror mode" is separate and is started by Mr. Black.) */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'halloween', order: 5, label: 'Halloween', icon: '🎃', color: '#8a4bd6',
        theme: { bg1: '#4b2a7a', bg2: '#1a0f2e', panel: '#2d1a4d', text: '#fff3e0', accent: '#ff9a1f', slot: '#3b2563' },
        fx: { emoji: '🦇', count: 8, dir: 'drift' },
        bpm: 100,
        chars: [
            { id: 'ha_boo', name: 'Boo', type: 'beats', art: { body: 'round', color: '#f4f4ff', eyes: 'big', mouth: 'o' },
              synth: { kind: 'drum', voice: 'kick', pitch: 0.9, pattern: 'x..x..x.x..x..x.' } },
            { id: 'ha_skelly', name: 'Skelly', type: 'beats', art: { body: 'tall', color: '#efe6d0', eyes: 'big', mouth: 'grin', acc: 'bow', accColor: '#333344' },
              synth: { kind: 'drum', voice: 'wood', pitch: 1.1, pattern: 'x.xx.x.xx.xx.x.x' } },
            { id: 'ha_cobweb', name: 'Cobweb', type: 'effects', art: { body: 'wide', color: '#c9c9d9', eyes: 'sleepy', mouth: 'smile', acc: 'antenna', accColor: '#333344' },
              synth: { kind: 'noise', lp: 2500, hp: 1200, lfo: 3, depth: 0.8, amp: 0.4 } },
            { id: 'ha_bat', name: 'Bat', type: 'effects', art: { body: 'round', color: '#5b3f8c', eyes: 'big', mouth: 'smile', acc: 'wings' },
              synth: { kind: 'drum', voice: 'tick', pitch: 2.5, pattern: 'x.x.xx..x.xx..x.' } },
            { id: 'ha_cauldron', name: 'Cauldron', type: 'melodies', art: { body: 'wide', color: '#6bbf59', eyes: 'happy', mouth: 'grin', acc: 'witchhat' },
              synth: { kind: 'tone', wave: 'saw', lp: 1000, decays: true, d: 0.35, seq: [57, N, 60, N, 64, N, 60, N, 57, N, 60, N, 64, N, 67, N] } },
            { id: 'ha_moonbeam', name: 'Moonbeam', type: 'melodies', art: { body: 'drop', color: '#fff0a0', eyes: 'sleepy', mouth: 'smile', acc: 'bow', accColor: '#6a5acd', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.4, decays: true, d: 0.9, chord: [0, 12], seq: [76, N, N, N, 72, N, N, N, 69, N, N, N, 71, N, N, N] } },
            { id: 'ha_ghosty', name: 'Ghosty', type: 'vocals', art: { body: 'ghost', color: '#cfe8ff', eyes: 'dots', mouth: 'o' },
              synth: { kind: 'voice', seq: [[57, 'o', 4], N, N, N, [60, 'o', 4], N, N, N, [64, 'o', 4], N, N, N, [60, 'o', 4], N, N, N] } },
            { id: 'ha_pumpkin', name: 'Pumpkin', type: 'vocals', art: { body: 'round', color: '#f28c28', eyes: 'happy', mouth: 'grin', acc: 'sprout' },
              synth: { kind: 'voice', seq: [[64, 'a', 2], N, [67, 'a', 2], N, [69, 'a', 4], N, N, N, [67, 'a', 2], N, [64, 'a', 2], N, [57, 'a', 4], N, N, N] } }
        ]
    });
})(window);
