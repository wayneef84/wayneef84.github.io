/**
 * StorageManager - Unified localStorage wrapper for cross-project use
 *
 * Provides a generic, reusable storage layer for web applications.
 * Originally extracted from input-a11y project to reduce code duplication.
 *
 * ES5-compatible IIFE pattern for maximum browser/tablet compatibility.
 * No dependencies required.
 *
 * @module StorageManager
 * @example
 *   var storage = new StorageManager();
 *   storage.getSettings();
 *   storage.saveSettings({ theme: 'dark' });
 */
var StorageManager = (function() {

    /**
     * Configuration for StorageManager behavior
     * Can be customized by calling StorageManager.config(options)
     */
    var CONFIG = {
        maxHistory: 50,
        namespace: 'app',
        keys: {
            SETTINGS: null,
            HISTORY: null
        },
        defaults: {}
    };

    /**
     * Constructor - Initialize StorageManager (no-op, methods are prototype-based)
     */
    function StorageManager() {
        // no-op constructor
    }

    /**
     * Configure StorageManager for a specific application
     * Should be called once during app initialization
     *
     * @param {Object} options - Configuration options
     * @param {number} [options.maxHistory=50] - Max history items to store
     * @param {string} [options.namespace='app'] - Namespace for localStorage keys
     * @param {Object} [options.keys] - Custom key names
     *   @param {string} [options.keys.SETTINGS] - Settings key (default: {namespace}_settings)
     *   @param {string} [options.keys.HISTORY] - History key (default: {namespace}_history)
     * @param {Object} [options.defaults={}] - Default settings values
     *
     * @example
     *   StorageManager.config({
     *       namespace: 'myapp',
     *       maxHistory: 100,
     *       defaults: { theme: 'light', fontSize: 14 }
     *   });
     */
    StorageManager.config = function(options) {
        if (options.maxHistory !== undefined) {
            CONFIG.maxHistory = options.maxHistory;
        }
        if (options.namespace !== undefined) {
            CONFIG.namespace = options.namespace;
        }
        if (options.defaults !== undefined) {
            CONFIG.defaults = options.defaults;
        }

        // Set up default key names if not provided
        if (!CONFIG.keys.SETTINGS && options.namespace) {
            CONFIG.keys.SETTINGS = options.namespace + '_settings';
        }
        if (!CONFIG.keys.HISTORY && options.namespace) {
            CONFIG.keys.HISTORY = options.namespace + '_history';
        }

        // Allow custom key overrides
        if (options.keys) {
            for (var key in options.keys) {
                if (options.keys.hasOwnProperty(key)) {
                    CONFIG.keys[key] = options.keys[key];
                }
            }
        }
    };

    /**
     * Create a deep copy of defaults object
     * @private
     * @returns {Object} Copy of default values
     */
    function copyDefaults() {
        var obj = {};
        for (var key in CONFIG.defaults) {
            if (CONFIG.defaults.hasOwnProperty(key)) {
                obj[key] = CONFIG.defaults[key];
            }
        }
        return obj;
    }

    /**
     * Merge saved settings with defaults
     * @private
     * @param {Object} saved - Saved settings from localStorage
     * @returns {Object} Merged settings (defaults + overrides)
     */
    function mergeSettings(saved) {
        var result = copyDefaults();
        for (var key in saved) {
            if (saved.hasOwnProperty(key)) {
                result[key] = saved[key];
            }
        }
        return result;
    }

    /**
     * Generate unique ID for history items
     * @private
     * @returns {string} Unique ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Get all settings from localStorage
     * Automatically merges with defaults to handle missing values
     *
     * @returns {Object} Settings object
     * @example
     *   var settings = storage.getSettings();
     *   console.log(settings.theme); // 'light' or user's saved value
     */
    StorageManager.prototype.getSettings = function() {
        try {
            var key = CONFIG.keys.SETTINGS;
            if (!key) {
                console.warn('StorageManager: SETTINGS key not configured');
                return copyDefaults();
            }
            var data = localStorage.getItem(key);
            if (data) {
                return mergeSettings(JSON.parse(data));
            }
            return copyDefaults();
        } catch (e) {
            console.error('StorageManager: Failed to load settings', e);
            return copyDefaults();
        }
    };

    /**
     * Save settings to localStorage
     * Overwrites entire settings object
     *
     * @param {Object} settings - Settings to save
     * @example
     *   storage.saveSettings({ theme: 'dark', fontSize: 16 });
     */
    StorageManager.prototype.saveSettings = function(settings) {
        try {
            var key = CONFIG.keys.SETTINGS;
            if (!key) {
                console.warn('StorageManager: SETTINGS key not configured');
                return;
            }
            localStorage.setItem(key, JSON.stringify(settings));
        } catch (e) {
            console.error('StorageManager: Failed to save settings', e);
        }
    };

    /**
     * Get history items from localStorage
     *
     * @returns {Array} Array of history items
     * @example
     *   var history = storage.getHistory();
     *   console.log(history.length); // number of items
     */
    StorageManager.prototype.getHistory = function() {
        try {
            var key = CONFIG.keys.HISTORY;
            if (!key) {
                console.warn('StorageManager: HISTORY key not configured');
                return [];
            }
            var data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('StorageManager: Failed to load history', e);
            return [];
        }
    };

    /**
     * Add item to history
     * Automatically adds timestamp and unique ID
     * Oldest items are removed when history exceeds maxHistory limit
     *
     * @param {Object} item - Item to add
     * @returns {Object} The item with timestamp and id added
     * @example
     *   storage.addItem({ text: 'Hello', source: 'user' });
     */
    StorageManager.prototype.addItem = function(item) {
        try {
            var list = this.getHistory();
            item.timestamp = Date.now();
            item.id = generateId();

            list.unshift(item);

            if (list.length > CONFIG.maxHistory) {
                list = list.slice(0, CONFIG.maxHistory);
            }

            var key = CONFIG.keys.HISTORY;
            if (!key) {
                console.warn('StorageManager: HISTORY key not configured');
                return item;
            }
            localStorage.setItem(key, JSON.stringify(list));
            return item;
        } catch (e) {
            console.error('StorageManager: Failed to add item', e);
            return item;
        }
    };

    /**
     * Update an item in history by ID
     *
     * @param {string} id - ID of item to update
     * @param {Object} updates - Properties to update
     * @returns {boolean} True if item was found and updated
     * @example
     *   storage.updateItem('abc123def45', { status: 'completed' });
     */
    StorageManager.prototype.updateItem = function(id, updates) {
        try {
            var list = this.getHistory();
            var found = false;
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === id) {
                    for (var key in updates) {
                        if (updates.hasOwnProperty(key)) {
                            list[i][key] = updates[key];
                        }
                    }
                    found = true;
                    break;
                }
            }
            if (found) {
                var histKey = CONFIG.keys.HISTORY;
                if (!histKey) {
                    console.warn('StorageManager: HISTORY key not configured');
                    return found;
                }
                localStorage.setItem(histKey, JSON.stringify(list));
            }
            return found;
        } catch (e) {
            console.error('StorageManager: Failed to update item', e);
            return false;
        }
    };

    /**
     * Remove item from history by ID
     *
     * @param {string} id - ID of item to remove
     * @returns {boolean} True if item was found and removed
     * @example
     *   storage.removeItem('abc123def45');
     */
    StorageManager.prototype.removeItem = function(id) {
        try {
            var list = this.getHistory();
            var filtered = [];
            var found = false;
            for (var i = 0; i < list.length; i++) {
                if (list[i].id !== id) {
                    filtered.push(list[i]);
                } else {
                    found = true;
                }
            }
            if (found) {
                var key = CONFIG.keys.HISTORY;
                if (!key) {
                    console.warn('StorageManager: HISTORY key not configured');
                    return found;
                }
                localStorage.setItem(key, JSON.stringify(filtered));
            }
            return found;
        } catch (e) {
            console.error('StorageManager: Failed to remove item', e);
            return false;
        }
    };

    /**
     * Clear all history items
     *
     * @example
     *   storage.clearHistory();
     */
    StorageManager.prototype.clearHistory = function() {
        try {
            var key = CONFIG.keys.HISTORY;
            if (!key) {
                console.warn('StorageManager: HISTORY key not configured');
                return;
            }
            localStorage.removeItem(key);
        } catch (e) {
            console.error('StorageManager: Failed to clear history', e);
        }
    };

    /**
     * Clear all settings
     *
     * @example
     *   storage.clearSettings();
     */
    StorageManager.prototype.clearSettings = function() {
        try {
            var key = CONFIG.keys.SETTINGS;
            if (!key) {
                console.warn('StorageManager: SETTINGS key not configured');
                return;
            }
            localStorage.removeItem(key);
        } catch (e) {
            console.error('StorageManager: Failed to clear settings', e);
        }
    };

    /**
     * Clear all stored data (both settings and history)
     *
     * @example
     *   storage.clearAll();
     */
    StorageManager.prototype.clearAll = function() {
        this.clearSettings();
        this.clearHistory();
    };

    return StorageManager;
})();
