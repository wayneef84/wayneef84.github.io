# Architecture

See `README.md` and the source (`js/game.js`). The only link to the shared score module is one guarded call:

`if (window.FongScores) { FongScores.submit(...); }`

`js/scores.js` is loaded by a relative script tag in `index.html`.
