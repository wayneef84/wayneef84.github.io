/**
 * pile.js
 * Universal card container for the Card Engine. ES5 Compatible.
 *
 * Everything that holds cards is a Pile:
 * - Draw pile, discard pile, player hands, community cards, etc.
 *
 * Position logic uses Python-style indexing:
 * - 0 = top, -1 = bottom
 *
 * @version 1.0.2
 */

function Pile() {
    this.contents = [];
    this.template = null;
}

/**
 * Factory: Create a new pile populated from a deck template.
 */
Pile.createFrom = function (deck, copies) {
    if (copies === undefined || copies === null) copies = 1;
    var pile = new Pile();
    var copy, s, r;

    for (copy = 0; copy < copies; copy++) {
        for (s = 0; s < deck.suits.length; s++) {
            for (r = 0; r < deck.ranks.length; r++) {
                pile.contents.push(new Card(deck.suits[s], deck.ranks[r], deck.id));
            }
        }
    }

    // Save template for reset()
    pile.template = [];
    for (var i = 0; i < pile.contents.length; i++) {
        var c = pile.contents[i];
        pile.template.push({ suit: c.suit, rank: c.rank, deckId: c.deckId });
    }

    return pile;
};

/**
 * Create a deep copy of this pile. All cards get NEW uuids.
 */
Pile.prototype.clone = function () {
    var newPile = new Pile();
    for (var i = 0; i < this.contents.length; i++) {
        newPile.contents.push(this.contents[i].clone());
    }
    if (this.template) {
        newPile.template = this.template.slice();
    }
    return newPile;
};

/**
 * Normalize a position index to a valid array index.
 */
Pile.prototype._normalizePosition = function (position, forInsert) {
    var len = this.contents.length;
    if (len === 0) return 0;

    if (position < 0) {
        position = len + position + (forInsert ? 1 : 0);
    }

    var max = forInsert ? len : len - 1;
    return Math.max(0, Math.min(position, max));
};

/**
 * Add a single card to the pile at a specific position.
 */
Pile.prototype.receive = function (card, position) {
    if (position === undefined || position === null) position = 0;
    var index = this._normalizePosition(position, true);
    this.contents.splice(index, 0, card);
};

/**
 * Remove and return a card from a specific position.
 */
Pile.prototype.give = function (position) {
    if (position === undefined || position === null) position = 0;
    if (this.contents.length === 0) return null;
    var index = this._normalizePosition(position);
    return this.contents.splice(index, 1)[0];
};

/**
 * Move ALL cards from another pile into this pile. DESTRUCTIVE to source.
 */
Pile.prototype.addFrom = function (sourcePile, position) {
    if (position === undefined || position === null) position = 0;
    if (sourcePile.contents.length === 0) return;
    var index = this._normalizePosition(position, true);
    var cards = sourcePile.contents.splice(0, sourcePile.contents.length);
    // Use apply to avoid spread operator
    var args = [index, 0];
    for (var i = 0; i < cards.length; i++) args.push(cards[i]);
    Array.prototype.splice.apply(this.contents, args);
};

/**
 * Copy ALL cards from another pile into this pile. NON-DESTRUCTIVE.
 */
Pile.prototype.cloneFrom = function (sourcePile, position) {
    if (position === undefined || position === null) position = 0;
    if (sourcePile.contents.length === 0) return;
    var index = this._normalizePosition(position, true);
    var clonedCards = [];
    for (var i = 0; i < sourcePile.contents.length; i++) {
        clonedCards.push(sourcePile.contents[i].clone());
    }
    var args = [index, 0];
    for (var j = 0; j < clonedCards.length; j++) args.push(clonedCards[j]);
    Array.prototype.splice.apply(this.contents, args);
};

/**
 * Remove cards matching a filter and return them as a new Pile.
 */
Pile.prototype.remove = function (filter) {
    if (!filter) filter = {};
    var removedPile = new Pile();
    var remaining = [];

    for (var i = 0; i < this.contents.length; i++) {
        var card = this.contents[i];
        if (card.matches(filter)) {
            removedPile.contents.push(card);
        } else {
            remaining.push(card);
        }
    }

    this.contents = remaining;
    return removedPile;
};

/**
 * Re-tag all cards with a new deckId.
 */
Pile.prototype.setDeckId = function (newDeckId) {
    var newContents = [];
    for (var i = 0; i < this.contents.length; i++) {
        var c = this.contents[i];
        newContents.push(new Card(c.suit, c.rank, newDeckId));
    }
    this.contents = newContents;
};

/**
 * View a card at a specific position WITHOUT removing it.
 */
Pile.prototype.peek = function (position) {
    if (position === undefined || position === null) position = 0;
    if (this.contents.length === 0) return null;
    var index = this._normalizePosition(position);
    return this.contents[index];
};

/**
 * Return a NEW pile containing cards that match the filter. NON-DESTRUCTIVE.
 */
Pile.prototype.filter = function (criteria) {
    if (!criteria) criteria = {};
    var filteredPile = new Pile();
    for (var i = 0; i < this.contents.length; i++) {
        var card = this.contents[i];
        if (card.matches(criteria)) {
            filteredPile.contents.push(card.clone());
        }
    }
    return filteredPile;
};

/**
 * Find a card by UUID.
 */
Pile.prototype.findByUuid = function (uuid) {
    for (var i = 0; i < this.contents.length; i++) {
        if (this.contents[i].uuid === uuid) return this.contents[i];
    }
    return null;
};

/**
 * Get card count. Use pile.count or pile.getCount().
 */
Object.defineProperty(Pile.prototype, 'count', {
    get: function () { return this.contents.length; }
});

Object.defineProperty(Pile.prototype, 'isEmpty', {
    get: function () { return this.contents.length === 0; }
});

/**
 * Fisher-Yates shuffle.
 */
Pile.prototype.shuffle = function () {
    var arr = this.contents;
    var temp;
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
};

/**
 * Restore the pile to its original state from template. Cards get NEW uuids.
 */
Pile.prototype.reset = function () {
    if (!this.template) {
        console.warn('[Pile] Cannot reset: no template saved');
        return;
    }
    this.contents = [];
    for (var i = 0; i < this.template.length; i++) {
        var t = this.template[i];
        this.contents.push(new Card(t.suit, t.rank, t.deckId));
    }
};

Pile.prototype.clear = function () {
    this.contents = [];
};

Pile.prototype.toJSON = function () {
    var result = [];
    for (var i = 0; i < this.contents.length; i++) {
        result.push(this.contents[i].toJSON());
    }
    return result;
};

Pile.prototype.toString = function () {
    if (this.contents.length === 0) return 'Pile[empty]';
    var preview = [];
    var limit = Math.min(5, this.contents.length);
    for (var i = 0; i < limit; i++) preview.push(this.contents[i].id);
    var more = this.contents.length > 5 ? ', ... (+' + (this.contents.length - 5) + ' more)' : '';
    return 'Pile[' + this.contents.length + ']: ' + preview.join(', ') + more;
};

Pile.prototype.debug = function () {
    console.log('=== Pile Debug (' + this.contents.length + ' cards) ===');
    for (var i = 0; i < this.contents.length; i++) {
        console.log('  [' + i + '] ' + this.contents[i].toString());
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pile: Pile };
}
