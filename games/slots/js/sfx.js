/**
 * Slots sound effects, synthesized with the Web Audio API. No audio files, no
 * music, nothing plays before the first tap. Every call is wrapped so a
 * blocked or missing audio system never breaks the game.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var ctx = null;
    var muted = false;
    var broken = false;

    function ensure() {
        if (broken || ctx) { return ctx; }
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) { broken = true; return null; }
            ctx = new AC();
        } catch (e) {
            broken = true;
            ctx = null;
        }
        return ctx;
    }

    function tone(freq, dur, type, vol, delay, slideTo) {
        var c = ctx;
        if (!c) { return; }
        try {
            var t0 = c.currentTime + (delay || 0);
            var osc = c.createOscillator();
            var g = c.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, t0);
            if (slideTo) { osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur); }
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(g);
            g.connect(c.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
        } catch (e) { /* ignore */ }
    }

    var SOUNDS = {
        click: function () { tone(660, 0.06, 'triangle', 0.06); },
        lever: function () { tone(220, 0.25, 'sawtooth', 0.04, 0, 90); },
        spin: function () { tone(300, 0.5, 'triangle', 0.025, 0, 520); },
        stop: function () { tone(140, 0.12, 'sine', 0.1, 0, 60); },
        pop: function () { tone(520, 0.08, 'sine', 0.07, 0, 880); },
        flip: function () { tone(400, 0.1, 'triangle', 0.06, 0, 700); },
        win: function () { tone(523, 0.14, 'triangle', 0.07, 0); tone(659, 0.14, 'triangle', 0.07, 0.12); tone(784, 0.2, 'triangle', 0.07, 0.24); },
        big: function () {
            tone(523, 0.14, 'triangle', 0.08, 0); tone(659, 0.14, 'triangle', 0.08, 0.12);
            tone(784, 0.14, 'triangle', 0.08, 0.24); tone(1047, 0.35, 'triangle', 0.08, 0.36);
        },
        bonus: function () { tone(392, 0.12, 'square', 0.04, 0); tone(523, 0.12, 'square', 0.04, 0.1); tone(784, 0.25, 'square', 0.04, 0.2); },
        soft: function () { tone(330, 0.18, 'sine', 0.05, 0, 262); }
    };

    S.sfx = {
        /** Call from a tap or key press. Safe to call many times. */
        unlock: function () {
            var c = ensure();
            if (c && c.state === 'suspended') {
                try { var p = c.resume(); if (p && p.catch) { p.catch(function () { broken = true; }); } } catch (e) { /* ignore */ }
            }
        },
        play: function (name) {
            if (muted || broken || !ctx) { return; }
            if (SOUNDS[name]) { SOUNDS[name](); }
        },
        setMuted: function (m) { muted = !!m; },
        isMuted: function () { return muted; }
    };
}());
