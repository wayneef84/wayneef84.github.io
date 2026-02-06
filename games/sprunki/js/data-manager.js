class CustomSprunkiManager {
    constructor() {
        this.LEGACY_KEY = 's4k_custom_chars';
        this.DB_NAME = 'SprunkiDB';
        this.COLLECTION = 'custom_characters';

        this.db = new FongDB({
            name: this.DB_NAME,
            version: 1,
            stores: {
                'custom_characters': { keyPath: 'id' }
            },
            adapter: 'ls' // Force LocalStorage for consistency with request/legacy behavior
        });

        // Async Init
        this.ready = this.db.init().then(() => this.migrateLegacyData());
    }

    async migrateLegacyData() {
        const raw = localStorage.getItem(this.LEGACY_KEY);
        if (raw) {
            try {
                const chars = JSON.parse(raw);
                if (Array.isArray(chars) && chars.length > 0) {
                    console.log('[Sprunki] Migrating legacy data...');
                    for (const char of chars) {
                        // Check if already exists to avoid overwriting or duplicates if needed,
                        // but put() handles upsert.
                        await this.db.put(this.COLLECTION, char);
                    }
                    // Rename key to avoid re-migration or delete?
                    // Let's keep it as backup for now but mark migrated?
                    // Or just clear it to be clean.
                    localStorage.removeItem(this.LEGACY_KEY);
                    console.log('[Sprunki] Migration complete.');
                }
            } catch (e) {
                console.error('[Sprunki] Migration failed', e);
            }
        }
    }

    // Returns Promise<Array>
    async getCustomCharacters() {
        await this.ready;
        return this.db.getAll(this.COLLECTION);
    }

    async saveCharacter(charData) {
        await this.ready;
        await this.db.put(this.COLLECTION, charData);
        return true;
    }

    async deleteCharacter(id) {
        await this.ready;
        await this.db.delete(this.COLLECTION, id);
    }

    async importCharacter(jsonString) {
        await this.ready;
        try {
            const data = JSON.parse(jsonString);
            if (!data.name || !data.type || !data.img || !data.audio) {
                throw new Error("Invalid Sprunki Data: Missing required fields");
            }

            data.id = `custom_${Date.now()}_${Math.floor(Math.random()*1000)}`;
            data.pack_id = 'custom';
            data.custom = true;

            await this.saveCharacter(data);
            return data;
        } catch (e) {
            console.error("Import failed", e);
            throw e;
        }
    }
}

// Expose globally
window.CustomSprunkiManager = new CustomSprunkiManager();
