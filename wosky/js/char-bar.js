/**
 * WOSKY_3169 — Character Bar + Theme Switcher
 * Renders the persistent character selector and theme switcher on every page.
 * Strict ES5 — no const/let/arrow functions/fetch/template literals.
 *
 * Requires: character.js loaded first (window.WOSKY_CHARS)
 *
 * Theme localStorage key: wosky_theme
 *   ""      = Dark Red (default)
 *   "ice"   = Dark Ice (blue)
 *   "fire"  = Dark Fire (amber)
 *   "sky"   = Sky (light blue + white)
 *   "light" = Light (clean white)
 */

(function () {
    'use strict';

    var CHARS = window.WOSKY_CHARS;
    var THEME_KEY = 'wosky_theme';

    /* ── Theme Init (runs immediately to avoid flash) ─────────────────────── */
    var THEMES = [
        { key: '',      label: '\uD83D\uDD34 Dark Red', title: 'Dark Red'  },
        { key: 'ice',   label: '\uD83D\uDD35 Ice',      title: 'Dark Ice'  },
        { key: 'fire',  label: '\uD83D\uDFE1 Fire',     title: 'Dark Fire' },
        { key: 'sky',   label: '\uD83D\uDCA7 Sky',      title: 'Sky'       },
        { key: 'light', label: '\u26AA Light',           title: 'Light'     }
    ];

    function applyTheme(key) {
        document.documentElement.setAttribute('data-theme', key || '');
        try { localStorage.setItem(THEME_KEY, key || ''); } catch (e) {}
    }

    function getStoredTheme() {
        try { return localStorage.getItem(THEME_KEY) || ''; } catch (e) { return ''; }
    }

    /* Apply stored theme immediately */
    applyTheme(getStoredTheme());

    /* ── Render Char Bar ──────────────────────────────────────────────────── */
    function render() {
        var bar = document.getElementById('wosky-char-bar');
        if (!bar) return;

        var chars    = CHARS.getAll();
        var activeId = CHARS.getActiveId();
        var curTheme = getStoredTheme();

        /* Build select options */
        var options = '';
        for (var i = 0; i < chars.length; i++) {
            var c   = chars[i];
            var sel = c.id === activeId ? ' selected' : '';
            options += '<option value="' + c.id + '"' + sel + '>' +
                escHtml(c.name) +
                (c.playerId ? ' [' + escHtml(c.playerId) + ']' : '') +
                '</option>';
        }

        /* Build theme buttons */
        var themeBtns = '';
        for (var t = 0; t < THEMES.length; t++) {
            var th      = THEMES[t];
            var active  = (th.key === curTheme) ? ' active' : '';
            themeBtns +=
                '<button class="w-theme-btn' + active + '"' +
                ' data-theme="' + th.key + '"' +
                ' title="' + th.title + ' theme"' +
                ' aria-label="' + th.title + ' theme"' +
                '></button>';
        }

        bar.innerHTML =
            '<div class="char-bar-inner">' +
                '<span class="char-bar-label">&#9650; Character</span>' +
                '<select class="char-bar-select" id="wosky-char-select">' +
                    options +
                '</select>' +
                '<div class="char-bar-actions">' +
                    '<button class="wbtn wbtn-sm" id="wchar-new"   title="New Character">+ New</button>' +
                    '<button class="wbtn wbtn-sm wbtn-outline" id="wchar-export" title="Export all characters as JSON">&#8595; Export</button>' +
                    '<button class="wbtn wbtn-sm wbtn-outline" id="wchar-import-btn" title="Import characters from JSON">&#8593; Import</button>' +
                '</div>' +
                '<div class="char-bar-themes">' +
                    '<span class="char-bar-themes-label">&#127912;</span>' +
                    themeBtns +
                '</div>' +
                '<input type="file" id="wchar-import-file" accept=".json" style="display:none">' +
            '</div>';

        bindEvents();
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ── Events ───────────────────────────────────────────────────────────── */
    function bindEvents() {
        /* Character select */
        var sel = document.getElementById('wosky-char-select');
        if (sel) {
            sel.addEventListener('change', function () {
                CHARS.setActive(sel.value);
            });
        }

        /* New character */
        var btnNew = document.getElementById('wchar-new');
        if (btnNew) {
            btnNew.addEventListener('click', function () {
                var name = prompt('New character name:');
                if (!name) return;
                var pid = prompt('Player ID (e.g. 3169-AltName):') || '';
                var c = CHARS.create(name, pid);
                CHARS.setActive(c.id);
                render();
            });
        }

        /* Export */
        var btnExport = document.getElementById('wchar-export');
        if (btnExport) {
            btnExport.addEventListener('click', function () {
                var json = CHARS.exportAll();
                var blob = new Blob([json], { type: 'application/json' });
                var url  = URL.createObjectURL(blob);
                var a    = document.createElement('a');
                a.href     = url;
                a.download = 'wosky_characters_' + Date.now() + '.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        }

        /* Import */
        var btnImportBtn = document.getElementById('wchar-import-btn');
        var inputImport  = document.getElementById('wchar-import-file');
        if (btnImportBtn && inputImport) {
            btnImportBtn.addEventListener('click', function () {
                inputImport.click();
            });
            inputImport.addEventListener('change', function () {
                var file = inputImport.files && inputImport.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var ok = CHARS.importAll(e.target.result);
                    if (ok) {
                        render();
                        if (typeof window.woskyOnCharacterChanged === 'function') {
                            window.woskyOnCharacterChanged();
                        }
                    } else {
                        alert('Import failed \u2014 invalid JSON.');
                    }
                };
                reader.readAsText(file);
                inputImport.value = '';
            });
        }

        /* Theme buttons */
        var barEl     = document.getElementById('wosky-char-bar');
        var themeBtns = barEl ? barEl.querySelectorAll('.w-theme-btn') : [];
        if (themeBtns && themeBtns.length) {
            for (var i = 0; i < themeBtns.length; i++) {
                (function (btn) {
                    btn.addEventListener('click', function () {
                        var key = btn.getAttribute('data-theme') || '';
                        applyTheme(key);
                        /* Update active state on all buttons without full re-render */
                        var all = barEl.querySelectorAll('.w-theme-btn');
                        for (var j = 0; j < all.length; j++) {
                            var bk = all[j].getAttribute('data-theme') || '';
                            if (bk === key) {
                                all[j].className = 'w-theme-btn active';
                            } else {
                                all[j].className = 'w-theme-btn';
                            }
                        }
                    });
                }(themeBtns[i]));
            }
        }
    }

    /* ── Listen for character changes from other sources ─────────────────── */
    document.addEventListener('wosky:character-changed', function () {
        render();
    });

    /* ── Init ─────────────────────────────────────────────────────────────── */
    function init() {
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
