# Data Policy

**Last updated:** 2026-11-04

How data is handled on F.O.N.G. Arcade. The short version: everything stays in your browser unless you choose otherwise.

## Storage

| Data | Stored in | Kept until |
|---|---|---|
| Game saves, scores, settings, themes, cheer name | `localStorage` | You clear browser data or use Settings, Data, Reset app |
| Shipment Tracker shipments and carrier API keys | IndexedDB | You delete them in the app or clear browser data |
| Input A11y scan history | `localStorage` | You delete entries or clear browser data |
| Optional Google Drive backups | Hidden app folder in the connected Google account | You delete them from the app or from Google Drive. The newest 10 manual saves and 7 daily copies are kept per game |

## What leaves the device

- Tracking numbers, sent to the carrier (directly or through the optional Cloudflare Worker proxy), only when you look up a shipment.
- Save files, only when you export them or turn on Drive backup.

Nothing else is sent anywhere. There is no server database, no account system and no analytics.

## Rules for contributors

- New features store data on the device first. Any feature that sends data off the device must be opt-in, must be explained in this file and the Privacy Policy, and must be behind the grown-ups question if it touches a Google account or deletes data.
- Never commit API keys, tokens or personal data to the repo.
- Treat imported files as untrusted input (see `docs/GAMESAVES.md`).
