/**
 * F.O.N.G. Jigsaw - input.js
 *
 * Pointer Events for mouse, touch and pen with pointer capture. One finger on a
 * piece drags its whole group, one finger on the table pans, two fingers pinch and
 * pan, the wheel zooms. Keyboard: Tab cycles pieces, Enter picks up or drops, arrows
 * move (or pan when nothing is selected). Listeners are added once, on the canvas.
 * touch-action: none is set in CSS on the canvas only, so the rest of the page scrolls.
 *
 * host (supplied by app.js):
 *   canvas, getState(), getView(), viewport() -> {w,h}, requestDraw(), unlock(),
 *   isActive(), onDragStart(gid), onDrop(gid), onTap(gid), onSelect(gid, pid),
 *   onKeyCommand(name), getSel(), setSel(gid), setHolding(bool)
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw = root.FongJigsaw || {};
    var Gr = NS.Groups, M = NS.Model;

    var TAP_PX = 7, TAP_MS = 450, EDGE_PX = 34;

    function attach(host) {
        var canvas = host.canvas;
        var pointers = {};        // id -> {x, y}
        var count = 0;
        var drag = null, pan = null, pinch = null;
        var lastDrag = { x: 0, y: 0 };
        var holding = false;
        var autoDropTimer = 0;

        function local(e) {
            var r = canvas.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        function world(p) { return M.screenToWorld(host.getView(), p.x, p.y); }
        function clampView() {
            var vp = host.viewport(), st = host.getState();
            M.viewClamp(host.getView(), st.table, vp.w, vp.h);
        }

        function startDrag(id, p, hit) {
            var st = host.getState(), g = st.groups[hit.gid], w = world(p);
            Gr.bringToFront(st, hit.gid);
            drag = {
                id: id, gid: hit.gid, pid: hit.pid,
                relX: w.x - g.ox, relY: w.y - g.oy,
                sx: p.x, sy: p.y, t0: Date.now(), moved: false
            };
            lastDrag.x = p.x; lastDrag.y = p.y;
            host.onDragStart(hit.gid);
            host.requestDraw();
        }

        function moveDrag(p) {
            var st = host.getState(), w = world(p);
            if (!st.groups[drag.gid]) { return; }
            Gr.setGroupOffset(st, drag.gid, w.x - drag.relX, w.y - drag.relY);
            Gr.clampGroup(st, drag.gid);
            if (!drag.moved) {
                var dx = p.x - drag.sx, dy = p.y - drag.sy;
                if (dx * dx + dy * dy > TAP_PX * TAP_PX) { drag.moved = true; }
            }
            lastDrag.x = p.x; lastDrag.y = p.y;
            host.requestDraw();
        }

        function endDrag(cancelled) {
            if (!drag) { return; }
            var d = drag;
            drag = null;
            var st = host.getState();
            if (!st.groups[d.gid]) { host.requestDraw(); return; }
            var isTap = !d.moved && (Date.now() - d.t0) < TAP_MS;
            if (isTap && !cancelled) { host.onTap(d.gid, d.pid); }
            else { host.onDrop(d.gid); }
            host.requestDraw();
        }

        function startPinch() {
            var ids = [], k;
            for (k in pointers) { if (pointers.hasOwnProperty(k)) { ids.push(k); } }
            if (ids.length < 2) { return; }
            var a = pointers[ids[0]], b = pointers[ids[1]];
            var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            var w = world(mid), v = host.getView();
            pinch = { a: ids[0], b: ids[1], d0: Math.max(10, Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))), s0: v.s, wx: w.x, wy: w.y };
            pan = null;
        }

        function movePinch() {
            var a = pointers[pinch.a], b = pointers[pinch.b];
            if (!a || !b) { return; }
            var d = Math.max(10, Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)));
            var mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            var vp = host.viewport(), st = host.getState(), v = host.getView();
            var lim = M.viewLimits(st.table, vp.w, vp.h);
            var s = Math.max(lim.min, Math.min(lim.max, pinch.s0 * d / pinch.d0));
            v.s = s;
            v.tx = mid.x - pinch.wx * s;
            v.ty = mid.y - pinch.wy * s;
            v.user = true;
            clampView();
            host.requestDraw();
        }

        function onDown(e) {
            if (e.pointerType === 'mouse' && e.button !== 0) { return; }
            if (count >= 2) { return; }
            host.unlock();
            try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
            var p = local(e);
            pointers[e.pointerId] = p;
            count++;
            e.preventDefault();
            try { canvas.focus({ preventScroll: true }); } catch (err2) { canvas.focus(); }
            if (count === 1) {
                var hit = host.isActive() ? Gr.hitTest(host.getState(), world(p).x, world(p).y, false) : null;
                if (hit) {
                    cancelKeyboardHold();
                    host.setSel(null);
                    startDrag(e.pointerId, p, hit);
                } else {
                    pan = { id: e.pointerId, x: p.x, y: p.y };
                }
            } else if (count === 2) {
                if (drag) { endDrag(true); }
                startPinch();
            }
        }

        function onMove(e) {
            var p = pointers[e.pointerId];
            if (!p) { return; }
            var np = local(e);
            p.x = np.x; p.y = np.y;
            e.preventDefault();
            if (pinch) { movePinch(); return; }
            if (drag && drag.id === e.pointerId) { moveDrag(np); return; }
            if (pan && pan.id === e.pointerId) {
                var v = host.getView();
                v.tx += np.x - pan.x; v.ty += np.y - pan.y;
                pan.x = np.x; pan.y = np.y;
                v.user = true;
                clampView();
                host.requestDraw();
            }
        }

        function release(id, cancelled) {
            if (!pointers[id]) { return; }
            delete pointers[id];
            count = Math.max(0, count - 1);
            if (drag && drag.id === id) { endDrag(cancelled); }
            if (pan && pan.id === id) { pan = null; }
            if (pinch && (pinch.a === id || pinch.b === id)) { pinch = null; }
            if (count === 0) { drag = null; pan = null; pinch = null; }
        }

        function onUp(e) {
            e.preventDefault();
            release(e.pointerId, false);
            try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
        }
        function onCancel(e) { release(e.pointerId, true); }
        function onLost(e) { release(e.pointerId, true); }

        function onWheel(e) {
            e.preventDefault();
            var dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
            var factor = Math.exp(-dy * (e.ctrlKey ? 0.012 : 0.0016));
            var p = local(e), vp = host.viewport(), st = host.getState(), v = host.getView();
            M.viewZoomAt(v, p.x, p.y, factor, st.table, vp.w, vp.h);
            v.user = true;
            host.requestDraw();
        }

        // ---- keyboard ------------------------------------------------------------

        function cancelKeyboardHold() {
            holding = false;
            host.setHolding(false);
            if (autoDropTimer) { clearTimeout(autoDropTimer); autoDropTimer = 0; }
        }

        function select(gid) {
            host.setSel(gid);
            if (gid !== null && gid !== undefined) {
                var g = host.getState().groups[gid];
                host.onSelect(gid, g ? g.members[0] : 0);
            }
            host.requestDraw();
        }

        function drop() {
            var sel = host.getSel();
            if (autoDropTimer) { clearTimeout(autoDropTimer); autoDropTimer = 0; }
            if (sel !== null && sel !== undefined && host.getState().groups[sel]) { host.onDrop(sel); }
            holding = false;
            host.setHolding(false);
            host.requestDraw();
        }

        function onKey(e) {
            if (e.ctrlKey || e.metaKey || e.altKey) { return; }
            var st = host.getState();
            if (!st || !host.isActive()) { return; }
            var key = e.key, sel = host.getSel(), step = st.pz.pw * (e.shiftKey ? 1 : 0.25);
            var handled = true, ids, i, dx = 0, dy = 0;
            if (key === 'Tab') {
                ids = Gr.movableGroupIds(st);
                if (!ids.length) { return; }
                i = sel === null || sel === undefined ? -1 : ids.indexOf(sel);
                var next = i + (e.shiftKey ? -1 : 1);
                if (next < 0 || next >= ids.length) {
                    if (sel === null || sel === undefined) { next = e.shiftKey ? ids.length - 1 : 0; }
                    else { cancelKeyboardHold(); host.setSel(null); host.requestDraw(); return; }  // let focus leave
                }
                if (holding) { drop(); }
                select(ids[next]);
            } else if (key === 'Enter' || key === ' ') {
                if (sel === null || sel === undefined || !st.groups[sel]) {
                    ids = Gr.movableGroupIds(st);
                    if (ids.length) { select(ids[0]); }
                } else if (holding) { drop(); }
                else {
                    holding = true;
                    host.setHolding(true);
                    Gr.bringToFront(st, sel);
                    host.onDragStart(sel);
                    host.requestDraw();
                }
            } else if (key === 'Escape') {
                if (holding) { drop(); }
                host.setSel(null);
                host.requestDraw();
            } else if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
                dx = key === 'ArrowLeft' ? -step : (key === 'ArrowRight' ? step : 0);
                dy = key === 'ArrowUp' ? -step : (key === 'ArrowDown' ? step : 0);
                if (sel !== null && sel !== undefined && st.groups[sel]) {
                    Gr.moveGroup(st, sel, dx, dy);
                    Gr.clampGroup(st, sel);
                    host.keepVisible(sel);
                    host.requestDraw();
                    if (!holding) {
                        if (autoDropTimer) { clearTimeout(autoDropTimer); }
                        autoDropTimer = setTimeout(function () { autoDropTimer = 0; drop(); }, 700);
                    }
                } else {
                    var v = host.getView();
                    v.tx -= dx * v.s * 2; v.ty -= dy * v.s * 2;
                    v.user = true;
                    clampView();
                    host.requestDraw();
                }
            } else if (key === 'r' || key === 'R') {
                if (sel !== null && sel !== undefined && st.groups[sel]) { host.onTap(sel, st.groups[sel].members[0]); }
            } else if (key === '+' || key === '=' || key === '-' || key === '_' || key === '0' || key === 'h' || key === 'H') {
                host.onKeyCommand(key);
            } else {
                handled = false;
            }
            if (handled) { e.preventDefault(); }
        }

        canvas.addEventListener('pointerdown', onDown);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerup', onUp);
        canvas.addEventListener('pointercancel', onCancel);
        canvas.addEventListener('lostpointercapture', onLost);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('keydown', onKey);
        canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
        canvas.addEventListener('dragstart', function (e) { e.preventDefault(); });
        canvas.addEventListener('blur', function () { if (holding) { drop(); } });

        return {
            isDragging: function () { return !!drag; },
            /** Called each frame while dragging: scroll the table when the finger nears an edge. Returns true if it moved. */
            edgePan: function () {
                if (!drag) { return false; }
                var vp = host.viewport(), v = host.getView(), vx = 0, vy = 0, sp = 9;
                if (lastDrag.x < EDGE_PX) { vx = sp; } else if (lastDrag.x > vp.w - EDGE_PX) { vx = -sp; }
                if (lastDrag.y < EDGE_PX) { vy = sp; } else if (lastDrag.y > vp.h - EDGE_PX) { vy = -sp; }
                if (!vx && !vy) { return false; }
                v.tx += vx; v.ty += vy;
                clampView();
                moveDrag({ x: lastDrag.x, y: lastDrag.y });
                return true;
            },
            cancelAll: function () {
                var k;
                for (k in pointers) { if (pointers.hasOwnProperty(k)) { delete pointers[k]; } }
                count = 0; drag = null; pan = null; pinch = null;
                cancelKeyboardHold();
            }
        };
    }

    NS.Input = { attach: attach };
})(window);
