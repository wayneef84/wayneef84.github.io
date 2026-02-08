// games/puzzller/js/levels.js

const LEVELS = [
    // Level 1: Tutorial
    [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 2: The Corridor
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 3, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    // Level 3: Maze
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 1, 0, 0, 0, 1, 3, 1],
        [1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
];

// Export for module usage (if we switch to modules later) or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LEVELS;
} else {
    window.LEVELS = LEVELS;
}
