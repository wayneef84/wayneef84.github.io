/**
 * Settings hub for the homepage. One sheet with tabs: Look, Scores, Cheers, Play, Data.
 * Opened by the Settings button (#theme-open), by #settings or ?settings=1 (or ?settings=scores,
 * look, cheers, play, data) in the address, or by FongSettings.open(tab).
 * Load BEFORE js/theme/panel.js (it takes over the button click) and AFTER js/scores.js, js/prefs.js, js/gamesaves.js, js/gdrive-config.js and js/gdrive-backup.js.
 * Text is always written with textContent, never innerHTML. Strict ES5. No network by itself
 * (the optional Drive backup in js/gdrive-backup.js only connects after a tap on Connect).
 * Everything stays on this device unless the user backs up to Drive. Docs: docs/SETTINGS.md
 */
(function (w) {
    'use strict';

    var doc = w.document;
    var opener = doc.getElementById('theme-open');
    if (!opener) { return; }

    var has = Object.prototype.hasOwnProperty;
    var TABS = [['look', 'Look'], ['scores', 'Scores'], ['cheers', 'Cheers'], ['play', 'Play'], ['data', 'Data']];
    var CHEER_KEY = 'fong.cheer.v1';
    var MAX_ALL_CHARS = (w.FongGameSaves && w.FongGameSaves.MAX_CHARS) || 600000;   // same cap the game saves import uses

    // Games that save scores, so the list can show them before the first play.
    var KNOWN = [
        ['snake', 'Snake'], ['pong', 'Pong'], ['breakout', 'Breakout'], ['space-invaders', 'Space Invaders'],
        ['sky-breakers', 'Sky Breakers'], ['falldown', 'Falldown'],
        ['memory-match:easy', 'Memory Match (Easy)'], ['memory-match:normal', 'Memory Match (Normal)'], ['memory-match:big', 'Memory Match (Big)'],
        ['slots:win', 'Slots: biggest win'], ['slots:coins', 'Slots: most coins'],
        ['byte-runner-quest:level', 'Byte Runner Quest: furthest level'], ['byte-runner-quest:endless', 'Byte Runner Quest: endless run'],
        ['minesweeper:very-easy', 'Minesweeper (very-easy)'], ['minesweeper:easy', 'Minesweeper (easy)'], ['minesweeper:normal', 'Minesweeper (normal)'],
        ['minesweeper:hard', 'Minesweeper (hard)'], ['minesweeper:very-hard', 'Minesweeper (very-hard)']
    ];

    var ov = null, sheet = null, bodyEl = null, tablist = null, liveEl = null;
    var activeTab = 'look', unlocked = false, lastFocus = null, isOpen = false;
    var armedReset = '';           // game id whose Reset is waiting for the Yes tap

    // ---- helpers -------------------------------------------------------

    function el(tag, cls, text) {
        var n = doc.createElement(tag);
        if (cls) { n.className = cls; }
        if (text !== undefined && text !== null) { n.textContent = text; }
        return n;
    }

    function btn(text, cls, onClick) {
        var b = el('button', 'fs-btn' + (cls ? ' ' + cls : ''), text);
        b.type = 'button';
        if (onClick) { b.addEventListener('click', onClick); }
        return b;
    }

    function say(text) { if (liveEl) { liveEl.textContent = text || ''; } }

    function clean(s, max) {
        s = String(s === undefined || s === null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        return s.length > max ? s.substr(0, max) : s;
    }

    function readKey(key) { try { return w.localStorage.getItem(key); } catch (e) { return null; } }
    function writeKey(key, val) { try { w.localStorage.setItem(key, val); return true; } catch (e) { return false; } }

    function download(name, text) {
        try {
            var blob = new w.Blob([text], { type: 'application/json' });
            var url = w.URL.createObjectURL(blob);
            var a = el('a');
            a.href = url; a.download = name; a.style.display = 'none';
            doc.body.appendChild(a); a.click();
            w.setTimeout(function () { if (a.parentNode) { a.parentNode.removeChild(a); } w.URL.revokeObjectURL(url); }, 1000);
            return true;
        } catch (e) { return false; }
    }

    function copyText(text, host) {
        function fallback() {
            var ta = el('textarea', 'fs-area');
            ta.value = text; ta.readOnly = true;
            ta.setAttribute('aria-label', 'Copy this text');
            host.appendChild(ta);
            try { ta.focus(); ta.select(); } catch (e) { /* ignore */ }
            var ok = false;
            try { ok = doc.execCommand('copy'); } catch (e2) { ok = false; }
            say(ok ? 'Copied.' : 'Select the text in the box and copy it.');
            if (ok && ta.parentNode) { ta.parentNode.removeChild(ta); }
        }
        if (w.navigator && w.navigator.clipboard && w.navigator.clipboard.writeText) {
            w.navigator.clipboard.writeText(text).then(function () { say('Copied.'); }, fallback);
        } else { fallback(); }
    }

    function readFile(file, done) {
        if (!file) { return; }
        if (file.size > MAX_ALL_CHARS) { done(null, 'That file is too big.'); return; }
        var fr = new w.FileReader();
        fr.onload = function () { done(String(fr.result), null); };
        fr.onerror = function () { done(null, 'Could not read that file.'); };
        fr.readAsText(file);
    }

    function field(label, node, id) {
        var wrap = el('div', 'fs-field');
        var l = el('label', 'fs-label', label);
        node.id = id; l.setAttribute('for', id);
        wrap.appendChild(l); wrap.appendChild(node);
        return wrap;
    }

    // ---- parent gate (a times-table sum, same idea as the Cheers gate) ---

    function renderGate(host, onDone) {
        var a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
        var box = el('div', 'fs-gate');
        box.appendChild(el('p', 'fs-strong', 'Grown-ups only'));
        box.appendChild(el('p', 'fs-note', 'Resets, imports and offline repair are locked so little fingers cannot wipe things. What is ' + a + ' × ' + b + '?'));
        var inp = el('input', 'fs-input');
        inp.type = 'number'; inp.setAttribute('inputmode', 'numeric');
        box.appendChild(field('Answer', inp, 'fs-gate-in'));
        var msg = el('p', 'fs-note', '');
        msg.setAttribute('aria-live', 'polite');
        box.appendChild(msg);
        function submit() {
            if (parseInt(inp.value, 10) === a * b) { unlocked = true; onDone(); }
            else { msg.textContent = 'Not quite. Ask a grown-up to help.'; inp.value = ''; }
        }
        box.appendChild(btn('Unlock', 'fs-go', submit));
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { submit(); } });
        host.appendChild(box);
        return inp;
    }

    // ---- tabs ----------------------------------------------------------

    function renderLook(host) {
        host.appendChild(el('h3', 'fs-h', 'Look'));
        host.appendChild(el('p', 'fs-note', 'Pick a skin and palette, rename things, pin favorites and make your own groups.'));
        var b = btn('Open Customize', 'fs-go', function () {
            close(true);
            if (w.FongThemePanel) { w.FongThemePanel.open(); }
        });
        host.appendChild(b);
        host.appendChild(el('p', 'fs-note', 'If a theme ever breaks the page, add ?theme=default or ?safe=1 to the end of the address.'));
    }

    function scoreBoards() {
        var out = [], seen = {}, i, all = [];
        try { all = w.FongScores ? w.FongScores.listAll() : []; } catch (e) { all = []; }
        for (i = 0; i < all.length; i++) { seen[all[i].id] = true; out.push(all[i]); }
        for (i = 0; i < KNOWN.length; i++) {
            if (!has.call(seen, KNOWN[i][0])) { out.push({ id: KNOWN[i][0], title: KNOWN[i][1], unit: 'points', scores: [] }); }
        }
        out.sort(function (a, b) { var x = a.title.toLowerCase(), y = b.title.toLowerCase(); return x < y ? -1 : (x > y ? 1 : 0); });
        return out;
    }

    function renderScores(host) {
        var S = w.FongScores;
        host.appendChild(el('h3', 'fs-h', 'Scores'));
        if (!S) { host.appendChild(el('p', 'fs-note', 'Scores are not available on this page.')); return; }
        host.appendChild(el('p', 'fs-note', 'Best scores are saved on this device only. Playing is what counts. Every score is a good one.'));
        if (!S.isPersistent()) { host.appendChild(el('p', 'fs-warn', 'This browser is not letting us save, so scores last only until you close the page.')); }

        var boards = scoreBoards(), i, j, any = false;
        var list = el('div', 'fs-games');
        for (i = 0; i < boards.length; i++) {
            (function (g) {
                var sec = el('section', 'fs-game');
                sec.setAttribute('data-board', g.id);
                var head = el('div', 'fs-gamehead');
                head.appendChild(el('h4', 'fs-gname', g.title));
                if (g.scores.length) {
                    any = true;
                    if (unlocked) {
                        if (armedReset === g.id) {
                            head.appendChild(btn('Yes, reset', 'fs-danger', function () { S.reset(g.id); armedReset = ''; say('Scores cleared for ' + g.title + '.'); render(); }));
                            head.appendChild(btn('No', '', function () { armedReset = ''; render(); }));
                        } else {
                            var rb = btn('Reset', '', function () { armedReset = g.id; render(); });
                            rb.setAttribute('aria-label', 'Reset scores for ' + g.title);
                            head.appendChild(rb);
                        }
                    }
                }
                sec.appendChild(head);
                if (g.scores.length) {
                    var ol = el('ol', 'fs-scorelist');
                    for (j = 0; j < g.scores.length; j++) {
                        var s = g.scores[j];
                        ol.appendChild(el('li', '', S.format(s.value, g.unit) + (s.label ? '  (' + s.label + ')' : '')));
                    }
                    sec.appendChild(ol);
                } else { sec.appendChild(el('p', 'fs-dim', 'No scores yet. Go play!')); }
                list.appendChild(sec);
            })(boards[i]);
        }
        host.appendChild(list);

        // Export (safe for everyone)
        host.appendChild(el('h3', 'fs-h', 'Save a copy'));
        host.appendChild(el('p', 'fs-note', 'Download your scores as a file, or copy the text.'));
        var row = el('div', 'fs-row');
        var copyHost = el('div', 'fs-copyhost');
        row.appendChild(btn('Export scores', 'fs-go', function () {
            say(download('fong-scores.json', S.exportJSON()) ? 'Downloaded fong-scores.json.' : 'Could not download. Try Copy instead.');
        }));
        row.appendChild(btn('Copy scores', '', function () { copyText(S.exportJSON(), copyHost); }));
        host.appendChild(row); host.appendChild(copyHost);

        // Gated actions
        host.appendChild(el('h3', 'fs-h', 'Grown-up tools'));
        if (!unlocked) { renderGate(host, render); return; }
        renderScoreImport(host);
        var ra = el('div', 'fs-box');
        ra.appendChild(el('p', 'fs-strong', 'Reset all scores'));
        ra.appendChild(el('p', 'fs-note', 'This clears every score on this device. Type RESET to unlock the button.'));
        var word = el('input', 'fs-input');
        word.type = 'text'; word.setAttribute('autocomplete', 'off'); word.setAttribute('autocapitalize', 'characters');
        ra.appendChild(field('Type RESET', word, 'fs-reset-word'));
        var go = btn('Reset all scores', 'fs-danger', function () {
            if (word.value.replace(/\s/g, '').toUpperCase() !== 'RESET') { return; }
            S.resetAll(); say('All scores cleared.'); render();
        });
        go.disabled = !any;
        word.addEventListener('input', function () { go.disabled = !any || word.value.replace(/\s/g, '').toUpperCase() !== 'RESET'; });
        if (any) { go.disabled = true; }
        ra.appendChild(go);
        host.appendChild(ra);
    }

    // Shared import box. kind: 'scores' or 'all'
    function loadBox(host, kind, check, apply, extra) {
        extra = extra || {};
        var idk = extra.idKey || kind;   // unique element ids when two boxes of one kind are on screen
        var box = el('div', 'fs-box');
        box.appendChild(el('p', 'fs-strong', extra.title || (kind === 'all' ? 'Import everything' : (kind === 'games' ? 'Import game saves' : 'Import scores'))));
        box.appendChild(el('p', 'fs-note', 'Choose a file or paste the text, then Preview. Nothing changes until you tap Apply.'));
        var file = el('input', 'fs-input');
        file.type = 'file'; file.accept = '.json,application/json';
        box.appendChild(field('Choose a file', file, 'fs-file-' + idk));
        var ta = el('textarea', 'fs-area');
        ta.setAttribute('rows', '4'); ta.setAttribute('spellcheck', 'false');
        box.appendChild(field('Or paste here', ta, 'fs-paste-' + idk));
        var modeWrap = el('div', 'fs-modes');
        var mode = 'merge';
        var lockMode = !!extra.needUnlock;
        var mMerge = el('input'); mMerge.type = 'radio'; mMerge.name = 'fs-mode-' + idk; mMerge.value = 'merge'; mMerge.checked = true; mMerge.id = 'fs-mm-' + idk;
        var mRep = el('input'); mRep.type = 'radio'; mRep.name = 'fs-mode-' + idk; mRep.value = 'replace'; mRep.id = 'fs-mr-' + idk;
        function lab(inp, text) { var l = el('label', 'fs-radio'); l.appendChild(inp); l.appendChild(el('span', '', text)); return l; }
        modeWrap.appendChild(lab(mMerge, 'Merge: keep mine and add these'));
        modeWrap.appendChild(lab(mRep, 'Replace: use only these'));
        box.appendChild(modeWrap);
        var out = el('div', 'fs-preview');
        out.setAttribute('aria-live', 'polite');
        var applyBtn = btn('Apply', 'fs-go', null);
        applyBtn.disabled = true;
        var text = '';
        if (extra.mode === 'replace') { mRep.checked = true; mMerge.checked = false; }
        function getMode() {
            if (lockMode && !unlocked) { mRep.checked = false; mMerge.checked = true; mRep.disabled = true; }   // locked: merge only
            mode = mRep.checked ? 'replace' : 'merge';
            if (extra.onMode) { extra.onMode(mode); }
            return mode;
        }
        function preview() {
            while (out.firstChild) { out.removeChild(out.firstChild); }
            var res = check(text, getMode());
            applyBtn.disabled = !res.ok;
            if (!res.ok) {
                out.appendChild(el('p', 'fs-warn', res.alreadyHave ? 'Nothing to add.' : 'Could not use that.'));
                for (var i = 0; i < res.errors.length && i < 5; i++) { out.appendChild(el('p', 'fs-note', res.errors[i])); }
                return;
            }
            var ul = el('ul', 'fs-list'), isGames = kind === 'games';
            if (isGames) {
                out.appendChild(el('p', 'fs-strong', 'Ready: ' + res.games.length + ' game' + (res.games.length === 1 ? '' : 's') + ' to update, ' + res.skipped + ' item' + (res.skipped === 1 ? '' : 's') + ' skipped.'));
                for (var g = 0; g < res.games.length && g < 30; g++) { ul.appendChild(el('li', '', res.games[g].name + ': ' + res.games[g].keys + ' saved item' + (res.games[g].keys === 1 ? '' : 's'))); }
                if (res.notes) { for (var nn = 0; nn < res.notes.length && nn < 5; nn++) { out.appendChild(el('p', 'fs-dim', res.notes[nn])); } }
            } else {
                out.appendChild(el('p', 'fs-strong', 'Ready: ' + res.added + ' score' + (res.added === 1 ? '' : 's') + ' to add, ' + res.skipped + ' skipped.'));
                for (var j = 0; j < res.games.length && j < 30; j++) { ul.appendChild(el('li', '', res.games[j].title + ': ' + res.games[j].added)); }
            }
            out.appendChild(ul);
            if (res.extra) { for (var k = 0; k < res.extra.length; k++) { out.appendChild(el('p', 'fs-note', res.extra[k])); } }
            if (getMode() === 'replace') { out.appendChild(el('p', 'fs-warn', kind === 'games' ? 'Replace overwrites the saved progress of these games. Keys not in the file are left as they are.' : 'Replace swaps your scores for the ones in this file.')); }
        }
        file.addEventListener('change', function () {
            readFile(file.files && file.files[0], function (t, err) {
                if (err) { text = ''; applyBtn.disabled = true; while (out.firstChild) { out.removeChild(out.firstChild); } out.appendChild(el('p', 'fs-warn', err)); return; }
                text = t; ta.value = t.length > 5000 ? t.substr(0, 5000) + '\n...' : t; preview();
            });
        });
        ta.addEventListener('input', function () { text = ta.value; });
        box.appendChild(btn('Preview', '', function () { preview(); }));
        mMerge.addEventListener('change', function () { if (text) { preview(); } });
        mRep.addEventListener('change', function () { if (text) { preview(); } });
        box.appendChild(out);
        applyBtn.addEventListener('click', function () {
            if (lockMode && !unlocked) { out.appendChild(el('p', 'fs-warn', 'Locked. Close and open Settings, then answer the question.')); applyBtn.disabled = true; return; }
            var res = apply(text, getMode());
            applyBtn.disabled = true;
            while (out.firstChild) { out.removeChild(out.firstChild); }
            var failMsg = 'Could not import that.' + (res.errors && res.errors[0] ? ' ' + res.errors[0] : '');
            out.appendChild(el('p', res.ok ? 'fs-strong' : 'fs-warn', res.ok ? (res.message || 'Done.') : failMsg));
            say(res.ok ? (res.message || 'Done.') : failMsg);
            if (res.ok && kind === 'scores') { w.setTimeout(render, 700); }
        });
        box.appendChild(applyBtn);
        host.appendChild(box);
        if (typeof extra.preset === 'string' && extra.preset) { text = extra.preset; ta.value = text.length > 5000 ? text.substr(0, 5000) + '\n...' : text; preview(); }
    }

    function renderScoreImport(host) {
        var S = w.FongScores;
        loadBox(host, 'scores',
            function (t, m) { return S.importJSON(t, { mode: m, dryRun: true }); },
            function (t, m) {
                var r = S.importJSON(t, { mode: m });
                r.message = r.ok ? 'Imported. Added ' + r.added + ', skipped ' + r.skipped + '.' : '';
                return r;
            });
    }

    function renderCheers(host) {
        host.appendChild(el('h3', 'fs-h', 'Cheers'));
        host.appendChild(el('p', 'fs-note', 'Spoken and on-screen cheers are off until a grown-up turns them on. The settings open behind a quick grown-ups question.'));
        var b = btn('Open Cheer settings', 'fs-go', function () {
            close(true);
            if (w.FongCheer) { w.FongCheer.openSettings(); }
        });
        if (!w.FongCheer) { b.disabled = true; }
        host.appendChild(b);
    }

    function renderPlay(host) {
        host.appendChild(el('h3', 'fs-h', 'Play'));
        var P = w.FongPrefs;
        if (!P) { host.appendChild(el('p', 'fs-note', 'Not available on this page.')); return; }
        var label = el('label', 'fs-check');
        var cb = el('input'); cb.type = 'checkbox'; cb.id = 'fs-calm'; cb.checked = !!P.get('calm');
        label.appendChild(cb);
        label.appendChild(el('span', '', 'Calm mode'));
        cb.addEventListener('change', function () { P.set('calm', cb.checked); say(cb.checked ? 'Calm mode on.' : 'Calm mode off.'); });
        host.appendChild(label);
        host.appendChild(el('p', 'fs-note', 'Games that support it use gentler motion and quieter effects. Slots already does. Your device setting for reduced motion is always respected too.'));
        host.appendChild(el('p', 'fs-note', 'Site-wide motion for the homepage is under Customize, in the Behavior tab.'));
    }

    // ---- everything export / import ------------------------------------

    function cheerObject(includeName) {
        var o = null, raw = readKey(CHEER_KEY);
        if (raw) { try { o = JSON.parse(raw); } catch (e) { o = null; } }
        if (!o || typeof o !== 'object') { return null; }
        var out = {};
        for (var k in o) { if (has.call(o, k) && k !== '__proto__') { out[k] = o[k]; } }
        if (!includeName) { out.name = ''; out.say = ''; }
        return out;
    }

    function cleanCheer(o) {
        if (!o || typeof o !== 'object') { return null; }
        var c = { on: o.on === true, name: clean(o.name, 24), say: clean(o.say, 24), voice: clean(o.voice, 200), vol: 0.8,
            speak: o.speak !== false, caption: o.caption !== false, phrases: {} };
        var v = Number(o.vol);
        if (isFinite(v)) { c.vol = Math.max(0.1, Math.min(1, v)); }
        var kinds = ['start', 'good', 'big', 'done', 'again'];
        if (o.phrases && typeof o.phrases === 'object') {
            for (var i = 0; i < kinds.length; i++) {
                var arr = o.phrases[kinds[i]];
                if (!Array.isArray(arr)) { continue; }
                var list = [];
                for (var j = 0; j < arr.length && list.length < 20; j++) {
                    var t = String(arr[j]).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
                    if (t) { list.push(t.length > 80 ? t.substr(0, 80) : t); }
                }
                if (list.length) { c.phrases[kinds[i]] = list; }
            }
        }
        return c;
    }

    function buildEverything(includeName) {
        var obj = { format: 'fong-everything', version: 1 };
        try { obj.theme = w.FongTheme ? JSON.parse(w.FongTheme.exportJSON()) : null; } catch (e) { obj.theme = null; }
        obj.scores = w.FongScores ? w.FongScores.exportObject() : null;
        obj.cheer = cheerObject(includeName);
        obj.prefs = w.FongPrefs ? w.FongPrefs.all() : null;
        if (w.FongGameSaves) { obj.games = w.FongGameSaves.exportObject(); }   // optional field, version stays 1
        return JSON.stringify(obj, null, 2);
    }

    function badKey(o, depth) {
        if (depth > 8 || !o || typeof o !== 'object') { return false; }
        var ks = Object.keys(o);
        for (var i = 0; i < ks.length; i++) {
            if (ks[i] === '__proto__' || ks[i] === 'constructor' || ks[i] === 'prototype') { return true; }
            if (badKey(o[ks[i]], depth + 1)) { return true; }
        }
        return false;
    }

    function showWarnings(host, list) {
        while (host.firstChild) { host.removeChild(host.firstChild); }
        for (var i = 0; i < list.length && i < 6; i++) { host.appendChild(el('p', 'fs-warn', list[i])); }
    }

    function everythingWarnings(text) {
        var list = w.FongGameSaves ? w.FongGameSaves.exportWarnings() : [];
        if (text.length > MAX_ALL_CHARS) { list.push('This file is ' + text.length + ' characters, over the ' + MAX_ALL_CHARS + ' limit, so importing it again will be refused.'); }
        return list;
    }

    function gamesFile(g) { return JSON.stringify({ format: 'fong-game-saves', version: 1, games: g }); }

    function parseEverything(text, mode) {
        mode = mode === 'replace' ? 'replace' : 'merge';   // preview with the mode that Apply will use
        var res = { ok: false, errors: [], added: 0, skipped: 0, games: [], extra: [], data: null };
        if (typeof text !== 'string' || !text) { res.errors.push('Nothing to read.'); return res; }
        if (text.length > MAX_ALL_CHARS) { res.errors.push('That file is too big.'); return res; }
        var d;
        try { d = JSON.parse(text); } catch (e) { res.errors.push('That file is not valid JSON.'); return res; }
        if (!d || typeof d !== 'object' || Array.isArray(d) || d.format !== 'fong-everything' || d.version !== 1) {
            res.errors.push('That is not a Fong everything file.'); return res;
        }
        if (badKey(d, 0)) { res.errors.push('That file has keys that are not allowed.'); return res; }
        res.data = d;
        if (d.scores && w.FongScores) {
            var s = w.FongScores.importJSON(JSON.stringify(d.scores), { mode: mode, dryRun: true });
            if (s.ok) { res.added = s.added; res.skipped = s.skipped; res.games = s.games; }
            else { res.extra.push('Scores in this file cannot be used: ' + (s.errors[0] || 'unknown problem')); }
        }
        if (d.theme && w.FongTheme) {
            var t = w.FongTheme.importJSON(JSON.stringify(d.theme));
            res.extra.push(t.ok ? 'Theme: ready to use.' : 'Theme in this file cannot be used and will be left alone.');
        }
        if (d.cheer) { res.extra.push('Cheer settings: ' + (cleanCheer(d.cheer) ? 'ready to use.' : 'cannot be used and will be left alone.')); }
        if (d.prefs) { res.extra.push('Play options: ready to use.'); }
        if (d.games && w.FongGameSaves) {
            var gs = w.FongGameSaves.importJSON(gamesFile(d.games), { mode: mode, dryRun: true });
            res.extra.push(gs.ok ? 'Game saves: ' + gs.games.length + ' game' + (gs.games.length === 1 ? '' : 's') + ' ready to use.' : 'Game saves in this file will be left alone: ' + (gs.errors[0] || 'cannot be used.'));
        }
        res.ok = true;
        return res;
    }

    function applyEverything(text, mode) {
        var chk = parseEverything(text, mode);
        if (!chk.ok) { return { ok: false }; }
        var d = chk.data, done = [], failed = '';
        if (d.scores && w.FongScores) {
            var s = w.FongScores.importJSON(JSON.stringify(d.scores), { mode: mode });
            if (s.ok) { done.push('scores'); }
        }
        if (d.theme && w.FongTheme) {
            var t = w.FongTheme.importJSON(JSON.stringify(d.theme));
            if (t.ok) { w.FongTheme.setConfig(t.config); done.push('theme'); }
        }
        if (d.cheer) {
            var c = cleanCheer(d.cheer);
            if (c) {
                // keep a name already on this device when the file has none
                if (!c.name) {
                    var cur = cheerObject(true);
                    if (cur) { c.name = clean(cur.name, 24); c.say = clean(cur.say, 24); }
                }
                if (writeKey(CHEER_KEY, JSON.stringify(c))) { done.push('cheers'); }
            }
        }
        if (d.prefs && w.FongPrefs) { w.FongPrefs.load(d.prefs); done.push('play options'); }
        if (d.games && w.FongGameSaves) {
            var gr = w.FongGameSaves.importJSON(gamesFile(d.games), { mode: mode });
            if (gr.ok && gr.applied) { done.push('game saves'); }
            else if (!gr.ok && !gr.alreadyHave) { failed = ' Game saves were not changed: ' + (gr.errors[0] || 'unknown problem'); }
        }
        return { ok: true, message: 'Imported: ' + (done.length ? done.join(', ') : 'nothing new') + '.' + failed + ' Reload the page to see everything.' };
    }

    function gameSaveBoard(G, g, host) {
        var sec = el('section', 'fs-game');
        sec.setAttribute('data-game', g.id);
        var head = el('div', 'fs-gamehead');
        head.appendChild(el('h4', 'fs-gname', g.name));
        sec.appendChild(head);
        sec.appendChild(el('p', 'fs-dim', g.hasData ? 'Has saved progress on this device.' : 'Nothing saved yet.'));
        var row = el('div', 'fs-row'), copyHost = el('div', 'fs-copyhost'), warnHost = el('div', 'fs-warnhost');
        var eb = btn('Export', '', function () {
            var r = G.exportGame(g.id);
            showWarnings(warnHost, r.warnings);
            say(download('fong-save-' + g.id + '.json', r.text) ? 'Downloaded fong-save-' + g.id + '.json.' : 'Could not download. Try Copy instead.');
        });
        eb.setAttribute('aria-label', 'Export ' + g.name);
        var cb = btn('Copy', '', function () { var r = G.exportGame(g.id); showWarnings(warnHost, r.warnings); copyText(r.text, copyHost); });
        cb.setAttribute('aria-label', 'Copy ' + g.name + ' save');
        row.appendChild(eb); row.appendChild(cb);
        if (w.FongGDrive) {
            var db = btn('Back up', '', function () { driveBackup(g.id); });
            db.setAttribute('aria-label', 'Back up ' + g.name + ' to Google Drive');
            db.disabled = !driveReady() || !g.hasData;
            row.appendChild(db);
        }
        sec.appendChild(row); sec.appendChild(copyHost); sec.appendChild(warnHost);
        host.appendChild(sec);
    }

    function renderGameSaves(host) {
        var G = w.FongGameSaves;
        host.appendChild(el('h3', 'fs-h', 'Game saves'));
        if (!G) { host.appendChild(el('p', 'fs-note', 'Game saves are not available on this page.')); return; }
        host.appendChild(el('p', 'fs-note', 'Progress that games keep on this device, one file per game. High scores are in the Scores tab.'));
        var row = el('div', 'fs-row'), copyHost = el('div', 'fs-copyhost'), warnHost = el('div', 'fs-warnhost');
        row.appendChild(btn('Export all game saves', 'fs-go', function () {
            var r = G.exportAll();
            showWarnings(warnHost, r.warnings);
            say(download('fong-game-saves.json', r.text) ? 'Downloaded fong-game-saves.json.' : 'Could not download. Try Copy instead.');
        }));
        row.appendChild(btn('Copy all game saves', '', function () { var r = G.exportAll(); showWarnings(warnHost, r.warnings); copyText(r.text, copyHost); }));
        host.appendChild(row); host.appendChild(copyHost); host.appendChild(warnHost);
        var all = G.list(), list = el('div', 'fs-games'), i;
        for (i = 0; i < all.length; i++) { gameSaveBoard(G, all[i], list); }
        host.appendChild(list);
    }

    // ---- Google Drive backup (optional, see js/gdrive-backup.js and js/gdrive-auto.js) -------
    // Every action that changes or reads a backup (save point, restore, delete, load a newer copy) needs the grown-ups
    // question in THIS visit to the sheet. Closing the sheet locks it again, forgets any loaded backup and, when autosave is off,
    // drops the Google sign-in. With autosave on the sign-in stays in memory only so autosave can keep running.

    var drive = { msg: '', warn: false, items: null, busy: false, gating: false, armedDel: '', label: '', restore: null, st: null, fadeT: 0, fadeSeq: -1, viewKey: '' };

    function driveReady() { var D = w.FongGDrive; return !!(D && D.isConfigured() && D.isConnected() && unlocked && !drive.busy); }

    function driveRerender() {
        var top = bodyEl ? bodyEl.scrollTop : 0;
        render();
        if (bodyEl) { bodyEl.scrollTop = top; }
    }

    function driveSay(text, warn) { drive.msg = text || ''; drive.warn = !!warn; say(text || ''); }

    // Forget anything loaded from Drive (sheet closed, signed out, locked again).
    function driveForget() { drive.restore = null; drive.armedDel = ''; drive.gating = false; drive.items = null; }

    function driveLock() {
        var D = w.FongGDrive, A = w.FongGDriveAuto;
        driveForget();
        if (D && D.isConnected() && !(A && A.isAuto())) { D.disconnect(function () {}); }
    }

    function driveRefresh(after) {
        var D = w.FongGDrive;
        D.list(function (e, items) {
            if (e) { driveSay(e.message, true); drive.items = null; } else { drive.items = items; }
            drive.busy = false;
            if (after) { after(); }
            driveRerender();
        });
    }

    function driveConnect() {
        var D = w.FongGDrive;
        drive.busy = true; driveSay('Opening Google sign-in...', false); driveRerender();
        D.connect(function (e) {
            if (e) { drive.busy = false; drive.items = null; driveSay(e.message, true); driveRerender(); return; }
            driveSay('Connected.', false);
            driveRefresh();
        });
    }

    function driveBackup(scope) {
        var D = w.FongGDrive;
        if (!driveReady()) { return; }
        var label = D.cleanLabel(drive.label);
        drive.busy = true; driveSay('Saving...', false); driveRerender();
        D.backupNow(scope, function (e, r) {
            if (e) { drive.busy = false; driveSay(e.message, true); driveRerender(); return; }
            drive.label = '';
            var msg = 'Saved a save point to Google Drive.' + (r && r.pruned ? ' Removed ' + r.pruned + ' older save point' + (r.pruned === 1 ? '' : 's') + ' (the newest ' + D.KEEP + ' are kept).' : '');
            driveSay(msg, false);
            driveRefresh();
        }, { label: label });
    }

    function driveScopeName(scope) {
        if (scope === 'all') { return 'Everything'; }
        var all = w.FongGameSaves ? w.FongGameSaves.list() : [], i;
        for (i = 0; i < all.length; i++) { if (all[i].id === scope) { return all[i].name; } }
        return scope;
    }

    function driveSize(n) { return n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' bytes'; }

    function driveRestore(item) {
        var D = w.FongGDrive;
        if (!unlocked) { return; }
        drive.busy = true; driveSay('Getting that backup...', false); driveRerender();
        D.restore(item.id, function (e, text) {
            drive.busy = false;
            if (e) { driveSay(e.message, true); driveRerender(); return; }
            drive.restore = { text: text, title: 'Restore from Google Drive: ' + driveScopeName(item.scope), mode: 'merge', game: '', meta: null };
            driveSay('Backup loaded. Preview it below, then tap Apply.', false);
            driveRerender();
            var rh = bodyEl ? bodyEl.querySelector('.fs-drive-restore') : null;
            if (rh && rh.scrollIntoView) { try { rh.scrollIntoView(); } catch (x) { /* ignore */ } }
        });
    }

    function driveLoadNewer(pr) {
        var A = w.FongGDriveAuto;
        if (!unlocked) { return; }
        drive.busy = true; driveSay('Getting the newer backup...', false); driveRerender();
        A.load(pr.game, function (e, text, meta) {
            drive.busy = false;
            if (e) { driveSay(e.message, true); driveRerender(); return; }
            drive.restore = { text: text, title: 'Load the newer backup: ' + pr.name, mode: 'merge', game: pr.game, meta: meta };
            driveSay('Backup loaded. Preview it below, then tap Apply.', false);
            driveRerender();
        });
    }

    // The preview and Apply box for a loaded Drive file. Same checks as a manual import, kept until closed.
    function renderDriveRestore(host) {
        var G = w.FongGameSaves, A = w.FongGDriveAuto, r = drive.restore;
        if (!r || !G) { return; }
        loadBox(host, 'games',
            function (t, m) { return G.importJSON(t, { mode: m, dryRun: true }); },
            function (t, m) {
                var res = G.importJSON(t, { mode: m });
                if (res.ok && r.game && A) { A.markLoaded(r.game, r.meta); }
                res.message = res.ok ? 'Restored game saves for ' + res.games.length + ' game' + (res.games.length === 1 ? '' : 's') + '. Reload a game to see it.' : '';
                if (res.ok) { w.setTimeout(function () { drive.restore = null; }, 0); }
                return res;
            },
            { idKey: 'drive', title: r.title, preset: r.text, mode: r.mode, needUnlock: true, onMode: function (m) { r.mode = m; } });
    }

    function statusClass(phase) {
        return phase === 'error' ? 'fs-dot-bad' : (phase === 'backedup' || phase === 'connected' ? 'fs-dot-ok' : (phase === 'off' ? 'fs-dot-off' : 'fs-dot-wait'));
    }

    // Updates the status dots and line without rebuilding the sheet. The line fades out after about 4 seconds,
    // except errors and the reconnect chip, which stay. The dot stays. Reduced motion: it just disappears.
    function driveStatusNodes(s) {
        var dots = doc.querySelectorAll('.fs-dot'), i, line = doc.getElementById('fs-drive-status');
        for (i = 0; i < dots.length; i++) { dots[i].className = 'fs-dot ' + statusClass(s.phase); }
        if (!line) { return; }
        if (s.seq === drive.fadeSeq) { return; }
        drive.fadeSeq = s.seq;
        w.clearTimeout(drive.fadeT);
        line.className = 'fs-note fs-statusline';
        line.textContent = s.text;
        if (s.text && !s.sticky) {
            drive.fadeT = w.setTimeout(function () {
                var calm = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (calm) { line.textContent = ''; return; }
                line.className = 'fs-note fs-statusline fs-fade';
                drive.fadeT = w.setTimeout(function () { line.textContent = ''; line.className = 'fs-note fs-statusline'; }, 500);
            }, 4000);
        }
    }

    function driveOnStatus(s) {
        drive.st = s;
        driveStatusNodes(s);
        var key = [s.connected, s.auto, s.prompts.length, s.phase === 'reconnect', s.phase === 'another', s.last].join('|');
        if (key !== drive.viewKey) {
            drive.viewKey = key;
            if (isOpen && activeTab === 'data' && !drive.busy && !(doc.activeElement && doc.activeElement.id === 'fs-drive-label')) { driveRerender(); }
        }
    }

    function dot(s) { var d = el('span', 'fs-dot ' + statusClass(s ? s.phase : 'off')); d.setAttribute('aria-hidden', 'true'); return d; }

    function renderDrive(host) {
        var D = w.FongGDrive, A = w.FongGDriveAuto, s = A ? A.getStatus() : null;
        drive.st = s;
        var head = el('h3', 'fs-h', 'Back up to Google Drive ');
        head.appendChild(dot(s));
        host.appendChild(head);
        host.appendChild(el('p', 'fs-note', 'Optional. Keeps copies of your game progress in your own Google Drive, in a hidden folder only this arcade can open. Saving to a file above and importing a file below still work with no account.'));
        host.appendChild(el('p', 'fs-note', 'Google is only contacted after you tap Connect. The sign-in is kept in memory only, so each new visit asks you to connect again.'));
        var configured = D.isConfigured(), connected = D.isConnected();
        if (!configured) { host.appendChild(el('p', 'fs-warn', D.NOT_SET_UP)); }
        host.appendChild(el('p', 'fs-strong', connected ? 'Connected to Google Drive.' : 'Not connected.'));
        var line = el('p', 'fs-note fs-statusline', s ? s.text : '');
        line.id = 'fs-drive-status'; line.setAttribute('aria-live', 'polite');
        host.appendChild(line);
        if (s) { drive.fadeSeq = -1; driveStatusNodes(s); }
        if (drive.msg) {
            var msg = el('p', drive.warn ? 'fs-warn' : 'fs-note', drive.msg);
            msg.setAttribute('aria-live', 'polite');
            host.appendChild(msg);
        }
        if (s && s.phase === 'error') { host.appendChild(btn('Dismiss', '', function () { A.dismissError(); driveRerender(); })); }
        var needGate = (drive.gating || connected) && !unlocked;
        if (needGate) {
            host.appendChild(el('p', 'fs-note', connected ? 'Backups, restores and deleting are locked. Answer the question to use them.' : ''));
            renderGate(host, function () { drive.gating = false; if (connected) { driveRerender(); } else { driveConnect(); } });
            return;
        }
        var row = el('div', 'fs-row');
        if (!connected) {
            var again = s && s.phase === 'reconnect';
            var cbtn = btn(again ? 'Tap to reconnect' : 'Connect to Google Drive', 'fs-go', function () {
                if (!unlocked) { drive.gating = true; driveRerender(); return; }
                driveConnect();
            });
            cbtn.disabled = !configured || drive.busy;
            row.appendChild(cbtn);
            host.appendChild(row);
            return;
        }
        // connected and unlocked from here on
        var prs = A ? A.prompts() : [], pi;
        for (pi = 0; pi < prs.length; pi++) {
            (function (pr) {
                var card = el('div', 'fs-box fs-drive-card');
                card.setAttribute('role', 'group');
                card.appendChild(el('p', 'fs-strong', 'A newer backup was found for ' + pr.name + '. Load it?'));
                if (pr.reason === 'conflict') { card.appendChild(el('p', 'fs-dim', 'Another device saved to Drive since this one did, so this device did not overwrite it.')); }
                var cr = el('div', 'fs-row');
                var lb = btn('Load', 'fs-go', function () { driveLoadNewer(pr); });
                lb.disabled = drive.busy;
                cr.appendChild(lb);
                cr.appendChild(btn('Not now', '', function () { A.dismiss(pr.game); driveRerender(); }));
                card.appendChild(cr);
                host.appendChild(card);
            })(prs[pi]);
        }
        // autosave
        if (A) {
            var lab = el('label', 'fs-check');
            var cb = el('input'); cb.type = 'checkbox'; cb.id = 'fs-auto'; cb.checked = A.isAuto();
            lab.appendChild(cb);
            lab.appendChild(el('span', '', 'Auto backup (one changed game at a time, kept as one copy per game plus one per day)'));
            cb.addEventListener('change', function () { A.setAuto(cb.checked); driveSay(cb.checked ? 'Auto backup on.' : 'Auto backup off. This sign-in ends when you close Settings.', false); driveRerender(); });
            host.appendChild(lab);
            if (s && s.phase === 'another') { host.appendChild(el('p', 'fs-note', 'Another window is backing up.')); }
            var lt = A.lastTimes(), li;
            if (lt.length) {
                var ul0 = el('ul', 'fs-list');
                for (li = 0; li < lt.length && li < 12; li++) { ul0.appendChild(el('li', 'fs-dim', lt[li].name + ': ' + new Date(lt[li].time).toLocaleString())); }
                host.appendChild(el('p', 'fs-strong', 'Last auto backup'));
                host.appendChild(ul0);
            }
        }
        // save points
        host.appendChild(el('h4', 'fs-gname', 'Save points'));
        host.appendChild(el('p', 'fs-dim', 'A save point is a dated copy you make yourself. The newest ' + D.KEEP + ' of each kind are kept. The name below is optional and is used by every Back up button.'));
        var lin = el('input', 'fs-input'); lin.type = 'text'; lin.maxLength = 30; lin.value = drive.label; lin.setAttribute('autocomplete', 'off');
        lin.addEventListener('input', function () { drive.label = lin.value; });
        host.appendChild(field('Save point name (optional)', lin, 'fs-drive-label'));
        var ball = btn('Back up everything', 'fs-go', function () { driveBackup('all'); });
        ball.disabled = !driveReady();
        row.appendChild(ball);
        if (A) {
            var bn = btn('Back up changes now', '', function () {
                drive.busy = true; driveSay('Backing up...', false); driveRerender();
                A.runNow(function (e, r) {
                    drive.busy = false;
                    if (e) { driveSay(e.message, true); } else if (r && r.conflicts && !r.saved) { driveSay('A newer backup was found, so nothing was overwritten.', false); }
                    else { driveSay(r && r.saved ? 'Backed up ' + r.saved + ' game' + (r.saved === 1 ? '' : 's') + '.' : 'Nothing has changed.', false); }
                    driveRefresh();
                });
            });
            bn.disabled = drive.busy;
            row.appendChild(bn);
        }
        var rf = btn('Refresh list', '', function () { drive.busy = true; driveSay('Loading backups...', false); driveRerender(); driveRefresh(); });
        rf.disabled = drive.busy;
        row.appendChild(rf);
        row.appendChild(btn('Disconnect', '', function () {
            var done = function () { driveForget(); driveSay('Disconnected.', false); driveRerender(); };
            if (A) { A.disconnect(done); } else { D.disconnect(done); }
        }));
        host.appendChild(row);
        host.appendChild(el('p', 'fs-dim', 'Use the Back up button on a game below to save a save point for just that game.'));
        var items = drive.items;
        if (items && !items.length) { host.appendChild(el('p', 'fs-note', 'No backups yet.')); }
        if (items && items.length) {
            var ul = el('ul', 'fs-list fs-drive-list'), i;
            for (i = 0; i < items.length && i < 60; i++) {
                (function (it) {
                    var li2 = el('li', 'fs-drive-item');
                    var when = new Date(it.time), kind = it.type === 'auto' ? 'Auto' : (it.type === 'daily' ? 'Daily' : 'Save point');
                    li2.appendChild(el('span', 'fs-strong', driveScopeName(it.scope)));
                    if (it.label) { li2.appendChild(el('span', 'fs-strong', ' "' + it.label + '"')); }
                    li2.appendChild(el('span', 'fs-dim', ' ' + kind + ', ' + (isNaN(when.getTime()) ? '' : when.toLocaleString()) + ', ' + driveSize(it.size)));
                    var r2 = el('div', 'fs-row');
                    var rb = btn('Restore', '', function () { driveRestore(it); });
                    rb.setAttribute('aria-label', 'Restore ' + driveScopeName(it.scope) + ' ' + kind.toLowerCase());
                    rb.disabled = drive.busy;
                    var armed = drive.armedDel === it.id;
                    var db = btn(armed ? 'Tap again to delete' : 'Delete', armed ? 'fs-danger' : '', function () {
                        if (!unlocked) { return; }
                        if (drive.armedDel !== it.id) { drive.armedDel = it.id; driveRerender(); return; }
                        drive.armedDel = ''; drive.busy = true; driveSay('Deleting...', false); driveRerender();
                        D.remove(it.id, function (e) {
                            if (e) { drive.busy = false; driveSay(e.message, true); driveRerender(); return; }
                            driveSay('Deleted.', false); driveRefresh();
                        });
                    });
                    db.setAttribute('aria-label', 'Delete ' + driveScopeName(it.scope) + ' ' + kind.toLowerCase());
                    db.disabled = drive.busy;
                    r2.appendChild(rb); r2.appendChild(db);
                    li2.appendChild(r2);
                    ul.appendChild(li2);
                })(items[i]);
            }
            host.appendChild(ul);
        }
        var rh = el('div', 'fs-drive-restore');
        host.appendChild(rh);
        renderDriveRestore(rh);
    }

    function renderGameSaveImports(host) {
        var G = w.FongGameSaves;
        function check(t, m) { return G.importJSON(t, { mode: m, dryRun: true }); }
        function apply(t, m) {
            var r = G.importJSON(t, { mode: m });
            if (!r.ok) { r.message = ''; return r; }
            r.message = r.ok ? 'Imported game saves for ' + r.games.length + ' game' + (r.games.length === 1 ? '' : 's') + '. Reload a game to see it.' : '';
            return r;
        }
        loadBox(host, 'games', check, apply);
    }

    function renderData(host) {
        host.appendChild(el('h3', 'fs-h', 'Data'));
        host.appendChild(el('p', 'fs-strong', 'Everything stays on this device. Clearing browser data erases it.'));
        host.appendChild(el('p', 'fs-note', 'Nothing is sent anywhere unless you choose Google Drive backup below. No accounts. Use Export everything to keep a backup or move to a new device.'));

        host.appendChild(el('h3', 'fs-h', 'Export everything'));
        host.appendChild(el('p', 'fs-note', 'Theme, scores, cheer settings, play options and game saves in one file.'));
        var lab = el('label', 'fs-check');
        var inc = el('input'); inc.type = 'checkbox'; inc.id = 'fs-incname';
        lab.appendChild(inc);
        lab.appendChild(el('span', '', 'Include the name used for cheers'));
        host.appendChild(lab);
        host.appendChild(el('p', 'fs-dim', 'Leave this off to share the file without the name.'));
        var row = el('div', 'fs-row'), copyHost = el('div', 'fs-copyhost');
        var warnHost = el('div', 'fs-warnhost');
        row.appendChild(btn('Export everything', 'fs-go', function () {
            var t = buildEverything(inc.checked);
            showWarnings(warnHost, everythingWarnings(t));
            say(download('fong-everything.json', t) ? 'Downloaded fong-everything.json.' : 'Could not download. Try Copy instead.');
        }));
        row.appendChild(btn('Copy everything', '', function () {
            var t = buildEverything(inc.checked);
            showWarnings(warnHost, everythingWarnings(t));
            copyText(t, copyHost);
        }));
        host.appendChild(row); host.appendChild(copyHost); host.appendChild(warnHost);

        renderGameSaves(host);
        if (w.FongGDrive) { renderDrive(host); }

        host.appendChild(el('h3', 'fs-h', 'Grown-up tools'));
        if (!unlocked) { renderGate(host, render); return; }
        if (w.FongGameSaves) { renderGameSaveImports(host); }
        loadBox(host, 'all', function (t, m) { return parseEverything(t, m); }, applyEverything);

        var rb = el('div', 'fs-box');
        rb.appendChild(el('p', 'fs-strong', 'Reset app'));
        rb.appendChild(el('p', 'fs-note', 'Turns off offline mode and clears its saved copies. Your scores and settings stay. Use this if the page looks stuck or old.'));
        var a = el('a', 'fs-btn fs-link', 'Reset app (?pwa=off)');
        a.href = './index.html?pwa=off';
        rb.appendChild(a);
        rb.appendChild(el('p', 'fs-dim', 'To turn offline mode back on later, open ?pwa=on.'));
        host.appendChild(rb);
    }

    // ---- shell ---------------------------------------------------------

    var RENDER = { look: renderLook, scores: renderScores, cheers: renderCheers, play: renderPlay, data: renderData };

    function render() {
        if (!bodyEl) { return; }
        var i, tabs = tablist.children;
        for (i = 0; i < tabs.length; i++) {
            var on = tabs[i].getAttribute('data-tab') === activeTab;
            tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
            tabs[i].tabIndex = on ? 0 : -1;
        }
        while (bodyEl.firstChild) { bodyEl.removeChild(bodyEl.firstChild); }
        bodyEl.setAttribute('aria-labelledby', 'fs-tab-' + activeTab);
        RENDER[activeTab](bodyEl);
    }

    function selectTab(id, focus) {
        if (!has.call(RENDER, id)) { id = 'look'; }
        activeTab = id; armedReset = '';
        render();
        if (focus) { var t = tablist.querySelector('[data-tab="' + id + '"]'); if (t) { t.focus(); } }
    }

    function focusables() {
        var list = sheet.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]'), out = [], i;
        for (i = 0; i < list.length; i++) { if (!list[i].disabled && list[i].tabIndex >= 0) { out.push(list[i]); } }
        return out;
    }

    function onKey(e) {
        if (e.key === 'Escape') { close(); return; }
        if (e.key !== 'Tab') { return; }
        var f = focusables();
        if (!f.length) { return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (doc.activeElement === first || !sheet.contains(doc.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (doc.activeElement === last || !sheet.contains(doc.activeElement))) { e.preventDefault(); first.focus(); }
    }

    function build() {
        ov = el('div', 'fs-ov');
        ov.addEventListener('click', function (e) { if (e.target === ov) { close(); } });
        sheet = el('div', 'fs-sheet');
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-label', 'Settings');
        sheet.addEventListener('keydown', onKey);
        var head = el('div', 'fs-head');
        head.appendChild(el('h2', 'fs-title', 'Settings'));
        head.appendChild(btn('Close', 'fs-close', function () { close(); }));
        sheet.appendChild(head);
        tablist = el('div', 'fs-tabs');
        tablist.setAttribute('role', 'tablist');
        for (var i = 0; i < TABS.length; i++) {
            (function (t) {
                var b = el('button', 'fs-tab', t[1]);
                b.type = 'button'; b.id = 'fs-tab-' + t[0];
                b.setAttribute('role', 'tab'); b.setAttribute('data-tab', t[0]);
                b.addEventListener('click', function () { selectTab(t[0], false); });
                b.addEventListener('keydown', function (e) {
                    var idx = -1, j;
                    for (j = 0; j < TABS.length; j++) { if (TABS[j][0] === t[0]) { idx = j; } }
                    if (e.key === 'ArrowRight') { e.preventDefault(); selectTab(TABS[(idx + 1) % TABS.length][0], true); }
                    else if (e.key === 'ArrowLeft') { e.preventDefault(); selectTab(TABS[(idx + TABS.length - 1) % TABS.length][0], true); }
                    else if (e.key === 'Home') { e.preventDefault(); selectTab(TABS[0][0], true); }
                    else if (e.key === 'End') { e.preventDefault(); selectTab(TABS[TABS.length - 1][0], true); }
                });
                tablist.appendChild(b);
            })(TABS[i]);
        }
        var dataTab = tablist.querySelector('[data-tab="data"]');
        if (dataTab && w.FongGDriveAuto) {   // a small status dot for Drive backup, hidden while it is off
            var td = el('span', 'fs-dot fs-dot-off'); td.setAttribute('aria-hidden', 'true');
            dataTab.appendChild(td);
        }
        sheet.appendChild(tablist);
        bodyEl = el('div', 'fs-body');
        bodyEl.setAttribute('role', 'tabpanel');
        sheet.appendChild(bodyEl);
        liveEl = el('div', 'fs-live');
        liveEl.setAttribute('role', 'status');
        liveEl.setAttribute('aria-live', 'polite');
        sheet.appendChild(liveEl);
        ov.appendChild(sheet);
        doc.body.appendChild(ov);
    }

    function tidyAddress() {
        try {
            var loc = w.location, q = (loc.search || '').replace(/([?&])settings=[^&]*&?/, '$1').replace(/[?&]$/, '');
            if (loc.hash === '#settings' || q !== (loc.search || '')) {
                w.history.replaceState(null, '', loc.pathname + q);
            }
        } catch (e) { /* ignore */ }
    }

    function open(tab) {
        if (isOpen) { if (tab) { selectTab(tab, false); } return; }
        if (!ov) { build(); }
        isOpen = true; unlocked = false; armedReset = '';
        lastFocus = doc.activeElement;
        ov.hidden = false;
        doc.documentElement.className += (doc.documentElement.className ? ' ' : '') + 'fs-open';
        opener.setAttribute('aria-expanded', 'true');
        selectTab(tab || 'look', false);
        var t = tablist.querySelector('[aria-selected="true"]');
        if (t) { t.focus(); }
    }

    function close(skipFocus) {
        if (!isOpen) { return; }
        isOpen = false;
        unlocked = false;
        if (w.FongGDrive) { driveLock(); }
        ov.hidden = true;
        doc.documentElement.className = doc.documentElement.className.replace(/(^| )fs-open( |$)/g, ' ').replace(/^ +| +$/g, '');
        opener.setAttribute('aria-expanded', 'false');
        tidyAddress();
        if (!skipFocus && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
    }

    // Take over the button. This file loads before panel.js, so stopping here keeps the old panel from also opening.
    opener.setAttribute('aria-label', 'Settings');
    opener.setAttribute('aria-haspopup', 'dialog');
    var lbl = opener.querySelector('.theme-open-label');
    if (lbl) { lbl.textContent = 'Settings'; }
    opener.addEventListener('click', function (e) { e.stopImmediatePropagation(); open('look'); });

    function fromAddress() {
        var h = w.location.hash, m = /[?&]settings=([a-z0-9]*)/.exec(w.location.search || '');
        if (h === '#settings') { open('look'); return; }
        var hm = /^#settings-([a-z]+)$/.exec(h);
        if (hm) { open(hm[1]); return; }
        if (m) { open(m[1] && m[1] !== '1' ? m[1] : 'look'); }
    }

    if (w.FongGDriveAuto) { w.FongGDriveAuto.onStatus(driveOnStatus); }

    w.FongSettings = { open: open, close: close, isOpen: function () { return isOpen; } };
    w.addEventListener('hashchange', fromAddress);
    if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', fromAddress); } else { fromAddress(); }
})(window);
