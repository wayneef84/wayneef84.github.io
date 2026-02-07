// negen/cards/CardGame.js
import Scene from '../core/Scene.js';
import Deck from './Deck.js';
import Pile from './Pile.js';

/**
 * Base Scene for Card Games.
 * Manages Decks, Hands, and basic Turns.
 */
export default class CardGame extends Scene {
    constructor(engine, ruleset) {
        super(engine);
        this.ruleset = ruleset; // { phases: [], onAction: () => {} }

        // Core Card State
        this.deck = new Pile('deck');
        this.discard = new Pile('discard');
        this.players = []; // Array of Player Piles/Objects

        // Game State
        this.state = 'IDLE';
        this.activePlayerIndex = 0;
        this.pot = 0;
    }

    init() {
        console.log('CardGame Init');
        this._initDeck();
    }

    _initDeck() {
        // Default standard deck if not overridden
        const blueprint = new Deck();
        this.deck.contents = blueprint.create(1);
        this.deck.shuffle();
        console.log(`Deck initialized with ${this.deck.count} cards.`);
    }

    // --- Actions ---

    addPlayer(id, name, balance = 1000) {
        const p = {
            id, name, balance,
            hand: new Pile(`hand_${id}`),
            isFolded: false,
            currentBet: 0
        };
        this.players.push(p);
        return p;
    }

    deal(count = 5) {
        this.players.forEach(p => {
            if (!p.isFolded) {
                this.deck.give(p.hand, count);
            }
        });
        this.emit('DEAL');
    }

    shuffleDeck() {
        // Gather all cards back? Or just shuffle deck pile?
        // Usually we shuffle discard into deck if empty
        if (this.deck.isEmpty && !this.discard.isEmpty) {
            this.discard.give(this.deck, this.discard.count);
            this.deck.shuffle();
            this.emit('SHUFFLE');
        } else {
            this.deck.shuffle();
        }
    }

    // --- Event Handling ---

    emit(type, data = {}) {
        // Hook for UI
        // Could use Engine's event bus or DOM CustomEvents
        const event = new CustomEvent('negen-card-event', {
            detail: { type, game: this, ...data }
        });
        window.dispatchEvent(event);
    }
}
