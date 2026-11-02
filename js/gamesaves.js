/**
 * FongGameSaves: export and import saved progress for each game, kept in this browser only.
 * High scores stay in FongScores. Look, cheer and play options stay in FongTheme, FongCheer and FongPrefs.
 * A static manifest lists each game and the localStorage keys that hold its progress, so the homepage
 * can list games before they are ever opened. Games can also call register() at run time.
 * Only keys named in the manifest are ever written. Values are raw strings. Keys marked json must parse.
 * Strict ES5. No network. Every storage call is wrapped in try/catch. Docs: docs/GAMESAVES.md
 */
(function (w) {
    'use strict';

    var has = Object.prototype.hasOwnProperty;
    var MAX_CHARS = 600000;        // whole file
    var MAX_VALUE = 200000;        // one stored value
    var FORMAT_ONE = 'fong-game-save';
    var FORMAT_ALL = 'fong-game-saves';

    // id -> { id, name, keys: [], json: { key: true } }
    var games = {};
    var order = [];

    function isArr(a) { return Object.prototype.toString.call(a) === '[object Array]'; }

    function badName(k) { return k === '__proto__' || k === 'constructor' || k === 'prototype'; }

    function badKey(o, depth) {
        if (depth > 30) { return true; }
        if (!o || typeof o !== 'object') { return false; }
        var ks = Object.keys(o);
        for (var i = 0; i < ks.length; i++) {
            if (badName(ks[i])) { return true; }
            if (badKey(o[ks[i]], depth + 1)) { return true; }
        }
        return false;
    }

    function readKey(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
    function removeKey(k) { try { w.localStorage.removeItem(k); return true; } catch (e) { return false; } }
    function writeKey(k, v) { try { w.localStorage.setItem(k, v); return true; } catch (e) { return false; } }

    function register(id, info) {
        if (typeof id !== 'string' || !id || badName(id) || !info) { return false; }
        var g = has.call(games, id) ? games[id] : null;
        if (!g) {
            g = games[id] = { id: id, name: id, keys: [], json: {} };
            order.push(id);
        }
        if (typeof info.name === 'string' && info.name) { g.name = info.name; }
        var i, k;
        var keys = isArr(info.keys) ? info.keys : [];
        for (i = 0; i < keys.length; i++) {
            k = keys[i];
            if (typeof k === 'string' && k && !badName(k) && g.keys.indexOf(k) < 0) { g.keys.push(k); }
        }
        var js = isArr(info.json) ? info.json : [];
        for (i = 0; i < js.length; i++) {
            if (typeof js[i] === 'string' && g.keys.indexOf(js[i]) >= 0) { g.json[js[i]] = true; }
        }
        return true;
    }

    // ---- manifest ------------------------------------------------------
    register('nightlite-choir', { name: 'Nightlite Choir+', keys: ['nightlite.save', 'nightlite.mix', 'nightlite.vol'], json: ['nightlite.save', 'nightlite.mix'] });
    register('s4k-mixer-v2', { name: 'S4K Mixer v2', keys: ['sprunkiV2.slots', 'sprunkiV2.pack', 'sprunkiV2.vol', 'sprunkiV2.saves', 'sprunkiV2.saveNum'], json: ['sprunkiV2.saves'] });
    register('s4k-mixer', { name: 'S4K Mixer (custom characters)', keys: ['s4k_custom_chars'], json: ['s4k_custom_chars'] });
    register('slots', { name: 'Slots', keys: ['fong.slots.v4'], json: ['fong.slots.v4'] });
    register('jigsaw', { name: 'Jigsaw', keys: ['fong.jigsaw.v2'], json: ['fong.jigsaw.v2'] });
    register('sudoku', { name: 'Sudoku (game in progress)', keys: ['sudoku_autosave'], json: ['sudoku_autosave'] });
    register('xtc-ball', { name: 'XTC Ball (custom balls)', keys: ['oracle_custom_balls'], json: ['oracle_custom_balls'] });
    register('card-games', { name: 'Card games (balance and War history)', keys: ['family_arcade_balance', 'war_history', 'war_match_history'], json: ['war_history', 'war_match_history'] });
    register('tracing-words', { name: 'Trace Words', keys: ['fong_custom_words', 'fong_word_category'], json: ['fong_custom_words'] });
    register('tracing-chinese', { name: 'Trace Chinese', keys: ['chinese-settings', 'chinese-completed', 'chinese-daily'], json: ['chinese-settings', 'chinese-completed', 'chinese-daily'] });
    register('tracing-sentences', { name: 'Trace Sentences', keys: ['sentences-settings', 'sentences-saved', 'sentences-completed', 'sentences-unlocked'], json: ['sentences-settings', 'sentences-saved', 'sentences-completed', 'sentences-unlocked'] });

    // ---- reading -------------------------------------------------------

    function gameData(g) {
        var out = {}, any = false, i, v;
        for (i = 0; i < g.keys.length; i++) {
            v = readKey(g.keys[i]);
            if (typeof v === 'string') { out[g.keys[i]] = v; any = true; }
        }
        return any ? out : null;
    }

    function list() {
        var out = [], i, g;
        for (i = 0; i < order.length; i++) {
            g = games[order[i]];
            out.push({ id: g.id, name: g.name, keys: g.keys.slice(), hasData: !!gameData(g) });
        }
        return out;
    }

    // Warnings for anything import would refuse: a value over MAX_VALUE or a file over MAX_CHARS.
    function sizeWarnings(g, data, warnings) {
        var ks = Object.keys(data), i;
        for (i = 0; i < ks.length; i++) {
            if (data[ks[i]].length > MAX_VALUE) {
                warnings.push(g.name + ': ' + ks[i] + ' is too big to import again (' + data[ks[i]].length + ' characters, the limit is ' + MAX_VALUE + '). It will be skipped on import.');
            }
        }
    }

    function fileWarning(text, warnings) {
        if (text.length > MAX_CHARS) {
            warnings.push('This file is ' + text.length + ' characters, over the ' + MAX_CHARS + ' limit, so it cannot be imported as one file.');
        }
    }

    // Returns {text, warnings}. text is '' for an unknown game.
    function exportGame(id) {
        var warnings = [];
        if (typeof id !== 'string' || !has.call(games, id)) { return { text: '', warnings: ['Unknown game.'] }; }
        var g = games[id], data = gameData(g) || {};
        sizeWarnings(g, data, warnings);
        var text = JSON.stringify({ format: FORMAT_ONE, version: 1, game: g.id, name: g.name, saved: new Date().toISOString(), data: data }, null, 2);
        fileWarning(text, warnings);
        return { text: text, warnings: warnings };
    }

    function exportObject() {
        var out = {}, i, g, d;
        for (i = 0; i < order.length; i++) {
            g = games[order[i]];
            d = gameData(g);
            if (d) { out[g.id] = { name: g.name, data: d }; }
        }
        return out;
    }

    // Returns {text, warnings}.
    function exportAll() {
        var warnings = [], obj = exportObject(), ids = Object.keys(obj), i;
        for (i = 0; i < ids.length; i++) { sizeWarnings(games[ids[i]], obj[ids[i]].data, warnings); }
        var text = JSON.stringify({ format: FORMAT_ALL, version: 1, saved: new Date().toISOString(), games: obj }, null, 2);
        fileWarning(text, warnings);
        return { text: text, warnings: warnings };
    }

    // Warnings for the games part of the everything file (the caller checks the whole file length).
    function exportWarnings() {
        var warnings = [], obj = exportObject(), ids = Object.keys(obj), i;
        for (i = 0; i < ids.length; i++) { sizeWarnings(games[ids[i]], obj[ids[i]].data, warnings); }
        return warnings;
    }

    // ---- importing -----------------------------------------------------

    // Checks one game's data object. Returns { writes: {key: value}, skipped: n }.
    function plan(g, data, mode, notes) {
        var writes = {}, skipped = 0, ks = Object.keys(data), i, k, v, n = 0, kept = 0;
        for (i = 0; i < ks.length; i++) {
            k = ks[i]; v = data[k];
            if (g.keys.indexOf(k) < 0) { continue; }   // unknown keys are dropped quietly
            if (typeof v !== 'string') { skipped++; notes.push(g.name + ': skipped ' + k + ' (not text).'); continue; }
            if (v.length > MAX_VALUE) { skipped++; notes.push(g.name + ': skipped ' + k + ' (too big).'); continue; }
            if (has.call(g.json, k)) {
                var p;
                try { p = JSON.parse(v); } catch (e) { skipped++; notes.push(g.name + ': skipped ' + k + ' (not valid JSON).'); continue; }
                if (badKey(p, 0)) { skipped++; notes.push(g.name + ': skipped ' + k + ' (keys not allowed).'); continue; }
            }
            if (mode === 'merge' && readKey(k) !== null) { skipped++; kept++; continue; }
            writes[k] = v; n++;
        }
        return { writes: writes, skipped: skipped, count: n, kept: kept };
    }

    function importJSON(text, opts) {
        opts = opts || {};
        var mode = opts.mode === 'replace' ? 'replace' : 'merge';
        var dry = !!opts.dryRun;
        var only = isArr(opts.only) ? opts.only : null;
        var res = { ok: false, errors: [], games: [], applied: 0, skipped: 0, notes: [] };
        if (typeof text !== 'string' || !text) { res.errors.push('Nothing to read.'); return res; }
        if (text.length > MAX_CHARS) { res.errors.push('That file is too big.'); return res; }
        var d;
        try { d = JSON.parse(text); } catch (e) { res.errors.push('That file is not valid JSON.'); return res; }
        if (!d || typeof d !== 'object' || Array.isArray(d) || d.version !== 1 || (d.format !== FORMAT_ONE && d.format !== FORMAT_ALL)) {
            res.errors.push('That is not a Fong game save file.'); return res;
        }
        if (badKey(d, 0)) { res.errors.push('That file has keys that are not allowed.'); return res; }

        var items = [], ids, i;   // [{id, data}]
        if (d.format === FORMAT_ONE) {
            if (typeof d.game !== 'string' || !d.data || typeof d.data !== 'object' || Array.isArray(d.data)) { res.errors.push('That save file is missing its data.'); return res; }
            items.push({ id: d.game, data: d.data });
        } else {
            if (!d.games || typeof d.games !== 'object' || Array.isArray(d.games)) { res.errors.push('That save file is missing its games.'); return res; }
            ids = Object.keys(d.games);
            for (i = 0; i < ids.length; i++) {
                var e2 = d.games[ids[i]];
                if (e2 && typeof e2 === 'object' && e2.data && typeof e2.data === 'object' && !Array.isArray(e2.data)) { items.push({ id: ids[i], data: e2.data }); }
                else { res.skipped++; res.notes.push('Skipped ' + ids[i] + ' (no data).'); }
            }
        }

        var plans = [], j, it, g, p, kept = 0;
        for (i = 0; i < items.length; i++) {
            it = items[i];
            if (only && only.indexOf(it.id) < 0) { continue; }
            if (!has.call(games, it.id)) { res.skipped++; res.notes.push('Skipped a game this arcade does not know.'); continue; }
            g = games[it.id];
            p = plan(g, it.data, mode, res.notes);
            res.skipped += p.skipped;
            kept += p.kept;
            if (p.count > 0) { plans.push({ g: g, p: p }); }
        }
        if (!plans.length) {
            if (kept > 0) { res.alreadyHave = true; res.errors.push('You already have saves here. Use Replace to load the file.'); }
            else { res.errors.push('Nothing in that file can be added to your games.'); }
            return res;
        }

        for (i = 0; i < plans.length; i++) {
            res.games.push({ id: plans[i].g.id, name: plans[i].g.name, keys: plans[i].p.count });
        }
        if (!dry) {
            // Snapshot every key about to change. If any write fails, put everything back and report nothing applied.
            var todo = [], prev = {}, ks, done = [];
            for (i = 0; i < plans.length; i++) {
                ks = Object.keys(plans[i].p.writes);
                for (j = 0; j < ks.length; j++) { todo.push([ks[j], plans[i].p.writes[ks[j]]]); prev[ks[j]] = readKey(ks[j]); }
            }
            for (i = 0; i < todo.length; i++) {
                if (writeKey(todo[i][0], todo[i][1])) { done.push(todo[i][0]); continue; }
                for (j = 0; j < done.length; j++) {
                    if (prev[done[j]] === null) { removeKey(done[j]); } else { writeKey(done[j], prev[done[j]]); }
                }
                res.ok = false; res.applied = 0; res.games = [];
                res.errors.push('Could not save (the browser blocked storage or it is full). Nothing was changed.');
                return res;
            }
            res.applied = done.length;
        }
        if (dry) { res.applied = 0; }
        res.ok = true;
        return res;
    }

    var api = {
        register: register,
        list: list,
        exportGame: exportGame,
        exportAll: exportAll,
        exportObject: exportObject,
        exportWarnings: exportWarnings,
        MAX_CHARS: MAX_CHARS,
        MAX_VALUE: MAX_VALUE
    };
    api.importJSON = importJSON;
    w.FongGameSaves = api;
})(window);
