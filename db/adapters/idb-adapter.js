/**
 * NegenDB - IndexedDB Adapter
 *
 * Implements the storage adapter interface using native IndexedDB.
 */

(function(window) {
    'use strict';

    function F_IDBAdapter(config) {
        this.config = config;
        this.type = 'idb';
        this.db = null;
    }

    F_IDBAdapter.prototype = {
        init: function() {
            var self = this;
            return new Promise(function(resolve, reject) {
                if (!window.indexedDB) {
                    reject(new Error('IndexedDB not supported'));
                    return;
                }

                var request = indexedDB.open(self.config.name, self.config.version);

                request.onerror = function(e) {
                    reject(e.target.error);
                };

                request.onsuccess = function(e) {
                    self.db = e.target.result;
                    resolve();
                };

                request.onupgradeneeded = function(e) {
                    self._upgrade(e);
                };
            });
        },

        _upgrade: function(e) {
            var db = e.target.result;
            var stores = this.config.stores || {};

            for (var storeName in stores) {
                if (!stores.hasOwnProperty(storeName)) continue;

                var schema = stores[storeName];
                var store;

                // Create or migrate store
                if (!db.objectStoreNames.contains(storeName)) {
                    store = db.createObjectStore(storeName, {
                        keyPath: schema.keyPath || 'id',
                        autoIncrement: schema.autoIncrement || false
                    });
                } else {
                    store = e.target.transaction.objectStore(storeName);
                    // Note: Full migration logic (delete/recreate) is complex and skipped for this MVP generic adapter.
                    // The specific ShipmentTrackerDB migration logic handles the v3->v4 case specially.
                    // For a generic engine, we assume the schema config matches the version.
                }

                // Create indexes
                if (schema.indexes) {
                    schema.indexes.forEach(function(idx) {
                        if (!store.indexNames.contains(idx.name)) {
                            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique });
                        }
                    });
                }
            }
        },

        get: function(collection, id) {
            var self = this;
            return new Promise(function(resolve, reject) {
                var tx = self.db.transaction([collection], 'readonly');
                var store = tx.objectStore(collection);
                var request = store.get(id);

                request.onsuccess = function() { resolve(request.result || null); };
                request.onerror = function() { reject(request.error); };
            });
        },

        put: function(collection, data) {
            var self = this;
            return new Promise(function(resolve, reject) {
                var tx = self.db.transaction([collection], 'readwrite');
                var store = tx.objectStore(collection);
                var request = store.put(data);

                request.onsuccess = function() { resolve(request.result); }; // Returns key
                request.onerror = function() { reject(request.error); };
            });
        },

        delete: function(collection, id) {
            var self = this;
            return new Promise(function(resolve, reject) {
                var tx = self.db.transaction([collection], 'readwrite');
                var store = tx.objectStore(collection);
                var request = store.delete(id);

                request.onsuccess = function() { resolve(); };
                request.onerror = function() { reject(request.error); };
            });
        },

        getAll: function(collection, filter) {
            var self = this;
            return new Promise(function(resolve, reject) {
                var tx = self.db.transaction([collection], 'readonly');
                var store = tx.objectStore(collection);
                var request;

                // Simple index filtering (if filter is { field: value })
                // This is a basic optimization for exact matches on indexes
                if (filter && Object.keys(filter).length === 1) {
                    var key = Object.keys(filter)[0];
                    if (store.indexNames.contains(key)) {
                        var index = store.index(key);
                        request = index.getAll(filter[key]);
                    } else {
                        // Fallback to full scan
                        request = store.getAll();
                    }
                } else {
                    request = store.getAll();
                }

                request.onsuccess = function() {
                    var results = request.result;
                    // If we did a full scan but had filters, apply them in JS
                    if (filter && request.source instanceof IDBObjectStore) {
                        results = results.filter(function(item) {
                            for (var k in filter) {
                                if (item[k] !== filter[k]) return false;
                            }
                            return true;
                        });
                    }
                    resolve(results);
                };
                request.onerror = function() { reject(request.error); };
            });
        },

        clear: function(collection) {
            var self = this;
            return new Promise(function(resolve, reject) {
                var tx = self.db.transaction([collection], 'readwrite');
                var store = tx.objectStore(collection);
                var request = store.clear();

                request.onsuccess = function() { resolve(); };
                request.onerror = function() { reject(request.error); };
            });
        }
    };

    window.F_IDBAdapter = F_IDBAdapter;

})(window);
