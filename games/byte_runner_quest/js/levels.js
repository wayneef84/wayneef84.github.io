/*
 * Byte Runner Quest: level data. Strict ES5.
 *
 * Levels are built by joining segments left to right. Every segment is 11 rows
 * tall and starts and ends with ground on rows 9-10, so any order lines up.
 *
 * Tile legend
 *   #  ground (solid)          X  data crate (solid)        =  one-way platform
 *   ^  spikes (hurt)           ~  liquid (instant out)
 * Marker legend (turned into objects, the tile becomes empty)
 *   P  player start            K  checkpoint                G  goal gate
 *   c  data chip               D  golden disk (only kept when the segment is starred)
 *   b  bug (walks, stompable)  f  spark (bobs up and down, do not touch)
 *   F  drone (patrols left/right, stompable)
 *   M  moving platform, horizontal (marker = centre)      V  lift, vertical
 *   S  spring
 *
 * In a level recipe, 'NAME*' keeps the golden disk in that segment.
 * Every level must end up with exactly 3 disks (checked by build()).
 */
var BRQ_LEVELS = (function () {
  'use strict';

  var SEG = {
    START: [
      '........',
      '........',
      '........',
      '........',
      '........',
      '........',
      '........',
      '........',
      '..P.....',
      '########',
      '########'],
    FLAT: [
      '......',
      '......',
      '......',
      '......',
      '......',
      '......',
      '......',
      '..cc..',
      '......',
      '######',
      '######'],
    GAP2: [
      '........',
      '........',
      '........',
      '........',
      '........',
      '...cc...',
      '........',
      '........',
      '........',
      '###..###',
      '###..###'],
    GAP3: [
      '.........',
      '.........',
      '.........',
      '.........',
      '.........',
      '...ccc...',
      '.........',
      '.........',
      '.........',
      '###...###',
      '###...###'],
    CRATES: [
      '..........',
      '..........',
      '..........',
      '..........',
      '..........',
      '......c...',
      '..........',
      '......X...',
      '...X..X...',
      '##########',
      '##########'],
    STAIRS: [
      '............',
      '............',
      '............',
      '............',
      '.......D....',
      '............',
      '.......X....',
      '......XX....',
      '.....XXX....',
      '############',
      '############'],
    BUG: [
      '..........',
      '..........',
      '..........',
      '..........',
      '..........',
      '..........',
      '..........',
      '....cc....',
      '.......b..',
      '##########',
      '##########'],
    BUG2: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '.......c......',
      '..............',
      '...b...X...b..',
      '##############',
      '##############'],
    PLATS: [
      '............',
      '............',
      '............',
      '............',
      '........D...',
      '............',
      '...c....c...',
      '..===..===..',
      '............',
      '##........##',
      '##........##'],
    HIGHROAD: [
      '................',
      '................',
      '................',
      '...........D....',
      '..........===...',
      '................',
      '......===.......',
      '................',
      '...X............',
      '################',
      '################'],
    TUNNEL: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '..........D...',
      '..##########..',
      '...cccccccc...',
      '##############',
      '##############'],
    STEPUP: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '.......cc.....',
      '..............',
      '.....######...',
      '...########...',
      '##############',
      '##############'],
    PIT_BUG: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '...c..........',
      '..............',
      '..............',
      '........b.....',
      '###..#########',
      '###..#########'],
    DISK_PIT: [
      '............',
      '............',
      '............',
      '............',
      '............',
      '.....D......',
      '............',
      '............',
      '............',
      '####....####',
      '####....####'],
    CHECK: [
      '........',
      '........',
      '........',
      '........',
      '........',
      '........',
      '........',
      '........',
      '....K...',
      '########',
      '########'],
    GOAL: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '.....G..........',
      '################',
      '################'],

    /* ---- glacier: ice floors, moving platforms, lifts ---- */
    MOVER: [
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '.....c......',
      '.....M......',
      '............',
      '##........##',
      '##........##'],
    MOVER_DISK: [
      '................',
      '................',
      '................',
      '................',
      '.......D........',
      '................',
      '................',
      '....M......M....',
      '................',
      '##............##',
      '##............##'],
    VLIFT: [
      '.................',
      '........D........',
      '........cc.......',
      '.................',
      '......#####......',
      '......#####......',
      '......#####......',
      '......#####......',
      '...V..#####......',
      '#################',
      '#################'],

    /* ---- ember: liquid pits, sparks, drones ---- */
    LAVA2: [
      '........',
      '........',
      '........',
      '........',
      '........',
      '...cc...',
      '........',
      '........',
      '........',
      '###~~###',
      '###~~###'],
    LAVA_SPARK: [
      '..........',
      '..........',
      '..........',
      '..........',
      '..........',
      '....D.....',
      '.....f....',
      '..........',
      '..........',
      '###~~~~###',
      '###~~~~###'],
    LAVA_PLATS: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      '....c....c....',
      '..............',
      '..............',
      '....X....X....',
      '##~~X~~~~X~~##',
      '##~~X~~~~X~~##'],
    DRONE_RUN: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..........D...',
      '..............',
      '......F.......',
      '..............',
      '...X......X...',
      '##############',
      '##############'],
    LAVA_DISK: [
      '..............',
      '..............',
      '..............',
      '..............',
      '......D.......',
      '..............',
      '.....===......',
      '..............',
      '..X...........',
      '###~~~~~~~~###',
      '###~~~~~~~~###'],

    /* ---- jade: springs, spikes, mixed enemies ---- */
    SPRING_WALL: [
      '..............',
      '..............',
      '.........cc...',
      '..............',
      '.......####...',
      '.......####...',
      '.......####...',
      '.......####...',
      '....S..####...',
      '##############',
      '##############'],
    SPIKES: [
      '............',
      '............',
      '............',
      '............',
      '............',
      '....cDc.....',
      '............',
      '............',
      '....^^^.....',
      '############',
      '############'],
    SPIKE_PLAT: [
      '................',
      '................',
      '................',
      '...........D....',
      '................',
      '........f.......',
      '....c.....c.....',
      '...===....===...',
      '..^^^^^^^^^^^^..',
      '################',
      '################'],
    SPRING_DISK: [
      '............',
      '.....D......',
      '............',
      '............',
      '............',
      '.....cc.....',
      '............',
      '............',
      '.....S......',
      '############',
      '############'],
    JADE_BUGS: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '.....F..........',
      '.......cc.......',
      '..b.....X...b...',
      '################',
      '################']
  };

  var WORLDS = [
    { name: 'DUSK CIRCUIT', theme: 0, ice: false },
    { name: 'GLACIER GRID', theme: 1, ice: true },
    { name: 'EMBER CORE', theme: 2, ice: false },
    { name: 'JADE GARDEN', theme: 3, ice: false }
  ];

  var LEVELS = [
    { id: '1-1', world: 0, name: 'BOOT SEQUENCE',
      segs: ['START', 'FLAT', 'GAP2', 'FLAT', 'CRATES', 'BUG', 'STAIRS*', 'FLAT', 'CHECK', 'GAP2', 'PLATS*', 'BUG', 'TUNNEL*', 'FLAT', 'GOAL'] },
    { id: '1-2', world: 0, name: 'CACHE MISS',
      segs: ['START', 'BUG', 'GAP3', 'CRATES', 'STEPUP', 'CHECK', 'PIT_BUG', 'HIGHROAD*', 'BUG2', 'DISK_PIT*', 'FLAT', 'STAIRS*', 'GAP3', 'GOAL'] },
    { id: '1-3', world: 0, name: 'STACK OVERFLOW',
      segs: ['START', 'CRATES', 'BUG2', 'PLATS*', 'GAP3', 'CHECK', 'TUNNEL*', 'PIT_BUG', 'STEPUP', 'HIGHROAD*', 'BUG2', 'DISK_PIT', 'GOAL'] },

    { id: '2-1', world: 1, name: 'COLD BOOT',
      segs: ['START', 'FLAT', 'MOVER', 'BUG', 'GAP2', 'CHECK', 'STAIRS*', 'MOVER', 'PLATS*', 'TUNNEL*', 'FLAT', 'GOAL'] },
    { id: '2-2', world: 1, name: 'FROZEN THREAD',
      segs: ['START', 'BUG', 'MOVER', 'VLIFT*', 'CHECK', 'GAP3', 'MOVER_DISK*', 'BUG2', 'DISK_PIT*', 'GOAL'] },
    { id: '2-3', world: 1, name: 'ICE CACHE',
      segs: ['START', 'MOVER', 'BUG2', 'VLIFT*', 'GAP3', 'CHECK', 'MOVER_DISK*', 'STEPUP', 'MOVER', 'HIGHROAD*', 'BUG', 'GOAL'] },

    { id: '3-1', world: 2, name: 'HOT SWAP',
      segs: ['START', 'LAVA2', 'FLAT', 'CRATES', 'LAVA2', 'CHECK', 'DRONE_RUN*', 'LAVA_PLATS', 'LAVA_DISK*', 'BUG', 'LAVA_SPARK*', 'GOAL'] },
    { id: '3-2', world: 2, name: 'MELTDOWN',
      segs: ['START', 'LAVA_SPARK*', 'DRONE_RUN', 'LAVA_PLATS', 'CHECK', 'MOVER', 'LAVA_DISK*', 'BUG2', 'STAIRS*', 'LAVA2', 'GOAL'] },
    { id: '3-3', world: 2, name: 'OVERCLOCK',
      segs: ['START', 'LAVA_PLATS', 'LAVA_SPARK', 'DRONE_RUN*', 'CHECK', 'VLIFT*', 'LAVA_DISK*', 'LAVA2', 'BUG2', 'LAVA_SPARK', 'GOAL'] },

    { id: '4-1', world: 3, name: 'GREEN FIELD',
      segs: ['START', 'SPRING_WALL', 'SPIKES*', 'FLAT', 'BUG', 'CHECK', 'SPRING_DISK*', 'SPIKE_PLAT*', 'BUG2', 'GOAL'] },
    { id: '4-2', world: 3, name: 'ROOT ACCESS',
      segs: ['START', 'SPIKES', 'SPRING_WALL', 'JADE_BUGS', 'CHECK', 'SPIKE_PLAT*', 'MOVER', 'SPRING_DISK*', 'PLATS*', 'GOAL'] },
    { id: '4-3', world: 3, name: 'FINAL COMMIT',
      segs: ['START', 'SPIKE_PLAT', 'SPRING_WALL', 'LAVA_SPARK', 'CHECK', 'MOVER_DISK*', 'JADE_BUGS', 'VLIFT*', 'SPIKES*', 'DRONE_RUN', 'GOAL'] }
  ];

  /* Join the segments of one level into a tile grid plus a list of markers. */
  function build(index) {
    var def = LEVELS[index], rows = [], markers = [], width = 0, disks = 0, i, r, c, name, star, seg, ch, line;
    for (r = 0; r < 11; r++) rows.push([]);
    for (i = 0; i < def.segs.length; i++) {
      name = def.segs[i]; star = name.charAt(name.length - 1) === '*';
      if (star) name = name.substring(0, name.length - 1);
      seg = SEG[name];
      if (!seg) throw new Error('Unknown segment ' + name + ' in ' + def.id);
      if (seg.length !== 11) throw new Error('Segment ' + name + ' must have 11 rows');
      for (r = 0; r < 11; r++) {
        line = seg[r];
        if (line.length !== seg[0].length) throw new Error('Segment ' + name + ' row ' + r + ' has the wrong width');
        for (c = 0; c < line.length; c++) {
          ch = line.charAt(c);
          if ('#X=^~'.indexOf(ch) >= 0) { rows[r].push(ch); continue; }
          rows[r].push('.');
          if (ch === '.') continue;
          if (ch === 'D' && !star) continue;
          if (ch === 'D') disks++;
          markers.push({ ch: ch, c: width + c, r: r });
        }
      }
      width += seg[0].length;
    }
    if (disks !== 3) throw new Error('Level ' + def.id + ' has ' + disks + ' disks, needs 3');
    return { id: def.id, name: def.name, world: def.world, theme: WORLDS[def.world].theme, ice: WORLDS[def.world].ice,
             width: width, rows: rows, markers: markers };
  }

  return { SEG: SEG, WORLDS: WORLDS, LEVELS: LEVELS, build: build };
})();
