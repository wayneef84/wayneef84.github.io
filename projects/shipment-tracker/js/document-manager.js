/**
 * Document Manager for Shipment Tracker
 * Handles trade compliance document types and status calculations
 *
 * @version 1.0.0
 * @author Wayne Fong (wayneef84)
 */

(function(window) {
    'use strict';

    // ============================================================
    // DOCUMENT TYPE DEFINITIONS
    // ============================================================

    /**
     * Document type enumeration with metadata
     * Each type has an icon, label, and category (core vs compliance)
     */
    var DOCUMENT_TYPES = {
        COMMERCIAL_INVOICE: {
            type: 'COMMERCIAL_INVOICE',
            icon: '\uD83E\uDDFE',  // 🧾
            label: 'Commercial Invoice',
            shortLabel: 'CI',
            category: 'core',
            required: true
        },
        PACKING_LIST: {
            type: 'PACKING_LIST',
            icon: '\uD83D\uDCE6',  // 📦
            label: 'Packing List',
            shortLabel: 'PL',
            category: 'core',
            required: true
        },
        SLI_AWB: {
            type: 'SLI_AWB',
            icon: '\u2708\uFE0F',  // ✈️
            label: 'SLI / AWB',
            shortLabel: 'SLI',
            category: 'core',
            required: false
        },
        UN38_3: {
            type: 'UN38_3',
            icon: '\uD83D\uDD0B',  // 🔋
            label: 'UN38.3 Test Summary',
            shortLabel: 'UN38.3',
            category: 'compliance',
            required: false
        },
        MSDS: {
            type: 'MSDS',
            icon: '\u26A0\uFE0F',  // ⚠️
            label: 'MSDS / SDS',
            shortLabel: 'MSDS',
            category: 'compliance',
            required: false
        },
        ECCN_LICENSE: {
            type: 'ECCN_LICENSE',
            icon: '\u2696\uFE0F',  // ⚖️
            label: 'ECCN / License Info',
            shortLabel: 'ECCN',
            category: 'compliance',
            required: false
        },
        FCC_CE_GRANT: {
            type: 'FCC_CE_GRANT',
            icon: '\uD83D\uDCDC',  // 📜
            label: 'FCC / CE Grant',
            shortLabel: 'FCC/CE',
            category: 'compliance',
            required: false
        },
        POA: {
            type: 'POA',
            icon: '\uD83D\uDCDC',  // 📜
            label: 'Power of Attorney',
            shortLabel: 'POA',
            category: 'compliance',
            required: false
        },
        OTHER: {
            type: 'OTHER',
            icon: '\uD83D\uDCCE',  // 📎
            label: 'Other',
            shortLabel: 'Other',
            category: 'other',
            required: false
        }
    };

    // ============================================================
    // DOCUMENT MANAGER CLASS
    // ============================================================

    /**
     * Document Manager - handles document operations and compliance status
     * @constructor
     */
    function DocumentManager() {
        this.types = DOCUMENT_TYPES;
    }

    /**
     * Get all document types as an array (for dropdowns)
     * @returns {Array} Array of document type objects
     */
    DocumentManager.prototype.getAllTypes = function() {
        var types = [];
        for (var key in DOCUMENT_TYPES) {
            if (DOCUMENT_TYPES.hasOwnProperty(key)) {
                types.push(DOCUMENT_TYPES[key]);
            }
        }
        return types;
    };

    /**
     * Get core document types (required for basic compliance)
     * @returns {Array} Array of core document type objects
     */
    DocumentManager.prototype.getCoreTypes = function() {
        var result = [];
        var all = this.getAllTypes();
        for (var i = 0; i < all.length; i++) {
            if (all[i].category === 'core') {
                result.push(all[i]);
            }
        }
        return result;
    };

    /**
     * Get document type by key
     * @param {string} typeKey - Document type key (e.g., 'COMMERCIAL_INVOICE')
     * @returns {Object|null} Document type object or null if not found
     */
    DocumentManager.prototype.getType = function(typeKey) {
        return DOCUMENT_TYPES[typeKey] || null;
    };

    /**
     * Calculate compliance status for a tracking record
     * @param {Object} tracking - Tracking record with documents array
     * @returns {Object} Compliance status object
     */
    DocumentManager.prototype.getComplianceStatus = function(tracking) {
        var documents = tracking.documents || [];
        var docTypes = {};

        // Map existing documents by type
        for (var i = 0; i < documents.length; i++) {
            docTypes[documents[i].type] = documents[i];
        }

        var hasCI = !!docTypes.COMMERCIAL_INVOICE;
        var hasPL = !!docTypes.PACKING_LIST;
        var hasSLI = !!docTypes.SLI_AWB;
        var hasUN383 = !!docTypes.UN38_3;
        var hasMSDS = !!docTypes.MSDS;

        // Core compliance: CI + PL required
        var coreComplete = hasCI && hasPL;

        return {
            hasCI: hasCI,
            hasPL: hasPL,
            hasSLI: hasSLI,
            hasUN383: hasUN383,
            hasMSDS: hasMSDS,
            coreComplete: coreComplete,
            status: coreComplete ? 'complete' : 'warning',
            documentCount: documents.length,
            documents: documents
        };
    };

    /**
     * Get compliance status icon for table display
     * @param {Object} tracking - Tracking record
     * @returns {string} Icon string for display
     */
    DocumentManager.prototype.getComplianceIcon = function(tracking) {
        var status = this.getComplianceStatus(tracking);
        var icon = '';

        // Primary status: CI + PL check
        if (status.coreComplete) {
            icon = '\u2705';  // ✅
        } else {
            icon = '\u26A0\uFE0F';  // ⚠️
        }

        // Append battery icon if UN38.3 present
        if (status.hasUN383) {
            icon += '\uD83D\uDD0B';  // 🔋
        }

        return icon;
    };

    /**
     * Get document icons for detail panel preview
     * @param {Object} tracking - Tracking record
     * @returns {string} Icon string showing attached documents
     */
    DocumentManager.prototype.getDocumentIcons = function(tracking) {
        var documents = tracking.documents || [];
        if (documents.length === 0) {
            return '';
        }

        var icons = [];
        for (var i = 0; i < documents.length && i < 5; i++) {
            var docType = this.getType(documents[i].type);
            if (docType) {
                icons.push(docType.icon);
            }
        }

        var result = icons.join('');
        if (documents.length > 5) {
            result += ' +' + (documents.length - 5);
        }

        return result;
    };

    /**
     * Create a new document object
     * @param {string} type - Document type key
     * @param {string} url - Document URL (Google Drive, etc.)
     * @returns {Object} Document object
     */
    DocumentManager.prototype.createDocument = function(type, url) {
        var docType = this.getType(type);
        if (!docType) {
            console.error('[DocumentManager] Unknown document type:', type);
            return null;
        }

        return {
            type: type,
            icon: docType.icon,
            label: docType.label,
            url: url,
            addedDate: new Date().toISOString()
        };
    };

    /**
     * Add document to tracking record
     * @param {Object} tracking - Tracking record
     * @param {string} type - Document type key
     * @param {string} url - Document URL
     * @returns {Object} Updated tracking record
     */
    DocumentManager.prototype.addDocument = function(tracking, type, url) {
        if (!tracking.documents) {
            tracking.documents = [];
        }

        // Check if document type already exists
        for (var i = 0; i < tracking.documents.length; i++) {
            if (tracking.documents[i].type === type) {
                // Update existing
                tracking.documents[i].url = url;
                tracking.documents[i].addedDate = new Date().toISOString();
                return tracking;
            }
        }

        // Add new document
        var doc = this.createDocument(type, url);
        if (doc) {
            tracking.documents.push(doc);
        }

        return tracking;
    };

    /**
     * Remove document from tracking record by type
     * @param {Object} tracking - Tracking record
     * @param {string} type - Document type key to remove
     * @returns {Object} Updated tracking record
     */
    DocumentManager.prototype.removeDocument = function(tracking, type) {
        if (!tracking.documents) {
            return tracking;
        }

        var newDocs = [];
        for (var i = 0; i < tracking.documents.length; i++) {
            if (tracking.documents[i].type !== type) {
                newDocs.push(tracking.documents[i]);
            }
        }
        tracking.documents = newDocs;

        return tracking;
    };

    /**
     * Validate document URL (basic Google Drive detection)
     * @param {string} url - URL to validate
     * @returns {Object} Validation result with isValid and type
     */
    DocumentManager.prototype.validateUrl = function(url) {
        if (!url || typeof url !== 'string') {
            return { isValid: false, type: null, error: 'URL is required' };
        }

        url = url.trim();

        // Check for valid URL format
        try {
            new URL(url);
        } catch (e) {
            return { isValid: false, type: null, error: 'Invalid URL format' };
        }

        // Detect URL type
        var type = 'unknown';
        if (url.indexOf('drive.google.com') !== -1) {
            type = 'google-drive';
        } else if (url.indexOf('docs.google.com') !== -1) {
            type = 'google-docs';
        } else if (url.indexOf('dropbox.com') !== -1) {
            type = 'dropbox';
        } else if (url.indexOf('onedrive.live.com') !== -1 || url.indexOf('1drv.ms') !== -1) {
            type = 'onedrive';
        }

        return { isValid: true, type: type, error: null };
    };

    /**
     * Parse documents from CSV column (JSON string format)
     * @param {string} jsonString - JSON string from CSV
     * @returns {Array} Array of document objects
     */
    DocumentManager.prototype.parseDocumentsFromCSV = function(jsonString) {
        if (!jsonString || jsonString.trim() === '') {
            return [];
        }

        try {
            var docs = JSON.parse(jsonString);
            if (!Array.isArray(docs)) {
                return [];
            }

            // Validate and normalize each document
            var self = this;
            var result = [];
            for (var i = 0; i < docs.length; i++) {
                var doc = docs[i];
                if (doc.type && doc.url && self.getType(doc.type)) {
                    var docType = self.getType(doc.type);
                    result.push({
                        type: doc.type,
                        icon: docType.icon,
                        label: docType.label,
                        url: doc.url,
                        addedDate: doc.addedDate || new Date().toISOString()
                    });
                }
            }
            return result;
        } catch (e) {
            console.error('[DocumentManager] Failed to parse documents from CSV:', e);
            return [];
        }
    };

    /**
     * Serialize documents for CSV export
     * @param {Array} documents - Array of document objects
     * @returns {string} JSON string for CSV column
     */
    DocumentManager.prototype.serializeDocumentsForCSV = function(documents) {
        if (!documents || documents.length === 0) {
            return '';
        }

        // Only include essential fields for CSV
        var simplified = [];
        for (var i = 0; i < documents.length; i++) {
            simplified.push({
                type: documents[i].type,
                url: documents[i].url
            });
        }

        return JSON.stringify(simplified);
    };

    // ============================================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================================

    window.DocumentManager = DocumentManager;
    window.DOCUMENT_TYPES = DOCUMENT_TYPES;

})(window);
