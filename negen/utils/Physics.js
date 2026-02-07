export default {
    /**
     * Check collision between two rectangles.
     * Rects must have {x, y, w, h} properties.
     * @param {Object} rectA
     * @param {Object} rectB
     * @returns {boolean}
     */
    checkAABB(rectA, rectB) {
        return (
            rectA.x < rectB.x + rectB.w &&
            rectA.x + rectA.w > rectB.x &&
            rectA.y < rectB.y + rectB.h &&
            rectA.y + rectA.h > rectB.y
        );
    }
};
