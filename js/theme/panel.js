/**
 * Customize panel for the homepage. A full-screen sheet on phones and a side
 * sheet on wide screens. Tabs: Look, Colors, Names, Groups, Behavior, Advanced,
 * Share. Every edit goes through FongTheme.setConfig, so the validator checks
 * it and the page updates live. All text is written with textContent, never
 * innerHTML. Load last on index.html. Strict ES5. No network.
 */
(function (w) {
    'use strict';

    var doc = w.document;
    var T = w.FongTheme, V = w.FongThemeValidate, Core = w.FongThemeCore, P = w.FongPalettes;
    var opener = doc.getElementById('theme-open');
    if (!T || !V || !Core || !P || !opener) return;

    var has = Object.prototype.hasOwnProperty;
    var CATALOG = w.FONG_CATALOG || [];
    var NAV = w.FONG_NAV || { groupOf: function () { return 'more'; } };
    var SITE_TITLE = 'F.O.N.G. ARCADE';
    var GROUP_TITLES = { pinned: 'Pinned', games: 'Games', tools: 'Tools', wos: 'Whiteout Survival', more: 'More' };
    var HUB_CARDS = [
        ['hub-arcade', 'Arcade'], ['hub-cards', 'Card Games'], ['hub-puzzle', 'Puzzle'], ['hub-edu', 'Educational'],
        ['hub-games-all', 'All games'], ['hub-projects', 'Projects & Tools'], ['hub-tools-all', 'All tools'],
        ['hub-wosky', 'WOSKY_3169'], ['hub-wos-all', 'All WOS tools'], ['hub-more', 'Guides, Labs and Archive'],
        ['hub-profile', 'Developer Profile']
    ];
    var TABS = [['look', 'Look'], ['colors', 'Colors'], ['names', 'Names'], ['groups', 'Groups'],
        ['behavior', 'Behavior'], ['advanced', 'Advanced'], ['share', 'Share']];
    var TOKEN_LABELS = [['bg', 'Background'], ['surface', 'Cards'], ['text', 'Text'], ['dim', 'Small text'],
        ['accent', 'Accent'], ['accent2', 'Accent 2'], ['border', 'Borders'], ['games', 'Games group'],
        ['tools', 'Tools group'], ['wos', 'Whiteout Survival group'], ['more', 'More group']];
    var FONT_CHOICES = [['', 'Skin default'], ['system', 'System'], ['inter', 'Inter'], ['grotesk', 'Space Grotesk'],
        ['mono', 'Space Mono'], ['serif', 'Serif (system)'],
        ['fraunces', 'Fraunces'], ['courier-prime', 'Courier Prime'], ['barlow-condensed', 'Barlow Condensed'],
        ['plex-mono', 'IBM Plex Mono'], ['nunito', 'Nunito'], ['silkscreen', 'Silkscreen'], ['caveat', 'Caveat']];
    var BEHAVIOR_LABELS = [
        ['sortMostPlayed', 'Sort most played first', 'In Pinned and your own groups, the games you play most come first.'],
        ['showPlayCounts', 'Show play counts', 'Adds "12 plays" to cards in Pinned, your groups and search.'],
        ['showNewBadges', 'Show NEW badges', 'The NEW tag on cards and the New strip.'],
        ['showJustAdded', 'Show the Just added cards', 'The big cards at the top of the page.']
    ];

    var panel = null, body = null, tablist = null, live = null, backdrop = null, resetBtn = null;
    var activeTab = 'look';
    var isOpen = false, resetArmed = 0, resetTimer = null;
    var pending = null;            // import preview result
    var nameFilter = '', idFilter = '';
    var lastFocusKey = '';

    // ---- small DOM helpers (text only, never innerHTML) -------------------
    function el(tag, props, kids) {
        var n = doc.createElement(tag), k;
        if (props) {
            for (k in props) {
                if (!has.call(props, k)) continue;
                if (k === 'text') n.textContent = props[k];
                else if (k === 'cls') n.className = props[k];
                else if (k === 'on') { for (var ev in props.on) if (has.call(props.on, ev)) n.addEventListener(ev, props.on[ev]); }
                else n.setAttribute(k, props[k]);
            }
        }
        if (kids) for (var i = 0; i < kids.length; i++) if (kids[i]) n.appendChild(kids[i]);
        return n;
    }
    function say(msg) { if (live) live.textContent = msg; }
    function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
    function cfg() { return T.getConfig(); }
    function commit(mut) {
        var c = cfg();
        mut(c);
        var r = T.setConfig(c);
        if (!r.ok) say('That change was not accepted.');
        return r;
    }
    function titleOf(e) { return e.title || e.id; }
    function entryFor(id) { for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i]; return null; }
    function slug(s) {
        var o = String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/g, '');
        return o || 'group';
    }
    function heading(text) { return el('h3', { cls: 'tp-h', text: text }); }
    function note(text) { return el('p', { cls: 'tp-note', text: text }); }
    function btn(text, fn, extra) {
        var props = { type: 'button', cls: 'tp-btn' + (extra && extra.cls ? ' ' + extra.cls : ''), text: text, on: { click: fn } };
        if (extra && extra.label) props['aria-label'] = extra.label;
        if (extra && extra.fk) props['data-fk'] = extra.fk;
        if (extra && extra.disabled) props.disabled = 'disabled';
        return el('button', props);
    }
    function seg(name, choices, current, onPick, fkBase) {
        var wrap = el('div', { cls: 'tp-seg', role: 'radiogroup', 'aria-label': name });
        for (var i = 0; i < choices.length; i++) {
            (function (ch) {
                var on = ch[0] === current;
                wrap.appendChild(el('button', {
                    type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false', cls: 'tp-seg-b' + (on ? ' on' : ''),
                    text: ch[1], 'data-fk': fkBase + ch[0], on: { click: function () { onPick(ch[0]); } }
                }));
            })(choices[i]);
        }
        return wrap;
    }

    function copyText(text, okMsg) {
        function fallback() {
            try {
                var ta = el('textarea', { 'aria-hidden': 'true', cls: 'tp-offscreen' });
                ta.value = text;
                doc.body.appendChild(ta);
                ta.select();
                var ok = doc.execCommand && doc.execCommand('copy');
                doc.body.removeChild(ta);
                say(ok ? okMsg : 'Copy is blocked here. Select the text and copy it by hand.');
            } catch (e) { say('Copy is blocked here. Select the text and copy it by hand.'); }
        }
        try {
            if (w.navigator.clipboard && w.navigator.clipboard.writeText && w.isSecureContext) {
                w.navigator.clipboard.writeText(text).then(function () { say(okMsg); }, fallback);
            } else fallback();
        } catch (e) { fallback(); }
    }

    // ---- LOOK -------------------------------------------------------------
    function samePalette(a, b) {
        for (var i = 0; i < Core.TOKENS.length; i++) if (a[Core.TOKENS[i]] !== b[Core.TOKENS[i]]) return false;
        return true;
    }
    function renderLook() {
        var c = cfg(), box = el('div');
        box.appendChild(heading('Skin'));
        var skins = T.listSkins(), sg = el('div', { cls: 'tp-skins', role: 'radiogroup', 'aria-label': 'Skin' });
        for (var i = 0; i < skins.length; i++) {
            (function (s) {
                var on = c.skin === s.id;
                sg.appendChild(el('button', {
                    type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false', cls: 'tp-skin' + (on ? ' on' : ''),
                    'data-fk': 'skin-' + s.id, on: { click: function () { commit(function (x) { x.skin = s.id; }); renderTab(); say(s.name + ' skin on.'); } }
                }, [el('strong', { text: s.name }), el('span', { text: s.blurb })]));
            })(skins[i]);
        }
        box.appendChild(sg);

        box.appendChild(heading('Palette'));
        var eff = T.effectivePalette(c);
        var pg = el('div', { cls: 'tp-pals', role: 'radiogroup', 'aria-label': 'Palette' });
        var pals = T.listPalettes();
        for (i = 0; i < pals.length; i++) {
            (function (p) {
                var on = samePalette(eff, p.tokens);
                var sw = el('span', { cls: 'tp-sw', 'aria-hidden': 'true' });
                var keys = ['bg', 'surface', 'text', 'accent', 'accent2'];
                for (var j = 0; j < keys.length; j++) {
                    var s1 = el('i'); s1.style.background = p.tokens[keys[j]]; sw.appendChild(s1);
                }
                pg.appendChild(el('button', {
                    type: 'button', role: 'radio', 'aria-checked': on ? 'true' : 'false', cls: 'tp-pal' + (on ? ' on' : ''),
                    'data-fk': 'pal-' + p.id, on: { click: function () { pickPalette(p); } }
                }, [sw, el('span', { text: p.name })]));
            })(pals[i]);
        }
        box.appendChild(pg);
        box.appendChild(note('Picking a palette sets every color. Fine-tune single colors on the Colors tab.'));

        box.appendChild(heading('Shape and type'));
        var sh = c.shape;
        box.appendChild(rangeRow('Corner radius', 'radius', 0, 24, sh.radius, 'px'));
        box.appendChild(rangeRow('Border width', 'border', 0, 4, sh.border, 'px'));
        box.appendChild(field('Shadow', seg('Shadow', [['', 'Skin default'], ['none', 'None'], ['soft', 'Soft'], ['hard', 'Hard']], sh.shadow || '', function (v) { setShape('shadow', v); }, 'shadow-')));
        box.appendChild(field('Density', seg('Density', [['', 'Skin default'], ['compact', 'Compact'], ['cozy', 'Cozy'], ['roomy', 'Roomy']], sh.density || '', function (v) { setShape('density', v); }, 'density-')));
        box.appendChild(field('Heading font', fontSelect('display', c.fonts.display || '')));
        box.appendChild(field('Body font', fontSelect('ui', c.fonts.ui || '')));
        box.appendChild(field('Background pattern', selectEl('Background pattern', [['', 'Skin default'], ['none', 'None'], ['dots', 'Dots'], ['grid', 'Grid'], ['paper', 'Paper lines'], ['stripes', 'Stripes']], sh.background || '', function (v) { setShape('background', v); }, 'bgpat')));
        return box;
    }
    function field(label, control) {
        return el('div', { cls: 'tp-field' }, [el('div', { cls: 'tp-label', text: label }), control]);
    }
    function selectEl(label, choices, current, onPick, fk) {
        var s = el('select', { cls: 'tp-select', 'aria-label': label, 'data-fk': fk });
        for (var i = 0; i < choices.length; i++) {
            var o = el('option', { value: choices[i][0], text: choices[i][1] });
            if (choices[i][0] === current) o.selected = true;
            s.appendChild(o);
        }
        s.addEventListener('change', function () { onPick(s.value); });
        return s;
    }
    function fontSelect(which, current) {
        return selectEl(which === 'display' ? 'Heading font' : 'Body font', FONT_CHOICES, current, function (v) {
            commit(function (x) { if (v) x.fonts[which] = v; else delete x.fonts[which]; });
        }, 'font-' + which);
    }
    function setShape(key, v) {
        commit(function (x) { if (v === '' || v === null) delete x.shape[key]; else x.shape[key] = v; });
        renderTab();
    }
    function rangeRow(label, key, min, max, current, unit) {
        var isSet = typeof current === 'number';
        var out = el('output', { cls: 'tp-out', text: isSet ? current + unit : 'default' });
        var input = el('input', { type: 'range', min: String(min), max: String(max), step: '1', value: String(isSet ? current : min), 'aria-label': label, 'data-fk': 'range-' + key, cls: 'tp-range' });
        input.addEventListener('input', function () {
            var n = parseInt(input.value, 10);
            out.textContent = n + unit;
            commit(function (x) { x.shape[key] = n; });
            resetB.disabled = false;
        });
        var resetB = btn('Default', function () { setShape(key, null); }, { label: 'Use the skin default for ' + label, disabled: !isSet });
        return field(label, el('div', { cls: 'tp-rangewrap' }, [input, out, resetB]));
    }
    function pickPalette(p) {
        commit(function (x) {
            var def = P.skinDefaults(x.skin);
            x.palette = samePalette(def, p.tokens) ? {} : P.copyTokens(p.tokens);
        });
        renderTab();
        say(p.name + ' palette on.');
    }

    // ---- COLORS -----------------------------------------------------------
    function renderColors() {
        var box = el('div'), c = cfg();
        var report = el('div', { cls: 'tp-contrast', role: 'status' });
        box.appendChild(report);
        function paintReport() {
            clear(report);
            var rows = T.contrastReport(cfg()), bad = 0;
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].ok) continue;
                bad++;
                report.appendChild(el('p', { cls: 'tp-warn', text: rows[i].label + ' is ' + rows[i].ratio + ' to 1. It needs 4.5 to 1 to be easy to read.' }));
            }
            if (bad) {
                report.className = 'tp-contrast bad';
                report.appendChild(btn('Fix for me', function () {
                    var fixed = T.fixContrast(cfg());
                    T.setConfig(fixed);
                    renderTab();
                    say('Text colors adjusted so they are easy to read.');
                }, { fk: 'fix-contrast' }));
            } else {
                report.className = 'tp-contrast good';
                report.appendChild(el('p', { text: 'All text colors are easy to read (4.5 to 1 or better).' }));
            }
        }
        paintReport();
        var eff = T.effectivePalette(c);
        for (var i = 0; i < TOKEN_LABELS.length; i++) {
            (function (tok, label) {
                var overridden = has.call(c.palette, tok);
                var color = el('input', { type: 'color', value: eff[tok], cls: 'tp-color', 'aria-label': label + ' color picker', 'data-fk': 'col-' + tok });
                var hex = el('input', { type: 'text', value: eff[tok], cls: 'tp-hex', maxlength: '7', spellcheck: 'false', autocomplete: 'off', 'aria-label': label + ' hex value', 'data-fk': 'hex-' + tok });
                var rst = btn('Reset', function () { commit(function (x) { delete x.palette[tok]; }); renderTab(); }, { label: 'Reset ' + label + ' color', disabled: !overridden });
                function set(v) {
                    commit(function (x) { x.palette[tok] = v; });
                    rst.disabled = false;
                    paintReport();
                }
                color.addEventListener('input', function () { hex.value = color.value; hex.removeAttribute('aria-invalid'); set(color.value); });
                hex.addEventListener('input', function () {
                    var v = hex.value.replace(/^\s+|\s+$/g, '');
                    if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(v)) v = '#' + v;
                    var n = Core.norm(v);
                    if (n) { hex.removeAttribute('aria-invalid'); color.value = n; set(n); }
                    else hex.setAttribute('aria-invalid', 'true');
                });
                hex.addEventListener('blur', function () { if (hex.getAttribute('aria-invalid')) { hex.value = color.value; hex.removeAttribute('aria-invalid'); } });
                box.appendChild(el('div', { cls: 'tp-colorrow' }, [el('span', { cls: 'tp-label', text: label }), color, hex, rst]));
            })(TOKEN_LABELS[i][0], TOKEN_LABELS[i][1]);
        }
        box.appendChild(note('Type a color like #1B7F9E or #1b9. Only hex colors are accepted.'));
        return box;
    }

    // ---- NAMES ------------------------------------------------------------
    function nameRow(id, defaultTitle, current, fkBase) {
        var input = el('input', { type: 'text', maxlength: '40', cls: 'tp-text', value: current || '', placeholder: defaultTitle, 'aria-label': 'Name for ' + defaultTitle, 'data-fk': 'name-' + id, autocomplete: 'off' });
        function save() {
            var v = V.cleanName(input.value);
            commit(function (x) { if (v && v !== defaultTitle) x.labels[id] = v; else delete x.labels[id]; });
            var now = cfg().labels;
            input.value = has.call(now, id) ? now[id] : '';
            rst.disabled = !has.call(now, id);
            say(has.call(now, id) ? 'Renamed.' : 'Name reset.');
        }
        var rst = btn('Reset name', function () { input.value = ''; save(); }, { label: 'Reset name for ' + defaultTitle, disabled: !current });
        input.addEventListener('change', save);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); save(); } });
        return el('div', { cls: 'tp-namerow' }, [el('div', { cls: 'tp-label', text: defaultTitle }), input, rst]);
    }
    function renderNames() {
        var c = cfg(), box = el('div');
        box.appendChild(heading('Site title'));
        box.appendChild(nameRow('site-title', SITE_TITLE, has.call(c.labels, 'site-title') ? c.labels['site-title'] : '', ''));
        box.appendChild(note('Names can be up to 40 characters. The Home link keeps working whatever you call it.'));
        box.appendChild(heading('Groups'));
        var gids = ['pinned', 'games', 'tools', 'wos', 'more'], i;
        for (i = 0; i < gids.length; i++) box.appendChild(nameRow(gids[i], GROUP_TITLES[gids[i]], has.call(c.labels, gids[i]) ? c.labels[gids[i]] : ''));
        if (c.groups.length) box.appendChild(note('Your own groups are renamed on the Groups tab.'));
        box.appendChild(heading('Cards and apps'));
        var search = el('input', { type: 'search', cls: 'tp-text', value: nameFilter, placeholder: 'Search by name or id', 'aria-label': 'Search cards', 'data-fk': 'name-search', autocomplete: 'off' });
        var list = el('div', { cls: 'tp-list' });
        function paint() {
            clear(list);
            var q = nameFilter.toLowerCase(), shown = 0, cur = cfg().labels, j;
            for (j = 0; j < HUB_CARDS.length; j++) {
                if (q && (HUB_CARDS[j][1] + ' ' + HUB_CARDS[j][0]).toLowerCase().indexOf(q) === -1) continue;
                list.appendChild(nameRow(HUB_CARDS[j][0], HUB_CARDS[j][1], has.call(cur, HUB_CARDS[j][0]) ? cur[HUB_CARDS[j][0]] : '')); shown++;
            }
            for (j = 0; j < CATALOG.length; j++) {
                var e = CATALOG[j];
                if (q && (e.title + ' ' + e.id).toLowerCase().indexOf(q) === -1) continue;
                list.appendChild(nameRow(e.id, titleOf(e), has.call(cur, e.id) ? cur[e.id] : '')); shown++;
            }
            if (!shown) list.appendChild(note('Nothing matches.'));
        }
        search.addEventListener('input', function () { nameFilter = search.value; paint(); });
        box.appendChild(search);
        paint();
        box.appendChild(list);
        return box;
    }

    // ---- GROUPS -----------------------------------------------------------
    function orderList(c) {
        var defaults = [], i;
        if (c.pinned.length) defaults.push('pinned');
        defaults = defaults.concat(['games', 'tools', 'wos', 'more']);
        for (i = 0; i < c.groups.length; i++) defaults.push(c.groups[i].id);
        var out = [], seen = {};
        for (i = 0; i < c.order.length; i++) if (defaults.indexOf(c.order[i]) !== -1 && !has.call(seen, c.order[i])) { seen[c.order[i]] = 1; out.push(c.order[i]); }
        for (i = 0; i < defaults.length; i++) if (!has.call(seen, defaults[i])) { seen[defaults[i]] = 1; out.push(defaults[i]); }
        return out;
    }
    function groupTitle(c, id) {
        if (has.call(c.labels, id)) return c.labels[id];
        if (has.call(GROUP_TITLES, id)) return GROUP_TITLES[id];
        for (var i = 0; i < c.groups.length; i++) if (c.groups[i].id === id) return c.groups[i].label;
        return id;
    }
    function toggleIn(list, id, on, max) {
        var at = list.indexOf(id);
        if (on && at === -1) { if (list.length >= max) return false; list.push(id); }
        if (!on && at !== -1) list.splice(at, 1);
        return true;
    }
    function moveItem(list, from, to) {
        if (from < 0 || to < 0 || to >= list.length) return;
        var x = list.splice(from, 1)[0];
        list.splice(to, 0, x);
    }
    // Move by id so a stale button can never move the wrong row
    function moveId(list, id, delta) { var at = list.indexOf(id); moveItem(list, at, at + delta); }
    function newGroup(label) {
        var base = slug(label), id = base, n = 1;
        var ids = {}; for (var i = 0; i < CATALOG.length; i++) ids[CATALOG[i].id] = true;
        var c = cfg();
        function taken(x) {
            if (V.RESERVED.indexOf(x) !== -1 || has.call(ids, x) || x.indexOf('hub-') === 0) return true;
            for (var k = 0; k < c.groups.length; k++) if (c.groups[k].id === x) return true;
            return false;
        }
        while (taken(id)) { n++; id = base.slice(0, 24 - String(n).length - 1) + '-' + n; }
        if (c.groups.length >= V.LIMITS.groups) { say('You can have up to 12 groups of your own.'); return; }
        commit(function (x) { x.groups.push({ id: id, label: V.cleanName(label) || id, items: [] }); });
        renderTab();
        say('Group created.');
    }
    function renderGroups() {
        var c = cfg(), box = el('div'), i, order = orderList(c);

        box.appendChild(heading('Order and visibility'));
        var ol = el('ol', { cls: 'tp-order' });
        for (i = 0; i < order.length; i++) {
            (function (id, idx) {
                var t = groupTitle(c, id), hidden = c.hidden.indexOf(id) !== -1;
                var hide = el('input', { type: 'checkbox', 'aria-label': 'Hide group ' + t, 'data-fk': 'hidegrp-' + id });
                hide.checked = hidden;
                hide.addEventListener('change', function () { commit(function (x) { toggleIn(x.hidden, id, hide.checked, V.LIMITS.hidden); }); say(hide.checked ? 'Group hidden.' : 'Group shown.'); });
                ol.appendChild(el('li', { cls: 'tp-orderrow' }, [
                    el('span', { cls: 'tp-label', text: t }),
                    btn('Up', function () { var o = orderList(cfg()); moveId(o, id, -1); commit(function (x) { x.order = o; }); renderTab(); }, { label: 'Move ' + t + ' up', disabled: idx === 0, fk: 'up-' + id }),
                    btn('Down', function () { var o = orderList(cfg()); moveId(o, id, 1); commit(function (x) { x.order = o; }); renderTab(); }, { label: 'Move ' + t + ' down', disabled: idx === order.length - 1, fk: 'down-' + id }),
                    el('label', { cls: 'tp-check' }, [hide, el('span', { text: 'Hide' })])
                ]));
            })(order[i], i);
        }
        box.appendChild(ol);
        box.appendChild(note('The Pinned group shows once you pin something. Hidden things are still found by search.'));

        box.appendChild(heading('Your groups'));
        var nameIn = el('input', { type: 'text', maxlength: '40', cls: 'tp-text', placeholder: 'New group name', 'aria-label': 'New group name', 'data-fk': 'newgroup-name', autocomplete: 'off' });
        var addBtn = btn('Create group', function () { if (V.cleanName(nameIn.value)) newGroup(nameIn.value); else say('Type a name first.'); }, { fk: 'newgroup-btn' });
        nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
        box.appendChild(el('div', { cls: 'tp-inline' }, [nameIn, addBtn]));
        if (!c.groups.length) box.appendChild(note('No groups yet. Make one, then add apps by id. Find ids in the browser below.'));
        for (i = 0; i < c.groups.length; i++) box.appendChild(groupEditor(c.groups[i], i));

        box.appendChild(heading('Pinned (' + c.pinned.length + ' of 12)'));
        if (!c.pinned.length) box.appendChild(note('Use the Pin buttons below to put favorites at the top.'));
        for (i = 0; i < c.pinned.length; i++) {
            (function (id, idx) {
                var e = entryFor(id);
                box.appendChild(el('div', { cls: 'tp-itemrow' }, [
                    el('span', { cls: 'tp-label', text: e ? titleOf(e) : id }),
                    btn('Up', function () { commit(function (x) { moveId(x.pinned, id, -1); }); renderTab(); }, { label: 'Move up', disabled: idx === 0 }),
                    btn('Down', function () { commit(function (x) { moveId(x.pinned, id, 1); }); renderTab(); }, { label: 'Move down', disabled: idx === c.pinned.length - 1 }),
                    btn('Unpin', function () { commit(function (x) { toggleIn(x.pinned, id, false, 12); }); renderTab(); }, { label: 'Unpin ' + (e ? titleOf(e) : id) })
                ]));
            })(c.pinned[i], i);
        }

        box.appendChild(heading('ID browser'));
        box.appendChild(note('Every app has an id. Copy it, or use Pin, Hide and Add.'));
        var search = el('input', { type: 'search', cls: 'tp-text', value: idFilter, placeholder: 'Search ids and names', 'aria-label': 'Search the ID browser', 'data-fk': 'id-search', autocomplete: 'off' });
        var list = el('div', { cls: 'tp-list' });
        function paint() {
            clear(list);
            var q = idFilter.toLowerCase(), cur = cfg(), n = 0;
            for (var j = 0; j < CATALOG.length; j++) {
                (function (e) {
                    if (q && (e.id + ' ' + e.title).toLowerCase().indexOf(q) === -1) return;
                    n++;
                    var pinOn = cur.pinned.indexOf(e.id) !== -1, hidOn = cur.hidden.indexOf(e.id) !== -1;
                    var pin = el('input', { type: 'checkbox', 'aria-label': 'Pin ' + titleOf(e), 'data-fk': 'pin-' + e.id });
                    pin.checked = pinOn;
                    pin.addEventListener('change', function () {
                        var ok = true;
                        commit(function (x) { ok = toggleIn(x.pinned, e.id, pin.checked, 12); });
                        if (!ok) { pin.checked = false; say('You can pin up to 12.'); } else { say(pin.checked ? 'Pinned.' : 'Unpinned.'); renderTab(); }
                    });
                    var hid = el('input', { type: 'checkbox', 'aria-label': 'Hide ' + titleOf(e) });
                    hid.checked = hidOn;
                    hid.addEventListener('change', function () { commit(function (x) { toggleIn(x.hidden, e.id, hid.checked, V.LIMITS.hidden); }); say(hid.checked ? 'Hidden.' : 'Shown.'); });
                    var controls = [
                        btn('Copy id', function () { copyText(e.id, 'Copied ' + e.id); }, { label: 'Copy id ' + e.id }),
                        el('label', { cls: 'tp-check' }, [pin, el('span', { text: 'Pin' })]),
                        el('label', { cls: 'tp-check' }, [hid, el('span', { text: 'Hide' })])
                    ];
                    if (cur.groups.length) {
                        var opts = [['', 'Add to...']];
                        for (var g = 0; g < cur.groups.length; g++) opts.push([cur.groups[g].id, cur.groups[g].label]);
                        var sel = selectEl('Add ' + titleOf(e) + ' to a group', opts, '', function (gid) {
                            if (!gid) return;
                            var added = false;
                            commit(function (x) {
                                for (var q2 = 0; q2 < x.groups.length; q2++) if (x.groups[q2].id === gid && x.groups[q2].items.indexOf(e.id) === -1 && x.groups[q2].items.length < V.LIMITS.itemsPerGroup) { x.groups[q2].items.push(e.id); added = true; }
                            });
                            say(added ? 'Added to the group.' : 'Already there or the group is full.');
                            sel.value = '';
                            renderTabKeep();
                        }, '');
                        controls.push(sel);
                    }
                    list.appendChild(el('div', { cls: 'tp-idrow' }, [
                        el('div', { cls: 'tp-idtitle' }, [el('strong', { text: titleOf(e) }), el('code', { text: e.id }), el('span', { cls: 'tp-dim', text: GROUP_TITLES[NAV.groupOf(e)] || '' })]),
                        el('div', { cls: 'tp-idctl' }, controls)
                    ]));
                })(CATALOG[j]);
            }
            if (!n) list.appendChild(note('Nothing matches.'));
        }
        search.addEventListener('input', function () { idFilter = search.value; paint(); });
        box.appendChild(search);
        paint();
        box.appendChild(list);
        return box;
    }
    function groupEditor(g, idx) {
        var c = cfg(), box = el('div', { cls: 'tp-group' });
        var label = el('input', { type: 'text', maxlength: '40', cls: 'tp-text', value: g.label, 'aria-label': 'Group name', 'data-fk': 'glabel-' + g.id, autocomplete: 'off' });
        label.addEventListener('change', function () {
            var v = V.cleanName(label.value);
            if (!v) { label.value = g.label; return; }
            commit(function (x) { x.groups[idx].label = v; delete x.labels[g.id]; });
            say('Group renamed.');
        });
        box.appendChild(el('div', { cls: 'tp-inline' }, [label, el('code', { text: g.id }),
            btn('Delete group', function () {
                commit(function (x) { x.groups.splice(idx, 1); toggleIn(x.order, g.id, false, 99); toggleIn(x.hidden, g.id, false, 99); delete x.labels[g.id]; });
                renderTab(); say('Group deleted.');
            }, { label: 'Delete group ' + g.label })]));
        for (var i = 0; i < g.items.length; i++) {
            (function (id, k) {
                var e = entryFor(id);
                box.appendChild(el('div', { cls: 'tp-itemrow' }, [
                    el('span', { cls: 'tp-label', text: e ? titleOf(e) : id }),
                    btn('Up', function () { commit(function (x) { moveId(x.groups[idx].items, id, -1); }); renderTabKeep(); }, { label: 'Move up', disabled: k === 0 }),
                    btn('Down', function () { commit(function (x) { moveId(x.groups[idx].items, id, 1); }); renderTabKeep(); }, { label: 'Move down', disabled: k === g.items.length - 1 }),
                    btn('Remove', function () { commit(function (x) { var at = x.groups[idx].items.indexOf(id); if (at !== -1) x.groups[idx].items.splice(at, 1); }); renderTabKeep(); }, { label: 'Remove ' + (e ? titleOf(e) : id) })
                ]));
            })(g.items[i], i);
        }
        var ids = el('input', { type: 'text', cls: 'tp-text', placeholder: 'Add ids, like memory-match sudoku', 'aria-label': 'Add ids to ' + g.label, 'data-fk': 'addids-' + g.id, autocomplete: 'off' });
        function addIds() {
            var parts = ids.value.split(/[\s,;]+/), bad = [], good = 0, full = false;
            commit(function (x) {
                for (var p = 0; p < parts.length; p++) {
                    if (!parts[p]) continue;
                    if (!entryFor(parts[p])) { bad.push(parts[p].slice(0, 30)); continue; }
                    if (x.groups[idx].items.indexOf(parts[p]) !== -1) continue;
                    if (x.groups[idx].items.length >= V.LIMITS.itemsPerGroup) { full = true; continue; }
                    x.groups[idx].items.push(parts[p]); good++;
                }
            });
            say(good + ' added.' + (bad.length ? ' Unknown ids: ' + bad.join(', ') + '.' : '') + (full ? ' The group is full (40).' : ''));
            ids.value = '';
            renderTabKeep();
        }
        ids.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addIds(); } });
        box.appendChild(el('div', { cls: 'tp-inline' }, [ids, btn('Add', addIds, { label: 'Add ids to ' + g.label })]));
        return box;
    }

    // ---- BEHAVIOR / ADVANCED ---------------------------------------------
    function renderBehavior() {
        var c = cfg(), box = el('div');
        box.appendChild(heading('Behavior'));
        for (var i = 0; i < BEHAVIOR_LABELS.length; i++) {
            (function (key, label, help) {
                var cb = el('input', { type: 'checkbox', 'data-fk': 'beh-' + key });
                cb.checked = !!c.behaviors[key];
                cb.addEventListener('change', function () { commit(function (x) { x.behaviors[key] = cb.checked; }); say(label + (cb.checked ? ' on.' : ' off.')); });
                box.appendChild(el('label', { cls: 'tp-switch' }, [cb, el('span', {}, [el('strong', { text: label }), el('small', { text: help })])]));
            })(BEHAVIOR_LABELS[i][0], BEHAVIOR_LABELS[i][1], BEHAVIOR_LABELS[i][2]);
        }
        box.appendChild(heading('Motion'));
        box.appendChild(seg('Motion', [['full', 'Full'], ['reduced', 'Reduced'], ['off', 'Off']], c.motion, function (v) { commit(function (x) { x.motion = v; }); renderTab(); }, 'motion-'));
        box.appendChild(note('Skins other than Classic also follow your device setting "reduce motion".'));
        return box;
    }
    function renderAdvanced() {
        var box = el('div');
        box.appendChild(heading('Advanced'));
        box.appendChild(el('p', { cls: 'tp-big', text: 'Custom CSS and scripts: coming later.' }));
        box.appendChild(note('If a theme file has "css" or "js" fields they are ignored and removed.'));
        box.appendChild(heading('Recovery links'));
        box.appendChild(note('If a theme ever makes the page hard to use, open the page with one of these ends on the address:'));
        box.appendChild(el('p', {}, [el('code', { text: '?theme=default' }), doc.createTextNode(' skips your saved theme for one visit and offers to reset it.')]));
        box.appendChild(el('p', {}, [el('code', { text: '?safe=1' }), doc.createTextNode(' does the same and also keeps custom code off.')]));
        return box;
    }

    // ---- SHARE ------------------------------------------------------------
    function fileName(c) { return (c.name ? slug(c.name) : 'fong-theme') + '.json'; }
    function download(name, text) {
        try {
            var blob = new w.Blob([text], { type: 'application/json' });
            var url = w.URL.createObjectURL(blob);
            var a = el('a', { href: url, download: name, cls: 'tp-offscreen' });
            doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
            w.setTimeout(function () { w.URL.revokeObjectURL(url); }, 1500);
            say('Theme file downloaded.');
        } catch (e) { say('Download is blocked here. Use Copy instead.'); }
    }
    function summary(c) {
        var parts = [], pal = 0, k;
        for (k in c.palette) if (has.call(c.palette, k)) pal++;
        parts.push('Skin: ' + c.skin);
        parts.push(pal + ' custom color' + (pal === 1 ? '' : 's'));
        parts.push(Object.keys(c.labels).length + ' renamed');
        parts.push(c.groups.length + ' group' + (c.groups.length === 1 ? '' : 's'));
        parts.push(c.hidden.length + ' hidden');
        parts.push(c.pinned.length + ' pinned');
        return parts.join(', ');
    }
    function renderPreview(host) {
        clear(host);
        if (!pending) return;
        var r = pending, lines = V.reportLines(r.report), i;
        host.appendChild(heading('Preview'));
        if (!r.ok) {
            host.appendChild(el('p', { cls: 'tp-warn', text: 'This file cannot be used.' }));
        } else {
            host.appendChild(el('p', { text: (r.config.name ? 'Theme "' + r.config.name + '". ' : '') + summary(r.config) + '.' }));
        }
        if (lines.length) {
            var ul = el('ul', { cls: 'tp-report' });
            for (i = 0; i < lines.length && i < 40; i++) ul.appendChild(el('li', { text: lines[i] }));
            if (lines.length > 40) ul.appendChild(el('li', { text: 'and ' + (lines.length - 40) + ' more.' }));
            host.appendChild(ul);
        } else host.appendChild(note('Nothing was removed.'));
        var row = el('div', { cls: 'tp-inline' });
        if (r.ok) row.appendChild(btn('Apply this theme', function () {
            var res = T.setConfig(r.config);
            pending = null;
            say(res.ok ? 'Theme applied.' : 'Could not apply.');
            renderTab();
        }, { cls: 'tp-primary', fk: 'apply-import' }));
        row.appendChild(btn('Cancel', function () { pending = null; renderPreview(host); say('Import cancelled.'); }));
        host.appendChild(row);
    }
    function renderShare() {
        var c = cfg(), box = el('div');
        var previewHost = el('div', { cls: 'tp-preview', 'aria-live': 'polite' });
        box.appendChild(heading('Your theme'));
        var nm = el('input', { type: 'text', maxlength: '40', cls: 'tp-text', value: c.name, placeholder: 'Theme name', 'aria-label': 'Theme name', 'data-fk': 'theme-name', autocomplete: 'off' });
        nm.addEventListener('change', function () { var v = V.cleanName(nm.value); commit(function (x) { x.name = v; }); nm.value = v; });
        box.appendChild(nm);
        box.appendChild(heading('Export'));
        box.appendChild(el('div', { cls: 'tp-inline' }, [
            btn('Download file', function () { var cur = cfg(); download(fileName(cur), T.exportJSON()); }, { fk: 'export-file' }),
            btn('Copy to clipboard', function () { copyText(T.exportJSON(), 'Theme copied.'); }, { fk: 'export-copy' })
        ]));
        box.appendChild(heading('Import'));
        box.appendChild(note('You see a preview first. Nothing changes until you tap Apply.'));
        var file = el('input', { type: 'file', accept: '.json,application/json', cls: 'tp-file', 'aria-label': 'Choose a theme file', 'data-fk': 'import-file' });
        file.addEventListener('change', function () {
            var f = file.files && file.files[0];
            if (!f) return;
            if (f.size > V.LIMITS.fileBytes) { pending = { ok: false, config: null, report: { errors: ['File is too big (limit is 64 KB).'], warnings: [], dropped: [], notes: [] } }; renderPreview(previewHost); return; }
            var fr = new w.FileReader();
            fr.onload = function () { pending = T.importJSON(String(fr.result)); renderPreview(previewHost); say('Preview ready.'); };
            fr.onerror = function () { say('Could not read that file.'); };
            fr.readAsText(f);
        });
        box.appendChild(file);
        var ta = el('textarea', { cls: 'tp-area', rows: '6', placeholder: 'Or paste theme JSON here', 'aria-label': 'Paste theme JSON', spellcheck: 'false', 'data-fk': 'import-text' });
        box.appendChild(ta);
        box.appendChild(btn('Preview pasted theme', function () { pending = T.importJSON(ta.value); renderPreview(previewHost); say('Preview ready.'); }, { fk: 'import-preview' }));
        box.appendChild(previewHost);
        renderPreview(previewHost);
        box.appendChild(heading('Reset'));
        box.appendChild(note('The Reset to default button at the top of this panel is always there.'));
        return box;
    }

    // ---- shell ------------------------------------------------------------
    var RENDER = { look: renderLook, colors: renderColors, names: renderNames, groups: renderGroups, behavior: renderBehavior, advanced: renderAdvanced, share: renderShare };

    function renderTab() {
        if (!body) return;
        var focused = doc.activeElement && doc.activeElement.getAttribute ? doc.activeElement.getAttribute('data-fk') : '';
        var top = body.scrollTop;
        clear(body);
        body.appendChild(RENDER[activeTab]());
        body.setAttribute('aria-labelledby', 'tp-tab-' + activeTab);
        body.scrollTop = top;
        var want = focused || lastFocusKey;
        if (want && panel.contains(doc.activeElement) !== false) {
            var cand = body.querySelectorAll('[data-fk]');
            for (var i = 0; i < cand.length; i++) if (cand[i].getAttribute('data-fk') === want && !cand[i].disabled) { cand[i].focus(); break; }
        }
        lastFocusKey = '';
    }
    function renderTabKeep() { renderTab(); }

    function selectTab(id, focusTab) {
        activeTab = id;
        var tabs = tablist.querySelectorAll('[role="tab"]');
        for (var i = 0; i < tabs.length; i++) {
            var on = tabs[i].getAttribute('data-tab') === id;
            tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
            tabs[i].tabIndex = on ? 0 : -1;
            if (on && focusTab) tabs[i].focus();
        }
        lastFocusKey = '';
        renderTab();
    }

    function build() {
        backdrop = el('div', { cls: 'tp-backdrop', id: 'theme-backdrop' });
        backdrop.addEventListener('click', close);
        panel = el('div', { id: 'theme-panel', cls: 'theme-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tp-title' });
        resetBtn = btn('Reset to default', onReset, { cls: 'tp-reset', fk: 'reset' });
        var peek = btn('Peek', function () {
            var on = panel.className.indexOf('tp-peek') === -1;
            panel.className = 'theme-panel' + (on ? ' tp-peek' : '');
            peek.setAttribute('aria-pressed', on ? 'true' : 'false');
            say(on ? 'Panel folded. Tap Peek again to open it.' : 'Panel open.');
        }, { cls: 'tp-peekbtn', label: 'Peek at the page behind the panel' });
        peek.setAttribute('aria-pressed', 'false');
        var head = el('div', { cls: 'tp-head' }, [
            el('h2', { id: 'tp-title', text: 'Customize' }),
            btn('\u2715', close, { cls: 'tp-close', label: 'Close the customize panel', fk: 'close' }),
            el('div', { cls: 'tp-headrow' }, [resetBtn, peek])
        ]);
        tablist = el('div', { cls: 'tp-tabs', role: 'tablist', 'aria-label': 'Customize sections' });
        for (var i = 0; i < TABS.length; i++) {
            tablist.appendChild(el('button', { type: 'button', role: 'tab', id: 'tp-tab-' + TABS[i][0], 'data-tab': TABS[i][0], cls: 'tp-tab', text: TABS[i][1], 'aria-selected': 'false', tabindex: '-1', 'aria-controls': 'tp-body' }));
        }
        tablist.addEventListener('click', function (e) { var t = e.target; if (t && t.getAttribute && t.getAttribute('data-tab')) selectTab(t.getAttribute('data-tab'), false); });
        tablist.addEventListener('keydown', function (e) {
            var ids = [], i2, cur = -1;
            for (i2 = 0; i2 < TABS.length; i2++) { ids.push(TABS[i2][0]); if (TABS[i2][0] === activeTab) cur = i2; }
            var next = -1;
            if (e.key === 'ArrowRight') next = (cur + 1) % ids.length;
            else if (e.key === 'ArrowLeft') next = (cur + ids.length - 1) % ids.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = ids.length - 1;
            if (next >= 0) { e.preventDefault(); selectTab(ids[next], true); }
        });
        body = el('div', { cls: 'tp-body', id: 'tp-body', role: 'tabpanel', tabindex: '0' });
        live = el('div', { cls: 'tp-live', role: 'status', 'aria-live': 'polite' });
        panel.appendChild(head);
        panel.appendChild(tablist);
        panel.appendChild(body);
        panel.appendChild(live);
        panel.addEventListener('keydown', onKey);
        backdrop.hidden = true;
        panel.hidden = true;
        doc.body.appendChild(backdrop);
        doc.body.appendChild(panel);
    }

    function onReset() {
        if (!resetArmed) {
            resetArmed = 1;
            resetBtn.textContent = 'Tap again to reset';
            say('Tap Reset to default again to confirm.');
            resetTimer = w.setTimeout(disarm, 4000);
            return;
        }
        disarm();
        T.reset();
        pending = null; nameFilter = ''; idFilter = '';
        renderTab();
        say('Everything is back to the default.');
    }
    function disarm() {
        resetArmed = 0;
        if (resetTimer) { w.clearTimeout(resetTimer); resetTimer = null; }
        if (resetBtn) resetBtn.textContent = 'Reset to default';
    }

    function focusables() {
        var all = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]'), out = [];
        for (var i = 0; i < all.length; i++) {
            var n = all[i];
            if (n.disabled || n.tabIndex < 0 || n.getAttribute('aria-hidden') === 'true') continue;
            if (n.offsetWidth === 0 && n.offsetHeight === 0 && n !== doc.activeElement) continue;
            out.push(n);
        }
        return out;
    }
    function onKey(e) {
        if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
        if (e.key !== 'Tab') return;
        var f = focusables();
        if (!f.length) { e.preventDefault(); return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (doc.activeElement === first || !panel.contains(doc.activeElement))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (doc.activeElement === last || !panel.contains(doc.activeElement))) { e.preventDefault(); first.focus(); }
    }
    // Keep focus inside while open (for example after a click on the page behind)
    doc.addEventListener('focusin', function (e) {
        if (isOpen && panel && !panel.contains(e.target)) { var f = focusables(); if (f.length) f[0].focus(); }
    });

    var hiddenSiblings = [];
    function setBackground(on) {
        var kids = doc.body.children, i;
        if (on) {
            hiddenSiblings = [];
            for (i = 0; i < kids.length; i++) {
                if (kids[i] === panel || kids[i] === backdrop) continue;
                if (kids[i].getAttribute('aria-hidden') !== 'true') { kids[i].setAttribute('aria-hidden', 'true'); hiddenSiblings.push(kids[i]); }
            }
        } else {
            for (i = 0; i < hiddenSiblings.length; i++) hiddenSiblings[i].removeAttribute('aria-hidden');
            hiddenSiblings = [];
        }
    }

    function open() {
        if (!panel) build();
        if (isOpen) return;
        isOpen = true;
        panel.className = 'theme-panel';
        backdrop.hidden = false; panel.hidden = false;
        doc.documentElement.className += (doc.documentElement.className ? ' ' : '') + 'theme-panel-open';
        setBackground(true);
        selectTab(activeTab, false);
        opener.setAttribute('aria-expanded', 'true');
        var t = tablist.querySelector('[aria-selected="true"]');
        if (t) t.focus();
        say('');
    }
    function close() {
        if (!isOpen) return;
        isOpen = false;
        disarm();
        backdrop.hidden = true; panel.hidden = true;
        doc.documentElement.className = doc.documentElement.className.replace(/(^| )theme-panel-open( |$)/g, ' ').replace(/^ +| +$/g, '');
        setBackground(false);
        opener.setAttribute('aria-expanded', 'false');
        try { opener.focus(); } catch (e) { /* ignore */ }
    }

    opener.addEventListener('click', open);
    w.FongThemePanel = { open: open, close: close };
})(window);
