/**
 * Nightlite Choir+ - app logic (strict ES5, no libraries, works from file://).
 * Engine forked from the S4K Mixer v2 app (tray, drag, undo, save, volume, audio context), adapted here.
 * Two screens: the door screen (world select) and a world (Night Garden, Toy Attic or Star Observatory).
 * Worlds register themselves in window.NightliteWorlds (see js/worlds/*.js).
 * One shared stage: creatures from all three worlds can stand on it. Tempo comes from the first creature placed.
 * Milestone 3: free sparks, eggs in a nest, a Mixing pot, a Discovery book and 6 blend creatures (js/worlds/blends.js).
 */
(function (w) {
    var d = document;
    var SLOTS = 6;
    var MASTER_CAP = 0.6;          // slider 100% = this gain at most: nothing sudden or loud
    var FADE_IN = 0.35;            // seconds. Creatures fade in softly on the next bar line.

    var DOORS = [
        { id: 'garden', name: 'The Night Garden', where: 'the window', c1: '#1d4a62', c2: '#14305a', acc: '#9bd27a', art: 'window' },
        { id: 'attic', name: 'The Toy Attic', where: 'the hatch', c1: '#6a4a3a', c2: '#3e2f4a', acc: '#e0b27a', art: 'hatch' },
        { id: 'observatory', name: 'The Star Observatory', where: 'the skylight', c1: '#3a3070', c2: '#1a1a48', acc: '#b9a8ff', art: 'skylight' }
    ];

    // Sparks: a free in-game number. Nothing is bought, nothing can be missed or lost.
    var SPARK_CAP = 99;            // the jar holds at most 99
    var SPARK_EVERY = 15;          // +1 spark per 15 seconds of real play (2+ friends on the stage, page visible)
    var WISH_GIVES = 3;            // "Wish on a star": free at any time, no timer
    var EGG_COST = 5;              // an egg costs 5 sparks
    var HATCH_SECS = 20;           // an egg hatches in about 20 seconds of looking at the game
    var WARM_SHAVE = 2;            // each tap on the egg warms it: 2 seconds off
    var SAVE_VERSION = 4;
    var DATA_KEY = 'nightlite.save';

    var S = { world: null, slots: [], vol: 0.7, muted: false, screen: 'doors', bpm: 90,
              sparks: 0, owned: {}, found: {}, nest: null, playSecs: 0,
              view: 'garden', back: [], pot: [null, null], reveal: null };
    var history = [];
    var ctx = null, mix = null, master = null;
    var voices = {};            // slot index -> { src, gain }
    var buffers = {};           // creature id -> AudioBuffer
    var t0 = null;              // transport start time
    var toastTimer = null, drag = null, suppressClick = false, memMix = null;
    var charById = {};
    var blendById = {};         // blend id -> creature
    var recipeByKey = {};       // 'parentA+parentB' (sorted) -> blend id
    var WORLD_ORDER = ['garden', 'attic', 'observatory'];

    function $(id) { return d.getElementById(id); }
    function el(tag, cls, text) {
        var e = d.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
    }
    function store(key, val) {
        try {
            if (val === undefined) return w.localStorage.getItem(key);
            w.localStorage.setItem(key, val);
        } catch (e) { return null; }
        return null;
    }

    // ---------------------------------------------------------------- progress save (sparks, blends, recipes, nest)
    // One JSON under nightlite.save: { v, sparks, blends: [ids], found: ['a+b', ...], nest: { left } | null }.
    // Older v0.1.0 to v0.3.0 saves have no such key and simply start with zero sparks. Storage blocked: everything stays in memory.
    function recipeKey(a, b) { return a < b ? a + '+' + b : b + '+' + a; }
    function ownedList() {
        var out = [], k;
        for (k in S.owned) if (S.owned.hasOwnProperty(k) && S.owned[k]) out.push(k);
        return out;
    }
    function foundList() {
        var out = [], k;
        for (k in S.found) if (S.found.hasOwnProperty(k) && S.found[k]) out.push(k);
        return out;
    }
    function saveProgress() {
        var data = { v: SAVE_VERSION, sparks: S.sparks, blends: ownedList(), found: foundList(),
                     nest: S.nest ? { left: Math.round(S.nest.left * 10) / 10 } : null };
        store(DATA_KEY, JSON.stringify(data));
    }
    function loadProgress() {
        var raw = store(DATA_KEY), data = null, i, id, key, n;
        if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
        if (!data || typeof data !== 'object') return;
        n = parseInt(data.sparks, 10);
        S.sparks = (n >= 0) ? Math.min(SPARK_CAP, n) : 0;
        if (data.blends instanceof Array) {
            for (i = 0; i < data.blends.length; i++) if (blendById[data.blends[i]]) S.owned[data.blends[i]] = true;
        }
        if (data.found instanceof Array) {
            for (i = 0; i < data.found.length; i++) {
                key = data.found[i];
                id = recipeByKey[key];
                if (id) { S.found[key] = true; S.owned[id] = true; }     // a found recipe always means the blend is owned
            }
        }
        if (data.nest && typeof data.nest === 'object') {
            n = parseFloat(data.nest.left);
            S.nest = { left: (n >= 0 && n <= HATCH_SECS) ? n : HATCH_SECS };
        }
    }

    // ---------------------------------------------------------------- sparks
    function updateSparkUI() {
        var nodes = d.querySelectorAll('[data-spark]'), i;
        for (i = 0; i < nodes.length; i++) nodes[i].textContent = String(S.sparks);
        var pills = d.querySelectorAll('.sparkpill');
        for (i = 0; i < pills.length; i++) pills[i].setAttribute('aria-label', S.sparks + ' sparks');
    }
    function addSparks(n) {
        var before = S.sparks;
        S.sparks = Math.max(0, Math.min(SPARK_CAP, S.sparks + n));
        if (S.sparks !== before) { updateSparkUI(); saveProgress(); }
        return S.sparks - before;
    }
    function pulseSparks() {
        var pills = d.querySelectorAll('.sparkpill'), i;
        for (i = 0; i < pills.length; i++) {
            (function (p) { p.classList.remove('pulse'); void p.offsetWidth; p.classList.add('pulse'); })(pills[i]);
        }
    }
    function wish() {
        ensureCtx();
        var got = addSparks(WISH_GIVES);
        pulseSparks();
        if (got > 0) { toast('You wished on a star. +' + got + ' sparks!'); chime([84, 88, 91]); }
        else toast('Your spark jar is full. Time to make an egg or mix a pair!');
    }
    function stageCount() {
        var i, n = 0;
        for (i = 0; i < SLOTS; i++) if (S.slots[i]) n++;
        return n;
    }
    // Called once a second with the seconds that really passed (at most 2). Sparks only trickle in while the child is
    // actually playing: a world screen, at least two friends on the stage, page visible. Nothing happens in the background.
    function tick(dt) {
        if (d.hidden) return;
        var changed = false;
        if (S.screen === 'world' && stageCount() >= 2 && S.sparks < SPARK_CAP) {
            S.playSecs += dt;
            while (S.playSecs >= SPARK_EVERY && S.sparks < SPARK_CAP) {
                S.playSecs -= SPARK_EVERY;
                S.sparks++;
                changed = true;
            }
            if (S.sparks >= SPARK_CAP) S.playSecs = 0;
        }
        if (changed) { updateSparkUI(); pulseSparks(); saveProgress(); }
        if (S.nest) nestTick(dt);
    }
    function nestTick(dt) { }

    // ---------------------------------------------------------------- audio
    function barLen() { return 8 * 60 / S.bpm; }
    function ensureCtx() {
        if (!ctx) {
            var AC = w.AudioContext || w.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            mix = ctx.createGain();
            var comp = ctx.createDynamicsCompressor();
            master = ctx.createGain();
            mix.connect(comp); comp.connect(master); master.connect(ctx.destination);
            applyVolume(true);
        }
        if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
        return ctx;
    }
    function applyVolume(instant) {
        if (!ctx) return;
        var v = S.muted ? 0 : S.vol * MASTER_CAP;
        if (instant) master.gain.value = v; else master.gain.setTargetAtTime(v, ctx.currentTime, 0.04);
    }
    function hashSeed(s) {
        var h = 7, i;
        for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003;
        return h + 1;
    }
    function getBuffer(ch, cb) {
        var key = ch.id + '@' + S.bpm;
        if (buffers[key]) { cb(buffers[key]); return; }
        var r = w.NightliteSynth.render(ch.synth, S.bpm, hashSeed(ch.id));
        var b = ctx.createBuffer(1, r.data.length, r.rate);
        b.getChannelData(0).set(r.data);
        buffers[key] = b;
        cb(b);
    }
    function anyVoice() {
        var k;
        for (k in voices) if (voices.hasOwnProperty(k)) return true;
        return false;
    }
    function nextBoundary() {
        var now = ctx.currentTime, L = barLen();
        if (t0 === null || !anyVoice()) { t0 = now + 0.06; return t0; }
        var n = Math.ceil((now - t0) / L), when = t0 + n * L;
        if (when - now < 0.04) when += L;
        return when;
    }
    function stopVoice(i) {
        var v = voices[i];
        if (!v) return;
        delete voices[i];
        try {
            var t = ctx.currentTime;
            v.gain.gain.cancelScheduledValues(t);
            v.gain.gain.setTargetAtTime(0, t, 0.05);
            v.src.stop(t + 0.4);
        } catch (e) {}
    }
    function startVoice(i) {
        var id = S.slots[i];
        if (!id || !ensureCtx()) return;
        var ch = charById[id];
        getBuffer(ch, function (buf) {
            if (!buf || S.slots[i] !== id) return;
            stopVoice(i);
            var src = ctx.createBufferSource(), g = ctx.createGain();
            src.buffer = buf;
            src.loop = true;
            src.connect(g); g.connect(mix);
            var when = nextBoundary();
            g.gain.setValueAtTime(0, when);
            g.gain.linearRampToValueAtTime(1, when + FADE_IN);
            src.start(when);
            voices[i] = { src: src, gain: g };
        });
    }
    function stopAllVoices() {
        var k;
        for (k in voices) if (voices.hasOwnProperty(k)) stopVoice(k);
        t0 = null;
    }

    // A tiny happy twinkle for wishes, hatching and the pot (pentatonic notes, soft, goes through the same master volume).
    function chime(notes) {
        if (!ensureCtx()) return;
        try {
            var t = ctx.currentTime + 0.02, i, o, g;
            for (i = 0; i < notes.length; i++) {
                o = ctx.createOscillator(); g = ctx.createGain();
                o.type = 'sine';
                o.frequency.value = 440 * Math.pow(2, (notes[i] - 69) / 12);
                g.gain.setValueAtTime(0, t + i * 0.11);
                g.gain.linearRampToValueAtTime(0.22, t + i * 0.11 + 0.01);
                g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.11 + 0.7);
                o.connect(g); g.connect(mix);
                o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.8);
            }
        } catch (e) {}
    }

    // ---------------------------------------------------------------- stage
    function imgSrc(ch) { return w.NightliteArt.dataUri(w.NightliteArt.make(ch.art, false)); }
    function onStageIdx(id) {
        var i;
        for (i = 0; i < SLOTS; i++) if (S.slots[i] === id) return i;
        return -1;
    }
    function firstEmpty() {
        var i;
        for (i = 0; i < SLOTS; i++) if (!S.slots[i]) return i;
        return -1;
    }
    function renderStage() {
        var st = $('stage'), i;
        st.innerHTML = '';
        for (i = 0; i < SLOTS; i++) {
            (function (idx) {
                var id = S.slots[idx], ch = id ? charById[id] : null;
                var b = el('button', 'slot' + (ch ? ' on' : ''));
                b.type = 'button';
                b.setAttribute('data-slot', idx);
                if (ch) {
                    var im = el('img');
                    im.src = imgSrc(ch); im.alt = ch.name; im.draggable = false;
                    b.appendChild(im);
                    b.appendChild(el('span', 'nm', ch.name));
                    b.appendChild(el('span', 'x', '×'));
                    b.setAttribute('aria-label', ch.name + ' on spot ' + (idx + 1) + '. Tap to remove.');
                } else {
                    b.appendChild(el('span', 'plus', '+'));
                    b.setAttribute('aria-label', 'Empty spot ' + (idx + 1));
                }
                b.onclick = function () { if (S.slots[idx]) removeAt(idx); };
                st.appendChild(b);
            })(i);
        }
        drawConstellation();
    }
    // Observatory only: soft lines join the filled slots like a star map. Decoration, never receives taps.
    var SVGNS = 'http://www.w3.org/2000/svg';
    function svgEl(tag, attrs) {
        var e = d.createElementNS(SVGNS, tag), k;
        for (k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
        return e;
    }
    function drawConstellation() {
        var st = $('stage'), old = st.querySelector('.stars-map'), i, pts = [], sr, r, svg, a, b, dx, dy, len, ux, uy, cols = ['#f7bde0', '#cdbcff'];
        if (old) st.removeChild(old);
        if (!S.world || S.world.id !== 'observatory') return;
        sr = st.getBoundingClientRect();
        if (!sr.width) return;
        var slots = st.querySelectorAll('.slot');
        for (i = 0; i < slots.length; i++) {
            if (!S.slots[i]) continue;
            r = slots[i].getBoundingClientRect();
            pts.push({ x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 });
        }
        if (!pts.length) return;
        svg = svgEl('svg', { 'class': 'stars-map', width: sr.width, height: sr.height, viewBox: '0 0 ' + sr.width + ' ' + sr.height, 'aria-hidden': 'true', focusable: 'false' });
        for (i = 0; i + 1 < pts.length; i++) {
            a = pts[i]; b = pts[i + 1];
            dx = b.x - a.x; dy = b.y - a.y; len = Math.sqrt(dx * dx + dy * dy) || 1;
            ux = dx / len; uy = dy / len;
            svg.appendChild(svgEl('line', { x1: a.x + ux * 14, y1: a.y + uy * 14, x2: b.x - ux * 14, y2: b.y - uy * 14, stroke: cols[i % 2], 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-dasharray': '2 7', opacity: 0.9 }));
            svg.appendChild(svgEl('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: cols[i % 2], 'stroke-width': 1, opacity: 0.35 }));
        }
        for (i = 0; i < pts.length; i++) {
            svg.appendChild(svgEl('circle', { cx: pts[i].x, cy: pts[i].y - 40 + (i % 2) * 6, r: 3.2, fill: cols[i % 2], 'class': 'tw' }));
        }
        st.appendChild(svg);
    }
    function renderChips() {
        var box = $('worldChips'), i;
        box.innerHTML = '';
        for (i = 0; i < WORLD_ORDER.length; i++) {
            (function (wd) {
                if (!wd) return;
                var on = (wd.id === S.view);
                var b = el('button', 'chip' + (on ? ' on' : ''));
                b.type = 'button';
                b.id = 'chip-' + wd.id;
                b.appendChild(el('span', 'ci', wd.icon || ''));
                b.appendChild(el('span', 'cn', wd.chip || wd.short));
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
                b.setAttribute('aria-label', 'Show friends from ' + wd.label);
                b.onclick = function () { if (wd.id !== S.view) setWorldView(wd); };
                box.appendChild(b);
            })(w.NightliteWorlds[WORLD_ORDER[i]]);
        }
        var bb = el('button', 'chip' + (S.view === 'blends' ? ' on' : ''));
        bb.type = 'button';
        bb.id = 'chip-blends';
        bb.appendChild(el('span', 'ci', w.NightliteBlends.icon));
        bb.appendChild(el('span', 'cn', w.NightliteBlends.chip));
        bb.setAttribute('aria-pressed', S.view === 'blends' ? 'true' : 'false');
        bb.setAttribute('aria-label', 'Show your blend friends');
        bb.onclick = function () { if (S.view !== 'blends') { S.view = 'blends'; renderTiles(); } };
        box.appendChild(bb);
    }
    // The friends shown in the tray: the shown world's four, or the blends you own
    function viewList() {
        if (S.view === 'blends') return ownedBlendChars();
        return S.world.chars;
    }
    function ownedBlendChars() {
        var out = [], i, bl = w.NightliteBlends.chars;
        for (i = 0; i < bl.length; i++) if (S.owned[bl[i].id]) out.push(bl[i]);
        return out;
    }
    function renderTiles() {
        var box = $('tiles'), list = viewList(), isBl = (S.view === 'blends'), note = $('trayNote');
        renderChips();
        box.className = 'tiles' + (isBl ? ' six' : '');
        fillTiles(box, list, 1);
        if (isBl && !list.length) {
            note.textContent = 'Blends you find show up here. Try the Mixing pot or an egg!';
            note.hidden = false;
        } else { note.hidden = true; }
    }
    function fillTiles(box, list, firstNum) {
        var i;
        box.innerHTML = '';
        for (i = 0; i < list.length; i++) {
            (function (ch, num) {
                var used = onStageIdx(ch.id) >= 0;
                var b = el('button', 'tile' + (used ? ' used' : ''));
                b.type = 'button';
                b.id = 'tile-' + ch.id;
                var im = el('img');
                im.src = imgSrc(ch); im.alt = ''; im.draggable = false;
                b.appendChild(im);
                b.appendChild(el('span', 'nm', ch.name));
                b.appendChild(el('span', 'key', String(num)));
                b.setAttribute('aria-pressed', used ? 'true' : 'false');
                b.setAttribute('aria-label', ch.name + (used ? ', on stage. Tap to remove.' : '. Tap to add.'));
                b.onclick = function () {
                    if (suppressClick) return;
                    tileAction(ch);
                };
                bindDrag(b, ch);
                box.appendChild(b);
            })(list[i], firstNum + i);
        }
    }
    function tileAction(ch) {
        var idx = onStageIdx(ch.id);
        if (idx >= 0) removeAt(idx); else addChar(ch);
    }
    function afterChange() { renderStage(); renderTiles(); updateButtons(); }

    // ---------------------------------------------------------------- history / actions
    function snapshot() { return { v: SAVE_VERSION, world: S.world.id, bpm: S.bpm, slots: S.slots.slice(0, SLOTS) }; }
    function setBpm(b) {
        S.bpm = b;
        d.documentElement.style.setProperty('--beat', (60 / b) + 's');
    }
    function pushHistory() {
        history.push(snapshot());
        if (history.length > 40) history.shift();
        updateButtons();
    }
    function updateButtons() { $('undoBtn').disabled = history.length === 0; }

    function addChar(ch, slotIdx) {
        if (onStageIdx(ch.id) >= 0) return;
        if (ch.isBlend && !S.owned[ch.id]) return;
        var idx = (slotIdx === undefined || slotIdx === null) ? firstEmpty() : slotIdx;
        if (idx < 0) {
            var st = $('stage'); st.classList.add('shake');
            w.setTimeout(function () { st.classList.remove('shake'); }, 400);
            toast('The stage is full. Tap a friend to send them home.');
            return;
        }
        ensureCtx();
        pushHistory();
        if (!firstFilled()) setBpm(ch.bpm);     // stage tempo comes from the first creature placed
        if (S.slots[idx]) stopVoice(idx);
        S.slots[idx] = ch.id;
        afterChange();
        startVoice(idx);
    }
    function removeAt(idx) {
        if (!S.slots[idx]) return;
        pushHistory();
        stopVoice(idx);
        S.slots[idx] = null;
        if (!anyVoice()) t0 = null;
        afterChange();
    }
    function clearAll() {
        if (!firstFilled()) { toast('The stage is already empty.'); return; }
        pushHistory();
        stopAllVoices();
        S.slots = [];
        afterChange();
        toast('Stage cleared. Tap Undo to bring it back.');
    }
    function firstFilled() {
        var i;
        for (i = 0; i < SLOTS; i++) if (S.slots[i]) return true;
        return false;
    }
    function restore(snap) {
        stopAllVoices();
        S.slots = snap.slots.slice();
        setBpm(snap.bpm > 0 ? snap.bpm : S.world.bpm);
        afterChange();
        var i;
        for (i = 0; i < SLOTS; i++) if (S.slots[i] && charById[S.slots[i]]) startVoice(i); else S.slots[i] = null;
    }
    function undo() {
        if (!history.length) { toast('Nothing to undo.'); return; }
        restore(history.pop());
        updateButtons();
    }

    // ---------------------------------------------------------------- save / load (one mix)
    var SAVE_KEY = 'nightlite.mix';
    function saveMix() {
        if (!firstFilled()) { toast('Add some friends first, then save.'); return; }
        var snap = snapshot();
        memMix = snap;
        store(SAVE_KEY, JSON.stringify(snap));
        toast('Mix saved.');
    }
    function loadMix() {
        var raw = store(SAVE_KEY), snap = null, i;
        if (raw) { try { snap = JSON.parse(raw); } catch (e) { snap = null; } }
        if (!snap || !(snap.slots instanceof Array)) snap = memMix;
        if (!snap) { toast('No saved mix yet. Make one and tap Save.'); return; }
        for (i = 0; i < snap.slots.length; i++) {
            if (snap.slots[i] && (!charById[snap.slots[i]] || (charById[snap.slots[i]].isBlend && !S.owned[snap.slots[i]]))) snap.slots[i] = null;
        }
        if (!(snap.bpm > 0)) {
            snap.bpm = S.world.bpm;       // older saves have no tempo: use the tempo of the first creature
            for (i = 0; i < snap.slots.length; i++) if (snap.slots[i]) { snap.bpm = charById[snap.slots[i]].bpm; break; }
        }
        ensureCtx();
        pushHistory();
        restore(snap);
        toast('Mix loaded.');
    }

    function setMuted(m) {
        S.muted = m;
        $('muteBtn').querySelector('.ico').textContent = m ? '🔇' : '🔊';
        $('muteBtn').querySelector('.lbl').textContent = m ? 'Unmute' : 'Mute';
        $('muteBtn').setAttribute('aria-pressed', m ? 'true' : 'false');
        applyVolume();
    }
    function toast(msg) {
        var t = $('toast');
        t.textContent = msg;
        t.className = 'toast show';
        if (toastTimer) w.clearTimeout(toastTimer);
        toastTimer = w.setTimeout(function () { t.className = 'toast'; }, 2800);
    }

    // ---------------------------------------------------------------- drag from tray
    function slotAt(x, y) {
        var e = d.elementFromPoint(x, y);
        while (e && e !== d.body) {
            if (e.className && typeof e.className === 'string' && (' ' + e.className + ' ').indexOf(' slot ') >= 0) return e;
            e = e.parentNode;
        }
        return null;
    }
    function clearHover() {
        var s = d.querySelectorAll('.slot.over'), i;
        for (i = 0; i < s.length; i++) s[i].classList.remove('over');
    }
    function bindDrag(node, ch) {
        if (!w.PointerEvent) return;
        node.addEventListener('pointerdown', function (e) {
            if ((e.button && e.button > 0) || onStageIdx(ch.id) >= 0) return;
            drag = { ch: ch, x: e.clientX, y: e.clientY, moved: false, ghost: null, id: e.pointerId };
            try { node.setPointerCapture(e.pointerId); } catch (err) {}
        });
        node.addEventListener('pointermove', function (e) {
            if (!drag || drag.id !== e.pointerId) return;
            var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            if (!drag.moved && Math.sqrt(dx * dx + dy * dy) > 12) {
                drag.moved = true;
                drag.ghost = el('img', 'ghost');
                drag.ghost.src = imgSrc(ch);
                d.body.appendChild(drag.ghost);
            }
            if (drag.moved) {
                drag.ghost.style.left = e.clientX + 'px';
                drag.ghost.style.top = e.clientY + 'px';
                clearHover();
                var s = slotAt(e.clientX, e.clientY);
                if (s) s.classList.add('over');
            }
        });
        function end(e, drop) {
            if (!drag || drag.id !== e.pointerId) return;
            var dr = drag; drag = null;
            if (dr.ghost && dr.ghost.parentNode) dr.ghost.parentNode.removeChild(dr.ghost);
            clearHover();
            if (dr.moved) {
                suppressClick = true;
                w.setTimeout(function () { suppressClick = false; }, 60);
                if (drop) {
                    var s = slotAt(e.clientX, e.clientY);
                    if (s) addChar(dr.ch, parseInt(s.getAttribute('data-slot'), 10));
                }
            }
        }
        node.addEventListener('pointerup', function (e) { end(e, true); });
        node.addEventListener('pointercancel', function (e) { end(e, false); });
    }

    // ---------------------------------------------------------------- theme / glow dots
    function applyTheme(t) {
        var r = d.documentElement.style;
        r.setProperty('--bg1', t.bg1); r.setProperty('--bg2', t.bg2); r.setProperty('--panel', t.panel);
        r.setProperty('--text', t.text); r.setProperty('--accent', t.accent); r.setProperty('--slot', t.slot);
        r.setProperty('--onaccent', t.onaccent || '#10200c');
    }
    function buildGlow(n, kind) {
        var fx = $('fx'), i, p, s, dust = (kind === 'dust'), sky = (kind === 'stars');
        fx.innerHTML = '';
        fx.className = 'fx' + (dust ? ' dust' : '') + (sky ? ' sky' : '');
        if (dust) fx.appendChild(el('div', 'beam'));     // a sunbeam from the attic window
        if (sky) { buildSky(fx, n); return; }
        for (i = 0; i < n; i++) {
            s = dust ? 3 + Math.random() * 6 : 6 + Math.random() * 12;
            p = el('div', 'p');
            if (dust) {
                p.style.left = (28 + Math.random() * 70) + '%';
                p.style.top = (4 + Math.random() * 88) + '%';
            } else {
                p.style.left = (Math.random() * 96) + '%';
            }
            p.style.width = s + 'px'; p.style.height = s + 'px';
            p.style.animationDuration = (dust ? 16 + Math.random() * 14 : 14 + Math.random() * 14) + 's';
            p.style.animationDelay = (-Math.random() * 24) + 's';
            fx.appendChild(p);
        }
    }

    // Observatory sky: skylight frame, telescope silhouette, twinkling stars, a few slow shooting stars
    function buildSky(fx, n) {
        var i, p, s, cols = ['#fff6d8', '#ffd3ec', '#d8ccff'], holder = el('div', 'scope');
        holder.innerHTML = '<svg viewBox="0 0 400 800" preserveAspectRatio="xMaxYMax slice" aria-hidden="true" focusable="false">' +
            '<path d="M60 0 L30 190 H370 L340 0" fill="none" stroke="#120e36" stroke-width="14" stroke-linejoin="round"/>' +
            '<path d="M200 0 V190 M130 0 L115 190 M270 0 L285 190" stroke="#120e36" stroke-width="7"/>' +
            '<g fill="#0d0a2a" transform="translate(100 -20) scale(0.6)"><path d="M226 540 L330 330 L352 344 L252 552Z"/><rect x="316" y="316" width="46" height="22" rx="6" transform="rotate(32 339 327)"/>' +
            '<path d="M236 548 L196 780 H214 L248 600 L282 780 H300 L262 556Z"/><circle cx="244" cy="552" r="14"/></g></svg>';
        fx.appendChild(holder);
        for (i = 0; i < n; i++) {
            s = 2 + Math.random() * 3.5;
            p = el('div', 'star');
            p.style.left = (Math.random() * 98) + '%';
            p.style.top = (Math.random() * 94) + '%';
            p.style.width = s + 'px'; p.style.height = s + 'px';
            p.style.background = cols[i % 3];
            p.style.animationDuration = (3 + Math.random() * 5) + 's';
            p.style.animationDelay = (-Math.random() * 8) + 's';
            fx.appendChild(p);
        }
        for (i = 0; i < 3; i++) {
            p = el('div', 'shoot');
            p.style.left = (45 + Math.random() * 50) + '%';
            p.style.top = (2 + Math.random() * 30) + '%';
            p.style.animationDuration = (22 + i * 9) + 's';
            p.style.animationDelay = (-i * 8 - 3) + 's';
            fx.appendChild(p);
        }
    }

    // ---------------------------------------------------------------- doors / screens
    function doorSvg(kind, acc) {
        var s = '<svg viewBox="0 0 84 84" aria-hidden="true" focusable="false">';
        if (kind === 'window') {
            s += '<rect x="12" y="8" width="60" height="68" rx="10" fill="#0c1b3a" stroke="' + acc + '" stroke-width="4"/>' +
                '<path d="M42 8 V76 M12 42 H72" stroke="' + acc + '" stroke-width="3"/>' +
                '<circle cx="56" cy="24" r="6" fill="#ffe98a"/><circle cx="26" cy="58" r="2.5" fill="#fff6c4"/><circle cx="58" cy="60" r="2" fill="#fff6c4"/>' +
                '<path d="M12 76 Q27 62 42 76 Z" fill="#4c8a3c" opacity="0.8"/>';
        } else if (kind === 'hatch') {
            s += '<rect x="10" y="14" width="64" height="56" rx="8" fill="#5a3f2e" stroke="' + acc + '" stroke-width="4"/>' +
                '<path d="M10 35 H74 M10 52 H74" stroke="#3e2b20" stroke-width="3"/><circle cx="42" cy="44" r="7" fill="none" stroke="' + acc + '" stroke-width="4"/>';
        } else {
            s += '<path d="M10 70 L26 14 H58 L74 70 Z" fill="#14143a" stroke="' + acc + '" stroke-width="4" stroke-linejoin="round"/>' +
                '<path d="M42 14 V70" stroke="' + acc + '" stroke-width="2.5"/>' +
                '<circle cx="34" cy="34" r="2.5" fill="#fff"/><circle cx="52" cy="28" r="2" fill="#fff"/><circle cx="48" cy="52" r="3" fill="#fff"/><circle cx="30" cy="58" r="2" fill="#fff"/>';
        }
        return s + '</svg>';
    }
    function renderDoors() {
        var box = $('doors'), i;
        box.innerHTML = '';
        for (i = 0; i < DOORS.length; i++) {
            (function (dr) {
                var b = el('button', 'door');
                b.type = 'button';
                b.id = 'door-' + dr.id;
                b.style.setProperty('--dc1', dr.c1); b.style.setProperty('--dc2', dr.c2); b.style.setProperty('--dacc', dr.acc);
                var ic = el('span'); ic.innerHTML = doorSvg(dr.art, dr.acc);
                b.appendChild(ic.firstChild);
                var t = el('span', 'dt');
                t.appendChild(el('span', 'dn', dr.name));
                t.appendChild(el('span', 'dw', 'Through ' + dr.where));
                b.appendChild(t);
                b.setAttribute('aria-label', dr.name + ', through ' + dr.where);
                b.onclick = function () { enterWorld(dr.id); };
                box.appendChild(b);
            })(DOORS[i]);
        }
    }
    function showScreen(name) {
        var isWorld = !(name === 'doors' || name === 'collect' || name === 'pot');
        S.screen = isWorld ? 'world' : name;
        $('screenDoors').hidden = (name !== 'doors');
        $('screenWorld').hidden = !isWorld;
        $('screenCollect').hidden = (name !== 'collect');
        $('screenPot').hidden = (name !== 'pot');
        d.body.className = isWorld ? 'screen-world world-' + name : 'screen-' + name;
        $('toast').className = 'toast';
        w.scrollTo(0, 0);
    }
    // Show a world's look and friends. The stage, its sound and the undo history are not touched.
    function setWorldView(world) {
        S.world = world;
        S.view = world.id;
        if (!firstFilled()) setBpm(world.bpm);      // a stage that already has creatures keeps its tempo
        applyTheme(world.theme);
        buildGlow(world.glow ? world.glow.count : 12, world.glow ? world.glow.kind : '');
        $('worldTitle').textContent = world.short || world.label;
        $('screenWorld').setAttribute('aria-label', world.label);
        d.body.className = 'screen-world world-' + world.id;
        afterChange();
    }
    function enterWorld(id) {
        var world = w.NightliteWorlds[id];
        if (!world) return;
        S.screen = 'world';
        showScreen(id);
        S.back = [];
        history = [];
        setWorldView(world);
        if (ensureCtxIfRunning()) { var i; for (i = 0; i < SLOTS; i++) if (S.slots[i]) startVoice(i); }
    }
    function ensureCtxIfRunning() { return !!ctx; }
    function leaveWorld() {
        stopAllVoices();      // stage is kept, it restarts when you come back
        S.back = [];
        applyTheme(DOOR_THEME);
        buildGlow(10);
        showScreen('doors');
    }
    var DOOR_THEME = { bg1: '#1a2447', bg2: '#0a1026', panel: '#1b2c52', text: '#eef3ff', accent: '#f2d57e', slot: '#243a66' };

    // ---------------------------------------------------------------- keyboard
    function onKey(e) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        var k = e.key, tag = d.activeElement ? d.activeElement.tagName : '';
        if (tag === 'INPUT' && k !== 'Escape') return;
        if (S.screen === 'collect' || S.screen === 'pot') { if (k === 'Escape') goBack(); return; }
        if (S.screen !== 'world') return;
        var lk = k.toLowerCase(), n;
        if (k === 'Escape') leaveWorld();
        else if (lk === 'm') setMuted(!S.muted);
        else if (lk === 'z') undo();
        else if (lk === 'r') clearAll();
        else if (lk === 's') saveMix();
        else if (lk === 'l') loadMix();
        else if (k >= '1' && k <= '6') {
            n = parseInt(k, 10) - 1;
            var vl = viewList();
            if (vl[n]) tileAction(vl[n]);
        }
    }

    // ---------------------------------------------------------------- screens: Collection and Mixing pot
    function openScreen(name) {
        var from = S.screen;
        if (from === name) return;
        S.back.push(from);
        if (from === 'world') stopAllVoices();      // like leaving a world: the stage is kept, the sound pauses
        if (from === 'world' || from === 'doors') { applyTheme(DOOR_THEME); buildGlow(10); }
        showScreen(name);
        if (name === 'collect') renderCollect(); else renderPot();
    }
    function resumeWorld() {
        showScreen(S.world.id);
        setWorldView(S.world);
        if (ctx) { var i; for (i = 0; i < SLOTS; i++) if (S.slots[i]) startVoice(i); }
    }
    function goBack() {
        var to = S.back.pop() || 'doors';
        if (to === 'world') { resumeWorld(); return; }
        if (to === 'doors') { showScreen('doors'); return; }
        showScreen(to);
        if (to === 'collect') renderCollect(); else renderPot();
    }
    function doAct(act) {
        if (act === 'wish') { wish(); if (S.screen === 'collect') renderNest(); }
        else if (act === 'collect') openScreen('collect');
        else if (act === 'pot') openScreen('pot');
    }

    function burst(host) {
        var b = el('span', 'burst'), i, p, a, r;
        for (i = 0; i < 14; i++) {
            p = el('i');
            a = (i / 14) * 6.2832; r = 50 + (i % 3) * 22;
            p.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
            p.style.setProperty('--dy', Math.round(Math.sin(a) * r) + 'px');
            p.style.animationDelay = ((i % 4) * 0.05) + 's';
            b.appendChild(p);
        }
        host.appendChild(b);
        w.setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 1700);
    }

    // ---- Mixing pot: pick two base friends, tap Mix. Parents are never used up.
    function baseChars() {
        var out = [], i, j, wd;
        for (i = 0; i < WORLD_ORDER.length; i++) {
            wd = w.NightliteWorlds[WORLD_ORDER[i]];
            for (j = 0; j < wd.chars.length; j++) out.push(wd.chars[j]);
        }
        return out;
    }
    function potSlot(id, idx) {
        var b = $(idx ? 'potB' : 'potA'), ch = id ? charById[id] : null;
        b.innerHTML = '';
        b.className = 'pslot' + (ch ? ' has' : '');
        if (ch) {
            var im = el('img'); im.src = imgSrc(ch); im.alt = ch.name; im.draggable = false;
            b.appendChild(im);
            b.setAttribute('aria-label', (idx ? 'Second' : 'First') + ' friend: ' + ch.name + '. Tap to take out.');
        } else {
            b.appendChild(el('span', 'q', '?'));
            b.setAttribute('aria-label', (idx ? 'Second' : 'First') + ' friend, empty');
        }
    }
    function potOut(blend, isNew) {
        var o = $('potOut');
        o.innerHTML = '';
        o.className = 'pslot bowl';
        if (blend) {
            var im = el('img'); im.src = imgSrc(blend); im.alt = blend.name;
            o.appendChild(im);
            void o.offsetWidth;
            o.classList.add('made');
            burst(o);
        } else {
            o.appendChild(el('span', 'q', '?'));
        }
    }
    function potMsg(t) { $('potMsg').textContent = t; }
    function renderPot() {
        var box = $('potTiles'), list = baseChars(), i;
        potSlot(S.pot[0], 0); potSlot(S.pot[1], 1);
        box.innerHTML = '';
        for (i = 0; i < list.length; i++) {
            (function (ch) {
                var on = (S.pot[0] === ch.id || S.pot[1] === ch.id);
                var b = el('button', 'ptile' + (on ? ' picked' : ''));
                b.type = 'button';
                b.id = 'ptile-' + ch.id;
                var im = el('img'); im.src = imgSrc(ch); im.alt = ''; im.draggable = false;
                b.appendChild(im);
                b.appendChild(el('span', 'nm', ch.name));
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
                b.setAttribute('aria-label', ch.name + (on ? ', in the pot. Tap to take out.' : '. Tap to put in the pot.'));
                b.onclick = function () { potPick(ch.id); };
                box.appendChild(b);
            })(list[i]);
        }
    }
    function potPick(id) {
        var k = S.pot.indexOf ? S.pot.indexOf(id) : (S.pot[0] === id ? 0 : (S.pot[1] === id ? 1 : -1));
        if (k >= 0) S.pot[k] = null;
        else if (!S.pot[0]) S.pot[0] = id;
        else if (!S.pot[1]) S.pot[1] = id;
        else { S.pot[0] = S.pot[1]; S.pot[1] = id; }
        potOut(null);
        potMsg(S.pot[0] && S.pot[1] ? 'Ready. Tap Mix!' : 'Pick one more friend.');
        renderPot();
    }
    function mix2() {
        var a = S.pot[0], b = S.pot[1], id, blend, isNew, key;
        if (!a || !b) { potMsg('Pick two friends first. They always stay with you.'); return; }
        ensureCtx();
        key = recipeKey(a, b);
        id = recipeByKey[key];
        if (!id) {
            var o = $('potOut');
            o.classList.remove('nope'); void o.offsetWidth; o.classList.add('nope');
            potMsg('Not this time. Nothing was lost. Try another pair!');
            chime([76, 74]);
            return;
        }
        blend = blendById[id];
        isNew = !S.owned[id];
        S.owned[id] = true;
        S.found[key] = true;
        saveProgress();
        potOut(blend, isNew);
        chime([84, 88, 91, 96]);
        potMsg(isNew ? 'You made ' + blend.name + '! It joined your Collection.' : 'You made ' + blend.name + ' again. It is already in your Collection.');
    }

    // ---- Collection: nest, Discovery book, blends you own
    function renderNest() { }
    function renderCollect() {
        renderNest();
        renderBook();
        renderOwned();
        updateSparkUI();
    }
    function faceCard(ch) {
        var f = el('span', 'face');
        if (ch) {
            var im = el('img'); im.src = imgSrc(ch); im.alt = ''; im.draggable = false;
            f.appendChild(im);
            f.appendChild(el('span', 'fn', ch.name));
        } else {
            f.appendChild(el('span', 'qm', '?'));
            f.appendChild(el('span', 'fn', '?'));
        }
        return f;
    }
    function renderBook() {
        var box = $('bookBox'), bl = w.NightliteBlends.chars, i, ch, key, found, r;
        box.innerHTML = '';
        for (i = 0; i < bl.length; i++) {
            ch = bl[i];
            key = recipeKey(ch.blend[0], ch.blend[1]);
            found = !!S.found[key];
            r = el('div', 'recipe' + (found ? ' known' : ' unknown'));
            r.setAttribute('data-blend', ch.id);
            r.appendChild(faceCard(found ? charById[ch.blend[0]] : null));
            r.appendChild(el('span', 'op', '+'));
            r.appendChild(faceCard(found ? charById[ch.blend[1]] : null));
            r.appendChild(el('span', 'op', '='));
            r.appendChild(faceCard((found || S.owned[ch.id]) ? ch : null));
            r.setAttribute('aria-label', found ? charById[ch.blend[0]].name + ' plus ' + charById[ch.blend[1]].name + ' makes ' + ch.name : 'A recipe not found yet');
            box.appendChild(r);
        }
    }
    function renderOwned() {
        var box = $('ownedBox'), bl = w.NightliteBlends.chars, i, ch, c, n = 0;
        box.innerHTML = '';
        for (i = 0; i < bl.length; i++) {
            ch = bl[i];
            c = el('div', 'ocard');
            if (S.owned[ch.id]) {
                n++;
                var im = el('img'); im.src = imgSrc(ch); im.alt = ch.name; im.draggable = false;
                c.appendChild(im);
                c.appendChild(el('span', 'nm', ch.name));
            } else {
                c.appendChild(el('span', 'qm', '?'));
                c.appendChild(el('span', 'nm', '?'));
            }
            box.appendChild(c);
        }
        $('ownedCount').textContent = n + ' of ' + bl.length;
    }

    // ---------------------------------------------------------------- init
    function init() {
        var id, j, worlds = w.NightliteWorlds || {};
        for (id in worlds) if (worlds.hasOwnProperty(id)) {
            for (j = 0; j < worlds[id].chars.length; j++) {
                worlds[id].chars[j].world = id;
                worlds[id].chars[j].bpm = worlds[id].bpm;
                charById[worlds[id].chars[j].id] = worlds[id].chars[j];
            }
        }
        var bl = (w.NightliteBlends && w.NightliteBlends.chars) || [];
        for (j = 0; j < bl.length; j++) {
            bl[j].world = 'blends';
            bl[j].isBlend = true;
            bl[j].bpm = charById[bl[j].blend[0]] ? charById[bl[j].blend[0]].bpm : 90;     // tempo of the first parent's world
            charById[bl[j].id] = bl[j];
            blendById[bl[j].id] = bl[j];
            recipeByKey[recipeKey(bl[j].blend[0], bl[j].blend[1])] = bl[j].id;
        }
        loadProgress();
        updateSparkUI();
        var vol = parseInt(store('nightlite.vol'), 10);
        if (vol >= 0 && vol <= 100) { S.vol = vol / 100; $('volRange').value = vol; } else { S.vol = 0.7; }
        applyTheme(DOOR_THEME);
        buildGlow(10);
        renderDoors();
        showScreen('doors');

        $('doorsBtn').onclick = leaveWorld;
        $('backBtn3').onclick = goBack;
        $('backBtn4').onclick = goBack;
        $('mixBtn').onclick = mix2;
        $('potA').onclick = function () { if (S.pot[0]) potPick(S.pot[0]); };
        $('potB').onclick = function () { if (S.pot[1]) potPick(S.pot[1]); };
        $('muteBtn').onclick = function () { setMuted(!S.muted); };
        $('volRange').oninput = function () {
            S.vol = this.value / 100;
            if (S.muted && S.vol > 0) setMuted(false); else applyVolume();
            store('nightlite.vol', String(this.value));
        };
        $('undoBtn').onclick = undo;
        $('resetBtn').onclick = clearAll;
        $('saveBtn').onclick = saveMix;
        $('loadBtn').onclick = loadMix;
        var acts = d.querySelectorAll('[data-act]'), ai;
        for (ai = 0; ai < acts.length; ai++) {
            (function (b) {
                var act = b.getAttribute('data-act');
                b.onclick = function () { doAct(act); };
            })(acts[ai]);
        }
        var lastTick = Date.now();
        w.setInterval(function () {
            var now = Date.now(), dt = (now - lastTick) / 1000;
            lastTick = now;
            tick(Math.max(0, Math.min(2, dt)));
        }, 1000);
        d.addEventListener('keydown', onKey);
        w.addEventListener('resize', function () { if (S.screen === 'world') drawConstellation(); });
        d.addEventListener('visibilitychange', function () {
            if (!ctx) return;
            try { if (d.hidden) ctx.suspend(); else if (S.screen === 'world') ctx.resume(); } catch (e) {}
        });
        d.addEventListener('visibilitychange', function () { if (d.hidden) saveProgress(); });

        // Test/debug hook (not used by the UI).
        w.Nightlite = { state: S, worlds: worlds, addChar: addChar, ensureCtx: ensureCtx, voices: voices, enterWorld: enterWorld, tick: tick, charById: charById };
    }

    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window);
