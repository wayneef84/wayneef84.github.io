/**
 * faces.js - NPC profile faces as inline SVG built from a small spec. window.FFAFaces.make(spec, size).
 * Strict ES5. No images, no network. Elements are made with createElementNS (no innerHTML).
 * spec: { bg, skin, hair, style: 'short'|'long'|'curly'|'bun'|'bald', glasses: bool, hat: 'none'|'cap'|'beanie', hatColor, shirt }
 */
(function (root) {
    'use strict';
    var NS = 'http://www.w3.org/2000/svg';

    function color(c, dflt) { return typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c) ? c : dflt; }

    function el(parent, tag, attrs) {
        var n = document.createElementNS(NS, tag);
        for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) { n.setAttribute(k, String(attrs[k])); } }
        parent.appendChild(n);
        return n;
    }

    function make(spec, size) {
        spec = spec || {};
        var skin = color(spec.skin, '#e0ac69'), hair = color(spec.hair, '#222222'), bg = color(spec.bg, '#dbeafe');
        var shirt = color(spec.shirt, '#64748b'), hatC = color(spec.hatColor, '#2563eb');
        var style = spec.style || 'short', hat = spec.hat || 'none';
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', '0 0 64 64');
        svg.setAttribute('width', String(size || 48));
        svg.setAttribute('height', String(size || 48));
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-hidden', 'true');
        el(svg, 'circle', { cx: 32, cy: 32, r: 32, fill: bg });
        // back hair
        if (style === 'long') { el(svg, 'rect', { x: 14, y: 20, width: 36, height: 36, rx: 14, fill: hair }); }
        if (style === 'bun') { el(svg, 'circle', { cx: 32, cy: 8, r: 6, fill: hair }); }
        // shoulders and neck
        el(svg, 'path', { d: 'M8 64 C8 48 20 44 32 44 C44 44 56 48 56 64 Z', fill: shirt });
        el(svg, 'rect', { x: 28, y: 36, width: 8, height: 10, fill: skin });
        // ears and head
        el(svg, 'circle', { cx: 19, cy: 30, r: 3.5, fill: skin });
        el(svg, 'circle', { cx: 45, cy: 30, r: 3.5, fill: skin });
        el(svg, 'ellipse', { cx: 32, cy: 29, rx: 13, ry: 15, fill: skin });
        // front hair
        if (style === 'short') { el(svg, 'path', { d: 'M19 27 C19 12 45 12 45 27 C40 20 24 20 19 27 Z', fill: hair }); }
        else if (style === 'long') { el(svg, 'path', { d: 'M18 30 C16 10 48 10 46 30 C42 20 22 20 18 30 Z', fill: hair }); }
        else if (style === 'bun') { el(svg, 'path', { d: 'M19 27 C19 12 45 12 45 27 C40 19 24 19 19 27 Z', fill: hair }); }
        else if (style === 'curly') {
            var cx = [20, 26, 32, 38, 44];
            for (var i = 0; i < cx.length; i++) { el(svg, 'circle', { cx: cx[i], cy: i === 0 || i === 4 ? 21 : 15, r: 6.5, fill: hair }); }
        }
        // face
        el(svg, 'circle', { cx: 27, cy: 30, r: 1.8, fill: '#1f2937' });
        el(svg, 'circle', { cx: 37, cy: 30, r: 1.8, fill: '#1f2937' });
        el(svg, 'path', { d: 'M27 37 Q32 41 37 37', fill: 'none', stroke: '#7c2d12', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
        if (spec.glasses === true) {
            el(svg, 'circle', { cx: 27, cy: 30, r: 5, fill: 'none', stroke: '#111827', 'stroke-width': 1.5 });
            el(svg, 'circle', { cx: 37, cy: 30, r: 5, fill: 'none', stroke: '#111827', 'stroke-width': 1.5 });
            el(svg, 'line', { x1: 32, y1: 30, x2: 32, y2: 30, stroke: '#111827', 'stroke-width': 1.5 });
        }
        // hats
        if (hat === 'cap') {
            el(svg, 'path', { d: 'M18 24 C18 8 46 8 46 24 Z', fill: hatC });
            el(svg, 'rect', { x: 30, y: 21, width: 22, height: 4, rx: 2, fill: hatC });
        } else if (hat === 'beanie') {
            el(svg, 'path', { d: 'M18 25 C18 6 46 6 46 25 Z', fill: hatC });
            el(svg, 'rect', { x: 17, y: 22, width: 30, height: 5, rx: 2.5, fill: hatC, opacity: 0.85 });
            el(svg, 'circle', { cx: 32, cy: 7, r: 3, fill: hatC });
        }
        return svg;
    }

    root.FFAFaces = { make: make };
})(window);
