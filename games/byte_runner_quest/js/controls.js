/*
 * Byte Runner Quest: controls, layout and settings. Strict ES5, no dependencies.
 * Owns the page around the canvas: pointer buttons, settings storage, fit-to-screen layout.
 * game.js hands it a few hooks in BRQ_UI.init(). Loaded before game.js.
 */
var BRQ_UI = (function () {
'use strict';

var KEY = 'fong.byteRunnerQuest.settings.v1';
var DEF = { rotate: false, fill: false, auto: false, autoDir: 1, left: false, vibrate: false, lives: 3 };
var cfg = { rotate: DEF.rotate, fill: DEF.fill, auto: DEF.auto, autoDir: DEF.autoDir, left: DEF.left, vibrate: DEF.vibrate, lives: DEF.lives };
var doc = document, de = doc.documentElement;
var stage = doc.getElementById('stage'), play = doc.getElementById('play'), scr = doc.getElementById('screen');
var cv = doc.getElementById('game'), touch = doc.getElementById('touch');
var TOUCH = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
var H = null;                         /* hooks from game.js */
var rotNow = false, releasers = [];

/* ---------- settings (localStorage, always in try/catch; lives: 1, 3, 5 or 0 = unlimited) ---------- */
(function () {
  try {
    var raw = window.localStorage && localStorage.getItem(KEY), o;
    if (raw) {
      o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        cfg.rotate = o.rotate === true; cfg.fill = o.fill === true; cfg.auto = o.auto === true;
        cfg.autoDir = o.autoDir === -1 ? -1 : 1; cfg.left = o.left === true; cfg.vibrate = o.vibrate === true;
        cfg.lives = (o.lives === 1 || o.lives === 3 || o.lives === 5 || o.lives === 0) ? o.lives : 3;
      }
    }
  } catch (e) { }
})();
function store() { try { if (window.localStorage) localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { } }

function cls(el, name, on) {
  if (!el || !el.classList) return;
  if (on) el.classList.add(name); else el.classList.remove(name);
}

/* ---------- layout: pin to the viewport on touch devices, size the canvas to fit ---------- */
function layout() {
  var vw = window.innerWidth, vh = window.innerHeight, fill, sw, sh, land, st = stage.style, pw, ph, availH, c;
  rotNow = false;
  fill = TOUCH;
  sw = vw; sh = vh;
  cls(stage, 'rot', rotNow);
  cls(stage, 'fill', fill);
  de.className = fill ? 'fill' : '';
  if (fill) {
    st.width = sw + 'px'; st.height = sh + 'px';
    st.transformOrigin = '0 0'; st.webkitTransformOrigin = '0 0';
    st.transform = 'none'; st.webkitTransform = 'none';
  } else {
    st.width = ''; st.height = ''; st.transform = ''; st.webkitTransform = '';
  }
  land = fill && sw > sh * 1.1;
  cls(stage, 'land', land);
  cls(stage, 'narrow', sw < 520);
  if (fill) {
    pw = play.clientWidth; ph = play.clientHeight;
    availH = land ? ph : ph - touch.offsetHeight;
    c = Math.min(pw - 16, (availH - 16) * 320 / 176);
    if (c < 120) c = 120;
    scr.style.width = Math.floor(c + 8) + 'px';
  } else scr.style.width = '';
}

/* screen point to canvas pixel (320x176). The rotated stage maps screen y to canvas x and screen x to canvas y. */
function canvasPoint(cx, cy) {
  var r = cv.getBoundingClientRect(), w = cv.width, h = cv.height;
  if (rotNow) return { x: (cy - r.top) * w / r.height, y: (r.right - cx) * h / r.width };
  return { x: (cx - r.left) * w / r.width, y: (cy - r.top) * h / r.height };
}

/* ---------- pointer helpers (pointer events, with touch and mouse fallback for very old browsers) ---------- */
function ptr(e) {
  var t = e.changedTouches && e.changedTouches[0];
  return t ? { x: t.clientX, y: t.clientY, id: t.identifier } : { x: e.clientX, y: e.clientY, id: e.pointerId };
}
function bindPointer(el, down, up) {
  if (window.PointerEvent) {
    if (down) el.addEventListener('pointerdown', function (e) { down(ptr(e), e); });
    if (up) {
      el.addEventListener('pointerup', function (e) { up(ptr(e), e); });
      el.addEventListener('pointercancel', function (e) { up(ptr(e), e); });
      el.addEventListener('lostpointercapture', function (e) { up(ptr(e), e); });
    }
  } else {
    if (down) { el.addEventListener('touchstart', function (e) { down(ptr(e), e); }); el.addEventListener('mousedown', function (e) { down(ptr(e), e); }); }
    if (up) {
      el.addEventListener('touchend', function (e) { up(ptr(e), e); }); el.addEventListener('touchcancel', function (e) { up(ptr(e), e); });
      el.addEventListener('mouseup', function (e) { up(ptr(e), e); });
    }
  }
}
/* a button that holds a key while a finger is on it. Several buttons can be held at once (multi-touch). */
function bindHold(btn, onDown, onUp) {
  var held = false, pid = null;
  function release() { if (!held) return; held = false; pid = null; cls(btn, 'down', false); if (onUp) onUp(); }
  bindPointer(btn, function (p, e) {
    if (e.preventDefault) e.preventDefault();
    if (held) return;
    held = true; pid = p.id; cls(btn, 'down', true);
    try { if (btn.setPointerCapture && e.pointerId !== undefined) btn.setPointerCapture(e.pointerId); } catch (x) { }
    onDown();
  }, function (p, e) { if (p.id === pid) release(); });
  btn.addEventListener('mouseleave', function () { if (!window.PointerEvent) release(); });
  releasers.push(release);
}
function releaseAll() { for (var i = 0; i < releasers.length; i++) releasers[i](); }

/* ---------- start ---------- */
function init(hooks) {
  var btns, i, k;
  H = hooks;
  cls(touch, 'on', TOUCH);
  btns = touch.getElementsByTagName('button');
  for (i = 0; i < btns.length; i++) (function (b) {
    k = b.getAttribute('data-k');
    if (k) bindHold(b, function () { H.press(k); }, function () { H.release(k); });
  })(btns[i]);
  bindPointer(cv, function (p, e) {
    if (e.preventDefault) e.preventDefault();
    H.tap(canvasPoint(p.x, p.y));
  });
  /* no zoom, no long-press menu, no text selection */
  doc.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  doc.addEventListener('gesturestart', function (e) { e.preventDefault(); });
  doc.addEventListener('selectstart', function (e) { e.preventDefault(); });
  doc.addEventListener('touchmove', function (e) { if (e.cancelable && !inside(e.target, 'panel')) e.preventDefault(); }, { passive: false });
  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', function () { layout(); setTimeout(layout, 250); });
  window.addEventListener('blur', releaseAll);
  layout();
  setTimeout(layout, 300);
}
function inside(el, cn) {
  while (el && el !== doc) { if (el.className && typeof el.className === 'string' && (' ' + el.className + ' ').indexOf(' ' + cn + ' ') >= 0) return true; el = el.parentNode; }
  return false;
}

return { cfg: cfg, init: init, layout: layout, store: store, canvasPoint: canvasPoint, releaseAll: releaseAll, touch: TOUCH };
})();
