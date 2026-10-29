# CHECKPOINT slots-revamp (delete this file in the last commit)

## Stage 1 review: DONE (findings are about the OLD code at origin/dev)
Reproduced in a browser (Playwright, 390x844):
- slots.js:642 audio.playBigWin / audio.playWin do not exist (audio has playWinBig / playWinSmall). Every winning spin throws a TypeError inside evaluateWins, so endSpin never reaches updateUI, button stays on STOP, win animation and bonus loop never run.
- slots.js:318-319 + :488 quick stop calls endSpin(), then the pending animation frame calls endSpin() again. evaluateWins ran twice (counted 2 in a test), so a win pays twice.
- slots.js:1469 / :44 / :1464 storage unguarded. Blocked storage = alert("Failed to load game") and a dead game (:1706). A corrupt save loads a negative balance and bet 99.
- Old payouts: base-game return was about 8,600% to 13,700% of the bet per spin (headless sim of slots.js:575-653 rules, 3 themes). Cause: wild-led lines pay the wild value (:605, :679-688), 20 lines are free (bet is not split), values x bet*0.1. There is no RTP control: dadModeWinChance (:50, :278) is a fixed 50 with no UI.
By reading:
- :509, :767 cascade timers are not cancelled; a new spin during a win animation lets them evaluate and pay mid-spin.
- :528-548 skipBonus resolves the running spin then the loop resolves it again; :356 resets bonusTriggered every spin so 3 scatters inside a bonus restart it (:582-584), two timer chains run (double spin).
- :679-688 a scatter-led line counts as a win worth 0 (value 0): winning animation, no payout.
- :340-344 at zero balance only "Not enough cash!". No refill. Dead end.
- Dollar signs: slots.js:137, :563, :636-639, :1518-1520, index.html:51,83,117.
- slots.css:1 @import from fonts.googleapis.com (network call).
- index.html:5 user-scalable=no. :10 title says v3.0, catalog says v3.1.
- No keyboard handler at all. .slot-lever has no click handler and is display:none at 600px and below (slots.css:327-329).
- slots_audio.js:77 gain.gain.exponentialDecayTo?.() is not a real API. slotsBG.mp3 (1.7 MB) autoplays, provenance unknown.
- README/catalog promised CSS 3D reels, working lever, "Dad Mode" physics, RTP control. The code is a 2D canvas with fake depth and none of the other three. 30 themes, not 20.
- Scale manager shrank the 480x850 frame to 0.73 at 390x844 (slots.js:187).

## Stage 2 and 3 and 4: engine, 6 modes, 54 themes written and loading. Sim passes (tests/sim.js).
## Next
- Playwright pass (http + file://, blocked storage, 200 spins per mode, both viewports, reload keeps state, contact sheet).
- Docs (7 + DESIGN + ASSET_LOG), catalog entry, GAME_INVENTORY row, check-site, PR (draft).
