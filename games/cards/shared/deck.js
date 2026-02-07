/**
 * deck.js
 * Deck template definitions for the Card Engine. ES5 Compatible.
 *
 * A Deck is a BLUEPRINT, not a container. It defines what cards COULD exist.
 * To get actual cards, use Pile.createFrom(deck, copies).
 */

/**
 * Deck Constructor - Immutable template definition.
 */
function Deck(config) {
    this.id = config.id;
    this.suits = Object.freeze(config.suits.slice());
    this.ranks = Object.freeze(config.ranks.slice());
    this.cardBack = config.cardBack || 'blue';
    this.name = config.name || config.id;
    this.cardCount = this.suits.length * this.ranks.length;
    Object.freeze(this);
}

Deck.prototype.toJSON = function () {
    return {
        id: this.id,
        suits: this.suits.slice(),
        ranks: this.ranks.slice(),
        cardBack: this.cardBack,
        name: this.name,
        cardCount: this.cardCount
    };
};

Deck.prototype.toString = function () {
    return 'Deck[' + this.id + ']: ' + this.cardCount + ' cards (' + this.suits.length + ' suits x ' + this.ranks.length + ' ranks)';
};

Deck.prototype.extend = function (overrides) {
    return new Deck({
        id: overrides.id || this.id,
        suits: overrides.suits || this.suits,
        ranks: overrides.ranks || this.ranks,
        cardBack: overrides.cardBack || this.cardBack,
        name: overrides.name || this.name
    });
};

// ============================================================================
// PREDEFINED DECK TEMPLATES
// ============================================================================

var StandardDeck = new Deck({
    id: 'standard',
    name: 'Standard 52-Card Deck',
    suits: StandardSuits,
    ranks: StandardRanks,
    cardBack: 'blue'
});

var EuchreDeck = new Deck({
    id: 'euchre',
    name: 'Euchre Deck (24 cards)',
    suits: StandardSuits,
    ranks: EuchreRanks,
    cardBack: 'blue'
});

var PinochleDeck = new Deck({
    id: 'pinochle',
    name: 'Pinochle Deck (24 cards base)',
    suits: StandardSuits,
    ranks: EuchreRanks,
    cardBack: 'red'
});

var DeckLibrary = Object.freeze({
    'standard': StandardDeck,
    'euchre': EuchreDeck,
    'pinochle': PinochleDeck,
    get: function (id) { return this[id]; },
    create: function (config) { return new Deck(config); }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Deck: Deck, StandardDeck: StandardDeck, EuchreDeck: EuchreDeck, PinochleDeck: PinochleDeck, DeckLibrary: DeckLibrary };
}
