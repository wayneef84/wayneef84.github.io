/**
 * Sprunki v2 - tiny synth (ES5).
 * Turns a small "synth" spec from a pack config into a looping Float32Array.
 * Loop = 8 beats = 16 eighth-note steps. All sounds are soft (no hard clipping, short fades)
 * and wrap around the loop end so loops are seamless.
 *
 * Specs:
 *   {kind:'drum', voice:'kick|snare|hat|tick|clap|tom|shaker|pop|wood', pattern:'x...x...x...x...', pitch:1}
 *   {kind:'tone', wave:'sine|tri|square|saw', seq:[midi|null|[midi,lenSteps],... x16], a:0.01, d:0.4,
 *                 lp:3000, vib:0, amp:1, chord:[0,4,7]}
 *   {kind:'voice', seq:[[midi,'a|o|e|u',lenSteps]|null ... x16], amp:1}
 *   {kind:'noise', lp:900, hp:0, lfo:2, depth:0.7, drops:0, amp:1}
 *   {kind:'layers', layers:[spec,...]}
 */
(function (w) {
    var SR = 32000;
    var STEPS = 16;

    function mulberry(seed) {
        var a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            var t = a;
            t = Math.imul ? Math.imul(t ^ (t >>> 15), t | 1) : (t ^ (t >>> 15)) * (t | 1);
            t ^= t + (Math.imul ? Math.imul(t ^ (t >>> 7), t | 61) : (t ^ (t >>> 7)) * (t | 61));
            return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
        };
    }
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function osc(wave, ph) {
        var p = ph - Math.floor(ph);
        if (wave === 'tri') return 4 * Math.abs(p - 0.5) - 1;
        if (wave === 'square') return (p < 0.5 ? 0.6 : -0.6);
        if (wave === 'saw') return (2 * p - 1) * 0.7;
        return Math.sin(6.283185307 * p);
    }
    function addAt(buf, i, v) { buf[((i % buf.length) + buf.length) % buf.length] += v; }

    var FORMANTS = { a: [800, 1200], o: [450, 800], e: [400, 2000], u: [320, 800] };

    function renderDrum(spec, buf, stepLen, rnd) {
        var pat = spec.pattern || '';
        var pitch = spec.pitch || 1;
        for (var s = 0; s < STEPS; s++) {
            var ch = pat.charAt(s);
            if (ch !== 'x' && ch !== 'X') continue;
            var g = ch === 'X' ? 1 : 0.7;
            var start = Math.round(s * stepLen);
            var len = Math.round(SR * 0.4), n, t, e, v, ph = 0, lp = 0;
            for (n = 0; n < len; n++) {
                t = n / SR;
                v = 0;
                switch (spec.voice) {
                    case 'kick':
                        ph += (45 + 90 * Math.exp(-t * 28)) * pitch / SR;
                        v = Math.sin(6.283185307 * ph) * Math.exp(-t * 11);
                        break;
                    case 'tom':
                        ph += (110 + 70 * Math.exp(-t * 20)) * pitch / SR;
                        v = Math.sin(6.283185307 * ph) * Math.exp(-t * 9);
                        break;
                    case 'snare':
                        v = ((rnd() * 2 - 1) * Math.exp(-t * 22) * 0.6 + Math.sin(6.283185307 * 190 * pitch * t) * Math.exp(-t * 25) * 0.5);
                        break;
                    case 'clap':
                        v = (rnd() * 2 - 1) * Math.exp(-t * 28) * 0.7;
                        lp += (v - lp) * 0.5; v = lp;
                        break;
                    case 'hat':
                        v = (rnd() * 2 - 1); v = v - lp; lp += (v) * 0.2; v = v * Math.exp(-t * 70) * 0.35;
                        break;
                    case 'shaker':
                        v = (rnd() * 2 - 1); v = v - lp; lp += v * 0.3; v = v * Math.exp(-t * 35) * 0.4;
                        break;
                    case 'tick':
                        v = Math.sin(6.283185307 * 1700 * pitch * t) * Math.exp(-t * 80) * 0.5;
                        break;
                    case 'pop':
                        ph += (300 + 500 * (1 - Math.exp(-t * 40))) * pitch / SR;
                        v = Math.sin(6.283185307 * ph) * Math.exp(-t * 30) * 0.7;
                        break;
                    case 'wood':
                        v = (Math.sin(6.283185307 * 820 * pitch * t) + 0.5 * Math.sin(6.283185307 * 1330 * pitch * t)) * Math.exp(-t * 55) * 0.45;
                        break;
                    default:
                        v = 0;
                }
                // 2ms attack so nothing clicks
                e = n < 64 ? n / 64 : 1;
                addAt(buf, start + n, v * g * e);
            }
        }
    }

    function renderTone(spec, buf, stepLen) {
        var seq = spec.seq || [];
        var wave = spec.wave || 'sine';
        var a = spec.a === undefined ? 0.01 : spec.a;
        var d = spec.d === undefined ? 0.4 : spec.d;
        var chord = spec.chord || [0];
        var vib = spec.vib || 0;
        var harm = spec.harm || 0;
        for (var s = 0; s < seq.length; s++) {
            var ev = seq[s];
            if (ev === null || ev === undefined) continue;
            var midi = ev, steps = 1;
            if (ev instanceof Array) { midi = ev[0]; steps = ev[1] || 1; }
            var start = Math.round(s * stepLen);
            var hold = steps * stepLen / SR;
            var len = Math.round((hold + d * 2.5) * SR);
            for (var c = 0; c < chord.length; c++) {
                var f = hz(midi + chord[c]);
                var ph = 0, n, t, env, v;
                for (n = 0; n < len; n++) {
                    t = n / SR;
                    ph += f * (1 + (vib ? 0.004 * Math.sin(6.283185307 * 5 * t) : 0)) / SR;
                    env = t < a ? t / a : 1;
                    if (t > hold) env *= Math.exp(-(t - hold) / (d * 0.5));
                    else if (spec.decays) env *= Math.exp(-(t) / d);
                    v = osc(wave, ph);
                    if (harm) v += harm * Math.sin(6.283185307 * 2 * ph);
                    addAt(buf, start + n, v * env * 0.5 / chord.length);
                }
            }
        }
    }

    function renderVoice(spec, buf, stepLen) {
        var seq = spec.seq || [];
        for (var s = 0; s < seq.length; s++) {
            var ev = seq[s];
            if (!ev) continue;
            var f0 = hz(ev[0]), fm = FORMANTS[ev[1]] || FORMANTS.a, steps = ev[2] || 2;
            var start = Math.round(s * stepLen);
            var hold = steps * stepLen / SR;
            var len = Math.round((hold + 0.25) * SR);
            var harmonics = Math.min(14, Math.floor(3500 / f0));
            var n, t, env, v, k, fk, g, ph = 0;
            for (n = 0; n < len; n++) {
                t = n / SR;
                ph += f0 * (1 + 0.006 * Math.sin(6.283185307 * 5.2 * t)) / SR;
                env = t < 0.06 ? t / 0.06 : 1;
                if (t > hold) env *= Math.exp(-(t - hold) / 0.07);
                v = 0;
                for (k = 1; k <= harmonics; k++) {
                    fk = f0 * k;
                    g = Math.exp(-Math.pow((fk - fm[0]) / 350, 2)) + 0.6 * Math.exp(-Math.pow((fk - fm[1]) / 500, 2)) + 0.05;
                    v += g * Math.sin(6.283185307 * k * ph) / k;
                }
                addAt(buf, start + n, v * env * 0.45);
            }
        }
    }

    function renderNoise(spec, buf, rnd) {
        var n, lpA = 0, lpB = 0, v, x;
        var kLow = 1 - Math.exp(-6.283185307 * (spec.lp || 900) / SR);
        var kHigh = spec.hp ? 1 - Math.exp(-6.283185307 * spec.hp / SR) : 0;
        var lfo = spec.lfo || 1, depth = spec.depth === undefined ? 0.7 : spec.depth;
        for (n = 0; n < buf.length; n++) {
            x = rnd() * 2 - 1;
            lpA += (x - lpA) * kLow;
            v = lpA;
            if (kHigh) { lpB += (v - lpB) * kHigh; v = v - lpB; }
            v *= (1 - depth) + depth * (0.5 + 0.5 * Math.sin(6.283185307 * lfo * n / buf.length));
            buf[n] += v * 2.2;
        }
        var drops = spec.drops || 0, i, p, f, len, m, t;
        for (i = 0; i < drops; i++) {
            p = Math.floor(rnd() * buf.length);
            f = 900 + rnd() * 1800;
            len = Math.round(SR * 0.08);
            for (m = 0; m < len; m++) {
                t = m / SR;
                addAt(buf, p + m, Math.sin(6.283185307 * f * t) * Math.exp(-t * 60) * 0.25);
            }
        }
    }

    function renderInto(spec, buf, rnd) {
        var stepLen = buf.length / STEPS;
        var i;
        if (spec.kind === 'layers') {
            for (i = 0; i < spec.layers.length; i++) renderInto(spec.layers[i], buf, rnd);
            return;
        }
        if (spec.kind === 'drum') renderDrum(spec, buf, stepLen, rnd);
        else if (spec.kind === 'tone') renderTone(spec, buf, stepLen);
        else if (spec.kind === 'voice') renderVoice(spec, buf, stepLen);
        else if (spec.kind === 'noise') renderNoise(spec, buf, rnd);
    }

    /** Returns {data: Float32Array, rate: SR}. bpm sets loop length (8 beats). */
    function render(spec, bpm, seed) {
        var len = Math.round(SR * 8 * 60 / (bpm || 100));
        var buf = new Float32Array(len);
        var rnd = mulberry(seed || 1);
        renderInto(spec, buf, rnd);
        // optional one-pole low-pass for warmth
        if (spec.lp && spec.kind !== 'noise') {
            var k = 1 - Math.exp(-6.283185307 * spec.lp / SR), y = 0, i;
            for (i = 0; i < len; i++) { y += (buf[i] - y) * k; buf[i] = y; }
        }
        // normalise to a gentle peak and soft-limit
        var peak = 0, j;
        for (j = 0; j < len; j++) { var a = Math.abs(buf[j]); if (a > peak) peak = a; }
        var target = 0.55 * (spec.amp || 1);
        var gain = peak > 0 ? target / peak : 1;
        for (j = 0; j < len; j++) {
            var x = buf[j] * gain;
            buf[j] = x / (1 + Math.abs(x) * 0.3);
        }
        // tiny edge fades
        var fade = 48;
        for (j = 0; j < fade; j++) { buf[j] *= j / fade; buf[len - 1 - j] *= j / fade; }
        return { data: buf, rate: SR };
    }

    w.SprunkiSynth = { render: render, SR: SR };
})(window);
