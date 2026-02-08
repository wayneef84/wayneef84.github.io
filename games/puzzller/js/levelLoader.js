class LevelLoader {
    constructor(levels) {
        this.levels = levels;
    }

    loadLevel(levelIndex) {
        if (levelIndex < 0 || levelIndex >= this.levels.length) {
            console.error("Invalid level index:", levelIndex);
            return null;
        }

        const rawGrid = this.levels[levelIndex];
        const levelData = {
            grid: [],
            playerStart: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
            width: 0,
            height: 0
        };

        levelData.height = rawGrid.length;
        levelData.width = rawGrid[0].length;

        // Deep copy grid to avoid modifying original level data during runtime
        for (let y = 0; y < rawGrid.length; y++) {
            const row = [];
            for (let x = 0; x < rawGrid[y].length; x++) {
                const cell = rawGrid[y][x];
                row.push(cell);

                if (cell === 2) {
                    levelData.playerStart = { x, y };
                    // Replace player start with floor in grid so we don't collide with it later
                    row[x] = 0;
                } else if (cell === 3) {
                    levelData.target = { x, y };
                    // Keep target in grid if we want to draw it based on grid,
                    // or remove it if we handle it as an entity.
                    // For now, let's keep it as 3 in the grid for rendering simplicity.
                }
            }
            levelData.grid.push(row);
        }

        return levelData;
    }
}

// Export for module usage or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelLoader;
} else {
    window.LevelLoader = LevelLoader;
}
