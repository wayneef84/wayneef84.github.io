window.GAME_CONTENT = {
    "meta": { "title": "Fong Learning Packs", "version": "4.0" },
    "packs": [] 
};

// --- PACK 1: UPPERCASE ---
const PACK_UPPERCASE = {
    "id": "uppercase",
    "name": "ABC Uppercase",
    "items": {
        "A": {
            "name": "A",
            "words": ["Apple", "Ant", "Alligator", "Astronaut", "Airplane"],
            "strokes": [
                { "type": "line", "start": [50, 0], "end": [25, 100] },
                { "type": "line", "start": [50, 0], "end": [75, 100] },
                { "type": "line", "start": [30, 65], "end": [70, 65] }
            ]
        },
        "B": {
            "name": "B",
            "words": ["Ball", "Bear", "Butterfly", "Banana", "Boat", "Balloon"],
            "strokes": [
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
            ]
        },
        "C": {
            "name": "C",
            "words": ["Cat", "Car", "Cake", "Cookie", "Cow", "Cup"],
            "strokes": [ { "type": "arc", "cx": 55, "cy": 50, "rx": 35, "ry": 45, "start": 45, "end": 315, "direction": "ccw" } ]
        },
        "D": {
            "name": "D",
            "words": ["Dog", "Duck", "Dinosaur", "Dolphin", "Drum", "Donut"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "complex", "parts": [
                    { "type": "line", "start": [25, 0], "end": [45, 0] },
                    { "type": "arc", "cx": 45, "cy": 50, "rx": 35, "ry": 50, "start": -90, "end": 90 },
                    { "type": "line", "start": [45, 100], "end": [25, 100] }
                ]}
            ]
        },
        "E": {
            "name": "E",
            "words": ["Elephant", "Egg", "Eagle", "Ear", "Engine"],
            "strokes": [
                { "type": "line", "start": [30, 0], "end": [30, 100] },
                { "type": "line", "start": [30, 0], "end": [85, 0] },
                { "type": "line", "start": [30, 50], "end": [75, 50] },
                { "type": "line", "start": [30, 100], "end": [85, 100] }
            ]
        },
        "F": {
            "name": "F",
            "words": ["Fish", "Frog", "Flower", "Fan", "Fox", "Fire"],
            "strokes": [
                { "type": "line", "start": [30, 0], "end": [30, 100] },
                { "type": "line", "start": [30, 0], "end": [85, 0] },
                { "type": "line", "start": [30, 50], "end": [75, 50] }
            ]
        },
        "G": {
            "name": "G",
            "words": ["Giraffe", "Goat", "Guitar", "Green", "Gorilla", "Game"],
            "strokes": [
                { "type": "complex", "parts": [
                     { "type": "arc", "cx": 50, "cy": 50, "rx": 30, "ry": 45, "start": 315, "end": 0 },
                     { "type": "line", "start": [80, 50], "end": [50, 50] },
                     { "type": "line", "start": [80, 50], "end": [80, 95] }
                ]}
            ]
        },
        "H": {
            "name": "H",
            "words": ["Hat", "House", "Horse", "Hippo", "Hand", "Heart"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "line", "start": [75, 0], "end": [75, 100] },
                { "type": "line", "start": [25, 50], "end": [75, 50] }
            ]
        },
        "I": {
            "name": "I",
            "words": ["Igloo", "Ice Cream", "Insect", "Island", "Ink"],
            "strokes": [
                { "type": "line", "start": [30, 0], "end": [70, 0] },
                { "type": "line", "start": [50, 0], "end": [50, 100] },
                { "type": "line", "start": [30, 100], "end": [70, 100] }
            ]
        },
        "J": {
            "name": "J",
            "words": ["Jellyfish", "Juice", "Jar", "Jacket", "Jet", "Jump"],
            "strokes": [
                { "type": "line", "start": [40, 0], "end": [80, 0] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [60, 0], "end": [60, 70] },
                     { "type": "arc", "cx": 40, "cy": 70, "rx": 20, "ry": 30, "start": 0, "end": 180 }
                ]}
            ]
        },
        "K": {
            "name": "K",
            "words": ["Kite", "Kangaroo", "King", "Key", "Koala", "Kitten"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "line", "start": [75, 0], "end": [25, 60] },
                { "type": "line", "start": [40, 40], "end": [85, 100] }
            ]
        },
        "L": {
            "name": "L",
            "words": ["Lion", "Leaf", "Lemon", "Ladybug", "Lamp"],
            "strokes": [
                { "type": "line", "start": [30, 0], "end": [30, 100] },
                { "type": "line", "start": [30, 100], "end": [85, 100] }
            ]
        },
        "M": {
            "name": "M",
            "words": ["Monkey", "Mouse", "Moon", "Milk", "Map", "Mom"],
            "strokes": [
                { "type": "line", "start": [15, 100], "end": [15, 0] },
                { "type": "line", "start": [15, 0], "end": [50, 60] },
                { "type": "line", "start": [50, 60], "end": [85, 0] },
                { "type": "line", "start": [85, 0], "end": [85, 100] }
            ]
        },
        "N": {
            "name": "N",
            "words": ["Nest", "Nose", "Net", "Nine", "Night"],
            "strokes": [
                { "type": "line", "start": [25, 100], "end": [25, 0] },
                { "type": "line", "start": [25, 0], "end": [75, 100] },
                { "type": "line", "start": [75, 100], "end": [75, 0] }
            ]
        },
        "O": {
            "name": "O",
            "words": ["Octopus", "Orange", "Owl", "Ocean", "Onion"],
            "strokes": [ { "type": "arc", "cx": 50, "cy": 50, "rx": 35, "ry": 45, "start": -90, "end": 270 } ]
        },
        "P": {
            "name": "P",
            "words": ["Pig", "Pizza", "Penguin", "Pumpkin", "Pencil", "Pop"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "complex", "parts": [
                    { "type": "line", "start": [25, 0], "end": [50, 0] },
                    { "type": "arc", "cx": 50, "cy": 25, "rx": 30, "ry": 25, "start": -90, "end": 90 },
                    { "type": "line", "start": [50, 50], "end": [25, 50] }
                ]}
            ]
        },
        "Q": {
            "name": "Q",
            "words": ["Queen", "Quail", "Quilt", "Quiet", "Question"],
            "strokes": [
                { "type": "arc", "cx": 50, "cy": 45, "rx": 35, "ry": 45, "start": -90, "end": 270 },
                { "type": "line", "start": [60, 60], "end": [90, 100] }
            ]
        },
        "R": {
            "name": "R",
            "words": ["Rabbit", "Rainbow", "Robot", "Rocket", "Rose", "Rain"],
            "strokes": [
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                { "type": "complex", "parts": [
                    { "type": "line", "start": [25, 0], "end": [50, 0] },
                    { "type": "arc", "cx": 50, "cy": 25, "rx": 30, "ry": 25, "start": -90, "end": 90 },
                    { "type": "line", "start": [50, 50], "end": [25, 50] }
                ]},
                { "type": "line", "start": [45, 50], "end": [85, 100] }
            ]
        },
        "S": {
            "name": "S",
            "words": ["Snake", "Sun", "Star", "Spider", "Sandwich", "Spoon"],
            "strokes": [
                { "type": "complex", "parts": [
                    { "type": "arc", "cx": 50, "cy": 28, "rx": 20, "ry": 20, "start": 315, "end": 90 },
                    { "type": "arc", "cx": 50, "cy": 72, "rx": 24, "ry": 24, "start": 270, "end": 495 }
                ]}
            ]
        },
        "T": {
            "name": "T",
            "words": ["Turtle", "Tiger", "Tree", "Train", "Table", "Truck"],
            "strokes": [
                { "type": "line", "start": [15, 0], "end": [85, 0] },
                { "type": "line", "start": [50, 0], "end": [50, 100] }
            ]
        },
        "U": {
            "name": "U",
            "words": ["Umbrella", "Unicorn", "Under", "Up"],
            "strokes": [
                { "type": "complex", "parts": [
                    { "type": "line", "start": [25, 0], "end": [25, 60] },
                    { "type": "arc", "cx": 50, "cy": 60, "rx": 25, "ry": 40, "start": 180, "end": 0, "direction": "ccw" },
                    { "type": "line", "start": [75, 60], "end": [75, 0] }
                ]}
            ]
        },
        "V": {
            "name": "V",
            "words": ["Violin", "Volcano", "Van", "Vegetable", "Vase"],
            "strokes": [ { "type": "line", "start": [15, 0], "end": [50, 100] }, { "type": "line", "start": [50, 100], "end": [85, 0] } ]
        },
        "W": {
            "name": "W",
            "words": ["Whale", "Watermelon", "Watch", "Wagon", "Wolf"],
            "strokes": [
                { "type": "line", "start": [10, 0], "end": [30, 100] },
                { "type": "line", "start": [30, 100], "end": [50, 50] },
                { "type": "line", "start": [50, 50], "end": [70, 100] },
                { "type": "line", "start": [70, 100], "end": [90, 0] }
            ]
        },
        "X": {
            "name": "X",
            "words": ["X-ray", "Xylophone", "Box", "Fox", "Six"],
            "strokes": [ { "type": "line", "start": [20, 0], "end": [80, 100] }, { "type": "line", "start": [80, 0], "end": [20, 100] } ]
        },
        "Y": {
            "name": "Y",
            "words": ["Yo-yo", "Yellow", "Yak", "Yarn", "Yogurt"],
            "strokes": [
                { "type": "line", "start": [15, 0], "end": [50, 50] },
                { "type": "line", "start": [85, 0], "end": [50, 50] },
                { "type": "line", "start": [50, 50], "end": [50, 100] }
            ]
        },
        "Z": {
            "name": "Z",
            "words": ["Zebra", "Zoo", "Zipper", "Zero", "Zigzag"],
            "strokes": [
                { "type": "line", "start": [20, 0], "end": [80, 0] },
                { "type": "line", "start": [80, 0], "end": [20, 100] },
                { "type": "line", "start": [20, 100], "end": [80, 100] }
            ]
        }
    }
};

// --- PACK 2: LOWERCASE (Rich Format) ---
const PACK_LOWERCASE = {
    "id": "lowercase",
    "name": "abc Lowercase",
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
                // Stroke 1: Crossbar (Middle Left to Middle Right)
                { "type": "line", "start": [25, 75], "end": [75, 75] },
                
                // Stroke 2: The Shell (Loops UP and AROUND)
                // Start: 0 (Right side of crossbar)
                // End: -315 (Bottom Right, wrapping the long way)
                { "type": "complex", "parts": [
                    { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 0, "end": -315 }
                ]}
            ]
        },
        "f": {
            "name": "Little F",
            "words": ["fish", "fan", "funny", "five", "frog"],
            "strokes": [
                // Stroke 1: The Cane (Hook + Down)
                // Hook: Starts Right (0), loops UP/Left to (-180)
                // Line: Drops straight down from x=40
                { "type": "complex", "parts": [
                     { "type": "arc", "cx": 55, "cy": 25, "rx": 15, "ry": 25, "start": 0, "end": -180, "direction": "ccw" },
                     { "type": "line", "start": [40, 25], "end": [40, 100] }
                ]},
                // Stroke 2: Crossbar
                { "type": "line", "start": [25, 50], "end": [65, 50] }
            ]
        },
        "g": {
            "name": "Little G",
            "words": ["goat", "game", "girl", "green", "garden"],
            "strokes": [
                // Stroke 1: The Circle (Standard x-height)
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 45, "end": 405, "direction": "ccw" },
                
                // Stroke 2: The Fish Hook (Shorter & Tighter)
                { "type": "complex", "parts": [
                     // 1. Line stops at baseline (100) instead of 115
                     { "type": "line", "start": [75, 50], "end": [75, 100] },
                     
                     // 2. Hook: Curves Left under the line
                     // Center (55, 100), Radius 20.
                     // Depth: 100 + 20 = 120 (Much cleaner)
                     { "type": "arc", "cx": 55, "cy": 100, "rx": 20, "ry": 20, "start": 0, "end": 145 }
                ]}
            ]
        },
        "h": {
            "name": "Little H",
            "words": ["hat", "hen", "hot", "house", "horse"],
            "strokes": [
                // Stroke 1: Stick Down
                { "type": "line", "start": [25, 0], "end": [25, 100] },
                
                // Stroke 2: The Hump (Fixed Math)
                { "type": "complex", "parts": [
                     { "type": "line", "start": [25, 80], "end": [25, 65] }, // Retrace Up
                     // FIXED: 180 to 360 forces the arc OVER the top
                     { "type": "arc", "cx": 50, "cy": 65, "rx": 25, "ry": 20, "start": 180, "end": 360 }, 
                     { "type": "line", "start": [75, 65], "end": [75, 100] } // Down
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
            "words": ["jam", "jet", "jump", "jelly", "jar"],
            "strokes": [
                // Stroke 1: Hook
                { "type": "complex", "parts": [
                    { "type": "line", "start": [60, 50], "end": [60, 100] }, // Stop at baseline
                    // Hook: Center (40, 100), Radius 20 -> Dips to Y=120
                    { "type": "arc", "cx": 40, "cy": 100, "rx": 20, "ry": 20, "start": 0, "end": 150 }
                ]},
                // Stroke 2: Dot
                { "type": "line", "start": [60, 30], "end": [60, 31] }
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
            "words": ["Monkey", "Moon", "Mouse", "Milk", "Map", "Mom"],
            "strokes": [
                // Stroke 1: Stick down
                { "type": "line", "start": [15, 50], "end": [15, 100] },
                
                // Stroke 2: First Hump (Arch)
                { "type": "complex", "parts": [
                     { "type": "line", "start": [15, 85], "end": [15, 65] }, // Retrace Up
                     { "type": "arc", "cx": 35, "cy": 65, "rx": 20, "ry": 15, "start": 180, "end": 360 }, // Arch Over (Top)
                     { "type": "line", "start": [55, 65], "end": [55, 100] } // Down
                ]},
                
                // Stroke 3: Second Hump (Arch)
                { "type": "complex", "parts": [
                     { "type": "line", "start": [55, 85], "end": [55, 65] }, // Retrace Up
                     { "type": "arc", "cx": 75, "cy": 65, "rx": 20, "ry": 15, "start": 180, "end": 360 }, // Arch Over (Top)
                     { "type": "line", "start": [95, 65], "end": [95, 100] } // Down
                ]}
            ]
        },
        "n": {
            "name": "Little N",
            "words": ["Nest", "Nose", "Net", "Night", "Nine", "Nut"],
            "strokes": [
                // Stroke 1: Stick down
                { "type": "line", "start": [25, 50], "end": [25, 100] },
                
                // Stroke 2: The Hump (Arch)
                { "type": "complex", "parts": [
                     { "type": "line", "start": [25, 85], "end": [25, 65] }, // Retrace Up
                     { "type": "arc", "cx": 50, "cy": 65, "rx": 25, "ry": 15, "start": 180, "end": 360 }, // Arch Over (Top)
                     { "type": "line", "start": [75, 65], "end": [75, 100] } // Down
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
            "words": ["pan", "pig", "pie", "pizza", "pen"],
            "strokes": [
                // Stroke 1: Down (Capped at 120)
                { "type": "line", "start": [25, 50], "end": [25, 120] },
                
                // Stroke 2: The Loop
                { "type": "complex", "parts": [
                     { "type": "line", "start": [25, 95], "end": [25, 75] },
                     { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 180, "end": 360 },
                     { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 0, "end": 180 }
                ]}
            ]
        },
        "q": {
            "name": "Little Q",
            "words": ["queen", "quiet", "quack", "quick", "quilt"],
            "strokes": [
                // Stroke 1: The Circle
                { "type": "arc", "cx": 50, "cy": 75, "rx": 25, "ry": 25, "start": 90, "end": 450, "direction": "ccw" },
                
                // Stroke 2: Down + Kick
                { "type": "line", "start": [75, 50], "end": [75, 120] }, // Stop at 120
                { "type": "line", "start": [75, 120], "end": [85, 110] } // Kick up
            ]
        },
        "r": {
            "name": "Little R",
            "words": ["red", "run", "rat", "robot", "rose"],
            "strokes": [
                { "type": "line", "start": [30, 50], "end": [30, 100] },
                { "type": "complex", "parts": [
                     { "type": "line", "start": [30, 90], "end": [30, 65] },
                     // FIXED: "Shoulder" shape. 
                     // Sharper curve (rx:22, ry:12) makes it look like a branch, not a hoop.
                     { "type": "arc", "cx": 52, "cy": 65, "rx": 22, "ry": 12, "start": 180, "end": 360 } 
                ]}
            ]
        },
        "s": {
            "name": "Little S",
            "words": ["sun", "see", "six", "star", "sock"],
            "strokes": [
                 // FIXED: Balanced "Bottom Heavy" geometry
                 // Top: R=11 | Bot: R=14 | Meet at Y=72
                 { "type": "complex", "parts": [
                    { "type": "arc", "cx": 50, "cy": 61, "rx": 11, "ry": 11, "start": 315, "end": 90 },
                    { "type": "arc", "cx": 50, "cy": 86, "rx": 14, "ry": 14, "start": 270, "end": 495 }
                ]}
            ]
        },
        "t": {
            "name": "Little T",
            "words": ["toy", "top", "two", "ten", "turtle"],
            "strokes": [
                // 1. Vertical Line: Starts lower (y=25) so it's shorter than 'l' or 'h'
                { "type": "line", "start": [50, 25], "end": [50, 90] },
                // 2. The Curl (Bottom)
                { "type": "arc", "cx": 60, "cy": 90, "rx": 10, "ry": 10, "start": 180, "end": 90, "direction": "ccw" },
                // 3. Crossbar
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
            "words": ["win", "wet", "web", "water", "worm"],
            "strokes": [
                // 1. Down
                { "type": "line", "start": [10, 50], "end": [30, 100] },
                // 2. Up to Middle (Level with top: Y=50)
                { "type": "line", "start": [30, 100], "end": [50, 50] },
                // 3. Down
                { "type": "line", "start": [50, 50], "end": [70, 100] },
                // 4. Up to End
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
            "words": ["yes", "you", "yak", "yellow", "yoyo"],
            "strokes": [
                // 1. Short Diagonal (Left to Center)
                { "type": "line", "start": [20, 50], "end": [50, 100] },
                
                // 2. Long Diagonal (Right to Descender)
                // Capped at Y=120 (The Safe Zone)
                // Math: Passing through (50,100) to keep it straight
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

// 3. ASSEMBLE PACKS
window.GAME_CONTENT.packs.push(PACK_UPPERCASE);
window.GAME_CONTENT.packs.push(PACK_LOWERCASE);
window.GAME_CONTENT.packs.push(PACK_NUMBERS);
window.GAME_CONTENT.packs.push(PACK_SHAPES);