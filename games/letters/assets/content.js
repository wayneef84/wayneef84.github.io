// games/letters/assets/content.js

// 1. INITIALIZE CONTAINER
window.GAME_CONTENT = {
    "meta": { "title": "Fong Learning Packs", "version": "3.0" },
    "packs": [] 
};

// 2. DEFINE PACKS

const PACK_UPPERCASE = {
    "id": "uppercase",
    "name": "ABC Uppercase",
    "items": {
        "A": [
            { "type": "line", "start": [50, 0], "end": [25, 100] },
            { "type": "line", "start": [50, 0], "end": [75, 100] },
            { "type": "line", "start": [30, 65], "end": [70, 65] }
        ],
        "B": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 0], "end": [50, 0] },
                { "type": "arc", "cx": 50, "cy": 25, "rx": 25, "ry": 25, "start": -90, "end": 90 }
            ]},
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 50], "end": [50, 50] },
                { "type": "arc", "cx": 50, "cy": 75, "rx": 30, "ry": 25, "start": -90, "end": 90 },
                { "type": "line", "start": [50, 100], "end": [25, 100] }
            ]}
        ],
        "C": [
            { "type": "arc", "cx": 55, "cy": 50, "rx": 35, "ry": 45, "start": 45, "end": 315, "direction": "ccw" }
        ],
        "D": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 0], "end": [45, 0] },
                { "type": "arc", "cx": 45, "cy": 50, "rx": 35, "ry": 50, "start": -90, "end": 90 },
                { "type": "line", "start": [45, 100], "end": [25, 100] }
            ]}
        ],
        "E": [
            { "type": "line", "start": [30, 0], "end": [30, 100] },
            { "type": "line", "start": [30, 0], "end": [85, 0] },
            { "type": "line", "start": [30, 50], "end": [75, 50] },
            { "type": "line", "start": [30, 100], "end": [85, 100] }
        ],
        "F": [
            { "type": "line", "start": [30, 0], "end": [30, 100] },
            { "type": "line", "start": [30, 0], "end": [85, 0] },
            { "type": "line", "start": [30, 50], "end": [75, 50] }
        ],
        "G": [
            // FIXED G:
            // 1. Arc starts Top-Right (315) and wraps ALL the way to Right (0)
            // 2. Horizontal Bar: From Edge (80) to Center (50)
            // 3. Vertical Stem: From Edge (80) down to (95)
            { "type": "complex", "parts": [
                 { "type": "arc", "cx": 50, "cy": 50, "rx": 30, "ry": 45, "start": 315, "end": 0 },
                 { "type": "line", "start": [80, 50], "end": [50, 50] },
                 { "type": "line", "start": [80, 50], "end": [80, 95] }
            ]}
        ],
        "H": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "line", "start": [75, 0], "end": [75, 100] },
            { "type": "line", "start": [25, 50], "end": [75, 50] }
        ],
        "I": [
            { "type": "line", "start": [30, 0], "end": [70, 0] },
            { "type": "line", "start": [50, 0], "end": [50, 100] },
            { "type": "line", "start": [30, 100], "end": [70, 100] }
        ],
        "J": [
            { "type": "line", "start": [40, 0], "end": [80, 0] },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [60, 0], "end": [60, 70] },
                 { "type": "arc", "cx": 40, "cy": 70, "rx": 20, "ry": 30, "start": 0, "end": 180 }
            ]}
        ],
        "K": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "line", "start": [75, 0], "end": [25, 60] },
            { "type": "line", "start": [40, 40], "end": [85, 100] }
        ],
        "L": [
            { "type": "line", "start": [30, 0], "end": [30, 100] },
            { "type": "line", "start": [30, 100], "end": [85, 100] }
        ],
        "M": [
            { "type": "line", "start": [15, 100], "end": [15, 0] },
            { "type": "line", "start": [15, 0], "end": [50, 60] },
            { "type": "line", "start": [50, 60], "end": [85, 0] },
            { "type": "line", "start": [85, 0], "end": [85, 100] }
        ],
        "N": [
            { "type": "line", "start": [25, 100], "end": [25, 0] },
            { "type": "line", "start": [25, 0], "end": [75, 100] },
            { "type": "line", "start": [75, 100], "end": [75, 0] }
        ],
        "O": [
            { "type": "arc", "cx": 50, "cy": 50, "rx": 35, "ry": 45, "start": -90, "end": 270 }
        ],
        "P": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 0], "end": [50, 0] },
                { "type": "arc", "cx": 50, "cy": 25, "rx": 30, "ry": 25, "start": -90, "end": 90 },
                { "type": "line", "start": [50, 50], "end": [25, 50] }
            ]}
        ],
        "Q": [
            { "type": "arc", "cx": 50, "cy": 45, "rx": 35, "ry": 45, "start": -90, "end": 270 },
            { "type": "line", "start": [60, 60], "end": [90, 100] }
        ],
        "R": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 0], "end": [50, 0] },
                { "type": "arc", "cx": 50, "cy": 25, "rx": 30, "ry": 25, "start": -90, "end": 90 },
                { "type": "line", "start": [50, 50], "end": [25, 50] }
            ]},
            { "type": "line", "start": [45, 50], "end": [85, 100] }
        ],
       "S": [
            // FIXED S (Balanced):
            // Top Loop: Smaller (Radius 20), Center Y=28
            // Bot Loop: Larger (Radius 24), Center Y=72
            // They meet perfectly at Y=48
            { "type": "complex", "parts": [
                { "type": "arc", "cx": 50, "cy": 28, "rx": 20, "ry": 20, "start": 315, "end": 90 },
                { "type": "arc", "cx": 50, "cy": 72, "rx": 24, "ry": 24, "start": 270, "end": 495 }
            ]}
        ],
        "T": [
            { "type": "line", "start": [15, 0], "end": [85, 0] },
            { "type": "line", "start": [50, 0], "end": [50, 100] }
        ],
        "U": [
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 0], "end": [25, 60] },
                { "type": "arc", "cx": 50, "cy": 60, "rx": 25, "ry": 40, "start": 180, "end": 0, "direction": "ccw" },
                { "type": "line", "start": [75, 60], "end": [75, 0] }
            ]}
        ],
        "V": [
            { "type": "line", "start": [15, 0], "end": [50, 100] },
            { "type": "line", "start": [50, 100], "end": [85, 0] }
        ],
        "W": [
            { "type": "line", "start": [10, 0], "end": [30, 100] },
            { "type": "line", "start": [30, 100], "end": [50, 50] },
            { "type": "line", "start": [50, 50], "end": [70, 100] },
            { "type": "line", "start": [70, 100], "end": [90, 0] }
        ],
        "X": [
            { "type": "line", "start": [20, 0], "end": [80, 100] },
            { "type": "line", "start": [80, 0], "end": [20, 100] }
        ],
        "Y": [
            { "type": "line", "start": [15, 0], "end": [50, 50] },
            { "type": "line", "start": [85, 0], "end": [50, 50] },
            { "type": "line", "start": [50, 50], "end": [50, 100] }
        ],
        "Z": [
            { "type": "line", "start": [20, 0], "end": [80, 0] },
            { "type": "line", "start": [80, 0], "end": [20, 100] },
            { "type": "line", "start": [20, 100], "end": [80, 100] }
        ]
    }
};

const PACK_LOWERCASE = {
    "id": "lowercase",
    "name": "abc Lowercase",
    "items": {
        "a": [
            { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 405, "direction": "ccw" },
            { "type": "line", "start": [75, 50], "end": [75, 100] }
        ],
        "b": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": -90, "end": 270 }
        ],
        "c": [ { "type": "arc", "cx": 55, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 315, "direction": "ccw" } ],
        "d": [
            { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 90, "end": 450, "direction": "ccw" },
            { "type": "line", "start": [75, 0], "end": [75, 100] }
        ],
        "e": [
            { "type": "line", "start": [30, 75], "end": [75, 75] },
            { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 0, "end": 315, "direction": "ccw" }
        ],
        "f": [
            { "type": "complex", "parts": [
                 { "type": "arc", "cx": 60, "cy": 25, "rx": 15, "ry": 25, "start": 0, "end": 180, "direction": "ccw" },
                 { "type": "line", "start": [45, 25], "end": [45, 100] }
            ]},
            { "type": "line", "start": [30, 50], "end": [70, 50] }
        ],
        "g": [
            { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 405, "direction": "ccw" },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [75, 50], "end": [75, 110] },
                 { "type": "arc", "cx": 45, "cy": 110, "rx": 30, "ry": 25, "start": 0, "end": 180 }
            ]}
        ],
        "h": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [25, 65], "end": [25, 50] },
                 { "type": "arc", "cx": 50, "cy": 70, "rx": 25, "ry": 20, "start": 180, "end": 0 },
                 { "type": "line", "start": [75, 70], "end": [75, 100] }
            ]}
        ],
        "i": [
            { "type": "line", "start": [50, 50], "end": [50, 100] },
            { "type": "line", "start": [50, 30], "end": [50, 31] } /* Dot */
        ],
        "j": [
            { "type": "line", "start": [60, 50], "end": [60, 110] },
            { "type": "arc", "cx": 35, "cy": 110, "rx": 25, "ry": 25, "start": 0, "end": 180 },
            { "type": "line", "start": [60, 30], "end": [60, 31] } /* Dot */
        ],
        "k": [
            { "type": "line", "start": [25, 0], "end": [25, 100] },
            { "type": "line", "start": [70, 50], "end": [25, 75] },
            { "type": "line", "start": [45, 65], "end": [75, 100] }
        ],
        "l": [ { "type": "line", "start": [50, 0], "end": [50, 100] } ],
        "m": [
            { "type": "line", "start": [15, 50], "end": [15, 100] },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [15, 80], "end": [15, 65] },
                 { "type": "arc", "cx": 35, "cy": 65, "rx": 20, "ry": 15, "start": 180, "end": 0 },
                 { "type": "line", "start": [55, 65], "end": [55, 100] }
            ]},
            { "type": "complex", "parts": [
                 { "type": "line", "start": [55, 80], "end": [55, 65] },
                 { "type": "arc", "cx": 75, "cy": 65, "rx": 20, "ry": 15, "start": 180, "end": 0 },
                 { "type": "line", "start": [95, 65], "end": [95, 100] }
            ]}
        ],
        "n": [
            { "type": "line", "start": [25, 50], "end": [25, 100] },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [25, 80], "end": [25, 65] },
                 { "type": "arc", "cx": 50, "cy": 65, "rx": 25, "ry": 15, "start": 180, "end": 0 },
                 { "type": "line", "start": [75, 65], "end": [75, 100] }
            ]}
        ],
        "o": [ { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": -90, "end": 270 } ],
        "p": [
            { "type": "line", "start": [25, 50], "end": [25, 125] },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [25, 95], "end": [25, 75] },
                 { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 180, "end": 360 },
                 { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 0, "end": 180 }
            ]}
        ],
        "q": [
            { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 90, "end": 450, "direction": "ccw" },
            { "type": "line", "start": [75, 50], "end": [75, 125] },
            { "type": "line", "start": [75, 125], "end": [85, 115] }
        ],
        "r": [
            { "type": "line", "start": [30, 50], "end": [30, 100] },
            { "type": "complex", "parts": [
                 { "type": "line", "start": [30, 90], "end": [30, 65] },
                 { "type": "arc", "cx": 55, "cy": 65, "rx": 25, "ry": 20, "start": 180, "end": 270 }
            ]}
        ],
        "s": [
             { "type": "complex", "parts": [
                { "type": "arc", "cx": 50, "cy": 62, "rx": 20, "ry": 12, "start": 135, "end": -45, "direction": "ccw" },
                { "type": "arc", "cx": 50, "cy": 88, "rx": 20, "ry": 12, "start": -45, "end": 135 }
            ]}
        ],
        "t": [
            { "type": "line", "start": [50, 10], "end": [50, 90] },
            { "type": "arc", "cx": 60, "cy": 90, "rx": 10, "ry": 10, "start": 180, "end": 90, "direction": "ccw" },
            { "type": "line", "start": [30, 50], "end": [70, 50] }
        ],
        "u": [
            { "type": "complex", "parts": [
                { "type": "line", "start": [25, 50], "end": [25, 85] },
                { "type": "arc", "cx": 50, "cy": 85, "rx": 25, "ry": 15, "start": 180, "end": 0, "direction": "ccw" },
                { "type": "line", "start": [75, 85], "end": [75, 50] },
                { "type": "line", "start": [75, 50], "end": [75, 100] }
            ]}
        ],
        "v": [ { "type": "line", "start": [20, 50], "end": [50, 100] }, { "type": "line", "start": [50, 100], "end": [80, 50] } ],
        "w": [
            { "type": "line", "start": [10, 50], "end": [30, 100] },
            { "type": "line", "start": [30, 100], "end": [50, 70] },
            { "type": "line", "start": [50, 70], "end": [70, 100] },
            { "type": "line", "start": [70, 100], "end": [90, 50] }
        ],
        "x": [ { "type": "line", "start": [25, 50], "end": [75, 100] }, { "type": "line", "start": [75, 50], "end": [25, 100] } ],
        "y": [
            { "type": "line", "start": [20, 50], "end": [45, 100] },
            { "type": "line", "start": [80, 50], "end": [20, 130] }
        ],
        "z": [
            { "type": "line", "start": [25, 50], "end": [75, 50] },
            { "type": "line", "start": [75, 50], "end": [25, 100] },
            { "type": "line", "start": [25, 100], "end": [75, 100] }
        ]
    }
};

const PACK_NUMBERS = {
    "id": "numbers",
    "name": "Numbers 0-9",
    "items": {
        "0": [ { "type": "arc", "cx": 50, "cy": 50, "rx": 30, "ry": 50, "start": -90, "end": 270 } ],
        "1": [ { "type": "line", "start": [50, 0], "end": [50, 100] } ],
        "2": [
            { "type": "complex", "parts": [
                { "type": "arc", "cx": 50, "cy": 30, "rx": 30, "ry": 30, "start": 180, "end": 45 },
                { "type": "line", "start": [71, 51], "end": [20, 100] },
                { "type": "line", "start": [20, 100], "end": [80, 100] }
            ]}
        ],
        "3": [
            { "type": "complex", "parts": [
                { "type": "arc", "cx": 50, "cy": 25, "rx": 25, "ry": 25, "start": 190, "end": 45 },
                { "type": "arc", "cx": 50, "cy": 75, "rx": 30, "ry": 25, "start": -45, "end": 190 }
            ]}
        ],
        "4": [
            { "type": "line", "start": [70, 0], "end": [70, 100] },
            { "type": "line", "start": [70, 0], "end": [20, 70] },
            { "type": "line", "start": [20, 70], "end": [90, 70] }
        ],
        "5": [
            { "type": "line", "start": [70, 0], "end": [30, 0] },
            { "type": "line", "start": [30, 0], "end": [30, 40] },
            { "type": "arc", "cx": 45, "cy": 65, "rx": 30, "ry": 35, "start": 200, "end": 90, "direction": "ccw" }
        ],
        "6": [
            { "type": "complex", "parts": [
                { "type": "arc", "cx": 50, "cy": 30, "rx": 30, "ry": 30, "start": 30, "end": 180, "direction": "ccw" },
                { "type": "line", "start": [20, 30], "end": [20, 70] },
                { "type": "arc", "cx": 50, "cy": 70, "rx": 30, "ry": 30, "start": 180, "end": 540 }
            ]}
        ],
        "7": [
            { "type": "line", "start": [20, 0], "end": [80, 0] },
            { "type": "line", "start": [80, 0], "end": [40, 100] }
        ],
        "8": [
            { "type": "arc", "cx": 50, "cy": 25, "rx": 25, "ry": 25, "start": 90, "end": 450 },
            { "type": "arc", "cx": 50, "cy": 75, "rx": 30, "ry": 25, "start": -90, "end": 270 }
        ],
        "9": [
            { "type": "complex", "parts": [
                { "type": "arc", "cx": 50, "cy": 35, "rx": 30, "ry": 35, "start": 90, "end": 450 },
                { "type": "line", "start": [80, 35], "end": [80, 70] },
                { "type": "arc", "cx": 50, "cy": 70, "rx": 30, "ry": 30, "start": 0, "end": 150 }
            ]}
        ]
    }
};

const PACK_SHAPES = {
    "id": "shapes",
    "name": "Fun Shapes",
    "items": {
        "○ Circle": [ { "type": "arc", "cx": 50, "cy": 50, "rx": 40, "ry": 40, "start": -90, "end": 270 } ],
        "□ Square": [
            { "type": "line", "start": [20, 20], "end": [80, 20] },
            { "type": "line", "start": [80, 20], "end": [80, 80] },
            { "type": "line", "start": [80, 80], "end": [20, 80] },
            { "type": "line", "start": [20, 80], "end": [20, 20] }
        ],
        "△ Triangle": [
            { "type": "line", "start": [50, 10], "end": [90, 90] },
            { "type": "line", "start": [90, 90], "end": [10, 90] },
            { "type": "line", "start": [10, 90], "end": [50, 10] }
        ],
        "⭐ Star": [
            { "type": "line", "start": [50, 0], "end": [65, 35] },
            { "type": "line", "start": [65, 35], "end": [100, 35] },
            { "type": "line", "start": [100, 35], "end": [75, 60] },
            { "type": "line", "start": [75, 60], "end": [85, 100] },
            { "type": "line", "start": [85, 100], "end": [50, 75] },
            { "type": "line", "start": [50, 75], "end": [15, 100] },
            { "type": "line", "start": [15, 100], "end": [25, 60] },
            { "type": "line", "start": [25, 60], "end": [0, 35] },
            { "type": "line", "start": [0, 35], "end": [35, 35] },
            { "type": "line", "start": [35, 35], "end": [50, 0] }
        ],
        "❤️ Heart": [
           { "type": "complex", "parts": [
               { "type": "arc", "cx": 30, "cy": 30, "rx": 20, "ry": 20, "start": 180, "end": 0 },
               { "type": "arc", "cx": 70, "cy": 30, "rx": 20, "ry": 20, "start": 180, "end": 0 },
               { "type": "line", "start": [90, 30], "end": [50, 100] },
               { "type": "line", "start": [50, 100], "end": [10, 30] }
           ]}
        ]
    }
};

// 3. ASSEMBLE PACKS
window.GAME_CONTENT.packs.push(PACK_UPPERCASE);
window.GAME_CONTENT.packs.push(PACK_LOWERCASE);
window.GAME_CONTENT.packs.push(PACK_NUMBERS);
window.GAME_CONTENT.packs.push(PACK_SHAPES);