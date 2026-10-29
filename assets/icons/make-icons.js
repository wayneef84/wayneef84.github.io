/**
 * Generates the PWA icons in this folder (original art: a game controller).
 * Run from the repo root:  node assets/icons/make-icons.js
 * Needs only Node (zlib and fs). Not loaded by any page.
 * Output: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png (180).
 */
var fs = require('fs');
var zlib = require('zlib');
var path = require('path');

var BG = [26, 29, 62];
var CYAN = [0, 229, 255];
var DARK = [15, 17, 23];
var PINK = [255, 0, 85];
var GOLD = [245, 158, 11];

function boxDist(x, y, cx, cy, hw, hh, r) {
    var qx = Math.abs(x - cx) - (hw - r);
    var qy = Math.abs(y - cy) - (hh - r);
    var ox = Math.max(qx, 0);
    var oy = Math.max(qy, 0);
    return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
}
function circDist(x, y, cx, cy, r) {
    var dx = x - cx;
    var dy = y - cy;
    return Math.sqrt(dx * dx + dy * dy) - r;
}

// Colour at (x, y) in -0.5..0.5 art space, k = content scale
function shade(x, y, k) {
    x = x / k;
    y = y / k;
    var body = Math.min(
        boxDist(x, y, 0, -0.02, 0.27, 0.13, 0.10),
        circDist(x, y, -0.20, 0.07, 0.115),
        circDist(x, y, 0.20, 0.07, 0.115)
    );
    if (body > 0) { return BG; }
    if (Math.min(boxDist(x, y, -0.15, -0.02, 0.065, 0.02, 0.01), boxDist(x, y, -0.15, -0.02, 0.02, 0.065, 0.01)) < 0) { return DARK; }
    if (circDist(x, y, 0.13, 0.015, 0.034) < 0) { return PINK; }
    if (circDist(x, y, 0.20, -0.035, 0.034) < 0) { return GOLD; }
    if (boxDist(x, y, -0.035, -0.025, 0.022, 0.009, 0.009) < 0 || boxDist(x, y, 0.035, -0.025, 0.022, 0.009, 0.009) < 0) { return DARK; }
    return CYAN;
}

function render(size, k) {
    var SS = 3;
    var raw = Buffer.alloc(size * (size * 4 + 1));
    var p = 0;
    for (var py = 0; py < size; py++) {
        raw[p++] = 0;
        for (var px = 0; px < size; px++) {
            var r = 0, g = 0, b = 0;
            for (var sy = 0; sy < SS; sy++) {
                for (var sx = 0; sx < SS; sx++) {
                    var c = shade((px + (sx + 0.5) / SS) / size - 0.5, (py + (sy + 0.5) / SS) / size - 0.5, k);
                    r += c[0]; g += c[1]; b += c[2];
                }
            }
            var n = SS * SS;
            raw[p++] = Math.round(r / n);
            raw[p++] = Math.round(g / n);
            raw[p++] = Math.round(b / n);
            raw[p++] = 255;
        }
    }
    return raw;
}

var CRC = [];
(function () {
    for (var n = 0; n < 256; n++) {
        var c = n;
        for (var i = 0; i < 8; i++) { c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); }
        CRC[n] = c >>> 0;
    }
}());
function crc32(buf) {
    var c = 0xffffffff;
    for (var i = 0; i < buf.length; i++) { c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); }
    return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
    var len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    var td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    var crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(td), 0);
    return Buffer.concat([len, td, crc]);
}
function png(size, k) {
    var ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(render(size, k), { level: 9 })),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

var out = [
    ['icon-192.png', 192, 1.0],
    ['icon-512.png', 512, 1.0],
    ['icon-maskable-512.png', 512, 0.78],
    ['apple-touch-icon.png', 180, 1.0]
];
out.forEach(function (o) {
    fs.writeFileSync(path.join(__dirname, o[0]), png(o[1], o[2]));
    console.log('wrote ' + o[0]);
});
