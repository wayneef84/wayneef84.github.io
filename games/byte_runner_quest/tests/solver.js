/* Byte Runner Quest level checker. Open the game, paste this file into the browser console, then run
   __solve(levelIndex, "goal") or __solve(levelIndex, diskIndex). It searches 6-frame input macros with the
   real game physics and reports ok: true when the goal or disk is reachable without taking damage.
   Dev tool only, never loaded by the game. */
window.__solve = function (levelIdx, target, opts) {
  opts = opts || {};
  var B = window.__brq, K = 6, MAXN = opts.maxNodes || 40000, allowHurt = !!opts.allowHurt;
  B.startLevel(levelIdx);
  var L = B.level();
  var ACTS = [
    { n: 'R', r: 1, j: 0, hold: 0 }, { n: 'RJ', r: 1, j: 1, hold: 6 }, { n: 'Rj', r: 1, j: 1, hold: 2 },
    { n: '.', r: 0, j: 0, hold: 0 }, { n: 'J', r: 0, j: 1, hold: 6 }, { n: 'L', l: 1, j: 0, hold: 0 }, { n: 'LJ', l: 1, j: 1, hold: 6 }
  ];
  var goalX = L.goal.x + 21;
  function hval() {
    var h = B.hero;
    if (target === 'goal') return goalX - h.x;
    var d = L.disks[target]; return Math.abs(d.x + 5 - (h.x + 5)) + Math.abs(d.y + 5 - (h.y + 7)) * 1.5;
  }
  function done() { if (target === 'goal') return B.state() === 'clear'; return L.disks[target].got; }
  var heap = [];
  function push(n) { heap.push(n); var i = heap.length - 1; while (i > 0) { var p = (i - 1) >> 1; if (heap[p].f <= heap[i].f) break; var t = heap[p]; heap[p] = heap[i]; heap[i] = t; i = p; } }
  function pop() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var i = 0; for (;;) { var l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l].f < heap[m].f) m = l; if (r < heap.length && heap[r].f < heap[m].f) m = r; if (m === i) break; var t = heap[m]; heap[m] = heap[i]; heap[i] = t; i = m; } } return top; }
  var seen = {}, nodes = 0;
  function key() { var h = B.hero, lf = JSON.parse(B.snapshot()).lf; return Math.round(h.x / 3) + ',' + Math.round(h.y / 3) + ',' + Math.round(h.vy * 2) + ',' + h.ride + ',' + h.hp + ',' + (Math.floor(lf / 12) % 25); }
  push({ s: B.snapshot(), f: hval(), d: 0, path: '' });
  while (heap.length && nodes < MAXN) {
    var nd = pop(); nodes++;
    for (var a = 0; a < ACTS.length; a++) {
      var A = ACTS[a]; B.restore(nd.s);
      var ok = true, win = false;
      for (var k = 0; k < K; k++) {
        B.stepWith({ left: !!A.l, right: !!A.r, jumpPressed: A.j && k === 0, jumpHeld: A.j && k < A.hold });
        if (done()) { win = true; break; }
        var h = B.hero;
        if (h.dead || (!allowHurt && h.hp < 3) || B.state() !== 'play') { ok = false; break; }
      }
      if (win) return { ok: true, nodes: nodes, frames: (nd.d + 1) * K, path: nd.path + ' ' + A.n };
      if (!ok) continue;
      var kk = key(); if (seen[kk]) continue; seen[kk] = 1;
      push({ s: B.snapshot(), f: hval() + (nd.d + 1) * 0.6, d: nd.d + 1, path: nd.path + ' ' + A.n });
    }
  }
  return { ok: false, nodes: nodes, bestH: heap.length ? heap[0].f : null };
};
