// negen/cards/Evaluator.js
import { Ranks } from './enums.js';

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

    static evaluate(cards) {
        if (!cards || cards.length < 5) return { rank: 0, name: 'Invalid', value: 0 };

        // Sort by value descending
        const sorted = [...cards].sort((a, b) => b.value - a.value);

        const isFlush = this._isFlush(sorted);
        const isStraight = this._isStraight(sorted);

        const groups = this._getGroups(sorted); // { count: [val, val], ... }

        let rank = HandRank.HIGH_CARD;
        let kickers = sorted.map(c => c.value);

        if (isFlush && isStraight) {
            rank = (sorted[0].value === 14) ? HandRank.ROYAL_FLUSH : HandRank.STRAIGHT_FLUSH;
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
