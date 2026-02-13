// games/jigsaw/js/puzzle.js

var Puzzle = (function() {
    var state = {
        pieces: [],
        rows: 0,
        cols: 0,
        pieceWidth: 0,
        pieceHeight: 0,
        image: null,
        settings: {},
        startTime: 0,
        elapsedTime: 0,
        timerInterval: null,
        isComplete: false
    };

    var canvas = null;
    var ctx = null;

    // Constants
    var TAB_SIZE_RATIO = 0.25; // Size of tab relative to piece size

    function init(image, settings) {
        state.image = image;
        state.settings = settings || { rows: 5, cols: 8, jaggedness: 0.5, snapDistance: 20 };

        // Calculate grid
        // Ensure aspect ratio is maintained by cropping or fitting?
        // For simplicity, we fit the image into the canvas area, or resize canvas to fit image?
        // Let's resize canvas to fit image (scaled down if needed).

        canvas = document.getElementById('puzzle-canvas');
        ctx = canvas.getContext('2d');

        // Resize canvas to fit screen but keep image aspect ratio
        var maxWidth = window.innerWidth - 40;
        var maxHeight = window.innerHeight - 100;

        var imgRatio = image.width / image.height;
        var screenRatio = maxWidth / maxHeight;

        var renderWidth, renderHeight;

        if (imgRatio > screenRatio) {
            renderWidth = maxWidth;
            renderHeight = maxWidth / imgRatio;
        } else {
            renderHeight = maxHeight;
            renderWidth = maxHeight * imgRatio;
        }

        canvas.width = renderWidth;
        canvas.height = renderHeight;

        state.pieceWidth = renderWidth / state.settings.cols;
        state.pieceHeight = renderHeight / state.settings.rows;

        generatePieces();
        shufflePieces();

        state.startTime = Date.now();
        state.elapsedTime = 0;
        state.isComplete = false;

        startTimer();

        // Initial Draw
        draw();

        // Setup Input
        Input.init(canvas, state);
    }

    function generatePieces() {
        state.pieces = [];
        var rows = state.settings.rows;
        var cols = state.settings.cols;

        // Helper to get random edge type: 1 (tab) or -1 (blank)
        function randomEdge() {
            return Math.random() > 0.5 ? 1 : -1;
        }

        // 1. Define edges
        // verticalEdges[r][c] is the right edge of piece (r, c)
        // horizontalEdges[r][c] is the bottom edge of piece (r, c)
        var verticalEdges = [];
        var horizontalEdges = [];

        for (var r = 0; r < rows; r++) {
            verticalEdges[r] = [];
            for (var c = 0; c < cols - 1; c++) {
                verticalEdges[r][c] = randomEdge();
            }
        }

        for (var r = 0; r < rows - 1; r++) {
            horizontalEdges[r] = [];
            for (var c = 0; c < cols; c++) {
                horizontalEdges[r][c] = randomEdge();
            }
        }

        // 2. Create pieces
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var piece = {
                    id: r + '-' + c,
                    row: r,
                    col: c,
                    x: 0, // Current X (will be shuffled)
                    y: 0, // Current Y
                    correctX: c * state.pieceWidth,
                    correctY: r * state.pieceHeight,
                    width: state.pieceWidth,
                    height: state.pieceHeight,
                    edges: {
                        top: (r === 0) ? 0 : -horizontalEdges[r-1][c],
                        right: (c === cols - 1) ? 0 : verticalEdges[r][c],
                        bottom: (r === rows - 1) ? 0 : horizontalEdges[r][c],
                        left: (c === 0) ? 0 : -verticalEdges[r][c-1]
                    },
                    shape: null // Will generate path
                };

                piece.shape = generatePieceShape(piece);
                state.pieces.push(piece);
            }
        }
    }

    function generatePieceShape(piece) {
        // Returns a Path2D object
        var path = new Path2D();
        var w = piece.width;
        var h = piece.height;
        var jaggedness = state.settings.jaggedness || 0; // 0 to 1

        // Base points
        var x = 0, y = 0;
        path.moveTo(x, y);

        // Top Edge
        drawEdge(path, x, y, x + w, y, piece.edges.top, jaggedness);

        // Right Edge
        drawEdge(path, x + w, y, x + w, y + h, piece.edges.right, jaggedness);

        // Bottom Edge
        drawEdge(path, x + w, y + h, x, y + h, piece.edges.bottom, jaggedness);

        // Left Edge
        drawEdge(path, x, y + h, x, y, piece.edges.left, jaggedness);

        path.closePath();
        return path;
    }

    function drawEdge(path, x1, y1, x2, y2, type, jaggedness) {
        if (type === 0) {
            path.lineTo(x2, y2);
            return;
        }

        var dx = x2 - x1;
        var dy = y2 - y1;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx);

        var h = type * dist * TAB_SIZE_RATIO; // Height of the tab
        var w = dist / 3; // Width of the tab base

        // Function to transform local coordinates (lx, ly) to global coordinates
        function t(lx, ly) {
            // Apply jaggedness as random noise
            var noiseX = (Math.random() - 0.5) * jaggedness * (dist * 0.1);
            var noiseY = (Math.random() - 0.5) * jaggedness * (dist * 0.1);

            lx += noiseX;
            ly += noiseY;

            var rx = lx * Math.cos(angle) - ly * Math.sin(angle);
            var ry = lx * Math.sin(angle) + ly * Math.cos(angle);
            return { x: x1 + rx, y: y1 + ry };
        }

        // Standard Jigsaw Tab Shape (Cubic Bezier)
        // We use 3 curves:
        // 1. Shoulder to Top Left of Tab
        // 2. Top of Tab
        // 3. Top Right of Tab to Shoulder

        var xA = dist * 0.35; // Shoulder Start
        var xB = dist * 0.38; // Neck Start
        var xC = dist * 0.38; // Head Start
        var xD = dist * 0.62; // Head End
        var xE = dist * 0.62; // Neck End
        var xF = dist * 0.65; // Shoulder End

        var yNeck = h * 0.15;
        var yHead = h;

        // Points
        var p0 = t(xA, 0); // Shoulder Start

        var p1 = t(xC, yHead); // Top Left
        var p2 = t(xD, yHead); // Top Right

        var p3 = t(xF, 0); // Shoulder End

        // Control Points
        // Curve 1: Shoulder to Top Left
        var cp1_1 = t(xB, yNeck);
        var cp1_2 = t(xB - (dist*0.05), yHead * 0.8);

        // Curve 2: Top (Left to Right)
        var cp2_1 = t(xC + (dist*0.1), yHead + (dist*0.05));
        var cp2_2 = t(xD - (dist*0.1), yHead + (dist*0.05));

        // Curve 3: Top Right to Shoulder
        var cp3_1 = t(xE + (dist*0.05), yHead * 0.8);
        var cp3_2 = t(xE, yNeck);

        path.lineTo(p0.x, p0.y);
        path.bezierCurveTo(cp1_1.x, cp1_1.y, cp1_2.x, cp1_2.y, p1.x, p1.y);
        path.bezierCurveTo(cp2_1.x, cp2_1.y, cp2_2.x, cp2_2.y, p2.x, p2.y);
        path.bezierCurveTo(cp3_1.x, cp3_1.y, cp3_2.x, cp3_2.y, p3.x, p3.y);
        path.lineTo(x2, y2);
    }

    function shufflePieces() {
        var buffer = 50; // pixels padding
        var w = canvas.width - buffer*2;
        var h = canvas.height - buffer*2;

        state.pieces.forEach(function(p) {
            p.x = buffer + Math.random() * (w - p.width);
            p.y = buffer + Math.random() * (h - p.height);
            p.isDragging = false;
            p.isSnapped = false;
        });
    }

    function draw() {
        if (!ctx) return;
        Renderer.draw(ctx, state);
        if (!state.isComplete) {
            requestAnimationFrame(draw);
        }
    }

    function startTimer() {
        clearInterval(state.timerInterval);
        var timerEl = document.getElementById('timer');
        state.timerInterval = setInterval(function() {
            var now = Date.now();
            var diff = now - state.startTime + state.elapsedTime; // ms
            var sec = Math.floor(diff / 1000);
            var m = Math.floor(sec / 60);
            var s = sec % 60;
            timerEl.textContent = (m < 10 ? '0'+m : m) + ':' + (s < 10 ? '0'+s : s);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(state.timerInterval);
    }

    function checkSnap(piece) {
        var dist = Math.sqrt(Math.pow(piece.x - piece.correctX, 2) + Math.pow(piece.y - piece.correctY, 2));
        if (dist < state.settings.snapDistance) {
            piece.x = piece.correctX;
            piece.y = piece.correctY;
            piece.isSnapped = true;
            // Play snap sound?
            checkWin();
            return true;
        }
        return false;
    }

    function checkWin() {
        var allSnapped = state.pieces.every(function(p) { return p.isSnapped; });
        if (allSnapped) {
            state.isComplete = true;
            stopTimer();
            // Show Win Modal
            var timerEl = document.getElementById('timer');
            if (typeof App !== 'undefined') App.showWin(timerEl.textContent);
        }
    }

    function save() {
        var saveData = {
            pieces: state.pieces.map(function(p) {
                return { id: p.id, x: p.x, y: p.y, isSnapped: p.isSnapped };
            }),
            settings: state.settings,
            elapsedTime: Date.now() - state.startTime + state.elapsedTime,
            timestamp: new Date().toLocaleString()
        };
        Storage.save('state', saveData);
    }

    function load(image) {
        var savedState = Storage.load('state');
        if (!savedState) return;

        // Re-init with saved settings
        init(image, savedState.settings);

        // Restore piece positions
        savedState.pieces.forEach(function(sp) {
            var p = state.pieces.find(function(ip) { return ip.id === sp.id; });
            if (p) {
                p.x = sp.x;
                p.y = sp.y;
                p.isSnapped = sp.isSnapped;
            }
        });

        state.elapsedTime = savedState.elapsedTime;
        state.startTime = Date.now();
    }

    return {
        init: init,
        load: load,
        save: save,
        startTimer: startTimer,
        stopTimer: stopTimer,
        checkSnap: checkSnap,
        draw: draw, // Expose for loop? No, loop is internal.
        getState: function() { return state; }
    };
})();
