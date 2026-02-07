/**
 * deck-editor.js
 * Universal Deck Editor & Inspector for Card Engine games. ES5 Compatible.
 */

function DeckEditor(engine, gameId) {
    this.engine = engine;
    this.gameId = gameId;
    this.selectedCard = null;
    this.currentPileId = null;
    this.el = {};

    this._injectStyles();
    this._injectModal();
    this._bindEvents();
}

DeckEditor.prototype._injectStyles = function () {
    if (document.getElementById('deck-editor-styles')) return;
    var style = document.createElement('style');
    style.id = 'deck-editor-styles';
    style.textContent =
        '.de-modal { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 9999; font-family: system-ui, sans-serif; color: #fff; }' +
        '.de-modal.active { display: flex; align-items: center; justify-content: center; }' +
        '.de-panel { background: #1e293b; width: 90%; max-width: 800px; height: 80vh; border: 1px solid #475569; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }' +
        '.de-header { padding: 15px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; background: #0f172a; }' +
        '.de-tabs { display: flex; gap: 2px; padding: 10px; background: #0f172a; overflow-x: auto; }' +
        '.de-tab { padding: 8px 16px; background: #334155; border: none; color: #94a3b8; cursor: pointer; border-radius: 4px 4px 0 0; }' +
        '.de-tab.active { background: #1e293b; color: #ffd700; font-weight: bold; }' +
        '.de-content { flex: 1; padding: 20px; overflow-y: auto; background: #1e293b; }' +
        '.de-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 6px; }' +
        '.de-card { aspect-ratio: 2.5/3.5; background: #fff; border-radius: 3px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #000; font-weight: bold; font-size: 0.75rem; cursor: pointer; border: 1px solid transparent; position: relative; }' +
        '.de-card.red { color: #dc2626; }' +
        '.de-card.selected { border-color: #ffd700; box-shadow: 0 0 8px #ffd700; transform: scale(1.1); z-index: 10; }' +
        '.de-card .suit { font-size: 0.9rem; }' +
        '.de-footer { padding: 15px; border-top: 1px solid #334155; display: flex; gap: 10px; justify-content: flex-end; background: #0f172a; }' +
        '.de-btn { padding: 8px 16px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }' +
        '.de-btn-primary { background: #3b82f6; color: white; }' +
        '.de-btn-danger { background: #ef4444; color: white; }' +
        '.de-btn-close { background: #475569; color: white; }';
    document.head.appendChild(style);
};

DeckEditor.prototype._injectModal = function () {
    var modal = document.createElement('div');
    modal.className = 'de-modal';
    modal.id = 'deckEditorModal';
    modal.innerHTML =
        '<div class="de-panel">' +
            '<div class="de-header">' +
                '<h3>Deck Editor & Inspector</h3>' +
                '<button class="de-btn de-btn-close" id="deCloseX">X</button>' +
            '</div>' +
            '<div class="de-tabs" id="deTabs"></div>' +
            '<div class="de-content">' +
                '<div class="de-grid" id="deGrid"></div>' +
            '</div>' +
            '<div class="de-footer">' +
                '<span id="deStatus" style="margin-right: auto; color: #94a3b8; font-size: 0.9rem;"></span>' +
                '<button class="de-btn de-btn-danger" id="deReset">Reset Default</button>' +
                '<button class="de-btn de-btn-primary" id="deSave">Save Deck</button>' +
                '<button class="de-btn de-btn-close" id="deClose">Close</button>' +
            '</div>' +
        '</div>';
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
};

DeckEditor.prototype._bindEvents = function () {
    var self = this;
    this.el.close.onclick = function () { self.close(); };
    this.el.closeX.onclick = function () { self.close(); };

    this.el.reset.onclick = function () {
        if (confirm('Reset deck to default? Current state will be lost.')) {
            self._resetDefault();
        }
    };

    this.el.save.onclick = function () { self._saveState(); };

    this.el.modal.onclick = function (e) {
        if (e.target === self.el.modal) self.close();
    };
};

DeckEditor.prototype.open = function () {
    this.el.modal.classList.add('active');
    this._refreshTabs();
    this._loadPile(this.currentPileId || Object.keys(this.engine.piles)[0]);
};

DeckEditor.prototype.close = function () {
    this.el.modal.classList.remove('active');
    this.selectedCard = null;
};

DeckEditor.prototype._refreshTabs = function () {
    var self = this;
    this.el.tabs.innerHTML = '';

    var piles = Object.keys(this.engine.piles);
    for (var i = 0; i < this.engine.players.length; i++) {
        piles.push('Player: ' + this.engine.players[i].id);
    }
    if (this.engine.dealer) piles.push('Dealer');

    for (var j = 0; j < piles.length; j++) {
        (function (pid) {
            var btn = document.createElement('button');
            btn.className = 'de-tab';
            btn.textContent = pid;
            btn.onclick = function () {
                self.currentPileId = pid;
                var tabs = document.querySelectorAll('.de-tab');
                for (var k = 0; k < tabs.length; k++) tabs[k].classList.remove('active');
                btn.classList.add('active');
                self._loadPile(pid);
            };
            self.el.tabs.appendChild(btn);
        })(piles[j]);
    }

    if (this.el.tabs.firstChild && !this.currentPileId) {
        this.el.tabs.firstChild.click();
    }
};

DeckEditor.prototype._getPile = function (id) {
    if (id.indexOf('Player: ') === 0) {
        var pid = id.split(': ')[1];
        for (var i = 0; i < this.engine.players.length; i++) {
            if (this.engine.players[i].id === pid) return this.engine.players[i].hand;
        }
        return null;
    }
    if (id === 'Dealer') return this.engine.dealer.hand;
    return this.engine.piles[id];
};

DeckEditor.prototype._loadPile = function (pileId) {
    var self = this;
    this.currentPileId = pileId;
    var pile = this._getPile(pileId);
    this.el.grid.innerHTML = '';
    this.el.status.textContent = pileId + ': ' + pile.count + ' cards';

    for (var i = 0; i < pile.contents.length; i++) {
        (function (card, index) {
            var div = document.createElement('div');
            var isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
            var symbol = self._getSuitSymbol(card.suit);
            var rank = RankToAsset[card.rank] || card.rank;

            div.className = 'de-card' + (isRed ? ' red' : '');
            div.innerHTML = '<span>' + rank + '</span><span class="suit">' + symbol + '</span>';

            div.onclick = function () { self._handleCardClick(index, div); };
            self.el.grid.appendChild(div);
        })(pile.contents[i], i);
    }
};

DeckEditor.prototype._getSuitSymbol = function (suit) {
    var map = { 'HEARTS': '\u2665', 'DIAMONDS': '\u2666', 'CLUBS': '\u2663', 'SPADES': '\u2660' };
    return map[suit] || '?';
};

DeckEditor.prototype._handleCardClick = function (index, element) {
    if (this.selectedCard === null) {
        this.selectedCard = { index: index, element: element };
        element.classList.add('selected');
    } else {
        var pile = this._getPile(this.currentPileId);
        var idx1 = this.selectedCard.index;
        var idx2 = index;

        var temp = pile.contents[idx1];
        pile.contents[idx1] = pile.contents[idx2];
        pile.contents[idx2] = temp;

        this.selectedCard = null;
        this._loadPile(this.currentPileId);
        this.el.status.textContent = 'Cards swapped.';
    }
};

DeckEditor.prototype._saveState = function () {
    var snapshot = { timestamp: Date.now(), piles: {} };

    var keys = Object.keys(this.engine.piles);
    for (var i = 0; i < keys.length; i++) {
        snapshot.piles[keys[i]] = this.engine.piles[keys[i]].toJSON();
    }

    snapshot.players = [];
    for (var j = 0; j < this.engine.players.length; j++) {
        var p = this.engine.players[j];
        snapshot.players.push({ id: p.id, hand: p.hand.toJSON() });
    }
    if (this.engine.dealer) {
        snapshot.dealer = this.engine.dealer.hand.toJSON();
    }

    var key = GameConfig.STORAGE_KEYS.DECK_PREFIX + this.gameId;
    localStorage.setItem(key, JSON.stringify(snapshot));

    var self = this;
    this.el.status.textContent = 'State saved to Storage!';
    setTimeout(function () { self.el.status.textContent = ''; }, 2000);
};

DeckEditor.prototype.loadState = function () {
    var key = GameConfig.STORAGE_KEYS.DECK_PREFIX + this.gameId;
    var json = localStorage.getItem(key);
    if (!json) return false;

    try {
        var snapshot = JSON.parse(json);

        var pileKeys = Object.keys(snapshot.piles);
        for (var i = 0; i < pileKeys.length; i++) {
            var k = pileKeys[i];
            if (this.engine.piles[k]) {
                this.engine.piles[k].restore(snapshot.piles[k]);
            }
        }

        if (snapshot.players) {
            for (var j = 0; j < snapshot.players.length; j++) {
                var pData = snapshot.players[j];
                for (var m = 0; m < this.engine.players.length; m++) {
                    if (this.engine.players[m].id === pData.id) {
                        this.engine.players[m].hand.restore(pData.hand);
                        break;
                    }
                }
            }
        }

        if (snapshot.dealer && this.engine.dealer) {
            this.engine.dealer.hand.restore(snapshot.dealer);
        }

        console.log('[DeckEditor] Loaded state from ' + new Date(snapshot.timestamp).toLocaleString());
        return true;
    } catch (e) {
        console.error('[DeckEditor] Load failed', e);
        return false;
    }
};

DeckEditor.prototype._resetDefault = function () {
    var key = GameConfig.STORAGE_KEYS.DECK_PREFIX + this.gameId;
    localStorage.removeItem(key);
    location.reload();
};

// Add restore method to Pile prototype if missing
if (!Pile.prototype.restore) {
    Pile.prototype.restore = function (json) {
        this.template = json.template;
        this.contents = [];
        for (var i = 0; i < json.contents.length; i++) {
            var c = json.contents[i];
            this.contents.push(new Card(c.suit, c.rank, c.deckId));
        }
    };
}
