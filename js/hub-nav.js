/**
 * Hub Navigation helpers - groups, sub-groups and lookups over FONG_CATALOG.
 * Shared by index.html (js/hub-filters.js) and browse/index.html.
 * Load AFTER js/catalog.js. Strict ES5.
 */
(function() {
    'use strict';

    var CATALOG = window.FONG_CATALOG || (typeof FONG_CATALOG !== 'undefined' ? FONG_CATALOG : []);

    var GROUPS = [
        { id: 'games', icon: '&#127918;', title: 'Games', funTitle: 'GAMES',
          desc: 'Arcade, card, puzzle and learning games.' },
        { id: 'tools', icon: '&#128736;&#65039;', title: 'Tools', funTitle: 'TOOLS',
          desc: 'Utilities: markdown reader, dev tools, scanners, trackers.' },
        { id: 'wos', icon: '&#10052;&#65039;', title: 'Whiteout Survival', funTitle: 'WHITEOUT SURVIVAL',
          desc: 'WOSKY_3169 calculators and planners.' },
        { id: 'more', icon: '&#128451;&#65039;', title: 'More', funTitle: 'MORE',
          desc: 'Profile, guides, labs and archived versions.' }
    ];

    var CAT_GROUP = { card: 'games', arcade: 'games', puzzle: 'games', edu: 'games',
                      project: 'tools', wosky: 'wos' };
    var CAT_SUB = { card: 'Card Games', arcade: 'Arcade', puzzle: 'Puzzle', edu: 'Educational',
                    project: 'Utilities', wosky: 'WOSKY tools', info: 'Info', guide: 'Guides',
                    archive: 'Archive' };
    var CAT_LABEL = { card: 'Card', arcade: 'Arcade', puzzle: 'Puzzle', edu: 'Educational',
                      project: 'Tool', wosky: 'WOS', info: 'Info', guide: 'Guide', archive: 'Archive' };

    var BY_ID = {};
    for (var i = 0; i < CATALOG.length; i++) { BY_ID[CATALOG[i].id] = CATALOG[i]; }

    function groupOf(e) {
        if (e.archive) return e.group || 'more';
        return e.group || CAT_GROUP[e.category] || 'more';
    }

    function subOf(e) {
        if (e.sub) return e.sub;
        if (e.parent && BY_ID[e.parent] && BY_ID[e.parent].id !== e.id) {
            var p = BY_ID[e.parent];
            if (p.sub) return p.sub;
        }
        return CAT_SUB[e.category] || 'Other';
    }

    /** Entries in a group. opts.topLevel: skip child entries (those with a parent). */
    function itemsIn(groupId, opts) {
        var out = [];
        for (var j = 0; j < CATALOG.length; j++) {
            var e = CATALOG[j];
            if (groupOf(e) !== groupId) continue;
            if (opts && opts.topLevel && e.parent) continue;
            out.push(e);
        }
        return out;
    }

    function matches(e, q) {
        var hay = [e.id, e.title, e.funTitle, e.description, subOf(e), groupOf(e),
                   e.parent ? (BY_ID[e.parent] ? BY_ID[e.parent].title : '') : ''].join(' ').toLowerCase();
        var parts = q.toLowerCase().split(/\s+/);
        for (var k = 0; k < parts.length; k++) {
            if (parts[k] && hay.indexOf(parts[k]) === -1) return false;
        }
        return true;
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /** Card HTML. opts (optional): label (custom title), noNew (no NEW badge), plays (number, shows a play count). prefix is prepended to catalog hrefs ('' on root, '.' keeps ./ so use '../' style by replace). */
    function cardHtml(e, mode, rootPrefix, opts) {
        var title = mode === 'fun' ? (e.funTitle || e.title) : e.title;
        if (opts && typeof opts.label === 'string' && opts.label) title = opts.label;
        var desc = mode === 'fun' ? (e.funDescription || e.description) : e.description;
        var href = (rootPrefix || './') + String(e.href).replace(/^\.\//, '');
        var parent = e.parent && BY_ID[e.parent] ? '<div class="card-parent">in ' + escapeHtml(BY_ID[e.parent].title) + '</div>' : '';
        return '<a href="' + escapeHtml(href) + '" class="game-card" role="listitem" data-game-id="' + escapeHtml(e.id) + '" data-category="' + e.category + '">' +
            '<div class="card-top"><span class="card-icon">' + e.icon + '</span>' +
            '<span class="category-tag tag-' + e.category + '">' + (CAT_LABEL[e.category] || e.category) + '</span></div>' +
            '<div class="game-title">' + escapeHtml(title) + (e.isNew && !(opts && opts.noNew) ? '<span class="badge-new">NEW</span>' : '') + '</div>' +
            parent +
            '<p class="game-desc">' + escapeHtml(desc) + '</p>' +
            (opts && typeof opts.plays === 'number' ? '<div class="game-plays">' + opts.plays + (opts.plays === 1 ? ' play' : ' plays') + '</div>' : '') +
            (e.version ? '<div class="game-meta"><span>' + escapeHtml(e.version) + '</span></div>' : '') +
            '</a>';
    }

    window.FONG_NAV = {
        groups: GROUPS,
        groupOf: groupOf,
        subOf: subOf,
        itemsIn: itemsIn,
        matches: matches,
        cardHtml: cardHtml,
        escapeHtml: escapeHtml,
        byId: BY_ID,
        catalog: CATALOG
    };
})();
