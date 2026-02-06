/**
 * deck-editor.js
 * Universal Deck Editor & Inspector for Card Engine games.
 * Features:
 * - View/Edit Piles (Shoe, Discard, Hands)
 * - Save/Load Deck State
 * - Validate Rules
 */

class DeckEditor {
    /**
     * @param {GameEngine} engine - The active game engine instance
     * @param {string} gameId - Unique ID for storage (e.g., 'blackjack', 'poker-5card')
     */
    constructor(engine, gameId) {
        this.engine = engine;
        this.gameId = gameId;
        this.selectedCard = null; // For swap logic

        this._injectStyles();
        this._injectModal();
        this._bindEvents();
    }

    _injectStyles() {
        if (document.getElementById('deck-editor-styles')) return;
        const style = document.createElement('style');
        style.id = 'deck-editor-styles';
        style.textContent = `
            .de-modal {
                display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.85); z-index: 9999;
                font-family: system-ui, sans-serif; color: #fff;
            }
            .de-modal.active { display: flex; align-items: center; justify-content: center; }
            .de-panel {
                background: #1e293b; width: 90%; max-width: 800px; height: 80vh;
                border: 1px solid #475569; border-radius: 12px;
                display: flex; flex-direction: column; overflow: hidden;
            }
            .de-header {
                padding: 15px; border-bottom: 1px solid #334155;
                display: flex; justify-content: space-between; align-items: center;
                background: #0f172a;
            }
            .de-tabs {
                display: flex; gap: 2px; padding: 10px; background: #0f172a;
                overflow-x: auto;
            }
            .de-tab {
                padding: 8px 16px; background: #334155; border: none; color: #94a3b8;
                cursor: pointer; border-radius: 4px 4px 0 0;
            }
            .de-tab.active { background: #1e293b; color: #ffd700; font-weight: bold; }
            .de-content {
                flex: 1; padding: 20px; overflow-y: auto; background: #1e293b;
            }
            .de-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                gap: 6px;
            }
            .de-card {
                aspect-ratio: 2.5/3.5; background: #fff; border-radius: 3px;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                color: #000; font-weight: bold; font-size: 0.75rem;
                cursor: pointer; border: 1px solid transparent;
                position: relative;
            }
            .de-card.red { color: #dc2626; }
            .de-card.selected { border-color: #ffd700; box-shadow: 0 0 8px #ffd700; transform: scale(1.1); z-index: 10; }
            .de-card .suit { font-size: 0.9rem; }
            .de-footer {
                padding: 15px; border-top: 1px solid #334155;
                display: flex; gap: 10px; justify-content: flex-end;
                background: #0f172a;
            }
            .de-btn {
                padding: 8px 16px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer;
            }
            .de-btn-primary { background: #3b82f6; color: white; }
            .de-btn-danger { background: #ef4444; color: white; }
            .de-btn-close { background: #475569; color: white; }
        `;
        document.head.appendChild(style);
    }

    _injectModal() {
        const modal = document.createElement('div');
        modal.className = 'de-modal';
        modal.id = 'deckEditorModal';
        modal.innerHTML = `
            <div class="de-panel">
                <div class="de-header">
                    <h3>🛠️ Deck Editor & Inspector</h3>
                    <button class="de-btn de-btn-close" id="deCloseX">✕</button>
                </div>
                <div class="de-tabs" id="deTabs"></div>
                <div class="de-content">
                    <div class="de-grid" id="deGrid"></div>
                </div>
                <div class="de-footer">
                    <span id="deStatus" style="margin-right: auto; color: #94a3b8; font-size: 0.9rem;"></span>
                    <button class="de-btn de-btn-danger" id="deReset">Reset Default</button>
                    <button class="de-btn de-btn-primary" id="deSave">Save Deck</button>
                    <button class="de-btn de-btn-close" id="deClose">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        this.el = {
            modal: modal,
            tabs: document.getElementById('deTabs'),
            grid: document.getElementById('deGrid'),
            status: document.getElementById('deStatus'),
            close: document.getElementById('deClose'),
            closeX: document.getElementById('deCloseX'),
            save: document.getElementById('deSave'),
            reset: document.getElementById('deReset')
        };
    }

    _bindEvents() {
        this.el.close.onclick = () => this.close();
        this.el.closeX.onclick = () => this.close();

        this.el.reset.onclick = () => {
            if (confirm('Reset deck to default? Current state will be lost.')) {
                this._resetDefault();
            }
        };

        this.el.save.onclick = () => {
            this._saveState();
        };

        this.el.modal.onclick = (e) => {
            if (e.target === this.el.modal) this.close();
        };
    }

    open() {
        this.el.modal.classList.add('active');
        this._refreshTabs();
        this._loadPile(this.currentPileId || Object.keys(this.engine.piles)[0]);
    }

    close() {
        this.el.modal.classList.remove('active');
        this.selectedCard = null;
    }

    _refreshTabs() {
        this.el.tabs.innerHTML = '';

        const piles = Object.keys(this.engine.piles);
        // Add player hands
        this.engine.players.forEach(p => piles.push(`Player: ${p.id}`));
        if (this.engine.dealer) piles.push('Dealer');

        piles.forEach(pid => {
            const btn = document.createElement('button');
            btn.className = 'de-tab';
            btn.textContent = pid;
            btn.onclick = () => {
                this.currentPileId = pid;
                document.querySelectorAll('.de-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._loadPile(pid);
            };
            this.el.tabs.appendChild(btn);
        });

        // Activate first tab if none active
        if (this.el.tabs.firstChild && !this.currentPileId) {
            this.el.tabs.firstChild.click();
        }
    }

    _getPile(id) {
        if (id.startsWith('Player: ')) {
            const pid = id.split(': ')[1];
            return this.engine.players.find(p => p.id === pid).hand;
        }
        if (id === 'Dealer') return this.engine.dealer.hand;
        return this.engine.piles[id];
    }

    _loadPile(pileId) {
        this.currentPileId = pileId;
        const pile = this._getPile(pileId);
        this.el.grid.innerHTML = '';
        this.el.status.textContent = `${pileId}: ${pile.count} cards`;

        pile.contents.forEach((card, index) => {
            const div = document.createElement('div');
            const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
            const symbol = this._getSuitSymbol(card.suit);
            const rank = RankToAsset[card.rank] || card.rank;

            div.className = `de-card ${isRed ? 'red' : ''}`;
            div.innerHTML = `
                <span>${rank}</span>
                <span class="suit">${symbol}</span>
            `;

            div.onclick = () => this._handleCardClick(index, div);
            this.el.grid.appendChild(div);
        });
    }

    _getSuitSymbol(suit) {
        const map = { 'HEARTS': '♥', 'DIAMONDS': '♦', 'CLUBS': '♣', 'SPADES': '♠' };
        return map[suit] || '?';
    }

    _handleCardClick(index, element) {
        if (this.selectedCard === null) {
            // Select first card
            this.selectedCard = { index, element };
            element.classList.add('selected');
        } else {
            // Swap logic
            const pile = this._getPile(this.currentPileId);
            const idx1 = this.selectedCard.index;
            const idx2 = index;

            // Swap in data
            const temp = pile.contents[idx1];
            pile.contents[idx1] = pile.contents[idx2];
            pile.contents[idx2] = temp;

            // Clear selection and reload
            this.selectedCard = null;
            this._loadPile(this.currentPileId);

            this.el.status.textContent = 'Cards swapped.';
        }
    }

    _saveState() {
        // Create a snapshot of ALL piles
        const snapshot = {
            timestamp: Date.now(),
            piles: {}
        };

        // Save main piles
        Object.keys(this.engine.piles).forEach(key => {
            snapshot.piles[key] = this.engine.piles[key].toJSON();
        });

        // Save hands (optional, but good for persistence)
        snapshot.players = this.engine.players.map(p => ({ id: p.id, hand: p.hand.toJSON() }));
        if (this.engine.dealer) {
            snapshot.dealer = this.engine.dealer.hand.toJSON();
        }

        const key = GameConfig.STORAGE_KEYS.DECK_PREFIX + this.gameId;
        localStorage.setItem(key, JSON.stringify(snapshot));

        this.el.status.textContent = 'State saved to Storage!';
        setTimeout(() => this.el.status.textContent = '', 2000);
    }

    loadState() {
        const key = GameConfig.STORAGE_KEYS.DECK_PREFIX + this.gameId;
        const json = localStorage.getItem(key);
        if (!json) return false;

        try {
            const snapshot = JSON.parse(json);

            // Restore piles
            Object.keys(snapshot.piles).forEach(k => {
                if (this.engine.piles[k]) {
                    this.engine.piles[k].restore(snapshot.piles[k]);
                }
            });

            // Restore players
            if (snapshot.players) {
                snapshot.players.forEach(pData => {
                    const player = this.engine.players.find(p => p.id === pData.id);
                    if (player) player.hand.restore(pData.hand);
                });
            }

            if (snapshot.dealer && this.engine.dealer) {
                this.engine.dealer.hand.restore(snapshot.dealer);
            }

            console.log(`[DeckEditor] Loaded state from ${new Date(snapshot.timestamp).toLocaleString()}`);
            return true;
        } catch (e) {
            console.error('[DeckEditor] Load failed', e);
            return false;
        }
    }

    _resetDefault() {
        // Trigger Engine Reset
        // Note: This relies on the Ruleset recreating the piles correctly
        // We might need to manually trigger engine.init() or similar
        // For now, let's just clear the storage and reload
        const key = GameConfig.STORAGE_KEYS.DECK_PREFIX + this.gameId;
        localStorage.removeItem(key);
        location.reload();
    }
}

// Add restore method to Pile prototype if missing (helper)
if (!Pile.prototype.restore) {
    Pile.prototype.restore = function(json) {
        this.template = json.template;
        this.contents = json.contents.map(c => {
            // Reconstruct Card objects
            return new Card(c.suit, c.rank, c.deckId);
        });
        // Restore UUIDs if present
        this.contents.forEach((c, i) => {
            if (json.contents[i].uuid) c.uuid = json.contents[i].uuid;
        });
    };
}
