# Storage Engine (FongDB)

**Attributor:** J (Structure)
**Last Updated:** 2026-02-06 (UTC)

## Overview
A generic, adapter-based storage engine designed for the F.O.N.G. codebase. It provides a unified API for data persistence, abstracting away the underlying storage mechanism (IndexedDB, LocalStorage, etc.).

**Naming Convention:**
- **Core Engine:** `FongDB` (`db/core/fong-db.js`)
- **Adapters:** `NegenIDBAdapter`, `NegenLSAdapter` (`db/adapters/`)
  - *Note: The core engine is legacy-named `FongDB`, while adapters use the modern `Negen` naming convention.*

## Architecture
The engine follows the **Adapter Pattern**:
- **Core (`FongDB`)**: The main interface. Handles initialization, event emitting (Observer pattern), and adapter selection.
- **Adapters**:
    - `NegenIDBAdapter`: Wraps IndexedDB for robust, structured storage.
    - `NegenLSAdapter`: Wraps LocalStorage as a fallback or for simple use cases.
- **Collections**: Data is organized into "collections" (analogous to SQL tables or NoSQL collections).

### Event System
The engine implements an Observer pattern to allow other systems (like the future Network library) to react to changes.
- `db.on('change', (event) => { ... })`
- Events include: `put`, `delete`, `clear`.

## Current Features (v1.0.0)
- **Multi-Adapter Support**: Automatically selects the best available storage (IDB > LS).
- **CRUD Operations**: `put`, `get`, `delete`, `getAll`, `clear`.
- **Querying**: Basic filtering capabilities.
- **Event Emission**: Notifies subscribers of data changes.

## Changelog
- **v1.0.0 (2026-02-04)**: Initial release. Basic IDB and LS adapters.

## Upcoming Features
- **Query Optimization**: Advanced indexing and query planning.
- **Migrations**: Automated schema versioning and data migration tools.
- **Middleware**: Hooks for data validation or transformation before storage.
