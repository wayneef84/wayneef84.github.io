/**
 * euchre/ruleset.js
 * Euchre card game ruleset for the Card Engine.
 * 
 * Rules:
 * - 4 players in 2 teams (partners sit across)
 * - 24-card deck (9, 10, J, Q, K, A)
 * - Trump suit determined each hand
 * - Right Bower (Jack of trump) is highest
 * - Left Bower (Jack of same color) is second highest
 * - First to 10 points wins
 * 
 * Simplified for single player + 3 AI
 * Safari-compatible
 */

var EuchreRuleset = {
    // ========================================================================
    // IDENTITY
    // ========================================================================
    
    gameId: 'euchre',
    displayName: 'Euchre',
    minPlayers: 4,
    maxPlayers: 4,
    
    // ========================================================================
    // CONFIGURATION
    // ========================================================================
    
    usesCurrency: false,
    hasDealer: false,
    resetPilesEachRound: true,
    
    // Game state
    _trumpSuit: null,
    _trumpCaller: null,
    _currentTrick: [],
    _trickLeader: null,
    _tricksWon: { team1: 0, team2: 0 },
    _scores: { team1: 0, team2: 0 },
    _dealerIndex: 0,
    _phase: 'dealing', // dealing, calling, playing
    _turnUpCard: null,
    
    // ========================================================================
    // DECK BUILDING
    // ========================================================================
    
    buildPiles: function() {
        var deck = Pile.createFrom(EuchreDeck, 1);
        deck.shuffle();
        
        return {
            deck: deck,
            kitty: new Pile(),
            trick: new Pile()
        };
    },
    
    // ========================================================================
    // DEAL SEQUENCE
    // ========================================================================
    
    getDealSequence: function(gameState) {
        var sequence = [];
        var players = gameState.players;
        var dealerIdx = this._dealerIndex;
        
        // Euchre deal: 3-2-3-2 or 2-3-2-3 pattern
        // First round: 3 cards each
        for (var i = 1; i <= 4; i++) {
            var playerIdx = (dealerIdx + i) % 4;
            var count = (i % 2 === 1) ? 3 : 2;
            sequence.push({
                from: 'deck',
                to: players[playerIdx].id,
                toPlayer: true,
                count: count,
                faceUp: players[playerIdx].type === 'human'
            });
        }
        
        // Second round: 2 cards each (opposite of first)
        for (var j = 1; j <= 4; j++) {
            var pIdx = (dealerIdx + j) % 4;
            var cnt = (j % 2 === 1) ? 2 : 3;
            sequence.push({
                from: 'deck',
                to: players[pIdx].id,
                toPlayer: true,
                count: cnt,
                faceUp: players[pIdx].type === 'human'
            });
        }
        
        // Turn up top card for trump
        sequence.push({
            from: 'deck',
            to: 'kitty',
            toPlayer: false,
            count: 1,
            faceUp: true
        });
        
        return sequence;
    },
    
    // ========================================================================
    // TURN LOGIC
    // ========================================================================
    
    getNextActor: function(gameState) {
        var players = gameState.players;
        
        if (this._phase === 'calling') {
            // Go around for calling trump
            var dealerIdx = this._dealerIndex;
            for (var i = 1; i <= 4; i++) {
                var playerIdx = (dealerIdx + i) % 4;
                if (!players[playerIdx]._hasPassed) {
                    return { actorId: players[playerIdx].id, type: players[playerIdx].type };
                }
            }
            // Everyone passed first round - second round
            for (var j = 1; j <= 4; j++) {
                var pIdx = (dealerIdx + j) % 4;
                if (!players[pIdx]._hasPassedSecond) {
                    return { actorId: players[pIdx].id, type: players[pIdx].type };
                }
            }
        }
        
        if (this._phase === 'playing') {
            if (this._trickLeader !== null) {
                return { actorId: this._trickLeader, type: this._getPlayerType(gameState, this._trickLeader) };
            }
            // After trick, winner leads
            var leaderIdx = (this._dealerIndex + 1) % 4;
            return { actorId: players[leaderIdx].id, type: players[leaderIdx].type };
        }
        
        return { actorId: players[0].id, type: players[0].type };
    },
    
    _getPlayerType: function(gameState, playerId) {
        for (var i = 0; i < gameState.players.length; i++) {
            if (gameState.players[i].id === playerId) {
                return gameState.players[i].type;
            }
        }
        return 'ai';
    },
    
    getAvailableActions: function(gameState, actorId) {
        if (this._phase === 'calling') {
            var turnUpSuit = this._turnUpCard ? this._turnUpCard.suit : null;
            
            // First round - can order up or pass
            if (!this._allPassedFirstRound(gameState)) {
                return ['orderUp', 'pass'];
            }
            // Second round - can name any OTHER suit or pass
            var suits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'];
            var actions = ['pass'];
            for (var i = 0; i < suits.length; i++) {
                if (suits[i] !== turnUpSuit) {
                    actions.push('call_' + suits[i]);
                }
            }
            return actions;
        }
        
        if (this._phase === 'playing') {
            return ['playCard'];
        }
        
        return [];
    },
    
    _allPassedFirstRound: function(gameState) {
        for (var i = 0; i < gameState.players.length; i++) {
            if (!gameState.players[i]._hasPassed) return false;
        }
        return true;
    },
    
    resolveAction: function(gameState, actorId, action, engine) {
        var player = this._getPlayer(gameState, actorId);
        
        if (action === 'orderUp') {
            this._trumpSuit = this._turnUpCard.suit;
            this._trumpCaller = actorId;
            this._phase = 'playing';
            
            // Dealer picks up the turn-up card
            var dealerPlayer = gameState.players[this._dealerIndex];
            var kittyCard = gameState.piles.kitty.give(0);
            if (kittyCard) {
                dealerPlayer.hand.receive(kittyCard, -1);
                // Dealer should discard - simplified: discard lowest
                this._autoDiscard(dealerPlayer);
            }
            
            this._trickLeader = gameState.players[(this._dealerIndex + 1) % 4].id;
            
            return {
                actions: [{ type: ActionType.MESSAGE, text: player.name + ' orders up ' + this._trumpSuit }],
                nextState: GameState.PLAYER_TURN,
                nextActor: this._trickLeader
            };
        }
        
        if (action === 'pass') {
            if (!this._allPassedFirstRound(gameState)) {
                player._hasPassed = true;
            } else {
                player._hasPassedSecond = true;
            }
            
            // Check if all passed both rounds (stuck dealer)
            var allPassedSecond = true;
            for (var i = 0; i < gameState.players.length; i++) {
                if (!gameState.players[i]._hasPassedSecond) {
                    allPassedSecond = false;
                    break;
                }
            }
            
            if (allPassedSecond) {
                // Dealer is stuck - must call
                var dealer = gameState.players[this._dealerIndex];
                var turnUpSuit = this._turnUpCard.suit;
                var otherSuits = ['CLUBS', 'DIAMONDS', 'HEARTS', 'SPADES'].filter(function(s) {
                    return s !== turnUpSuit;
                });
                this._trumpSuit = otherSuits[0];
                this._trumpCaller = dealer.id;
                this._phase = 'playing';
                this._trickLeader = gameState.players[(this._dealerIndex + 1) % 4].id;
                
                return {
                    actions: [{ type: ActionType.MESSAGE, text: dealer.name + ' is stuck - calls ' + this._trumpSuit }],
                    nextState: GameState.PLAYER_TURN,
                    nextActor: this._trickLeader
                };
            }
            
            return {
                actions: [{ type: ActionType.MESSAGE, text: player.name + ' passes' }],
                nextActor: this.getNextActor(gameState).actorId
            };
        }
        
        if (action.indexOf('call_') === 0) {
            this._trumpSuit = action.replace('call_', '');
            this._trumpCaller = actorId;
            this._phase = 'playing';
            this._trickLeader = gameState.players[(this._dealerIndex + 1) % 4].id;
            
            return {
                actions: [{ type: ActionType.MESSAGE, text: player.name + ' calls ' + this._trumpSuit }],
                nextState: GameState.PLAYER_TURN,
                nextActor: this._trickLeader
            };
        }
        
        return {};
    },
    
    _getPlayer: function(gameState, playerId) {
        for (var i = 0; i < gameState.players.length; i++) {
            if (gameState.players[i].id === playerId) {
                return gameState.players[i];
            }
        }
        return null;
    },
    
    _autoDiscard: function(player) {
        // Simple: discard lowest non-trump
        var dominated = [];
        var hand = player.hand.contents;
        var self = this;
        
        for (var i = 0; i < hand.length; i++) {
            var card = hand[i];
            if (card.suit !== self._trumpSuit && !self._isBower(card)) {
                dominated.push({ card: card, value: self._getCardValue(card) });
            }
        }
        
        if (dominated.length > 0) {
            dominated.sort(function(a, b) { return a.value - b.value; });
            player.hand.remove({ rank: [dominated[0].card.rank], suit: [dominated[0].card.suit] });
        } else {
            // Discard any card
            player.hand.give(-1);
        }
    },
    
    _isBower: function(card) {
        if (card.rank !== Rank.JACK) return false;
        if (card.suit === this._trumpSuit) return true; // Right bower
        // Check left bower (same color)
        var trumpColor = (this._trumpSuit === 'HEARTS' || this._trumpSuit === 'DIAMONDS') ? 'red' : 'black';
        var cardColor = (card.suit === 'HEARTS' || card.suit === 'DIAMONDS') ? 'red' : 'black';
        return trumpColor === cardColor;
    },
    
    // ========================================================================
    // AI LOGIC
    // ========================================================================
    
    getAIAction: function(gameState, actorId, availableActions) {
        // Simple AI
        if (availableActions.indexOf('orderUp') !== -1) {
            // Order up if we have good trump
            var player = this._getPlayer(gameState, actorId);
            var trumpCount = this._countTrump(player.hand.contents);
            if (trumpCount >= 3) {
                return 'orderUp';
            }
            return 'pass';
        }
        
        // Second round - call if stuck or have decent cards
        for (var i = 0; i < availableActions.length; i++) {
            if (availableActions[i].indexOf('call_') === 0) {
                return availableActions[i];
            }
        }
        
        return 'pass';
    },
    
    _countTrump: function(cards) {
        var count = 0;
        var self = this;
        for (var i = 0; i < cards.length; i++) {
            if (self._isEffectiveTrump(cards[i])) count++;
        }
        return count;
    },
    
    _isEffectiveTrump: function(card) {
        if (card.suit === this._trumpSuit) return true;
        return this._isBower(card);
    },
    
    // ========================================================================
    // CARD EVALUATION
    // ========================================================================
    
    _getCardValue: function(card) {
        // Base values
        var baseValues = {
            'NINE': 9, 'TEN': 10, 'JACK': 11, 'QUEEN': 12, 'KING': 13, 'ACE': 14
        };
        
        var base = baseValues[card.rank] || 0;
        
        // Trump bonuses
        if (card.rank === Rank.JACK) {
            if (card.suit === this._trumpSuit) {
                return 100; // Right bower
            }
            var trumpColor = (this._trumpSuit === 'HEARTS' || this._trumpSuit === 'DIAMONDS') ? 'red' : 'black';
            var cardColor = (card.suit === 'HEARTS' || card.suit === 'DIAMONDS') ? 'red' : 'black';
            if (trumpColor === cardColor) {
                return 99; // Left bower
            }
        }
        
        if (card.suit === this._trumpSuit) {
            return base + 20;
        }
        
        return base;
    },
    
    // ========================================================================
    // ROUND RESOLUTION
    // ========================================================================
    
    resolveRound: function(gameState) {
        // Determine winner based on tricks won
        var callerTeam = this._getTeam(gameState, this._trumpCaller);
        var callerTricks = this._tricksWon['team' + callerTeam];
        var defenderTricks = this._tricksWon['team' + (callerTeam === 1 ? 2 : 1)];
        
        var points = 0;
        var winner;
        
        if (callerTricks >= 3) {
            winner = 'team' + callerTeam;
            if (callerTricks === 5) {
                points = 2; // March
            } else {
                points = 1;
            }
        } else {
            winner = 'team' + (callerTeam === 1 ? 2 : 1);
            points = 2; // Euchred
        }
        
        this._scores[winner] += points;
        
        return {
            winners: [winner],
            points: points,
            callerTeam: 'team' + callerTeam,
            tricksWon: this._tricksWon,
            scores: this._scores,
            gameWinner: this._scores.team1 >= 10 ? 'team1' : (this._scores.team2 >= 10 ? 'team2' : null)
        };
    },
    
    _getTeam: function(gameState, playerId) {
        for (var i = 0; i < gameState.players.length; i++) {
            if (gameState.players[i].id === playerId) {
                return (i % 2 === 0) ? 1 : 2;
            }
        }
        return 1;
    },
    
    calculatePayouts: function(resolution, gameState) {
        return []; // No currency
    },
    
    // ========================================================================
    // RESET FOR NEW HAND
    // ========================================================================
    
    resetHand: function(gameState) {
        this._trumpSuit = null;
        this._trumpCaller = null;
        this._currentTrick = [];
        this._trickLeader = null;
        this._tricksWon = { team1: 0, team2: 0 };
        this._phase = 'dealing';
        this._turnUpCard = null;
        this._dealerIndex = (this._dealerIndex + 1) % 4;
        
        for (var i = 0; i < gameState.players.length; i++) {
            gameState.players[i]._hasPassed = false;
            gameState.players[i]._hasPassedSecond = false;
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EuchreRuleset: EuchreRuleset };
}
