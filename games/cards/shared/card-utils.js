/**
 * card-utils.js
 * Shared card rendering utilities for War and Blackjack games.
 * Safari-compatible (ES5, no arrow functions, uses var)
 */

var CardUtils = (function() {
    'use strict';

    // Rank symbols for display (supports both Rank enum values and numeric strings)
    var rankSymbols = {
        'ACE': 'A',
        'KING': 'K',
        'QUEEN': 'Q',
        'JACK': 'J',
        'TEN': '10',
        'NINE': '9',
        'EIGHT': '8',
        'SEVEN': '7',
        'SIX': '6',
        'FIVE': '5',
        'FOUR': '4',
        'THREE': '3',
        'TWO': '2',
        '10': '10',
        '9': '9',
        '8': '8',
        '7': '7',
        '6': '6',
        '5': '5',
        '4': '4',
        '3': '3',
        '2': '2'
    };

    // Suit symbols for display
    var suitSymbols = {
        'HEARTS': '♥',
        'DIAMONDS': '♦',
        'CLUBS': '♣',
        'SPADES': '♠'
    };

    return {
        /**
         * Render a single card as text: "K♥"
         * @param {Object} card - Card object with suit and rank
         * @returns {String} Card text representation
         */
        renderCardText: function(card) {
            if (!card || !card.suit || !card.rank) {
                return '??';
            }
            var rank = rankSymbols[card.rank] || card.rank;
            var suit = suitSymbols[card.suit] || card.suit;
            return rank + suit;
        },

        /**
         * Render multiple cards as a space-separated list: "K♥ Q♠ 7♦"
         * @param {Array} cards - Array of card objects
         * @returns {String} Card list text
         */
        renderCardList: function(cards) {
            if (!cards || cards.length === 0) {
                return '';
            }
            var result = [];
            for (var i = 0; i < cards.length; i++) {
                result.push(this.renderCardText(cards[i]));
            }
            return result.join(' ');
        },

        /**
         * Get CSS color class for a card based on suit
         * @param {Object} card - Card object
         * @returns {String} 'red' or 'black'
         */
        getCardColor: function(card) {
            if (!card || !card.suit) {
                return 'black';
            }
            return (card.suit === 'HEARTS' || card.suit === 'DIAMONDS') ? 'red' : 'black';
        },

        /**
         * Render card with color styling
         * @param {Object} card - Card object
         * @returns {String} HTML string with colored card
         */
        renderCardHTML: function(card) {
            var color = this.getCardColor(card);
            var text = this.renderCardText(card);
            return '<span class="card-text card-' + color + '">' + text + '</span>';
        },

        /**
         * Render multiple cards with color styling
         * @param {Array} cards - Array of card objects
         * @returns {String} HTML string with colored cards
         */
        renderCardListHTML: function(cards) {
            if (!cards || cards.length === 0) {
                return '';
            }
            var result = [];
            for (var i = 0; i < cards.length; i++) {
                result.push(this.renderCardHTML(cards[i]));
            }
            return result.join(' ');
        }
    };
})();

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CardUtils: CardUtils };
}
