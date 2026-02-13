/**
 * J-Engine Database Loader
 * Handles reading quiz packs from IndexedDB for the game engine.
 */

const JDBLoader = {
    DB_NAME: 'J_QuizEngine_DB',
    STORE_NAME: 'packs',

    /**
     * Opens the database connection
     * @returns {Promise<IDBDatabase>}
     */
    openDB: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = (event) => {
                reject("Database error: " + event.target.errorCode);
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            // Note: onupgradeneeded is handled by the editor,
            // but we should probably handle it here too just in case
            // the game runs before the editor ever does (unlikely but good practice).
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
                }
            };
        });
    },

    /**
     * Retrieves a specific pack by ID
     * @param {string} packId
     * @returns {Promise<Object>} The pack data
     */
    getPack: function(packId) {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.openDB();
                const tx = db.transaction([this.STORE_NAME], "readonly");
                const store = tx.objectStore(this.STORE_NAME);
                const request = store.get(packId);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result.content);
                    } else {
                        reject(`Pack '${packId}' not found in local DB.`);
                    }
                };

                request.onerror = (e) => reject(e.target.error);
            } catch (err) {
                reject(err);
            }
        });
    },

    /**
     * Retrieves all saved packs metadata
     * @returns {Promise<Array>} List of {id, timestamp}
     */
    listPacks: function() {
        return new Promise(async (resolve, reject) => {
            try {
                const db = await this.openDB();
                const tx = db.transaction([this.STORE_NAME], "readonly");
                const store = tx.objectStore(this.STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    // Return lightweight list
                    const list = request.result.map(item => ({
                        id: item.id,
                        timestamp: item.timestamp
                    }));
                    resolve(list);
                };

                request.onerror = (e) => reject(e.target.error);
            } catch (err) {
                reject(err);
            }
        });
    }
};

// Export for module usage or global if included via script tag
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JDBLoader;
} else {
    window.JDBLoader = JDBLoader;
}
