/* Memory Match - card sets. ES5. Each item: { id, name, html } where html is shown on the card face. */
var MMCards = (function () {
    'use strict';

    var emoji = [
        ['dog', 'dog', '🐶'], ['cat', 'cat', '🐱'], ['frog', 'frog', '🐸'],
        ['monkey', 'monkey', '🐵'], ['panda', 'panda', '🐼'], ['rabbit', 'rabbit', '🐰'],
        ['fox', 'fox', '🦊'], ['pig', 'pig', '🐷'], ['cow', 'cow', '🐮'],
        ['apple', 'apple', '🍎'], ['banana', 'banana', '🍌'], ['strawberry', 'strawberry', '🍓'],
        ['grapes', 'grapes', '🍇'], ['watermelon', 'watermelon', '🍉'], ['orange', 'orange', '🍊'],
        ['car', 'car', '🚗'], ['bus', 'bus', '🚌'], ['tractor', 'tractor', '🚜'],
        ['train', 'train', '🚂'], ['bicycle', 'bicycle', '🚲'], ['boat', 'sailboat', '⛵']
    ];

    function build(rows) {
        var out = [], i;
        for (i = 0; i < rows.length; i++) { out.push({ id: rows[i][0], name: rows[i][1], html: rows[i][2] }); }
        return out;
    }


    /* ---------- original flat-color animals, drawn by hand as inline SVG (viewBox 0 0 100 100) ---------- */
    function svg(inner) {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" focusable="false" aria-hidden="true">' + inner + '</svg>';
    }
    function circ(x, y, r, fill, extra) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>'; }
    function ell(x, y, rx, ry, fill, extra) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra || '') + '/>'; }
    function poly(pts, fill) { return '<polygon points="' + pts + '" fill="' + fill + '"/>'; }
    function line(x1, y1, x2, y2, col, w) {
        return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" stroke-linecap="round"/>';
    }
    function path(d, col, w, fill) {
        return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + col + '" stroke-width="' + (w || 2.5) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    function eye(x, y, r) { return circ(x, y, r || 4.5, '#2b2340') + circ(x + 1.4, y - 1.6, (r || 4.5) * 0.35, '#fff'); }
    function cheeks(y, col) { return circ(30, y, 5, col || '#ff9fb3', ' opacity="0.55"') + circ(70, y, 5, col || '#ff9fb3', ' opacity="0.55"'); }

    var art = {
        cat: svg(poly('20,42 24,10 46,28', '#f4a040') + poly('80,42 76,10 54,28', '#f4a040') + poly('26,36 28,19 40,29', '#ffb8c6') + poly('74,36 72,19 60,29', '#ffb8c6') +
            circ(50, 58, 33, '#f4a040') + ell(50, 70, 16, 11, '#fff3e0') + eye(37, 52) + eye(63, 52) + poly('45,61 55,61 50,67', '#e0607e') +
            path('M50 67 Q44 74 38 70 M50 67 Q56 74 62 70', '#6b3f1d', 2) + line(14, 62, 30, 64, '#6b3f1d', 1.8) + line(14, 70, 30, 68, '#6b3f1d', 1.8) + line(86, 62, 70, 64, '#6b3f1d', 1.8) + line(86, 70, 70, 68, '#6b3f1d', 1.8) + cheeks(66)),
        dog: svg(ell(20, 50, 13, 25, '#8a5a34', ' transform="rotate(12 20 50)"') + ell(80, 50, 13, 25, '#8a5a34', ' transform="rotate(-12 80 50)"') +
            circ(50, 52, 31, '#d9a066') + ell(50, 66, 19, 15, '#fbe8cf') + eye(38, 46) + eye(62, 46) + ell(50, 60, 8, 5.5, '#2b2340') +
            path('M50 65 L50 70 M50 70 Q43 77 37 72 M50 70 Q57 77 63 72', '#6b3f1d', 2) + ell(50, 78, 6, 5, '#ff8fa3') + circ(44, 36, 5, '#b9814c') ),
        fish: svg(poly('72,50 96,30 96,70', '#ff9f43') + ell(44, 50, 33, 24, '#4fb3f6') + poly('34,28 50,26 46,36', '#2f86d0') + poly('34,72 50,74 46,64', '#2f86d0') +
            path('M52 32 Q58 50 52 68', '#2f86d0', 2.5) + circ(26, 46, 7, '#fff') + eye(25, 46, 4.5) + path('M14 56 Q19 60 24 57', '#1d5f99', 2.2) +
            circ(14, 24, 4, '#bfe8ff', ' stroke="#4fb3f6" stroke-width="1.5"') + circ(22, 14, 2.6, '#bfe8ff', ' stroke="#4fb3f6" stroke-width="1.5"')),
        bird: svg(path('M44 82 L44 90 M58 82 L58 90 M38 90 L50 90 M54 90 L66 90', '#f08a24', 3) + poly('78,40 98,48 78,56', '#ffb02e') +
            circ(50, 52, 31, '#5ec2f2') + ell(48, 62, 17, 14, '#d9f3ff') + path('M44 24 Q40 12 48 14 M50 22 Q50 8 58 12', '#2f86d0', 3.5) +
            ell(34, 58, 12, 8, '#2f9bd8', ' transform="rotate(-25 34 58)"') + eye(62, 44) + circ(70, 54, 4, '#ff9fb3', ' opacity="0.6"')),
        frog: svg(ell(50, 62, 38, 28, '#6cc24a') + circ(30, 34, 15, '#6cc24a') + circ(70, 34, 15, '#6cc24a') + circ(30, 34, 10, '#fff') + circ(70, 34, 10, '#fff') +
            eye(31, 35, 5.5) + eye(69, 35, 5.5) + path('M24 66 Q50 90 76 66', '#2d6a1f', 3) + circ(44, 56, 2, '#2d6a1f') + circ(56, 56, 2, '#2d6a1f') + cheeks(68, '#ff9fb3') + ell(50, 80, 14, 5, '#a8e08a', ' opacity="0.8"')),
        bunny: svg(ell(33, 26, 10, 25, '#ffffff', ' stroke="#d9cfe8" stroke-width="2" transform="rotate(-10 33 26)"') + ell(67, 26, 10, 25, '#ffffff', ' stroke="#d9cfe8" stroke-width="2" transform="rotate(10 67 26)"') +
            ell(33, 28, 5, 17, '#ffb8c6', ' transform="rotate(-10 33 28)"') + ell(67, 28, 5, 17, '#ffb8c6', ' transform="rotate(10 67 28)"') +
            circ(50, 62, 30, '#ffffff', ' stroke="#d9cfe8" stroke-width="2"') + eye(39, 58) + eye(61, 58) + ell(50, 68, 4.5, 3.5, '#ff7f9f') +
            path('M50 71 Q45 77 40 74 M50 71 Q55 77 60 74', '#8a7aa8', 2) + poly('46,76 54,76 54,84 46,84', '#fff') + cheeks(70)),
        bear: svg(circ(24, 28, 13, '#8b5a2b') + circ(76, 28, 13, '#8b5a2b') + circ(24, 28, 7, '#d9a066') + circ(76, 28, 7, '#d9a066') +
            circ(50, 55, 34, '#a8703a') + ell(50, 68, 17, 13, '#f1d3a5') + eye(37, 48) + eye(63, 48) + ell(50, 62, 7, 5, '#3a2616') +
            path('M50 67 Q50 74 42 73 M50 67 Q50 74 58 73', '#3a2616', 2.2) + cheeks(60, '#ff9a8a')),
        turtle: svg(ell(30, 78, 9, 8, '#8fcf6a') + ell(66, 78, 9, 8, '#8fcf6a') + poly('84,70 96,76 90,82', '#8fcf6a') + circ(84, 52, 14, '#8fcf6a') + eye(88, 49, 3.8) +
            path('M82 58 Q86 61 91 58', '#2d6a1f', 2) + path('M10 74 Q10 24 50 24 Q82 24 84 74 Z', '#2d6a1f', 3, '#4aa354') +
            poly('50,34 66,44 60,62 40,62 34,44', '#7acb7f') + path('M50 34 L50 24 M66 44 L78 40 M60 62 L68 72 M40 62 L32 72 M34 44 L20 40', '#2d6a1f', 2.5)),
        owl: svg(poly('22,34 20,8 40,22', '#7a4f2a') + poly('78,34 80,8 60,22', '#7a4f2a') + ell(50, 58, 36, 36, '#a8703a') + ell(50, 70, 20, 22, '#f1d3a5') +
            path('M42 66 L46 72 M54 66 L58 72 M50 76 L50 82', '#a8703a', 2.5) + circ(35, 44, 15, '#fff7e0') + circ(65, 44, 15, '#fff7e0') +
            circ(35, 44, 15, 'none', ' stroke="#7a4f2a" stroke-width="3"') + circ(65, 44, 15, 'none', ' stroke="#7a4f2a" stroke-width="3"') + eye(36, 45, 7) + eye(64, 45, 7) +
            poly('45,52 55,52 50,62', '#ffb02e') + ell(28, 84, 6, 3.5, '#ffb02e') + ell(72, 84, 6, 3.5, '#ffb02e')),
        duck: svg(path('M4 86 Q14 78 24 86 T44 86 T64 86 T84 86 T100 86', '#4fb3f6', 4) + ell(44, 66, 30, 20, '#ffd93b') + circ(58, 38, 24, '#ffd93b') +
            ell(34, 66, 14, 9, '#f2bd1a', ' transform="rotate(-15 34 66)"') + ell(80, 42, 16, 8, '#ff8f2a') + path('M66 42 L92 42', '#c76a10', 1.8) + eye(60, 31) + path('M52 14 Q50 6 58 8', '#f2bd1a', 3.5) + circ(66, 50, 4, '#ff9fb3', ' opacity="0.6"')),
        pig: svg(poly('20,36 18,12 42,26', '#f78fa9') + poly('80,36 82,12 58,26', '#f78fa9') + circ(50, 56, 34, '#ffb3c6') + ell(50, 66, 18, 13, '#ff8fab') +
            ell(43, 66, 3.2, 5, '#b8405e') + ell(57, 66, 3.2, 5, '#b8405e') + eye(35, 46) + eye(65, 46) + cheeks(60, '#ff6f91')),
        mouse: svg(circ(22, 30, 17, '#9aa3b2') + circ(78, 30, 17, '#9aa3b2') + circ(22, 30, 10, '#ffb8c6') + circ(78, 30, 10, '#ffb8c6') +
            ell(50, 58, 33, 31, '#b9c0cc') + ell(50, 72, 17, 12, '#eef0f4') + eye(37, 52) + eye(63, 52) + circ(50, 66, 5, '#ff7f9f') +
            path('M50 70 Q44 77 38 74 M50 70 Q56 77 62 74', '#6b7280', 2) + line(10, 66, 28, 68, '#6b7280', 1.8) + line(10, 74, 28, 72, '#6b7280', 1.8) + line(90, 66, 72, 68, '#6b7280', 1.8) + line(90, 74, 72, 72, '#6b7280', 1.8) + cheeks(62)),
        penguin: svg(ell(50, 56, 34, 40, '#33405c') + ell(50, 64, 22, 28, '#ffffff') + ell(24, 60, 8, 20, '#33405c', ' transform="rotate(12 24 60)"') + ell(76, 60, 8, 20, '#33405c', ' transform="rotate(-12 76 60)"') +
            ell(38, 94, 11, 5, '#ff9f2e') + ell(62, 94, 11, 5, '#ff9f2e') + circ(40, 36, 8, '#fff') + circ(60, 36, 8, '#fff') + eye(41, 37, 4) + eye(59, 37, 4) + poly('42,46 58,46 50,56', '#ff9f2e') + cheeks(48)),
        elephant: svg(ell(18, 46, 17, 24, '#8fa3bd') + ell(82, 46, 17, 24, '#8fa3bd') + ell(18, 46, 9, 15, '#ffb8c6') + ell(82, 46, 9, 15, '#ffb8c6') +
            circ(50, 46, 28, '#a8bad2') + path('M42 62 Q42 90 56 90 Q64 90 62 80', '#a8bad2', 14) + path('M44 76 L58 76 M45 83 L58 83', '#7f93ae', 1.8) + eye(39, 42) + eye(61, 42) + cheeks(54, '#ff9fb3'))
    };
    var animalRows = [
        ['cat', 'cat'], ['dog', 'dog'], ['fish', 'fish'], ['bird', 'bird'], ['frog', 'frog'], ['bunny', 'bunny'], ['bear', 'bear'],
        ['turtle', 'turtle'], ['owl', 'owl'], ['duck', 'duck'], ['pig', 'pig'], ['mouse', 'mouse'], ['penguin', 'penguin'], ['elephant', 'elephant']
    ];
    function buildAnimals() {
        var out = [], i;
        for (i = 0; i < animalRows.length; i++) { out.push({ id: animalRows[i][0], name: animalRows[i][1], html: art[animalRows[i][0]] }); }
        return out;
    }

    var sets = {
        emoji: { label: 'Emoji', hint: 'animals, fruit, vehicles', items: build(emoji) },
        animals: { label: 'Animals', hint: 'friendly drawings', items: buildAnimals() }
    };

    return { sets: sets, order: ['emoji', 'animals'] };
}());
