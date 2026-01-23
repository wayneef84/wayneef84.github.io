/**
 * Shipment Tracker - Main Application
 * Connects UI to IndexedDB adapter
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // MAIN APPLICATION
    // ============================================================

    function ShipmentTrackerApp() {
        var self = this;

        // Database adapter
        this.db = null;

        // Current state
        this.trackings = [];
        this.filteredTrackings = [];
        this.currentFilters = {
            carrier: '',
            status: '',
            search: ''
        };

        // Settings
        this.settings = {
            apiKeys: {
                DHL: '',
                FedEx: { clientId: '', clientSecret: '' },
                UPS: { apiKey: '', username: '' }
            },
            queryEngine: {
                cooldownMinutes: 10,
                skipDelivered: true,
                enableForceRefresh: false
            }
        };

        // Initialize on load
        window.addEventListener('DOMContentLoaded', function() {
            self.init();
        });
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    ShipmentTrackerApp.prototype.init = async function() {
        console.log('[App] Initializing Shipment Tracker...');

        try {
            // Initialize database
            this.db = new IndexedDBAdapter();
            await this.db.init();
            console.log('[App] Database initialized');

            // Load settings
            await this.loadSettings();

            // Load trackings
            await this.loadTrackings();

            // Setup UI event listeners
            this.setupEventListeners();

            // Update stats
            this.updateStats();

            // Show success message
            this.showToast('Shipment Tracker loaded successfully', 'success');

        } catch (err) {
            console.error('[App] Initialization failed:', err);
            this.showToast('Failed to initialize app: ' + err.message, 'error');
        }
    };

    // ============================================================
    // CARRIER AUTO-DETECTION
    // ============================================================

    ShipmentTrackerApp.prototype.detectCarrierFromAWB = function() {
        var awb = document.getElementById('awbInput').value.trim();
        var carrierSelect = document.getElementById('carrierSelect');

        if (!awb) {
            carrierSelect.value = '';
            return;
        }

        var detected = TrackingUtils.detectCarrier(awb);
        if (detected) {
            carrierSelect.value = detected;
            console.log('[App] Auto-detected carrier:', detected);
        }
    };

    // ============================================================
    // SETTINGS MANAGEMENT
    // ============================================================

    ShipmentTrackerApp.prototype.loadSettings = async function() {
        console.log('[App] Loading settings...');

        try {
            // Load API keys
            var apiKeys = await this.db.getSetting('apiKeys');
            if (apiKeys) {
                this.settings.apiKeys = apiKeys;
                this.populateAPIKeyFields();
            }

            // Load query engine config
            var queryEngine = await this.db.getSetting('queryEngine');
            if (queryEngine) {
                this.settings.queryEngine = queryEngine;
                this.populateQueryEngineFields();
            }

        } catch (err) {
            console.error('[App] Failed to load settings:', err);
        }
    };

    ShipmentTrackerApp.prototype.saveSettings = async function() {
        console.log('[App] Saving settings...');

        try {
            // Get values from form
            this.settings.apiKeys.DHL = document.getElementById('dhlApiKey').value;
            this.settings.apiKeys.FedEx.clientId = document.getElementById('fedexClientId').value;
            this.settings.apiKeys.FedEx.clientSecret = document.getElementById('fedexClientSecret').value;
            this.settings.apiKeys.UPS.apiKey = document.getElementById('upsApiKey').value;
            this.settings.apiKeys.UPS.username = document.getElementById('upsUsername').value;

            this.settings.queryEngine.cooldownMinutes = parseInt(document.getElementById('cooldownMinutes').value);
            this.settings.queryEngine.skipDelivered = document.getElementById('skipDelivered').checked;
            this.settings.queryEngine.enableForceRefresh = document.getElementById('enableForceRefresh').checked;

            // Save to database
            await this.db.saveSetting('apiKeys', this.settings.apiKeys);
            await this.db.saveSetting('queryEngine', this.settings.queryEngine);

            this.showToast('Settings saved successfully', 'success');
            this.closeSettings();

        } catch (err) {
            console.error('[App] Failed to save settings:', err);
            this.showToast('Failed to save settings: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.populateAPIKeyFields = function() {
        document.getElementById('dhlApiKey').value = this.settings.apiKeys.DHL || '';
        document.getElementById('fedexClientId').value = this.settings.apiKeys.FedEx.clientId || '';
        document.getElementById('fedexClientSecret').value = this.settings.apiKeys.FedEx.clientSecret || '';
        document.getElementById('upsApiKey').value = this.settings.apiKeys.UPS.apiKey || '';
        document.getElementById('upsUsername').value = this.settings.apiKeys.UPS.username || '';
    };

    ShipmentTrackerApp.prototype.populateQueryEngineFields = function() {
        document.getElementById('cooldownMinutes').value = this.settings.queryEngine.cooldownMinutes;
        document.getElementById('skipDelivered').checked = this.settings.queryEngine.skipDelivered;
        document.getElementById('enableForceRefresh').checked = this.settings.queryEngine.enableForceRefresh;
    };

    // ============================================================
    // TRACKING DATA MANAGEMENT
    // ============================================================

    ShipmentTrackerApp.prototype.loadTrackings = async function() {
        console.log('[App] Loading trackings...');

        try {
            this.trackings = await this.db.getAllTrackings();
            this.filteredTrackings = this.trackings.slice(); // Copy
            console.log('[App] Loaded', this.trackings.length, 'trackings');

            this.renderTable();

        } catch (err) {
            console.error('[App] Failed to load trackings:', err);
            this.showToast('Failed to load trackings: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.addTracking = async function(awb, carrier, dateShipped) {
        console.log('[App] Adding tracking:', awb, carrier);

        try {
            // Validate AWB format (basic check)
            if (!awb || !carrier) {
                throw new Error('AWB and carrier are required');
            }

            // Check if already exists
            var existing = await this.db.getTracking(awb);
            if (existing) {
                throw new Error('Tracking number already exists');
            }

            // Create new tracking record
            var tracking = {
                awb: awb,
                carrier: carrier,
                dateShipped: dateShipped || new Date().toISOString().split('T')[0],
                status: 'Pending',
                deliverySignal: 'UNKNOWN',
                delivered: false,
                lastChecked: new Date(0).toISOString(), // Force refresh
                lastUpdated: new Date().toISOString(),
                origin: { city: null, state: null, country: null, postalCode: null },
                destination: { city: null, state: null, country: null, postalCode: null },
                events: [],
                estimatedDelivery: null,
                note: '',
                tags: [],
                rawPayloadId: null
            };

            // Save to database
            await this.db.saveTracking(tracking);

            // Reload trackings
            await this.loadTrackings();
            this.updateStats();

            this.showToast('Tracking added: ' + awb, 'success');

            // Clear form
            document.getElementById('awbInput').value = '';
            document.getElementById('carrierSelect').value = '';
            document.getElementById('dateShipped').value = '';

        } catch (err) {
            console.error('[App] Failed to add tracking:', err);
            this.showToast('Failed to add tracking: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.deleteTracking = async function(awb) {
        console.log('[App] Deleting tracking:', awb);

        if (!confirm('Delete tracking ' + awb + '?')) {
            return;
        }

        try {
            await this.db.deleteTracking(awb);
            await this.loadTrackings();
            this.updateStats();
            this.closeDetail();

            this.showToast('Tracking deleted', 'success');

        } catch (err) {
            console.error('[App] Failed to delete tracking:', err);
            this.showToast('Failed to delete: ' + err.message, 'error');
        }
    };

    // ============================================================
    // TABLE RENDERING
    // ============================================================

    ShipmentTrackerApp.prototype.renderTable = function() {
        var tbody = document.getElementById('trackingTableBody');
        var emptyState = document.getElementById('emptyState');

        // Clear existing rows
        tbody.innerHTML = '';

        if (this.filteredTrackings.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Render rows
        for (var i = 0; i < this.filteredTrackings.length; i++) {
            var tracking = this.filteredTrackings[i];
            var row = this.createTableRow(tracking);
            tbody.appendChild(row);
        }
    };

    ShipmentTrackerApp.prototype.createTableRow = function(tracking) {
        var self = this;
        var row = document.createElement('tr');

        if (tracking.delivered) {
            row.classList.add('delivered');
        }

        // AWB
        var awbCell = document.createElement('td');
        awbCell.textContent = tracking.awb;
        row.appendChild(awbCell);

        // Carrier
        var carrierCell = document.createElement('td');
        carrierCell.textContent = tracking.carrier;
        row.appendChild(carrierCell);

        // Status
        var statusCell = document.createElement('td');
        var statusBadge = document.createElement('span');
        statusBadge.className = 'status-badge status-' + tracking.deliverySignal.toLowerCase();
        statusBadge.textContent = tracking.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Origin
        var originCell = document.createElement('td');
        originCell.textContent = this.formatLocation(tracking.origin);
        row.appendChild(originCell);

        // Destination
        var destCell = document.createElement('td');
        destCell.textContent = this.formatLocation(tracking.destination);
        row.appendChild(destCell);

        // Est. Delivery
        var deliveryCell = document.createElement('td');
        deliveryCell.textContent = tracking.estimatedDelivery || 'N/A';
        row.appendChild(deliveryCell);

        // Last Updated
        var updatedCell = document.createElement('td');
        updatedCell.textContent = this.formatDate(tracking.lastUpdated);
        row.appendChild(updatedCell);

        // Actions
        var actionsCell = document.createElement('td');
        var viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.className = 'btn-secondary';
        viewBtn.style.padding = '0.4rem 0.8rem';
        viewBtn.style.fontSize = '0.85rem';
        viewBtn.onclick = function() {
            self.showDetail(tracking.awb);
        };
        actionsCell.appendChild(viewBtn);
        row.appendChild(actionsCell);

        // Click row to view details
        row.onclick = function(e) {
            if (e.target.tagName !== 'BUTTON') {
                self.showDetail(tracking.awb);
            }
        };

        return row;
    };

    // ============================================================
    // FILTERING
    // ============================================================

    ShipmentTrackerApp.prototype.applyFilters = function() {
        console.log('[App] Applying filters:', this.currentFilters);

        this.filteredTrackings = this.trackings.filter(function(t) {
            var matchesCarrier = !this.currentFilters.carrier || t.carrier === this.currentFilters.carrier;
            var matchesStatus = !this.currentFilters.status || t.deliverySignal === this.currentFilters.status;
            var matchesSearch = !this.currentFilters.search ||
                                t.awb.toLowerCase().includes(this.currentFilters.search.toLowerCase());

            return matchesCarrier && matchesStatus && matchesSearch;
        }.bind(this));

        this.renderTable();
    };

    // ============================================================
    // DETAIL PANEL
    // ============================================================

    ShipmentTrackerApp.prototype.showDetail = async function(awb) {
        console.log('[App] Showing detail for:', awb);

        try {
            var tracking = await this.db.getTracking(awb);
            if (!tracking) {
                throw new Error('Tracking not found');
            }

            // Populate detail panel
            document.getElementById('detailAWB').textContent = awb;

            var detailInfo = document.getElementById('detailInfo');
            detailInfo.innerHTML = '';

            this.addDetailRow(detailInfo, 'Carrier', tracking.carrier);
            this.addDetailRow(detailInfo, 'Status', tracking.status);
            this.addDetailRow(detailInfo, 'Delivery Signal', tracking.deliverySignal);
            this.addDetailRow(detailInfo, 'Date Shipped', tracking.dateShipped);
            this.addDetailRow(detailInfo, 'Est. Delivery', tracking.estimatedDelivery || 'N/A');
            this.addDetailRow(detailInfo, 'Origin', this.formatLocation(tracking.origin));
            this.addDetailRow(detailInfo, 'Destination', this.formatLocation(tracking.destination));
            this.addDetailRow(detailInfo, 'Last Updated', this.formatDate(tracking.lastUpdated));
            this.addDetailRow(detailInfo, 'Last Checked', this.formatDate(tracking.lastChecked));

            // Render events
            this.renderEvents(tracking.events);

            // Setup delete button
            var self = this;
            document.getElementById('deleteTrackingBtn').onclick = function() {
                self.deleteTracking(awb);
            };

            // Setup force refresh button
            document.getElementById('forceRefreshBtn').onclick = function() {
                self.showToast('Force refresh not yet implemented', 'info');
            };

            // Show panel
            document.getElementById('detailPanel').classList.remove('hidden');

        } catch (err) {
            console.error('[App] Failed to show detail:', err);
            this.showToast('Failed to load details: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.addDetailRow = function(container, label, value) {
        var dt = document.createElement('dt');
        dt.textContent = label + ':';
        container.appendChild(dt);

        var dd = document.createElement('dd');
        dd.textContent = value;
        container.appendChild(dd);
    };

    ShipmentTrackerApp.prototype.renderEvents = function(events) {
        var timeline = document.getElementById('detailEvents');
        timeline.innerHTML = '';

        if (events.length === 0) {
            timeline.textContent = 'No events yet';
            return;
        }

        // Reverse to show newest first
        var reversed = events.slice().reverse();

        for (var i = 0; i < reversed.length; i++) {
            var event = reversed[i];

            var item = document.createElement('div');
            item.className = 'event-item';

            var time = document.createElement('div');
            time.className = 'event-time';
            time.textContent = this.formatDate(event.timestamp);
            item.appendChild(time);

            var desc = document.createElement('div');
            desc.className = 'event-desc';
            desc.textContent = event.description;
            item.appendChild(desc);

            var loc = document.createElement('div');
            loc.className = 'event-location';
            loc.textContent = event.location;
            item.appendChild(loc);

            timeline.appendChild(item);
        }
    };

    ShipmentTrackerApp.prototype.closeDetail = function() {
        document.getElementById('detailPanel').classList.add('hidden');
    };

    // ============================================================
    // STATISTICS
    // ============================================================

    ShipmentTrackerApp.prototype.updateStats = async function() {
        try {
            var stats = await this.db.getStats();

            document.getElementById('statTotal').textContent = stats.totalTrackings;
            document.getElementById('statActive').textContent = stats.activeCount;
            document.getElementById('statDelivered').textContent = stats.deliveredCount;

            // Count exceptions
            var exceptions = this.trackings.filter(function(t) {
                return t.deliverySignal === 'EXCEPTION' || t.deliverySignal === 'FAILED';
            }).length;
            document.getElementById('statException').textContent = exceptions;

            // Show stats if we have data
            if (stats.totalTrackings > 0) {
                document.getElementById('statsContainer').classList.remove('hidden');
            }

        } catch (err) {
            console.error('[App] Failed to update stats:', err);
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    ShipmentTrackerApp.prototype.exportData = async function(format) {
        console.log('[App] Exporting as:', format);

        try {
            var includeRaw = document.getElementById('exportRawPayloads').checked;
            var onlyActive = document.getElementById('exportOnlyActive').checked;

            var trackings = onlyActive
                ? this.trackings.filter(function(t) { return !t.delivered; })
                : this.trackings;

            if (format === 'json') {
                this.exportJSON(trackings, includeRaw);
            } else if (format === 'csv') {
                this.exportCSV(trackings);
            } else if (format === 'excel') {
                this.showToast('Excel export requires SheetJS library', 'info');
            }

            this.closeExport();

        } catch (err) {
            console.error('[App] Export failed:', err);
            this.showToast('Export failed: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.exportJSON = function(trackings, includeRaw) {
        var exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            recordCount: trackings.length,
            trackings: trackings
        };

        var jsonStr = JSON.stringify(exportData, null, 2);
        this.downloadFile(jsonStr, 'shipment-tracker-export.json', 'application/json');
        this.showToast('Exported ' + trackings.length + ' trackings as JSON', 'success');
    };

    ShipmentTrackerApp.prototype.exportCSV = function(trackings) {
        var headers = ['AWB', 'Carrier', 'Status', 'Delivered', 'Date Shipped', 'Est. Delivery', 'Last Updated'];

        var rows = trackings.map(function(t) {
            return [
                t.awb,
                t.carrier,
                t.status,
                t.delivered ? 'Yes' : 'No',
                t.dateShipped,
                t.estimatedDelivery || '',
                t.lastUpdated
            ];
        });

        var csvContent = [
            headers.join(','),
            ...rows.map(function(row) {
                return row.map(function(cell) {
                    return '"' + (cell || '').toString().replace(/"/g, '""') + '"';
                }).join(',');
            })
        ].join('\n');

        this.downloadFile(csvContent, 'shipment-tracker-export.csv', 'text/csv');
        this.showToast('Exported ' + trackings.length + ' trackings as CSV', 'success');
    };

    ShipmentTrackerApp.prototype.downloadFile = function(content, filename, mimeType) {
        var blob = new Blob([content], { type: mimeType });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ============================================================
    // UI HELPERS
    // ============================================================

    ShipmentTrackerApp.prototype.formatLocation = function(loc) {
        var parts = [];
        if (loc.city) parts.push(loc.city);
        if (loc.state) parts.push(loc.state);
        if (loc.country) parts.push(loc.country);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    ShipmentTrackerApp.prototype.formatDate = function(dateStr) {
        if (!dateStr) return 'N/A';
        var date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    ShipmentTrackerApp.prototype.showToast = function(message, type) {
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + (type || 'info');
        toast.textContent = message;

        var container = document.getElementById('toastContainer');
        container.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('fade-out');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 3000);
    };

    // ============================================================
    // PANEL CONTROLS
    // ============================================================

    ShipmentTrackerApp.prototype.toggleSettings = function() {
        var panel = document.getElementById('settingsPanel');
        panel.classList.toggle('hidden');
    };

    ShipmentTrackerApp.prototype.closeSettings = function() {
        document.getElementById('settingsPanel').classList.add('hidden');
    };

    ShipmentTrackerApp.prototype.toggleExport = function() {
        var panel = document.getElementById('exportPanel');
        panel.classList.toggle('hidden');
    };

    ShipmentTrackerApp.prototype.closeExport = function() {
        document.getElementById('exportPanel').classList.add('hidden');
    };

    // ============================================================
    // EVENT LISTENERS SETUP
    // ============================================================

    ShipmentTrackerApp.prototype.setupEventListeners = function() {
        var self = this;

        // Header buttons
        document.getElementById('refreshBtn').onclick = function() {
            self.showToast('Refresh not yet implemented', 'info');
        };

        document.getElementById('exportBtn').onclick = function() {
            self.toggleExport();
        };

        document.getElementById('settingsBtn').onclick = function() {
            self.toggleSettings();
        };

        // Settings panel
        document.getElementById('saveSettingsBtn').onclick = function() {
            self.saveSettings();
        };

        document.getElementById('closeSettingsBtn').onclick = function() {
            self.closeSettings();
        };

        // Force refresh toggle - warn when enabling
        document.getElementById('enableForceRefresh').onchange = function() {
            if (this.checked) {
                var confirmed = confirm(
                    '⚠️ Enable Force Refresh?\n\n' +
                    'Force refresh will ignore the cooldown period and query the carrier API immediately.\n\n' +
                    'WARNING: This will use more API calls and may hit your daily rate limit faster.\n\n' +
                    'Recommended: Keep this OFF and use the 10-minute cooldown.\n\n' +
                    'Enable anyway?'
                );

                if (!confirmed) {
                    this.checked = false;
                    self.showToast('Force refresh remains disabled', 'info');
                } else {
                    self.showToast('⚠️ Force refresh enabled - rate limits may be hit faster', 'warning');
                }
            }
        };

        // Password visibility toggles
        var toggleBtns = document.querySelectorAll('.toggle-visibility');
        for (var i = 0; i < toggleBtns.length; i++) {
            toggleBtns[i].onclick = function() {
                var targetId = this.getAttribute('data-target');
                var input = document.getElementById(targetId);
                input.type = input.type === 'password' ? 'text' : 'password';
            };
        }

        // Add tracking form
        document.getElementById('addTrackingForm').onsubmit = function(e) {
            e.preventDefault();
            var awb = document.getElementById('awbInput').value.trim();
            var carrier = document.getElementById('carrierSelect').value;

            // Auto-detect carrier if not selected
            if (!carrier) {
                carrier = TrackingUtils.detectCarrier(awb);
                if (!carrier) {
                    self.showToast('Could not detect carrier. Please select manually.', 'error');
                    return;
                }
            }

            var dateShipped = document.getElementById('dateShipped').value;
            self.addTracking(awb, carrier, dateShipped);
        };

        // Import button
        document.getElementById('importBtn').onclick = function() {
            document.getElementById('importFile').click();
        };

        document.getElementById('importFile').onchange = function(e) {
            self.showToast('Import not yet implemented', 'info');
            e.target.value = '';
        };

        // Filters
        document.getElementById('filterCarrier').onchange = function() {
            self.currentFilters.carrier = this.value;
            self.applyFilters();
        };

        document.getElementById('filterStatus').onchange = function() {
            self.currentFilters.status = this.value;
            self.applyFilters();
        };

        document.getElementById('searchInput').oninput = function() {
            self.currentFilters.search = this.value;
            self.applyFilters();
        };

        // Export panel
        document.getElementById('closeExportBtn').onclick = function() {
            self.closeExport();
        };

        var exportOptions = document.querySelectorAll('.export-option');
        for (var j = 0; j < exportOptions.length; j++) {
            exportOptions[j].onclick = function() {
                var format = this.getAttribute('data-format');
                self.exportData(format);
            };
        }

        // Detail panel
        document.getElementById('closeDetailBtn').onclick = function() {
            self.closeDetail();
        };
    };

    // ============================================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================================

    var app = new ShipmentTrackerApp();
    window.ShipmentTrackerApp = app;

})(window);
