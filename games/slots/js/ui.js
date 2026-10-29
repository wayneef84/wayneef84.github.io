/**
 * Slots controller: HUD, bet, mode switcher, theme picker, help, bonus overlay,
 * refill and the one place where coins change.
 *
 * Money rules (all coins, all whole numbers):
 *   - A round starts only when no round is running (busy flag).
 *   - The bet is taken once at the start, a win is credited once per tag
 *     (round.paid[tag]), so nothing can pay twice.
 *   - The coin display lags a win until the animation ends (pendingWin).
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;

    var state = null;
    var mode = null;
    var view = null;
    var theme = null;
    var busy = false;
    var round = null;
    var roundSeq = 0;
    var pendingWin = 0;
    var watchdog = null;
    var timers = [];
    var el = {};
    var lastFocus = null;
    var mq = null;
    var forceCalm = false;

    function $(id) { return document.getElementById(id); }
    function fmt(n) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

    function isCalm() {
        return forceCalm || state.calm || !!(mq && mq.matches);
    }

    function persist() { S.store.save(state); }

    function later(fn, ms) {
        var t = setTimeout(function () {
            var i = timers.indexOf(t);
            if (i >= 0) { timers.splice(i, 1); }
            fn();
        }, ms);
        timers.push(t);
        return t;
    }

    function say(text) { if (el.live) { el.live.textContent = text; } }

    /* ---------------- HUD ---------------- */

    function renderHud() {
        el.coins.textContent = fmt(Math.max(0, state.coins - pendingWin));
        el.bet.textContent = fmt(state.bet);
        var idx = E.BETS.indexOf(state.bet);
        el.betDown.disabled = busy || idx <= 0;
        var nextBet = E.BETS[idx + 1];
        el.betUp.disabled = busy || nextBet === undefined || nextBet > state.coins;
        el.spin.disabled = false;
        el.spin.textContent = busy ? 'SKIP' : mode.cta;
        el.spin.setAttribute('aria-label', busy ? 'Skip the animation' : (mode.cta === 'SPIN' ? 'Spin' : mode.cta));
        el.themeBtn.disabled = busy;
        var chips = el.modes.querySelectorAll('button');
        for (var i = 0; i < chips.length; i++) { chips[i].disabled = busy && chips[i].getAttribute('data-id') !== mode.id; }
        el.refill.hidden = !(state.coins < E.BETS[0] && !busy);
        if (el.lever) { el.lever.disabled = false; }
    }

    function setLast(n) { el.last.textContent = fmt(n); }

    /* ---------------- theme ---------------- */

    function applyTheme(key) {
        theme = S.themes.get(key);
        state.theme = theme.key;
        var root = el.app.style;
        root.setProperty('--bg', theme.pal[0]);
        root.setProperty('--bg2', theme.pal[1]);
        root.setProperty('--accent', theme.pal[2]);
        root.setProperty('--reel', theme.pal[3]);
        root.setProperty('--ink', theme.pal[4]);
        el.themeName.textContent = theme.name;
        V.setGlyph(el.themeIcon, theme, 5);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) { meta.setAttribute('content', theme.pal[0]); }
        if (view) { view.setTheme(theme); }
        persist();
        markThemeCards();
    }

    function setTheme(key) {
        if (busy) { return; }
        applyTheme(key);
    }

    var filterGroup = 'All';
    function buildThemeSheet() {
        var chips = ['All', 'Kids'].concat(S.themes.GROUPS);
        for (var i = 0; i < chips.length; i++) {
            (function (name) {
                var b = V.el('button', 'chip', name);
                b.type = 'button';
                b.setAttribute('data-g', name);
                b.setAttribute('aria-pressed', name === filterGroup ? 'true' : 'false');
                b.addEventListener('click', function () {
                    filterGroup = name;
                    var all = el.themeChips.querySelectorAll('.chip');
                    for (var k = 0; k < all.length; k++) { all[k].setAttribute('aria-pressed', all[k].getAttribute('data-g') === name ? 'true' : 'false'); }
                    renderThemeList();
                });
                el.themeChips.appendChild(b);
            })(chips[i]);
        }
        el.themeSearch.addEventListener('input', renderThemeList);
        renderThemeList();
    }

    function renderThemeList() {
        var q = el.themeSearch.value.replace(/^\s+|\s+$/g, '').toLowerCase();
        V.clear(el.themeList);
        var shown = 0;
        for (var i = 0; i < S.themes.list.length; i++) {
            var t = S.themes.list[i];
            if (filterGroup === 'Kids' && !t.kids) { continue; }
            if (filterGroup !== 'All' && filterGroup !== 'Kids' && t.group !== filterGroup) { continue; }
            if (q && (t.name + ' ' + t.flavour + ' ' + t.group).toLowerCase().indexOf(q) < 0) { continue; }
            el.themeList.appendChild(themeCard(t));
            shown++;
        }
        el.themeEmpty.hidden = shown > 0;
        el.themeCount.textContent = shown + ' of ' + S.themes.list.length + ' themes';
    }

    function themeCard(t) {
        var b = V.el('button', 'tcard');
        b.type = 'button';
        b.setAttribute('data-key', t.key);
        b.style.setProperty('--c1', t.pal[0]);
        b.style.setProperty('--c2', t.pal[1]);
        b.style.setProperty('--ca', t.pal[2]);
        var prev = V.el('span', 'tprev');
        for (var i = 3; i < 6; i++) { var g = V.el('span', 'g'); V.setGlyph(g, t, i); prev.appendChild(g); }
        var w = V.el('span', 'g wild');
        V.setGlyph(w, t, 6);
        prev.appendChild(w);
        b.appendChild(prev);
        b.appendChild(V.el('span', 'tname', t.name));
        b.appendChild(V.el('span', 'tflav', t.flavour));
        b.setAttribute('aria-pressed', t.key === state.theme ? 'true' : 'false');
        b.addEventListener('click', function () {
            S.sfx.unlock();
            setTheme(t.key);
            closeSheet(el.themeSheet);
        });
        return b;
    }

    function markThemeCards() {
        if (!el.themeList) { return; }
        var cards = el.themeList.querySelectorAll('.tcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].setAttribute('aria-pressed', cards[i].getAttribute('data-key') === state.theme ? 'true' : 'false');
        }
    }

    /* ---------------- sheets ---------------- */

    function openSheet(sheet) {
        lastFocus = document.activeElement;
        sheet.hidden = false;
        var f = sheet.querySelector('.sheet-close');
        if (f) { f.focus(); }
    }

    function closeSheet(sheet) {
        if (sheet.hidden) { return; }
        sheet.hidden = true;
        if (sheet === el.helpSheet && mode) { state.seen[mode.id] = true; persist(); }
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
    }

    function anySheetOpen() {
        return !el.themeSheet.hidden || !el.helpSheet.hidden || !el.bonus.hidden;
    }

    function openHelp() {
        el.helpTitle.textContent = mode.name;
        el.helpText.textContent = mode.howTo;
        V.clear(el.helpPay);
        var rows = mode.paytable ? mode.paytable(state.bet) : [];
        el.helpPayTitle.textContent = 'Prizes at a bet of ' + fmt(state.bet) + ' coins';
        for (var i = 0; i < rows.length; i++) {
            var r = V.el('div', 'pt-row');
            var g = V.el('span', 'g');
            if (rows[i].sym >= 0) { V.setGlyph(g, theme, rows[i].sym); } else { g.textContent = '⭐'; }
            r.appendChild(g);
            var lab = V.el('span', 'pt-label', rows[i].label);
            r.appendChild(lab);
            if (rows[i].vals.length) { r.appendChild(V.el('span', 'pt-vals', rows[i].vals.join('  |  '))); }
            el.helpPay.appendChild(r);
        }
        el.optSound.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
        el.optSound.textContent = state.muted ? 'Sound: off' : 'Sound: on';
        var calmNow = isCalm();
        el.optCalm.setAttribute('aria-pressed', calmNow ? 'true' : 'false');
        el.optCalm.textContent = calmNow ? 'Calm mode: on' : 'Calm mode: off';
        el.optCalm.disabled = !!(mq && mq.matches);
        openSheet(el.helpSheet);
    }

    /* ---------------- modes ---------------- */

    var api = {
        theme: function () { return theme; },
        calm: isCalm,
        credit: credit,
        celebrate: celebrate,
        bonus: openBonus
    };

    function buildModeBar() {
        for (var i = 0; i < S.modes.list.length; i++) {
            (function (m) {
                var b = V.el('button', 'chip mode-chip');
                b.type = 'button';
                b.setAttribute('data-id', m.id);
                b.appendChild(V.el('span', 'mi', m.icon));
                b.appendChild(V.el('span', 'mn', m.short));
                b.addEventListener('click', function () { S.sfx.unlock(); setMode(m.id, true); });
                el.modes.appendChild(b);
            })(S.modes.list[i]);
        }
    }

    function setMode(id, fromUser) {
        if (busy) { return; }
        var m = S.modes.byId[id] || S.modes.list[0];
        if (view) { view.destroy(); view = null; }
        V.clear(el.stageInner);
        mode = m;
        state.mode = m.id;
        el.winpop.classList.remove('show');
        el.app.setAttribute('data-mode', m.id);
        el.lever.hidden = !m.lever;
        el.stage.classList.toggle('has-lever', !!m.lever);
        el.howto.textContent = m.howTo;
        var chips = el.modes.querySelectorAll('.mode-chip');
        for (var i = 0; i < chips.length; i++) {
            var on = chips[i].getAttribute('data-id') === m.id;
            chips[i].setAttribute('aria-pressed', on ? 'true' : 'false');
            if (on && chips[i].scrollIntoView && fromUser) {
                try { chips[i].scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { /* ignore */ }
            }
        }
        view = m.create(el.stageInner, api);
        view.setTheme(theme);
        if (view.setBet) { view.setBet(state.bet); }
        resize();
        persist();
        renderHud();
        if (fromUser && !state.seen[m.id]) { openHelp(); }
    }

    function resize() {
        if (view && view.resize) { view.resize(); }
    }

    /* ---------------- rounds ---------------- */

    function credit(win, tag) {
        if (!round || round.paid[tag]) { return 0; }
        round.paid[tag] = true;
        win = Math.floor(Number(win));
        if (!isFinite(win) || win < 0) { win = 0; }
        win = Math.min(win, E.MAX_COINS - state.coins);
        if (win <= 0) { return 0; }
        state.coins += win;
        pendingWin += win;
        round.win += win;
        persist();
        renderHud();
        return win;
    }

    function celebrate(win, bet) {
        if (!round) { return; }
        setLast(round.win);
        if (win > 0) {
            var big = win >= bet * 5;
            showWinPop(win, big);
            S.sfx.play(big ? 'big' : 'win');
            if (big && !isCalm()) { confetti(); }
            say('You won ' + win + ' coins.');
        } else {
            say('No win this round.');
        }
    }

    function showWinPop(win, big) {
        el.winpop.textContent = '+' + fmt(win);
        el.winpop.classList.remove('show');
        el.winpop.classList.toggle('big', !!big);
        void el.winpop.offsetWidth;
        el.winpop.classList.add('show');
        later(function () { el.winpop.classList.remove('show'); }, 1800);
    }

    function confetti() {
        var host = el.stage;
        var glyph = [3, 4, 5, 6];
        for (var i = 0; i < 14; i++) {
            var c = V.el('span', 'conf');
            V.setGlyph(c, theme, glyph[i % glyph.length]);
            c.style.left = (4 + Math.random() * 90) + '%';
            c.style.animationDelay = (Math.random() * 500) + 'ms';
            host.appendChild(c);
            (function (node) { later(function () { if (node.parentNode) { node.parentNode.removeChild(node); } }, 2600); })(c);
        }
    }

    function finishRound(r) {
        if (!round || round !== r || r.done) { return; }
        r.done = true;
        busy = false;
        clearTimeout(watchdog);
        pendingWin = 0;
        renderHud();
        persist();
    }

    function onSpin() {
        S.sfx.unlock();
        if (anySheetOpen()) { return; }
        if (busy) {
            S.sfx.play('click');
            if (view && view.skip) { view.skip(); }
            return;
        }
        if (state.coins < E.BETS[0]) { renderHud(); return; }
        if (state.coins < state.bet) {
            // Lower the bet to something affordable instead of refusing.
            for (var i = E.BETS.length - 1; i >= 0; i--) { if (E.BETS[i] <= state.coins) { state.bet = E.BETS[i]; break; } }
            if (view.setBet) { view.setBet(state.bet); }
            say('Bet lowered to ' + state.bet + ' coins.');
            renderHud();
            persist();
            return;
        }
        var bet = state.bet;
        state.coins -= bet;
        busy = true;
        var r = round = { id: ++roundSeq, bet: bet, paid: {}, win: 0, done: false };
        pendingWin = 0;
        persist();
        renderHud();
        setLast(0);
        say('');
        el.winpop.classList.remove('show');
        pullLever();
        S.sfx.play('spin');
        watchdog = setTimeout(function () {
            // Safety net: never leave the game stuck.
            if (round === r && !r.done) {
                try { if (view && view.skip) { view.skip(); } } catch (e) { /* ignore */ }
                later(function () { if (round === r && !r.done) { closeBonus(); finishRound(r); } }, 600);
            }
        }, 45000);
        try {
            view.play(bet, function () { finishRound(r); });
        } catch (err) {
            if (window.console && console.error) { console.error('[Slots] round failed', err); }
            if (!r.paid.spin && !r.win) { state.coins += bet; }
            closeBonus();
            finishRound(r);
        }
    }

    function pullLever() {
        if (!mode.lever || isCalm()) { return; }
        el.lever.classList.add('pulled');
        later(function () { el.lever.classList.remove('pulled'); }, 700);
    }

    function changeBet(dir) {
        if (busy) { return; }
        var idx = E.BETS.indexOf(state.bet) + dir;
        if (idx < 0 || idx >= E.BETS.length) { return; }
        if (E.BETS[idx] > state.coins && dir > 0) { return; }
        state.bet = E.BETS[idx];
        S.sfx.play('click');
        if (view && view.setBet) { view.setBet(state.bet); }
        persist();
        renderHud();
    }

    function refill() {
        state.coins = Math.min(E.MAX_COINS, state.coins + E.REFILL_COINS);
        S.sfx.play('win');
        persist();
        renderHud();
        say('You got ' + E.REFILL_COINS + ' free coins.');
    }

    /* ---------------- bonus overlay ---------------- */

    var bonusGame = null;
    function openBonus(type, bet, cb) {
        var comp = S.bonusUI[type];
        if (!comp || !round) { cb(); return; }
        V.clear(el.bonusBody);
        el.bonus.hidden = false;
        el.bonusTitle.textContent = type === 'pick' ? 'Bonus! Pick 3 gifts' : 'Bonus! Spin the wheel';
        S.sfx.play('bonus');
        var r = round;
        var finished = false;
        bonusGame = comp.run(el.bonusBody, {
            theme: theme, bet: bet, free: true, calm: isCalm(), auto: true,
            credit: function (total) { credit(total, 'bonus'); },
            onDone: function (total) {
                if (finished) { return; }
                finished = true;
                closeBonus();
                if (total > 0) { showWinPop(total, total >= bet * 5); say('Bonus won ' + total + ' coins.'); }
                setLast(r.win);
                cb();
            }
        });
        if (bonusGame.resize) { bonusGame.resize(); }
    }

    function closeBonus() {
        if (bonusGame) { bonusGame.destroy(); bonusGame = null; }
        if (el.bonus) { el.bonus.hidden = true; }
    }

    /* ---------------- init ---------------- */

    function bind() {
        el.spin.addEventListener('click', onSpin);
        el.lever.addEventListener('click', function () { if (!el.lever.getAttribute('data-dragged')) { onSpin(); } el.lever.removeAttribute('data-dragged'); });
        var startY = null;
        el.lever.addEventListener('pointerdown', function (e) { startY = e.clientY; });
        el.lever.addEventListener('pointermove', function (e) {
            if (startY !== null && e.clientY - startY > 26) {
                startY = null;
                el.lever.setAttribute('data-dragged', '1');
                onSpin();
            }
        });
        el.lever.addEventListener('pointerup', function () { startY = null; });
        el.lever.addEventListener('pointercancel', function () { startY = null; el.lever.removeAttribute('data-dragged'); });
        el.betDown.addEventListener('click', function () { changeBet(-1); });
        el.betUp.addEventListener('click', function () { changeBet(1); });
        el.refillBtn.addEventListener('click', refill);
        el.themeBtn.addEventListener('click', function () { openSheet(el.themeSheet); });
        el.helpBtn.addEventListener('click', openHelp);
        el.soundBtn.addEventListener('click', function () { toggleSound(); });
        el.optSound.addEventListener('click', function () { toggleSound(); openHelpRefresh(); });
        el.optCalm.addEventListener('click', function () { state.calm = !state.calm; applyCalm(); persist(); openHelpRefresh(); });
        el.optRefill.addEventListener('click', function () { refill(); });
        var closers = document.querySelectorAll('[data-close]');
        for (var i = 0; i < closers.length; i++) {
            (function (node) {
                node.addEventListener('click', function () { closeSheet($(node.getAttribute('data-close'))); });
            })(closers[i]);
        }
        var sheets = [el.themeSheet, el.helpSheet];
        for (var s = 0; s < sheets.length; s++) {
            (function (sh) {
                sh.addEventListener('click', function (e) { if (e.target === sh) { closeSheet(sh); } });
            })(sheets[s]);
        }
        document.addEventListener('keydown', function (e) {
            var k = e.key;
            if (k === 'Escape') {
                if (!el.themeSheet.hidden) { closeSheet(el.themeSheet); } else if (!el.helpSheet.hidden) { closeSheet(el.helpSheet); }
                return;
            }
            if ((k === ' ' || k === 'Spacebar' || k === 'Enter') && !anySheetOpen()) {
                var a = document.activeElement;
                var tag = a && a.tagName ? a.tagName.toLowerCase() : '';
                if (tag === 'button' || tag === 'input' || tag === 'a' || tag === 'select' || tag === 'textarea') { return; }
                e.preventDefault();
                onSpin();
            }
        });
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', function () { later(resize, 250); });
        window.addEventListener('pagehide', persist);
    }

    function openHelpRefresh() {
        el.optSound.textContent = state.muted ? 'Sound: off' : 'Sound: on';
        el.optSound.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
        var calmNow = isCalm();
        el.optCalm.textContent = calmNow ? 'Calm mode: on' : 'Calm mode: off';
        el.optCalm.setAttribute('aria-pressed', calmNow ? 'true' : 'false');
    }

    function toggleSound() {
        state.muted = !state.muted;
        S.sfx.setMuted(state.muted);
        el.soundBtn.textContent = state.muted ? '🔇' : '🔊';
        el.soundBtn.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
        el.soundBtn.setAttribute('aria-label', state.muted ? 'Turn sound on' : 'Turn sound off');
        if (!state.muted) { S.sfx.unlock(); S.sfx.play('click'); }
        persist();
    }

    function applyCalm() {
        el.app.classList.toggle('calm', isCalm());
    }

    function init() {
        var ids = ['app', 'stage', 'stageInner', 'modes', 'howto', 'coins', 'last', 'bet', 'betDown', 'betUp', 'spin', 'lever', 'refill',
            'refillBtn', 'themeBtn', 'themeName', 'themeIcon', 'helpBtn', 'soundBtn', 'winpop', 'live', 'themeSheet', 'themeSearch',
            'themeChips', 'themeList', 'themeEmpty', 'themeCount', 'helpSheet', 'helpTitle', 'helpText', 'helpPay', 'helpPayTitle',
            'optSound', 'optCalm', 'optRefill', 'bonus', 'bonusBody', 'bonusTitle'];
        for (var i = 0; i < ids.length; i++) { el[ids[i]] = $(ids[i]); }

        try { mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { mq = null; }
        if (mq && mq.addEventListener) { mq.addEventListener('change', applyCalm); }
        forceCalm = /[?&]calm=1/.test(window.location.search);

        state = S.store.load();
        S.sfx.setMuted(state.muted);
        el.soundBtn.textContent = state.muted ? '🔇' : '🔊';
        el.soundBtn.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
        el.soundBtn.setAttribute('aria-label', state.muted ? 'Turn sound on' : 'Turn sound off');
        applyCalm();

        mode = S.modes.byId[state.mode] || S.modes.list[0];
        theme = S.themes.get(state.theme);
        buildModeBar();
        buildThemeSheet();
        bind();
        applyTheme(theme.key);
        setMode(mode.id, false);
        setLast(0);
        if (!S.store.isPersistent()) {
            $('saveNote').hidden = false;
        }
        if (!state.seen[mode.id]) { openHelp(); }
        S.game = {
            state: function () { return { coins: state.coins, bet: state.bet, theme: state.theme, mode: state.mode, busy: busy }; },
            isBusy: function () { return busy; }
        };
        later(resize, 60);
    }

    function safeInit() {
        try {
            init();
        } catch (err) {
            if (window.console && console.error) { console.error('[Slots] start failed', err); }
            var note = document.getElementById('fatal');
            if (note) { note.hidden = false; }
        }
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', safeInit); } else { safeInit(); }
}());
