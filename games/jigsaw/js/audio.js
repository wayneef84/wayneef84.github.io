/**
 * F.O.N.G. Jigsaw - audio.js
 * Soft generated sounds (WebAudio, no files) and guarded haptics.
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw = root.FongJigsaw || {};
    var ctx = null;
    var soundOn = true, hapticsOn = true;
    var lastClick = 0;

    function getCtx() {
        if (ctx) { return ctx; }
        try {
            var AC = root.AudioContext || root.webkitAudioContext;
            if (AC) { ctx = new AC(); }
        } catch (e) { ctx = null; }
        return ctx;
    }

    /** Call from a user gesture so mobile browsers allow sound */
    function unlock() {
        var ac = getCtx();
        if (ac && ac.state === 'suspended' && ac.resume) { try { ac.resume(); } catch (e) {} }
    }

    function tone(freq, start, dur, vol, type) {
        var ac = getCtx();
        if (!ac) { return; }
        try {
            var t0 = ac.currentTime + start;
            var osc = ac.createOscillator(), gain = ac.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, t0);
            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
        } catch (e) {}
    }

    /** Soft click when pieces join; rises a little for bigger groups */
    function click(size) {
        if (!soundOn) { return; }
        var now = Date.now();
        if (now - lastClick < 60) { return; }
        lastClick = now;
        var base = 520 + Math.min(12, size || 1) * 18;
        tone(base, 0, 0.09, 0.07, 'sine');
        tone(base * 1.5, 0.045, 0.12, 0.05, 'triangle');
    }

    function chime() {
        if (!soundOn) { return; }
        var notes = [523.25, 659.25, 783.99, 1046.5], i;
        for (i = 0; i < notes.length; i++) { tone(notes[i], i * 0.13, 0.5, 0.06, 'sine'); }
    }

    function buzz(ms) {
        if (!hapticsOn) { return; }
        try { if (root.navigator && typeof root.navigator.vibrate === 'function') { root.navigator.vibrate(ms || 12); } } catch (e) {}
    }

    NS.Audio = {
        unlock: unlock,
        click: click,
        chime: chime,
        buzz: buzz,
        setSound: function (on) { soundOn = !!on; },
        setHaptics: function (on) { hapticsOn = !!on; }
    };
})(window);
