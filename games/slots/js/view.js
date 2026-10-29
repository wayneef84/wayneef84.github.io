/**
 * Slots shared view parts: DOM helpers, the CSS 3D drum reels and the grid board.
 * No game maths here. Modes feed these with grids from the engine.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var V = S.view = {};
    var FACES = 12;
    var FACE_DEG = 360 / FACES;

    V.el = function (tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text !== undefined && text !== null) { n.textContent = text; }
        return n;
    };

    /** Put symbol idx of a theme into an element. Emoji as text, inline SVG as markup. */
    V.setGlyph = function (node, theme, idx) {
        var g = S.themes.glyphs(theme)[idx];
        if (typeof g === 'string' && g.indexOf('<svg') === 0) { node.innerHTML = g; } else { node.textContent = g; }
        node.setAttribute('data-sym', String(idx));
    };

    V.clear = function (node) {
        while (node.firstChild) { node.removeChild(node.firstChild); }
    };

    /** Fit a cols x rows block of square cells into a host. Returns the cell size in px. */
    V.fitCell = function (host, cols, rows, extraW, extraH, maxCell) {
        var w = Math.max(120, host.clientWidth - (extraW || 0));
        var h = Math.max(120, host.clientHeight - (extraH || 0));
        return Math.max(28, Math.floor(Math.min(w / cols, h / rows, maxCell || 96)));
    };

    /* ------------------------------------------------------------------ */
    /* Drum reels (real CSS 3D: each reel is a 12 sided prism)             */
    /* ------------------------------------------------------------------ */

    function ReelSet(host, opts) {
        this.cols = opts.cols;
        this.rows = 3;
        this.theme = null;
        this.grid = null;
        this.timers = [];
        this.spinning = false;
        this.pendingDone = null;
        this.root = V.el('div', 'reelset');
        this.root.style.setProperty('--cols', String(this.cols));
        this.reels = [];
        this.angle = [];
        this.front = [];
        this.faces = [];
        for (var c = 0; c < this.cols; c++) {
            var reel = V.el('div', 'reel');
            var win = V.el('div', 'reel-win');
            var drum = V.el('div', 'drum');
            var faces = [];
            for (var i = 0; i < FACES; i++) {
                var f = V.el('div', 'face');
                f.style.setProperty('--i', String(i));
                var g = V.el('span', 'g');
                f.appendChild(g);
                drum.appendChild(f);
                faces.push(f);
            }
            win.appendChild(drum);
            reel.appendChild(win);
            this.root.appendChild(reel);
            this.reels.push({ reel: reel, win: win, drum: drum });
            this.faces.push(faces);
            this.angle.push(0);
            this.front.push(0);
        }
        this.lineSvg = null;
        if (opts.centerMark) {
            this.root.appendChild(V.el('div', 'centermark left'));
            this.root.appendChild(V.el('div', 'centermark right'));
        }
        this.svgHost = V.el('div', 'lines');
        this.root.appendChild(this.svgHost);
        host.appendChild(this.root);
        this.applyAngles(false);
    }

    ReelSet.prototype.resize = function (cell) {
        this.cell = cell;
        this.root.style.setProperty('--cell', cell + 'px');
        this.root.style.setProperty('--R', (cell / 2 / Math.tan(Math.PI / FACES)).toFixed(2) + 'px');
    };

    ReelSet.prototype.applyAngles = function (animate, durations) {
        for (var c = 0; c < this.cols; c++) {
            var d = this.reels[c].drum;
            if (animate && durations) {
                d.style.transition = 'transform ' + durations[c] + 'ms cubic-bezier(0.12, 0.7, 0.2, 1)';
            } else {
                d.style.transition = 'none';
            }
            d.style.transform = 'translateZ(calc(var(--R) * -1)) rotateX(' + this.angle[c] + 'deg)';
        }
    };

    ReelSet.prototype.faceFor = function (c, row) {
        return this.faces[c][(((this.front[c] + row - 1) % FACES) + FACES) % FACES];
    };

    ReelSet.prototype.paint = function (grid, front) {
        if (!this.theme) { return; }
        for (var c = 0; c < this.cols; c++) {
            for (var r = 0; r < this.rows; r++) {
                var idx = (((front ? front[c] : this.front[c]) + r - 1) % FACES + FACES) % FACES;
                V.setGlyph(this.faces[c][idx].firstChild, this.theme, grid[c][r]);
            }
        }
    };

    ReelSet.prototype.fillRandom = function () {
        for (var c = 0; c < this.cols; c++) {
            for (var i = 0; i < FACES; i++) {
                V.setGlyph(this.faces[c][i].firstChild, this.theme, Math.floor(Math.random() * 6));
            }
        }
    };

    ReelSet.prototype.setTheme = function (theme) {
        this.theme = theme;
        this.fillRandom();
        if (this.grid) { this.paint(this.grid); }
    };

    /** Show a grid right now with no motion. */
    ReelSet.prototype.setGrid = function (grid) {
        this.stopTimers();
        this.grid = grid;
        this.clearWins();
        this.paint(grid);
    };

    ReelSet.prototype.stopTimers = function () {
        for (var i = 0; i < this.timers.length; i++) { clearTimeout(this.timers[i]); }
        this.timers = [];
    };

    ReelSet.prototype.clearWins = function () {
        var all = this.root.querySelectorAll('.face');
        for (var i = 0; i < all.length; i++) {
            all[i].classList.remove('win');
            all[i].classList.remove('dim');
        }
        this.root.classList.remove('has-wins');
        V.clear(this.svgHost);
    };

    /**
     * Spin so the reels end on `grid`. calm = short and gentle.
     * done() is called exactly once, also when skipped.
     */
    ReelSet.prototype.spin = function (grid, calm, done) {
        var self = this;
        this.stopTimers();
        this.clearWins();
        this.spinning = true;
        this.grid = grid;
        var durations = [];
        var newFront = [];
        var maxDur = 0;
        for (var c = 0; c < this.cols; c++) {
            var d = 4 + Math.floor(Math.random() * 5);
            var turns = calm ? 0 : 2 + c;
            newFront.push((((this.front[c] - d) % FACES) + FACES) % FACES);
            this.angle[c] -= turns * 360 + d * FACE_DEG;
            durations.push(calm ? 450 : 1500 + c * 380);
            if (durations[c] > maxDur) { maxDur = durations[c]; }
        }
        // The destination faces sit on the far side of the drum, so painting them now is invisible.
        this.paint(grid, newFront);
        this.front = newFront;
        this.root.classList.add('spinning');
        void this.root.offsetWidth; // flush styles so the transition starts from the old angle
        this.applyAngles(true, durations);
        this.pendingDone = function () {
            if (!self.spinning) { return; }
            self.spinning = false;
            self.pendingDone = null;
            self.stopTimers();
            self.root.classList.remove('spinning');
            self.applyAngles(false);
            done();
        };
        for (var k = 0; k < this.cols; k++) {
            (function (col) {
                self.timers.push(setTimeout(function () { S.sfx.play('stop'); }, durations[col]));
            })(k);
        }
        this.timers.push(setTimeout(function () { if (self.pendingDone) { self.pendingDone(); } }, maxDur + 60));
    };

    /** Finish a running spin immediately. Safe to call at any time. */
    ReelSet.prototype.skip = function () {
        if (this.spinning && this.pendingDone) { this.pendingDone(); }
    };

    /** wins: [{cells:[[col,row],...], line:index|undefined}] */
    ReelSet.prototype.showWins = function (wins, lines) {
        if (!wins.length) { return; }
        this.root.classList.add('has-wins');
        var all = this.root.querySelectorAll('.face');
        for (var i = 0; i < all.length; i++) { all[i].classList.add('dim'); }
        var NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 ' + this.cols + ' ' + this.rows);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');
        for (var w = 0; w < wins.length; w++) {
            var cells = wins[w].cells;
            for (var k = 0; k < cells.length; k++) {
                var f = this.faceFor(cells[k][0], cells[k][1]);
                f.classList.remove('dim');
                f.classList.add('win');
            }
            if (lines && wins[w].line !== undefined) {
                var pts = [];
                for (var c = 0; c < this.cols; c++) { pts.push((c + 0.5) + ',' + (lines[wins[w].line][c] + 0.5)); }
                var pl = document.createElementNS(NS, 'polyline');
                pl.setAttribute('points', pts.join(' '));
                pl.setAttribute('class', 'payline');
                svg.appendChild(pl);
            }
        }
        this.svgHost.appendChild(svg);
    };

    ReelSet.prototype.destroy = function () {
        this.stopTimers();
        this.spinning = false;
        this.pendingDone = null;
        if (this.root.parentNode) { this.root.parentNode.removeChild(this.root); }
    };

    V.ReelSet = ReelSet;

    /* ------------------------------------------------------------------ */
    /* Grid board (cascade and match-3)                                    */
    /* ------------------------------------------------------------------ */

    function Board(host, opts) {
        this.cols = opts.cols;
        this.rows = opts.rows;
        this.theme = null;
        this.timers = [];
        this.root = V.el('div', 'board');
        this.root.style.setProperty('--cols', String(this.cols));
        this.root.style.setProperty('--rows', String(this.rows));
        this.cells = [];
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.cols; c++) {
                var cell = V.el('div', 'tile');
                cell.appendChild(V.el('span', 'g'));
                this.root.appendChild(cell);
                if (!this.cells[c]) { this.cells[c] = []; }
                this.cells[c][r] = cell;
            }
        }
        this.badge = V.el('div', 'badge');
        this.badge.setAttribute('aria-hidden', 'true');
        this.root.appendChild(this.badge);
        host.appendChild(this.root);
    }

    Board.prototype.resize = function (cell) {
        this.root.style.setProperty('--cell', cell + 'px');
    };

    Board.prototype.later = function (fn, ms) {
        this.timers.push(setTimeout(fn, ms));
    };

    Board.prototype.stopTimers = function () {
        for (var i = 0; i < this.timers.length; i++) { clearTimeout(this.timers[i]); }
        this.timers = [];
    };

    Board.prototype.setTheme = function (theme) {
        this.theme = theme;
        if (this.grid) { this.setGrid(this.grid, false); }
    };

    /** Show a grid. drop = list of [col,row] to animate falling in (or true for all). */
    Board.prototype.setGrid = function (grid, drop) {
        this.grid = grid;
        if (!this.theme) { return; }
        for (var c = 0; c < this.cols; c++) {
            for (var r = 0; r < this.rows; r++) {
                var t = this.cells[c][r];
                t.className = 'tile';
                V.setGlyph(t.firstChild, this.theme, grid[c][r]);
                t.style.removeProperty('--d');
            }
        }
        if (drop) {
            var list = drop === true ? null : drop;
            for (var c2 = 0; c2 < this.cols; c2++) {
                for (var r2 = 0; r2 < this.rows; r2++) {
                    var go = !list;
                    if (list) { for (var k = 0; k < list.length; k++) { if (list[k][0] === c2 && list[k][1] === r2) { go = true; break; } } }
                    if (go) {
                        var tile = this.cells[c2][r2];
                        tile.style.setProperty('--d', String(c2 * 60 + (this.rows - r2) * 25) + 'ms');
                        tile.classList.add('drop');
                    }
                }
            }
        }
    };

    Board.prototype.mark = function (cells, cls) {
        var all = this.root.querySelectorAll('.tile');
        var i;
        for (i = 0; i < all.length; i++) { all[i].classList.add('dim'); }
        for (i = 0; i < cells.length; i++) {
            var t = this.cells[cells[i][0]][cells[i][1]];
            t.classList.remove('dim');
            t.classList.add(cls || 'win');
        }
    };

    Board.prototype.clearMarks = function () {
        var all = this.root.querySelectorAll('.tile');
        for (var i = 0; i < all.length; i++) {
            all[i].classList.remove('dim');
            all[i].classList.remove('win');
            all[i].classList.remove('vanish');
        }
    };

    Board.prototype.vanish = function (cells) {
        for (var i = 0; i < cells.length; i++) {
            var t = this.cells[cells[i][0]][cells[i][1]];
            t.classList.remove('win');
            t.classList.add('vanish');
        }
    };

    Board.prototype.setBadge = function (text) {
        this.badge.textContent = text || '';
        if (text) { this.badge.classList.add('show'); } else { this.badge.classList.remove('show'); }
    };

    Board.prototype.destroy = function () {
        this.stopTimers();
        if (this.root.parentNode) { this.root.parentNode.removeChild(this.root); }
    };

    V.Board = Board;
}());
