/**
 * card-anim.js - small shared animation helper for card games. One global: window.CardAnim.
 * Strict ES5. No network. Transforms and opacity only.
 * Uses the Web Animations API when the browser has it, a CSS transition fallback otherwise.
 *
 * Calm rule: when the arcade calm pref (FongPrefs 'calm'), the OS "reduce motion" setting or
 * CardAnim.skip is on, every call skips movement, runs its final-state callback and calls
 * done() immediately (synchronously). Nothing is ever left hidden or moved.
 *
 * Cancel rule: CardAnim.cancelAll() stops everything that is running, restores inline styles,
 * runs each animation's final-state callback (opts.onArrive, opts.swap) and does NOT call done().
 * Callers that chain steps should also keep a round token. It runs automatically when the page hides.
 *
 * Hidden-first rule: flying elements are created with opacity 0 before they are put in the DOM,
 * the animation then shows them. Targets that a game hides before a deal are revealed in onArrive.
 *
 * API (done is optional everywhere):
 *   deal(deckEl, targetEls, opts, done)  opts: rounds, stagger, duration, w, h, makeFlyer(), onArrive(target, i, round)
 *   flip(cardEl, done, opts)             opts: duration, swap() runs at the half-way point (swap face and back)
 *   sweep(cardEls, toEl, done, opts)     opts: duration, stagger, back (default true: cards slide back after)
 *   fly(el, fromEl, toEl, done, opts)    el may be null (a coin is made). opts: duration, keep, delay
 *   pulse(el, done, opts)
 *   makeCoin(size), reduced(), cancelAll(), skip (boolean), pure (timing helpers, unit tested)
 */
(function (root) {
    'use strict';

    var api = { skip: false, version: '1.0.0' };

    // ---------- pure parts (no DOM) ----------
    function clamp(n, lo, hi) { n = +n; if (n !== n) { return lo; } return n < lo ? lo : (n > hi ? hi : n); }

    // Start delay for each of count items, step ms apart.
    function staggerDelays(count, step) {
        var out = [];
        count = clamp(count, 0, 500);
        step = clamp(step, 0, 2000);
        for (var i = 0; i < count; i++) { out.push(i * step); }
        return out;
    }

    // Deal order: one card to every target per round, like dealing round a table.
    function dealPlan(nTargets, rounds, step) {
        var out = [];
        nTargets = clamp(nTargets, 0, 50);
        rounds = clamp(rounds, 1, 20);
        step = clamp(step, 0, 2000);
        for (var r = 0; r < rounds; r++) {
            for (var t = 0; t < nTargets; t++) {
                out.push({ round: r, target: t, delay: (r * nTargets + t) * step });
            }
        }
        return out;
    }

    // Time until the last item finishes.
    function totalTime(plan, duration) {
        var last = 0;
        for (var i = 0; i < plan.length; i++) { if (plan[i].delay > last) { last = plan[i].delay; } }
        return plan.length ? last + duration : 0;
    }

    // Reduced when any of the three switches is on.
    function isReduced(calm, mqMatches, skip) { return calm === true || mqMatches === true || skip === true; }

    api.pure = { clamp: clamp, staggerDelays: staggerDelays, dealPlan: dealPlan, totalTime: totalTime, isReduced: isReduced };

    // ---------- environment ----------
    function doc() { return root.document || null; }

    function reduced() {
        var calm = false, mq = false;
        try { calm = !!(root.FongPrefs && root.FongPrefs.get('calm')); } catch (e) { calm = false; }
        try { mq = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e2) { mq = false; }
        return isReduced(calm, mq, api.skip === true);
    }
    api.reduced = reduced;

    // ---------- running animations ----------
    var active = [];

    function untrack(rec) { var i = active.indexOf(rec); if (i >= 0) { active.splice(i, 1); } }

    function endRec(rec, callDone) {
        if (rec.over) { return; }
        rec.over = true;
        untrack(rec);
        try { rec.stop(); } catch (e) { /* ignore */ }
        if (rec.finish) { try { rec.finish(); } catch (e2) { /* ignore */ } }
        if (callDone && rec.done) { rec.done(); }
    }

    function noop() { /* nothing */ }

    // frames: { from: {transform, opacity}, to: {...} }. o: duration, delay, easing, finish, done.
    function animate(el, from, to, o) {
        var rec = { over: false, finish: o.finish, done: o.done, stop: noop };
        active.push(rec);
        var dur = clamp(o.duration, 1, 5000);
        var delay = clamp(o.delay || 0, 0, 20000);
        var ease = o.easing || 'ease-out';
        var a = null;
        if (el.animate) {
            try { a = el.animate([from, to], { duration: dur, delay: delay, easing: ease, fill: 'both' }); } catch (e) { a = null; }
        }
        if (a) {
            rec.stop = function () { try { a.cancel(); } catch (e) { /* ignore */ } };
            a.onfinish = function () { endRec(rec, true); };
            return rec;
        }
        // CSS transition fallback
        var st = el.style;
        var saved = { transform: st.transform, opacity: st.opacity, transition: st.transition };
        var t1 = null, t2 = null;
        function put(f) {
            if (f.transform !== undefined) { st.transform = f.transform; }
            if (f.opacity !== undefined) { st.opacity = String(f.opacity); }
        }
        st.transition = 'none';
        put(from);
        rec.stop = function () {
            if (t1) { clearTimeout(t1); }
            if (t2) { clearTimeout(t2); }
            st.transition = saved.transition; st.transform = saved.transform; st.opacity = saved.opacity;
        };
        t1 = setTimeout(function () {
            void el.offsetWidth;
            st.transition = 'transform ' + dur + 'ms ' + ease + ', opacity ' + dur + 'ms ' + ease;
            put(to);
            t2 = setTimeout(function () { endRec(rec, true); }, dur + 30);
        }, delay);
        return rec;
    }

    function cancelAll() {
        var list = active.slice();
        for (var i = 0; i < list.length; i++) { endRec(list[i], false); }
        active = [];
    }
    api.cancelAll = cancelAll;
    api.activeCount = function () { return active.length; };

    // ---------- geometry ----------
    function center(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    }
    function tr(x, y, s) { return 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)' + (s !== undefined ? ' scale(' + s + ')' : ''); }

    function counter(n, done) {
        var left = n;
        return function () { left--; if (left <= 0 && done) { done(); } };
    }

    function makeFlyerDefault(w, h) {
        var d = doc().createElement('div');
        d.style.opacity = '0';
        d.style.position = 'fixed';
        d.style.left = '0px';
        d.style.top = '0px';
        d.style.width = w + 'px';
        d.style.height = h + 'px';
        d.style.borderRadius = '5px';
        d.style.border = '2px solid #f8fafc';
        d.style.background = '#1e3a8a';
        d.style.boxShadow = '0 2px 6px rgba(0,0,0,0.45)';
        d.style.pointerEvents = 'none';
        d.style.zIndex = '9999';
        d.style.willChange = 'transform, opacity';
        return d;
    }

    function removeNode(n) { if (n && n.parentNode) { n.parentNode.removeChild(n); } }

    // ---------- deal ----------
    function deal(deckEl, targetEls, opts, done) {
        opts = opts || {};
        var rounds = clamp(opts.rounds || 1, 1, 20);
        var n = targetEls ? targetEls.length : 0;
        var plan = dealPlan(n, rounds, clamp(opts.stagger === undefined ? 60 : opts.stagger, 0, 2000));
        var dur = clamp(opts.duration || 320, 40, 3000);
        var onArrive = opts.onArrive || noop;
        var i;
        if (!n) { if (done) { done(); } return; }
        if (reduced() || !doc() || !deckEl) {
            for (i = 0; i < plan.length; i++) { onArrive(targetEls[plan[i].target], plan[i].target, plan[i].round); }
            if (done) { done(); }
            return;
        }
        var from = center(deckEl);
        var fin = counter(plan.length, done);
        for (i = 0; i < plan.length; i++) {
            (function (p) {
                var target = targetEls[p.target];
                var to = center(target);
                var w = opts.w || 40, h = opts.h || 56;
                var fl = opts.makeFlyer ? opts.makeFlyer(w, h) : makeFlyerDefault(w, h);
                fl.style.opacity = '0';           // hidden before it enters the DOM
                doc().body.appendChild(fl);
                animate(fl,
                    { transform: tr(from.x - w / 2, from.y - h / 2, 0.9), opacity: 0 },
                    { transform: tr(to.x - w / 2, to.y - h / 2, 1), opacity: 1 },
                    {
                        duration: dur, delay: p.delay, easing: 'ease-out',
                        finish: function () { removeNode(fl); onArrive(target, p.target, p.round); },
                        done: fin
                    });
            })(plan[i]);
        }
    }
    api.deal = deal;

    // ---------- flip ----------
    function flip(cardEl, done, opts) {
        opts = opts || {};
        var swapped = false;
        function swap() { if (!swapped) { swapped = true; if (opts.swap) { opts.swap(); } } }
        if (reduced() || !cardEl || !cardEl.style) {
            swap();
            if (done) { done(); }
            return;
        }
        var d = clamp(opts.duration || 260, 60, 3000) / 2;
        animate(cardEl, { transform: 'scaleX(1)' }, { transform: 'scaleX(0.02)' }, {
            duration: d, easing: 'ease-in',
            finish: swap,
            done: function () {
                animate(cardEl, { transform: 'scaleX(0.02)' }, { transform: 'scaleX(1)' }, { duration: d, easing: 'ease-out', done: done });
            }
        });
    }
    api.flip = flip;

    // ---------- sweep ----------
    function sweep(cardEls, toEl, done, opts) {
        opts = opts || {};
        var n = cardEls ? cardEls.length : 0;
        if (!n || reduced() || !toEl) { if (done) { done(); } return; }
        var dur = clamp(opts.duration || 380, 60, 4000);
        var step = clamp(opts.stagger === undefined ? 25 : opts.stagger, 0, 500);
        var back = opts.back !== false;
        var to = center(toEl);
        var fin = counter(n, done);
        for (var i = 0; i < n; i++) {
            (function (el, idx) {
                var c = center(el);
                var dx = to.x - c.x, dy = to.y - c.y;
                animate(el, { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
                    { transform: tr(dx, dy, 0.35), opacity: 0.15 },
                    {
                        duration: dur, delay: idx * step, easing: 'ease-in',
                        done: function () {
                            if (!back) { fin(); return; }
                            animate(el, { transform: tr(dx, dy, 0.35), opacity: 0.15 },
                                { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
                                { duration: 180, easing: 'ease-out', done: fin });
                        }
                    });
            })(cardEls[i], i);
        }
    }
    api.sweep = sweep;

    // ---------- coins ----------
    function makeCoin(size) {
        var s = clamp(size || 22, 10, 80);
        var d = doc().createElement('div');
        d.style.opacity = '0';
        d.style.position = 'fixed';
        d.style.left = '0px';
        d.style.top = '0px';
        d.style.width = s + 'px';
        d.style.height = s + 'px';
        d.style.borderRadius = '50%';
        d.style.background = 'radial-gradient(circle at 35% 30%, #fde68a 0%, #f59e0b 70%)';
        d.style.border = '2px solid #b45309';
        d.style.boxShadow = '0 1px 4px rgba(0,0,0,0.5)';
        d.style.pointerEvents = 'none';
        d.style.zIndex = '9999';
        d.style.willChange = 'transform, opacity';
        return d;
    }
    api.makeCoin = makeCoin;

    function fly(el, fromEl, toEl, done, opts) {
        opts = opts || {};
        if (reduced() || !doc() || !fromEl || !toEl) {
            if (el && !opts.keep) { removeNode(el); }
            if (done) { done(); }
            return;
        }
        var node = el || makeCoin(opts.size);
        node.style.opacity = '0';                 // hidden before insertion
        if (!node.parentNode) { doc().body.appendChild(node); }
        var a = center(fromEl), b = center(toEl);
        var w = node.offsetWidth || 22, h = node.offsetHeight || 22;
        animate(node,
            { transform: tr(a.x - w / 2, a.y - h / 2, 0.8), opacity: 0 },
            { transform: tr(b.x - w / 2, b.y - h / 2, 1), opacity: 1 },
            {
                duration: clamp(opts.duration || 520, 60, 4000), delay: opts.delay || 0, easing: 'ease-in-out',
                finish: function () { if (!opts.keep) { removeNode(node); } },
                done: done
            });
    }
    api.fly = fly;

    // ---------- pulse ----------
    function pulse(el, done, opts) {
        opts = opts || {};
        if (reduced() || !el || !el.style) { if (done) { done(); } return; }
        var d = clamp(opts.duration || 280, 60, 2000) / 2;
        animate(el, { transform: 'scale(1)' }, { transform: 'scale(1.12)' }, {
            duration: d, easing: 'ease-out',
            done: function () { animate(el, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }, { duration: d, easing: 'ease-in', done: done }); }
        });
    }
    api.pulse = pulse;

    // ---------- page hide ----------
    var d0 = doc();
    if (d0 && d0.addEventListener) {
        d0.addEventListener('visibilitychange', function () { if (d0.hidden) { cancelAll(); } });
    }
    if (root.addEventListener) { root.addEventListener('pagehide', cancelAll); }

    root.CardAnim = api;
    if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
