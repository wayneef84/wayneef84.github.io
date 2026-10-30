# Memory Match: Changelog

## Unreleased
- Fewest moves per board size are also saved through `FongScores` (boards `memory-match:easy`, `:normal`, `:big`). Visible in Settings, Scores. No change to rules or the win screen.
- Cheers button in the status row. Matches call `FongCheer.cheer('good')` and the finished board calls `'done'`, guarded (`js/cheer.js`, docs/CHEER.md). Off until a parent turns it on. No rule changes.

## v1.0.0 (2026-10-27)
- First release. Easy 3x4, Normal 4x4, Big 4x5.
- Two card sets: Emoji (21) and Animals (14 original inline SVG drawings).
- Flip, match, gentle mismatch flip-back (900 ms, tap to skip), moves counter, optional timer (off).
- Confetti win screen with Play again and Change size.
- Synthesized sound with remembered mute. Remembers set, size, timer and best moves per size and set.
- Pointer and keyboard play, aria labels, reduced-motion support.
