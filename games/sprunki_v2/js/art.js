/**
 * Sprunki v2 - character art generator (ES5).
 * make(spec, horror) returns an SVG string (viewBox 0 0 100 120).
 * spec: {body, color, eyes, mouth, acc, accColor, cheeks}
 * bodies: round tall drop wide square ghost heart. Bubblegum Pop adds acc lightstick, horn, gumball and sparkle.
 * Horror look = darker, desaturated body, hollow eyes with pale glow, flat mouth. Never red, never gory.
 */
(function (w) {
    function hex(c) {
        c = c.replace('#', '');
        if (c.length === 3) c = c.charAt(0) + c.charAt(0) + c.charAt(1) + c.charAt(1) + c.charAt(2) + c.charAt(2);
        return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)];
    }
    function toHex(a) {
        var s = '#', i, h;
        for (i = 0; i < 3; i++) { h = Math.max(0, Math.min(255, Math.round(a[i]))).toString(16); s += (h.length < 2 ? '0' : '') + h; }
        return s;
    }
    function mix(c1, c2, t) {
        var a = hex(c1), b = hex(c2);
        return toHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
    }
    function dim(c, horror) { return horror ? mix(c, '#232338', 0.68) : c; }

    var BODIES = {
        round: { y: 62, d: function (c) { return '<ellipse cx="50" cy="68" rx="35" ry="40" fill="' + c + '"/>'; }, top: 28 },
        tall: { y: 54, d: function (c) { return '<rect x="22" y="20" width="56" height="92" rx="28" fill="' + c + '"/>'; }, top: 20 },
        drop: { y: 68, d: function (c) { return '<path d="M50 12 C80 48 88 70 80 94 C74 114 26 114 20 94 C12 70 20 48 50 12Z" fill="' + c + '"/>'; }, top: 14 },
        wide: { y: 70, d: function (c) { return '<ellipse cx="50" cy="78" rx="44" ry="34" fill="' + c + '"/>'; }, top: 46 },
        square: { y: 64, d: function (c) { return '<rect x="16" y="30" width="68" height="82" rx="18" fill="' + c + '"/>'; }, top: 30 },
        heart: { y: 62, d: function (c) { return '<path d="M50 108 C6 76 4 40 27 28 C40 22 50 30 50 41 C50 30 60 22 73 28 C96 40 94 76 50 108Z" fill="' + c + '"/>'; }, top: 26 },
        ghost: { y: 56, d: function (c) { return '<path d="M20 112 L20 54 C20 26 36 14 50 14 C64 14 80 26 80 54 L80 112 L69 102 L59 112 L50 102 L41 112 L31 102Z" fill="' + c + '"/>'; }, top: 14 }
    };

    function eyes(kind, y, horror) {
        var l = 38, r = 62;
        if (horror) {
            return '<ellipse cx="' + l + '" cy="' + y + '" rx="8" ry="10" fill="#07070d"/><ellipse cx="' + r + '" cy="' + y + '" rx="8" ry="10" fill="#07070d"/>' +
                '<circle cx="' + l + '" cy="' + (y + 1) + '" r="2.6" fill="#f3efb0"/><circle cx="' + r + '" cy="' + (y + 1) + '" r="2.6" fill="#f3efb0"/>';
        }
        if (kind === 'big') {
            return '<circle cx="' + l + '" cy="' + y + '" r="10" fill="#fff"/><circle cx="' + r + '" cy="' + y + '" r="10" fill="#fff"/>' +
                '<circle cx="' + (l + 1) + '" cy="' + y + '" r="5" fill="#222"/><circle cx="' + (r + 1) + '" cy="' + y + '" r="5" fill="#222"/>';
        }
        if (kind === 'happy') {
            return '<path d="M30 ' + (y + 3) + ' Q38 ' + (y - 8) + '46 ' + (y + 3) + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                '<path d="M54 ' + (y + 3) + ' Q62 ' + (y - 8) + ' 70 ' + (y + 3) + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>';
        }
        if (kind === 'sleepy') {
            return '<path d="M31 ' + y + ' L45 ' + y + '" stroke="#222" stroke-width="4" stroke-linecap="round"/><path d="M55 ' + y + ' L69 ' + y + '" stroke="#222" stroke-width="4" stroke-linecap="round"/>';
        }
        return '<circle cx="' + l + '" cy="' + y + '" r="5.5" fill="#222"/><circle cx="' + r + '" cy="' + y + '" r="5.5" fill="#222"/>' +
            '<circle cx="' + (l + 2) + '" cy="' + (y - 2) + '" r="1.8" fill="#fff"/><circle cx="' + (r + 2) + '" cy="' + (y - 2) + '" r="1.8" fill="#fff"/>';
    }

    function mouth(kind, y, horror) {
        y += 16;
        if (horror) {
            return '<path d="M38 ' + y + ' Q44 ' + (y - 3) + ' 50 ' + y + ' T62 ' + y + '" stroke="#07070d" stroke-width="3" fill="none" stroke-linecap="round"/>';
        }
        if (kind === 'open') return '<ellipse cx="50" cy="' + y + '" rx="9" ry="7" fill="#552233"/><ellipse cx="50" cy="' + (y + 3) + '" rx="5" ry="3" fill="#ff8aa0"/>';
        if (kind === 'o') return '<circle cx="50" cy="' + y + '" r="5" fill="#552233"/>';
        if (kind === 'grin') return '<path d="M36 ' + (y - 3) + ' Q50 ' + (y + 14) + ' 64 ' + (y - 3) + 'Z" fill="#552233"/><path d="M40 ' + (y - 1) + ' L60 ' + (y - 1) + '" stroke="#fff" stroke-width="3"/>';
        return '<path d="M38 ' + y + ' Q50 ' + (y + 10) + ' 62 ' + y + '" stroke="#222" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    }

    function acc(kind, color, body, horror) {
        var t = body.top, c = dim(color || '#ff77aa', horror), g = dim('#5cc05c', horror), s = '';
        var i;
        switch (kind) {
            case 'flower':
                for (i = 0; i < 5; i++) {
                    s += '<ellipse cx="50" cy="' + (t - 6) + '" rx="5" ry="9" fill="' + c + '" transform="rotate(' + (i * 72) + ' 50 ' + (t + 2) + ')"/>';
                }
                return s + '<circle cx="50" cy="' + (t + 2) + '" r="5" fill="' + dim('#ffd84a', horror) + '"/>';
            case 'sprout':
                return '<path d="M50 ' + (t + 4) + ' L50 ' + (t - 12) + '" stroke="' + g + '" stroke-width="3"/><ellipse cx="42" cy="' + (t - 14) + '" rx="9" ry="5" fill="' + g + '" transform="rotate(-25 42 ' + (t - 14) + ')"/><ellipse cx="58" cy="' + (t - 14) + '" rx="9" ry="5" fill="' + g + '" transform="rotate(25 58 ' + (t - 14) + ')"/>';
            case 'leaf':
                return '<ellipse cx="58" cy="' + (t - 2) + '" rx="14" ry="7" fill="' + c + '" transform="rotate(-30 58 ' + (t - 2) + ')"/><path d="M48 ' + (t + 3) + ' L66 ' + (t - 8) + '" stroke="' + dim('#7a4a1a', horror) + '" stroke-width="1.5"/>';
            case 'shades':
                return '<rect x="26" y="' + (body.y - 9) + '" width="21" height="14" rx="5" fill="#15151f"/><rect x="53" y="' + (body.y - 9) + '" width="21" height="14" rx="5" fill="#15151f"/><path d="M47 ' + (body.y - 3) + ' L53 ' + (body.y - 3) + '" stroke="#15151f" stroke-width="3"/>';
            case 'beanie':
                return '<path d="M26 ' + (t + 12) + ' C26 ' + (t - 10) + ' 74 ' + (t - 10) + ' 74 ' + (t + 12) + 'Z" fill="' + c + '"/><rect x="24" y="' + (t + 8) + '" width="52" height="8" rx="4" fill="' + dim('#ffffff', horror) + '"/><circle cx="50" cy="' + (t - 8) + '" r="6" fill="' + dim('#ffffff', horror) + '"/>';
            case 'scarf':
                return '<rect x="24" y="' + (body.y + 24) + '" width="52" height="9" rx="4.5" fill="' + c + '"/><rect x="60" y="' + (body.y + 28) + '" width="9" height="20" rx="4" fill="' + c + '"/>';
            case 'witchhat':
                return '<path d="M30 ' + (t + 10) + ' L50 ' + (t - 28) + ' L70 ' + (t + 10) + 'Z" fill="' + dim('#3b2a66', horror) + '"/><rect x="20" y="' + (t + 6) + '" width="60" height="7" rx="3.5" fill="' + dim('#2c1f50', horror) + '"/><rect x="37" y="' + (t - 2) + '" width="26" height="5" fill="' + dim('#f5b642', horror) + '"/>';
            case 'pumpkin':
                return '<ellipse cx="50" cy="' + (t - 2) + '" rx="17" ry="12" fill="' + dim('#f28c28', horror) + '"/><path d="M50 ' + (t - 14) + ' L50 ' + (t + 9) + '" stroke="' + dim('#d9701a', horror) + '" stroke-width="2"/><rect x="47" y="' + (t - 20) + '" width="6" height="8" rx="2" fill="' + g + '"/>';
            case 'bow':
                return '<path d="M50 ' + (t + 2) + ' L32 ' + (t - 8) + ' L32 ' + (t + 12) + 'Z M50 ' + (t + 2) + ' L68 ' + (t - 8) + ' L68 ' + (t + 12) + 'Z" fill="' + c + '"/><circle cx="50" cy="' + (t + 2) + '" r="4.5" fill="' + dim('#ffffff', horror) + '"/>';
            case 'antenna':
                return '<path d="M40 ' + (t + 4) + ' L32 ' + (t - 16) + ' M60 ' + (t + 4) + ' L68 ' + (t - 16) + '" stroke="#444" stroke-width="2.5"/><circle cx="32" cy="' + (t - 18) + '" r="5" fill="' + c + '"/><circle cx="68" cy="' + (t - 18) + '" r="5" fill="' + c + '"/>';
            case 'ears':
                return '<path d="M26 ' + (t + 14) + ' L30 ' + (t - 12) + ' L48 ' + (t + 2) + 'Z M74 ' + (t + 14) + ' L70 ' + (t - 12) + ' L52 ' + (t + 2) + 'Z" fill="' + c + '"/>';
            case 'wings':
                return '<path d="M16 ' + (body.y) + ' L-2 ' + (body.y - 18) + ' L6 ' + (body.y + 4) + ' L-2 ' + (body.y + 18) + ' L18 ' + (body.y + 12) + 'Z M84 ' + (body.y) + ' L102 ' + (body.y - 18) + ' L94 ' + (body.y + 4) + ' L102 ' + (body.y + 18) + ' L82 ' + (body.y + 12) + 'Z" fill="' + dim('#3a2e55', horror) + '"/>';
            case 'sun':
                for (i = 0; i < 8; i++) {
                    s += '<rect x="48.5" y="' + (t - 22) + '" width="3" height="9" rx="1.5" fill="' + c + '" transform="rotate(' + (i * 45) + ' 50 ' + (t - 2) + ')"/>';
                }
                return s + '<circle cx="50" cy="' + (t - 2) + '" r="9" fill="' + c + '"/>';
            case 'snowcap':
                return '<path d="M28 ' + (t + 14) + ' Q50 ' + (t - 12) + ' 72 ' + (t + 14) + ' Q64 ' + (t + 8) + ' 58 ' + (t + 16) + ' Q50 ' + (t + 8) + ' 42 ' + (t + 16) + ' Q36 ' + (t + 8) + ' 28 ' + (t + 14) + 'Z" fill="' + dim('#ffffff', horror) + '"/>';
            case 'tophat':
                return '<rect x="30" y="' + (t - 16) + '" width="40" height="26" rx="3" fill="#0b0b10"/><rect x="22" y="' + (t + 6) + '" width="56" height="7" rx="3" fill="#0b0b10"/><rect x="30" y="' + (t + 1) + '" width="40" height="5" fill="' + dim('#7a5cd1', horror) + '"/>';
            case 'lightstick':
                // glow lightstick held at the right side: handle, glowing heart-star orb and a soft halo
                return '<path d="M84 ' + (body.y + 34) + ' L93 ' + (body.y - 4) + '" stroke="' + dim('#ffffff', horror) + '" stroke-width="4" stroke-linecap="round"/>' +
                    '<circle cx="94" cy="' + (body.y - 12) + '" r="13" fill="' + c + '" opacity="0.35"/>' +
                    '<circle cx="94" cy="' + (body.y - 12) + '" r="7.5" fill="' + c + '"/><circle cx="92" cy="' + (body.y - 14) + '" r="2.4" fill="#fff" opacity="0.8"/>';
            case 'horn':
                // unicorn: golden twist horn plus a soft pastel mane (pinks and lilac, no rainbow)
                return '<circle cx="22" cy="' + (t + 14) + '" r="9" fill="' + dim('#e9c9ff', horror) + '"/><circle cx="17" cy="' + (t + 28) + '" r="9" fill="' + dim('#ffc2e0', horror) + '"/><circle cx="19" cy="' + (t + 42) + '" r="8" fill="' + dim('#d7c2ff', horror) + '"/>' +
                    '<path d="M43 ' + (t + 6) + ' L50 ' + (t - 26) + ' L57 ' + (t + 6) + 'Z" fill="' + dim('#ffe08a', horror) + '"/><path d="M45 ' + (t - 2) + ' L56 ' + (t - 8) + ' M44 ' + (t + 3) + ' L57 ' + (t - 3) + ' M47 ' + (t - 12) + ' L54 ' + (t - 16) + '" stroke="' + c + '" stroke-width="2.2"/>';
            case 'gumball':
                // bubblegum machine dome with little gumballs
                return '<rect x="30" y="' + (t - 2) + '" width="40" height="7" rx="3" fill="' + dim('#ffffff', horror) + '"/>' +
                    '<path d="M28 ' + (t - 1) + ' A22 22 0 0 1 72 ' + (t - 1) + 'Z" fill="#ffffff" opacity="0.55"/>' +
                    '<circle cx="40" cy="' + (t - 8) + '" r="6" fill="' + c + '"/><circle cx="54" cy="' + (t - 9) + '" r="6" fill="' + dim('#c9a8ff', horror) + '"/><circle cx="48" cy="' + (t - 18) + '" r="6" fill="' + dim('#a8f0d0', horror) + '"/><circle cx="62" cy="' + (t - 7) + '" r="5" fill="' + dim('#ffe08a', horror) + '"/>';
            case 'sparkle':
                for (i = 0; i < 3; i++) {
                    var sx = 30 + i * 20, sy = t - 6 - (i === 1 ? 10 : 0), sr = i === 1 ? 9 : 6;
                    s += '<path d="M' + sx + ' ' + (sy - sr) + ' L' + (sx + sr * 0.3) + ' ' + (sy - sr * 0.3) + ' L' + (sx + sr) + ' ' + sy + ' L' + (sx + sr * 0.3) + ' ' + (sy + sr * 0.3) + ' L' + sx + ' ' + (sy + sr) + ' L' + (sx - sr * 0.3) + ' ' + (sy + sr * 0.3) + ' L' + (sx - sr) + ' ' + sy + ' L' + (sx - sr * 0.3) + ' ' + (sy - sr * 0.3) + 'Z" fill="' + (i === 1 ? c : dim('#ffe08a', horror)) + '"/>';
                }
                return s;
            default:
                return '';
        }
    }

    function make(spec, horror) {
        var body = BODIES[spec.body] || BODIES.round;
        var col = horror ? mix(spec.color, '#2a2a40', 0.62) : spec.color;
        var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 132">';
        if (spec.acc === 'wings') s += acc('wings', spec.accColor, body, horror);
        s += body.d(col);
        if (!horror) s += '<ellipse cx="38" cy="' + (body.y - 18) + '" rx="10" ry="5" fill="#fff" opacity="0.25"/>';
        if (spec.cheeks && !horror) s += '<circle cx="28" cy="' + (body.y + 10) + '" r="5" fill="#ff7a9a" opacity="0.45"/><circle cx="72" cy="' + (body.y + 10) + '" r="5" fill="#ff7a9a" opacity="0.45"/>';
        s += eyes(spec.eyes, body.y, horror);
        s += mouth(spec.mouth, body.y, horror);
        if (spec.acc && spec.acc !== 'wings') s += acc(spec.acc, spec.accColor, body, horror);
        return s + '</svg>';
    }

    function dataUri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

    w.SprunkiArt = { make: make, dataUri: dataUri };
})(window);
