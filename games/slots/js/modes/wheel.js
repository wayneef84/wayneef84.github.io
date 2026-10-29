/**
 * Mode 6: Prize Wheel. One spin, 12 equal slices, every slice wins something.
 * Paid spin: prizes are fractions of the bet, return 95% exactly.
 * Free bonus (from Cascade scatters): prizes are whole multiples of the bet.
 *
 * Also exports Slots.bonusUI.wheel (the screen) and Slots.bonusLogic.wheel* (the maths).
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;
    // Slice layout around the wheel, starting at the top going clockwise.
    var PAID = [3, 12, 5, 32, 4, 10, 6, 15, 5, 8, 6, 8];   // units (bet / 10); sum 114, mean 9.5 = 95%
    var FREE = [3, 15, 5, 50, 4, 10, 6, 20, 5, 8, 2, 3];   // multiples of the bet; sum 131

    function slices(bet, free) {
        var out = [];
        for (var i = 0; i < PAID.length; i++) { out.push(free ? FREE[i] * bet : E.coins(PAID[i], bet)); }
        return out;
    }

    function spinIndex(rng) { return Math.floor((rng || E.rng)() * PAID.length); }

    S.bonusLogic = S.bonusLogic || {};
    S.bonusLogic.wheelSlices = slices;
    S.bonusLogic.wheelRandom = function (bet, free, rng) { return slices(bet, free)[spinIndex(rng)]; };

    /**
     * The wheel screen. opts = { theme, bet, free, calm, credit(total), onDone(total), auto }
     * Returns { spin, skip, destroy, resize }.
     */
    function run(host, opts) {
        var vals = slices(opts.bet, opts.free);
        var n = vals.length;
        var seg = 360 / n;
        var target = spinIndex();
        var spun = false;
        var finished = false;
        var timers = [];
        var root = V.el('div', 'wheelgame');
        var info = V.el('div', 'pick-info', opts.free ? 'Bonus wheel!' : 'Tap SPIN to turn the wheel');
        var stage = V.el('div', 'wheel-stage');
        var wheel = V.el('div', 'wheel');
        var pointer = V.el('div', 'wheel-pointer');
        pointer.setAttribute('aria-hidden', 'true');
        var skipBtn = V.el('button', 'btn small', 'Skip');
        skipBtn.type = 'button';
        for (var i = 0; i < n; i++) {
            var lab = V.el('span', 'wlabel', String(vals[i]));
            lab.style.transform = 'rotate(' + ((i + 0.5) * seg) + 'deg) translateY(calc(var(--wr) * -0.74))';
            wheel.appendChild(lab);
        }
        var hub = V.el('div', 'wheel-hub');
        V.setGlyph(hub, opts.theme, 7);
        wheel.appendChild(hub);
        stage.appendChild(wheel);
        stage.appendChild(pointer);
        root.appendChild(info);
        root.appendChild(stage);
        root.appendChild(skipBtn);
        host.appendChild(root);

        function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

        function finish() {
            if (finished) { return; }
            finished = true;
            skipBtn.disabled = true;
            wheel.style.transition = 'none';
            wheel.style.transform = 'rotate(' + finalAngle + 'deg)';
            var lit = wheel.querySelectorAll('.wlabel');
            if (lit[target]) { lit[target].classList.add('hit'); }
            info.textContent = 'You won ' + vals[target] + ' coins';
            S.sfx.play(vals[target] >= opts.bet * 3 ? 'big' : 'win');
            later(function () { if (opts.onDone) { var f = opts.onDone; opts.onDone = null; f(vals[target]); } }, opts.calm ? 300 : 1400);
        }

        var finalAngle = 0;
        function spin() {
            if (spun) { return; }
            spun = true;
            opts.credit(vals[target]); // credited once, up front; the animation only shows it
            var jitter = (Math.random() - 0.5) * seg * 0.6;
            var turns = opts.calm ? 0 : 5;
            finalAngle = turns * 360 - (target + 0.5) * seg + jitter;
            info.textContent = 'Spinning...';
            S.sfx.play('lever');
            if (opts.calm) {
                later(finish, 250);
            } else {
                void wheel.offsetWidth;
                wheel.style.transition = 'transform 4s cubic-bezier(0.12, 0.6, 0.12, 1)';
                wheel.style.transform = 'rotate(' + finalAngle + 'deg)';
                later(finish, 4100);
            }
        }
        function skip() { if (!spun) { spin(); } finish(); }

        skipBtn.addEventListener('click', function () { S.sfx.unlock(); skip(); });
        if (opts.auto) { later(spin, 700); } else { skipBtn.style.visibility = 'hidden'; }

        return {
            spin: spin,
            skip: skip,
            destroy: function () {
                for (var k = 0; k < timers.length; k++) { clearTimeout(timers[k]); }
                if (root.parentNode) { root.parentNode.removeChild(root); }
            },
            resize: function () {
                var size = V.fitCell(host, 1, 1, 12, 96, 340);
                stage.style.setProperty('--wr', (size / 2) + 'px');
                stage.style.width = size + 'px';
                stage.style.height = size + 'px';
            }
        };
    }

    S.bonusUI = S.bonusUI || {};
    S.bonusUI.wheel = { run: run };

    function create(host, api) {
        var theme = api.theme();
        var curBet = 10;
        var game = null;
        var busy = false;
        var holder = V.el('div', 'bonus-holder');
        host.appendChild(holder);
        function idle() {
            if (game) { game.destroy(); game = null; }
            V.clear(holder);
            game = run(holder, {
                theme: theme, bet: curBet, free: false, calm: api.calm(), auto: false,
                credit: function () {}, onDone: null
            });
            game.resize();
        }
        idle();
        return {
            setTheme: function (t) { theme = t; if (!busy) { idle(); } },
            setBet: function (b) { curBet = b; if (!busy) { idle(); } },
            resize: function () { if (game) { game.resize(); } },
            play: function (bet, done) {
                var finished = false;
                busy = true;
                curBet = bet;
                if (game) { game.destroy(); game = null; }
                V.clear(holder);
                game = run(holder, {
                    theme: theme, bet: bet, free: false, calm: api.calm(), auto: true,
                    credit: function (total) { api.credit(total, 'wheel'); },
                    onDone: function (total) {
                        if (finished) { return; }
                        finished = true;
                        busy = false;
                        api.celebrate(total, bet);
                        done();
                    }
                });
                game.resize();
            },
            skip: function () { if (game && busy) { game.skip(); } },
            destroy: function () { if (game) { game.destroy(); } if (holder.parentNode) { holder.parentNode.removeChild(holder); } }
        };
    }

    function paytable(bet) {
        var v = slices(bet, false).slice().sort(function (a, b) { return b - a; });
        var seen = {};
        var rows = [];
        for (var i = 0; i < v.length; i++) { if (!seen[v[i]]) { seen[v[i]] = 1; rows.push({ sym: -1, label: 'Slice', vals: [v[i]] }); } }
        return rows;
    }

    S.registerMode({
        id: 'wheel',
        name: 'Prize Wheel',
        short: 'Wheel',
        icon: '🎡',
        cta: 'SPIN',
        lever: false,
        howTo: 'Spin the wheel. Every slice is a prize, so everyone wins something.',
        rtp: 0.95,
        roll: function (bet, rng) { return { win: S.bonusLogic.wheelRandom(bet, false, rng) }; },
        paytable: paytable,
        create: create
    });
}());
