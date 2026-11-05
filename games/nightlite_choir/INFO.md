# Nightlite Choir+: Info

| Field | Value |
|---|---|
| Status | Milestone 3 plus pot upgrade |
| Version | v0.6.0 |
| Created | 2026-10-28 |
| Last updated | 2026-11-02 |
| Dependencies | none (code forked from `games/sprunki_v2`, no imports). Shared: `../../js/cheer.js`, `../../js/gamesaves.js`, `../../js/gdrive-config.js`, `../../js/gdrive-backup.js`, `../../js/gdrive-auto.js` (optional Drive backup, loads Google only after a tap) |
| Entry | `index.html` |
| Storage keys | `nightlite.vol`, `nightlite.mix`, `nightlite.save` (v5, also holds rares), `nightlite.rare` (Rare friends On/Off), `nightlite.undo` (not exported) |
| Tests | `node tests/nightlite.test.js` (recipes, hints, suggestions, tempo, save migration, rares, stage layout, per-world stages, share links) |
| Rules | [IP-GUARDRAILS.md](IP-GUARDRAILS.md) |
