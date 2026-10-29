/* Bubblegum Pop pack: a pink pop-star trio with glow lightsticks, a unicorn, a bubblegum-machine robot and friends.
   Sweet and sparkly (104 BPM). Loops stay on C major pentatonic (C D E G A) so they blend with the other packs.
   Data only: look and sound are specs. */
(function (w) {
    var N = null;
    w.SprunkiV2Packs = w.SprunkiV2Packs || [];
    w.SprunkiV2Packs.push({
        id: 'bubblegum', order: 10, label: 'Bubblegum Pop', icon: '🦄', color: '#ff4fa3',
        theme: { bg1: '#ffe6f3', bg2: '#ffa9d6', panel: '#fff5fa', text: '#5a1a45', accent: '#ff4fa3', slot: '#ffffff' },
        fx: { emoji: '💗', count: 12, dir: 'rise' },
        bpm: 104,
        chars: [
            // Beat: heart-shaped drummer, kick plus clap
            { id: 'bg_lubby', name: 'Lubby', type: 'beats', art: { body: 'heart', color: '#ff6fae', eyes: 'happy', mouth: 'grin', acc: 'sparkle', accColor: '#ffffff', cheeks: true },
              synth: { kind: 'layers', layers: [
                  { kind: 'drum', voice: 'kick', pitch: 1.05, pattern: 'x..x....x..x.x..' },
                  { kind: 'drum', voice: 'clap', pattern: '..x...x...x...x.' } ] } },
            // Beat: glitter cat, offbeat hats with a few bright plucks
            { id: 'bg_glittens', name: 'Glittens', type: 'beats', art: { body: 'round', color: '#ffc2dd', eyes: 'big', mouth: 'smile', acc: 'ears', accColor: '#ff8cbf', cheeks: true },
              synth: { kind: 'layers', layers: [
                  { kind: 'drum', voice: 'hat', pattern: '.x.x.x.x.x.x.x.x' },
                  { kind: 'tone', wave: 'tri', decays: true, d: 0.12, amp: 0.8, seq: [91, N, N, 88, N, N, 93, N, 91, N, N, 88, N, 84, N, N] } ] } },
            // Effect: glow-stick sparkle chime (high bell notes and tiny twinkles)
            { id: 'bg_starlie', name: 'Starlie', type: 'effects', art: { body: 'tall', color: '#ff7eb6', eyes: 'happy', mouth: 'open', acc: 'lightstick', accColor: '#c9a8ff', cheeks: true },
              synth: { kind: 'layers', layers: [
                  { kind: 'tone', wave: 'sine', harm: 0.7, decays: true, d: 0.9, chord: [0, 12], seq: [91, N, N, N, N, 96, N, N, 88, N, N, 93, N, N, N, N] },
                  { kind: 'noise', lp: 9000, hp: 5000, lfo: 3, depth: 0.9, drops: 22, amp: 0.5 } ] } },
            // Effect: soft airy bubble sweep
            { id: 'bg_swooshie', name: 'Swooshie', type: 'effects', art: { body: 'round', color: '#ffd9ec', eyes: 'sleepy', mouth: 'o', acc: 'sparkle', accColor: '#ff7eb6' },
              synth: { kind: 'noise', lp: 4500, hp: 1200, lfo: 2, depth: 1, drops: 8, amp: 0.6 } },
            // Melody: bubblegum-machine robot, round bouncy bass
            { id: 'bg_gumzy', name: 'Gumzy', type: 'melodies', art: { body: 'square', color: '#ff93c4', eyes: 'dots', mouth: 'smile', acc: 'gumball', accColor: '#ff5fa2' },
              synth: { kind: 'tone', wave: 'tri', harm: 0.45, lp: 650, decays: true, d: 0.4, seq: [[36, 2], N, [36, 1], [43, 1], [45, 2], N, [43, 2], N, [41, 2], N, [41, 1], [43, 1], [40, 2], N, [43, 2], N] } },
            // Melody: unicorn, flowing pastel bell tune
            { id: 'bg_lilacorn', name: 'Lilacorn', type: 'melodies', art: { body: 'round', color: '#f3e4ff', eyes: 'big', mouth: 'smile', acc: 'horn', accColor: '#ff9bd0', cheeks: true },
              synth: { kind: 'tone', wave: 'tri', vib: 1, a: 0.02, decays: true, d: 0.6, chord: [0, 12], seq: [81, N, 79, N, 76, 79, N, 76, 72, N, 74, N, 76, N, N, N] } },
            // Voice: pop hook sung with bright "eh" and "ah"
            { id: 'bg_dazzi', name: 'Dazzi', type: 'vocals', art: { body: 'tall', color: '#ff5fa2', eyes: 'happy', mouth: 'open', acc: 'lightstick', accColor: '#a8f0d0', cheeks: true },
              synth: { kind: 'voice', seq: [[76, 'e', 1], N, [79, 'e', 1], N, [81, 'a', 2], N, [79, 'e', 1], N, [76, 'e', 1], N, [72, 'o', 2], N, [74, 'e', 1], N, [76, 'a', 2], N] } },
            // Voice: soft three-part "ooh" pad, C then Am
            { id: 'bg_honeyoo', name: 'Honeyoo', type: 'vocals', art: { body: 'tall', color: '#ffa6cf', eyes: 'sleepy', mouth: 'o', acc: 'lightstick', accColor: '#ffe08a', cheeks: true },
              synth: { kind: 'layers', amp: 0.9, layers: [
                  { kind: 'voice', seq: [[67, 'o', 8], N, N, N, N, N, N, N, [69, 'o', 8], N, N, N, N, N, N, N] },
                  { kind: 'voice', seq: [[64, 'u', 8], N, N, N, N, N, N, N, [64, 'u', 8], N, N, N, N, N, N, N] },
                  { kind: 'voice', seq: [[60, 'o', 8], N, N, N, N, N, N, N, [57, 'o', 8], N, N, N, N, N, N, N] } ] } }
        ]
    });
})(window);
