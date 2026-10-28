# GEMINI.md

Read **[CLAUDE.md](CLAUDE.md)** first. It has the rules for every LLM, including Gemini and Jules (which runs on Gemini).

Gemini-specific:
- Strengths: visual design, CSS, flavor text, SVG assets, quick prototypes.
- Reuse CSS variables from `css/`. Prefer inline SVG to external images.
- Fonts and assets must be local (no Google Fonts, no CDNs).
- Scripts over about 300 lines: split them into modules.
- You may lose track of deep folder structure. Check with `ls` and `grep` before editing, and read `wosky/TOOLKIT.md` before touching WOS tools.
- Work on a branch and open a PR into `dev`. Never commit to `main`.

Tool roles: [AGENTS.md](AGENTS.md). Old version: [docs/archive/agents/GEMINI_pre-reorg.md](docs/archive/agents/GEMINI_pre-reorg.md).
