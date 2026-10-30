# Installable app (PWA)

The homepage can be installed on phones and desktops and works offline for pages that were opened before. Nothing leaves the device. Theme, scores and the Jigsaw photo store are never cached by the service worker (they live in localStorage and IndexedDB, not in fetched files).

## Files

| File | Role |
|---|---|
| `manifest.webmanifest` | Name "Fong Family Arcade", short name "Fong Arcade", `start_url` and `scope` `./`, standalone, theme and background `#0f1117` (default skin), icons |
| `sw.js` | Service worker. Must stay at the repo root so its scope covers the whole site |
| `offline.html` | Friendly page for a navigation that fails offline and was never visited |
| `js/pwa.js` | Registers the worker, update toast, Install app button, kill switch |
| `assets/icons/` | `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180). Original controller art made by `assets/icons/make-icons.js` (`node assets/icons/make-icons.js`) |

All URLs are relative, so it works at `https://wayneef84.github.io/` and from `http://localhost:PORT/`. Over `file://` nothing registers and nothing breaks.

## How the worker caches

- Install: precaches a small shell (homepage, browse hub, theme files, shared css and js, `offline.html`, icons). A missing file never blocks install.
- HTML pages (navigations): network first, then the cached copy, then `offline.html`. Updates show up on the next visit.
- Everything else (scripts, css, images, fonts, audio): stale while revalidate. The cached copy is used at once and refreshed in the background.
- Never touched: non-GET requests, cross-origin requests, range requests, `sw.js` itself. Only HTTP 200 same-origin non-redirect answers are stored.
- Runtime cache is capped at 150 entries (`MAX_RUNTIME_ENTRIES`), oldest evicted first. The shell is never trimmed.
- Cache names are `fong-shell-<CACHE_VERSION>` and `fong-runtime-<CACHE_VERSION>`. On activate every other `fong-*` cache is deleted. The worker calls `skipWaiting()` and `clients.claim()`.

Why this design: the earlier attempt (PR #165, reverted in #167) put 21 separate cache-first workers in game folders with no version, so old files stayed forever. Here there is one worker, one version constant, HTML is network first, and there is a kill switch.

## Offline play of games

Registration happens on the homepage (and the browse hub). A game gets cached the first time it is opened while the worker controls the site, using the runtime strategy. So: open the homepage once online, reload it once, open the games you want, then they work offline. Games never opened stay unavailable offline and show `offline.html`. If a visitor lands straight on a game URL without visiting the homepage first, nothing registers.

To register from another page, add one line (path to `js/` relative to that page):

```html
<script src="../../js/pwa.js"></script>
```

Add `data-install="1"` and a `<div id="pwa-install" hidden></div>` only on the homepage (Install app button). Do not paste registration code into pages.

Folders that register their own worker (`projects/input-a11y`, `input-a11y_v2`, `encyclopedia`, `games/j`, `j_v1`) keep it. Their narrower scope wins inside their folders.

## Install button

- Chrome and Edge (Android and desktop): the "Install app" button appears at the top of the homepage only when the browser says it is installable (`beforeinstallprompt`). Click calls `prompt()`. It hides after install.
- iPhone and iPad: no install event exists, so a small hint shows how to use Share then Add to Home Screen. "Got it" hides it for good (`localStorage` key `fong_pwa_hint_dismissed`).
- Already running as an installed app: nothing shows. No popups, no nagging.

## Update path

When a new `sw.js` takes over, a small "Update available - Reload" toast shows. The page never reloads by itself, so a game in progress is not interrupted.

### Bump CACHE_VERSION

Edit the one constant at the top of `sw.js` (`'v1'` to `'v2'`). Do it whenever shell files change in a way that must not mix old and new (theme loader, catalog, shared css), or to force every device to drop its saved copies. Normal game edits do not need a bump: HTML is fetched fresh and assets refresh in the background (one visit behind).

## Kill switch

| URL | Effect |
|---|---|
| `?pwa=off` | Unregisters every service worker for this site, deletes every cache, and stays off on this device |
| `?pwa=on` | Clears the off flag and registers again |

Use it next to the other recovery links (`?theme=default`, `?safe=1`). Example: `https://wayneef84.github.io/?pwa=off`.

## How to test

Serve the repo over http and use Chromium (Playwright). Checks that were run: manifest parses and icon sizes match, worker activates, shell cached, homepage and a visited game load with `setOffline(true)`, an unvisited page shows `offline.html`, changing `CACHE_VERSION` replaces the old caches, `?pwa=off` unregisters and clears, Install button hidden until a synthetic `beforeinstallprompt`, iOS hint shown and dismissible, no horizontal scroll at 390x844 and 360x640.

Manual: DevTools, Application, Service Workers and Cache Storage. "Offline" box, reload.

## Known limits

- Service workers need https or localhost. Not file://.
- iOS Safari can clear site storage after about 7 days without a visit in the browser. Pages added to the Home Screen are not subject to that cap, but iOS can still clear storage when the phone is short on space. Open the pages once online to refill.
- Assets are one visit behind after an edit. HTML is fresh, so a new page can briefly load an older cached script. Bump `CACHE_VERSION` when that matters.
- Offline needs each game opened once online first. Big audio or image sets are cached as used, up to the 150 entry cap, so very large sessions may evict old items.
- Real install flows were not tested on real devices when this was written (see PR notes).
