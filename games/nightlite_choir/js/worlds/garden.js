/* Night Garden world. Data only: look is an art-generator spec, sound is a synth spec.
   90 BPM, every note is C major pentatonic (C D E G A), one job per creature.
   midi: C2=36 D2=38 E2=40 G2=43 A2=45 | C5=72 D5=74 E5=76 G5=79 A5=81 */
(function (w) {
    var N = null;
    w.NightliteWorlds = w.NightliteWorlds || {};
    w.NightliteWorlds.garden = {
        id: 'garden', label: 'The Night Garden', short: 'Night Garden', bpm: 90,
        theme: { bg1: '#14284a', bg2: '#08122a', panel: '#1a3354', text: '#eaf4de', accent: '#9bd27a', slot: '#21496a' },
        glow: { count: 16 },
        chars: [
            { id: 'mossle', name: 'Mossle', role: 'bass',
              art: { body: 'round', color: '#6b9b4d', eyes: 'sleepy', mouth: 'smile', acc: 'sprout', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.25, a: 0.12, d: 0.9, lp: 420, amp: 0.8,
                       seq: [[36, 6], N, N, N, N, N, [43, 2], N, [45, 6], N, N, N, N, N, [43, 2], N] } },
            { id: 'glimmow', name: 'Glimmow', role: 'chime',
              art: { body: 'ghost', color: '#ffe58a', eyes: 'big', mouth: 'o', acc: 'antenna', accColor: '#fff6c4' },
              synth: { kind: 'tone', wave: 'sine', harm: 0.18, decays: true, a: 0.006, d: 1.1, amp: 0.55,
                       seq: [76, N, N, 79, N, N, 81, N, 79, N, N, 74, N, 76, N, N] } },
            { id: 'puddlet', name: 'Puddlet', role: 'beat',
              art: { body: 'drop', color: '#5aaee8', eyes: 'happy', mouth: 'smile', acc: 'leaf', accColor: '#7fd6a0', cheeks: true },
              synth: { kind: 'drum', voice: 'drip', pitch: 1, amp: 0.6, pattern: 'x...x.x...x..x..' } },
            { id: 'hedgey', name: 'Hedgey', role: 'shaker',
              art: { body: 'bush', color: '#3f8a58', eyes: 'dots', mouth: 'smile', acc: 'firefly', accColor: '#ffe98a' },
              synth: { kind: 'drum', voice: 'rustle', amp: 0.45, pattern: '..x...x.x...x.x.' } }
        ]
    };
})(window);
