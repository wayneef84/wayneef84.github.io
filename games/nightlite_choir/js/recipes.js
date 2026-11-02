/**
 * Nightlite Choir+ - recipe logic (strict ES5, no DOM). Used by js/app.js and by tests/nightlite.test.js.
 * A recipe is 2 to 5 DISTINCT ingredients (base friends or blends). Order never matters: key = sorted ids joined with '+'.
 * Two-ingredient keys are the same as in v0.4.0 ('a+b', a < b), so old saves keep working.
 * Blend sets: js/worlds/blends.js plus any window global named NightliteBlendsExtra_* (each { chars: [...] }), merged by collectBlends.
 * Rare friends: same creature, id '<id>_rare', 1 in 10 chance from a mix or an egg (never required for anything).
 */
(function (w) {
    var MIN = 2, MAX = 5, RARE_ODDS = 10, RARE_SUFFIX = '_rare', EXTRA_PREFIX = 'NightliteBlendsExtra_';

    function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

    // Old blends first, then each extra set in alphabetical order of its global name. Duplicate ids are skipped.
    function collectBlends(win) {
        var base = (win.NightliteBlends && win.NightliteBlends.chars) || [], out = [], seen = {}, names = [], k, i, j, set;
        for (i = 0; i < base.length; i++) { if (!seen[base[i].id]) { seen[base[i].id] = true; out.push(base[i]); } }
        for (k in win) { if (k.indexOf(EXTRA_PREFIX) === 0) names.push(k); }
        names.sort();
        for (i = 0; i < names.length; i++) {
            set = win[names[i]];
            if (!set || !Array.isArray(set.chars)) continue;
            for (j = 0; j < set.chars.length; j++) {
                if (set.chars[j] && set.chars[j].id && !seen[set.chars[j].id]) { seen[set.chars[j].id] = true; out.push(set.chars[j]); }
            }
        }
        if (win.NightliteBlends) win.NightliteBlends.chars = out;
        return out;
    }

    // Sorted, distinct ids joined with '+'. Skips empty entries.
    function keyOf(ids) {
        var seen = {}, list = [], i;
        for (i = 0; i < ids.length; i++) if (ids[i] && !seen[ids[i]]) { seen[ids[i]] = true; list.push(ids[i]); }
        list.sort();
        return list.join('+');
    }
    function distinct(ids) {
        var seen = {}, list = [], i;
        for (i = 0; i < ids.length; i++) if (ids[i] && !seen[ids[i]]) { seen[ids[i]] = true; list.push(ids[i]); }
        return list;
    }
    function rareId(id) { return id + RARE_SUFFIX; }
    function isRareId(id) { return typeof id === 'string' && id.length > RARE_SUFFIX.length && id.slice(-RARE_SUFFIX.length) === RARE_SUFFIX; }
    function baseId(id) { return isRareId(id) ? id.slice(0, id.length - RARE_SUFFIX.length) : id; }
    // One roll: true about 1 time in RARE_ODDS. rnd is Math.random or a seeded function. Off means never.
    function roll(rnd, on) { return !!on && rnd() < 1 / RARE_ODDS; }

    // Brighter sound for a rare friend, still C pentatonic: an octave layered on top (same pitch classes) and an added harmonic.
    function shift(seq, add) {
        var out = [], i, e;
        for (i = 0; i < seq.length; i++) {
            e = seq[i];
            if (e === null || e === undefined) out.push(null);
            else if (Array.isArray(e)) { var c = e.slice(); c[0] = e[0] + add; out.push(c); }
            else out.push(e + add);
        }
        return out;
    }
    function rareSynth(spec) {
        var o = {}, k, i, chord, has12, layers;
        for (k in spec) if (hasOwn(spec, k)) o[k] = spec[k];
        if (spec.kind === 'tone') {
            o.harm = Math.min(1, (spec.harm || 0) + 0.35);
            chord = (spec.chord || [0]).slice();
            has12 = false;
            for (i = 0; i < chord.length; i++) if (chord[i] === 12) has12 = true;
            if (!has12) chord.push(12);
            o.chord = chord;
        } else if (spec.kind === 'voice') {
            o = { kind: 'layers', layers: [spec, { kind: 'voice', amp: (spec.amp || 1) * 0.5, seq: shift(spec.seq || [], 12) }] };
        } else if (spec.kind === 'drum') {
            o.pitch = (spec.pitch || 1) * 1.25;
        } else if (spec.kind === 'layers') {
            layers = [];
            for (i = 0; i < spec.layers.length; i++) layers.push(rareSynth(spec.layers[i]));
            o = { kind: 'layers', layers: layers };
            if (spec.amp) o.amp = spec.amp;
        } else if (spec.kind === 'noise') {
            o = { kind: 'layers', layers: [spec, { kind: 'tone', wave: 'sine', harm: 0.5, decays: true, a: 0.003, d: 0.4, amp: 0.3,
                seq: [null, null, null, 96, null, null, null, null, null, 91, null, null, null, null, 93, null] }] };
        }
        return o;
    }

    // ---- model: tables built from the base choirers and the blend choirers
    function build(baseChars, blendChars) {
        var m = { byId: {}, blendById: {}, recipeByKey: {}, recipes: [], errors: [] }, i, j, ch, ok, key, ing, seen;
        for (i = 0; i < baseChars.length; i++) m.byId[baseChars[i].id] = baseChars[i];
        for (i = 0; i < blendChars.length; i++) { m.byId[blendChars[i].id] = blendChars[i]; m.blendById[blendChars[i].id] = blendChars[i]; }
        for (i = 0; i < blendChars.length; i++) {
            ch = blendChars[i]; ing = ch.blend; ok = true;
            if (!Array.isArray(ing) || ing.length < MIN || ing.length > MAX) { m.errors.push(ch.id + ': needs 2 to 5 ingredients'); continue; }
            seen = {};
            for (j = 0; j < ing.length; j++) {
                if (!m.byId[ing[j]]) { m.errors.push(ch.id + ': unknown ingredient ' + ing[j]); ok = false; }
                if (ing[j] === ch.id) { m.errors.push(ch.id + ': uses itself'); ok = false; }
                if (seen[ing[j]]) { m.errors.push(ch.id + ': repeated ingredient ' + ing[j]); ok = false; }
                seen[ing[j]] = true;
            }
            if (!ok) continue;
            key = keyOf(ing);
            if (hasOwn(m.recipeByKey, key)) { m.errors.push(ch.id + ': same ingredients as ' + m.recipeByKey[key]); continue; }
            m.recipeByKey[key] = ch.id;
            m.recipes.push({ key: key, id: ch.id, ing: distinct(ing), tier: 1 });
        }
        for (i = 0; i < m.recipes.length; i++) {
            for (j = 0; j < m.recipes[i].ing.length; j++) if (m.blendById[m.recipes[i].ing[j]]) m.recipes[i].tier = 2;
        }
        m.recipeOf = {};
        for (i = 0; i < m.recipes.length; i++) m.recipeOf[m.recipes[i].id] = m.recipes[i];

        // exact set match, order never matters. Returns a blend id or null
        m.match = function (ids) {
            var list = distinct(ids);
            if (list.length < MIN || list.length > MAX) return null;
            var k = keyOf(list);
            return hasOwn(m.recipeByKey, k) ? m.recipeByKey[k] : null;
        };
        // can the child use this friend? base friends always, blends only when owned
        m.have = function (id, owned) { var b = baseId(id); return !!m.byId[b] && (!m.blendById[b] || !!(owned && owned[b])); };
        m.makeable = function (rec, owned) {
            var i;
            for (i = 0; i < rec.ing.length; i++) if (!m.have(rec.ing[i], owned)) return false;
            return true;
        };
        // Tempo of a blend = tempo of its first listed ingredient, resolved down to a base friend.
        m.tempo = function (id, fallback) {
            var n = 0, ch = m.byId[baseId(id)];
            while (ch && ch.blend && n < 12) { ch = m.byId[ch.blend[0]]; n++; }
            return (ch && ch.bpm > 0) ? ch.bpm : (fallback || 90);
        };
        function subset(a, b) {            // every id of a is in b
            var i, set = {};
            for (i = 0; i < b.length; i++) set[b[i]] = true;
            for (i = 0; i < a.length; i++) if (!set[a[i]]) return false;
            return true;
        }
        // Gentle hint for a pick that does not match. Returns { kind:'almost', n } (n friends short, smallest n, only recipes
        // not found yet whose other ingredients are owned), { kind:'many' } or null. Never names a friend.
        m.hint = function (ids, owned, found) {
            var picks = distinct(ids), i, r, best = 0, many = false;
            if (picks.length < 2) return null;
            for (i = 0; i < m.recipes.length; i++) {
                r = m.recipes[i];
                if (r.ing.length > picks.length && subset(picks, r.ing) && m.makeable(r, owned) && !(found && found[r.key])) {
                    if (!best || r.ing.length - picks.length < best) best = r.ing.length - picks.length;
                }
                if (r.ing.length < picks.length && subset(r.ing, picks)) many = true;
            }
            if (best) return { kind: 'almost', n: best };
            if (many) return { kind: 'many' };
            return null;
        };
        // Recipes to offer. With picks: makeable recipes that contain every pick. Without: recipes whose ingredients are ALL on the stage.
        // Not-found recipes first, then fewer ingredients, then data order. At most limit (default 12).
        m.suggest = function (stage, picks, owned, found, limit) {
            var pool = [], p = distinct(picks || []), out = [], i, r, ok, id;
            var st = distinct(stage || []);
            for (i = 0; i < st.length; i++) { id = baseId(st[i]); if (m.have(id, owned)) pool.push(id); }
            pool = distinct(pool);
            for (i = 0; i < m.recipes.length; i++) {
                r = m.recipes[i];
                if (!m.makeable(r, owned)) continue;
                ok = p.length ? subset(p, r.ing) : subset(r.ing, pool);
                if (ok) out.push({ rec: r, idx: i, done: !!(found && found[r.key]) });
            }
            out.sort(function (a, b) {
                if (a.done !== b.done) return a.done ? 1 : -1;
                if (a.rec.ing.length !== b.rec.ing.length) return a.rec.ing.length - b.rec.ing.length;
                return a.idx - b.idx;
            });
            var res = [];
            for (i = 0; i < out.length && i < (limit || 12); i++) res.push(out[i].rec);
            return res;
        };
        // "Match my stage": up to 5 distinct stage friends to put in the pot. Prefers the overlap with a recipe not found yet.
        m.fromStage = function (stage, owned, found) {
            var pool = [], st = distinct(stage || []), i, j, id, r, ov, score, best = null, bestScore = 0, set = {};
            for (i = 0; i < st.length; i++) { id = baseId(st[i]); if (m.have(id, owned)) pool.push(id); }
            pool = distinct(pool);
            for (i = 0; i < pool.length; i++) set[pool[i]] = true;
            for (i = 0; i < m.recipes.length; i++) {
                r = m.recipes[i];
                if (found && found[r.key]) continue;
                if (!m.makeable(r, owned)) continue;
                ov = [];
                for (j = 0; j < r.ing.length; j++) if (set[r.ing[j]]) ov.push(r.ing[j]);
                if (ov.length < 2) continue;
                score = ov.length * 10 + (ov.length === r.ing.length ? 5 : 0);
                if (score > bestScore) { bestScore = score; best = ov; }
            }
            return best || pool.slice(0, MAX);
        };
        return m;
    }

    w.NightliteRecipes = { MIN: MIN, MAX: MAX, RARE_ODDS: RARE_ODDS, collectBlends: collectBlends, keyOf: keyOf, rareId: rareId, isRareId: isRareId,
                           baseId: baseId, roll: roll, rareSynth: rareSynth, build: build };
    if (typeof module !== 'undefined' && module.exports) module.exports = w.NightliteRecipes;
})(typeof window !== 'undefined' ? window : this);
