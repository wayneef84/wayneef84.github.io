# Game Engine Architecture Guide

Comprehensive documentation of all game engine patterns used in the F.O.N.G. project.

**Date:** 2026-02-15
**Status:** Three independent engine families, intentional separation of concerns

---

## Quick Reference

| Engine | Type | File | LOC | Games | Architecture |
|--------|------|------|-----|-------|--------------|
| **Card Engine** | State Machine | `/games/cards/shared/engine.js` | 611 | Blackjack, War, Euchre, Poker | ES5 Prototype + Ruleset Pattern |
| **Board Engine** | Canvas Orchestrator | `/games/board/js/engine.js` | 92 | Xiangqi (Chess), future: Go, Checkers | ES6 Class |
| **Quiz Engine** | Interactive Questionnaire | `/games/j/js/engine.js` | 384 | Letter Quiz (J), Spelling, Trivia | ES6 Class |

---

## 1. Card Engine (Blackjack, War, Euchre, Poker)

### Philosophy
A **game-agnostic state machine** that handles turn sequencing, card dealing, and win conditions. All game-specific logic is delegated to interchangeable **Ruleset** modules.

### Architecture

```
Player (hand, balance, type)
    ↓
    Deck (template, shuffling)
    ↓
    Pile (universal card container)
    ↓
Engine (state machine orchestrator)
    ↓
Ruleset (game-specific rules)
    ↓
Resolution (payout calculation)
```

### State Machine Flow

```
IDLE
  ↓
BETTING (optional, if game uses currency)
  ↓
DEALING (Ruleset defines deal sequence)
  ↓
TERMINAL CHECK GATE ← Check after EVERY action/card
  ├─ If immediate: Skip to RESOLUTION
  └─ If false: Continue
  ↓
PLAYER_TURN (getNextActor() determines who plays)
  ↓
OPPONENT_TURN (Dealer, AI, etc)
  ↓
RESOLUTION (Evaluate hands, determine winner)
  ↓
PAYOUT (Award winnings or collect bets)
  ↓
GAME_OVER
  ↓
IDLE (Reset for next round)
```

### Key Components

**File Structure:**
```
/games/cards/shared/
├── engine.js          (611 LOC) - State machine core
├── ruleset.js         (template)
├── player.js          (base player class with balance tracking)
├── pile.js            (261 LOC) - Card container logic
├── deck.js            (85 LOC) - Deck templates
├── card.js            (77 LOC) - Immutable card structure
├── enums.js           (95 LOC) - Suit, Rank constants
├── card-utils.js      (110 LOC) - Helper functions
├── card-assets.js     (238 LOC) - Procedural card rendering
├── poker-evaluator.js (281 LOC) - Hand ranking for poker
├── game-config.js     (65 LOC) - Game configuration
└── deck-editor.js     (279 LOC) - Template editor

/games/cards/blackjack/
├── ruleset.js         (491 LOC) - Blackjack-specific rules
└── index.html

/games/cards/war/
├── ruleset.js         (336 LOC) - War-specific rules
└── index.html

/games/cards/euchre/
├── ruleset.js         (456 LOC) - Euchre-specific rules
└── index.html

/games/cards/poker/
├── ruleset.js         (base poker rules)
├── 5card/ruleset.js   (5-card draw variant)
└── index.html
```

### The Ruleset Interface

Every game ruleset must implement this interface:

```javascript
var MyGameRuleset = {
    // Configuration
    gameId: 'mygame',
    displayName: 'My Game',
    minPlayers: 2,
    maxPlayers: 4,
    usesCurrency: true,
    hasDealer: true,
    resetPilesEachRound: true,

    // Lifecycle Methods

    /**
     * Called once at game start. Define all piles (dealer pile, player hands, etc)
     * @param {Array} players - Array of Player objects
     * @returns {Object} { hand: Pile, discard: Pile, ... }
     */
    buildPiles: function(players) {
        return {
            hand: new Pile('hand'),
            discard: new Pile('discard')
        };
    },

    /**
     * Define the initial deal sequence
     * @returns {Array} [
     *   { target: 'player', count: 2, faceUp: true },
     *   { target: 'dealer', count: 1, faceUp: false },
     *   ...
     * ]
     */
    getDealSequence: function() {
        return [
            { target: 'player', count: 2, faceUp: true },
            { target: 'dealer', count: 2, faceUp: true }
        ];
    },

    /**
     * Determine next actor to take a turn
     * Return null to end the round
     * @param {Object} gameState - Current game state
     * @returns {string|null} Actor ID or null if round over
     */
    getNextActor: function(gameState) {
        // Check if human player busted
        if (this.evaluateHand(gameState.players[0].hand.contents).best > 21) {
            return null; // Skip dealer, go to resolution
        }
        return 'dealer';
    },

    /**
     * List available actions for current actor
     * @param {Object} gameState
     * @param {string} actorId
     * @returns {Array} ['hit', 'stand', 'double']
     */
    getAvailableActions: function(gameState, actorId) {
        return ['hit', 'stand'];
    },

    /**
     * Execute action and return result
     * @param {Object} gameState
     * @param {string} actorId
     * @param {string} action
     * @param {*} params - Action parameters
     * @returns {Object} { nextState: 'PLAYER_TURN', result: 'card dealt', ... }
     */
    resolveAction: function(gameState, actorId, action, params) {
        if (action === 'hit') {
            // Deal card
            return { nextState: 'PLAYER_TURN', result: 'card dealt' };
        }
        if (action === 'stand') {
            return { nextState: 'OPPONENT_TURN', result: 'player stands' };
        }
    },

    /**
     * Check if game is in a terminal state (someone won/lost)
     * Called after EVERY action
     * @param {Object} gameState
     * @returns {Object|null} { immediate: true/false, winner: 'player'|'dealer', reason: '...' }
     */
    checkWinCondition: function(gameState) {
        var player = gameState.players[0];
        var playerValue = this.evaluateHand(player.hand.contents);
        if (playerValue.best > 21) {
            return { immediate: true, winner: 'dealer', reason: 'player bust' };
        }
        return null; // Game continues
    },

    /**
     * Final resolution: determine winner, calculate payouts
     * @param {Object} gameState
     * @returns {Object} Payout breakdown
     */
    resolveRound: function(gameState) {
        // Evaluate dealer hand
        // Compare to players
        // Determine winners/losers
    },

    /**
     * Calculate winner payouts
     * @param {Object} gameState
     * @returns {Object} { player1: +100, player2: -50, ... }
     */
    calculatePayouts: function(gameState) {
        // Return payout amounts per player
    },

    /**
     * AI decision for dealer/opponent
     * @param {Object} gameState
     * @returns {string} Action to take ('hit', 'stand', etc)
     */
    getAiAction: function(gameState) {
        // Simple dealer strategy
    },

    /**
     * Helper: Evaluate hand value
     * @param {Array} cards
     * @returns {Object} { best: 21, worst: 11, ... }
     */
    evaluateHand: function(cards) {
        // Return hand evaluation
    }
};
```

### Example: Blackjack Ruleset

```javascript
// /games/cards/blackjack/ruleset.js

var BlackjackRuleset = {
    gameId: 'blackjack',
    displayName: 'Blackjack',
    minPlayers: 1,
    maxPlayers: 1,
    usesCurrency: true,
    hasDealer: true,
    resetPilesEachRound: true,

    buildPiles: function(players) {
        return {
            hand: new Pile('hand'),
            dealerHand: new Pile('dealerHand')
        };
    },

    getDealSequence: function() {
        return [
            { target: 'player', count: 2, faceUp: true },
            { target: 'dealer', count: 2, faceUp: true }
        ];
    },

    getNextActor: function(gameState) {
        var player = gameState.players[0];
        var value = this.evaluateHand(player.hand.contents);
        if (value.best > 21) {
            return null; // Player busted - no dealer turn
        }
        if (gameState.currentActor === 'player') {
            return 'dealer';
        }
        return null; // Game over
    },

    checkWinCondition: function(gameState) {
        var player = gameState.players[0];
        var playerValue = this.evaluateHand(player.hand.contents);

        // Check player bust
        if (playerValue.best > 21) {
            return { immediate: true, winner: 'dealer', reason: 'player bust' };
        }

        // Check blackjack (after dealing only)
        if (player.hand.contents.length === 2 && playerValue.best === 21) {
            return { immediate: false, winner: 'player', reason: 'blackjack' };
        }

        return null;
    },

    getAvailableActions: function(gameState, actorId) {
        if (actorId === 'player') {
            var hand = gameState.players[0].hand;
            var actions = ['hit', 'stand'];

            // Double down only on first move (2 cards)
            if (hand.contents.length === 2) {
                actions.push('double');
            }

            return actions;
        }
        return ['hit', 'stand']; // Dealer actions
    },

    resolveAction: function(gameState, actorId, action, params) {
        if (action === 'hit') {
            // Deal card from shoe
            // Will trigger checkWinCondition
            return { nextState: gameState.currentState, result: 'card dealt' };
        }
        if (action === 'stand') {
            return { nextState: 'OPPONENT_TURN', result: 'player stands' };
        }
        if (action === 'double') {
            // Double bet, deal one card, force stand
            return { nextState: 'OPPONENT_TURN', result: 'double down' };
        }
    },

    evaluateHand: function(cards) {
        // Return { best: 21, worst: 11 }
    }
};
```

### Key Design Decisions

1. **Ruleset Delegation:** Engine knows NOTHING about specific game rules. All logic in ruleset.
2. **Terminal Check Gate:** After every action, check for win condition. Don't wait until "end of round".
3. **Bust Suppression:** `getNextActor()` returns `null` to skip dealer if player busted.
4. **Immutable Cards:** Each card is UUID-based, never modified, only copied.
5. **Event Queue:** Engine can emit events (deal, turn, win) for UI to listen to.

### Common Patterns

**Dealer Turn Skip (Bust Suppression):**
```javascript
getNextActor: function(gameState) {
    var player = gameState.players[0];
    var value = this.evaluateHand(player.hand.contents);

    if (value.best > 21) {
        return null; // ← CRITICAL: Skip dealer if player busted
    }

    return 'dealer';
}
```

**Terminal Check Gate:**
```javascript
checkWinCondition: function(gameState) {
    // Called after EVERY card dealt, EVERY action

    // Check immediate loss conditions
    if (playerBusted) {
        return { immediate: true, winner: 'dealer' };
    }

    // Check immediate win conditions
    if (playerBlackjack) {
        return { immediate: false, winner: 'player' };
    }

    // Game continues
    return null;
}
```

---

## 2. Board Engine (Xiangqi, Future: Go, Checkers)

### Philosophy
Orchestrates **turn-based board games** with grid-based movement. Handles piece placement, move validation, capture logic, and AI opponents.

### Architecture

```
Board (8×8 grid or custom)
    ↓
Pieces (placement, type, constraints)
    ↓
MoveValidator (legal move checking)
    ↓
Engine (turn orchestration)
    ↓
Game Rules (check, checkmate, stalemate)
```

### Key Features

- **Canvas Rendering:** 2D animations, smooth piece movement
- **Move Validation:** Ensures legal moves per game rules
- **AI Opponent:** Minimax or simple heuristic strategies
- **History Tracking:** Move notation, undo capability
- **State Persistence:** Save/load game position

### Example: Xiangqi (Chinese Chess)

**File:** `/games/board/js/engine.js` (92 LOC)

```javascript
var XiangqiEngine = (function() {
    function Engine() {
        this.board = new Board(10, 9); // 10 rows, 9 columns
        this.pieces = [];
        this.moveHistory = [];
    }

    Engine.prototype.start = function() {
        this.initializePieces();
        this.currentPlayer = 'red';
    };

    Engine.prototype.makeMove = function(from, to) {
        var piece = this.board.getPieceAt(from);

        // Validate move
        if (!this.isLegalMove(piece, from, to)) {
            return { valid: false, reason: 'illegal move' };
        }

        // Execute capture if target occupied
        var target = this.board.getPieceAt(to);
        if (target && target.color === piece.color) {
            return { valid: false, reason: 'cannot capture own piece' };
        }

        // Move piece
        this.board.clearSquare(from);
        this.board.setPieceAt(to, piece);
        this.moveHistory.push({ from: from, to: to, captured: target });

        // Switch player
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';

        // Check for endgame
        var endgame = this.checkEndgame();
        return { valid: true, endgame: endgame };
    };

    Engine.prototype.checkEndgame = function() {
        // Check if general is in check
        if (this.isInCheck(this.currentPlayer)) {
            // Check if in checkmate
            if (!this.hasLegalMoves(this.currentPlayer)) {
                return { type: 'CHECKMATE', winner: this.currentPlayer === 'red' ? 'black' : 'red' };
            }
            return { type: 'CHECK', inCheck: true };
        }

        // Check for stalemate
        if (!this.hasLegalMoves(this.currentPlayer)) {
            return { type: 'STALEMATE' };
        }

        return null; // Game continues
    };

    return Engine;
})();
```

---

## 3. Quiz Engine (Letter Quiz, Spelling)

### Philosophy
Manages **interactive question/answer flow**. Handles question sequencing, answer validation, scoring, and progress tracking.

### Architecture

```
Quiz Configuration (questions, scoring rules)
    ↓
Question Sequencer (randomization, difficulty)
    ↓
Engine (question/answer flow)
    ↓
Validator (answer correctness)
    ↓
Scorer (points, streak, badges)
```

### Key Features

- **Question Banks:** Load from JSON or generate dynamically
- **Shuffle/Randomization:** Random or fixed order
- **Timed Questions:** Optional timer per question
- **Scoring System:** Points, streaks, badges, leaderboards
- **Progress Tracking:** Completion percentage, weak areas
- **Audio Support:** Text-to-speech for questions (accessibility)

### Example: Letter Tracing Quiz (J)

**File:** `/games/j/js/engine.js` (384 LOC)

```javascript
var QuizEngine = (function() {
    function Engine(config) {
        this.questions = config.questions || [];
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.totalAnswered = 0;
        this.history = [];
    }

    Engine.prototype.start = function() {
        this.shuffleQuestions();
        this.loadQuestion(0);
    };

    Engine.prototype.loadQuestion = function(index) {
        if (index >= this.questions.length) {
            return { finished: true, score: this.score, total: this.totalAnswered };
        }

        this.currentIndex = index;
        var question = this.questions[index];
        return {
            question: question.text,
            options: question.options,
            hint: question.hint,
            type: question.type // 'multiple-choice', 'text-input', 'drag-drop'
        };
    };

    Engine.prototype.submitAnswer = function(answer) {
        var question = this.questions[this.currentIndex];
        var correct = this.validateAnswer(answer, question.correct);

        this.totalAnswered++;
        this.history.push({
            question: question.text,
            userAnswer: answer,
            correct: correct,
            points: correct ? question.points : 0
        });

        if (correct) {
            this.score += question.points;
            this.streak++;
        } else {
            this.streak = 0;
        }

        return {
            correct: correct,
            explanation: question.explanation,
            nextQuestion: this.loadQuestion(this.currentIndex + 1)
        };
    };

    return Engine;
})();
```

---

## Comparison Table

| Aspect | Card Engine | Board Engine | Quiz Engine |
|--------|-------------|--------------|-------------|
| **Architecture** | State Machine + Ruleset | Turn-based Grid | Question Sequencer |
| **Compatibility** | ES5 | ES6 | ES6 |
| **Base Pattern** | Prototype | Class | Class |
| **Games** | Blackjack, War, Euchre, Poker | Xiangqi, Chess, Go | Letter Quiz, Spelling |
| **AI** | Ruleset-specific | Minimax/Heuristic | Difficulty presets |
| **Extensibility** | Add new Ruleset | Add new GameMode | Add Question Bank |
| **LOC** | 611 core + helpers | 92 core | 384 core |

---

## When to Use Each Engine

### Use Card Engine When:
- ✅ Turn-based card game (Blackjack, Poker, Solitaire)
- ✅ Game has fixed rules that don't vary per game instance
- ✅ You need a state machine with clear transitions
- ✅ You need dealer/AI opponent logic

### Use Board Engine When:
- ✅ Grid-based placement (Chess, Go, Checkers)
- ✅ Piece movement with complex rules
- ✅ Need canvas rendering and animations
- ✅ Turn-based with spatial awareness

### Use Quiz Engine When:
- ✅ Question/answer format
- ✅ Scoring and progress tracking
- ✅ Educational or trivia game
- ✅ Randomization and sequencing important

---

## Creating a New Game

### Option 1: Add Card Game Ruleset
If your game is card-based (Solitaire, Big 2, Euchre variant):

```
1. Create /games/cards/[gamename]/ruleset.js
2. Implement the Ruleset interface
3. Create index.html
4. Include /games/cards/shared/engine.js
5. Instantiate with new Engine(ruleset)
```

### Option 2: Create Board Game
If your game is board-based (Checkers, Go):

```
1. Create /games/board/[gamename]/engine.js
2. Extend or adapt the Board Engine
3. Define piece movement rules
4. Implement AI strategy
5. Add canvas rendering
```

### Option 3: Create Quiz
If your game is question-based:

```
1. Create /games/quiz/[gamename]/engine.js
2. Load question bank from JSON or config
3. Implement validation logic
4. Add scoring system
5. Integrate audio (optional)
```

---

## Performance Considerations

| Engine | Bottleneck | Optimization |
|--------|-----------|--------------|
| Card | Card dealing animation | Batch DOM updates, use requestAnimationFrame |
| Board | Move validation on each click | Cache valid moves, use bitboards for chess |
| Quiz | Question loading | Pre-cache audio, lazy-load images |

---

## Future Directions

### Multi-Hand Architecture (Card Engine)
```javascript
// Support split pairs in Blackjack, multi-hand poker
Player.hands = [
    { id: 'hand1', pile: Pile, bet: 25 },
    { id: 'hand2', pile: Pile, bet: 25 } // After split
];
```

### Shared Base Engine (All)
```javascript
// Consider future GameEngine base class for:
// - Event system
// - Undo/redo
// - Replay capability
// - Network multiplayer
```

### Multiplayer Support
```javascript
// Card Engine: Multiple players at one table
// Board Engine: Network games (Chess, Go)
// Quiz Engine: Competitive leaderboards
```

---

## References

- **Card Engine Details:** See `/games/cards/shared/engine.js`
- **Ruleset Examples:** `/games/cards/blackjack/ruleset.js`
- **Player Class:** `/games/cards/shared/player.js`
- **Deck System:** `/games/cards/shared/deck.js`
- **Storage:** See `games/lib/StorageManager.md`

---

**Document Version:** 1.0
**Last Updated:** 2026-02-15
**Maintainer:** Claude (C)
