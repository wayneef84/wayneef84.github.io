/**
 * poker-evaluator.js
 * Shared hand evaluator for Poker variants.
 * Supports standard 5-card hands using standard ranks.
 *
 * Adaptation of standard poker evaluation logic.
 * License: MIT License
 *
 * Copyright (c) 2026 Wayne Fong
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var PokerEvaluator = (function() {

    // Hand Rankings (Higher is better)
    var HandRank = {
        HIGH_CARD: 1,
        PAIR: 2,
        TWO_PAIR: 3,
        THREE_OF_A_KIND: 4,
        STRAIGHT: 5,
        FLUSH: 6,
        FULL_HOUSE: 7,
        FOUR_OF_A_KIND: 8,
        STRAIGHT_FLUSH: 9,
        ROYAL_FLUSH: 10
    };

    // Rank Values for Comparison (Ace High)
    var RankValues = {
        'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5, 'SIX': 6,
        'SEVEN': 7, 'EIGHT': 8, 'NINE': 9, 'TEN': 10,
        'JACK': 11, 'QUEEN': 12, 'KING': 13, 'ACE': 14
    };

    /**
     * Convert cards to internal numeric format and sort descending.
     * @param {Array} cards
     */
    function processCards(cards) {
        return cards.map(function(c) {
            return {
                value: RankValues[c.rank],
                suit: c.suit,
                original: c
            };
        }).sort(function(a, b) {
            return b.value - a.value; // Descending order
        });
    }

    /**
     * Check for Flush.
     */
    function isFlush(cards) {
        var suit = cards[0].suit;
        for (var i = 1; i < cards.length; i++) {
            if (cards[i].suit !== suit) return false;
        }
        return true;
    }

    /**
     * Check for Straight.
     * Handles A-5-4-3-2 Wheel.
     */
    function isStraight(cards) {
        var uniqueValues = [];
        cards.forEach(function(c) {
            if (uniqueValues.indexOf(c.value) === -1) uniqueValues.push(c.value);
        });

        // Need at least 5 unique cards for a straight (though input is usually 5)
        if (uniqueValues.length < 5) return false;

        // Check normal straight
        var isNormal = true;
        for (var i = 0; i < uniqueValues.length - 1; i++) {
            if (uniqueValues[i] - uniqueValues[i+1] !== 1) {
                isNormal = false;
                break;
            }
        }
        if (isNormal) return true;

        // Check Wheel (A-5-4-3-2) -> Values: 14, 5, 4, 3, 2
        // uniqueValues is sorted descending: [14, 5, 4, 3, 2]
        if (uniqueValues[0] === 14 &&
            uniqueValues[1] === 5 &&
            uniqueValues[2] === 4 &&
            uniqueValues[3] === 3 &&
            uniqueValues[4] === 2) {
            return true;
        }

        return false;
    }

    /**
     * Get counts of each rank.
     */
    function getRankCounts(cards) {
        var counts = {};
        cards.forEach(function(c) {
            counts[c.value] = (counts[c.value] || 0) + 1;
        });
        return counts;
    }

    return {
        HandRank: HandRank,

        /**
         * Evaluate a 5-card hand.
         * @param {Array} cards - Array of Card objects
         * @returns {Object} { rankValue, rankName, value, kickers, name }
         */
        evaluate: function(cards) {
            if (!cards || cards.length !== 5) {
                return { rankValue: 0, name: 'Invalid Hand' };
            }

            var pCards = processCards(cards);
            var flush = isFlush(pCards);
            var straight = isStraight(pCards);

            // Check Straight Flush / Royal Flush
            if (flush && straight) {
                if (pCards[0].value === 14 && pCards[1].value === 13) {
                    return { rankValue: HandRank.ROYAL_FLUSH, name: 'Royal Flush', value: 14, kickers: [] };
                }
                // Handle 5-high straight flush (Steel Wheel)
                var highCard = pCards[0].value;
                if (highCard === 14 && pCards[1].value === 5) highCard = 5;

                return { rankValue: HandRank.STRAIGHT_FLUSH, name: 'Straight Flush', value: highCard, kickers: [] };
            }

            var counts = getRankCounts(pCards);
            var groups = []; // [{val: 14, count: 2}, ...]
            Object.keys(counts).forEach(function(val) {
                groups.push({ value: parseInt(val), count: counts[val] });
            });

            // Sort groups by Count (desc), then Value (desc)
            groups.sort(function(a, b) {
                if (b.count !== a.count) return b.count - a.count;
                return b.value - a.value;
            });

            var primary = groups[0];
            var secondary = groups[1];

            // Four of a Kind
            if (primary.count === 4) {
                return {
                    rankValue: HandRank.FOUR_OF_A_KIND,
                    name: 'Four of a Kind',
                    value: primary.value,
                    kickers: [secondary.value]
                };
            }

            // Full House
            if (primary.count === 3 && secondary.count === 2) {
                return {
                    rankValue: HandRank.FULL_HOUSE,
                    name: 'Full House',
                    value: primary.value,
                    kickers: [secondary.value]
                };
            }

            // Flush
            if (flush) {
                return {
                    rankValue: HandRank.FLUSH,
                    name: 'Flush',
                    value: pCards[0].value,
                    kickers: pCards.slice(1).map(function(c) { return c.value; })
                };
            }

            // Straight
            if (straight) {
                var high = pCards[0].value;
                // Wheel fix: 5 high
                if (high === 14 && pCards[1].value === 5) high = 5;
                return {
                    rankValue: HandRank.STRAIGHT,
                    name: 'Straight',
                    value: high,
                    kickers: []
                };
            }

            // Three of a Kind
            if (primary.count === 3) {
                return {
                    rankValue: HandRank.THREE_OF_A_KIND,
                    name: 'Three of a Kind',
                    value: primary.value,
                    kickers: groups.slice(1).map(function(g) { return g.value; })
                };
            }

            // Two Pair
            if (primary.count === 2 && secondary.count === 2) {
                return {
                    rankValue: HandRank.TWO_PAIR,
                    name: 'Two Pair',
                    value: primary.value, // Highest pair
                    kickers: [secondary.value, groups[2].value] // Lower pair, then kicker
                };
            }

            // Pair
            if (primary.count === 2) {
                return {
                    rankValue: HandRank.PAIR,
                    name: 'Pair',
                    value: primary.value,
                    kickers: groups.slice(1).map(function(g) { return g.value; })
                };
            }

            // High Card
            return {
                rankValue: HandRank.HIGH_CARD,
                name: 'High Card',
                value: pCards[0].value,
                kickers: pCards.slice(1).map(function(c) { return c.value; })
            };
        },

        /**
         * Compare two evaluated hands.
         * Returns 1 if hand1 > hand2, -1 if hand1 < hand2, 0 if tie.
         */
        compare: function(hand1, hand2) {
            // Compare Rank Category
            if (hand1.rankValue > hand2.rankValue) return 1;
            if (hand1.rankValue < hand2.rankValue) return -1;

            // Compare Primary Value (e.g., Rank of Pair)
            if (hand1.value > hand2.value) return 1;
            if (hand1.value < hand2.value) return -1;

            // Compare Kickers
            // Special handling for Two Pair: Secondary value is in kickers[0]
            for (var i = 0; i < hand1.kickers.length; i++) {
                if (hand1.kickers[i] > hand2.kickers[i]) return 1;
                if (hand1.kickers[i] < hand2.kickers[i]) return -1;
            }

            return 0;
        }
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PokerEvaluator;
}
