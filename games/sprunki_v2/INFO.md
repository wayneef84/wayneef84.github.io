# Sprunki v2: Info

| Field | Value |
|---|---|
| Version | v2.0.0 |
| Status | Draft |
| Category | Arcade |
| Created | 2026-10-27 |
| Entry point | `index.html` |
| Scripts | `js/synth.js`, `js/art.js`, `js/audio-classic.js`, `js/packs/*.js`, `js/app.js` |
| JS standard | Strict ES5 |
| Shared libraries | None |
| External requests | None |
| Storage | localStorage keys `sprunkiV2.*` (saves, volume, pack, spots), all optional |
| Audio | Web Audio API. Classic pack: embedded AAC loops. Seasons: synthesized at runtime |
| Size | about 1.2 MB |

## Mr. Black research
Sources read (fan wikis and fan sites, not Chisgule): the Incredibox Sprunki fandom wiki pages "Horror Mode" and "Black", the Parodybox "Mr. Black" page, and sprunkihorror.com. Details differ between the Scratch, Cocrea and Incredimake versions.

What the community game does:
- Black is a normal icon in the character bar. Dragging him onto the stage before every polo (spot) is filled is refused with a message like "Don't mess with me yet... meet your friends first".
- With every spot filled, dropping him on a polo makes the screen go dark for about 2 seconds and switches to horror mode. Black stays on stage and cannot be removed.
- Horror mode: red, glitchy background with eyes in the clouds, horrific character art, tempo 100 BPM to about 140 BPM, key stays E minor, Black plays a still, ominous ambient loop. Fan lore says some characters get hurt.
- Parody variant: Mr. Black triggers it by himself after singing two loops.

What v2 copies:
- Black is a tray character, refused until every spot is full (friendly message), then a 1.3 second fade to dark, then a darker scene with glowing eyes in the background, altered hollow-eyed characters, and a low ambient drone for Black.

What v2 changes for a young child:
- An extra yes/no check before anything happens, so a stray tap cannot start it. Off by default, never saved, not in the URL.
- One big exit button always on screen, plus Esc and Reset. Black can be removed only by exiting.
- No red, blood or gore, no jump scare. Spooky means dark navy, pale yellow eyes and flat mouths.
- Audio is slower and lower (rate 0.84, low-pass 1.8 kHz) instead of faster, with the master volume capped at 55 percent of the normal level and a compressor in the chain.
