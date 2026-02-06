class CustomSprunkiManager {
    constructor() {
        this.STORAGE_KEY = 's4k_custom_chars';
    }

    getCustomCharacters() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to load custom characters", e);
            return [];
        }
    }

    saveCharacter(charData) {
        const chars = this.getCustomCharacters();
        const existingIndex = chars.findIndex(c => c.id === charData.id);

        if (existingIndex >= 0) {
            chars[existingIndex] = charData;
        } else {
            chars.push(charData);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chars));
        return true;
    }

    deleteCharacter(id) {
        const chars = this.getCustomCharacters();
        const filtered = chars.filter(c => c.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }

    importCharacter(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // Basic Validation
            if (!data.name || !data.type || !data.img || !data.audio) {
                throw new Error("Invalid Sprunki Data: Missing required fields");
            }

            // Generate new ID to prevent conflicts on import
            data.id = `custom_${Date.now()}_${Math.floor(Math.random()*1000)}`;
            data.pack_id = 'custom';
            data.custom = true;

            this.saveCharacter(data);
            return data;
        } catch (e) {
            console.error("Import failed", e);
            throw e;
        }
    }
}

// Expose globally
window.CustomSprunkiManager = new CustomSprunkiManager();
