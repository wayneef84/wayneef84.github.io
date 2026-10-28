# F.O.N.G. Ground Rules

**Owner:** Wayne (only Wayne changes these). Trimmed 2026-10 from 743 lines. Rules are unchanged, examples and rollout text removed (see git history for the long version).
**Entry point:** [CLAUDE.md](CLAUDE.md). If a suggestion conflicts with a rule here, the rule wins. If unsure, ask Wayne. Do not guess.

## The 10 rules

### 1. Local-only assets
- Every font, script, stylesheet and image lives in the repo. No CDNs (Google Fonts, Bootstrap, jQuery, unpkg, jsDelivr, cdnjs, Font Awesome, Imgur).
- Only exception: opt-in cloud save and global high scores, isolated from core gameplay.
- Third-party assets: download, commit, log in [LICENSE_AUDIT.md](LICENSE_AUDIT.md).
- Dev-only tools (Playwright) may use external resources. Never import them into site code.
- Legacy violations are tracked in [admin/COMPLIANCE_FIXES.md](admin/COMPLIANCE_FIXES.md). Fix them when you touch that game.

### 2. Strict ES5
- Use `var` and `function`. No `const`, `let`, arrow functions, template literals, destructuring, spread, `??`, `?.`, `class`, `async/await`, `Set`, `Map`, `Symbol`, default parameters.
- Allowed: Promises (no `async/await`), `fetch()` with error handling, `localStorage`, `JSON`, `Array.map/filter/reduce`.
- Why: family tablets from 2012 to 2016 still run the site.
- Applies to all new and touched code. Older files that break this exist (about 73 of 117 JS files under `games/`). Do not mass-migrate without asking Wayne.

### 3. Zero build tools
- No Webpack, Babel, TypeScript, Sass, PostCSS, minifiers. Files are committed as served.
- Allowed: plain HTML/CSS/JS, Git, a dev server for testing, Playwright for tests.
- Python or Node scripts that generate committed files (for example `projects/md-reader/build_index.py`) are fine if the output is committed.

### 4. Relative paths only
- Never `/css/x.css` or `/games/...`. Use `css/x.css`, `./games/...`, `../../css/x.css`, computed from the current file.
- Applies to `link`, `script`, `img`, `a href`, `src`. External links are fine as navigation only.

### 5. Branch and deploy
- Live site is served from `dev` on GitHub Pages.
- Work on a feature branch (`claude/...`, `feat/...`, `fix/...`), open a PR into `dev`.
- Never push or force-push to `main`. Never merge `dev` into `main` without Wayne.
- Never force-push any shared branch.

### 6. Federated dependencies
- Games stay in separate folders. Do not change another game's files to fix yours.
- Use only the API version a game declares in its own `INFO.md`. Do not auto-upgrade shared libraries. Tell Wayne a newer version exists. See [admin/DEPENDENCY_POLICY.md](admin/DEPENDENCY_POLICY.md).

### 7. Docs with code
- Write or update the project's `ARCHITECTURE.md` before a major feature.
- Update the game or project's 7 docs (see rule 10) in the same commit as the code.
- Root `AI_FEEDBACK.md` is frozen and no longer required.

### 8. License and legal
- Before importing any code or asset, check [LICENSE_AUDIT.md](LICENSE_AUDIT.md). Add new entries immediately. Commit message: `license: Add <name> <version> <license>`.
- Follow the data and legal policy per project in [legal/](legal).

### 9. Naming and mobile-first
- User-facing name is "F.O.N.G." (title: "F.O.N.G. Arcade"). Never "Fong Family Arcade".
- CSS is mobile-first: base styles for small screens, `min-width` media queries to expand.
- Touch targets at least 44px. Use `env(safe-area-inset-bottom)` for iPhone notch areas.

### 10. Per-project docs
- Games and projects carry their own docs in their folder. Standard: [docs/reference/DOCUMENTATION_STANDARD.md](docs/reference/DOCUMENTATION_STANDARD.md) (7-file suite, templates in [admin/DOC_TEMPLATES/](admin/DOC_TEMPLATES)).
- Wayne decided (2026-10-27): the 7-file set is the standard. Every new game or project MUST have all 7: README.md, ARCHITECTURE.md, INFO.md, TODO.md, CHANGELOG.md, CLAUDE.md, AGENT.md. Use the templates in `admin/DOC_TEMPLATES/`.
- Existing games that are missing files: when you change one, add the missing files in the same PR. Do not mass-backfill untouched games.

## Self-check before you commit

Run through [admin/GROUND_RULES_CHECKLIST.md](admin/GROUND_RULES_CHECKLIST.md), or at least:
1. `grep -rnE "(^|[^a-zA-Z_])(const|let) |=>" <changed .js files>` returns nothing.
2. `grep -rnE "https?://(cdn|unpkg|fonts\.g|cdnjs)" <changed files>` returns nothing.
3. `grep -rnE "(href|src)=\"/" <changed html>` returns nothing.
4. Docs updated in the same commit.

## When a rule seems wrong

Do not override it. Say so in your PR description or ask Wayne in the chat or issue comment, then wait.
