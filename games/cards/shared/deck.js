/**
 * deck.js
 * Deck template definitions for the Card Engine.
 * 
 * A Deck is a BLUEPRINT, not a container. It defines what cards COULD exist.
 * To get actual cards, use Pile.createFrom(deck, copies).
 * 
 * This separation allows:
 * - Standard 52-card game: createFrom(StandardDeck, 1)
 * - Blackjack 6-deck shoe: createFrom(StandardDeck, 6)
 * - Euchre: createFrom(EuchreDeck, 1)
 * - Custom wild deck: Define new Deck, modify as needed
 */

/**
 * Deck Class
 * Immutable template definition.
 */
class Deck {
    /**
     * @param {Object} config - Deck configuration
     * @param {string} config.id - Unique identifier (e.g., 'standard', 'euchre', 'wild')
     * @param {string[]} config.suits - Array of Suit enum values
     * @param {string[]} config.ranks - Array of Rank enum values
     * @param {string} [config.cardBack='blue'] - Card back style identifier
     * @param {string} [config.name] - Display name (defaults to id)
     */
    constructor(config) {
        this.id = config.id;
        this.suits = Object.freeze([...config.suits]);
        this.ranks = Object.freeze([...config.ranks]);
        this.cardBack = config.cardBack || 'blue';
        this.name = config.name || config.id;
        
        // Calculate card count for this template
        this.cardCount = this.suits.length * this.ranks.length;
        
        Object.freeze(this);
    }
    
    /**
     * Returns configuration as plain object.
     */
    toJSON() {
        return {
            id: this.id,
            suits: [...this.suits],
            ranks: [...this.ranks],
            cardBack: this.cardBack,
            name: this.name,
            cardCount: this.cardCount
        };
    }
    
    /**
     * String representation for debugging.
     */
    toString() {
        return `Deck[${this.id}]: ${this.cardCount} cards (${this.suits.length} suits × ${this.ranks.length} ranks)`;
    }
    
    /**
     * Creates a modified copy of this deck with different properties.
     * Useful for creating variants (e.g., wild deck with different back).
     * 
     * @param {Object} overrides - Properties to override
     * @returns {Deck}
     */
    extend(overrides) {
        return new Deck({
            id: overrides.id || this.id,
            suits: overrides.suits || this.suits,
            ranks: overrides.ranks || this.ranks,
            cardBack: overrides.cardBack || this.cardBack,
            name: overrides.name || this.name
        });
    }
}

// ============================================================================
// PREDEFINED DECK TEMPLATES
// ============================================================================

/**
 * Standard 52-card deck.
 * Used by: Blackjack, Poker, War, most card games.
 */
const StandardDeck = new Deck({
    id: 'standard',
    name: 'Standard 52-Card Deck',
    suits: StandardSuits,
    ranks: StandardRanks,
    cardBack: 'blue'
});

/**
 * Euchre deck (24 cards: 9-A in each suit).
 * Used by: Euchre
 */
const EuchreDeck = new Deck({
    id: 'euchre',
    name: 'Euchre Deck (24 cards)',
    suits: StandardSuits,
    ranks: EuchreRanks,
    cardBack: 'blue'
});

/**
 * Pinochle deck (48 cards: 9-A, doubled).
 * Note: Use Pile.createFrom(PinochleDeck, 2) for the full 48-card deck,
 * or use this 24-card base with copies=2.
 */
const PinochleDeck = new Deck({
    id: 'pinochle',
    name: 'Pinochle Deck (24 cards base)',
    suits: StandardSuits,
    ranks: EuchreRanks,
    cardBack: 'red'
});

/**
 * Deck Library - Quick access to predefined decks by ID.
 */
const DeckLibrary = Object.freeze({
    'standard': StandardDeck,
    'euchre': EuchreDeck,
    'pinochle': PinochleDeck,
    
    /**
     * Get a deck by ID.
     * @param {string} id
     * @returns {Deck|undefined}
     */
    get(id) {
        return this[id];
    },
    
    /**
     * Create a custom deck on the fly.
     * @param {Object} config
     * @returns {Deck}
     */
    create(config) {
        return new Deck(config);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Deck, StandardDeck, EuchreDeck, PinochleDeck, DeckLibrary };
}
