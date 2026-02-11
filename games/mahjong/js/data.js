var MahjongData = (function() {

    // Tile Types
    // 34 base types * 4 copies = 136
    // 8 flowers/seasons * 1 copy = 8
    // Total 144
    var TILE_TYPES = {
        DOTS: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        BAMS: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        CRAKS: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        WINDS: ['E', 'S', 'W', 'N'],
        DRAGONS: ['R', 'G', 'W'], // Red, Green, White
        FLOWERS: ['1', '2', '3', '4'],
        SEASONS: ['1', '2', '3', '4']
    };

    function getTurtleLayout() {
        var tiles = [];

        // Layer 0: 87 tiles
        // Logic: 12x8 rect, remove 4 corners, remove 9 center, add 4 ears.
        for (var x = -11; x <= 11; x += 2) {
            for (var y = -7; y <= 7; y += 2) {
                // Remove corners
                if (Math.abs(x) === 11 && Math.abs(y) === 7) continue;
                // Remove center 9
                if (Math.abs(x) <= 2 && Math.abs(y) <= 2) continue;

                tiles.push({x: x, y: y, z: 0});
            }
        }
        // Add ears
        tiles.push({x: -13, y: 0, z: 0});
        tiles.push({x: 13, y: 0, z: 0});
        tiles.push({x: -13, y: -2, z: 0}); // standard turtle ear position varies, this is fine
        tiles.push({x: 13, y: -2, z: 0});

        // Layer 1: 6x6 (36 tiles)
        for (var x = -5; x <= 5; x += 2) {
            for (var y = -5; y <= 5; y += 2) {
                tiles.push({x: x, y: y, z: 1});
            }
        }

        // Layer 2: 4x4 (16 tiles)
        for (var x = -3; x <= 3; x += 2) {
            for (var y = -3; y <= 3; y += 2) {
                tiles.push({x: x, y: y, z: 2});
            }
        }

        // Layer 3: 2x2 (4 tiles)
        for (var x = -1; x <= 1; x += 2) {
            for (var y = -1; y <= 1; y += 2) {
                tiles.push({x: x, y: y, z: 3});
            }
        }

        // Layer 4: 1 tile
        tiles.push({x: 0, y: 0, z: 4});

        return tiles;
    }

    return {
        TILE_TYPES: TILE_TYPES,
        LAYOUTS: {
            turtle: getTurtleLayout
        }
    };

})();
