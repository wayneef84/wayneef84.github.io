/**
 * engine.js
 * State Machine and Game Engine for the Card Engine. ES5 Compatible.
 *
 * The Engine orchestrates gameplay:
 * - Manages game state and valid transitions
 * - Delegates game-specific logic to Rulesets
 * - Emits events for frontend animation
 * - Handles turn order and player actions
 *
 * The Engine is GAME-AGNOSTIC. All game-specific logic lives in Rulesets.
 */

// ============================================================================
// GAME STATES
// ============================================================================

var GameState = Object.freeze({
    IDLE: 'IDLE',
    BETTING: 'BETTING',
    DEALING: 'DEALING',
    PLAYER_TURN: 'PLAYER_TURN',
    SIMULTANEOUS_ACTION: 'SIMULTANEOUS_ACTION',
    OPPONENT_TURN: 'OPPONENT_TURN',
    RESOLUTION: 'RESOLUTION',
    PAYOUT: 'PAYOUT',
    GAME_OVER: 'GAME_OVER'
});

// ============================================================================
// ACTION TYPES
// ============================================================================

var ActionType = Object.freeze({
    DEAL: 'DEAL',
    MOVE: 'MOVE',
    REVEAL: 'REVEAL',
    SHUFFLE: 'SHUFFLE',
    SCORE: 'SCORE',
    PAYOUT: 'PAYOUT',
    DEDUCT: 'DEDUCT',
    MESSAGE: 'MESSAGE',
    ROUND_WIN: 'ROUND_WIN',
    STATE_CHANGE: 'STATE_CHANGE'
});

// ============================================================================
// VALID STATE TRANSITIONS
// ============================================================================

var ValidTransitions = {};
ValidTransitions[GameState.IDLE] = [GameState.BETTING, GameState.DEALING];
ValidTransitions[GameState.BETTING] = [GameState.DEALING, GameState.IDLE];
ValidTransitions[GameState.DEALING] = [GameState.PLAYER_TURN, GameState.OPPONENT_TURN, GameState.SIMULTANEOUS_ACTION, GameState.RESOLUTION];
ValidTransitions[GameState.PLAYER_TURN] = [GameState.PLAYER_TURN, GameState.OPPONENT_TURN, GameState.RESOLUTION, GameState.DEALING];
ValidTransitions[GameState.SIMULTANEOUS_ACTION] = [GameState.RESOLUTION, GameState.SIMULTANEOUS_ACTION];
ValidTransitions[GameState.OPPONENT_TURN] = [GameState.OPPONENT_TURN, GameState.PLAYER_TURN, GameState.RESOLUTION];
ValidTransitions[GameState.RESOLUTION] = [GameState.PAYOUT, GameState.GAME_OVER];
ValidTransitions[GameState.PAYOUT] = [GameState.GAME_OVER];
ValidTransitions[GameState.GAME_OVER] = [GameState.IDLE, GameState.BETTING, GameState.DEALING];
Object.freeze(ValidTransitions);

// ============================================================================
// GAME ENGINE
// ============================================================================

function GameEngine(ruleset, config) {
    config = config || {};
    this.ruleset = ruleset;
    this.debug = config.debug || false;

    this.state = GameState.IDLE;
    this.players = [];
    this.piles = {};
    this.activeActorId = null;
    this.turnHistory = [];
    this.roundNumber = 0;
    this.pot = 0;

    this.eventQueue = [];
    this.eventListeners = {};

    this.awaitingAcknowledgment = false;
    this.pendingCallback = null;

    this._log('Engine created for ' + ruleset.gameId);
}

// ========================================================================
// INITIALIZATION
// ========================================================================

GameEngine.prototype.init = function (playerConfigs) {
    this._log('Initializing game...');

    if (playerConfigs.length < this.ruleset.minPlayers) {
        throw new Error('Minimum ' + this.ruleset.minPlayers + ' players required');
    }
    if (playerConfigs.length > this.ruleset.maxPlayers) {
        throw new Error('Maximum ' + this.ruleset.maxPlayers + ' players allowed');
    }

    this.players = [];
    for (var i = 0; i < playerConfigs.length; i++) {
        var cfg = playerConfigs[i];
        if (cfg.seat === undefined || cfg.seat === null) cfg.seat = i;
        var PlayerClass = this.ruleset.usesCurrency ? PlayerWithCurrency : Player;
        this.players.push(new PlayerClass(cfg));
    }

    if (this.ruleset.hasDealer) {
        this.dealer = new Dealer();
    }

    this.piles = this.ruleset.buildPiles();
    this.state = GameState.IDLE;
    this.turnHistory = [];
    this.roundNumber = 0;
    this.pot = 0;
    this.activeActorId = null;

    this._emit({
        type: 'GAME_INIT',
        players: this.players.map(function (p) { return p.toJSON(); }),
        piles: Object.keys(this.piles)
    });

    this._log('Game initialized', { players: this.players.length });
};

// ========================================================================
// STATE MANAGEMENT
// ========================================================================

GameEngine.prototype.transitionTo = function (newState, force) {
    var validNext = ValidTransitions[this.state];

    if (!force && validNext.indexOf(newState) === -1) {
        this._log('Invalid transition: ' + this.state + ' -> ' + newState, null, 'warn');
        return false;
    }

    var oldState = this.state;
    this.state = newState;

    this._emit({
        type: ActionType.STATE_CHANGE,
        from: oldState,
        to: newState
    });

    this._log('State: ' + oldState + ' -> ' + newState);
    this._onStateEnter(newState);
    return true;
};

GameEngine.prototype._onStateEnter = function (state) {
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
};

// ========================================================================
// GAME FLOW
// ========================================================================

GameEngine.prototype.startRound = function () {
    if (this.state !== GameState.IDLE && this.state !== GameState.GAME_OVER) {
        this._log('Cannot start round in current state', { state: this.state }, 'warn');
        return;
    }

    this.roundNumber++;
    this._log('Starting round ' + this.roundNumber);

    for (var i = 0; i < this.players.length; i++) this.players[i].clearHand();
    if (this.dealer) this.dealer.clearHand();

    this.pot = 0;
    this.turnHistory = [];

    if (this.ruleset.resetPilesEachRound) {
        this.piles = this.ruleset.buildPiles();
    }

    this._emit({ type: 'ROUND_START', roundNumber: this.roundNumber });

    var firstState = this.ruleset.usesCurrency ? GameState.BETTING : GameState.DEALING;
    this.transitionTo(firstState);
};

GameEngine.prototype.placeBet = function (playerId, amount) {
    if (this.state !== GameState.BETTING) {
        this._log('Cannot bet outside betting phase', null, 'warn');
        return false;
    }

    var player = this._getPlayer(playerId);
    if (!player) return false;

    if (!player.placeBet(amount)) {
        this._emit({ type: 'BET_FAILED', playerId: playerId, reason: 'Insufficient funds' });
        return false;
    }

    this.pot += amount;
    this._emit({ type: 'BET_PLACED', playerId: playerId, amount: amount, pot: this.pot });
    this.turnHistory.push({ action: 'bet', playerId: playerId, amount: amount });
    return true;
};

GameEngine.prototype.confirmBets = function () {
    if (this.state !== GameState.BETTING) return;
    this.transitionTo(GameState.DEALING);
};

/**
 * TERMINAL CHECK GATE: After dealing, check if round should end immediately.
 */
GameEngine.prototype._handleDealing = function () {
    var dealSequence = this.ruleset.getDealSequence(this.getGameState());

    for (var i = 0; i < dealSequence.length; i++) {
        this._executeDeal(dealSequence[i]);
    }

    // If checkWinCondition already transitioned to RESOLUTION, skip turn logic
    if (this.state === GameState.RESOLUTION || this.state === GameState.GAME_OVER) {
        return;
    }

    var nextActor = this.ruleset.getNextActor(this.getGameState());
    this.activeActorId = nextActor;

    if (!nextActor) {
        this.transitionTo(GameState.RESOLUTION);
        return;
    }

    var actorObj = this._getActor(this.activeActorId);
    var nextState = (actorObj && actorObj.type === 'human') ? GameState.PLAYER_TURN : GameState.OPPONENT_TURN;
    this.transitionTo(nextState);
};

/**
 * TERMINAL CHECK GATE: After every card deal, check for immediate win.
 */
GameEngine.prototype._executeDeal = function (deal) {
    var fromPile = this.piles[deal.from];
    var actor = deal.toPlayer ? this._getActor(deal.to) : null;
    var toPile = deal.toPlayer ? (actor ? actor.hand : null) : this.piles[deal.to];

    if (!fromPile || !toPile) {
        this._log('Invalid deal target', deal, 'error');
        return;
    }

    var count = deal.count || 1;
    for (var i = 0; i < count; i++) {
        var card = fromPile.give(0);
        if (!card) break;

        toPile.receive(card, -1);

        this._emit({
            type: ActionType.DEAL,
            from: { type: 'pile', id: deal.from },
            to: { type: deal.toPlayer ? 'player' : 'pile', id: deal.to },
            card: card.toJSON(),
            faceUp: (deal.faceUp !== undefined && deal.faceUp !== null) ? deal.faceUp : true
        });

        this._checkForImmediateWin();
    }
};

GameEngine.prototype._handleTurnStart = function () {
    var actor = this._getActor(this.activeActorId);
    if (!actor) return;

    var availableActions = this.ruleset.getAvailableActions(this.getGameState(), this.activeActorId);

    this._emit({
        type: 'TURN_START',
        actorId: this.activeActorId,
        actorType: actor.type,
        availableActions: availableActions
    });

    if (actor.type === 'ai' || actor.isAI) {
        this._handleAITurn(actor, availableActions);
    }
};

GameEngine.prototype._handleAITurn = function (actor, availableActions) {
    var self = this;
    setTimeout(function () {
        if (self.state === GameState.RESOLUTION || self.state === GameState.GAME_OVER || self.state === GameState.PAYOUT) {
            return;
        }
        var action = self.ruleset.getAiAction(self.getGameState(), actor);
        self.submitAction(actor.id, action);
    }, 500);
};

GameEngine.prototype.submitAction = function (actorId, action) {
    if (this.state === GameState.RESOLUTION || this.state === GameState.GAME_OVER || this.state === GameState.PAYOUT) {
        this._log('Game already ended, ignoring action', { state: this.state, action: action }, 'warn');
        return false;
    }

    if (actorId !== this.activeActorId) {
        this._log('Not this actor\'s turn', { expected: this.activeActorId, got: actorId }, 'warn');
        return false;
    }

    var availableActions = this.ruleset.getAvailableActions(this.getGameState(), actorId);
    if (availableActions.indexOf(action) === -1) {
        this._log('Invalid action', { action: action, available: availableActions }, 'warn');
        this._emit({ type: 'INVALID_ACTION', actorId: actorId, action: action });
        return false;
    }

    this._log('Action: ' + actorId + ' -> ' + action);
    this.turnHistory.push({ action: action, actorId: actorId, timestamp: Date.now() });

    var result = this.ruleset.resolveAction(this.getGameState(), actorId, action, this);

    if (result.actions) {
        for (var i = 0; i < result.actions.length; i++) {
            this._executeAction(result.actions[i]);
        }
    }

    this._checkForImmediateWin();

    if (this.state !== GameState.GAME_OVER && this.state !== GameState.RESOLUTION) {
        if (result.nextState) {
            if (result.nextActor) this.activeActorId = result.nextActor;
            this.transitionTo(result.nextState);
        } else if (result.nextActor) {
            this.activeActorId = result.nextActor;
            this._handleTurnStart();
        } else if (result.nextActor === null) {
            this.transitionTo(GameState.RESOLUTION);
        }
    }

    return true;
};

GameEngine.prototype._checkForImmediateWin = function () {
    if (!this.ruleset.checkWinCondition) return;

    var winResult = this.ruleset.checkWinCondition(this.getGameState());

    if (winResult && winResult.immediate) {
        this._log('Immediate Win Condition Triggered', winResult);
        if (winResult.skipDealerTurn || winResult.skipPlayerTurns) {
            this.transitionTo(GameState.RESOLUTION);
        }
    }
};

GameEngine.prototype._executeAction = function (action) {
    switch (action.type) {
        case ActionType.DEAL:
            this._executeDealAction(action);
            break;
        case ActionType.REVEAL:
            this._emit({ type: ActionType.REVEAL, targetId: action.targetId, cardUuid: action.cardUuid });
            break;
        case ActionType.SCORE:
            this._emit({ type: ActionType.SCORE, playerId: action.playerId, score: action.score });
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
        case ActionType.ROUND_WIN:
            this._emit({ type: ActionType.ROUND_WIN, winner: action.winner });
            break;
        case ActionType.SHUFFLE:
            var shufflePile = this.piles[action.pile];
            if (shufflePile) shufflePile.shuffle();
            this._emit({ type: ActionType.SHUFFLE, pile: action.pile });
            break;
    }
};

/**
 * TERMINAL CHECK GATE: After every card deal, check for immediate win.
 */
GameEngine.prototype._executeDealAction = function (action) {
    var fromPile = this.piles[action.from];
    var actor = action.toPlayer ? this._getActor(action.to) : null;
    var toTarget = action.toPlayer ? (actor ? actor.hand : null) : this.piles[action.to];

    if (!fromPile || !toTarget) return;

    var count = action.count || 1;
    for (var i = 0; i < count; i++) {
        var card = fromPile.give(0);
        if (!card) break;

        toTarget.receive(card, -1);

        this._emit({
            type: ActionType.DEAL,
            from: { type: 'pile', id: action.from },
            to: { type: action.toPlayer ? 'player' : 'pile', id: action.to },
            card: card.toJSON(),
            faceUp: (action.faceUp !== undefined && action.faceUp !== null) ? action.faceUp : true
        });

        this._checkForImmediateWin();
    }
};

GameEngine.prototype._executePayoutAction = function (action) {
    var player = this._getPlayer(action.playerId);
    if (player && player.credit) {
        player.credit(action.amount);
        this._emit({
            type: ActionType.PAYOUT,
            playerId: action.playerId,
            amount: action.amount,
            newBalance: player.balance
        });
    }
};

GameEngine.prototype._executeDeductAction = function (action) {
    var player = this._getPlayer(action.playerId);
    if (player && player.deduct) {
        player.deduct(action.amount);
        this._emit({
            type: ActionType.DEDUCT,
            playerId: action.playerId,
            amount: action.amount,
            newBalance: player.balance
        });
    }
};

GameEngine.prototype._handleResolution = function () {
    var result = this.ruleset.resolveRound(this.getGameState());

    var event = {
        type: 'RESOLUTION',
        winner: result.winner,
        outcome: result.outcome,
        details: result.details
    };

    for (var key in result) {
        if (result.hasOwnProperty(key) && key !== 'type') {
            event[key] = result[key];
        }
    }

    this._emit(event);

    this._resolutionResult = result;
    var nextState = this.ruleset.usesCurrency ? GameState.PAYOUT : GameState.GAME_OVER;
    this.transitionTo(nextState);
};

GameEngine.prototype._handlePayout = function () {
    if (!this._resolutionResult) {
        this.transitionTo(GameState.GAME_OVER);
        return;
    }

    var payouts = this.ruleset.calculatePayouts(this._resolutionResult, this.getGameState());

    for (var i = 0; i < payouts.length; i++) {
        this._executePayoutAction(payouts[i]);
    }

    for (var j = 0; j < this.players.length; j++) {
        if (this.players[j].clearBet) this.players[j].clearBet();
    }

    this._emit({ type: 'PAYOUTS_COMPLETE', payouts: payouts });
    this.transitionTo(GameState.GAME_OVER);
};

GameEngine.prototype._handleGameOver = function () {
    this._emit({
        type: 'GAME_OVER',
        roundNumber: this.roundNumber,
        result: this._resolutionResult
    });
    this._resolutionResult = null;
};

// ========================================================================
// QUERY METHODS
// ========================================================================

GameEngine.prototype.getGameState = function () {
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
};

GameEngine.prototype._getPlayer = function (playerId) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id === playerId) return this.players[i];
    }
    return null;
};

GameEngine.prototype._getActor = function (actorId) {
    if (this.dealer && this.dealer.id === actorId) return this.dealer;
    return this._getPlayer(actorId);
};

// ========================================================================
// EVENT SYSTEM
// ========================================================================

GameEngine.prototype.on = function (eventType, callback) {
    if (!this.eventListeners[eventType]) {
        this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
};

GameEngine.prototype.off = function (eventType, callback) {
    if (!this.eventListeners[eventType]) return;
    var filtered = [];
    for (var i = 0; i < this.eventListeners[eventType].length; i++) {
        if (this.eventListeners[eventType][i] !== callback) {
            filtered.push(this.eventListeners[eventType][i]);
        }
    }
    this.eventListeners[eventType] = filtered;
};

GameEngine.prototype._emit = function (event) {
    this.eventQueue.push(event);

    var listeners = this.eventListeners[event.type];
    if (listeners) {
        for (var i = 0; i < listeners.length; i++) listeners[i](event);
    }

    var wildcards = this.eventListeners['*'];
    if (wildcards) {
        for (var j = 0; j < wildcards.length; j++) wildcards[j](event);
    }

    this._log('Event emitted', event);
};

GameEngine.prototype.acknowledgeAnimation = function () {
    if (this.awaitingAcknowledgment && this.pendingCallback) {
        this.awaitingAcknowledgment = false;
        var callback = this.pendingCallback;
        this.pendingCallback = null;
        callback();
    }
};

// ========================================================================
// UTILITY
// ========================================================================

GameEngine.prototype._log = function (message, data, level) {
    if (!level) level = 'log';
    if (!this.debug && level === 'log') return;
    var prefix = '[Engine:' + this.ruleset.gameId + ']';
    if (data) {
        console[level](prefix, message, data);
    } else {
        console[level](prefix, message);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine: GameEngine, GameState: GameState, ActionType: ActionType, ValidTransitions: ValidTransitions };
}
