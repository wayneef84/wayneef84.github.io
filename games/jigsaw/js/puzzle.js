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
        isComplete: false,
        snappedCount: 0
    };

    var canvas = null;
    var ctx = null;
    var _onSnap = null;

    // Tab protrudes 28% of piece width/height — slightly bigger than before for visibility
    var TAB_SIZE_RATIO = 0.28;

    // --- Audio ---
    var _audioCtx = null;

    function getAudioCtx() {
        if (!_audioCtx) {
            try {
                _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {}
        }
        return _audioCtx;
    }

    function playSnapSound() {
        var ac = getAudioCtx();
        if (!ac) return;
        try {
            var osc  = ac.createOscillator();
            var gain = ac.createGain();
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1100, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(380, ac.currentTime + 0.06);
            gain.gain.setValueAtTime(0.18, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.13);
            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + 0.14);
        } catch (e) {}
    }

    // --- Init ---
    function init(image, settings) {
        state.image    = image;
        state.settings = settings || { rows: 5, cols: 8, jaggedness: 0.5, snapDistance: 20 };
        state.snappedCount = 0;

        canvas = document.getElementById('puzzle-canvas');
        ctx    = canvas.getContext('2d');

        // Fit canvas to screen while preserving image aspect ratio
        var maxWidth  = window.innerWidth  - 40;
        var maxHeight = window.innerHeight - 100;

        var imgRatio    = image.width / image.height;
        var screenRatio = maxWidth / maxHeight;

        var renderWidth, renderHeight;
        if (imgRatio > screenRatio) {
            renderWidth  = maxWidth;
            renderHeight = maxWidth / imgRatio;
        } else {
            renderHeight = maxHeight;
            renderWidth  = maxHeight * imgRatio;
        }

        canvas.width  = renderWidth;
        canvas.height = renderHeight;

        state.pieceWidth  = renderWidth  / state.settings.cols;
        state.pieceHeight = renderHeight / state.settings.rows;

        generatePieces();
        shufflePieces();

        state.startTime   = Date.now();
        state.elapsedTime = 0;
        state.isComplete  = false;

        startTimer();
        draw();
        Input.init(canvas, state);
    }

    // --- Piece generation ---
    function generatePieces() {
        state.pieces = [];
        var rows = state.settings.rows;
        var cols = state.settings.cols;

        function randomEdge() { return Math.random() > 0.5 ? 1 : -1; }

        var verticalEdges   = [];
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

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var piece = {
                    id:       r + '-' + c,
                    row:      r,
                    col:      c,
                    x:        0,
                    y:        0,
                    correctX: c * state.pieceWidth,
                    correctY: r * state.pieceHeight,
                    width:    state.pieceWidth,
                    height:   state.pieceHeight,
                    edges: {
                        top:    (r === 0)           ? 0 : -horizontalEdges[r-1][c],
                        right:  (c === cols - 1)    ? 0 :  verticalEdges[r][c],
                        bottom: (r === rows - 1)    ? 0 :  horizontalEdges[r][c],
                        left:   (c === 0)           ? 0 : -verticalEdges[r][c-1]
                    },
                    shape: null
                };
                piece.shape = generatePieceShape(piece);
                state.pieces.push(piece);
            }
        }
    }

    function generatePieceShape(piece) {
        var path = new Path2D();
        var w    = piece.width;
        var h    = piece.height;
        var jag  = state.settings.jaggedness || 0;

        var x = 0, y = 0;
        path.moveTo(x, y);

        drawEdge(path, x,     y,     x + w, y,     piece.edges.top,    jag);
        drawEdge(path, x + w, y,     x + w, y + h, piece.edges.right,  jag);
        drawEdge(path, x + w, y + h, x,     y + h, piece.edges.bottom, jag);
        drawEdge(path, x,     y + h, x,     y,     piece.edges.left,   jag);

        path.closePath();
        return path;
    }

    // --- Rounded Jigsaw Tab Shape ---
    //
    // Produces a classic jigsaw tab with:
    //   · zero-angle tangent entry/exit at shoulders (no hard corner)
    //   · a neck that NARROWS before the head
    //   · a round bulbous head — G1-continuous at all junctions
    //   · symmetric left / right profile
    //
    // type  1 = tab protrudes outward
    // type -1 = notch cuts inward (mirror of tab)
    //
    function drawEdge(path, x1, y1, x2, y2, type, jaggedness) {
        if (type === 0) {
            path.lineTo(x2, y2);
            return;
        }

        var dx    = x2 - x1;
        var dy    = y2 - y1;
        var dist  = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx);
        var h     = type * dist * TAB_SIZE_RATIO;  // signed height

        function t(along, perp) {
            var rx = along * Math.cos(angle) - perp * Math.sin(angle);
            var ry = along * Math.sin(angle) + perp * Math.cos(angle);
            return { x: x1 + rx, y: y1 + ry };
        }

        var E = dist;

        // Noise baked into structural points only (Path2D is static after generation)
        var tabCenter = E * 0.50 + (Math.random() - 0.5) * jaggedness * E * 0.06;
        var headYvar  = h * (1.0  + (Math.random() - 0.5) * jaggedness * 0.06);

        // Half-widths at each stage
        var shoulderHW = E * 0.19;    // where tab begins on flat edge
        var neckHW     = E * 0.075;   // narrow constriction
        var headHW     = E * 0.135;   // bulbous head

        // Heights
        var neckY    = h * 0.40;
        var headY    = headYvar;
        var headCapY = headY + type * E * 0.095;  // control point beyond head → round cap

        // X positions
        var sh1 = tabCenter - shoulderHW;
        var n1  = tabCenter - neckHW;
        var hL  = tabCenter - headHW;
        var hR  = tabCenter + headHW;
        var n2  = tabCenter + neckHW;
        var sh2 = tabCenter + shoulderHW;

        // Entry/exit points on the flat edge — bezier departs/arrives tangentially (no hard corner)
        var entryL = t(sh1 - E * 0.04, 0);
        var entryR = t(sh2 + E * 0.04, 0);

        var pN1 = t(n1, neckY);
        var pHL = t(hL, headY);
        var pHR = t(hR, headY);
        var pN2 = t(n2, neckY);

        // ---- Bezier control points ----
        // [A] Smooth entry → left neck
        //     cp1 ON flat edge → zero departure angle (no shoulder kink)
        var cA1 = t(sh1 + E * 0.055, 0);
        var cA2 = t(n1  - E * 0.022, neckY * 0.65);

        // [B] Left neck → head-left
        //     cp2 DIRECTLY BELOW pHL → vertical approach → G1 continuity with head arc
        var cB1 = t(n1  - E * 0.010, neckY + (headY - neckY) * 0.52);
        var cB2 = t(hL,              headY * 0.85);

        // [C] Head arc: left → right (both CPs directly above → collinear with cB2 and cD1)
        var cC1 = t(hL, headCapY);
        var cC2 = t(hR, headCapY);

        // [D] Head-right → right neck
        //     cp1 DIRECTLY BELOW pHR → vertical departure → G1 continuity with head arc
        var cD1 = t(hR,              headY * 0.85);
        var cD2 = t(n2  + E * 0.010, neckY + (headY - neckY) * 0.52);

        // [E] Right neck → smooth exit
        //     cp2 ON flat edge → zero arrival angle (no shoulder kink)
        var cE1 = t(n2  + E * 0.022, neckY * 0.65);
        var cE2 = t(sh2 - E * 0.055, 0);

        // Draw — entry via flat point (smooth departure), no lineTo to shoulder
        path.lineTo(entryL.x, entryL.y);
        path.bezierCurveTo(cA1.x, cA1.y, cA2.x, cA2.y, pN1.x, pN1.y);
        path.bezierCurveTo(cB1.x, cB1.y, cB2.x, cB2.y, pHL.x, pHL.y);
        path.bezierCurveTo(cC1.x, cC1.y, cC2.x, cC2.y, pHR.x, pHR.y);
        path.bezierCurveTo(cD1.x, cD1.y, cD2.x, cD2.y, pN2.x, pN2.y);
        path.bezierCurveTo(cE1.x, cE1.y, cE2.x, cE2.y, entryR.x, entryR.y);
        path.lineTo(x2, y2);
    }

    // --- Shuffle ---
    function shufflePieces() {
        var buffer = 50;
        var w = canvas.width  - buffer * 2;
        var h = canvas.height - buffer * 2;

        state.pieces.forEach(function(p) {
            p.x         = buffer + Math.random() * (w - p.width);
            p.y         = buffer + Math.random() * (h - p.height);
            p.isDragging = false;
            p.isSnapped  = false;
        });
    }

    // --- Draw loop ---
    function draw() {
        if (!ctx) return;
        Renderer.draw(ctx, state);
        if (!state.isComplete) {
            requestAnimationFrame(draw);
        }
    }

    // --- Timer ---
    function startTimer() {
        clearInterval(state.timerInterval);
        var timerEl = document.getElementById('timer');
        state.timerInterval = setInterval(function() {
            var diff = Date.now() - state.startTime + state.elapsedTime;
            var sec  = Math.floor(diff / 1000);
            var m    = Math.floor(sec / 60);
            var s    = sec % 60;
            timerEl.textContent = (m < 10 ? '0'+m : m) + ':' + (s < 10 ? '0'+s : s);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(state.timerInterval);
    }

    // --- Snap ---
    function checkSnap(piece) {
        var dx = piece.x - piece.correctX;
        var dy = piece.y - piece.correctY;
        if (Math.sqrt(dx * dx + dy * dy) < state.settings.snapDistance) {
            piece.x        = piece.correctX;
            piece.y        = piece.correctY;
            piece.isSnapped = true;
            state.snappedCount++;
            playSnapSound();
            if (_onSnap) _onSnap(state.snappedCount, state.pieces.length);
            checkWin();
            return true;
        }
        return false;
    }

    function checkWin() {
        var allSnapped = true;
        for (var i = 0; i < state.pieces.length; i++) {
            if (!state.pieces[i].isSnapped) { allSnapped = false; break; }
        }
        if (allSnapped) {
            state.isComplete = true;
            stopTimer();
            var timerEl = document.getElementById('timer');
            if (typeof App !== 'undefined') App.showWin(timerEl.textContent);
        }
    }

    // --- Persistence ---
    function save() {
        var saveData = {
            pieces: state.pieces.map(function(p) {
                return { id: p.id, x: p.x, y: p.y, isSnapped: p.isSnapped };
            }),
            settings:    state.settings,
            elapsedTime: Date.now() - state.startTime + state.elapsedTime,
            timestamp:   new Date().toLocaleString()
        };
        Storage.save('state', saveData);
    }

    function load(image) {
        var savedState = Storage.load('state');
        if (!savedState) return;
        init(image, savedState.settings);
        savedState.pieces.forEach(function(sp) {
            for (var i = 0; i < state.pieces.length; i++) {
                if (state.pieces[i].id === sp.id) {
                    state.pieces[i].x        = sp.x;
                    state.pieces[i].y        = sp.y;
                    state.pieces[i].isSnapped = sp.isSnapped;
                    if (sp.isSnapped) state.snappedCount++;
                    break;
                }
            }
        });
        state.elapsedTime = savedState.elapsedTime;
        state.startTime   = Date.now();
    }

    // --- Public API ---
    return {
        init:        init,
        load:        load,
        save:        save,
        draw:        draw,
        startTimer:  startTimer,
        stopTimer:   stopTimer,
        checkSnap:   checkSnap,
        getState:    function() { return state; },

        // Stop draw loop and timer (called by App.showSetup)
        stop: function() {
            stopTimer();
            state.isComplete = true;
        },

        // Delegate hint toggle to Renderer (app.js calls Puzzle.toggleHint)
        toggleHint: function(val) {
            if (typeof Renderer !== 'undefined') Renderer.toggleHint(val);
        },

        // Register a callback: fn(snappedCount, totalPieces)
        setOnSnap: function(fn) { _onSnap = fn; }
    };
})();
