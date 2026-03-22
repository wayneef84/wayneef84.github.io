/**
 * calc-nav.js — Inner calculator navigation bar for Calc v2
 * Renders into <div id="calc-nav"></div>
 * Strict ES5.
 */
(function () {
  'use strict';

  var PAGES = [
    { href: 'index.html',     icon: '&#9745;',  label: 'Hub' },
    { href: 'charms.html',    icon: '&#10024;', label: 'Charms' },
    { href: 'gear.html',      icon: '&#9876;&#65039;',  label: 'Chief Gear' },
    { href: 'hero-gear.html', icon: '&#128081;', label: 'Hero Gear' },
    { href: 'plan.html',      icon: '&#128203;', label: 'Plan' },
    { href: 'reference.html', icon: '&#128218;', label: 'Ref' }
  ];

  var current = (window.location.pathname.split('/').pop() || 'index.html');
  if (current === '') current = 'index.html';

  var html = '';
  for (var i = 0; i < PAGES.length; i++) {
    var p = PAGES[i];
    var active = (p.href === current) ? ' active' : '';
    html += '<a href="' + p.href + '" class="calc-nav-item' + active + '">' +
              '<span class="cni-icon">' + p.icon + '</span>' +
              '<span>' + p.label + '</span>' +
            '</a>';
  }

  var el = document.getElementById('calc-nav');
  if (el) el.innerHTML = html;
}());
