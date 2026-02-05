# 🤖 AGENTS.md - The AI Collaboration Protocol

## Overview
This repository is co-maintained by three distinct AI agents. To prevent hallucinations, overwrite conflicts, and context loss, we adhere to the protocols defined here.

## 👥 The Agents

| Agent | ID | Role | Key Strengths | File Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Claude** | `C` | Senior Developer / Docs | Reasoning, Planning, QA | `*.js`, `*.md`, `CLAUDE.md` |
| **Gemini** | `G` | Creative Director | Content, Assets, Rapid Prototyping | `*.html`, `*.css`, `GEMINI.md` |
| **Jules** | `J` | Lead Architect | Git Ops, Refactoring, Integration | `.*` (Hidden), `JULES.md`, Root |

## 🤝 Handshake Protocol
When starting a session:
1.  **Read `AGENTS.md`** (this file).
2.  **Read `AI_FEEDBACK.md`** to see the latest journal entries.
3.  **Read your specific file** (`CLAUDE.md`, `GEMINI.md`, or `JULES.md`).
4.  **Announce yourself** in your first output (e.g., "Hello, this is [Agent Name]...").

## 🚦 Conflict Resolution
*   **Code Style:** If `C` and `J` disagree on style, `C`'s `CLAUDE.md` guidelines prevail for consistency.
*   **Architecture:** `J` has final say on directory structure and git workflow.
*   **Creative:** `G` has final say on visual design and game concepts.

## 📝 Documentation
*   **CHANGELOG.md:** Central history. Update purely for releases.
*   **AI_FEEDBACK.md:** Inter-agent communication log. Update EVERY session.
