# F.O.N.G. Master Compendium
**Last Updated:** 2026-02-05

This document serves as the single source of truth for the F.O.N.G. repository, combining architectural vision, project registry, and standard operating procedures.

## 1. Vision & Protocol
**F.O.N.G.** (F.O.N.G.) is a monolithic repository hosting a suite of browser-based games, utilities, and the proprietary **NEGEN** game engine.

### The Conjugators Protocol
Development is driven by a triad of AI agents ("The Conjugators") collaborating under strict roles:
*   **Claude (C)**: Logic & Documentation.
*   **Gemini (G)**: Creative & Frontend.
*   **Jules (J)**: Architecture & DevOps.

See `ONBOARDING.md` for the complete protocol.

## 2. Project Registry
*For a live list, see [PROJECTS.md](../PROJECTS.md).*

The repository is divided into:
*   **Games (`/games/`)**: Playable content.
    *   *Legacy*: Standard JS/Canvas games (Snake, Pong, Breakout).
    *   *NEGEN*: Next-gen games using the custom engine (Space Invaders).
*   **Utilities (`/projects/`)**: Non-game tools.
    *   *Shipment Tracker*: Logistics dashboard.
    *   *Markdown Reader*: Documentation viewer.
    *   *Internal Tests*: QA Hub.

## 3. Shared Infrastructure
The core technology stack shared across projects.

### Storage Engine (`/db/`)
A generic, adapter-based persistence layer.
*   **Core**: `FongDB` class with Observer pattern.
*   **Adapters**: IndexedDB (Primary), LocalStorage (Fallback).
*   **Docs**: [db/README.md](../db/README.md)

### Network Library (`/network/`)
*Planned* module for synchronization.
*   **Scope**: WebSockets, WebRTC.
*   **Integration**: Event hooks into Storage Engine.
*   **Docs**: [network/README.md](../network/README.md)

### NEGEN Engine (`/negen/`)
The proprietary game engine.
*   **Rendering**: Hybrid DOM + Canvas.
*   **Systems**: Entity-Component-System (ECS) architecture.
*   **Docs**: `docs/negen/TECHNICAL_REFERENCE.md`

## 4. Development Standards
*   **Branding**: All user-facing text must use **"F.O.N.G."**.
*   **Theme**: Root site supports Light/Dark mode via `localStorage`.
*   **Testing**: All verification scripts must reside in `projects/internal-tests/`.

## 5. Master Changelog
*   **2026-02-05**: Rebranding to F.O.N.G., Introduction of Generic NegenDB, Creation of Internal Test Hub.
*   **2026-01-XX**: Creation of Shipment Tracker, Initial NEGEN prototype.
