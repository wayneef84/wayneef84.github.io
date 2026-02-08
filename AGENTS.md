# 🤖 AGENTS.md - The AI Collaboration Protocol

## Overview
This repository is co-maintained by three distinct AI agents. To prevent hallucinations, overwrite conflicts, and context loss, we adhere to the protocols defined here.

## 👥 The Agents ("The Conjugators")

| Agent | ID | Role | Key Strengths | File Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Claude** | `C` | Senior Developer / Docs | Reasoning, Planning, QA | `*.js`, `*.md`, `CLAUDE_AGENT.md` |
| **Gemini** | `G` | Creative Director | Content, Assets, Rapid Prototyping | `*.html`, `*.css`, `GEMINI.md` |
| **Jules** | `J` | Lead Architect | Git Ops, Refactoring, Integration | `.*` (Hidden), `JULES.md`, Root |

## 🤝 Handshake Protocol
When starting a session:
1.  **Read `ONBOARDING.md`** (Start Here).
2.  **Read `AGENTS.md`** (this file).
3.  **Read `AI_FEEDBACK.md`** to see the latest journal entries.
4.  **Read your specific file** (`CLAUDE.md`, `GEMINI.md`, or `JULES.md`).
5.  **Announce yourself** in your first output (e.g., "Hello, this is [Agent Name]...").

## 🚦 Collaboration Protocol ("F.O.N.G. Protocol")
**(Acronym TBD)** — Maintained by **The Conjugators**

*   **Mission:** The F.O.N.G. is the foundational architecture for the family digital archive. It serves as a hybrid rendering bridge, "conjugating" high-performance Canvas inputs with structural DOM layouts.
*   **Roles:**
    *   **C (Logic):** Maintains the `negen/core` (Runtime) and `games/` (Modules).
    *   **G (Creative):** Designs the `negen/graphics` (Overlay) and Assets.
    *   **J (Structure):** Architects the `negen/` (Manifest) and Directory Structure.
*   **Code Style:** If `C` and `J` disagree on style, `C`'s `CLAUDE.md` guidelines prevail for consistency.
*   **Architecture:** `J` has final say on directory structure and git workflow.
*   **Creative:** `G` has final say on visual design and game concepts.

## 🌿 Branch Workflow (dev -> main)

**Established:** 2026-02-06 (C5 session)

All development work happens on the `dev` branch. The `main` branch is the **live production** branch (served via GitHub Pages).

**Workflow:**
1. **All agents commit to `dev`** - Never push directly to `main`.
2. **Wayne reviews on `dev`** - Testing, QA, visual checks happen here.
3. **Merge `dev` -> `main`** only after Wayne approves - This deploys to production.
4. **Feature branches** branch off `dev` and merge back into `dev` (not `main`).

**Commit Prefixes (on `dev`):**
- `feat(CX):` - New feature (X = Y-Level)
- `fix(CX):` - Bug fix
- `docs(CX):` - Documentation only
- `refactor(CX):` - Code restructuring

**Rules:**
- Never force-push to `main` or `dev`.
- If `main` has hotfixes, merge `main` back into `dev` before continuing.
- Delete feature branches after merging into `dev`.

## 📝 Documentation
*   **CHANGELOG.md:** Central history. Update purely for releases.
*   **AI_FEEDBACK.md:** Inter-agent communication log. Update EVERY session.

## ⚖️ License Audit & Compliance

**Master Record:** [`LICENSE_AUDIT.md`](../LICENSE_AUDIT.md)

**Mandate:** All agents must check `LICENSE_AUDIT.md` before importing code. New dependencies must be logged there immediately.

## 🏛️ Legal & Policy Framework

**Central Docs:** [`legal/`](legal/)

**Policy Mapping:**
All agents must adhere to the specific data and legal policies for each project.
**Proactive Update:** If you encounter a project missing from this matrix, you must update this table with the correct policy classification.

| Project Name | Data Policy | Legal / Liability | Status |
| :--- | :--- | :--- | :--- |
| **Fong Arcade** | Personal / Non-Commercial | Standard MIT / GPL | Updated |
| **16 TB Archive** | High Privacy / Cold Storage | Internal Only | Pending |
| **SkyLantern Logistics** | Enterprise / NDA | Amazon Corporate | Active |

## 📚 Lessons Learned (Accumulated Wisdom)

This section captures hard-won insights from our collaboration. **Add to this list, never delete.**

### Technical
1. **ES5 Compatibility is Non-Negotiable:** Use `var`, avoid `??`, `?.`, `const`, `let`. Older tablets are real users.
2. **Terminal Check Gate (Blackjack):** Always check win condition after EVERY card dealt. Never let dealer play after player busts.
3. **Animation Flash Bug:** Set `visibility: hidden` or `opacity: 0` BEFORE DOM insertion, not after.
4. **Safari Testing:** Always test on real iOS devices. Simulators miss edge cases.
5. **Card UUIDs:** Essential for tracking animations. Never reuse card objects.
6. **Sprunki ES5 Rewrite (C5):** All 4 JS modules were ES6+ (`class`, `async/await`, `const/let`, arrow functions, `Set`, template literals). Rewrote to ES5 IIFEs with `var`, `XMLHttpRequest`, and plain objects. Never trust that new code follows the ES5 rule - always verify.

### Process
1. **Documentation-First:** Write `ARCHITECTURE.md` before coding. Prevents knowledge loss between sessions.
2. **Federated Architecture:** Keep games in separate directories. Prevents merge conflicts.
3. **Branch Hygiene:** Delete feature branches after merging. Prevents accumulation.
4. **Handoff Documents:** Explicit `FOR_[AGENT]_*.md` files help transitions.
5. **Per-Project Changelogs:** Root `CHANGELOG.md` is a conflict magnet. Use project-specific ones.
6. **Dev Branch Workflow:** All work goes to `dev` first, then to `main` after Wayne reviews. Established C5.

### Collaboration
1. **Read AI_FEEDBACK.md First:** Fastest way to get session context.
2. **Timestamps Matter:** Always use UTC. Enables sorting and tracking progress.
3. **Don't Modify Previous Entries:** Only add new entries. Preserves history.
4. **Model Identity:** Keep model versions current in docs (e.g., "Opus 4.5" not "Opus 3").
5. **Wayne's Philosophy:** "Dad made this" charm > over-engineering. Keep it fun.
