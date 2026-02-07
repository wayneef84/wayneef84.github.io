// negen/cards/Card.js
import { Suits, Ranks, Colors } from './enums.js';

let _uuidCounter = 0;

export default class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.uuid = `card_${_uuidCounter++}`;

        // Logical Props
        this.color = (suit === Suits.HEARTS || suit === Suits.DIAMONDS) ? Colors.RED : Colors.BLACK;

        // Runtime State (can be extended by CardEntity)
        this.faceUp = false;
    }

    get name() {
        return `${this.rank} of ${this.suit}`;
    }

    toString() {
        return `[${this.uuid}] ${this.name}`;
    }

    // Helper to get raw value for comparison (A > K > Q ...)
    get value() {
        const map = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
            '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return map[this.rank] || 0;
    }
}
