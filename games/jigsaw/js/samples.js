/**
 * F.O.N.G. Jigsaw - samples.js
 * Built-in pictures, drawn here with canvas shapes. All art is original
 * (no characters, no licensed work, no image files). Each scene is drawn
 * at 1200 x 900 from a fixed seed, so it is the same every time.
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw = root.FongJigsaw || {};
    var W = 1200, H = 900;

    function mkRng(seed) { return NS.Geometry.makeRng(seed); }

    function grad(c, x0, y0, x1, y1, stops) {
        var g = c.createLinearGradient(x0, y0, x1, y1), i;
        for (i = 0; i < stops.length; i++) { g.addColorStop(stops[i][0], stops[i][1]); }
        return g;
    }
    function rad(c, x, y, r0, r1, stops) {
        var g = c.createRadialGradient(x, y, r0, x, y, r1), i;
        for (i = 0; i < stops.length; i++) { g.addColorStop(stops[i][0], stops[i][1]); }
        return g;
    }
    function ell(c, x, y, rx, ry, fill, rot) {
        c.beginPath();
        c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
        c.fillStyle = fill; c.fill();
    }
    function circ(c, x, y, r, fill) { ell(c, x, y, r, r, fill, 0); }
    function rrect(c, x, y, w, h, r, fill) {
        c.beginPath();
        c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y);
        c.closePath(); c.fillStyle = fill; c.fill();
    }
    function poly(c, pts, fill) {
        var i;
        c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
        for (i = 1; i < pts.length; i++) { c.lineTo(pts[i][0], pts[i][1]); }
        c.closePath(); c.fillStyle = fill; c.fill();
    }
    function line(c, x0, y0, x1, y1, w, col) {
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1);
        c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'round'; c.stroke();
    }
    function cloud(c, x, y, s, col) {
        col = col || 'rgba(255,255,255,0.95)';
        circ(c, x, y, 38 * s, col); circ(c, x + 40 * s, y - 18 * s, 48 * s, col);
        circ(c, x + 88 * s, y, 40 * s, col); rrect(c, x - 36 * s, y, 160 * s, 40 * s, 20 * s, col);
    }
    function star(c, x, y, r, fill, pts) {
        pts = pts || 5;
        var i, a, rr;
        c.beginPath();
        for (i = 0; i < pts * 2; i++) {
            a = -Math.PI / 2 + i * Math.PI / pts; rr = i % 2 ? r * 0.45 : r;
            if (i === 0) { c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } else { c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        }
        c.closePath(); c.fillStyle = fill; c.fill();
    }
    function face(c, x, y, s, eyeGap) {
        circ(c, x - eyeGap * s, y, 7 * s, '#2b2140'); circ(c, x + eyeGap * s, y, 7 * s, '#2b2140');
        circ(c, x - eyeGap * s + 2 * s, y - 2 * s, 2.5 * s, '#fff'); circ(c, x + eyeGap * s + 2 * s, y - 2 * s, 2.5 * s, '#fff');
        c.beginPath(); c.arc(x, y + 8 * s, 12 * s, 0.15 * Math.PI, 0.85 * Math.PI);
        c.lineWidth = 3.5 * s; c.strokeStyle = '#2b2140'; c.lineCap = 'round'; c.stroke();
    }
    function sun(c, x, y, r) {
        c.fillStyle = rad(c, x, y, r * 0.4, r * 2.6, [[0, 'rgba(255,240,150,0.9)'], [1, 'rgba(255,240,150,0)']]);
        c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
        circ(c, x, y, r, '#ffd94a'); circ(c, x, y, r * 0.8, '#ffe97a');
    }
    function flower(c, x, y, s, petal, mid) {
        var i;
        line(c, x, y, x, y + 70 * s, 5 * s, '#4aa04a');
        for (i = 0; i < 6; i++) {
            ell(c, x + Math.cos(i * 1.047) * 14 * s, y + Math.sin(i * 1.047) * 14 * s, 11 * s, 11 * s, petal, 0);
        }
        circ(c, x, y, 9 * s, mid);
    }

    // ------------------------------------------------------------------ scenes

    function unicorn(c) {
        var r = mkRng(11), i;
        c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#9fdcff'], [0.6, '#d9f1ff'], [1, '#ffe6f4']]); c.fillRect(0, 0, W, H);
        sun(c, 1040, 130, 62);
        var cols = ['#ff5c6c', '#ff9a4d', '#ffd84a', '#5fd36b', '#4fb5ff', '#7a6cff', '#c26bff'];
        for (i = 0; i < 7; i++) {
            c.beginPath(); c.arc(600, 700, 560 - i * 26, Math.PI, 0);
            c.lineWidth = 28; c.strokeStyle = cols[i]; c.stroke();
        }
        cloud(c, 90, 600, 1.4); cloud(c, 1000, 640, 1.5); cloud(c, 150, 190, 1.1); cloud(c, 520, 120, 0.9);
        c.fillStyle = '#a8e69a'; c.beginPath(); c.moveTo(0, 640);
        c.bezierCurveTo(250, 520, 450, 700, 700, 600); c.bezierCurveTo(900, 520, 1050, 640, 1200, 580);
        c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        c.fillStyle = '#79d36f'; c.beginPath(); c.moveTo(0, 740);
        c.bezierCurveTo(300, 660, 600, 800, 900, 700); c.bezierCurveTo(1050, 660, 1150, 720, 1200, 700);
        c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        var fc = ['#ff6fa8', '#ffd34a', '#ffffff', '#ff9a4d', '#b58bff'];
        for (i = 0; i < 40; i++) { flower(c, r() * W, 720 + r() * 120, 0.5 + r() * 0.5, fc[Math.floor(r() * fc.length)], '#fff1a8'); }
        // unicorn
        ell(c, 720, 150, 0, 0, '#fff', 0);
        var X = 600, Y = 560;
        ell(c, X + 10, Y + 150, 170, 18, 'rgba(40,90,40,0.25)', 0);
        // tail
        var tc = ['#ff7ab8', '#ffb14d', '#ffe14d', '#7be07b', '#59b8ff', '#9a7bff'];
        for (i = 0; i < 6; i++) {
            c.beginPath(); c.moveTo(X + 150, Y - 20);
            c.bezierCurveTo(X + 280 + i * 6, Y - 60 + i * 10, X + 300 + i * 8, Y + 60 + i * 12, X + 210 + i * 4, Y + 140 - i * 4);
            c.lineWidth = 16; c.strokeStyle = tc[i]; c.lineCap = 'round'; c.stroke();
        }
        // back legs, body, front legs
        rrect(c, X + 70, Y + 30, 46, 120, 20, '#f2e9ff'); rrect(c, X + 130, Y + 30, 46, 120, 20, '#ffffff');
        ell(c, X, Y, 190, 105, '#ffffff', 0);
        ell(c, X - 20, Y + 40, 150, 55, '#f3ebff', 0);
        rrect(c, X - 130, Y + 30, 46, 122, 20, '#f2e9ff'); rrect(c, X - 70, Y + 30, 46, 122, 20, '#ffffff');
        for (i = 0; i < 4; i++) { rrect(c, [X - 130, X - 70, X + 70, X + 130][i], Y + 135, 46, 20, 9, '#ffb8d9'); }
        // neck + head
        poly(c, [[X - 120, Y - 60], [X - 220, Y - 190], [X - 120, Y - 215], [X - 40, Y - 60]], '#ffffff');
        ell(c, X - 230, Y - 200, 85, 62, '#ffffff', -0.25);
        ell(c, X - 290, Y - 180, 40, 30, '#ffe3f1', -0.25);
        poly(c, [[X - 210, Y - 250], [X - 190, Y - 310], [X - 165, Y - 245]], '#ffffff');
        poly(c, [[X - 203, Y - 252], [X - 190, Y - 292], [X - 176, Y - 248]], '#ffc1dc');
        // horn
        poly(c, [[X - 262, Y - 240], [X - 228, Y - 350], [X - 200, Y - 245]], '#ffd84a');
        line(c, X - 253, Y - 262, X - 214, Y - 270, 5, '#ff9a4d'); line(c, X - 246, Y - 295, X - 218, Y - 300, 5, '#ff9a4d');
        // mane
        var mc = ['#ff7ab8', '#ffb14d', '#ffe14d', '#7be07b', '#59b8ff', '#9a7bff'];
        for (i = 0; i < 6; i++) {
            c.beginPath(); c.moveTo(X - 200 + i * 10, Y - 245 + i * 6);
            c.bezierCurveTo(X - 120 + i * 10, Y - 250, X - 70 + i * 16, Y - 160 + i * 12, X - 90 + i * 14, Y - 40 + i * 6);
            c.lineWidth = 16; c.strokeStyle = mc[i]; c.stroke();
        }
        circ(c, X - 245, Y - 210, 11, '#3a2a63'); circ(c, X - 241, Y - 214, 4, '#fff');
        circ(c, X - 215, Y - 176, 16, 'rgba(255,120,170,0.45)');
        c.beginPath(); c.arc(X - 285, Y - 168, 14, 0.2, 1.2); c.lineWidth = 4; c.strokeStyle = '#d65a96'; c.stroke();
        for (i = 0; i < 9; i++) { star(c, 80 + r() * 1040, 60 + r() * 420, 8 + r() * 10, 'rgba(255,255,255,0.9)', 4); }
    }

    function reef(c) {
        var r = mkRng(22), i;
        c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#38c6e8'], [0.5, '#1479b8'], [1, '#0a2f66']]); c.fillRect(0, 0, W, H);
        for (i = 0; i < 6; i++) {
            c.fillStyle = 'rgba(255,255,255,0.07)';
            poly(c, [[100 + i * 200, 0], [180 + i * 200, 0], [60 + i * 200 + 120, 700], [i * 200 - 40, 700]], c.fillStyle);
        }
        // sand
        c.fillStyle = '#f2d391'; c.beginPath(); c.moveTo(0, 760);
        c.bezierCurveTo(300, 700, 600, 800, 900, 730); c.bezierCurveTo(1050, 700, 1150, 740, 1200, 720);
        c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        // seaweed
        for (i = 0; i < 9; i++) {
            var sx = 40 + i * 140 + r() * 40, sh = 160 + r() * 140;
            c.beginPath(); c.moveTo(sx, 790);
            c.bezierCurveTo(sx - 40, 790 - sh * 0.4, sx + 40, 790 - sh * 0.7, sx, 790 - sh);
            c.lineWidth = 16; c.strokeStyle = i % 2 ? '#2fbf71' : '#1f9f62'; c.lineCap = 'round'; c.stroke();
        }
        // coral
        function coral(x, y, col, n) {
            var k;
            for (k = 0; k < n; k++) {
                var a = -Math.PI / 2 + (k - (n - 1) / 2) * 0.5, len = 110 + r() * 60;
                var ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
                line(c, x, y, ex, ey, 22, col);
                circ(c, ex, ey, 17, col);
                line(c, ex, ey, ex + Math.cos(a - 0.6) * 50, ey + Math.sin(a - 0.6) * 50, 14, col);
                line(c, ex, ey, ex + Math.cos(a + 0.6) * 50, ey + Math.sin(a + 0.6) * 50, 14, col);
            }
        }
        coral(250, 790, '#ff6f91', 5); coral(900, 780, '#ff9a4d', 5); coral(1090, 800, '#c26bff', 4); coral(560, 800, '#ff5c6c', 3);
        // anemone
        ell(c, 700, 790, 60, 22, '#8a4fd8', 0);
        for (i = 0; i < 11; i++) { line(c, 650 + i * 10, 785, 640 + i * 12, 710 - (i % 3) * 14, 8, '#d9a3ff'); }
        // fish
        function fish(x, y, s, body, fin, flip) {
            c.save(); c.translate(x, y); c.scale(flip * s, s);
            poly(c, [[-70, 0], [-125, -45], [-125, 45]], fin);
            ell(c, 0, 0, 82, 52, body, 0);
            poly(c, [[-20, -48], [10, -85], [40, -45]], fin);
            c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(8, -50, 14, 100);
            circ(c, 45, -10, 11, '#fff'); circ(c, 48, -10, 6, '#1a2a4a');
            c.beginPath(); c.arc(60, 12, 14, 0.2, 1.2); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.stroke();
            c.restore();
        }
        fish(400, 300, 1, '#ff9a3c', '#ff6b2c', 1); fish(850, 240, 0.8, '#ffd43b', '#f2a900', -1);
        fish(620, 470, 0.65, '#59b8ff', '#2f7fe0', 1); fish(180, 500, 0.5, '#ff7ab8', '#e0488f', -1);
        // turtle
        ell(c, 980, 520, 100, 70, '#4cbf7c', 0); ell(c, 980, 515, 78, 52, '#38a366', 0);
        for (i = 0; i < 5; i++) { circ(c, 940 + i * 20, 515 + ((i % 2) ? 14 : -14), 11, '#2f8a56'); }
        ell(c, 1095, 500, 34, 28, '#6fd79a', 0); circ(c, 1105, 492, 6, '#1a2a4a');
        ell(c, 920, 580, 30, 14, '#6fd79a', 0.5); ell(c, 1040, 585, 30, 14, '#6fd79a', -0.5);
        ell(c, 930, 460, 30, 14, '#6fd79a', -0.5);
        // bubbles
        for (i = 0; i < 26; i++) {
            var bx = r() * W, by = r() * 700, br = 6 + r() * 16;
            c.beginPath(); c.arc(bx, by, br, 0, 7); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.7)'; c.stroke();
            circ(c, bx - br * 0.3, by - br * 0.3, br * 0.22, 'rgba(255,255,255,0.8)');
        }
        star(c, 120, 830, 36, '#ff7a59', 5); star(c, 1010, 860, 28, '#ffb14d', 5);
    }

    function space(c) {
        var r = mkRng(33), i;
        c.fillStyle = grad(c, 0, 0, W, H, [[0, '#1c1050'], [0.6, '#4a2580'], [1, '#7b3a9e']]); c.fillRect(0, 0, W, H);
        for (i = 0; i < 90; i++) { circ(c, r() * W, r() * 600, 1 + r() * 2.5, 'rgba(255,255,255,' + (0.5 + r() * 0.5) + ')'); }
        for (i = 0; i < 8; i++) { star(c, r() * W, r() * 450, 10 + r() * 12, '#ffe98a', 4); }
        // ringed planet
        circ(c, 250, 220, 110, '#ffa05c'); ell(c, 220, 200, 80, 30, 'rgba(255,200,130,0.6)', -0.3);
        c.save(); c.translate(250, 220); c.rotate(-0.35); c.beginPath(); c.ellipse(0, 0, 190, 42, 0, 0, Math.PI * 2);
        c.lineWidth = 16; c.strokeStyle = '#ffe0a8'; c.stroke(); c.restore();
        circ(c, 250, 220, 0, '#000');
        // blue planet
        circ(c, 980, 170, 70, '#4fb5ff'); ell(c, 960, 160, 38, 16, 'rgba(255,255,255,0.35)', -0.4); circ(c, 1010, 200, 18, '#3ad08a');
        // moon ground
        c.fillStyle = grad(c, 0, 520, 0, 900, [[0, '#d9d2ee'], [1, '#a79fc9']]);
        c.beginPath(); c.ellipse(600, 1250, 1100, 700, 0, 0, Math.PI * 2); c.fill();
        ell(c, 200, 680, 55, 18, 'rgba(120,110,160,0.35)', 0); ell(c, 1020, 720, 70, 22, 'rgba(120,110,160,0.35)', 0); ell(c, 880, 600, 34, 12, 'rgba(120,110,160,0.35)', 0);
        // blanket
        poly(c, [[300, 640], [860, 640], [980, 820], [180, 820]], '#ff6b6b');
        var k, j;
        for (k = 0; k < 7; k++) { for (j = 0; j < 4; j++) {
            if ((k + j) % 2 === 0) {
                var y0 = 640 + j * 45, y1 = 640 + (j + 1) * 45;
                var xl0 = 300 - (y0 - 640) * 0.667, xr0 = 860 + (y0 - 640) * 0.667, xl1 = 300 - (y1 - 640) * 0.667, xr1 = 860 + (y1 - 640) * 0.667;
                var f0 = k / 7, f1 = (k + 1) / 7;
                poly(c, [[xl0 + (xr0 - xl0) * f0, y0], [xl0 + (xr0 - xl0) * f1, y0], [xl1 + (xr1 - xl1) * f1, y1], [xl1 + (xr1 - xl1) * f0, y1]], '#fff5f0');
            }
        } }
        // basket
        rrect(c, 560, 640, 150, 90, 14, '#c98a4b'); c.beginPath(); c.arc(635, 640, 70, Math.PI, 0); c.lineWidth = 12; c.strokeStyle = '#a56d33'; c.stroke();
        for (i = 0; i < 4; i++) { line(c, 580 + i * 36, 650, 580 + i * 36, 725, 4, '#a56d33'); }
        // cupcakes and melon
        rrect(c, 380, 740, 54, 40, 8, '#ff9ac8'); ell(c, 407, 735, 34, 22, '#fff1f8', 0); circ(c, 407, 708, 9, '#e8334f');
        rrect(c, 800, 735, 54, 40, 8, '#8fd1ff'); ell(c, 827, 730, 34, 22, '#ffffff', 0); circ(c, 827, 703, 9, '#ffcf3a');
        c.beginPath(); c.arc(480, 745, 44, 0, Math.PI); c.fillStyle = '#ff5c6c'; c.fill();
        c.beginPath(); c.arc(480, 745, 44, 0, Math.PI); c.lineWidth = 8; c.strokeStyle = '#4cbf5c'; c.stroke();
        for (i = 0; i < 4; i++) { ell(c, 455 + i * 17, 760 - (i % 2) * 8, 3, 5, '#2b2140', 0); }
        // alien friend
        ell(c, 930, 520, 74, 90, '#7be07b', 0);
        line(c, 880, 440, 860, 380, 6, '#5fc45f'); circ(c, 858, 374, 11, '#ffe14d');
        line(c, 980, 440, 1000, 380, 6, '#5fc45f'); circ(c, 1002, 374, 11, '#ffe14d');
        circ(c, 905, 505, 20, '#fff'); circ(c, 905, 507, 10, '#2b2140'); circ(c, 955, 505, 20, '#fff'); circ(c, 955, 507, 10, '#2b2140');
        c.beginPath(); c.arc(930, 540, 26, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 5; c.strokeStyle = '#2b2140'; c.stroke();
        rrect(c, 868, 590, 124, 50, 20, '#5fc45f');
        // rocket
        c.save(); c.translate(180, 560); c.rotate(-0.25);
        poly(c, [[-26, 20], [26, 20], [0, -80]], '#ff5c6c'); rrect(c, -26, 20, 52, 120, 8, '#f4f4ff');
        circ(c, 0, 62, 16, '#59b8ff'); poly(c, [[-26, 100], [-58, 150], [-26, 140]], '#ff5c6c'); poly(c, [[26, 100], [58, 150], [26, 140]], '#ff5c6c');
        poly(c, [[-14, 140], [14, 140], [0, 190]], '#ffb14d'); c.restore();
    }

    function dino(c) {
        var r = mkRng(44), i;
        c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#8fd8ff'], [1, '#e9f9ff']]); c.fillRect(0, 0, W, H);
        sun(c, 150, 130, 58); cloud(c, 560, 140, 1.2); cloud(c, 900, 230, 0.9);
        // volcano
        poly(c, [[780, 560], [900, 250], [1020, 250], [1160, 560]], '#8b5e48'); poly(c, [[900, 250], [1020, 250], [1000, 300], [920, 300]], '#ff7a3c');
        ell(c, 960, 245, 62, 18, '#ffb347', 0);
        for (i = 0; i < 5; i++) { circ(c, 940 + i * 14, 190 - i * 28, 24 - i * 2, 'rgba(255,255,255,' + (0.85 - i * 0.12) + ')'); }
        c.fillStyle = '#7ccf6d'; c.beginPath(); c.moveTo(0, 560);
        c.bezierCurveTo(300, 470, 600, 620, 900, 520); c.bezierCurveTo(1050, 480, 1150, 540, 1200, 520);
        c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        c.fillStyle = '#5fbf5a'; c.beginPath(); c.moveTo(0, 740);
        c.bezierCurveTo(300, 660, 700, 800, 1200, 690); c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        // palms
        function palm(x, y, s) {
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 30 * s, y - 120 * s, x + 10 * s, y - 220 * s);
            c.lineWidth = 22 * s; c.strokeStyle = '#8b5e34'; c.lineCap = 'round'; c.stroke();
            var k, a;
            for (k = 0; k < 6; k++) {
                a = -Math.PI + k * (Math.PI / 5);
                c.beginPath(); c.moveTo(x + 10 * s, y - 220 * s);
                c.quadraticCurveTo(x + 10 * s + Math.cos(a) * 70 * s, y - 220 * s + Math.sin(a) * 60 * s - 30 * s, x + 10 * s + Math.cos(a) * 130 * s, y - 220 * s + Math.sin(a) * 40 * s + 30 * s);
                c.lineWidth = 16 * s; c.strokeStyle = '#2fa84f'; c.stroke();
            }
        }
        palm(120, 700, 1.1); palm(1090, 720, 0.9);
        // dino
        var X = 560, Y = 600;
        ell(c, X + 20, Y + 130, 200, 18, 'rgba(30,90,40,0.25)', 0);
        c.beginPath(); c.moveTo(X + 170, Y - 10); c.quadraticCurveTo(X + 330, Y + 10, X + 360, Y + 110); c.quadraticCurveTo(X + 280, Y + 60, X + 160, Y + 60);
        c.fillStyle = '#4fb86a'; c.fill();
        rrect(c, X - 120, Y + 20, 62, 110, 26, '#43a85e'); rrect(c, X + 70, Y + 20, 62, 110, 26, '#43a85e');
        ell(c, X, Y, 210, 120, '#5cc878', 0); ell(c, X - 10, Y + 50, 150, 55, '#bff0c4', 0);
        rrect(c, X - 90, Y + 20, 66, 115, 28, '#5cc878'); rrect(c, X + 100, Y + 20, 66, 115, 28, '#5cc878');
        c.beginPath(); c.moveTo(X - 120, Y - 40); c.quadraticCurveTo(X - 230, Y - 200, X - 190, Y - 330); c.lineWidth = 78; c.strokeStyle = '#5cc878'; c.lineCap = 'round'; c.stroke();
        ell(c, X - 175, Y - 345, 78, 56, '#5cc878', -0.1); ell(c, X - 240, Y - 330, 40, 30, '#7fdc98', -0.1);
        circ(c, X - 190, Y - 365, 12, '#fff'); circ(c, X - 192, Y - 364, 6, '#2b2140');
        c.beginPath(); c.arc(X - 238, Y - 322, 16, 0.2, 1.3); c.lineWidth = 4; c.strokeStyle = '#2f7a47'; c.stroke();
        circ(c, X - 215, Y - 322, 4, '#2f7a47');
        for (i = 0; i < 6; i++) { star(c, X - 90 + i * 46, Y - 118 + (i % 2) * -6 + Math.abs(i - 2.5) * 6, 26, '#ffb14d', 3); }
        // eggs and ferns
        ell(c, 250, 800, 36, 46, '#fff4d6', 0); ell(c, 242, 788, 10, 14, '#f3cfa0', 0); ell(c, 320, 820, 30, 40, '#d7f0ff', 0);
        for (i = 0; i < 12; i++) { flower(c, r() * W, 770 + r() * 100, 0.5, '#ffe14d', '#ff7a59'); }
    }

    function bakery(c) {
        var r = mkRng(55), i, j;
        c.fillStyle = '#ffe3ef'; c.fillRect(0, 0, W, H);
        for (i = 0; i < 14; i++) { for (j = 0; j < 11; j++) { circ(c, 40 + i * 90 + (j % 2) * 45, 30 + j * 85, 11, '#ffc9de'); } }
        rrect(c, 0, 560, W, 40, 0, '#b97a4c'); c.fillStyle = '#d9985f'; c.fillRect(0, 600, W, 300);
        rrect(c, 70, 90, 420, 24, 10, '#c98a4b'); rrect(c, 700, 150, 420, 24, 10, '#c98a4b');
        // cupcake helper
        function cupcake(x, y, s, wrap, frost, cherry) {
            var k;
            poly(c, [[x - 70 * s, y], [x + 70 * s, y], [x + 52 * s, y + 90 * s], [x - 52 * s, y + 90 * s]], wrap);
            for (k = -2; k <= 2; k++) { line(c, x + k * 24 * s, y + 6 * s, x + k * 18 * s, y + 86 * s, 4 * s, 'rgba(0,0,0,0.12)'); }
            ell(c, x, y - 4 * s, 82 * s, 32 * s, frost, 0); ell(c, x, y - 40 * s, 62 * s, 30 * s, frost, 0); ell(c, x, y - 72 * s, 40 * s, 24 * s, frost, 0);
            circ(c, x, y - 100 * s, 14 * s, cherry); line(c, x, y - 112 * s, x + 10 * s, y - 132 * s, 4 * s, '#4a8f3a');
            for (k = 0; k < 8; k++) { line(c, x - 55 * s + k * 15 * s, y - 40 * s + (k % 3) * 10 * s, x - 49 * s + k * 15 * s, y - 34 * s + (k % 3) * 10 * s, 5 * s, ['#ffe14d', '#59b8ff', '#7be07b', '#ff6f91'][k % 4]); }
        }
        cupcake(230, 470, 1.3, '#59b8ff', '#ff9ac8', '#e8334f');
        cupcake(600, 440, 1.5, '#ffd34a', '#a56d33', '#ff6f91');
        cupcake(960, 470, 1.3, '#ff6f91', '#8fd1ff', '#ffd34a');
        // donuts
        function donut(x, y, rr, icing) {
            var k;
            circ(c, x, y, rr, '#e8b06a'); circ(c, x, y, rr * 0.88, icing); circ(c, x, y, rr * 0.28, '#d9985f');
            for (k = 0; k < 10; k++) { var a = k * 0.63; line(c, x + Math.cos(a) * rr * 0.6, y + Math.sin(a) * rr * 0.6, x + Math.cos(a + 0.3) * rr * 0.7 + 4, y + Math.sin(a + 0.3) * rr * 0.7 + 3, 5, ['#fff', '#ffe14d', '#59b8ff', '#7be07b'][k % 4]); }
        }
        donut(130, 700, 70, '#ff9ac8'); donut(420, 740, 62, '#8fe0b0'); donut(780, 720, 66, '#ffd34a'); donut(1070, 740, 72, '#c8a0ff');
        // cookies
        for (i = 0; i < 4; i++) {
            var cx = 270 + i * 150, cy = 830 - (i % 2) * 20;
            circ(c, cx, cy, 36, '#e0a35e');
            circ(c, cx - 10, cy - 8, 6, '#6b3f23'); circ(c, cx + 12, cy + 4, 6, '#6b3f23'); circ(c, cx - 4, cy + 14, 5, '#6b3f23');
        }
        // sign
        rrect(c, 430, 20, 340, 80, 26, '#fff'); face(c, 600, 56, 1.3, 40);
        for (i = 0; i < 10; i++) { star(c, r() * W, r() * 300, 8 + r() * 6, 'rgba(255,255,255,0.9)', 4); }
    }

    function castle(c) {
        var r = mkRng(66), i;
        c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#6ec6ff'], [0.7, '#c9ecff'], [1, '#fff0f6']]); c.fillRect(0, 0, W, H);
        sun(c, 1050, 120, 54);
        var cols = ['#ff5c6c', '#ff9a4d', '#ffd84a', '#5fd36b', '#4fb5ff', '#7a6cff'];
        for (i = 0; i < 6; i++) { c.beginPath(); c.arc(300, 620, 380 - i * 22, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 22; c.strokeStyle = cols[i]; c.stroke(); }
        cloud(c, 60, 300, 1.4); cloud(c, 950, 380, 1.6); cloud(c, 700, 150, 1);
        // castle
        var base = '#f4e3ff', dark = '#d9bff2', roofC = '#ff6f91';
        rrect(c, 430, 430, 340, 260, 6, base);
        rrect(c, 330, 330, 130, 360, 6, base); rrect(c, 740, 330, 130, 360, 6, base); rrect(c, 520, 250, 160, 440, 6, '#fbf0ff');
        poly(c, [[320, 330], [395, 200], [470, 330]], roofC); poly(c, [[730, 330], [805, 200], [880, 330]], roofC); poly(c, [[510, 250], [600, 90], [690, 250]], '#ff9a4d');
        line(c, 600, 90, 600, 40, 5, '#7a5a3a'); poly(c, [[602, 40], [660, 58], [602, 76]], '#ff5c6c');
        line(c, 395, 200, 395, 160, 4, '#7a5a3a'); poly(c, [[397, 160], [440, 172], [397, 184]], '#59b8ff');
        line(c, 805, 200, 805, 160, 4, '#7a5a3a'); poly(c, [[807, 160], [850, 172], [807, 184]], '#ffd84a');
        for (i = 0; i < 6; i++) { rrect(c, 435 + i * 58, 412, 36, 30, 4, base); }
        c.fillStyle = '#6b4aa3'; c.beginPath(); c.arc(600, 650, 52, Math.PI, 0); c.lineTo(652, 690); c.lineTo(548, 690); c.fill();
        function win(x, y) { c.fillStyle = '#ffe98a'; c.beginPath(); c.arc(x, y, 22, Math.PI, 0); c.lineTo(x + 22, y + 44); c.lineTo(x - 22, y + 44); c.fill(); }
        win(395, 420); win(805, 420); win(600, 330); win(395, 540); win(805, 540); win(500, 520); win(700, 520);
        c.fillStyle = dark; c.fillRect(330, 690, 540, 6);
        // clouds in front
        cloud(c, 150, 770, 2, '#ffffff'); cloud(c, 780, 780, 2.2, '#ffffff'); cloud(c, 480, 820, 2.4, '#ffffff'); cloud(c, 1020, 815, 2, '#ffffff');
        c.fillStyle = '#fff'; c.fillRect(0, 860, W, 40);
        // birds + balloon
        for (i = 0; i < 4; i++) { c.beginPath(); c.moveTo(150 + i * 60, 200 + i * 20); c.quadraticCurveTo(170 + i * 60, 180 + i * 20, 190 + i * 60, 200 + i * 20); c.quadraticCurveTo(210 + i * 60, 180 + i * 20, 230 + i * 60, 200 + i * 20); c.lineWidth = 5; c.strokeStyle = '#4a3b78'; c.stroke(); }
        ell(c, 1000, 520, 52, 64, '#ff6f91', 0); ell(c, 1000, 520, 20, 64, '#ffd84a', 0); rrect(c, 980, 592, 40, 28, 6, '#a56d33');
        line(c, 970, 575, 984, 592, 3, '#7a5a3a'); line(c, 1030, 575, 1016, 592, 3, '#7a5a3a');
        for (i = 0; i < 8; i++) { star(c, r() * W, r() * 300, 7, 'rgba(255,255,255,0.9)', 4); }
    }

    function garden(c) {
        var r = mkRng(77), i;
        c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#b9ecff'], [0.55, '#e3f8c8'], [1, '#7fd36f']]); c.fillRect(0, 0, W, H);
        sun(c, 120, 120, 56); cloud(c, 620, 100, 1); cloud(c, 980, 190, 0.8);
        c.fillStyle = '#6cc65f'; c.beginPath(); c.moveTo(0, 640); c.bezierCurveTo(300, 560, 800, 700, 1200, 600); c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        for (i = 0; i < 70; i++) { var gx = r() * W, gy = 700 + r() * 200; line(c, gx, gy, gx + (r() - 0.5) * 12, gy - 26 - r() * 20, 5, '#3fa04a'); }
        function bigFlower(x, y, s, petal, mid, stem) {
            var k;
            line(c, x, y, x + stem, 900, 12 * s, '#3fa04a');
            ell(c, x + stem * 0.4, y + 330 * s, 70 * s, 22 * s, '#4fb85a', -0.5);
            for (k = 0; k < 8; k++) { var a = k * Math.PI / 4; ell(c, x + Math.cos(a) * 52 * s, y + Math.sin(a) * 52 * s, 38 * s, 24 * s, petal, a); }
            circ(c, x, y, 38 * s, mid); circ(c, x - 8 * s, y - 8 * s, 8 * s, 'rgba(255,255,255,0.4)');
        }
        bigFlower(200, 520, 1.5, '#ff6fa8', '#ffd34a', 20); bigFlower(600, 600, 1.2, '#ffd34a', '#ff7a59', -20);
        bigFlower(980, 500, 1.6, '#b58bff', '#ffe98a', -10); bigFlower(420, 760, 0.9, '#ffffff', '#ffb14d', 5); bigFlower(1100, 760, 0.9, '#ff9a4d', '#fff1a8', 0);
        function butterfly(x, y, s, a, b, rot) {
            c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
            ell(c, -52, -30, 56, 40, a, -0.5); ell(c, 52, -30, 56, 40, a, 0.5); ell(c, -40, 32, 40, 30, b, 0.5); ell(c, 40, 32, 40, 30, b, -0.5);
            circ(c, -58, -34, 12, 'rgba(255,255,255,0.8)'); circ(c, 58, -34, 12, 'rgba(255,255,255,0.8)'); circ(c, -40, 34, 8, 'rgba(255,255,255,0.8)'); circ(c, 40, 34, 8, 'rgba(255,255,255,0.8)');
            rrect(c, -7, -40, 14, 90, 7, '#3a2a63'); circ(c, 0, -46, 11, '#3a2a63');
            line(c, -3, -54, -22, -88, 3, '#3a2a63'); line(c, 3, -54, 22, -88, 3, '#3a2a63'); circ(c, -22, -88, 4, '#3a2a63'); circ(c, 22, -88, 4, '#3a2a63');
            c.restore();
        }
        butterfly(400, 260, 1.5, '#ff9a4d', '#ffd34a', -0.2); butterfly(850, 330, 1.2, '#59b8ff', '#b58bff', 0.3); butterfly(700, 130, 0.8, '#ff6fa8', '#ffb8d9', 0.1); butterfly(130, 380, 0.9, '#7be07b', '#ffe14d', 0.4);
        // ladybug
        ell(c, 760, 700, 30, 24, '#e8334f', 0); circ(c, 790, 700, 12, '#2b2140'); line(c, 760, 678, 760, 722, 3, '#2b2140');
        circ(c, 748, 694, 5, '#2b2140'); circ(c, 772, 708, 5, '#2b2140');
    }

    function train(c) {
        var r = mkRng(88), i;
        c.fillStyle = grad(c, 0, 0, 0, H, [[0, '#8bd5ff'], [1, '#e8f8ff']]); c.fillRect(0, 0, W, H);
        sun(c, 1000, 130, 56); face(c, 1000, 130, 1.1, 18);
        cloud(c, 120, 140, 1.3); cloud(c, 560, 90, 1); cloud(c, 800, 230, 0.8);
        c.fillStyle = '#9ad97f'; c.beginPath(); c.moveTo(0, 470); c.bezierCurveTo(300, 360, 600, 520, 900, 420); c.bezierCurveTo(1050, 380, 1150, 440, 1200, 410); c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        c.fillStyle = '#7fcb68'; c.beginPath(); c.moveTo(0, 560); c.bezierCurveTo(400, 500, 800, 620, 1200, 520); c.lineTo(1200, 900); c.lineTo(0, 900); c.fill();
        function house(x, y, w, h, wall, roof) {
            rrect(c, x, y, w, h, 6, wall); poly(c, [[x - 12, y + 4], [x + w / 2, y - h * 0.5], [x + w + 12, y + 4]], roof);
            rrect(c, x + w * 0.4, y + h * 0.4, w * 0.22, h * 0.6, 4, '#7a4f2a'); rrect(c, x + w * 0.1, y + h * 0.2, w * 0.2, h * 0.22, 4, '#ffe98a'); rrect(c, x + w * 0.7, y + h * 0.2, w * 0.2, h * 0.22, 4, '#ffe98a');
        }
        house(90, 400, 120, 90, '#ffd9a8', '#e8534f'); house(260, 420, 100, 80, '#ffb8d9', '#7a6cff'); house(880, 400, 130, 100, '#bfe6ff', '#e8534f'); house(1050, 430, 100, 80, '#d6f5c0', '#ff9a4d');
        function tree(x, y, s) { rrect(c, x - 8 * s, y, 16 * s, 60 * s, 4, '#8b5e34'); circ(c, x, y - 5 * s, 44 * s, '#2fa84f'); circ(c, x - 26 * s, y + 14 * s, 30 * s, '#38b85a'); circ(c, x + 26 * s, y + 14 * s, 30 * s, '#38b85a'); }
        tree(430, 450, 1); tree(780, 440, 1.1); tree(60, 560, 0.9);
        // track
        c.fillStyle = '#8a8fa8'; c.fillRect(0, 700, W, 14); c.fillRect(0, 740, W, 14);
        for (i = 0; i < 40; i++) { c.fillStyle = '#7a4f2a'; c.fillRect(i * 32, 694, 14, 66); }
        // train
        function wheel(x, y) { circ(c, x, y, 26, '#2b2140'); circ(c, x, y, 14, '#c9ced9'); circ(c, x, y, 4, '#2b2140'); }
        var X = 160;
        rrect(c, X + 440, 560, 330, 140, 12, '#e8534f'); rrect(c, X + 640, 500, 130, 70, 8, '#c93a3a'); rrect(c, X + 620, 480, 170, 24, 8, '#2b2140');
        rrect(c, X + 400, 600, 90, 100, 10, '#ffd34a'); rrect(c, X + 460, 540, 90, 90, 8, '#2b2140'); circ(c, X + 790, 520, 0, '#000');
        rrect(c, X + 690, 510, 50, 40, 6, '#bfe6ff'); poly(c, [[X + 770, 640], [X + 840, 700], [X + 770, 700]], '#2b2140');
        ell(c, X + 540, 590, 26, 14, '#c9ced9', 0); rrect(c, X + 490, 520, 36, 70, 6, '#2b2140');
        circ(c, X + 508, 500, 22, 'rgba(255,255,255,0.9)'); circ(c, X + 480, 450, 30, 'rgba(255,255,255,0.8)'); circ(c, X + 440, 395, 36, 'rgba(255,255,255,0.7)');
        wheel(X + 520, 700); wheel(X + 610, 700); wheel(X + 710, 700); wheel(X + 440, 706);
        var carCols = ['#59b8ff', '#7be07b', '#b58bff'];
        for (i = 0; i < 2; i++) {
            var cx = 340 - i * 260;
            rrect(c, cx - 20, 580, 240, 120, 12, carCols[i]); rrect(c, cx, 600, 60, 50, 6, '#ffffff'); rrect(c, cx + 90, 600, 60, 50, 6, '#ffffff');
            rrect(c, cx + 160, 600, 40, 50, 6, '#ffffff'); rrect(c, cx + 230, 668, 30, 8, 4, '#2b2140'); wheel(cx + 30, 706); wheel(cx + 170, 706);
        }
        for (i = 0; i < 24; i++) { flower(c, r() * W, 790 + r() * 90, 0.5, ['#ff6fa8', '#ffd34a', '#fff'][i % 3], '#ffe98a'); }
    }

    var LIST = [
        { id: 'unicorn', title: 'Rainbow unicorn meadow', draw: unicorn },
        { id: 'reef', title: 'Ocean reef', draw: reef },
        { id: 'space', title: 'Space picnic', draw: space },
        { id: 'dino', title: 'Friendly dino park', draw: dino },
        { id: 'bakery', title: 'Cupcake bakery', draw: bakery },
        { id: 'castle', title: 'Castle in the clouds', draw: castle },
        { id: 'garden', title: 'Butterfly garden', draw: garden },
        { id: 'train', title: 'Little train town', draw: train }
    ];

    function find(id) {
        var i;
        for (i = 0; i < LIST.length; i++) { if (LIST[i].id === id) { return LIST[i]; } }
        return null;
    }

    /** Draw a sample to a new canvas (W x H, or smaller with `maxSide`) */
    function render(id, maxSide) {
        var s = find(id);
        if (!s) { return null; }
        var c = document.createElement('canvas');
        c.width = W; c.height = H;
        var ctx = c.getContext('2d');
        s.draw(ctx);
        if (maxSide && maxSide < W) {
            var k = maxSide / W, t = document.createElement('canvas');
            t.width = Math.round(W * k); t.height = Math.round(H * k);
            t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
            return t;
        }
        return c;
    }

    NS.Samples = { list: LIST, find: find, render: render, W: W, H: H };
})(window);
