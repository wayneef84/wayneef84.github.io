# Byte Runner

## What is this?
Byte Runner is a small pixel platformer that plays itself, and it doubles as a progress screen for long file copies. A courier robot runs a side scrolling level, jumps gaps and crates, stomps glitch bugs and grabs data chips. Hook it up to a real copy with the PowerShell monitor and the level becomes your backup: the robot runs faster when the copy is faster, each copy stage is its own world, and a gate plus fireworks mark each stage finishing.

**Who it is for:** anyone stuck watching a 200 GB copy crawl, and anyone who just wants a chill auto runner to look at.
**Why it exists:** it started as a progress screen for a two stage drive backup (external drive to PC, then PC to a game drive) and was cleaned up into a reusable tool.

---

## Quick Start (30 seconds)
**Just play:** open the game from the F.O.N.G. hub. It runs a pretend backup. Press any key (or tap a button) to take over, and leave it alone for 8 seconds to hand it back.

**Watch a real copy (Windows):**
1. Download `byte-runner.ps1` from the game page.
2. In PowerShell:
   ```powershell
   Unblock-File "$HOME\Downloads\byte-runner.ps1"
   Set-ExecutionPolicy -Scope Process Bypass
   & "$HOME\Downloads\byte-runner.ps1" -Dest "D:\Backup" -TotalGB 250
   ```
3. The page opens in your browser with live numbers.

---

## Features
- **Self playing:** a look ahead autopilot handles gaps, walls, steps and bugs (60,000 frame soak test: zero falls, zero hits).
- **Take over any time:** arrows or A/D to move, Space, Up, W or Z to jump. On touch screens, big on screen buttons.
- **Any number of stages:** one world per stage (Dusk, Glacier, Ember, Jade, then repeat), plus a victory world.
- **Real numbers:** GB copied, percent, MB/s measured over the last 5 minutes, ETA per stage, total time left and finish time.
- **robocopy aware:** with a log per stage it shows the file being copied, knows exactly when a stage ends and reports the FAILED count.
- **Honest status:** LIVE, STALE (monitor stopped), DONE, HALTED (a stage failed and the next did not start), DEMO.
- **Read only:** the monitor never starts, stops or changes a copy.
- **No dependencies:** one HTML file, one PowerShell script. Strict ES5, no CDN.

---

## How to Play
- The robot runs right on its own. Gaps need a jump, crates need a jump (two high needs a full jump), bugs can be stomped from above.
- Holding jump longer jumps higher.
- Falling into a pit just respawns you a little further ahead. There is no game over; the backup is the boss.

## Monitor options (byte-runner.ps1)
| Parameter | What it does |
|---|---|
| `-Dest` | Folder(s) the copy is filling, one per stage, in order. Required. |
| `-TotalGB` | Size of the data being copied (GB as Explorer counts it). |
| `-Source` | Instead of `-TotalGB`, a folder to measure once at start. |
| `-Label` | Short label per stage, for example `"E: > D:"`. |
| `-Log` | robocopy log per stage, path or wildcard. Best way to detect stage ends and failures. |
| `-GuessMBs` | Speed to assume per stage until real data exists. Default 30. |
| `-Title` | Name shown on the page. |
| `-IntervalSec` | Seconds between checks. Default 10. |
| `-NoBrowser` | Do not open the page automatically. |

Two stage example with logs:
```powershell
& "$HOME\Downloads\byte-runner.ps1" -Title "Photo backup" -TotalGB 271 `
    -Dest "D:\Photos","N:\Photos" -Label "E: > D:","D: > N:" `
    -Log "D:\*stage1*.txt","D:\*stage2*.txt" -GuessMBs 30,120
```

## URL parameters
- `?demo` forces the pretend backup, even from a local file.
- `?sim=60` sets how fast the pretend backup runs (default 25x).
- `?live` polls `status.js` even when served over http (for a local web server setup).

## Status
v1.0.0, production. See `TODO.md` for ideas.
