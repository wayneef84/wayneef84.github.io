// games/cards/poker/5card/negen_poker.js
import BasePokerGame from '../shared/BasePokerGame.js';
// CardAssets is global (loaded via <script> tag in index.html)
import { RankValues } from '../../../../negen/cards/enums.js';

export default class FiveCardDraw extends BasePokerGame {
    constructor(engine) {
        super(engine);
        this.ante = 10;
        this.deckEditor = null; // Placeholder
    }

    init() {
        super.init();

        // Add Player and Dealer (Bot)
        // We use player1 as human, player2 as dealer
        this.addPlayer('player1', 'You', 1000);
        this.addPlayer('dealer', 'Dealer', 100000);

        this.state = 'BETTING';
        this.emit('STATE_CHANGE', { state: 'BETTING' });
    }

    startRound() {
        // Collect Ante (Human only for now, based on original logic)
        const p1 = this.players[0];
        if (p1.balance < this.ante) return false;

        p1.balance -= this.ante;
        this.pot += this.ante;

        // Reset Hands
        this._resetHands();

        // Shuffle if low
        this._ensureDeck(15);

        // Deal 5 each, face up for human
        this.dealToAll(5, true);

        this.state = 'PLAYER_TURN'; // Draw Phase
        this.emit('STATE_CHANGE', { state: 'PLAYER_TURN' });

        return true;
    }

    drawCards(indicesToDiscard) {
        const p1 = this.players[0];

        // Sort descending to splice correctly
        indicesToDiscard.sort((a, b) => b - a);

        // Discard
        indicesToDiscard.forEach(idx => {
            // Remove specific card by index
            if (idx >= 0 && idx < p1.hand.contents.length) {
                const specificCard = p1.hand.contents.splice(idx, 1)[0];
                this.discard.add(specificCard);
            }
        });

        // Draw replacements
        const count = indicesToDiscard.length;
        this._ensureDeck(count);

        // Give cards to hand
        const newCards = this.deck.give(p1.hand, count);

        // Ensure new cards are face up
        newCards.forEach(c => c.faceUp = true);

        // Dealer Turn (AI)
        this._dealerTurn();
    }

    _dealerTurn() {
        const dealer = this.players[1];
        const ev = this.Evaluator.evaluate(dealer.hand.contents);

        // Simple AI: Keep paying hands, or high cards
        // If Hand Rank > Pair, Stand.
        // If Pair, discard others.
        // Else discard low cards (< 10).

        let toDiscard = [];

        if (ev.rank >= 2) { // Pair or better
            // Keep the cards involved in the rank
            // The Evaluator returns 'cards' sorted.
            // This is complex without "Kick" info per card logic.
            // Simplified: If rank >= Pair, Stand (Hold All)
        } else {
            // High Card: Discard anything < 10
            toDiscard = dealer.hand.contents.filter(c => RankValues[c.rank] < 10);
            dealer.hand.giveCards(this.discard, toDiscard);
            this._ensureDeck(toDiscard.length);
            this.deck.give(dealer.hand, toDiscard.length);
        }

        this._showdown();
    }

    // _ensureDeck is inherited from BasePokerGame

    _showdown() {
        const p1 = this.players[0];
        const dealer = this.players[1];

        const ev1 = this.Evaluator.evaluate(p1.hand.contents);
        const ev2 = this.Evaluator.evaluate(dealer.hand.contents);

        let winner = null;
        if (ev1.score > ev2.score) winner = p1;
        else if (ev2.score > ev1.score) winner = dealer;

        // Payout
        if (winner === p1) {
            p1.balance += this.pot;
        } else if (!winner) { // Push
            p1.balance += this.pot / 2;
        }

        const potWon = this.pot;
        this.pot = 0;

        this.state = 'GAME_OVER';
        this.emit('SHOWDOWN', {
            winner: winner ? winner.id : 'push',
            p1Hand: ev1,
            dealerHand: ev2,
            pot: potWon
        });
    }

    fold() {
        this.players[0].isFolded = true;
        this.state = 'GAME_OVER';
        this.pot = 0; // House takes it
        this.emit('FOLD');
    }
}
