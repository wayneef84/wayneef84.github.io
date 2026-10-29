/**
 * Slots save data. One JSON blob under one key. Never throws: if storage is
 * blocked (private mode, file:// quirks, full) the game still runs and just
 * does not remember anything.
 *
 * Key: fong.slots.v4
 * Old key still read once for migration: dadsSlotsSave ({ balance, bet, theme }, dollars)
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var KEY = 'fong.slots.v4';
    var OLD_KEY = 'dadsSlotsSave';
    var persistent = true;

    function rawGet(k) {
        try { return window.localStorage.getItem(k); } catch (e) { persistent = false; return null; }
    }
    function rawSet(k, v) {
        try { window.localStorage.setItem(k, v); } catch (e) { persistent = false; }
    }

    function num(v, lo, hi, def) {
        v = Number(v);
        if (!isFinite(v)) { return def; }
        return Math.max(lo, Math.min(hi, Math.floor(v)));
    }

    function nearestBet(v) {
        var best = E.BETS[0];
        for (var i = 0; i < E.BETS.length; i++) {
            if (Math.abs(E.BETS[i] - v) < Math.abs(best - v)) { best = E.BETS[i]; }
        }
        return best;
    }

    function defaults() {
        return { v: 4, coins: E.START_COINS, bet: E.BETS[0], theme: 'sugar', mode: 'classic', muted: false, calm: false, seen: {} };
    }

    function sanitize(o) {
        var d = defaults();
        if (!o || typeof o !== 'object') { return d; }
        d.coins = num(o.coins, 0, E.MAX_COINS, d.coins);
        d.bet = nearestBet(Number(o.bet) || d.bet);
        d.theme = (typeof o.theme === 'string' && S.themes && S.themes.has(o.theme)) ? o.theme : d.theme;
        d.mode = (typeof o.mode === 'string' && S.modes.byId[o.mode]) ? o.mode : d.mode;
        d.muted = o.muted === true;
        d.calm = o.calm === true;
        if (o.seen && typeof o.seen === 'object') {
            for (var k in o.seen) {
                if (Object.prototype.hasOwnProperty.call(o.seen, k) && S.modes.byId[k]) { d.seen[k] = true; }
            }
        }
        return d;
    }

    function migrate() {
        var raw = rawGet(OLD_KEY);
        if (!raw) { return null; }
        try {
            var old = JSON.parse(raw);
            var out = defaults();
            // Old saves held dollars. 1 old dollar = 10 coins, capped so a lucky old save is not silly.
            var coins = Math.round(Number(old.balance) * 10);
            out.coins = isFinite(coins) ? Math.max(0, Math.min(5000, coins)) : out.coins;
            out.bet = nearestBet(Number(old.bet) * 10);
            if (typeof old.theme === 'string') { out.theme = old.theme; }
            return out;
        } catch (e) {
            return null;
        }
    }

    S.store = {
        load: function () {
            var raw = rawGet(KEY);
            var o = null;
            if (raw) {
                try { o = JSON.parse(raw); } catch (e) { o = null; }
            }
            if (!o) { o = migrate(); }
            return sanitize(o);
        },
        save: function (state) {
            rawSet(KEY, JSON.stringify(sanitize(state)));
        },
        isPersistent: function () { return persistent; },
        sanitize: sanitize
    };
}());
