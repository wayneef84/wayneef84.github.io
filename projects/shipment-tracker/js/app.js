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
            search: '',
            statFilter: 'total' // 'total', 'active', 'delivered', 'exception'
        };
        this.currentSort = {
            field: 'lastUpdated',
            direction: 'desc' // 'asc' or 'desc'
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
                enableForceRefresh: true,
                skipRefreshConfirmation: false
            },
            dataManagement: {
                pruneAfterDays: 90,
                autoPruneEnabled: false
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

            // Check URL parameters for initial filter
            this.loadURLParams();

            // Load trackings
            await this.loadTrackings();

            // Setup UI event listeners
            this.setupEventListeners();

            // Initialize debug menu
            if (window.DebugMenu) {
                window.DebugMenu.init();
            }

            // Update stats
            this.updateStats();

            // Set initial active stat card
            this.setActiveStatCard();

            // Auto-prune if enabled
            if (this.settings.dataManagement.autoPruneEnabled) {
                await this.pruneOldShipments(true);
            }

            // Initialize detail panel for desktop split view
            if (window.innerWidth >= 1024) {
                this.showEmptyDetailState();
            }

            // Open detail from URL if specified
            this.openDetailFromURL();

            // Mark app as ready
            this.ready = true;
            console.log('[App] Initialization complete - app ready');

            // Show success message
            this.showToast('Shipment Tracker loaded successfully', 'success');

        } catch (err) {
            console.error('[App] Initialization failed:', err);
            this.showToast('Failed to initialize app: ' + err.message, 'error');
        }
    };

    // ============================================================
    // URL PARAMETERS
    // ============================================================

    ShipmentTrackerApp.prototype.loadURLParams = function() {
        var urlParams = new URLSearchParams(window.location.search);

        // Filter parameter
        var filterParam = urlParams.get('filter');
        if (filterParam) {
            var validFilters = ['total', 'active', 'delivered', 'exception'];
            if (validFilters.indexOf(filterParam) !== -1) {
                this.currentFilters.statFilter = filterParam;
                console.log('[App] Loaded filter from URL:', filterParam);
            }
        }

        // Sort parameters
        var sortParam = urlParams.get('sort');
        var directionParam = urlParams.get('direction');
        if (sortParam) {
            var validSortFields = ['awb', 'carrier', 'status', 'origin', 'destination', 'estimatedDelivery', 'lastUpdated'];
            if (validSortFields.indexOf(sortParam) !== -1) {
                this.currentSort.field = sortParam;
                if (directionParam === 'asc' || directionParam === 'desc') {
                    this.currentSort.direction = directionParam;
                }
                console.log('[App] Loaded sort from URL:', sortParam, this.currentSort.direction);
            }
        }

        // AWB parameter (to auto-open detail panel)
        var awbParam = urlParams.get('awb');
        var carrierParam = urlParams.get('carrier');
        if (awbParam) {
            this.urlParamsAwb = awbParam;
            this.urlParamsCarrier = carrierParam; // Optional
            console.log('[App] Will open detail for AWB:', awbParam, 'Carrier:', carrierParam || 'any');
        }
    };

    ShipmentTrackerApp.prototype.openDetailFromURL = function() {
        if (!this.urlParamsAwb) return;

        var awb = this.urlParamsAwb;
        var carrier = this.urlParamsCarrier;

        // Find matching tracking
        var matching = this.trackings.filter(function(t) {
            if (carrier) {
                return t.awb === awb && t.carrier === carrier;
            } else {
                return t.awb === awb;
            }
        });

        if (matching.length > 0) {
            console.log('[App] Opening detail from URL for:', matching[0].awb);
            this.showDetail(matching[0].awb);
        } else {
            console.log('[App] No matching shipment found for AWB:', awb);
            this.showToast('Shipment not found: ' + awb, 'warning');
        }

        // Clear URL params so it doesn't re-open on refresh
        delete this.urlParamsAwb;
        delete this.urlParamsCarrier;
    };

    ShipmentTrackerApp.prototype.setActiveStatCard = function() {
        // Set the active stat card based on currentFilters.statFilter
        var allCards = document.querySelectorAll('.stat-card');
        for (var i = 0; i < allCards.length; i++) {
            allCards[i].classList.remove('active');
        }

        var activeCard = document.querySelector('.stat-card[data-filter="' + this.currentFilters.statFilter + '"]');
        if (activeCard) {
            activeCard.classList.add('active');
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
            // Ensure default structure exists first
            if (!this.settings.apiKeys) {
                this.settings.apiKeys = { DHL: '', FedEx: { clientId: '', clientSecret: '' }, UPS: { apiKey: '', username: '' } };
            }
            if (!this.settings.queryEngine) {
                this.settings.queryEngine = { cooldownMinutes: 10, skipDelivered: true, enableForceRefresh: false };
            }
            if (!this.settings.dataManagement) {
                this.settings.dataManagement = { pruneAfterDays: 90, autoPruneEnabled: false };
            }

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

            // Load data management config
            var dataManagement = await this.db.getSetting('dataManagement');
            if (dataManagement) {
                this.settings.dataManagement = dataManagement;
                this.populateDataManagementFields();
            }

        } catch (err) {
            console.error('[App] Failed to load settings:', err);
        }
    };

    ShipmentTrackerApp.prototype.saveSettings = async function() {
        console.log('[App] Saving settings...');

        try {
            // Ensure all settings objects exist (migration from old format or after reset)
            if (!this.settings.apiKeys || typeof this.settings.apiKeys !== 'object') {
                this.settings.apiKeys = { DHL: '', FedEx: {}, UPS: {} };
            }
            if (typeof this.settings.apiKeys.FedEx !== 'object' || !this.settings.apiKeys.FedEx) {
                this.settings.apiKeys.FedEx = { clientId: '', clientSecret: '' };
            }
            if (typeof this.settings.apiKeys.UPS !== 'object' || !this.settings.apiKeys.UPS) {
                this.settings.apiKeys.UPS = { apiKey: '', username: '' };
            }
            if (!this.settings.queryEngine || typeof this.settings.queryEngine !== 'object') {
                this.settings.queryEngine = { cooldownMinutes: 10, skipDelivered: true, enableForceRefresh: false };
            }
            if (!this.settings.dataManagement || typeof this.settings.dataManagement !== 'object') {
                this.settings.dataManagement = { pruneAfterDays: 90, autoPruneEnabled: false };
            }

            // Get values from form
            this.settings.apiKeys.DHL = document.getElementById('dhlApiKey').value;
            this.settings.apiKeys.FedEx.clientId = document.getElementById('fedexClientId').value;
            this.settings.apiKeys.FedEx.clientSecret = document.getElementById('fedexClientSecret').value;
            this.settings.apiKeys.UPS.apiKey = document.getElementById('upsApiKey').value;
            this.settings.apiKeys.UPS.username = document.getElementById('upsUsername').value;

            this.settings.queryEngine.cooldownMinutes = parseInt(document.getElementById('cooldownMinutes').value);
            this.settings.queryEngine.skipDelivered = document.getElementById('skipDelivered').checked;
            this.settings.queryEngine.enableForceRefresh = document.getElementById('enableForceRefresh').checked;
            this.settings.queryEngine.skipRefreshConfirmation = document.getElementById('skipRefreshConfirmation').checked;

            this.settings.dataManagement.pruneAfterDays = parseInt(document.getElementById('pruneAfterDays').value);
            this.settings.dataManagement.autoPruneEnabled = document.getElementById('autoPruneEnabled').checked;

            // Save to database
            await this.db.saveSetting('apiKeys', this.settings.apiKeys);
            await this.db.saveSetting('queryEngine', this.settings.queryEngine);
            await this.db.saveSetting('dataManagement', this.settings.dataManagement);

            this.showToast('Settings saved successfully', 'success');
            this.closeSettings();

        } catch (err) {
            console.error('[App] Failed to save settings:', err);
            this.showToast('Failed to save settings: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.populateAPIKeyFields = function() {
        // Ensure apiKeys structure is correct (migration from old format)
        if (typeof this.settings.apiKeys.FedEx !== 'object' || !this.settings.apiKeys.FedEx) {
            this.settings.apiKeys.FedEx = { clientId: '', clientSecret: '' };
        }
        if (typeof this.settings.apiKeys.UPS !== 'object' || !this.settings.apiKeys.UPS) {
            this.settings.apiKeys.UPS = { apiKey: '', username: '' };
        }

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
        document.getElementById('skipRefreshConfirmation').checked = this.settings.queryEngine.skipRefreshConfirmation || false;
    };

    ShipmentTrackerApp.prototype.populateDataManagementFields = function() {
        document.getElementById('pruneAfterDays').value = this.settings.dataManagement.pruneAfterDays;
        document.getElementById('autoPruneEnabled').checked = this.settings.dataManagement.autoPruneEnabled;
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
            this.renderMobileCards();

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

            // Check if already exists for this carrier
            var existing = await this.db.getTracking(awb, carrier);
            if (existing) {
                throw new Error('Tracking number already exists for ' + carrier);
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

            // Auto-refresh to fetch tracking data
            try {
                console.log('[App] Auto-refreshing new tracking:', awb);
                var freshData = await this.queryEngine(awb, carrier);
                await this.db.saveTracking(freshData);
                await this.loadTrackings();
                this.updateStats();
                this.showToast('✅ Tracking data loaded!', 'success');
            } catch (refreshErr) {
                console.error('[App] Auto-refresh failed:', refreshErr);
                this.showToast('⚠️ Added but could not fetch data. Try Force Refresh.', 'warning');
            }

            // Clear form
            document.getElementById('awbInput').value = '';
            document.getElementById('carrierSelect').value = '';
            document.getElementById('dateShipped').value = '';

        } catch (err) {
            console.error('[App] Failed to add tracking:', err);
            this.showToast('Failed to add tracking: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.deleteTracking = async function(awb, carrier) {
        console.log('[App] Deleting tracking:', awb, carrier);

        // If carrier not provided, get it from the tracking record
        if (!carrier) {
            var tracking = await this.db.getTracking(awb);
            if (tracking) {
                carrier = tracking.carrier;
            }
        }

        var displayName = carrier ? (awb + ' (' + carrier + ')') : awb;
        if (!confirm('Delete tracking ' + displayName + '?')) {
            return;
        }

        try {
            await this.db.deleteTracking(awb, carrier);
            await this.loadTrackings();
            this.updateStats();
            this.closeDetail();

            this.showToast('Tracking deleted', 'success');

        } catch (err) {
            console.error('[App] Failed to delete tracking:', err);
            this.showToast('Failed to delete: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.pruneOldShipments = async function(autoMode) {
        console.log('[App] Pruning old shipments...');

        try {
            var cutoffDays = this.settings.dataManagement.pruneAfterDays;
            var cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - cutoffDays);

            // Find shipments older than cutoff
            var toPrune = this.trackings.filter(function(t) {
                var lastUpdate = new Date(t.lastUpdated);
                return lastUpdate < cutoffDate;
            });

            if (toPrune.length === 0) {
                if (!autoMode) {
                    this.showToast('No shipments older than ' + cutoffDays + ' days', 'info');
                }
                return;
            }

            // In auto mode, prune silently. In manual mode, ask for confirmation
            if (!autoMode) {
                var confirmed = confirm(
                    'Prune ' + toPrune.length + ' shipment(s) older than ' + cutoffDays + ' days?\n\n' +
                    'They will be exported to a JSON file before deletion.'
                );
                if (!confirmed) {
                    this.showToast('Pruning cancelled', 'info');
                    return;
                }
            }

            // Export pruned data for archival
            var exportData = {
                exportDate: new Date().toISOString(),
                cutoffDate: cutoffDate.toISOString(),
                pruneAfterDays: cutoffDays,
                count: toPrune.length,
                shipments: toPrune
            };

            var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'pruned-shipments-' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Delete pruned shipments from database
            for (var i = 0; i < toPrune.length; i++) {
                await this.db.deleteTracking(toPrune[i].awb, toPrune[i].carrier);
            }

            // Reload data
            await this.loadTrackings();
            this.updateStats();

            this.showToast('Pruned ' + toPrune.length + ' old shipment(s)', 'success');

        } catch (err) {
            console.error('[App] Pruning failed:', err);
            this.showToast('Pruning failed: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.clearAllData = async function() {
        console.log('[App] Clear all data requested');

        var confirmed = confirm(
            '⚠️ Clear All Data?\n\n' +
            'This will permanently delete:\n' +
            '- All tracking records\n' +
            '- All API payloads\n' +
            '- All settings (API keys, preferences)\n\n' +
            'This action cannot be undone.\n\n' +
            'Are you sure you want to continue?'
        );

        if (!confirmed) {
            this.showToast('Clear all data cancelled', 'info');
            return;
        }

        // Double confirmation for safety
        var doubleConfirmed = confirm(
            'Final confirmation: Delete everything?\n\n' +
            'Click OK to permanently delete all data.'
        );

        if (!doubleConfirmed) {
            this.showToast('Clear all data cancelled', 'info');
            return;
        }

        try {
            await this.db.clearAll();

            // Reset app state
            this.allTrackings = [];
            this.filteredTrackings = [];
            this.settings = {
                apiKeys: {},
                queryEngine: {
                    cooldownMinutes: 10,
                    skipDelivered: true,
                    enableForceRefresh: false
                }
            };

            // Reload UI
            await this.loadTrackings();
            this.updateStats();
            this.closeDetail();
            this.closeSettings();

            this.showToast('✅ All data cleared successfully', 'success');

        } catch (err) {
            console.error('[App] Failed to clear all data:', err);
            this.showToast('Failed to clear data: ' + err.message, 'error');
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

        // AWB (truncated, clickable to carrier site)
        var awbCell = document.createElement('td');
        var trackingURL = TrackingUtils.getCarrierTrackingURL(tracking.carrier, tracking.awb);
        if (trackingURL) {
            var awbLink = document.createElement('a');
            awbLink.href = trackingURL;
            awbLink.target = '_blank';
            awbLink.rel = 'noopener noreferrer';
            awbLink.textContent = this.truncateAWB(tracking.awb);
            awbLink.title = tracking.awb + ' (click to track on ' + tracking.carrier + ' site)';
            awbLink.style.textDecoration = 'none';
            awbLink.style.color = 'var(--primary-color)';
            awbCell.appendChild(awbLink);
        } else {
            awbCell.textContent = this.truncateAWB(tracking.awb);
            awbCell.title = tracking.awb; // Full AWB on hover
        }
        row.appendChild(awbCell);

        // Carrier
        var carrierCell = document.createElement('td');
        carrierCell.textContent = tracking.carrier;
        row.appendChild(carrierCell);

        // Status Icon (separate column)
        var iconCell = document.createElement('td');
        iconCell.className = 'status-icon-column';
        iconCell.textContent = this.getStatusIcon(tracking.deliverySignal);
        iconCell.style.fontSize = '1.25rem';
        row.appendChild(iconCell);

        // Status Text (separate column)
        var statusCell = document.createElement('td');
        statusCell.className = 'status-text-column';
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

        // Est. Delivery (date only, no time) with conditional styling
        var deliveryCell = document.createElement('td');
        if (tracking.estimatedDelivery) {
            var estDate = new Date(tracking.estimatedDelivery);
            var etaStyle = this.getETAStyle(tracking.estimatedDelivery, tracking.deliverySignal, tracking.status);

            deliveryCell.textContent = (estDate.getMonth() + 1) + '/' + estDate.getDate();
            deliveryCell.style.color = etaStyle.color;
            deliveryCell.style.fontWeight = etaStyle.bold ? 'bold' : 'normal';
            deliveryCell.style.textDecoration = etaStyle.underline ? 'underline' : 'none';
            deliveryCell.className = etaStyle.className;
        } else {
            deliveryCell.textContent = 'N/A';
        }
        row.appendChild(deliveryCell);

        // Last Updated (mm/dd 24hr:mm:ss TZ)
        var updatedCell = document.createElement('td');
        if (tracking.lastUpdated) {
            var date = new Date(tracking.lastUpdated);
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = String(date.getHours()).padStart(2, '0');
            var minutes = String(date.getMinutes()).padStart(2, '0');
            var seconds = String(date.getSeconds()).padStart(2, '0');
            var tz = date.toLocaleTimeString('en-US', {timeZoneName: 'short'}).split(' ').pop();
            updatedCell.textContent = month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + tz;
        } else {
            updatedCell.textContent = 'N/A';
        }
        row.appendChild(updatedCell);

        // Actions
        var actionsCell = document.createElement('td');
        actionsCell.className = 'actions-column';
        actionsCell.style.display = 'flex';
        actionsCell.style.gap = '0.5rem';
        actionsCell.style.justifyContent = 'center';

        // Details button
        var detailsBtn = document.createElement('button');
        detailsBtn.innerHTML = '<span class="btn-icon">📋</span><span class="btn-text">Details</span>';
        detailsBtn.className = 'btn-secondary btn-details';
        detailsBtn.onclick = function(e) {
            e.stopPropagation(); // Prevent row click
            self.showDetail(tracking.awb);
        };
        actionsCell.appendChild(detailsBtn);

        // Refresh button (icon only)
        var refreshBtn = document.createElement('button');
        refreshBtn.innerHTML = '🔄';
        refreshBtn.className = 'btn-icon-only';
        refreshBtn.title = 'Force Refresh';
        refreshBtn.onclick = function(e) {
            e.stopPropagation();
            self.forceRefreshTracking(tracking.awb);
        };
        actionsCell.appendChild(refreshBtn);

        // Delete button (icon only)
        var deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'btn-icon-only btn-danger';
        deleteBtn.title = 'Delete Tracking';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            self.deleteTracking(tracking.awb, tracking.carrier);
        };
        actionsCell.appendChild(deleteBtn);

        row.appendChild(actionsCell);

        // Row click: only switch detail if panel already open
        row.onclick = function(e) {
            // Don't open detail on row click - only via button
            // But if detail is already open, switch to this row
            if (!document.getElementById('detailPanel').classList.contains('hidden')) {
                self.showDetail(tracking.awb);
            }
        };

        return row;
    };

    // ============================================================
    // MOBILE CARDS RENDERING
    // ============================================================

    ShipmentTrackerApp.prototype.renderMobileCards = function() {
        var container = document.getElementById('mobileCardsContainer');

        // Clear existing cards
        container.innerHTML = '';

        if (this.filteredTrackings.length === 0) {
            // Show empty state
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.style.textAlign = 'center';
            emptyDiv.style.padding = '2rem';
            emptyDiv.innerHTML = '<div class="empty-icon">📦</div><h3>No Tracking Data</h3><p>Add your first tracking number above to get started.</p>';
            container.appendChild(emptyDiv);
            return;
        }

        // Detect duplicate AWBs (similar first 2 + last 5 chars)
        var duplicateMap = {};
        for (var i = 0; i < this.filteredTrackings.length; i++) {
            var awb = this.filteredTrackings[i].awb;
            // Create key from first 2 + last 5 chars for duplicate detection
            var key = awb.length > 7 ? (awb.substring(0, 2) + awb.slice(-5)) : awb;
            if (!duplicateMap[key]) {
                duplicateMap[key] = [];
            }
            duplicateMap[key].push(awb);
        }

        // Render cards
        for (var j = 0; j < this.filteredTrackings.length; j++) {
            var tracking = this.filteredTrackings[j];
            var card = this.createMobileCard(tracking, duplicateMap);
            container.appendChild(card);
        }
    };

    ShipmentTrackerApp.prototype.createMobileCard = function(tracking, duplicateMap) {
        var self = this;
        var card = document.createElement('div');
        card.className = 'shipment-card';
        card.dataset.awb = tracking.awb;

        // Detect if similar AWBs exist (first 2 + last 5 chars match)
        var key = tracking.awb.length > 7 ? (tracking.awb.substring(0, 2) + tracking.awb.slice(-5)) : tracking.awb;
        var hasDuplicates = duplicateMap[key] && duplicateMap[key].length > 1;

        // Card Header
        var header = document.createElement('div');
        header.className = 'card-header';

        // Status Icon with ETA
        var iconContainer = document.createElement('div');
        iconContainer.style.display = 'flex';
        iconContainer.style.flexDirection = 'column';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.gap = '0.25rem';

        var iconDiv = document.createElement('div');
        iconDiv.className = 'card-status-icon';
        iconDiv.style.backgroundColor = TrackingUtils.getStatusColor(tracking.deliverySignal);
        iconDiv.textContent = TrackingUtils.getStatusIcon(tracking.deliverySignal);
        iconContainer.appendChild(iconDiv);

        // Add ETA display under icon
        if (tracking.estimatedDelivery) {
            var etaDiv = document.createElement('div');
            etaDiv.className = 'card-eta';
            var etaStyle = this.getETAStyle(tracking.estimatedDelivery, tracking.deliverySignal, tracking.status);
            etaDiv.className += ' ' + etaStyle.className;
            etaDiv.style.fontSize = '0.75rem';
            etaDiv.style.fontWeight = etaStyle.bold ? 'bold' : 'normal';
            etaDiv.style.color = etaStyle.color;
            etaDiv.style.textDecoration = etaStyle.underline ? 'underline' : 'none';

            var etaDate = new Date(tracking.estimatedDelivery);
            etaDiv.textContent = (etaDate.getMonth() + 1) + '/' + etaDate.getDate();
            iconContainer.appendChild(etaDiv);
        }

        header.appendChild(iconContainer);

        // Card Info
        var info = document.createElement('div');
        info.className = 'card-info';

        var awbDiv = document.createElement('div');
        awbDiv.className = 'card-awb';

        // Make AWB a clickable link to carrier website
        var trackingURL = TrackingUtils.getCarrierTrackingURL(tracking.carrier, tracking.awb);
        if (trackingURL) {
            var awbLink = document.createElement('a');
            awbLink.href = trackingURL;
            awbLink.target = '_blank';
            awbLink.rel = 'noopener noreferrer';
            awbLink.textContent = tracking.awb;
            awbLink.style.color = 'inherit';
            awbLink.style.textDecoration = 'none';
            awbLink.onclick = function(e) {
                e.stopPropagation(); // Prevent card expansion
            };
            awbDiv.appendChild(awbLink);
        } else {
            awbDiv.textContent = tracking.awb;
        }

        // Add duplicate badge if needed
        if (hasDuplicates) {
            var badge = document.createElement('span');
            badge.className = 'card-duplicate-badge';
            badge.textContent = duplicateMap[key].length + 'x';
            badge.title = 'Multiple AWBs with similar numbers';
            awbDiv.appendChild(badge);
        }

        info.appendChild(awbDiv);

        var carrierDiv = document.createElement('div');
        carrierDiv.className = 'card-carrier';
        carrierDiv.textContent = tracking.carrier + ' • ' + tracking.status;
        info.appendChild(carrierDiv);

        header.appendChild(info);

        // Expand Icon
        var expandIcon = document.createElement('div');
        expandIcon.className = 'card-expand-icon';
        expandIcon.textContent = '⌄';
        header.appendChild(expandIcon);

        card.appendChild(header);

        // Card Body (Collapsed by default)
        var body = document.createElement('div');
        body.className = 'card-body';

        var details = document.createElement('div');
        details.className = 'card-details';

        // Full AWB
        this.addCardDetailRow(details, 'Full AWB', tracking.awb);

        // Origin → Destination
        var route = this.formatLocation(tracking.origin) + ' → ' + this.formatLocation(tracking.destination);
        this.addCardDetailRow(details, 'Route', route);

        // Est. Delivery
        this.addCardDetailRow(details, 'Est. Delivery', tracking.estimatedDelivery || 'N/A');

        // Last Updated
        this.addCardDetailRow(details, 'Last Updated', this.formatDate(tracking.lastUpdated));

        body.appendChild(details);

        // Card Actions
        var actions = document.createElement('div');
        actions.className = 'card-actions';

        // Track on carrier site button
        var trackingURL = TrackingUtils.getCarrierTrackingURL(tracking.carrier, tracking.awb);
        if (trackingURL) {
            var trackBtn = document.createElement('a');
            trackBtn.className = 'btn-primary';
            trackBtn.href = trackingURL;
            trackBtn.target = '_blank';
            trackBtn.rel = 'noopener noreferrer';
            trackBtn.innerHTML = '<span class="btn-icon">🔗</span><span class="btn-text">Track on</span>';
            trackBtn.style.textDecoration = 'none';
            trackBtn.onclick = function(e) {
                e.stopPropagation();
            };
            actions.appendChild(trackBtn);
        }

        var viewBtn = document.createElement('button');
        viewBtn.className = 'btn-secondary';
        viewBtn.innerHTML = '<span class="btn-icon">📋</span><span class="btn-text">Details</span>';
        viewBtn.onclick = function(e) {
            e.stopPropagation();
            self.showDetail(tracking.awb);
        };
        actions.appendChild(viewBtn);

        var deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-danger';
        deleteBtn.innerHTML = '<span class="btn-icon">🗑️</span><span class="btn-text">Delete</span>';
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            self.deleteTracking(tracking.awb, tracking.carrier);
        };
        actions.appendChild(deleteBtn);

        body.appendChild(actions);
        card.appendChild(body);

        // Toggle expand/collapse
        header.onclick = function() {
            card.classList.toggle('expanded');
        };

        return card;
    };

    ShipmentTrackerApp.prototype.addCardDetailRow = function(container, label, value) {
        var row = document.createElement('div');
        row.className = 'card-detail-row';

        var labelDiv = document.createElement('div');
        labelDiv.className = 'card-detail-label';
        labelDiv.textContent = label + ':';
        row.appendChild(labelDiv);

        var valueDiv = document.createElement('div');
        valueDiv.className = 'card-detail-value';
        valueDiv.textContent = value;
        row.appendChild(valueDiv);

        container.appendChild(row);
    };

    // ============================================================
    // FILTERING
    // ============================================================

    ShipmentTrackerApp.prototype.toggleStatFilter = function(filterType) {
        // If clicking same filter, toggle off (back to total)
        if (this.currentFilters.statFilter === filterType && filterType !== 'total') {
            this.currentFilters.statFilter = 'total';
        } else {
            this.currentFilters.statFilter = filterType;
        }

        // Update UI: highlight active card
        var allCards = document.querySelectorAll('.stat-card');
        for (var i = 0; i < allCards.length; i++) {
            allCards[i].classList.remove('active');
        }

        if (this.currentFilters.statFilter === 'total') {
            document.getElementById('statCardTotal').classList.add('active');
        } else {
            var activeCard = document.querySelector('.stat-card[data-filter="' + this.currentFilters.statFilter + '"]');
            if (activeCard) {
                activeCard.classList.add('active');
            }
        }

        // Update URL parameter
        var newUrl = new URL(window.location);
        if (this.currentFilters.statFilter === 'total') {
            newUrl.searchParams.delete('filter');
        } else {
            newUrl.searchParams.set('filter', this.currentFilters.statFilter);
        }
        window.history.pushState({}, '', newUrl);

        this.applyFilters();
    };

    ShipmentTrackerApp.prototype.applyFilters = function() {
        console.log('[App] Applying filters:', this.currentFilters);

        this.filteredTrackings = this.trackings.filter(function(t) {
            // Stat filter
            var matchesStatFilter = true;
            if (this.currentFilters.statFilter === 'active') {
                matchesStatFilter = !t.delivered;
            } else if (this.currentFilters.statFilter === 'delivered') {
                matchesStatFilter = t.delivered;
            } else if (this.currentFilters.statFilter === 'exception') {
                matchesStatFilter = t.deliverySignal === 'EXCEPTION' || t.deliverySignal === 'FAILED';
            }
            // total = show all, no filter

            var matchesCarrier = !this.currentFilters.carrier || t.carrier === this.currentFilters.carrier;
            var matchesStatus = !this.currentFilters.status || t.deliverySignal === this.currentFilters.status;
            var matchesSearch = !this.currentFilters.search ||
                                t.awb.toLowerCase().includes(this.currentFilters.search.toLowerCase());

            return matchesStatFilter && matchesCarrier && matchesStatus && matchesSearch;
        }.bind(this));

        // Apply sorting
        this.applySorting();

        this.renderTable();
        this.renderMobileCards();
    };

    /**
     * Apply current sort to filteredTrackings
     */
    ShipmentTrackerApp.prototype.applySorting = function() {
        var self = this;
        var field = this.currentSort.field;
        var direction = this.currentSort.direction;

        this.filteredTrackings.sort(function(a, b) {
            var aVal, bVal;

            // Get values based on field
            switch (field) {
                case 'awb':
                    aVal = a.awb || '';
                    bVal = b.awb || '';
                    break;
                case 'carrier':
                    aVal = a.carrier || '';
                    bVal = b.carrier || '';
                    break;
                case 'status':
                    aVal = a.status || '';
                    bVal = b.status || '';
                    break;
                case 'origin':
                    aVal = self.formatLocation(a.origin);
                    bVal = self.formatLocation(b.origin);
                    break;
                case 'destination':
                    aVal = self.formatLocation(a.destination);
                    bVal = self.formatLocation(b.destination);
                    break;
                case 'estimatedDelivery':
                    aVal = a.estimatedDelivery ? new Date(a.estimatedDelivery).getTime() : 0;
                    bVal = b.estimatedDelivery ? new Date(b.estimatedDelivery).getTime() : 0;
                    break;
                case 'lastUpdated':
                    aVal = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
                    bVal = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
                    break;
                default:
                    return 0;
            }

            // Compare values
            var comparison = 0;
            if (typeof aVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else {
                comparison = aVal - bVal;
            }

            // Apply direction
            return direction === 'asc' ? comparison : -comparison;
        });
    };

    /**
     * Set sort field and direction
     */
    ShipmentTrackerApp.prototype.setSorting = function(field, direction) {
        console.log('[App] Setting sort:', field, direction);

        this.currentSort.field = field;
        this.currentSort.direction = direction;

        // Update URL parameter
        var newUrl = new URL(window.location);
        newUrl.searchParams.set('sort', field);
        newUrl.searchParams.set('direction', direction);
        window.history.pushState({}, '', newUrl);

        // Update UI indicators
        this.updateSortIndicators();

        // Re-apply filters (which will also sort)
        this.applyFilters();
    };

    /**
     * Update sort indicator arrows in table headers
     */
    ShipmentTrackerApp.prototype.updateSortIndicators = function() {
        var headers = document.querySelectorAll('th.sortable');
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            var sortField = header.getAttribute('data-sort');
            var indicator = header.querySelector('.sort-indicator');

            if (sortField === this.currentSort.field) {
                header.classList.add('sorted');
                indicator.textContent = this.currentSort.direction === 'asc' ? ' ▲' : ' ▼';
            } else {
                header.classList.remove('sorted');
                indicator.textContent = '';
            }
        }

        // Update mobile sort menu
        var sortOptions = document.querySelectorAll('.sort-option');
        for (var j = 0; j < sortOptions.length; j++) {
            var option = sortOptions[j];
            var optionField = option.getAttribute('data-sort');
            var optionDirection = option.getAttribute('data-direction');

            if (optionField === this.currentSort.field && optionDirection === this.currentSort.direction) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        }
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

            // Render payload
            this.renderPayload(tracking.rawPayload || tracking);

            // Setup delete button
            var self = this;
            document.getElementById('deleteTrackingBtn').onclick = function() {
                self.deleteTracking(awb, tracking.carrier);
            };

            // Setup force refresh button
            document.getElementById('forceRefreshBtn').onclick = function() {
                self.forceRefreshTracking(awb);
            };

            // Setup download payload button
            document.getElementById('downloadPayloadBtn').onclick = function() {
                self.downloadPayload(tracking);
            };

            // Show action buttons
            var deleteBtn = document.getElementById('deleteTrackingBtn');
            var forceRefreshBtn = document.getElementById('forceRefreshBtn');
            var downloadBtn = document.getElementById('downloadPayloadBtn');
            if (deleteBtn) deleteBtn.style.display = '';
            if (forceRefreshBtn) forceRefreshBtn.style.display = '';
            if (downloadBtn) downloadBtn.style.display = '';

            // Show panel
            document.getElementById('detailPanel').classList.remove('hidden');

            // Add class to body to hide actions column on desktop
            if (window.innerWidth >= 1024) {
                document.body.classList.add('detail-open');
            }

            // Setup back to top button
            this.setupBackToTop();

        } catch (err) {
            console.error('[App] Failed to show detail:', err);
            this.showToast('Failed to load details: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.setupBackToTop = function() {
        var detailPanel = document.getElementById('detailPanel');
        var backToTopBtn = document.getElementById('detailBackToTop');

        if (!detailPanel || !backToTopBtn) return;

        // Show/hide button based on scroll position
        detailPanel.onscroll = function() {
            if (detailPanel.scrollTop > 200) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        };

        // Scroll to top when clicked
        backToTopBtn.onclick = function() {
            detailPanel.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
    };

    ShipmentTrackerApp.prototype.addDetailRow = function(container, label, value) {
        var dt = document.createElement('dt');
        dt.textContent = label + ':';
        container.appendChild(dt);

        var dd = document.createElement('dd');
        dd.textContent = value;
        container.appendChild(dd);
    };

    ShipmentTrackerApp.prototype.renderPayload = function(payload) {
        var viewer = document.getElementById('payloadViewer');
        viewer.innerHTML = '';

        if (!payload) {
            viewer.textContent = 'No payload data available';
            return;
        }

        // Create syntax-highlighted JSON
        var pre = document.createElement('pre');
        pre.innerHTML = this.syntaxHighlightJSON(payload);
        viewer.appendChild(pre);
    };

    ShipmentTrackerApp.prototype.syntaxHighlightJSON = function(obj) {
        var json = JSON.stringify(obj, null, 2);

        // Simple syntax highlighting
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';

                    // Check if string value is a URL and make it clickable
                    var urlMatch = match.match(/^"(https?:\/\/[^"]+)"$/);
                    if (urlMatch) {
                        var url = urlMatch[1];
                        return '<span class="' + cls + '"><a href="' + url + '" target="_blank" rel="noopener noreferrer">"' + url + '"</a></span>';
                    }
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });

        return json;
    };

    ShipmentTrackerApp.prototype.downloadPayload = function(tracking) {
        var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        var filename = 'payload_' + tracking.awb + '_' + timestamp + '.json';

        var payload = tracking.rawPayload || tracking;
        var jsonStr = JSON.stringify(payload, null, 2);

        this.downloadFile(jsonStr, filename, 'application/json');
        this.showToast('Downloaded payload for ' + tracking.awb, 'success');
    };

    ShipmentTrackerApp.prototype.refreshAllTrackings = async function() {
        console.log('[App] Refreshing all trackings');

        try {
            var activeTrackings = this.trackings.filter(function(t) {
                return !t.delivered;
            });

            if (activeTrackings.length === 0) {
                this.showToast('No active trackings to refresh', 'info');
                return;
            }

            // TODO: Implement actual API refresh
            // For now, just show a message
            this.showToast('🔄 Refresh all coming soon! (' + activeTrackings.length + ' active trackings)', 'info');

            // Future implementation:
            // 1. Loop through active trackings
            // 2. Call carrier adapter for each
            // 3. Update IndexedDB with new data
            // 4. Refresh UI
            // 5. Show success summary

        } catch (err) {
            console.error('[App] Refresh all failed:', err);
            this.showToast('Refresh failed: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.forceRefreshTracking = async function(awb) {
        console.log('[App] Force refreshing:', awb);

        // Check if force refresh is enabled in settings
        if (!this.settings.queryEngine.enableForceRefresh) {
            this.showToast('⚠️ Force refresh is disabled. Enable in Settings first.', 'warning');
            return;
        }

        // Ask for confirmation unless skipRefreshConfirmation is enabled
        if (!this.settings.queryEngine.skipRefreshConfirmation) {
            if (!confirm('Force refresh ' + awb + '? This will use an API call and may count against rate limits.')) {
                return;
            }
        }

        try {
            var tracking = await this.db.getTracking(awb);
            if (!tracking) {
                throw new Error('Tracking not found');
            }

            // Show loading state
            this.showToast('🔄 Refreshing tracking data...', 'info');

            // Call query engine to get fresh data
            var freshData = await this.queryEngine(tracking.awb, tracking.carrier);

            // Update database
            await this.db.saveTracking(freshData);

            // Reload all trackings
            await this.loadTrackings();

            // Refresh detail panel if it's still showing this tracking
            var currentDetailAWB = document.getElementById('detailAWB').textContent;
            if (currentDetailAWB === awb) {
                this.showDetail(awb);
            }

            this.showToast('✅ Tracking refreshed successfully!', 'success');

        } catch (err) {
            console.error('[App] Force refresh failed:', err);
            this.showToast('Force refresh failed: ' + err.message, 'error');
        }
    };

    // ============================================================
    // QUERY ENGINE
    // ============================================================

    /**
     * Query engine - routes AWB to correct carrier adapter
     * @param {string} awb - Tracking number
     * @param {string} carrier - Carrier name (optional, will auto-detect if missing)
     * @returns {Promise<Object>} Fresh tracking data
     */
    ShipmentTrackerApp.prototype.queryEngine = async function(awb, carrier) {
        console.log('[Query Engine] Fetching data for:', awb, 'Carrier:', carrier);

        // Auto-detect carrier if not provided
        if (!carrier) {
            carrier = TrackingUtils.detectCarrier(awb);
            console.log('[Query Engine] Auto-detected carrier:', carrier);
        }

        if (!carrier) {
            throw new Error('Unable to detect carrier for AWB: ' + awb);
        }

        // Route to correct adapter based on carrier
        var adapter;
        switch (carrier.toUpperCase()) {
            case 'DHL':
                if (!window.DHLAdapter) {
                    throw new Error('DHL adapter not loaded');
                }
                adapter = window.DHLAdapter;
                break;

            case 'FEDEX':
                if (!window.FedExAdapter) {
                    throw new Error('FedEx adapter not loaded');
                }
                adapter = window.FedExAdapter;
                break;

            case 'UPS':
                if (!window.UPSAdapter) {
                    throw new Error('UPS adapter not loaded');
                }
                adapter = window.UPSAdapter;
                break;

            default:
                throw new Error('Unsupported carrier: ' + carrier);
        }

        // Call adapter's trackShipment method
        console.log('[Query Engine] Calling', carrier, 'adapter...');
        var trackingData = await adapter.trackShipment(awb);

        console.log('[Query Engine] Received data:', trackingData);
        return trackingData;
    };

    // ============================================================
    // EVENT RENDERING
    // ============================================================

    ShipmentTrackerApp.prototype.renderEvents = function(events) {
        var timeline = document.getElementById('detailEvents');
        timeline.innerHTML = '';

        if (!events || events.length === 0) {
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
            // Handle description as object or string
            if (typeof event.description === 'object' && event.description !== null) {
                desc.textContent = JSON.stringify(event.description);
            } else {
                desc.textContent = event.description || 'No description';
            }
            item.appendChild(desc);

            var loc = document.createElement('div');
            loc.className = 'event-location';
            // Handle location as object or string
            if (typeof event.location === 'object' && event.location !== null) {
                loc.textContent = TrackingUtils.formatLocation(event.location);
            } else {
                loc.textContent = event.location || '';
            }
            item.appendChild(loc);

            // Add expandable JSON button if event has extra data
            var hasExtraData = Object.keys(event).some(function(key) {
                return key !== 'timestamp' && key !== 'description' && key !== 'location';
            });

            if (hasExtraData) {
                var expandBtn = document.createElement('button');
                expandBtn.className = 'event-expand-btn';
                expandBtn.textContent = '📋 Raw Data';
                expandBtn.style.cssText = 'margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; cursor: pointer;';

                expandBtn.onclick = function(e) {
                    e.stopPropagation();
                    var pre = this.nextElementSibling;
                    if (pre && pre.tagName === 'PRE') {
                        pre.style.display = pre.style.display === 'none' ? 'block' : 'none';
                        this.textContent = pre.style.display === 'none' ? '📋 Raw Data' : '🔼 Hide Data';
                    }
                };

                var jsonPre = document.createElement('pre');
                jsonPre.style.cssText = 'display: none; margin-top: 0.5rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; font-size: 0.75rem; overflow-x: auto;';
                jsonPre.textContent = JSON.stringify(event, null, 2);

                item.appendChild(expandBtn);
                item.appendChild(jsonPre);
            }

            timeline.appendChild(item);
        }
    };

    ShipmentTrackerApp.prototype.closeDetail = function() {
        // Remove detail-open class from body
        document.body.classList.remove('detail-open');

        // On desktop (1024px+), keep panel open but show empty state
        // On mobile/tablet, hide panel completely
        if (window.innerWidth >= 1024) {
            this.showEmptyDetailState();
        } else {
            document.getElementById('detailPanel').classList.add('hidden');
        }
    };

    ShipmentTrackerApp.prototype.showEmptyDetailState = function() {
        var panel = document.getElementById('detailPanel');
        if (!panel) return;

        // On desktop, hide the panel completely instead of showing "No selection"
        // This extends the table to full width
        panel.classList.add('hidden');
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

            // Update mobile bottom bar counts
            var countTotal = document.getElementById('countTotal');
            var countActive = document.getElementById('countActive');
            var countDelivered = document.getElementById('countDelivered');
            var countIssues = document.getElementById('countIssues');

            if (countTotal) countTotal.textContent = stats.totalTrackings;
            if (countActive) countActive.textContent = stats.activeCount;
            if (countDelivered) countDelivered.textContent = stats.deliveredCount;
            if (countIssues) countIssues.textContent = exceptions;

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

    ShipmentTrackerApp.prototype.getStatusIcon = function(deliverySignal) {
        var icons = {
            'IN_TRANSIT': '🚚',
            'OUT_FOR_DELIVERY': '📦',
            'DELIVERED': '✅',
            'EXCEPTION': '⚠️',
            'FAILED': '❌',
            'PENDING': '⏳',
            'UNKNOWN': '❓'
        };
        return icons[deliverySignal] || icons.UNKNOWN;
    };

    ShipmentTrackerApp.prototype.truncateAWB = function(awb) {
        if (!awb) return 'N/A';
        if (awb.length <= 10) return awb;
        return awb.substring(0, 2) + '...' + awb.substring(awb.length - 5);
    };

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

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        // Check for Unix epoch (1970-01-01 or earlier) - indicates unset/new tracking
        if (date.getTime() <= 0) {
            return 'Not yet checked';
        }

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    /**
     * Determine ETA styling based on delivery date and status
     * @param {string} estimatedDelivery - ISO date string
     * @param {string} deliverySignal - Status signal (delivered, active, exception)
     * @param {string} status - Full status text
     * @returns {Object} Style configuration {color, bold, underline, className}
     */
    ShipmentTrackerApp.prototype.getETAStyle = function(estimatedDelivery, deliverySignal, status) {
        var style = {
            color: '#000',
            bold: false,
            underline: false,
            className: 'eta-normal'
        };

        if (!estimatedDelivery) return style;

        var etaDate = new Date(estimatedDelivery);
        var now = new Date();

        // Reset time to midnight for accurate day comparison
        etaDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        var daysUntil = Math.ceil((etaDate - now) / (1000 * 60 * 60 * 24));
        var isDelivered = deliverySignal === 'delivered';

        // Check for customs/exception issues
        var hasException = deliverySignal === 'exception' ||
                          (status && (status.toLowerCase().indexOf('customs') !== -1 ||
                                     status.toLowerCase().indexOf('held') !== -1 ||
                                     status.toLowerCase().indexOf('clearance') !== -1));

        // Apply styling rules
        if (hasException) {
            // Customs/exception: always bold, underlined, red
            style.color = '#e53e3e';
            style.bold = true;
            style.underline = true;
            style.className = 'eta-exception';
        } else if (isDelivered) {
            // Delivered: black, normal, underline
            style.color = '#000';
            style.bold = false;
            style.underline = true;
            style.className = 'eta-delivered';
        } else if (daysUntil < 1) {
            // Less than 1 day out and not delivered: red & bold
            style.color = '#e53e3e';
            style.bold = true;
            style.underline = false;
            style.className = 'eta-urgent';
        } else if (daysUntil >= 1 && daysUntil < 2) {
            // 1-2 days out and not delivered: black & bold
            style.color = '#000';
            style.bold = true;
            style.underline = false;
            style.className = 'eta-soon';
        } else {
            // 2+ days out: black, normal
            style.color = '#000';
            style.bold = false;
            style.underline = false;
            style.className = 'eta-normal';
        }

        return style;
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
        var wasHidden = panel.classList.contains('hidden');

        if (wasHidden) {
            // Opening - populate with current saved settings
            this.populateAPIKeyFields();
            this.populateQueryEngineFields();
            this.populateDataManagementFields();
        }

        panel.classList.toggle('hidden');
    };

    ShipmentTrackerApp.prototype.closeSettings = function() {
        document.getElementById('settingsPanel').classList.add('hidden');
    };

    ShipmentTrackerApp.prototype.cancelSettings = function() {
        // Reset form to current saved settings
        this.populateAPIKeyFields();
        this.populateQueryEngineFields();
        this.populateDataManagementFields();

        // Close panel
        this.closeSettings();
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
            self.refreshAllTrackings();
        };

        document.getElementById('exportBtn').onclick = function() {
            self.toggleExport();
        };

        document.getElementById('settingsBtn').onclick = function() {
            self.toggleSettings();
        };

        // Settings panel - bottom buttons
        document.getElementById('saveSettingsBtn').onclick = function() {
            self.saveSettings();
        };

        document.getElementById('closeSettingsBtn').onclick = function() {
            self.cancelSettings();
        };

        document.getElementById('pruneNowBtn').onclick = function() {
            self.pruneOldShipments(false);
        };

        document.getElementById('clearAllDataBtn').onclick = function() {
            self.clearAllData();
        };

        // Debug menu button in settings
        var openDebugMenuBtn = document.getElementById('openDebugMenuBtn');
        if (openDebugMenuBtn) {
            openDebugMenuBtn.onclick = function() {
                if (window.DebugMenu) {
                    window.DebugMenu.open();
                }
            };
        }

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

        // Stat card filters
        var statCards = document.querySelectorAll('.stat-card');
        for (var k = 0; k < statCards.length; k++) {
            statCards[k].onclick = function() {
                var filterType = this.getAttribute('data-filter');
                self.toggleStatFilter(filterType);
            };
        }

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

        // Search toggle (desktop)
        document.getElementById('searchToggleBtn').onclick = function() {
            var searchContainer = document.getElementById('searchContainer');
            searchContainer.classList.toggle('hidden');
            if (!searchContainer.classList.contains('hidden')) {
                document.getElementById('searchInput').focus();
            }
        };

        // Mobile bottom bar - filter toggle
        var mobileFilterToggle = document.getElementById('mobileFilterToggle');
        if (mobileFilterToggle) {
            mobileFilterToggle.onclick = function() {
                var filterBar = document.querySelector('.filter-bar');
                filterBar.classList.toggle('visible');
            };
        }

        // Mobile bottom bar - add tracking toggle
        var mobileAddToggle = document.getElementById('mobileAddToggle');
        if (mobileAddToggle) {
            mobileAddToggle.onclick = function() {
                var addTrackingSection = document.querySelector('.add-tracking-section');
                addTrackingSection.classList.toggle('visible-mobile');
                // Auto-focus AWB input when opening
                if (addTrackingSection.classList.contains('visible-mobile')) {
                    setTimeout(function() {
                        document.getElementById('awbInput').focus();
                    }, 100);
                }
            };
        }

        // Mobile add form close button
        var mobileAddCloseBtn = document.getElementById('mobileAddCloseBtn');
        if (mobileAddCloseBtn) {
            mobileAddCloseBtn.onclick = function() {
                var addTrackingSection = document.querySelector('.add-tracking-section');
                addTrackingSection.classList.remove('visible-mobile');
            };
        }

        // Mobile bottom bar - stat filter buttons
        var filterButtons = document.querySelectorAll('.bottom-bar-btn[data-filter]');
        filterButtons.forEach(function(btn) {
            btn.onclick = function() {
                var filter = btn.getAttribute('data-filter');

                // Toggle active state
                var wasActive = btn.classList.contains('active');

                // Remove active from all filter buttons
                filterButtons.forEach(function(b) {
                    b.classList.remove('active');
                });

                // If wasn't active, activate this one and apply filter
                if (!wasActive) {
                    btn.classList.add('active');
                    self.currentFilters.statFilter = filter;
                } else {
                    // Clicked active button - clear filter (show all)
                    self.currentFilters.statFilter = 'total';
                }

                // Update URL parameter
                var newUrl = new URL(window.location);
                if (self.currentFilters.statFilter === 'total') {
                    newUrl.searchParams.delete('filter');
                } else {
                    newUrl.searchParams.set('filter', self.currentFilters.statFilter);
                }
                window.history.pushState({}, '', newUrl);

                // Re-render with filter
                self.applyFilters();
            };
        });

        // Set active button based on currentFilters.statFilter (respects URL param)
        var activeFilter = self.currentFilters.statFilter || 'total';
        var activeBtn = document.querySelector('.bottom-bar-btn[data-filter="' + activeFilter + '"]');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Desktop table header sorting
        var sortableHeaders = document.querySelectorAll('th.sortable');
        for (var s = 0; s < sortableHeaders.length; s++) {
            sortableHeaders[s].onclick = function() {
                var field = this.getAttribute('data-sort');
                var currentDirection = self.currentSort.field === field ? self.currentSort.direction : 'asc';
                var newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
                self.setSorting(field, newDirection);
            };
        }

        // Mobile sort toggle
        var mobileSortToggle = document.getElementById('mobileSortToggle');
        if (mobileSortToggle) {
            mobileSortToggle.onclick = function() {
                var sortMenu = document.getElementById('mobileSortMenu');
                sortMenu.style.display = 'block';
                setTimeout(function() {
                    sortMenu.classList.add('visible');
                }, 10);
            };
        }

        // Mobile sort menu close
        var closeSortMenuBtn = document.getElementById('closeSortMenuBtn');
        if (closeSortMenuBtn) {
            closeSortMenuBtn.onclick = function() {
                var sortMenu = document.getElementById('mobileSortMenu');
                sortMenu.classList.remove('visible');
                setTimeout(function() {
                    sortMenu.style.display = 'none';
                }, 300);
            };
        }

        // Mobile sort options
        var sortOptions = document.querySelectorAll('.sort-option');
        for (var so = 0; so < sortOptions.length; so++) {
            sortOptions[so].onclick = function() {
                var field = this.getAttribute('data-sort');
                var direction = this.getAttribute('data-direction');
                self.setSorting(field, direction);

                // Close menu
                var sortMenu = document.getElementById('mobileSortMenu');
                sortMenu.classList.remove('visible');
                setTimeout(function() {
                    sortMenu.style.display = 'none';
                }, 300);
            };
        }

        // Window resize handler for split view
        window.addEventListener('resize', function() {
            var detailPanel = document.getElementById('detailPanel');
            var hasContent = document.getElementById('detailAWB').textContent !== 'No selection';

            if (window.innerWidth >= 1024) {
                // Desktop: Always show panel (empty or with content)
                if (!hasContent) {
                    self.showEmptyDetailState();
                }
            } else {
                // Mobile/Tablet: Hide panel unless it has content
                if (!hasContent) {
                    detailPanel.classList.add('hidden');
                }
            }
        });

        // Click outside to close detail panel (desktop only)
        document.addEventListener('click', function(e) {
            if (window.innerWidth < 1024) return; // Only on desktop

            var detailPanel = document.getElementById('detailPanel');
            var tableContainer = document.querySelector('.table-container');

            // Check if detail panel is open
            if (detailPanel.classList.contains('hidden')) return;

            // Check if click is inside detail panel
            if (detailPanel.contains(e.target)) return;

            // Check if click is on a table row (switch detail)
            if (tableContainer && tableContainer.contains(e.target)) {
                var row = e.target.closest('tr');
                if (row && row.parentElement.tagName === 'TBODY') {
                    // Row click handled by row onclick
                    return;
                }
            }

            // Click outside - close detail
            self.closeDetail();
        });

        // Initialize sort indicators after DOM is ready
        self.updateSortIndicators();
    };

    // ============================================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================================

    var app = new ShipmentTrackerApp();
    window.ShipmentTrackerApp = app;
    window.app = app; // Also assign to window.app for debug menu compatibility

})(window);
