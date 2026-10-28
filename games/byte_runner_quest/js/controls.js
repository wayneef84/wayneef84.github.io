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
var rotNow = false, releasers = [], noteTimer = 0;

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
  rotNow = cfg.rotate && vh > vw;      /* only rotate a portrait screen; a phone that turns by itself needs no help */
  fill = TOUCH || !!fsEl() || cfg.fill || rotNow;
  sw = rotNow ? vh : vw; sh = rotNow ? vw : vh;
  cls(stage, 'rot', rotNow);
  cls(stage, 'immersive', !!fsEl() || cfg.fill);
  cls(stage, 'fill', fill);
  de.className = fill ? 'fill' : '';
  if (fill) {
    st.width = sw + 'px'; st.height = sh + 'px';
    st.transformOrigin = '0 0'; st.webkitTransformOrigin = '0 0';
    c = rotNow ? 'translate(' + vw + 'px,0) rotate(90deg)' : 'none';
    st.transform = c; st.webkitTransform = c;
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
  refresh();
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


/* ---------- fullscreen (Fullscreen API with webkit prefix, else a fixed "fill screen" mode) ---------- */
function fsEl() { return doc.fullscreenElement || doc.webkitFullscreenElement || null; }
function fsSupported() { return !!((de.requestFullscreen || de.webkitRequestFullscreen) && doc.fullscreenEnabled !== false); }
function showNote(text, ms) {
  var n = doc.getElementById('note');
  if (!n) return;
  n.textContent = text; cls(n, 'show', !!text);
  clearTimeout(noteTimer); noteTimer = setTimeout(function () { cls(n, 'show', false); }, ms || 4500);
}
function enterFill() {
  cfg.fill = true; store(); layout();
  showNote('Fill screen is on. Tap the fullscreen button again, or press Esc, to leave.');
}
function leaveFill() { cfg.fill = false; store(); layout(); showNote('', 1); }
function exitFS() {
  try { (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc); } catch (e) { }
}
function toggleFull() {
  var req, p;
  if (fsEl()) { exitFS(); return; }
  if (cfg.fill) { leaveFill(); return; }
  if (!fsSupported()) { enterFill(); return; }
  try {
    req = de.requestFullscreen || de.webkitRequestFullscreen;
    p = req.call(de);
    if (p && p.then) p.then(null, function () { enterFill(); });
  } catch (e) { enterFill(); }
}
/* landscape lock only works in fullscreen and not on every device, so failure is ignored */
function lockLandscape(on) {
  try {
    var o = window.screen && window.screen.orientation, p;
    if (!o) return;
    if (on && o.lock) { p = o.lock('landscape'); if (p && p.catch) p.catch(function () { }); }
    else if (!on && o.unlock) o.unlock();
  } catch (e) { }
}
function onFsChange() { lockLandscape(!!fsEl()); layout(); setTimeout(layout, 250); }

function toggleRotate() { cfg.rotate = !cfg.rotate; store(); layout(); }

function doAct(name) {
  if (name === 'full') toggleFull();
  else if (name === 'rot') toggleRotate();
}
var curDir = 1;
function setDir(d) {
  var b = doc.getElementById('turnbtn');
  curDir = d;
  if (b) b.innerHTML = 'TURN<small>' + (d > 0 ? '&#9654;' : '&#9664;') + '&#xFE0E;</small>';
}
function refresh() {
  cls(stage, 'auto', cfg.auto); cls(stage, 'lefty', cfg.left);
  var els = doc.querySelectorAll('[data-act]'), i, a, on;
  for (i = 0; i < els.length; i++) {
    a = els[i].getAttribute('data-act');
    on = a === 'full' ? (!!fsEl() || cfg.fill) : (a === 'rot' ? cfg.rotate : false);
    cls(els[i], 'on', on);
    els[i].setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

/* ---------- start ---------- */
function init(hooks) {
  var btns, i;
  H = hooks;
  cls(touch, 'on', TOUCH);
  btns = touch.getElementsByTagName('button');
  for (i = 0; i < btns.length; i++) (function (b) {
    var k = b.getAttribute('data-k');
    if (k) bindHold(b, function () { H.press(k); }, function () { H.release(k); });
  })(btns[i]);
  var tb = doc.getElementById('turnbtn');
  if (tb) bindHold(tb, function () { H.turn(); }, null);
  /* auto-run: a tap anywhere outside the buttons and panels is a jump (held finger = held jump) */
  var jumpPid = null;
  bindPointer(stage, function (p, e) {
    if (!cfg.auto || jumpPid !== null || H.getState() !== 'play' || inside(e.target, 'overlay') || isControl(e.target)) return;
    jumpPid = p.id; H.press('J');
  }, null);
  function jumpUp(p) { if (jumpPid !== null && p.id === jumpPid) { jumpPid = null; H.release('J'); } }
  if (window.PointerEvent) { doc.addEventListener('pointerup', function (e) { jumpUp(ptr(e)); }); doc.addEventListener('pointercancel', function (e) { jumpUp(ptr(e)); }); }
  else { doc.addEventListener('touchend', function (e) { jumpUp(ptr(e)); }); doc.addEventListener('touchcancel', function (e) { jumpUp(ptr(e)); }); doc.addEventListener('mouseup', function (e) { jumpUp(ptr(e)); }); }
  releasers.push(function () { jumpUp({ id: jumpPid }); });
  bindPointer(cv, function (p, e) {
    if (e.preventDefault) e.preventDefault();
    H.tap(canvasPoint(p.x, p.y));
  });
  btns = doc.querySelectorAll('[data-act]');
  for (i = 0; i < btns.length; i++) (function (b) {
    b.addEventListener('click', function () { doAct(b.getAttribute('data-act')); });
  })(btns[i]);
  doc.addEventListener('fullscreenchange', onFsChange);
  doc.addEventListener('webkitfullscreenchange', onFsChange);
  /* Esc leaves the fill-screen fallback (real fullscreen handles Esc itself) */
  doc.addEventListener('keydown', function (e) {
    if (e.keyCode === 27 && cfg.fill && !fsEl()) { e.preventDefault(); e.stopImmediatePropagation(); leaveFill(); }
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
function isControl(el) {
  while (el && el !== doc) { if (el.tagName === 'BUTTON' || el.tagName === 'A') return true; el = el.parentNode; }
  return false;
}
function inside(el, cn) {
  while (el && el !== doc) { if (el.className && typeof el.className === 'string' && (' ' + el.className + ' ').indexOf(' ' + cn + ' ') >= 0) return true; el = el.parentNode; }
  return false;
}

return { setDir: setDir, dir: function () { return curDir; }, cfg: cfg, init: init, layout: layout, store: store, canvasPoint: canvasPoint, releaseAll: releaseAll, touch: TOUCH };
})();
