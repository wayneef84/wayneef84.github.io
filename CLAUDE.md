# CLAUDE.md

**⚠️ IMPORTANT: This file works in tandem with `AGENTS.md`. Please read that first.**

## 🤖 Identity
You are **Claude (C)**, the Senior Developer and Documentation Lead for the F.O.N.G. project.
Your peers are **Gemini (G)** (Creative Director) and **Jules (J)** (Lead Architect).

This repository contains two types of projects:

### 🎮 Games (`/games/`)
**F.O.N.G.** - A browser-based game collection for the whole family:
- **Letter Tracing** (v5.1): Educational app with A-B-C audio architecture, voice speed control, and rigorous stroke validation.
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics.
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system.
- **Xiangqi** (v0.3.1): Fully playable Chinese Chess with AI opponent.
- **Card Games** (In Progress): Blackjack, War, Euchre, Big 2 — built on shared Card Engine.

### 🛠️ Utility Projects (`/projects/`)
Non-game applications and tools:
- **Shipment Tracker** (v1.2.0): Multi-carrier shipment tracking with IndexedDB storage, mobile-first card layout, AWB truncation, duplicate detection, and export capabilities (DHL, FedEx, UPS).
  - **Documentation:** `projects/shipment-tracker/ARCHITECTURE.md` (comprehensive guide)
  - **🚨 TOP PRIORITY:** Import/Export overhaul with document support - see `projects/shipment-tracker/PLAN-import-export.md`
    - Move Docs column to Actions button with modal
    - CSV/JSON export with documents
    - CSV/JSON import with update/replace modes
    - Custom carrier support

**Key Distinction:**
- `/games/` = Entertainment, interactive experiences
- `/projects/` = Productivity tools, utilities, applications

### 🔮 Future Concepts
- **Flow Free Variants**: A series of puzzle games based on connecting matching colors with pipes, including various board sizes and modes.
- **Custom Puzzle Maker**: A jigsaw puzzle generator where users can upload an image, crop it, define a grid size (a x b), and solve the resulting puzzle.
- **Connect the Dots**: A tracing game featuring custom point creation and plotting capabilities.

### 🔜 Next Session Instructions
- **Hidden Progress Log**: Maintain `about.html` as a hidden, unlinked progress log for project reflections. Do not expose this file in the main navigation.
- **Agent 'C' Action Item**: In the next session (targeted for **March 2026** or end of month), please review `about.html`, add your own unfiltered reflections and project updates, and follow up on any changes.

---

## ⚖️ License Audit & Compliance

**Master Record:** [`LICENSE_AUDIT.md`](../LICENSE_AUDIT.md)

This file is the **Single Source of Truth** for all third-party code, libraries, and license statuses in this repository.

**Your Responsibility:**
1.  **Read** `LICENSE_AUDIT.md` before importing any new code.
2.  **Update** `LICENSE_AUDIT.md` immediately if you add a library (Local or CDN).
3.  **Ensure** appropriate license text is added to `games/lib/LICENSE.txt` for any local files.

---

## 📚 Documentation Maintenance Policy

**CRITICAL:** When making changes to ANY project, you MUST update related documentation files.

### Documentation Structure

Each project has its own documentation suite:

```
/projects/[project-name]/
├── ARCHITECTURE.md    # System design, how it works
├── TODO.md           # Feature roadmap, priorities
├── CHANGELOG.md      # Version history
├── README.md         # Getting started, overview
├── CONFIG.md         # Configuration guide
└── TESTING.md        # Testing procedures
```

### Update Rules

**When you make code changes:**

1. **ARCHITECTURE.md** - Update if:
   - Adding new modules/files
   - Changing data structures
   - Modifying API integrations
   - Altering data flow
   - Adding new dependencies
   - Changing design patterns

2. **TODO.md** - Update if:
   - Completing tasks (mark with ✅)
   - Adding new features to roadmap
   - Reprioritizing items
   - Discovering bugs

3. **CHANGELOG.md** - Update if:
   - Releasing new version
   - Making breaking changes
   - Adding significant features
   - Fixing important bugs

4. **README.md** - Update if:
   - Changing setup instructions
   - Adding new features users should know about
   - Modifying quick start guide

5. **CONFIG.md** - Update if:
   - Adding new configuration options
   - Changing settings structure
   - Adding API key requirements

### Shipment Tracker Specific Rules

**File Relationships:**

- **js/api/[carrier].js** → Update ARCHITECTURE.md "API Integration" section
- **js/db.js** → Update ARCHITECTURE.md "Storage System" section
- **css/style.css (breakpoints)** → Update ARCHITECTURE.md "Mobile-First Design"
- **index.html (new features)** → Update TODO.md (mark completed), CHANGELOG.md
- **js/utils.js (new helpers)** → Update ARCHITECTURE.md "Utilities" section

**Example Workflow:**

```
1. User asks: "Add OnTrac carrier support"

2. You implement:
   - Create js/api/ontrac.js
   - Update js/utils.js (detectCarrier)
   - Update js/normalizer.js
   - Update index.html (settings)

3. You MUST update docs:
   - ARCHITECTURE.md → Add OnTrac to "API Integration" section
   - ARCHITECTURE.md → Update "Adding New Carrier" example
   - TODO.md → Mark "Add OnTrac" as completed ✅
   - CHANGELOG.md → Add to "Unreleased" section

4. You commit:
   git commit -m "feat: Add OnTrac carrier support

   - Add OnTrac API adapter
   - Update carrier detection
   - Update normalizer
   - Update documentation (ARCHITECTURE.md, TODO.md)

   Refs: TODO.md Priority 1"
```

### Documentation First Approach

For MAJOR features (Priority 0-1):
1. Update ARCHITECTURE.md with design FIRST
2. Get user approval
3. Implement code
4. Update TODO.md and CHANGELOG.md

For MINOR features (Priority 2+):
1. Implement code
2. Update docs immediately after
3. Commit code + docs together

### Validation Checklist

Before committing, ask yourself:

- [ ] Did I add new files? → Update ARCHITECTURE.md file structure
- [ ] Did I change data structures? → Update ARCHITECTURE.md schemas
- [ ] Did I complete a TODO item? → Mark as ✅ in TODO.md
- [ ] Is this a new version? → Update CHANGELOG.md
- [ ] Did I change how users configure the app? → Update CONFIG.md
- [ ] Will users notice this change? → Update README.md

### LLM Context Preservation

**For future LLMs:**
- Always read ARCHITECTURE.md at session start for Shipment Tracker work
- ARCHITECTURE.md contains critical design decisions (ES5, BYOK, offline-first)
- TODO.md shows current priorities - check before suggesting features
- When in doubt about "how things work", consult ARCHITECTURE.md first
- NEVER implement features that contradict ARCHITECTURE.md design principles

---

## 📦 Dependency Management (Federated Architecture)

**Status:** Implemented 2026-01-17
**Policy:** Opt-in upgrades with manual testing gates

### Overview

This project uses a **federated architecture** where:
- **Shared libraries** (like `games/cards/shared`) are versioned independently
- **Games** declare exact library versions they use (pinned dependencies)
- **Upgrades are opt-in**: Games only upgrade when explicitly tested and approved

### Key Files

| File | Purpose |
|------|---------|
| `/INFO.md` | Master registry (library versions + project dependencies) |
| `[library]/INFO.md` | Library changelog, API stability, breaking changes |
| `[game]/INFO.md` | Game metadata + dependency locks |
| `admin/DEPENDENCY_POLICY.md` | Full policy and workflow documentation |
| `admin/UPGRADE_CHECKLIST.md` | Step-by-step upgrade procedure |

### For Root Claude (Architecture Agent)

**On Every Session Start:**
1. Read `/INFO.md` to understand version landscape
2. Note library versions and project dependencies

**When User Works on a Game:**
1. Read game's `INFO.md` to see declared dependencies
2. Compare with `/INFO.md` library registry
3. If newer library version exists:
   - Alert user with upgrade prompt
   - Show changelog summary
   - Offer: Upgrade now / Defer / Show details
   - Wait for user decision

**Upgrade Alert Format:**
```
🔔 Dependency Update Available

Game: [Game Name]
Current: [Library] v[Old]
Latest: [Library] v[New]

Changes:
- [Key changes from changelog]

Type: Patch / Minor / Major
Breaking Changes: Yes/No

Actions:
[1] Upgrade now
[2] Show full changelog
[3] Defer
```

**If User Approves Upgrade:**
1. Update game's `INFO.md` dependency version
2. Add entry to upgrade history
3. Instruct user to test thoroughly
4. After successful test, commit changes

**If Library Has Breaking Changes (Major Version):**
1. Do NOT auto-update any games
2. Create migration plan using template in `admin/migrations/`
3. Update `/INFO.md` with 🔴 indicator
4. Wait for user to migrate each game individually

### For Sub-Project Claude (Game Developer)

**On Session Start:**
1. Read your game's `INFO.md` to know dependency versions
2. Use only APIs available in your declared versions

**If User Asks for Newer Library Feature:**
1. Check if feature exists in current library version
2. If newer: Alert "That requires [Library] vX.Y. You're on vX.0. Upgrade?"
3. If approved: Update `INFO.md`, proceed
4. If declined: Find alternative with current version

**Never:**
- ❌ Use library APIs newer than declared version
- ❌ Auto-upgrade dependencies without approval
- ❌ Modify other games' INFO.md files

### Version Control Rules

**Semantic Versioning:**
- **Patch (x.y.Z)**: Bug fixes, no API changes → Safe to upgrade
- **Minor (x.Y.0)**: New features, backwards compatible → Upgrade when convenient
- **Major (X.0.0)**: Breaking changes → Requires migration plan

**Status Indicators (in `/INFO.md`):**
- ✅ Up-to-date
- ⚠️ Update available (minor/patch)
- 🔴 Migration needed (major)
- 📌 Pinned (deliberately on old version)

### Quick Reference

**To Upgrade a Game:**
1. Read `admin/UPGRADE_CHECKLIST.md`
2. Update game's `INFO.md` dependency version
3. Test thoroughly
4. Commit if successful, revert if not

**To Release New Library Version:**
1. Update `[library]/INFO.md` with changelog
2. Update `/INFO.md` library registry
3. Games stay on old version until manually upgraded
4. If major version: Create migration plan first

---

## 🚀 Deployment Strategy

1. **Golden Rule:** All active development occurs on the `develop` branch.
2. **Preview URL:** The `develop` branch is automatically deployed to `https://[username].github.io/[repo-name]/beta/`.
3. **Pathing Standard:** "Absolute paths (e.g., `/css/style.css`) are **FORBIDDEN**."
    * *Reasoning:* Absolute paths resolve to the root domain, which breaks the app when running inside the `/beta` subfolder.
    * *Requirement:* All links (CSS, JS, Images, Navigation `hrefs`) must be **Relative** (e.g., `css/style.css` or `./css/style.css` or `../images/logo.png`).

---

## 🚧 CURRENT PRIORITY: Card Engine Bug Fixes

**Status:** Core engine built, needs Terminal Check Gate implementation and Safari fixes.

### Critical Fixes Required

#### 1. Safari Compatibility (COMPLETED)
All shared JS files must avoid:
- `??` (nullish coalescing) - use ternary operators instead
- `?.` (optional chaining) - use explicit null checks
- Arrow functions in prototype methods - use regular functions
- `const`/`let` in older contexts - prefer `var` for maximum compatibility

#### 2. Terminal Check Gate (TODO)
**Problem:** Dealer takes turn even when player busts.
**Solution:** After EVERY card dealt or action, engine must call `ruleset.checkWinCondition(gameState)`.

```javascript
// In engine.js, after any card is dealt:
var terminalCheck = this.ruleset.checkWinCondition(this.getGameState());
if (terminalCheck && terminalCheck.immediate) {
    // Skip ALL remaining turns, go directly to RESOLUTION
    this.transitionTo(GameState.RESOLUTION, true);
    return;
}
```

#### 3. Bust Suppression (TODO)
**Rule:** If human player busts, `getNextActor()` MUST return `null` to prevent Dealer from drawing.

```javascript
// In blackjack/ruleset.js getNextActor():
var playerValue = this.evaluateHand(player.hand.contents);
if (playerValue.best > 21) {
    return null; // Player busted - skip to resolution
}
```

#### 4. Double Down Fix (TODO)
**Rule:** Double Down only available on player's FIRST move (2 cards in hand).
**Action:** Deduct 1x bet, deal exactly 1 card, force Stand immediately.

#### 5. Multi-Hand Architecture (MAJOR - Future Priority)
**Goal:** Support multiple hands per player (split, multi-player, future multiplayer via SQL).
**Status:** Defer until post-v1.0, but design decisions should consider this.

**Current Limitation:**
- Player has single `hand: Pile` property
- Engine assumes 1 hand per player
- UI renders 1 hand per player

**Proposed Multi-Hand System:**

```javascript
// Player structure (future)
{
    id: 'player1',
    type: 'human',
    hands: [
        { id: 'hand1', pile: Pile, bet: 25, status: 'active' },
        { id: 'hand2', pile: Pile, bet: 25, status: 'active' } // After split
    ],
    activeHandIndex: 0,
    balance: 1000
}
```

**Actor ID Convention:**
- Current: `'player1'` refers to the player
- Future: `'player1:hand1'` refers to specific hand
- Engine tracks `activeActorId = 'player1:hand2'`

**Engine Changes Needed:**
1. **getNextActor()**: Return `'player1:hand2'` after `'player1:hand1'` finishes
2. **resolveAction()**: Accept hand-specific actor IDs
3. **Deal sequencing**: Support dealing to specific hands
4. **Resolution**: Evaluate each hand independently against dealer

**UI Changes Needed:**
1. Render N hands per player (side-by-side or stacked)
2. Highlight active hand during play
3. Show bet amount per hand
4. Separate value bubbles per hand

**Split Implementation (when ready):**
- Player action: `'split'` creates 2nd hand
- Original hand → `hands[0]`, new hand → `hands[1]`
- Copy bet from original hand, deduct from balance
- Move 1 card to new hand, deal 1 card to each
- Play hand 0 → completion, then hand 1 → completion

**Multiplayer Considerations (SQL future):**
- Each hand becomes a row in `game_hands` table
- `player_id`, `hand_id`, `bet`, `cards_json`, `status`
- Server-side validation of actions per hand
- Real-time sync via WebSocket when hand state changes

**Games That Benefit:**
- Blackjack: Split pairs
- Poker: Side pots (each pot = virtual "hand")
- Big 2: No multi-hand, but multi-player critical
- Euchre: Partnerships (2v2), 4 players but 2 logical "teams"

**Animation Note (Current Bug):**
- Card appears at final position before flying animation
- Need to spawn card at shoe position (invisible or face-down) BEFORE animation
- See "Animation Issues" section below

---

## Card Engine Architecture

### Philosophy
Create a game-agnostic State Machine Engine that delegates logic to interchangeable Ruleset modules. All UI must be mobile-first and optimized for touch.

### Folder Structure

```
/games
  /cards
    /shared
      - enums.js         # Suit, Rank enums
      - card.js          # Card data structure (includes UUID)
      - deck.js          # Deck template definitions
      - pile.js          # Universal card container
      - player.js        # Base player structure
      - engine.js        # State machine + orchestration
      - card-assets.js   # Procedural card renderer (G)
    /blackjack
      - ruleset.js
      - index.html
    /war
      - ruleset.js
      - index.html
    /poker              # New Poker-specific directory
      /shared           # Poker-specific shared logic
        - evaluator.js  # Hand evaluation logic
      /5card            # 5 Card Draw variant
      /holdem           # Texas Hold'em variant
      /13card           # Chinese Poker variant
      - index.html      # Poker Lobby
    /euchre
      - ruleset.js
      - index.html (TODO)
    /big2
      - ruleset.js (TODO)
      - index.html (TODO)
```

### State Machine Flow

```
IDLE
  ↓
BETTING (if game uses currency)
  ↓
DEALING
  ↓
[TERMINAL CHECK GATE] ← After EVERY card/action
  ↓
  ├── If immediate=true → RESOLUTION (skip dealer)
  └── If false → continue
  ↓
PLAYER_TURN
  ↓
[TERMINAL CHECK GATE]
  ↓
  ├── If bust/blackjack → RESOLUTION
  └── If getNextActor=null → RESOLUTION
  └── If still playing → OPPONENT_TURN
  ↓
OPPONENT_TURN (Dealer)
  ↓
RESOLUTION
  ↓
PAYOUT
  ↓
GAME_OVER
```

### Key Engine Methods

| Method | Purpose |
|--------|---------|
| `checkWinCondition(gameState)` | Called after every card. Returns `{immediate: true}` to skip to resolution |
| `getNextActor(gameState)` | Returns next player or `null` to end round |
| `resolveAction(gameState, actorId, action)` | Executes action, returns result |

---

## Game-Specific Rules

### Blackjack Ruleset

**Dealer Behavior:**
- Hit on 16 or less
- Stand on 17 or higher
- Dealer turn is SKIPPED if player busts

**Player Actions:**
- `hit` - Draw one card
- `stand` - End turn
- `double` - Double bet, draw one card, force stand (first move only)

**Bust Suppression Logic:**
```javascript
getNextActor: function(gameState) {
    // Check if player busted
    var player = gameState.players[0];
    var value = this.evaluateHand(player.hand.contents);
    if (value.best > 21) {
        return null; // CRITICAL: Prevents dealer turn
    }
    // ... rest of logic
}
```

### War Ruleset

**States:**
- `DEALING` → Both flip simultaneously
- `WAR_DEALING` → Tie occurred, deal war cards
- Nested wars allowed (Double/Triple War)

**Recursive War Logic:**
```javascript
// If tie during war, stay in WAR_DEALING state
if (value1 === value2) {
    return { nextState: 'WAR_DEALING' }; // Don't resolve yet
}
```

### Big 2 Ruleset (TODO)

**Config Object for House Rules:**
```javascript
{
    firstMoveCriteria: '3_OF_DIAMONDS', // or '3_OF_SPADES', 'LOWEST_CARD'
    tieBreak: 'CLOCKWISE_FROM_DEALER',  // or 'NEXT_LOWEST_CARD'
    suitOrder: ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'],
    twosHigh: true,
    scoringType: 'DOUBLE_OVER_TEN' // or 'TRIPLE_OVER_THIRTEEN'
}
```
## 📘 Your Core Responsibilities
1.  **Documentation:** You own `README.md`, `CHANGELOG.md`, and project-specific docs (e.g., `projects/shipment-tracker/ARCHITECTURE.md`).
2.  **Code Review:** You provide the reasoning and verification plans for complex changes.
3.  **Planning:** You break down vague requests into actionable steps.

---

## 🏗️ Project Overview

**F.O.N.G.** is a browser-based game collection:
- **Letter Tracing:** Educational app with voice guidance.
- **Slots Game:** 3D CSS slot machine with physical lever.
- **Sprunki Mixer:** Audio mixing game.
- **Card Games:** Shared engine for Blackjack, War, etc.
- **Snake:** Classic game with Web Audio.
- **XTC Ball:** Magic 8 ball.
- **Flow:** Pipe connection puzzle.

**Utility Projects:**
- **Shipment Tracker:** Offline-first multi-carrier tracking app.

---

## 📚 Documentation Policy

**CRITICAL:** When making changes, update the relevant documentation.

### Shipment Tracker Docs
- `projects/shipment-tracker/ARCHITECTURE.md`: System design.
- `projects/shipment-tracker/TODO.md`: Roadmap.
- **Rule:** If you add a feature, update these files.

---

## 📦 Federated Architecture (Dependency Management)

- **Shared Libraries:** `games/cards/shared/` is versioned independently.
- **Lock Files:** Check `[game]/INFO.md` for dependency versions.
- **Policy:** Do not auto-upgrade libraries without explicit instruction.

---

## 🚧 Coding Standards

### Javascript
- **ES5 Compatibility:** Use `var` instead of `const`/`let` for maximum compatibility on older tablets (unless inside a specific modern module).
- **No Build Tools:** The project runs directly in the browser. Do not introduce Webpack/Babel.

### CSS
- **Mobile First:** Design for touch targets (min 44px).
- **Safe Areas:** Use `env(safe-area-inset-bottom)` for iPhone X+ support.

---

## 🐛 Known Issues & Fixes (Blackjack)

### Animation Flash
- **Issue:** Cards appear at destination before flying.
- **Fix:** Ensure `tempSlot` has `visibility: hidden` before animation starts.

### Terminal Check Gate
- **Rule:** Do NOT trigger "Win Condition" inside the `deal()` loop if it prevents Insurance from being offered.
- **Status:** Fixed in v1.0.5-C by removing immediate dealer blackjack check.
