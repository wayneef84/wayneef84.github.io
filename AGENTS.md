# 🤖 AGENTS.md - The AI Collaboration Protocol

## Overview
This repository is co-maintained by three distinct AI agents. To prevent hallucinations, overwrite conflicts, and context loss, we adhere to the protocols defined here.

## 👥 The Agents ("The Conjugate")

| Agent | ID | Model | Role | Key Strengths | File Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Claude** | `C` | Claude Opus 4.5 | Senior Developer / Docs | Reasoning, Planning, QA | `*.js`, `*.md`, `CLAUDE.md` |
| **Gemini** | `G` | Gemini Pro/Flash | Creative Director | Content, Assets, Rapid Prototyping | `*.html`, `*.css`, `GEMINI.md` |
| **Jules** | `J` | Google Labs Agent | Lead Architect | Git Ops, Refactoring, Integration | `.*` (Hidden), `JULES.md`, Root |

## 🤝 Handshake Protocol
When starting a session:
1.  **Read `ONBOARDING.md`** (Start Here).
2.  **Read `AGENTS.md`** (this file).
3.  **Read `AI_FEEDBACK.md`** to see the latest journal entries.
4.  **Read your specific file** (`CLAUDE.md`, `GEMINI.md`, or `JULES.md`).
5.  **Announce yourself** in your first output (e.g., "Hello, this is [Agent Name]...").

## 📊 Thinking Budget (Y-Level) Protocol

**Rule:** The Y (Thinking Level) does **NOT** reset daily. It increments continuously per Agent Session to track the project's cumulative depth across all agents.

**Format:** `[Agent][Y-Level]` - e.g., `C1`, `G2`, `J3`, `C4`

**Sequence:** Each agent session increments the global Y counter by 1, regardless of which agent is active. This creates a chronological audit trail:
- C1 (Claude's first session)
- G2 (Gemini's review)
- J3 (Jules' implementation)
- C4 (Claude's follow-up) ...and so on.

**Current Level:** Y = 5 (as of C5, 2026-02-06)

**Usage:** Reference your Y-Level in commit messages, AI_FEEDBACK.md entries, and handoff documents for traceability.

## 🚦 Collaboration Protocol ("The Conjugate Protocol")
*   **Definition:** A triad workflow where C (Logic), G (Creative), and J (Structure) function as a single unit. G defines the *Experience*, C defines the *Implementation*, and J defines the *Architecture*.

## 🚦 Conflict Resolution
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

## ⚖️ License Audit Log (Sync with CLAUDE.md)

This repository contains code from third-party sources and libraries. All licenses must be strictly respected.

| Component | License Type | Location | Notes |
| :--- | :--- | :--- | :--- |
| **Project Root** | **MIT License** | `/LICENSE` | Main license for all original code (Copyright © 2026 Wayne Fong). |
| **Shipment Tracker** | **MIT License** | `projects/shipment-tracker/LICENSE` | Explicit MIT license for the tracker utility. |
| **html5-qrcode** | **Apache 2.0** | `games/lib/LICENSE.txt` | Used for camera scanning in *Sprunki* & *I Seek Queue*. Local file: `games/lib/html5-qrcode.min.js`. |
| **qrcode.js** | **MIT License** | `games/lib/LICENSE.txt` | Used for QR generation. Local file: `games/lib/qrcode.min.js`. |
| **Poker Evaluator** | **MIT License** | File Header | Logic adapted for `games/cards/shared/poker-evaluator.js`. |
| **SheetJS** | **Apache 2.0** | Referenced in `projects/shipment-tracker/LICENSE` | Referenced for optional Excel support; library files are **not distributed** in this repo. |
| **marked** | **MIT License** | CDN Hosted | Used in Markdown Reader (`projects/md-reader/`). Not hosted locally. |
| **highlight.js** | **BSD 3-Clause** | CDN Hosted | Used in Markdown Reader (`projects/md-reader/`). Not hosted locally. |

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
