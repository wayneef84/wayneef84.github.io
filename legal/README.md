# Legal and privacy

F.O.N.G. Arcade is a personal, non-commercial site run by Wayne Fong. It has no accounts, no ads, no analytics and no server of its own.

| Doc | What it covers |
|---|---|
| [Privacy Policy](PRIVACY_POLICY.md) | What stays on your device and the few cases where data leaves it |
| [Terms of Use](TERMS_OF_USE.md) | Use at your own risk, as is |
| [Data Policy](DATA_POLICY.md) | Where each kind of data is stored and how to delete it |

Third-party code, fonts and assets are logged in [LICENSE_AUDIT.md](../LICENSE_AUDIT.md). The site's own license is in [LICENSE](../LICENSE).

## Per project

| Project | Where data lives | Leaves the device? |
|---|---|---|
| Games (arcade, cards, puzzle, educational) | Browser `localStorage` | No, unless you export a save file or turn on Google Drive backup |
| Shipment Tracker | Browser IndexedDB | Tracking numbers go to the carrier through a small proxy to look up status |
| Input A11y (scanner and OCR) | Browser `localStorage` | No. Images are processed in the browser |
| WOS calculators and other tools | Browser `localStorage` | No |

Questions: open an issue on the GitHub repo.
