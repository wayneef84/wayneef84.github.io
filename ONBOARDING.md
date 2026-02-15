# 🚀 ONBOARDING: START HERE

## ⚠️ MANDATORY: Ground Rules Check (Do This First!)

**Before doing ANYTHING else, you MUST:**

1. ✅ **Read [`GROUND_RULES.md`](GROUND_RULES.md)** - These are 10 immutable laws that govern all work
2. ✅ **Confirm understanding** - Include this acknowledgment in your first `AI_FEEDBACK.md` entry:
   > "I, [Agent Name], have read and understand F.O.N.G. GROUND_RULES.md (v1.0+).
   > I confirm my understanding of all 10 laws and commit to respecting them in this session."

**What Ground Rules Cover:**
- ✅ Local-only assets (no CDNs)
- ✅ Strict ES5 syntax (no modern JavaScript)
- ✅ Zero build tools (no Webpack/Babel)
- ✅ Relative-only paths (no absolute `/css/` links)
- ✅ Dev branch sovereignty (all work on `dev`, never force `main`)
- ✅ Federated dependencies (no auto-upgrades)
- ✅ Docs precede code (ARCHITECTURE.md before implementation)
- ✅ License compliance (read LICENSE_AUDIT.md first)
- ✅ F.O.N.G. branding & mobile-first design
- ✅ **Documentation Law (Rule 10)** - 7-file suite for all games/projects

**Verification Tool:** Use [`/admin/GROUND_RULES_CHECKLIST.md`](admin/GROUND_RULES_CHECKLIST.md) before every commit to catch violations.

**Why It Matters:** These rules prevent architectural drift, CDN dependency creep, syntax incompatibility, and ensure the codebase remains maintainable across all agents (C-G-J).

> **Non-negotiable:** If you violate these rules, your work will be rejected. No exceptions.

---

## 📚 MANDATORY: Documentation Requirements

**Before starting work on ANY game or project, understand this:**

Every game/project you touch MUST have **7 required documentation files** (Rule 10):
1. **README.md** - User guide & quick start (3-5 KB)
2. **ARCHITECTURE.md** - Technical design (3-5 KB)
3. **INFO.md** - Metadata & dependencies (1 KB)
4. **TODO.md** - Roadmap & issues (2-3 KB)
5. **CHANGELOG.md** - Version history (2-3 KB)
6. **CLAUDE.md** - Developer notes & gotchas (2-3 KB)
7. **AGENT.md** - Session log for next developer (1-2 KB)

**Critical Rule:** When you change code, you MUST update docs in the SAME COMMIT. Documentation updates + code updates = one commit.

**Tools:**
- **Templates:** Use `/admin/DOC_TEMPLATES/` to get started (copy-paste)
- **Standard:** See `/DOCUMENTATION_STANDARD.md` for what each file contains
- **Audit:** Check `/DOCUMENTATION_AUDIT.md` to see which games need docs
- **Verification:** Use `/admin/GROUND_RULES_CHECKLIST.md` Rule 10 before committing

**Before Your First Commit:**
1. ✅ Check: Do all 7 files exist in the game/project folder?
2. ✅ Check: Have you updated them if code changed?
3. ✅ Use the checklist to verify compliance

**Why It Matters:** Future developers (and LLMs) need to understand decisions without reading code. Docs + code ship together.

> **Non-negotiable:** Missing documentation = PR rejected. No exceptions.

---

## 1. The Mission
Welcome to the **F.O.N.G.** repository. This is a monolithic collection of browser-based games, utilities, and the **NEGEN** (New Engine) game engine.
Your goal is to maintain, expand, and refactor this codebase while adhering to the **C-G-J Alliance** (The Conjugators) protocol.

**Naming Convention:**
*   **User-Facing:** Always use **"F.O.N.G."** in titles, headers, and visible UI text.
*   **Internal/Legacy:** You may see "Fong Family Arcade" in old comments or logs. Preserve these for history, but use the new name for anything new.

## 2. The Conjugators (Who are you?)
Identify your role immediately:
*   **Claude (C)**: Documentation, Code Logic, Reasoning. *You are the brain.*
*   **Gemini (G)**: Creative, CSS, Assets, HTML. *You are the artist.*
*   **Jules (J)**: Architecture, Git, Refactoring, Integration. *You are the skeleton.*

> **Action:** Read your specific file (`CLAUDE.md`, `GEMINI.md`, or `JULES.md`) after this.

## 3. Map of the Territory
*   **`negen/`**: The future. The custom game engine (Phase 1 [Complete], Phase 2 [Active]). New games should use this.
    *   **Phase 2 Goal:** Build the Negen Engine Core with a Hybrid Renderer (Canvas + DOM) to power a high-fidelity Card Game prototype.
*   **`games/`**: The present. Contains both legacy games (Slots, XTC Ball) and NEGEN ports (Snake, Pong).
*   **`projects/`**: Non-game utilities (e.g., Shipment Tracker).
*   **`docs/`**: Deep-dive documentation.
*   **`AGENTS.md`**: The law.
*   **`AI_FEEDBACK.md`**: The memory.

## 4. How to Kick Off a Task
1.  **Check the Pulse:** Read `AI_FEEDBACK.md` to see what the previous agent did.
2.  **Check the Roadmap:**
    *   For NEGEN work: Read `negen/PROGRESS.md`.
    *   For General work: Read `TODO.md` or `projects/*/TODO.md`.
3.  **Start a Branch:** (If applicable)
    *   Format: `type/description` (e.g., `feat/new-snake-mode`, `fix/slots-bug`).
4.  **Verify First:** Run `list_files` or `read_file` to confirm the state before writing code.

## 5. Key Institutional Knowledge
*   **NEGEN Architecture:** Uses `Scene`, `Entity`, `System` patterns. See `negen/README.md`.
*   **Testing:** No unit test framework. Use `verification/` scripts (Playwright) or manual verification.
*   **Code Style:** Vanilla JS (ES5/ES6 hybrid but leaning modern for NEGEN). No build steps for games unless specified.
*   **"The Glassmorphism":** Shared CSS theme in `negen/style.css`.

## 6. Pre-Commit Checklist
*   [ ] Did you read `AI_FEEDBACK.md`?
*   [ ] Did you verify your changes?
*   [ ] Did you update `AI_FEEDBACK.md` with your session log?

## 7. Legal & Compliance
Before starting work, verify the legal context of the project you are touching.
*   **Central Docs:** [`legal/`](legal/) (MSA, Privacy, Data Policy).
*   **Policy Matrix:** See `AGENTS.md` for project-specific rules (e.g., SkyLantern NDA vs. Open Source Arcade).
