import BasePokerGame from '../shared/BasePokerGame.js';
import Pile from '../../../../negen/cards/Pile.js';

export default class TexasHoldem extends BasePokerGame {
    constructor(engine) {
        super(engine);
        this.community = new Pile('community');
        this.phases = ['PRE_FLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];
        this.currentPhaseIndex = 0;
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
        this.community.give(this.discard, this.community.count);

        this._ensureDeck(20);
        this.dealToAll(2, true);

        this.currentPhaseIndex = 0;
        this.state = this.phases[0];
        this.emit('STATE_CHANGE', { state: this.state });
        return true;
    }

    betAndAdvance(multiplier) {
        if (multiplier === undefined) multiplier = 1;
        var p1 = this.players[0];
        var opp = this.players[1];
        var amount = this.ante * multiplier;
        if (p1 && p1.balance >= amount) {
            p1.balance -= amount;
            this.pot += amount;
            if (opp) {
                opp.balance -= amount;
                this.pot += amount;
            }
        }
        this.advancePhase();
    }

    fold() {
        var opp = this.players[1];
        var potWon = this.pot;
        if (opp) opp.balance += this.pot;
        this.pot = 0;
        this.state = 'GAME_OVER';
        this.emit('SHOWDOWN', {
            winner: opp ? opp.id : 'dealer',
            folded: true,
            results: [],
            pot: potWon
        });
    }

    advancePhase() {
        this.currentPhaseIndex++;
        if (this.currentPhaseIndex >= this.phases.length) {
            this._showdown();
            return;
        }

        var phase = this.phases[this.currentPhaseIndex];
        this.state = phase;

        switch (phase) {
            case 'FLOP':
                this._dealCommunity(3);
                break;
            case 'TURN':
                this._dealCommunity(1);
                break;
            case 'RIVER':
                this._dealCommunity(1);
                break;
            case 'SHOWDOWN':
                this._showdown();
                return;
        }

        this.emit('STATE_CHANGE', { state: this.state });
    }

    _dealCommunity(count) {
        this.deck.give(this.discard, 1); // Burn 1 card
        var cards = this.deck.give(this.community, count);
        cards.forEach(function (c) { c.faceUp = true; });
        this.emit('COMMUNITY_DEAL', { cards });
    }

    _showdown() {
        var communityCards = this.community.contents;
        var self = this;
        var results = this.players.map(function (p) {
            var allCards = p.hand.contents.concat(communityCards);
            var ev = self.Evaluator.evaluate(allCards);
            return { player: p, hand: ev };
        });

        results.sort(function (a, b) { return b.hand.score - a.hand.score; });
        var bestScore = results[0].hand.score;
        var winners = results.filter(function (r) { return r.hand.score === bestScore; });

        var share = Math.floor(this.pot / winners.length);
        winners.forEach(function (w) { w.player.balance += share; });
        var potWon = this.pot;
        this.pot = 0;

        var winnerId = winners.length > 1 ? 'push' : winners[0].player.id;
        this.state = 'GAME_OVER';
        this.emit('SHOWDOWN', {
            winner: winnerId,
            results: results.map(function (r) { return { playerId: r.player.id, hand: r.hand }; }),
            pot: potWon
        });
    }
}
