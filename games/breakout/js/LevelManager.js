export default class LevelManager {
    static serialize(level) {
        // level = { rows: 5, cols: 8, grid: [[type, color], ...], paddle: {color: ...}, ball: {color: ...} }
        // Simple encoding: Base64 JSON
        try {
            const json = JSON.stringify(level);
            return btoa(json);
        } catch (e) {
            console.error("Failed to serialize level", e);
            return "";
        }
    }

    static deserialize(code) {
        try {
            const json = atob(code);
            return JSON.parse(json);
        } catch (e) {
            console.error("Failed to deserialize level", e);
            return null;
        }
    }
}
