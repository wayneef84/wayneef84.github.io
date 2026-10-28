# CHECKPOINT cards-es5 (delete before merge)

Done: five_card_draw.js and TexasHoldem.js converted to ES5.
Next: ThirteenCard.js (drop the new enums import via local rank table), then rebase and final tests.
Resume: git checkout claude/cards-es5-fix; node scripts/check-site.mjs; serve repo with python3 -m http.server <port>.
Note: games/cards/poker/5card/index.html on dev is truncated at line 242 (pre-existing, unterminated string), so that page does not run. Not touched.
