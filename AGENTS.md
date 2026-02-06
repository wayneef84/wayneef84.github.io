# 🤖 AGENTS.md - The AI Collaboration Protocol

## Overview
This repository is co-maintained by three distinct AI agents. To prevent hallucinations, overwrite conflicts, and context loss, we adhere to the protocols defined here.

## 👥 The Agents ("The Conjugators")

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

## 📝 Documentation
*   **CHANGELOG.md:** Central history. Update purely for releases.
*   **AI_FEEDBACK.md:** Inter-agent communication log. Update EVERY session.

## 📚 Lessons Learned (Accumulated Wisdom)

This section captures hard-won insights from our collaboration. **Add to this list, never delete.**

### Technical
1. **ES5 Compatibility is Non-Negotiable:** Use `var`, avoid `??`, `?.`, `const`, `let`. Older tablets are real users.
2. **Terminal Check Gate (Blackjack):** Always check win condition after EVERY card dealt. Never let dealer play after player busts.
3. **Animation Flash Bug:** Set `visibility: hidden` or `opacity: 0` BEFORE DOM insertion, not after.
4. **Safari Testing:** Always test on real iOS devices. Simulators miss edge cases.
5. **Card UUIDs:** Essential for tracking animations. Never reuse card objects.

### Process
1. **Documentation-First:** Write `ARCHITECTURE.md` before coding. Prevents knowledge loss between sessions.
2. **Federated Architecture:** Keep games in separate directories. Prevents merge conflicts.
3. **Branch Hygiene:** Delete feature branches after merging. Prevents accumulation.
4. **Handoff Documents:** Explicit `FOR_[AGENT]_*.md` files help transitions.
5. **Per-Project Changelogs:** Root `CHANGELOG.md` is a conflict magnet. Use project-specific ones.

### Collaboration
1. **Read AI_FEEDBACK.md First:** Fastest way to get session context.
2. **Timestamps Matter:** Always use UTC. Enables sorting and tracking progress.
3. **Don't Modify Previous Entries:** Only add new entries. Preserves history.
4. **Model Identity:** Keep model versions current in docs (e.g., "Opus 4.5" not "Opus 3").
5. **Wayne's Philosophy:** "Dad made this" charm > over-engineering. Keep it fun.
