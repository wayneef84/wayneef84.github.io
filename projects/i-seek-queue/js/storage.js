class StorageManager {
    constructor() {
        this.KEYS = {
            SETTINGS: 'iseekqueue_settings',
            HISTORY_SCANNED: 'iseekqueue_history_scanned',
            HISTORY_CREATED: 'iseekqueue_history_created'
        };
    }

    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? JSON.parse(data) : { detectMode: 'AUTO' };
        } catch (e) {
            console.error("Failed to load settings", e);
            return { detectMode: 'AUTO' };
        }
    }

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }

    getHistory(type) { // 'SCANNED' or 'CREATED'
        try {
            const key = type === 'SCANNED' ? this.KEYS.HISTORY_SCANNED : this.KEYS.HISTORY_CREATED;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    }

    addItem(type, item) {
        const list = this.getHistory(type);
        // Deduplicate? Or allow multiple? User said "save QR codes it scans if the user wants".
        // Created ones: "saved ... until deleted".
        // Let's add all, maybe with ID.
        item.timestamp = Date.now();
        item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        list.unshift(item); // Add to top

        const key = type === 'SCANNED' ? this.KEYS.HISTORY_SCANNED : this.KEYS.HISTORY_CREATED;
        localStorage.setItem(key, JSON.stringify(list));
    }

    removeItem(type, id) {
        let list = this.getHistory(type);
        list = list.filter(i => i.id !== id);
        const key = type === 'SCANNED' ? this.KEYS.HISTORY_SCANNED : this.KEYS.HISTORY_CREATED;
        localStorage.setItem(key, JSON.stringify(list));
    }

    clearHistory(type) {
        const key = type === 'SCANNED' ? this.KEYS.HISTORY_SCANNED : this.KEYS.HISTORY_CREATED;
        localStorage.removeItem(key);
    }
}
