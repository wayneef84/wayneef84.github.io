/**
 * Nightlite Choir+ - app logic (strict ES5, no libraries, works from file://).
 * Engine forked from the S4K Mixer v2 app (tray, drag, undo, save, volume, audio context), adapted here.
 * Two screens: the door screen (world select) and a world (Night Garden, Toy Attic or Star Observatory).
 * Worlds register themselves in window.NightliteWorlds (see js/worlds/*.js).
 * One shared stage: creatures from all three worlds can stand on it. Tempo comes from the first creature placed.
 * Milestone 3: free sparks, eggs in a nest, a Mixing pot, a Discovery book and 6 blend creatures (js/worlds/blends.js).
 * v0.5.0: recipes of 2 to 5 friends (blends can be ingredients), pot suggestions, extra blend sets (js/worlds/blends_*.js), rare friends.
 * Recipe rules live in js/recipes.js (no DOM, tested by tests/nightlite.test.js).
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
    var SAVE_VERSION = 5;          // 5 adds rares: [ids]. Older saves load as they are (rares start empty), see loadProgress
    var DATA_KEY = 'nightlite.save';
    var RARE_KEY = 'nightlite.rare';   // '1' or '0': the Rare friends toggle (default on)
    var POT_SLOTS = 5;
    var R = w.NightliteRecipes;

    var S = { world: null, slots: [], vol: 0.7, muted: false, screen: 'doors', bpm: 90,
              sparks: 0, owned: {}, found: {}, rares: {}, rareOn: true, nest: null, playSecs: 0,
              view: 'garden', back: [], pot: [null, null, null, null, null], reveal: null, suggest: [], showSuggest: false, bookPage: 1 };
    var history = [];
    var ctx = null, mix = null, master = null;
    var voices = {};            // slot index -> { src, gain }
    var buffers = {};           // creature id -> AudioBuffer
    var t0 = null;              // transport start time
    var toastTimer = null, drag = null, suppressClick = false, memMix = null;
    var charById = {};
    var blendById = {};         // blend id -> creature
    var recipeByKey = {};       // sorted ids joined with '+' -> blend id (2 to 5 ingredients)
    var model = null;           // recipe tables and rules (js/recipes.js)
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
    // One JSON under nightlite.save: { v, sparks, blends: [ids], found: ['a+b', ...], rares: ['id_rare', ...], nest: { left } | null }.
    // v5 added rares. A v1 to v4 save has none and loads unchanged (nothing is dropped). found keys are sorted ids, so old 'a+b' keys still match.
    // Older v0.1.0 to v0.3.0 saves have no such key and simply start with zero sparks. Storage blocked: everything stays in memory.
    function raresList() {
        var out = [], k;
        for (k in S.rares) if (S.rares.hasOwnProperty(k) && S.rares[k]) out.push(k);
        return out;
    }
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
    var loadingSave = false;      // true while a save import is reloading the page, so old memory never overwrites it
    function saveProgress() {
        if (loadingSave) return;
        var data = { v: SAVE_VERSION, sparks: S.sparks, blends: ownedList(), found: foundList(), rares: raresList(),
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
        if (data.rares instanceof Array) {
            for (i = 0; i < data.rares.length; i++) {
                id = data.rares[i];
                if (R.isRareId(id) && blendById[R.baseId(id)]) { S.rares[id] = true; S.owned[R.baseId(id)] = true; }
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
    var nestSaveAcc = 0;
    function nestTick(dt) {
        if (!S.nest) return;
        S.nest.left -= dt;
        nestSaveAcc += dt;
        if (S.nest.left <= 0) { hatch(); return; }
        if (nestSaveAcc >= 5) { nestSaveAcc = 0; saveProgress(); }
        updateNestLive();
    }

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
                    if (ch.rare) b.appendChild(el('span', 'rstar', '\u2605'));
                    b.setAttribute('aria-label', ch.name + (ch.rare ? ' (rare)' : '') + ' on spot ' + (idx + 1) + '. Tap to remove.');
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
        for (i = 0; i < bl.length; i++) {
            if (S.owned[bl[i].id]) out.push(bl[i]);
            if (S.rares[R.rareId(bl[i].id)]) out.push(charById[R.rareId(bl[i].id)]);
        }
        return out;
    }
    // Is this friend on hand? Base friends always, a blend once owned, a rare once found.
    function haveChar(ch) {
        if (!ch) return false;
        if (ch.rare) return !!S.rares[ch.id];
        return !ch.isBlend || !!S.owned[ch.id];
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
                if (ch.rare) b.appendChild(el('span', 'rstar', '\u2605'));
                b.setAttribute('aria-pressed', used ? 'true' : 'false');
                b.setAttribute('aria-label', ch.name + (ch.rare ? ' (rare)' : '') + (used ? ', on stage. Tap to remove.' : '. Tap to add.'));
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
        if (!haveChar(ch)) return;
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
            if (snap.slots[i] && !haveChar(charById[snap.slots[i]])) snap.slots[i] = null;
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
        syncCfg();
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
    // ---------------------------------------------------------------- settings overlay (gear button on every screen)
    // Volume and Mute share the world screen's state. Export and Import use FongGameSaves (id nightlite-choir).
    // Replace and Restore are behind a parent question (times table), then a tap-twice confirm.
    var SAVE_ID = 'nightlite-choir';
    var UNDO_KEY = 'nightlite.undo';          // one-level undo, deliberately not in the FongGameSaves manifest
    var cfgOpen = false, cfgFrom = null, cfgText = '', cfgArmed = '', cfgUnlocked = false, cfgGate = null, cfgHidden = [];
    function setVolume(val) {
        if (loadingSave) { syncCfg(); return; }      // no writes while an import is reloading the page
        S.vol = val / 100;
        if (S.muted && S.vol > 0) setMuted(false); else applyVolume();
        store('nightlite.vol', String(val));
        $('volRange').value = val;
        syncCfg();
    }
    function syncCfg() {
        var r = $('volRange'), c = $('cfgVol'), b = $('cfgMute');
        if (c && r) c.value = r.value;
        if (b) {
            b.querySelector('.ico').textContent = S.muted ? '🔇' : '🔊';
            b.querySelector('.lbl').textContent = S.muted ? 'Unmute' : 'Mute';
            b.setAttribute('aria-pressed', S.muted ? 'true' : 'false');
        }
    }
    function cfgMsg(text, bad) {
        var m = $('cfgMsg');
        m.textContent = text;
        m.className = bad ? 'cfg-msg bad' : 'cfg-msg';
    }
    function cfgDisarm() {
        cfgArmed = '';
        $('cfgReplace').querySelector('.lbl').textContent = 'Replace my saves';
        $('cfgRestore').querySelector('.lbl').textContent = 'Restore previous';
    }
    function hasUndo() { return !!store(UNDO_KEY); }
    function syncUndo() { $('cfgRestore').hidden = !hasUndo(); }
    function cfgFocusables() {
        var list = $('cfgOv').querySelectorAll('button, a[href], input, textarea'), out = [], i;
        for (i = 0; i < list.length; i++) if (!list[i].disabled && !list[i].hidden && !(list[i].parentNode && list[i].parentNode.hidden)) out.push(list[i]);
        return out;
    }
    // Hide the rest of the page from taps, focus and screen readers while the overlay is open.
    function hideRest(on) {
        var i, kids, n;
        if (on) {
            cfgHidden = [];
            kids = d.body.children;
            for (i = 0; i < kids.length; i++) {
                n = kids[i];
                if (n.id === 'cfgOv' || n.id === 'toast' || n.tagName === 'SCRIPT') continue;
                cfgHidden.push({ node: n, inert: n.hasAttribute('inert'), aria: n.getAttribute('aria-hidden') });
                n.setAttribute('inert', '');
                n.setAttribute('aria-hidden', 'true');
            }
        } else {
            for (i = 0; i < cfgHidden.length; i++) {
                n = cfgHidden[i];
                if (!n.inert) n.node.removeAttribute('inert');
                if (n.aria === null) n.node.removeAttribute('aria-hidden'); else n.node.setAttribute('aria-hidden', n.aria);
            }
            cfgHidden = [];
        }
    }
    function openConfig(from) {
        cfgFrom = from || d.activeElement;
        cfgOpen = true;
        cfgText = ''; $('cfgText').value = ''; $('cfgFile').value = '';
        cfgUnlocked = false;
        $('cfgGate').hidden = true;
        cfgDisarm(); cfgMsg('');
        syncCfg(); syncUndo();
        hideRest(true);
        d.body.className += ' cfg-lock';
        $('cfgOv').hidden = false;
        $('cfgClose').focus();
    }
    function closeConfig() {
        if (!cfgOpen) return;
        cfgOpen = false;
        $('cfgOv').hidden = true;
        hideRest(false);
        d.body.className = d.body.className.replace(/ ?cfg-lock/g, '');
        cfgDisarm();
        if (cfgFrom && cfgFrom.focus) { try { cfgFrom.focus(); } catch (e) {} }
    }
    function cfgExport() {
        var G = w.FongGameSaves;
        if (!G) { cfgMsg('Saving to a file is not available here.', true); return; }
        var r = G.exportGame(SAVE_ID), text = r.text, ok = false;
        try {
            var url = w.URL.createObjectURL(new w.Blob([text], { type: 'application/json' }));
            var a = d.createElement('a');
            a.href = url; a.download = 'fong-save-' + SAVE_ID + '.json'; a.style.display = 'none';
            d.body.appendChild(a); a.click();
            w.setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); w.URL.revokeObjectURL(url); }, 1000);
            ok = true;
        } catch (e) { ok = false; }
        var warn = r.warnings.length ? ' Warning: ' + r.warnings[0] : '';
        if (ok) { cfgMsg('Saved a file called fong-save-' + SAVE_ID + '.json.' + warn, r.warnings.length > 0); }
        else { $('cfgText').value = text; cfgText = text; cfgMsg('Could not download. Copy the text in the box and keep it somewhere safe.' + warn, true); }
    }
    // Ask the grown-up question before anything that replaces saves. Returns true when already unlocked.
    function cfgNeedGate(then) {
        if (cfgUnlocked) return true;
        var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
        cfgGate = { answer: a * b, then: then };
        $('cfgQ').textContent = 'Grown-ups only. What is ' + a + ' × ' + b + '?';
        $('cfgAns').value = '';
        $('cfgGate').hidden = false;
        cfgMsg('Replacing saves is locked so little fingers cannot wipe them.');
        $('cfgAns').focus();
        return false;
    }
    function cfgUnlock() {
        if (!cfgGate) return;
        if (parseInt($('cfgAns').value, 10) === cfgGate.answer) {
            cfgUnlocked = true;
            $('cfgGate').hidden = true;
            cfgMsg('Unlocked. Tap the button again, then tap once more to confirm.');
            var f = cfgGate.then;
            cfgGate = null;
            if (f && $(f)) $(f).focus();
        } else {
            $('cfgAns').value = '';
            cfgMsg('Not quite. Ask a grown-up to help.', true);
        }
    }
    // Stash what is stored now, so one Restore can bring it back.
    function cfgStash() {
        var snap = { save: store(DATA_KEY), mix: store(SAVE_KEY), vol: store('nightlite.vol'), rare: store(RARE_KEY) };
        store(UNDO_KEY, JSON.stringify(snap));
        return store(UNDO_KEY) !== null;
    }
    function cfgReload(failMsg) {
        loadingSave = true;                                 // stop any save from overwriting the data while the page reloads
        w.setTimeout(function () { try { w.location.reload(); } catch (e) { loadingSave = false; cfgMsg(failMsg, true); } }, 900);
        w.setTimeout(function () { loadingSave = false; }, 4000);   // reload did not happen: let the game save again
    }
    function cfgImport(mode) {
        var G = w.FongGameSaves;
        if (loadingSave) return;
        if (!G) { cfgMsg('Loading saves is not available here.', true); return; }
        var text = cfgText;
        var chk = G.importJSON(text, { mode: mode, dryRun: true, only: [SAVE_ID] });
        if (!chk.ok) { cfgDisarm(); cfgMsg(chk.errors[0] || 'That file cannot be used.', true); return; }
        if (mode === 'replace') {
            if (!cfgNeedGate('cfgReplace')) return;
            if (cfgArmed !== 'replace') {
                cfgDisarm(); cfgArmed = 'replace';
                $('cfgReplace').querySelector('.lbl').textContent = 'Tap again to confirm';
                cfgMsg('This replaces your saves. Tap again to confirm.', true);
                return;
            }
        }
        cfgDisarm();
        if (!cfgStash()) { cfgMsg('Could not keep a copy of your current saves, so nothing was changed.', true); return; }
        loadingSave = true;                                 // no save or volume write while we import
        var r = G.importJSON(text, { mode: mode, only: [SAVE_ID] });
        if (!r.ok) {                                        // includes a storage failure: the import rolled back
            loadingSave = false;
            try { w.localStorage.removeItem(UNDO_KEY); } catch (e) {}
            syncUndo();
            cfgMsg(r.errors[0] || 'That file cannot be used.', true);
            return;
        }
        syncUndo();
        cfgMsg('Done. Loading your saves...');
        cfgReload('Imported, but the page could not reload. Reload it to see your saves.');
    }
    function cfgRestore() {
        if (loadingSave) return;
        var raw = store(UNDO_KEY), snap = null;
        if (raw) { try { snap = JSON.parse(raw); } catch (e) { snap = null; } }
        if (!snap || typeof snap !== 'object') { syncUndo(); cfgMsg('There is nothing to restore.', true); return; }
        if (!cfgNeedGate('cfgRestore')) return;
        if (cfgArmed !== 'restore') {
            cfgDisarm(); cfgArmed = 'restore';
            $('cfgRestore').querySelector('.lbl').textContent = 'Tap again to confirm';
            cfgMsg('This puts back the saves you had before the last import. Tap again to confirm.', true);
            return;
        }
        cfgDisarm();
        var keys = [['nightlite.save', snap.save], ['nightlite.mix', snap.mix], ['nightlite.vol', snap.vol], [RARE_KEY, snap.rare]], i, now = {}, ok = true, k;
        loadingSave = true;
        for (i = 0; i < keys.length; i++) now[keys[i][0]] = store(keys[i][0]);
        try {
            for (i = 0; i < keys.length; i++) {
                k = keys[i][0];
                if (typeof keys[i][1] === 'string') w.localStorage.setItem(k, keys[i][1]); else w.localStorage.removeItem(k);
            }
        } catch (e) { ok = false; }
        if (!ok) {                                          // put back what was there and say so
            try {
                for (i = 0; i < keys.length; i++) {
                    k = keys[i][0];
                    if (typeof now[k] === 'string') w.localStorage.setItem(k, now[k]); else w.localStorage.removeItem(k);
                }
            } catch (e2) {}
            loadingSave = false;
            cfgMsg('Could not restore (storage is blocked or full). Nothing was changed.', true);
            return;
        }
        try { w.localStorage.removeItem(UNDO_KEY); } catch (e3) {}
        syncUndo();
        cfgMsg('Restored. Loading your saves...');
        cfgReload('Restored, but the page could not reload. Reload it to see your saves.');
    }
    function initConfig() {
        var gears = d.querySelectorAll('.gearBtn'), i;
        for (i = 0; i < gears.length; i++) {
            (function (g) { g.onclick = function () { openConfig(g); }; })(gears[i]);
        }
        $('cfgVol').value = $('volRange').value;
        $('cfgVol').oninput = function () { setVolume(this.value); };
        $('cfgMute').onclick = function () { if (!loadingSave) setMuted(!S.muted); };
        $('cfgClose').onclick = closeConfig;
        $('cfgOv').addEventListener('click', function (e) { if (e.target === $('cfgOv')) closeConfig(); });
        $('cfgOv').addEventListener('keydown', function (e) {       // Escape is handled once, at document level (onKey)
            if (e.key !== 'Tab') return;
            var f = cfgFocusables(), first = f[0], last = f[f.length - 1];
            if (e.shiftKey && (d.activeElement === first || !$('cfgOv').contains(d.activeElement))) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && (d.activeElement === last || !$('cfgOv').contains(d.activeElement))) { e.preventDefault(); first.focus(); }
        });
        $('cfgExport').onclick = cfgExport;
        $('cfgAdd').onclick = function () { cfgImport('merge'); };
        $('cfgReplace').onclick = function () { cfgImport('replace'); };
        $('cfgRestore').onclick = cfgRestore;
        $('cfgUnlock').onclick = cfgUnlock;
        $('cfgAns').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); cfgUnlock(); } });
        $('cfgText').oninput = function () { cfgText = this.value; cfgDisarm(); };   // the box always holds the whole text
        $('cfgFile').onchange = function () {
            var f = this.files && this.files[0];
            cfgDisarm();
            if (!f) return;
            var lim = (w.FongGameSaves && w.FongGameSaves.MAX_CHARS) || 600000;
            if (f.size > lim) { cfgMsg('That file is too big.', true); return; }
            var fr = new w.FileReader();
            fr.onload = function () { cfgText = String(fr.result); $('cfgText').value = cfgText; cfgMsg('File loaded. Choose Add missing or Replace.'); };
            fr.onerror = function () { cfgMsg('Could not read that file.', true); };
            fr.readAsText(f);
        };
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
        if (cfgOpen) { if (e.key === 'Escape') closeConfig(); return; }   // overlay open: Escape closes it, nothing else runs
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
        if (from === 'collect') S.reveal = null;
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
        S.reveal = null;
        if (to === 'world') { resumeWorld(); return; }
        if (to === 'doors') { showScreen('doors'); return; }
        showScreen(to);
        if (to === 'collect') renderCollect(); else renderPot();
    }
    function doAct(act) {
        if (act === 'wish') { wish(); if (S.screen === 'collect') renderNest(); }
        else if (act === 'collect') openScreen('collect');
        else if (act === 'pot') openScreen('pot');
        else if (act === 'cheers') { if (w.FongCheer) w.FongCheer.openSettings(); }
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

    // ---- Mixing pot: pick 2 to 5 friends (base friends or blends you own), tap Mix. Friends are never used up.
    function baseChars() {
        var out = [], i, j, wd;
        for (i = 0; i < WORLD_ORDER.length; i++) {
            wd = w.NightliteWorlds[WORLD_ORDER[i]];
            for (j = 0; j < wd.chars.length; j++) out.push(wd.chars[j]);
        }
        return out;
    }
    function potIds() {
        var out = [], i;
        for (i = 0; i < POT_SLOTS; i++) if (S.pot[i]) out.push(S.pot[i]);
        return out;
    }
    function setPot(ids) {
        var i;
        S.pot = [];
        for (i = 0; i < POT_SLOTS; i++) S.pot.push(ids[i] || null);
    }
    function potSlot(idx) {
        var id = S.pot[idx], b = $('potS' + idx), ch = id ? charById[id] : null;
        b.innerHTML = '';
        b.className = 'pslot' + (ch ? ' has' : '');
        if (ch) {
            var im = el('img'); im.src = imgSrc(ch); im.alt = ch.name; im.draggable = false;
            b.appendChild(im);
            b.setAttribute('aria-label', 'Spot ' + (idx + 1) + ': ' + ch.name + '. Tap to take out.');
        } else {
            b.appendChild(el('span', 'q', '?'));
            b.setAttribute('aria-label', 'Spot ' + (idx + 1) + ', empty');
        }
    }
    function potOut(blend, isNew, isRare) {
        var o = $('potOut');
        o.innerHTML = '';
        o.className = 'pslot bowl';
        if (blend) {
            var im = el('img'); im.src = imgSrc(isRare ? charById[R.rareId(blend.id)] : blend); im.alt = blend.name;
            o.appendChild(im);
            if (isRare) o.appendChild(el('span', 'rstar', '★'));
            void o.offsetWidth;
            o.classList.add('made');
            burst(o);
        } else {
            o.appendChild(el('span', 'q', '?'));
        }
    }
    function potMsg(t) { $('potMsg').textContent = t; }
    function hintText(h) {
        if (!h) return '';
        if (h.kind === 'almost') return 'Almost! Add ' + h.n + ' more friend' + (h.n === 1 ? '' : 's') + '.';
        return 'That is a lot of friends. Try fewer.';
    }
    // The pot tray: the 12 base friends, then the blends you own
    function potChoices() {
        var list = baseChars(), bl = w.NightliteBlends.chars, i;
        for (i = 0; i < bl.length; i++) if (S.owned[bl[i].id]) list.push(bl[i]);
        return list;
    }
    function renderPot() {
        var box = $('potTiles'), list = potChoices(), i, n = potIds().length;
        for (i = 0; i < POT_SLOTS; i++) potSlot(i);
        $('mixBtn').disabled = n < R.MIN;
        syncRareBtn();
        box.innerHTML = '';
        for (i = 0; i < list.length; i++) {
            (function (ch) {
                var on = S.pot.indexOf(ch.id) >= 0;
                var b = el('button', 'ptile' + (on ? ' picked' : '') + (ch.isBlend ? ' blendtile' : ''));
                b.type = 'button';
                b.id = 'ptile-' + ch.id;
                var im = el('img'); im.src = imgSrc(ch); im.alt = ''; im.draggable = false;
                b.appendChild(im);
                b.appendChild(el('span', 'nm', ch.name));
                if (S.rares[R.rareId(ch.id)]) b.appendChild(el('span', 'rstar', '★'));     // you have the rare version of this friend
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
                b.setAttribute('aria-label', ch.name + (on ? ', in the pot. Tap to take out.' : '. Tap to put in the pot.'));
                b.onclick = function () { potPick(ch.id); };
                box.appendChild(b);
            })(list[i]);
        }
        renderSuggest();
    }
    function potPick(id) {
        var k = S.pot.indexOf(id), ids;
        if (k >= 0) S.pot[k] = null;
        else {
            ids = potIds();
            if (ids.length >= POT_SLOTS) { ids.shift(); ids.push(id); setPot(ids); }     // full: the oldest friend steps out
            else S.pot[S.pot.indexOf(null)] = id;
        }
        potOut(null);
        potStatus();
        renderPot();
    }
    // The message under the pot: ready, closeness hint, or what to do next
    function potStatus() {
        var ids = potIds(), h;
        if (ids.length < R.MIN) { potMsg(ids.length ? 'Pick one more friend.' : 'Nothing is used up. Try 2 to 5 friends!'); return; }
        if (model.match(ids)) { potMsg('Ready. Tap Mix!'); return; }
        h = model.hint(ids, S.owned, S.found);
        potMsg(h ? hintText(h) : 'Ready. Tap Mix!');
    }
    function mixPot() {
        var ids = potIds(), id, blend, isNew, key, rare = false, newRare = false, h;
        if (ids.length < R.MIN) { potMsg('Pick at least 2 friends first. They always stay with you.'); return; }
        ensureCtx();
        id = model.match(ids);
        if (!id) {
            var o = $('potOut');
            o.classList.remove('nope'); void o.offsetWidth; o.classList.add('nope');
            h = model.hint(ids, S.owned, S.found);
            potMsg('Not this time. Nothing was lost.' + (h ? ' ' + hintText(h) : ' Try another group!'));
            chime([76, 74]);
            return;
        }
        key = R.keyOf(ids);
        blend = blendById[id];
        isNew = !S.owned[id];
        S.owned[id] = true;
        S.found[key] = true;
        rare = R.roll(w.Math.random, S.rareOn);
        if (rare && !S.rares[R.rareId(id)]) { S.rares[R.rareId(id)] = true; newRare = true; }
        saveProgress();
        S.showSuggest = false;
        renderPot();
        potOut(blend, isNew, rare);
        if ((isNew || newRare) && w.FongCheer) w.FongCheer.cheer('big');
        chime(rare ? [84, 88, 91, 96, 100, 103] : [84, 88, 91, 96]);
        potMsg((rare ? 'A shimmering RARE ' + blend.name + ' appeared! ' : '') +
               (isNew ? 'You made ' + blend.name + '! It joined your Collection.' : 'You made ' + blend.name + ' again. It is already in your Collection.'));
    }
    function stageIds() {
        var ids = [], i;
        for (i = 0; i < SLOTS; i++) if (S.slots[i]) ids.push(S.slots[i]);
        return ids;
    }
    // Match my stage: fill the pot from the friends standing on the stage
    function matchStage() {
        var ids = stageIds(), picked;
        if (!ids.length) { potMsg('The stage is empty. Put friends on a stage first, or pick from below.'); return; }
        picked = model.fromStage(ids, S.owned, S.found);
        if (!picked.length) { potMsg('Those friends cannot go in the pot. Pick from below.'); return; }
        setPot(picked);
        potOut(null);
        S.showSuggest = false;
        renderPot();
        if (picked.length < R.MIN) potMsg('Only one friend is on the stage. Pick one more.'); else potStatus();
    }
    // What can I make?: big cards for recipes made of what is on the stage (or containing your picks)
    function showSuggestions() {
        S.showSuggest = true;
        renderSuggest();
        var box = $('potSuggest');
        if (box && box.scrollIntoView) { try { box.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
    }
    function renderSuggest() {
        var box = $('potSuggest'), i, list;
        box.innerHTML = '';
        if (!S.showSuggest) { box.hidden = true; return; }
        S.suggest = list = model.suggest(stageIds(), potIds(), S.owned, S.found, 12);
        box.hidden = false;
        if (!list.length) {
            box.appendChild(el('p', 'hint', potIds().length ? 'No ideas for those friends yet. Try adding or taking out a friend.' : 'No ideas yet. Put 2 or more friends on the stage, or pick some from below.'));
            return;
        }
        for (i = 0; i < list.length; i++) {
            (function (rec) {
                var done = !!S.found[rec.key], blend = blendById[rec.id], b = el('button', 'scard' + (done ? ' known' : ' unknown')), row = el('span', 'srow'), j, f;
                b.type = 'button';
                for (j = 0; j < rec.ing.length; j++) {
                    f = el('img'); f.src = imgSrc(charById[rec.ing[j]]); f.alt = ''; f.draggable = false;
                    row.appendChild(f);
                }
                row.appendChild(el('span', 'sop', '='));
                if (done) { f = el('img'); f.src = imgSrc(blend); f.alt = ''; f.draggable = false; row.appendChild(f); }
                else row.appendChild(el('span', 'sq', '?'));
                b.appendChild(row);
                b.appendChild(el('span', 'sname', done ? blend.name : (blend.clue || 'These friends sing well together.')));
                b.setAttribute('aria-label', done ? blend.name + '. Tap to put the friends in the pot.' : 'A new friend to find. ' + (blend.clue || '') + ' Tap to put the friends in the pot.');
                b.onclick = function () {
                    setPot(rec.ing);
                    potOut(null);
                    S.showSuggest = false;
                    renderPot();
                    potMsg('Ready. Tap Mix!');
                };
                box.appendChild(b);
            })(list[i]);
        }
    }
    function syncRareBtn() {
        var b = $('rareBtn');
        b.querySelector('.lbl').textContent = 'Rare friends: ' + (S.rareOn ? 'On' : 'Off');
        b.setAttribute('aria-pressed', S.rareOn ? 'true' : 'false');
        b.className = 'btn wide' + (S.rareOn ? ' on' : '');
    }
    function toggleRare() {
        S.rareOn = !S.rareOn;
        if (!loadingSave) store(RARE_KEY, S.rareOn ? '1' : '0');
        syncRareBtn();
        potMsg(S.rareOn ? 'Rare friends are on. A shimmering one might show up!' : 'Rare friends are off. No shimmer surprises.');
    }

    // ---- Collection: nest, Discovery book, blends you own
    // The nest holds one egg at a time. An egg costs EGG_COST sparks. It hatches by itself after about HATCH_SECS
    // seconds while the game is open and visible, and every tap on it warms it up (WARM_SHAVE seconds sooner). Waiting is optional.
    function unownedBlends() {
        var out = [], i, bl = w.NightliteBlends.chars;
        for (i = 0; i < bl.length; i++) if (!S.owned[bl[i].id]) out.push(bl[i]);
        return out;
    }
    function eggSvg(warm, emptyNest) {
        var s = '<svg viewBox="0 0 100 132" aria-hidden="true" focusable="false">' +
            '<ellipse cx="50" cy="116" rx="46" ry="13" fill="#7a5a3a"/><path d="M8 114 Q50 136 92 114" fill="none" stroke="#a98458" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M14 108 Q30 120 50 120 Q72 120 88 106" fill="none" stroke="#c9a672" stroke-width="3" stroke-linecap="round"/>';
        if (emptyNest) return s.replace('viewBox="0 0 100 132"', 'viewBox="0 96 100 40"') + '</svg>';
        if (warm > 0.2) s += '<ellipse cx="50" cy="66" rx="' + (42 + warm * 8) + '" ry="' + (52 + warm * 8) + '" fill="#ffe9a0" opacity="' + (0.15 + warm * 0.3).toFixed(2) + '"/>';
        s += '<path d="M50 8 C78 8 90 54 90 78 C90 100 72 114 50 114 C28 114 10 100 10 78 C10 54 22 8 50 8Z" fill="#fbf0d8" stroke="#d9b98a" stroke-width="3"/>' +
            '<circle cx="34" cy="62" r="6" fill="#c9b6f2"/><circle cx="64" cy="48" r="5" fill="#f4b6cc"/><circle cx="58" cy="86" r="7" fill="#a8dcc4"/><circle cx="30" cy="92" r="4" fill="#f4b6cc"/><circle cx="72" cy="72" r="3.5" fill="#c9b6f2"/>' +
            '<ellipse cx="38" cy="36" rx="7" ry="11" fill="#fff" opacity="0.5" transform="rotate(18 38 36)"/>';
        if (warm > 0.55) s += '<path d="M30 62 L40 70 L46 60 L54 72 L62 62 L70 70" fill="none" stroke="#b8905c" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
        if (warm > 0.8) s += '<path d="M40 70 L38 82 M54 72 L58 84" stroke="#b8905c" stroke-width="2.2" stroke-linecap="round"/>';
        return s + '</svg>';
    }
    function nestWarmth() { return S.nest ? Math.max(0, Math.min(1, 1 - S.nest.left / HATCH_SECS)) : 0; }
    function nestText() {
        var n = Math.max(1, Math.ceil(S.nest.left));
        return 'Tap the egg to warm it and it hatches sooner. Or just wait, about ' + n + ' second' + (n === 1 ? '' : 's') + '.';
    }
    function updateNestLive() {
        if (S.screen !== 'collect' || !S.nest) return;
        var f = $('nestFill'), t = $('nestText');
        if (f) f.style.width = Math.round(nestWarmth() * 100) + '%';
        if (t) t.textContent = nestText();
    }
    function renderNest() {
        var box = $('nestBox'), r, e, m, f, b;
        box.innerHTML = '';
        if (S.reveal) {
            r = el('div', 'reveal');
            r.id = 'nestReveal';
            if (S.reveal.id) {
                var rc = S.reveal.rare ? charById[R.rareId(S.reveal.id)] : charById[S.reveal.id];
                var im = el('img'); im.src = imgSrc(rc); im.alt = '';
                r.appendChild(im);
                r.appendChild(el('span', '', (S.reveal.rare ? '\u2605 A shimmering RARE ' : 'You hatched ') + charById[S.reveal.id].name + '!'));
                r.appendChild(el('span', 'hint', 'Find it under Blends on any stage.'));
            } else {
                r.appendChild(el('span', '', '\u2728 Twinkle! You already have every blend, so your sparks came back.'));
            }
            box.appendChild(r);
            if (S.reveal.id) burst(r);
        }
        if (S.nest) {
            e = el('button', 'egg warm');
            e.type = 'button'; e.id = 'eggBtn';
            e.innerHTML = eggSvg(nestWarmth());
            e.setAttribute('aria-label', 'Warm the egg');
            e.onclick = warmEgg;
            box.appendChild(e);
            m = el('div', 'meter'); f = el('div', 'fill'); f.id = 'nestFill';
            f.style.width = Math.round(nestWarmth() * 100) + '%';
            m.appendChild(f);
            box.appendChild(m);
            var t = el('p', 'hint', nestText()); t.id = 'nestText';
            box.appendChild(t);
        } else {
            e = el('div', 'egg empty');
            e.innerHTML = eggSvg(0, true);
            box.appendChild(e);
            b = el('button', 'btn primary wide' + (S.sparks < EGG_COST ? ' soft' : ''));
            b.type = 'button'; b.id = 'eggGet';
            b.appendChild(el('span', 'ico', '\uD83E\uDD5A'));
            b.appendChild(el('span', 'lbl', 'Egg (' + EGG_COST + ' \u2728)'));
            b.setAttribute('aria-label', 'Get an egg for ' + EGG_COST + ' sparks');
            b.onclick = getEgg;
            box.appendChild(b);
            box.appendChild(el('p', 'hint', S.sparks < EGG_COST ? 'An egg costs ' + EGG_COST + ' sparks. Wish on a star for more, it is free.' : 'Put an egg in the nest. It hatches a new blend friend.'));
        }
    }
    function getEgg() {
        if (S.nest) return;
        if (S.sparks < EGG_COST) { toast('An egg costs ' + EGG_COST + ' sparks. Wish on a star for more, it is free!'); return; }
        ensureCtx();
        S.reveal = null;
        S.sparks -= EGG_COST;
        if (!unownedBlends().length) {
            // every blend is already yours: a happy twinkle and the sparks come right back
            S.sparks = Math.min(SPARK_CAP, S.sparks + EGG_COST);
            S.reveal = { id: null };
            chime([84, 88, 91, 96, 91]);
        } else {
            S.nest = { left: HATCH_SECS };
            nestSaveAcc = 0;
            chime([72, 76]);
        }
        updateSparkUI(); saveProgress(); renderNest();
    }
    function warmEgg() {
        if (!S.nest) return;
        ensureCtx();
        S.nest.left = Math.max(0, S.nest.left - WARM_SHAVE);
        chime([79]);
        if (S.nest.left <= 0) { hatch(); return; }
        var e = $('eggBtn');
        if (e) {
            e.innerHTML = eggSvg(nestWarmth());
            e.classList.remove('tapped'); void e.offsetWidth; e.classList.add('tapped');
        }
        updateNestLive();
        saveProgress();
    }
    function hatch() {
        var c = unownedBlends(), pick, rare = false;
        S.nest = null;
        if (!c.length) {
            S.sparks = Math.min(SPARK_CAP, S.sparks + EGG_COST);     // nothing new to hatch: the sparks come back
            S.reveal = { id: null };
            chime([84, 88, 91, 96, 91]);
            toast('Twinkle! You already have every blend. Your sparks came back.');
        } else {
            pick = c[Math.floor(Math.random() * c.length)];
            S.owned[pick.id] = true;
            rare = R.roll(w.Math.random, S.rareOn);
            if (rare) S.rares[R.rareId(pick.id)] = true;
            S.reveal = { id: pick.id, rare: rare };
            chime(rare ? [84, 88, 91, 96, 100, 103] : [84, 88, 91, 96]);
            toast('Your egg hatched: ' + (rare ? 'a RARE ' : '') + pick.name + '!');
            if (w.FongCheer) w.FongCheer.cheer('big');
        }
        updateSparkUI(); saveProgress();
        if (S.screen === 'collect') renderCollect();
        else if (S.screen === 'world') renderTiles();
    }
    function renderCollect() {
        renderNest();
        renderBook();
        renderOwned();
        updateSparkUI();
    }
    function faceCard(ch, star) {
        var f = el('span', 'face');
        if (ch) {
            var im = el('img'); im.src = imgSrc(ch); im.alt = ''; im.draggable = false;
            f.appendChild(im);
            if (star) f.appendChild(el('span', 'rstar', '\u2605'));
            f.appendChild(el('span', 'fn', ch.name));
        } else {
            f.appendChild(el('span', 'qm', '?'));
            f.appendChild(el('span', 'fn', '?'));
        }
        return f;
    }
    // Discovery book: page 1 = recipes of base friends only, page 2 = recipes that use a blend. Found recipes show every face,
    // unfound ones show "?" faces (one per ingredient) and the one-line clue.
    function bookBlends(page) {
        var out = [], i, r;
        for (i = 0; i < model.recipes.length; i++) {
            r = model.recipes[i];
            if (r.tier === page) out.push(r);
        }
        return out;
    }
    function renderBook() {
        var box = $('bookBox'), i, j, r, ch, found, row, list, tabs, page = S.bookPage, n = 0, p;
        box.innerHTML = '';
        for (i = 0; i < model.recipes.length; i++) if (S.found[model.recipes[i].key]) n++;
        $('bookCount').textContent = n + ' of ' + model.recipes.length;
        tabs = el('div', 'booktabs');
        for (p = 1; p <= 2; p++) {
            (function (pg) {
                var t = el('button', 'btn' + (page === pg ? ' primary' : ''), 'Page ' + pg);
                t.type = 'button';
                t.setAttribute('aria-pressed', page === pg ? 'true' : 'false');
                t.setAttribute('aria-label', pg === 1 ? 'Book page 1, recipes of the first friends' : 'Book page 2, recipes that use a blend');
                t.onclick = function () { S.bookPage = pg; renderBook(); };
                tabs.appendChild(t);
            })(p);
        }
        box.appendChild(tabs);
        list = bookBlends(page);
        for (i = 0; i < list.length; i++) {
            r = list[i];
            ch = blendById[r.id];
            found = !!S.found[r.key];
            row = el('div', 'recipe' + (found ? ' known' : ' unknown'));
            row.setAttribute('data-blend', ch.id);
            for (j = 0; j < r.ing.length; j++) {
                if (j) row.appendChild(el('span', 'op', '+'));
                row.appendChild(faceCard(found ? charById[r.ing[j]] : null));
            }
            row.appendChild(el('span', 'op', '='));
            row.appendChild(faceCard((found || S.owned[ch.id]) ? ch : null, S.rares[R.rareId(ch.id)] && (found || S.owned[ch.id])));
            if (!found) row.appendChild(el('span', 'clue', ch.clue || 'These friends sing well together.'));
            else row.setAttribute('aria-label', 'Recipe found: ' + ch.name);
            if (!found) row.setAttribute('aria-label', 'A recipe not found yet. ' + (ch.clue || ''));
            box.appendChild(row);
        }
    }
    function renderOwned() {
        var box = $('ownedBox'), rbox = $('rareBox'), bl = w.NightliteBlends.chars, i, ch, c, n = 0, nr = 0;
        box.innerHTML = '';
        rbox.innerHTML = '';
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
            if (S.rares[R.rareId(ch.id)]) {
                nr++;
                var rc = charById[R.rareId(ch.id)], rcard = el('div', 'ocard rare'), rim = el('img');
                rim.src = imgSrc(rc); rim.alt = ch.name + ' (rare)'; rim.draggable = false;
                rcard.appendChild(rim);
                rcard.appendChild(el('span', 'nm', ch.name));
                rcard.appendChild(el('span', 'rstar', '★'));
                rbox.appendChild(rcard);
            }
        }
        $('ownedCount').textContent = n + ' of ' + bl.length;
        $('rareCount').textContent = String(nr);
        $('rareCard').hidden = nr === 0;
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
        var bl = R.collectBlends(w), bases = [], rc;        // old blends plus every NightliteBlendsExtra_* set
        for (id in charById) if (charById.hasOwnProperty(id)) bases.push(charById[id]);
        for (j = 0; j < bl.length; j++) {
            bl[j].world = 'blends';
            bl[j].isBlend = true;
            bl[j].clue = bl[j].clue || 'These friends sing well together.';
            charById[bl[j].id] = bl[j];
            blendById[bl[j].id] = bl[j];
        }
        model = R.build(bases, bl);
        recipeByKey = model.recipeByKey;
        for (j = 0; j < bl.length; j++) {
            bl[j].bpm = model.tempo(bl[j].id, 90);          // tempo of the first ingredient's world, down through blends
            rc = {};                                        // the rare twin: same creature, shimmer colors and a brighter sound
            for (id in bl[j]) if (bl[j].hasOwnProperty(id)) rc[id] = bl[j][id];
            rc.id = R.rareId(bl[j].id); rc.rare = true; rc.baseId = bl[j].id;
            rc.art = w.NightliteArt.rareSpec(bl[j].art);
            rc.synth = R.rareSynth(bl[j].synth);
            charById[rc.id] = rc;
        }
        S.rareOn = store(RARE_KEY) !== '0';
        loadProgress();
        updateSparkUI();
        var vol = parseInt(store('nightlite.vol'), 10);
        if (vol >= 0 && vol <= 100) { S.vol = vol / 100; $('volRange').value = vol; } else { S.vol = 0.7; }
        initConfig();
        applyTheme(DOOR_THEME);
        buildGlow(10);
        renderDoors();
        showScreen('doors');

        $('doorsBtn').onclick = leaveWorld;
        $('backBtn3').onclick = goBack;
        $('backBtn4').onclick = goBack;
        $('mixBtn').onclick = mixPot;
        $('matchBtn').onclick = matchStage;
        $('canBtn').onclick = showSuggestions;
        $('rareBtn').onclick = toggleRare;
        var ps;
        for (ps = 0; ps < POT_SLOTS; ps++) {
            (function (n) { $('potS' + n).onclick = function () { if (S.pot[n]) potPick(S.pot[n]); }; })(ps);
        }
        $('muteBtn').onclick = function () { setMuted(!S.muted); };
        $('volRange').oninput = function () { setVolume(this.value); };
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
        w.Nightlite = { state: S, hatch: hatch, saveProgress: saveProgress, loadProgress: loadProgress, worlds: worlds, addChar: addChar, ensureCtx: ensureCtx, voices: voices, enterWorld: enterWorld, tick: tick, charById: charById, model: model, potPick: potPick };
    }

    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window);
