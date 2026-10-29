/* Toy Attic world. Data only: look is an art-generator spec, sound is a synth spec.
   100 BPM, every note is C major pentatonic (C D E G A), one job per creature: beat, pluck, tick, chime.
   midi: C4=60 D4=62 E4=64 G4=67 A4=69 | C6=84 D6=86 E6=88 G6=91 A6=93 */
(function (w) {
    var N = null;
    w.NightliteWorlds = w.NightliteWorlds || {};
    w.NightliteWorlds.attic = {
        id: 'attic', label: 'The Toy Attic', short: 'Toy Attic', chip: 'Attic', icon: '\uD83E\uDDF8', bpm: 100,
        theme: { bg1: '#6a4a36', bg2: '#35241b', panel: '#7d5a43', text: '#fff3e2', accent: '#f2b8c6', slot: '#8e6548', onaccent: '#3a2218' },
        glow: { count: 18, kind: 'dust' },
        chars: [
            { id: 'clopsy', name: 'Clopsy', role: 'beat',
              art: { body: 'pony', color: '#d9b48a', eyes: 'dots', mouth: 'smile', acc: 'mane', accColor: '#e59ab4', mark: 'star' },
              synth: { kind: 'drum', voice: 'clop', pitch: 1, amp: 0.7, pattern: 'x.x.xx..x.x.xx..' } },
            { id: 'skeinie', name: 'Skeinie', role: 'pluck',
              art: { body: 'doll', color: '#e8a5b4', eyes: 'button', mouth: 'stitch', acc: 'braids', accColor: '#d6a23c', cheeks: true, patch: '#9fd1b0' },
              synth: { kind: 'tone', wave: 'tri', harm: 0.35, decays: true, a: 0.003, d: 0.32, lp: 2600, amp: 0.7,
                       seq: [60, N, 64, N, 67, N, 64, 69, N, 67, N, 64, 62, N, 64, N] } },
            { id: 'tocklet', name: 'Cogwick', role: 'tick',
              art: { body: 'tin', color: '#8fb0bf', eyes: 'big', mouth: 'grille', acc: 'antenna', accColor: '#e8b25a', acc2: 'windkey' },
              synth: { kind: 'drum', voice: 'click', pitch: 1, amp: 0.55, pattern: 'x.x.x.x.x.x.X...' } },
            { id: 'mallowhorn', name: 'Fluffhorn', role: 'chime',
              art: { body: 'plush', color: '#f5e8d8', eyes: 'happy', mouth: 'smile', acc: 'horn', accColor: '#f0cf86', acc2: 'tuft', acc2Color: '#e89ab8', cheeks: true },
              synth: { kind: 'tone', wave: 'sine', harm: 0.3, decays: true, a: 0.004, d: 1.5, amp: 0.5,
                       seq: [84, N, 88, N, 91, N, N, N, 93, N, 91, N, 88, N, N, N] } }
        ]
    };
})(window);
