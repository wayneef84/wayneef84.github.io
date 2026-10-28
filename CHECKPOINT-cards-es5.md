# CHECKPOINT cards-es5 (delete before merge)

Done: all three files converted to ES5; check-site shows 0 errors.
Next: before/after behavior tests, rebase on origin/dev, final push.
Resume: git checkout claude/cards-es5-fix; node scripts/check-site.mjs; serve repo with python3 -m http.server <port>.
Note: games/cards/poker/5card/index.html on dev is truncated at line 242 (pre-existing, unterminated string), so that page does not run. Not touched.
