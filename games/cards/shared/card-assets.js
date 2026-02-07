/**
 * CardAssets.js
 * High-quality SVG-based procedural card renderer. ES5 Compatible.
 */

var CardAssets = {
    width: 200,
    height: 280,

    cache: {},
    isLoaded: false,

    colors: {
        red: '#e74c3c',
        black: '#2c3e50',
        white: '#fdfbf7',
        gold: '#f1c40f',
        royal: '#3498db',
        backBase: '#2c3e50',
        backAccent: '#34495e'
    },

    paths: {
        H: "M50,30 C50,15 35,0 25,0 C12,0 0,15 0,30 C0,55 50,90 50,90 C50,90 100,55 100,30 C100,15 88,0 75,0 C65,0 50,15 50,30 Z",
        D: "M50,0 L100,50 L50,100 L0,50 Z",
        C: "M50,10 C65,10 75,25 75,35 C75,45 65,55 55,55 L55,55 C65,55 80,55 85,70 C90,85 75,95 60,95 L40,95 C25,95 10,85 15,70 C20,55 35,55 45,55 L45,55 C35,55 25,45 25,35 C25,25 35,10 50,10 Z M50,55 L50,100",
        S: "M50,0 C50,0 100,40 100,65 C100,85 85,95 70,95 C55,95 50,75 50,75 C50,75 45,95 30,95 C15,95 0,85 0,65 C0,40 50,0 50,0 Z M50,75 L50,100",
        Crown: "M10,40 L30,10 L50,40 L70,10 L90,40 L90,60 L10,60 Z",
        FaceJ: "M20,20 L80,20 L50,80 Z",
        FaceQ: "M50,20 A30,30 0 1,0 50,80 A30,30 0 1,0 50,20",
        FaceK: "M20,20 L80,20 L80,80 L20,80 Z"
    },

    init: function () {
        if (this.isLoaded) return;

        var suits = ['H', 'D', 'C', 'S'];
        var ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        this.cache['BACK'] = this.createCardBack();

        for (var s = 0; s < suits.length; s++) {
            for (var r = 0; r < ranks.length; r++) {
                this.cache[ranks[r] + suits[s]] = this.createCardFace(ranks[r], suits[s]);
            }
        }

        this.isLoaded = true;
        console.log('[SVGCardAssets] Generated 53 High-Res textures (' + this.width + 'x' + this.height + ')');
    },

    getAsset: function (rank, suit) {
        if (!suit) return this.cache['BACK'];
        return this.cache[rank + suit] || this.cache['BACK'];
    },

    createCanvas: function () {
        var c = document.createElement('canvas');
        c.width = this.width;
        c.height = this.height;
        return c;
    },

    createCardBack: function () {
        var c = this.createCanvas();
        var ctx = c.getContext('2d');
        var w = this.width;
        var h = this.height;

        this.drawRoundedRect(ctx, 0, 0, w, h, 16, this.colors.white);

        var m = 12;
        this.drawRoundedRect(ctx, m, m, w - m * 2, h - m * 2, 10, this.colors.backBase);

        ctx.save();
        ctx.beginPath();
        ctx.rect(m, m, w - m * 2, h - m * 2);
        ctx.clip();

        ctx.strokeStyle = this.colors.backAccent;
        ctx.lineWidth = 4;
        var step = 30;

        for (var x = -h; x < w + h; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + h, h);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + h, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        ctx.fillStyle = this.colors.gold;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - 30);
        ctx.lineTo(w / 2 + 20, h / 2);
        ctx.lineTo(w / 2, h / 2 + 30);
        ctx.lineTo(w / 2 - 20, h / 2);
        ctx.fill();

        ctx.restore();
        return c;
    },

    createCardFace: function (rank, suit) {
        var c = this.createCanvas();
        var ctx = c.getContext('2d');
        var w = this.width;
        var h = this.height;
        var isRed = (suit === 'H' || suit === 'D');
        var color = isRed ? this.colors.red : this.colors.black;

        this.drawRoundedRect(ctx, 0, 0, w, h, 16, this.colors.white);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.stroke();

        var fontSize = rank === '10' ? 36 : 42;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        this.drawCorner(ctx, rank, suit, 25, 30, fontSize);

        ctx.save();
        ctx.translate(w, h);
        ctx.rotate(Math.PI);
        this.drawCorner(ctx, rank, suit, 25, 30, fontSize);
        ctx.restore();

        if (rank === 'J' || rank === 'Q' || rank === 'K') {
            this.drawFaceCardArt(ctx, rank, suit, w / 2, h / 2);
        } else if (rank === 'A') {
            this.drawPath(ctx, this.paths[suit], w / 2 - 35, h / 2 - 35, 70, 70, color);
        } else {
            this.drawPips(ctx, parseInt(rank), suit, w, h, color);
        }

        return c;
    },

    drawCorner: function (ctx, rank, suit, x, y, fontSize) {
        ctx.font = 'bold ' + fontSize + 'px "Segoe UI", sans-serif';
        ctx.fillText(rank, x, y);

        var pipSize = 24;
        this.drawPath(ctx, this.paths[suit], x - pipSize / 2, y + 25, pipSize, pipSize, ctx.fillStyle);
    },

    drawFaceCardArt: function (ctx, rank, suit, x, y) {
        var fw = 120;
        var fh = 160;
        var left = x - fw / 2;
        var top = y - fh / 2;

        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 4;
        ctx.strokeRect(left, top, fw, fh);

        ctx.fillStyle = '#fafafa';
        ctx.fillRect(left, top, fw, fh);

        var symbol = this.paths.Crown;
        var clr = this.colors.gold;

        if (rank === 'J') { symbol = this.paths.FaceJ; clr = this.colors.royal; }
        if (rank === 'Q') { symbol = this.paths.FaceQ; clr = this.colors.red; }
        if (rank === 'K') { symbol = this.paths.FaceK; clr = this.colors.black; }

        ctx.globalAlpha = 0.1;
        this.drawPath(ctx, this.paths[suit], left + 10, top + 30, fw - 20, fw - 20,
            (suit === 'H' || suit === 'D') ? this.colors.red : this.colors.black);
        ctx.globalAlpha = 1.0;

        this.drawPath(ctx, symbol, x - 30, y - 50, 60, 60, clr);

        ctx.fillStyle = clr;
        ctx.font = 'bold 60px serif';
        ctx.fillText(rank, x, y + 40);
    },

    drawPips: function (ctx, count, suit, w, h, color) {
        var layouts = {
            2: [[50, 20], [50, 80]],
            3: [[50, 20], [50, 50], [50, 80]],
            4: [[30, 20], [70, 20], [30, 80], [70, 80]],
            5: [[30, 20], [70, 20], [50, 50], [30, 80], [70, 80]],
            6: [[30, 20], [70, 20], [30, 50], [70, 50], [30, 80], [70, 80]],
            7: [[30, 20], [70, 20], [50, 35], [30, 50], [70, 50], [30, 80], [70, 80]],
            8: [[30, 20], [70, 20], [50, 35], [30, 50], [70, 50], [50, 65], [30, 80], [70, 80]],
            9: [[30, 20], [70, 20], [30, 40], [70, 40], [50, 50], [30, 60], [70, 60], [30, 80], [70, 80]],
            10: [[30, 20], [70, 20], [50, 30], [30, 45], [70, 45], [30, 65], [70, 65], [50, 70], [30, 80], [70, 80]]
        };

        var layout = layouts[count];
        if (!layout) return;

        var pipSize = 34;

        for (var i = 0; i < layout.length; i++) {
            var pos = layout[i];
            var px = (pos[0] / 100) * w;
            var py = (pos[1] / 100) * h;
            var isBottom = pos[1] > 50;

            ctx.save();
            ctx.translate(px, py);
            if (isBottom) ctx.rotate(Math.PI);
            this.drawPath(ctx, this.paths[suit], -pipSize / 2, -pipSize / 2, pipSize, pipSize, color);
            ctx.restore();
        }
    },

    drawPath: function (ctx, pathStr, x, y, w, h, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(w / 100, h / 100);
        ctx.fillStyle = color;
        var p = new Path2D(pathStr);
        ctx.fill(p);
        ctx.restore();
    },

    drawRoundedRect: function (ctx, x, y, w, h, r, fill) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
    }
};
