(function() {

    var Board = function() {
        this.tiles = [];
        this.history = []; // Undo stack
    };

    Board.prototype.init = function(layout) {
        this.tiles = [];
        this.history = [];

        // Generate full deck of 144 tiles
        var deck = [];
        var types = MahjongData.TILE_TYPES;

        // Add 4 of each suit/wind/dragon
        ['DOTS', 'BAMS', 'CRAKS'].forEach(function(suit) {
            types[suit].forEach(function(val) {
                for (var i = 0; i < 4; i++) deck.push({type: suit, value: val});
            });
        });

        types.WINDS.forEach(function(val) {
            for (var i = 0; i < 4; i++) deck.push({type: 'WINDS', value: val});
        });

        types.DRAGONS.forEach(function(val) {
            for (var i = 0; i < 4; i++) deck.push({type: 'DRAGONS', value: val});
        });

        // Add 1 of each flower/season
        types.FLOWERS.forEach(function(val) {
            deck.push({type: 'FLOWERS', value: val});
        });

        types.SEASONS.forEach(function(val) {
            deck.push({type: 'SEASONS', value: val});
        });

        // Shuffle deck
        this.shuffleArray(deck);

        // Create Tiles based on layout
        // Layout size should match deck size (144)
        // If layout is larger/smaller, we truncate or error?
        // My turtle layout generates 144 exactly.

        for (var i = 0; i < layout.length; i++) {
            if (i >= deck.length) break;

            var pos = layout[i];
            var card = deck[i];

            var tile = new MahjongTile(i, pos.x, pos.y, pos.z, card.type, card.value);
            this.tiles.push(tile);
        }
    };

    Board.prototype.shuffleArray = function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    };

    Board.prototype.isFree = function(tile) {
        if (tile.isRemoved) return false;

        var isBlockedTop = false;
        var isBlockedLeft = false;
        var isBlockedRight = false;

        // Check all other active tiles
        for (var i = 0; i < this.tiles.length; i++) {
            var other = this.tiles[i];
            if (other.id === tile.id || other.isRemoved) continue;

            // Check Top: Z + 1 and overlaps
            if (other.z === tile.z + 1) {
                if (tile.intersects(other)) {
                    isBlockedTop = true;
                }
            }

            // Check Left: Same Z and adjacent left
            // Tile width 2.
            // Left neighbor: other.x = tile.x - 2
            // And they must overlap in Y?
            // "Left" implies physically blocking the left side.
            // In Mahjong, if a tile is at (x-2, y), it blocks.
            // If it is at (x-2, y+1), it partially blocks.
            // Standard rule: Any tile at same Z that touches the left edge.
            // Tile Left Edge X: tile.x - 1.
            // Other Right Edge X: other.x + 1.
            // Touch condition: other.x + 1 >= tile.x - 1 -> other.x >= tile.x - 2.
            // And strictly to the left: other.x < tile.x.
            // Overlap Y: !(other.bottom <= tile.top || other.top >= tile.bottom)

            if (other.z === tile.z) {
                // Check Y overlap first
                var yOverlap = Math.abs(other.y - tile.y) < 2; // centers within 2

                if (yOverlap) {
                    // Check Left
                    if (other.x === tile.x - 2) isBlockedLeft = true;

                    // Check Right
                    if (other.x === tile.x + 2) isBlockedRight = true;
                }
            }

            if (isBlockedTop) return false;
        }

        // Free if Top is clear AND (Left is clear OR Right is clear)
        return !isBlockedTop && (!isBlockedLeft || !isBlockedRight);
    };

    Board.prototype.getFreeTiles = function() {
        var free = [];
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (!tile.isRemoved && this.isFree(tile)) {
                free.push(tile);
            }
        }
        return free;
    };

    Board.prototype.canMatch = function() {
        var free = this.getFreeTiles();
        for (var i = 0; i < free.length; i++) {
            for (var j = i + 1; j < free.length; j++) {
                if (free[i].matches(free[j])) return true;
            }
        }
        return false;
    };

    Board.prototype.getHint = function() {
        var free = this.getFreeTiles();
        for (var i = 0; i < free.length; i++) {
            for (var j = i + 1; j < free.length; j++) {
                if (free[i].matches(free[j])) {
                    return [free[i], free[j]];
                }
            }
        }
        return null;
    };

    Board.prototype.reshuffle = function() {
        // Collect active tiles
        var active = [];
        var activeIndices = [];

        for (var i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].isRemoved) {
                active.push({type: this.tiles[i].type, value: this.tiles[i].value});
                activeIndices.push(i);
            }
        }

        // Shuffle content
        this.shuffleArray(active);

        // Reassign
        for (var i = 0; i < activeIndices.length; i++) {
            var idx = activeIndices[i];
            this.tiles[idx].type = active[i].type;
            this.tiles[idx].value = active[i].value;
            this.tiles[idx].isSelected = false;
        }
    };

    Board.prototype.removePair = function(t1, t2) {
        t1.isRemoved = true;
        t2.isRemoved = true;
        t1.isSelected = false;
        t2.isSelected = false;
        this.history.push([t1, t2]);
    };

    Board.prototype.undo = function() {
        if (this.history.length === 0) return false;

        var pair = this.history.pop();
        pair[0].isRemoved = false;
        pair[1].isRemoved = false;
        return true;
    };

    Board.prototype.isWin = function() {
        for (var i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].isRemoved) return false;
        }
        return true;
    };

    window.MahjongBoard = Board;

})();
