/* Memory Match - tiny synthesized blips (Web Audio). ES5. Unlocked by the first tap. Soft volume. */
var MMSound = (function () {
    'use strict';
    var ctx = null, master = null, VOL = 0.12;

    function make() {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (ctx || !AC) { return; }
        try {
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = VOL;
            master.connect(ctx.destination);
        } catch (e) { ctx = null; }
    }
    function unlock() {
        make();
        if (ctx && ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) { /* ignore */ } }
    }
    /* one soft note: freq in Hz, start offset and length in seconds */
    function blip(freq, at, len, type) {
        var o, g, t;
        if (!ctx || ctx.state === 'closed') { return; }
        t = ctx.currentTime + (at || 0);
        o = ctx.createOscillator(); g = ctx.createGain();
        o.type = type || 'sine';
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(1, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + len + 0.03);
    }
    return {
        unlock: unlock,
        flip: function () { unlock(); blip(520, 0, 0.09, 'sine'); },
        match: function () { unlock(); blip(660, 0, 0.14, 'sine'); blip(880, 0.1, 0.2, 'sine'); },
        win: function () {
            var n = [523, 659, 784, 1047], i;
            unlock();
            for (i = 0; i < n.length; i++) { blip(n[i], i * 0.14, 0.28, 'triangle'); }
            blip(1319, 0.6, 0.5, 'triangle');
        }
    };
}());
