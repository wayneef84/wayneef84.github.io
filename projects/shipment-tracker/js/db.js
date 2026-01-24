/**
 * IndexedDB Storage Adapter for Shipment Tracker
 *
 * Provides persistent storage for tracking records, raw payloads, and settings.
 * Designed with Firebase migration path in mind (adapter pattern).
 *
 * @version 1.0.0
 * @author Fong Family Arcade
 */

(function(window) {
    'use strict';

    // ============================================================
    // DATABASE CONFIGURATION
    // ============================================================

    var DB_CONFIG = {
        name: 'ShipmentTrackerDB',
        version: 2, // Increment version for schema change
        stores: {
            trackings: {
                keyPath: 'trackingId', // Composite key: awb + carrier
                autoIncrement: false,
                indexes: [
                    { name: 'awb', keyPath: 'awb', unique: false },
                    { name: 'carrier', keyPath: 'carrier', unique: false },
                    { name: 'delivered', keyPath: 'delivered', unique: false },
                    { name: 'lastChecked', keyPath: 'lastChecked', unique: false },
                    { name: 'dateShipped', keyPath: 'dateShipped', unique: false },
                    { name: 'deliverySignal', keyPath: 'deliverySignal', unique: false }
                ]
            },
            raw_payloads: {
                keyPath: 'id',
                autoIncrement: true,
                indexes: [
                    { name: 'awb', keyPath: 'awb', unique: false },
                    { name: 'carrier', keyPath: 'carrier', unique: false },
                    { name: 'timestamp', keyPath: 'timestamp', unique: false }
                ]
            },
            settings: {
                keyPath: 'key',
                autoIncrement: false,
                indexes: []
            }
        }
    };

    // ============================================================
    // STORAGE ADAPTER INTERFACE (Base Class)
    // ============================================================

    /**
     * Abstract storage adapter interface
     * Implementations: IndexedDBAdapter, FirebaseAdapter (future)
     * @constructor
     */
    function StorageAdapter() {
        if (this.constructor === StorageAdapter) {
            throw new Error('StorageAdapter is abstract and cannot be instantiated');
        }
    }

    StorageAdapter.prototype = {
        // Database lifecycle
        init: function() {
            throw new Error('init() must be implemented');
        },

        close: function() {
            throw new Error('close() must be implemented');
        },

        // Tracking records
        getTracking: function(awb) {
            throw new Error('getTracking() must be implemented');
        },

        saveTracking: function(tracking) {
            throw new Error('saveTracking() must be implemented');
        },

        deleteTracking: function(awb) {
            throw new Error('deleteTracking() must be implemented');
        },

        getAllTrackings: function(filters) {
            throw new Error('getAllTrackings() must be implemented');
        },

        // Raw payloads
        getRawPayload: function(id) {
            throw new Error('getRawPayload() must be implemented');
        },

        saveRawPayload: function(payload) {
            throw new Error('saveRawPayload() must be implemented');
        },

        pruneOldPayloads: function(awb, keepCount) {
            throw new Error('pruneOldPayloads() must be implemented');
        },

        // Settings
        getSetting: function(key) {
            throw new Error('getSetting() must be implemented');
        },

        saveSetting: function(key, value) {
            throw new Error('saveSetting() must be implemented');
        }
    };

    // ============================================================
    // INDEXEDDB ADAPTER IMPLEMENTATION
    // ============================================================

    /**
     * IndexedDB implementation of StorageAdapter
     * @constructor
     * @extends {StorageAdapter}
     * @param {Object} config - Database configuration (optional, uses DB_CONFIG by default)
     */
    function IndexedDBAdapter(config) {
        StorageAdapter.call(this);

        this.config = config || DB_CONFIG;
        this.db = null;
        this.isReady = false;
    }

    // Inherit from StorageAdapter
    IndexedDBAdapter.prototype = Object.create(StorageAdapter.prototype);
    IndexedDBAdapter.prototype.constructor = IndexedDBAdapter;

    // ============================================================
    // DATABASE INITIALIZATION
    // ============================================================

    /**
     * Initialize database connection
     * @returns {Promise<void>}
     */
    IndexedDBAdapter.prototype.init = function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported in this browser'));
                return;
            }

            var request = indexedDB.open(self.config.name, self.config.version);

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to open database:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = function(event) {
                self.db = event.target.result;
                self.isReady = true;
                console.log('[IndexedDB] Database opened successfully:', self.config.name);
                resolve();
            };

            request.onupgradeneeded = function(event) {
                console.log('[IndexedDB] Upgrading database from version', event.oldVersion, 'to', event.newVersion);
                self._upgradeDatabase(event);
            };
        });
    };

    /**
     * Database upgrade handler (creates stores and indexes)
     * @private
     * @param {IDBVersionChangeEvent} event
     */
    IndexedDBAdapter.prototype._upgradeDatabase = function(event) {
        var db = event.target.result;
        var transaction = event.target.transaction;

        var storeNames = Object.keys(this.config.stores);

        for (var i = 0; i < storeNames.length; i++) {
            var storeName = storeNames[i];
            var storeConfig = this.config.stores[storeName];

            var objectStore;

            // Create store if it doesn't exist
            if (!db.objectStoreNames.contains(storeName)) {
                console.log('[IndexedDB] Creating object store:', storeName);
                objectStore = db.createObjectStore(storeName, {
                    keyPath: storeConfig.keyPath,
                    autoIncrement: storeConfig.autoIncrement
                });
            } else {
                objectStore = transaction.objectStore(storeName);
            }

            // Create indexes
            for (var j = 0; j < storeConfig.indexes.length; j++) {
                var indexConfig = storeConfig.indexes[j];

                if (!objectStore.indexNames.contains(indexConfig.name)) {
                    console.log('[IndexedDB] Creating index:', indexConfig.name, 'on', storeName);
                    objectStore.createIndex(
                        indexConfig.name,
                        indexConfig.keyPath,
                        { unique: indexConfig.unique }
                    );
                }
            }
        }
    };

    /**
     * Close database connection
     */
    IndexedDBAdapter.prototype.close = function() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isReady = false;
            console.log('[IndexedDB] Database closed');
        }
    };

    /**
     * Check if database is ready
     * @private
     * @throws {Error} If database not initialized
     */
    IndexedDBAdapter.prototype._checkReady = function() {
        if (!this.isReady || !this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
    };

    // ============================================================
    // TRACKING RECORDS - CRUD OPERATIONS
    // ============================================================

    /**
     * Get single tracking record by AWB
     * @param {string} awb - Air waybill number
     * @returns {Promise<Object|null>} Tracking record or null if not found
     */
    /**
     * Get tracking record by AWB and carrier
     * @param {string} awb - Air waybill number
     * @param {string} carrier - Carrier name (optional, returns first match if omitted)
     * @returns {Promise<Object|null>}
     */
    IndexedDBAdapter.prototype.getTracking = function(awb, carrier) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            if (carrier) {
                // Get specific tracking by composite key
                var trackingId = awb + '_' + carrier;
                var transaction = self.db.transaction(['trackings'], 'readonly');
                var store = transaction.objectStore('trackings');
                var request = store.get(trackingId);

                request.onsuccess = function(event) {
                    resolve(event.target.result || null);
                };

                request.onerror = function(event) {
                    console.error('[IndexedDB] Failed to get tracking:', trackingId, event.target.error);
                    reject(event.target.error);
                };
            } else {
                // Get first matching AWB (for backward compatibility)
                var transaction = self.db.transaction(['trackings'], 'readonly');
                var store = transaction.objectStore('trackings');
                var index = store.index('awb');
                var request = index.get(awb);

                request.onsuccess = function(event) {
                    resolve(event.target.result || null);
                };

                request.onerror = function(event) {
                    console.error('[IndexedDB] Failed to get tracking:', awb, event.target.error);
                    reject(event.target.error);
                };
            }
        });
    };

    /**
     * Save tracking record (insert or update)
     * @param {Object} tracking - Tracking record object
     * @returns {Promise<string>} trackingId of saved record
     */
    IndexedDBAdapter.prototype.saveTracking = function(tracking) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            // Validate required fields
            if (!tracking.awb || !tracking.carrier) {
                reject(new Error('Tracking record must have AWB and carrier'));
                return;
            }

            // Generate composite key
            tracking.trackingId = tracking.awb + '_' + tracking.carrier;

            var transaction = self.db.transaction(['trackings'], 'readwrite');
            var store = transaction.objectStore('trackings');
            var request = store.put(tracking);

            request.onsuccess = function(event) {
                console.log('[IndexedDB] Saved tracking:', tracking.trackingId);
                resolve(tracking.trackingId);
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to save tracking:', tracking.trackingId, event.target.error);
                reject(event.target.error);
            };
        });
    };

    /**
     * Delete tracking record
     * @param {string} awb - Air waybill number
     * @param {string} carrier - Carrier name (optional, deletes first match if omitted)
     * @returns {Promise<void>}
     */
    IndexedDBAdapter.prototype.deleteTracking = function(awb, carrier) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            if (carrier) {
                // Delete specific tracking by composite key
                var trackingId = awb + '_' + carrier;
                var transaction = self.db.transaction(['trackings'], 'readwrite');
                var store = transaction.objectStore('trackings');
                var request = store.delete(trackingId);

                request.onsuccess = function(event) {
                    console.log('[IndexedDB] Deleted tracking:', trackingId);
                    resolve();
                };

                request.onerror = function(event) {
                    console.error('[IndexedDB] Failed to delete tracking:', trackingId, event.target.error);
                    reject(event.target.error);
                };
            } else {
                // Delete first matching AWB (for backward compatibility)
                // First get the tracking to find its trackingId
                self.getTracking(awb).then(function(tracking) {
                    if (!tracking) {
                        reject(new Error('Tracking not found: ' + awb));
                        return;
                    }

                    var transaction = self.db.transaction(['trackings'], 'readwrite');
                    var store = transaction.objectStore('trackings');
                    var request = store.delete(tracking.trackingId);

                    request.onsuccess = function(event) {
                        console.log('[IndexedDB] Deleted tracking:', tracking.trackingId);
                        resolve();
                    };

                    request.onerror = function(event) {
                        console.error('[IndexedDB] Failed to delete tracking:', tracking.trackingId, event.target.error);
                        reject(event.target.error);
                    };
                }).catch(reject);
            }
        });
    };

    /**
     * Get all tracking records with optional filters
     * @param {Object} filters - Optional filters { carrier, delivered, deliverySignal }
     * @returns {Promise<Array>} Array of tracking records
     */
    IndexedDBAdapter.prototype.getAllTrackings = function(filters) {
        var self = this;
        this._checkReady();

        filters = filters || {};

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings'], 'readonly');
            var store = transaction.objectStore('trackings');
            var results = [];

            var request;

            // Use index if filtering by single indexed field
            if (filters.carrier && !filters.delivered && !filters.deliverySignal) {
                var carrierIndex = store.index('carrier');
                request = carrierIndex.openCursor(IDBKeyRange.only(filters.carrier));
            } else if (filters.delivered !== undefined && !filters.carrier && !filters.deliverySignal) {
                var deliveredIndex = store.index('delivered');
                request = deliveredIndex.openCursor(IDBKeyRange.only(filters.delivered));
            } else if (filters.deliverySignal && !filters.carrier && !filters.delivered) {
                var signalIndex = store.index('deliverySignal');
                request = signalIndex.openCursor(IDBKeyRange.only(filters.deliverySignal));
            } else {
                // Full scan with manual filtering
                request = store.openCursor();
            }

            request.onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    var record = cursor.value;
                    var matches = true;

                    // Apply filters
                    if (filters.carrier && record.carrier !== filters.carrier) {
                        matches = false;
                    }
                    if (filters.delivered !== undefined && record.delivered !== filters.delivered) {
                        matches = false;
                    }
                    if (filters.deliverySignal && record.deliverySignal !== filters.deliverySignal) {
                        matches = false;
                    }
                    if (filters.dateShipped && record.dateShipped !== filters.dateShipped) {
                        matches = false;
                    }

                    if (matches) {
                        results.push(record);
                    }

                    cursor.continue();
                } else {
                    // Done iterating
                    console.log('[IndexedDB] Retrieved', results.length, 'tracking records');
                    resolve(results);
                }
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to get all trackings:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    /**
     * Get trackings that need API refresh (not delivered, last checked > cooldown)
     * @param {number} cooldownMs - Cooldown period in milliseconds
     * @returns {Promise<Array>} Array of tracking records needing refresh
     */
    IndexedDBAdapter.prototype.getStaleTrackings = function(cooldownMs) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings'], 'readonly');
            var store = transaction.objectStore('trackings');
            var results = [];
            var now = Date.now();

            var request = store.openCursor();

            request.onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    var record = cursor.value;

                    // Skip delivered items
                    if (!record.delivered) {
                        var lastChecked = new Date(record.lastChecked).getTime();
                        var timeSince = now - lastChecked;

                        if (timeSince >= cooldownMs) {
                            results.push(record);
                        }
                    }

                    cursor.continue();
                } else {
                    console.log('[IndexedDB] Found', results.length, 'stale trackings');
                    resolve(results);
                }
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to get stale trackings:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    // ============================================================
    // RAW PAYLOADS - STORAGE & PRUNING
    // ============================================================

    /**
     * Get raw payload by ID
     * @param {number} id - Payload ID
     * @returns {Promise<Object|null>} Raw payload or null if not found
     */
    IndexedDBAdapter.prototype.getRawPayload = function(id) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['raw_payloads'], 'readonly');
            var store = transaction.objectStore('raw_payloads');
            var request = store.get(id);

            request.onsuccess = function(event) {
                resolve(event.target.result || null);
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to get raw payload:', id, event.target.error);
                reject(event.target.error);
            };
        });
    };

    /**
     * Save raw API payload
     * @param {Object} payload - Raw payload object
     * @returns {Promise<number>} Payload ID (auto-generated)
     */
    IndexedDBAdapter.prototype.saveRawPayload = function(payload) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['raw_payloads'], 'readwrite');
            var store = transaction.objectStore('raw_payloads');
            var request = store.add(payload);

            request.onsuccess = function(event) {
                var id = event.target.result;
                console.log('[IndexedDB] Saved raw payload:', id, 'for AWB:', payload.awb);
                resolve(id);
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to save raw payload:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    /**
     * Prune old raw payloads for specific AWB (keep only latest N)
     * @param {string} awb - Air waybill number
     * @param {number} keepCount - Number of payloads to keep (default: 5)
     * @returns {Promise<number>} Number of payloads deleted
     */
    IndexedDBAdapter.prototype.pruneOldPayloads = function(awb, keepCount) {
        var self = this;
        this._checkReady();

        keepCount = keepCount || 5;

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['raw_payloads'], 'readwrite');
            var store = transaction.objectStore('raw_payloads');
            var index = store.index('awb');
            var payloads = [];

            var cursorRequest = index.openCursor(IDBKeyRange.only(awb));

            cursorRequest.onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    payloads.push({
                        id: cursor.value.id,
                        timestamp: cursor.value.timestamp
                    });
                    cursor.continue();
                } else {
                    // Sort by timestamp (newest first)
                    payloads.sort(function(a, b) {
                        return new Date(b.timestamp) - new Date(a.timestamp);
                    });

                    // Delete old ones
                    var toDelete = payloads.slice(keepCount);
                    var deleteCount = 0;

                    if (toDelete.length === 0) {
                        resolve(0);
                        return;
                    }

                    toDelete.forEach(function(payload) {
                        var deleteRequest = store.delete(payload.id);

                        deleteRequest.onsuccess = function() {
                            deleteCount++;
                            if (deleteCount === toDelete.length) {
                                console.log('[IndexedDB] Pruned', deleteCount, 'old payloads for AWB:', awb);
                                resolve(deleteCount);
                            }
                        };

                        deleteRequest.onerror = function(event) {
                            console.error('[IndexedDB] Failed to delete payload:', payload.id);
                        };
                    });
                }
            };

            cursorRequest.onerror = function(event) {
                console.error('[IndexedDB] Failed to prune payloads:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    // ============================================================
    // SETTINGS - KEY-VALUE STORAGE
    // ============================================================

    /**
     * Get setting by key
     * @param {string} key - Setting key
     * @returns {Promise<any>} Setting value or null if not found
     */
    IndexedDBAdapter.prototype.getSetting = function(key) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['settings'], 'readonly');
            var store = transaction.objectStore('settings');
            var request = store.get(key);

            request.onsuccess = function(event) {
                var result = event.target.result;
                resolve(result ? result.value : null);
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to get setting:', key, event.target.error);
                reject(event.target.error);
            };
        });
    };

    /**
     * Save setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value (any JSON-serializable type)
     * @returns {Promise<void>}
     */
    IndexedDBAdapter.prototype.saveSetting = function(key, value) {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['settings'], 'readwrite');
            var store = transaction.objectStore('settings');
            var request = store.put({ key: key, value: value });

            request.onsuccess = function(event) {
                console.log('[IndexedDB] Saved setting:', key);
                resolve();
            };

            request.onerror = function(event) {
                console.error('[IndexedDB] Failed to save setting:', key, event.target.error);
                reject(event.target.error);
            };
        });
    };

    // ============================================================
    // UTILITY METHODS
    // ============================================================

    /**
     * Get database statistics
     * @returns {Promise<Object>} Statistics object
     */
    IndexedDBAdapter.prototype.getStats = function() {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings', 'raw_payloads'], 'readonly');
            var stats = {
                totalTrackings: 0,
                deliveredCount: 0,
                activeCount: 0,
                carrierCounts: { DHL: 0, FedEx: 0, UPS: 0 },
                totalRawPayloads: 0
            };

            // Count trackings
            var trackingStore = transaction.objectStore('trackings');
            var trackingRequest = trackingStore.openCursor();

            trackingRequest.onsuccess = function(event) {
                var cursor = event.target.result;

                if (cursor) {
                    var record = cursor.value;
                    stats.totalTrackings++;

                    if (record.delivered) {
                        stats.deliveredCount++;
                    } else {
                        stats.activeCount++;
                    }

                    if (stats.carrierCounts[record.carrier] !== undefined) {
                        stats.carrierCounts[record.carrier]++;
                    }

                    cursor.continue();
                } else {
                    // Count raw payloads
                    var payloadStore = transaction.objectStore('raw_payloads');
                    var payloadRequest = payloadStore.count();

                    payloadRequest.onsuccess = function(event) {
                        stats.totalRawPayloads = event.target.result;
                        resolve(stats);
                    };

                    payloadRequest.onerror = reject;
                }
            };

            trackingRequest.onerror = function(event) {
                console.error('[IndexedDB] Failed to get stats:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    /**
     * Clear all data (for testing/reset)
     * @returns {Promise<void>}
     */
    IndexedDBAdapter.prototype.clearAll = function() {
        var self = this;
        this._checkReady();

        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings', 'raw_payloads', 'settings'], 'readwrite');

            var clearPromises = [];

            var storeNames = ['trackings', 'raw_payloads', 'settings'];

            storeNames.forEach(function(storeName) {
                var store = transaction.objectStore(storeName);
                var request = store.clear();

                var promise = new Promise(function(res, rej) {
                    request.onsuccess = function() {
                        console.log('[IndexedDB] Cleared store:', storeName);
                        res();
                    };
                    request.onerror = rej;
                });

                clearPromises.push(promise);
            });

            Promise.all(clearPromises)
                .then(function() {
                    console.log('[IndexedDB] Cleared all data');
                    resolve();
                })
                .catch(reject);
        });
    };

    // ============================================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================================

    window.StorageAdapter = StorageAdapter;
    window.IndexedDBAdapter = IndexedDBAdapter;
    window.DB_CONFIG = DB_CONFIG;

})(window);
