class StorageManager {
    constructor() {
        this.KEYS = {
            SETTINGS: 'input_a11y_settings',
            HISTORY_SCANNED: 'input_a11y_history_scanned',
            HISTORY_CREATED: 'input_a11y_history_created'
        };
    }

    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            const defaults = {
                detectMode: 'AUTO',
                actionMode: 'URL_INPUT', // FREE or URL_INPUT
                baseUrl: 'www.google.com/?q=',
                scanRegion: 'BOX',
                feedbackVibrate: true,
                feedbackFrame: 'SCANNER', // OFF, SCANNER, SCREEN
                feedbackFlash: 'SCANNER', // OFF, SCANNER, SCREEN
                ocrDriver: '',            // '' = auto (native if available, else tesseract)
                ocrFilterMode: 'NONE',    // NONE, MIN_CHARS, REGEX, FORMAT
                ocrFilterValue: '',       // filter value (number, regex string, or A/N format)
                ocrConfirmPopup: true,    // show confirmation modal on OCR result
                // OCR Tuning
                ocrConfidence: 40,        // minimum Tesseract confidence (0-100)
                ocrDebounce: 3000,        // ms between duplicate detections
                ocrMinLength: 3,          // minimum text length to accept
                // Barcode Tuning
                barcodeFps: 10,           // frames per second for barcode scanner
                barcodeBoxWidth: 250,     // scan box width in px
                barcodeBoxHeight: 250     // scan box height in px
            };
            return data ? { ...defaults, ...JSON.parse(data) } : defaults;
        } catch (e) {
            console.error("Failed to load settings", e);
            return {
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
