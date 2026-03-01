/**
 * big2.js
 * Big 2 (大老二) Game Engine
 *
 * Self-contained game logic. No dependency on the shared Card Engine.
 * Uses: enums.js, card.js, deck.js, pile.js (shared), ruleset.js (big2)
 *
 * Player types:
 *   'human'  - waits for UI input
 *   'ai'     - engine runs automatically
 *   'remote' - placeholder for future multiplayer (same-wifi or internet)
 *
 * ES5 Compatible - var only, no arrow functions, no class keyword.
 */

// ============================================================================
// HAND EVALUATOR
// Evaluates and compares Big 2 hand types.
// ============================================================================

var Big2Evaluator = (function () {

    function getCardValue(card, ruleset) {
        var rankVal = Big2RankValues[card.rank];
        var suitVal;
        if (ruleset.suitOrder === 'reversed') {
            // S=1, H=2, C=3, D=4
            var reversedSuit = { 'SPADES': 1, 'HEARTS': 2, 'CLUBS': 3, 'DIAMONDS': 4 };
            suitVal = reversedSuit[card.suit];
        } else {
            suitVal = Big2SuitValues[card.suit];
        }
        // Combine: rank is primary, suit is tiebreaker
        // Score: rank * 10 + suit (suit is 1-4)
        return rankVal * 10 + suitVal;
    }

    // Sort cards highest → lowest by Big 2 value
    function sortCards(cards, ruleset) {
        return cards.slice().sort(function (a, b) {
            return getCardValue(b, ruleset) - getCardValue(a, ruleset);
        });
    }

    function groupByRank(cards) {
        var groups = {};
        for (var i = 0; i < cards.length; i++) {
            var r = cards[i].rank;
            if (!groups[r]) groups[r] = [];
            groups[r].push(cards[i]);
        }
        return groups;
    }

    function groupBySuit(cards) {
        var groups = {};
        for (var i = 0; i < cards.length; i++) {
            var s = cards[i].suit;
            if (!groups[s]) groups[s] = [];
            groups[s].push(cards[i]);
        }
        return groups;
    }

    // Check if 5 cards are a straight (consecutive ranks)
    // Returns the sorted rank values array if straight, else null
    function getStraightValues(cards, ruleset) {
        var vals = cards.map(function (c) { return Big2RankValues[c.rank]; });
        vals.sort(function (a, b) { return a - b; });

        // Check normal consecutive
        var isConsecutive = true;
        for (var i = 1; i < vals.length; i++) {
            if (vals[i] !== vals[i - 1] + 1) {
                isConsecutive = false;
                break;
            }
        }
        if (isConsecutive) return vals;

        // Check A-2-3-4-5 wrap (ace wraps low: TWO=13, ACE=12, KING=11 → A=12, 2=13)
        // In Big 2 terms: ranks 3,4,5,6,7 = vals 1,2,3,4,5 up to A=12, 2=13
        // Wrap low: A-2-3-4-5 → treat as 3,4,5,6,7? No - in Big2 ace-low wrap is:
        // 3,4,5,6,7...J,Q,K,A are consecutive. A,2 are not normally consecutive.
        // aceWrapsLow = true means: ...,K,A,2,3 is a valid straight? Unusual.
        // More common wrap: A,2,3,4,5 treated as high straight (A=high, 2=highest)
        // Let's implement: A-2-3-4-5 as wrap where A=12, 2=13, 3=1, 4=2, 5=3
        // That means vals would be [1,2,3,12,13] → check if [1,2,3] + [12,13] consecutive
        if (ruleset.aceWrapsLow) {
            // A(12), 2(13), 3(1), 4(2), 5(3) sorted: [1,2,3,12,13]
            if (vals[0] === 1 && vals[1] === 2 && vals[2] === 3 &&
                vals[3] === 12 && vals[4] === 13) {
                return vals; // valid wrap-low straight
            }
        }
        if (ruleset.aceWrapsHigh) {
            // Q(10),K(11),A(12),2(13),3(1) sorted: [1,10,11,12,13]
            if (vals[0] === 1 && vals[1] === 10 && vals[2] === 11 &&
                vals[3] === 12 && vals[4] === 13) {
                return vals;
            }
        }

        return null;
    }

    /**
     * Evaluate a set of cards as a Big 2 hand.
     * Returns { type, primaryCard, score, size } where:
     *   type        = Big2HandType constant
     *   primaryCard = the "controlling" card (highest-value card in hand)
     *   score       = numeric comparison value (higher = stronger)
     *   size        = number of cards (3 or 5)
     */
    function evaluate(cards, ruleset) {
        if (!cards || cards.length === 0) return { type: Big2HandType.INVALID, primaryCard: null };

        var n = cards.length;
        var sorted = sortCards(cards, ruleset);
        var groups = groupByRank(cards);
        var rankKeys = Object.keys(groups);

        // ── 3-CARD HANDS ─────────────────────────────────────────────────────
        if (n === 3) {
            var suitGroups3 = groupBySuit(cards);
            var isFlush3 = (Object.keys(suitGroups3).length === 1);
            var straightVals3 = getStraightValues(cards, ruleset);
            var isStraight3 = (straightVals3 !== null);
            var isTriple3 = (rankKeys.length === 1);

            // Triple (strongest 3-card)
            if (isTriple3) {
                return {
                    type: Big2HandType.TRIPLE,
                    primaryCard: sorted[0],
                    score: Big2HandType.TRIPLE * 100000 + getCardValue(sorted[0], ruleset),
                    size: 3
                };
            }

            // Three Straight Flush
            if (isStraight3 && isFlush3) {
                return {
                    type: Big2HandType.THREE_STRAIGHT_FLUSH,
                    primaryCard: sorted[0],
                    score: Big2HandType.THREE_STRAIGHT_FLUSH * 100000 + getCardValue(sorted[0], ruleset),
                    size: 3
                };
            }

            // Three Flush
            if (isFlush3) {
                return {
                    type: Big2HandType.THREE_FLUSH,
                    primaryCard: sorted[0],
                    score: Big2HandType.THREE_FLUSH * 100000 + getCardValue(sorted[0], ruleset),
                    size: 3
                };
            }

            // Three Straight
            if (isStraight3) {
                return {
                    type: Big2HandType.THREE_STRAIGHT,
                    primaryCard: sorted[0],
                    score: Big2HandType.THREE_STRAIGHT * 100000 + getCardValue(sorted[0], ruleset),
                    size: 3
                };
            }

            return { type: Big2HandType.INVALID, primaryCard: null };
        }

        // ── 5-CARD HANDS ─────────────────────────────────────────────────────
        if (n === 5) {
            var groupLengths = rankKeys.map(function (k) { return groups[k].length; }).sort(function (a, b) { return b - a; });
            var suitGroups5 = groupBySuit(cards);
            var isFlush5 = (Object.keys(suitGroups5).length === 1);
            var straightVals5 = getStraightValues(cards, ruleset);
            var isStraight5 = (straightVals5 !== null);

            // Straight Flush (strongest 5-card)
            if (isStraight5 && isFlush5) {
                return {
                    type: Big2HandType.STRAIGHT_FLUSH,
                    primaryCard: sorted[0],
                    score: Big2HandType.STRAIGHT_FLUSH * 100000 + getCardValue(sorted[0], ruleset),
                    size: 5
                };
            }

            // Four of a Kind
            if (groupLengths[0] === 4) {
                var fourRank = null;
                for (var k in groups) {
                    if (groups[k].length === 4) { fourRank = k; break; }
                }
                var primaryCard4 = sortCards(groups[fourRank], ruleset)[0];
                return {
                    type: Big2HandType.FOUR_OF_A_KIND,
                    primaryCard: primaryCard4,
                    score: Big2HandType.FOUR_OF_A_KIND * 100000 + getCardValue(primaryCard4, ruleset),
                    size: 5
                };
            }

            // Full House
            if (groupLengths[0] === 3 && groupLengths[1] === 2) {
                var tripleRank = null;
                for (var k in groups) {
                    if (groups[k].length === 3) { tripleRank = k; break; }
                }
                var primaryCardFH = sortCards(groups[tripleRank], ruleset)[0];
                return {
                    type: Big2HandType.FULL_HOUSE,
                    primaryCard: primaryCardFH,
                    score: Big2HandType.FULL_HOUSE * 100000 + getCardValue(primaryCardFH, ruleset),
                    size: 5
                };
            }

            // Flush
            if (isFlush5) {
                return {
                    type: Big2HandType.FLUSH,
                    primaryCard: sorted[0],
                    score: Big2HandType.FLUSH * 100000 + getCardValue(sorted[0], ruleset),
                    size: 5
                };
            }

            // Straight (weakest 5-card)
            if (isStraight5) {
                return {
                    type: Big2HandType.STRAIGHT,
                    primaryCard: sorted[0],
                    score: Big2HandType.STRAIGHT * 100000 + getCardValue(sorted[0], ruleset),
                    size: 5
                };
            }

            return { type: Big2HandType.INVALID, primaryCard: null };
        }

        return { type: Big2HandType.INVALID, primaryCard: null };
    }

    /**
     * 3-card type set (for quick lookup)
     */
    var THREE_CARD_TYPES = {
        10: true,  // TRIPLE
        9:  true,  // THREE_STRAIGHT_FLUSH
        8:  true,  // THREE_FLUSH
        7:  true   // THREE_STRAIGHT
    };

    /**
     * 5-card type set (for quick lookup)
     */
    var FIVE_CARD_TYPES = {
        58: true,  // STRAIGHT_FLUSH
        57: true,  // FOUR_OF_A_KIND
        56: true,  // FULL_HOUSE
        55: true,  // FLUSH
        54: true   // STRAIGHT
    };

    function isThreeCardType(type) { return !!THREE_CARD_TYPES[type]; }
    function isFiveCardType(type)  { return !!FIVE_CARD_TYPES[type]; }

    /**
     * Can `challenger` beat `current`?
     * Rules:
     *   - 3-card hands can only beat other 3-card hands (same size).
     *   - 5-card hands can only beat other 5-card hands (same size).
     *   - Exception: fiveCardBeatsLower (Taiwanese) → 5-card beats a 3-card pile.
     *   - Within same size: higher Big2HandType value wins; ties broken by score.
     */
    function canBeat(challenger, current, ruleset) {
        if (challenger.type === Big2HandType.INVALID) return false;
        if (current === null) return true; // Empty pile — any valid hand leads

        var cIsThree = isThreeCardType(challenger.type);
        var cIsFive  = isFiveCardType(challenger.type);
        var pIsThree = isThreeCardType(current.type);
        var pIsFive  = isFiveCardType(current.type);

        // Cross-size play: 5-card beating a 3-card pile (Taiwanese rule)
        if (cIsFive && pIsThree) {
            return !!ruleset.fiveCardBeatsLower;
        }

        // Cross-size the other way is never valid
        if (cIsThree && pIsFive) return false;

        // Same-size: compare by hand type value first (higher type = stronger category)
        if (challenger.type !== current.type) {
            return challenger.type > current.type;
        }

        // Same hand type: compare scores (primary card value)
        return challenger.score > current.score;
    }

    return {
        evaluate: evaluate,
        canBeat: canBeat,
        getCardValue: getCardValue,
        sortCards: sortCards
    };

})();

// ============================================================================
// AI PLAYER
// Simple AI strategy: plays lowest valid hand.
// ============================================================================

var Big2AI = (function () {

    // Generate all combinations of size k from array
    function combinations(arr, k) {
        var result = [];
        function helper(start, combo) {
            if (combo.length === k) {
                result.push(combo.slice());
                return;
            }
            for (var i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        }
        helper(0, []);
        return result;
    }

    /**
     * Find all valid plays from a hand given a current pile hand.
     * Returns array of {cards, evaluated} objects, sorted weakest first.
     */
    function findValidPlays(handCards, currentPileHand, ruleset, mustIncludeCard) {
        var sizes = currentPileHand ? [currentPileHand.cards.length] : [3, 5];
        var validPlays = [];

        for (var si = 0; si < sizes.length; si++) {
            var sz = sizes[si];
            var combos = combinations(handCards, sz);
            for (var ci = 0; ci < combos.length; ci++) {
                var combo = combos[ci];
                // If mustIncludeCard, skip combos that don't contain it
                if (mustIncludeCard) {
                    var found = false;
                    for (var mi = 0; mi < combo.length; mi++) {
                        if (combo[mi].uuid === mustIncludeCard.uuid) { found = true; break; }
                    }
                    if (!found) continue;
                }
                var evl = Big2Evaluator.evaluate(combo, ruleset);
                if (evl.type === Big2HandType.INVALID) continue;
                var pileEval = currentPileHand ? currentPileHand.evaluated : null;
                if (Big2Evaluator.canBeat(evl, pileEval, ruleset)) {
                    validPlays.push({ cards: combo, evaluated: evl });
                }
            }
        }

        // Sort weakest first (by score ascending)
        validPlays.sort(function (a, b) { return a.evaluated.score - b.evaluated.score; });
        return validPlays;
    }

    /**
     * Choose a play for the AI.
     * Strategy:
     *   easy:   play lowest valid hand
     *   medium: try to hold 2s, play lowest otherwise
     *   hard:   basic counting, tries to empty hand fast
     */
    function choosePlay(handCards, currentPileHand, ruleset, mustIncludeCard, difficulty) {
        var valid = findValidPlays(handCards, currentPileHand, ruleset, mustIncludeCard);
        if (valid.length === 0) return null; // Must pass

        if (difficulty === 'easy') {
            return valid[0];
        }

        if (difficulty === 'medium') {
            // Avoid playing 2s unless forced or it's the only option
            var nonTwoPlays = valid.filter(function (p) {
                for (var i = 0; i < p.cards.length; i++) {
                    if (p.cards[i].rank === 'TWO') return false;
                }
                return true;
            });
            if (nonTwoPlays.length > 0) return nonTwoPlays[0];
            return valid[0];
        }

        if (difficulty === 'hard') {
            // If we can win with a small hand, do it
            // Otherwise play mid-tier hands to conserve 2s
            var smallHands = valid.filter(function (p) { return p.cards.length <= 2; });
            if (smallHands.length > 0) {
                // Check if using this empties our hand
                if (handCards.length <= smallHands[0].cards.length) return smallHands[0];
                return smallHands[0];
            }
            return valid[0];
        }

        return valid[0];
    }

    return {
        choosePlay: choosePlay,
        findValidPlays: findValidPlays
    };

})();

// ============================================================================
// BIG 2 GAME ENGINE
// ============================================================================

/**
 * Big2Game constructor
 *
 * @param {Object} ruleset  - a Big2Rulesets entry
 * @param {Array}  players  - array of { id, name, type: 'human'|'ai'|'remote' }
 */
function Big2Game(ruleset, players) {
    this.ruleset = ruleset;
    this.players = players; // [{ id, name, type, hand: [] }]
    this.state = 'WAITING'; // WAITING | DEALING | PLAYING | GAME_OVER
    this.pile = [];         // Cards currently on the table (last played group)
    this.pileHand = null;   // { cards, evaluated } of last play
    this.currentPlayerIdx = 0;
    this.passCount = 0;     // How many consecutive passes
    this.turnHistory = [];  // For logging
    this.scores = {};       // playerId → penalty points
    this.winner = null;
    this.roundWinner = null; // Player who cleared the pile last (controls next round)

    // Callbacks for UI
    this.onStateChange = null;  // function(gameState)
    this.onPlayMade = null;     // function(playerId, cards, evaluated)
    this.onPassMade = null;     // function(playerId)
    this.onPileCleared = null;  // function(playerId)
    this.onGameOver = null;     // function(winnerId, scores)
    this.onTurnStart = null;    // function(playerId)

    // Init scores
    for (var i = 0; i < players.length; i++) {
        this.scores[players[i].id] = 0;
        players[i].hand = [];
    }
}

Big2Game.prototype._emit = function (event, data) {
    if (this[event] && typeof this[event] === 'function') {
        this[event](data);
    }
};

/**
 * Deal cards from a shuffled deck to all players.
 */
Big2Game.prototype.deal = function () {
    this.state = 'DEALING';

    // Build and shuffle deck
    var cards = [];
    var suits = ['DIAMONDS', 'CLUBS', 'HEARTS', 'SPADES'];
    var ranks = ['THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','JACK','QUEEN','KING','ACE','TWO'];
    var cardId = 0;
    for (var si = 0; si < suits.length; si++) {
        for (var ri = 0; ri < ranks.length; ri++) {
            cards.push({
                suit: suits[si],
                rank: ranks[ri],
                uuid: 'c' + (cardId++),
                id: (ranks[ri].charAt(0)) + suits[si].charAt(0)
            });
        }
    }

    // Fisher-Yates shuffle
    for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
    }

    // Deal to players
    var perPlayer = this.ruleset.startingHandSize;
    for (var pi = 0; pi < this.players.length; pi++) {
        this.players[pi].hand = cards.splice(0, perPlayer);
    }

    // Find who goes first
    this.currentPlayerIdx = this._findFirstPlayer();
    this.pile = [];
    this.pileHand = null;
    this.passCount = 0;
    this.turnHistory = [];
    this.winner = null;
    this.roundWinner = null;
    this.state = 'PLAYING';

    this._emit('onStateChange', this._getSnapshot());
    this._startTurn();
};

/**
 * Determine who plays first based on ruleset.
 */
Big2Game.prototype._findFirstPlayer = function () {
    if (this.ruleset.firstTurnRule === 'diamond3') {
        for (var pi = 0; pi < this.players.length; pi++) {
            var hand = this.players[pi].hand;
            for (var ci = 0; ci < hand.length; ci++) {
                if (hand[ci].rank === 'THREE' && hand[ci].suit === 'DIAMONDS') {
                    return pi;
                }
            }
        }
    }
    // Fallback: player 0
    return 0;
};

/**
 * Get the current player object.
 */
Big2Game.prototype.currentPlayer = function () {
    return this.players[this.currentPlayerIdx];
};

/**
 * Called at the start of each turn.
 */
Big2Game.prototype._startTurn = function () {
    this._emit('onTurnStart', this.currentPlayer().id);

    // If AI, auto-play after a short delay
    var self = this;
    var player = this.currentPlayer();
    if (player.type === 'ai') {
        setTimeout(function () {
            self._aiTakeTurn();
        }, 900);
    }
};

/**
 * AI takes its turn.
 */
Big2Game.prototype._aiTakeTurn = function () {
    var player = this.currentPlayer();
    var mustInclude = this._getMustIncludeCard(player);

    var choice = Big2AI.choosePlay(
        player.hand,
        this.pileHand,
        this.ruleset,
        mustInclude,
        this.ruleset.aiDifficulty
    );

    if (choice) {
        this.playCards(player.id, choice.cards);
    } else {
        this.pass(player.id);
    }
};

/**
 * Returns the card that MUST be included in the first play (e.g., 3♦), or null.
 */
Big2Game.prototype._getMustIncludeCard = function (player) {
    if (!this.ruleset.firstPlayMustIncludeStartCard) return null;
    if (this.turnHistory.length > 0) return null; // Only on very first play of game
    if (this.ruleset.firstTurnRule !== 'diamond3') return null;

    var hand = player.hand;
    for (var ci = 0; ci < hand.length; ci++) {
        if (hand[ci].rank === 'THREE' && hand[ci].suit === 'DIAMONDS') {
            return hand[ci];
        }
    }
    return null;
};

/**
 * Human (or external) plays a set of cards.
 * @param {string} playerId
 * @param {Array}  cards - card objects from the player's hand
 * Returns { ok: bool, error: string }
 */
Big2Game.prototype.playCards = function (playerId, cards) {
    if (this.state !== 'PLAYING') return { ok: false, error: 'Game not in play state.' };
    if (this.currentPlayer().id !== playerId) return { ok: false, error: 'Not your turn.' };

    var player = this._getPlayer(playerId);
    if (!player) return { ok: false, error: 'Unknown player.' };

    // Check all cards are in hand
    for (var ci = 0; ci < cards.length; ci++) {
        var found = false;
        for (var hi = 0; hi < player.hand.length; hi++) {
            if (player.hand[hi].uuid === cards[ci].uuid) { found = true; break; }
        }
        if (!found) return { ok: false, error: 'Card not in hand: ' + cards[ci].id };
    }

    // Evaluate
    var evaluated = Big2Evaluator.evaluate(cards, this.ruleset);
    if (evaluated.type === Big2HandType.INVALID) {
        return { ok: false, error: 'Invalid hand combination.' };
    }

    // Check against ruleset allowed types
    if (this.ruleset.allowedHandTypes.indexOf(evaluated.type) === -1) {
        return { ok: false, error: 'Hand type not allowed by ruleset.' };
    }

    // Must include start card?
    var mustInclude = this._getMustIncludeCard(player);
    if (mustInclude) {
        var hasMust = false;
        for (var ci = 0; ci < cards.length; ci++) {
            if (cards[ci].uuid === mustInclude.uuid) { hasMust = true; break; }
        }
        if (!hasMust) return { ok: false, error: 'First play must include 3♦.' };
    }

    // Can it beat the pile?
    if (!Big2Evaluator.canBeat(evaluated, this.pileHand ? this.pileHand.evaluated : null, this.ruleset)) {
        return { ok: false, error: 'Does not beat the current pile.' };
    }

    // Remove cards from hand
    for (var ci = 0; ci < cards.length; ci++) {
        for (var hi = 0; hi < player.hand.length; hi++) {
            if (player.hand[hi].uuid === cards[ci].uuid) {
                player.hand.splice(hi, 1);
                break;
            }
        }
    }

    // Update pile
    this.pile = cards;
    this.pileHand = { cards: cards, evaluated: evaluated };
    this.passCount = 0;
    this.roundWinner = playerId;

    this.turnHistory.push({ playerId: playerId, cards: cards, evaluated: evaluated });
    this._emit('onPlayMade', { playerId: playerId, cards: cards, evaluated: evaluated });

    // Check win condition
    if (player.hand.length === 0) {
        this._handleWin(playerId);
        return { ok: true };
    }

    this._nextTurn();
    return { ok: true };
};

/**
 * Pass the current turn.
 */
Big2Game.prototype.pass = function (playerId) {
    if (this.state !== 'PLAYING') return { ok: false, error: 'Game not in play state.' };
    if (this.currentPlayer().id !== playerId) return { ok: false, error: 'Not your turn.' };

    // Can't pass on first turn (if ruleset says so)
    if (!this.ruleset.canPassOnFirstTurn && this.turnHistory.length === 0) {
        return { ok: false, error: 'Cannot pass on the very first play.' };
    }

    // Can't pass if pile is empty (you must play)
    if (this.pile.length === 0) {
        return { ok: false, error: 'Cannot pass when you control the pile.' };
    }

    this.passCount++;
    this.turnHistory.push({ playerId: playerId, cards: null, pass: true });
    this._emit('onPassMade', { playerId: playerId });

    // Check if all others passed (round over)
    var activePlayers = this._getActivePlayers().length;
    if (this.passCount >= activePlayers - 1) {
        // The round winner clears the pile and leads next
        this._clearPile();
    } else {
        this._nextTurn();
    }

    return { ok: true };
};

/**
 * Clear the pile and give control to the last player who played.
 */
Big2Game.prototype._clearPile = function () {
    this.pile = [];
    this.pileHand = null;
    this.passCount = 0;
    this._emit('onPileCleared', { winnerId: this.roundWinner });

    // Find roundWinner index
    for (var pi = 0; pi < this.players.length; pi++) {
        if (this.players[pi].id === this.roundWinner) {
            this.currentPlayerIdx = pi;
            break;
        }
    }
    this._startTurn();
};

/**
 * Advance to the next player, skipping players who are out.
 */
Big2Game.prototype._nextTurn = function () {
    var count = this.players.length;
    var next = (this.currentPlayerIdx + 1) % count;
    var attempts = 0;
    while (this.players[next].hand.length === 0 && attempts < count) {
        next = (next + 1) % count;
        attempts++;
    }
    this.currentPlayerIdx = next;
    this._startTurn();
};

/**
 * Handle a player winning (emptied their hand).
 */
Big2Game.prototype._handleWin = function (playerId) {
    this.winner = playerId;
    this.state = 'GAME_OVER';

    // Calculate penalties
    var rs = this.ruleset;
    for (var pi = 0; pi < this.players.length; pi++) {
        var p = this.players[pi];
        if (p.id === playerId) { this.scores[p.id] = 0; continue; }
        var cardCount = p.hand.length;
        var penalty = cardCount * rs.penaltyPerCard;
        if (rs.tripleIfThirteen && cardCount === 13) penalty *= 3;
        else if (rs.doubleIfTenOrMore && cardCount >= 10) penalty *= 2;
        this.scores[p.id] = penalty;
    }

    this._emit('onGameOver', { winnerId: playerId, scores: this.scores });
};

/**
 * Returns players who still have cards.
 */
Big2Game.prototype._getActivePlayers = function () {
    return this.players.filter(function (p) { return p.hand.length > 0; });
};

Big2Game.prototype._getPlayer = function (id) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id === id) return this.players[i];
    }
    return null;
};

/**
 * Get a serializable snapshot of game state (for UI rendering).
 */
Big2Game.prototype._getSnapshot = function () {
    return {
        state: this.state,
        currentPlayerId: this.currentPlayer() ? this.currentPlayer().id : null,
        players: this.players.map(function (p) {
            return { id: p.id, name: p.name, type: p.type, cardCount: p.hand.length };
        }),
        pile: this.pile,
        pileHand: this.pileHand,
        passCount: this.passCount,
        winner: this.winner,
        scores: this.scores
    };
};

/**
 * Validate a proposed play without committing it.
 * Useful for UI highlighting.
 */
Big2Game.prototype.validatePlay = function (cards) {
    if (!cards || cards.length === 0) return { valid: false, type: Big2HandType.INVALID };
    var evaluated = Big2Evaluator.evaluate(cards, this.ruleset);
    if (evaluated.type === Big2HandType.INVALID) return { valid: false, type: Big2HandType.INVALID };
    var beats = Big2Evaluator.canBeat(evaluated, this.pileHand ? this.pileHand.evaluated : null, this.ruleset);
    return { valid: beats, type: evaluated.type, evaluated: evaluated };
};
