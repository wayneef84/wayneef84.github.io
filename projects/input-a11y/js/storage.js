/**
 * StorageManager - localStorage wrapper for settings and history
 *
 * ES5-compatible IIFE pattern for older tablet support.
 */
var StorageManager = (function() {

    var KEYS = {
        SETTINGS: 'input_a11y_settings',
        HISTORY_SCANNED: 'input_a11y_history_scanned',
        HISTORY_CREATED: 'input_a11y_history_created'
    };

    var DEFAULTS = {
        detectMode: 'AUTO',
        actionMode: 'URL_INPUT',
        baseUrl: 'www.google.com/?q=',
        scanRegion: 'BOX',
        feedbackVibrate: true,
        feedbackFrame: 'SCANNER',
        feedbackFlash: 'SCANNER',
        ocrDriver: '',
        ocrFilterMode: 'NONE',
        ocrFilterValue: '',
        ocrConfirmPopup: true,
        ocrConfidence: 40,
        ocrDebounce: 3000,
        ocrMinLength: 3,
        barcodeFps: 10,
        barcodeBoxWidth: 250,
        barcodeBoxHeight: 250
    };

    function StorageManager() {
        // no-op constructor
    }

    function copyDefaults() {
        var obj = {};
        for (var key in DEFAULTS) {
            if (DEFAULTS.hasOwnProperty(key)) {
                obj[key] = DEFAULTS[key];
            }
        }
        return obj;
    }

    function mergeSettings(saved) {
        var result = copyDefaults();
        for (var key in saved) {
            if (saved.hasOwnProperty(key)) {
                result[key] = saved[key];
            }
        }
        return result;
    }

    StorageManager.prototype.getSettings = function() {
        try {
            var data = localStorage.getItem(KEYS.SETTINGS);
            if (data) {
                return mergeSettings(JSON.parse(data));
            }
            return copyDefaults();
        } catch (e) {
            console.error("Failed to load settings", e);
            return copyDefaults();
        }
    };

    StorageManager.prototype.saveSettings = function(settings) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    };

    StorageManager.prototype.getHistory = function(type) {
        try {
            var key = type === 'SCANNED' ? KEYS.HISTORY_SCANNED : KEYS.HISTORY_CREATED;
            var data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    };

    StorageManager.prototype.addItem = function(type, item) {
        var list = this.getHistory(type);
        item.timestamp = Date.now();
        item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        list.unshift(item);

        var key = type === 'SCANNED' ? KEYS.HISTORY_SCANNED : KEYS.HISTORY_CREATED;
        localStorage.setItem(key, JSON.stringify(list));
    };

    StorageManager.prototype.updateItem = function(type, id, updates) {
        var list = this.getHistory(type);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                for (var key in updates) {
                    if (updates.hasOwnProperty(key)) {
                        list[i][key] = updates[key];
                    }
                }
                break;
            }
        }
        var key = type === 'SCANNED' ? KEYS.HISTORY_SCANNED : KEYS.HISTORY_CREATED;
        localStorage.setItem(key, JSON.stringify(list));
    };

    StorageManager.prototype.removeItem = function(type, id) {
        var list = this.getHistory(type);
        var filtered = [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id !== id) {
                filtered.push(list[i]);
            }
        }
        var key = type === 'SCANNED' ? KEYS.HISTORY_SCANNED : KEYS.HISTORY_CREATED;
        localStorage.setItem(key, JSON.stringify(filtered));
    };

    StorageManager.prototype.clearHistory = function(type) {
        var key = type === 'SCANNED' ? KEYS.HISTORY_SCANNED : KEYS.HISTORY_CREATED;
        localStorage.removeItem(key);
    };

    return StorageManager;
})();
