import BasePokerGame from '../shared/BasePokerGame.js';

export default class ThirteenCard extends BasePokerGame {
    constructor(engine) {
        super(engine);
    }

    init() {
        super.init();
        this.addPlayer('player1', 'You', 1000);
        this.addPlayer('dealer', 'Opponent', 100000);
        this.state = 'IDLE';
    }

    startRound() {
        if (!this._collectAnte(this.players[0])) return false;

        this._resetHands();

        // Ensure deck (13 * players) = 26
        this._ensureDeck(26);

        // Deal 13 each
        this.dealToAll(13, true);

        this.state = 'ARRANGE_PHASE';
        this.emit('STATE_CHANGE', { state: this.state });

        return true;
    }

    /**
     * Helper to validate if the row arrangement is valid (Bottom >= Middle >= Top)
     * @param {Array} top - 3 cards
     * @param {Array} middle - 5 cards
     * @param {Array} bottom - 5 cards
     * @returns {boolean}
     */
    validateRowStrength(top, middle, bottom) {
        if (!top || top.length !== 3) return false;
        if (!middle || middle.length !== 5) return false;
        if (!bottom || bottom.length !== 5) return false;

        const topEv = this.Evaluator.evaluate(top);
        const middleEv = this.Evaluator.evaluate(middle);
        const bottomEv = this.Evaluator.evaluate(bottom);

        // Rule: Bottom >= Middle >= Top
        if (bottomEv.score < middleEv.score) return false;
        if (middleEv.score < topEv.score) return false;

        return true;
    }

    submitArrangement(topIndices, middleIndices, bottomIndices) {
        // Implementation for UI submission
        const p1 = this.players[0];

        // Convert indices to cards (Simplified logic assuming indices match hand contents)
        // In a real UI, we'd need to map carefully or pass card objects directly.
        const top = topIndices.map(i => p1.hand.contents[i]);
        const middle = middleIndices.map(i => p1.hand.contents[i]);
        const bottom = bottomIndices.map(i => p1.hand.contents[i]);

        if (!this.validateRowStrength(top, middle, bottom)) {
            console.warn('Invalid arrangement: Foul!');
            return false;
        }

        // Proceed to scoring...
        this.state = 'SHOWDOWN';
        this.emit('ARRANGEMENT_SUBMITTED');

        return true;
    }
}
