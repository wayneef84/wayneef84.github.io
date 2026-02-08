import { Ranks } from '../../../../negen/cards/enums.js';

// Standard Poker Rankings
const HandRank = {
    ROYAL_FLUSH: 10,
    STRAIGHT_FLUSH: 9,
    FOUR_OF_A_KIND: 8,
    FULL_HOUSE: 7,
    FLUSH: 6,
    STRAIGHT: 5,
    THREE_OF_A_KIND: 4,
    TWO_PAIR: 3,
    PAIR: 2,
    HIGH_CARD: 1
};

const HandNames = {
    10: 'Royal Flush',
    9: 'Straight Flush',
    8: 'Four of a Kind',
    7: 'Full House',
    6: 'Flush',
    5: 'Straight',
    4: 'Three of a Kind',
    3: 'Two Pair',
    2: 'Pair',
    1: 'High Card'
};

export default class PokerEvaluator {

    /**
     * Evaluates a hand of 5 or more cards.
     * If more than 5 cards, finds the best 5-card combination.
     * @param {Array} cards - Array of Card objects.
     * @returns {Object} { rank, name, score, cards }
     */
    static evaluate(cards) {
        if (!cards) return { rank: 0, name: 'Invalid', value: 0 };

        if (cards.length === 3) {
            return this._evaluate3(cards);
        }

        if (cards.length < 5) return { rank: 0, name: 'Invalid', value: 0 };

        if (cards.length === 5) {
            return this._evaluate5(cards);
        }

        // Handle > 5 cards: Find best 5-card combination
        const combos = this._getCombinations(cards, 5);
        let bestHand = null;

        for (const hand of combos) {
            const result = this._evaluate5(hand);
            if (!bestHand || result.score > bestHand.score) {
                bestHand = result;
            }
        }
        return bestHand;
    }

    static _evaluate3(cards) {
        // Sort by value descending
        const sorted = [...cards].sort((a, b) => b.value - a.value);

        const groups = this._getGroups(sorted); // { count: [val, val], ... }

        let rank = HandRank.HIGH_CARD;
        let kickers = sorted.map(c => c.value);

        if (groups[3]) {
            rank = HandRank.THREE_OF_A_KIND;
            kickers = [groups[3][0]];
        } else if (groups[2]) {
            rank = HandRank.PAIR;
            kickers = [groups[2][0], ...this._getKickers(sorted, [groups[2][0]])];
        }

        // Calculate score
        let score = rank * 10000000000;
        for(let i=0; i<kickers.length; i++) {
             score += kickers[i] * Math.pow(100, 4-i);
        }

        return {
            rank: rank,
            name: HandNames[rank],
            score: score,
            cards: sorted
        };
    }

    static _getCombinations(arr, k) {
        const result = [];
        function combine(start, temp) {
            if (temp.length === k) {
                result.push([...temp]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                temp.push(arr[i]);
                combine(i + 1, temp);
                temp.pop();
            }
        }
        combine(0, []);
        return result;
    }

    static _evaluate5(cards) {
        // Sort by value descending
        const sorted = [...cards].sort((a, b) => b.value - a.value);

        const isFlush = this._isFlush(sorted);
        const isStraight = this._isStraight(sorted);

        const groups = this._getGroups(sorted); // { count: [val, val], ... }

        let rank = HandRank.HIGH_CARD;
        let kickers = sorted.map(c => c.value);

        if (isFlush && isStraight) {
            rank = (sorted[0].value === 14 && sorted[1].value === 13) ? HandRank.ROYAL_FLUSH : HandRank.STRAIGHT_FLUSH;
             // Check Wheel Straight Flush (A, 5, 4, 3, 2) top card is 5
            if (sorted[0].value === 14 && sorted[1].value === 5) {
                // Technically 5 high straight flush
                 // Kickers logic needs to handle wheel adjustment if we were being super precise,
                 // but generic score handles high card well enough usually.
                 // For wheel, the high card is 5.
                 // But sorted[0] is A (14).
                 // We should re-order kickers for wheel straight?
                 // Standard straight check handles recognition, but score might be off if we use A as high kicker.
                 // Let's refine kickers for Straight.
            }
        } else if (groups[4]) {
            rank = HandRank.FOUR_OF_A_KIND;
            kickers = [groups[4][0], ...this._getKickers(sorted, [groups[4][0]])];
        } else if (groups[3] && groups[2]) {
            rank = HandRank.FULL_HOUSE;
            kickers = [groups[3][0], groups[2][0]];
        } else if (isFlush) {
            rank = HandRank.FLUSH;
        } else if (isStraight) {
            rank = HandRank.STRAIGHT;
        } else if (groups[3]) {
            rank = HandRank.THREE_OF_A_KIND;
            kickers = [groups[3][0], ...this._getKickers(sorted, [groups[3][0]])];
        } else if (groups[2] && groups[2].length >= 2) {
            rank = HandRank.TWO_PAIR;
            kickers = [groups[2][0], groups[2][1], ...this._getKickers(sorted, groups[2])];
        } else if (groups[2]) {
            rank = HandRank.PAIR;
            kickers = [groups[2][0], ...this._getKickers(sorted, [groups[2][0]])];
        }

        // Adjust kickers for Wheel Straight (A, 5, 4, 3, 2)
        if ((rank === HandRank.STRAIGHT || rank === HandRank.STRAIGHT_FLUSH) && sorted[0].value === 14 && sorted[1].value === 5) {
            // It's a 5-high straight. 5,4,3,2,A.
            // Kickers should be 5,4,3,2,1 (treat A as 1) or just 5?
            // Poker score usually just compares the highest card of the straight.
            // For 5-high straight, the high card is 5.
            kickers = [5, 4, 3, 2, 1];
        }

        // Calculate score for tie-breaking
        // Base Rank (1-10) * Large Multiplier + Kickers
        // Simple hex-like score: R 00 00 00 00 00
        let score = rank * 10000000000;
        for(let i=0; i<kickers.length; i++) {
             score += kickers[i] * Math.pow(100, 4-i);
        }

        return {
            rank: rank,
            name: HandNames[rank],
            score: score,
            cards: sorted
        };
    }

    static _isFlush(cards) {
        const suit = cards[0].suit;
        return cards.every(c => c.suit === suit);
    }

    static _isStraight(cards) {
        // Unique values only for straights? No, 5 cards must be unique.
        for (let i = 0; i < cards.length - 1; i++) {
            if (cards[i].value - cards[i+1].value !== 1) {
                // Check Wheel (A, 5, 4, 3, 2)
                if (i === 0 && cards[0].value === 14 && cards[1].value === 5) {
                     continue; // Ace low continuation
                }
                return false;
            }
        }
        return true;
    }

    static _getGroups(cards) {
        const counts = {};
        cards.forEach(c => {
            counts[c.value] = (counts[c.value] || 0) + 1;
        });

        const groups = {};
        for (const [val, count] of Object.entries(counts)) {
            if (!groups[count]) groups[count] = [];
            groups[count].push(parseInt(val));
        }

        // Sort groups descending
        for (const k in groups) {
            groups[k].sort((a, b) => b - a);
        }
        return groups;
    }

    static _getKickers(cards, excludeValues) {
        return cards
            .filter(c => !excludeValues.includes(c.value))
            .map(c => c.value);
    }
}
