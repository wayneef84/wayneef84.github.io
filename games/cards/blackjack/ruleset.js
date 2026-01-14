/**
 * blackjack/ruleset.js
 * Blackjack game ruleset for the Card Engine.
 * * Version: 1.0.6 (Full Fix)
 */

var BlackjackRuleset = {
    // ========================================================================
    // IDENTITY
    // ========================================================================
    
    gameId: 'blackjack',
    displayName: 'Blackjack',
    minPlayers: 1,
    maxPlayers: 5,
    
    // ========================================================================
    // CONFIGURATION (Mutable via Settings)
    // ========================================================================
    
    usesCurrency: true,
    hasDealer: true,
    resetPilesEachRound: false,
    
    // User Configurable Parameters
    deckCount: 6,
    targetScore: 21,
    dealerStandThreshold: 17,
    blackjackPayout: 1.5,
    insuranceEnabled: true,     // Allow insurance bets
    insurancePayout: 2.0,       // Insurance pays 2:1
    
    // ========================================================================
    // DECK BUILDING
    // ========================================================================
    
    buildPiles: function() {
        var shoe = Pile.createFrom(StandardDeck, this.deckCount);
        shoe.shuffle();
        
        return {
            shoe: shoe,
            discard: new Pile()
        };
    },

    // ========================================================================
    // DEALING LOGIC
    // ========================================================================

    /**
     * Defines the order cards are dealt.
     * FIX: Includes 'from' and 'toPlayer' flags for Engine compatibility
     */
    getDealSequence: function(gameState) {
        var sequence = [];
        
        // Round 1: Face Up for everyone
        gameState.players.forEach(function(p) {
            sequence.push({ 
                from: 'shoe',
                to: p.id, 
                toPlayer: true,
                faceUp: true 
            });
        });
        sequence.push({ 
            from: 'shoe',
            to: 'dealer', 
            toPlayer: true,
            faceUp: true 
        }); // Dealer Up Card
        
        // Round 2: Face Up for players, Face Down for Dealer
        gameState.players.forEach(function(p) {
            sequence.push({ 
                from: 'shoe',
                to: p.id, 
                toPlayer: true,
                faceUp: true 
            });
        });
        sequence.push({ 
            from: 'shoe',
            to: 'dealer', 
            toPlayer: true,
            faceUp: false 
        }); // Dealer Hole Card
        
        return sequence;
    },
    
    // ========================================================================
    // TURN LOGIC (Actor Resolution)
    // ========================================================================

    getAvailableActions: function(gameState, actorId) {
        var actions = [];
        // Basic Blackjack Actions
        actions.push('hit');
        actions.push('stand');
        
        // Double Down? (Only on 2 cards, sufficient funds)
        var actor = (actorId === 'dealer') ? gameState.dealer : gameState.players.find(function(p){return p.id === actorId});
        
        if (actor && actor.hand.count === 2 && actorId !== 'dealer') {
             // Check funds logic handled by engine or UI, here we just say rule allows it
             actions.push('double');
        }
        
        return actions;
    },

    resolveAction: function(gameState, actorId, action, engine) {
        var actor = (actorId === 'dealer') ? gameState.dealer : gameState.players.find(function(p){return p.id === actorId});
        var result = { actions: [], nextState: null, nextActor: null };

        if (action === 'hit') {
            // Deal 1 card
            result.actions.push({
                type: ActionType.DEAL,
                from: 'shoe',
                to: actorId,
                toPlayer: true,
                faceUp: true
            });
            
            // Check bust after deal (must use engine state after update, or predict)
            // Since we can't see the card yet, we let the Engine apply it.
            // But we must return control.
            // In a async/event system, the engine would re-eval. 
            // Here we assume player keeps turn unless they bust (checked in getNextActor)
            result.nextActor = actorId; 
        } 
        else if (action === 'stand') {
            actor._hasStood = true; // Mark as done
            result.nextActor = this.getNextActor(gameState); // Find next person
        }
        else if (action === 'double') {
             // Deduct bet (handled by engine usually, or we trigger DEDUCT)
             // Then Deal 1 card
             // Then Force Stand
             var bet = actor.currentBet;
             result.actions.push({
                 type: ActionType.DEDUCT,
                 playerId: actorId,
                 amount: bet
             });
             // We need to update player's bet tracking too, simplified here
             actor.placeBet(bet); // Add to pot/bet
             
             result.actions.push({
                type: ActionType.DEAL,
                from: 'shoe',
                to: actorId,
                toPlayer: true,
                faceUp: true
            });
            
            actor._hasStood = true;
            result.nextActor = this.getNextActor(gameState);
        }

        // Special Check: If the Hit caused a bust, we need to move on.
        // We can't check 'future' state here easily. 
        // Logic moved to getNextActor: it checks valid moves.
        
        return result;
    },

    /**
     * Determines who acts next.
     * BUST SUPPRESSION: If all players are busted/stood, return null to skip dealer turn.
     */
    getNextActor: function(gameState) {
        var activePlayers = gameState.players;
        var current = gameState.activeActorId; // Engine uses this

        // 1. Initial State (Start of Round)
        if (!current || current === 'dealer') {
            // Find first eligible human
            for (var i = 0; i < activePlayers.length; i++) {
                if (this._canPlayerAct(activePlayers[i])) {
                    return activePlayers[i].id;
                }
            }
            // If no players can act at start, skip to dealer
            return 'dealer';
        }

        // 2. Player Turn
        var playerIndex = activePlayers.findIndex(function(p) { return p.id === current; });

        if (playerIndex !== -1) {
            var player = activePlayers[playerIndex];

            // If current player can still act (didn't bust/stand), they keep turn
            if (this._canPlayerAct(player)) {
                return player.id;
            }

            // Move to next player
            for (var j = playerIndex + 1; j < activePlayers.length; j++) {
                if (this._canPlayerAct(activePlayers[j])) {
                    return activePlayers[j].id;
                }
            }

            // BUST SUPPRESSION: Check if ALL players are busted before going to dealer
            var anyPlayerAlive = false;
            for (var k = 0; k < activePlayers.length; k++) {
                var val = this.evaluateHand(activePlayers[k].hand.contents);
                if (val.best <= this.targetScore) {
                    anyPlayerAlive = true;
                    break;
                }
            }

            // If all players busted, return null to skip dealer turn and go straight to resolution
            if (!anyPlayerAlive) {
                return null;
            }

            // At least one player has a valid hand, proceed to dealer
            return 'dealer';
        }

        // 3. Dealer Turn
        var dealer = gameState.dealer;
        if (this._canDealerAct(dealer)) {
            return 'dealer';
        }

        // 4. End of Round
        return null;
    },

    /**
     * Helper: Can a human player still make moves?
     */
    _canPlayerAct: function(player) {
        if (player._hasStood) return false;
        
        var val = this.evaluateHand(player.hand.contents);
        // Cannot act if 21 or Bust
        if (val.best >= this.targetScore) return false;
        
        return true;
    },

    /**
     * Helper: Can the dealer still act?
     */
    _canDealerAct: function(dealer) {
        var val = this.evaluateHand(dealer.hand.contents);

        // Dealer MUST stop if busted
        if (val.best > this.targetScore) return false;

        // Dealer MUST stop if at or above stand threshold
        if (val.best >= this.dealerStandThreshold) return false;

        // Dealer continues if below stand threshold
        return true;
    },

    // ========================================================================
    // HAND EVALUATION
    // ========================================================================
    
    _getCardValue: function(card) {
        if (card.rank === Rank.ACE) return 11;
        if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) return 10;
        
        var val = 0;
        switch(card.rank) {
            case Rank.TWO: val = 2; break;
            case Rank.THREE: val = 3; break;
            case Rank.FOUR: val = 4; break;
            case Rank.FIVE: val = 5; break;
            case Rank.SIX: val = 6; break;
            case Rank.SEVEN: val = 7; break;
            case Rank.EIGHT: val = 8; break;
            case Rank.NINE: val = 9; break;
            case Rank.TEN: val = 10; break;
            default: val = parseInt(card.rank) || 0;
        }
        return val;
    },
    
    evaluateHand: function(cards) {
        var total = 0;
        var aces = 0;
        
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var val = this._getCardValue(card);
            
            if (card.rank === Rank.ACE) {
                aces++;
            }
            total += val;
        }
        
        while (total > this.targetScore && aces > 0) {
            total -= 10;
            aces--;
        }
        
        return {
            best: total,
            isSoft: aces > 0,
            isBlackjack: (cards.length === 2 && total === 21),
            canSplit: (cards.length === 2 && this._getCardValue(cards[0]) === this._getCardValue(cards[1]))
        };
    },
    
    // ========================================================================
    // AI / DEALER LOGIC
    // ========================================================================
    
    getAiAction: function(gameState, player) {
        // Dealer Rules: Hit if below threshold
        var value = this.evaluateHand(player.hand.contents);
        
        if (value.best < this.dealerStandThreshold) {
            return 'hit';
        }
        return 'stand';
    },
    
    // ========================================================================
    // INSURANCE LOGIC
    // ========================================================================

    /**
     * Check if insurance should be offered to players.
     * Insurance is offered when dealer's up card is an Ace.
     */
    shouldOfferInsurance: function(gameState) {
        if (!this.insuranceEnabled) return false;

        var dealer = gameState.dealer;
        if (!dealer || dealer.hand.count < 1) return false;

        // Check if dealer's up card is an Ace
        var upCard = dealer.hand.contents[0];
        return upCard.rank === Rank.ACE;
    },

    /**
     * Calculate insurance payout if dealer has blackjack.
     * Returns amount to pay back (insurance bet * payout multiplier).
     */
    calculateInsurancePayout: function(insuranceBet) {
        return Math.floor(insuranceBet * this.insurancePayout);
    },

    // ========================================================================
    // WIN CONDITIONS
    // ========================================================================

    checkWinCondition: function(gameState) {
        // 1. Dealer Blackjack
        var dealer = gameState.dealer;
        if (dealer.hand.count === 2) {
            var dealerValue = this.evaluateHand(dealer.hand.contents);
            if (dealerValue.isBlackjack) {
                return { 
                    immediate: true, 
                    reason: 'Dealer Blackjack',
                    skipPlayerTurns: true
                };
            }
        }

        // 2. All Players Busted
        var activePlayers = gameState.players;
        var allBusted = true;
        var hasActiveHumans = false;

        for (var i = 0; i < activePlayers.length; i++) {
            var p = activePlayers[i];
            if (p.hand.count > 0) {
                hasActiveHumans = true;
                var val = this.evaluateHand(p.hand.contents);
                if (val.best <= this.targetScore) {
                    allBusted = false;
                    break;
                }
            }
        }

        if (hasActiveHumans && allBusted) {
            return {
                immediate: true,
                reason: 'All Players Busted',
                skipDealerTurn: true
            };
        }
        
        return null;
    },

    // ========================================================================
    // RESOLUTION & PAYOUT
    // ========================================================================
    
    resolveRound: function(gameState) {
        var dealer = gameState.dealer;
        var dealerValue = this.evaluateHand(dealer.hand.contents);
        var dealerBust = dealerValue.best > this.targetScore;
        
        var results = gameState.players.map(function(player) {
            var playerValue = this.evaluateHand(player.hand.contents);
            var outcome = '';
            var multiplier = 0;
            
            if (playerValue.best > this.targetScore) {
                outcome = 'lose';
                multiplier = 0;
            } else if (playerValue.isBlackjack) {
                if (dealerValue.isBlackjack) {
                    outcome = 'push';
                    multiplier = 1; 
                } else {
                    outcome = 'blackjack';
                    multiplier = 1 + this.blackjackPayout; 
                }
            } else if (dealerBust) {
                outcome = 'win';
                multiplier = 2;
            } else if (playerValue.best > dealerValue.best) {
                outcome = 'win';
                multiplier = 2;
            } else if (playerValue.best === dealerValue.best) {
                outcome = 'push';
                multiplier = 1;
            } else {
                outcome = 'lose';
                multiplier = 0;
            }
            
            return {
                playerId: player.id,
                playerValue: playerValue.best,
                dealerValue: dealerValue.best,
                outcome: outcome,
                multiplier: multiplier,
                bet: player.currentBet
            };
        }, this);
        
        return {
            dealerValue: dealerValue.best,
            dealerBust: dealerBust,
            dealerBlackjack: dealerValue.isBlackjack,
            playerResults: results
        };
    },
    
    calculatePayouts: function(resolution, gameState) {
        return resolution.playerResults.map(function(result) {
            return {
                type: ActionType.PAYOUT,
                playerId: result.playerId,
                amount: Math.floor(result.bet * result.multiplier),
                outcome: result.outcome
            };
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlackjackRuleset: BlackjackRuleset };
}