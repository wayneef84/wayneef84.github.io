# Architecture

- `index.html`: header, `#roster`, footer, home link.
- `js/data.js`: `sprunkiData` array (id, name, color, type, normalDesc, normalImg).
- `js/app.js`: ES5 IIFE. Builds one card per character with `textContent` only. Shows a colored placeholder when `normalImg` is empty or fails.
- `css/style.css`: one light look. No alternate modes, no saved settings.
