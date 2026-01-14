/**
 * engine.js
 * State Machine and Game Engine for the Card Engine.
 * * The Engine orchestrates gameplay:
 * - Manages game state and valid transitions
 * - Delegates game-specific logic to Rulesets
 * - Emits events for frontend animation
 * - Handles turn order and player actions
 * * The Engine is GAME-AGNOSTIC. All game-specific logic lives in Rulesets.
 */

// ============================================================================
// GAME STATES
// ============================================================================

const GameState = Object.freeze({
    IDLE: 'IDLE',                       // No game in progress
    BETTING: 'BETTING',                 // Accepting wagers
    DEALING: 'DEALING',                 // Cards being distributed
    PLAYER_TURN: 'PLAYER_TURN',         // Active player choosing action
    SIMULTANEOUS_ACTION: 'SIMULTANEOUS_ACTION', // Multiple actors at once
    OPPONENT_TURN: 'OPPONENT_TURN',     // AI/opponent acting
    RESOLUTION: 'RESOLUTION',           // Determining winner
    PAYOUT: 'PAYOUT',                   // Distributing winnings
    GAME_OVER: 'GAME_OVER'              // Round complete
});

// ============================================================================
// ACTION TYPES (Engine-executed actions from Ruleset)
// ============================================================================

const ActionType = Object.freeze({
    DEAL: 'DEAL',           // Move cards from pile to player/pile
    MOVE: 'MOVE',           // Move specific cards between locations
    REVEAL: 'REVEAL',       // Flip cards face-up
    SHUFFLE: 'SHUFFLE',     // Randomize a pile
    SCORE: 'SCORE',         // Update player's score
    PAYOUT: 'PAYOUT',       // Credit currency
    DEDUCT: 'DEDUCT',       // Deduct currency
    MESSAGE: 'MESSAGE',     // Display message to UI
    STATE_CHANGE: 'STATE_CHANGE' // Internal state transition
});

// ============================================================================
// VALID STATE TRANSITIONS
// ============================================================================

const ValidTransitions = Object.freeze({
    [GameState.IDLE]: [GameState.BETTING, GameState.DEALING],
    [GameState.BETTING]: [GameState.DEALING, GameState.IDLE],
    [GameState.DEALING]: [GameState.PLAYER_TURN, GameState.OPPONENT_TURN, GameState.SIMULTANEOUS_ACTION],
    [GameState.PLAYER_TURN]: [GameState.PLAYER_TURN, GameState.OPPONENT_TURN, GameState.RESOLUTION, GameState.DEALING],
    [GameState.SIMULTANEOUS_ACTION]: [GameState.RESOLUTION, GameState.SIMULTANEOUS_ACTION],
    [GameState.OPPONENT_TURN]: [GameState.OPPONENT_TURN, GameState.PLAYER_TURN, GameState.RESOLUTION],
    [GameState.RESOLUTION]: [GameState.PAYOUT, GameState.GAME_OVER],
    [GameState.PAYOUT]: [GameState.GAME_OVER],
    [GameState.GAME_OVER]: [GameState.IDLE, GameState.BETTING, GameState.DEALING]
});

// ============================================================================
// GAME ENGINE CLASS
// ============================================================================

class GameEngine {
    /**
     * @param {Object} ruleset - The game-specific ruleset
     * @param {Object} [config] - Engine configuration
     * @param {boolean} [config.debug=false] - Enable debug logging
     */
    constructor(ruleset, config = {}) {
        this.ruleset = ruleset;
        this.debug = config.debug || false;
        
        // Game state
        this.state = GameState.IDLE;
        this.players = [];
        this.piles = {};
        this.activeActorId = null;
        this.turnHistory = [];
        this.roundNumber = 0;
        this.pot = 0;
        
        // Event system
        this.eventQueue = [];
        this.eventListeners = {};
        
        // Animation acknowledgment
        this.awaitingAcknowledgment = false;
        this.pendingCallback = null;
        
        this._log(`Engine created for ${ruleset.gameId}`);
    }
    
    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    /**
     * Initialize a new game with players.
     * @param {Object[]} playerConfigs - Array of player configurations
     */
    init(playerConfigs) {
        this._log('Initializing game...');
        
        // Validate player count
        if (playerConfigs.length < this.ruleset.minPlayers) {
            throw new Error(`Minimum ${this.ruleset.minPlayers} players required`);
        }
        if (playerConfigs.length > this.ruleset.maxPlayers) {
            throw new Error(`Maximum ${this.ruleset.maxPlayers} players allowed`);
        }
        
        // Create players
        this.players = playerConfigs.map((config, index) => {
            const PlayerClass = this.ruleset.usesCurrency ? PlayerWithCurrency : Player;
            return new PlayerClass({
                ...config,
                seat: config.seat ?? index
            });
        });
        
        // Add dealer if ruleset requires one
        if (this.ruleset.hasDealer) {
            this.dealer = new Dealer();
        }
        
        // Build game piles from ruleset
        this.piles = this.ruleset.buildPiles();
        
        // Reset state
        this.state = GameState.IDLE;
        this.turnHistory = [];
        this.roundNumber = 0;
        this.pot = 0;
        this.activeActorId = null;
        
        this._emit({
            type: 'GAME_INIT',
            players: this.players.map(p => p.toJSON()),
            piles: Object.keys(this.piles)
        });
        
        this._log('Game initialized', { players: this.players.length });
    }
    
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    
    /**
     * Transition to a new state.
     * @param {string} newState - The target state
     * @param {boolean} [force=false] - Force transition even if invalid
     */
    transitionTo(newState, force = false) {
        const validNext = ValidTransitions[this.state];
        
        if (!force && !validNext.includes(newState)) {
            this._log(`Invalid transition: ${this.state} → ${newState}`, null, 'warn');
            return false;
        }
        
        const oldState = this.state;
        this.state = newState;
        
        this._emit({
            type: ActionType.STATE_CHANGE,
            from: oldState,
            to: newState
        });
        
        this._log(`State: ${oldState} → ${newState}`);
        
        // Trigger state entry logic
        this._onStateEnter(newState);
        
        return true;
    }
    
    /**
     * Handle logic when entering a new state.
     * @param {string} state
     */
    _onStateEnter(state) {
        switch (state) {
            case GameState.DEALING:
                this._handleDealing();
                break;
            case GameState.PLAYER_TURN:
            case GameState.OPPONENT_TURN:
                this._handleTurnStart();
                break;
            case GameState.RESOLUTION:
                this._handleResolution();
                break;
            case GameState.PAYOUT:
                this._handlePayout();
                break;
            case GameState.GAME_OVER:
                this._handleGameOver();
                break;
        }
    }
    
    // ========================================================================
    // GAME FLOW
    // ========================================================================
    
    /**
     * Start a new round.
     */
    startRound() {
        if (this.state !== GameState.IDLE && this.state !== GameState.GAME_OVER) {
            this._log('Cannot start round in current state', { state: this.state }, 'warn');
            return;
        }
        
        this.roundNumber++;
        this._log(`Starting round ${this.roundNumber}`);
        
        // Clear hands
        this.players.forEach(p => p.clearHand());
        if (this.dealer) this.dealer.clearHand();
        
        // Reset pot
        this.pot = 0;
        
        // Clear turn history
        this.turnHistory = [];
        
        // Reset/rebuild piles if needed
        if (this.ruleset.resetPilesEachRound) {
            this.piles = this.ruleset.buildPiles();
        }
        
        this._emit({
            type: 'ROUND_START',
            roundNumber: this.roundNumber
        });
        
        // Determine first state (betting or dealing)
        const firstState = this.ruleset.usesCurrency ? GameState.BETTING : GameState.DEALING;
        this.transitionTo(firstState);
    }
    
    /**
     * Handle betting phase.
     * @param {string} playerId
     * @param {number} amount
     */
    placeBet(playerId, amount) {
        if (this.state !== GameState.BETTING) {
            this._log('Cannot bet outside betting phase', null, 'warn');
            return false;
        }
        
        const player = this._getPlayer(playerId);
        if (!player) return false;
        
        if (!player.placeBet(amount)) {
            this._emit({ type: 'BET_FAILED', playerId, reason: 'Insufficient funds' });
            return false;
        }
        
        this.pot += amount;
        
        this._emit({
            type: 'BET_PLACED',
            playerId,
            amount,
            pot: this.pot
        });
        
        this.turnHistory.push({ action: 'bet', playerId, amount });
        
        return true;
    }
    
    /**
     * Confirm all bets and proceed to dealing.
     */
    confirmBets() {
        if (this.state !== GameState.BETTING) return;
        this.transitionTo(GameState.DEALING);
    }
    
    /**
     * Handle the dealing phase.
     * TERMINAL CHECK GATE: After dealing, check if round should end immediately (e.g., dealer blackjack).
     */
    _handleDealing() {
        const dealSequence = this.ruleset.getDealSequence(this.getGameState());

        dealSequence.forEach(deal => {
            this._executeDeal(deal);
        });

        // TERMINAL CHECK GATE: After all initial cards are dealt, check for immediate end (dealer blackjack, etc.)
        // If checkWinCondition already transitioned to RESOLUTION, skip turn logic
        if (this.state === GameState.RESOLUTION || this.state === GameState.GAME_OVER) {
            return;
        }

        // Determine next state after dealing
        const nextActor = this.ruleset.getNextActor(this.getGameState());
        this.activeActorId = nextActor; // Fixed: nextActor returns ID directly, not object

        // If no next actor (e.g., all players busted), go to resolution
        if (!nextActor) {
            this.transitionTo(GameState.RESOLUTION);
            return;
        }

        // Determine type of actor for state transition
        const actorObj = this._getActor(this.activeActorId);
        const nextState = (actorObj && actorObj.type === 'human') ? GameState.PLAYER_TURN : GameState.OPPONENT_TURN;

        this.transitionTo(nextState);
    }
    
    /**
     * Execute a single deal action.
     * FIX: Use _getActor to find target (handles Dealer & Players), and ensure fromPile exists.
     * TERMINAL CHECK GATE: After every card deal, check for immediate win conditions.
     */
    _executeDeal(deal) {
        const fromPile = this.piles[deal.from];
        // Use _getActor instead of _getPlayer so we can find the Dealer
        const toPile = deal.toPlayer ? this._getActor(deal.to)?.hand : this.piles[deal.to];

        if (!fromPile || !toPile) {
            this._log('Invalid deal target', deal, 'error');
            return;
        }

        for (let i = 0; i < (deal.count || 1); i++) {
            const card = fromPile.give(0);
            if (!card) break;

            toPile.receive(card, -1);

            this._emit({
                type: ActionType.DEAL,
                from: { type: 'pile', id: deal.from },
                to: { type: deal.toPlayer ? 'player' : 'pile', id: deal.to },
                card: card.toJSON(),
                faceUp: deal.faceUp ?? true
            });

            // TERMINAL CHECK GATE: Check for immediate win condition after EVERY card
            this._checkForImmediateWin();
        }
    }
    
    /**
     * Handle start of a turn.
     */
    _handleTurnStart() {
        const actor = this._getActor(this.activeActorId);
        if (!actor) return;
        
        const availableActions = this.ruleset.getAvailableActions(this.getGameState(), this.activeActorId);
        
        this._emit({
            type: 'TURN_START',
            actorId: this.activeActorId,
            actorType: actor.type,
            availableActions
        });
        
        // If AI, automatically choose action
        if (actor.type === 'ai' || actor.isAI) {
            this._handleAITurn(actor, availableActions);
        }
    }
    
    /**
     * Handle AI turn automatically.
     */
    _handleAITurn(actor, availableActions) {
        // Small delay for visual feedback
        setTimeout(() => {
            // Safety check: Don't act if game already ended
            if (this.state === GameState.RESOLUTION || this.state === GameState.GAME_OVER || this.state === GameState.PAYOUT) {
                return;
            }

            const action = this.ruleset.getAiAction(this.getGameState(), actor);
            this.submitAction(actor.id, action);
        }, 500);
    }
    
    /**
     * Submit a player/AI action.
     * @param {string} actorId
     * @param {string} action - The action name (e.g., 'hit', 'stand')
     */
    submitAction(actorId, action) {
        // Safety check: Don't accept actions if game already ended
        if (this.state === GameState.RESOLUTION || this.state === GameState.GAME_OVER || this.state === GameState.PAYOUT) {
            this._log('Game already ended, ignoring action', { state: this.state, action }, 'warn');
            return false;
        }

        if (actorId !== this.activeActorId) {
            this._log('Not this actor\'s turn', { expected: this.activeActorId, got: actorId }, 'warn');
            return false;
        }

        const availableActions = this.ruleset.getAvailableActions(this.getGameState(), actorId);
        if (!availableActions.includes(action)) {
            this._log('Invalid action', { action, available: availableActions }, 'warn');
            this._emit({ type: 'INVALID_ACTION', actorId, action });
            return false;
        }
        
        this._log(`Action: ${actorId} → ${action}`);
        this.turnHistory.push({ action, actorId, timestamp: Date.now() });
        
        // Let ruleset resolve the action
        const result = this.ruleset.resolveAction(this.getGameState(), actorId, action, this);
        
        // Execute resulting actions
        if (result.actions) {
            result.actions.forEach(a => this._executeAction(a));
        }
        
        // FIX: Check for Immediate Win/Loss (e.g. Bust)
        this._checkForImmediateWin();

        // Handle state transition if checkWin didn't already end it
        if (this.state !== GameState.GAME_OVER && this.state !== GameState.RESOLUTION) {
            if (result.nextState) {
                if (result.nextActor) {
                    this.activeActorId = result.nextActor;
                }
                this.transitionTo(result.nextState);
            } else if (result.nextActor) {
                this.activeActorId = result.nextActor;
                this._handleTurnStart();
            } else if (result.nextActor === null) {
                // Explicitly null means no more actors - go to resolution
                this.transitionTo(GameState.RESOLUTION);
            }
        }
        
        return true;
    }

    /**
     * New helper to enforce Ruleset Win Conditions (The Gatekeeper)
     */
    _checkForImmediateWin() {
        if (!this.ruleset.checkWinCondition) return;

        const winResult = this.ruleset.checkWinCondition(this.getGameState());
        
        if (winResult && winResult.immediate) {
            this._log('Immediate Win Condition Triggered', winResult);
            
            // If the rule says "Skip Dealer" (e.g. all players busted), we force Game Over
            if (winResult.skipDealerTurn || winResult.skipPlayerTurns) {
                this.transitionTo(GameState.RESOLUTION);
            }
        }
    }
    
    /**
     * Execute an engine action.
     */
    _executeAction(action) {
        switch (action.type) {
            case ActionType.DEAL:
                this._executeDealAction(action);
                break;
            case ActionType.REVEAL:
                this._emit({ type: ActionType.REVEAL, ...action });
                break;
            case ActionType.SCORE:
                this._emit({ type: ActionType.SCORE, ...action });
                break;
            case ActionType.PAYOUT:
                this._executePayoutAction(action);
                break;
            case ActionType.DEDUCT:
                this._executeDeductAction(action);
                break;
            case ActionType.MESSAGE:
                this._emit({ type: ActionType.MESSAGE, text: action.text });
                break;
            case ActionType.SHUFFLE:
                this.piles[action.pile]?.shuffle();
                this._emit({ type: ActionType.SHUFFLE, pile: action.pile });
                break;
        }
    }
    
    /**
     * Execute a deal action from ruleset.
     * TERMINAL CHECK GATE: After every card deal, check for immediate win conditions.
     */
    _executeDealAction(action) {
        const fromPile = this.piles[action.from];
        const toTarget = action.toPlayer
            ? this._getActor(action.to)?.hand
            : this.piles[action.to];

        if (!fromPile || !toTarget) return;

        for (let i = 0; i < (action.count || 1); i++) {
            const card = fromPile.give(0);
            if (!card) break;

            toTarget.receive(card, -1);

            this._emit({
                type: ActionType.DEAL,
                from: { type: 'pile', id: action.from },
                to: { type: action.toPlayer ? 'player' : 'pile', id: action.to },
                card: card.toJSON(),
                faceUp: action.faceUp ?? true
            });

            // TERMINAL CHECK GATE: Check for immediate win condition after EVERY card
            this._checkForImmediateWin();
        }
    }
    
    /**
     * Execute payout action.
     */
    _executePayoutAction(action) {
        const player = this._getPlayer(action.playerId);
        if (player && player.credit) {
            player.credit(action.amount);
            this._emit({
                type: ActionType.PAYOUT,
                playerId: action.playerId,
                amount: action.amount,
                newBalance: player.balance
            });
        }
    }
    
    /**
     * Execute deduct action.
     */
    _executeDeductAction(action) {
        const player = this._getPlayer(action.playerId);
        if (player && player.deduct) {
            player.deduct(action.amount);
            this._emit({
                type: ActionType.DEDUCT,
                playerId: action.playerId,
                amount: action.amount,
                newBalance: player.balance
            });
        }
    }
    
    /**
     * Handle resolution phase.
     */
    _handleResolution() {
        const result = this.ruleset.resolveRound(this.getGameState());
        
        this._emit({
            type: 'RESOLUTION',
            ...result
        });
        
        // Store result for payout
        this._resolutionResult = result;
        
        // Move to payout or game over
        const nextState = this.ruleset.usesCurrency ? GameState.PAYOUT : GameState.GAME_OVER;
        this.transitionTo(nextState);
    }
    
    /**
     * Handle payout phase.
     */
    _handlePayout() {
        if (!this._resolutionResult) {
            this.transitionTo(GameState.GAME_OVER);
            return;
        }
        
        const payouts = this.ruleset.calculatePayouts(this._resolutionResult, this.getGameState());
        
        payouts.forEach(payout => {
            this._executePayoutAction(payout);
        });
        
        // Clear bets
        this.players.forEach(p => {
            if (p.clearBet) p.clearBet();
        });
        
        this._emit({
            type: 'PAYOUTS_COMPLETE',
            payouts
        });
        
        this.transitionTo(GameState.GAME_OVER);
    }
    
    /**
     * Handle game over phase.
     */
    _handleGameOver() {
        this._emit({
            type: 'GAME_OVER',
            roundNumber: this.roundNumber,
            result: this._resolutionResult
        });
        
        this._resolutionResult = null;
    }
    
    // ========================================================================
    // QUERY METHODS
    // ========================================================================
    
    /**
     * Get the complete game state object.
     * @returns {Object}
     */
    getGameState() {
        return {
            state: this.state,
            players: this.players,
            dealer: this.dealer,
            piles: this.piles,
            activeActorId: this.activeActorId,
            turnHistory: this.turnHistory,
            roundNumber: this.roundNumber,
            pot: this.pot
        };
    }
    
    /**
     * Get a player by ID.
     */
    _getPlayer(playerId) {
        return this.players.find(p => p.id === playerId);
    }
    
    /**
     * Get an actor (player or dealer) by ID.
     */
    _getActor(actorId) {
        if (this.dealer && this.dealer.id === actorId) {
            return this.dealer;
        }
        return this._getPlayer(actorId);
    }
    
    // ========================================================================
    // EVENT SYSTEM
    // ========================================================================
    
    /**
     * Subscribe to engine events.
     * @param {string} eventType - Event type or '*' for all
     * @param {Function} callback
     */
    on(eventType, callback) {
        if (!this.eventListeners[eventType]) {
            this.eventListeners[eventType] = [];
        }
        this.eventListeners[eventType].push(callback);
    }
    
    /**
     * Unsubscribe from engine events.
     */
    off(eventType, callback) {
        if (!this.eventListeners[eventType]) return;
        this.eventListeners[eventType] = this.eventListeners[eventType].filter(cb => cb !== callback);
    }
    
    /**
     * Emit an event to all listeners.
     */
    _emit(event) {
        this.eventQueue.push(event);
        
        // Notify specific listeners
        if (this.eventListeners[event.type]) {
            this.eventListeners[event.type].forEach(cb => cb(event));
        }
        
        // Notify wildcard listeners
        if (this.eventListeners['*']) {
            this.eventListeners['*'].forEach(cb => cb(event));
        }
        
        this._log('Event emitted', event);
    }
    
    /**
     * Acknowledge an animation completion (for awaitAcknowledgment).
     */
    acknowledgeAnimation() {
        if (this.awaitingAcknowledgment && this.pendingCallback) {
            this.awaitingAcknowledgment = false;
            const callback = this.pendingCallback;
            this.pendingCallback = null;
            callback();
        }
    }
    
    // ========================================================================
    // UTILITY
    // ========================================================================
    
    /**
     * Debug logging.
     */
    _log(message, data = null, level = 'log') {
        if (!this.debug && level === 'log') return;
        
        const prefix = `[Engine:${this.ruleset.gameId}]`;
        if (data) {
            console[level](prefix, message, data);
        } else {
            console[level](prefix, message);
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine, GameState, ActionType, ValidTransitions };
}