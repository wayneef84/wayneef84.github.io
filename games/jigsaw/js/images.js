/**
 * F.O.N.G. Jigsaw - images.js
 *
 * Loads a picture from a File/Blob/data URL, fixes EXIF rotation, downscales it
 * on a canvas and keeps a small "My pictures" shelf in IndexedDB (with a tiny
 * localStorage fallback). Nothing here touches the network: pictures are read
 * from memory, never uploaded.
 *
 * Callbacks are node-style: cb(err, result). err.friendly is text safe to show.
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw = root.FongJigsaw || {};

    var MAX_SIDE = 1600;
    var MAX_BYTES = 60 * 1024 * 1024;       // refuse files bigger than this
    var MAX_PIXELS = 200 * 1000 * 1000;     // refuse pictures with more pixels than this
    var MIN_SIDE = 64;
    var THUMB_SIDE = 160;
    var SHELF_MAX = 12;
    var DB_NAME = 'fong-jigsaw';
    var STORE = 'pics';
    var LS_PICS = 'fong.jigsaw.v2.pics';

    function fail(cb, friendly, detail) {
        var e = new Error(detail || friendly);
        e.friendly = friendly;
        cb(e);
    }

    function makeCanvas(w, h) {
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w));
        c.height = Math.max(1, Math.round(h));
        return c;
    }

    // ---- EXIF orientation (only used when the browser does not rotate by itself) ----

    /** Returns EXIF orientation 1..8 from the first bytes of a JPEG, or 1 */
    function parseExifOrientation(buf) {
        var v;
        try { v = new DataView(buf); } catch (e) { return 1; }
        if (v.byteLength < 4 || v.getUint16(0) !== 0xFFD8) { return 1; }
        var off = 2, len = v.byteLength, marker, size, little, tiff, entries, i, tag;
        while (off + 4 <= len) {
            marker = v.getUint16(off);
            off += 2;
            if (marker === 0xFFE1) {
                size = v.getUint16(off);
                if (off + 8 > len || v.getUint32(off + 2) !== 0x45786966) { return 1; }
                tiff = off + 8;
                little = v.getUint16(tiff) === 0x4949;
                off = tiff + v.getUint32(tiff + 4, little);
                if (off + 2 > len) { return 1; }
                entries = v.getUint16(off, little);
                off += 2;
                for (i = 0; i < entries; i++) {
                    if (off + i * 12 + 10 > len) { return 1; }
                    tag = v.getUint16(off + i * 12, little);
                    if (tag === 0x0112) {
                        var o = v.getUint16(off + i * 12 + 8, little);
                        return (o >= 1 && o <= 8) ? o : 1;
                    }
                }
                return 1;
            } else if ((marker & 0xFF00) !== 0xFF00) {
                return 1;
            } else {
                off += v.getUint16(off);
            }
        }
        return 1;
    }

    var autoOrient = null;
    function browserRotatesImages() {
        if (autoOrient === null) {
            try {
                autoOrient = !!(root.CSS && root.CSS.supports && root.CSS.supports('image-orientation', 'from-image'));
            } catch (e) { autoOrient = false; }
        }
        return autoOrient;
    }

    // ---- decode ------------------------------------------------------------------

    function decodeViaImg(blob, cb) {
        var url;
        try { url = URL.createObjectURL(blob); } catch (e) { return fail(cb, 'This browser could not open that picture.'); }
        var img = new Image();
        img.onload = function () {
            try { URL.revokeObjectURL(url); } catch (e) {}
            cb(null, img);
        };
        img.onerror = function () {
            try { URL.revokeObjectURL(url); } catch (e) {}
            fail(cb, 'That file does not look like a picture we can open. Try a JPG or PNG.');
        };
        img.src = url;
    }

    function readOrientationFromBlob(blob, cb) {
        if (!blob.slice || !root.FileReader || !/jpe?g/i.test(blob.type || '')) { return cb(1); }
        var fr = new FileReader();
        fr.onload = function () { cb(parseExifOrientation(fr.result)); };
        fr.onerror = function () { cb(1); };
        fr.readAsArrayBuffer(blob.slice(0, 131072));
    }

    /** Decode any image Blob to { source, width, height, orientation } with upright pixels */
    function decode(blob, cb) {
        function viaImg() {
            decodeViaImg(blob, function (err, img) {
                if (err) { return cb(err); }
                if (browserRotatesImages()) {
                    return cb(null, { source: img, width: img.naturalWidth, height: img.naturalHeight, orientation: 1 });
                }
                readOrientationFromBlob(blob, function (o) {
                    var swap = o >= 5;
                    cb(null, {
                        source: img,
                        width: swap ? img.naturalHeight : img.naturalWidth,
                        height: swap ? img.naturalWidth : img.naturalHeight,
                        orientation: o
                    });
                });
            });
        }
        if (root.createImageBitmap) {
            var done = false;
            try {
                root.createImageBitmap(blob, { imageOrientation: 'from-image' }).then(function (bmp) {
                    done = true;
                    cb(null, { source: bmp, width: bmp.width, height: bmp.height, orientation: 1, bitmap: true });
                }, function () {
                    if (!done) { viaImg(); }
                });
                return;
            } catch (e) { /* fall through to the Image path */ }
        }
        viaImg();
    }

    /** Draw `dec` onto a new canvas no larger than maxSide, halving in steps for quality */
    function toCanvas(dec, maxSide) {
        var w = dec.width, h = dec.height;
        var scale = Math.min(1, maxSide / Math.max(w, h));
        var tw = Math.max(1, Math.round(w * scale)), th = Math.max(1, Math.round(h * scale));
        var o = dec.orientation || 1;
        var sw = dec.source.width || dec.source.naturalWidth, sh = dec.source.height || dec.source.naturalHeight;
        // first pass: draw upright at full size or in halving steps
        var cur = dec.source, cw = sw, ch = sh, step, ctx, c;
        // apply orientation on the first draw
        var uw = o >= 5 ? sh : sw, uh = o >= 5 ? sw : sh;
        // never build a canvas bigger than twice the target (huge photos would exceed canvas limits)
        var f = Math.min(1, (2 * Math.max(tw, th)) / Math.max(uw, uh));
        var stepW = Math.max(1, Math.round(uw * f)), stepH = Math.max(1, Math.round(uh * f));
        c = makeCanvas(stepW, stepH);
        ctx = c.getContext('2d');
        ctx.scale(stepW / uw, stepH / uh);
        applyOrientation(ctx, o, sw, sh);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(cur, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cur = c; cw = stepW; ch = stepH;
        while (cw / 2 >= tw && ch / 2 >= th) {
            step = makeCanvas(Math.ceil(cw / 2), Math.ceil(ch / 2));
            step.getContext('2d').drawImage(cur, 0, 0, cw, ch, 0, 0, step.width, step.height);
            cur = step; cw = step.width; ch = step.height;
        }
        var out = makeCanvas(tw, th);
        var octx = out.getContext('2d');
        octx.fillStyle = '#ffffff';
        octx.fillRect(0, 0, tw, th);
        octx.imageSmoothingQuality = 'high';
        octx.drawImage(cur, 0, 0, cw, ch, 0, 0, tw, th);
        return out;
    }

    function applyOrientation(ctx, o, w, h) {
        switch (o) {
            case 2: ctx.transform(-1, 0, 0, 1, w, 0); break;
            case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
            case 4: ctx.transform(1, 0, 0, -1, 0, h); break;
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
            case 6: ctx.transform(0, 1, -1, 0, h, 0); break;
            case 7: ctx.transform(0, -1, -1, 0, h, w); break;
            case 8: ctx.transform(0, -1, 1, 0, 0, w); break;
            default: break;
        }
    }

    function canvasToDataUrl(canvas, quality) {
        try { return canvas.toDataURL('image/jpeg', quality || 0.86); } catch (e) { return ''; }
    }

    /** Smaller copy of a canvas */
    function scaled(canvas, maxSide) {
        var s = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
        if (s >= 1) { return canvas; }
        var out = makeCanvas(canvas.width * s, canvas.height * s);
        out.getContext('2d').drawImage(canvas, 0, 0, out.width, out.height);
        return out;
    }

    /**
     * Load a File or Blob. cb(err, { canvas, width, height, name }).
     * Rejects non-images, empty files, enormous files and tiny pictures with friendly text.
     */
    function loadBlob(blob, cb) {
        if (!blob) { return fail(cb, 'No picture was chosen.'); }
        if (blob.size === 0) { return fail(cb, 'That file is empty.'); }
        if (blob.size > MAX_BYTES) { return fail(cb, 'That picture is very large. Try a smaller one (under 60 MB).'); }
        if (blob.type && blob.type.indexOf('image/') !== 0) {
            return fail(cb, 'That file is not a picture. Please choose a photo or image.');
        }
        if (/svg/i.test(blob.type || '')) { return fail(cb, 'Please choose a photo (JPG, PNG or WebP).'); }
        decode(blob, function (err, dec) {
            if (err) { return cb(err); }
            if (!(dec.width >= 1 && dec.height >= 1)) { return fail(cb, 'That picture seems to be empty.'); }
            if (dec.width * dec.height > MAX_PIXELS) {
                if (dec.source.close) { try { dec.source.close(); } catch (e) {} }
                return fail(cb, 'That picture is too huge to open. Try a smaller one.');
            }
            if (Math.min(dec.width, dec.height) < MIN_SIDE) {
                if (dec.source.close) { try { dec.source.close(); } catch (e) {} }
                return fail(cb, 'That picture is too small to make a puzzle. Try a bigger one.');
            }
            var canvas;
            try { canvas = toCanvas(dec, MAX_SIDE); }
            catch (e) { return fail(cb, 'That picture is too big for this device to open. Try a smaller one.', String(e)); }
            if (dec.source.close) { try { dec.source.close(); } catch (e2) {} }
            cb(null, { canvas: canvas, width: canvas.width, height: canvas.height, name: cleanFileName(blob.name) });
        });
    }

    function cleanFileName(n) {
        if (!n || typeof n !== 'string') { return ''; }
        return n.replace(/\.[A-Za-z0-9]{1,5}$/, '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 40);
    }

    /** Load from a data URL string (used for saved games and imported files) */
    function loadDataUrl(url, cb) {
        if (typeof url !== 'string' || url.indexOf('data:image/') !== 0) { return fail(cb, 'That picture could not be opened.'); }
        var img = new Image();
        img.onload = function () {
            if (!img.naturalWidth || !img.naturalHeight) { return fail(cb, 'That picture could not be opened.'); }
            var canvas;
            try { canvas = toCanvas({ source: img, width: img.naturalWidth, height: img.naturalHeight, orientation: 1 }, MAX_SIDE); }
            catch (e) { return fail(cb, 'That picture could not be opened.'); }
            cb(null, { canvas: canvas, width: canvas.width, height: canvas.height });
        };
        img.onerror = function () { fail(cb, 'That picture could not be opened.'); };
        img.src = url;
    }

    // ---- My pictures shelf: IndexedDB with a localStorage fallback ---------------------

    var dbPromise = null;

    function openDb(cb) {
        var idb;
        try { idb = root.indexedDB; } catch (e) { idb = null; }
        if (!idb) { return cb(new Error('no indexedDB')); }
        var req;
        try { req = idb.open(DB_NAME, 1); } catch (e2) { return cb(e2); }
        var finished = false;
        function once(err, db) { if (!finished) { finished = true; cb(err, db); } }
        req.onupgradeneeded = function () {
            var db = req.result;
            if (!db.objectStoreNames.contains(STORE)) { db.createObjectStore(STORE, { keyPath: 'id' }); }
        };
        req.onsuccess = function () { once(null, req.result); };
        req.onerror = function () { once(req.error || new Error('idb open failed')); };
        req.onblocked = function () { once(new Error('idb blocked')); };
    }

    function getDb(cb) {
        if (dbPromise && dbPromise.db) { return cb(null, dbPromise.db); }
        if (dbPromise && dbPromise.failed) { return cb(dbPromise.failed); }
        openDb(function (err, db) {
            if (err) { dbPromise = { failed: err }; return cb(err); }
            dbPromise = { db: db };
            cb(null, db);
        });
    }

    function lsRead() {
        try {
            var raw = root.localStorage.getItem(LS_PICS);
            var arr = raw ? JSON.parse(raw) : [];
            return arr instanceof Array ? arr : [];
        } catch (e) { return []; }
    }
    function lsWrite(arr) {
        try { root.localStorage.setItem(LS_PICS, JSON.stringify(arr)); return true; } catch (e) { return false; }
    }

    function newId() {
        return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1679616).toString(36);
    }

    /** Save a picture to the shelf. cb(err, id). Trims the shelf to SHELF_MAX. */
    function savePic(canvas, name, cb) {
        var id = newId();
        var rec = {
            id: id, ts: Date.now(), name: name || '', w: canvas.width, h: canvas.height,
            dataUrl: canvasToDataUrl(canvas, 0.86),
            thumb: canvasToDataUrl(scaled(canvas, THUMB_SIDE), 0.7)
        };
        if (!rec.dataUrl) { return cb(new Error('encode failed')); }
        getDb(function (err, db) {
            if (err) { return saveLs(rec, canvas, cb); }
            try {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).put(rec);
                tx.oncomplete = function () { trim(db, function () { cb(null, id); }); };
                tx.onerror = function () { saveLs(rec, canvas, cb); };
                tx.onabort = function () { saveLs(rec, canvas, cb); };
            } catch (e) { saveLs(rec, canvas, cb); }
        });
    }

    function saveLs(rec, canvas, cb) {
        var small = scaled(canvas, 900);
        rec.dataUrl = canvasToDataUrl(small, 0.7);
        rec.w = small.width; rec.h = small.height;
        var arr = lsRead().filter(function (r) { return r.id !== rec.id; });
        arr.unshift(rec);
        arr = arr.slice(0, 3);
        while (arr.length && !lsWrite(arr)) { arr.pop(); }
        if (arr.length && arr[0].id === rec.id) { cb(null, rec.id); }
        else { cb(new Error('storage full')); }
    }

    function trim(db, done) {
        listFrom(db, function (err, list) {
            if (err || list.length <= SHELF_MAX) { return done(); }
            var extra = list.slice(SHELF_MAX), n = extra.length;
            var tx = db.transaction(STORE, 'readwrite');
            var i;
            for (i = 0; i < extra.length; i++) { tx.objectStore(STORE).delete(extra[i].id); }
            tx.oncomplete = done; tx.onerror = done; tx.onabort = done;
            if (!n) { done(); }
        });
    }

    function listFrom(db, cb) {
        try {
            var req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
            req.onsuccess = function () {
                var arr = req.result || [];
                arr.sort(function (a, b) { return b.ts - a.ts; });
                cb(null, arr);
            };
            req.onerror = function () { cb(req.error || new Error('list failed')); };
        } catch (e) { cb(e); }
    }

    /** cb(err, [ { id, ts, name, w, h, thumb } ]) newest first (no full image data) */
    function listPics(cb) {
        getDb(function (err, db) {
            function strip(arr) {
                return arr.map(function (r) { return { id: r.id, ts: r.ts, name: r.name, w: r.w, h: r.h, thumb: r.thumb }; });
            }
            if (err) { return cb(null, strip(lsRead())); }
            listFrom(db, function (e2, arr) { cb(null, e2 ? [] : strip(arr)); });
        });
    }

    /** cb(err, dataUrl) */
    function getPicUrl(id, cb) {
        getDb(function (err, db) {
            function fromLs() {
                var r = lsRead().filter(function (x) { return x.id === id; })[0];
                if (r) { cb(null, r.dataUrl); } else { cb(new Error('not found')); }
            }
            if (err) { return fromLs(); }
            try {
                var req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
                req.onsuccess = function () { if (req.result) { cb(null, req.result.dataUrl); } else { fromLs(); } };
                req.onerror = function () { fromLs(); };
            } catch (e) { fromLs(); }
        });
    }

    function deletePic(id, cb) {
        cb = cb || function () {};
        lsWrite(lsRead().filter(function (r) { return r.id !== id; }));
        getDb(function (err, db) {
            if (err) { return cb(null); }
            try {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).delete(id);
                tx.oncomplete = function () { cb(null); };
                tx.onerror = function () { cb(null); };
            } catch (e) { cb(null); }
        });
    }

    NS.Images = {
        MAX_SIDE: MAX_SIDE,
        SHELF_MAX: SHELF_MAX,
        parseExifOrientation: parseExifOrientation,
        _toCanvas: toCanvas,   // exposed for tests
        browserRotatesImages: browserRotatesImages,
        loadBlob: loadBlob,
        loadDataUrl: loadDataUrl,
        canvasToDataUrl: canvasToDataUrl,
        scaled: scaled,
        savePic: savePic,
        listPics: listPics,
        getPicUrl: getPicUrl,
        deletePic: deletePic
    };
})(window);
