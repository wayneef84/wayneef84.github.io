/**
 * player.js
 * Base player structure for the Card Engine. ES5 Compatible.
 *
 * A Player holds cards (via a Pile) and has identity.
 * Safari-compatible: No class, no ??, no ?., uses var.
 */

function Player(config) {
    this.id = config.id;
    this.type = config.type || 'human';
    this.seat = (config.seat !== undefined && config.seat !== null) ? config.seat : 0;
    this.name = config.name || config.id;
    this.hand = new Pile();
}

Object.defineProperty(Player.prototype, 'isHuman', {
    get: function () { return this.type === 'human'; }
});

Object.defineProperty(Player.prototype, 'isAI', {
    get: function () { return this.type === 'ai'; }
});

Object.defineProperty(Player.prototype, 'cardCount', {
    get: function () { return this.hand.count; }
});

Player.prototype.clearHand = function () {
    this.hand.clear();
};

Player.prototype.toJSON = function () {
    return {
        id: this.id,
        type: this.type,
        seat: this.seat,
        name: this.name,
        hand: this.hand.toJSON(),
        cardCount: this.cardCount
    };
};

Player.prototype.toString = function () {
    return 'Player[' + this.id + '] (' + this.type + ', seat ' + this.seat + '): ' + this.cardCount + ' cards';
};

/**
 * PlayerWithCurrency - Player with betting capabilities.
 * Used by games with wagering (Blackjack, Poker).
 */
function PlayerWithCurrency(config) {
    Player.call(this, config);
    this.balance = (config.balance !== undefined && config.balance !== null) ? config.balance : 1000;
    this.currentBet = 0;
}

PlayerWithCurrency.prototype = Object.create(Player.prototype);
PlayerWithCurrency.prototype.constructor = PlayerWithCurrency;

PlayerWithCurrency.prototype.canAfford = function (amount) {
    return this.balance >= amount;
};

PlayerWithCurrency.prototype.deduct = function (amount) {
    if (!this.canAfford(amount)) return false;
    this.balance -= amount;
    return true;
};

PlayerWithCurrency.prototype.credit = function (amount) {
    this.balance += amount;
};

PlayerWithCurrency.prototype.placeBet = function (amount) {
    if (this.deduct(amount)) {
        this.currentBet += amount;
        return true;
    }
    return false;
};

PlayerWithCurrency.prototype.clearBet = function () {
    this.currentBet = 0;
};

PlayerWithCurrency.prototype.resetBalance = function (amount) {
    this.balance = (amount !== undefined && amount !== null) ? amount : 1000;
    this.currentBet = 0;
};

PlayerWithCurrency.prototype.toJSON = function () {
    var base = Player.prototype.toJSON.call(this);
    base.balance = this.balance;
    base.currentBet = this.currentBet;
    return base;
};

/**
 * Dealer - Special AI player.
 */
function Dealer(config) {
    config = config || {};
    Player.call(this, {
        id: config.id || 'dealer',
        type: 'ai',
        seat: (config.seat !== undefined && config.seat !== null) ? config.seat : -1,
        name: config.name || 'Dealer'
    });
}

Dealer.prototype = Object.create(Player.prototype);
Dealer.prototype.constructor = Dealer;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player: Player, PlayerWithCurrency: PlayerWithCurrency, Dealer: Dealer };
}
