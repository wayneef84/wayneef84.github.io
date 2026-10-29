/**
 * Mode 5: Pick-a-Prize. Twelve gift boxes, open 3. Every box holds a prize.
 * The prizes are shuffled each round, so any three boxes are equally good.
 * Paid round: prizes are fractions of the bet, return 95% exactly.
 * Free bonus (from 5-Reel scatters): prizes are whole multiples of the bet.
 *
 * Also exports Slots.bonusUI.pick (the screen) and Slots.bonusLogic.pick* (the maths).
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;
    var PICKS = 3;
    var PAID = [1, 1, 1, 1, 2, 2, 2, 3, 4, 5, 8, 8];      // units (bet / 10); mean 3.1667, 3 picks = 95%
    var FREE = [2, 2, 3, 3, 4, 5, 5, 6, 8, 10, 12, 20];   // multiples of the bet, 3 picks

    /** Shuffled prize list in coins. free = bonus round (no stake). */
    function boxes(bet, free, rng) {
        var out = [];
        for (var i = 0; i < PAID.length; i++) {
            out.push(free ? FREE[i] * bet : E.coins(PAID[i], bet));
        }
        return E.shuffle(out, rng);
    }

    /** Headless play: open 3 random boxes, return coins won. */
    function playRandom(bet, free, rng) {
        var b = boxes(bet, free, rng);
        var total = 0;
        for (var i = 0; i < PICKS; i++) { total += b[i]; }
        return total;
    }

    S.bonusLogic = S.bonusLogic || {};
    S.bonusLogic.pickBoxes = boxes;
    S.bonusLogic.pickRandom = playRandom;
    S.bonusLogic.PICKS = PICKS;

    /**
     * The pick screen. opts = { theme, bet, free, calm, credit(total), onDone(total) }
     * credit is called once with the total. onDone is called once, after the player has seen the result.
     * Returns { skip, destroy }.
     */
    function run(host, opts) {
        var vals = boxes(opts.bet, opts.free);
        var left = PICKS;
        var total = 0;
        var finished = false;
        var timers = [];
        var root = V.el('div', 'pickgame');
        var info = V.el('div', 'pick-info');
        var grid = V.el('div', 'pick-grid');
        var skipBtn = V.el('button', 'btn small', 'Open them for me');
        skipBtn.type = 'button';
        var btns = [];
        root.appendChild(info);
        root.appendChild(grid);
        root.appendChild(skipBtn);
        host.appendChild(root);

        function later(fn, ms) { timers.push(setTimeout(fn, opts.calm ? Math.min(ms, 100) : ms)); }
        function setInfo() {
            info.textContent = finished ? ('You won ' + total + ' coins') : ('Open ' + left + (left === 1 ? ' box' : ' boxes') + '. Won so far: ' + total);
        }
        function reveal(i, picked) {
            var b = btns[i];
            if (b.classList.contains('open')) { return; }
            b.classList.add('open');
            if (!picked) { b.classList.add('rest'); }
            b.querySelector('.back').textContent = '+' + vals[i];
            b.disabled = true;
            b.setAttribute('aria-label', 'Box opened, ' + vals[i] + ' coins');
        }
        function finish() {
            if (finished) { return; }
            finished = true;
            opts.credit(total);
            for (var i = 0; i < btns.length; i++) { reveal(i, false); }
            skipBtn.disabled = true;
            setInfo();
            S.sfx.play(total >= vals.length ? 'big' : 'win');
            later(function () { if (opts.onDone) { var f = opts.onDone; opts.onDone = null; f(total); } }, 1600);
        }
        function pick(i) {
            if (finished || left <= 0 || btns[i].classList.contains('open')) { return; }
            reveal(i, true);
            total += vals[i];
            left--;
            S.sfx.play('flip');
            setInfo();
            if (left === 0) { later(finish, 500); }
        }
        function openRest() {
            // Let the game choose for the player: random unopened boxes.
            var free = [];
            for (var i = 0; i < btns.length; i++) { if (!btns[i].classList.contains('open')) { free.push(i); } }
            free = E.shuffle(free);
            while (left > 0 && free.length) {
                var idx = free.shift();
                reveal(idx, true);
                total += vals[idx];
                left--;
            }
            finish();
        }
        for (var n = 0; n < vals.length; n++) {
            (function (i) {
                var b = V.el('button', 'box');
                b.type = 'button';
                b.setAttribute('aria-label', 'Gift box ' + (i + 1));
                var inner = V.el('span', 'box-inner');
                var front = V.el('span', 'front');
                V.setGlyph(front, opts.theme, 7);
                var back = V.el('span', 'back');
                inner.appendChild(front);
                inner.appendChild(back);
                b.appendChild(inner);
                b.addEventListener('click', function () { S.sfx.unlock(); pick(i); });
                grid.appendChild(b);
                btns.push(b);
            })(n);
        }
        skipBtn.addEventListener('click', function () { S.sfx.unlock(); openRest(); });
        setInfo();

        return {
            skip: openRest,
            destroy: function () {
                for (var i = 0; i < timers.length; i++) { clearTimeout(timers[i]); }
                if (root.parentNode) { root.parentNode.removeChild(root); }
            },
            resize: function () {
                var cell = V.fitCell(host, 4.3, 3.9, 12, 90, 84);
                root.style.setProperty('--box', cell + 'px');
            }
        };
    }

    S.bonusUI = S.bonusUI || {};
    S.bonusUI.pick = { run: run };

    function create(host, api) {
        var theme = api.theme();
        var game = null;
        var holder = V.el('div', 'bonus-holder');
        host.appendChild(holder);
        function show(t) {
            if (game) { game.destroy(); game = null; }
            V.clear(holder);
            var preview = V.el('div', 'pick-idle');
            preview.appendChild(V.el('div', 'pick-idle-title', 'Pick-a-Prize'));
            preview.appendChild(V.el('div', 'pick-idle-text', 'Tap PLAY, then open 3 of the 12 gift boxes.'));
            var row = V.el('div', 'pick-idle-row');
            for (var i = 0; i < 4; i++) { var g = V.el('span', 'g'); V.setGlyph(g, t, 7); row.appendChild(g); }
            preview.appendChild(row);
            holder.appendChild(preview);
        }
        show(theme);
        return {
            setTheme: function (t) { theme = t; if (!game) { show(t); } },
            resize: function () { if (game) { game.resize(); } },
            play: function (bet, done) {
                if (game) { game.destroy(); }
                V.clear(holder);
                game = run(holder, {
                    theme: theme, bet: bet, free: false, calm: api.calm(),
                    credit: function (total) { api.credit(total, 'pick'); },
                    onDone: function (total) { api.celebrate(total, bet); done(); }
                });
                game.resize();
            },
            skip: function () { if (game) { game.skip(); } },
            destroy: function () { if (game) { game.destroy(); } if (holder.parentNode) { holder.parentNode.removeChild(holder); } }
        };
    }

    function paytable(bet) {
        var seen = {};
        var rows = [];
        for (var i = 0; i < PAID.length; i++) {
            var c = E.coins(PAID[i], bet);
            if (!seen[c]) { seen[c] = 1; rows.push({ sym: -1, label: 'Prize', vals: [c] }); }
        }
        return rows;
    }

    S.registerMode({
        id: 'pick',
        name: 'Pick-a-Prize',
        short: 'Pick',
        icon: '🎁',
        cta: 'PLAY',
        lever: false,
        howTo: 'Tap 3 gift boxes to open them. Every box has a prize inside.',
        rtp: 0.95,
        roll: function (bet, rng) { return { win: playRandom(bet, false, rng) }; },
        paytable: paytable,
        create: create
    });
}());
