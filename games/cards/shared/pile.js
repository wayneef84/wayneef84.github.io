/**
 * pile.js
 * Universal card container for the Card Engine.
 * 
 * Everything that holds cards is a Pile:
 * - Draw pile, discard pile, player hands, community cards, etc.
 * 
 * Position logic uses Python-style indexing:
 * - 0 = top (first element)
 * - 1 = second from top
 * - -1 = bottom (last element)
 * - -2 = second from bottom
 * - Wraps around for out-of-bounds indices
 */

class Pile {
    /**
     * Create an empty pile.
     * Use static methods to populate:
     * - Pile.createFrom(deck, copies) for new cards
     * - pile.addFrom(otherPile) to move cards
     * - pile.cloneFrom(otherPile) to copy cards
     */
    constructor() {
        this.contents = [];
        this.template = null; // Snapshot for reset(), set by createFrom()
    }
    
    // ========================================================================
    // CREATION METHODS (Static)
    // ========================================================================
    
    /**
     * Factory: Create a new pile populated from a deck template.
     * 
     * @param {Deck} deck - The deck template to use
     * @param {number} [copies=1] - Number of complete decks to include
     * @returns {Pile} - New pile with cards
     * 
     * @example
     * // Standard 52-card deck
     * const drawPile = Pile.createFrom(StandardDeck, 1);
     * 
     * // Blackjack 6-deck shoe (312 cards)
     * const shoe = Pile.createFrom(StandardDeck, 6);
     */
    static createFrom(deck, copies = 1) {
        const pile = new Pile();
        
        for (let copy = 0; copy < copies; copy++) {
            for (const suit of deck.suits) {
                for (const rank of deck.ranks) {
                    pile.contents.push(new Card(suit, rank, deck.id));
                }
            }
        }
        
        // Save template for reset()
        pile.template = pile.contents.map(card => ({
            suit: card.suit,
            rank: card.rank,
            deckId: card.deckId
        }));
        
        return pile;
    }
    
    /**
     * Create a deep copy of this pile.
     * All cards get NEW uuids.
     * 
     * @returns {Pile}
     */
    clone() {
        const newPile = new Pile();
        newPile.contents = this.contents.map(card => card.clone());
        if (this.template) {
            newPile.template = [...this.template];
        }
        return newPile;
    }
    
    // ========================================================================
    // POSITION HELPERS (Internal)
    // ========================================================================
    
    /**
     * Normalize a position index to a valid array index.
     * Handles Python-style negative indexing and wrapping.
     * 
     * @param {number} position - The requested position
     * @param {boolean} [forInsert=false] - If true, allows position === length (append)
     * @returns {number} - Normalized index
     */
    _normalizePosition(position, forInsert = false) {
        const len = this.contents.length;
        
        if (len === 0) {
            return 0;
        }
        
        // Handle negative indices
        if (position < 0) {
            position = len + position + (forInsert ? 1 : 0);
        }
        
        // Clamp to valid range
        const max = forInsert ? len : len - 1;
        return Math.max(0, Math.min(position, max));
    }
    
    // ========================================================================
    // CARD MOVEMENT METHODS
    // ========================================================================
    
    /**
     * Add a single card to the pile at a specific position.
     * 
     * @param {Card} card - The card to add
     * @param {number} [position=0] - Where to insert (0=top, -1=bottom)
     * 
     * @example
     * pile.receive(card, 0);   // Add to top
     * pile.receive(card, -1);  // Add to bottom
     * pile.receive(card, 2);   // Insert at index 2
     */
    receive(card, position = 0) {
        const index = this._normalizePosition(position, true);
        this.contents.splice(index, 0, card);
    }
    
    /**
     * Remove and return a card from a specific position.
     * 
     * @param {number} [position=0] - Where to remove from (0=top, -1=bottom)
     * @returns {Card|null} - The removed card, or null if pile is empty
     * 
     * @example
     * const card = pile.give(0);   // Take from top
     * const card = pile.give(-1);  // Take from bottom
     */
    give(position = 0) {
        if (this.contents.length === 0) {
            return null;
        }
        
        const index = this._normalizePosition(position);
        return this.contents.splice(index, 1)[0];
    }
    
    /**
     * Move ALL cards from another pile into this pile.
     * DESTRUCTIVE: Source pile is emptied.
     * 
     * @param {Pile} sourcePile - The pile to take cards from
     * @param {number} [position=0] - Where to insert in this pile
     * 
     * @example
     * gamePile.addFrom(discardPile);  // Move all discards to game pile
     */
    addFrom(sourcePile, position = 0) {
        if (sourcePile.contents.length === 0) {
            return;
        }
        
        const index = this._normalizePosition(position, true);
        
        // Move all cards (splice them out of source)
        const cards = sourcePile.contents.splice(0, sourcePile.contents.length);
        
        // Insert into this pile
        this.contents.splice(index, 0, ...cards);
    }
    
    /**
     * Copy ALL cards from another pile into this pile.
     * NON-DESTRUCTIVE: Source pile unchanged. Cards get NEW uuids.
     * 
     * @param {Pile} sourcePile - The pile to copy cards from
     * @param {number} [position=0] - Where to insert in this pile
     * 
     * @example
     * backupPile.cloneFrom(playerHand);  // Snapshot player's hand
     */
    cloneFrom(sourcePile, position = 0) {
        if (sourcePile.contents.length === 0) {
            return;
        }
        
        const index = this._normalizePosition(position, true);
        
        // Clone all cards (new uuids)
        const clonedCards = sourcePile.contents.map(card => card.clone());
        
        // Insert into this pile
        this.contents.splice(index, 0, ...clonedCards);
    }
    
    // ========================================================================
    // MUTATION METHODS
    // ========================================================================
    
    /**
     * Remove cards matching a filter and return them as a new Pile.
     * 
     * @param {Object} [filter={}] - Filter criteria
     * @param {string[]} [filter.suit] - Suits to match (empty = all suits)
     * @param {string[]} [filter.rank] - Ranks to match (empty = all ranks)
     * @returns {Pile} - New pile containing removed cards
     * 
     * @example
     * // Remove all 2s and 3s
     * const removed = pile.remove({ rank: [Rank.TWO, Rank.THREE] });
     * 
     * // Remove all Hearts
     * const hearts = pile.remove({ suit: [Suit.HEARTS] });
     * 
     * // Remove Ace of Spades only
     * const ace = pile.remove({ rank: [Rank.ACE], suit: [Suit.SPADES] });
     * 
     * // Remove ALL cards
     * const all = pile.remove({});
     */
    remove(filter = {}) {
        const removedPile = new Pile();
        const remaining = [];
        
        for (const card of this.contents) {
            if (card.matches(filter)) {
                removedPile.contents.push(card);
            } else {
                remaining.push(card);
            }
        }
        
        this.contents = remaining;
        return removedPile;
    }
    
    /**
     * Re-tag all cards in this pile with a new deckId.
     * Used when creating "wild" decks from standard decks.
     * 
     * Note: This creates new Card instances (cards are immutable).
     * 
     * @param {string} newDeckId - The new deck ID to assign
     * 
     * @example
     * wildPile.setDeckId('wild');  // Mark as wild cards
     */
    setDeckId(newDeckId) {
        this.contents = this.contents.map(card => 
            new Card(card.suit, card.rank, newDeckId)
        );
    }
    
    // ========================================================================
    // QUERY METHODS
    // ========================================================================
    
    /**
     * View a card at a specific position WITHOUT removing it.
     * 
     * @param {number} [position=0] - Position to peek at
     * @returns {Card|null} - The card at that position, or null if empty
     */
    peek(position = 0) {
        if (this.contents.length === 0) {
            return null;
        }
        
        const index = this._normalizePosition(position);
        return this.contents[index];
    }
    
    /**
     * Return a NEW pile containing cards that match the filter.
     * NON-DESTRUCTIVE: Original pile unchanged.
     * 
     * @param {Object} [criteria={}] - Filter criteria (same as remove)
     * @returns {Pile} - New pile with matching cards (cloned)
     */
    filter(criteria = {}) {
        const filteredPile = new Pile();
        
        for (const card of this.contents) {
            if (card.matches(criteria)) {
                filteredPile.contents.push(card.clone());
            }
        }
        
        return filteredPile;
    }
    
    /**
     * Find a card by UUID.
     * 
     * @param {string} uuid - The UUID to search for
     * @returns {Card|null} - The card, or null if not found
     */
    findByUuid(uuid) {
        return this.contents.find(card => card.uuid === uuid) || null;
    }
    
    /**
     * Get the number of cards in the pile.
     * @returns {number}
     */
    get count() {
        return this.contents.length;
    }
    
    /**
     * Check if the pile is empty.
     * @returns {boolean}
     */
    get isEmpty() {
        return this.contents.length === 0;
    }
    
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    
    /**
     * Randomize the order of cards in the pile.
     * Uses Fisher-Yates shuffle for uniform distribution.
     */
    shuffle() {
        const arr = this.contents;
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    /**
     * Restore the pile to its original state (from template).
     * Cards get NEW uuids.
     * Only works if pile was created with createFrom().
     */
    reset() {
        if (!this.template) {
            console.warn('[Pile] Cannot reset: no template saved');
            return;
        }
        
        this.contents = this.template.map(t => 
            new Card(t.suit, t.rank, t.deckId)
        );
    }
    
    /**
     * Clear all cards from the pile.
     */
    clear() {
        this.contents = [];
    }
    
    /**
     * Return all cards as a JSON array.
     * Used in the Data Contract for frontend communication.
     * 
     * @returns {Object[]}
     */
    toJSON() {
        return this.contents.map(card => card.toJSON());
    }
    
    /**
     * String representation for debugging.
     */
    toString() {
        if (this.contents.length === 0) {
            return 'Pile[empty]';
        }
        const preview = this.contents.slice(0, 5).map(c => c.id).join(', ');
        const more = this.contents.length > 5 ? `, ... (+${this.contents.length - 5} more)` : '';
        return `Pile[${this.contents.length}]: ${preview}${more}`;
    }
    
    /**
     * Debug: Print all cards to console.
     */
    debug() {
        console.log(`=== Pile Debug (${this.contents.length} cards) ===`);
        this.contents.forEach((card, i) => {
            console.log(`  [${i}] ${card.toString()}`);
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pile };
}
