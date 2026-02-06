/**
 * game-config.js
 * Central configuration for Card Games currency and settings.
 * Ensures consistent balance tracking across all games.
 */

var GameConfig = {
    // Storage Keys
    STORAGE_KEYS: {
        BALANCE: 'family_arcade_balance',
        DECK_PREFIX: 'card_game_deck_', // + gameId
        SETTINGS_PREFIX: 'card_game_settings_' // + gameId
    },

    // Currency Defaults
    CURRENCY: {
        DEFAULT_BALANCE: 1000,
        RESET_THRESHOLD: 100, // Can reset if balance < 100
        RESET_AMOUNT: 1000
    },

    /**
     * Get current global player balance.
     * @returns {number}
     */
    getBalance: function() {
        var bal = localStorage.getItem(this.STORAGE_KEYS.BALANCE);
        return bal ? parseInt(bal, 10) : this.CURRENCY.DEFAULT_BALANCE;
    },

    /**
     * Set/Update global player balance.
     * @param {number} amount
     */
    setBalance: function(amount) {
        localStorage.setItem(this.STORAGE_KEYS.BALANCE, amount);
    },

    /**
     * Check if player can reset their funds (must be below threshold).
     * @param {number} currentBalance
     * @returns {boolean}
     */
    canResetFunds: function(currentBalance) {
        return currentBalance < this.CURRENCY.RESET_THRESHOLD;
    },

    /**
     * Reset funds to default if allowed.
     * @returns {number} New balance (or old if reset failed)
     */
    resetFunds: function() {
        var current = this.getBalance();
        if (this.canResetFunds(current)) {
            this.setBalance(this.CURRENCY.RESET_AMOUNT);
            return this.CURRENCY.RESET_AMOUNT;
        }
        return current;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}
