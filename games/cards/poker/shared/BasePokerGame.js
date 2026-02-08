import CardGame from '../../../../negen/cards/CardGame.js';
import Evaluator from './evaluator.js';

export default class BasePokerGame extends CardGame {
    constructor(engine) {
        super(engine);
        this.ante = 10;
        this.pot = 0;
        // Shared evaluator
        this.Evaluator = Evaluator;
    }

    init() {
        super.init();
        console.log('BasePokerGame Init');
    }

    /**
     * Deals cards to all active players.
     * @param {number} count - Number of cards to deal.
     * @param {boolean} faceUpForHuman - If true, human player's cards are face up.
     */
    dealToAll(count = 1, faceUpForHuman = true) {
        this.players.forEach(p => {
            if (!p.isFolded) {
                const newCards = this.deck.give(p.hand, count);

                // If it's the human player (assuming 'player1'), flip cards if requested
                if (p.id === 'player1' && faceUpForHuman) {
                    newCards.forEach(c => c.faceUp = true);
                }
            }
        });
        this.emit('DEAL');
    }

    /**
     * Ensures the deck has enough cards, reshuffling discard if needed.
     * @param {number} needed - Number of cards needed.
     */
    _ensureDeck(needed) {
        if (this.deck.count < needed) {
            if (this.discard.count > 0) {
                this.discard.give(this.deck, this.discard.count);
                this.deck.shuffle();
                this.emit('SHUFFLE');
            } else {
                console.warn('Not enough cards in deck and discard pile empty!');
            }
        }
    }

    /**
     * Helper to collect ante from a player.
     * @param {Object} player
     * @returns {boolean} success
     */
    _collectAnte(player) {
        if (player.balance < this.ante) return false;
        player.balance -= this.ante;
        this.pot += this.ante;
        return true;
    }

    /**
     * Resets all player hands to discard pile.
     */
    _resetHands() {
        this.players.forEach(p => {
            p.hand.give(this.discard, p.hand.count);
            p.isFolded = false;
        });
    }
}
