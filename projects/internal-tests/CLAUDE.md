# Internal Tests & QA Hub
**Project:** F.O.N.G. Internal Testing Framework
**Owner:** Jules (Structure)

## Mission
This project serves as a centralized dashboard for running verification scripts, unit tests, and visual regression tests across the F.O.N.G. repository. Instead of scattered `test.html` files, we aim to consolidate them here.

## Architecture
- **`index.html`**: The dashboard listing all available tests.
- **`tests/`**: Directory containing individual test suites (e.g., `tests/db-check.html`, `tests/physics-bench.html`).
- **`lib/`**: Shared testing utilities (e.g., a simple assertion library, reporter).

## Usage
1.  Navigate to `/projects/internal-tests/`.
2.  Select a test suite from the dashboard.
3.  View results in the browser console or on-screen reporter.

## Adding a Test
1.  Create a new HTML file in `tests/`.
2.  Import `../lib/test-utils.js` (to be created).
3.  Write your test logic.
4.  Link it in `index.html`.

## Roadmap
- [ ] Migrate `projects/shipment-tracker/verify_db_switch.html` here.
- [ ] Create a standard `TestRunner` class in `lib/`.
- [ ] Add visual regression gallery for game components.
