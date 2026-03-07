// games/jigsaw/js/renderer.js

var Renderer = (function() {

    var showHint = false;

    function draw(ctx, state) {
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw Hint
        if (showHint && state.image) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            var renderW = state.pieceWidth * state.settings.cols;
            var renderH = state.pieceHeight * state.settings.rows;
            ctx.drawImage(state.image, 0, 0, state.image.width, state.image.height, 0, 0, renderW, renderH);
            ctx.restore();
        }

        // Draw Border
        ctx.save();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        var boardW = state.pieceWidth * state.settings.cols;
        var boardH = state.pieceHeight * state.settings.rows;
        ctx.strokeRect(0, 0, boardW, boardH);
        ctx.restore();

        // Sort pieces: Snapped (bottom), Loose (middle), Dragged (top)
        var snapped = [];
        var loose = [];
        var dragged = null;

        // Use a simple loop for ES5 compatibility
        for (var i = 0; i < state.pieces.length; i++) {
            var p = state.pieces[i];
            if (p.isDragging) dragged = p;
            else if (p.isSnapped) snapped.push(p);
            else loose.push(p);
        }

        // Ghost placement hint — dashed outline at correct position while dragging
        if (dragged && dragged.shape) {
            ctx.save();
            ctx.translate(dragged.correctX, dragged.correctY);
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = dragged.isNearSnap
                ? 'rgba(0, 255, 120, 0.85)'
                : 'rgba(255, 255, 255, 0.25)';
            ctx.stroke(dragged.shape);
            ctx.setLineDash([]);
            ctx.restore();
        }

        // Draw Snapped
        for (var i = 0; i < snapped.length; i++) drawPiece(ctx, snapped[i], state);

        // Draw Loose
        for (var i = 0; i < loose.length; i++) drawPiece(ctx, loose[i], state);

        // Draw Dragged — lift effect + shadow; green glow when near snap zone
        if (dragged) {
            ctx.save();
            var LIFT = 1.05;
            var cx = dragged.x + dragged.width  / 2;
            var cy = dragged.y + dragged.height / 2;
            ctx.translate(cx, cy);
            ctx.scale(LIFT, LIFT);
            ctx.translate(-cx, -cy);
            if (dragged.isNearSnap) {
                ctx.shadowColor   = 'rgba(0, 255, 120, 0.90)';
                ctx.shadowBlur    = 22;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            } else {
                ctx.shadowColor    = 'rgba(0, 0, 0, 0.65)';
                ctx.shadowBlur     = 24;
                ctx.shadowOffsetX  = 10;
                ctx.shadowOffsetY  = 10;
            }
            drawPiece(ctx, dragged, state);
            ctx.restore();
        }
    }

    function drawPiece(ctx, piece, state) {
        if (!piece.shape) return;

        ctx.save();
        ctx.translate(piece.x, piece.y);

        // Clip to the piece shape
        // Check for Path2D support
        if (window.Path2D && piece.shape instanceof Path2D) {
            ctx.clip(piece.shape);
        } else {
             // Fallback if shape is not Path2D (unlikely given puzzle.js, but good for safety)
             // or if Path2D is not supported but puzzle.js generated something else?
             // puzzle.js generates Path2D. If not supported, it would have crashed earlier.
             // So we assume it works.
             ctx.clip(piece.shape);
        }

        // Draw Image Part
        var img = state.image;
        var pw = state.pieceWidth;
        var ph = state.pieceHeight;

        // Calculate scaling from screen to image
        var scaleX = img.width / (state.settings.cols * pw);
        var scaleY = img.height / (state.settings.rows * ph);

        // Calculate the source rectangle (in image coordinates)
        // piece.col * pw is the screen x of the cell's top-left.
        // We need to cover the tabs, so we add padding.
        var padX = pw * 0.4;
        var padY = ph * 0.4;

        // Source rectangle in Image Coords
        var srcX = (piece.col * pw - padX) * scaleX;
        var srcY = (piece.row * ph - padY) * scaleY;
        var srcW = (pw + padX * 2) * scaleX;
        var srcH = (ph + padY * 2) * scaleY;

        // Destination rectangle in Context Coords (relative to piece.x, piece.y)
        var dstX = -padX;
        var dstY = -padY;
        var dstW = pw + padX * 2;
        var dstH = ph + padY * 2;

        safeDrawImage(ctx, img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);

        // Stroke border
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        if (window.Path2D && piece.shape instanceof Path2D) {
            ctx.stroke(piece.shape);
        } else {
            ctx.stroke(piece.shape);
        }

        // Highlight
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke(piece.shape);

        ctx.restore();
    }

    function safeDrawImage(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
        // Original ratios
        var ratioX = dw / sw;
        var ratioY = dh / sh;

        // Clamp Left
        if (sx < 0) {
            var diff = -sx;
            sx = 0;
            sw -= diff;
            dx += diff * ratioX;
            dw -= diff * ratioX;
        }

        // Clamp Top
        if (sy < 0) {
            var diff = -sy;
            sy = 0;
            sh -= diff;
            dy += diff * ratioY;
            dh -= diff * ratioY;
        }

        // Clamp Right
        if (sx + sw > img.width) {
            var diff = (sx + sw) - img.width;
            sw -= diff;
            dw -= diff * ratioX;
        }

        // Clamp Bottom
        if (sy + sh > img.height) {
            var diff = (sy + sh) - img.height;
            sh -= diff;
            dh -= diff * ratioY;
        }

        // Check if anything to draw
        if (sw <= 0.1 || sh <= 0.1 || dw <= 0.1 || dh <= 0.1) return;

        try {
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        } catch (e) {
            // Ignore index errors if clamping failed slightly due to rounding
        }
    }

    return {
        draw: draw,
        toggleHint: function(val) { showHint = val; }
    };
})();
