# Cheers (FongCheer)

A small shared module, `js/cheer.js` (global `window.FongCheer`), that lets a game say short happy phrases out loud and show them as a big caption. A parent turns it on and can type the child's name on the device. It is off until a parent turns it on.

## Where it is used
- Slots (`games/slots/`): start of play, wins, bonus wins, and a gentle line now and then.
- Memory Match (`games/memory_match/`): each match and the finished board.
- Nightlite Choir+ (`games/nightlite_choir/`): a new blend hatched or discovered.
- Jigsaw: the rebuild calls `FongCheer.cheer('good'|'big'|'done')` guarded.

## For parents
1. Tap the **Cheers** button in the game (a speaker icon with the word Cheers).
2. Answer the grown-ups question (a times-table sum). This keeps small fingers out.
3. In the panel:
   - **Cheers on**: the master switch. Default is off.
   - **Say it out loud** and **Show the words on screen**: use either or both. Words on screen work with the sound off.
   - **Name to cheer**: the name shown in captions and used in phrases.
   - **How to say it (optional)**: if the voice says the name wrong, type it the way it sounds (for example "Kay-lee"). Only the voice uses it.
   - **Voice**: Automatic picks a friendly English voice. Or choose one from the list your device offers.
   - **Volume** and a **Test** button.
   - **Phrases**: pick when (start, good move, big moment, all done, gentle try-again), edit the list one phrase per line, use `{name}` where the name goes. **Reset these phrases** and **Reset all phrases** restore the defaults.
   - **Forget the name** clears the name and the spelling.
4. Tap **Done**. Changes save as you type.

If no name is set, `{name}` and its comma are left out ("You're golden!").

The first time sound plays, some phones need a tap first. Pressing **Test** counts as that tap.

## API
```js
FongCheer.cheer('start' | 'good' | 'big' | 'done' | 'again')
FongCheer.say('any text')     // speaks and captions it, only when Cheers is on
FongCheer.isOn()              // true when a parent turned Cheers on
FongCheer.openSettings()      // parent question, then the panel
```
Games call it guarded: `window.FongCheer && FongCheer.cheer('good')`.

## Behavior
- Uses the browser `speechSynthesis`. If it is missing or blocked, nothing is spoken and nothing breaks. The caption still shows if it is enabled.
- Rate about 1.0, pitch about 1.2, volume set by the parent (10 to 100 percent). Any phrase being spoken is cancelled first, so phrases never pile up.
- Each kind speaks at most once every 2.5 seconds. The small kinds (`good`, `again`) also wait 1.5 seconds after any cheer. The same phrase is never picked twice in a row for a kind.
- The caption is a large pill with `role="status"` and `aria-live="polite"`. It fades for 2.4 seconds. It does not animate when the system asks for reduced motion or when the game's Calm mode is on.
- All phrases are written to be warm. There are no negative lines. The default list has 35 phrases and lives in `js/cheer.js` (`DEFAULTS`). Slots' no-win line is only used about once every 6 spins, never on back to back spins, and never says "so close" (that would be a near-miss message, which Slots does not use).

## Privacy
- No network calls, no analytics, no cookies, no CDN. Nothing leaves the device.
- The child's name is never in the code or the repo. It is typed by a parent and stored only in this browser's `localStorage` key `fong.cheer.v1` (JSON: on, name, spoken name, voice, volume, speak, caption, custom phrases).
- If storage is blocked the settings last until the page is closed.
- To remove everything: **Forget the name** and **Reset all phrases** in the panel, or clear site data for the page.
- Speech is made by the device's own voice engine. Some browsers send text to an online voice service for certain voices. Choose an on-device voice in the Voice list if that matters. This site cannot see or control that.

## Style
The panel and caption inject their own small CSS from `js/cheer.js`. They use `--accent` and `--ink` from the host page when set, with pink fallbacks. The panel card is always white with dark text so it reads well on every game.
