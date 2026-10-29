/**
 * Nightlite Choir+ - character art generator (ES5).
 * make(spec, horror) returns an SVG string (viewBox 0 0 100 120).
 * spec: {body (round|tall|drop|wide|square|ghost|bush|doll|pony|tin|plush|moon|star|comet|planet), color, eyes, mouth, acc, accColor,
 *        acc2, acc2Color, cheeks, patch, mark, ring}
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

    function starPath(cx, cy, R, r, n) {
        var p = '', i, a, rr;
        for (i = 0; i < n * 2; i++) {
            a = -1.5708 + i * Math.PI / n;
            rr = i % 2 ? r : R;
            p += (i ? ' L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
        }
        return p + 'Z';
    }
    function sparkle(cx, cy, r, fill) {
        return '<path d="M' + cx + ' ' + (cy - r) + ' Q' + (cx + r * 0.2) + ' ' + (cy - r * 0.2) + ' ' + (cx + r) + ' ' + cy + ' Q' + (cx + r * 0.2) + ' ' + (cy + r * 0.2) + ' ' + cx + ' ' + (cy + r) +
            ' Q' + (cx - r * 0.2) + ' ' + (cy + r * 0.2) + ' ' + (cx - r) + ' ' + cy + ' Q' + (cx - r * 0.2) + ' ' + (cy - r * 0.2) + ' ' + cx + ' ' + (cy - r) + 'Z" fill="' + fill + '"/>';
    }

    var BODIES = {
        round: { y: 62, d: function (c) { return '<ellipse cx="50" cy="68" rx="35" ry="40" fill="' + c + '"/>'; }, top: 28 },
        tall: { y: 54, d: function (c) { return '<rect x="22" y="20" width="56" height="92" rx="28" fill="' + c + '"/>'; }, top: 20 },
        drop: { y: 68, d: function (c) { return '<path d="M50 12 C80 48 88 70 80 94 C74 114 26 114 20 94 C12 70 20 48 50 12Z" fill="' + c + '"/>'; }, top: 14 },
        wide: { y: 70, d: function (c) { return '<ellipse cx="50" cy="78" rx="44" ry="34" fill="' + c + '"/>'; }, top: 46 },
        square: { y: 64, d: function (c) { return '<rect x="16" y="30" width="68" height="82" rx="18" fill="' + c + '"/>'; }, top: 30 },
        bush: { y: 66, d: function (c) { return '<circle cx="28" cy="74" r="24" fill="' + c + '"/><circle cx="72" cy="74" r="24" fill="' + c + '"/><circle cx="38" cy="48" r="26" fill="' + c + '"/><circle cx="62" cy="48" r="26" fill="' + c + '"/><ellipse cx="50" cy="80" rx="38" ry="28" fill="' + c + '"/>'; }, top: 24 },
        ghost: { y: 56, d: function (c) { return '<path d="M20 112 L20 54 C20 26 36 14 50 14 C64 14 80 26 80 54 L80 112 L69 102 L59 112 L50 102 L41 112 L31 102Z" fill="' + c + '"/>'; }, top: 14 },
        // Toy Attic bodies: rag doll (cloth head and dress), hobby-horse head on a stick, tin wind-up toy, soft plush
        doll: { y: 44, d: function (c) {
            var skin = mix(c, '#f6e4cc', 0.85), dark = mix(c, '#5a3a30', 0.25);
            return '<path d="M30 72 L70 72 L82 112 L18 112Z" fill="' + c + '"/><path d="M18 112 Q26 104 34 112 Q42 104 50 112 Q58 104 66 112 Q74 104 82 112" stroke="' + dark + '" stroke-width="3" fill="none"/>' +
                '<circle cx="50" cy="42" r="30" fill="' + skin + '"/>';
        }, top: 14 },
        pony: { y: 58, d: function (c) {
            var muzzle = mix(c, '#f6d8d0', 0.55), dark = mix(c, '#3a2a22', 0.45);
            return '<rect x="45" y="96" width="10" height="26" rx="4" fill="#9a6a3e"/>' +
                '<path d="M28 30 Q50 20 72 30 C82 50 76 72 69 92 Q66 106 50 106 Q34 106 31 92 C24 72 18 50 28 30Z" fill="' + c + '"/>' +
                '<path d="M29 80 Q50 88 71 80" stroke="#c4577a" stroke-width="5" fill="none"/><ellipse cx="50" cy="94" rx="18" ry="12" fill="' + muzzle + '"/><circle cx="43" cy="94" r="2.6" fill="' + dark + '"/><circle cx="57" cy="94" r="2.6" fill="' + dark + '"/>';
        }, top: 24 },
        tin: { y: 44, d: function (c) {
            var edge = mix(c, '#2a3038', 0.35), rivet = mix(c, '#ffffff', 0.55);
            return '<rect x="9" y="82" width="12" height="9" rx="4.5" fill="' + edge + '"/><rect x="79" y="82" width="12" height="9" rx="4.5" fill="' + edge + '"/>' +
                '<rect x="30" y="104" width="14" height="12" rx="3" fill="' + edge + '"/><rect x="56" y="104" width="14" height="12" rx="3" fill="' + edge + '"/>' +
                '<rect x="26" y="72" width="48" height="36" rx="7" fill="' + c + '"/><rect x="43" y="66" width="14" height="8" fill="' + edge + '"/>' +
                '<rect x="18" y="20" width="64" height="48" rx="11" fill="' + c + '"/>' +
                '<circle cx="50" cy="90" r="9" fill="#f3ead2"/><path d="M50 90 L55 84" stroke="#a33" stroke-width="2.4" stroke-linecap="round"/><circle cx="50" cy="90" r="1.8" fill="#333"/>' +
                '<circle cx="25" cy="27" r="2.4" fill="' + rivet + '"/><circle cx="75" cy="27" r="2.4" fill="' + rivet + '"/><circle cx="25" cy="61" r="2.4" fill="' + rivet + '"/><circle cx="75" cy="61" r="2.4" fill="' + rivet + '"/>' +
                '<circle cx="33" cy="78" r="2" fill="' + rivet + '"/><circle cx="67" cy="78" r="2" fill="' + rivet + '"/>';
        }, top: 20 },
        plush: { y: 62, d: function (c) {
            var foot = mix(c, '#b98a78', 0.35);
            return '<ellipse cx="33" cy="106" rx="13" ry="9" fill="' + foot + '"/><ellipse cx="67" cy="106" rx="13" ry="9" fill="' + foot + '"/>' +
                '<ellipse cx="50" cy="68" rx="36" ry="38" fill="' + c + '"/>';
        }, top: 32 },
        // Star Observatory bodies: sleepy moon, rounded star, comet head (tail is accBack 'swirl'), ringed planet
        moon: { y: 62, d: function (c) {
            var shade = mix(c, '#8a78c8', 0.35), rim = mix(c, '#ffffff', 0.6);
            return '<circle cx="50" cy="68" r="38" fill="' + c + '"/><path d="M50 30 A38 38 0 0 0 50 106 A44 38 0 0 1 50 30Z" fill="' + rim + '" opacity="0.55"/>' +
                '<circle cx="74" cy="46" r="6" fill="' + shade + '" opacity="0.5"/><circle cx="24" cy="88" r="5" fill="' + shade + '" opacity="0.5"/><circle cx="70" cy="98" r="4" fill="' + shade + '" opacity="0.5"/><circle cx="82" cy="72" r="3" fill="' + shade + '" opacity="0.5"/>';
        }, top: 30 },
        star: { y: 66, d: function (c) {
            return '<path d="' + starPath(50, 68, 46, 27, 5) + '" fill="' + c + '" stroke="' + c + '" stroke-width="12" stroke-linejoin="round"/>';
        }, top: 18 },
        comet: { y: 66, d: function (c) {
            var rim = mix(c, '#ffffff', 0.5);
            return '<circle cx="50" cy="66" r="34" fill="' + c + '"/><path d="M26 44 A34 34 0 0 1 56 33" stroke="' + rim + '" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>';
        }, top: 32 },
        planet: { y: 56, d: function (c, spec) {
            var ring = spec.ring || mix(c, '#ffe9b0', 0.7), ringBack = mix(ring, '#6a5aa8', 0.35), band = mix(c, '#ffffff', 0.45);
            return '<g transform="rotate(-10 50 84)"><ellipse cx="50" cy="84" rx="47" ry="10" fill="none" stroke="' + ringBack + '" stroke-width="7"/></g>' +
                '<circle cx="50" cy="60" r="32" fill="' + c + '"/><ellipse cx="50" cy="45" rx="27" ry="3.5" fill="' + band + '" opacity="0.28"/>' +
                '<g transform="rotate(-10 50 84)"><path d="M3 84 A47 10 0 0 0 97 84" fill="none" stroke="' + ring + '" stroke-width="7" stroke-linecap="round"/></g>';
        }, top: 28 }
    };

    function eyes(kind, y, horror) {
        var l = 38, r = 62;
        if (horror) {
            return '<ellipse cx="' + l + '" cy="' + y + '" rx="8" ry="10" fill="#07070d"/><ellipse cx="' + r + '" cy="' + y + '" rx="8" ry="10" fill="#07070d"/>' +
                '<circle cx="' + l + '" cy="' + (y + 1) + '" r="2.6" fill="#f3efb0"/><circle cx="' + r + '" cy="' + (y + 1) + '" r="2.6" fill="#f3efb0"/>';
        }
        if (kind === 'button') {
            return '<circle cx="' + l + '" cy="' + y + '" r="7" fill="#7a4a3a"/><circle cx="' + r + '" cy="' + y + '" r="7" fill="#7a4a3a"/>' +
                '<circle cx="' + (l - 2.4) + '" cy="' + y + '" r="1.4" fill="#e9d3b8"/><circle cx="' + (l + 2.4) + '" cy="' + y + '" r="1.4" fill="#e9d3b8"/>' +
                '<circle cx="' + (r - 2.4) + '" cy="' + y + '" r="1.4" fill="#e9d3b8"/><circle cx="' + (r + 2.4) + '" cy="' + y + '" r="1.4" fill="#e9d3b8"/>';
        }
        if (kind === 'big') {
            return '<circle cx="' + l + '" cy="' + y + '" r="10" fill="#fff"/><circle cx="' + r + '" cy="' + y + '" r="10" fill="#fff"/>' +
                '<circle cx="' + (l + 1) + '" cy="' + y + '" r="5" fill="#222"/><circle cx="' + (r + 1) + '" cy="' + y + '" r="5" fill="#222"/>';
        }
        if (kind === 'happy') {
            return '<path d="M30 ' + (y + 3) + ' Q38 ' + (y - 8) + '46 ' + (y + 3) + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>' +
                '<path d="M54 ' + (y + 3) + ' Q62 ' + (y - 8) + ' 70 ' + (y + 3) + '" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>';
        }
        if (kind === 'twinkle') {
            return sparkle(l, y, 11, '#3a1f66') + sparkle(r, y, 11, '#3a1f66') + '<circle cx="' + (l - 2) + '" cy="' + (y - 2) + '" r="2" fill="#fff"/><circle cx="' + (r - 2) + '" cy="' + (y - 2) + '" r="2" fill="#fff"/>';
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
        if (kind === 'stitch') return '<path d="M38 ' + y + ' Q50 ' + (y + 10) + ' 62 ' + y + '" stroke="#6b4a3a" stroke-width="3" stroke-dasharray="4 3" fill="none" stroke-linecap="round"/>';
        if (kind === 'grille') return '<rect x="38" y="' + (y - 5) + '" width="24" height="11" rx="3" fill="#2f3640"/><path d="M44 ' + (y - 5) + ' V' + (y + 6) + ' M50 ' + (y - 5) + ' V' + (y + 6) + ' M56 ' + (y - 5) + ' V' + (y + 6) + '" stroke="#aab4c0" stroke-width="2"/>';
        if (kind === 'hum') return '<ellipse cx="50" cy="' + y + '" rx="6" ry="4" fill="#6a2f55"/><path d="M69 ' + (y - 4) + ' L69 ' + (y - 16) + ' L76 ' + (y - 13) + '" stroke="#6a2f55" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="66.5" cy="' + (y - 4) + '" r="3.2" fill="#6a2f55"/>';
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
            case 'firefly':
                return '<circle cx="50" cy="' + (t - 4) + '" r="13" fill="' + c + '" opacity="0.3"/><circle cx="50" cy="' + (t - 4) + '" r="7" fill="' + c + '"/><path d="M50 ' + (t + 3) + ' L50 ' + (t + 12) + '" stroke="' + dim('#5a7a4a', horror) + '" stroke-width="2.5" stroke-linecap="round"/>';
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
            case 'braids':
                // yarn cap on the head plus tied bows (the plaits are drawn behind in accBack)
                return '<path d="M20 46 C16 4 84 4 80 46 Q70 22 50 20 Q30 22 20 46Z" fill="' + c + '"/><path d="M50 20 L50 32" stroke="' + mix(color || '#ff77aa', '#3a2a22', 0.4) + '" stroke-width="2"/>' +
                    '<circle cx="21" cy="50" r="4.5" fill="' + dim('#e98fae', horror) + '"/><circle cx="79" cy="50" r="4.5" fill="' + dim('#e98fae', horror) + '"/>';
            case 'mane':
                return '<path d="M34 ' + (t + 4) + ' Q50 ' + (t - 14) + ' 66 ' + (t + 4) + ' Q58 ' + (t + 2) + ' 56 ' + (t + 16) + ' Q50 ' + (t + 6) + ' 44 ' + (t + 16) + ' Q42 ' + (t + 2) + ' 34 ' + (t + 4) + 'Z" fill="' + c + '"/>';
            case 'horn':
                return '<path d="M30 ' + (t + 16) + ' L25 ' + (t - 6) + ' L45 ' + (t + 5) + 'Z M70 ' + (t + 16) + ' L75 ' + (t - 6) + ' L55 ' + (t + 5) + 'Z" fill="' + dim('#f4cfc8', horror) + '"/>' +
                    '<path d="M42 ' + (t + 8) + ' L58 ' + (t + 8) + ' L50 ' + (t - 26) + 'Z" fill="' + c + '"/>' +
                    '<path d="M44 ' + (t - 1) + ' L56 ' + (t - 5) + ' M46.5 ' + (t - 10) + ' L55 ' + (t - 13) + ' M48.5 ' + (t - 18) + ' L53 ' + (t - 20) + '" stroke="' + dim('#e0a85e', horror) + '" stroke-width="2.2" stroke-linecap="round"/>';
            case 'tuft':
                return '<path d="M36 ' + (t + 6) + ' Q22 ' + (t + 2) + ' 24 ' + (t + 22) + ' Q30 ' + (t + 14) + ' 40 ' + (t + 12) + 'Z" fill="' + c + '"/>';
            case 'nightcap':
                return '<path d="M26 ' + (t + 14) + ' C24 ' + (t - 12) + ' 56 ' + (t - 18) + ' 76 ' + (t - 2) + ' C88 ' + (t + 8) + ' 90 ' + (t + 22) + ' 86 ' + (t + 30) + ' C82 ' + (t + 20) + ' 76 ' + (t + 14) + ' 74 ' + (t + 14) + 'Z" fill="' + c + '"/>' +
                    '<rect x="24" y="' + (t + 8) + '" width="52" height="9" rx="4.5" fill="' + dim('#fff6fb', horror) + '"/><path d="' + starPath(86, t + 32, 8, 3.6, 5) + '" fill="' + dim('#ffe08a', horror) + '" stroke="#fff6fb" stroke-width="1.2" stroke-linejoin="round"/>';
            case 'wand':
                // a little glowing lightstick: lilac handle, soft glow, star-shaped tip
                return '<path d="M82 114 L91 62" stroke="' + dim('#b9a0ff', horror) + '" stroke-width="5" stroke-linecap="round"/><path d="M82 114 L84 104" stroke="#fff6fb" stroke-width="5" stroke-linecap="round"/>' +
                    '<circle cx="93" cy="48" r="15" fill="' + c + '" opacity="0.28"/><path d="' + starPath(93, 48, 11, 5, 5) + '" fill="' + c + '" stroke="#fff6fb" stroke-width="1.6" stroke-linejoin="round"/>';
            case 'sparkles':
                return sparkle(10, 24, 6, c) + sparkle(90, 14, 5, c) + sparkle(8, 82, 4, c) + sparkle(30, 6, 3.5, c);
            case 'cowhat':
                return '<path d="M30 ' + (t + 5) + ' C30 ' + (t - 16) + ' 38 ' + (t - 18) + ' 43 ' + (t - 14) + ' Q50 ' + (t - 8) + ' 57 ' + (t - 14) + ' C62 ' + (t - 18) + ' 70 ' + (t - 16) + ' 70 ' + (t + 5) + 'Z" fill="' + c + '"/>' +
                    '<path d="M13 ' + (t - 2) + ' Q18 ' + (t + 8) + ' 50 ' + (t + 8) + ' Q82 ' + (t + 8) + ' 87 ' + (t - 2) + ' Q80 ' + (t + 16) + ' 50 ' + (t + 15) + ' Q20 ' + (t + 16) + ' 13 ' + (t - 2) + 'Z" fill="' + c + '"/>' +
                    '<rect x="30" y="' + (t - 1) + '" width="40" height="6" fill="' + dim('#c9b8ff', horror) + '"/><path d="' + starPath(50, t + 2, 4.5, 2, 5) + '" fill="' + dim('#ffe08a', horror) + '"/>';
            default:
                return '';
        }
    }

    // Accessories drawn behind the body (wings, yarn plaits, pony ears and side mane, side mane locks, wind-up key).
    function accBack(kind, color, body, horror) {
        var t = body.top, c = dim(color || '#ff77aa', horror), s = '', i, y, dark;
        switch (kind) {
            case 'wings':
                return acc('wings', color, body, horror);
            case 'braids':
                dark = mix(color || '#ff77aa', '#3a2a22', 0.3);
                for (i = 0; i < 2; i++) {
                    var x = i ? 80 : 20;
                    for (y = 56; y < 104; y += 10) {
                        s += '<ellipse cx="' + x + '" cy="' + y + '" rx="7.5" ry="6.5" fill="' + (((y - 56) / 10) % 2 ? dim(dark, horror) : c) + '"/>';
                    }
                    s += '<circle cx="' + x + '" cy="108" r="4.5" fill="' + dim('#e98fae', horror) + '"/><path d="M' + (x - 5) + ' 112 L' + x + ' 108 L' + (x + 5) + ' 112" stroke="' + c + '" stroke-width="3" fill="none"/>';
                }
                return s;
            case 'mane':
                return '<path d="M30 ' + (t + 14) + ' L26 ' + (t - 14) + ' L48 ' + (t + 2) + 'Z M70 ' + (t + 14) + ' L74 ' + (t - 14) + ' L52 ' + (t + 2) + 'Z" fill="' + dim('#c49a6a', horror) + '"/>' +
                    '<path d="M32 ' + (t + 6) + ' L29 ' + (t - 6) + ' L40 ' + (t + 1) + 'Z M68 ' + (t + 6) + ' L71 ' + (t - 6) + ' L60 ' + (t + 1) + 'Z" fill="' + dim('#f0b6c4', horror) + '"/>' +
                    '<path d="M26 ' + (t + 6) + ' Q8 ' + (t + 34) + ' 20 ' + (t + 70) + ' Q22 ' + (t + 40) + ' 34 ' + (t + 20) + 'Z M74 ' + (t + 6) + ' Q92 ' + (t + 34) + ' 80 ' + (t + 70) + ' Q78 ' + (t + 40) + ' 66 ' + (t + 20) + 'Z" fill="' + c + '"/>';
            case 'tuft':
                for (i = 0; i < 3; i++) {
                    s += '<ellipse cx="' + (17 - i * 1) + '" cy="' + (t + 30 + i * 18) + '" rx="10" ry="12" fill="' + (i % 2 ? dim('#a8dccb', horror) : c) + '"/>';
                }
                return s;
            case 'swirl':
                // comet tail: a fat swirl that curls out behind the head, with a light stripe and tiny sparkles
                return '<path d="M32 74 C6 66 -2 100 16 108 C32 114 44 98 32 94" stroke="' + c + '" stroke-width="16" fill="none" stroke-linecap="round"/>' +
                    '<path d="M32 74 C6 66 -2 100 16 108 C32 114 44 98 32 94" stroke="' + mix(color || '#ff77aa', '#ffffff', 0.55) + '" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>' +
                    sparkle(6, 54, 4, c) + sparkle(60, 112, 3.5, c);
            case 'windkey':
                return '<path d="M80 90 L94 90" stroke="#b9772e" stroke-width="3.5" stroke-linecap="round"/><path d="M94 90 C86 78 100 76 94 90 C86 102 100 104 94 90Z" fill="#d49a48" stroke="#b9772e" stroke-width="1.5"/>';
            default:
                return '';
        }
    }

    function star(cx, cy, R, fill) {
        var p = '', i, a, r;
        for (i = 0; i < 10; i++) {
            a = -1.5708 + i * 0.62832;
            r = i % 2 ? R * 0.45 : R;
            p += (i ? ' L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
        }
        return '<path d="' + p + 'Z" fill="' + fill + '" stroke="#e0a85e" stroke-width="1.2" stroke-linejoin="round"/>';
    }

    function make(spec, horror) {
        var body = BODIES[spec.body] || BODIES.round;
        var col = horror ? mix(spec.color, '#2a2a40', 0.62) : spec.color;
        var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 132">';
        if (spec.acc) s += accBack(spec.acc, spec.accColor, body, horror);
        if (spec.acc2) s += accBack(spec.acc2, spec.acc2Color, body, horror);
        s += body.d(col, spec);
        if (!horror) s += '<ellipse cx="38" cy="' + (body.y - 18) + '" rx="10" ry="5" fill="#fff" opacity="0.25"/>';
        if (spec.cheeks && !horror) s += '<circle cx="28" cy="' + (body.y + 10) + '" r="5" fill="#ff7a9a" opacity="0.45"/><circle cx="72" cy="' + (body.y + 10) + '" r="5" fill="#ff7a9a" opacity="0.45"/>';
        if (spec.patch && !horror) s += '<rect x="42" y="86" width="16" height="16" rx="2" fill="' + spec.patch + '" stroke="#fff6e6" stroke-width="1.5" stroke-dasharray="3 2"/>';
        s += eyes(spec.eyes, body.y, horror);
        s += mouth(spec.mouth, body.y, horror);
        if (spec.mark === 'star' && !horror) s += star(68, body.y + 6, 9, '#ffe08a');
        if (spec.acc && spec.acc !== 'wings') s += acc(spec.acc, spec.accColor, body, horror);
        if (spec.acc2 && spec.acc2 !== 'wings') s += acc(spec.acc2, spec.acc2Color, body, horror);
        return s + '</svg>';
    }

    function dataUri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

    w.NightliteArt = { make: make, dataUri: dataUri };
})(window);
