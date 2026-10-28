import BasePokerGame from '../shared/BasePokerGame.js';
import { RankValues } from '../../../../negen/cards/enums.js';

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
        const p1 = this.players[0];
        const opp = this.players[1];
        if (!p1 || p1.balance < this.ante) return false;

        this._collectAnte(p1);
        if (opp) this._collectAnte(opp);

        this._resetHands();
        this._ensureDeck(26);
        this.dealToAll(13, true);

        this.state = 'ARRANGE_PHASE';
        this.emit('STATE_CHANGE', { state: this.state });
        return true;
    }

    validateRowStrength(top, middle, bottom) {
        if (!top || top.length !== 3) return false;
        if (!middle || middle.length !== 5) return false;
        if (!bottom || bottom.length !== 5) return false;

        const topEv = this.Evaluator.evaluate(top);
        const middleEv = this.Evaluator.evaluate(middle);
        const bottomEv = this.Evaluator.evaluate(bottom);

        // Rule: Bottom >= Middle >= Top (compare by rank tier first, then score)
        if (bottomEv.rank < middleEv.rank) return false;
        if (bottomEv.rank === middleEv.rank && bottomEv.score < middleEv.score) return false;
        if (middleEv.rank < topEv.rank) return false;
        if (middleEv.rank === topEv.rank && middleEv.score < topEv.score) return false;

        return true;
    }

    /**
     * Automatically Partition 13 cards into a valid { topIndices, middleIndices, bottomIndices }
     * where Bottom (5) >= Middle (5) >= Top (3).
     */
    autoArrangeIndices(cards) {
        const indexed = cards.map((card, idx) => ({ card, idx, val: RankValues[card.rank] || 0 }));
        // Sort ascending by rank value so weakest 3 are in top, middle 5 in middle, strongest 5 in bottom
        indexed.sort((a, b) => a.val - b.val);

        // Group identical ranks together so pairs/trips stay together in stronger rows
        const freq = {};
        indexed.forEach(item => { freq[item.card.rank] = (freq[item.card.rank] || 0) + 1; });
        indexed.sort((a, b) => {
            const fa = freq[a.card.rank];
            const fb = freq[b.card.rank];
            if (fa !== fb) return fa - fb;
            return a.val - b.val;
        });

        const topIndices = indexed.slice(0, 3).map(x => x.idx);
        let middleIndices = indexed.slice(3, 8).map(x => x.idx);
        let bottomIndices = indexed.slice(8, 13).map(x => x.idx);

        const topCards = topIndices.map(i => cards[i]);
        let midCards = middleIndices.map(i => cards[i]);
        let botCards = bottomIndices.map(i => cards[i]);

        const midEv = this.Evaluator.evaluate(midCards);
        const botEv = this.Evaluator.evaluate(botCards);
        if (botEv.rank < midEv.rank || (botEv.rank === midEv.rank && botEv.score < midEv.score)) {
            const tmp = middleIndices;
            middleIndices = bottomIndices;
            bottomIndices = tmp;
        }

        return { topIndices, middleIndices, bottomIndices };
    }

    _compareRows(cardsA, cardsB) {
        const evA = this.Evaluator.evaluate(cardsA);
        const evB = this.Evaluator.evaluate(cardsB);
        if (evA.rank !== evB.rank) return evA.rank > evB.rank ? 1 : -1;
        if (evA.score !== evB.score) return evA.score > evB.score ? 1 : -1;
        return 0;
    }

    submitArrangement(topIndices, middleIndices, bottomIndices) {
        const p1 = this.players[0];
        const opp = this.players[1];

        const top = topIndices.map(i => p1.hand.contents[i]);
        const middle = middleIndices.map(i => p1.hand.contents[i]);
        const bottom = bottomIndices.map(i => p1.hand.contents[i]);

        if (!this.validateRowStrength(top, middle, bottom)) {
            console.warn('Invalid arrangement: Foul (Bottom must be >= Middle >= Top)!');
            return false;
        }

        // Arrange AI Opponent hand
        const oppArr = this.autoArrangeIndices(opp.hand.contents);
        const oppTop = oppArr.topIndices.map(i => opp.hand.contents[i]);
        const oppMid = oppArr.middleIndices.map(i => opp.hand.contents[i]);
        const oppBot = oppArr.bottomIndices.map(i => opp.hand.contents[i]);

        const rTop = this._compareRows(top, oppTop);
        const rMid = this._compareRows(middle, oppMid);
        const rBot = this._compareRows(bottom, oppBot);
        const totalRowScore = rTop + rMid + rBot;

        let winnerId = 'push';
        if (totalRowScore > 0) {
            winnerId = 'player1';
            p1.balance += this.pot;
        } else if (totalRowScore < 0) {
            winnerId = 'dealer';
            opp.balance += this.pot;
        } else {
            p1.balance += this.pot / 2;
            opp.balance += this.pot / 2;
        }

        const potWon = this.pot;
        this.pot = 0;
        this.state = 'GAME_OVER';

        this.emit('SHOWDOWN', {
            winner: winnerId,
            pot: potWon,
            rowResults: { top: rTop, middle: rMid, bottom: rBot, netRows: totalRowScore },
            p1Rows: {
                top: this.Evaluator.evaluate(top),
                middle: this.Evaluator.evaluate(middle),
                bottom: this.Evaluator.evaluate(bottom)
            },
            oppRows: {
                top: this.Evaluator.evaluate(oppTop),
                middle: this.Evaluator.evaluate(oppMid),
                bottom: this.Evaluator.evaluate(oppBot),
                cards: { top: oppTop, middle: oppMid, bottom: oppBot }
            }
        });

        return true;
    }
}
