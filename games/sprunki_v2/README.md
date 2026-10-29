# S4K Mixer v2

A kid-friendly music mixer. Tap friends to put them on the stage and their loop starts playing in time with the rest. Pick a pack tab (All, Classic, Spring, Summer, Autumn, Winter, Halloween, Aqua, Toxic, Robo, Candy, Bubblegum Pop) to change the look, the friends and the sounds. The All tab shows every friend at once, each in a box labelled with its pack.

Standalone: open `index.html` from a file or any static server. No libraries, no network, no build step. The original game in `games/sprunki` is untouched.

## Play
- Tap a friend to add them, tap them again (or the x on the stage) to send them home.
- Drag a friend onto a spot if you like.
- Pause, mute, volume, undo, reset, save, load and the number of spots are in the control bar.
- Keys: 1 to 9 add, `,` and `.` change the list (Beats, Effects...), Shift+1 to 9 and Shift+0 jump to pack tab 1 to 10 (1 is All), Shift+Left and Shift+Right step through all 12 pack tabs (tabs 11 and 12, Candy and Bubblegum Pop, are reached this way or by tap), Space play/pause, M mute, Z undo, R reset, S save, L load, Esc closes dialogs or leaves spooky mode.

## Spooky mode
Off by default. Open the Mr. Black tab, fill every spot with friends first, then place Mr. Black and answer "Yes, spooky". The scene fades to a dark look, friends get hollow glowing eyes and everything plays slower, lower and quieter. The big "Exit spooky mode" button (or Esc, or Reset) leaves at any time. See `INFO.md`.

## Add a pack
Copy `js/packs/spring.js`, change the id, colors, `fx` emoji and the character list (look and sound are plain data), then add one `<script>` line in `index.html`. Character art is generated from a small spec (`js/art.js`) and sounds from a synth spec (`js/synth.js`).

Format and the mixed-pack tempo rule are in `INFO.md`. Ideas for later are in `TODO.md`.
