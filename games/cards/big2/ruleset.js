/**
 * ruleset.js
 * Big 2 (大老二) Ruleset System
 *
 * Rulesets are plain JSON objects that the Big2Engine reads.
 * Swap out Big2Rulesets.active to change the game rules.
 * Future: import/export via QR code.
 *
 * ES5 Compatible - var only, no arrow functions.
 */

// ============================================================================
// CARD VALUE MAPS
// Big 2 rank order (lowest → highest): 3,4,5,6,7,8,9,10,J,Q,K,A,2
// Suit order (lowest → highest): Diamonds, Clubs, Hearts, Spades
// ============================================================================

var Big2RankValues = {
    'THREE': 1,
    'FOUR': 2,
    'FIVE': 3,
    'SIX': 4,
    'SEVEN': 5,
    'EIGHT': 6,
    'NINE': 7,
    'TEN': 8,
    'JACK': 9,
    'QUEEN': 10,
    'KING': 11,
    'ACE': 12,
    'TWO': 13
};

var Big2SuitValues = {
    'DIAMONDS': 1,
    'CLUBS': 2,
    'HEARTS': 3,
    'SPADES': 4
};

// ============================================================================
// HAND TYPE CONSTANTS
//
// 3-card and 5-card hands are separate size categories.
// Within each size, higher numeric value = stronger hand type.
// A 3-card hand can ONLY beat another 3-card hand.
// A 5-card hand can ONLY beat another 5-card hand.
// (Unless ruleset.fiveCardBeatsLower = true)
// ============================================================================

var Big2HandType = Object.freeze({
    INVALID:              0,

    // ── 3-card hands (size category: 3) ─────────────────────────────
    TRIPLE:               10,   // Three of a kind  (strongest 3-card)
    THREE_STRAIGHT_FLUSH: 9,    // e.g. 7♠ 8♠ 9♠
    THREE_FLUSH:          8,    // Any 3 same suit
    THREE_STRAIGHT:       7,    // e.g. 5♥ 6♦ 7♣

    // ── 5-card hands (size category: 5) ─────────────────────────────
    STRAIGHT_FLUSH:       58,   // Strongest 5-card
    FOUR_OF_A_KIND:       57,
    FULL_HOUSE:           56,
    FLUSH:                55,
    STRAIGHT:             54    // Weakest 5-card
});

// ============================================================================
// RULESETS
// Each ruleset is a self-contained config object.
// The engine reads these fields and adjusts behavior.
// ============================================================================

var Big2Rulesets = {

    // The active ruleset applied to the current game.
    // Change this reference to switch rule sets.
    active: null, // set after definitions

    /**
     * Hong Kong Standard Rules
     * Classic 4-player Big 2. Most common variant.
     */
    hongkong: {
        id: 'hongkong',
        displayName: 'Hong Kong Standard',
        description: 'Classic 4-player Big 2 with standard suit ranking.',

        // --- Player Config ---
        playerCount: 4,
        startingHandSize: 13,

        // --- Turn Rules ---
        // Who goes first: 'diamond3' (whoever has 3♦) or 'lowest'
        firstTurnRule: 'diamond3',
        // First play must include the starting card
        firstPlayMustIncludeStartCard: true,
        // Can a player pass on the very first turn?
        canPassOnFirstTurn: false,

        // --- Play Validity ---
        // Which hand types are allowed
        allowedHandTypes: [
            // 3-card hands
            Big2HandType.THREE_STRAIGHT,
            Big2HandType.THREE_FLUSH,
            Big2HandType.THREE_STRAIGHT_FLUSH,
            Big2HandType.TRIPLE,
            // 5-card poker hands
            Big2HandType.STRAIGHT,
            Big2HandType.FLUSH,
            Big2HandType.FULL_HOUSE,
            Big2HandType.FOUR_OF_A_KIND,
            Big2HandType.STRAIGHT_FLUSH
        ],
        // Must all players pass before the pile clears? (vs. last player to play wins pile)
        clearPileOnAllPass: true,
        // Can player use a 5-card hand to beat a 3-card hand?
        fiveCardBeatsLower: false,

        // --- Rank & Suit Order ---
        // Suit ranking: 'standard' = D < C < H < S
        suitOrder: 'standard',
        // 2s are highest rank
        twosAreHigh: true,

        // --- Flush Rules ---
        // In 5-card combos: does suit of flush matter for comparison?
        // 'highest_card' = compare by highest card rank then suit
        flushCompareBy: 'highest_card',

        // --- Straight Rules ---
        // Does A-2-3-4-5 count as a straight? (No in most HK rules)
        aceWrapsLow: false,
        // Does Q-K-A-2-3 count? (No in standard)
        aceWrapsHigh: false,

        // --- Scoring / End Game ---
        // Penalty points for cards remaining in hand at game end
        penaltyPerCard: 1,
        // If a player has 10+ cards remaining (never played), double penalty
        doubleIfTenOrMore: true,
        // If a player has 13 cards remaining (never played), triple penalty
        tripleIfThirteen: true,
        // If a player wins with a 4-of-a-kind or straight flush, double opponent penalties
        powerWinDoubles: false,

        // --- AI Config ---
        aiPlayerCount: 3,
        aiDifficulty: 'medium' // 'easy', 'medium', 'hard'
    },

    /**
     * Taiwanese Rules
     * Differences: 2s can be beaten by certain 5-card hands.
     * Suit order same. Ace-wrapped straights allowed.
     */
    taiwanese: {
        id: 'taiwanese',
        displayName: 'Taiwanese Rules',
        description: 'A-2-3 wrap straights allowed. 5-card hands can beat 3-card hands.',

        playerCount: 4,
        startingHandSize: 13,
        firstTurnRule: 'diamond3',
        firstPlayMustIncludeStartCard: true,
        canPassOnFirstTurn: false,

        allowedHandTypes: [
            // 3-card hands
            Big2HandType.THREE_STRAIGHT,
            Big2HandType.THREE_FLUSH,
            Big2HandType.THREE_STRAIGHT_FLUSH,
            Big2HandType.TRIPLE,
            // 5-card poker hands
            Big2HandType.STRAIGHT,
            Big2HandType.FLUSH,
            Big2HandType.FULL_HOUSE,
            Big2HandType.FOUR_OF_A_KIND,
            Big2HandType.STRAIGHT_FLUSH
        ],
        clearPileOnAllPass: true,
        // Key difference: a 5-card hand CAN beat a 3-card hand
        fiveCardBeatsLower: true,

        suitOrder: 'standard',
        twosAreHigh: true,
        flushCompareBy: 'highest_card',

        // Wrapped straights allowed in Taiwanese rules
        aceWrapsLow: true,
        aceWrapsHigh: true,

        penaltyPerCard: 1,
        doubleIfTenOrMore: true,
        tripleIfThirteen: true,
        powerWinDoubles: false,
        aiPlayerCount: 3,
        aiDifficulty: 'medium'
    },

    /**
     * Singapore Rules
     * Differences: Suit order reversed (Spades lowest), scoring differs.
     */
    singapore: {
        id: 'singapore',
        displayName: 'Singapore Rules',
        description: 'Reversed suit order (♠ lowest), stricter scoring.',

        playerCount: 4,
        startingHandSize: 13,
        firstTurnRule: 'diamond3',
        firstPlayMustIncludeStartCard: true,
        canPassOnFirstTurn: false,

        allowedHandTypes: [
            // 3-card hands
            Big2HandType.THREE_STRAIGHT,
            Big2HandType.THREE_FLUSH,
            Big2HandType.THREE_STRAIGHT_FLUSH,
            Big2HandType.TRIPLE,
            // 5-card poker hands
            Big2HandType.STRAIGHT,
            Big2HandType.FLUSH,
            Big2HandType.FULL_HOUSE,
            Big2HandType.FOUR_OF_A_KIND,
            Big2HandType.STRAIGHT_FLUSH
        ],
        clearPileOnAllPass: true,
        fiveCardBeatsLower: false,

        // Reversed: S < H < C < D (Spades lowest, Diamonds highest)
        suitOrder: 'reversed',
        twosAreHigh: true,
        flushCompareBy: 'highest_card',

        aceWrapsLow: false,
        aceWrapsHigh: false,

        penaltyPerCard: 1,
        doubleIfTenOrMore: true,
        tripleIfThirteen: true,
        // Power wins DO double in Singapore scoring
        powerWinDoubles: true,
        aiPlayerCount: 3,
        aiDifficulty: 'medium'
    }
};

// Default to Hong Kong rules
Big2Rulesets.active = Big2Rulesets.hongkong;
