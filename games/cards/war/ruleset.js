/**
 * war/ruleset.js
 * War card game ruleset for the Card Engine.
 * 
 * Rules:
 * - Each player flips a card simultaneously
 * - Higher card wins both cards
 * - If tie, WAR: each player puts 3 cards face down, then flips one
 * - Winner takes all cards
 * - Game ends when one player has all cards
 * 
 * Safari-compatible
 */

var WarRuleset = {
    // ========================================================================
    // IDENTITY
    // ========================================================================
    
    gameId: 'war',
    displayName: 'War',
    minPlayers: 2,
    maxPlayers: 2,
    
    // ========================================================================
    // CONFIGURATION
    // ========================================================================
    
    usesCurrency: false,
    hasDealer: false,
    resetPilesEachRound: false,
    
    // War state tracking
    _warMode: false,
    _warPot: null,
    
    // ========================================================================
    // DECK BUILDING
    // ========================================================================
    
    buildPiles: function() {
        var deck = Pile.createFrom(StandardDeck, 1);
        deck.shuffle();
        
        // Split deck between two players - handled in init
        return {
            center: new Pile(),   // Cards played this round
            warPot: new Pile()    // Cards in war pot
        };
    },
    
    // ========================================================================
    // GAME INITIALIZATION (Called by engine after buildPiles)
    // ========================================================================
    
    initializeGame: function(gameState) {
        var deck = Pile.createFrom(StandardDeck, 1);
        deck.shuffle();
        
        // Deal 26 cards to each player
        var players = gameState.players;
        for (var i = 0; i < 52; i++) {
            var card = deck.give(0);
            var targetPlayer = players[i % 2];
            targetPlayer.hand.receive(card, -1);
        }
        
        this._warMode = false;
        this._warPot = new Pile();
    },
    
    // ========================================================================
    // DEAL SEQUENCE (No initial deal - cards already distributed)
    // ========================================================================
    
    getDealSequence: function(gameState) {
        // First round, initialize
        if (gameState.roundNumber === 1) {
            this.initializeGame(gameState);
        }
        return [];
    },
    
    // ========================================================================
    // TURN LOGIC
    // ========================================================================
    
    getNextActor: function(gameState) {
        // Both players act simultaneously
        return { 
            actorId: 'simultaneous', 
            type: 'simultaneous',
            actors: [gameState.players[0].id, gameState.players[1].id]
        };
    },
    
    getAvailableActions: function(gameState, actorId) {
        // Check if player has cards
        var player = null;
        for (var i = 0; i < gameState.players.length; i++) {
            if (gameState.players[i].id === actorId) {
                player = gameState.players[i];
                break;
            }
        }
        
        if (player && player.hand.count > 0) {
            return ['flip'];
        }
        return [];
    },
    
    resolveAction: function(gameState, actorId, action, engine) {
        // In War, we handle both players flipping together
        var player1 = gameState.players[0];
        var player2 = gameState.players[1];
        
        // Check for game end
        if (player1.hand.count === 0 || player2.hand.count === 0) {
            return { nextState: GameState.RESOLUTION };
        }
        
        // Each player flips top card
        var card1 = player1.hand.give(0);
        var card2 = player2.hand.give(0);
        
        if (!card1 || !card2) {
            return { nextState: GameState.RESOLUTION };
        }
        
        // Add to war pot
        this._warPot.receive(card1, -1);
        this._warPot.receive(card2, -1);
        
        var value1 = this._getCardValue(card1);
        var value2 = this._getCardValue(card2);
        
        var actions = [
            {
                type: ActionType.MESSAGE,
                text: player1.name + ': ' + this._getCardName(card1) + ' vs ' + player2.name + ': ' + this._getCardName(card2)
            }
        ];
        
        if (value1 > value2) {
            // Player 1 wins
            this._giveWarPotToPlayer(player1);
            actions.push({
                type: ActionType.MESSAGE,
                text: player1.name + ' wins the round!'
            });
            this._warMode = false;
            return {
                actions: actions,
                nextState: this._checkGameEnd(gameState) ? GameState.RESOLUTION : GameState.DEALING
            };
        } else if (value2 > value1) {
            // Player 2 wins
            this._giveWarPotToPlayer(player2);
            actions.push({
                type: ActionType.MESSAGE,
                text: player2.name + ' wins the round!'
            });
            this._warMode = false;
            return {
                actions: actions,
                nextState: this._checkGameEnd(gameState) ? GameState.RESOLUTION : GameState.DEALING
            };
        } else {
            // WAR!
            actions.push({
                type: ActionType.MESSAGE,
                text: 'WAR! Cards tied at ' + value1 + '!'
            });
            
            // Each player puts 3 cards face down (or all they have)
            var warCards1 = Math.min(3, player1.hand.count);
            var warCards2 = Math.min(3, player2.hand.count);
            
            for (var i = 0; i < warCards1; i++) {
                var c = player1.hand.give(0);
                if (c) this._warPot.receive(c, -1);
            }
            for (var j = 0; j < warCards2; j++) {
                var c2 = player2.hand.give(0);
                if (c2) this._warPot.receive(c2, -1);
            }
            
            this._warMode = true;
            
            // Check if either player ran out
            if (player1.hand.count === 0 || player2.hand.count === 0) {
                // Give pot to player with cards remaining
                if (player1.hand.count > 0) {
                    this._giveWarPotToPlayer(player1);
                } else {
                    this._giveWarPotToPlayer(player2);
                }
                return {
                    actions: actions,
                    nextState: GameState.RESOLUTION
                };
            }
            
            return {
                actions: actions,
                nextState: GameState.DEALING // Will flip again
            };
        }
    },
    
    _giveWarPotToPlayer: function(player) {
        // Shuffle the war pot cards and add to bottom of player's hand
        this._warPot.shuffle();
        while (this._warPot.count > 0) {
            var card = this._warPot.give(0);
            player.hand.receive(card, -1);
        }
    },
    
    _checkGameEnd: function(gameState) {
        return gameState.players[0].hand.count === 0 || 
               gameState.players[1].hand.count === 0;
    },
    
    // ========================================================================
    // AI LOGIC
    // ========================================================================
    
    getAIAction: function(gameState, actorId, availableActions) {
        return 'flip'; // Only option in War
    },
    
    // ========================================================================
    // CARD EVALUATION
    // ========================================================================
    
    _getCardValue: function(card) {
        switch (card.rank) {
            case Rank.TWO: return 2;
            case Rank.THREE: return 3;
            case Rank.FOUR: return 4;
            case Rank.FIVE: return 5;
            case Rank.SIX: return 6;
            case Rank.SEVEN: return 7;
            case Rank.EIGHT: return 8;
            case Rank.NINE: return 9;
            case Rank.TEN: return 10;
            case Rank.JACK: return 11;
            case Rank.QUEEN: return 12;
            case Rank.KING: return 13;
            case Rank.ACE: return 14; // Ace high in War
            default: return 0;
        }
    },
    
    _getCardName: function(card) {
        return RankToAsset[card.rank] + SuitToAsset[card.suit];
    },
    
    // ========================================================================
    // ROUND RESOLUTION
    // ========================================================================
    
    resolveRound: function(gameState) {
        var player1 = gameState.players[0];
        var player2 = gameState.players[1];
        
        var winner = null;
        if (player1.hand.count === 0) {
            winner = player2;
        } else if (player2.hand.count === 0) {
            winner = player1;
        }
        
        return {
            winners: winner ? [winner.id] : [],
            player1Cards: player1.hand.count,
            player2Cards: player2.hand.count,
            gameComplete: winner !== null
        };
    },
    
    calculatePayouts: function(resolution, gameState) {
        return []; // No currency in War
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WarRuleset: WarRuleset };
}
