/**
 * WOSKY_3169 — Character Bar UI
 * Renders the persistent character selector into #wosky-char-bar on every page.
 * Strict ES5 — no const/let/arrow functions/fetch/template literals.
 *
 * Requires: character.js loaded first (window.WOSKY_CHARS)
 */

(function () {
    'use strict';

    var CHARS = window.WOSKY_CHARS;

    /* ── Render ──────────────────────────────────────────────────────────── */
    function render() {
        var bar = document.getElementById('wosky-char-bar');
        if (!bar) return;

        var chars   = CHARS.getAll();
        var activeId = CHARS.getActiveId();

        /* Build select options */
        var options = '';
        for (var i = 0; i < chars.length; i++) {
            var c = chars[i];
            var sel = c.id === activeId ? ' selected' : '';
            options += '<option value="' + c.id + '"' + sel + '>' +
                escHtml(c.name) +
                (c.playerId ? ' [' + escHtml(c.playerId) + ']' : '') +
                '</option>';
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

    /* ── Events ──────────────────────────────────────────────────────────── */
    function bindEvents() {
        var sel = document.getElementById('wosky-char-select');
        if (sel) {
            sel.addEventListener('change', function () {
                CHARS.setActive(sel.value);
            });
        }

        var btnNew = document.getElementById('wchar-new');
        if (btnNew) {
            btnNew.addEventListener('click', function () {
                var name = prompt('New character name:');
                if (!name) return;
                var pid  = prompt('Player ID (e.g. 3169-AltName):') || '';
                var c = CHARS.create(name, pid);
                CHARS.setActive(c.id);
                render();
            });
        }

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

        var btnImportBtn  = document.getElementById('wchar-import-btn');
        var inputImport   = document.getElementById('wchar-import-file');
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
                        alert('Import failed — invalid JSON.');
                    }
                };
                reader.readAsText(file);
                /* Reset so re-selecting the same file triggers change */
                inputImport.value = '';
            });
        }
    }

    /* ── Listen for character changes from other sources ─────────────────── */
    document.addEventListener('wosky:character-changed', function () {
        render();
    });

    /* ── Init ────────────────────────────────────────────────────────────── */
    function init() {
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
