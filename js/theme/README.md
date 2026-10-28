# js/theme

Homepage theme engine. Spec: [../../docs/THEMING_SPEC.md](../../docs/THEMING_SPEC.md). Guide: [../../docs/CUSTOMIZE.md](../../docs/CUSTOMIZE.md).

| File | Job |
|---|---|
| `loader.js` | In `<head>` before the CSS. Reads the saved theme, sets `data-*` and CSS variables, exposes `FongThemeCore` (color math, config to style) |
| `palettes.js` | Named palettes (`FongPalettes`) |
| `validate.js` | Strict validator and caps (`FongThemeValidate`) |
| `apply.js` | Public API `FongTheme`, storage, recovery banner |
| `panel.js` | The Customize panel (text via `textContent` only) |

Rules: ES5, relative paths, no network, `localStorage` always in try/catch (falls back to memory).
