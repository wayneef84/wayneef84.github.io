# S4K Mixer v2: Info

| Field | Value |
|---|---|
| Version | v2.2.0 |
| Status | Draft |
| Category | Arcade |
| Created | 2026-10-27 |
| Entry point | `index.html` |
| Scripts | `js/synth.js`, `js/art.js`, `js/audio-classic.js`, `js/packs/*.js` (11 packs), `js/app.js` |
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

## Tabs, the All tab and shortcuts
- The top row holds the pack tabs in this order: All, Classic, Spring, Summer, Autumn, Winter, Halloween, Aqua, Toxic, Robo, Candy, Bubblegum Pop. The row under the stage holds the list tabs inside a pack (Beats, Effects, Melodies, Voices, Mr. Black). The All tab adds one more list tab, "Everyone", which is its default.
- All is a virtual pack built at start-up from every real pack (`id: 'all'`). It has a neutral light look of its own (it does not copy the last season). Every friend in the tray has a label box with its pack name (its TYPE) and a border in the pack color (`color` field of the pack). Mr. Black is labelled "Mr. Black" in grey and is reachable from the Everyone and Mr. Black list tabs. Tapping, dragging, undo, save and load work as in any pack. A saved mix made in All has `pack: 'all'` and restores a mixed stage.
- Shift + 1 to 9 and Shift + 0 jump to pack tab 1 to 10 (1 is All). Shift + Left and Shift + Right step through the pack tabs and wrap. The code uses `event.code` (`Digit1`..`Digit0`, `Numpad0`..`Numpad9`) because Shift changes `event.key`. Tabs 11 and 12 (Candy, Bubblegum Pop) are reached with the arrows or a tap. The shortcuts are ignored in inputs and while a dialog is open. During spooky mode they only show "Tap Exit spooky mode first" (a stray key must not end it). Plain keys are unchanged: 1 to 9 add the nth friend of the open list (Shift is not held, so there is no clash), `,` and `.` change the list tab, Space, M, Z, R, S, L, ? and Esc as before. The small badge (for example "⇧3") on each pack tab shows only on devices with a mouse.

## Mixed-pack tempo rule
Packs have different tempos (Classic 100, Spring to Halloween 100, Aqua 92, Toxic 108, Robo 104, Candy 96, Bubblegum Pop 104 BPM). One stage has one tempo, `state.bpm`:
1. When a friend is placed on an empty stage, the stage tempo becomes that friend's pack tempo. The tempo stays until the stage is empty again (Reset, removing everyone, a pack tab change, undo or load set it again from the saved mix).
2. Synthesized friends are rendered at the stage tempo (the buffer is cached per friend and tempo), so their loops always fill an exact number of bars.
3. Fixed loops (Classic AAC files) keep their own 100 BPM bar. When the stage tempo differs they are sped up or slowed down by `stageBpm / 100` (at most 8 percent with the current packs, a very small pitch change) so the bar lines still match. At 100 BPM they play unchanged.
4. All loops start on the next shared bar line, as before. Mr. Black uses the stage tempo.
Saved mixes store the tempo with the slots; older saves without it fall back to the first friend.

## Pack and character data format (reuse this for other games)
A pack is one JS file that pushes a plain object to `window.SprunkiV2Packs`:

    { id, order, label, icon, color,            // identity, tab order, tab emoji, label and border color
      theme: { bg1, bg2, panel, text, accent, slot },   // CSS colors
      fx: { emoji, count, dir: 'fall'|'rise'|'drift' }, // floating emoji
      bpm,                                        // pack tempo
      chars: [ character, ... ] }

A character:

    { id, name, type: 'beats'|'effects'|'melodies'|'vocals',   // type = list tab
      art:   { body, color, eyes, mouth, acc, accColor, cheeks },  // drawn by js/art.js
      synth: { kind, ... } }                                   // played by js/synth.js (see header of that file)
      // Classic style instead: img: 'path.svg', audio: 'key in SprunkiV2Audio'

`id` must be unique across all packs (the All tab and saved mixes look characters up by id). `art` options: body round, tall, drop, wide, square, ghost, heart. Eyes big, happy, sleepy, dots. Mouth open, o, grin, smile. Accessories flower, sprout, leaf, shades, beanie, scarf, witchhat, pumpkin, bow, antenna, ears, wings, sun, snowcap, tophat, lightstick, horn, gumball, sparkle. Synth kinds drum, tone, voice, noise, layers; loops are 8 beats (16 steps). At start-up the app adds `packId` and `bpm` to every character. Nothing in a pack touches the DOM or audio, so it can be reused by another game.

## Research: later generations of the Sprunki fan game
Question: what are the later phases called and what themes do they use (fan wikis and fan sites only, not Chisgule).

Sources read: the Sprunki Phases fandom wiki "All Phases" index (via search result only, the page itself could not be fetched), sprunkiphases.io game list, sprunki.org, sprunkin.com, itch.io collections. Several fan sites could not be fetched (HTTP 402 and 451), so this is a thin source base.

What I found:
- Phase 1 (normal) and Phase 2 (horror) are the first two official phases. Phases 3 to 10 are fan-made "main phases". The wiki and fan sites name them mostly by their lead character (for example Phase 3 Pinki, Phase 4 Sky, Phase 5 Vineria, Phase 6 Gray, Phase 7 Simon, Phase 8 Fun Bot, Phase 9 Wenda, Phase 10 Clukr). One fan site gives theme names such as "The Beginning", "Chaotic Rise" (5), "Infection Starts" (6), "Ongoing Onslaught" (7), "Corrupted Depths" (8) and "Ultra Remix Mode" (10). These are unofficial labels and sources disagree.
- Phases 5 and up lean horror, infection or corruption themes. Those were left out as not suitable for a young child.
- Bright and kid-friendly fan mods exist: Snow Day, Summer Time, Christmas Edition, Happy Friends, Cute Time, Animal Pets, Babies, Star and Heart, Playtime.
- A water mod "Sprunki Ice Mod - Aqua" (frosty and aquatic) and a Robot mod (dark grey metallic robot versions of the characters) are listed. No Toxic, slime or Candy mod was found by name. A star-themed "Stardust" title exists but is unconfirmed.

What I chose (all original characters, no art or sounds copied):
| Pack | Why |
|---|---|
| Aqua | Requested. Water and ocean, floaty bubbles, whale and waves. 92 BPM |
| Toxic | Requested. Silly lime slime and lab goo, only squelches and fizzes, no skulls, hazard signs or violence. 108 BPM |
| Robo | Based on the documented Robot mod idea, redrawn as friendly beeping robots. 104 BPM |
| Candy | From the bright and cute fan mods (Cute Time, Happy Friends). Sweet treats. 96 BPM |
| Bubblegum Pop | Requested for a young player who loves pink, unicorns and pop performers with glowing lightsticks. Everything is a generic idea: a pink trio in matching outfits with glow lightsticks, a unicorn, a bubblegum-machine robot, a heart drummer, a glitter cat. No real group, character or show was used as a model. 104 BPM, loops on C major pentatonic so they blend with the other packs |
Left out: every horror, corrupted or infection generation.

### Bubblegum Pop friends
| Friend | List | Look | Sound |
|---|---|---|---|
| Heartbo | Beats | pink heart with sparkles | kick plus clap backbeat |
| Glittens | Beats | glitter cat with pink ears | offbeat hats and a few bright plucks |
| Starlie | Effects | trio member, lilac lightstick | high bell notes with tiny twinkles (glow-stick sparkle) |
| Swooshie | Effects | pale pink bubble with stars | airy swell with bubble pops |
| Gumzy | Melodies | bubblegum-machine robot | round bouncy bass |
| Lilacorn | Melodies | lilac unicorn, gold horn, pastel mane | flowing bell tune |
| Chirpsy | Voices | trio member, mint lightstick | sung pop hook (eh, ah) |
| Oolee | Voices | trio member, butter-yellow lightstick | three-part "ooh" pad, C then A minor |
Name checks and how each asset was made: `ASSET_LOG.md`.
