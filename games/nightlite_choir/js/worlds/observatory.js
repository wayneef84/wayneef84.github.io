/* Star Observatory world. Data only: look is an art-generator spec, sound is a synth spec.
   80 BPM, every note is C major pentatonic (C D E G A), one job per creature: pad, bell, sweep, soft drum.
   midi: C3=48 G3=55 A2=45 G2=43 | C6=84 D6=86 E6=88 G6=91 A6=93 C7=96 */
(function (w) {
    var N = null;
    w.NightliteWorlds = w.NightliteWorlds || {};
    w.NightliteWorlds.observatory = {
        id: 'observatory', label: 'The Star Observatory', short: 'Star Observatory', chip: 'Observatory', icon: '🔭', bpm: 80,
        theme: { bg1: '#2a1f5c', bg2: '#0a0a28', panel: 'rgba(48, 36, 104, 0.84)', text: '#f6f0ff', accent: '#f4b6dc', slot: 'rgba(76, 60, 150, 0.72)', onaccent: '#2a1238' },
        glow: { count: 34, kind: 'stars' },
        chars: [
            { id: 'dozemoon', name: 'Dozemoon', role: 'pad',
              art: { body: 'moon', color: '#f0e6ff', eyes: 'sleepy', mouth: 'smile', acc: 'nightcap', accColor: '#f594c4', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', harm: 0.2, a: 0.9, d: 1.4, lp: 900, vib: 1, amp: 0.8, chord: [0, 7, 12],
                       seq: [[48, 8], N, N, N, N, N, N, N, [43, 8], N, N, N, N, N, N, N] } },
            { id: 'glintwand', name: 'Glintwand', role: 'bell',
              art: { body: 'star', color: '#ffb0d4', eyes: 'twinkle', mouth: 'smile', acc: 'wand', accColor: '#ffd9ee', acc2: 'sparkles', acc2Color: '#fff3b0', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.55, decays: true, a: 0.002, d: 2.2, amp: 0.5, chord: [0, 12],
                       seq: [84, 88, 91, 96, N, N, N, N, 93, N, 91, N, 88, 86, N, N] } },
            { id: 'twirltail', name: 'Twirltail', role: 'sweep',
              art: { body: 'comet', color: '#b79dff', eyes: 'happy', mouth: 'open', acc: 'swirl', accColor: '#ff9fcf' },
              synth: { kind: 'drum', voice: 'whoosh', pitch: 1, amp: 0.6, pattern: 'x.......X.......' } },
            { id: 'ringhum', name: 'Ringhum', role: 'drum',
              art: { body: 'planet', color: '#90b4f2', ring: '#ffc4e4', eyes: 'dots', mouth: 'hum', acc: 'cowhat', accColor: '#ff9ccb', cheeks: true },
              synth: { kind: 'drum', voice: 'thrum', pitch: 1, amp: 0.7, pattern: 'x.....x...x...x.' } }
        ]
    };
})(window);
