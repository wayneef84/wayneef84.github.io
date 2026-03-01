/**
 * Hub Filters, Theme Switcher & Card Renderer
 * Catalog data lives in js/catalog.js (FONG_CATALOG).
 * Default mode: professional. Add ?mode=fun to URL for arcade theme.
 * Strict ES5 compatible.
 */

(function() {
    'use strict';

    // CATALOG data is loaded from catalog.js as window.FONG_CATALOG
    var CATALOG = window.FONG_CATALOG || [];

    // ─── THEME DETECTION ──────────────────────────────────────────────────────
    function getMode() {
        var params = (window.location.search || '').toLowerCase();
        return params.indexOf('mode=fun') !== -1 ? 'fun' : 'pro';
    }

    var MODE = getMode();

    // Apply theme attribute to <html> immediately
    document.documentElement.setAttribute('data-theme', MODE);

    // ─── FEATURED GAME ROTATION ───────────────────────────────────────────────
    function renderFeatured() {
        var section = document.getElementById('featured-section');
        if (!section) return;

        var eligible = [];
        for (var i = 0; i < CATALOG.length; i++) {
            if (CATALOG[i].featured) eligible.push(CATALOG[i]);
        }
        if (!eligible.length) return;

        var dayIndex = (new Date().getDate() - 1) % eligible.length;
        var game = eligible[dayIndex];

        var title = MODE === 'fun' ? game.funTitle : game.title;
        var desc  = MODE === 'fun' ? game.funDescription : game.description;
        var btnLabel = MODE === 'fun' ? '&#9658; PLAY NOW!' : 'Play Now';
        var sectionLabel = MODE === 'fun' ? '&#9733; TODAY\'S PICK' : 'FEATURED GAME';

        section.innerHTML =
            '<div class="featured-content">' +
                '<div class="featured-label">' + sectionLabel + '</div>' +
                '<div class="featured-icon">' + game.icon + '</div>' +
                '<h1 class="featured-title">' + title + ' <span class="featured-version">' + game.version + '</span></h1>' +
                '<p class="featured-desc">' + desc + '</p>' +
                '<a href="' + game.href + '" class="btn-primary">' + btnLabel + '</a>' +
            '</div>' +
            '<div class="featured-visual" aria-hidden="true">' +
                '<div class="featured-visual-icon">' + game.icon + '</div>' +
            '</div>';
    }

    // ─── CARD RENDERER ────────────────────────────────────────────────────────
    function _catLabel(cat) {
        var labels = { card: 'Card', arcade: 'Arcade', puzzle: 'Puzzle', edu: 'Educational', project: 'Project' };
        return labels[cat] || cat;
    }

    function _getCategoryCount(cat) {
        var count = 0;
        for (var i = 0; i < CATALOG.length; i++) {
            var g = CATALOG[i];
            if (g.theme === 'pro' && MODE === 'fun') continue;
            if (g.theme === 'fun' && MODE === 'pro') continue;
            if (cat !== 'all' && g.category !== cat) continue;
            count++;
        }
        return count;
    }

    function updateGameCount(category) {
        var el = document.getElementById('game-count');
        if (!el) return;
        var count = _getCategoryCount(category);
        el.textContent = count + ' games';
    }

    function renderCards(category) {
        var grid = document.getElementById('game-grid');
        if (!grid) return;

        grid.innerHTML = '';

        for (var i = 0; i < CATALOG.length; i++) {
            var game = CATALOG[i];

            // Theme filtering
            if (game.theme === 'pro' && MODE === 'fun') continue;
            if (game.theme === 'fun' && MODE === 'pro') continue;

            // Category filtering
            if (category !== 'all' && game.category !== category) continue;

            var title = MODE === 'fun' ? game.funTitle : game.title;
            var desc  = MODE === 'fun' ? game.funDescription : game.description;
            var tagClass = 'tag-' + game.category;
            var badgeHtml = game.isNew ? '<span class="badge-new">NEW</span>' : '';

            var card = document.createElement('a');
            card.href = game.href;
            card.className = 'game-card';
            card.setAttribute('data-category', game.category);

            card.innerHTML =
                '<div class="card-top">' +
                    '<span class="card-icon">' + game.icon + '</span>' +
                    '<span class="category-tag ' + tagClass + '">' + _catLabel(game.category) + '</span>' +
                '</div>' +
                '<div class="game-title">' + title + badgeHtml + '</div>' +
                '<p class="game-desc">' + desc + '</p>' +
                '<div class="game-meta"><span>' + game.version + '</span></div>';

            grid.appendChild(card);
        }

        updateGameCount(category);
    }

    // ─── QUICK PLAY CAROUSEL ──────────────────────────────────────────────────
    function renderCarousel() {
        var section = document.getElementById('carousel-section');
        if (!section) return;

        var cardsHtml = '';
        for (var i = 0; i < CATALOG.length; i++) {
            var game = CATALOG[i];
            if (game.theme === 'pro' && MODE === 'fun') continue;
            if (game.theme === 'fun' && MODE === 'pro') continue;
            cardsHtml +=
                '<a class="carousel-card" href="' + game.href + '">' +
                    '<div class="carousel-card-icon">' + game.icon + '</div>' +
                    '<div class="carousel-card-name">' + game.title + '</div>' +
                '</a>';
        }

        var titleLabel = MODE === 'fun' ? '&#127918; Quick Play' : 'Quick Play';

        section.innerHTML =
            '<div class="carousel-header">' +
                '<h3 class="carousel-title">' + titleLabel + '</h3>' +
                '<div class="carousel-controls">' +
                    '<button class="carousel-btn" id="carousel-prev" aria-label="Scroll left">&#8249;</button>' +
                    '<button class="carousel-btn" id="carousel-next" aria-label="Scroll right">&#8250;</button>' +
                '</div>' +
            '</div>' +
            '<div class="carousel-track" id="carousel-track">' + cardsHtml + '</div>';

        var track = document.getElementById('carousel-track');
        var prevBtn = document.getElementById('carousel-prev');
        var nextBtn = document.getElementById('carousel-next');

        if (prevBtn && track) {
            prevBtn.addEventListener('click', function() {
                if (track.scrollBy) {
                    track.scrollBy({ left: -300, behavior: 'smooth' });
                } else {
                    track.scrollLeft -= 300;
                }
            });
        }
        if (nextBtn && track) {
            nextBtn.addEventListener('click', function() {
                if (track.scrollBy) {
                    track.scrollBy({ left: 300, behavior: 'smooth' });
                } else {
                    track.scrollLeft += 300;
                }
            });
        }
    }

    // ─── MOBILE FILTER POPUP ──────────────────────────────────────────────────
    function initMobileFilter(filterBtns, currentFilter) {
        var bar = document.querySelector('.filter-bar');
        if (!bar) return;

        var LABELS = {
            all: 'All', arcade: 'Arcade', card: 'Card',
            puzzle: 'Puzzle', edu: 'Educational', project: 'Projects'
        };
        var CATEGORIES = [
            { cat: 'all',     label: 'All' },
            { cat: 'arcade',  label: 'Arcade' },
            { cat: 'card',    label: 'Card' },
            { cat: 'puzzle',  label: 'Puzzle' },
            { cat: 'edu',     label: 'Educational' },
            { cat: 'project', label: 'Projects' }
        ];

        // ── Build mobile trigger button ──
        var wrap = document.createElement('div');
        wrap.className = 'filter-mobile-trigger';
        wrap.id = 'filter-mobile-trigger';

        var currentLabel = LABELS[currentFilter] || 'All';
        var currentCount = _getCategoryCount(currentFilter);

        wrap.innerHTML =
            '<button class="filter-mobile-btn" id="filter-mobile-btn">' +
                '<span id="filter-mobile-label">' + currentLabel + ' (' + currentCount + ')</span>' +
                '<span class="filter-mobile-arrow">&#9662;</span>' +
            '</button>';

        bar.parentNode.insertBefore(wrap, bar);

        // ── Build popup overlay ──
        var optionsHtml = '';
        for (var i = 0; i < CATEGORIES.length; i++) {
            var c = CATEGORIES[i];
            var count = _getCategoryCount(c.cat);
            var activeClass = c.cat === currentFilter ? ' active' : '';
            optionsHtml +=
                '<button class="filter-popup-option' + activeClass + '" data-category="' + c.cat + '" data-label="' + c.label + '">' +
                    c.label +
                    '<span class="filter-popup-count">(' + count + ')</span>' +
                '</button>';
        }

        var overlay = document.createElement('div');
        overlay.className = 'filter-popup-overlay';
        overlay.id = 'filter-popup-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML =
            '<div class="filter-popup">' +
                '<div class="filter-popup-header">' +
                    '<span class="filter-popup-title">Filter Games</span>' +
                    '<button class="filter-popup-close" id="filter-popup-close" aria-label="Close">&#10005;</button>' +
                '</div>' +
                '<div class="filter-popup-options">' + optionsHtml + '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // ── Open / close ──
        function openPopup() {
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
        }
        function closePopup() {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
        }

        document.getElementById('filter-mobile-btn').addEventListener('click', openPopup);
        document.getElementById('filter-popup-close').addEventListener('click', closePopup);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closePopup();
        });

        // ── Option selection ──
        var optionBtns = overlay.querySelectorAll('.filter-popup-option');
        for (var j = 0; j < optionBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var cat = btn.getAttribute('data-category');
                    var label = btn.getAttribute('data-label');
                    var count = _getCategoryCount(cat);

                    // Sync desktop pill buttons
                    for (var k = 0; k < filterBtns.length; k++) {
                        filterBtns[k].classList.toggle('active', filterBtns[k].getAttribute('data-category') === cat);
                    }
                    // Sync popup options
                    for (var m = 0; m < optionBtns.length; m++) {
                        optionBtns[m].classList.toggle('active', optionBtns[m].getAttribute('data-category') === cat);
                    }

                    // Update trigger label
                    var labelEl = document.getElementById('filter-mobile-label');
                    if (labelEl) labelEl.textContent = label + ' (' + count + ')';

                    localStorage.setItem('hub_filter', cat);
                    renderCards(cat);
                    closePopup();
                });
            })(optionBtns[j]);
        }
    }

    // ─── FILTER BUTTONS ───────────────────────────────────────────────────────
    function initFilters() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var currentFilter = localStorage.getItem('hub_filter') || 'all';

        // Add game counts to each filter button label
        for (var i = 0; i < filterBtns.length; i++) {
            var cat = filterBtns[i].getAttribute('data-category');
            var label = filterBtns[i].textContent.trim();
            var count = _getCategoryCount(cat);
            filterBtns[i].innerHTML = label + '<span class="filter-count">(' + count + ')</span>';
        }

        // Set initial active state
        for (var i = 0; i < filterBtns.length; i++) {
            if (filterBtns[i].getAttribute('data-category') === currentFilter) {
                filterBtns[i].classList.add('active');
            } else {
                filterBtns[i].classList.remove('active');
            }
        }

        renderCards(currentFilter);

        // Attach click handlers (IIFE for loop closure)
        for (var j = 0; j < filterBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var cat = btn.getAttribute('data-category');
                    for (var k = 0; k < filterBtns.length; k++) {
                        filterBtns[k].classList.remove('active');
                    }
                    btn.classList.add('active');
                    localStorage.setItem('hub_filter', cat);
                    renderCards(cat);
                });
            })(filterBtns[j]);
        }

        initMobileFilter(filterBtns, currentFilter);
    }

    // ─── THEME TOGGLE LINK ────────────────────────────────────────────────────
    function renderThemeToggle() {
        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        if (MODE === 'fun') {
            toggle.href = window.location.pathname;
            toggle.textContent = 'Professional View';
        } else {
            toggle.href = window.location.pathname + '?mode=fun';
            toggle.textContent = '🎮 Fun Mode';
        }
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────
    function init() {
        renderFeatured();
        renderCarousel();
        initFilters();
        renderThemeToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
