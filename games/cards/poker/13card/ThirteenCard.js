import BasePokerGame from '../shared/BasePokerGame.js';
// Local copy of negen/cards/enums.js RankValues (a second import would add a new ES module violation)
var RankValues = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
    '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

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
        var p1 = this.players[0];
        var opp = this.players[1];
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

        var topEv = this.Evaluator.evaluate(top);
        var middleEv = this.Evaluator.evaluate(middle);
        var bottomEv = this.Evaluator.evaluate(bottom);

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
        var indexed = cards.map(function (card, idx) { return { card: card, idx: idx, val: RankValues[card.rank] || 0 }; });
        // Sort ascending by rank value so weakest 3 are in top, middle 5 in middle, strongest 5 in bottom
        indexed.sort(function (a, b) { return a.val - b.val; });

        // Group identical ranks together so pairs/trips stay together in stronger rows
        var freq = {};
        indexed.forEach(function (item) { freq[item.card.rank] = (freq[item.card.rank] || 0) + 1; });
        indexed.sort(function (a, b) {
            var fa = freq[a.card.rank];
            var fb = freq[b.card.rank];
            if (fa !== fb) return fa - fb;
            return a.val - b.val;
        });

        var topIndices = indexed.slice(0, 3).map(function (x) { return x.idx; });
        var middleIndices = indexed.slice(3, 8).map(function (x) { return x.idx; });
        var bottomIndices = indexed.slice(8, 13).map(function (x) { return x.idx; });

        var topCards = topIndices.map(function (i) { return cards[i]; });
        var midCards = middleIndices.map(function (i) { return cards[i]; });
        var botCards = bottomIndices.map(function (i) { return cards[i]; });

        var midEv = this.Evaluator.evaluate(midCards);
        var botEv = this.Evaluator.evaluate(botCards);
        if (botEv.rank < midEv.rank || (botEv.rank === midEv.rank && botEv.score < midEv.score)) {
            var tmp = middleIndices;
            middleIndices = bottomIndices;
            bottomIndices = tmp;
        }

        return { topIndices, middleIndices, bottomIndices };
    }

    _compareRows(cardsA, cardsB) {
        var evA = this.Evaluator.evaluate(cardsA);
        var evB = this.Evaluator.evaluate(cardsB);
        if (evA.rank !== evB.rank) return evA.rank > evB.rank ? 1 : -1;
        if (evA.score !== evB.score) return evA.score > evB.score ? 1 : -1;
        return 0;
    }

    submitArrangement(topIndices, middleIndices, bottomIndices) {
        var p1 = this.players[0];
        var opp = this.players[1];

        var top = topIndices.map(function (i) { return p1.hand.contents[i]; });
        var middle = middleIndices.map(function (i) { return p1.hand.contents[i]; });
        var bottom = bottomIndices.map(function (i) { return p1.hand.contents[i]; });

        if (!this.validateRowStrength(top, middle, bottom)) {
            console.warn('Invalid arrangement: Foul (Bottom must be >= Middle >= Top)!');
            return false;
        }

        // Arrange AI Opponent hand
        var oppArr = this.autoArrangeIndices(opp.hand.contents);
        var oppTop = oppArr.topIndices.map(function (i) { return opp.hand.contents[i]; });
        var oppMid = oppArr.middleIndices.map(function (i) { return opp.hand.contents[i]; });
        var oppBot = oppArr.bottomIndices.map(function (i) { return opp.hand.contents[i]; });

        var rTop = this._compareRows(top, oppTop);
        var rMid = this._compareRows(middle, oppMid);
        var rBot = this._compareRows(bottom, oppBot);
        var totalRowScore = rTop + rMid + rBot;

        var winnerId = 'push';
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

        var potWon = this.pot;
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
