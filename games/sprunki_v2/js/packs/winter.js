/* Winter pack. */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'winter', order: 4, label: 'Winter', icon: '❄️', color: '#3b9be0',
        theme: { bg1: '#cfe8ff', bg2: '#7ea6d8', panel: '#f2f8ff', text: '#17304f', accent: '#2f7fd1', slot: '#ffffff' },
        fx: { emoji: '❄️', count: 16, dir: 'fall' },
        bpm: 100,
        chars: [
            { id: 'wi_frosty', name: 'Frosty', type: 'beats', art: { body: 'round', color: '#e8f4ff', eyes: 'dots', mouth: 'smile', acc: 'beanie', accColor: '#3a86d8', cheeks: true },
              synth: { kind: 'drum', voice: 'kick', pitch: 0.9, pattern: 'x.......x.......' } },
            { id: 'wi_sleigh', name: 'Sleigh', type: 'beats', art: { body: 'tall', color: '#3fa66b', eyes: 'happy', mouth: 'grin', acc: 'scarf', accColor: '#d94f4f' },
              synth: { kind: 'layers', layers: [{ kind: 'drum', voice: 'shaker', pattern: 'x.x.x.x.x.x.x.xx' }, { kind: 'drum', voice: 'tick', pitch: 1.6, pattern: 'x...x...x...x...' }] } },
            { id: 'wi_blizzard', name: 'Blizzard', type: 'effects', art: { body: 'wide', color: '#bcd7ee', eyes: 'sleepy', mouth: 'o' },
              synth: { kind: 'noise', lp: 3500, hp: 800, lfo: 1, depth: 0.6, amp: 0.6 } },
            { id: 'wi_icicle', name: 'Icicle', type: 'effects', art: { body: 'drop', color: '#9ee7ff', eyes: 'big', mouth: 'smile', acc: 'snowcap' },
              synth: { kind: 'tone', wave: 'sine', harm: 0.5, decays: true, d: 0.6, seq: [96, N, N, N, N, 91, N, N, N, N, N, N, 88, N, N, N] } },
            { id: 'wi_snowflake', name: 'Snowflake', type: 'melodies', art: { body: 'square', color: '#f1f6ff', eyes: 'happy', mouth: 'smile', acc: 'bow', accColor: '#6aaef0', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.3, decays: true, d: 0.5, seq: [79, N, 76, N, 72, N, 76, N, 79, N, 81, N, 79, N, 76, N] } },
            { id: 'wi_mitten', name: 'Mitten', type: 'melodies', art: { body: 'round', color: '#9fa8ff', eyes: 'dots', mouth: 'smile', acc: 'beanie', accColor: '#ff7ba8' },
              synth: { kind: 'tone', wave: 'tri', chord: [0, 4, 7], a: 0.15, d: 0.8, lp: 1200, seq: [[60, 8], N, N, N, N, N, N, N, [57, 8], N, N, N, N, N, N, N] } },
            { id: 'wi_carol', name: 'Carol', type: 'vocals', art: { body: 'ghost', color: '#dbe9ff', eyes: 'happy', mouth: 'open', acc: 'scarf', accColor: '#d94f4f' },
              synth: { kind: 'voice', seq: [[72, 'a', 2], N, [71, 'a', 2], N, [72, 'a', 4], N, N, N, [67, 'a', 2], N, [69, 'a', 2], N, [67, 'a', 4], N, N, N] } },
            { id: 'wi_hush', name: 'Hush', type: 'vocals', art: { body: 'drop', color: '#6f8fd8', eyes: 'sleepy', mouth: 'o', acc: 'snowcap' },
              synth: { kind: 'voice', seq: [[55, 'u', 4], N, N, N, [59, 'u', 4], N, N, N, [62, 'u', 4], N, N, N, [59, 'u', 4], N, N, N] } }
        ]
    });
})(window);
