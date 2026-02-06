/**
 * NegenDB - LocalStorage Adapter
 *
 * Implements the storage adapter interface using LocalStorage.
 * Simulates collections by prefixing keys: "DBName:CollectionName:ID"
 */

(function(window) {
    'use strict';

    function NegenLSAdapter(config) {
        this.config = config;
        this.type = 'ls';
        this.prefix = this.config.name + ':';
    }

    NegenLSAdapter.prototype = {
        init: function() {
            // LocalStorage is synchronous and always ready
            return Promise.resolve();
        },

        _getKey: function(collection, id) {
            return this.prefix + collection + ':' + id;
        },

        get: function(collection, id) {
            var key = this._getKey(collection, id);
            var json = localStorage.getItem(key);
            try {
                return Promise.resolve(json ? JSON.parse(json) : null);
            } catch (e) {
                return Promise.reject(e);
            }
        },

        put: function(collection, data) {
            // Determine ID
            var schema = this.config.stores[collection];
            var keyPath = schema ? schema.keyPath : 'id';
            var id = data[keyPath];

            if (id === undefined) {
                // Auto-increment simulation (simple timestamp + random) for missing IDs
                id = Date.now() + '_' + Math.floor(Math.random() * 1000);
                data[keyPath] = id;
            }

            var key = this._getKey(collection, id);
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return Promise.resolve(id);
            } catch (e) {
                return Promise.reject(e);
            }
        },

        delete: function(collection, id) {
            var key = this._getKey(collection, id);
            localStorage.removeItem(key);
            return Promise.resolve();
        },

        getAll: function(collection, filter) {
            var prefix = this.prefix + collection + ':';
            var results = [];

            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    try {
                        var item = JSON.parse(localStorage.getItem(key));

                        // Apply filter if provided
                        var match = true;
                        if (filter) {
                            for (var k in filter) {
                                if (item[k] !== filter[k]) {
                                    match = false;
                                    break;
                                }
                            }
                        }

                        if (match) {
                            results.push(item);
                        }
                    } catch (e) {
                        console.warn('[NegenLS] Failed to parse item:', key);
                    }
                }
            }
            return Promise.resolve(results);
        },

        clear: function(collection) {
            var prefix = this.prefix + collection + ':';
            var keysToRemove = [];

            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(function(k) { localStorage.removeItem(k); });
            return Promise.resolve();
        }
    };

    window.NegenLSAdapter = NegenLSAdapter;

})(window);
