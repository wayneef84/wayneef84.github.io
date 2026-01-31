/**
 * Shipment Tracker - Main Application
 * Connects UI to IndexedDB adapter
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.1 (Patched)
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

        // Document manager
        this.documentManager = window.DocumentManager ? new window.DocumentManager() : null;

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
                cooldownMinutes: 720, // 12 hours
                skipDelivered: true,
                enableForceRefresh: true,
                skipRefreshConfirmation: false
            },
            dataManagement: {
                pruneAfterDays: 90,
                autoPruneEnabled: false
            },
            development: {
                useMockData: false
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
            }
            this.populateAPIKeyFields();

            // Load query engine config
            var queryEngine = await this.db.getSetting('queryEngine');
            if (queryEngine) {
                this.settings.queryEngine = queryEngine;
            }
            this.populateQueryEngineFields();

            // Load data management config
            var dataManagement = await this.db.getSetting('dataManagement');
            if (dataManagement) {
                this.settings.dataManagement = dataManagement;
            }
            this.populateDataManagementFields();

            // Load development config
            var development = await this.db.getSetting('development');
            if (development) {
                this.settings.development = development;
            }
            this.populateDevelopmentFields();

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
                this.settings.queryEngine = { cooldownMinutes: 720, skipDelivered: true, enableForceRefresh: true, skipRefreshConfirmation: false };
            }
            if (!this.settings.dataManagement || typeof this.settings.dataManagement !== 'object') {
                this.settings.dataManagement = { pruneAfterDays: 90, autoPruneEnabled: false };
            }
            if (!this.settings.development || typeof this.settings.development !== 'object') {
                this.settings.development = { useMockData: false };
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

            this.settings.development.useMockData = document.getElementById('useMockData').checked;

            // Save to database
            await this.db.saveSetting('apiKeys', this.settings.apiKeys);
            await this.db.saveSetting('queryEngine', this.settings.queryEngine);
            await this.db.saveSetting('dataManagement', this.settings.dataManagement);
            await this.db.saveSetting('development', this.settings.development);

            this.showToast('Settings saved successfully', 'success');
            this.closeSettings();

        } catch (err) {
            console.error('[App] Failed to save settings:', err);
            this.showToast('Failed to save settings: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.populateAPIKeyFields = function() {
        // Ensure apiKeys structure exists
        if (!this.settings.apiKeys) {
            this.settings.apiKeys = { DHL: '', FedEx: { clientId: '', clientSecret: '' }, UPS: { apiKey: '', username: '' } };
        }
        // Ensure nested structures are correct (migration from old format)
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
        if (!this.settings.queryEngine) {
            this.settings.queryEngine = { cooldownMinutes: 720, skipDelivered: true, enableForceRefresh: true, skipRefreshConfirmation: false };
        }
        document.getElementById('cooldownMinutes').value = this.settings.queryEngine.cooldownMinutes || 720;
        document.getElementById('skipDelivered').checked = this.settings.queryEngine.skipDelivered !== false;
        document.getElementById('enableForceRefresh').checked = this.settings.queryEngine.enableForceRefresh !== false;
        document.getElementById('skipRefreshConfirmation').checked = this.settings.queryEngine.skipRefreshConfirmation || false;
    };

    ShipmentTrackerApp.prototype.populateDataManagementFields = function() {
        if (!this.settings.dataManagement) {
            this.settings.dataManagement = { pruneAfterDays: 90, autoPruneEnabled: false };
        }
        document.getElementById('pruneAfterDays').value = this.settings.dataManagement.pruneAfterDays || 90;
        document.getElementById('autoPruneEnabled').checked = this.settings.dataManagement.autoPruneEnabled || false;
    };

    ShipmentTrackerApp.prototype.populateDevelopmentFields = function() {
        if (!this.settings.development) {
            this.settings.development = { useMockData: false };
        }
        document.getElementById('useMockData').checked = this.settings.development.useMockData || false;
    };

    // ============================================================
    // TRACKING DATA MANAGEMENT
    // ============================================================


    ShipmentTrackerApp.prototype.loadTrackings = async function() {
        console.log('[App] Loading trackings...');

        try {
            this.trackings = await this.db.getAllTrackings();
            console.log('[App] Loaded', this.trackings.length, 'trackings from database');

            // Apply filters (which will also update filteredTrackings and render)
            this.applyFilters();

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
                lastChecked: new Date().toISOString(), // Adds current. date to the last checked
                // lastChecked: new Date(0).toISOString(), // Force refresh
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
                var useMock = this.settings.development ? this.settings.development.useMockData : false;
                var freshData = await this.queryEngine(awb, carrier, useMock);
                
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
        console.log('[App] Deleting tracking:', awb, 'carrier:', carrier);

        try {
            // If carrier not provided, get it from the tracking record
            if (!carrier) {
                console.log('[App] No carrier provided, fetching tracking record');
                var tracking = await this.db.getTracking(awb);
                if (tracking) {
                    carrier = tracking.carrier;
                    console.log('[App] Found carrier:', carrier);
                } else {
                    console.error('[App] Tracking not found:', awb);
                    this.showToast('Tracking not found', 'error');
                    return;
                }
            }

            var displayName = carrier ? (awb + ' (' + carrier + ')') : awb;
            console.log('[App] Confirming delete for:', displayName);

            if (!confirm('Delete tracking ' + displayName + '?')) {
                console.log('[App] Delete cancelled by user');
                return;
            }

            console.log('[App] Calling db.deleteTracking with awb:', awb, 'carrier:', carrier);
            await this.db.deleteTracking(awb, carrier);
            console.log('[App] Delete successful, verifying deletion...');

            // Verify the tracking is actually gone
            var verifyCheck = await this.db.getTracking(awb, carrier);
            if (verifyCheck) {
                console.error('[App] ERROR: Tracking still exists after delete!', verifyCheck);
                this.showToast('❌ Delete failed - tracking still exists', 'error');
                return;
            } else {
                console.log('[App] Verification passed - tracking no longer exists');
            }

            console.log('[App] Reloading trackings');
            await this.loadTrackings();
            this.updateStats();
            this.closeDetail();

            this.showToast('✅ Tracking deleted', 'success');

        } catch (err) {
            console.error('[App] Failed to delete tracking:', err);
            this.showToast('❌ Failed to delete: ' + err.message, 'error');
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
            awbLink.textContent = tracking.awb;
            // awbLink.textContent = this.truncateAWB(tracking.awb);
            awbLink.title = tracking.awb + ' (click to track on ' + tracking.carrier + ' site)';
            awbLink.style.textDecoration = 'none';
            awbLink.style.color = 'var(--primary-color)';
            awbCell.appendChild(awbLink);
        } else {
            awbCell.textContent = tracking.awb;
            // awbCell.textContent = this.truncateAWB(tracking.awb);
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
        
        // FIX: Safety check for deliverySignal
        var signal = tracking.deliverySignal ? tracking.deliverySignal.toLowerCase() : 'unknown';
        statusBadge.className = 'status-badge status-' + signal;
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

        // Docs button (shows compliance icon, opens Documents List Modal)
        var docsBtn = document.createElement('button');
        var complianceIcon = this.documentManager ? this.documentManager.getComplianceIcon(tracking) : '';
        docsBtn.textContent = complianceIcon || '📄';
        docsBtn.className = 'btn-docs';
        docsBtn.title = 'Manage Documents';
        docsBtn.onclick = function(e) {
            e.stopPropagation();
            self.showDocumentsListModal(tracking.awb, tracking.carrier);
        };
        actionsCell.appendChild(docsBtn);

        // Details button
        var detailsBtn = document.createElement('button');
        detailsBtn.innerHTML = '<span class="btn-icon">📋</span>';
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
        console.log('[App] Total trackings before filter:', this.trackings.length);
        console.log('[App] Trackings AWBs:', this.trackings.map(function(t) { return t.awb + '_' + t.carrier; }));

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

        console.log('[App] Filtered trackings count:', this.filteredTrackings.length);
        console.log('[App] Filtered AWBs:', this.filteredTrackings.map(function(t) { return t.awb + '_' + t.carrier; }));

        // Apply sorting
        this.applySorting();

        console.log('[App] Rendering table and cards...');
        this.renderTable();
        this.renderMobileCards();
        console.log('[App] Render complete');
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

            // Render documents
            this.currentDetailTracking = tracking;
            this.renderDocuments(tracking);

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

    ShipmentTrackerApp.prototype.downloadImportTemplate = function() {
        var lines = [];

        // Instructions block (comments ignored by parser)
        lines.push('# ============================================');
        lines.push('# SHIPMENT TRACKER - IMPORT TEMPLATE');
        lines.push('# ============================================');
        lines.push('#');
        lines.push('# INSTRUCTIONS:');
        lines.push('# - Lines starting with # are ignored');
        lines.push('# - Carrier must be: DHL, FedEx, UPS, USPS, or Custom');
        lines.push('# - Use SIMPLE format (3 columns) for quick import');
        lines.push('# - Use FULL format (all columns) to update all fields');
        lines.push('#');
        lines.push('# SIMPLE FORMAT (add new trackings):');
        lines.push('# AWB,Carrier,DateShipped');
        lines.push('# 1234567890,DHL,2026-01-15');
        lines.push('#');
        lines.push('# FULL FORMAT (update existing trackings):');
        lines.push('# Use Export CSV to get current data, modify, then import with Update mode');
        lines.push('#');
        lines.push('# IMPORT MODES:');
        lines.push('# - Add New: Adds new records, skips existing');
        lines.push('# - Update: Adds new + overwrites existing records');
        lines.push('# - Replace All: Deletes all data first (use for restore)');
        lines.push('#');
        lines.push('# ============================================');
        lines.push('');

        // Header row - simple format
        lines.push('AWB,Carrier,DateShipped');

        // Add example rows
        lines.push('# Example rows (remove # to use):');
        lines.push('# 1234567890,DHL,2026-01-15');
        lines.push('# 123456789012,FedEx,2026-01-16');
        lines.push('# 1Z999AA10123456784,UPS,2026-01-17');
        lines.push('# MYCUSTOM001,Custom,2026-01-18');

        // Add blank line at end for easy data entry
        lines.push('');

        var csv = lines.join('\n');
        this.downloadFile(csv, 'shipment_tracker_import_template.csv', 'text/csv');
        this.showToast('📄 Import template downloaded', 'success');
    };

    /**
     * Handle import file with specified mode
     * @param {File} file - The file to import
     * @param {string} mode - 'add' (skip existing), 'update' (merge existing), 'replace' (overwrite all)
     */
    ShipmentTrackerApp.prototype.handleImportFile = async function(file, mode) {
        var self = this;

        if (!file) {
            this.showToast('No file selected', 'error');
            return;
        }

        mode = mode || 'add'; // Default to add mode

        var extension = file.name.split('.').pop().toLowerCase();

        if (extension === 'csv') {
            await this.importFromCSV(file, mode);
        } else if (extension === 'json') {
            await this.importFromJSON(file, mode);
        } else {
            this.showToast('Unsupported file format. Use CSV or JSON.', 'error');
        }
    };

    /**
     * Import from CSV file
     * @param {File} file - CSV file to import
     * @param {string} mode - 'add' (skip existing), 'update' (merge existing), 'replace' (overwrite all)
     */
    ShipmentTrackerApp.prototype.importFromCSV = async function(file, mode) {
        var self = this;
        mode = mode || 'add';

        try {
            var text = await this.readFileAsText(file);
            var lines = text.split('\n');

            var imported = 0;
            var updated = 0;
            var skipped = 0;
            var errors = [];

            // Parse header row to get column mapping
            var headerLine = null;
            var headerIndex = -1;
            for (var h = 0; h < lines.length; h++) {
                var hLine = lines[h].trim();
                if (!hLine || hLine.startsWith('#')) continue;
                headerLine = hLine.toLowerCase();
                headerIndex = h;
                break;
            }

            // Create column map from header
            var columnMap = {};
            if (headerLine) {
                var headerParts = this.parseCSVLine(headerLine);
                for (var c = 0; c < headerParts.length; c++) {
                    columnMap[headerParts[c].trim()] = c;
                }
            }

            // Check if this is a simple (AWB,Carrier,DateShipped) or full format
            var isSimpleFormat = !columnMap.hasOwnProperty('deliverysignal') && !columnMap.hasOwnProperty('documents');

            for (var i = headerIndex + 1; i < lines.length; i++) {
                var line = lines[i].trim();

                // Skip empty lines and comments
                if (!line || line.startsWith('#')) {
                    continue;
                }

                var parts = this.parseCSVLine(line);
                if (parts.length < 2) {
                    errors.push('Line ' + (i + 1) + ': Invalid format (need at least AWB,Carrier)');
                    continue;
                }

                var awb, carrier, tracking;

                if (isSimpleFormat) {
                    // Simple format: AWB,Carrier,DateShipped
                    awb = parts[0].trim();
                    carrier = parts[1].trim();
                    var dateShipped = parts[2] ? parts[2].trim() : '';

                    // Validate carrier
                    if (!['DHL', 'FedEx', 'UPS', 'USPS', 'Custom'].includes(carrier)) {
                        errors.push('Line ' + (i + 1) + ': Invalid carrier "' + carrier + '" (must be DHL, FedEx, UPS, USPS, or Custom)');
                        continue;
                    }

                    tracking = {
                        awb: awb,
                        carrier: carrier,
                        dateShipped: dateShipped || new Date().toISOString().split('T')[0],
                        status: 'Pending',
                        deliverySignal: 'UNKNOWN',
                        delivered: false,
                        lastChecked: new Date().toISOString(),
                        lastUpdated: new Date().toISOString(),
                        origin: { city: null, state: null, country: null, postalCode: null },
                        destination: { city: null, state: null, country: null, postalCode: null },
                        events: [],
                        estimatedDelivery: null,
                        note: '',
                        tags: [],
                        documents: []
                    };
                } else {
                    // Full format with all columns
                    var getValue = function(colName) {
                        var idx = columnMap[colName];
                        return (idx !== undefined && parts[idx]) ? parts[idx].trim() : '';
                    };

                    awb = getValue('awb');
                    carrier = getValue('carrier');

                    if (!awb || !carrier) {
                        errors.push('Line ' + (i + 1) + ': Missing AWB or Carrier');
                        continue;
                    }

                    // Validate carrier
                    if (!['DHL', 'FedEx', 'UPS', 'USPS', 'Custom'].includes(carrier)) {
                        errors.push('Line ' + (i + 1) + ': Invalid carrier "' + carrier + '"');
                        continue;
                    }

                    // Build tracking object from CSV columns
                    tracking = {
                        awb: awb,
                        carrier: carrier,
                        status: getValue('status') || 'Pending',
                        deliverySignal: getValue('deliverysignal') || 'UNKNOWN',
                        delivered: getValue('delivered') === 'true',
                        dateShipped: getValue('dateshipped') || '',
                        origin: {
                            city: getValue('origin_city') || null,
                            state: getValue('origin_state') || null,
                            country: getValue('origin_country') || null,
                            postalCode: getValue('origin_postalcode') || null
                        },
                        destination: {
                            city: getValue('destination_city') || null,
                            state: getValue('destination_state') || null,
                            country: getValue('destination_country') || null,
                            postalCode: getValue('destination_postalcode') || null
                        },
                        estimatedDelivery: getValue('estimateddelivery') || null,
                        lastUpdated: getValue('lastupdated') || new Date().toISOString(),
                        lastChecked: getValue('lastchecked') || new Date().toISOString(),
                        note: getValue('note') || '',
                        tags: [],
                        documents: []
                    };

                    // Parse tags
                    var tagsStr = getValue('tags');
                    if (tagsStr) {
                        try {
                            tracking.tags = JSON.parse(tagsStr);
                        } catch (e) {
                            // Ignore invalid JSON
                        }
                    }

                    // Parse documents from JSON column
                    var docsStr = getValue('documents');
                    if (docsStr && self.documentManager) {
                        tracking.documents = self.documentManager.parseDocumentsFromCSV(docsStr);
                    }

                    // Also parse individual doc_* columns and merge
                    var docTypes = {
                        'doc_ci': 'COMMERCIAL_INVOICE',
                        'doc_pl': 'PACKING_LIST',
                        'doc_sli': 'SLI_AWB',
                        'doc_un383': 'UN38_3',
                        'doc_msds': 'MSDS'
                    };

                    for (var docCol in docTypes) {
                        var url = getValue(docCol);
                        if (url && self.documentManager) {
                            self.documentManager.addDocument(tracking, docTypes[docCol], url);
                        }
                    }

                    // Parse doc_OTHER column (JSON array of other documents)
                    var otherDocsStr = getValue('doc_other');
                    if (otherDocsStr && self.documentManager) {
                        try {
                            var otherDocs = JSON.parse(otherDocsStr);
                            for (var od = 0; od < otherDocs.length; od++) {
                                if (otherDocs[od].type && otherDocs[od].url) {
                                    self.documentManager.addDocument(tracking, otherDocs[od].type, otherDocs[od].url);
                                }
                            }
                        } catch (e) {
                            // Ignore invalid JSON
                        }
                    }
                }

                // Handle based on import mode
                try {
                    var existing = await this.db.getTracking(awb, carrier);
                    console.log('[Import CSV] Processing AWB:', awb, 'Carrier:', carrier, 'Mode:', mode, 'Existing:', !!existing);

                    if (existing) {
                        if (mode === 'add') {
                            // Add mode: Skip existing records
                            skipped++;
                            console.log('[Import CSV] Skipped (add mode):', awb);
                        } else if (mode === 'update') {
                            // Update mode: Merge documents, overwrite all other fields
                            if (tracking.documents && tracking.documents.length > 0 && self.documentManager) {
                                tracking.documents = self.mergeDocuments(existing.documents, tracking.documents);
                            } else if (!tracking.documents || tracking.documents.length === 0) {
                                tracking.documents = existing.documents || [];
                            }
                            // Use saveTracking to completely overwrite (no smart date logic)
                            console.log('[Import CSV] Updating:', awb, 'New status:', tracking.status, 'New lastUpdated:', tracking.lastUpdated);
                            await this.db.saveTracking(tracking);
                            updated++;
                        } else if (mode === 'replace') {
                            // Replace mode: Completely overwrite all fields
                            console.log('[Import CSV] Replacing:', awb, 'New status:', tracking.status);
                            await this.db.saveTracking(tracking);
                            updated++;
                        }
                    } else {
                        // New record - save in all modes
                        console.log('[Import CSV] Adding new:', awb, 'Status:', tracking.status);
                        await this.db.saveTracking(tracking);
                        imported++;
                    }
                } catch (err) {
                    console.error('[Import CSV] Error saving:', awb, err);
                    errors.push('Line ' + (i + 1) + ': ' + err.message);
                }
            }

            // Show summary
            var summary = '✅ Imported ' + imported + ' new';
            if (updated > 0) {
                summary += ', updated ' + updated + ' existing';
            }
            if (skipped > 0) {
                summary += ' (' + skipped + ' skipped)';
            }
            summary += ' tracking(s)';
            if (errors.length > 0) {
                summary += '\n\n⚠️ Errors:\n' + errors.slice(0, 5).join('\n');
                if (errors.length > 5) {
                    summary += '\n... and ' + (errors.length - 5) + ' more errors';
                }
            }

            this.showToast(summary, (imported > 0 || updated > 0) ? 'success' : 'warning');

            // Always reload trackings after import to show changes
            console.log('[Import CSV] Reloading trackings... imported=' + imported + ', updated=' + updated + ', skipped=' + skipped);
            await this.loadTrackings();
            this.updateStats();
            console.log('[Import CSV] Reload complete. Total trackings:', this.trackings.length);

        } catch (err) {
            console.error('[App] Import failed:', err);
            this.showToast('Import failed: ' + err.message, 'error');
        }
    };

    /**
     * Parse a CSV line, handling quoted fields correctly
     * @param {string} line - CSV line to parse
     * @returns {Array} Array of field values
     */
    ShipmentTrackerApp.prototype.parseCSVLine = function(line) {
        var result = [];
        var current = '';
        var inQuotes = false;

        for (var i = 0; i < line.length; i++) {
            var char = line[i];
            var nextChar = line[i + 1];

            if (inQuotes) {
                if (char === '"') {
                    if (nextChar === '"') {
                        // Escaped quote
                        current += '"';
                        i++;
                    } else {
                        // End of quoted field
                        inQuotes = false;
                    }
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
        }

        result.push(current);
        return result;
    };

    /**
     * Merge documents from import with existing documents
     * - If same type exists: Incoming overwrites
     * - If type doesn't exist: Add from incoming
     * - Preserve types not in incoming
     * @param {Array} existing - Existing documents array
     * @param {Array} incoming - Incoming documents array
     * @returns {Array} Merged documents array
     */
    ShipmentTrackerApp.prototype.mergeDocuments = function(existing, incoming) {
        existing = existing || [];
        incoming = incoming || [];

        // Create map of existing documents by type
        var merged = {};
        for (var i = 0; i < existing.length; i++) {
            merged[existing[i].type] = existing[i];
        }

        // Overwrite/add from incoming
        for (var j = 0; j < incoming.length; j++) {
            merged[incoming[j].type] = incoming[j];
        }

        // Convert back to array
        var result = [];
        for (var type in merged) {
            if (merged.hasOwnProperty(type)) {
                result.push(merged[type]);
            }
        }

        return result;
    };

    /**
     * Import from JSON file
     * @param {File} file - JSON file to import
     * @param {string} mode - 'add' (skip existing), 'update' (merge existing), 'replace' (overwrite all)
     */
    ShipmentTrackerApp.prototype.importFromJSON = async function(file, mode) {
        var self = this;
        mode = mode || 'add';

        try {
            var text = await this.readFileAsText(file);
            var data = JSON.parse(text);

            // Handle both array format and {trackings: [...]} format
            var trackingsArray;
            if (data.trackings && Array.isArray(data.trackings)) {
                trackingsArray = data.trackings;
            } else if (Array.isArray(data)) {
                trackingsArray = data;
            } else {
                this.showToast('JSON must have a trackings array', 'error');
                return;
            }

            var imported = 0;
            var updated = 0;
            var skipped = 0;
            var errors = [];

            for (var i = 0; i < trackingsArray.length; i++) {
                var tracking = trackingsArray[i];

                if (!tracking.awb || !tracking.carrier) {
                    errors.push('Record ' + (i + 1) + ': Missing AWB or carrier');
                    continue;
                }

                try {
                    // Check if already exists
                    var existing = await this.db.getTracking(tracking.awb, tracking.carrier);

                    if (existing) {
                        if (mode === 'add') {
                            // Add mode: Skip existing records
                            skipped++;
                        } else if (mode === 'update') {
                            // Update mode: Merge documents, overwrite all other fields
                            if (tracking.documents && tracking.documents.length > 0) {
                                tracking.documents = self.mergeDocuments(existing.documents, tracking.documents);
                            } else if (!tracking.documents || tracking.documents.length === 0) {
                                tracking.documents = existing.documents || [];
                            }
                            // Use saveTracking to completely overwrite (no smart date logic)
                            await this.db.saveTracking(tracking);
                            updated++;
                        } else if (mode === 'replace') {
                            // Replace mode: Completely overwrite all fields
                            await this.db.saveTracking(tracking);
                            updated++;
                        }
                    } else {
                        // New record - save in all modes
                        await this.db.saveTracking(tracking);
                        imported++;
                    }
                } catch (err) {
                    errors.push('Record ' + (i + 1) + ': ' + err.message);
                }
            }

            var summary = '✅ Imported ' + imported + ' new';
            if (updated > 0) {
                summary += ', updated ' + updated + ' existing';
            }
            if (skipped > 0) {
                summary += ' (' + skipped + ' skipped)';
            }
            summary += ' tracking(s)';
            if (errors.length > 0) {
                summary += '\n\n⚠️ Errors:\n' + errors.slice(0, 5).join('\n');
                if (errors.length > 5) {
                    summary += '\n... and ' + (errors.length - 5) + ' more errors';
                }
            }

            this.showToast(summary, (imported > 0 || updated > 0) ? 'success' : 'warning');

            // Always reload trackings after import to show changes
            console.log('[Import JSON] Reloading trackings... imported=' + imported + ', updated=' + updated + ', skipped=' + skipped);
            await this.loadTrackings();
            this.updateStats();
            console.log('[Import JSON] Reload complete. Total trackings:', this.trackings.length);

        } catch (err) {
            console.error('[App] Import failed:', err);
            this.showToast('Import failed: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype.readFileAsText = function(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = function(e) {
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        });
    };

    ShipmentTrackerApp.prototype.refreshAllTrackings = async function() {
        console.log('[App] Refreshing all trackings');

        // Check if force refresh is enabled in settings
        if (!this.settings.queryEngine.enableForceRefresh) {
            this.showToast('⚠️ Force refresh is disabled. Enable in Settings first.', 'warning');
            return;
        }

        try {
            // Filter active trackings based on skipDelivered setting
            var trackingsToRefresh = this.trackings;
            if (this.settings.queryEngine.skipDelivered) {
                trackingsToRefresh = this.trackings.filter(function(t) {
                    return !t.delivered;
                });
            }

            // Apply cooldown filter - only refresh stale trackings
            var now = new Date().getTime();
            var cooldownMs = this.settings.queryEngine.cooldownMinutes * 60 * 1000;

            var staleTrackings = trackingsToRefresh.filter(function(t) {
                if (!t.lastChecked) return true; // Never checked
                var lastCheckedTime = new Date(t.lastChecked).getTime();
                return (now - lastCheckedTime) > cooldownMs;
            });

            // Generate status breakdown by carrier
            var statusBreakdown = this._generateRefreshStatusBreakdown(trackingsToRefresh, staleTrackings);

            if (staleTrackings.length === 0) {
                this.showToast('No stale trackings to refresh. All trackings are within cooldown period.', 'info');
                return;
            }

            // Show status breakdown and ask for confirmation
            if (!this.settings.queryEngine.skipRefreshConfirmation) {
                var message = statusBreakdown + '\n\nProceed with refresh?';
                if (!confirm(message)) {
                    return;
                }
            }

            // Show progress
            this.showToast('🔄 Refreshing ' + staleTrackings.length + ' tracking(s)...', 'info');

            var successCount = 0;
            var failCount = 0;

            // FIX: Pass useMock setting
            var useMock = this.settings.development ? this.settings.development.useMockData : false;

            // Refresh each tracking sequentially to avoid rate limit issues
            for (var i = 0; i < staleTrackings.length; i++) {
                var tracking = staleTrackings[i];

                // Task 4: Skip mock carrier data (should not trigger real API refreshes)
                if (tracking.carrier === 'Mock' || tracking.carrier === 'mock') {
                    console.log('[App] Skipping mock tracking:', tracking.awb);
                    continue;
                }

                try {
                    console.log('[App] Refreshing ' + (i + 1) + '/' + staleTrackings.length + ':', tracking.awb, tracking.carrier);

                    // Call query engine to get fresh data
                    var freshData = await this.queryEngine(tracking.awb, tracking.carrier, useMock);

                    // Update database
                    await this.db.saveTracking(freshData);
                    successCount++;

                } catch (err) {
                    console.error('[App] Failed to refresh', tracking.awb, ':', err);
                    failCount++;
                }
            }

            // Reload all trackings to update UI
            await this.loadTrackings();
            this.updateStats();

            // Show summary
            var summary = '✅ Refreshed ' + successCount + ' tracking(s)';
            if (failCount > 0) {
                summary += ' (' + failCount + ' failed)';
            }
            this.showToast(summary, successCount > 0 ? 'success' : 'error');

        } catch (err) {
            console.error('[App] Refresh all failed:', err);
            this.showToast('Refresh all failed: ' + err.message, 'error');
        }
    };

    ShipmentTrackerApp.prototype._generateRefreshStatusBreakdown = function(trackingsToRefresh, staleTrackings) {
        var breakdown = 'Refresh Status Breakdown:\n\n';

        // Group by carrier
        var carriers = ['DHL', 'FedEx', 'UPS', 'USPS'];
        var carrierStats = {};

        carriers.forEach(function(carrier) {
            carrierStats[carrier] = {
                stale: 0,
                fresh: 0
            };
        });

        // Count stale and fresh from trackingsToRefresh (already filtered by skipDelivered)
        trackingsToRefresh.forEach(function(t) {
            var carrier = t.carrier || 'Unknown';
            if (!carrierStats[carrier]) return;

            var isStale = staleTrackings.some(function(st) {
                return st.trackingId === t.trackingId;
            });

            if (isStale) {
                carrierStats[carrier].stale++;
            } else {
                carrierStats[carrier].fresh++;
            }
        });

        // Build breakdown message
        var totalStale = 0;
        var totalFresh = 0;

        carriers.forEach(function(carrier) {
            var stats = carrierStats[carrier];
            if (stats.stale > 0 || stats.fresh > 0) {
                breakdown += carrier + ':\n';
                breakdown += '  • Stale (will refresh): ' + stats.stale + '\n';
                breakdown += '  • Fresh (within cooldown): ' + stats.fresh + '\n';
                breakdown += '\n';

                totalStale += stats.stale;
                totalFresh += stats.fresh;
            }
        });

        breakdown += 'Total:\n';
        breakdown += '  • Stale (will refresh): ' + totalStale + '\n';
        breakdown += '  • Fresh (within cooldown): ' + totalFresh + '\n';

        return breakdown;
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

            // FIX: Pass useMock setting
            var useMock = this.settings.development ? this.settings.development.useMockData : false;

            // Call query engine to get fresh data
            var freshData = await this.queryEngine(tracking.awb, tracking.carrier, useMock);

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
     * @param {boolean} useMock - Whether to force mock data (optional)
     * @returns {Promise<Object>} Fresh tracking data
     */
    ShipmentTrackerApp.prototype.queryEngine = async function(awb, carrier, useMock) {
        console.log('[Query Engine] Fetching data for:', awb, 'Carrier:', carrier, 'Mock:', useMock);

        // Auto-detect carrier if not provided
        if (!carrier) {
            carrier = TrackingUtils.detectCarrier(awb);
            console.log('[Query Engine] Auto-detected carrier:', carrier);
        }

        if (!carrier) {
            throw new Error('Unable to detect carrier for AWB: ' + awb);
        }

        // Handle Custom carrier - no API call, return existing or stub data
        if (carrier.toUpperCase() === 'CUSTOM') {
            console.log('[Query Engine] Custom carrier - skipping API call');
            // Return existing tracking or create stub
            var existing = await this.db.getTracking(awb, carrier);
            if (existing) {
                existing.lastChecked = new Date().toISOString();
                return existing;
            }
            // Return stub tracking data for new Custom carrier
            return {
                awb: awb,
                carrier: 'Custom',
                status: 'Manual Tracking',
                deliverySignal: 'UNKNOWN',
                delivered: false,
                lastChecked: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                origin: { city: null, state: null, country: null, postalCode: null },
                destination: { city: null, state: null, country: null, postalCode: null },
                events: [],
                estimatedDelivery: null,
                note: 'Custom carrier - manual updates only',
                tags: [],
                rawPayloadId: null
            };
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
        // FIX: Pass useMock argument
        var trackingData = await adapter.trackShipment(awb, useMock);

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
        // Full CSV spec with all tracking fields and document columns
        var headers = [
            'awb',
            'carrier',
            'status',
            'deliverySignal',
            'delivered',
            'dateShipped',
            'origin_city',
            'origin_state',
            'origin_country',
            'origin_postalCode',
            'destination_city',
            'destination_state',
            'destination_country',
            'destination_postalCode',
            'estimatedDelivery',
            'lastUpdated',
            'lastChecked',
            'note',
            'tags',
            'documents',
            'doc_CI',
            'doc_PL',
            'doc_SLI',
            'doc_UN383',
            'doc_MSDS',
            'doc_OTHER'
        ];

        var self = this;

        var rows = trackings.map(function(t) {
            // Helper to find document URL by type
            function findDocUrl(documents, type) {
                if (!documents) return '';
                for (var i = 0; i < documents.length; i++) {
                    if (documents[i].type === type) return documents[i].url || '';
                }
                return '';
            }

            // Get "other" documents (not CI, PL, SLI, UN38.3, MSDS)
            function getOtherDocs(documents) {
                if (!documents) return '';
                var otherTypes = ['COMMERCIAL_INVOICE', 'PACKING_LIST', 'SLI_AWB', 'UN38_3', 'MSDS'];
                var others = [];
                for (var i = 0; i < documents.length; i++) {
                    if (otherTypes.indexOf(documents[i].type) === -1) {
                        others.push({ type: documents[i].type, url: documents[i].url });
                    }
                }
                return others.length > 0 ? JSON.stringify(others) : '';
            }

            // Serialize full documents array for the 'documents' column
            var documentsJson = '';
            if (self.documentManager && t.documents && t.documents.length > 0) {
                documentsJson = self.documentManager.serializeDocumentsForCSV(t.documents);
            }

            return [
                t.awb || '',
                t.carrier || '',
                t.status || '',
                t.deliverySignal || '',
                t.delivered ? 'true' : 'false',
                t.dateShipped || '',
                t.origin ? (t.origin.city || '') : '',
                t.origin ? (t.origin.state || '') : '',
                t.origin ? (t.origin.country || '') : '',
                t.origin ? (t.origin.postalCode || '') : '',
                t.destination ? (t.destination.city || '') : '',
                t.destination ? (t.destination.state || '') : '',
                t.destination ? (t.destination.country || '') : '',
                t.destination ? (t.destination.postalCode || '') : '',
                t.estimatedDelivery || '',
                t.lastUpdated || '',
                t.lastChecked || '',
                t.note || '',
                t.tags ? JSON.stringify(t.tags) : '',
                documentsJson,
                findDocUrl(t.documents, 'COMMERCIAL_INVOICE'),
                findDocUrl(t.documents, 'PACKING_LIST'),
                findDocUrl(t.documents, 'SLI_AWB'),
                findDocUrl(t.documents, 'UN38_3'),
                findDocUrl(t.documents, 'MSDS'),
                getOtherDocs(t.documents)
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

    ShipmentTrackerApp.prototype.ensureSettingsInitialized = function() {
        // Ensure settings object structure exists (after clear data or init failure)
        if (!this.settings) {
            this.settings = {};
        }
        if (!this.settings.apiKeys) {
            this.settings.apiKeys = { DHL: '', FedEx: { clientId: '', clientSecret: '' }, UPS: { apiKey: '', username: '' } };
        }
        if (!this.settings.queryEngine) {
            this.settings.queryEngine = { cooldownMinutes: 720, skipDelivered: true, enableForceRefresh: true, skipRefreshConfirmation: false };
        }
        if (!this.settings.dataManagement) {
            this.settings.dataManagement = { pruneAfterDays: 90, autoPruneEnabled: false };
        }
    };

    ShipmentTrackerApp.prototype.toggleSettings = function() {
        var panel = document.getElementById('settingsPanel');
        var wasHidden = panel.classList.contains('hidden');

        if (wasHidden) {
            // Ensure settings are initialized before populating fields
            this.ensureSettingsInitialized();

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
    // DATA MANAGEMENT MODAL (v1.2.0)
    // ============================================================

    ShipmentTrackerApp.prototype.openDataModal = function() {
        var modal = document.getElementById('dataModal');
        if (modal) {
            modal.classList.remove('hidden');
            // Update export description based on current filter
            this.updateExportDescription();
        }
    };

    ShipmentTrackerApp.prototype.closeDataModal = function() {
        var modal = document.getElementById('dataModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    ShipmentTrackerApp.prototype.updateExportDescription = function() {
        var count = this.getFilteredExportCount();
        var filter = this.currentFilters.statFilter;
        var isFiltered = filter && filter !== 'total';

        // Update CSV export description
        var csvDesc = document.getElementById('exportFilteredDesc');
        if (csvDesc) {
            if (isFiltered) {
                csvDesc.textContent = 'Export ' + count + ' filtered shipment(s)';
            } else {
                csvDesc.textContent = 'Export all ' + count + ' shipment(s)';
            }
        }

        // Update Template with Data description
        var templateDesc = document.getElementById('templateDataDesc');
        if (templateDesc) {
            if (isFiltered) {
                templateDesc.textContent = 'Include ' + count + ' filtered shipment(s)';
            } else {
                templateDesc.textContent = 'Include all ' + count + ' shipment(s)';
            }
        }
    };

    ShipmentTrackerApp.prototype.getFilteredExportCount = function() {
        var filter = this.currentFilters.statFilter;

        if (filter === 'total' || !filter) {
            return this.trackings.length;
        }

        return this.filteredTrackings.length;
    };

    ShipmentTrackerApp.prototype.exportFilteredCSV = function() {
        var self = this;
        var filter = this.currentFilters.statFilter;

        // Use filtered trackings if filter is active
        var trackingsToExport = (filter === 'total' || !filter)
            ? this.trackings
            : this.filteredTrackings;

        if (trackingsToExport.length === 0) {
            this.showToast('No shipments to export', 'warning');
            return;
        }

        this.exportCSV(trackingsToExport);
        this.closeDataModal();
    };

    ShipmentTrackerApp.prototype.exportFilteredJSON = function() {
        var self = this;
        var filter = this.currentFilters.statFilter;

        // Use filtered trackings if filter is active
        var trackingsToExport = (filter === 'total' || !filter)
            ? this.trackings
            : this.filteredTrackings;

        if (trackingsToExport.length === 0) {
            this.showToast('No shipments to export', 'warning');
            return;
        }

        this.exportJSON(trackingsToExport, false);
        this.closeDataModal();
    };

    /**
     * Import with Replace All mode - deletes all existing data first
     * @param {File} file - File to import
     */
    ShipmentTrackerApp.prototype.importWithReplaceAll = async function(file) {
        var self = this;

        if (!confirm('⚠️ WARNING: This will DELETE ALL existing tracking data before importing.\n\nThis action cannot be undone!\n\nAre you sure you want to delete all data and replace with import?')) {
            return;
        }

        try {
            // Clear all existing data
            await this.db.clearAll();
            this.trackings = [];
            this.filteredTrackings = [];
            console.log('[App] All data cleared for replace import');

            // Now import the file (using 'add' mode since DB is empty)
            await this.handleImportFile(file, 'add');

            this.showToast('✅ Data replaced successfully', 'success');
        } catch (err) {
            console.error('[App] Replace import failed:', err);
            this.showToast('Replace import failed: ' + err.message, 'error');
        }
    };

    /**
     * Import with Update mode - updates existing records, adds new ones
     * @param {File} file - File to import
     */
    ShipmentTrackerApp.prototype.importWithUpdate = async function(file) {
        var self = this;

        if (!confirm('⚠️ Import with Update Mode\n\nThis will:\n• Add new tracking records\n• Overwrite ALL fields on existing records (status, dates, documents)\n• Preserve documents not in import file\n\nContinue with import?')) {
            return;
        }

        try {
            await this.handleImportFile(file, 'update');
        } catch (err) {
            console.error('[App] Update import failed:', err);
            this.showToast('Update import failed: ' + err.message, 'error');
        }
    };

    /**
     * Legacy wrapper for backward compatibility
     */
    ShipmentTrackerApp.prototype.importWithReplace = async function(file) {
        await this.importWithReplaceAll(file);
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

        // Data Management Modal button (replaces old export button)
        var dataManagementBtn = document.getElementById('dataManagementBtn');
        if (dataManagementBtn) {
            dataManagementBtn.onclick = function() {
                self.openDataModal();
            };
        }

        // Legacy export button (if still present)
        var exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.onclick = function() {
                self.toggleExport();
            };
        }

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

        // Download import template button
        var downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.onclick = function() {
                self.downloadImportTemplate();
            };
        }

        // Debug menu button in settings
        var openDebugMenuBtn = document.getElementById('openDebugMenuBtn');
        if (openDebugMenuBtn) {
            openDebugMenuBtn.onclick = function() {
                if (window.DebugMenu) {
                    window.DebugMenu.open();
                }
            };
        }

        // Collapsible sections in settings
        var collapsibleHeaders = document.querySelectorAll('.collapsible-header');
        for (var i = 0; i < collapsibleHeaders.length; i++) {
            collapsibleHeaders[i].onclick = function() {
                var targetId = this.getAttribute('data-target');
                var content = document.getElementById(targetId);

                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    this.classList.add('expanded');
                } else {
                    content.style.display = 'none';
                    this.classList.remove('expanded');
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
                    'Recommended: Keep this OFF and use the 12-hour cooldown.\n\n' +
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

            // var dateShipped = document.getElementById('dateShipped').value;
            var dateShipped = null;
            self.addTracking(awb, carrier, dateShipped);
        };

        // Task 2: Enter key support for form fields
        var formFields = ['awbInput', 'carrierSelect', 'dateShipped'];
        formFields.forEach(function(fieldId) {
            var field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('addTrackingForm').dispatchEvent(new Event('submit'));
                    }
                });
            }
        });

        // Import file handlers (triggered by Data Management Modal)
        // Import (Add New) - skips existing records
        var importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.onchange = function(e) {
                var file = e.target.files[0];
                if (file) {
                    self.handleImportFile(file, 'add');
                }
                // Reset file input so same file can be imported again
                e.target.value = '';
            };
        }

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

        // ============================================================
        // DATA MANAGEMENT MODAL EVENT LISTENERS (v1.2.0)
        // ============================================================

        // Data Modal close button
        var dataModalClose = document.getElementById('dataModalClose');
        if (dataModalClose) {
            dataModalClose.onclick = function() {
                self.closeDataModal();
            };
        }

        // Click outside modal to close
        var dataModal = document.getElementById('dataModal');
        if (dataModal) {
            dataModal.onclick = function(e) {
                if (e.target === dataModal) {
                    self.closeDataModal();
                }
            };
        }

        // Import (Add New) button - skips existing records
        var importAppendBtn = document.getElementById('importAppendBtn');
        if (importAppendBtn) {
            importAppendBtn.onclick = function() {
                self.closeDataModal();
                document.getElementById('importFile').click();
            };
        }

        // Import (Update) button - updates existing records with warning
        var importUpdateBtn = document.getElementById('importUpdateBtn');
        if (importUpdateBtn) {
            importUpdateBtn.onclick = function() {
                self.closeDataModal();
                document.getElementById('importUpdateFile').click();
            };
        }

        // Import (Replace All) button - clears all data first
        var importReplaceBtn = document.getElementById('importReplaceBtn');
        if (importReplaceBtn) {
            importReplaceBtn.onclick = function() {
                self.closeDataModal();
                document.getElementById('importReplaceFile').click();
            };
        }

        // Import Update file handler
        var importUpdateFile = document.getElementById('importUpdateFile');
        if (importUpdateFile) {
            importUpdateFile.onchange = function(e) {
                var file = e.target.files[0];
                if (file) {
                    self.importWithUpdate(file);
                }
                e.target.value = '';
            };
        }

        // Import Replace All file handler
        var importReplaceFile = document.getElementById('importReplaceFile');
        if (importReplaceFile) {
            importReplaceFile.onchange = function(e) {
                var file = e.target.files[0];
                if (file) {
                    self.importWithReplaceAll(file);
                }
                e.target.value = '';
            };
        }

        // Export Filtered CSV button
        var exportFilteredCsvBtn = document.getElementById('exportFilteredCsvBtn');
        if (exportFilteredCsvBtn) {
            exportFilteredCsvBtn.onclick = function() {
                self.exportFilteredCSV();
            };
        }

        // Export JSON button
        var exportJsonBtn = document.getElementById('exportJsonBtn');
        if (exportJsonBtn) {
            exportJsonBtn.onclick = function() {
                self.exportFilteredJSON();
            };
        }

        // Download Blank Template button
        var downloadBlankTemplateBtn = document.getElementById('downloadBlankTemplateBtn');
        if (downloadBlankTemplateBtn) {
            downloadBlankTemplateBtn.onclick = function() {
                self.downloadImportTemplate();
                self.closeDataModal();
            };
        }

        // Legacy: Download Template button (in settings, if exists)
        var downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.onclick = function() {
                self.downloadImportTemplate();
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

        // Document management listeners
        this.setupDocumentListeners();
    };

    // ============================================================
    // DOCUMENT MANAGEMENT
    // ============================================================

    ShipmentTrackerApp.prototype.setupDocumentListeners = function() {
        var self = this;

        // Add document button
        var addDocBtn = document.getElementById('addDocumentBtn');
        if (addDocBtn) {
            addDocBtn.onclick = function() {
                self.showAddDocumentModal();
            };
        }

        // Cancel document modal
        var cancelDocBtn = document.getElementById('cancelDocumentBtn');
        if (cancelDocBtn) {
            cancelDocBtn.onclick = function() {
                self.hideDocumentModal();
            };
        }

        // Save document button
        var saveDocBtn = document.getElementById('saveDocumentBtn');
        if (saveDocBtn) {
            saveDocBtn.onclick = function() {
                self.saveDocument();
            };
        }

        // Close modal on backdrop click
        var docModal = document.getElementById('documentModal');
        if (docModal) {
            docModal.onclick = function(e) {
                if (e.target === docModal) {
                    self.hideDocumentModal();
                }
            };
        }

        // Populate document type dropdown
        this.populateDocumentTypeDropdown();

        // Setup Documents List Modal listeners
        this.setupDocumentsListModalListeners();
    };

    ShipmentTrackerApp.prototype.populateDocumentTypeDropdown = function() {
        var select = document.getElementById('documentTypeSelect');
        if (!select || !this.documentManager) return;

        select.innerHTML = '';
        var types = this.documentManager.getAllTypes();
        for (var i = 0; i < types.length; i++) {
            var opt = document.createElement('option');
            opt.value = types[i].type;
            opt.textContent = types[i].icon + ' ' + types[i].label;
            select.appendChild(opt);
        }
    };

    ShipmentTrackerApp.prototype.showAddDocumentModal = function() {
        var modal = document.getElementById('documentModal');
        var urlInput = document.getElementById('documentUrlInput');
        var typeSelect = document.getElementById('documentTypeSelect');

        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('documentModalTitle').textContent = 'Add Document';
            if (urlInput) urlInput.value = '';
            if (typeSelect) typeSelect.selectedIndex = 0;
            this.editingDocumentType = null;
        }
    };

    ShipmentTrackerApp.prototype.hideDocumentModal = function() {
        var modal = document.getElementById('documentModal');
        var typeSelect = document.getElementById('documentTypeSelect');
        if (modal) {
            modal.classList.add('hidden');
        }
        if (typeSelect) {
            typeSelect.disabled = false; // Re-enable in case it was disabled
        }
        this.editingDocumentType = null;
        this.editingFromListModal = false;
    };

    ShipmentTrackerApp.prototype.saveDocument = function() {
        var self = this;
        var typeSelect = document.getElementById('documentTypeSelect');
        var urlInput = document.getElementById('documentUrlInput');

        // Determine which tracking to update (detail panel vs list modal)
        var tracking = this.editingFromListModal ? this.documentsListTracking : this.currentDetailTracking;

        if (!typeSelect || !urlInput || !tracking) {
            this.showToast('Cannot save document', 'error');
            return;
        }

        var docType = typeSelect.value;
        var url = urlInput.value.trim();

        if (!url) {
            this.showToast('Please enter a URL', 'error');
            return;
        }

        // Validate URL
        if (this.documentManager) {
            var validation = this.documentManager.validateUrl(url);
            if (!validation.isValid) {
                this.showToast(validation.error, 'error');
                return;
            }
        }

        // Add document to tracking
        if (this.documentManager) {
            this.documentManager.addDocument(tracking, docType, url);
        }

        // Re-enable type select (in case it was disabled for edit)
        typeSelect.disabled = false;

        // Save to database
        this.db.saveTracking(tracking).then(function() {
            self.hideDocumentModal();

            // Refresh the appropriate UI
            if (self.editingFromListModal) {
                self.renderDocumentsListModal(self.documentsListTracking);
            }
            if (self.currentDetailTracking && self.currentDetailTracking.awb === tracking.awb) {
                self.renderDocuments(self.currentDetailTracking);
            }

            self.loadTrackings(); // Refresh table
            self.showToast('Document saved', 'success');
            self.editingFromListModal = false;
        }).catch(function(err) {
            console.error('[App] Failed to save document:', err);
            self.showToast('Failed to save document: ' + err.message, 'error');
            self.editingFromListModal = false;
        });
    };

    ShipmentTrackerApp.prototype.removeDocument = function(docType) {
        var self = this;
        if (!this.currentDetailTracking || !this.documentManager) return;

        var docTypeInfo = this.documentManager.getType(docType);
        var label = docTypeInfo ? docTypeInfo.label : docType;

        if (!confirm('Remove ' + label + '?')) return;

        this.documentManager.removeDocument(this.currentDetailTracking, docType);

        this.db.saveTracking(this.currentDetailTracking).then(function() {
            self.renderDocuments(self.currentDetailTracking);
            self.loadTrackings(); // Refresh table
            self.showToast('Document removed', 'success');
        }).catch(function(err) {
            console.error('[App] Failed to remove document:', err);
            self.showToast('Failed to remove document: ' + err.message, 'error');
        });
    };

    ShipmentTrackerApp.prototype.renderDocuments = function(tracking) {
        var container = document.getElementById('documentsList');
        var iconPreview = document.getElementById('detailDocIcons');

        if (!container) return;

        container.innerHTML = '';

        var documents = tracking.documents || [];

        if (documents.length === 0) {
            container.innerHTML = '<p class="no-documents">No documents attached</p>';
            if (iconPreview) iconPreview.textContent = '';
            return;
        }

        // Update icon preview
        if (iconPreview && this.documentManager) {
            iconPreview.textContent = this.documentManager.getDocumentIcons(tracking);
        }

        // Render each document
        var self = this;
        for (var i = 0; i < documents.length; i++) {
            var doc = documents[i];
            var row = document.createElement('div');
            row.className = 'document-row';

            var icon = document.createElement('span');
            icon.className = 'document-icon';
            icon.textContent = doc.icon || '';
            row.appendChild(icon);

            var label = document.createElement('span');
            label.className = 'document-label';
            label.textContent = doc.label || doc.type;
            row.appendChild(label);

            var actions = document.createElement('span');
            actions.className = 'document-actions';

            // Open link button
            var openBtn = document.createElement('button');
            openBtn.className = 'btn-icon-only';
            openBtn.textContent = '\u2197\uFE0F'; // ↗️
            openBtn.title = 'Open document';
            openBtn.setAttribute('data-url', doc.url);
            openBtn.onclick = function() {
                var url = this.getAttribute('data-url');
                window.open(url, '_blank', 'noopener,noreferrer');
            };
            actions.appendChild(openBtn);

            // Remove button
            var removeBtn = document.createElement('button');
            removeBtn.className = 'btn-icon-only btn-danger';
            removeBtn.textContent = '\uD83D\uDDD1\uFE0F'; // 🗑️
            removeBtn.title = 'Remove document';
            removeBtn.setAttribute('data-type', doc.type);
            removeBtn.onclick = function() {
                var type = this.getAttribute('data-type');
                self.removeDocument(type);
            };
            actions.appendChild(removeBtn);

            row.appendChild(actions);
            container.appendChild(row);
        }
    };

    // ============================================================
    // DOCUMENTS LIST MODAL (Standalone document management)
    // ============================================================

    /**
     * Show the Documents List Modal for a specific tracking
     * @param {string} awb - AWB number
     * @param {string} carrier - Carrier name
     */
    ShipmentTrackerApp.prototype.showDocumentsListModal = async function(awb, carrier) {
        var self = this;

        try {
            // Get tracking from database
            var tracking = await this.db.getTracking(awb, carrier);
            if (!tracking) {
                this.showToast('Tracking not found', 'error');
                return;
            }

            // Store reference for document operations
            this.documentsListTracking = tracking;

            // Update modal title
            var titleEl = document.getElementById('documentsListModalTitle');
            if (titleEl) {
                titleEl.textContent = 'Documents - ' + awb;
            }

            // Render document list
            this.renderDocumentsListModal(tracking);

            // Show modal
            var modal = document.getElementById('documentsListModal');
            if (modal) {
                modal.classList.remove('hidden');
            }

        } catch (err) {
            console.error('[App] Failed to show documents list modal:', err);
            this.showToast('Failed to load documents', 'error');
        }
    };

    /**
     * Hide the Documents List Modal
     */
    ShipmentTrackerApp.prototype.hideDocumentsListModal = function() {
        var modal = document.getElementById('documentsListModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.documentsListTracking = null;
    };

    /**
     * Render the documents list inside the modal
     * @param {Object} tracking - Tracking record
     */
    ShipmentTrackerApp.prototype.renderDocumentsListModal = function(tracking) {
        var self = this;
        var container = document.getElementById('documentsListContainer');
        if (!container) return;

        container.innerHTML = '';

        var documents = tracking.documents || [];

        if (documents.length === 0) {
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'documents-list-empty';
            emptyDiv.textContent = 'No documents attached';
            container.appendChild(emptyDiv);
            return;
        }

        // Render each document
        for (var i = 0; i < documents.length; i++) {
            var doc = documents[i];
            var item = document.createElement('div');
            item.className = 'documents-list-item';

            // Icon
            var iconDiv = document.createElement('div');
            iconDiv.className = 'documents-list-item-icon';
            iconDiv.textContent = doc.icon || '\uD83D\uDCCE'; // 📎
            item.appendChild(iconDiv);

            // Info
            var infoDiv = document.createElement('div');
            infoDiv.className = 'documents-list-item-info';

            var labelDiv = document.createElement('div');
            labelDiv.className = 'documents-list-item-label';
            labelDiv.textContent = doc.label || doc.type;
            infoDiv.appendChild(labelDiv);

            var urlDiv = document.createElement('div');
            urlDiv.className = 'documents-list-item-url';
            urlDiv.textContent = doc.url;
            urlDiv.title = doc.url;
            infoDiv.appendChild(urlDiv);

            item.appendChild(infoDiv);

            // Actions
            var actionsDiv = document.createElement('div');
            actionsDiv.className = 'documents-list-item-actions';

            // Open button
            var openBtn = document.createElement('button');
            openBtn.textContent = '\u2197\uFE0F'; // ↗️
            openBtn.title = 'Open in new window';
            openBtn.setAttribute('data-url', doc.url);
            openBtn.onclick = function() {
                var url = this.getAttribute('data-url');
                window.open(url, '_blank', 'noopener,noreferrer');
            };
            actionsDiv.appendChild(openBtn);

            // Edit button
            var editBtn = document.createElement('button');
            editBtn.textContent = '\u270F\uFE0F'; // ✏️
            editBtn.title = 'Edit URL';
            editBtn.setAttribute('data-type', doc.type);
            editBtn.setAttribute('data-url', doc.url);
            editBtn.onclick = function() {
                var type = this.getAttribute('data-type');
                var url = this.getAttribute('data-url');
                self.showEditDocumentInListModal(type, url);
            };
            actionsDiv.appendChild(editBtn);

            // Remove button
            var removeBtn = document.createElement('button');
            removeBtn.className = 'btn-danger';
            removeBtn.textContent = '\uD83D\uDDD1\uFE0F'; // 🗑️
            removeBtn.title = 'Remove document';
            removeBtn.setAttribute('data-type', doc.type);
            removeBtn.onclick = function() {
                var type = this.getAttribute('data-type');
                self.removeDocumentFromListModal(type);
            };
            actionsDiv.appendChild(removeBtn);

            item.appendChild(actionsDiv);
            container.appendChild(item);
        }
    };

    /**
     * Remove a document from the Documents List Modal
     * @param {string} docType - Document type to remove
     */
    ShipmentTrackerApp.prototype.removeDocumentFromListModal = async function(docType) {
        var self = this;
        if (!this.documentsListTracking || !this.documentManager) return;

        var docTypeInfo = this.documentManager.getType(docType);
        var label = docTypeInfo ? docTypeInfo.label : docType;

        if (!confirm('Remove ' + label + '?')) return;

        try {
            this.documentManager.removeDocument(this.documentsListTracking, docType);
            await this.db.saveTracking(this.documentsListTracking);

            // Refresh modal
            this.renderDocumentsListModal(this.documentsListTracking);

            // Refresh table
            await this.loadTrackings();

            this.showToast('Document removed', 'success');

        } catch (err) {
            console.error('[App] Failed to remove document:', err);
            this.showToast('Failed to remove document: ' + err.message, 'error');
        }
    };

    /**
     * Show the edit document modal (reuses the add modal) from Documents List Modal
     * @param {string} docType - Document type to edit
     * @param {string} currentUrl - Current URL value
     */
    ShipmentTrackerApp.prototype.showEditDocumentInListModal = function(docType, currentUrl) {
        var modal = document.getElementById('documentModal');
        var urlInput = document.getElementById('documentUrlInput');
        var typeSelect = document.getElementById('documentTypeSelect');

        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('documentModalTitle').textContent = 'Edit Document';
            if (urlInput) urlInput.value = currentUrl || '';
            if (typeSelect) {
                typeSelect.value = docType;
                typeSelect.disabled = true; // Can't change type when editing
            }
            this.editingDocumentType = docType;
            this.editingFromListModal = true; // Flag to know which tracking to update
        }
    };

    /**
     * Add document from Documents List Modal
     */
    ShipmentTrackerApp.prototype.showAddDocumentFromListModal = function() {
        var modal = document.getElementById('documentModal');
        var urlInput = document.getElementById('documentUrlInput');
        var typeSelect = document.getElementById('documentTypeSelect');

        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('documentModalTitle').textContent = 'Add Document';
            if (urlInput) urlInput.value = '';
            if (typeSelect) {
                typeSelect.selectedIndex = 0;
                typeSelect.disabled = false;
            }
            this.editingDocumentType = null;
            this.editingFromListModal = true;
        }
    };

    /**
     * Setup Documents List Modal event listeners
     */
    ShipmentTrackerApp.prototype.setupDocumentsListModalListeners = function() {
        var self = this;

        // Close button
        var closeBtn = document.getElementById('documentsListModalClose');
        if (closeBtn) {
            closeBtn.onclick = function() {
                self.hideDocumentsListModal();
            };
        }

        // Close footer button
        var closeFooterBtn = document.getElementById('documentsListCloseBtn');
        if (closeFooterBtn) {
            closeFooterBtn.onclick = function() {
                self.hideDocumentsListModal();
            };
        }

        // Add document button
        var addBtn = document.getElementById('documentsListAddBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                self.showAddDocumentFromListModal();
            };
        }

        // Click outside to close
        var modal = document.getElementById('documentsListModal');
        if (modal) {
            modal.onclick = function(e) {
                if (e.target === modal) {
                    self.hideDocumentsListModal();
                }
            };
        }
    };

    // ============================================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================================

    var app = new ShipmentTrackerApp();
    window.ShipmentTrackerApp = app;
    window.app = app; // Also assign to window.app for debug menu compatibility

})(window);