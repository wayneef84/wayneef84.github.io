/**
 * player.js
 * Base player structure for the Card Engine.
 * 
 * A Player holds cards (via a Pile) and has identity.
 * Games extend this for additional properties:
 * - Currency/chips
 * - Bet history
 * - AI strategy
 * - Score
 * 
 * Safari-compatible: Avoids nullish coalescing (??) operator
 */

class Player {
    /**
     * @param {Object} config - Player configuration
     * @param {string} config.id - Unique player identifier
     * @param {string} [config.type='human'] - 'human' or 'ai'
     * @param {number} [config.seat=0] - Table position (0-indexed)
     * @param {string} [config.name] - Display name (defaults to id)
     */
    constructor(config) {
        this.id = config.id;
        this.type = config.type || 'human';
        this.seat = (config.seat !== undefined && config.seat !== null) ? config.seat : 0;
        this.name = config.name || config.id;
        
        // Every player has a hand (Pile)
        this.hand = new Pile();
    }
    
    /**
     * Check if this player is human.
     * @returns {boolean}
     */
    get isHuman() {
        return this.type === 'human';
    }
    
    /**
     * Check if this player is AI-controlled.
     * @returns {boolean}
     */
    get isAI() {
        return this.type === 'ai';
    }
    
    /**
     * Get the number of cards in hand.
     * @returns {number}
     */
    get cardCount() {
        return this.hand.count;
    }
    
    /**
     * Clear the player's hand (for new round).
     */
    clearHand() {
        this.hand.clear();
    }
    
    /**
     * Return player state as JSON.
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            seat: this.seat,
            name: this.name,
            hand: this.hand.toJSON(),
            cardCount: this.cardCount
        };
    }
    
    /**
     * String representation for debugging.
     */
    toString() {
        return 'Player[' + this.id + '] (' + this.type + ', seat ' + this.seat + '): ' + this.cardCount + ' cards';
    }
}

/**
 * PlayerWithCurrency extends Player with betting capabilities.
 * Used by games with wagering (Blackjack, Poker).
 */
class PlayerWithCurrency extends Player {
    /**
     * @param {Object} config - Player configuration (extends Player config)
     * @param {number} [config.balance=1000] - Starting currency
     */
    constructor(config) {
        super(config);
        this.balance = (config.balance !== undefined && config.balance !== null) ? config.balance : 1000;
        this.currentBet = 0;
    }
    
    /**
     * Check if player can afford an amount.
     * @param {number} amount
     * @returns {boolean}
     */
    canAfford(amount) {
        return this.balance >= amount;
    }
    
    /**
     * Deduct currency (for betting).
     * @param {number} amount
     * @returns {boolean} - True if successful, false if insufficient funds
     */
    deduct(amount) {
        if (!this.canAfford(amount)) {
            return false;
        }
        this.balance -= amount;
        return true;
    }
    
    /**
     * Credit currency (for winnings).
     * @param {number} amount
     */
    credit(amount) {
        this.balance += amount;
    }
    
    /**
     * Place a bet (deduct and track).
     * @param {number} amount
     * @returns {boolean} - True if successful
     */
    placeBet(amount) {
        if (this.deduct(amount)) {
            this.currentBet += amount;
            return true;
        }
        return false;
    }
    
    /**
     * Clear current bet (after round resolution).
     */
    clearBet() {
        this.currentBet = 0;
    }

    /**
     * Reset balance to a default value.
     * @param {number} [amount=1000]
     */
    resetBalance(amount) {
        this.balance = (amount !== undefined && amount !== null) ? amount : 1000;
        this.currentBet = 0;
    }
    
    /**
     * Return player state as JSON.
     */
    toJSON() {
        var base = Player.prototype.toJSON.call(this);
        base.balance = this.balance;
        base.currentBet = this.currentBet;
        return base;
    }
}

/**
 * Dealer is a special player type.
 * Always AI, typically seat -1 or a special position.
 */
class Dealer extends Player {
    constructor(config) {
        config = config || {};
        super({
            id: config.id || 'dealer',
            type: 'ai',
            seat: (config.seat !== undefined && config.seat !== null) ? config.seat : -1,
            name: config.name || 'Dealer'
        });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player, PlayerWithCurrency, Dealer };
}
