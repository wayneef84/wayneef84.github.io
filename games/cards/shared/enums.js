/**
 * enums.js
 * Suit and Rank enumerations for the Card Engine.
 * 
 * These define IDENTITY only. Numeric values are determined by each game's Ruleset.
 * Example: Ace = 1 or 11 in Blackjack, Ace = 14 in War.
 * 
 * Extensible: Add custom suits (STARS, MOONS) or ranks (JOKER) as needed.
 */

const Suit = Object.freeze({
    CLUBS: 'CLUBS',
    DIAMONDS: 'DIAMONDS',
    HEARTS: 'HEARTS',
    SPADES: 'SPADES'
    // Extensible: Add STARS, MOONS, etc. for custom decks
});

const Rank = Object.freeze({
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
    // Extensible: Add JOKER, custom ranks
});

/**
 * Helper maps for converting between enum values and display/asset values.
 * These align with G's CardAssets.js which uses 'H', 'D', 'C', 'S' and 'A', '2'...'K'.
 */
const SuitToAsset = Object.freeze({
    [Suit.CLUBS]: 'C',
    [Suit.DIAMONDS]: 'D',
    [Suit.HEARTS]: 'H',
    [Suit.SPADES]: 'S'
});

const RankToAsset = Object.freeze({
    [Rank.ACE]: 'A',
    [Rank.TWO]: '2',
    [Rank.THREE]: '3',
    [Rank.FOUR]: '4',
    [Rank.FIVE]: '5',
    [Rank.SIX]: '6',
    [Rank.SEVEN]: '7',
    [Rank.EIGHT]: '8',
    [Rank.NINE]: '9',
    [Rank.TEN]: '10',
    [Rank.JACK]: 'J',
    [Rank.QUEEN]: 'Q',
    [Rank.KING]: 'K'
});

/**
 * Reverse maps for parsing asset keys back to enums (if needed).
 */
const AssetToSuit = Object.freeze({
    'C': Suit.CLUBS,
    'D': Suit.DIAMONDS,
    'H': Suit.HEARTS,
    'S': Suit.SPADES
});

const AssetToRank = Object.freeze({
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

/**
 * Standard deck configurations for quick reference.
 */
const StandardSuits = Object.freeze([Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES]);
const StandardRanks = Object.freeze([
    Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX,
    Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING
]);

// Euchre uses 9-A only
const EuchreRanks = Object.freeze([
    Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
]);

// Export for module usage (if using ES6 modules later)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Suit, Rank,
        SuitToAsset, RankToAsset,
        AssetToSuit, AssetToRank,
        StandardSuits, StandardRanks, EuchreRanks
    };
}
