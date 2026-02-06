# Card Counting & Persistent Storage Architecture Plan

**Target Agent:** Claude (C)
**Status:** Ready for Implementation

## Overview
This document outlines the architecture for adding persistent storage (IndexedDB/LocalStorage) and card counting/tracking logic to the Card Engine. This moves the engine from a stateless "session-only" system to a persistent "profile-aware" system.

## 1. The Pivotal Feature: Shared Storage Driver
**File:** `games/cards/shared/storage-driver.js`

This provides a robust wrapper around IndexedDB for heavy data (Decks) and LocalStorage for lightweight settings.

```javascript
/**
 * Shared Storage Driver
 * Handles IndexedDB for custom decks and LocalStorage for user preferences.
 */
class StorageDriver {
    constructor(dbName = 'CardEngineDB', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
        this.ready = this.initDB();
    }

    async initDB() {
        if (!window.indexedDB) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('customDecks')) {
                    db.createObjectStore('customDecks', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('gameHistory')) {
                    db.createObjectStore('gameHistory', { keyPath: 'timestamp' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ StorageDriver: DB Connected');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('❌ StorageDriver: Connection Failed', event);
                reject(event);
            };
        });
    }

    // --- IndexedDB Operations (Async) ---

    async saveDeck(name, cards) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['customDecks'], 'readwrite');
            const store = tx.objectStore('customDecks');
            const deckObj = {
                name: name,
                cards: cards, // Array of card codes (e.g., "H-1", "S-12")
                updated: Date.now()
            };
            const req = store.put(deckObj);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async loadDecks() {
        await this.ready;
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['customDecks'], 'readonly');
            const store = tx.objectStore('customDecks');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    // --- LocalStorage Operations (Sync) ---

    setSetting(key, value) {
        localStorage.setItem(`card_engine_${key}`, JSON.stringify(value));
    }

    getSetting(key, defaultValue = null) {
        const item = localStorage.getItem(`card_engine_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    }
}

// Export singleton
export const storageDriver = new StorageDriver();
```

## 2. The Logic: Card Counting & Tracking
**File:** `games/cards/shared/tracker.js`

A class that observes a Deck instance. It doesn't interfere with the game, it just watches.

```javascript
/**
 * CardTracker
 * Implements Hi-Lo counting and deck composition tracking.
 */
export class CardTracker {
    constructor(deckInstance) {
        this.deck = deckInstance;
        this.runningCount = 0;
        this.trueCount = 0;
        this.history = []; // Cards seen
        this.active = false; // Toggle for "Cheat Mode" visibility
    }

    reset() {
        this.runningCount = 0;
        this.trueCount = 0;
        this.history = [];
    }

    /**
     * Called whenever a card is dealt/revealed
     * @param {Object} card - The card object
     */
    track(card) {
        this.history.push(card);

        // Hi-Lo Strategy
        // 2-6: +1 | 7-9: 0 | 10-A: -1
        let val = card.rank; // Assuming rank is 1-13 (1=Ace, 11=Jack...)

        // Adjust for face cards treating as 10 in logic if needed,
        // but typically ranks are numeric.
        // Logic: 2,3,4,5,6 -> +1
        // 7,8,9 -> 0
        // 10,J,Q,K,A -> -1

        if (val >= 2 && val <= 6) {
            this.runningCount++;
        } else if (val === 1 || val >= 10) {
            this.runningCount--;
        }

        this.calculateTrueCount();
    }

    calculateTrueCount() {
        // True Count = Running Count / Decks Remaining
        const cardsRemaining = this.deck.cards.length;
        const decksRemaining = Math.max(1, Math.round(cardsRemaining / 52));
        this.trueCount = Math.round((this.runningCount / decksRemaining) * 10) / 10;
    }

    getStats() {
        return {
            running: this.runningCount,
            true: this.trueCount,
            seen: this.history.length,
            remaining: this.deck.cards.length
        };
    }
}
```

## 3. The Visuals: Deck Editor & Tracker UI
**Snippet for:** `games/cards/shared/deck-editor.html` (or inject into game HTML)

```html
<div id="card-tracker-ui" class="tracker-hud hidden">
    <div class="tracker-stat">
        <span class="label">RUNNING</span>
        <span class="value" id="track-run">0</span>
    </div>
    <div class="tracker-stat">
        <span class="label">TRUE</span>
        <span class="value" id="track-true">0</span>
    </div>
    <div class="tracker-graph" id="track-graph"></div>
</div>

<div id="deck-editor-modal" class="modal">
    <div class="modal-content deck-builder">
        <h2>🛠️ Custom Deck Builder</h2>
        <div class="deck-controls">
            <input type="text" id="deck-name" placeholder="My Lucky Deck">
            <button id="save-deck-btn" class="btn-primary">Save Deck</button>
        </div>

        <div class="card-pool">
            <div class="suit-row" data-suit="hearts">
                <!-- JS populates cards here -->
            </div>
        </div>

        <div class="current-deck-strip" id="active-deck-view">
            <!-- Selected cards go here -->
        </div>

        <div class="stats-bar">
            Total Cards: <span id="deck-total-count">0</span>
        </div>
    </div>
</div>
```

## 4. Integration Guide (For Claude)

1.  **Modify `games/cards/shared/deck.js`**:
    *   Import `storageDriver`.
    *   Add a method `loadCustom(deckData)` that replaces `this.cards` with the custom array.
    *   Add event dispatching: `this.dispatchEvent('cardDealt', card)` so the Tracker can listen passively.

2.  **Modify `games/cards/shared/engine.js`**:
    *   Initialize `CardTracker` in the constructor.
    *   Add a "Cheat/Debug" toggle in Settings to show/hide `#card-tracker-ui`.
    *   Wire the `save-deck-btn` to `storageDriver.saveDeck()`.
    *   **Async Init:** Convert `init()` to `async init()` to await `storageDriver.ready`.

3.  **Future Consideration**:
    *   Ensure `ruleset.js` in specific games (Blackjack) respects the `CardTracker` data if we want the AI dealer to play smarter.
