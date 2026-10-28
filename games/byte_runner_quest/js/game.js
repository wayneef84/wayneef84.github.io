/*
 * Byte Runner Quest v1.1.0. Strict ES5 (see GROUND_RULES.md, Rule 2).
 * Screens: title (attract demo) > level select > play > pause / clear / run over.
 */
(function () {
'use strict';

/* ================= constants ================= */
var W = 320, H = 176, T = 16, ROWS = 11;
var GRAV = 0.22, MAXF = 4.6, MAXV = 2.0;
var JUMP = -4.8, JUMP_CUT = -2.2, SPRING_V = -7.2;
var J_FULL = -4.8, J_MID = -4.1, J_HOP = -3.5;
var SAVE_KEY = 'fong.byteRunnerQuest.v1';
var cv = document.getElementById('game');
var g = cv.getContext('2d');
g.imageSmoothingEnabled = false;
var LV = window.BRQ_LEVELS;
var NLEV = LV.LEVELS.length;

/* ================= helpers ================= */
function hsh(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function now() { return window.performance && performance.now ? performance.now() : Date.now(); }
function fmtTime(frames) {
  var s = frames / 60, m = Math.floor(s / 60), r = s - m * 60, whole = Math.floor(r), tenth = Math.floor((r - whole) * 10);
  return m + ':' + (whole < 10 ? '0' : '') + whole + '.' + tenth;
}

/* ================= themes ================= */
var THEMES = [
  { id: 'dusk', name: 'DUSK CIRCUIT', sky: ['#140b2e','#1f0f42','#331457','#4c1a69','#6c2073','#93306f','#bb4a68','#e2705f'],
    far: '#2a1747', lit: '#ffcf6b', hill: '#22183f', hillTop: '#3a2a63',
    gnd: '#2b2a4a', gndD: '#211f3b', edge: '#5ef2ff', edgeD: '#2d8fa0', grid: '#3d3b66',
    crate: '#f0a33a', crateD: '#8a4b12', crateL: '#ffd27a', plat: '#3d3b66', liq: '#a32ee0', liqHi: '#f0a8ff', stars: true },
  { id: 'glacier', name: 'GLACIER GRID', sky: ['#050f24','#08193a','#0d2550','#133466','#1a457b','#24598f','#336fa2','#4a88b3'],
    far: '#0c2140', lit: '#9ff3ff', hill: '#0f2d4d', hillTop: '#1d4a73',
    gnd: '#cfe6f3', gndD: '#a9cbe0', edge: '#ffffff', edgeD: '#7fb3d1', grid: '#9cc3dc',
    crate: '#b48cff', crateD: '#4e3391', crateL: '#e6d8ff', plat: '#4a88b3', liq: '#1b4f8a', liqHi: '#9ff3ff', aurora: true, ice: true },
  { id: 'ember', name: 'EMBER CORE', sky: ['#1a0608','#2b0a0c','#43100f','#5e1a12','#7d2a14','#a03e16','#c45a1a','#e57f24'],
    far: '#2a0c0c', lit: '#ffb347', hill: '#2a0e10', hillTop: '#4a1a18',
    gnd: '#3a2422', gndD: '#2a1918', edge: '#ff8a3d', edgeD: '#a3461c', grid: '#4e3330',
    crate: '#3fc1b0', crateD: '#1c5f57', crateL: '#b6fff4', plat: '#5e1a12', liq: '#ff5a1f', liqHi: '#ffd447' },
  { id: 'jade', name: 'JADE GARDEN', sky: ['#04140f','#062019','#082c22','#0b3a2c','#0f4a36','#155c41','#1d704c','#2a8758'],
    far: '#06231a', lit: '#c8ff7a', hill: '#08291f', hillTop: '#124535',
    gnd: '#20382f', gndD: '#172a23', edge: '#a6ff4d', edgeD: '#4f8a2a', grid: '#2c4a3e',
    crate: '#ff7eb6', crateD: '#8c2f5c', crateL: '#ffd1e6', plat: '#155c41', liq: '#5dd62c', liqHi: '#d4ff9e', stars: true }
];
var skyCache = {};
function skyFor(TH) {
  if (skyCache[TH.id]) return skyCache[TH.id];
  var c = document.createElement('canvas'); c.width = W; c.height = H;
  var x = c.getContext('2d'), s = TH.sky, bh = 18, i, yy, xx;
  for (i = 0; i < s.length; i++) {
    x.fillStyle = s[i]; x.fillRect(0, i * bh, W, i === s.length - 1 ? H : bh);
    if (i < s.length - 1) {
      x.fillStyle = s[i + 1];
      for (yy = 0; yy < 2; yy++) for (xx = (yy & 1); xx < W; xx += 2) x.fillRect(xx, i * bh + bh - 2 + yy, 1, 1);
    }
  }
  skyCache[TH.id] = c;
  return c;
}

/* ================= 3x5 bitmap font ================= */
var F = {
'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001',
'5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111',
'A':'010101111101101','B':'110101110101110','C':'011100100100011','D':'110101101101110','E':'111100110100111',
'F':'111100110100100','G':'011100101101011','H':'101101111101101','I':'111010010010111','J':'001001001101010',
'K':'101101110101101','L':'100100100100111','M':'101111111101101','N':'110101101101101','O':'010101101101010',
'P':'110101110100100','Q':'010101101110011','R':'110101110101101','S':'011100010001110','T':'111010010010010',
'U':'101101101101111','V':'101101101101010','W':'101101111111101','X':'101101010101101','Y':'101101010010010',
'Z':'111001010100111',' ':'000000000000000',':':'000010000010000','.':'000000000000010','%':'101001010100101',
'/':'001001010100100','-':'000000111000000','>':'100010001010100','<':'001010100010001','!':'010010010000010',
'+':'000010111010000',',':'000000000010100','?':'111001010000010','x':'000101010101000'
};
function txt(s, x, y, col, sc, shadow) {
  sc = sc || 1; s = String(s);
  if (shadow) txt(s, x + sc, y + sc, shadow, sc);
  g.fillStyle = col;
  var cx = x, k, i, ch, gl;
  for (k = 0; k < s.length; k++) {
    ch = s.charAt(k); gl = F[ch] || F[ch.toUpperCase()] || F['?'];
    for (i = 0; i < 15; i++) if (gl.charCodeAt(i) === 49) g.fillRect(cx + (i % 3) * sc, y + ((i / 3) | 0) * sc, sc, sc);
    cx += 4 * sc;
  }
}
function tw(s, sc) { sc = sc || 1; return String(s).length * 4 * sc - sc; }
function txtC(s, y, col, sc, shadow) { txt(s, ((W - tw(s, sc)) / 2) | 0, y, col, sc, shadow); }

/* ================= sprites ================= */
function sprite(rows, pal) {
  var c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  var x = c.getContext('2d'), j, i, p;
  for (j = 0; j < rows.length; j++) for (i = 0; i < rows[j].length; i++) {
    p = pal[rows[j].charAt(i)];
    if (p) { x.fillStyle = p; x.fillRect(i, j, 1, 1); }
  }
  return c;
}
function flipped(src) {
  var c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  var x = c.getContext('2d'); x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0);
  return c;
}
var HP = { K:'#1b1830', W:'#eef3f6', w:'#b9c7d6', Y:'#ffd447', y:'#fff6c2', T:'#23b5a5', t:'#157a72', L:'#9df5e3', O:'#ff8a3d', o:'#c4561c', A:'#ff5d73', G:'#8a93a8' };
var HERO_TOP = [
  '........A.....',
  '........G.....',
  '.....KKKKKK...',
  '....KWWWWWWK..',
  '....KWKKKKKK..',
  '....KWKYYYyK..',
  '....KwKKKKKK..',
  '.....KwwwwK...',
  '..KK.KKKKKK...',
  '.KOoKTTTTTTK..',
  '.KOoKTLLTTTK..',
  '.KooKTTTTttK..',
  '..KK.KKKKKK...'
];
var LEGS = {
  stand: ['......G..G....', '.....KK..KK...'],
  runA:  ['.....G....G...', '....KK....KK..'],
  runB:  ['.......GG.....', '......KKKK....'],
  jump:  ['......G...G...', '.....KK....KK.']
};
var HERO = {}, lk, hs;
for (lk in LEGS) if (LEGS.hasOwnProperty(lk)) { hs = sprite(HERO_TOP.concat(LEGS[lk]), HP); HERO[lk] = [hs, flipped(hs)]; }

var HEART = sprite(['.RR.RR.', 'RRRRRRR', 'RRwRRRR', '.RRRRR.', '..RRR..', '...R...'], { R: '#ff5d73', w: '#ffd1da' });
var BP = { K:'#1b1830', P:'#9b5de5', Q:'#d0a8ff', W:'#ffffff', G:'#7cf27c' };
var BUG_BODY = ['..G......G..','...G....G...','...KKKKKK...','..KPPPPPPK..','.KPWKPPWKPK.','.KPPPPPPPPK.','.KQPQPPQPQK.','..KKKKKKKK..'];
var BUG = [sprite(BUG_BODY.concat(['..K.K..K.K..']), BP), sprite(BUG_BODY.concat(['.K..K..K..K.']), BP)];
var BUG_FLAT = sprite(['............','..KKKKKKKK..','.KPWKPPWKPK.','KKQKQKKQKQKK'], BP);
var CHIP = sprite(['..Y.Y.Y..','.KKKKKKK.','YKGgGGGKY','.KGKKKGK.','YKGKDKGKY','.KGKKKGK.','YKGGGGGKY','.KKKKKKK.','..Y.Y.Y..'],
                  { K:'#0b2a1a', G:'#36d27a', g:'#a7f7c6', Y:'#ffd447', D:'#5ef2ff' });
var DISK = sprite(['...KKKK...','..KYYYYK..','.KYyyyYYK.','KYyYYYYYYK','KYyYKKYYYK','KYYYKKYYoK','KYYYYYYYoK','.KYYYYYoK.','..KYooYK..','...KKKK...'],
                  { K:'#5a3a00', Y:'#ffd447', y:'#fff6c2', o:'#d99a1a' });
var DP = { K:'#1b1830', B:'#4a5a8a', b:'#7f8fc0', R:'#ff5d73', G:'#cfd6ee', g:'#8a93a8' };
var DRONE = [
  sprite(['.GGGG..GGGG.','.....KK.....','...KKKKKK...','..KBBBBBBK..','.KBbRRKBBBK.','.KBBRRBBBBK.','..KKKKKKKK..','...K....K...'], DP),
  sprite(['...gg..gg...','.....KK.....','...KKKKKK...','..KBBBBBBK..','.KBbRRKBBBK.','.KBBRRBBBBK.','..KKKKKKKK..','...K....K...'], DP)
];
var DRONE_FLAT = sprite(['............','..KKKKKKKK..','.KBbRRKBBBK.','KKKKKKKKKKKK'], DP);
var SP = { R:'#ff5a1f', Y:'#ffd447', W:'#fff6c2', r:'#a3261c' };
var SPARK = [
  sprite(['....r.....','...rRr..r.','..rRYRr...','.rRYWYRr..','.rRYWWYRr.','.rRYWYRr..','..rRYRr...','...rRr....','....r.....','..........'], SP),
  sprite(['..r.......','...rRr....','..rRYRr.r.','.rRYWYRr..','rRYWWWYRr.','.rRYWYRr..','..rRYRr...','.r.rRr....','....r.....','..........'], SP)
];

/* ================= audio (Web Audio blips, created on first input) ================= */
var AC = null;
function audioInit() {
  if (!AC) {
    var C = window.AudioContext || window.webkitAudioContext;
    if (C) { try { AC = new C(); } catch (e) { AC = null; } }
  }
  if (AC && AC.state === 'suspended' && AC.resume) AC.resume();
}
function tone(type, f0, f1, dur, vol, delay) {
  if (!AC || save.muted) return;
  try {
    var t = AC.currentTime + (delay || 0), o = AC.createOscillator(), gn = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    gn.gain.setValueAtTime(vol || 0.06, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn); gn.connect(AC.destination); o.start(t); o.stop(t + dur + 0.03);
  } catch (e) { }
}
var SFX = {
  jump:   function () { tone('square', 280, 560, 0.11, 0.04); },
  chip:   function () { tone('triangle', 990, 1480, 0.08, 0.06); },
  disk:   function () { tone('square', 660, 0, 0.08, 0.05); tone('square', 880, 0, 0.08, 0.05, 0.08); tone('square', 1320, 0, 0.16, 0.05, 0.16); },
  stomp:  function () { tone('square', 220, 70, 0.12, 0.06); },
  hurt:   function () { tone('sawtooth', 300, 90, 0.22, 0.05); },
  die:    function () { tone('square', 440, 60, 0.5, 0.06); },
  spring: function () { tone('sine', 180, 900, 0.22, 0.08); },
  check:  function () { tone('triangle', 660, 0, 0.1, 0.07); tone('triangle', 990, 0, 0.18, 0.07, 0.1); },
  clear:  function () { var n = [523, 659, 784, 1047, 784, 1047], i; for (i = 0; i < n.length; i++) tone('square', n[i], 0, 0.14, 0.05, i * 0.11); },
  move:   function () { tone('square', 520, 0, 0.04, 0.03); },
  ok:     function () { tone('square', 660, 990, 0.1, 0.05); },
  no:     function () { tone('square', 140, 100, 0.15, 0.05); }
};
function sfx(name) { if (SFX[name]) SFX[name](); }

/* ================= save data ================= */
var save = { v: 1, unlocked: 1, lv: {}, endless: 0, muted: false, deaths: 0, continues: 0 };
(function () {
  try {
    var raw = window.localStorage && localStorage.getItem(SAVE_KEY), o;
    if (raw) {
      o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        if (o.unlocked) save.unlocked = o.unlocked;
        if (o.lv) save.lv = o.lv;
        if (o.endless) save.endless = o.endless;
        save.muted = !!o.muted;
        if (o.deaths > 0) save.deaths = o.deaths | 0;
        if (o.continues > 0) save.continues = o.continues | 0;
      }
    }
  } catch (e) { }
  if (/[?&]unlock\b/.test(location.search)) save.unlocked = NLEV;
})();
function writeSave() { try { if (window.localStorage) localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { } }
function levelSave(id) { if (!save.lv[id]) save.lv[id] = { done: false, best: 0, disks: [false, false, false], deaths: 0 }; return save.lv[id]; }
function totalDisks() {
  var n = 0, k, d, i;
  for (k in save.lv) if (save.lv.hasOwnProperty(k)) { d = save.lv[k].disks || []; for (i = 0; i < 3; i++) if (d[i]) n++; }
  return n;
}

/* ================= input ================= */
var KEYMAP = { 37: 'L', 65: 'L', 39: 'R', 68: 'R', 38: 'U', 87: 'U', 40: 'D', 83: 'D', 32: 'J', 90: 'J', 75: 'J', 13: 'A', 27: 'B', 80: 'P', 77: 'M' };
var down = {}, hit = {};
function keyDown(k) { if (!down[k]) hit[k] = true; down[k] = true; }
function keyUp(k) { down[k] = false; }
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || UI.panelOpen()) return;
  var k = KEYMAP[e.keyCode];
  audioInit();
  if (k) { e.preventDefault(); keyDown(k); }
});
document.addEventListener('keyup', function (e) { var k = KEYMAP[e.keyCode]; if (k) keyUp(k); });
window.addEventListener('blur', function () { UI.releaseAll(); var k; for (k in down) if (down.hasOwnProperty(k)) down[k] = false; if (state === 'play') openPause(); });

var UI = window.BRQ_UI;
var TOUCH = UI.touch;

/* taps on the canvas drive the menus (controls.js maps the point, also when the view is rotated) */
var taps = [];
var menuRects = [];
function tapIn(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }

/* ================= level objects ================= */
var L = null;                         /* current level (static or procedural) */
function isSolidT(t) { return t === '#' || t === 'X'; }

function makeStatic(index) {
  var b = LV.build(index), lvl = {
    kind: 'static', index: index, id: b.id, name: b.name, width: b.width, rows: b.rows,
    theme: b.theme, ice: b.ice, foes: [], chips: [], disks: [], movers: [], springs: [], checks: [], goal: null, start: null
  }, i, m, x, y, nd = 0;
  lvl.tile = function (c, r) {
    if (r < 0 || r >= ROWS) return '.';
    if (c < 0 || c >= lvl.width) return '#';
    return lvl.rows[r][c];
  };
  for (i = 0; i < b.markers.length; i++) {
    m = b.markers[i]; x = m.c * T; y = m.r * T;
    switch (m.ch) {
      case 'P': lvl.start = { x: x + 3, y: (m.r + 1) * T - 14 }; break;
      case 'K': lvl.checks.push({ x: x + 6, y: (m.r + 1) * T, on: false }); break;
      case 'G': lvl.goal = { x: x, lvl: m.r + 1 }; break;
      case 'c': lvl.chips.push({ x: x + 4, y: y + 4, w: 9, h: 9, got: false, ph: hsh(i) * 6 }); break;
      case 'D': lvl.disks.push({ x: x + 3, y: y + 3, w: 10, h: 10, got: false, idx: nd++ }); break;
      case 'b': lvl.foes.push(newBug(x + 2, (m.r + 1) * T - 9)); break;
      case 'f': lvl.foes.push({ type: 'spark', ox: x + 3, oy: y + 3, x: x + 3, y: y + 3, w: 10, h: 10, ph: hsh(i) * 6, dead: 0, gone: false, anim: 0 }); break;
      case 'F': lvl.foes.push({ type: 'drone', ox: x + 2, oy: y + 4, x: x + 2, y: y + 4, w: 12, h: 8, ph: hsh(i) * 6, dir: 1, dead: 0, gone: false, anim: 0 }); break;
      case 'M': lvl.movers.push({ axis: 'h', ox: x + 8 - 24, oy: y, x: x - 16, y: y, w: 48, h: 8, range: 40, period: 240, dx: 0, dy: 0, prevX: x - 16, prevY: y }); break;
      case 'V': lvl.movers.push({ axis: 'v', ox: x + 8 - 24, oy: y, x: x - 16, y: y, w: 48, h: 8, range: 80, period: 300, dx: 0, dy: 0, prevX: x - 16, prevY: y }); break;
      case 'S': lvl.springs.push({ x: x, y: y + 8, w: 16, h: 8, squash: 0 }); break;
    }
  }
  lvl.totalChips = lvl.chips.length;
  return lvl;
}
function newBug(x, y) { return { type: 'bug', x: x, y: y, w: 12, h: 9, vx: -0.35, vy: 0, onGround: false, hitWall: false, dead: 0, gone: false, anim: 0 }; }

/* Procedural level: the title screen demo and Endless Run. */
function makeProc(seed, endless) {
  var cols = {}, genC = 0, lvl = 9, rs = seed;
  var P = { kind: 'proc', endless: endless, width: 1e9, theme: 0, ice: false, foes: [], chips: [], disks: [], movers: [], springs: [], checks: [], goal: null,
            start: { x: 48, y: 9 * T - 14 }, totalChips: 0 };
  function r1() { rs = (rs * 1664525 + 1013904223) % 4294967296; return rs / 4294967296; }
  function ri1(a, b) { return a + Math.floor(r1() * (b - a + 1)); }
  function setCol(c, top) { var a = [], r; for (r = 0; r < ROWS; r++) a.push(r >= top ? '#' : '.'); cols[c] = a; return a; }
  function flat(n) { for (var i = 0; i < n; i++) setCol(genC++, lvl); }
  function chip(x, y) { P.chips.push({ x: x, y: y, w: 9, h: 9, got: false, ph: r1() * 6 }); }
  function gen() {
    var d = endless ? Math.min(1, genC / 1600) : 0.25, c, lv, roll, w, i, k, a, h1, h2, pc, pw, n;
    if (genC === 0) { flat(22); return; }
    flat(ri1(3, 5) - (d > 0.6 ? 1 : 0));
    c = genC; lv = lvl; roll = r1();
    if (roll < 0.22 + d * 0.08) {
      w = r1() < 0.7 - d * 0.4 ? 2 : 3;
      for (i = 0; i < w; i++) { setCol(genC++, ROWS); chip((c + i) * T + 4, (lv - 3) * T + 4); }
      flat(3);
    } else if (roll < 0.42) {
      h1 = ri1(1, 2);
      a = setCol(genC++, lv); for (k = 1; k <= h1; k++) a[lv - k] = 'X';
      chip(c * T + 4, (lv - h1 - 1) * T + 4);
      if (r1() < 0.4) { h2 = Math.min(2, h1 + (r1() < 0.5 ? 1 : 0)); a = setCol(genC++, lv); for (k = 1; k <= h2; k++) a[lv - k] = 'X'; }
      flat(3);
    } else if (roll < 0.56) {
      flat(1); pc = genC; pw = ri1(3, 4);
      for (i = 0; i < pw; i++) { a = setCol(genC++, lv); a[lv - 3] = '='; chip((pc + i) * T + 4, (lv - 4) * T + 5); }
      flat(2);
    } else if (roll < 0.74) {
      flat(2); P.foes.push(newBug(genC * T, lv * T - 9));
      if (endless && d > 0.5 && r1() < 0.5) P.foes.push(newBug((genC + 4) * T, lv * T - 9));
      flat(6);
    } else if (roll < 0.86) {
      lvl = lv === 9 ? 8 : (lv === 7 ? 8 : (r1() < 0.5 ? 7 : 9));
      flat(ri1(4, 7));
    } else {
      n = ri1(3, 5);
      for (i = 0; i < n; i++) { chip(genC * T + 4, (lv - 2) * T + 4); flat(1); }
      flat(1);
    }
  }
  P.tile = function (c, r) {
    if (r < 0 || r >= ROWS) return '.';
    while (c >= genC) gen();
    var col = cols[c];
    return col ? col[r] : '#';
  };
  P.prune = function (minC) {
    var k;
    for (k in cols) if (cols.hasOwnProperty(k) && +k < minC) delete cols[k];
    P.foes = P.foes.filter(function (f) { return !f.gone && f.x > minC * T; });
    P.chips = P.chips.filter(function (c) { return !c.got && c.x > minC * T; });
  };
  return P;
}

/* ================= game state ================= */
var hero = { x: 0, y: 0, w: 10, h: 14, vx: 0, vy: 0, onGround: false, face: 1, anim: 0, hurt: 0, coyote: 0, buf: 0,
             ride: -1, surface: '#', hp: 3, dead: 0, noCut: 0, hitWall: false };
var state = 'title', frame = 0, lf = 0, camX = 0;
var run = null;                       /* per attempt stats */
var cp = null;                        /* checkpoint position */
var parts = [], floats = [], fwQueue = [];
var banner = null;
var menuSel = 0, selRow = 0, selCol = 0;
var lastLevel = 0, allClearShown = false;
var autoMode = false;                 /* hero driven by the autopilot (title demo) */
var outT = 0;                         /* frames to ignore input after the Out of lives overlay appears */
var curDir = 1;                       /* auto-run direction right now (setting is the default, TURN flips it) */

function resetHero(x, y) {
  hero.x = x; hero.y = y; hero.vx = 0; hero.vy = 0; hero.onGround = false; hero.face = 1; hero.hurt = 0;
  hero.coyote = 0; hero.buf = 0; hero.ride = -1; hero.hp = 3; hero.dead = 0; hero.noCut = 0;
}
function curTheme() {
  if (!L) return THEMES[0];
  if (L.kind === 'proc') return THEMES[L.theme % THEMES.length];
  return THEMES[L.theme];
}

function toTitle() {
  state = 'title'; autoMode = true;
  L = makeProc(20261025, false);
  resetHero(48, 9 * T - 14); camX = 0; lf = 0; parts = []; floats = []; banner = null;
}
function toSelect() {
  state = 'select'; autoMode = false; banner = null;
  if (selRow < 4 && selRow * 3 + selCol >= save.unlocked) { selRow = Math.floor((save.unlocked - 1) / 3); selCol = (save.unlocked - 1) % 3; }
}
function livesMax() { return UI.cfg.lives === 0 ? -1 : UI.cfg.lives; }   /* -1 = unlimited (practice) */
function startLevel(i, carry) {
  L = makeStatic(i); lastLevel = i; autoMode = false; setRunDir(UI.cfg.autoDir);
  resetHero(L.start.x, L.start.y);
  cp = { x: L.start.x, y: L.start.y };
  run = { frames: 0, chips: 0, deaths: carry ? carry.deaths : 0, continues: carry ? carry.continues : 0, lives: livesMax(), disks: [false, false, false], stomps: 0 };
  camX = clamp(hero.x - W * 0.42, 0, L.width * T - W); lf = 0;
  parts = []; floats = []; fwQueue = [];
  updateMovers();
  state = 'play';
  setBanner(L.id + ' ' + L.name, THEMES[L.theme].name, THEMES[L.theme].edge, 150);
}
function startEndless() {
  L = makeProc(Math.floor(Math.random() * 1e9), true); lastLevel = -1; autoMode = false; setRunDir(UI.cfg.autoDir);
  resetHero(48, 9 * T - 14); cp = null;
  run = { frames: 0, chips: 0, deaths: 0, disks: [false, false, false], stomps: 0, dist: 0 };
  camX = 0; lf = 0; parts = []; floats = []; fwQueue = [];
  state = 'play';
  setBanner('ENDLESS RUN', 'HOW FAR CAN YOU GO?', '#5ef2ff', 150);
}
function setRunDir(d) { curDir = d; UI.setDir(d); }
function openPause() { if (state !== 'play') return; state = 'pause'; menuSel = 0; }

/* ================= effects ================= */
function burst(x, y, cols, n, sp) {
  n = n || 10; sp = sp || 1.6;
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random());
    parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, life: 30 + ((Math.random() * 20) | 0), col: cols[i % cols.length], gr: 0.06 });
  }
}
var FW = [['#ffd447','#fff6c2'], ['#5ef2ff','#ffffff'], ['#ff5d73','#ffb3c0'], ['#7cf27c','#d8ffd8'], ['#b48cff','#efe3ff']];
function firework() {
  var x = camX + 40 + Math.random() * (W - 80), y = 20 + Math.random() * 50, set = FW[(Math.random() * 5) | 0], i, a, v;
  for (i = 0; i < 28; i++) {
    a = (i / 28) * Math.PI * 2; v = 1.3 + Math.random() * 0.4;
    parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 50 + ((Math.random() * 15) | 0), col: set[i % 2], gr: 0.025 });
  }
}
function floatText(s, x, y, col) { floats.push({ s: s, x: x, y: y, col: col, life: 50 }); }
function setBanner(text, sub, col, t) { banner = { text: text, sub: sub, col: col, t: t || 200 }; }

/* ================= physics ================= */
function moveBody(b, isHero) {
  var r, c, r0, r1, c0, c1, t, prevBottom, i, m;
  b.hitWall = false; b.bonk = false;
  b.x += b.vx;
  r0 = Math.floor(b.y / T); r1 = Math.floor((b.y + b.h - 0.01) / T);
  if (b.vx > 0) {
    c = Math.floor((b.x + b.w - 0.01) / T);
    for (r = r0; r <= r1; r++) if (isSolidT(L.tile(c, r))) { b.x = c * T - b.w; b.vx = 0; b.hitWall = true; break; }
  } else if (b.vx < 0) {
    c = Math.floor(b.x / T);
    for (r = r0; r <= r1; r++) if (isSolidT(L.tile(c, r))) { b.x = (c + 1) * T; b.vx = 0; b.hitWall = true; break; }
  }
  b.vy = Math.min(b.vy + GRAV, MAXF);
  prevBottom = b.y + b.h;
  b.y += b.vy; b.onGround = false;
  if (isHero) b.ride = -1;
  c0 = Math.floor(b.x / T); c1 = Math.floor((b.x + b.w - 0.01) / T);
  if (b.vy > 0) {
    r = Math.floor((b.y + b.h - 0.01) / T);
    for (c = c0; c <= c1; c++) {
      t = L.tile(c, r);
      if (isSolidT(t) || (t === '=' && prevBottom <= r * T + 0.5)) { b.y = r * T - b.h; b.vy = 0; b.onGround = true; b.surface = t; break; }
    }
  } else if (b.vy < 0) {
    r = Math.floor(b.y / T);
    for (c = c0; c <= c1; c++) if (isSolidT(L.tile(c, r))) { b.y = (r + 1) * T; b.vy = 0; b.bonk = true; break; }
  }
  if (isHero && b.vy >= 0 && !b.onGround) {
    for (i = 0; i < L.movers.length; i++) {
      m = L.movers[i];
      if (b.x + b.w > m.x + 1 && b.x < m.x + m.w - 1 && prevBottom <= Math.max(m.y, m.prevY) + 4 && b.y + b.h >= m.y) {
        b.y = m.y - b.h; b.vy = 0; b.onGround = true; b.surface = '='; b.ride = i; break;
      }
    }
  }
}
function updateMovers() {
  for (var i = 0; i < L.movers.length; i++) {
    var m = L.movers[i], ph = lf * 2 * Math.PI / m.period;
    m.prevX = m.x; m.prevY = m.y;
    if (m.axis === 'h') { m.x = m.ox + Math.sin(ph) * m.range; m.y = m.oy; }
    else { m.x = m.ox; m.y = m.oy - (1 - Math.cos(ph)) / 2 * m.range; }
    m.dx = m.x - m.prevX; m.dy = m.y - m.prevY;
  }
}

/* autopilot for the title demo: look ahead for gaps, walls, bugs and chips */
function think(spd) {
  var inp = { left: false, right: true, jump: false, hold: true, v: J_FULL };
  if (!hero.onGround) return inp;
  var feetRow = Math.floor((hero.y + hero.h + 1) / T), front = hero.x + hero.w, i, r, cc, h, wh = 0, b, d, ch, pc, gap;
  pc = Math.floor((front + 2 + spd * 2) / T); gap = true;
  for (r = feetRow; r < ROWS; r++) if (isSolidT(L.tile(pc, r)) || L.tile(pc, r) === '=') { gap = false; break; }
  if (gap) { inp.jump = true; inp.v = J_FULL; return inp; }
  var wc = Math.floor((front + 6 + spd * 8) / T);
  for (cc = wc; cc <= wc + 1; cc++) {
    h = 0; for (r = feetRow - 1; r >= feetRow - 4 && isSolidT(L.tile(cc, r)); r--) h++;
    if (h > wh) wh = h;
  }
  if (wh > 0) { inp.jump = true; inp.v = wh === 1 ? J_MID : J_FULL; return inp; }
  for (i = 0; i < L.foes.length; i++) {
    b = L.foes[i]; if (b.dead || b.gone || b.type !== 'bug') continue;
    d = b.x - front;
    if (d > -2 && d < (spd - b.vx) * 29 - 11 && Math.abs((b.y + b.h) - (hero.y + hero.h)) < 8) { inp.jump = true; inp.v = J_HOP; return inp; }
  }
  for (i = 0; i < L.chips.length; i++) {
    ch = L.chips[i]; if (ch.got) continue;
    d = ch.x - front;
    if (d > 4 && d < 14 && ch.y < hero.y - 4 && ch.y > hero.y - 26) { inp.jump = true; inp.v = J_HOP; return inp; }
  }
  if (hero.hitWall) { inp.jump = true; inp.v = J_FULL; }
  return inp;
}

/* ================= hero: hurt, out, respawn ================= */
function hurtHero(srcX) {
  if (hero.hurt > 0 || hero.dead) return;
  if (autoMode) { hero.hurt = 60; return; }
  hero.hp--; hero.hurt = 70; sfx('hurt');
  hero.vy = -2.8; hero.vx = hero.x + hero.w / 2 < srcX ? -1.6 : 1.6;
  if (hero.hp <= 0) killHero();
}
function killHero() {
  if (hero.dead) return;
  if (autoMode) { autoRespawn(); return; }
  hero.dead = 1; run.deaths++; sfx('die');
  if (!forcedInput) {                                  /* not while the solver searches */
    save.deaths = (save.deaths | 0) + 1;
    if (L.kind === 'static') { levelSave(L.id).deaths = (levelSave(L.id).deaths | 0) + 1; if (run.lives > 0) run.lives--; }
    writeSave(); UI.vibrate();
  } else if (L.kind === 'static' && run.lives > 0) run.lives--;
  burst(hero.x + 5, Math.min(hero.y + 7, H - 8), ['#eef3f6', '#23b5a5', '#ffd447', '#ff8a3d'], 22, 1.8);
}
function autoRespawn() {
  var c = Math.floor((camX + 90) / T), k, a, b;
  for (k = 0; k < 60; k++, c++) {
    a = L.tile(c, 9); b = L.tile(c + 1, 9);
    if (a === '#' && b === '#' && L.tile(c, 8) === '.' && L.tile(c + 1, 8) === '.' && L.tile(c, 7) === '.') break;
  }
  hero.x = c * T + 3; hero.y = 9 * T - hero.h - 20; hero.vy = 0; hero.hurt = 60;
  burst(hero.x + 5, hero.y + 7, ['#5ef2ff', '#ffffff', '#ffd447'], 16, 1.2);
}
function respawnAtCheckpoint() {
  var x = cp.x, y = cp.y;
  resetHero(x, y); hero.hurt = 60;
  burst(hero.x + 5, hero.y + 7, ['#5ef2ff', '#ffffff', '#ffd447'], 16, 1.2);
}

/* ================= play step (shared by the title demo and real play) ================= */
var forcedInput = null;               /* test hook: drive the hero directly */
function stepPlay() {
  var TH = curTheme(), inp, dir, ice, acc, fric, spd, i, f, m, s, ch, dk, k, pv, c0, c1, r0, r1, c, r, t, ph, dist;
  lf++;
  if (!autoMode && !hero.dead) run.frames++;
  updateMovers();

  /* dead: wait, then respawn or end the run */
  if (hero.dead) {
    hero.dead++;
    if (hero.dead > 55) {
      if (L.kind === 'proc' && L.endless) { endRun(); return; }
      if (run.lives === 0) { outOfLives(); return; }
      respawnAtCheckpoint();
    }
    stepEffects(); updateCam(); return;
  }

  /* carried by a moving platform */
  if (hero.ride >= 0) {
    m = L.movers[hero.ride];
    if (m && hero.x + hero.w > m.x && hero.x < m.x + m.w && hero.vy >= 0) { hero.x += m.dx; hero.y = m.y - hero.h; }
    else hero.ride = -1;
  }

  if (autoMode) {
    spd = 1.5;
    inp = think(spd);
    hero.vx += (spd - hero.vx) * 0.1;
    if (inp.jump && hero.onGround) { hero.vy = inp.v; hero.onGround = false; }
  } else {
    inp = forcedInput || { left: !!down.L, right: !!down.R, jumpPressed: !!(hit.J || hit.U), jumpHeld: !!(down.J || down.U) };
    if (!forcedInput && UI.cfg.auto) {                 /* auto-run: always running, arrow keys turn around */
      if (hit.L) setRunDir(-1); else if (hit.R) setRunDir(1);
      inp.left = curDir < 0; inp.right = curDir > 0;
    }
    dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    ice = L.ice && hero.onGround && hero.surface === '#';
    acc = hero.onGround ? (ice ? 0.05 : 0.3) : 0.18;
    fric = hero.onGround ? (ice ? 0.025 : 0.3) : 0.04;
    if (dir) {
      hero.vx += dir * acc;
      if (hero.vx > MAXV) hero.vx = MAXV; if (hero.vx < -MAXV) hero.vx = -MAXV;
    } else if (hero.vx > 0) hero.vx = Math.max(0, hero.vx - fric);
    else if (hero.vx < 0) hero.vx = Math.min(0, hero.vx + fric);
    if (hero.onGround) hero.coyote = 6; else if (hero.coyote > 0) hero.coyote--;
    if (inp.jumpPressed) hero.buf = 7; else if (hero.buf > 0) hero.buf--;
    if (hero.buf > 0 && hero.coyote > 0) {
      hero.vy = JUMP; hero.coyote = 0; hero.buf = 0; hero.ride = -1; hero.onGround = false; sfx('jump');
      for (i = 0; i < 4; i++) parts.push({ x: hero.x + 2 + i * 2, y: hero.y + hero.h, vx: (i - 1.5) * 0.3, vy: -0.2, life: 14, col: TH.edge, gr: 0 });
    }
    if (hero.noCut > 0) hero.noCut--;
    else if (!inp.jumpHeld && hero.vy < JUMP_CUT) hero.vy = JUMP_CUT;
  }
  if (hero.vx > 0.1) hero.face = 1; else if (hero.vx < -0.1) hero.face = -1;

  moveBody(hero, true);
  if (L.kind === 'proc' && hero.x < camX + 2) { hero.x = camX + 2; if (hero.vx < 0) hero.vx = 0; }
  if (hero.hurt > 0) hero.hurt--;
  hero.anim += Math.abs(hero.vx);

  /* springs */
  for (i = 0; i < L.springs.length; i++) {
    s = L.springs[i]; if (s.squash > 0) s.squash--;
    if (hero.vy >= 0 && overlap(hero, s) && hero.y + hero.h <= s.y + 10) {
      hero.vy = SPRING_V; hero.noCut = 30; hero.onGround = false; hero.coyote = 0; hero.ride = -1; s.squash = 10; sfx('spring');
    }
  }

  /* hazards: liquid, spikes, pits */
  c0 = Math.floor(hero.x / T); c1 = Math.floor((hero.x + hero.w - 0.01) / T);
  r0 = Math.floor(hero.y / T); r1 = Math.floor((hero.y + hero.h - 0.01) / T);
  for (c = c0; c <= c1 && !hero.dead; c++) for (r = r0; r <= r1; r++) {
    t = L.tile(c, r);
    if (t === '~' && hero.y + hero.h > r * T + 5) { killHero(); break; }
    if (t === '^' && hero.x + hero.w > c * T + 3 && hero.x < c * T + 13 && hero.y + hero.h > r * T + 9) hurtHero(c * T + 8);
  }
  if (!hero.dead && hero.y > H + 8) killHero();

  /* enemies */
  for (i = 0; i < L.foes.length; i++) {
    f = L.foes[i];
    if (f.gone) continue;
    if (f.dead) { if (--f.dead === 0) f.gone = true; continue; }
    if (f.type === 'bug') {
      if (f.x > camX + W + 32 || f.x < camX - 64) continue;
      pv = f.vx;
      moveBody(f, false);
      if (f.hitWall) f.vx = -pv;
      else if (f.onGround) {
        t = L.tile(Math.floor((pv < 0 ? f.x - 1 : f.x + f.w + 1) / T), Math.floor((f.y + f.h + 2) / T));
        if (!isSolidT(t) && t !== '=') f.vx = -pv;
        else if (f.vx === 0) f.vx = pv;
      }
      if (f.y > H + 40) f.gone = true;
    } else if (f.type === 'spark') {
      f.y = f.oy + Math.sin(lf * 0.042 + f.ph) * 22;
    } else if (f.type === 'drone') {
      ph = lf * 0.0314 + f.ph;
      f.x = f.ox + Math.sin(ph) * 40; f.dir = Math.cos(ph) >= 0 ? 1 : -1;
      f.y = f.oy + Math.sin(lf * 0.1) * 1.5;
    }
    f.anim++;
    if (!hero.dead && overlap(hero, f)) {
      if (f.type !== 'spark' && hero.vy > 0.3 && hero.y + hero.h - f.y < 9) {
        f.dead = 40; if (run) run.stomps++;
        hero.vy = (autoMode || (forcedInput ? forcedInput.jumpHeld : (down.J || down.U))) ? -4.4 : -3.2; hero.noCut = 8;
        sfx('stomp');
        burst(f.x + 6, f.y + 4, f.type === 'bug' ? ['#9b5de5', '#d0a8ff', '#ffffff'] : ['#7f8fc0', '#ff5d73', '#ffffff'], 12, 1.4);
        floatText('+1', f.x, f.y - 6, '#d0a8ff');
      } else hurtHero(f.x + f.w / 2);
    }
  }

  /* pickups */
  for (i = 0; i < L.chips.length; i++) {
    ch = L.chips[i];
    if (!ch.got && overlap(hero, ch)) {
      ch.got = true; if (!autoMode) { run.chips++; sfx('chip'); }
      burst(ch.x + 4, ch.y + 4, ['#ffd447', '#36d27a', '#fff6c2'], 8, 1.1);
    }
  }
  for (i = 0; i < L.disks.length; i++) {
    dk = L.disks[i];
    if (!dk.got && overlap(hero, dk)) {
      dk.got = true; run.disks[dk.idx] = true; sfx('disk');
      burst(dk.x + 5, dk.y + 5, ['#ffd447', '#fff6c2', '#ffffff'], 18, 1.6);
      floatText('DISK!', dk.x - 4, dk.y - 6, '#ffd447');
    }
  }
  for (i = 0; i < L.checks.length; i++) {
    k = L.checks[i];
    if (!k.on && hero.x > k.x - 4) {
      k.on = true; cp = { x: k.x - 4, y: k.y - hero.h - 2 }; sfx('check');
      floatText('SAVED', k.x - 8, k.y - 34, '#5ef2ff');
    }
  }
  if (L.goal && !autoMode && hero.x > L.goal.x + 20) { levelClear(); return; }

  /* endless: distance, zones, pruning */
  if (L.kind === 'proc') {
    if (L.endless) {
      dist = Math.max(0, Math.floor((hero.x - 48) / T));
      if (dist > run.dist) run.dist = dist;
      k = Math.floor(run.dist / 250) % THEMES.length;
      if (k !== L.theme) { L.theme = k; setBanner('ZONE ' + (Math.floor(run.dist / 250) + 1), THEMES[k].name, THEMES[k].edge, 150); }
    } else L.theme = Math.floor(frame / 2400) % THEMES.length;
    if (lf % 60 === 0) L.prune(Math.floor(camX / T) - 4);
  }

  stepEffects();
  updateCam();
}

function stepEffects() {
  var i, p, f;
  for (i = 0; i < parts.length; i++) { p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += p.gr; p.life--; }
  parts = parts.filter(function (q) { return q.life > 0; });
  for (i = 0; i < floats.length; i++) { f = floats[i]; f.y -= 0.5; f.life--; }
  floats = floats.filter(function (q) { return q.life > 0; });
  while (fwQueue.length && fwQueue[0] <= frame) { fwQueue.shift(); firework(); }
  if (banner && --banner.t <= 0) banner = null;
}
function updateCam() {
  var target;
  if (L.kind === 'static') {
    target = clamp(hero.x + hero.w / 2 - W * 0.42, 0, L.width * T - W);
    camX += (target - camX) * 0.15;
    if (Math.abs(target - camX) < 0.3) camX = target;
  } else camX = Math.max(camX, hero.x - 110);
}

function levelClear() {
  var ls = levelSave(L.id), i, newBest = false;
  state = 'clear'; menuSel = 0;
  ls.done = true;
  if (!ls.best || run.frames < ls.best) { ls.best = run.frames; newBest = true; }
  for (i = 0; i < 3; i++) if (run.disks[i]) ls.disks[i] = true;
  if (save.unlocked < L.index + 2) save.unlocked = Math.min(NLEV, L.index + 2);
  writeSave();
  run.newBest = newBest;
  run.final = L.index === NLEV - 1;
  sfx('clear');
  for (i = 0; i < 6; i++) fwQueue.push(frame + i * 14);
}
function outOfLives() { state = 'out'; menuSel = 0; outT = 30; }
/* Stage = world (X), level = X-Y. mode 'level' replays the current level from its start, anything else
   ('stage') goes back to the first level of the current stage (X-1). Both refill lives, count a continue and
   keep earlier progress, best times and unlocks. Endless Run has no stage and never gets here. */
function stageFirstIndex(idx) {
  var w = LV.LEVELS[idx].world, i = idx;
  while (i > 0 && LV.LEVELS[i - 1].world === w) i--;
  return i;
}
function continueStage(mode) {
  var carry = { deaths: run.deaths, continues: (run.continues | 0) + 1 };
  save.continues = (save.continues | 0) + 1; writeSave(); sfx('ok');
  if (mode === 'stage' && lastLevel >= 0) startLevel(stageFirstIndex(lastLevel), carry);
  else startLevel(lastLevel, carry);                   /* same level from its start, lives refilled */
}
/* small print for the two buttons: which level each one starts */
function outNotes() {
  var first = lastLevel >= 0 ? stageFirstIndex(lastLevel) : 0;
  return { level: 'Replay level ' + L.id + ' from its start', stage: first === lastLevel ? 'Level ' + L.id + ' is the first level, so same as above' : 'Go back to level ' + LV.LEVELS[first].id };
}
function endRun() {
  state = 'over'; menuSel = 0;
  run.newBest = run.dist > (save.endless || 0);
  if (run.newBest) { save.endless = run.dist; writeSave(); }
}

/* ================= menus ================= */
function navMenu(n) {
  if (hit.U) { menuSel = (menuSel + n - 1) % n; sfx('move'); }
  if (hit.D) { menuSel = (menuSel + 1) % n; sfx('move'); }
  if (hit.A || hit.J) return menuSel;
  for (var i = 0; i < taps.length; i++) for (var j = 0; j < menuRects.length; j++) if (tapIn(taps[i], menuRects[j])) { menuSel = menuRects[j].i; return menuSel; }
  return -1;
}
function pauseItems() { return ['RESUME', 'RESTART', 'LEVELS', 'SOUND ' + (save.muted ? 'OFF' : 'ON')]; }
function clearItems() { return run.final ? ['LEVELS', 'RETRY'] : ['NEXT', 'RETRY', 'LEVELS']; }

function stepMenus() {
  var pick, items, i, p, b;
  if (hit.M) { save.muted = !save.muted; writeSave(); }
  if (state === 'title') {
    stepPlay();
    if (hit.A || hit.J || taps.length) { sfx('ok'); toSelect(); }
  } else if (state === 'select') {
    stepSelect();
  } else if (state === 'play') {
    if (hit.P || hit.B) { openPause(); return; }
    stepPlay();
  } else if (state === 'pause') {
    if (hit.P || hit.B) { state = 'play'; return; }
    items = pauseItems(); pick = navMenu(items.length);
    if (pick === 0) state = 'play';
    else if (pick === 1) { sfx('ok'); if (lastLevel >= 0) startLevel(lastLevel); else startEndless(); }
    else if (pick === 2) { sfx('ok'); toSelect(); }
    else if (pick === 3) { save.muted = !save.muted; writeSave(); sfx('ok'); }
  } else if (state === 'clear') {
    stepEffects();
    items = clearItems(); pick = navMenu(items.length);
    if (pick >= 0) {
      sfx('ok');
      if (items[pick] === 'NEXT') { selRow = Math.floor((lastLevel + 1) / 3); selCol = (lastLevel + 1) % 3; startLevel(lastLevel + 1); }
      else if (items[pick] === 'RETRY') startLevel(lastLevel);
      else toSelect();
    }
  } else if (state === 'out') {
    stepEffects();
    if (outT > 0) outT--;
    else if (hit.A || hit.J) UI.outKey();
    else if (hit.B) { sfx('ok'); toSelect(); }
  } else if (state === 'over') {
    stepEffects();
    pick = navMenu(2);
    if (pick === 0) { sfx('ok'); startEndless(); }
    else if (pick === 1) { sfx('ok'); toSelect(); }
  }
}

/* level select grid: rows 0-3 are worlds (3 levels each), row 4 is Endless Run */
var SEL_X = 118, SEL_DX = 66, SEL_Y = 26, SEL_DY = 27, BOX_W = 58, BOX_H = 22;
function selRect(row, col) {
  if (row === 4) return { x: SEL_X, y: SEL_Y + 4 * SEL_DY, w: SEL_DX * 2 + BOX_W, h: 18 };
  return { x: SEL_X + col * SEL_DX, y: SEL_Y + row * SEL_DY, w: BOX_W, h: BOX_H };
}
function trySelect() {
  if (selRow === 4) { sfx('ok'); startEndless(); return; }
  var idx = selRow * 3 + selCol;
  if (idx < save.unlocked) { sfx('ok'); startLevel(idx); } else sfx('no');
}
function stepSelect() {
  var i, r, c, p;
  if (hit.B) { sfx('move'); toTitle(); return; }
  if (hit.U) { selRow = (selRow + 4) % 5; sfx('move'); }
  if (hit.D) { selRow = (selRow + 1) % 5; sfx('move'); }
  if (selRow < 4) {
    if (hit.L) { selCol = (selCol + 2) % 3; sfx('move'); }
    if (hit.R) { selCol = (selCol + 1) % 3; sfx('move'); }
  }
  if (hit.A || hit.J) { trySelect(); return; }
  for (i = 0; i < taps.length; i++) {
    p = taps[i];
    if (tapIn(p, selRect(4, 0))) { selRow = 4; trySelect(); return; }
    for (r = 0; r < 4; r++) for (c = 0; c < 3; c++) if (tapIn(p, selRect(r, c))) { selRow = r; selCol = c; trySelect(); return; }
    if (p.y < 20 && p.x < 60) { toTitle(); return; }
  }
}

/* ================= render ================= */
var STARS = [];
for (var si = 0; si < 48; si++) STARS.push({ x: hsh(si * 3 + 1) * 640, y: 4 + hsh(si * 3 + 2) * 86, b: hsh(si * 3 + 3) });

function drawBackground(TH, cx) {
  var i, s, x, y, wx, on, fx, base, i0, h, w, wy, wxx;
  g.drawImage(skyFor(TH), 0, 0);
  if (TH.stars) for (i = 0; i < STARS.length; i++) {
    s = STARS[i];
    x = ((s.x - cx * 0.05) % 640 + 640) % 640;
    if (x > W) continue;
    on = ((frame + s.b * 200) % 200) > 20;
    rect(x | 0, s.y | 0, 1, 1, on ? '#ffffff' : '#8f86c9');
  }
  if (TH.aurora) for (x = 0; x < W; x += 2) {
    wx = x + cx * 0.08;
    y = 26 + Math.sin(wx * 0.021 + frame * 0.01) * 9 + Math.sin(wx * 0.053) * 4;
    g.fillStyle = 'rgba(124,242,124,.18)'; g.fillRect(x, y | 0, 2, 14);
    g.fillStyle = 'rgba(94,242,255,.14)'; g.fillRect(x, (y + 12) | 0, 2, 10);
  }
  fx = cx * 0.2; base = 132; i0 = Math.floor(fx / 26) - 1;
  for (i = i0; i < i0 + 16; i++) {
    h = (26 + hsh(i) * 62) | 0; w = (14 + hsh(i + 77) * 8) | 0; x = (i * 26 - fx) | 0;
    rect(x, base - h, w, h, TH.far);
    rect(x + (w >> 1) - 1, base - h - 4, 2, 4, TH.far);
    for (wy = base - h + 4; wy < base - 4; wy += 6)
      for (wxx = x + 3; wxx < x + w - 2; wxx += 4)
        if (hsh(i * 131 + wy * 7 + (wxx - x)) > 0.55 && ((frame >> 5) + wy + wxx) % 9) rect(wxx, wy, 2, 2, TH.lit);
  }
  for (x = 0; x < W; x += 2) {
    wx = x + cx * 0.45;
    y = (128 + Math.sin(wx * 0.018) * 9 + Math.sin(wx * 0.043) * 5) | 0;
    rect(x, y, 2, H - y, TH.hill); rect(x, y, 2, 2, TH.hillTop);
  }
}

function drawGround(TH, x, y, top, leftOpen, rightOpen, c, r) {
  rect(x, y, T, T, top ? TH.gnd : TH.gndD);
  rect(x + 15, y, 1, T, TH.grid);
  rect(x, y + 15, T, 1, TH.grid);
  if (hsh(c * 17 + r * 3) > 0.5) rect(x + 4, y + 7, 2, 2, TH.grid);
  if (top) {
    rect(x, y, T, 2, TH.edge); rect(x, y + 2, T, 1, TH.edgeD);
    if (hsh(c * 5 + 1) > 0.4) { rect(x + 6, y + 3, 1, 4, TH.edgeD); rect(x + 5, y + 7, 3, 2, TH.edgeD); }
    if (TH.ice && hsh(c * 9) > 0.5) rect(x + 10, y + 3, 2, 3, '#ffffff');
  }
  if (leftOpen) rect(x, y, 1, T, TH.edgeD);
  if (rightOpen) rect(x + 15, y, 1, T, TH.edgeD);
}
function drawCrate(TH, x, y) {
  rect(x, y, T, T, '#1b1830');
  rect(x + 1, y + 1, 14, 14, TH.crateD);
  rect(x + 2, y + 2, 12, 11, TH.crate);
  rect(x + 2, y + 2, 12, 1, TH.crateL);
  rect(x + 3, y + 6, 6, 1, TH.crateL); rect(x + 8, y + 6, 1, 5, TH.crateL); rect(x + 7, y + 10, 3, 2, TH.crateL);
  rect(x + 11, y + 4, 2, 2, TH.crateD);
}
function drawPlatRect(TH, x, y, w) {
  rect(x, y, w, 7, '#1b1830');
  rect(x + 1, y + 1, w - 2, 5, TH.plat);
  rect(x + 1, y + 1, w - 2, 1, TH.edge);
  for (var i = 3 + ((frame >> 4) % 3) * 4; i < w - 3; i += 12) rect(x + i, y + 3, 2, 2, TH.edge);
}
function drawSpikes(x, y) {
  for (var k = 0; k < 3; k++) {
    var sx = x + 1 + k * 5;
    rect(sx + 2, y + 8, 1, 8, '#1b1830'); rect(sx + 1, y + 11, 3, 5, '#1b1830'); rect(sx, y + 14, 5, 2, '#1b1830');
    rect(sx + 2, y + 9, 1, 6, '#e8e6ff'); rect(sx + 1, y + 12, 2, 3, '#b9bfe8');
  }
}
function drawLiquid(TH, x, y, top, c) {
  rect(x, y, T, T, TH.liq);
  if (top) {
    var k, wy;
    for (k = 0; k < T; k += 2) { wy = (Math.sin((c * T + k) * 0.35 + frame * 0.12) * 1.5) | 0; rect(x + k, y + 3 + wy, 2, 2, TH.liqHi); }
    if (hsh(c * 7 + (frame >> 4)) > 0.85) rect(x + 6, y + 6, 2, 2, TH.liqHi);
  } else if (hsh(c * 3 + y) > 0.6) rect(x + 9, y + 7, 2, 2, TH.liqHi);
}
var PORTAL = ['#5ef2ff', '#b48cff', '#ffd447', '#ff5d73'];
function drawGate(gx, gy, label, cx) {
  var x = (gx - cx) | 0, ph = 52, k, px, y;
  for (k = 0; k < 2; k++) {
    px = x + k * 30;
    rect(px, gy - ph, 6, ph, '#1b1830'); rect(px + 1, gy - ph + 1, 4, ph - 1, '#6f74a8'); rect(px + 1, gy - ph + 1, 1, ph - 1, '#b9bfe8');
  }
  rect(x - 2, gy - ph - 6, 40, 7, '#1b1830'); rect(x - 1, gy - ph - 5, 38, 5, '#8a93c8');
  g.globalAlpha = 0.55;
  for (y = gy - ph + 1; y < gy; y += 2) { g.fillStyle = PORTAL[((y + frame) >> 2) & 3]; g.fillRect(x + 6, y, 24, 2); }
  g.globalAlpha = 1;
  rect(x + 17, gy - ph - 20, 2, 14, '#1b1830');
  rect(x + 19, gy - ph - 20, 14, 8, '#ff5d73');
  txt(label, x + 21, gy - ph - 19, '#ffffff');
}
function drawCheck(k, cx) {
  var x = (k.x - cx) | 0, y = k.y, wave = (frame >> 3) & 1;
  rect(x, y - 26, 2, 26, '#1b1830'); rect(x + 1, y - 26, 1, 26, '#b9bfe8');
  rect(x - 2, y - 2, 6, 2, '#1b1830');
  rect(x + 2, y - 26 + wave, 10, 7, k.on ? '#5ef2ff' : '#6f74a8');
  rect(x + 2, y - 26 + wave, 10, 1, k.on ? '#ffffff' : '#8a93c8');
}
function drawSpring(s, cx) {
  var x = (s.x - cx) | 0, sq = s.squash > 0 ? 3 : 0, y = s.y + sq;
  rect(x + 1, s.y + 6, 14, 2, '#1b1830');
  rect(x + 3, y + 2, 10, 5 - sq, '#8a93a8');
  for (var k = 0; k < 3; k++) rect(x + 3, y + 3 + k * 2 - (sq ? k : 0), 10, 1, '#1b1830');
  rect(x, y - 1, 16, 3, '#1b1830'); rect(x + 1, y - 1, 14, 2, '#ff5d73'); rect(x + 1, y - 1, 14, 1, '#ffb3c0');
}
function drawMover(TH, m, cx) { drawPlatRect(TH, (m.x - cx) | 0, m.y | 0, m.w); }

function drawLevel(TH, cx) {
  var c0 = Math.floor(cx / T), ox = c0 * T - cx, i, c, r, x, t, up, ch, f, dk, sc, img;
  for (i = 0; i <= 21; i++) {
    c = c0 + i; x = ox + i * T;
    for (r = 0; r < ROWS; r++) {
      t = L.tile(c, r);
      if (t === '.') continue;
      if (t === '#') { up = L.tile(c, r - 1); drawGround(TH, x, r * T, !isSolidT(up), !isSolidT(L.tile(c - 1, r)), !isSolidT(L.tile(c + 1, r)), c, r); }
      else if (t === 'X') drawCrate(TH, x, r * T);
      else if (t === '=') drawPlatRect(TH, x, r * T, T);
      else if (t === '^') drawSpikes(x, r * T);
      else if (t === '~') drawLiquid(TH, x, r * T, L.tile(c, r - 1) !== '~', c);
    }
  }
  for (i = 0; i < L.movers.length; i++) drawMover(TH, L.movers[i], cx);
  for (i = 0; i < L.springs.length; i++) drawSpring(L.springs[i], cx);
  for (i = 0; i < L.checks.length; i++) drawCheck(L.checks[i], cx);
  if (L.goal) drawGate(L.goal.x, L.goal.lvl * T, 'GO', cx);
  for (i = 0; i < L.chips.length; i++) {
    ch = L.chips[i]; if (ch.got) continue;
    x = (ch.x - cx) | 0; if (x < -10 || x > W) continue;
    g.drawImage(CHIP, x, (ch.y + Math.sin(frame * 0.09 + ch.ph) * 1.5) | 0);
  }
  for (i = 0; i < L.disks.length; i++) {
    dk = L.disks[i]; if (dk.got) continue;
    x = (dk.x - cx) | 0; if (x < -12 || x > W) continue;
    sc = Math.abs(Math.cos(frame * 0.06)); sc = Math.max(2, Math.round(10 * sc));
    g.drawImage(DISK, x + ((10 - sc) >> 1), (dk.y + Math.sin(frame * 0.07) * 1.5) | 0, sc, 10);
  }
  for (i = 0; i < L.foes.length; i++) {
    f = L.foes[i]; if (f.gone) continue;
    x = (f.x - cx) | 0; if (x < -16 || x > W + 4) continue;
    if (f.type === 'bug') g.drawImage(f.dead ? BUG_FLAT : BUG[(f.anim >> 3) & 1], x, (f.dead ? f.y + f.h - 4 : f.y) | 0);
    else if (f.type === 'spark') g.drawImage(SPARK[(f.anim >> 2) & 1], x, f.y | 0);
    else { img = f.dead ? DRONE_FLAT : DRONE[(f.anim >> 1) & 1]; if (f.dir < 0 && !f.dead) img = DRONE_FLIP[(f.anim >> 1) & 1]; g.drawImage(img, x, (f.dead ? f.y + 4 : f.y - 1) | 0); }
  }
}
var DRONE_FLIP = [flipped(DRONE[0]), flipped(DRONE[1])];

function drawHero(cx) {
  if (hero.dead) return;
  if (hero.hurt && ((frame >> 2) & 1)) return;
  var key = 'stand';
  if (!hero.onGround) key = 'jump';
  else if (Math.abs(hero.vx) > 0.2) key = ['runA', 'stand', 'runB', 'stand'][((hero.anim / 6) | 0) & 3];
  g.drawImage(HERO[key][hero.face > 0 ? 0 : 1], (hero.x - cx - 2) | 0, (hero.y - 1) | 0);
}
function drawEffects(cx) {
  var i, p, f;
  for (i = 0; i < parts.length; i++) { p = parts[i]; rect((p.x - cx) | 0, p.y | 0, p.life > 8 ? 2 : 1, p.life > 8 ? 2 : 1, p.col); }
  for (i = 0; i < floats.length; i++) { f = floats[i]; txt(f.s, (f.x - cx) | 0, f.y | 0, f.col, 1, '#1b1830'); }
}
function drawBanner() {
  if (!banner) return;
  var bw = Math.max(tw(banner.text, 2), tw(banner.sub || '')) + 20, bh = banner.sub ? 32 : 22, bx = ((W - bw) / 2) | 0, by = 34;
  rect(bx - 2, by - 2, bw + 4, bh + 4, '#000000'); rect(bx, by, bw, bh, 'rgba(22,19,43,.92)');
  rect(bx, by, bw, 1, banner.col);
  txtC(banner.text, by + 6, banner.col, 2, '#1b1830');
  if (banner.sub) txtC(banner.sub, by + 22, '#ece9ff');
}
function battery(x, y, full) {
  rect(x, y, 8, 5, '#1b1830'); rect(x + 8, y + 1, 1, 3, '#1b1830');
  rect(x + 1, y + 1, 6, 3, full ? '#7cf27c' : '#3b3566');
}
function diskIcon(x, y, got, saved) {
  rect(x, y, 5, 5, '#1b1830');
  rect(x + 1, y + 1, 3, 3, got ? '#ffd447' : (saved ? '#8a6412' : '#3b3566'));
}
function drawLives(x, y) {
  var i, rows = ['.XX.XX.', 'X..X..X', '.XX.XX.'];
  g.drawImage(HEART, x, y);
  if (run.lives < 0) { for (i = 0; i < 21; i++) if (rows[(i / 7) | 0].charAt(i % 7) === 'X') rect(x + 9 + (i % 7), y + 2 + ((i / 7) | 0), 1, 1, '#ffffff'); }
  else txt('x' + run.lives, x + 9, y + 1, run.lives === 1 ? '#ff5d73' : '#ffffff');
}
function drawPlayHud(TH) {
  var i, s, ls, label;
  g.fillStyle = 'rgba(8,6,20,.62)'; g.fillRect(0, 0, W, 11);
  if (L.kind === 'static') {
    txt(L.id, 4, 3, TH.edge);
    for (i = 0; i < 3; i++) battery(22 + i * 11, 3, hero.hp > i);
    g.drawImage(CHIP, 58, 1, 9, 9);
    txt('x' + run.chips + '/' + L.totalChips, 69, 3, '#ffffff');
    ls = save.lv[L.id];
    for (i = 0; i < 3; i++) diskIcon(112 + i * 7, 3, run.disks[i], ls && ls.disks && ls.disks[i]);
    drawLives(142, 2);
    s = fmtTime(run.frames); txt(s, W - 4 - tw(s), 3, '#ffffff');
  } else {
    txt('RUN', 4, 3, TH.edge);
    for (i = 0; i < 3; i++) battery(20 + i * 11, 3, hero.hp > i);
    g.drawImage(CHIP, 56, 1, 9, 9); txt('x' + run.chips, 67, 3, '#ffffff');
    label = run.dist + 'M'; txt(label, W - 4 - tw(label), 3, '#ffffff');
    label = 'BEST ' + (save.endless || 0) + 'M'; txt(label, W - 12 - tw(run.dist + 'M') - tw(label), 3, '#a29dc9');
  }
}

/* menus drawn on the canvas; menuRects records tap targets */
function drawMenu(items, y0) {
  var i, s, y, w;
  menuRects = [];
  for (i = 0; i < items.length; i++) {
    s = items[i]; y = y0 + i * 15; w = tw(s, 2);
    if (i === menuSel) { txt('>', ((W - w) / 2 | 0) - 12, y, '#ffd447', 2); txtC(s, y, '#ffd447', 2, '#6b1d78'); }
    else txtC(s, y, '#ece9ff', 2);
    menuRects.push({ x: ((W - w) / 2 | 0) - 14, y: y - 3, w: w + 28, h: 15, i: i });
  }
}
function panel(x, y, w, h, col) {
  rect(x - 2, y - 2, w + 4, h + 4, '#000000'); rect(x, y, w, h, 'rgba(22,19,43,.94)');
  rect(x, y, w, 1, col); rect(x, y + h - 1, w, 1, col);
}

function renderTitle() {
  var TH = curTheme(), cx = Math.floor(camX), d = totalDisks(), s;
  drawBackground(TH, cx); drawLevel(TH, cx); drawHero(cx); drawEffects(cx);
  g.fillStyle = 'rgba(8,6,20,.55)'; g.fillRect(0, 22, W, 92);
  txtC('BYTE RUNNER', 32, '#ffd447', 4, '#6b1d78');
  txtC('QUEST', 60, '#5ef2ff', 3, '#1b1830');
  if ((frame >> 5) & 1) txtC(TOUCH ? 'TAP TO START' : 'PRESS ENTER OR SPACE', 92, '#ffffff', 1, '#1b1830');
  s = 'DISKS ' + d + '/' + (NLEV * 3);
  txt(s, W - 4 - tw(s), 4, '#ffd447', 1, '#1b1830');
  rect(0, H - 12, W, 12, 'rgba(8,6,20,.7)');
  txtC('ARROWS MOVE  SPACE JUMP  P PAUSE  M SOUND', H - 9, '#a29dc9');
}

function renderSelect() {
  var TH = THEMES[selRow < 4 ? selRow : (Math.floor(frame / 240) % 4)], cx = frame * 0.6, r, c, idx, b, ls, unlocked, lv, x, y, i, s, blink;
  drawBackground(TH, cx);
  g.fillStyle = 'rgba(8,6,20,.62)'; g.fillRect(0, 0, W, H);
  txtC('SELECT LEVEL', 6, '#ffd447', 2, '#6b1d78');
  txt('< ESC', 4, 8, '#a29dc9');
  s = 'DISKS ' + totalDisks() + '/' + (NLEV * 3); txt(s, W - 4 - tw(s), 8, '#ffd447');
  blink = (frame >> 4) & 1;
  for (r = 0; r < 4; r++) {
    y = SEL_Y + r * SEL_DY;
    txt(THEMES[r].name, 8, y + 8, THEMES[r].edge, 1, '#1b1830');
    txt('WORLD ' + (r + 1), 8, y + 15, '#a29dc9');
    for (c = 0; c < 3; c++) {
      idx = r * 3 + c; b = selRect(r, c); lv = LV.LEVELS[idx]; ls = save.lv[lv.id]; unlocked = idx < save.unlocked;
      rect(b.x, b.y, b.w, b.h, unlocked ? '#1d1938' : '#0f0d1e');
      rect(b.x, b.y, b.w, 1, THEMES[r].edge); rect(b.x, b.y + b.h - 1, b.w, 1, '#000000');
      if (unlocked) {
        txt(lv.id, b.x + 4, b.y + 4, '#ffffff', 2);
        for (i = 0; i < 3; i++) diskIcon(b.x + 4 + i * 7, b.y + 15, false, ls && ls.disks && ls.disks[i]);
        if (ls && ls.done) { s = fmtTime(ls.best); txt(s.substring(0, s.length - 2), b.x + b.w - 3 - tw(s.substring(0, s.length - 2)), b.y + 15, '#7cf27c'); }
      } else {
        rect(b.x + 25, b.y + 10, 8, 7, '#3b3566'); rect(b.x + 26, b.y + 6, 1, 4, '#3b3566'); rect(b.x + 31, b.y + 6, 1, 4, '#3b3566'); rect(b.x + 26, b.y + 5, 6, 1, '#3b3566');
      }
      if (selRow === r && selCol === c) { g.strokeStyle = blink ? '#ffffff' : '#ffd447'; g.lineWidth = 2; g.strokeRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2); }
    }
  }
  b = selRect(4, 0);
  rect(b.x, b.y, b.w, b.h, '#1d1938'); rect(b.x, b.y, b.w, 1, '#5ef2ff');
  txt('ENDLESS RUN', b.x + 6, b.y + 6, '#5ef2ff');
  s = 'BEST ' + (save.endless || 0) + 'M'; txt(s, b.x + b.w - 6 - tw(s), b.y + 6, '#ffffff');
  txt('BONUS', 8, b.y + 6, '#a29dc9');
  if (selRow === 4) { g.strokeStyle = blink ? '#ffffff' : '#ffd447'; g.lineWidth = 2; g.strokeRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2); }
  rect(0, H - 12, W, 12, 'rgba(8,6,20,.8)');
  if (selRow < 4) {
    idx = selRow * 3 + selCol; lv = LV.LEVELS[idx];
    s = idx < save.unlocked ? lv.id + ' ' + lv.name : 'LOCKED: CLEAR ' + LV.LEVELS[idx - 1].id + ' FIRST';
  } else s = 'RANDOM LEVEL, ONE LIFE, GO AS FAR AS YOU CAN';
  txtC(s, H - 9, '#ece9ff');
}

function renderPlay() {
  var TH = curTheme(), cx = Math.floor(camX);
  drawBackground(TH, cx); drawLevel(TH, cx); drawHero(cx); drawEffects(cx);
  drawPlayHud(TH);
  drawBanner();
}
function renderOut() { renderPlay(); g.fillStyle = 'rgba(8,6,20,.5)'; g.fillRect(0, 0, W, H); }
function renderPause() {
  renderPlay();
  g.fillStyle = 'rgba(8,6,20,.7)'; g.fillRect(0, 0, W, H);
  panel(90, 30, 140, 112, '#5ef2ff');
  txtC('PAUSED', 38, '#5ef2ff', 2);
  drawMenu(pauseItems(), 62);
}
function renderClear() {
  var TH = curTheme(), cx = Math.floor(camX), ls = save.lv[L.id], i, s;
  drawBackground(TH, cx); drawLevel(TH, cx); drawHero(cx); drawEffects(cx);
  g.fillStyle = 'rgba(8,6,20,.55)'; g.fillRect(0, 0, W, H);
  panel(60, 14, 200, 150, '#ffd447');
  txtC(run.final ? 'ALL LEVELS CLEAR!' : 'LEVEL CLEAR!', 22, '#ffd447', 2, '#6b1d78');
  txtC(L.id + ' ' + L.name, 40, '#ece9ff');
  s = 'TIME ' + fmtTime(run.frames) + (run.newBest ? '  NEW BEST!' : '  BEST ' + fmtTime(ls.best));
  txtC(s, 54, run.newBest ? '#7cf27c' : '#ffffff');
  txtC('CHIPS ' + run.chips + '/' + L.totalChips + '   DEATHS ' + run.deaths + (run.continues ? '   CONTINUES ' + run.continues : ''), 64, '#ffffff');
  txt('DISKS', 118, 75, '#ffffff');
  for (i = 0; i < 3; i++) diskIcon(142 + i * 9, 75, run.disks[i], ls.disks[i]);
  drawMenu(clearItems(), 96);
}
function renderOver() {
  var TH = curTheme(), cx = Math.floor(camX);
  drawBackground(TH, cx); drawLevel(TH, cx); drawEffects(cx);
  g.fillStyle = 'rgba(8,6,20,.6)'; g.fillRect(0, 0, W, H);
  panel(70, 22, 180, 128, '#ff5d73');
  txtC('RUN OVER', 30, '#ff5d73', 2);
  txtC('DISTANCE ' + run.dist + 'M', 52, '#ffffff', 1);
  txtC(run.newBest ? 'NEW BEST!' : 'BEST ' + save.endless + 'M', 62, run.newBest ? '#7cf27c' : '#a29dc9');
  txtC('CHIPS ' + run.chips, 72, '#ffffff');
  drawMenu(['RETRY', 'LEVELS'], 96);
}

function render() {
  if (state === 'title') renderTitle();
  else if (state === 'select') renderSelect();
  else if (state === 'play') renderPlay();
  else if (state === 'out') renderOut();
  else if (state === 'pause') renderPause();
  else if (state === 'clear') renderClear();
  else if (state === 'over') renderOver();
  if (save.muted && state !== 'title') txt('MUTE', W - 20, H - 8, '#a29dc9');
}

/* ================= main loop (fixed 60 Hz) ================= */
function step() {
  frame++;
  stepMenus();
  hit = {}; taps = [];
  if (uiState !== state) {
    uiState = state;
    UI.showOut(state === 'out', run ? run.deaths : 0, outNotes());
  }
}
var uiState = '';
var acc = 0, last = now();
var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (cb) { return setTimeout(function () { cb(now()); }, 16); };
function loop(t) {
  acc += Math.min(0.1, (t - last) / 1000); last = t;
  var n = 0;
  while (acc >= 1 / 60 && n < 6) { step(); acc -= 1 / 60; n++; }
  render();
  raf(loop);
}
var pauseBtn = document.getElementById('pausebtn');
if (pauseBtn) pauseBtn.addEventListener('click', function () { if (state === 'out') return; if (state === 'play') openPause(); else if (state === 'pause') state = 'play'; });

UI.init({
  press: function (k) { audioInit(); keyDown(k); },
  release: function (k) { keyUp(k); },
  tap: function (p) { audioInit(); taps.push(p); },
  continueStage: function (mode) { if (state === 'out') continueStage(mode); },
  levels: function () { if (state === 'out') { sfx('ok'); toSelect(); } },
  turn: function () { audioInit(); setRunDir(-curDir); sfx('move'); },
  getState: function () { return state; },
  pause: function () { if (state === 'play') { openPause(); return true; } return false; },
  resume: function () { if (state === 'pause') state = 'play'; },
  changed: function (name) {
    if (name === 'autoDir' || name === 'auto') setRunDir(UI.cfg.autoDir);
    if (name === 'lives' && L && L.kind === 'static' && run && (state === 'play' || state === 'pause')) run.lives = livesMax();   /* refill right away */
  }
});
toTitle();
raf(loop);

/* ================= test hooks ================= */
function snapshot() {
  var i, foes = [], movers = [];
  for (i = 0; i < L.foes.length; i++) foes.push(L.foes[i]);
  return JSON.stringify({ hero: hero, foes: L.foes, chips: L.chips.map(function (c) { return c.got; }), disks: L.disks.map(function (d) { return d.got; }),
    checks: L.checks.map(function (k) { return k.on; }), springs: L.springs.map(function (s) { return s.squash; }), movers: L.movers,
    lf: lf, camX: camX, cp: cp, run: run, state: state });
}
function restore(js) {
  var o = JSON.parse(js), k, i;
  for (k in o.hero) if (o.hero.hasOwnProperty(k)) hero[k] = o.hero[k];
  L.foes = o.foes; L.movers = o.movers;
  for (i = 0; i < L.chips.length; i++) L.chips[i].got = o.chips[i];
  for (i = 0; i < L.disks.length; i++) L.disks[i].got = o.disks[i];
  for (i = 0; i < L.checks.length; i++) L.checks[i].on = o.checks[i];
  for (i = 0; i < L.springs.length; i++) L.springs[i].squash = o.springs[i];
  lf = o.lf; camX = o.camX; cp = o.cp; run = o.run; state = o.state;
}
window.__brq = {
  state: function () { return state; }, hero: hero, level: function () { return L; }, run: function () { return run; },
  startLevel: startLevel, startEndless: startEndless, toSelect: toSelect, toTitle: toTitle,
  snapshot: snapshot, restore: restore, save: function () { return save; }, down: down,
  stepWith: function (inp) { forcedInput = inp; frame++; if (state === 'play') stepPlay(); forcedInput = null; return state; },
  step: step, render: render, livesMax: livesMax, setSel: function (r, c) { selRow = r; selCol = c; }
};
})();
