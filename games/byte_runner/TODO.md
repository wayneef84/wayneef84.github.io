# Byte Runner: TODO

## Ideas
- [ ] `-Run` mode in the monitor: start robocopy for each stage itself (source, then each destination in turn), log automatically, and stop the chain on failures.
- [ ] macOS and Linux monitor (`byte-runner.sh` using `du` and rsync logs) writing the same status.js.
- [ ] Optional chiptune blips with Web Audio, only after the first key press (no autoplay audio).
- [ ] Score panel for player mode (chips, stomps, distance) with a local best in localStorage.
- [ ] Night and day palette shift inside a stage as percent rises.
- [ ] Show per stage file counts from the robocopy summary when a stage ends.

## Known limits
- Stage end without a log relies on the next folder appearing. If a later destination folder already exists before its stage starts, give that stage a `-Log`.
- An old robocopy log matching a stage's wildcard makes that stage look started. Use a dated log name per run.
- The robocopy log parser expects English robocopy output.
- Folder sizing counts files robocopy has created but not finished, so percent can jump ahead by one large file.
- `-TotalGB` uses 1 GB = 1024^3 bytes. A drive sold as "1 TB" holds about 931 GB by this count.

## Performance notes
- Size scans run every 10 s on the active stage only. On folders with hundreds of thousands of files raise `-IntervalSec`.
- The page draws roughly 600 rectangles per frame; fine on old tablets, but the tower window loop is the first thing to cache if it ever stutters.
