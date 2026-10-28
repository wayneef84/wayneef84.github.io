/* Memory Match - game logic, UI, storage. ES5, no libraries. */
(function () {
    'use strict';

    var SIZES = {
        easy:   { label: 'Easy',   pairs: 6,  cols: 3, rows: 4 },
        normal: { label: 'Normal', pairs: 8,  cols: 4, rows: 4 },
        big:    { label: 'Big',    pairs: 10, cols: 4, rows: 5 }
    };
    var SIZE_ORDER = ['easy', 'normal', 'big'];
    var FLIP_BACK_MS = 900;
    var KEY = 'memorymatch.v1';

    var els = {};
    var settings = { set: 'emoji', size: 'easy', mute: false, timer: false, best: {} };
    var game = null;      // { cards: [...], moves, first, pending, matched, over, started }
    var pendingTimer = null;
    var clock = null;
    var layout = { cols: 3, rows: 4 };
    var lastPointer = 0;

    /* ---------- storage ---------- */
    function load() {
        var raw, d;
        try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
        if (!raw) { return; }
        try { d = JSON.parse(raw); } catch (e2) { return; }
        if (!d || typeof d !== 'object') { return; }
        if (SIZES[d.size]) { settings.size = d.size; }
        if (d.set && MMCards.sets[d.set]) { settings.set = d.set; }
        settings.mute = d.mute === true;
        settings.timer = d.timer === true;
        if (d.best && typeof d.best === 'object') { settings.best = d.best; }
    }
    function save() {
        try { window.localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* private mode: ignore */ }
    }
    function bestKey() { return settings.size + '_' + settings.set; }

    /* ---------- helpers ---------- */
    function $(id) { return document.getElementById(id); }
    function shuffle(a) {
        var i, j, t;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }
    function say(msg) { els.live.textContent = msg; }
    function snd(name) { if (window.MMSound && !settings.mute) { try { window.MMSound[name](); } catch (e) { /* ignore */ } } }
    function reduced() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    /* ---------- game ---------- */
    function newGame() {
        var def = SIZES[settings.size];
        var set = MMCards.sets[settings.set];
        var picks = shuffle(set.items.slice()).slice(0, def.pairs);
        var deck = [], i;
        for (i = 0; i < picks.length; i++) {
            deck.push({ pair: i, item: picks[i] });
            deck.push({ pair: i, item: picks[i] });
        }
        shuffle(deck);
        clearPending();
        stopClock();
        game = { cards: [], moves: 0, first: -1, pending: null, matched: 0, pairs: def.pairs, over: false, started: false, seconds: 0 };
        for (i = 0; i < deck.length; i++) {
            game.cards.push({ pair: deck[i].pair, item: deck[i].item, up: false, matched: false });
        }
        els.winPanel.hidden = true;
        clearConfetti();
        renderBoard();
        updateStatus();
        say('New game. ' + deck.length + ' cards face down.');
    }

    function clearPending() {
        if (pendingTimer) { window.clearTimeout(pendingTimer); pendingTimer = null; }
    }

    function resolvePending() {
        var p, i;
        clearPending();
        if (!game || !game.pending) { return; }
        p = game.pending;
        game.pending = null;
        for (i = 0; i < p.length; i++) {
            game.cards[p[i]].up = false;
            paintCard(p[i]);
        }
    }

    function flip(i) {
        var c, f, m;
        if (!game || game.over) { return; }
        if (game.pending) { resolvePending(); }
        c = game.cards[i];
        if (!c || c.up || c.matched) { return; }
        if (!game.started) { game.started = true; startClock(); }
        c.up = true;
        snd('flip');
        paintCard(i);
        if (game.first < 0) {
            game.first = i;
            say(c.item.name);
            return;
        }
        f = game.first;
        game.first = -1;
        game.moves++;
        updateStatus();
        m = game.cards[f];
        if (m.pair === c.pair) {
            m.matched = c.matched = true;
            game.matched++;
            paintCard(f); paintCard(i);
            snd('match');
            say('A match! ' + c.item.name);
            if (game.matched === game.pairs) { game.over = true; stopClock(); window.setTimeout(win, 800); }
        } else {
            game.pending = [f, i];
            say(c.item.name + '. Not a match, try again.');
            pendingTimer = window.setTimeout(resolvePending, FLIP_BACK_MS);
        }
    }

    function win() {
        var key = bestKey(), prev = settings.best[key], isBest = (typeof prev !== 'number' || game.moves < prev);
        if (isBest) { settings.best[key] = game.moves; save(); }
        els.winText.textContent = 'You did it in ' + game.moves + (game.moves === 1 ? ' move.' : ' moves.');
        els.winBest.textContent = isBest ? (typeof prev === 'number' ? 'A new best! Wow!' : 'Your first best score!') : 'Best so far: ' + prev + ' moves.';
        updateStatus();
        els.winPanel.hidden = false;
        snd('win');
        say('You found all the pairs in ' + game.moves + ' moves.');
        confetti();
        try { els.againBtn.focus(); } catch (e) { /* ignore */ }
    }

    /* ---------- timer (optional) ---------- */
    function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
    function startClock() {
        if (!settings.timer || clock) { return; }
        clock = window.setInterval(function () { game.seconds++; els.timer.textContent = fmt(game.seconds); }, 1000);
    }
    function stopClock() { if (clock) { window.clearInterval(clock); clock = null; } }

    /* ---------- render ---------- */
    function renderBoard() {
        var i, b = els.board, btn, inner, back, face, c;
        b.innerHTML = '';
        for (i = 0; i < game.cards.length; i++) {
            c = game.cards[i];
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'card';
            btn.setAttribute('data-i', String(i));
            btn.tabIndex = (i === 0) ? 0 : -1;
            inner = document.createElement('span'); inner.className = 'inner';
            back = document.createElement('span'); back.className = 'back'; back.setAttribute('aria-hidden', 'true'); back.textContent = '?';
            face = document.createElement('span'); face.className = 'face'; face.setAttribute('aria-hidden', 'true'); face.innerHTML = c.item.html;
            inner.appendChild(back); inner.appendChild(face); btn.appendChild(inner);
            b.appendChild(btn);
            paintCard(i);
        }
        doLayout();
    }

    function paintCard(i) {
        var btn = els.board.children[i], c = game.cards[i], n = i + 1, lab;
        if (!btn) { return; }
        btn.className = 'card' + (c.up ? ' up' : '') + (c.matched ? ' matched' : '');
        lab = 'Card ' + n + ' of ' + game.cards.length + ', ';
        if (c.matched) { lab += c.item.name + ', matched'; }
        else if (c.up) { lab += c.item.name; }
        else { lab += 'face down'; }
        btn.setAttribute('aria-label', lab);
    }

    function updateStatus() {
        var b = settings.best[bestKey()];
        els.moves.textContent = String(game ? game.moves : 0);
        els.best.textContent = (typeof b === 'number') ? String(b) : '-';
        els.timerLbl.hidden = !settings.timer;
        els.timer.textContent = fmt(game ? game.seconds : 0);
    }

    function doLayout() {
        var def = SIZES[settings.size], W = els.boardWrap.clientWidth - 12, H = els.boardWrap.clientHeight - 12;
        var gap = 8, best = 0, c, r, opts, i, s;
        if (!game || W <= 0 || H <= 0) { return; }
        opts = [[def.cols, def.rows], [def.rows, def.cols]];
        for (i = 0; i < opts.length; i++) {
            c = opts[i][0]; r = opts[i][1];
            s = Math.min((W - gap * (c - 1)) / c, (H - gap * (r - 1)) / r);
            if (s > best) { best = s; layout.cols = c; layout.rows = r; }
        }
        best = Math.max(40, Math.min(150, Math.floor(best)));
        els.board.style.setProperty('--cs', best + 'px');
        els.board.style.gridTemplateColumns = 'repeat(' + layout.cols + ', ' + best + 'px)';
        els.board.style.gridTemplateRows = 'repeat(' + layout.rows + ', ' + best + 'px)';
        els.board.style.gap = gap + 'px';
        els.panelTop = els.header.getBoundingClientRect().bottom;
        els.settingsPanel.style.top = els.panelTop + 'px';
        els.winPanel.style.top = els.panelTop + 'px';
    }

    /* ---------- confetti ---------- */
    var confettiRaf = 0;
    function clearConfetti() {
        var cv = els.confetti;
        if (confettiRaf) { window.cancelAnimationFrame(confettiRaf); confettiRaf = 0; }
        if (cv.getContext) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); }
    }
    function confetti() {
        var cv = els.confetti, ctx, W, H, parts = [], i, colors = ['#ff8fb1', '#ffd27a', '#7ad1c4', '#8f7bff', '#6cb8ff', '#ff9f68'], t0, still = reduced();
        if (!cv.getContext) { return; }
        W = cv.width = window.innerWidth; H = cv.height = window.innerHeight;
        ctx = cv.getContext('2d');
        for (i = 0; i < (still ? 40 : 90); i++) {
            parts.push({ x: Math.random() * W, y: still ? Math.random() * H * 0.6 : -20 - Math.random() * H * 0.5,
                vx: (Math.random() - 0.5) * 1.5, vy: 1.5 + Math.random() * 2.5, s: 6 + Math.random() * 8,
                c: colors[i % colors.length], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2 });
        }
        function draw(p) {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
        }
        if (still) {
            for (i = 0; i < parts.length; i++) { draw(parts[i]); }
            confettiRaf = window.setTimeout(clearConfetti, 3000);
            return;
        }
        t0 = Date.now();
        function step() {
            var k, p, age = Date.now() - t0;
            ctx.clearRect(0, 0, W, H);
            for (k = 0; k < parts.length; k++) {
                p = parts[k]; p.x += p.vx; p.y += p.vy; p.r += p.vr;
                draw(p);
            }
            if (age < 4500) { confettiRaf = window.requestAnimationFrame(step); }
            else { ctx.clearRect(0, 0, W, H); confettiRaf = 0; }
        }
        confettiRaf = window.requestAnimationFrame(step);
    }

    /* ---------- settings UI ---------- */
    function choiceButton(parent, label, small, checked, onPick) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'btn'; b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', checked ? 'true' : 'false');
        b.innerHTML = label + (small ? '<small>' + small + '</small>' : '');
        b.addEventListener('click', onPick);
        parent.appendChild(b);
        return b;
    }
    function buildSettings() {
        var i, key;
        els.sizeChoices.innerHTML = ''; els.setChoices.innerHTML = '';
        for (i = 0; i < SIZE_ORDER.length; i++) {
            key = SIZE_ORDER[i];
            (function (k) {
                choiceButton(els.sizeChoices, SIZES[k].label, SIZES[k].pairs + ' pairs', settings.size === k, function () { pickSize(k); });
            }(key));
        }
        for (i = 0; i < MMCards.order.length; i++) {
            key = MMCards.order[i];
            if (!MMCards.sets[key]) { continue; }
            (function (k) {
                choiceButton(els.setChoices, MMCards.sets[k].label, MMCards.sets[k].hint, settings.set === k, function () { pickSet(k); });
            }(key));
        }
        els.timerToggle.setAttribute('aria-pressed', settings.timer ? 'true' : 'false');
        els.timerToggle.innerHTML = '⏱️ Timer: ' + (settings.timer ? 'On' : 'Off');
        els.muteBtn.setAttribute('aria-pressed', settings.mute ? 'true' : 'false');
        els.muteBtn.setAttribute('aria-label', settings.mute ? 'Sound off. Tap to turn on' : 'Sound on. Tap to mute');
        els.muteBtn.firstChild.textContent = settings.mute ? '🔇' : '🔊';
    }
    function pickSize(k) { settings.size = k; save(); buildSettings(); newGame(); }
    function pickSet(k) { settings.set = k; save(); buildSettings(); newGame(); }
    function openSettings() {
        doLayout();
        els.winPanel.hidden = true;
        els.settingsPanel.hidden = false;
        els.settingsBtn.setAttribute('aria-expanded', 'true');
        try { els.sizeChoices.children[0].focus(); } catch (e) { /* ignore */ }
    }
    function closeSettings() {
        els.settingsPanel.hidden = true;
        els.settingsBtn.setAttribute('aria-expanded', 'false');
        if (game && game.over) { els.winPanel.hidden = false; }
    }

    /* ---------- input ---------- */
    function cardFromEvent(e) {
        var t = e.target;
        while (t && t !== els.board) { if (t.className && String(t.className).indexOf('card') === 0 && t.getAttribute('data-i') !== null) { return t; } t = t.parentNode; }
        return null;
    }
    function focusCard(i) {
        var k, kids = els.board.children;
        for (k = 0; k < kids.length; k++) { kids[k].tabIndex = (k === i) ? 0 : -1; }
        if (kids[i]) { kids[i].focus(); }
    }
    function onKey(e) {
        var t = cardFromEvent(e), i, n, cols = layout.cols, k = e.key;
        if (!t) { return; }
        i = parseInt(t.getAttribute('data-i'), 10); n = game.cards.length;
        if (k === 'Enter' || k === ' ' || k === 'Spacebar') { e.preventDefault(); unlock(); flip(i); return; }
        if (k === 'ArrowRight') { i = (i + 1) % n; }
        else if (k === 'ArrowLeft') { i = (i - 1 + n) % n; }
        else if (k === 'ArrowDown') { i = (i + cols < n) ? i + cols : i % cols; }
        else if (k === 'ArrowUp') { i = (i - cols >= 0) ? i - cols : Math.min(n - 1, i + cols * (layout.rows - 1)); }
        else { return; }
        e.preventDefault();
        focusCard(i);
    }
    function unlock() { if (window.MMSound && window.MMSound.unlock) { try { window.MMSound.unlock(); } catch (e) { /* ignore */ } } }

    function bind() {
        els.board.addEventListener('pointerdown', function (e) {
            var t = cardFromEvent(e);
            lastPointer = Date.now();
            unlock();
            if (!t) { return; }
            e.preventDefault();
            flip(parseInt(t.getAttribute('data-i'), 10));
        });
        els.board.addEventListener('click', function (e) {
            var t = cardFromEvent(e);
            if (!t || Date.now() - lastPointer < 800 || e.detail !== 0) { return; }
            flip(parseInt(t.getAttribute('data-i'), 10));  // assistive tech click without a pointer
        });
        els.board.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', unlock);
        els.restartBtn.addEventListener('click', function () { els.settingsPanel.hidden = true; newGame(); });
        els.settingsBtn.addEventListener('click', function () { if (els.settingsPanel.hidden) { openSettings(); } else { closeSettings(); } });
        els.closeSettings.addEventListener('click', closeSettings);
        els.againBtn.addEventListener('click', newGame);
        els.sizeBtn.addEventListener('click', openSettings);
        els.muteBtn.addEventListener('click', function () {
            settings.mute = !settings.mute; save(); buildSettings();
            if (!settings.mute) { unlock(); snd('flip'); }
        });
        els.timerToggle.addEventListener('click', function () {
            settings.timer = !settings.timer; save(); buildSettings(); updateStatus();
            if (settings.timer && game && game.started && !game.over) { startClock(); }
            if (!settings.timer) { stopClock(); }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !els.settingsPanel.hidden) { closeSettings(); }
        });
        window.addEventListener('resize', doLayout);
        window.addEventListener('orientationchange', function () { window.setTimeout(doLayout, 200); });
    }

    function init() {
        var ids = ['board', 'boardWrap', 'moves', 'timer', 'timerLbl', 'best', 'live', 'settingsPanel', 'winPanel', 'winText', 'winBest',
            'againBtn', 'sizeBtn', 'muteBtn', 'settingsBtn', 'restartBtn', 'closeSettings', 'sizeChoices', 'setChoices', 'timerToggle', 'confetti'], i;
        for (i = 0; i < ids.length; i++) { els[ids[i]] = $(ids[i]); }
        els.header = document.getElementsByTagName('header')[0];
        load();
        buildSettings();
        bind();
        newGame();
        window.setTimeout(doLayout, 50);
    }

    /* read-only view for tests and docs */
    window.MemoryMatch = {
        getState: function () {
            var out = { moves: game.moves, matched: game.matched, pairs: game.pairs, over: game.over, pending: !!game.pending,
                size: settings.size, set: settings.set, mute: settings.mute, cols: layout.cols, rows: layout.rows, cards: [] }, i, c;
            for (i = 0; i < game.cards.length; i++) {
                c = game.cards[i];
                out.cards.push({ pair: c.pair, id: c.item.id, up: c.up, matched: c.matched });
            }
            return out;
        }
    };

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
}());
