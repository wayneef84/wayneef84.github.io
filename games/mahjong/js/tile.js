(function() {

    var Tile = function(id, x, y, z, type, value) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.value = value;

        this.width = 2;
        this.height = 2;

        this.isVisible = true;
        this.isRemoved = false;
        this.isSelected = false;

        // Visual state
        this.isHovered = false;
    };

    Tile.prototype.getBounds = function() {
        return {
            left: this.x - 1,
            right: this.x + 1,
            top: this.y - 1,
            bottom: this.y + 1,
            z: this.z
        };
    };

    // Check if this tile is covering a point (x, y) on the same Z plane
    Tile.prototype.containsPoint = function(px, py) {
        var b = this.getBounds();
        return px >= b.left && px < b.right && py >= b.top && py < b.bottom;
    };

    // Check if this tile intersects with another tile (assuming same Z or projected)
    Tile.prototype.intersects = function(other) {
        var b1 = this.getBounds();
        var b2 = other.getBounds();

        return !(b2.left >= b1.right ||
                 b2.right <= b1.left ||
                 b2.top >= b1.bottom ||
                 b2.bottom <= b1.top);
    };

    // Helper for matching logic
    Tile.prototype.matches = function(other) {
        if (!other) return false;
        if (this.id === other.id) return false;

        // Exact match for most types
        if (this.type === other.type) {
            // Flowers match any Flower
            if (this.type === 'FLOWERS') return true;
            // Seasons match any Season
            if (this.type === 'SEASONS') return true;

            // Others must match value
            return this.value === other.value;
        }

        return false;
    };

    // Export
    window.MahjongTile = Tile;

})();
