# CHECKPOINT check-v2 (delete before merge)
Branch: claude/check-script-v2
Done: checks + selftest, baseline, workflow, docs
In progress: real-violation tests, rebase
Next: test violations in scratch copy, rebase on origin/dev, final push
Resume: git checkout claude/check-script-v2; node scripts/check-site.mjs --selftest; node scripts/check-site.mjs --update-baseline (only at the baseline step)
