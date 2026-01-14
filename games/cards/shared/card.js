/**
 * card.js
 * Card data structure for the Card Engine.
 * 
 * Cards are "dumb data" - they hold identity, not behavior.
 * The Ruleset determines card values (Ace = 1 or 11, etc.).
 * 
 * UUID is REQUIRED for frontend animation tracking.
 * In a 6-deck Blackjack shoe, there are six King of Hearts.
 * UUID lets the frontend know WHICH specific card to animate.
 */

// UUID counter for generating unique IDs
let _cardInstanceCounter = 0;

/**
 * Generates a unique card instance ID.
 * Format: 'card_0', 'card_1', 'card_2', etc.
 * Resets are possible via Card.resetUuidCounter() for testing.
 */
function generateCardUuid() {
    return `card_${_cardInstanceCounter++}`;
}

/**
 * Card Class
 * Immutable once created (all properties set in constructor).
 */
class Card {
    /**
     * @param {string} suit - Suit enum value (e.g., Suit.HEARTS)
     * @param {string} rank - Rank enum value (e.g., Rank.KING)
     * @param {string} deckId - Reference to the Deck template this card belongs to
     */
    constructor(suit, rank, deckId = 'standard') {
        this.suit = suit;
        this.rank = rank;
        this.deckId = deckId;
        this.uuid = generateCardUuid();
        
        // Generate shorthand ID for debugging/display (e.g., 'KH', 'AS', '10D')
        this.id = this._generateId();
        
        // Freeze to prevent accidental mutation
        Object.freeze(this);
    }
    
    /**
     * Generates the shorthand ID (e.g., 'KH' for King of Hearts).
     * Uses the asset maps from enums.js for consistency with CardAssets.js.
     */
    _generateId() {
        const rankChar = RankToAsset[this.rank] || '?';
        const suitChar = SuitToAsset[this.suit] || '?';
        return `${rankChar}${suitChar}`;
    }
    
    /**
     * Returns the asset key for CardAssets.getAsset().
     * This is the same as `id` but provided for semantic clarity.
     * Usage: CardAssets.getAsset(...card.getAssetKey())
     */
    getAssetKey() {
        return [RankToAsset[this.rank], SuitToAsset[this.suit]];
    }
    
    /**
     * Returns a plain object representation for JSON serialization.
     * Used in the Data Contract for frontend communication.
     */
    toJSON() {
        return {
            suit: this.suit,
            rank: this.rank,
            id: this.id,
            deckId: this.deckId,
            uuid: this.uuid
        };
    }
    
    /**
     * Creates a clone of this card with a NEW uuid.
     * Used when copying cards between piles (cloneFrom).
     */
    clone() {
        return new Card(this.suit, this.rank, this.deckId);
    }
    
    /**
     * String representation for debugging.
     */
    toString() {
        return `${this.id} (${this.uuid})`;
    }
    
    /**
     * Checks if this card matches filter criteria.
     * @param {Object} filter - { suit?: Suit[], rank?: Rank[] }
     * @returns {boolean}
     */
    matches(filter) {
        if (!filter || Object.keys(filter).length === 0) {
            return true; // Empty filter matches all
        }
        
        const suitMatch = !filter.suit || filter.suit.length === 0 || filter.suit.includes(this.suit);
        const rankMatch = !filter.rank || filter.rank.length === 0 || filter.rank.includes(this.rank);
        
        return suitMatch && rankMatch;
    }
    
    /**
     * Reset the UUID counter (for testing purposes).
     */
    static resetUuidCounter() {
        _cardInstanceCounter = 0;
    }
    
    /**
     * Get current UUID counter value (for debugging).
     */
    static getUuidCounter() {
        return _cardInstanceCounter;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Card };
}
