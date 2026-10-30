/**
 * F.O.N.G. Jigsaw - app.js
 * Wires the pure modules (geometry, groups, model) to the screen, input, audio,
 * pictures and storage. Everything runs on this device. Nothing is uploaded.
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw;
    var G = NS.Geometry, Gr = NS.Groups, M = NS.Model, Img = NS.Images, Au = NS.Audio;
    var Samples = NS.Samples, UI = NS.UI, R = NS.Render;
    var $ = UI.$;

    var KEY = 'fong.jigsaw.v2';
    var KEY_IMG = 'fong.jigsaw.v2.img';

    var S = {
        settings: M.defaultSettings(),
        st: null,
        image: null,
        meta: null,
        pending: null,         // { canvas, meta } picked but not started
        view: { s: 1, tx: 0, ty: 0, user: false },
        renderer: null,
        input: null,
        sel: null,
        holding: false,
        dragGid: null,
        preview: false,
        hint: null,
        fx: [],
        raf: 0,
        saveTimer: 0,
        storageWarned: false,
        lastTick: 0,
        lastCheer: -1e9,
        snapCount: 0,
        bigDone: {},
        drawTimes: [],
        colors: {},
        statusAt: 0
    };

    // ------------------------------------------------------------------ small helpers

    function cheer(kind) {
        try {
            if (root.FongCheer && typeof root.FongCheer.cheer === 'function') { root.FongCheer.cheer(kind); }
        } catch (e) { /* the cheer module must never break the game */ }
    }

    function nowMs() { return root.performance && performance.now ? performance.now() : Date.now(); }

    function viewport() {
        var st = $('stage');
        return { w: st.clientWidth, h: st.clientHeight };
    }

    function readColors() {
        var cs = root.getComputedStyle($('app'));
        function v(n, d) { var x = cs.getPropertyValue(n); return x && x.trim() ? x.trim() : d; }
        S.colors = {
            bg: v('--jg-bg', '#2a2350'),
            table: v('--jg-table', '#3a3169'),
            tableEdge: v('--jg-table-edge', 'rgba(255,255,255,0.18)'),
            board: v('--jg-board', 'rgba(255,255,255,0.10)'),
            boardEdge: v('--jg-board-edge', 'rgba(255,255,255,0.55)'),
            accent: v('--jg-accent', '#ffd640')
        };
    }

    // ------------------------------------------------------------------ storage

    function readSaved() {
        try {
            var raw = root.localStorage.getItem(KEY);
            if (!raw) { return null; }
            var o = JSON.parse(raw);
            return o && typeof o === 'object' && o.v === 2 ? o : null;
        } catch (e) { return null; }
    }

    function storageProblem() {
        if (S.storageWarned) { return; }
        S.storageWarned = true;
        UI.toast('This browser is not letting us save, so your puzzle will not be remembered after you close the page. You can keep playing.', 6500);
    }

    function tickElapsed() {
        var t = nowMs();
        if (S.lastTick && S.st && !Gr.isComplete(S.st) && !$('game').hidden && document.visibilityState !== 'hidden') {
            S.st.elapsedMs = (S.st.elapsedMs || 0) + Math.min(5000, t - S.lastTick);
        }
        S.lastTick = t;
    }

    function persist() {
        if (S.saveTimer) { clearTimeout(S.saveTimer); S.saveTimer = 0; }
        tickElapsed();
        var out = { v: 2, settings: S.settings, game: null };
        if (S.st && S.meta && S.meta.kind !== 'none') {
            out.game = { state: M.serialize(S.st), image: { kind: S.meta.kind, id: S.meta.id || '', name: S.meta.name || '' } };
        }
        try {
            root.localStorage.setItem(KEY, JSON.stringify(out));
        } catch (e) {
            storageProblem();
        }
    }

    function scheduleSave() {
        if (S.saveTimer) { clearTimeout(S.saveTimer); }
        S.saveTimer = setTimeout(persist, 350);
    }

    // ------------------------------------------------------------------ drawing loop

    function gameView() {
        return {
            st: S.st, view: S.view, image: S.image, colors: S.colors,
            ghost: S.settings.ghost, preview: S.preview, dragGid: S.dragGid,
            selGid: S.sel, holding: S.holding, fx: S.fx, hint: S.hint, reduceMotion: UI.reducedMotion()
        };
    }

    function requestDraw() {
        if (!S.raf) { S.raf = root.requestAnimationFrame(frame); }
    }

    function frame() {
        S.raf = 0;
        if (!S.st || $('game').hidden) { return; }
        var more = false;
        if (S.input && S.input.isDragging() && S.input.edgePan()) { more = true; }
        var g = gameView();
        if (S.renderer.draw(g, nowMs())) { more = true; }
        S.fx = g.fx;
        S.hint = g.hint;
        S.drawTimes.push(S.renderer.lastDrawMs);
        if (S.drawTimes.length > 600) { S.drawTimes.shift(); }
        if (more || S.input && S.input.isDragging()) { requestDraw(); }
    }

    function layout() {
        var vp = viewport();
        if (!vp.w || !vp.h) { return; }
        S.renderer.resize(vp.w, vp.h, Math.min(2, root.devicePixelRatio || 1));
        if (S.st) {
            if (!S.view.user) { fit(); }
            else { M.viewClamp(S.view, S.st.table, vp.w, vp.h); }
        }
        requestDraw();
    }

    function fit() {
        var vp = viewport();
        var v = M.viewFit(S.st.table, vp.w, vp.h, 10);
        S.view.s = v.s; S.view.tx = v.tx; S.view.ty = v.ty; S.view.user = false;
        requestDraw();
    }

    function zoomBy(f) {
        var vp = viewport();
        M.viewZoomAt(S.view, vp.w / 2, vp.h / 2, f, S.st.table, vp.w, vp.h);
        S.view.user = true;
        requestDraw();
    }

    // ------------------------------------------------------------------ progress and messages

    function updateProgress() {
        if (!S.st) { return; }
        var total = Math.max(1, S.st.pz.count - 1);
        var pct = Math.round(100 * Gr.joins(S.st) / total);
        $('progress-fill').style.width = pct + '%';
    }

    function describe(pid) {
        var rc = Gr.pieceRC(S.st, pid);
        return 'row ' + (rc.r + 1) + ' column ' + (rc.c + 1);
    }

    // ------------------------------------------------------------------ game events

    function onDragStart(gid) {
        S.dragGid = gid;
        S.hint = null;
        requestDraw();
    }

    function onDrop(gid) {
        var st = S.st;
        S.dragGid = null;
        if (!st.groups[gid]) { requestDraw(); return; }
        Gr.clampGroup(st, gid);
        var res = Gr.trySnap(st, gid);
        if (res.snapped) {
            var g = st.groups[res.gid];
            S.fx.push({ pid: g.members[0], t0: nowMs() });
            Au.click(res.size);
            Au.buzz(14);
            S.snapCount++;
            var t = nowMs();
            if (res.locked) { UI.status('Piece in place'); }
            else { UI.status('Joined. ' + res.size + ' pieces together.'); }
            if (S.snapCount % 4 === 1 && t - S.lastCheer > 8000) { S.lastCheer = t; cheer('good'); }
            var marks = [10, 25, 50, 100], i;
            for (i = 0; i < marks.length; i++) {
                if (res.size >= marks[i] && !S.bigDone[marks[i]]) { S.bigDone[marks[i]] = true; cheer('big'); }
            }
        }
        updateProgress();
        if (Gr.isComplete(st)) { finish(); }
        scheduleSave();
        requestDraw();
    }

    function onTap(gid) {
        if (!S.settings.rotate || !S.st.groups[gid]) { requestDraw(); return; }
        S.dragGid = null;
        Gr.rotateGroup(S.st, gid, 1);
        Gr.clampGroup(S.st, gid);
        var res = Gr.trySnap(S.st, gid);
        if (res.snapped) {
            S.fx.push({ pid: S.st.groups[res.gid].members[0], t0: nowMs() });
            Au.click(res.size);
            Au.buzz(14);
            updateProgress();
            if (Gr.isComplete(S.st)) { finish(); }
        }
        UI.status('Turned');
        scheduleSave();
        requestDraw();
    }

    function finish(quiet) {
        var st = S.st;
        Gr.settleComplete(st);
        $('done').hidden = false;
        updateProgress();
        if (!quiet && !st.celebrated) {
            UI.confetti($('confetti'), 3600);
            Au.chime();
            Au.buzz(30);
            cheer('done');
        }
        st.celebrated = true;
        UI.status('You did it! The whole picture is together.');
        var b = $('again-btn');
        if (b && !quiet) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
        persist();
    }

    // ------------------------------------------------------------------ tools

    function doShuffle() {
        Gr.scatter(S.st, Math.random, false);
        S.hint = null;
        UI.status('Shuffled the loose pieces.');
        scheduleSave();
        requestDraw();
    }

    function doEdges() {
        var n = Gr.gatherEdges(S.st);
        S.hint = null;
        UI.toast(n ? 'Gathered ' + n + ' edge pieces in a row at the top.' : 'No loose edge pieces to gather.', 2600);
        if (n && !S.view.user) { fit(); }
        scheduleSave();
        requestDraw();
    }

    function setGhost(on) {
        S.settings.ghost = !!on;
        $('t-ghost').setAttribute('aria-pressed', S.settings.ghost ? 'true' : 'false');
        scheduleSave();
        requestDraw();
    }

    function doHint() {
        var h = Gr.pickHint(S.st, Math.random);
        if (!h) { UI.toast('Nothing left to hint.', 2000); return; }
        var vp = viewport(), g = S.st.groups[h.gid], b = Gr.worldBounds(S.st, g, 0);
        var tl = M.worldToScreen(S.view, b.minX, b.minY), br = M.worldToScreen(S.view, b.maxX, b.maxY);
        var rc = Gr.pieceRC(S.st, h.pid);
        var tt = M.worldToScreen(S.view, S.st.board.x + rc.c * S.st.pz.pw, S.st.board.y + rc.r * S.st.pz.ph);
        if (tl.x < 0 || tl.y < 0 || br.x > vp.w || br.y > vp.h || tt.x < 0 || tt.y < 0 || tt.x > vp.w || tt.y > vp.h) { fit(); }
        S.hint = { pid: h.pid, gid: h.gid, t0: nowMs() };
        UI.status('Hint: a piece is glowing. It belongs at ' + describe(h.pid) + '.');
        requestDraw();
    }

    function keepVisible(gid) {
        var vp = viewport(), g = S.st.groups[gid], b = Gr.worldBounds(S.st, g, 0);
        var tl = M.worldToScreen(S.view, b.minX, b.minY), br = M.worldToScreen(S.view, b.maxX, b.maxY);
        var dx = 0, dy = 0, m = 20;
        if (tl.x < m) { dx = m - tl.x; } else if (br.x > vp.w - m) { dx = vp.w - m - br.x; }
        if (tl.y < m) { dy = m - tl.y; } else if (br.y > vp.h - m) { dy = vp.h - m - br.y; }
        if (dx || dy) {
            S.view.tx += dx; S.view.ty += dy; S.view.user = true;
            M.viewClamp(S.view, S.st.table, vp.w, vp.h);
        }
    }

    function applySettingsToGame() {
        if (!S.st) { return; }
        var wasRotate = S.st.settings.rotate;
        S.st.settings.snapPct = S.settings.snapPct;
        S.st.settings.lock = S.settings.lock;
        S.st.settings.rotate = S.settings.rotate;
        if (wasRotate && !S.settings.rotate) {
            var k;
            for (k in S.st.groups) {
                if (S.st.groups.hasOwnProperty(k) && S.st.groups[k].rot) { Gr.rotateGroup(S.st, S.st.groups[k].id, -S.st.groups[k].rot); }
            }
        }
        Gr.normalizeOrder(S.st);
        Au.setSound(S.settings.sound);
        Au.setHaptics(S.settings.haptics);
        scheduleSave();
        requestDraw();
    }

    // ------------------------------------------------------------------ starting a game

    function beginGame(st, canvas, meta, opts) {
        opts = opts || {};
        S.st = st;
        S.image = canvas;
        S.meta = meta;
        S.sel = null; S.holding = false; S.dragGid = null; S.hint = null; S.fx = [];
        S.snapCount = 0; S.bigDone = {}; S.preview = false;
        S.lastTick = nowMs();
        $('done').hidden = true;
        UI.showScreen('game');
        $('t-ghost').setAttribute('aria-pressed', S.settings.ghost ? 'true' : 'false');
        S.view.user = false;
        layout();
        UI.status('Cutting ' + st.pz.count + ' pieces...');
        root.setTimeout(function () {
            S.renderer.cut(st, canvas);
            fit();
            updateProgress();
            if (opts.resume && Gr.isComplete(st)) { $('done').hidden = false; }
            persist();
            requestDraw();
            var b = $('board');
            try { b.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
            UI.status('Puzzle ready. ' + st.pz.count + ' pieces.');
        }, 30);
    }

    /** Keep the picture where it can be found after a reload. Calls back with the meta to store. */
    function rememberPicture(canvas, meta, cb) {
        if (meta.kind === 'sample' || meta.kind === 'pic') { return cb(meta); }
        Img.savePic(canvas, meta.name || '', function (err, id) {
            if (!err) {
                refreshShelf();
                return cb({ kind: 'pic', id: id, name: meta.name || '' });
            }
            // storage refused: try a small copy next to the game state, else play without saving
            var small = Img.scaled(canvas, 900), url = Img.canvasToDataUrl(small, 0.7);
            try {
                if (!url || url.length > 1500000) { throw new Error('too big'); }
                root.localStorage.setItem(KEY_IMG, url);
                cb({ kind: 'inline', id: '', name: meta.name || '' });
            } catch (e) {
                UI.toast('This browser would not keep your picture, so the puzzle will not be remembered if you close the page. You can still play, or use More, then Save puzzle as file.', 7000);
                S.storageWarned = true;
                cb({ kind: 'none', id: '', name: meta.name || '' });
            }
        });
    }

    function startGame(canvas, meta, over) {
        over = over || {};
        var settings = M.sanitizeSettings(S.settings);
        var st = M.newGame({
            imgW: canvas.width, imgH: canvas.height,
            count: over.count || settings.count,
            style: over.style || settings.style,
            seed: over.seed, grid: over.grid,
            settings: settings
        });
        rememberPicture(canvas, meta, function (m) { beginGame(st, canvas, m); });
    }

    function startFromPending() {
        if (!S.pending) { return; }
        S.settings = M.sanitizeSettings(S.settings);
        Au.unlock();
        startGame(S.pending.canvas, S.pending.meta);
    }

    function restartSame() {
        if (!S.image || !S.meta) { return; }
        S.settings = M.sanitizeSettings(S.settings);
        var st = M.newGame({
            imgW: S.image.width, imgH: S.image.height,
            count: S.settings.count, style: S.settings.style, settings: S.settings
        });
        beginGame(st, S.image, S.meta);
    }

    // ------------------------------------------------------------------ pictures in

    function setPending(canvas, meta) {
        S.pending = { canvas: canvas, meta: meta };
        var pv = $('preview'), ctx = pv.getContext('2d');
        var k = Math.min(pv.width / canvas.width, pv.height / canvas.height);
        ctx.clearRect(0, 0, pv.width, pv.height);
        var w = canvas.width * k, h = canvas.height * k;
        ctx.drawImage(canvas, (pv.width - w) / 2, (pv.height - h) / 2, w, h);
        $('preview-info').textContent = (meta.title || meta.name || 'Your picture') + ' (' + canvas.width + ' x ' + canvas.height + ')';
        $('options').hidden = false;
        UI.notice('');
        UI.showScreen('picker');
        var opt = $('options');
        if (opt.scrollIntoView) { try { opt.scrollIntoView({ behavior: UI.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); } catch (e) { opt.scrollIntoView(); } }
        UI.status('Picture ready. Choose how many pieces, then press Start puzzle.');
    }

    function handleImageFile(file) {
        UI.notice('Opening your picture...');
        Img.loadBlob(file, function (err, res) {
            if (err) { UI.notice(err.friendly || 'That picture could not be opened.'); UI.showScreen('picker'); return; }
            setPending(res.canvas, { kind: 'file', id: '', name: res.name, title: res.name || 'Your picture' });
        });
    }

    function handlePuzzleFile(file) {
        if (file.size > M.MAX_FILE_CHARS) { UI.notice('That file is too big to be a puzzle.'); return; }
        UI.notice('Opening puzzle file...');
        UI.readText(file, function (err, text) {
            if (err) { UI.notice('That file could not be read.'); return; }
            var r = M.parsePuzzleFile(text);
            if (!r.ok) { UI.notice(r.error); return; }
            Img.loadDataUrl(r.file.image, function (e2, res) {
                if (e2) { UI.notice('The picture inside that file could not be opened.'); return; }
                S.settings.snapPct = r.file.settings.snapPct;
                S.settings.lock = r.file.settings.lock;
                S.settings.rotate = r.file.settings.rotate;
                S.settings.little = r.file.settings.little;
                S.settings.style = r.file.puzzle.style;
                S.settings.count = Math.max(4, Math.min(300, r.file.puzzle.cols * r.file.puzzle.rows));
                syncOptionControls();
                UI.notice('');
                startGame(res.canvas, { kind: 'file', id: '', name: r.file.name, title: r.file.name }, {
                    seed: r.file.puzzle.seed, grid: { cols: r.file.puzzle.cols, rows: r.file.puzzle.rows }, style: r.file.puzzle.style
                });
            });
        });
    }

    function handleAnyFile(file) {
        if (!file) { return; }
        if (/\.json$/i.test(file.name || '') || file.type === 'application/json') { handlePuzzleFile(file); }
        else { handleImageFile(file); }
    }

    function pickSample(item) {
        var c = Samples.render(item.id);
        if (!c) { return; }
        setPending(c, { kind: 'sample', id: item.id, name: item.title, title: item.title });
    }

    function pickShelf(item) {
        UI.notice('Opening your picture...');
        Img.getPicUrl(item.id, function (err, url) {
            if (err) { UI.notice('That picture is no longer here.'); refreshShelf(); return; }
            Img.loadDataUrl(url, function (e2, res) {
                if (e2) { UI.notice('That picture could not be opened.'); return; }
                setPending(res.canvas, { kind: 'pic', id: item.id, name: item.name, title: item.name || 'My picture' });
            });
        });
    }

    function refreshShelf() {
        Img.listPics(function (err, list) {
            var wrap = $('shelf-wrap');
            if (!list || !list.length) { $('shelf').innerHTML = ''; wrap.hidden = true; return; }
            wrap.hidden = false;
            UI.buildThumbs($('shelf'), list.map(function (r, i) {
                return { id: r.id, name: r.name, title: r.name || ('Picture ' + (list.length - i)), src: r.thumb };
            }), pickShelf, function (item) {
                Img.deletePic(item.id, function () {
                    // if the running puzzle uses this picture it keeps going from memory
                    refreshShelf();
                    UI.status('Picture removed.');
                });
            });
        });
    }

    // ------------------------------------------------------------------ export

    function exportPuzzle() {
        if (!S.st || !S.image) { return; }
        var url = Img.canvasToDataUrl(S.image, 0.85);
        if (url.length > M.MAX_IMAGE_CHARS * 0.9) { url = Img.canvasToDataUrl(Img.scaled(S.image, 1100), 0.8); }
        if (!url || url.length > M.MAX_IMAGE_CHARS) { UI.toast('This picture is too big to put in a file.', 4000); return; }
        var file = M.buildFile(S.st, url, (S.meta && S.meta.name) || '', S.settings);
        var base = ((S.meta && S.meta.name) || 'puzzle').replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '-').slice(0, 30) || 'puzzle';
        if (UI.download('jigsaw-' + base + '.json', JSON.stringify(file))) {
            UI.toast('Saved a puzzle file. You can send it to someone and they can open it here.', 4500);
        } else {
            UI.toast('This browser would not save the file.', 4000);
        }
    }

    // ------------------------------------------------------------------ option controls

    function syncOptionControls() {
        var s = S.settings;
        $('little-hands').checked = s.little;
        $('count-chips').hidden = s.little;
        $('little-chips').hidden = !s.little;
        UI.setChip($('count-chips'), s.count);
        UI.setChip($('little-chips'), s.count);
        UI.setChip($('style-chips'), s.style);
        var pct = Math.round(s.snapPct * 100);
        $('snap-range').value = pct; $('snap-out').textContent = pct + '%';
        $('snap-range').disabled = s.little;
        $('opt-lock').checked = s.lock;
        $('opt-rotate').checked = s.rotate;
        $('m-snap').value = pct; $('m-snap-out').textContent = pct + '%';
        $('m-lock').checked = s.lock; $('m-rotate').checked = s.rotate;
        $('m-sound').checked = s.sound; $('m-haptics').checked = s.haptics; $('m-time').checked = s.showTime;
        $('time-out').hidden = !s.showTime;
        $('t-ghost').setAttribute('aria-pressed', s.ghost ? 'true' : 'false');
    }

    function setLittle(on) {
        S.settings.little = on;
        if (on) {
            S.settings.count = 6;
            S.settings.snapPct = M.SNAP_LITTLE;
        } else {
            S.settings.count = 24;
            S.settings.snapPct = M.SNAP_DEFAULT;
        }
        syncOptionControls();
    }

    function bindControls() {
        UI.buildChips($('count-chips'), 'count', M.PRESETS.map(function (n) { return { value: n, label: String(n) }; }), S.settings.count, function (v) {
            S.settings.count = parseInt(v, 10);
        });
        UI.buildChips($('little-chips'), 'little', M.LITTLE_COUNTS.map(function (n) { return { value: n, label: String(n) }; }), S.settings.count, function (v) {
            S.settings.count = parseInt(v, 10);
        });
        UI.buildChips($('style-chips'), 'style', [
            { value: 'jigsaw', label: 'Classic' }, { value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded' }
        ], S.settings.style, function (v) { S.settings.style = v; });

        $('little-hands').addEventListener('change', function () { setLittle($('little-hands').checked); });
        $('snap-range').addEventListener('input', function () {
            S.settings.snapPct = parseInt($('snap-range').value, 10) / 100;
            $('snap-out').textContent = $('snap-range').value + '%';
            $('m-snap').value = $('snap-range').value; $('m-snap-out').textContent = $('snap-range').value + '%';
            applySettingsToGame();
        });
        $('opt-lock').addEventListener('change', function () { S.settings.lock = $('opt-lock').checked; $('m-lock').checked = S.settings.lock; applySettingsToGame(); });
        $('opt-rotate').addEventListener('change', function () { S.settings.rotate = $('opt-rotate').checked; $('m-rotate').checked = S.settings.rotate; applySettingsToGame(); });

        $('m-snap').addEventListener('input', function () {
            S.settings.snapPct = parseInt($('m-snap').value, 10) / 100;
            $('m-snap-out').textContent = $('m-snap').value + '%';
            $('snap-range').value = $('m-snap').value; $('snap-out').textContent = $('m-snap').value + '%';
            applySettingsToGame();
        });
        $('m-lock').addEventListener('change', function () { S.settings.lock = $('m-lock').checked; $('opt-lock').checked = S.settings.lock; applySettingsToGame(); });
        $('m-rotate').addEventListener('change', function () { S.settings.rotate = $('m-rotate').checked; $('opt-rotate').checked = S.settings.rotate; applySettingsToGame(); });
        $('m-sound').addEventListener('change', function () { S.settings.sound = $('m-sound').checked; applySettingsToGame(); });
        $('m-haptics').addEventListener('change', function () { S.settings.haptics = $('m-haptics').checked; applySettingsToGame(); });
        $('m-time').addEventListener('change', function () { S.settings.showTime = $('m-time').checked; $('time-out').hidden = !S.settings.showTime; updateTime(); applySettingsToGame(); });

        $('file-input').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; handleAnyFile(f); });
        $('camera-input').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; handleImageFile(f); });
        $('puzzle-input').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; handleAnyFile(f); });
        $('start-btn').addEventListener('click', startFromPending);
        $('resume-btn').addEventListener('click', function () { UI.showScreen('game'); layout(); requestDraw(); });

        $('back-btn').addEventListener('click', function () {
            persist();
            S.preview = false;
            updateResumeCard();
            UI.showScreen('picker');
            UI.status('Choose a picture.');
        });
        $('again-btn').addEventListener('click', function () { restartSame(); });
        $('newpic-btn').addEventListener('click', function () { $('done').hidden = true; updateResumeCard(); UI.showScreen('picker'); });

        $('t-shuffle').addEventListener('click', doShuffle);
        $('t-edges').addEventListener('click', doEdges);
        $('t-ghost').addEventListener('click', function () { setGhost(!S.settings.ghost); });
        $('t-hint').addEventListener('click', doHint);
        $('t-fit').addEventListener('click', fit);
        $('zoom-in').addEventListener('click', function () { zoomBy(1.4); });
        $('zoom-out').addEventListener('click', function () { zoomBy(1 / 1.4); });

        var pv = $('t-preview');
        function peek(on) { S.preview = on; requestDraw(); if (on) { UI.status('Showing the whole picture.'); } }
        pv.addEventListener('pointerdown', function (e) { try { pv.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } peek(true); });
        pv.addEventListener('pointerup', function () { peek(false); });
        pv.addEventListener('pointercancel', function () { peek(false); });
        pv.addEventListener('lostpointercapture', function () { peek(false); });
        pv.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); peek(true); } });
        pv.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { peek(false); } });
        pv.addEventListener('blur', function () { if (S.preview) { peek(false); } });
        pv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

        var menu = $('menu');
        UI.trapSheet(menu);
        $('t-menu').addEventListener('click', function () { UI.openSheet(menu, $('t-menu')); });
        $('m-close').addEventListener('click', function () { UI.closeSheet(menu); });
        $('m-save').addEventListener('click', exportPuzzle);
        $('m-restart').addEventListener('click', function () { UI.closeSheet(menu); restartSame(); });
        menu.addEventListener('click', function (e) { if (e.target === menu) { UI.closeSheet(menu); } });
    }

    function updateResumeCard() {
        $('resume-card').hidden = !(S.st && !Gr.isComplete(S.st));
    }

    function updateTime() {
        if (!S.settings.showTime || !S.st) { return; }
        tickElapsed();
        var sec = Math.floor((S.st.elapsedMs || 0) / 1000), m = Math.floor(sec / 60), s = sec % 60;
        $('time-out').textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }

    // ------------------------------------------------------------------ drag and drop, paste

    function bindDropAndPaste() {
        var hint = $('drop-hint'), depth = 0;
        function hasFiles(e) {
            var t = e.dataTransfer && e.dataTransfer.types, i;
            if (!t) { return false; }
            for (i = 0; i < t.length; i++) { if (t[i] === 'Files') { return true; } }
            return false;
        }
        document.addEventListener('dragenter', function (e) { if (hasFiles(e)) { depth++; hint.hidden = false; e.preventDefault(); } });
        document.addEventListener('dragover', function (e) { if (hasFiles(e)) { e.preventDefault(); } });
        document.addEventListener('dragleave', function (e) { if (hasFiles(e)) { depth = Math.max(0, depth - 1); if (!depth) { hint.hidden = true; } } });
        document.addEventListener('drop', function (e) {
            if (!hasFiles(e)) { return; }
            e.preventDefault();
            depth = 0; hint.hidden = true;
            var f = e.dataTransfer.files && e.dataTransfer.files[0];
            if (!f) { return; }
            if (S.st && !$('game').hidden) { S.input.cancelAll(); UI.showScreen('picker'); }
            handleAnyFile(f);
        });
        document.addEventListener('paste', function (e) {
            var items = e.clipboardData && e.clipboardData.items, i;
            if (!items) { return; }
            for (i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && /^image\//.test(items[i].type)) {
                    var f = items[i].getAsFile();
                    if (f) {
                        e.preventDefault();
                        if (S.st && !$('game').hidden) { S.input.cancelAll(); UI.showScreen('picker'); }
                        handleImageFile(f);
                        return;
                    }
                }
            }
        });
    }

    // ------------------------------------------------------------------ resume

    function loadImageFor(meta, cb) {
        if (meta.kind === 'sample') {
            var c = Samples.render(meta.id);
            return c ? cb(null, c) : cb(new Error('no sample'));
        }
        if (meta.kind === 'pic') {
            return Img.getPicUrl(meta.id, function (err, url) {
                if (err) { return cb(err); }
                Img.loadDataUrl(url, function (e2, res) { cb(e2, res && res.canvas); });
            });
        }
        if (meta.kind === 'inline') {
            var url2 = null;
            try { url2 = root.localStorage.getItem(KEY_IMG); } catch (e) { url2 = null; }
            if (!url2) { return cb(new Error('no inline')); }
            return Img.loadDataUrl(url2, function (e3, res2) { cb(e3, res2 && res2.canvas); });
        }
        cb(new Error('not saved'));
    }

    function tryResume(saved) {
        if (!saved || !saved.game || !saved.game.state || !saved.game.image) { return false; }
        var st = M.deserialize(saved.game.state);
        if (!st) { return false; }
        var meta = saved.game.image;
        if (['sample', 'pic', 'inline'].indexOf(meta.kind) < 0) { return false; }
        loadImageFor(meta, function (err, canvas) {
            if (err || !canvas) {
                UI.notice('We could not find the picture from your last puzzle. Pick a picture to start a new one.');
                return;
            }
            // the saved grid must match the picture we got back
            if (Math.abs(canvas.width / canvas.height - st.pz.imgW / st.pz.imgH) > 0.02) {
                UI.notice('The picture from your last puzzle changed, so it could not be continued. Start a new one.');
                return;
            }
            st.settings.snapPct = S.settings.snapPct;
            st.settings.lock = S.settings.lock;
            st.settings.rotate = S.settings.rotate;
            beginGame(st, canvas, { kind: meta.kind, id: meta.id, name: meta.name }, { resume: true });
        });
        return true;
    }

    // ------------------------------------------------------------------ test and debug hooks

    function pieceCenterClient(pid) {
        var g = Gr.groupOf(S.st, pid), o = Gr.pieceOrigin(S.st, g, pid), pz = S.st.pz;
        var v = Gr.rotVec(g.rot, pz.pw / 2, pz.ph / 2);
        var p = M.worldToScreen(S.view, o.x + v[0], o.y + v[1]);
        var r = $('board').getBoundingClientRect();
        return { x: p.x + r.left, y: p.y + r.top };
    }

    /** A client point on the piece that is not covered by another piece, plus the move to its solved spot */
    function dragPlan(pid) {
        var st = S.st, pz = st.pz, g = Gr.groupOf(st, pid), rc = Gr.pieceRC(st, pid);
        var r = $('board').getBoundingClientRect(), best = null;
        var o = Gr.pieceOrigin(st, g, pid);
        var tries = [[0.5, 0.5], [0.3, 0.5], [0.7, 0.5], [0.5, 0.3], [0.5, 0.7], [0.4, 0.4], [0.6, 0.6], [0.4, 0.6], [0.6, 0.4], [0.2, 0.2], [0.8, 0.8]];
        var i, v, wx, wy, h;
        for (i = 0; i < tries.length && !best; i++) {
            v = Gr.rotVec(g.rot, tries[i][0] * pz.pw, tries[i][1] * pz.ph);
            wx = o.x + v[0]; wy = o.y + v[1];
            h = Gr.hitTest(st, wx, wy, false);
            if (h && h.pid === pid) { best = { wx: wx, wy: wy }; }
        }
        if (!best) { return null; }
        var sp = M.worldToScreen(S.view, best.wx, best.wy);
        return {
            x: sp.x + r.left, y: sp.y + r.top,
            dx: (st.board.x - g.ox) * S.view.s, dy: (st.board.y - g.oy) * S.view.s,
            rc: rc
        };
    }

    root.FongJigsawApp = {
        state: function () { return S.st; },
        view: function () { return S.view; },
        settings: function () { return S.settings; },
        pieceCenterClient: pieceCenterClient,
        dragPlan: dragPlan,
        drawStats: function () {
            var a = S.drawTimes.slice().sort(function (x, y) { return x - y; });
            if (!a.length) { return null; }
            return { n: a.length, median: a[Math.floor(a.length / 2)], p95: a[Math.floor(a.length * 0.95)], max: a[a.length - 1] };
        },
        clearDrawStats: function () { S.drawTimes = []; },
        imageSize: function () { return S.image ? { w: S.image.width, h: S.image.height } : null; },
        imagePixel: function (fx, fy) {
            if (!S.image) { return null; }
            var d = S.image.getContext('2d').getImageData(Math.floor(fx * S.image.width), Math.floor(fy * S.image.height), 1, 1).data;
            return [d[0], d[1], d[2]];
        },
        forceFrame: function () { frame(); },
        persistNow: persist,
        ready: false
    };

    // ------------------------------------------------------------------ boot

    function boot() {
        S.renderer = new R.Renderer($('board'));
        readColors();
        var saved = readSaved();
        if (saved && saved.settings) { S.settings = M.sanitizeSettings(saved.settings); }
        Au.setSound(S.settings.sound);
        Au.setHaptics(S.settings.haptics);

        bindControls();
        bindDropAndPaste();
        syncOptionControls();

        S.input = NS.Input.attach({
            canvas: $('board'),
            getState: function () { return S.st; },
            getView: function () { return S.view; },
            viewport: viewport,
            requestDraw: requestDraw,
            unlock: Au.unlock,
            isActive: function () { return !!S.st && !Gr.isComplete(S.st); },
            onDragStart: onDragStart,
            onDrop: onDrop,
            onTap: onTap,
            onSelect: function (gid, pid) {
                var g = S.st.groups[gid];
                UI.status('Selected piece at ' + describe(pid) + (g.members.length > 1 ? ', in a group of ' + g.members.length : '') + '. Enter picks it up.');
                keepVisible(gid);
            },
            onKeyCommand: function (k) {
                if (k === '+' || k === '=') { zoomBy(1.4); }
                else if (k === '-' || k === '_') { zoomBy(1 / 1.4); }
                else if (k === '0') { fit(); }
                else if (k === 'h' || k === 'H') { doHint(); }
            },
            getSel: function () { return S.sel; },
            setSel: function (gid) { S.sel = gid; },
            setHolding: function (b) { S.holding = b; },
            keepVisible: keepVisible
        });

        var ro = root.ResizeObserver ? new root.ResizeObserver(function () { layout(); }) : null;
        if (ro) { ro.observe($('stage')); }
        root.addEventListener('resize', layout);
        root.addEventListener('orientationchange', function () { root.setTimeout(layout, 200); });
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') { persist(); } else { S.lastTick = nowMs(); }
        });
        root.addEventListener('pagehide', persist);
        root.setInterval(updateTime, 1000);

        // sample thumbnails after first paint
        UI.buildThumbs($('samples'), Samples.list.map(function (s) { return { id: s.id, title: s.title, canvas: null, src: '' }; }), pickSample);
        root.setTimeout(function () {
            var cells = $('samples').querySelectorAll('.thumb-btn');
            Samples.list.forEach(function (s, i) {
                var c = Samples.render(s.id, 260);
                c.setAttribute('aria-hidden', 'true');
                cells[i].insertBefore(c, cells[i].firstChild);
            });
        }, 20);
        refreshShelf();

        var resumed = false;
        if (saved && saved.game) { resumed = tryResume(saved); }
        if (!resumed) { UI.showScreen('picker'); }
        root.FongJigsawApp.ready = true;
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); } else { boot(); }
})(window);
