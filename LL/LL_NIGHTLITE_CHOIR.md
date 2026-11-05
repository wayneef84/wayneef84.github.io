# Lessons learned: Nightlite Choir+

A guide for the next person or LLM touching `games/nightlite_choir/`. Four parts: what we did, what we are doing, what we should be doing, what we may do. Read [games/nightlite_choir/CLAUDE.md](../games/nightlite_choir/CLAUDE.md) and [IP-GUARDRAILS.md](../games/nightlite_choir/IP-GUARDRAILS.md) first. Numbers live in [DESIGN.md](../games/nightlite_choir/DESIGN.md) and the top of `js/app.js`, not here.

Last updated 2026-11-03 (v0.6.0 work, one PR into `dev`).

## 1. What we did

| When | Step | Why it mattered |
|---|---|---|
| 2026-10-27 to 29 | Forked the S4K Mixer v2 engine (`synth.js`, `art.js`, tray, drag, save) into its own folder. Three worlds, 12 base friends, sparks, eggs, a Mixing pot, 6 blends (v0.4.0) | One folder per game, no imports from another game, so nothing else can break it |
| 2026-11-01 | Pot upgrade (v0.5.0): recipes of 2 to 5 friends, blends as ingredients, Match my stage, What can I make?, hints, 15 more blends, shimmering twins. All matching logic moved to `js/recipes.js` (no DOM) | Logic with no DOM can be tested in node. This was the best structural decision so far |
| 2026-11-02 | Game saves (#309), Nightlite gear overlay, Google Drive add-on (#311) | Manual export and import is the core, Drive is only an add-on |
| 2026-11-02 | Eggs and sparks made friendlier: sparks 1 per 8 s, wish +6, egg 3 sparks, 12 s hatch, hatch animation, repeats refund, Collection reordered, tap-to-hear, pot empties after a mix | Wayne's playtest: it felt slow and stingy. Numbers are constants at the top of `app.js` |
| 2026-11-02 | Version in every save, newer saves kept intact, "What is new" and history in Settings | A save made by a newer game must never lose data when an older page opens it |
| 2026-11-02 | Share link `?mix=` (a stage, never a collection), outlines for friends you lack | Saves are the device's collection, the link is only a stage to play |
| 2026-11-02 | Tiers (grey, green, blue, purple, gold, red), tier-first egg roll, luck from selling repeats, special eggs with boosts, Eggs found book, 21 new blends (42 total) | Gives eggs a reason to keep opening. All rules are in `js/eggs.js`, no DOM, tested |
| 2026-11-02 | Per-world stages (8, 9, 10 friends) laid out as a scene (`js/layout.js`) | Bigger, animated stage while the tiles stay as selectors |

## 2. What we are doing now

- Finishing one PR into `dev` from `claude/nightlite-collection`: eggs and tiers, new blends, Collection, share link, save version, per-world stages.
- Done before the PR: name checks, code review, two mobile passes (touch emulation at 390x844 and 360x740, no page scroll, reduced motion). Still open: real-sound and iPhone checks (not possible in the Playwright runs).
- Wayne commits after the mobile pass. Nothing is pushed without his word.

## 3. What we should be doing (habits that worked, and ones to keep)

Process
- Put rules in a pure module (`recipes.js`, `eggs.js`, `layout.js`) and test them in node with a seeded random. Keep `app.js` for wiring and drawing.
- Change numbers in constants at the top of `app.js` (sparks, costs, timers), then record them in DESIGN.md and CHANGELOG.md in the same change.
- Give a sub-agent a closed set of files. The content agent only wrote new files (`blends_more.js`, `tiers.js`), so nothing collided with edits to `app.js`. Run agents that touch `app.js` one at a time.
- Look at it in a browser at 390x844 before saying it is done. The share outline looked wrong only on screen: a CSS class named `ghost` already existed for the drag preview and moved the slot. Before naming a class, grep `style.css`.
- A more specific rule beats a reduced-motion override: the hatch shells (`.shell.top`) kept animating until the override got the same selector. Match specificity in the reduced-motion block.
- Update all 7 docs in the same commit. `check-site` fails the PR otherwise.

Code
- ES5 only. No `const`, `let`, arrows, template literals, `class`. `Array.prototype.map` and `.then` are fine.
- Tests run app.js in a fake DOM (`vm`). Arrays made inside it are another realm, so `deepStrictEqual` against `[]` fails: compare lengths. The fake `store` leaks between tests: reset `store = {}` before each new scenario. The fake DOM has no `location`, so guard it.
- Ids from a link, a save or a snapshot are untrusted: look them up with `hasOwnProperty` (`chOf`), because a plain object answers to `constructor` and `__proto__`. A code review caught this before it shipped, run one on every big change.
- Saves: validate every id with a strict pattern, cap every list, look ids up with `hasOwnProperty`. Keep entries you do not know when the save came from a newer version, and write them back.
- Say "outline" for a friend you have not found. Do not say "locked" or show a name for it.
- Check before adding a CSS rule: tier colors, `.rstar` placement and the reduced-motion block already exist. Every new animation needs a `prefers-reduced-motion` switch-off.

Product
- Nothing is ever lost, nothing is timed against the child, no streaks, no daily bonus, no purchases. Luck, refunds and the pot exist so a child is never stuck.
- Tiers are shown by color and dot count, with a spoken name for screen readers. The CLAUDE.md rule of "no tier or grade labels" was relaxed by Wayne for colors only. Do not add words like "Legendary" on screen without asking.
- The pot is the guaranteed path to every blend. Eggs are the surprise path. Do not make anything eggs-only.
- Names: invent them, search the web, log the result in `ASSET_LOG.md`, never use a Singing Monsters wiki, no copied combinations.
- Be honest about what was not checked (sound, iOS, real devices) in AGENT.md and in the PR text.

Mistakes to avoid (from this project and the 2026-03-22 incidents)
- Do not spend a session reading source "to be safe" when the spec is in the prompt. Write the file.
- Do not guess what a vague request means when the answer changes the data model. Ask one short question, and give a default.
- Do not pile up unrelated changes without a PR. This branch grew large. Next time split at the egg economy, the stage and the content.

## 4. What we may do next

- Seasons or a spooky night mode (off by default, no gore, no jump scares, big exit button).
- A fourth world, with its own stage capacity and layout in `layout.js`.
- Egg boosts as pickups: a lucky star found on the stage, a nest upgrade, a daily gift that never expires (only if it cannot punish a missed day).
- Share links that carry a stage plus a short name, and a QR code for them.
- Sound polish: a per-friend sing animation tied to its role, better mixing of loud and quiet friends, a mixed-stage tempo option.
- Wayne's own recipe set, and AGY's 15 recipes if they arrive (drop in as another `blends_*.js` plus a row in `tiers.js`).
- Drive autosave (dormant until a Client ID goes in `js/gdrive-config.js`).
- Rebalance after real play: tier odds, special egg weights, luck from sales. Keep a note of the playtest in CHANGELOG.md.
- Reuse the egg, tier and luck module (`eggs.js`) in other collect games if it holds up.

## Quick start for the next session

1. Read CLAUDE.md, IP-GUARDRAILS.md, DESIGN.md, then this file.
2. `git fetch`, `git worktree list`, `gh pr list`. Trust git over any note.
3. Run `node tests/nightlite.test.js` and `node scripts/check-site.mjs` before and after.
4. Branch from `dev`: `claude/<topic>`. PR into `dev`. Wayne merges.
