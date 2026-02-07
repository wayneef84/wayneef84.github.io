// negen/cards/Deck.js
import Card from './Card.js';
import { Suits, Ranks } from './enums.js';
import MathUtils from '../utils/MathUtils.js';

export default class Deck {
    constructor() {
        this.template = [];
        this._buildStandardDeck();
    }

    _buildStandardDeck() {
        for (const s of Object.values(Suits)) {
            for (const r of Object.values(Ranks)) {
                this.template.push({ suit: s, rank: r });
            }
        }
    }

    /**
     * Creates a new array of Card instances.
     * @param {number} decks - Number of full decks to include
     * @returns {Card[]} Array of Card objects
     */
    create(decks = 1) {
        const cards = [];
        for (let i = 0; i < decks; i++) {
            this.template.forEach(def => {
                cards.push(new Card(def.suit, def.rank));
            });
        }
        return cards;
    }

    static shuffle(cards) {
        // Fisher-Yates
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }
}
