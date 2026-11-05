# Nightlite Choir+

A cozy music game for a young child. Little creatures each sing a short loop. Put them on a stage and the loops layer into a song. Three worlds: the Night Garden, the Toy Attic and the Star Observatory. All three doors are open.

Status: v0.6.0 (faster sparks, cheaper eggs with hatching, refunds on repeats, previewable Collection). 12 base creatures, free sparks, eggs, a Mixing pot for 2 to 5 friends, a Discovery book, 21 blend creatures and rare shimmer versions.

## Play
Open `index.html` (works from file:// and GitHub Pages) or visit games/nightlite_choir/ on the site.
- Pick a door. The tray has four chips (Garden, Attic, Observatory, Blends). Tap a chip to see that group's friends. All worlds share one stage, so friends from different worlds can sing together. The first friend placed sets the tempo.
- Tap a creature to put it on the stage. Tap it again to send it home. You can also drag it to a spot.
- Undo, Reset, Mute, Volume, Save and Load (one mix).
- Keys: 1 to 6 place the friends shown in the tray, Z undo, R reset, M mute, S save, L load, Esc back.
- Home (top left) goes back to the arcade on every screen. Doors goes back to the door screen.

## Sparks, eggs and the Mixing pot
- Sparks are free. One spark trickles in for every 15 seconds that two or more friends sing on the stage (page open and visible, up to 99). Tap "Wish" any time for 3 free sparks. Nothing is ever bought, nothing can be missed.
- The Collection screen (button on the door screen and in every world) shows your sparks, the nest, the Discovery book and your blends.
- An egg costs 5 sparks. Put it in the nest. It hatches by itself in about 20 seconds, or tap it to warm it up and make it hatch sooner. It hatches a blend you do not have yet. If you have them all, you get a happy twinkle and the sparks come back.
- The Mixing pot: five spots. Pick 2 to 5 friends (the 12 base friends, plus any blend you own, so a blend can be an ingredient) and tap Mix. The order never matters and the group must match a recipe exactly. A match makes a blend at once (nothing is used up) and writes the recipe in the Discovery book. Other groups say "Not this time. Nothing was lost."
- Match my stage fills the pot from the friends standing on the stage (up to 5, preferring a recipe you have not found yet).
- What can I make? shows big cards for recipes whose friends are all on the stage (or that include what you already put in the pot). A found recipe shows its blend. A new one shows a "?" and a one-line clue. Tap a card to fill the pot.
- Hints (only numbers, never names): "Almost! Add N more friend(s)" shows when your pick is part of a recipe you have NOT found yet and you own its other friends. "That is a lot of friends. Try fewer." shows when your pick already holds a whole recipe (found or not) plus extras, and it wins over "Almost". A group with no match and no hint says "Not sure about that group. Try Mix and see."
- Found recipes: you can mix them again any time (it says you made it again). They are listed last in What can I make? with the blend's face and name, and Match my stage and "Almost" skip them so they point at something new.
- Rare friends: each mix or egg has a 1 in 10 chance to also give a shimmering RARE version of the blend (same friend, new colors and sparkles, a brighter sound). Rares have a star, can stand on the stage, and are never needed for anything. The button "Rare friends: On/Off" in the pot turns the chance off (saved in `nightlite.rare`).
- More blends: any file in `js/worlds/` that sets a global named `NightliteBlendsExtra_<NAME>` is merged in by `js/recipes.js` (add one script tag). Set CLAUDE has 15: [RECIPES_CLAUDE.md](RECIPES_CLAUDE.md).
- Everything the child earns is saved in the browser. Nothing is sent anywhere.
- The gear button (Settings) is on every screen. It has Volume, Mute, Export this game and Import this game. Export downloads `fong-save-nightlite-choir.json`. Import takes that file (or pasted text): Add missing keeps what you have, Replace asks a grown-up question first, then a second tap, and overwrites only what is in the file. Restore previous brings back what you had before the last import. Optional: Back up to Drive and Restore from Drive keep a copy in your own Google Drive (needs the arcade owner to set it up once, you sign in each visit). The file buttons always work. With Auto backup on, this game is also saved in the background after it changes (and if Drive has a newer save from another device, auto backup for this game pauses and asks: keep this device, load the Drive save, or decide later. Nothing is replaced without a parent answer). All games at once: arcade Settings, Data tab.

## More
[DESIGN.md](DESIGN.md) | [IP-GUARDRAILS.md](IP-GUARDRAILS.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | [ASSET_LOG.md](ASSET_LOG.md) | [RECIPES_CLAUDE.md](RECIPES_CLAUDE.md)
