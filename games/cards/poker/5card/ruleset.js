/**
 * ruleset.js
 * 5 Card Draw Poker Ruleset
 * Flow: Ante -> Deal -> Draw (Player) -> Draw (AI) -> Showdown
 */

var FiveCardDrawRuleset = {
    gameId: 'poker-5card',
    displayName: '5 Card Draw',
    minPlayers: 1,
    maxPlayers: 1, // 1v1 vs Dealer

    usesCurrency: true,
    hasDealer: true, // Dealer plays against you
    resetPilesEachRound: true, // Fresh deck every hand

    // Config
    anteAmount: 10,

    buildPiles: function() {
        var deck = Pile.createFrom(StandardDeck, 1);
        deck.shuffle();
        return {
            deck: deck,
            discard: new Pile()
        };
    },

    getDealSequence: function(gameState) {
        // Deal 5 cards to player and dealer
        var seq = [];
        // Player
        seq.push({ from: 'deck', to: 'player1', toPlayer: true, count: 5, faceUp: true });
        // Dealer (Hidden)
        seq.push({ from: 'deck', to: 'dealer', toPlayer: true, count: 5, faceUp: false });
        return seq;
    },

    getAvailableActions: function(gameState, actorId) {
        if (actorId === 'dealer') return ['ai_play'];
        return ['draw_cards', 'fold'];
    },

    resolveAction: function(gameState, actorId, action, engine) {
        var result = { actions: [], nextState: null, nextActor: null };

        if (action === 'draw_cards') {
            // Logic: UI sends "discards" list via side-channel or we assume
            // the Engine's action payload contains data.
            // Since the Engine.submitAction doesn't easily support extra data in the standard signature,
            // we usually expect the UI to have ALREADY moved cards to discard pile
            // OR we add support for data.
            //
            // Hack for V1 Engine: UI calls engine.submitAction('player1', 'draw_cards')
            // BUT UI must have already updated the hand via direct Pile manipulation
            // or we define a custom action type.
            //
            // Better approach: The action payload in submitAction CAN be an object in refined engines,
            // but here it's string.
            //
            // Let's rely on the UI to `player.hand.give(...)` to discard pile BEFORE calling submitAction.
            // Then this rule just fills the hand back to 5.

            var player = engine._getActor(actorId);
            var needed = 5 - player.hand.count;

            if (needed > 0) {
                result.actions.push({
                    type: ActionType.DEAL,
                    from: 'deck',
                    to: actorId,
                    toPlayer: true,
                    count: needed,
                    faceUp: true
                });
            }

            // After player acts, it's AI turn (Dealer)
            result.nextActor = 'dealer';
        }
        else if (action === 'fold') {
            // Player gives up
             result.nextState = GameState.GAME_OVER;
             // No payout
        }

        return result;
    },

    getNextActor: function(gameState) {
        if (gameState.state === GameState.DEALING) {
            return 'player1';
        }
        return null;
    },

    getAiAction: function(gameState, dealer) {
        // AI Logic:
        // 1. Evaluate Hand
        // 2. Decide what to discard
        // 3. Execute discard (move to discard pile)
        // 4. Return 'draw_cards'

        // This is tricky because `getAiAction` returns a STRING.
        // It cannot execute side effects easily.
        // We will perform the side effects (discarding) HERE inside the getAiAction?
        // No, getAiAction is a query.

        // The Engine calls `getAiAction`, gets string, then calls `resolveAction`.
        // So `resolveAction` for Dealer must handle the discarding logic.
        return 'ai_play';
    },

    // Extended resolve for AI
    resolveAiAction: function(gameState, dealer, engine) {
        // 1. Evaluate
        var hand = dealer.hand.contents;
        var eval = PokerEvaluator.evaluate(hand);

        // 2. Strategy: Keep best component
        var toDiscard = [];

        // Simple Strategy:
        // If High Card -> Keep highest, discard 4
        // If Pair -> Keep Pair (and kickers if needed?), discard rest
        // etc.

        // Actually, let's use the 'kickers' and 'value' from Evaluator.
        // Evaluator returns best 5-card hand. But we want to improve it.
        // If we have a Pair, the Evaluator says "Pair of Kings".
        // We should keep the Kings and discard the rest.

        // Helper: Identification of Keepers
        var keepers = [];
        var rankCounts = {};
        hand.forEach(c => rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1);

        // Identify ranks to keep based on duplicates
        var keepRanks = [];
        Object.keys(rankCounts).forEach(r => {
            if (rankCounts[r] >= 2) keepRanks.push(r);
        });

        if (keepRanks.length > 0) {
            // Keep matching ranks (Pair, Two Pair, Trips, Quads, Full House)
            hand.forEach(c => {
                if (keepRanks.includes(c.rank)) keepers.push(c);
                else toDiscard.push(c);
            });
        } else {
            // High Card or Straight/Flush Draw
            // Simplify: Keep highest 2 cards if High Card
             // Sort by value
            var sorted = [...hand].sort((a,b) => RankValues[b.rank] - RankValues[a.rank]);
            keepers.push(sorted[0]);
            keepers.push(sorted[1]);
            toDiscard = [sorted[2], sorted[3], sorted[4]];
        }

        // 3. Execute Discard (Directly manipulate piles via engine helper logic?)
        // Since we are inside the Rule, we can access Piles?
        // No, we passed `engine`.

        var discardPile = engine.piles.discard;

        // Move cards from Dealer Hand to Discard
        toDiscard.forEach(card => {
             // Find index in hand
             var idx = dealer.hand.contents.indexOf(card);
             if (idx > -1) {
                 var c = dealer.hand.give(idx);
                 discardPile.receive(c);
             }
        });

        // 4. Return action to Deal replacements
        return {
            actions: [{
                type: ActionType.DEAL,
                from: 'deck',
                to: 'dealer',
                toPlayer: true,
                count: toDiscard.length,
                faceUp: true // Reveal AI cards on draw? No, usually hidden until showdown.
                // But Engine default deal logs it.
                // Let's set faceUp: false for Dealer
            }],
            nextState: GameState.RESOLUTION // Go to showdown
        };
    },

    // Override resolveAction to handle AI specific flow
    resolveAction: function(gameState, actorId, action, engine) {
        if (actorId === 'dealer' && action === 'ai_play') {
            return this.resolveAiAction(gameState, engine.dealer, engine);
        }

        // Player Logic (Standard)
        if (action === 'draw_cards') {
            var player = engine._getActor(actorId);
            var needed = 5 - player.hand.count;
            var actions = [];

            if (needed > 0) {
                actions.push({
                    type: ActionType.DEAL,
                    from: 'deck',
                    to: actorId,
                    toPlayer: true,
                    count: needed,
                    faceUp: true
                });
            }
            return { actions: actions, nextActor: 'dealer' }; // Pass to Dealer
        }

        return { nextActor: null };
    },

    resolveRound: function(gameState) {
        var player = gameState.players[0];
        var dealer = gameState.dealer;

        var pHand = player.hand.contents;
        var dHand = dealer.hand.contents;

        var pEval = PokerEvaluator.evaluate(pHand);
        var dEval = PokerEvaluator.evaluate(dHand);

        var comparison = PokerEvaluator.compare(pEval, dEval);

        // Outcomes
        // 1: Player Wins
        // -1: Dealer Wins
        // 0: Tie

        var results = [];
        var multiplier = 0;
        var outcome = 'lose';

        if (comparison === 1) {
            outcome = 'win';
            multiplier = 2; // Double money (Ante back + Win)
        } else if (comparison === 0) {
            outcome = 'push';
            multiplier = 1;
        }

        results.push({
            playerId: player.id,
            outcome: outcome,
            multiplier: multiplier,
            bet: player.currentBet,
            handName: pEval.name,
            dealerHandName: dEval.name
        });

        return {
            playerResults: results,
            dealerHand: dEval
        };
    },

    calculatePayouts: function(resolution, gameState) {
        return resolution.playerResults.map(function(r) {
            return {
                type: ActionType.PAYOUT,
                playerId: r.playerId,
                amount: Math.floor(r.bet * r.multiplier),
                outcome: r.outcome
            };
        });
    },

    // Need helper for AI rank values
    // Using the same object from PokerEvaluator if possible, or duplicated
};

// Quick Rank Value Map for AI
var RankValues = {
    'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5, 'SIX': 6,
    'SEVEN': 7, 'EIGHT': 8, 'NINE': 9, 'TEN': 10,
    'JACK': 11, 'QUEEN': 12, 'KING': 13, 'ACE': 14
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FiveCardDrawRuleset: FiveCardDrawRuleset };
}
