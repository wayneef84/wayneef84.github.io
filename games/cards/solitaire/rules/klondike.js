/**
 * games/solitaire/rules/klondike.js
 * Klondike Solitaire Ruleset for the Shared Card Engine.
 */

var KlondikeRuleset = {
    gameId: 'klondike',
    displayName: 'Klondike Solitaire',
    minPlayers: 1,
    maxPlayers: 1,
    usesCurrency: false,
    hasDealer: false,
    resetPilesEachRound: true,
    drawCount: 1,

    buildPiles: function() {
        var stock = Pile.createFrom(StandardDeck, 1);
        stock.shuffle();

        var piles = {
            stock: stock,
            waste: new Pile(),
            foundation_1: new Pile(),
            foundation_2: new Pile(),
            foundation_3: new Pile(),
            foundation_4: new Pile(),
            tableau_1: new Pile(),
            tableau_2: new Pile(),
            tableau_3: new Pile(),
            tableau_4: new Pile(),
            tableau_5: new Pile(),
            tableau_6: new Pile(),
            tableau_7: new Pile()
        };

        for (var i = 1; i <= 7; i++) {
            piles['tableau_' + i].faceUpIndex = 0;
        }

        return piles;
    },

    initializeGame: function(gameState) {
        // No specific pre-game setup beyond dealing
    },

    getDealSequence: function(gameState) {
        var sequence = [];
        for (var i = 1; i <= 7; i++) {
            sequence.push({
                from: 'stock',
                to: 'tableau_' + i,
                toPlayer: false,
                count: i,
                faceUp: false
            });
        }
        return sequence;
    },

    postDealSetup: function(gameState) {
        for (var i = 1; i <= 7; i++) {
            var pile = gameState.piles['tableau_' + i];
            pile.faceUpIndex = pile.count - 1;
        }
    },

    getNextActor: function(gameState) {
        if (this.checkWinCondition(gameState)) {
            return null;
        }
        return 'player1';
    },

    getAvailableActions: function(gameState, actorId) {
        var actions = [];
        var piles = gameState.piles;

        // 1. Stock Actions
        if (piles.stock.count > 0) {
            actions.push('draw_stock');
        } else if (piles.waste.count > 0) {
            actions.push('recycle_waste');
        }

        // 2. Waste -> Foundation / Tableau
        if (piles.waste.count > 0) {
            // Waste usually has access to top card (index count-1)
            var wasteCard = piles.waste.peek(piles.waste.count - 1);

            if (wasteCard) {
                for (var f = 1; f <= 4; f++) {
                    if (this._canMoveToFoundation(wasteCard, piles['foundation_' + f])) {
                        actions.push('move_waste_foundation_' + f);
                    }
                }
                for (var t = 1; t <= 7; t++) {
                    if (this._canMoveToTableau(wasteCard, piles['tableau_' + t])) {
                        actions.push('move_waste_tableau_' + t);
                    }
                }
            }
        }

        // 3. Foundation -> Tableau
        for (var f = 1; f <= 4; f++) {
            if (piles['foundation_' + f].count > 0) {
                // Foundation top is count-1
                var fCard = piles['foundation_' + f].peek(piles['foundation_' + f].count - 1);
                if (fCard) {
                    for (var t = 1; t <= 7; t++) {
                        if (this._canMoveToTableau(fCard, piles['tableau_' + t])) {
                            actions.push('move_foundation_' + f + '_tableau_' + t);
                        }
                    }
                }
            }
        }

        // 4. Tableau -> Foundation / Tableau
        for (var tSrc = 1; tSrc <= 7; tSrc++) {
            var tPile = piles['tableau_' + tSrc];
            if (tPile.count === 0) continue;

            var startIndex = (tPile.faceUpIndex !== undefined) ? tPile.faceUpIndex : 0;
            // Clamp startIndex
            if (startIndex >= tPile.count) startIndex = tPile.count - 1;
            if (startIndex < 0) startIndex = 0;

            for (var i = startIndex; i < tPile.count; i++) {
                var card = tPile.contents[i];
                var isTopCard = (i === tPile.count - 1);

                if (isTopCard) {
                    for (var f = 1; f <= 4; f++) {
                        if (this._canMoveToFoundation(card, piles['foundation_' + f])) {
                            actions.push('move_tableau_' + tSrc + '_foundation_' + f);
                        }
                    }
                }

                // Move Stack to Tableau
                for (var tDest = 1; tDest <= 7; tDest++) {
                    if (tSrc === tDest) continue;
                    if (this._canMoveToTableau(card, piles['tableau_' + tDest])) {
                         // Encoding stack size: count = (tPile.count - i)
                         var count = tPile.count - i;
                         actions.push('move_tableau_' + tSrc + '_tableau_' + tDest + '_count_' + count);
                    }
                }
            }
        }

        return actions;
    },

    resolveAction: function(gameState, actorId, action, engine) {
        var result = { actions: [], nextActor: 'player1' };
        var piles = gameState.piles;

        if (action === 'draw_stock') {
            // Stock 0=Top, N=Base? Or 0=Base, N=Top?
            // If Stock is [A, B, C].
            // If we assume standard Pile logic 0=Base.
            // But Engine DEAL takes 0.
            // If Engine assumes 0=Top.
            // Then Stock 0 IS Top.
            // So DEAL is correct.
            var count = Math.min(this.drawCount, piles.stock.count);
            result.actions.push({
                type: ActionType.DEAL,
                from: 'stock',
                to: 'waste',
                toPlayer: false,
                count: count,
                faceUp: true
            });
        }
        else if (action === 'recycle_waste') {
            // Waste 0=Base, N=Top.
            // Stock 0=Top, N=Base.
            // Move Waste 0 (Oldest) to Stock N (Base).
            // DEAL takes 0. Appends to N.
            // So it works perfectly for recycling (flipping).
            result.actions.push({
                type: ActionType.DEAL,
                from: 'waste',
                to: 'stock',
                toPlayer: false,
                count: piles.waste.count,
                faceUp: false
            });
        }
        else if (action.startsWith('move_waste_')) {
            var dest = action.split('move_waste_')[1];
            // Manual Move: Waste Top (End) -> Dest Top (End)
            var srcPile = piles.waste;
            var destPile = piles[dest];
            var card = srcPile.give(srcPile.count - 1); // Take from End
            destPile.receive(card, -1); // Append to End

            result.actions.push({ type: ActionType.MESSAGE, text: 'RENDER_UPDATE' });
        }
        else if (action.startsWith('move_foundation_')) {
            var parts = action.split('_');
            var fIdx = parts[2];
            var tIdx = parts[4];

            // Manual Move: Foundation Top (End) -> Tableau Top (End)
            var srcPile = piles['foundation_' + fIdx];
            var destPile = piles['tableau_' + tIdx];
            var card = srcPile.give(srcPile.count - 1);
            destPile.receive(card, -1);

            result.actions.push({ type: ActionType.MESSAGE, text: 'RENDER_UPDATE' });
        }
        else if (action.startsWith('move_tableau_')) {
            var parts = action.split('_');
            var srcIdx = parts[2];
            var destType = parts[3];
            var destIdx = parts[4];
            var count = 1;
            if (parts.length > 5 && parts[5] === 'count') {
                count = parseInt(parts[6]);
            }

            var destPileName = (destType === 'foundation') ? destType + '_' + destIdx : destType + '_' + destIdx;
            var srcPile = piles['tableau_' + srcIdx];
            var destPile = piles[destPileName];

            // Manual Move Stack
            // Take `count` cards from TOP (End of array).
            // Index 0 = Base. Index N = Top.
            var startIndex = srcPile.count - count;
            var movedCards = srcPile.contents.splice(startIndex, count);

            // Append to dest (End of array)
            var args = [destPile.count, 0].concat(movedCards);
            Array.prototype.splice.apply(destPile.contents, args);

            result.actions.push({
                type: ActionType.MESSAGE,
                text: 'RENDER_UPDATE'
            });
        }

        return result;
    },

    checkWinCondition: function(gameState) {
        // 1. Maintain FaceUp Indices (Side Effect)
        var isDealing = (gameState.state === 'DEALING');

        for (var i = 1; i <= 7; i++) {
            var pile = gameState.piles['tableau_' + i];

            if (isDealing) {
                // During initial deal, only the very top card should be face up
                if (pile.count > 0) {
                    pile.faceUpIndex = pile.count - 1;
                } else {
                    pile.faceUpIndex = 0;
                }
                continue;
            }

            if (pile.count > 0) {
                if (pile.faceUpIndex >= pile.count) {
                    pile.faceUpIndex = pile.count - 1;
                }
                // Ensure top card is always face up (Klondike rule: auto-flip)
                if (pile.faceUpIndex > pile.count - 1) {
                    pile.faceUpIndex = pile.count - 1;
                }
            } else {
                pile.faceUpIndex = 0;
            }
        }

        // 2. Check Win
        var allFull = true;
        for (var f = 1; f <= 4; f++) {
            if (gameState.piles['foundation_' + f].count !== 13) {
                allFull = false;
                break;
            }
        }

        if (allFull) {
            return {
                immediate: true,
                reason: 'All Foundations Full',
                winner: 'player1'
            };
        }

        return null;
    },

    resolveRound: function(gameState) {
        return [{ playerId: 'player1', outcome: 'win' }];
    },

    _canMoveToFoundation: function(card, foundationPile) {
        if (!card) return false;
        if (foundationPile.count === 0) {
            return card.rank === 'ACE';
        }
        // Top of foundation is at count-1
        var top = foundationPile.peek(foundationPile.count - 1);
        if (card.suit !== top.suit) return false;

        var rankOrder = ['ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
        var currentIdx = rankOrder.indexOf(top.rank);
        var nextIdx = rankOrder.indexOf(card.rank);
        return nextIdx === currentIdx + 1;
    },

    _canMoveToTableau: function(card, tableauPile) {
        if (!card) return false;
        if (tableauPile.count === 0) {
            return card.rank === 'KING';
        }
        // Top of tableau is at count-1
        var top = tableauPile.peek(tableauPile.count - 1);
        var isRed = function(s) { return s === 'HEARTS' || s === 'DIAMONDS'; };
        if (isRed(card.suit) === isRed(top.suit)) return false;

        var rankOrder = ['ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'];
        var currentIdx = rankOrder.indexOf(top.rank);
        var cardIdx = rankOrder.indexOf(card.rank);
        return currentIdx === cardIdx + 1;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KlondikeRuleset: KlondikeRuleset };
}
