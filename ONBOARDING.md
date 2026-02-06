# 🚀 ONBOARDING: START HERE

## 1. The Mission
Welcome to the **Founding & Forging & Projects** repository. This is a monolithic collection of browser-based games, utilities, and the **NEGEN** (New Engine) game engine.
Your goal is to maintain, expand, and refactor this codebase while adhering to the **C-G-J Alliance** protocol.

## 2. The "Alliance" (Who are you?)
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
