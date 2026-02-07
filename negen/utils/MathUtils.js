export default {
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    },
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
};
