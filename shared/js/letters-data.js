// games/letters/assets/content.js

// --- 1. AUDIO LIBRARY (ENUMS) ---
// Define reusable sound sets here to keep the content clean.
const AUDIO_LIB = {
    PREFIXES: {
        GENERIC: ["Great Job", "Way to go", "Awesome", "Super", "Nice work"],
        EXCITED: ["Wow!", "Amazing!", "Boom!", "Oh my gosh!", "Spectacular!"],
        CALM: ["Good.", "Nice.", "Well done.", "Correct."]
    },
    SUFFIXES: {
        KENZIE: ["Go Kenzie!", "Kenzilla!", "Nuggie!", "Golden!"],
        GENERIC: ["Keep it up!", "You are smart!", "High Five!", "You did it!"],
        NONE: [] // Empty list for silence
    }
};

window.GAME_CONTENT = {
    "meta": { "title": "Fong Family Arcade", "version": "5.0" },
    
    // --- GLOBAL DEFAULTS (Lowest Priority) ---
    // If an Item or Pack doesn't specify audio, these are used.
    "globalAudio": {
        "A": AUDIO_LIB.PREFIXES.GENERIC,
        "C": AUDIO_LIB.SUFFIXES.KENZIE
    },

    "packs": [] 
};

// --- PACK 1: UPPERCASE ---
const PACK_UPPERCASE = {
    "id": "uppercase",
    "name": "ABC Uppercase",
    
    // PACK DEFAULTS (Medium Priority)
    "audioDefaults": {
        "A": AUDIO_LIB.PREFIXES.GENERIC,
        "C": AUDIO_LIB.SUFFIXES.KENZIE
    },

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
        "C": [ { "type": "arc", "cx": 55, "cy": 50, "rx": 35, "ry": 45, "start": 45, "end": 315, "direction": "ccw" } ],
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
        // RICH FORMAT EXAMPLE (Words enabled)
        "G": {
            "name": "G",
            "words": ["Giraffe", "Goat", "Guitar", "Green", "Gorilla"],
            "strokes": [
                { "type": "complex", "parts": [
                     { "type": "arc", "cx": 50, "cy": 50, "rx": 30, "ry": 45, "start": 315, "end": 0 },
                     { "type": "line", "start": [80, 50], "end": [50, 50] },
                     { "type": "line", "start": [80, 50], "end": [80, 95] }
                ]}
            ]
        },
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
        "O": [ { "type": "arc", "cx": 50, "cy": 50, "rx": 35, "ry": 45, "start": -90, "end": 270 } ],
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
        // RICH FORMAT EXAMPLE
        "S": {
            "name": "S",
            "words": ["Snake", "Sun", "Star", "Spider"],
            "strokes": [
                { "type": "complex", "parts": [
                    { "type": "arc", "cx": 50, "cy": 28, "rx": 20, "ry": 20, "start": 315, "end": 90 },
                    { "type": "arc", "cx": 50, "cy": 72, "rx": 24, "ry": 24, "start": 270, "end": 495 }
                ]}
            ]
        },
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
        "V": [ { "type": "line", "start": [15, 0], "end": [50, 100] }, { "type": "line", "start": [50, 100], "end": [85, 0] } ],
        "W": [
            { "type": "line", "start": [10, 0], "end": [30, 100] },
            { "type": "line", "start": [30, 100], "end": [50, 50] },
            { "type": "line", "start": [50, 50], "end": [70, 100] },
            { "type": "line", "start": [70, 100], "end": [90, 0] }
        ],
        "X": [ { "type": "line", "start": [20, 0], "end": [80, 100] }, { "type": "line", "start": [80, 0], "end": [20, 100] } ],
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

// --- PACK 2: LOWERCASE ---
const PACK_LOWERCASE = {
    "id": "lowercase",
    "name": "abc Lowercase",
    
    // PACK DEFAULTS: Use "Excited" prefixes for this pack
    "audioDefaults": {
        "A": AUDIO_LIB.PREFIXES.EXCITED,
        "C": AUDIO_LIB.SUFFIXES.KENZIE
    },

    "items": {
        "a": {
            "name": "Little A",
            "words": ["apple", "ant", "acorn"],
            "strokes": [
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 405, "direction": "ccw" },
                { "type": "line", "start": [75, 50], "end": [75, 100] }
            ]
        },
        "b": {
            "name": "Little B",
            "words": ["ball", "bear", "bed"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": -90, "end": 270 }
            ]
        },
        "c": {
            "name": "Little C",
            "words": ["cat", "cup", "car"],
            "strokes": [ { "type": "arc", "cx": 55, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 315, "direction": "ccw" } ]
        },
        "d": {
            "name": "Little D",
            "words": ["dog", "duck", "door"],
            "strokes": [
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 90, "end": 450, "direction": "ccw" },
                { "type": "line", "start": [75, 0], "end": [75, 100] }
            ]
        },
        "e": {
            "name": "Little E",
            "words": ["egg", "elf", "elephant"],
            "strokes": [
                { "type": "line", "start": [30, 75], "end": [75, 75] },
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 0, "end": -315 }
            ]
        },
        "f": {
            "name": "Little F",
            "words": ["fish", "fan", "funny"],
            "strokes": [
                { "type": "complex", "parts": [
                     { "type": "arc", "cx": 55, "cy": 25, "rx": 15, "ry": 25, "start": 0, "end": -180, "direction": "ccw" },
                     { "type": "line", "start": [40, 25], "end": [40, 100] }
                ]},
                { "type": "line", "start": [25, 50], "end": [65, 50] }
            ]
        },
        "g": {
            "name": "Little G",
            "words": ["goat", "game", "girl"],
            "strokes": [
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 405, "direction": "ccw" },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [75, 50], "end": [75, 100] },
                     { "type": "arc", "cx": 55, "cy": 100, "rx": 20, "ry": 20, "start": 0, "end": 145 }
                ]}
            ]
        },
        "h": {
            "name": "Little H",
            "words": ["hat", "hen", "hot"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [25, 80], "end": [25, 65] },
                     { "type": "arc", "cx": 50, "cy": 65, "rx": 25, "ry": 20, "start": 180, "end": 360 },
                     { "type": "line", "start": [75, 65], "end": [75, 100] }
                ]}
            ]
        },
        "i": {
            "name": "Little I",
            "words": ["ice", "ink", "in"],
            "strokes": [
                { "type": "line", "start": [50, 50], "end": [50, 100] },
                { "type": "line", "start": [50, 30], "end": [50, 31] } /* Dot */
            ]
        },
        "j": {
            "name": "Little J",
            "words": ["jam", "jet", "jump"],
            "strokes": [
                { "type": "complex", "parts": [
                    { "type": "line", "start": [60, 50], "end": [60, 100] },
                    { "type": "arc", "cx": 40, "cy": 100, "rx": 20, "ry": 20, "start": 0, "end": 150 }
                ]},
                { "type": "line", "start": [60, 30], "end": [60, 31] } /* Dot */
            ]
        },
        "k": {
            "name": "Little K",
            "words": ["kite", "key", "kick"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "line", "start": [70, 50], "end": [25, 75] },
                { "type": "line", "start": [45, 65], "end": [75, 100] }
            ]
        },
        "l": {
            "name": "Little L",
            "words": ["lion", "leg", "log"],
            "strokes": [ { "type": "line", "start": [50, 0], "end": [50, 100] } ]
        },
        "m": {
            "name": "Little M",
            "words": ["mom", "moon", "mouse"],
            "strokes": [
                { "type": "line", "start": [15, 50], "end": [15, 100] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [15, 85], "end": [15, 65] },
                     { "type": "arc", "cx": 35, "cy": 65, "rx": 20, "ry": 15, "start": 180, "end": 360 },
                     { "type": "line", "start": [55, 65], "end": [55, 100] }
                ]},
                { "type": "complex", "parts": [
                     { "type": "line", "start": [55, 85], "end": [55, 65] },
                     { "type": "arc", "cx": 75, "cy": 65, "rx": 20, "ry": 15, "start": 180, "end": 360 },
                     { "type": "line", "start": [95, 65], "end": [95, 100] }
                ]}
            ]
        },
        "n": {
            "name": "Little N",
            "words": ["no", "net", "nose"],
            "strokes": [
                { "type": "line", "start": [25, 50], "end": [25, 100] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [25, 85], "end": [25, 65] },
                     { "type": "arc", "cx": 50, "cy": 65, "rx": 25, "ry": 15, "start": 180, "end": 360 },
                     { "type": "line", "start": [75, 65], "end": [75, 100] }
                ]}
            ]
        },
        "o": {
            "name": "Little O",
            "words": ["owl", "on", "off"],
            "strokes": [ { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": -90, "end": 270 } ]
        },
        "p": {
            "name": "Little P",
            "words": ["pan", "pig", "pie"],
            "strokes": [
                { "type": "line", "start": [25, 50], "end": [25, 120] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [25, 95], "end": [25, 75] },
                     { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 180, "end": 360 },
                     { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 0, "end": 180 }
                ]}
            ]
        },
        "q": {
            "name": "Little Q",
            "words": ["queen", "quiet", "quack"],
            "strokes": [
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 90, "end": 450, "direction": "ccw" },
                { "type": "line", "start": [75, 50], "end": [75, 120] },
                { "type": "line", "start": [75, 120], "end": [85, 110] }
            ]
        },
        "r": {
            "name": "Little R",
            "words": ["red", "run", "rat"],
            "strokes": [
                { "type": "line", "start": [30, 50], "end": [30, 100] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [30, 90], "end": [30, 65] },
                     { "type": "arc", "cx": 52, "cy": 65, "rx": 22, "ry": 12, "start": 180, "end": 360 } 
                ]}
            ]
        },
        "s": {
            "name": "Little S",
            "words": ["sun", "see", "six"],
            "strokes": [
                 { "type": "complex", "parts": [
                    { "type": "arc", "cx": 50, "cy": 61, "rx": 11, "ry": 11, "start": 315, "end": 90 },
                    { "type": "arc", "cx": 50, "cy": 86, "rx": 14, "ry": 14, "start": 270, "end": 495 }
                ]}
            ]
        },
        "t": {
            "name": "Little T",
            "words": ["toy", "top", "two"],
            "strokes": [
                { "type": "line", "start": [50, 25], "end": [50, 90] },
                { "type": "arc", "cx": 60, "cy": 90, "rx": 10, "ry": 10, "start": 180, "end": 90, "direction": "ccw" },
                { "type": "line", "start": [30, 50], "end": [70, 50] }
            ]
        },
        "u": {
            "name": "Little U",
            "words": ["up", "us", "under"],
            "strokes": [
                { "type": "complex", "parts": [
                    { "type": "line", "start": [25, 50], "end": [25, 85] },
                    { "type": "arc", "cx": 50, "cy": 85, "rx": 25, "ry": 15, "start": 180, "end": 0, "direction": "ccw" },
                    { "type": "line", "start": [75, 85], "end": [75, 50] },
                    { "type": "line", "start": [75, 50], "end": [75, 100] }
                ]}
            ]
        },
        "v": {
            "name": "Little V",
            "words": ["van", "vest", "vet"],
            "strokes": [ { "type": "line", "start": [20, 50], "end": [50, 100] }, { "type": "line", "start": [50, 100], "end": [80, 50] } ]
        },
        "w": {
            "name": "Little W",
            "words": ["win", "wet", "web"],
            "strokes": [
                { "type": "line", "start": [10, 50], "end": [30, 100] },
                { "type": "line", "start": [30, 100], "end": [50, 50] },
                { "type": "line", "start": [50, 50], "end": [70, 100] },
                { "type": "line", "start": [70, 100], "end": [90, 50] }
            ]
        },
        "x": {
            "name": "Little X",
            "words": ["box", "fox", "fix"],
            "strokes": [ { "type": "line", "start": [25, 50], "end": [75, 100] }, { "type": "line", "start": [75, 50], "end": [25, 100] } ]
        },
        "y": {
            "name": "Little Y",
            "words": ["yes", "you", "yak"],
            "strokes": [
                { "type": "line", "start": [20, 50], "end": [50, 100] },
                { "type": "line", "start": [80, 50], "end": [38, 120] }
            ]
        },
        "z": {
            "name": "Little Z",
            "words": ["zoo", "zap", "zebra"],
            "strokes": [
                { "type": "line", "start": [25, 50], "end": [75, 50] },
                { "type": "line", "start": [75, 50], "end": [25, 100] },
                { "type": "line", "start": [25, 100], "end": [75, 100] }
            ]
        }
    }
};

// --- PACK 3: NUMBERS ---
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

// --- PACK 4: SHAPES ---
const PACK_SHAPES = {
    "id": "shapes",
    "name": "Fun Shapes",
    "items": {
        "○": [ { "type": "arc", "cx": 50, "cy": 50, "rx": 40, "ry": 40, "start": -90, "end": 270 } ],
        "□": [
            { "type": "line", "start": [20, 20], "end": [80, 20] },
            { "type": "line", "start": [80, 20], "end": [80, 80] },
            { "type": "line", "start": [80, 80], "end": [20, 80] },
            { "type": "line", "start": [20, 80], "end": [20, 20] }
        ],
        "△": [
            { "type": "line", "start": [50, 10], "end": [90, 90] },
            { "type": "line", "start": [90, 90], "end": [10, 90] },
            { "type": "line", "start": [10, 90], "end": [50, 10] }
        ],
        "⭐": [
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
        "❤️": [
           { "type": "complex", "parts": [
               { "type": "arc", "cx": 30, "cy": 30, "rx": 20, "ry": 20, "start": 180, "end": 0 },
               { "type": "arc", "cx": 70, "cy": 30, "rx": 20, "ry": 20, "start": 180, "end": 0 },
               { "type": "line", "start": [90, 30], "end": [50, 100] },
               { "type": "line", "start": [50, 100], "end": [10, 30] }
           ]}
        ]
    }
};

// --- PACK 5: WORDS ---
const PACK_WORDS = {
    "id": "words",
    "name": "🔤 Words",

    "audioDefaults": {
        "A": AUDIO_LIB.PREFIXES.EXCITED,
        "C": [] // No suffix for middle letters in word mode
    },

    "items": {
        "Kenzie": {
            "name": "Kenzie",
            "letters": ["K", "e", "n", "z", "i", "e"],
            "image": "assets/images/kenzie.jpg",
            "audioOverride": {
                "C": ["Go Kenzie!", "Kenzilla!", "Nuggie!", "Golden!"]
            }
        },
        "Dad": {
            "name": "Dad",
            "letters": ["D", "a", "d"],
            "image": "assets/images/dad.jpg",
            "audioOverride": {
                "C": ["Love you Dad!", "Great job!", "You did it!"]
            }
        },
        "Mom": {
            "name": "Mom",
            "letters": ["M", "o", "m"],
            "image": "assets/images/mom.jpg",
            "audioOverride": {
                "C": ["Love you Mom!", "Amazing!", "You're the best!"]
            }
        },
        "Dog": {
            "name": "Dog",
            "letters": ["D", "o", "g"],
            "image": "assets/images/dog.jpg"
        },
        "Cat": {
            "name": "Cat",
            "letters": ["C", "a", "t"],
            "image": "assets/images/cat.jpg"
        },
        "Butterfly": {
            "name": "Butterfly",
            "letters": ["B", "u", "t", "t", "e", "r", "f", "l", "y"],
            "image": "assets/images/butterfly.jpg"
        },
        "Giraffe": {
            "name": "Giraffe",
            "letters": ["G", "i", "r", "a", "f", "f", "e"],
            "image": "assets/images/giraffe.jpg"
        },
        "Elephant": {
            "name": "Elephant",
            "letters": ["E", "l", "e", "p", "h", "a", "n", "t"],
            "image": "assets/images/elephant.jpg"
        },
        "Rainbow": {
            "name": "Rainbow",
            "letters": ["R", "a", "i", "n", "b", "o", "w"],
            "image": "assets/images/rainbow.jpg"
        },
        "Unicorn": {
            "name": "Unicorn",
            "letters": ["U", "n", "i", "c", "o", "r", "n"],
            "image": "assets/images/unicorn.jpg"
        }
    }
};

// 3. ASSEMBLE PACKS
window.GAME_CONTENT.packs.push(PACK_UPPERCASE);
window.GAME_CONTENT.packs.push(PACK_LOWERCASE);
window.GAME_CONTENT.packs.push(PACK_NUMBERS);
window.GAME_CONTENT.packs.push(PACK_SHAPES);
window.GAME_CONTENT.packs.push(PACK_WORDS);