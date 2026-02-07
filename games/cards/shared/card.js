/**
 * card.js
 * Card data structure for the Card Engine. ES5 Compatible.
 *
 * Cards are "dumb data" - they hold identity, not behavior.
 * UUID is REQUIRED for frontend animation tracking.
 */

var _cardInstanceCounter = 0;

function generateCardUuid() {
    return 'card_' + (_cardInstanceCounter++);
}

/**
 * Card Constructor
 * @param {string} suit - Suit enum value
 * @param {string} rank - Rank enum value
 * @param {string} [deckId] - Deck template ID
 */
function Card(suit, rank, deckId) {
    this.suit = suit;
    this.rank = rank;
    this.deckId = deckId || 'standard';
    this.uuid = generateCardUuid();
    this.id = this._generateId();
    Object.freeze(this);
}

Card.prototype._generateId = function () {
    var rankChar = RankToAsset[this.rank] || '?';
    var suitChar = SuitToAsset[this.suit] || '?';
    return rankChar + suitChar;
};

Card.prototype.getAssetKey = function () {
    return [RankToAsset[this.rank], SuitToAsset[this.suit]];
};

Card.prototype.toJSON = function () {
    return {
        suit: this.suit,
        rank: this.rank,
        id: this.id,
        deckId: this.deckId,
        uuid: this.uuid
    };
};

Card.prototype.clone = function () {
    return new Card(this.suit, this.rank, this.deckId);
};

Card.prototype.toString = function () {
    return this.id + ' (' + this.uuid + ')';
};

Card.prototype.matches = function (filter) {
    if (!filter || Object.keys(filter).length === 0) {
        return true;
    }
    var suitMatch = !filter.suit || filter.suit.length === 0 || filter.suit.indexOf(this.suit) !== -1;
    var rankMatch = !filter.rank || filter.rank.length === 0 || filter.rank.indexOf(this.rank) !== -1;
    return suitMatch && rankMatch;
};

Card.resetUuidCounter = function () {
    _cardInstanceCounter = 0;
};

Card.getUuidCounter = function () {
    return _cardInstanceCounter;
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Card: Card };
}
