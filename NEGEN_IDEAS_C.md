# NEGEN Ideas - Claude's Perspective

**Author:** Claude (C) - Opus 4.5
**Date:** 2026-02-05
**Status:** Initial Brainstorm for Jules (J) Review

---

## Overview

NEGEN (Next-Gen Engine?) - A browser-native game engine built from our existing Fong Family Arcade experience. This document captures my architectural thoughts for Jules to review and expand.

---

## Core Philosophy

### What We've Learned from the Arcade

The Fong Family Arcade taught us several key lessons:

1. **No Build Tools Works** - Vanilla JS/CSS runs everywhere, deploys instantly
2. **ES5 Compatibility Matters** - Older tablets are real users
3. **Mobile-First is Non-Negotiable** - Touch targets, safe areas, dvh units
4. **Offline-First Builds Trust** - LocalStorage/IndexedDB over server dependencies
5. **Canvas + DOM Hybrid** - Some games need Canvas (Snake), some need DOM (Sprunki)

### What Unity Does That We Should Learn From

1. **Entity-Component-System (ECS)** - Separates data from behavior
2. **Scene Graph** - Hierarchical transforms
3. **Asset Pipeline** - Load, cache, manage resources
4. **Inspector/Editor** - Visual debugging tools
5. **Cross-Platform Abstraction** - Write once, run anywhere

---

## Proposed Architecture

### Layer 1: Core Runtime (`negen-core.js`)

```
NEGEN Core
├── Time        - requestAnimationFrame loop, delta time, pause/resume
├── Input       - Unified touch/mouse/keyboard, gesture recognition
├── Audio       - Web Audio context, SoundManager abstraction
├── Storage     - LocalStorage/IndexedDB facade with versioning
└── Events      - PubSub system for decoupled communication
```

**Key Insight:** Every game in the Arcade reimplements these. Factor them out.

### Layer 2: Rendering (`negen-render.js`)

```
Rendering Modes (choose per-game)
├── Canvas2D    - Snake, Card games, Flow
├── CanvasWebGL - Future 3D games
├── DOM         - Sprunki, XTC Ball, UI overlays
└── Hybrid      - Slots (CSS 3D + Canvas effects)
```

**Design Decision:** Don't force one renderer. Let games pick what fits.

### Layer 3: Game Objects (`negen-objects.js`)

```javascript
// Entity-Component pattern (simplified for ES5)
function Entity(id) {
    this.id = id;
    this.components = {};
    this.children = [];
    this.parent = null;
}

Entity.prototype.addComponent = function(name, component) {
    this.components[name] = component;
    component.entity = this;
    return this;
};

// Example components
var TransformComponent = { x: 0, y: 0, rotation: 0, scale: 1 };
var SpriteComponent = { image: null, width: 0, height: 0 };
var ColliderComponent = { type: 'box', width: 0, height: 0 };
```

### Layer 4: Game-Specific Engines

These are what we already have, refactored:

```
/negen/engines/
├── card-engine/     - From games/cards/shared/
├── tracing-engine/  - Stroke validation, audio cues
├── physics-engine/  - Simple 2D physics (Snake, future games)
└── ui-engine/       - Modal dialogs, menus, settings panels
```

---

## Migration Strategy

### Phase 1: Extract (Don't Break Existing Games)

1. Identify common patterns across all games
2. Create `negen-core.js` as a standalone library
3. Games can opt-in by importing it
4. Existing games keep working unchanged

### Phase 2: Refactor (One Game at a Time)

1. Start with simplest game (XTC Ball or Snake)
2. Replace custom Input/Audio/Time with NEGEN equivalents
3. Validate performance and compatibility
4. Document migration path for others

### Phase 3: Enhance (New Features via NEGEN)

1. Add features that benefit all games:
   - Global achievements system
   - Unified settings/preferences
   - Cross-game currency (FongCoin)
   - Performance profiler
   - Debug inspector

---

## Technical Decisions for Discussion

### 1. Module System

**Option A:** Global namespace (`window.NEGEN = {}`)
- Pros: ES5 compatible, simple
- Cons: Pollution, no dependency management

**Option B:** Pseudo-modules with IIFE
```javascript
var NEGEN = NEGEN || {};
NEGEN.Core = (function() {
    var privateVar = 0;
    return {
        publicMethod: function() {}
    };
})();
```
- Pros: Encapsulation, still ES5
- Cons: More boilerplate

**Claude's Recommendation:** Option B. We already use this pattern in `games/cards/shared/`.

### 2. Event System

**Option A:** DOM CustomEvents
```javascript
document.dispatchEvent(new CustomEvent('negen:score', { detail: { points: 100 } }));
```
- Pros: Native, debuggable in DevTools
- Cons: Tied to DOM, slight overhead

**Option B:** Custom PubSub
```javascript
NEGEN.Events.on('score', function(data) { ... });
NEGEN.Events.emit('score', { points: 100 });
```
- Pros: Faster, works without DOM
- Cons: Need to build it

**Claude's Recommendation:** Option B with Option A fallback for debugging.

### 3. Asset Loading

**Option A:** Inline everything (current approach)
- Pros: No loading screens, works offline instantly
- Cons: Large initial download, hard to update assets

**Option B:** Lazy loading with Service Worker cache
```javascript
NEGEN.Assets.load('sprites/cards.png').then(function(img) {
    // Use image
});
```
- Pros: Smaller initial load, updateable
- Cons: Async complexity, needs Service Worker

**Claude's Recommendation:** Hybrid - inline critical assets, lazy-load large ones.

---

## SWOT Analysis for NEGEN

### Strengths
- Built on real-world experience (9+ working games)
- No external dependencies = no supply chain risk
- Proven ES5/mobile compatibility
- Three-AI collaboration model (C-G-J) for rapid iteration

### Weaknesses
- No visual editor (everything is code)
- Limited to 2D (WebGL 3D is complex)
- Documentation debt from rapid prototyping
- Context limitations mean no single AI can hold entire engine in memory

### Opportunities
- PWA market is growing (install-from-browser games)
- Educational games market (Tracing engine is unique)
- Family-friendly gaming niche underserved
- Open source could attract contributors

### Threats
- Browser API changes could break things
- Competition from Phaser, PixiJS (established engines)
- Scope creep (trying to match Unity features)
- Maintenance burden on small team

---

## Questions for Jules (J)

1. **Bundling:** Should NEGEN be one file or multiple modules that games import selectively?

2. **Versioning:** How do we version NEGEN separately from individual games? (This ties into our existing federated architecture.)

3. **Testing:** Should we build a visual test harness or stick with `test.html` style unit tests?

4. **Editor:** Is a visual scene editor worth the development time, or is code-only acceptable?

5. **TypeScript:** Should we add `.d.ts` type definitions for IDE support even if we stay ES5?

---

## Next Steps

1. **J:** Review this document, add NEGEN_IDEAS_J.md with your thoughts
2. **G:** Sketch UI concepts for a minimal debug inspector
3. **C:** Draft the API specification for `negen-core.js`

---

## File Naming Convention for NEGEN Docs

```
NEGEN_IDEAS_[AGENT].md   - Brainstorming (this file)
NEGEN_SPEC_[MODULE].md   - Technical specifications
NEGEN_MIGRATION_[GAME].md - Per-game migration notes
```

---

*This document is part of the C-G-J collaboration. See AGENTS.md for protocol.*
