/**
 * FongDB - Generic Database Engine
 *
 * A unified storage engine supporting multiple adapters (IndexedDB, LocalStorage).
 * Implements the Observer pattern for change tracking.
 *
 * @version 1.0.0
 * @author Wayne Fong
 */

(function(window) {
    'use strict';

    /**
     * Main Database Class
     * @constructor
     * @param {Object} config - Configuration options
     * @param {string} config.name - Database name
     * @param {number} config.version - Database version
     * @param {Object} config.stores - Schema definition (for IDB)
     * @param {string} config.adapter - Preferred adapter ('idb' or 'ls')
     */
    function FongDB(config) {
        this.config = config || {};
        this.name = this.config.name || 'FongDB';
        this.adapter = null;
        this.listeners = {}; // Event listeners

        // Auto-select adapter if not specified
        if (!this.config.adapter) {
            this.config.adapter = window.indexedDB ? 'idb' : 'ls';
        }
    }

    FongDB.prototype = {
        /**
         * Initialize the database
         * @returns {Promise<void>}
         */
        init: function() {
            var self = this;
            return new Promise(function(resolve, reject) {
                // Select Adapter Class
                // Note: Adapters are exported as IDBAdapter/LSAdapter
                var AdapterClass;
                if (self.config.adapter === 'idb' && window.IDBAdapter) {
                    AdapterClass = window.IDBAdapter;
                } else if (window.LSAdapter) {
                    console.warn('[FongDB] Falling back to LocalStorage adapter');
                    AdapterClass = window.LSAdapter;
                } else {
                    reject(new Error('No suitable storage adapter found'));
                    return;
                }

                // Instantiate Adapter
                self.adapter = new AdapterClass(self.config);

                // Initialize Adapter
                self.adapter.init()
                    .then(function() {
                        console.log('[FongDB] Initialized with adapter:', self.adapter.type);
                        resolve();
                    })
                    .catch(reject);
            });
        },

        /**
         * Get a collection reference (wrapper for adapter methods)
         * @param {string} name - Collection name
         * @returns {Object} Collection interface
         */
        collection: function(name) {
            var self = this;
            return {
                get: function(id) { return self.get(name, id); },
                put: function(data) { return self.put(name, data); },
                delete: function(id) { return self.delete(name, id); },
                getAll: function(filter) { return self.getAll(name, filter); },
                clear: function() { return self.clear(name); },
                query: function() { return self.query(name); } // Returns query builder
            };
        },

        // ============================================================
        // CORE OPERATIONS (Proxy to Adapter)
        // ============================================================

        get: function(collection, id) {
            this._checkReady();
            return this.adapter.get(collection, id);
        },

        put: function(collection, data) {
            var self = this;
            this._checkReady();
            return this.adapter.put(collection, data).then(function(id) {
                self.emit('change', { type: 'put', collection: collection, id: id, data: data });
                return id;
            });
        },

        delete: function(collection, id) {
            var self = this;
            this._checkReady();
            return this.adapter.delete(collection, id).then(function() {
                self.emit('change', { type: 'delete', collection: collection, id: id });
            });
        },

        getAll: function(collection, filter) {
            this._checkReady();
            return this.adapter.getAll(collection, filter);
        },

        clear: function(collection) {
            var self = this;
            this._checkReady();
            return this.adapter.clear(collection).then(function() {
                self.emit('change', { type: 'clear', collection: collection });
            });
        },

        /**
         * Return a simple Query Builder object
         * Usage: db.query('users').where('age', '>', 18).execute()
         */
        query: function(collection) {
            this._checkReady();
            // If adapter supports native querying, delegate to it.
            // Otherwise, return a generic JS-based query builder that filters getAll() results.
            if (this.adapter.query) {
                return this.adapter.query(collection);
            }
            return new QueryBuilder(this, collection);
        },

        // ============================================================
        // EVENT SYSTEM (Observer Pattern)
        // ============================================================

        on: function(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);
        },

        off: function(event, callback) {
            if (!this.listeners[event]) return;
            var index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        },

        emit: function(event, payload) {
            if (!this.listeners[event]) return;
            this.listeners[event].forEach(function(callback) {
                try {
                    callback(payload);
                } catch (e) {
                    console.error('[FongDB] Event listener error:', e);
                }
            });
        },

        _checkReady: function() {
            if (!this.adapter) {
                throw new Error('Database not initialized. Call init() first.');
            }
        }
    };

    /**
     * Generic JS Query Builder (Fallback for adapters without native query support)
     */
    function QueryBuilder(db, collection) {
        this.db = db;
        this.collection = collection;
        this.filters = [];
    }

    QueryBuilder.prototype = {
        where: function(field, op, value) {
            this.filters.push({ field: field, op: op, value: value });
            return this;
        },
        execute: function() {
            var self = this;
            return this.db.getAll(this.collection).then(function(items) {
                return items.filter(function(item) {
                    return self.filters.every(function(f) {
                        var itemVal = item[f.field];
                        switch(f.op) {
                            case '==': return itemVal == f.value;
                            case '===': return itemVal === f.value;
                            case '>': return itemVal > f.value;
                            case '<': return itemVal < f.value;
                            case '>=': return itemVal >= f.value;
                            case '<=': return itemVal <= f.value;
                            case '!=': return itemVal != f.value;
                            case 'in': return Array.isArray(f.value) && f.value.includes(itemVal);
                            default: return false;
                        }
                    });
                });
            });
        }
    };

    window.FongDB = FongDB;

})(window);
