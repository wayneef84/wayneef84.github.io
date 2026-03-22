/**
 * WOSKY_3169 — Calc v2 Shared Config
 * Edit this file to update game data: tiers, costs, max levels, piece assignments.
 * Strict ES5 — no const/let/arrow functions/fetch.
 */
var WOSKY_V2_CONFIG = {

  /* ── Player piece assignments ───────────────────────────────────────────── */
  pieces: {
    infantry: ['chest', 'legs'],
    marksman: ['ring', 'offhand'],
    lancer:   ['helm', 'neck']
  },

  heroPieces: ['goggles', 'gloves', 'belt', 'boots'],

  groups: ['infantry', 'marksman', 'lancer'],

  /* ── Charms ─────────────────────────────────────────────────────────────── */
  charms: {
    maxLevel:     20,
    maxStep:      3,
    stepsPerLevel: 4,   /* steps 0-3 within each level */
    charmsPerPiece: 3   /* c1, c2, c3 */
  },

  /* ── Chief Gear ──────────────────────────────────────────────────────────── */
  /* Tier list order matters — index used for calcRange(fromIdx, toIdx) */
  /* gearTiers: now driven directly by WOSKY_GEAR_DATA.costs — IDs must match */
  /* Kept here for reference only; gear.html reads WOSKY_GEAR_DATA directly   */

  /* ── Hero Gear ───────────────────────────────────────────────────────────── */
  hero: {
    maxForge: 20,
    maxEmp:   200,
    /* Empowerment gates: [empMin, empMax, forgeRequired, mithrilCost, mythicCost] */
    /* [empMin, empMax, forgeRequired, mithrilCost, mythicCost] */
    gates: [
      [1,  20, 10,  0,  1],   /* E1-E20:   F10, 0 Mithril, 1 Mythic  */
      [21, 40, 11, 10,  2],   /* E21-E40:  F11, 10 Mithril, 2 Mythic */
      [41, 60, 12, 20,  3],   /* E41-E60:  F12, 20 Mithril, 3 Mythic */
      [61, 80, 13, 30,  4],   /* E61-E80:  F13, 30 Mithril, 4 Mythic */
      [81,100, 14, 40,  5],   /* E81-E100: F14, 40 Mithril, 5 Mythic */
      [101,200,15, 50, 10]    /* E101-E200: F15, 50 Mithril, 10 Mythic (unverified) */
    ]
  },

  /* ── SvS Day Guide ───────────────────────────────────────────────────────── */
  svsDays: [
    { day: 'Day 1', focus: 'Construction',       tip: 'Queue building upgrades. Use speed-ups on long timers.' },
    { day: 'Day 2', focus: 'Research',            tip: 'Queue research. Prioritize tech that boosts troop stats.' },
    { day: 'Day 3', focus: 'Charms',              tip: 'Upgrade charms. 70 SvS pts per charm level. Plan D/G spend vs pts target.' },
    { day: 'Day 4', focus: 'Mithril + Hero Gear', tip: 'Pass forge gates, empower hero gear. Mithril is the bottleneck.' },
    { day: 'Day 5', focus: 'Chief Gear + Cleanup',tip: 'Upgrade chief gear. Use remaining alloy/polish/plans. Open gear chests last.' }
  ],

  /* ── Default player state ────────────────────────────────────────────────── */
  defaults: {
    mats: {
      charm_designs:  6203,
      charm_guides:   3992,
      charm_secrets:  0,
      alloy:          838847,
      polish:         8696,
      plans:          3581,
      amber:          0,
      gear_chests:    2061,   /* each chest = 400 alloy + 4 polish + 1 plan */
      hero_xp:        447010,
      mithril:        120,
      mythic_gear:    36,
      essence_stones: 812
    },

    charms: {
      chest:   { c1:{l:6,s:3}, c2:{l:6,s:3},  c3:{l:6,s:3}  },
      legs:    { c1:{l:10,s:3},c2:{l:7,s:3},  c3:{l:6,s:3}  },
      ring:    { c1:{l:5,s:3}, c2:{l:5,s:3},  c3:{l:5,s:3}  },
      offhand: { c1:{l:9,s:3}, c2:{l:9,s:3},  c3:{l:8,s:3}  },
      helm:    { c1:{l:5,s:3}, c2:{l:5,s:3},  c3:{l:5,s:3}  },
      neck:    { c1:{l:8,s:3}, c2:{l:6,s:3},  c3:{l:5,s:3}  }
    },

    charmTargets: {
      chest:   { c1:{l:11,s:0}, c2:{l:11,s:0}, c3:{l:11,s:0} },
      legs:    { c1:{l:11,s:0}, c2:{l:11,s:0}, c3:{l:11,s:0} },
      ring:    { c1:{l:11,s:0}, c2:{l:11,s:0}, c3:{l:11,s:0} },
      offhand: { c1:{l:11,s:0}, c2:{l:11,s:0}, c3:{l:11,s:0} },
      helm:    { c1:{l:11,s:0}, c2:{l:11,s:0}, c3:{l:11,s:0} },
      neck:    { c1:{l:11,s:0}, c2:{l:11,s:0}, c3:{l:11,s:0} }
    },

    gear: {
      chest:   { cur:'pink-t1-3', tgt:'pink-t2' },
      legs:    { cur:'pink-t1-3', tgt:'pink-t2' },
      ring:    { cur:'pink-t1-1', tgt:'pink-t2' },
      offhand: { cur:'pink-t1',   tgt:'pink-t2' },
      helm:    { cur:'pink-t1',   tgt:'pink-t2' },
      neck:    { cur:'pink-t1',   tgt:'pink-t2' }
    },

    hero: {
      infantry: {
        goggles: { cf:11, ce:12,  tf:15, te:60, active:true },
        gloves:  { cf:15, ce:100, tf:15, te:60, active:true },
        belt:    { cf:15, ce:79,  tf:15, te:60, active:true },
        boots:   { cf:11, ce:20,  tf:15, te:60, active:true }
      },
      marksman: {
        goggles: { cf:12, ce:39, tf:15, te:60, active:true },
        boots:   { cf:13, ce:59, tf:15, te:60, active:true },
        gloves:  { cf:5,  ce:0,  tf:15, te:60, active:true },
        belt:    { cf:10, ce:0,  tf:15, te:60, active:true }
      },
      lancer: {
        goggles: { cf:12, ce:39, tf:15, te:60, active:true },
        boots:   { cf:13, ce:59, tf:15, te:60, active:true },
        gloves:  { cf:5,  ce:0,  tf:15, te:60, active:true },
        belt:    { cf:10, ce:0,  tf:15, te:60, active:true }
      }
    }
  }
};
