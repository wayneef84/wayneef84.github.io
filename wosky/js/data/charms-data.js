/**
 * WOSKY_3169 — Chief Charms Cost Data
 * Strict ES5.
 *
 * Charm levels run 1–20+. Each level has 3 steps (step 1, 2, 3).
 * Costs are PER STEP (not cumulative).
 *
 * Resources:
 *   d  = Charm Designs
 *   g  = Charm Guides
 *   s  = Charm Secrets (introduced at level 12 step 1)
 *
 * SvS scoring: 70 points per charm LEVEL upgrade (not per step).
 * A full level upgrade = completing steps 1 + 2 + 3 of that level.
 *
 * Sources: whiteoutsurvival.wiki / community data (verify before SvS).
 */

var WOSKY_CHARMS_DATA = {

    /* svs_pts_per_level — 70 pts per level completed */
    svs_pts_per_level: 70,

    /* gear pieces with display names */
    pieces: [
        { key: 'legs',    label: 'Legs'    },
        { key: 'offhand', label: 'Offhand' },
        { key: 'chest',   label: 'Chest'   },
        { key: 'neck',    label: 'Neck'    },
        { key: 'helm',    label: 'Helm'    },
        { key: 'ring',    label: 'Ring'    }
    ],

    /**
     * costs[level][step] = { d, g, s }
     * level: 1-based integer
     * step:  1, 2, or 3
     *
     * NOTE: "step 0" means the charm is at the START of that level (no substep done).
     * Steps 1-3 represent the three upgrade ticks within a level.
     * Completing step 3 finishes the level and moves to level+1 step 0.
     */
    costs: {
        1:  { 1: { d: 5,   g: 2,   s: 0   }, 2: { d: 5,   g: 2,   s: 0   }, 3: { d: 5,   g: 2,   s: 0   } },
        2:  { 1: { d: 10,  g: 4,   s: 0   }, 2: { d: 10,  g: 4,   s: 0   }, 3: { d: 10,  g: 4,   s: 0   } },
        3:  { 1: { d: 15,  g: 6,   s: 0   }, 2: { d: 15,  g: 6,   s: 0   }, 3: { d: 15,  g: 6,   s: 0   } },
        4:  { 1: { d: 20,  g: 8,   s: 0   }, 2: { d: 20,  g: 8,   s: 0   }, 3: { d: 20,  g: 8,   s: 0   } },
        5:  { 1: { d: 30,  g: 12,  s: 0   }, 2: { d: 30,  g: 12,  s: 0   }, 3: { d: 30,  g: 12,  s: 0   } },
        6:  { 1: { d: 40,  g: 16,  s: 0   }, 2: { d: 40,  g: 16,  s: 0   }, 3: { d: 40,  g: 16,  s: 0   } },
        7:  { 1: { d: 55,  g: 22,  s: 0   }, 2: { d: 55,  g: 22,  s: 0   }, 3: { d: 55,  g: 22,  s: 0   } },
        8:  { 1: { d: 70,  g: 28,  s: 0   }, 2: { d: 70,  g: 28,  s: 0   }, 3: { d: 70,  g: 28,  s: 0   } },
        9:  { 1: { d: 90,  g: 36,  s: 0   }, 2: { d: 90,  g: 36,  s: 0   }, 3: { d: 90,  g: 36,  s: 0   } },
        10: { 1: { d: 110, g: 44,  s: 0   }, 2: { d: 110, g: 44,  s: 0   }, 3: { d: 110, g: 44,  s: 0   } },
        11: { 1: { d: 140, g: 56,  s: 0   }, 2: { d: 140, g: 56,  s: 0   }, 3: { d: 140, g: 56,  s: 0   } },
        12: { 1: { d: 175, g: 70,  s: 5   }, 2: { d: 175, g: 70,  s: 5   }, 3: { d: 175, g: 70,  s: 5   } },
        13: { 1: { d: 210, g: 84,  s: 7   }, 2: { d: 210, g: 84,  s: 7   }, 3: { d: 210, g: 84,  s: 7   } },
        14: { 1: { d: 250, g: 100, s: 9   }, 2: { d: 250, g: 100, s: 9   }, 3: { d: 250, g: 100, s: 9   } },
        15: { 1: { d: 300, g: 120, s: 12  }, 2: { d: 300, g: 120, s: 12  }, 3: { d: 300, g: 120, s: 12  } },
        16: { 1: { d: 360, g: 144, s: 15  }, 2: { d: 360, g: 144, s: 15  }, 3: { d: 360, g: 144, s: 15  } },
        17: { 1: { d: 430, g: 172, s: 18  }, 2: { d: 430, g: 172, s: 18  }, 3: { d: 430, g: 172, s: 18  } },
        18: { 1: { d: 510, g: 204, s: 22  }, 2: { d: 510, g: 204, s: 22  }, 3: { d: 510, g: 204, s: 22  } },
        19: { 1: { d: 600, g: 240, s: 27  }, 2: { d: 600, g: 240, s: 27  }, 3: { d: 600, g: 240, s: 27  } },
        20: { 1: { d: 700, g: 280, s: 32  }, 2: { d: 700, g: 280, s: 32  }, 3: { d: 700, g: 280, s: 32  } }
    },

    /**
     * getCost(level, step) — returns { d, g, s } for that step at that level.
     * Returns zeroes for unknown levels (safety fallback).
     */
    getCost: function (level, step) {
        var lvl = this.costs[level];
        if (!lvl) return { d: 0, g: 0, s: 0 };
        var stp = lvl[step];
        if (!stp) return { d: 0, g: 0, s: 0 };
        return stp;
    },

    /**
     * calcRange(fromLevel, fromStep, toLevel, toStep)
     * Returns total { d, g, s, svs_pts } for upgrading across that range.
     *
     * fromStep = 3 means the charm is FULLY at fromLevel (nothing to pay at from).
     * fromStep = 0 means we're at the start of fromLevel (about to do step 1).
     * toStep   = 3 means we want the charm fully at toLevel.
     */
    calcRange: function (fromLevel, fromStep, toLevel, toStep) {
        var totD = 0, totG = 0, totS = 0, levelsCompleted = 0;
        var curLevel = fromLevel;
        var curStep  = fromStep;

        while (curLevel < toLevel || (curLevel === toLevel && curStep < toStep)) {
            /* advance one step */
            curStep++;
            if (curStep > 3) {
                curStep = 1;
                curLevel++;
            }

            /* break if we overshoot */
            if (curLevel > toLevel) break;
            if (curLevel === toLevel && curStep > toStep) break;

            var cost = this.getCost(curLevel, curStep);
            totD += cost.d;
            totG += cost.g;
            totS += cost.s;

            /* A level is completed when we finish step 3 */
            if (curStep === 3) levelsCompleted++;
        }

        return {
            d: totD,
            g: totG,
            s: totS,
            svs_pts: levelsCompleted * this.svs_pts_per_level
        };
    }
};
