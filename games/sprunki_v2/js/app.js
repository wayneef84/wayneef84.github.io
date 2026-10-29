/**
 * Sprunki v2 - app logic (strict ES5, no external libraries, works from file://).
 * Packs register themselves in window.SprunkiV2Packs (see js/packs/*.js).
 */
(function (w) {
    var d = document;
    var HORROR_RATE = 0.84;        // everything plays a little slower and lower in spooky mode
    var HORROR_VOLUME = 0.55;      // spooky mode is always quieter
    var HORROR_THEME = { bg1: '#0b0b16', bg2: '#020207', panel: '#15152a', text: '#e6e8f5', accent: '#9a8cf0', slot: '#1c1c36' };
    var CAT_ALL = { id: 'all', label: 'Everyone', icon: '🌈', color: '#5b6cf0' };
    var CATS = [
        { id: 'beats', label: 'Beats', icon: '🥁', color: '#f1c40f' },
        { id: 'effects', label: 'Effects', icon: '✨', color: '#a66bd6' },
        { id: 'melodies', label: 'Melodies', icon: '🎹', color: '#e8743b' },
        { id: 'vocals', label: 'Voices', icon: '🎤', color: '#3498db' },
        { id: 'special', label: 'Mr. Black', icon: '❓', color: '#555a70' }
    ];
    // Mr. Black: shared by every pack. Placing him (with every spot full and a yes/no check) starts spooky mode.
    var MR_BLACK = {
        id: 'mr_black', name: 'Mr. Black', type: 'special',
        art: { body: 'tall', color: '#16161f', eyes: 'big', mouth: 'smile', acc: 'tophat', accColor: '#7a5cd1' },
        synth: { kind: 'layers', amp: 0.7, layers: [
            { kind: 'tone', wave: 'sine', a: 0.8, d: 1.0, seq: [[40, 15]] },
            { kind: 'tone', wave: 'tri', a: 0.9, d: 1.0, lp: 500, amp: 0.5, seq: [[52, 7], null, null, null, null, null, null, null, [47, 8]] },
            { kind: 'voice', seq: [[52, 'u', 15]] }
        ] }
    };

    var S = {
        pack: null, slotCount: 6, slots: [], horror: false, tab: 'beats', bpm: 100,
        vol: 0.8, muted: false, paused: false
    };
    var packs = [], packById = {}, navPacks = [], charById = {};
    // The All tab: a virtual pack holding every character. Neutral look, no season theme.
    var ALL_PACK = {
        id: 'all', label: 'All', icon: '🌈', color: '#5b6cf0', bpm: 100, chars: [],
        theme: { bg1: '#e9eefc', bg2: '#d9f1ea', panel: '#ffffff', text: '#25304a', accent: '#5b6cf0', slot: '#eef1fb' },
        fx: { emoji: '🎶', count: 10, dir: 'rise' }
    };
    var BLACK_COLOR = '#555a70';
    var history = [];
    var ctx = null, mix = null, filt = null, master = null;
    var voices = {};            // slot index -> { src, gain }
    var buffers = {};           // char id -> AudioBuffer
    var t0 = null;              // transport start time
    var toastTimer = null, drag = null, suppressClick = false, memSaves = [];

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

    // ---------------------------------------------------------------- packs
    function charsOf(pack) {
        var out = [], i;
        for (i = 0; i < pack.chars.length; i++) out.push(pack.chars[i]);
        out.push(MR_BLACK);
        return out;
    }
    function findChar(id) {
        if (id === MR_BLACK.id) return MR_BLACK;
        return charById[id] || null;
    }
    function catsFor(p) { return p.id === 'all' ? [CAT_ALL].concat(CATS) : CATS; }
    function catValid(p, id) {
        var cs = catsFor(p), i;
        for (i = 0; i < cs.length; i++) if (cs[i].id === id) return true;
        return false;
    }
    function packColor(ch) {
        if (ch.id === MR_BLACK.id) return BLACK_COLOR;
        var p = packById[ch.packId];
        return (p && p.color) || '#888888';
    }
    function packLabel(ch) { return ch.id === MR_BLACK.id ? 'Mr. Black' : (packById[ch.packId] ? packById[ch.packId].label : ''); }
    // Mixed-pack tempo rule: the stage tempo (S.bpm) is the tempo of the first friend placed on an empty stage.
    function stageEmpty() {
        var i;
        for (i = 0; i < S.slots.length; i++) if (S.slots[i]) return false;
        return true;
    }
    function setStageBpm(b) {
        S.bpm = b || 100;
        d.documentElement.style.setProperty('--beat', (60 / S.bpm / rate()) + 's');
    }
    function barLen() { return 8 * 60 / (S.bpm || 100); }
    function rate() { return S.horror ? HORROR_RATE : 1; }

    // ---------------------------------------------------------------- audio
    function ensureCtx() {
        if (!ctx) {
            var AC = w.AudioContext || w.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
            mix = ctx.createGain();
            filt = ctx.createBiquadFilter();
            filt.type = 'lowpass';
            filt.frequency.value = S.horror ? 1800 : 20000;
            var comp = ctx.createDynamicsCompressor();
            master = ctx.createGain();
            mix.connect(filt); filt.connect(comp); comp.connect(master); master.connect(ctx.destination);
            applyVolume(true);
        }
        if (ctx.state === 'suspended' && !S.paused) { try { ctx.resume(); } catch (e) {} }
        return ctx;
    }
    function applyVolume(instant) {
        if (!ctx) return;
        var v = S.muted ? 0 : S.vol * (S.horror ? HORROR_VOLUME : 1);
        var t = ctx.currentTime;
        if (instant) master.gain.value = v; else master.gain.setTargetAtTime(v, t, 0.04);
        filt.frequency.setTargetAtTime(S.horror ? 1800 : 20000, t, 0.3);
    }
    function hashSeed(s) {
        var h = 7, i;
        for (i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003;
        return h + 1;
    }
    function b64ToBuf(b64) {
        var bin = w.atob(b64), n = bin.length, u = new Uint8Array(n), i;
        for (i = 0; i < n; i++) u[i] = bin.charCodeAt(i);
        return u.buffer;
    }
    function getBuffer(ch, cb) {
        if (!ch.synth && buffers[ch.id]) { cb(buffers[ch.id]); return; }
        if (ch.synth) {
            var key = ch.id + '@' + S.bpm;
            if (buffers[key]) { cb(buffers[key]); return; }
            var r = w.SprunkiSynth.render(ch.synth, S.bpm, hashSeed(ch.id));
            var b = ctx.createBuffer(1, r.data.length, r.rate);
            b.getChannelData(0).set(r.data);
            buffers[key] = b;
            cb(b);
            return;
        }
        var data = w.SprunkiV2Audio && w.SprunkiV2Audio[ch.audio];
        if (!data) { cb(null); return; }
        ctx.decodeAudioData(b64ToBuf(data), function (b2) { buffers[ch.id] = b2; cb(b2); }, function () { cb(null); });
    }
    function nextBoundary() {
        var now = ctx.currentTime, L = barLen() / rate();
        if (t0 === null || !anyVoice()) { t0 = now + 0.06; return t0; }
        var n = Math.ceil((now - t0) / L), when = t0 + n * L;
        if (when - now < 0.04) when += L;
        return when;
    }
    function anyVoice() {
        var k;
        for (k in voices) if (voices.hasOwnProperty(k)) return true;
        return false;
    }
    function stopVoice(i) {
        var v = voices[i];
        if (!v) return;
        delete voices[i];
        try {
            var t = ctx.currentTime;
            v.gain.gain.cancelScheduledValues(t);
            v.gain.gain.setTargetAtTime(0, t, 0.02);
            v.src.stop(t + 0.15);
        } catch (e) {}
    }
    function startVoice(i) {
        var id = S.slots[i];
        if (!id || !ensureCtx()) return;
        var ch = findChar(id);
        getBuffer(ch, function (buf) {
            if (!buf || S.slots[i] !== id) return;
            stopVoice(i);
            var src = ctx.createBufferSource(), g = ctx.createGain();
            // Synth loops are rendered at the stage tempo. Fixed loops (Classic) keep their own bar and are
            // sped up or slowed down a little (stretch) so they stay in time with the stage.
            var nativeBpm = ch.synth ? S.bpm : (ch.bpm || 100), stretch = S.bpm / nativeBpm, bar = 8 * 60 / nativeBpm;
            var bars = Math.max(1, Math.round(buf.duration / bar));
            src.buffer = buf;
            src.loop = true;
            src.loopStart = 0;
            src.loopEnd = Math.min(buf.duration, bars * bar);
            src.playbackRate.value = rate() * stretch;
            src.connect(g); g.connect(mix);
            var when = nextBoundary();
            g.gain.setValueAtTime(0, when);
            g.gain.linearRampToValueAtTime(id === MR_BLACK.id ? 0.8 : 1, when + 0.04);
            src.start(when);
            voices[i] = { src: src, gain: g, stretch: stretch };
        });
    }
    function setAllRates() {
        if (!ctx) return;
        var now = ctx.currentTime, k, L = barLen();
        if (t0 !== null) {   // keep the bar grid lined up with the playing loops
            var oldRate = S.horror ? 1 : HORROR_RATE;
            var frac = (((now - t0) % (L / oldRate)) / (L / oldRate));
            t0 = now - frac * (L / rate());
        }
        for (k in voices) if (voices.hasOwnProperty(k)) voices[k].src.playbackRate.setTargetAtTime(rate() * (voices[k].stretch || 1), now, 0.35);
    }

    // ---------------------------------------------------------------- drawing
    function imgSrc(ch) {
        if (ch.img) return ch.img;
        return w.SprunkiArt.dataUri(w.SprunkiArt.make(ch.art, S.horror));
    }
    function onStageIdx(id) {
        var i;
        for (i = 0; i < S.slotCount; i++) if (S.slots[i] === id) return i;
        return -1;
    }
    function firstEmpty() {
        var i;
        for (i = 0; i < S.slotCount; i++) if (!S.slots[i]) return i;
        return -1;
    }
    function allFull() { return firstEmpty() === -1; }

    function renderStage() {
        var st = $('stage'), i;
        st.innerHTML = '';
        for (i = 0; i < S.slotCount; i++) {
            (function (idx) {
                var id = S.slots[idx], ch = id ? findChar(id) : null;
                var b = el('button', 'slot' + (ch ? ' on' : ''));
                b.type = 'button';
                b.setAttribute('data-slot', idx);
                if (ch) {
                    var im = el('img', ch.img ? 'photo' : '');
                    im.src = imgSrc(ch); im.alt = ch.name; im.draggable = false;
                    b.appendChild(im);
                    b.appendChild(el('span', 'nm', ch.name));
                    if (id !== MR_BLACK.id) b.appendChild(el('span', 'x', '×'));
                    b.setAttribute('aria-label', ch.name + ' on spot ' + (idx + 1) + (id === MR_BLACK.id ? '' : '. Tap to remove.'));
                } else {
                    b.appendChild(el('span', 'plus', '+'));
                    b.setAttribute('aria-label', 'Empty spot ' + (idx + 1));
                }
                b.onclick = function () {
                    var cur = S.slots[idx];
                    if (cur && cur !== MR_BLACK.id) removeAt(idx);
                    else if (cur === MR_BLACK.id) toast('Mr. Black stays until you tap Exit spooky mode.');
                };
                st.appendChild(b);
            })(i);
        }
        $('slotCount').textContent = S.slotCount;
    }

    function renderTabs() {
        var tabs = $('tabs'), i;
        tabs.innerHTML = '';
        var cl = catsFor(S.pack);
        for (i = 0; i < cl.length; i++) {
            (function (c) {
                var b = el('button', 'tab' + (S.tab === c.id ? ' sel' : ''));
                b.type = 'button';
                b.setAttribute('role', 'tab');
                b.setAttribute('aria-selected', S.tab === c.id ? 'true' : 'false');
                b.style.setProperty('--cat', c.color);
                b.appendChild(el('span', 'ico', c.icon));
                b.appendChild(el('span', 'lbl', c.label));
                b.onclick = function () { S.tab = c.id; renderTabs(); renderTiles(); };
                tabs.appendChild(b);
            })(cl[i]);
        }
    }

    function renderTiles() {
        var box = $('tiles'), list = charsOf(S.pack), n = 0, i, isAll = S.pack.id === 'all';
        box.innerHTML = '';
        box.className = 'tiles' + (isAll ? ' allmode' : '');
        var color = '#888', c, cl = catsFor(S.pack);
        for (c = 0; c < cl.length; c++) if (cl[c].id === S.tab) color = cl[c].color;
        for (i = 0; i < list.length; i++) {
            if (S.tab !== 'all' && list[i].type !== S.tab) continue;
            (function (ch, num) {
                var used = onStageIdx(ch.id) >= 0;
                var b = el('button', 'tile' + (used ? ' used' : ''));
                b.type = 'button';
                b.id = 'tile-' + ch.id;
                b.style.setProperty('--cat', color);
                if (isAll) {
                    var pc = packColor(ch);
                    b.style.setProperty('--pk', pc);
                    b.style.setProperty('--pkt', lum(pc) > 0.62 ? '#161616' : '#ffffff');
                    b.appendChild(el('span', packLabel(ch).length > 11 ? 'pk long' : 'pk', packLabel(ch)));
                }
                var im = el('img', ch.img ? 'photo' : '');
                im.src = imgSrc(ch); im.alt = ''; im.draggable = false;
                b.appendChild(im);
                b.appendChild(el('span', 'nm', ch.name));
                if (num <= 9) b.appendChild(el('span', 'key', String(num)));
                b.setAttribute('aria-pressed', used ? 'true' : 'false');
                b.setAttribute('aria-label', (isAll ? packLabel(ch) + ' ' : '') + ch.name + (used ? ', on stage. Tap to remove.' : '. Tap to add.'));
                b.onclick = function () {
                    if (suppressClick) return;
                    tileAction(ch);
                };
                bindDrag(b, ch);
                box.appendChild(b);
            })(list[i], ++n);
        }
    }
    function tileAction(ch) {
        var idx = onStageIdx(ch.id);
        if (idx >= 0) { if (ch.id !== MR_BLACK.id) removeAt(idx); else toast('Mr. Black stays until you tap Exit spooky mode.'); }
        else addChar(ch);
    }
    function refreshTray() { renderTiles(); }

    // ---------------------------------------------------------------- history / actions
    function snapshot() { return { pack: S.pack.id, bpm: S.bpm, slotCount: S.slotCount, slots: S.slots.slice(0, S.slotCount) }; }
    function pushHistory() {
        if (S.horror) return;
        history.push(snapshot());
        if (history.length > 40) history.shift();
        updateButtons();
    }
    function updateButtons() {
        $('undoBtn').disabled = S.horror || history.length === 0;
        $('slotMinus').disabled = S.horror || S.slotCount <= 3;
        $('slotPlus').disabled = S.horror || S.slotCount >= 12;
        $('saveBtn').disabled = S.horror;
    }
    function stopAllVoices() {
        var k;
        for (k in voices) if (voices.hasOwnProperty(k)) stopVoice(k);
        t0 = null;
    }
    function afterChange() { renderStage(); refreshTray(); updateButtons(); }

    function addChar(ch, slotIdx) {
        if (ch.id === MR_BLACK.id) { tryBlack(slotIdx); return; }
        if (onStageIdx(ch.id) >= 0) return;
        var idx = (slotIdx === undefined || slotIdx === null) ? firstEmpty() : slotIdx;
        if (S.horror && S.slots[idx] === MR_BLACK.id) idx = -1;
        if (idx < 0) {
            var st = $('stage'); st.classList.add('shake');
            w.setTimeout(function () { st.classList.remove('shake'); }, 400);
            toast('The stage is full. Tap a friend to send them home.');
            return;
        }
        ensureCtx();
        pushHistory();
        if (S.slots[idx]) stopVoice(idx);
        if (stageEmpty()) setStageBpm(ch.bpm);
        S.slots[idx] = ch.id;
        afterChange();
        startVoice(idx);
        if (S.paused) setPaused(false);
    }
    function removeAt(idx) {
        if (!S.slots[idx] || S.slots[idx] === MR_BLACK.id) return;
        pushHistory();
        stopVoice(idx);
        S.slots[idx] = null;
        if (!anyVoice()) t0 = null;
        afterChange();
    }
    function clearAll(keepHistory) {
        if (S.horror) exitHorror(true);
        if (!keepHistory) pushHistory();
        stopAllVoices();
        S.slots = [];
        afterChange();
    }
    function restore(snap) {
        if (S.horror) exitHorror(true);
        stopAllVoices();
        if (snap.pack !== S.pack.id && packById[snap.pack]) setPack(packById[snap.pack], true);
        S.slotCount = snap.slotCount;
        S.slots = snap.slots.slice();
        setStageBpm(snap.bpm || firstSlotBpm() || S.pack.bpm);
        afterChange();
        var i;
        for (i = 0; i < S.slotCount; i++) if (S.slots[i]) startVoice(i);
    }
    function firstSlotBpm() {
        var i, ch;
        for (i = 0; i < S.slots.length; i++) if (S.slots[i]) { ch = findChar(S.slots[i]); if (ch && ch.id !== MR_BLACK.id) return ch.bpm; }
        return 0;
    }
    function undo() {
        if (S.horror) { toast('Exit spooky mode to use Undo.'); return; }
        if (!history.length) { toast('Nothing to undo.'); return; }
        var snap = history.pop();
        restore(snap);
        updateButtons();
    }
    function changeSlots(delta) {
        if (S.horror) return;
        var n = S.slotCount + delta, i;
        if (n < 3 || n > 12) return;
        for (i = n; i < S.slotCount; i++) if (S.slots[i]) { toast('Send a friend home first to have fewer spots.'); return; }
        pushHistory();
        S.slotCount = n;
        S.slots.length = Math.min(S.slots.length, n);
        afterChange();
        store('sprunkiV2.slots', String(n));
    }

    // ---------------------------------------------------------------- packs / theme
    function lum(hex) {
        var h = hex.replace('#', ''), r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    function applyTheme() {
        var t = S.horror ? HORROR_THEME : S.pack.theme, r = d.documentElement.style;
        r.setProperty('--bg1', t.bg1); r.setProperty('--bg2', t.bg2); r.setProperty('--panel', t.panel);
        r.setProperty('--text', t.text); r.setProperty('--accent', t.accent); r.setProperty('--slot', t.slot);
        r.setProperty('--onaccent', lum(t.accent) > 0.62 ? '#161616' : '#ffffff');
        r.setProperty('--beat', (60 / (S.bpm || 100) / rate()) + 's');
        d.body.className = (S.horror ? 'horror ' : '') + 'pack-' + S.pack.id + (S.paused ? ' paused' : '');
        buildFx();
    }
    function buildFx() {
        var fx = $('fx'), fog = $('fog'), i, p, f = S.pack.fx;
        fx.innerHTML = ''; fog.innerHTML = '';
        if (S.horror) {
            for (i = 0; i < 4; i++) {
                p = el('div', 'eyes');
                p.style.left = (10 + Math.random() * 75) + '%';
                p.style.top = (6 + Math.random() * 30) + '%';
                p.style.animationDelay = (-Math.random() * 8) + 's';
                p.appendChild(el('i')); p.appendChild(el('i'));
                fog.appendChild(p);
            }
            return;
        }
        if (!f) return;
        for (i = 0; i < f.count; i++) {
            p = el('div', 'p ' + f.dir, f.emoji);
            p.style.left = (Math.random() * 96) + '%';
            p.style.fontSize = (14 + Math.random() * 18) + 'px';
            p.style.animationDuration = (9 + Math.random() * 10) + 's';
            p.style.animationDelay = (-Math.random() * 16) + 's';
            fx.appendChild(p);
        }
    }
    function switchPack(p) {
        if (p.id === S.pack.id) return;
        pushHistory();
        if (S.horror) exitHorror(true);
        stopAllVoices();
        S.slots = [];
        setPack(p);
        afterChange();
        store('sprunkiV2.pack', p.id);
    }
    // Shift+number / Shift+arrows. delta is -1 or 1 (wraps), or index is a 0-based tab number.
    function gotoTab(index, delta) {
        if (S.horror) { toast('Tap Exit spooky mode first.'); return; }
        var cur = 0, i;
        for (i = 0; i < navPacks.length; i++) if (navPacks[i].id === S.pack.id) cur = i;
        var to = delta ? (cur + delta + navPacks.length) % navPacks.length : index;
        if (to < 0 || to >= navPacks.length) return;
        switchPack(navPacks[to]);
    }
    function renderSeasons() {
        var nav = $('seasons'), i;
        nav.innerHTML = '';
        for (i = 0; i < navPacks.length; i++) {
            (function (p, pos) {
                var b = el('button', 'btn season' + (S.pack && S.pack.id === p.id ? ' sel' : ''));
                b.type = 'button';
                b.setAttribute('aria-pressed', S.pack && S.pack.id === p.id ? 'true' : 'false');
                b.appendChild(el('span', 'ico', p.icon));
                b.appendChild(el('span', 'lbl', p.label));
                b.style.setProperty('--pk', p.color || p.theme.accent);
                if (pos < 10) b.appendChild(el('span', 'kbd', '\u21E7' + ((pos + 1) % 10)));
                b.onclick = function () {
                    if (p.id === S.pack.id) return;
                    switchPack(p);
                };
                nav.appendChild(b);
            })(navPacks[i], i);
        }
        var selb = nav.querySelector('.sel');
        if (selb && selb.scrollIntoView) { try { selb.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
    }
    function setPack(p, keepTab) {
        S.pack = p;
        if (!keepTab) S.tab = (p.id === 'all') ? 'all' : (S.tab === 'special' || S.tab === 'all' ? 'beats' : S.tab);
        else if (!catValid(p, S.tab)) S.tab = (p.id === 'all') ? 'all' : 'beats';
        setStageBpm(p.bpm);
        applyTheme();
        renderSeasons();
        renderTabs();
        renderTiles();
    }

    // ---------------------------------------------------------------- spooky mode (Mr. Black)
    function tryBlack(slotIdx) {
        if (S.horror) return;
        if (!allFull()) {
            toast('Mr. Black says: fill every spot with friends first!');
            return;
        }
        openModal('Mr. Black is here', 'He would like to make the stage a little spooky. It is only pretend, and you can leave with one tap. Ready?',
            [{ label: 'No thanks', cls: 'primary' }, { label: 'Yes, spooky', cb: function () { enterHorror(slotIdx); } }]);
    }
    function enterHorror(slotIdx) {
        var idx = (slotIdx === undefined || slotIdx === null || slotIdx >= S.slotCount) ? S.slotCount - 1 : slotIdx;
        var fade = $('fade');
        fade.className = 'fade dark';
        w.setTimeout(function () {
            ensureCtx();
            stopVoice(idx);
            S.slots[idx] = MR_BLACK.id;
            S.horror = true;
            history = [];
            applyTheme();
            applyVolume();
            setAllRates();
            $('exitHorror').hidden = false;
            afterChange();
            startVoice(idx);
            renderTabs();
            fade.className = 'fade';
        }, 1300);
    }
    function exitHorror(quiet) {
        if (!S.horror) return;
        var i;
        for (i = 0; i < S.slotCount; i++) if (S.slots[i] === MR_BLACK.id) { stopVoice(i); S.slots[i] = null; }
        S.horror = false;
        history = [];
        $('exitHorror').hidden = true;
        applyTheme();
        applyVolume();
        setAllRates();
        if (S.tab === 'special') S.tab = (S.pack.id === 'all') ? 'all' : 'beats';
        renderTabs();
        afterChange();
        if (!quiet) toast('Back to normal. Phew!');
    }

    // ---------------------------------------------------------------- save / load
    function readSaves() {
        var raw = store('sprunkiV2.saves'), arr = null;
        if (raw) { try { arr = JSON.parse(raw); } catch (e) { arr = null; } }
        return (arr instanceof Array) ? arr : memSaves;
    }
    function writeSaves(arr) {
        memSaves = arr;
        store('sprunkiV2.saves', JSON.stringify(arr));
    }
    function saveMix() {
        if (S.horror) { toast('Exit spooky mode to save.'); return; }
        var snap = snapshot(), n = 0, i;
        for (i = 0; i < snap.slots.length; i++) if (snap.slots[i]) n++;
        if (!n) { toast('Add some friends first, then save.'); return; }
        var arr = readSaves().slice(), num = (parseInt(store('sprunkiV2.saveNum'), 10) || 0) + 1;
        snap.name = 'Mix ' + num + ' (' + S.pack.label + ')';
        snap.time = new Date().getTime();
        arr.unshift(snap);
        if (arr.length > 8) arr.length = 8;
        writeSaves(arr);
        store('sprunkiV2.saveNum', String(num));
        toast('Saved as "' + snap.name + '".');
    }
    function loadDialog() {
        var arr = readSaves(), body = el('div', 'saves'), i;
        if (!arr.length) body.appendChild(el('p', '', 'No saved mixes yet. Make one and tap Save.'));
        for (i = 0; i < arr.length; i++) {
            (function (snap, idx) {
                var row = el('div', 'save-row');
                row.appendChild(el('span', 'save-name', snap.name));
                var lb = el('button', 'btn primary', 'Load'); lb.type = 'button';
                lb.onclick = function () { closeModal(); pushHistory(); restore(snap); startAllAfterRestore(); };
                var db = el('button', 'btn', 'Delete'); db.type = 'button';
                db.onclick = function () { var a = readSaves().slice(); a.splice(idx, 1); writeSaves(a); closeModal(); loadDialog(); };
                row.appendChild(lb); row.appendChild(db);
                body.appendChild(row);
            })(arr[i], i);
        }
        openModal('Saved mixes', body, [{ label: 'Close', cls: 'primary' }]);
    }
    function startAllAfterRestore() { if (S.paused) setPaused(false); }

    // ---------------------------------------------------------------- transport buttons
    function setPaused(p) {
        S.paused = p;
        $('playBtn').querySelector('.ico').textContent = p ? '▶' : '⏸';
        $('playBtn').querySelector('.lbl').textContent = p ? 'Play' : 'Pause';
        d.body.className = d.body.className.replace(/ ?paused/, '') + (p ? ' paused' : '');
        if (ctx) { try { if (p) ctx.suspend(); else ctx.resume(); } catch (e) {} }
    }
    function setMuted(m) {
        S.muted = m;
        $('muteBtn').querySelector('.ico').textContent = m ? '🔇' : '🔊';
        $('muteBtn').querySelector('.lbl').textContent = m ? 'Unmute' : 'Mute';
        $('muteBtn').setAttribute('aria-pressed', m ? 'true' : 'false');
        applyVolume();
    }

    // ---------------------------------------------------------------- toast / modal
    function toast(msg) {
        var t = $('toast');
        t.textContent = msg;
        t.className = 'toast show';
        if (toastTimer) w.clearTimeout(toastTimer);
        toastTimer = w.setTimeout(function () { t.className = 'toast'; }, 2800);
    }
    function openModal(title, body, buttons) {
        $('modalTitle').textContent = title;
        var mb = $('modalBody'), bt = $('modalBtns'), i;
        mb.innerHTML = '';
        if (typeof body === 'string') mb.appendChild(el('p', '', body)); else mb.appendChild(body);
        bt.innerHTML = '';
        for (i = 0; i < buttons.length; i++) {
            (function (b) {
                var x = el('button', 'btn ' + (b.cls || ''), b.label);
                x.type = 'button';
                x.onclick = function () { closeModal(); if (b.cb) b.cb(); };
                bt.appendChild(x);
            })(buttons[i]);
        }
        $('modal').hidden = false;
        var first = bt.querySelector('button');
        if (first) first.focus();
    }
    function closeModal() { $('modal').hidden = true; }
    function helpDialog() {
        var ul = el('ul', 'keys'), rows = [
            ['Tap a friend', 'put them on the stage'], ['Tap them again', 'send them home'],
            ['Drag', 'drop a friend on any spot'], ['1 to 9', 'add that friend in the open list'],
            [', and .', 'change the list (Beats, Effects...)'],
            ['Shift + 1 to 9, Shift + 0', 'jump to pack tab 1 to 10 (1 is All)'], ['Shift + Left or Right', 'step through the pack tabs'], ['Space', 'play or pause'], ['M', 'mute'],
            ['Z', 'undo'], ['R', 'reset the stage'], ['S and L', 'save and load'], ['Esc', 'close this or leave spooky mode']
        ], i;
        for (i = 0; i < rows.length; i++) {
            var li = el('li'); li.appendChild(el('b', '', rows[i][0])); li.appendChild(d.createTextNode(' - ' + rows[i][1])); ul.appendChild(li);
        }
        openModal('How to play', ul, [{ label: 'Got it', cls: 'primary' }]);
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

    // ---------------------------------------------------------------- keyboard
    function tilesNow() { return $('tiles').querySelectorAll('.tile'); }
    function onKey(e) {
        if (e.altKey || e.metaKey && e.key !== 'z') return;
        var k = e.key, tag = d.activeElement ? d.activeElement.tagName : '';
        if (k === 'Escape') {
            if (!$('modal').hidden) closeModal(); else if (S.horror) exitHorror();
            return;
        }
        if (!$('modal').hidden) return;
        if ((e.ctrlKey || e.metaKey) && (k === 'z' || k === 'Z')) { e.preventDefault(); undo(); return; }
        if (e.ctrlKey) return;
        if (k === ' ' && tag !== 'BUTTON' && tag !== 'INPUT' && tag !== 'A') { e.preventDefault(); setPaused(!S.paused); return; }
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (d.activeElement && d.activeElement.isContentEditable)) return;
        if (e.shiftKey && !e.ctrlKey) {
            // Shift+1..9 and Shift+0 jump to tab 1..10 (event.code, because Shift changes event.key). Shift+Left/Right step.
            var m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code || '');
            if (m) { e.preventDefault(); if (!e.repeat) gotoTab(m[1] === '0' ? 9 : parseInt(m[1], 10) - 1, 0); return; }
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { e.preventDefault(); if (!e.repeat) gotoTab(0, e.code === 'ArrowRight' ? 1 : -1); return; }
        }
        var lk = k.toLowerCase(), n;
        if (lk === 'm') setMuted(!S.muted);
        else if (lk === 'z') undo();
        else if (lk === 'r') clearAll();
        else if (lk === 's') saveMix();
        else if (lk === 'l') loadDialog();
        else if (lk === '?' || lk === 'h') helpDialog();
        else if (k === ',' || k === '.') {
            var i, cur = 0;
            var cl = catsFor(S.pack);
            for (i = 0; i < cl.length; i++) if (cl[i].id === S.tab) cur = i;
            cur = (cur + (k === '.' ? 1 : cl.length - 1)) % cl.length;
            S.tab = cl[cur].id; renderTabs(); renderTiles();
        } else if (k >= '1' && k <= '9') {
            n = parseInt(k, 10) - 1;
            var ts = tilesNow();
            if (ts[n]) ts[n].click();
        }
    }

    // ---------------------------------------------------------------- init
    function init() {
        packs = (w.SprunkiV2Packs || []).slice().sort(function (a, b) { return a.order - b.order; });
        var i;
        var j, pk, ch2;
        for (i = 0; i < packs.length; i++) {
            pk = packs[i];
            packById[pk.id] = pk;
            if (!pk.color) pk.color = pk.theme.accent;
            for (j = 0; j < pk.chars.length; j++) {
                ch2 = pk.chars[j];
                ch2.packId = pk.id;
                ch2.bpm = pk.bpm || 100;
                charById[ch2.id] = ch2;
                ALL_PACK.chars.push(ch2);
            }
        }
        packById.all = ALL_PACK;
        navPacks = [ALL_PACK].concat(packs);
        var n = parseInt(store('sprunkiV2.slots'), 10);
        if (n >= 3 && n <= 12) S.slotCount = n;
        var vol = parseInt(store('sprunkiV2.vol'), 10);
        if (vol >= 0 && vol <= 100) { S.vol = vol / 100; $('volRange').value = vol; }
        var start = packById[store('sprunkiV2.pack')] || packs[0];
        setPack(start);
        afterChange();

        $('playBtn').onclick = function () { ensureCtx(); setPaused(!S.paused); };
        $('muteBtn').onclick = function () { setMuted(!S.muted); };
        $('volRange').oninput = function () {
            S.vol = this.value / 100;
            if (S.muted && S.vol > 0) setMuted(false); else applyVolume();
            store('sprunkiV2.vol', String(this.value));
        };
        $('undoBtn').onclick = undo;
        $('resetBtn').onclick = function () { clearAll(); toast('Stage cleared. Tap Undo to bring it back.'); };
        $('saveBtn').onclick = saveMix;
        $('loadBtn').onclick = loadDialog;
        $('slotMinus').onclick = function () { changeSlots(-1); };
        $('slotPlus').onclick = function () { changeSlots(1); };
        $('exitHorror').onclick = function () { exitHorror(); };
        $('helpBtn').onclick = helpDialog;
        $('modal').onclick = function (e) { if (e.target === this) closeModal(); };
        d.addEventListener('keydown', onKey);
        updateButtons();

        // Test/debug hook (not used by the UI).
        w.SprunkiV2 = { state: S, packs: packs, addChar: addChar, findChar: findChar, ensureCtx: ensureCtx, voices: voices };
    }

    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window);
