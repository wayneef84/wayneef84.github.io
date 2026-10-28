/* Aqua pack: water and ocean friends. Slower and floaty (92 BPM). Data only: look and sound are specs. */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'aqua', order: 6, label: 'Aqua', icon: '🌊', color: '#0aa5b8',
        theme: { bg1: '#8fe3f2', bg2: '#2a7fc4', panel: '#e9fbff', text: '#0b3350', accent: '#0a8fb0', slot: '#ffffff' },
        fx: { emoji: '🫧', count: 14, dir: 'rise' },
        bpm: 92,
        chars: [
            { id: 'aq_bubbo', name: 'Bubbo', type: 'beats', art: { body: 'round', color: '#9fe8ff', eyes: 'big', mouth: 'o', acc: 'bow', accColor: '#ffffff' },
              synth: { kind: 'drum', voice: 'pop', pitch: 0.8, pattern: 'x.x..x.xx..x.x..' } },
            { id: 'aq_splish', name: 'Splish', type: 'beats', art: { body: 'drop', color: '#4aa8ff', eyes: 'happy', mouth: 'grin', acc: 'wings', accColor: '#2a7fc4' },
              synth: { kind: 'drum', voice: 'tom', pitch: 0.7, pattern: 'x...x..xx...x...' } },
            { id: 'aq_wavy', name: 'Wavy', type: 'effects', art: { body: 'wide', color: '#5fd0d6', eyes: 'sleepy', mouth: 'smile', acc: 'leaf', accColor: '#1fa78a' },
              synth: { kind: 'noise', lp: 700, hp: 80, lfo: 1, depth: 0.9, amp: 0.8 } },
            { id: 'aq_drippy', name: 'Drippy', type: 'effects', art: { body: 'drop', color: '#b5f0ff', eyes: 'dots', mouth: 'o', acc: 'sprout' },
              synth: { kind: 'noise', lp: 300, hp: 60, lfo: 2, depth: 0.5, drops: 14, amp: 0.7 } },
            { id: 'aq_coral', name: 'Coral', type: 'melodies', art: { body: 'tall', color: '#ff9b8a', eyes: 'happy', mouth: 'smile', acc: 'flower', accColor: '#ffd1c4', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.25, decays: true, d: 1.0, chord: [0, 7], seq: [62, N, N, N, 69, N, N, N, 66, N, N, N, 64, N, 66, N] } },
            { id: 'aq_pearl', name: 'Pearl', type: 'melodies', art: { body: 'round', color: '#f4eefc', eyes: 'big', mouth: 'smile', acc: 'bow', accColor: '#c8a8ff' },
              synth: { kind: 'tone', wave: 'tri', vib: 1, decays: true, d: 0.7, seq: [85, N, 88, 90, N, 88, N, 85, 83, N, 85, N, 88, N, N, N] } },
            { id: 'aq_wally', name: 'Wally', type: 'vocals', art: { body: 'wide', color: '#5b86d6', eyes: 'sleepy', mouth: 'o', acc: 'wings', accColor: '#3a5fb0' },
              synth: { kind: 'voice', seq: [[50, 'o', 6], N, N, N, N, N, [53, 'o', 6], N, N, N, N, N, [48, 'u', 4], N, N, N] } },
            { id: 'aq_marina', name: 'Marina', type: 'vocals', art: { body: 'tall', color: '#7fe0b8', eyes: 'happy', mouth: 'open', acc: 'bow', accColor: '#ff7bb0', cheeks: true },
              synth: { kind: 'voice', seq: [[69, 'e', 2], N, [71, 'e', 2], N, [74, 'a', 4], N, N, N, [71, 'e', 2], N, [69, 'o', 6], N, N, N, N, N] } }
        ]
    });
})(window);
