# Customize the homepage

The homepage has a **Settings** button in the header (it used to say Customize). It opens the Settings hub, see [SETTINGS.md](SETTINGS.md). The **Look** tab there has **Open Customize**, which opens the panel where you change how the page looks and what it shows. Your choices are saved on this device only (browser storage). Nothing is sent anywhere.

## Switch the look

1. Tap **Settings**, then **Look**, then **Open Customize**, then the panel's **Look** tab.
2. Pick a **skin**. Classic is the page as it always was. The others change the whole layout, type and decoration (see the table below).
3. Pick a **palette**. It sets every color at once.
4. Under **Shape and type** change corner radius, border width, shadow, density, fonts and the background pattern. "Skin default" leaves the choice to the skin.

`?mode=fun` still works. In Classic it looks like it always did. In other skins it only changes the wording.

Ready-made pink themes you can import are in [themes/](themes/README.md).

## The skins

| Skin | Look | Notes |
|---|---|---|
| Classic | The F.O.N.G. look you know | Default |
| Print Shop | Zine and risograph: tilted sticker cards on paper | Space Grotesk |
| Cabinet of Drawers | Wood and brass drawer fronts, index cards with lettered tabs | [docs/skins/cabinet.md](skins/cabinet.md) |
| Control Panel | Hardware rack with screws, LEDs and tick scales | [docs/skins/control-panel.md](skins/control-panel.md) |
| Metro Map | Transit lines with stations for each card | [docs/skins/metro-map.md](skins/metro-map.md) |
| Handheld | Retro LCD with pixel type and menu rows | [docs/skins/handheld.md](skins/handheld.md) |
| Scrapbook | Corkboard with taped notes and handwriting | [docs/skins/scrapbook.md](skins/scrapbook.md) |

Every skin works with every palette and every color override. Each skin page lists its fonts, licenses and known limits.

## Make your own theme

- **Colors:** one color picker and one hex field per color. A warning shows when text is hard to read (less than 4.5 to 1). **Fix for me** nudges the text colors.
- **Names:** rename the site title, any group, any card. **Reset name** puts the original back. Names are up to 40 characters.
- **Groups:** reorder or hide the built-in groups, pin up to 12 favorites, make your own groups (up to 12) and add apps by id.
- **Behavior:** sort most played first, show play counts, show NEW badges, show the Just added cards. Motion can be full, reduced or off.
- **Share:** download or copy your theme as JSON, or import one.

The **Reset to default** button at the top of the panel is always there. Tap it twice to confirm.

## Add apps to a group by id

Every app has an id. Open the **Groups** tab. The **ID browser** lists every id and title with a **Copy id** button. Make a group, type ids like `memory-match sudoku` into its "Add ids" box and tap **Add**. A full list is in [CUSTOMIZE_IDS.md](CUSTOMIZE_IDS.md).

Things hidden on the homepage are still found by the search box.

## The JSON file (version 1)

```json
{
  "format": "fong-theme",
  "version": 1,
  "name": "Kenzie's board",
  "skin": "print-shop",
  "palette": { "bg": "#FBEFDC", "accent": "#D8432B" },
  "fonts": { "display": "grotesk", "ui": "system" },
  "shape": { "radius": 12, "border": 2, "shadow": "hard", "density": "cozy", "background": "dots" },
  "motion": "reduced",
  "labels": { "site-title": "Kenzie Arcade", "memory-match": "Brain Flip", "games": "Play Stuff" },
  "groups": [ { "id": "kenzie", "label": "Kenzie's", "items": ["memory-match", "sprunki-v2"] } ],
  "order": ["kenzie", "games", "tools"],
  "hidden": [],
  "pinned": ["memory-match"],
  "behaviors": { "sortMostPlayed": true, "showPlayCounts": true, "showNewBadges": true, "showJustAdded": true },
  "css": "",
  "js": ""
}
```

| Field | Values |
|---|---|
| `format`, `version` | Must be `"fong-theme"` and `1`. Newer versions are refused. |
| `name` | Text, up to 40 characters. |
| `skin` | `classic` or `print-shop`. |
| `palette` | Any of `bg surface text dim accent accent2 border games tools wos more`. Each is `#RGB` or `#RRGGBB` only. No `rgb()`, names, `url()` or variables. |
| `fonts` | `display` and `ui`: `system`, `inter`, `grotesk`, `mono`, `serif`. |
| `shape` | `radius` 0 to 24, `border` 0 to 4 (whole numbers), `shadow` none, soft or hard, `density` compact, cozy or roomy, `background` none, dots, grid, paper or stripes. |
| `motion` | `full`, `reduced` or `off`. |
| `labels` | Id to name. Ids: `site-title`, a group id, a card id from CUSTOMIZE_IDS.md, or a built-in card id (`hub-arcade` and so on). |
| `groups` | Up to 12. `id` is 1 to 24 characters of `a-z 0-9 -`, not an app id, not `hub-...`, not `games tools wos more pinned`. Up to 40 `items` per group, each an app id. |
| `order` | Group ids in the order to show them. `pinned` is the favorites group. |
| `hidden` | Up to 200 ids (apps, built-in cards or groups). Home, search and the Customize button cannot be hidden. |
| `pinned` | Up to 12 app ids. |
| `behaviors` | `sortMostPlayed`, `showPlayCounts`, `showNewBadges`, `showJustAdded` (true or false). |
| `css`, `js` | Accepted but **ignored and removed** for now. Custom CSS and scripts are not supported yet. |

File limit: 64 KB. Unknown ids are dropped and listed. Unknown keys are dropped and reported. A file with a `__proto__`, `constructor` or `prototype` key anywhere is rejected. Names have `<` and `>` and hidden control characters removed.

## Import safely

**Share** tab, **Import**: choose a file or paste text, then **Preview**. You see what will be used and what was removed. Nothing changes until you tap **Apply this theme**.

## If a theme breaks the page

Add one of these to the end of the page address:

- `?theme=default` ignores the saved theme for that visit and offers to reset it.
- `?safe=1` does the same and also keeps custom code off (code is off anyway for now).
- `?pwa=off` unregisters the offline service worker and clears its saved copies on this device. `?pwa=on` turns it back on. See [PWA.md](PWA.md).

## For developers

Public API on `window.FongTheme`: `getConfig`, `setConfig`, `applyConfig`, `exportJSON`, `importJSON(text)` (checks only, never applies), `reset`, `listSkins`, `listPalettes`, `onChange`. Code is in `js/theme/`, skins in `css/skins/<id>.css` scoped under `[data-skin="<id>"]`. Design and security model: [THEMING_SPEC.md](THEMING_SPEC.md). After changing `js/catalog.js` run `node scripts/gen-id-reference.mjs`.
