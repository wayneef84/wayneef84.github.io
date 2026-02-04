# CLAUDE.md

This file provides specific guidance for the Flow Games project.

## Project Context
This directory (`games/flow/`) contains a suite of Flow puzzle games built on a shared engine.

## Documentation
- **ARCHITECTURE.md**: Refer to this for system design, class structures, and technical decisions.
- **TODO.md**: Track progress and find the next task here.
- **CHANGELOG.md**: Log all significant changes here.

## Development Guidelines
1.  **Shared Engine First**: When implementing features, consider if they belong in the shared `engine/` or a specific `variant/`.
2.  **Strict Variants**: `Flow Free`, `Bridge`, `Hex`, and `Warp` are distinct variants. Do not mix logic unless it's in the shared engine.
3.  **Performance**: Use Canvas for rendering. Minimize redraws.
4.  **Testing**: Verify changes manually or with test scripts before submitting.
