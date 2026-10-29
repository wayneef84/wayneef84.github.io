/**
 * FongCheer: a parent-controlled spoken cheer for kids' games.
 * Global: window.FongCheer. Strict ES5. No network, no analytics, no CDN.
 *
 * API
 *   FongCheer.cheer(kind)   kind: 'start' | 'good' | 'big' | 'done' | 'again'
 *   FongCheer.say(text)     speak and caption one line (only when Cheers is on)
 *   FongCheer.isOn()        true when a parent has turned Cheers on
 *   FongCheer.openSettings() parent gate, then the Cheer settings panel
 *
 * Off by default. A parent turns it on. The child's name is typed on the device and
 * lives only in localStorage key "fong.cheer.v1". It is never in the code or the repo.
 * Speech uses the browser's speechSynthesis and fails silently when it is missing.
 * See docs/CHEER.md.
 */
(function (win, doc) {
    'use strict';
    if (win.FongCheer) { return; }

    var KEY = 'fong.cheer.v1';
    var KINDS = ['start', 'good', 'big', 'done', 'again'];
    var KIND_LABEL = { start: 'Start of play', good: 'Good move', big: 'Big moment', done: 'All done', again: 'Gentle try-again' };
    var MIN_GAP = 2500;          // per kind
    var GLOBAL_GAP = 1500;       // between small cheers ('good' and 'again')
    var CAPTION_MS = 2400;
    var MAX_PHRASES = 20;
    var MAX_PHRASE_LEN = 80;
    var MAX_NAME_LEN = 24;

    // Always positive. {name} is dropped cleanly when no name is set.
    var DEFAULTS = {
        start: ['Go {name}!', 'Go {name}, go!', "Let's play, {name}!", 'Ready, set, sparkle!', 'Here we go, {name}!', "You've got this, {name}!"],
        good: ['Nice job, {name}!', "You're golden, {name}!", 'Amazing, {name}!', 'That was awesome!', 'High five!', 'Yay, {name}!',
            'Super sparkly!', 'Look at you go, {name}!', 'Wow, great one!'],
        big: ["You're a star!", 'Wow, {name}, that was huge!', 'Incredible, {name}!', 'Hooray, {name}!', "You're a superstar, {name}!",
            'Fantastic, {name}!', 'That was magical!', 'Sparkle, sparkle, wow!'],
        done: ['{name}, you did it!', 'You did it, {name}! High five!', 'All finished. Great work, {name}!', 'Hooray, you finished!',
            'What a champion, {name}!', 'Super job, {name}!'],
        again: ['What a great try!', 'Nice spin, {name}!', "You're doing great, {name}!", "Keep going, you've got this!",
            'Playing is the fun part!', 'Great job, {name}!']
    };

    var mem = null;              // used when localStorage is blocked
    var cfg = null;
    var lastAt = {};
    var lastGlobal = 0;
    var lastIdx = {};
    var capTimer = null;
    var voices = [];
    var styleDone = false;
    var panel = null;
    var gateEl = null;
    var lastFocus = null;

    function now() { return new Date().getTime(); }

    function blank() {
        return { on: false, name: '', say: '', voice: '', vol: 0.8, speak: true, caption: true, phrases: {} };
    }

    function clean(s, max) {
        s = String(s === undefined || s === null ? '' : s);
        s = s.replace(/[\u0000-\u001f<>{}]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        return s.length > max ? s.substr(0, max) : s;
    }

    function load() {
        var c = blank();
        var raw = null;
        try { raw = win.localStorage.getItem(KEY); } catch (e) { raw = null; }
        if (raw === null && mem) { raw = mem; }
        if (raw) {
            try {
                var o = JSON.parse(raw);
                if (o && typeof o === 'object') {
                    c.on = o.on === true;
                    c.name = clean(o.name, MAX_NAME_LEN);
                    c.say = clean(o.say, MAX_NAME_LEN);
                    c.voice = clean(o.voice, 200);
                    var v = Number(o.vol);
                    c.vol = (v >= 0.1 && v <= 1) ? v : 0.8;
                    c.speak = o.speak !== false;
                    c.caption = o.caption !== false;
                    if (o.phrases && typeof o.phrases === 'object') {
                        for (var i = 0; i < KINDS.length; i++) {
                            var arr = o.phrases[KINDS[i]];
                            if (arr && arr.length) { c.phrases[KINDS[i]] = cleanList(arr); }
                        }
                    }
                }
            } catch (e2) { /* bad data: use defaults */ }
        }
        return c;
    }

    function cleanList(arr) {
        var out = [];
        for (var i = 0; i < arr.length && out.length < MAX_PHRASES; i++) {
            var t = String(arr[i]).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
            if (t.length > MAX_PHRASE_LEN) { t = t.substr(0, MAX_PHRASE_LEN); }
            if (t) { out.push(t); }
        }
        return out;
    }

    function save() {
        var s = JSON.stringify(cfg);
        mem = s;
        try { win.localStorage.setItem(KEY, s); } catch (e) { /* blocked: stays in memory this visit */ }
    }

    function ensure() { if (!cfg) { cfg = load(); } return cfg; }

    function list(kind) {
        ensure();
        var mine = cfg.phrases[kind];
        return (mine && mine.length) ? mine : DEFAULTS[kind];
    }

    /** Fill {name}. With no name, remove it and the comma around it. */
    function fill(tpl, name) {
        var s = String(tpl);
        if (name) { return s.replace(/\{name\}/g, name); }
        s = s.replace(/,\s*\{name\}/g, '').replace(/\{name\},\s*/g, '').replace(/\s*\{name\}/g, '').replace(/\{name\}/g, '');
        s = s.replace(/^\s+|\s+$/g, '');
        return s.charAt(0).toUpperCase() + s.substr(1);
    }

    function pick(kind) {
        var arr = list(kind);
        var i = Math.floor(Math.random() * arr.length);
        if (arr.length > 1 && i === lastIdx[kind]) { i = (i + 1) % arr.length; }
        lastIdx[kind] = i;
        return arr[i];
    }

    /* ---------------- speech ---------------- */

    function synth() {
        try { return (win.speechSynthesis && win.SpeechSynthesisUtterance) ? win.speechSynthesis : null; } catch (e) { return null; }
    }

    function refreshVoices() {
        var s = synth();
        var all = [];
        try { all = s ? (s.getVoices() || []) : []; } catch (e) { all = []; }
        voices = [];
        for (var i = 0; i < all.length; i++) {
            if (/^en([-_]|$)/i.test(all[i].lang || '')) { voices.push(all[i]); }
        }
    }

    function chooseVoice() {
        if (!voices.length) { refreshVoices(); }
        var i;
        if (cfg.voice) {
            for (i = 0; i < voices.length; i++) { if (voices[i].name === cfg.voice) { return voices[i]; } }
        }
        var friendly = /samantha|karen|moira|tessa|serena|fiona|zira|aria|jenny|google us english|google uk english female|female/i;
        for (i = 0; i < voices.length; i++) { if (friendly.test(voices[i].name) && /^en[-_]?(US|GB|AU)?/i.test(voices[i].lang)) { return voices[i]; } }
        for (i = 0; i < voices.length; i++) { if (/^en[-_]US$/i.test(voices[i].lang)) { return voices[i]; } }
        return voices.length ? voices[0] : null;
    }

    function speakNow(text) {
        var s = synth();
        if (!s || !text) { return false; }
        try {
            s.cancel();
            var u = new win.SpeechSynthesisUtterance(text);
            var v = chooseVoice();
            if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-US'; }
            u.rate = 1.0;
            u.pitch = 1.2;
            u.volume = Math.max(0.1, Math.min(1, cfg.vol));
            s.speak(u);
            return true;
        } catch (e) { return false; }
    }

    /* ---------------- caption ---------------- */

    function ensureStyle() {
        if (styleDone || !doc.head) { return; }
        styleDone = true;
        var css = [
            '.fc-cap{position:fixed;left:50%;top:max(14%,calc(env(safe-area-inset-top) + 56px));transform:translateX(-50%);z-index:2147483000;max-width:92vw;padding:6px 20px;',
            'border-radius:26px;background:var(--accent,#ff7ac8);color:var(--ink,#3b0f33);font:700 clamp(26px,8vw,40px)/1.2 Nunito,ui-rounded,system-ui,sans-serif;',
            'text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:none;opacity:0;visibility:hidden}',
            '.fc-cap.show{opacity:1;visibility:visible;animation:fc-pop .35s ease-out both}',
            '@keyframes fc-pop{from{transform:translateX(-50%) scale(.85);opacity:0}to{transform:translateX(-50%) scale(1);opacity:1}}',
            '@media (prefers-reduced-motion:reduce){.fc-cap.show{animation:none}}',
            '.calm-on .fc-cap.show{animation:none}',
            '.fc-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;padding:0 14px;font:700 15px/1 Nunito,ui-rounded,system-ui,sans-serif;',
            'color:inherit;background:rgba(0,0,0,.28);border:2px solid var(--accent,#ff7ac8);border-radius:22px;cursor:pointer}',
            '.fc-ov{position:fixed;left:0;right:0;top:0;bottom:0;z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(20,5,30,.62);',
            'font-family:Nunito,ui-rounded,system-ui,sans-serif}',
            '.fc-ov[hidden]{display:none}',
            '.fc-card{box-sizing:border-box;width:100%;max-width:420px;max-height:92vh;overflow:auto;padding:16px;border-radius:20px;background:#fff;color:#2b1a3d;',
            'border:4px solid var(--accent,#ff7ac8);box-shadow:0 10px 30px rgba(0,0,0,.45);font-size:16px;line-height:1.35}',
            '.fc-card *{box-sizing:border-box}',
            '.fc-card h2{margin:0 0 8px;font-size:20px}',
            '.fc-card p{margin:6px 0}',
            '.fc-small{font-size:13px;color:#5b4a6e}',
            '.fc-row{display:flex;align-items:center;gap:8px;margin:10px 0;flex-wrap:wrap}',
            '.fc-row label{font-weight:700}',
            '.fc-card input[type=text],.fc-card input[type=number],.fc-card select,.fc-card textarea{width:100%;min-height:44px;padding:6px 10px;font:inherit;color:#2b1a3d;',
            'background:#fff;border:2px solid #b9a5d0;border-radius:10px}',
            '.fc-card textarea{min-height:130px;resize:vertical}',
            '.fc-card input[type=range]{width:100%;min-height:44px}',
            '.fc-card input[type=checkbox]{width:24px;height:24px;flex:none}',
            '.fc-b{min-height:44px;padding:0 16px;font:700 16px/1 inherit;font-family:inherit;color:#2b1a3d;background:#f1e8fb;border:2px solid #b9a5d0;border-radius:12px;cursor:pointer}',
            '.fc-b.go{background:var(--accent,#ff7ac8);border-color:var(--accent,#ff7ac8);color:var(--ink,#3b0f33)}',
            '.fc-card button:focus-visible,.fc-card input:focus-visible,.fc-card select:focus-visible,.fc-card textarea:focus-visible,.fc-btn:focus-visible{outline:3px solid #6a2bd9;outline-offset:2px}'
        ].join('');
        var st = doc.createElement('style');
        st.setAttribute('data-fong-cheer', '1');
        st.appendChild(doc.createTextNode(css));
        doc.head.appendChild(st);
    }

    var capEl = null;
    function showCaption(text) {
        if (!doc.body) { return; }
        ensureStyle();
        if (!capEl) {
            capEl = doc.createElement('div');
            capEl.className = 'fc-cap';
            capEl.setAttribute('role', 'status');
            capEl.setAttribute('aria-live', 'polite');
            doc.body.appendChild(capEl);
        }
        clearTimeout(capTimer);
        capEl.classList.remove('show');
        capEl.textContent = text;
        void capEl.offsetWidth;
        capEl.classList.add('show');
        capTimer = setTimeout(function () { if (capEl) { capEl.classList.remove('show'); } }, CAPTION_MS);
    }

    /* ---------------- public ---------------- */

    function deliver(spoken, shown) {
        if (cfg.caption) { showCaption(shown); }
        if (cfg.speak) { speakNow(spoken); }
    }

    function cheer(kind) {
        try {
            ensure();
            if (!cfg.on || KINDS.indexOf(kind) < 0) { return false; }
            var t = now();
            if (lastAt[kind] && t - lastAt[kind] < MIN_GAP) { return false; }
            if ((kind === 'good' || kind === 'again') && lastGlobal && t - lastGlobal < GLOBAL_GAP) { return false; }
            lastAt[kind] = t;
            lastGlobal = t;
            var tpl = pick(kind);
            deliver(fill(tpl, cfg.say || cfg.name), fill(tpl, cfg.name));
            return true;
        } catch (e) { return false; }
    }

    function sayText(text) {
        try {
            ensure();
            if (!cfg.on) { return false; }
            text = clean(text, 160);
            if (!text) { return false; }
            deliver(text, text);
            return true;
        } catch (e) { return false; }
    }

    function isOn() { try { return ensure().on === true; } catch (e) { return false; } }

    /* ---------------- settings UI ---------------- */

    function el(tag, cls, text) {
        var n = doc.createElement(tag);
        if (cls) { n.className = cls; }
        if (text !== undefined) { n.textContent = text; }
        return n;
    }

    function closeOverlay(ov) {
        if (ov && ov.parentNode) { ov.parentNode.removeChild(ov); }
        if (ov === panel) { panel = null; }
        if (ov === gateEl) { gateEl = null; }
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
    }

    function overlay(title) {
        ensureStyle();
        var ov = el('div', 'fc-ov');
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        ov.setAttribute('aria-label', title);
        var card = el('div', 'fc-card');
        ov.appendChild(card);
        ov.addEventListener('click', function (e) { if (e.target === ov) { closeOverlay(ov); } });
        ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeOverlay(ov); } });
        doc.body.appendChild(ov);
        return { ov: ov, card: card };
    }

    function openGate() {
        var a = 6 + Math.floor(Math.random() * 4);
        var b = 6 + Math.floor(Math.random() * 4);
        var o = overlay('Grown-ups only');
        var card = o.card;
        card.appendChild(el('h2', '', 'Grown-ups only'));
        card.appendChild(el('p', '', 'To open Cheer settings, answer this: what is ' + a + ' × ' + b + '?'));
        var inp = el('input');
        inp.type = 'number';
        inp.setAttribute('inputmode', 'numeric');
        inp.setAttribute('aria-label', 'Answer');
        card.appendChild(inp);
        var msg = el('p', 'fc-small', '');
        msg.setAttribute('aria-live', 'polite');
        card.appendChild(msg);
        var row = el('div', 'fc-row');
        var ok = el('button', 'fc-b go', 'Open');
        ok.type = 'button';
        var no = el('button', 'fc-b', 'Cancel');
        no.type = 'button';
        row.appendChild(ok);
        row.appendChild(no);
        card.appendChild(row);
        function submit() {
            if (parseInt(inp.value, 10) === a * b) {
                closeOverlay(o.ov);
                gateEl = null;
                buildPanel();
            } else {
                msg.textContent = 'Not quite. This is for grown-ups. Cancel to go back to the game.';
                inp.value = '';
            }
        }
        ok.addEventListener('click', submit);
        no.addEventListener('click', function () { closeOverlay(o.ov); });
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { submit(); } });
        gateEl = o.ov;
        try { inp.focus(); } catch (e) { /* ignore */ }
    }

    function field(card, labelText, node, id) {
        var row = el('div', 'fc-row');
        var lab = el('label', '', labelText);
        node.id = id;
        lab.setAttribute('for', id);
        row.appendChild(lab);
        row.appendChild(node);
        card.appendChild(row);
        return row;
    }

    function checkRow(card, labelText, id, checked, onChange) {
        var row = el('div', 'fc-row');
        var cb = el('input');
        cb.type = 'checkbox';
        cb.id = id;
        cb.checked = checked;
        var lab = el('label', '', labelText);
        lab.setAttribute('for', id);
        row.appendChild(cb);
        row.appendChild(lab);
        card.appendChild(row);
        cb.addEventListener('change', function () { onChange(cb.checked); });
        return cb;
    }

    function buildPanel() {
        ensure();
        refreshVoices();
        var o = overlay('Cheer settings');
        var card = o.card;
        panel = o.ov;
        card.appendChild(el('h2', '', 'Cheer settings (grown-ups)'));
        card.appendChild(el('p', 'fc-small', 'Cheers say short, happy phrases when your child does well. Everything stays on this device.'));

        checkRow(card, 'Cheers on', 'fcOn', cfg.on, function (v) { cfg.on = v; save(); });
        checkRow(card, 'Say it out loud', 'fcSpeak', cfg.speak, function (v) { cfg.speak = v; save(); });
        checkRow(card, 'Show the words on screen', 'fcCap', cfg.caption, function (v) { cfg.caption = v; save(); });

        var name = el('input');
        name.type = 'text';
        name.maxLength = MAX_NAME_LEN;
        name.value = cfg.name;
        name.setAttribute('autocomplete', 'off');
        field(card, 'Name to cheer', name, 'fcName');
        name.addEventListener('input', function () { cfg.name = clean(name.value, MAX_NAME_LEN); save(); });

        var say = el('input');
        say.type = 'text';
        say.maxLength = MAX_NAME_LEN;
        say.value = cfg.say;
        say.setAttribute('autocomplete', 'off');
        field(card, 'How to say it (optional)', say, 'fcSay');
        card.appendChild(el('p', 'fc-small', 'If the voice says the name wrong, type it the way it sounds. Only the voice uses this.'));
        say.addEventListener('input', function () { cfg.say = clean(say.value, MAX_NAME_LEN); save(); });

        var sel = el('select');
        field(card, 'Voice', sel, 'fcVoice');
        function fillVoices() {
            refreshVoices();
            while (sel.firstChild) { sel.removeChild(sel.firstChild); }
            var auto = el('option', '', 'Automatic (friendly English)');
            auto.value = '';
            sel.appendChild(auto);
            for (var i = 0; i < voices.length; i++) {
                var op = el('option', '', voices[i].name + ' (' + voices[i].lang + ')');
                op.value = voices[i].name;
                sel.appendChild(op);
            }
            sel.value = cfg.voice;
            if (sel.value !== cfg.voice) { sel.value = ''; }
        }
        fillVoices();
        sel.addEventListener('change', function () { cfg.voice = sel.value; save(); });
        var s = synth();
        if (s) { try { s.onvoiceschanged = fillVoices; } catch (e) { /* ignore */ } }
        else { card.appendChild(el('p', 'fc-small', 'This browser cannot speak. The words will still show on screen.')); }

        var vol = el('input');
        vol.type = 'range';
        vol.min = '10';
        vol.max = '100';
        vol.value = String(Math.round(cfg.vol * 100));
        field(card, 'Volume', vol, 'fcVol');
        vol.addEventListener('input', function () { cfg.vol = Number(vol.value) / 100; save(); });

        var test = el('button', 'fc-b go', 'Test');
        test.type = 'button';
        test.addEventListener('click', function () {
            var tpl = pick('good');
            deliver(fill(tpl, cfg.say || cfg.name), fill(tpl, cfg.name));
        });
        var testRow = el('div', 'fc-row');
        testRow.appendChild(test);
        card.appendChild(testRow);

        // Phrase editor
        card.appendChild(el('h2', '', 'Phrases'));
        card.appendChild(el('p', 'fc-small', 'One phrase per line. {name} is replaced by the name. With no name it is left out.'));
        var ks = el('select');
        for (var k = 0; k < KINDS.length; k++) {
            var ko = el('option', '', KIND_LABEL[KINDS[k]]);
            ko.value = KINDS[k];
            ks.appendChild(ko);
        }
        field(card, 'When', ks, 'fcKind');
        var ta = el('textarea');
        ta.id = 'fcPhrases';
        ta.setAttribute('aria-label', 'Phrases, one per line');
        card.appendChild(ta);
        function showPhrases() { ta.value = list(ks.value).join('\n'); }
        showPhrases();
        ks.addEventListener('change', showPhrases);
        ta.addEventListener('input', function () {
            var arr = cleanList(ta.value.split('\n'));
            if (arr.length) { cfg.phrases[ks.value] = arr; } else { delete cfg.phrases[ks.value]; }
            save();
        });
        var prow = el('div', 'fc-row');
        var reset = el('button', 'fc-b', 'Reset these phrases');
        reset.type = 'button';
        reset.addEventListener('click', function () { delete cfg.phrases[ks.value]; save(); showPhrases(); });
        var resetAll = el('button', 'fc-b', 'Reset all phrases');
        resetAll.type = 'button';
        resetAll.addEventListener('click', function () { cfg.phrases = {}; save(); showPhrases(); });
        prow.appendChild(reset);
        prow.appendChild(resetAll);
        card.appendChild(prow);

        var clr = el('button', 'fc-b', 'Forget the name');
        clr.type = 'button';
        clr.addEventListener('click', function () { cfg.name = ''; cfg.say = ''; name.value = ''; say.value = ''; save(); });
        var crow = el('div', 'fc-row');
        crow.appendChild(clr);
        card.appendChild(crow);

        var done = el('button', 'fc-b go', 'Done');
        done.type = 'button';
        done.addEventListener('click', function () { closeOverlay(o.ov); });
        card.appendChild(done);
        try { card.querySelector('input').focus(); } catch (e2) { /* ignore */ }
    }

    function openSettings() {
        try {
            if (!doc.body || panel || gateEl) { return; }
            lastFocus = doc.activeElement;
            ensure();
            openGate();
        } catch (e) { /* never break a game */ }
    }

    win.FongCheer = {
        cheer: cheer,
        say: sayText,
        isOn: isOn,
        openSettings: openSettings,
        KINDS: KINDS,
        defaults: DEFAULTS
    };
}(window, document));
