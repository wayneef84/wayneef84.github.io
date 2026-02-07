// negen/cards/Pile.js
import Deck from './Deck.js';

export default class Pile {
    constructor(name) {
        this.name = name;
        this.contents = []; // Array of Card objects
    }

    get count() { return this.contents.length; }
    get top() { return this.contents[0]; }
    get bottom() { return this.contents[this.contents.length - 1]; }
    get isEmpty() { return this.contents.length === 0; }

    add(card) {
        this.contents.push(card);
    }

    addMany(cards) {
        this.contents.push(...cards);
    }

    /**
     * Draw from Top (index 0) or specific index?
     * Standard Stack: Top is last added (push/pop).
     * Card Deck: Top is index 0 usually.
     * Let's stick to Python style: 0 is top.
     */
    draw(count = 1) {
        if (count > this.count) count = this.count;
        return this.contents.splice(0, count);
    }

    shuffle() {
        Deck.shuffle(this.contents);
    }

    clear() {
        this.contents = [];
    }

    /**
     * Move cards to another pile.
     * @param {Pile} targetPile
     * @param {number} count
     */
    give(targetPile, count = 1) {
        const cards = this.draw(count);
        targetPile.addMany(cards);
        return cards;
    }

    /**
     * Give specific card instances (e.g., specific selection)
     */
    giveCards(targetPile, cards) {
        // Filter out from self
        this.contents = this.contents.filter(c => !cards.includes(c));
        targetPile.addMany(cards);
    }
}
