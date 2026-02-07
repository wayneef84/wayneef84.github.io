/**
 * IndexedDB Storage Adapter for Shipment Tracker
 *
 * Provides persistent storage for tracking records, raw payloads, and settings.
 * Uses IndexedDB directly via LegacyIndexedDBAdapter (proven, stable).
 *
 * @version 2.0.0 (Hybrid Generic/Legacy)
 * @author F.O.N.G.
 * @version 2.1.0 (Legacy-only, NegenDB references removed)
 * @author Founding & Forging
 */

(function(window) {
    'use strict';

    // ============================================================
    // DATABASE CONFIGURATION (Shared)
    // ============================================================

    var DB_CONFIG = {
        name: 'ShipmentTrackerDatabase',
        version: 4, // v4: Added documents array support - delete old DB
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
    // LEGACY ADAPTER (Renamed from v1.0.0)
    // ============================================================

    /**
     * Abstract storage adapter interface
     * @constructor
     */
    function StorageAdapter() {
        if (this.constructor === StorageAdapter) {
            throw new Error('StorageAdapter is abstract and cannot be instantiated');
        }
    }

    // Abstract methods...
    StorageAdapter.prototype = {
        init: function() { throw new Error('init() must be implemented'); },
        close: function() { throw new Error('close() must be implemented'); },
        getTracking: function(awb) { throw new Error('getTracking() must be implemented'); },
        saveTracking: function(tracking) { throw new Error('saveTracking() must be implemented'); },
        deleteTracking: function(awb) { throw new Error('deleteTracking() must be implemented'); },
        getAllTrackings: function(filters) { throw new Error('getAllTrackings() must be implemented'); },
        getRawPayload: function(id) { throw new Error('getRawPayload() must be implemented'); },
        saveRawPayload: function(payload) { throw new Error('saveRawPayload() must be implemented'); },
        pruneOldPayloads: function(awb, keepCount) { throw new Error('pruneOldPayloads() must be implemented'); },
        getSetting: function(key) { throw new Error('getSetting() must be implemented'); },
        saveSetting: function(key, value) { throw new Error('saveSetting() must be implemented'); },
        getStats: function() { throw new Error('getStats() must be implemented'); },
        clearAll: function() { throw new Error('clearAll() must be implemented'); }
    };

    /**
     * Legacy IndexedDB implementation of StorageAdapter
     * (Preserved for fallback)
     * @constructor
     * @extends {StorageAdapter}
     */
    function LegacyIndexedDBAdapter(config) {
        StorageAdapter.call(this);
        this.config = config || DB_CONFIG;
        this.db = null;
        this.isReady = false;
        console.log('[LegacyDB] Initialized instance');
    }

    LegacyIndexedDBAdapter.prototype = Object.create(StorageAdapter.prototype);
    LegacyIndexedDBAdapter.prototype.constructor = LegacyIndexedDBAdapter;

    // ... (Full implementation of LegacyIndexedDBAdapter methods follows below) ...
    // Note: To keep the file clean, I will paste the original implementation here
    // but wrapped in the LegacyIndexedDBAdapter prototype.

    LegacyIndexedDBAdapter.prototype.init = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported in this browser'));
                return;
            }
            var request = indexedDB.open(self.config.name, self.config.version);
            request.onerror = function(event) {
                console.error('[LegacyDB] Failed to open database:', event.target.error);
                reject(event.target.error);
            };
            request.onsuccess = function(event) {
                self.db = event.target.result;
                self.isReady = true;
                console.log('[LegacyDB] Database opened successfully:', self.config.name);
                resolve();
            };
            request.onupgradeneeded = function(event) {
                console.log('[LegacyDB] Upgrading database from version', event.oldVersion, 'to', event.newVersion);
                self._upgradeDatabase(event);
            };
        });
    };

    LegacyIndexedDBAdapter.prototype._upgradeDatabase = function(event) {
        var db = event.target.result;
        var transaction = event.target.transaction;
        var oldVersion = event.oldVersion;
        var storeNames = Object.keys(this.config.stores);

        for (var i = 0; i < storeNames.length; i++) {
            var storeName = storeNames[i];
            var storeConfig = this.config.stores[storeName];
            var objectStore;

            if (storeName === 'trackings' && oldVersion < 4 && db.objectStoreNames.contains(storeName)) {
                // Migration logic preserved
                db.deleteObjectStore('trackings');
                objectStore = db.createObjectStore('trackings', { keyPath: storeConfig.keyPath, autoIncrement: storeConfig.autoIncrement });
                for (var m = 0; m < storeConfig.indexes.length; m++) {
                    var idx = storeConfig.indexes[m];
                    objectStore.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
                }
                continue;
            } else if (!db.objectStoreNames.contains(storeName)) {
                objectStore = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath, autoIncrement: storeConfig.autoIncrement });
            } else {
                objectStore = transaction.objectStore(storeName);
            }

            if (objectStore) {
                for (var j = 0; j < storeConfig.indexes.length; j++) {
                    var indexConfig = storeConfig.indexes[j];
                    if (!objectStore.indexNames.contains(indexConfig.name)) {
                        objectStore.createIndex(indexConfig.name, indexConfig.keyPath, { unique: indexConfig.unique });
                    }
                }
            }
        }
    };

    LegacyIndexedDBAdapter.prototype.close = function() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.isReady = false;
        }
    };

    LegacyIndexedDBAdapter.prototype._checkReady = function() {
        if (!this.isReady || !this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
    };

    LegacyIndexedDBAdapter.prototype.getTracking = function(awb, carrier) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            if (carrier) {
                var trackingId = awb + '_' + carrier;
                var transaction = self.db.transaction(['trackings'], 'readonly');
                var store = transaction.objectStore('trackings');
                var request = store.get(trackingId);
                request.onsuccess = function(event) { resolve(event.target.result || null); };
                request.onerror = function(event) { reject(event.target.error); };
            } else {
                var transaction = self.db.transaction(['trackings'], 'readonly');
                var store = transaction.objectStore('trackings');
                var index = store.index('awb');
                var request = index.get(awb);
                request.onsuccess = function(event) { resolve(event.target.result || null); };
                request.onerror = function(event) { reject(event.target.error); };
            }
        });
    };

    LegacyIndexedDBAdapter.prototype.saveTracking = function(tracking) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            if (!tracking.awb || !tracking.carrier) {
                reject(new Error('Tracking record must have AWB and carrier'));
                return;
            }
            tracking.trackingId = tracking.awb + '_' + tracking.carrier;
            var transaction = self.db.transaction(['trackings'], 'readwrite');
            var store = transaction.objectStore('trackings');
            var request = store.put(tracking);
            request.onsuccess = function(event) { resolve(tracking.trackingId); };
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.deleteTracking = function(awb, carrier) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            if (carrier) {
                var trackingId = awb + '_' + carrier;
                var transaction = self.db.transaction(['trackings'], 'readwrite');
                var store = transaction.objectStore('trackings');
                var request = store.delete(trackingId);
                request.onsuccess = function() { resolve(); };
                request.onerror = function(event) { reject(event.target.error); };
            } else {
                self.getTracking(awb).then(function(tracking) {
                    if (!tracking) {
                        reject(new Error('Tracking not found: ' + awb));
                        return;
                    }
                    var transaction = self.db.transaction(['trackings'], 'readwrite');
                    var store = transaction.objectStore('trackings');
                    var request = store.delete(tracking.trackingId);
                    request.onsuccess = function() { resolve(); };
                    request.onerror = function(event) { reject(event.target.error); };
                }).catch(reject);
            }
        });
    };

    LegacyIndexedDBAdapter.prototype.getAllTrackings = function(filters) {
        var self = this;
        this._checkReady();
        filters = filters || {};
        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings'], 'readonly');
            var store = transaction.objectStore('trackings');
            var results = [];
            var request;

            if (filters.carrier && !filters.delivered && !filters.deliverySignal) {
                var carrierIndex = store.index('carrier');
                request = carrierIndex.openCursor(IDBKeyRange.only(filters.carrier));
            } else if (filters.delivered !== undefined && !filters.carrier && !filters.deliverySignal) {
                var deliveredIndex = store.index('delivered');
                request = deliveredIndex.openCursor(IDBKeyRange.only(filters.delivered));
            } else {
                request = store.openCursor();
            }

            request.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var record = cursor.value;
                    var matches = true;
                    if (filters.carrier && record.carrier !== filters.carrier) matches = false;
                    if (filters.delivered !== undefined && record.delivered !== filters.delivered) matches = false;
                    if (filters.deliverySignal && record.deliverySignal !== filters.deliverySignal) matches = false;
                    if (matches) results.push(record);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.getStaleTrackings = function(cooldownMs) {
        // Implementation preserved via getAllTrackings + filter in Modern, but simplified here
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
                    if (!record.delivered) {
                        var lastChecked = new Date(record.lastChecked).getTime();
                        if ((now - lastChecked) >= cooldownMs) results.push(record);
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.getRawPayload = function(id) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['raw_payloads'], 'readonly');
            var store = transaction.objectStore('raw_payloads');
            var request = store.get(id);
            request.onsuccess = function(event) { resolve(event.target.result || null); };
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.saveRawPayload = function(payload) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['raw_payloads'], 'readwrite');
            var store = transaction.objectStore('raw_payloads');
            var request = store.add(payload);
            request.onsuccess = function(event) { resolve(event.target.result); };
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.pruneOldPayloads = function(awb, keepCount) {
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
                    payloads.push({ id: cursor.value.id, timestamp: cursor.value.timestamp });
                    cursor.continue();
                } else {
                    payloads.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
                    var toDelete = payloads.slice(keepCount);
                    var deleteCount = 0;
                    if (toDelete.length === 0) { resolve(0); return; }
                    toDelete.forEach(function(payload) {
                        var deleteRequest = store.delete(payload.id);
                        deleteRequest.onsuccess = function() {
                            deleteCount++;
                            if (deleteCount === toDelete.length) resolve(deleteCount);
                        };
                    });
                }
            };
            cursorRequest.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.saveSmartTracking = function(newRecord) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            var awb = newRecord.awb;
            var carrier = newRecord.carrier;
            if (!awb || !carrier) { reject(new Error('Cannot save: Missing AWB or Carrier')); return; }

            self.getTracking(awb, carrier).then(function(existing) {
                var finalRecord = newRecord;
                if (existing) {
                    var oldDate = existing.dateShipped;
                    var newDate = newRecord.dateShipped;
                    var isValid = function(d) { return d && d !== 'N/A' && d !== 'null' && d !== '' && new Date(d).toString() !== 'Invalid Date'; };
                    if (isValid(oldDate)) {
                        if (!isValid(newDate)) {
                            finalRecord.dateShipped = oldDate;
                        } else {
                            var tOld = new Date(oldDate).getTime();
                            var tNew = new Date(newDate).getTime();
                            if (tOld < tNew) finalRecord.dateShipped = oldDate;
                        }
                    }
                    if (existing.trackingId) finalRecord.trackingId = existing.trackingId;
                }
                self.saveTracking(finalRecord).then(resolve).catch(reject);
            }).catch(reject);
        });
    };

    LegacyIndexedDBAdapter.prototype.getSetting = function(key) {
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
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.saveSetting = function(key, value) {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['settings'], 'readwrite');
            var store = transaction.objectStore('settings');
            var request = store.put({ key: key, value: value });
            request.onsuccess = function() { resolve(); };
            request.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.getStats = function() {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings', 'raw_payloads'], 'readonly');
            var stats = { totalTrackings: 0, deliveredCount: 0, activeCount: 0, carrierCounts: { DHL: 0, FedEx: 0, UPS: 0 }, totalRawPayloads: 0 };
            var trackingStore = transaction.objectStore('trackings');
            var trackingRequest = trackingStore.openCursor();
            trackingRequest.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    var record = cursor.value;
                    stats.totalTrackings++;
                    if (record.delivered) stats.deliveredCount++; else stats.activeCount++;
                    if (stats.carrierCounts[record.carrier] !== undefined) stats.carrierCounts[record.carrier]++;
                    cursor.continue();
                } else {
                    var payloadStore = transaction.objectStore('raw_payloads');
                    var payloadRequest = payloadStore.count();
                    payloadRequest.onsuccess = function(event) {
                        stats.totalRawPayloads = event.target.result;
                        resolve(stats);
                    };
                }
            };
            trackingRequest.onerror = function(event) { reject(event.target.error); };
        });
    };

    LegacyIndexedDBAdapter.prototype.clearAll = function() {
        var self = this;
        this._checkReady();
        return new Promise(function(resolve, reject) {
            var transaction = self.db.transaction(['trackings', 'raw_payloads', 'settings'], 'readwrite');
            var storeNames = ['trackings', 'raw_payloads', 'settings'];
            var promises = storeNames.map(function(name) {
                return new Promise(function(res, rej) {
                    var req = transaction.objectStore(name).clear();
                    req.onsuccess = res;
                    req.onerror = rej;
                });
            });
            Promise.all(promises).then(function() { resolve(); }).catch(reject);
        });
    };

    // ============================================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================================

    window.StorageAdapter = StorageAdapter;
    window.IndexedDBAdapter = LegacyIndexedDBAdapter;
    window.LegacyIndexedDBAdapter = LegacyIndexedDBAdapter;
    window.DB_CONFIG = DB_CONFIG;

})(window);
