/**
 * F.O.N.G. Jigsaw - ui.js
 * Small DOM helpers: status line, toasts, chips, thumbnail grids, the options
 * sheet, confetti and file download. No game logic here.
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw = root.FongJigsaw || {};
    var doc = root.document;

    function $(id) { return doc.getElementById(id); }

    function reducedMotion() {
        try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); }
        catch (e) { return false; }
    }

    // Screen reader / live region. Clearing first makes repeated text announce again.
    var statusTimer = 0;
    function status(msg) {
        var el = $('status');
        if (!el) { return; }
        el.textContent = '';
        if (statusTimer) { clearTimeout(statusTimer); }
        statusTimer = setTimeout(function () { el.textContent = msg; }, 30);
    }

    var toastTimer = 0;
    function toast(msg, ms) {
        var el = $('toast');
        if (!el) { return; }
        el.textContent = msg;
        el.hidden = false;
        if (toastTimer) { clearTimeout(toastTimer); }
        toastTimer = setTimeout(function () { el.hidden = true; }, ms || 3200);
        status(msg);
    }

    function notice(msg) {
        var el = $('notice');
        if (!el) { return; }
        if (!msg) { el.hidden = true; el.textContent = ''; return; }
        el.textContent = msg;
        el.hidden = false;
    }

    function showScreen(name) {
        $('picker').hidden = name !== 'picker';
        $('game').hidden = name !== 'game';
    }

    /** Radio chips. items: [{ value, label }]. */
    function buildChips(container, name, items, selected, onChange) {
        var old = container.querySelectorAll('label.chip'), i;
        for (i = 0; i < old.length; i++) { container.removeChild(old[i]); }
        items.forEach(function (it) {
            var lab = doc.createElement('label');
            lab.className = 'chip';
            var inp = doc.createElement('input');
            inp.type = 'radio'; inp.name = name; inp.value = String(it.value);
            if (String(it.value) === String(selected)) { inp.checked = true; }
            inp.addEventListener('change', function () { if (inp.checked) { onChange(it.value); } });
            var sp = doc.createElement('span');
            sp.textContent = it.label;
            lab.appendChild(inp); lab.appendChild(sp);
            container.appendChild(lab);
        });
    }

    function setChip(container, value) {
        var inputs = container.querySelectorAll('input'), i;
        for (i = 0; i < inputs.length; i++) { inputs[i].checked = inputs[i].value === String(value); }
    }

    /**
     * Thumbnail grid. items: [{ id, title, src, canvas }]. src is a data URL; canvas an existing canvas.
     * onPick(item). onDelete(item) optional (adds a remove button that needs two taps).
     */
    function buildThumbs(container, items, onPick, onDelete) {
        container.innerHTML = '';
        items.forEach(function (it) {
            var cell = doc.createElement('div');
            cell.className = 'thumb';
            cell.setAttribute('role', 'listitem');
            var b = doc.createElement('button');
            b.type = 'button';
            b.className = 'thumb-btn';
            b.setAttribute('aria-label', it.title || 'Picture');
            if (it.canvas) { b.appendChild(it.canvas); }
            else if (it.src) {
                var img = doc.createElement('img');
                img.alt = '';
                img.src = it.src;
                img.draggable = false;
                b.appendChild(img);
            }
            var cap = doc.createElement('span');
            cap.className = 'thumb-cap';
            cap.textContent = it.title || '';
            b.appendChild(cap);
            b.addEventListener('click', function () { onPick(it); });
            cell.appendChild(b);
            if (onDelete) {
                var d = doc.createElement('button');
                d.type = 'button';
                d.className = 'thumb-del';
                d.textContent = '×';
                d.setAttribute('aria-label', 'Remove this picture from My pictures');
                var armed = false, t = 0;
                d.addEventListener('click', function () {
                    if (!armed) {
                        armed = true; d.textContent = 'Remove?'; d.classList.add('armed');
                        t = setTimeout(function () { armed = false; d.textContent = '×'; d.classList.remove('armed'); }, 3000);
                    } else { clearTimeout(t); onDelete(it); }
                });
                cell.appendChild(d);
            }
            container.appendChild(cell);
        });
    }

    // ---- options sheet ---------------------------------------------------------------

    var sheetOpener = null;
    function openSheet(el, opener) {
        sheetOpener = opener || null;
        el.hidden = false;
        var f = el.querySelector('input, button');
        if (f) { f.focus(); }
    }
    function closeSheet(el) {
        el.hidden = true;
        if (sheetOpener && sheetOpener.focus) { sheetOpener.focus(); }
        sheetOpener = null;
    }
    function trapSheet(el) {
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeSheet(el); return; }
            if (e.key !== 'Tab') { return; }
            var f = el.querySelectorAll('input, button'), first = f[0], last = f[f.length - 1];
            if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    }

    // ---- confetti (skipped for reduced motion) ------------------------------------------

    var confettiRaf = 0;
    function confetti(canvas, durationMs) {
        if (reducedMotion()) { return false; }
        var w = canvas.clientWidth, h = canvas.clientHeight, dpr = Math.min(2, root.devicePixelRatio || 1);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        var ctx = canvas.getContext('2d'), parts = [], i;
        var cols = ['#ff6f91', '#ffd34a', '#59b8ff', '#7be07b', '#b58bff', '#ff9a4d'];
        for (i = 0; i < 110; i++) {
            parts.push({
                x: Math.random() * w, y: -20 - Math.random() * h * 0.6,
                vx: (Math.random() - 0.5) * 1.6, vy: 1.2 + Math.random() * 2.2,
                r: 4 + Math.random() * 5, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.2,
                c: cols[i % cols.length]
            });
        }
        var start = Date.now();
        if (confettiRaf) { cancelAnimationFrame(confettiRaf); }
        function frame() {
            var age = Date.now() - start, k;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);
            for (k = 0; k < parts.length; k++) {
                var p = parts[k];
                p.x += p.vx; p.y += p.vy; p.a += p.va;
                ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate(p.a);
                ctx.globalAlpha = Math.max(0, 1 - age / (durationMs || 3500));
                ctx.fillStyle = p.c;
                ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
                ctx.restore();
            }
            if (age < (durationMs || 3500)) { confettiRaf = requestAnimationFrame(frame); }
            else { ctx.clearRect(0, 0, w, h); confettiRaf = 0; }
        }
        confettiRaf = requestAnimationFrame(frame);
        return true;
    }

    // ---- files --------------------------------------------------------------------------

    function download(filename, text, mime) {
        try {
            var blob = new Blob([text], { type: mime || 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = doc.createElement('a');
            a.href = url; a.download = filename;
            a.style.display = 'none';
            doc.body.appendChild(a);
            a.click();
            setTimeout(function () { doc.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
            return true;
        } catch (e) { return false; }
    }

    function readText(file, cb) {
        var fr = new FileReader();
        fr.onload = function () { cb(null, String(fr.result)); };
        fr.onerror = function () { cb(new Error('read failed')); };
        fr.readAsText(file);
    }

    NS.UI = {
        $: $, reducedMotion: reducedMotion, status: status, toast: toast, notice: notice,
        showScreen: showScreen, buildChips: buildChips, setChip: setChip, buildThumbs: buildThumbs,
        openSheet: openSheet, closeSheet: closeSheet, trapSheet: trapSheet,
        confetti: confetti, download: download, readText: readText
    };
})(window);
