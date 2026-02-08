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
        if (!this._collectAnte(this.players[0])) return false;

        this._resetHands();
        this.community.give(this.discard, this.community.count); // clear community

        this._ensureDeck(20); // enough for hands + community + burn

        // Deal 2 hole cards
        this.dealToAll(2, true);

        this.currentPhaseIndex = 0;
        this.state = this.phases[0]; // PRE_FLOP
        this.emit('STATE_CHANGE', { state: this.state });

        return true;
    }

    advancePhase() {
        this.currentPhaseIndex++;
        if (this.currentPhaseIndex >= this.phases.length) {
            this._showdown();
            return;
        }

        const phase = this.phases[this.currentPhaseIndex];
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
                break;
        }

        this.emit('STATE_CHANGE', { state: this.state });
    }

    _dealCommunity(count) {
        // Burn one card? Traditional rules burn 1 before each deal.
        this.deck.give(this.discard, 1);

        const cards = this.deck.give(this.community, count);
        cards.forEach(c => c.faceUp = true);
        this.emit('COMMUNITY_DEAL', { cards });
    }

    _showdown() {
        const communityCards = this.community.contents;

        // Evaluate each player
        const results = this.players.map(p => {
            const allCards = [...p.hand.contents, ...communityCards];
            const ev = this.Evaluator.evaluate(allCards);
            return { player: p, hand: ev };
        });

        // Determine winner
        results.sort((a, b) => b.hand.score - a.hand.score);
        const winner = results[0];

        // Basic winner logic (ignoring split pots for now)
        winner.player.balance += this.pot;
        const potWon = this.pot;
        this.pot = 0;

        this.state = 'GAME_OVER';
        this.emit('SHOWDOWN', {
            winner: winner.player.id,
            results: results.map(r => ({ playerId: r.player.id, hand: r.hand })),
            pot: potWon
        });
    }
}
