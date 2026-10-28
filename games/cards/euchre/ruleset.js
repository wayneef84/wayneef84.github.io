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
    
    _ensureCallingPhase: function(gameState) {
        if (this._phase === 'dealing' && gameState && gameState.piles && gameState.piles.kitty && gameState.piles.kitty.count > 0) {
            this._turnUpCard = gameState.piles.kitty.peek(0);
            this._phase = 'calling';
        }
    },

    getNextActor: function(gameState) {
        this._ensureCallingPhase(gameState);
        var players = gameState.players;
        
        if (this._phase === 'calling') {
            var dealerIdx = this._dealerIndex;
            for (var i = 1; i <= 4; i++) {
                var playerIdx = (dealerIdx + i) % 4;
                if (!players[playerIdx]._hasPassed) {
                    return players[playerIdx].id;
                }
            }
            for (var j = 1; j <= 4; j++) {
                var pIdx = (dealerIdx + j) % 4;
                if (!players[pIdx]._hasPassedSecond) {
                    return players[pIdx].id;
                }
            }
        }
        
        if (this._phase === 'playing') {
            if (this._tricksWon.team1 + this._tricksWon.team2 >= 5) {
                return null;
            }
            if (this._currentTrick.length === 0) {
                if (this._trickLeader !== null) {
                    return this._trickLeader;
                }
                var leaderIdx = (this._dealerIndex + 1) % 4;
                return players[leaderIdx].id;
            }
            var leaderPlayerIdx = 0;
            for (var k = 0; k < players.length; k++) {
                if (players[k].id === this._trickLeader) {
                    leaderPlayerIdx = k;
                    break;
                }
            }
            var nextIdx = (leaderPlayerIdx + this._currentTrick.length) % 4;
            return players[nextIdx].id;
        }
        
        return players[0].id;
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
        this._ensureCallingPhase(gameState);
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
            var player = this._getPlayer(gameState, actorId);
            if (!player || player.hand.count === 0) return [];
            var leadSuit = this._currentTrick.length > 0
                ? this._getEffectiveSuit(this._currentTrick[0].card)
                : null;
            var validIndices = this._getPlayableCardIndices(player.hand.contents, leadSuit);
            var playActions = ['playCard'];
            for (var p = 0; p < validIndices.length; p++) {
                playActions.push('playCard_' + validIndices[p]);
            }
            return playActions;
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
                nextActor: this.getNextActor(gameState)
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

        if (action === 'playCard' || action.indexOf('playCard_') === 0) {
            var leadSuit = this._currentTrick.length > 0
                ? this._getEffectiveSuit(this._currentTrick[0].card)
                : null;
            var validIndices = this._getPlayableCardIndices(player.hand.contents, leadSuit);
            var cardIndex = validIndices[0] || 0;
            if (action.indexOf('playCard_') === 0) {
                var parsedIdx = parseInt(action.replace('playCard_', ''), 10);
                if (!isNaN(parsedIdx) && validIndices.indexOf(parsedIdx) !== -1) {
                    cardIndex = parsedIdx;
                }
            }
            var playedCard = player.hand.give(cardIndex);
            if (!playedCard) return {};
            if (gameState.piles && gameState.piles.trick) {
                gameState.piles.trick.receive(playedCard, -1);
            }
            this._currentTrick.push({ playerId: actorId, card: playedCard });

            var msgs = [{ type: ActionType.MESSAGE, text: player.name + ' plays ' + playedCard.rank + ' of ' + playedCard.suit }];

            if (this._currentTrick.length === 4) {
                var trickWinnerId = this._evaluateTrickWinner();
                var winningTeam = this._getTeam(gameState, trickWinnerId);
                this._tricksWon['team' + winningTeam]++;
                this._currentTrick = [];
                if (gameState.piles && gameState.piles.trick) {
                    gameState.piles.trick.clear();
                }
                this._trickLeader = trickWinnerId;
                msgs.push({ type: ActionType.MESSAGE, text: trickWinnerId + ' wins the trick!' });

                if (this._tricksWon.team1 + this._tricksWon.team2 >= 5) {
                    return {
                        actions: msgs,
                        nextState: GameState.RESOLUTION,
                        nextActor: null
                    };
                }
            }

            var nextAct = this.getNextActor(gameState);
            var nextType = this._getPlayerType(gameState, nextAct);
            return {
                actions: msgs,
                nextState: nextType === 'human' ? GameState.PLAYER_TURN : GameState.OPPONENT_TURN,
                nextActor: nextAct
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
    
    _getEffectiveSuit: function(card) {
        if (!card) return null;
        if (this._trumpSuit && this._isBower(card)) {
            return this._trumpSuit;
        }
        return card.suit;
    },

    _getPlayableCardIndices: function(handCards, leadSuit) {
        var all = [];
        var matching = [];
        for (var i = 0; i < handCards.length; i++) {
            all.push(i);
            if (leadSuit && this._getEffectiveSuit(handCards[i]) === leadSuit) {
                matching.push(i);
            }
        }
        return matching.length > 0 ? matching : all;
    },

    _evaluateTrickWinner: function() {
        if (this._currentTrick.length === 0) return null;
        var leadSuit = this._getEffectiveSuit(this._currentTrick[0].card);
        var bestEntry = this._currentTrick[0];
        var bestScore = this._getTrickCardScore(bestEntry.card, leadSuit);

        for (var i = 1; i < this._currentTrick.length; i++) {
            var entry = this._currentTrick[i];
            var score = this._getTrickCardScore(entry.card, leadSuit);
            if (score > bestScore) {
                bestScore = score;
                bestEntry = entry;
            }
        }
        return bestEntry.playerId;
    },

    _getTrickCardScore: function(card, leadSuit) {
        var effSuit = this._getEffectiveSuit(card);
        if (effSuit === this._trumpSuit) {
            return this._getCardValue(card); // 29..100
        }
        if (effSuit === leadSuit) {
            return this._getCardValue(card); // 9..14
        }
        return 0; // Off-suit non-trump cannot win trick
    },

    getAIAction: function(gameState, actorIdOrObj, availableActions) {
        var actorId = (actorIdOrObj && typeof actorIdOrObj === 'object') ? actorIdOrObj.id : actorIdOrObj;
        if (!availableActions) {
            availableActions = this.getAvailableActions(gameState, actorId);
        }
        var player = this._getPlayer(gameState, actorId);

        if (availableActions.indexOf('orderUp') !== -1) {
            var previewSuit = this._turnUpCard ? this._turnUpCard.suit : this._trumpSuit;
            var savedTrump = this._trumpSuit;
            this._trumpSuit = previewSuit;
            var trumpCount = player ? this._countTrump(player.hand.contents) : 0;
            this._trumpSuit = savedTrump;
            if (trumpCount >= 3) {
                return 'orderUp';
            }
            return 'pass';
        }
        
        for (var i = 0; i < availableActions.length; i++) {
            if (availableActions[i].indexOf('call_') === 0) {
                return availableActions[i];
            }
        }

        if (availableActions.indexOf('playCard') !== -1) {
            for (var j = 0; j < availableActions.length; j++) {
                if (availableActions[j].indexOf('playCard_') === 0) {
                    return availableActions[j];
                }
            }
            return 'playCard';
        }
        
        return 'pass';
    },

    getAiAction: function(gameState, actor, availableActions) {
        return this.getAIAction(gameState, actor, availableActions);
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
