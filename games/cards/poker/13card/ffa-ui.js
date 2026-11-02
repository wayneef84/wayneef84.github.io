/**
 * ffa-ui.js - 13 Card free-for-all page logic. Strict ES5. Classic script.
 * Uses FFA (ffa.js), FFAFaces (faces.js), CardAnim (shared/card-anim.js), CardAssets (shared/card-assets.js).
 * All text goes in through textContent. Flow: idle -> dealing -> arrange -> reveal -> done.
 */
(function () {
    'use strict';
    var F = window.FFA, A = window.CardAnim;
    var SYM = { S: '♠', H: '♥', D: '♦', C: '♣' };
    var KEYS = F.ROW_NAMES;                  // front, mid, back
    var REVEAL_ORDER = ['back', 'mid', 'front'];
    var ROW_TITLE = { front: 'Front', mid: 'Middle', back: 'Back' };

    function $(id) { return document.getElementById(id); }
    function mk(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text !== undefined) { n.textContent = text; }
        return n;
    }
    function clear(n) { while (n.firstChild) { n.removeChild(n.firstChild); } }

    var mem = {};
    var storage = (function () {
        try { var s = window.localStorage; s.getItem('x'); return s; } catch (e) {
            return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }, setItem: function (k, v) { mem[k] = String(v); } };
        }
    })();

    var S = F.loadState(storage);
    var R = { resume: null, token: 0, phase: 'idle', players: [], mine: null, sel: null, armed: false, timers: [], detail: null, result: null, deckCards: null };
    var YOU = { id: 'you', name: 'You', human: true, face: { bg: '#bbf7d0', skin: '#f1c27d', hair: '#3b2a1a', style: 'short', glasses: false, hat: 'none', hatColor: '#000000', shirt: '#0ea5e9' } };

    // ---------- helpers ----------
    function save() { F.saveState(storage, S); }
    function wait(ms, fn) {
        var tok = R.token;
        var t = setTimeout(function () { if (tok === R.token) { fn(); } }, A.reduced() ? 0 : ms);
        R.timers.push(t);
    }
    function clearTimers() { for (var i = 0; i < R.timers.length; i++) { clearTimeout(R.timers[i]); } R.timers = []; }
    function banner(t) { $('banner').textContent = t; }
    function npcList() { var o = []; for (var i = 0; i < R.players.length; i++) { if (!R.players[i].human) { o.push(R.players[i]); } } return o; }
    function fmtBal(n) { return n < 0 ? 'owes ' + (-n) : String(n); }
    function fmtChg(n) { return n > 0 ? '+' + n : String(n); }

    function roster() {
        var list = [YOU];
        for (var i = 0; i < S.npcs; i++) { list.push(F.NPCS[i]); }
        return list;
    }

    function setChip(p, text, cls) {
        var c = p.human ? $('meChip') : p.el.chip;
        c.textContent = text;
        c.className = 'chip' + (cls ? ' ' + cls : '');
    }
    function setBal(p) {
        var v = S.bank[p.id];
        if (p.human) { $('meBal').textContent = fmtBal(v); $('myBal').textContent = fmtBal(v); }
        else { p.el.bal.textContent = fmtBal(v); p.el.bal.className = 'bal' + (v < 0 ? ' owe' : ''); }
    }
    function setChg(p, coins) {
        var n = p.human ? $('meChg') : p.el.chg;
        if (coins === null) { n.textContent = ''; n.className = 'chg'; return; }
        n.textContent = fmtChg(coins);
        n.className = 'chg' + (coins > 0 ? ' pos' : (coins < 0 ? ' neg' : ''));
    }

    // ---------- tiles ----------
    function fillTile(t, card) {
        clear(t);
        t.className = 'tile up ' + (card.suit === 'H' || card.suit === 'D' ? 'red' : 'blk');
        t.appendChild(mk('span', '', F.rankLabel(card.rank)));
        t.appendChild(mk('span', '', SYM[card.suit]));
    }
    function downTile() { var t = mk('div', 'tile down'); t._card = null; return t; }

    // ---------- seats ----------
    function buildSeats() {
        var opps = $('opps');
        clear(opps);
        opps.className = 'opps n' + S.npcs;
        R.players = roster();
        for (var i = 0; i < R.players.length; i++) {
            var p = R.players[i];
            p.rows = null; p.tiles = null; p.shown = { front: false, mid: false, back: false };
            if (p.human) { clear($('meAv')); $('meAv').appendChild(window.FFAFaces.make(p.face, 44)); p.el = { av: $('meAv') }; setBal(p); setChg(p, null); setChip(p, 'waiting'); continue; }
            var seat = mk('div', 'seat');
            seat.setAttribute('role', 'button');
            seat.setAttribute('tabindex', '0');
            seat.setAttribute('aria-label', p.name + ', ' + p.personality + '. Tap to see the hand.');
            var av = mk('div', 'av'); av.appendChild(window.FFAFaces.make(p.face, 44));
            var nm = mk('div', 'nm', p.name);
            var coinLine = mk('div', 'bal');
            var chg = mk('div', 'chg');
            var chip = mk('div', 'chip', 'waiting');
            var mini = mk('div', 'mini');
            p.el = { seat: seat, av: av, bal: coinLine, chg: chg, chip: chip, mini: mini, rows: {} };
            seat.appendChild(av); seat.appendChild(nm); seat.appendChild(coinLine); seat.appendChild(chg); seat.appendChild(chip); seat.appendChild(mini);
            (function (pp) {
                function toggle() { R.detail = R.detail === pp.id ? null : pp.id; renderDetail(); }
                seat.addEventListener('click', toggle);
                seat.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
            })(p);
            opps.appendChild(seat);
            buildMini(p);
            setBal(p);
        }
        R.detail = null; renderDetail();
    }

    function buildMini(p) {
        clear(p.el.mini);
        p.tiles = { front: [], mid: [], back: [] };
        var sizes = { front: 3, mid: 5, back: 5 };
        for (var k = 0; k < KEYS.length; k++) {
            var row = mk('div', 'mrow');
            for (var i = 0; i < sizes[KEYS[k]]; i++) { var t = downTile(); p.tiles[KEYS[k]].push(t); row.appendChild(t); }
            p.el.rows[KEYS[k]] = row;
            p.el.mini.appendChild(row);
        }
    }

    function renderDetail() {
        var d = $('detail');
        clear(d);
        var p = null, i;
        for (i = 0; i < R.players.length; i++) { if (R.players[i].id === R.detail && !R.players[i].human) { p = R.players[i]; } }
        if (!p) { d.hidden = true; return; }
        d.hidden = false;
        d.appendChild(mk('div', 'dname', p.name + ' (' + p.personality + ') - ' + p.blurb));
        for (var k = REVEAL_ORDER.length - 1; k >= 0; k--) {
            var key = REVEAL_ORDER[k], row = mk('div', 'mrow');
            var cards = p.rows ? p.rows[key] : null, n = key === 'front' ? 3 : 5;
            for (i = 0; i < n; i++) {
                var t = mk('div', 'tile down');
                if (cards && p.shown[key]) { fillTile(t, cards[i]); }
                row.appendChild(t);
            }
            d.appendChild(row);
        }
    }

    // ---------- human rows ----------
    function makeCanvas(card) {
        var src = window.CardAssets.getAsset(F.rankLabel(card.rank), card.suit);
        var c = document.createElement('canvas');
        c.width = src.width; c.height = src.height;
        c.getContext('2d').drawImage(src, 0, 0);
        return c;
    }

    function sortRows() {
        for (var k = 0; k < KEYS.length; k++) { R.mine[KEYS[k]].sort(function (a, b) { return b.rank - a.rank; }); }
    }

    function renderMine() {
        if (!R.mine) { for (var z = 0; z < KEYS.length; z++) { clear($('row-' + KEYS[z])); $('ev-' + KEYS[z]).textContent = '-'; } return; }
        for (var k = 0; k < KEYS.length; k++) {
            var key = KEYS[k], rowEl = $('row-' + key);
            clear(rowEl);
            var cards = R.mine[key];
            for (var i = 0; i < cards.length; i++) {
                var w = mk('div', 'hc');
                w.setAttribute('role', 'button'); w.setAttribute('tabindex', '0');
                w.setAttribute('aria-label', F.rankLabel(cards[i].rank) + ' of ' + SYM[cards[i].suit] + ', ' + key + ' row');
                w.setAttribute('data-row', key); w.setAttribute('data-pos', String(i));
                if (R.sel && R.sel.key === key && R.sel.pos === i) { w.className += ' sel'; }
                w.appendChild(makeCanvas(cards[i]));
                rowEl.appendChild(w);
            }
            $('ev-' + key).textContent = F.evalRow(cards).name;
        }
        if (R.phase === 'arrange') {
            if (F.isFoul(R.mine)) { banner('Foul warning: Back must beat Middle, and Middle must beat Front.'); }
            else { banner('Drag or tap two cards to swap them. Then tap Lock.'); }
            $('btnLock').textContent = 'Lock';
        }
    }

    function slotOf(node) {
        while (node && node !== document.body) {
            if (node.className && typeof node.className === 'string' && /(^| )hc( |$)/.test(node.className)) { return node; }
            node = node.parentNode;
        }
        return null;
    }

    function swapCards(k1, p1, k2, p2) {
        var t = R.mine[k1][p1];
        R.mine[k1][p1] = R.mine[k2][p2];
        R.mine[k2][p2] = t;
        sortRows();
        R.sel = null; R.armed = false;
        renderMine();
    }

    function tap(key, pos) {
        if (R.phase !== 'arrange') { return; }
        if (!R.sel) { R.sel = { key: key, pos: pos }; }
        else if (R.sel.key === key && R.sel.pos === pos) { R.sel = null; }
        else { swapCards(R.sel.key, R.sel.pos, key, pos); return; }
        renderMine();
    }

    var drag = null;
    var roundNo = 0;
    function onMove(ev) {
        if (!drag || ev.pointerId !== drag.id) { return; }
        var dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
        if (!drag.ghost && Math.abs(dx) + Math.abs(dy) > 8) {
            var g = makeCanvas(R.mine[drag.key][drag.pos]);
            g.style.cssText = 'position:fixed;left:0;top:0;width:52px;height:73px;pointer-events:none;z-index:9999;opacity:0;border-radius:5px;box-shadow:0 6px 14px rgba(0,0,0,0.6)';
            drag.ghost = g;
            drag.w.className += ' drag';
            document.body.appendChild(g);
            g.style.opacity = '0.9';
        }
        if (drag.ghost) { drag.ghost.style.transform = 'translate(' + Math.round(ev.clientX - 26) + 'px,' + Math.round(ev.clientY - 36) + 'px)'; }
    }
    function endDrag(ev, cancelled) {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onCancel);
        var d = drag; drag = null;
        if (!d) { return; }
        if (d.ghost) {
            if (d.ghost.parentNode) { d.ghost.parentNode.removeChild(d.ghost); }
            d.w.className = d.w.className.replace(' drag', '');
            if (cancelled) { return; }
            var slot = slotOf(document.elementFromPoint(ev.clientX, ev.clientY));
            if (slot && slot !== d.w) { swapCards(d.key, d.pos, slot.getAttribute('data-row'), +slot.getAttribute('data-pos')); }
        } else if (!cancelled) { tap(d.key, d.pos); }
    }
    function onUp(ev) { endDrag(ev, false); }
    function onCancel(ev) { endDrag(ev, true); }

    function wireHuman() {
        $('rows').addEventListener('pointerdown', function (ev) {
            if (R.phase !== 'arrange' || drag) { return; }
            var w = slotOf(ev.target);
            if (!w) { return; }
            drag = { w: w, id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, ghost: null, key: w.getAttribute('data-row'), pos: +w.getAttribute('data-pos') };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
            document.addEventListener('pointercancel', onCancel);
        });
        $('rows').addEventListener('keydown', function (ev) {
            var w = slotOf(ev.target);
            if (w && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); tap(w.getAttribute('data-row'), +w.getAttribute('data-pos')); }
        });
    }

    // ---------- round flow ----------
    function setControlsLocked(locked) {
        $('selNpc').disabled = locked; $('selAnte').disabled = locked; $('btnReset').disabled = locked;
    }

    function startRound() {
        A.cancelAll();
        R.token++;
        clearTimers();
        drag = null;
        R.phase = 'dealing';
        R.result = null; R.sel = null; R.armed = false;
        setControlsLocked(true);
        $('settle').hidden = true;
        buildSeats();
        var deck = F.shuffle(F.makeDeck());
        var i, p;
        for (i = 0; i < R.players.length; i++) { R.players[i].cards = deck.slice(i * 13, i * 13 + 13); }
        R.mine = F.plainRows(R.players[0].cards);
        // hidden first: containers stay invisible until cards arrive
        var targets = [];
        var rows = $('rows');
        rows.style.visibility = 'hidden';
        renderMine();
        var npcs = npcList();
        for (i = 0; i < npcs.length; i++) { npcs[i].el.mini.style.visibility = 'hidden'; setChip(npcs[i], 'dealing'); targets.push(npcs[i].el.mini); }
        setChip(R.players[0], 'dealing');
        targets.push(rows);
        $('btnDeal').hidden = true; $('btnAuto').hidden = true; $('btnLock').hidden = true;
        banner('Dealing...');
        var myRound = ++roundNo;
        function reveal() {
            rows.style.visibility = 'visible';
            for (var n = 0; n < npcs.length; n++) { npcs[n].el.mini.style.visibility = 'visible'; }
        }
        var rounds = 3;
        A.deal($('deck'), targets, {
            rounds: rounds, stagger: 70, duration: 320, w: 36, h: 50,
            onArrive: function (t, idx, r) { if (r === rounds - 1) { t.style.visibility = 'visible'; } }
        }, function () { R.resume = null; afterDeal(); });
        R.resume = afterDeal;
        function afterDeal() {
            if (R.phase !== 'dealing' || myRound !== roundNo) { return; }
            reveal();
            R.phase = 'arrange';
            setChip(R.players[0], 'arranging', '');
            renderMine();
            $('btnAuto').hidden = false; $('btnLock').hidden = false; $('btnLock').disabled = false;
            startNpcs();
        }
    }

    function npcArrange(p) {
        if (p.rows) { return; }
        var idx = F.arrange(p.cards, p.personality);
        p.rows = F.rowsFromIdx(p.cards, idx);
        for (var k = 0; k < KEYS.length; k++) {
            for (var i = 0; i < p.rows[KEYS[k]].length; i++) { p.tiles[KEYS[k]][i]._card = p.rows[KEYS[k]][i]; }
        }
        setChip(p, 'ready', 'ready');
    }

    function startNpcs() {
        var npcs = npcList();
        for (var i = 0; i < npcs.length; i++) {
            setChip(npcs[i], 'arranging');
            (function (p, n) { wait(500 + n * 450, function () { npcArrange(p); }); })(npcs[i], i);
        }
    }

    function lock() {
        if (R.phase !== 'arrange') { return; }
        if (F.isFoul(R.mine) && !R.armed) {
            R.armed = true;
            $('btnLock').textContent = 'Lock anyway';
            banner('FOUL: this costs 6 points to each opponent. Tap Lock anyway, or fix the rows.');
            return;
        }
        R.phase = 'reveal';
        R.sel = null; renderMine();
        $('btnAuto').hidden = true; $('btnLock').hidden = true;
        setChip(R.players[0], 'ready', 'ready');
        var npcs = npcList(), i;
        for (i = 0; i < npcs.length; i++) { npcArrange(npcs[i]); }
        var plist = [];
        for (i = 0; i < R.players.length; i++) { plist.push({ id: R.players[i].id, rows: R.players[i].human ? R.mine : R.players[i].rows }); }
        R.result = F.scoreRound(plist, S.ante);
        banner('Revealing hands...');
        R.resume = function () {
            for (var q = 0; q < npcs.length; q++) {
                for (var k = 0; k < KEYS.length; k++) { for (var j = 0; j < npcs[q].tiles[KEYS[k]].length; j++) { fillTile(npcs[q].tiles[KEYS[k]][j], npcs[q].tiles[KEYS[k]][j]._card); } }
            }
            finishRound();
        };
        wait(250, function () { revealRow(0); });
    }

    function parallel(n, start, done) {
        if (!n) { done(); return; }
        var left = n;
        function fin() { left--; if (left === 0) { done(); } }
        for (var i = 0; i < n; i++) { start(i, fin); }
    }

    function byId(id) { for (var i = 0; i < R.players.length; i++) { if (R.players[i].id === id) { return R.players[i]; } } return null; }

    function rowEl(p, key) { return p.human ? $('box-' + key) : p.el.rows[key]; }

    function revealRow(step) {
        if (step >= REVEAL_ORDER.length) { R.resume = null; finishRound(); return; }
        var key = REVEAL_ORDER[step], tok = R.token;
        var npcs = npcList(), tiles = [], i, j;
        for (i = 0; i < npcs.length; i++) { for (j = 0; j < npcs[i].tiles[key].length; j++) { tiles.push(npcs[i].tiles[key][j]); } }
        banner(ROW_TITLE[key] + ' row...');
        parallel(tiles.length, function (n, fin) {
            var t = tiles[n];
            A.flip(t, fin, { delay: n * 45, swap: function () { fillTile(t, t._card); } });
        }, function () {
            if (tok !== R.token) { return; }
            for (var q = 0; q < npcs.length; q++) { npcs[q].shown[key] = true; }
            renderDetail();
            flashRow(key);
            var k = KEYS.indexOf(key);
            // winner of this row: highest row total among clean players, must be unique and positive
            var best = null, bestV = 0, tie = false, id;
            for (id in R.result.rowTotals) {
                if (!Object.prototype.hasOwnProperty.call(R.result.rowTotals, id) || R.result.fouls[id]) { continue; }
                var v = R.result.rowTotals[id][k];
                if (v > bestV) { best = id; bestV = v; tie = false; } else if (v === bestV && v > 0) { tie = true; }
            }
            var els = [];
            if (best && !tie) {
                var w = byId(best);
                banner(ROW_TITLE[key] + ' row goes to ' + w.name + '.');
                for (q = 0; q < R.players.length; q++) {
                    var pl = R.players[q];
                    if (pl.id === best || R.result.fouls[pl.id]) { continue; }
                    if (pl.human) { var hs = $('row-' + key).childNodes; for (j = 0; j < hs.length; j++) { els.push(hs[j]); } }
                    else { for (j = 0; j < pl.tiles[key].length; j++) { els.push(pl.tiles[key][j]); } }
                }
                A.sweep(els, w.el.av, function () { if (tok === R.token) { wait(150, function () { revealRow(step + 1); }); } });
            } else {
                banner(ROW_TITLE[key] + ' row: no single winner.');
                wait(450, function () { revealRow(step + 1); });
            }
        });
    }

    function flashRow(key) {
        var k = KEYS.indexOf(key);
        for (var i = 0; i < R.players.length; i++) {
            var p = R.players[i], el = rowEl(p, key), base = p.human ? 'row-box' : 'mrow';
            var cls = '';
            if (R.result.fouls[p.id]) { cls = 'foul'; }
            else { var v = R.result.rowTotals[p.id][k]; cls = v > 0 ? 'win' : (v < 0 ? 'lose' : 'tie'); }
            el.className = base + ' ' + cls;
            A.pulse(el);
        }
    }

    function finishRound() {
        var res = R.result, tok = R.token, i, p, ids = [];
        for (i = 0; i < R.players.length; i++) {
            p = R.players[i]; ids.push(p.id);
            var c = res.coins[p.id];
            S.bank[p.id] += c;
            if (S.bank[p.id] > 1000000000) { S.bank[p.id] = 1000000000; }
            if (S.bank[p.id] < -1000000000) { S.bank[p.id] = -1000000000; }
            setChg(p, c);
            if (res.fouls[p.id]) { setChip(p, 'FOUL', 'foul'); }
            else if (c > 0) { setChip(p, 'won', 'won'); }
            else if (c < 0) { setChip(p, 'lost', 'lost'); }
            else { setChip(p, 'even', 'even'); }
        }
        S.rounds++;
        save();
        var pay = F.settle(res.coins, ids);
        banner('Coins on the move...');
        R.resume = function () { roundOver(pay); };
        var shown = pay.length > 8 ? 8 : pay.length;
        parallel(shown, function (n, fin) {
            A.fly(null, byId(pay[n].from).el.av, byId(pay[n].to).el.av, fin, { delay: n * 140 });
        }, function () {
            if (tok !== R.token) { return; }
            R.resume = null;
            roundOver(pay);
        });
        // safety: if animations are cancelled the round must still end
    }

    function roundOver(pay) {
        for (var i = 0; i < R.players.length; i++) { setBal(R.players[i]); R.players[i].shown = { front: true, mid: true, back: true }; }
        renderDetail();
        R.phase = 'done';
        setControlsLocked(false);
        buildSettlement(pay);
        var mine = R.result.coins.you;
        var am = mine < 0 ? -mine : mine;
        banner(mine > 0 ? 'You won ' + am + (am === 1 ? ' coin' : ' coins') + ' this round.' : (mine < 0 ? 'You lost ' + am + (am === 1 ? ' coin' : ' coins') + ' this round.' : 'Even round.'));
        $('btnDeal').textContent = 'Next round'; $('btnDeal').hidden = false;
        $('settle').scrollIntoView && $('settle').scrollIntoView({ block: 'nearest', behavior: A.reduced() ? 'auto' : 'smooth' });
    }

    function nameOf(id) { var p = byId(id); return p ? p.name : id; }

    function buildSettlement(pay) {
        var res = R.result, s = $('settle'), i, li, ul;
        clear(s);
        s.hidden = false;
        s.appendChild(mk('h3', '', 'Round ' + S.rounds + ' results (1 point = ' + res.ante + ' coin' + (res.ante > 1 ? 's' : '') + ')'));
        s.appendChild(mk('h4', '', 'Who won points from whom (loser to winner)'));
        ul = mk('ul');
        if (!res.owes.length) { ul.appendChild(mk('li', '', 'Everyone tied. No points moved.')); }
        for (i = 0; i < res.owes.length; i++) {
            var o = res.owes[i];
            ul.appendChild(mk('li', '', nameOf(o.from) + ' to ' + nameOf(o.to) + ' ' + o.points));
        }
        s.appendChild(ul);
        s.appendChild(mk('h4', '', 'Net result'));
        ul = mk('ul');
        for (i = 0; i < R.players.length; i++) {
            var p = R.players[i], c = res.coins[p.id];
            li = mk('li', c > 0 ? 'pos' : (c < 0 ? 'neg' : ''), p.name + ' ' + fmtChg(c) + (Math.abs(c) === 1 ? ' coin (' : ' coins (') + fmtChg(res.points[p.id]) + ' points)' + (res.fouls[p.id] ? ' FOUL' : '') + ', balance ' + fmtBal(S.bank[p.id]));
            ul.appendChild(li);
        }
        s.appendChild(ul);
        s.appendChild(mk('h4', '', 'Settle up'));
        ul = mk('ul');
        if (!pay.length) { ul.appendChild(mk('li', '', 'No payments needed.')); }
        for (i = 0; i < pay.length; i++) {
            ul.appendChild(mk('li', '', nameOf(pay[i].from) + ' pays ' + nameOf(pay[i].to) + ' ' + pay[i].coins + ' coin' + (pay[i].coins > 1 ? 's' : '')));
        }
        s.appendChild(ul);
        s.appendChild(mk('div', 'note', 'Balances carry over and can go below zero. Tap an opponent to see their hand.'));
    }

    // ---------- controls ----------
    function init() {
        $('selNpc').value = String(S.npcs);
        $('selAnte').value = String(S.ante);
        $('chkSkip').checked = S.skip;
        A.skip = S.skip;
        window.CardAssets.init();
        wireHuman();
        buildSeats();
        R.mine = null; renderMine();
        $('selNpc').addEventListener('change', function () {
            S.npcs = +$('selNpc').value; save(); R.phase = 'idle'; $('settle').hidden = true; buildSeats();
        });
        $('selAnte').addEventListener('change', function () { S.ante = +$('selAnte').value; save(); });
        $('chkSkip').addEventListener('change', function () { S.skip = $('chkSkip').checked; A.skip = S.skip; save(); });
        $('btnReset').addEventListener('click', function () {
            if (window.confirm('Reset every bankroll back to 100 coins?')) {
                F.resetBanks(S); save(); buildSeats(); banner('Bankrolls reset to 100 coins.');
            }
        });
        $('btnDeal').addEventListener('click', startRound);
        $('btnLock').addEventListener('click', lock);
        $('btnAuto').addEventListener('click', function () {
            if (R.phase !== 'arrange') { return; }
            R.mine = F.rowsFromIdx(R.players[0].cards, F.arrange(R.players[0].cards, 'balanced'));
            R.sel = null; R.armed = false; renderMine();
        });
        window.addEventListener('pagehide', function () { A.cancelAll(); });
        // Page hidden mid-animation: cancelAll never calls done, so jump to the next stage with final states.
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) { return; }
            A.cancelAll();
            var f = R.resume;
            if (f) { R.resume = null; R.token++; clearTimers(); f(); }
        });
    }

    init();
})();
