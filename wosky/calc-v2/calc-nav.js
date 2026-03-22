/**
 * calc-nav.js — Inner calculator navigation bar for Calc v2
 * Features: max-width match, collapsible (persisted), confirm on navigate.
 * Strict ES5.
 */
(function () {
  'use strict';

  var SK_HIDDEN = 'wosky_v2_nav_hidden';

  var PAGES = [
    { href: 'index.html',     icon: '&#9745;',        label: 'Hub' },
    { href: 'charms.html',    icon: '&#10024;',       label: 'Chief Charms' },
    { href: 'gear.html',      icon: '&#9876;&#65039;', label: 'Chief Gear' },
    { href: 'hero-gear.html', icon: '&#128081;',      label: 'Hero Gear' },
    { href: 'plan.html',      icon: '&#128203;',      label: 'Plan' },
    { href: 'reference.html', icon: '&#128218;',      label: 'Ref' }
  ];

  var current = (window.location.pathname.split('/').pop() || 'index.html');
  if (current === '') current = 'index.html';

  var el = document.getElementById('calc-nav');
  if (!el) return;

  /* ── Build nav ─────────────────────────────────────────────────────────── */
  function buildNav(hidden) {
    var inner = '<div class="calc-nav-inner">';

    if (!hidden) {
      for (var i = 0; i < PAGES.length; i++) {
        var p = PAGES[i];
        var active = (p.href === current) ? ' active' : '';
        inner += '<a href="' + p.href + '" class="calc-nav-item' + active + '" data-label="' + p.label + '">' +
                   '<span class="cni-icon">' + p.icon + '</span>' +
                   '<span class="cni-label">' + p.label + '</span>' +
                 '</a>';
      }
    }

    inner += '<button class="calc-nav-toggle" id="calc-nav-toggle" title="' + (hidden ? 'Show nav' : 'Hide nav') + '">' +
               (hidden ? '&#9660; Nav' : '&#9650; Hide') +
             '</button>';

    inner += '</div>';
    el.innerHTML = inner;
    el.className = 'calc-v2-nav' + (hidden ? ' nav-hidden' : '');

    document.getElementById('calc-nav-toggle').addEventListener('click', function () {
      var nowHidden = el.classList.contains('nav-hidden');
      try { localStorage.setItem(SK_HIDDEN, nowHidden ? '0' : '1'); } catch (e) {}
      buildNav(!nowHidden);
    });

    /* Confirm before navigating away */
    var links = el.querySelectorAll('.calc-nav-item:not(.active)');
    for (var li = 0; li < links.length; li++) {
      links[li].addEventListener('click', function (e) {
        var dest = this.getAttribute('data-label');
        if (!window.confirm('Navigate to ' + dest + '?')) {
          e.preventDefault();
        }
      });
    }
  }

  var savedHidden = false;
  try { savedHidden = localStorage.getItem(SK_HIDDEN) === '1'; } catch (e) {}
  buildNav(savedHidden);

}());
