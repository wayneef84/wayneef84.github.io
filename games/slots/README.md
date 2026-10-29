# Slots

## What is this?
A friendly play-money slot machine with 54 themes and 6 ways to play. Everything is coins. Coins are not money, cannot be bought and cannot be cashed out. There are no ads, no timers and no streaks.

**Who should play:** Anyone who likes spinning reels, popping gems and opening gift boxes. Made so a young child can play on a phone.
**Why it exists:** A calm, original arcade toy for the family site. Every theme plays the same fair maths, so picking a theme is only about what you like to look at.

---

## Quick Start (30 seconds)
1. Open the game. A one-line how-to shows for each mode the first time.
2. Tap the theme bar at the top to pick a look (search, or tap a group chip like Sweet, Nature or Kids).
3. Tap a mode chip: Classic, 5-Reel, Cascade, Match, Pick or Wheel.
4. Use the round + and - buttons to change the bet (10 to 250 coins).
5. Tap **SPIN** (or the big lever, or press Space). Tap it again while it is moving to skip the wait.

If the coins run low, a **Get 1,000 coins** button appears. It is free, instant and can be used any time.

---

## Features
- 54 themes: 30 older ones plus 24 new ones (Sugar Counter, Coral Cove, Space Picnic, Dino Dig Park and more).
- 6 modes that share your coins and your theme.
- Real CSS 3D drum reels (each reel is a 12-sided drum).
- Theme picker built for phones: search box, group chips, a Kids chip, remembers your last pick.
- Calm mode and automatic support for "reduce motion": short spins, no confetti, no pulsing.
- Sound is made in the browser. It stays off until your first tap and never blocks the game if audio is unavailable.
- Works offline, from a web server or straight from a file.

---

## How to Play
| Mode | In one line |
|---|---|
| Classic 3-Reel | Spin the 3 reels. Match symbols on the middle line to win coins. |
| 5-Reel Lines | Match 3 or more from the left on any of 10 lines. 3 scatters open a free Pick-a-Prize. |
| Cascade | Winning symbols pop and new ones fall in. Each chain pays more: x2, x3 and up. 3 scatters open a free Prize Wheel. |
| Match Groups | Find groups of 4 or more matching symbols that touch. Bigger groups pay more. |
| Pick-a-Prize | Tap 3 gift boxes to open them. Every box has a prize inside. |
| Prize Wheel | Spin the wheel. Every slice is a prize, so everyone wins something. |

The wild symbol stands in for any normal symbol. The scatter is only for bonuses.
Tap the **?** button for the prize table at your current bet.

---

## Status
- Version 4.0.0. Playable. See CHANGELOG.md.
- Average payback is set to about 94 to 95 percent over many rounds, the same in every theme. See DESIGN.md.

---

## Troubleshooting
- **My coins are gone after reload.** The browser is blocking storage (private mode or a strict setting). The game still works, it just forgets. A small note says so.
- **No sound.** Tap the speaker button. Browsers only allow sound after a tap. If the device blocks audio the game plays silently.
- **Too much movement.** Open **?** and turn on Calm mode. Devices set to reduce motion get it automatically.
- **A spin looks stuck.** Tap SPIN again to skip. A safety timer also ends any round after 45 seconds.

### Known Limitations
- Emoji symbols look different on each device. Some very new emoji may show as a box on old phones.
- The Cascade and Match modes are flat boards with 3D tile drops, not rotating drums.

---

## Performance & Compatibility
Plain HTML, CSS and JavaScript (ES5). No libraries, no network calls. Tested in Chromium at 390x844 and 360x640. Safari and Firefox were not tested.
