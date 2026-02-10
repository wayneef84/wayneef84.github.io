/**
 * games/solitaire/js/game.js
 * Solitaire UI Controller
 */

// Global State
var engine;
var selectedCard = null; // { card: Card, pileName: string, index: number }

window.onload = function() {
    console.log('Solitaire initializing...');

    // Initialize Assets
    CardAssets.init();

    // Initialize Engine
    engine = new GameEngine(KlondikeRuleset);

    // Subscribe to Events
    engine.on('*', handleEngineEvent);

    // Setup UI
    document.getElementById('btn-restart').onclick = startNewGame;

    // Resize Handler
    window.addEventListener('resize', resizeBoard);
    resizeBoard();

    // Start Game
    startNewGame();
};

function resizeBoard() {
    var board = document.getElementById('board');
    if (!board) return;

    var baseWidth = 1200; // Matches CSS max-width
    var scale = Math.min(window.innerWidth / baseWidth, 1);

    // Force layout width to ensure desktop-like layout before scaling
    if (scale < 1) {
        board.style.width = baseWidth + 'px';
        board.style.transformOrigin = 'top left';
    } else {
        board.style.width = ''; // Reset to CSS
        board.style.transformOrigin = 'top center';
    }

    // Add slight margin for mobile
    if (scale < 1) scale *= 0.95;

    board.style.transform = 'scale(' + scale + ')';

    // Center the scaled board
    if (scale < 1) {
        var scaledWidth = baseWidth * scale;
        var offset = (window.innerWidth - scaledWidth) / 2;
        board.style.position = 'absolute'; // Detach from flow to position
        board.style.left = offset + 'px';

        // Calculate header height dynamically or fallback
        var header = document.getElementById('header');
        var headerHeight = header ? header.offsetHeight : 70;

        board.style.top = headerHeight + 'px';
    } else {
        board.style.position = 'relative';
        board.style.left = '';
        board.style.top = '';
    }
}

function startNewGame() {
    engine.init([{ id: 'player1', type: 'human', name: 'Player' }]);
    engine.startRound();

    // Verify initial state
    render(engine.getGameState());
}

function handleEngineEvent(event) {
    console.log('[Event]', event.type, event);

    if (event.type === 'DEAL' || event.type === 'SHUFFLE' || event.type === 'MESSAGE' || event.type === 'STATE_CHANGE') {
        render(engine.getGameState());
    }

    if (event.type === 'ROUND_WIN') {
        alert('Congratulations! You won!');
    }
}

// ============================================================================
// RENDERING
// ============================================================================

function render(gameState) {
    var piles = gameState.piles;

    // Render each pile
    for (var pileName in piles) {
        var pile = piles[pileName];
        var el = document.getElementById(pileName); // e.g., 'tableau_1'
        if (!el) continue; // Skip unknown piles

        // Clear existing
        el.innerHTML = '';

        // Render cards
        for (var i = 0; i < pile.contents.length; i++) {
            var card = pile.contents[i];
            var isFaceUp = isCardFaceUp(pileName, i, pile);

            var cardEl = createCardElement(card, isFaceUp);

            // Positioning
            applyCardPosition(cardEl, pileName, i, isFaceUp);

            // Selection Highlight
            if (selectedCard && selectedCard.pileName === pileName && selectedCard.index === i) {
                cardEl.classList.add('selected');
            }

            // Click Handler
            (function(pName, idx, c) {
                cardEl.onclick = function(e) {
                    e.stopPropagation();
                    handleCardClick(pName, idx, c);
                };
            })(pileName, i, card);

            el.appendChild(cardEl);
        }

        // Pile Click Handler (for moving to empty pile)
        (function(pName) {
            el.onclick = function(e) {
                if (e.target === el) { // Only if clicking empty space
                    handlePileClick(pName);
                }
            };
        })(pileName);
    }
}

function isCardFaceUp(pileName, index, pile) {
    if (pileName === 'stock') return false;
    if (pileName === 'waste') return true;
    if (pileName.startsWith('foundation')) return true;
    if (pileName.startsWith('tableau')) {
        // Use faceUpIndex stored on pile
        var faceUpIdx = (pile.faceUpIndex !== undefined) ? pile.faceUpIndex : 0;
        return index >= faceUpIdx;
    }
    return true;
}

function createCardElement(card, isFaceUp) {
    var div = document.createElement('div');
    div.className = 'card';

    // Create a new canvas for this instance to avoid stealing the shared cached canvas
    var canvas = document.createElement('canvas');
    canvas.width = CardAssets.width;
    canvas.height = CardAssets.height;
    var ctx = canvas.getContext('2d');

    var sourceCanvas;

    if (isFaceUp) {
        div.classList.add('face-up');
        // Render Face
        var keys = card.getAssetKey();
        sourceCanvas = CardAssets.getAsset(keys[0], keys[1]);
    } else {
        div.classList.add('face-down');
        // Render Back
        sourceCanvas = CardAssets.getAsset(null, null); // Back
    }

    if (sourceCanvas) {
        ctx.drawImage(sourceCanvas, 0, 0);
    }

    div.appendChild(canvas);
    return div;
}

function applyCardPosition(el, pileName, index, isFaceUp) {
    // Default: Stacked (0,0)
    el.style.top = '0px';
    el.style.left = '0px';

    if (pileName.startsWith('tableau')) {
        // Vertical stack
        // Face down cards closer together
        // We need to know how many face down cards came before to calculate offset accurately
        // Simplified: Just use index
        var offset = index * 30;
        // Or adaptive:
        // Face down: 10px spacing
        // Face up: 30px spacing

        // We can't know accumulated height easily without loop.
        // Let's rely on simple formula for now.
        el.style.top = (index * 25) + 'px';
    }

    if (pileName === 'waste') {
        // Fan out last 3
        // Need to know pile count.
        // But render loop has access to index.
        // We want to show top 3.
        // Current rendered card is at `index`.
        // We don't have total count here easily inside loop without referencing pile.
        // Let's assume standard stack for now.
    }
}

// ============================================================================
// INTERACTION
// ============================================================================

function handleCardClick(pileName, index, card) {
    console.log('Clicked:', pileName, index, card.id);

    // 1. Stock Click -> Draw
    if (pileName === 'stock') {
        // If clicking stock, it's always a draw/recycle
        // Only top card matters? Actually any click on stock pile triggers action
        engine.submitAction('player1', 'draw_stock');
        selectedCard = null;
        return;
    }

    // 2. Selection Logic
    if (!selectedCard) {
        // Select logic
        // Only select Face Up cards (except Stock which is handled above)
        // Or empty pile (handled by handlePileClick)

        // Tableau: Can select any face up card (deep stack)
        // Waste: Can only select Top card? Klondike usually Top only from Waste.
        // Foundation: Can select Top card (to move back to tableau).

        var pile = engine.getGameState().piles[pileName];
        if (!isCardFaceUp(pileName, index, pile)) {
            // Clicked face down card
            // If it's the top card of tableau (shouldn't happen if logic correct), flip it?
            // Engine handles flip automatically on move.
            // But if we just dealt, top should be face up.
            // If face down card is clicked, ignore or auto-flip if top?
            return;
        }

        // For Waste/Foundation, strictly only top card?
        if (pileName === 'waste' || pileName.startsWith('foundation')) {
            if (index !== pile.count - 1) return;
        }

        // Select it
        selectedCard = { card: card, pileName: pileName, index: index };
        render(engine.getGameState()); // Re-render to show highlight
    } else {
        // Move Attempt
        // We clicked `card` (Target) while holding `selectedCard` (Source)

        if (selectedCard.pileName === pileName && selectedCard.index === index) {
            // Clicked same card -> Deselect
            selectedCard = null;
            render(engine.getGameState());
            return;
        }

        // Target is a card in a pile.
        // So we are moving Source -> Target's Pile.
        attemptMove(selectedCard, pileName);
    }
}

function handlePileClick(pileName) {
    console.log('Clicked Pile:', pileName);

    if (pileName === 'stock') {
        // If stock empty, this might be recycle
        // Check if stock is empty
        var state = engine.getGameState();
        if (state.piles.stock.count === 0) {
            engine.submitAction('player1', 'recycle_waste');
        }
        return;
    }

    if (selectedCard) {
        // Attempt move to empty pile
        attemptMove(selectedCard, pileName);
    }
}

function attemptMove(source, destPileName) {
    var srcPile = engine.getGameState().piles[source.pileName];

    // Calculate Count (Stack Size)
    // From source.index to top
    var count = srcPile.count - source.index;

    // Construct Action String
    var action = '';

    // Source: waste, foundation_X, tableau_X
    // Dest: foundation_X, tableau_X

    // Format: move_SOURCE_DEST_count_N

    var srcPart = source.pileName; // e.g., 'tableau_1'
    var destPart = destPileName;   // e.g., 'tableau_2'

    // Normalize source part if needed (already correct format)

    if (srcPile.name === 'waste') srcPart = 'waste'; // Just in case

    // Special Case: Waste/Foundation -> X (Always count 1)
    if (source.pileName === 'waste' || source.pileName.startsWith('foundation')) {
        count = 1;
        // Action format: move_waste_tableau_1
        action = 'move_' + source.pileName + '_' + destPileName;
    } else {
        // Tableau -> X
        if (destPileName.startsWith('foundation')) {
            // Can only move 1 card to foundation
            if (count > 1) {
                console.log('Cannot move stack to foundation');
                selectedCard = null;
                render(engine.getGameState());
                return;
            }
            action = 'move_' + source.pileName + '_' + destPileName;
        } else {
            // Tableau -> Tableau
            // If count > 1, append count
            if (count > 0) {
                // If count is 1, we can use either format? Ruleset generates both?
                // Ruleset generates `..._count_1`.
                // Let's check ruleset implementation.
                // It generates: `actions.push('move_tableau_' + tSrc + '_tableau_' + tDest + '_count_' + stackSize);`
                // So always append count for tableau-tableau moves.
                action = 'move_' + source.pileName + '_' + destPileName + '_count_' + count;
            }
        }
    }

    console.log('Submitting Action:', action);

    var success = engine.submitAction('player1', action);

    if (success) {
        selectedCard = null;
        // Render triggers automatically via event
    } else {
        console.log('Invalid Move');
        // Visual feedback? Shake?
        selectedCard = null;
        render(engine.getGameState());
    }
}
