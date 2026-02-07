/**
 * enums.js
 * Suit and Rank enumerations for the Card Engine.
 * ES5 Compatible - uses var instead of const.
 *
 * These define IDENTITY only. Numeric values are determined by each game's Ruleset.
 */

var Suit = Object.freeze({
    CLUBS: 'CLUBS',
    DIAMONDS: 'DIAMONDS',
    HEARTS: 'HEARTS',
    SPADES: 'SPADES'
});

var Rank = Object.freeze({
    ACE: 'ACE',
    TWO: 'TWO',
    THREE: 'THREE',
    FOUR: 'FOUR',
    FIVE: 'FIVE',
    SIX: 'SIX',
    SEVEN: 'SEVEN',
    EIGHT: 'EIGHT',
    NINE: 'NINE',
    TEN: 'TEN',
    JACK: 'JACK',
    QUEEN: 'QUEEN',
    KING: 'KING'
});

var SuitToAsset = Object.freeze({
    CLUBS: 'C',
    DIAMONDS: 'D',
    HEARTS: 'H',
    SPADES: 'S'
});

var RankToAsset = Object.freeze({
    ACE: 'A',
    TWO: '2',
    THREE: '3',
    FOUR: '4',
    FIVE: '5',
    SIX: '6',
    SEVEN: '7',
    EIGHT: '8',
    NINE: '9',
    TEN: '10',
    JACK: 'J',
    QUEEN: 'Q',
    KING: 'K'
});

var AssetToSuit = Object.freeze({
    'C': Suit.CLUBS,
    'D': Suit.DIAMONDS,
    'H': Suit.HEARTS,
    'S': Suit.SPADES
});

var AssetToRank = Object.freeze({
    'A': Rank.ACE,
    '2': Rank.TWO,
    '3': Rank.THREE,
    '4': Rank.FOUR,
    '5': Rank.FIVE,
    '6': Rank.SIX,
    '7': Rank.SEVEN,
    '8': Rank.EIGHT,
    '9': Rank.NINE,
    '10': Rank.TEN,
    'J': Rank.JACK,
    'Q': Rank.QUEEN,
    'K': Rank.KING
});

var StandardSuits = Object.freeze([Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES]);
var StandardRanks = Object.freeze([
    Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
    Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING
]);

var EuchreRanks = Object.freeze([
    Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
]);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Suit: Suit, Rank: Rank,
        SuitToAsset: SuitToAsset, RankToAsset: RankToAsset,
        AssetToSuit: AssetToSuit, AssetToRank: AssetToRank,
        StandardSuits: StandardSuits, StandardRanks: StandardRanks, EuchreRanks: EuchreRanks
    };
}
