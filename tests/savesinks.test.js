// Regression check: stored text that an imported game save can now write must never reach innerHTML.
// Static, so it is a guard rail and not a proof. The browser pass in docs/GAMESAVES.md covers behavior.
// Run: node tests/savesinks.test.js
var fs = require('fs'), path = require('path'), assert = require('assert');
function src(p) { return fs.readFileSync(path.join(__dirname, '..', p), 'utf8'); }
function absent(p, re, why) { assert(!re.test(src(p)), p + ': ' + why); }
function present(p, re, why) { assert(re.test(src(p)), p + ': ' + why); }

// xtc_ball: answer text from oracle_custom_balls
absent('games/xtc_ball/js/game.js', /answerText\.innerHTML/, 'answerText must not use innerHTML');
present('games/xtc_ball/js/game.js', /createTextNode\(parts\[pi\]\)/, 'answer built from text nodes');
// tracing sentences: sentences-saved
absent('games/tracing/sentences/js/game.js', /custom-sentence-text">'\s*\+/, 'saved sentences must not be concatenated into HTML');
present('games/tracing/sentences/js/game.js', /txt\.textContent = String\(sentence\)/, 'saved sentence uses textContent');
// tracing chinese: chinese-daily characters
absent('games/tracing/chinese/js/game.js', /data-char="' \+ char/, 'daily characters must not be concatenated into HTML');
present('games/tracing/chinese/js/game.js', /cell\.textContent = String\(char\)/, 'character cell uses textContent');
// war: war_history and war_match_history
var war = src('games/cards/war/index.html');
assert(!/'<td[^']*>' \+ (entry|gameEntry)\.(date|player1Points|player2Points)/.test(war), 'war history values must be escaped');
assert(!/match\.matchId \+/.test(war), 'war match id must be numeric');
assert(/warEsc\(entry\.date\)/.test(war) && /parseInt\(match\.matchId, 10\)/.test(war), 'war escapes in place');
present('games/cards/shared/card-utils.js', /escapeHTML\(this\.renderCardText/, 'card text escaped');
console.log('save sink checks passed');
