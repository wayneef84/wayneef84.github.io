// games/jigsaw/js/input.js

var Input = (function() {

    var canvas, ctx, state;
    var draggingPiece = null;
    var dragOffsetX = 0;
    var dragOffsetY = 0;

    function init(c, s) {
        canvas = c;
        ctx = canvas.getContext('2d');
        state = s;

        // Mouse Events
        canvas.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        // Touch Events
        canvas.addEventListener('touchstart', handleStart, { passive: false });
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
    }

    function getPos(e) {
        var rect = canvas.getBoundingClientRect();
        var clientX, clientY;

        if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    function handleStart(e) {
        e.preventDefault();
        if (state.isComplete) return;

        var pos = getPos(e);
        var pieces = state.pieces;

        // Check loose pieces first (reverse order to pick top-most)
        // We only drag non-snapped pieces
        // Filter out snapped pieces?
        // Wait, standard jigsaw: snapped pieces are locked.

        var candidates = pieces.filter(function(p) { return !p.isSnapped; });

        // Sort by Z-index?
        // In Puzzle.draw, we draw loose pieces in order of array.
        // So last in array is top-most.
        // We should iterate backwards.

        for (var i = candidates.length - 1; i >= 0; i--) {
            var p = candidates[i];
            if (isPointInPiece(p, pos.x, pos.y)) {
                draggingPiece = p;
                p.isDragging = true;
                dragOffsetX = pos.x - p.x;
                dragOffsetY = pos.y - p.y;

                // Move to end of array to render on top
                var idx = state.pieces.indexOf(p);
                if (idx > -1) {
                    state.pieces.splice(idx, 1);
                    state.pieces.push(p);
                }

                // Redraw
                Puzzle.draw();
                return;
            }
        }
    }

    function handleMove(e) {
        if (!draggingPiece) return;
        e.preventDefault();

        var pos = getPos(e);
        var x = pos.x - dragOffsetX;
        var y = pos.y - dragOffsetY;

        // Clamp to canvas bounds (allowing some overflow)
        var margin = 50;
        x = Math.max(-margin, Math.min(canvas.width - draggingPiece.width + margin, x));
        y = Math.max(-margin, Math.min(canvas.height - draggingPiece.height + margin, y));

        draggingPiece.x = x;
        draggingPiece.y = y;

        Puzzle.draw();
    }

    function handleEnd(e) {
        if (!draggingPiece) return;
        // e.preventDefault(); // Might interfere with click events elsewhere if attached to window?

        draggingPiece.isDragging = false;

        // Check snap
        if (Puzzle.checkSnap(draggingPiece)) {
            // Snapped!
        }

        draggingPiece = null;
        Puzzle.draw();
    }

    function isPointInPiece(piece, x, y) {
        if (!piece.shape) return false;

        // Check bounding box first for performance
        if (x < piece.x || x > piece.x + piece.width + (piece.width * 0.5) || // Approximate with tabs
            y < piece.y || y > piece.y + piece.height + (piece.height * 0.5)) {
             // Basic rect check failure
             // But tabs stick out.
             // Bounding box should be generous.
             // Tabs are ~25% size.
             // Let's use a safe margin.
             var margin = Math.max(piece.width, piece.height) * 0.5;
             if (x < piece.x - margin || x > piece.x + piece.width + margin ||
                 y < piece.y - margin || y > piece.y + piece.height + margin) {
                 return false;
             }
        }

        // Precise check
        if (window.Path2D && piece.shape instanceof Path2D) {
            // Ensure context is in identity state
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            var hit = ctx.isPointInPath(piece.shape, x - piece.x, y - piece.y);
            ctx.restore();
            return hit;
        } else {
            return true;
        }
    }

    return {
        init: init
    };
})();
