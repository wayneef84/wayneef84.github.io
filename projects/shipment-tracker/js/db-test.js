/**
 * IndexedDB Adapter Test Suite
 *
 * Demonstrates usage and validates functionality of db.js
 * Run this in browser console or create test.html page
 *
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    var TestRunner = {
        db: null,
        results: [],

        /**
         * Run all tests
         */
        runAll: async function() {
            console.log('='.repeat(60));
            console.log('INDEXEDDB ADAPTER TEST SUITE');
            console.log('='.repeat(60));

            this.results = [];

            try {
                await this.testInit();
                await this.testSaveTracking();
                await this.testGetTracking();
                await this.testGetAllTrackings();
                await this.testFilters();
                await this.testStaleTrackings();
                await this.testRawPayloads();
                await this.testPrunePayloads();
                await this.testSettings();
                await this.testStats();
                await this.testDelete();

                this.printResults();

            } catch (err) {
                console.error('Test suite failed:', err);
            }
        },

        /**
         * Test: Database initialization
         */
        testInit: async function() {
            console.log('\n[TEST] Database Initialization');

            try {
                this.db = new IndexedDBAdapter();
                await this.db.init();

                this.pass('Database initialized successfully');
            } catch (err) {
                this.fail('Database init failed: ' + err.message);
                throw err;
            }
        },

        /**
         * Test: Save tracking record
         */
        testSaveTracking: async function() {
            console.log('\n[TEST] Save Tracking Record');

            var tracking = {
                awb: 'TEST123456789',
                carrier: 'DHL',
                dateShipped: '2026-01-20',
                status: 'In transit',
                deliverySignal: 'IN_TRANSIT',
                delivered: false,
                lastChecked: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                origin: {
                    city: 'Hong Kong',
                    state: null,
                    country: 'HK',
                    postalCode: null
                },
                destination: {
                    city: 'Los Angeles',
                    state: 'CA',
                    country: 'US',
                    postalCode: '90001'
                },
                events: [
                    {
                        timestamp: '2026-01-20T08:00:00Z',
                        location: 'Hong Kong, HK',
                        description: 'Shipment picked up',
                        code: 'PU'
                    }
                ],
                estimatedDelivery: '2026-01-23',
                note: 'Test tracking',
                tags: ['test'],
                rawPayloadId: null
            };

            try {
                var awb = await this.db.saveTracking(tracking);
                this.pass('Saved tracking: ' + awb);
            } catch (err) {
                this.fail('Save tracking failed: ' + err.message);
            }
        },

        /**
         * Test: Get tracking record
         */
        testGetTracking: async function() {
            console.log('\n[TEST] Get Tracking Record');

            try {
                var tracking = await this.db.getTracking('TEST123456789');

                if (tracking && tracking.awb === 'TEST123456789') {
                    this.pass('Retrieved tracking: ' + tracking.awb);
                } else {
                    this.fail('Tracking not found or invalid');
                }
            } catch (err) {
                this.fail('Get tracking failed: ' + err.message);
            }
        },

        /**
         * Test: Get all trackings
         */
        testGetAllTrackings: async function() {
            console.log('\n[TEST] Get All Trackings');

            // Add more test data
            var trackings = [
                {
                    awb: 'DHL1111111111',
                    carrier: 'DHL',
                    dateShipped: '2026-01-21',
                    status: 'Delivered',
                    deliverySignal: 'DELIVERY',
                    delivered: true,
                    lastChecked: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    origin: { city: 'Shanghai', state: null, country: 'CN', postalCode: null },
                    destination: { city: 'New York', state: 'NY', country: 'US', postalCode: '10001' },
                    events: [],
                    estimatedDelivery: null,
                    note: '',
                    tags: [],
                    rawPayloadId: null
                },
                {
                    awb: 'FX2222222222',
                    carrier: 'FedEx',
                    dateShipped: '2026-01-22',
                    status: 'In transit',
                    deliverySignal: 'IN_TRANSIT',
                    delivered: false,
                    lastChecked: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    origin: { city: 'Tokyo', state: null, country: 'JP', postalCode: null },
                    destination: { city: 'Chicago', state: 'IL', country: 'US', postalCode: '60601' },
                    events: [],
                    estimatedDelivery: '2026-01-25',
                    note: '',
                    tags: [],
                    rawPayloadId: null
                }
            ];

            try {
                for (var i = 0; i < trackings.length; i++) {
                    await this.db.saveTracking(trackings[i]);
                }

                var allTrackings = await this.db.getAllTrackings();
                this.pass('Retrieved ' + allTrackings.length + ' tracking records');

            } catch (err) {
                this.fail('Get all trackings failed: ' + err.message);
            }
        },

        /**
         * Test: Filtered queries
         */
        testFilters: async function() {
            console.log('\n[TEST] Filtered Queries');

            try {
                // Filter by carrier
                var dhlTrackings = await this.db.getAllTrackings({ carrier: 'DHL' });
                this.pass('DHL filter returned ' + dhlTrackings.length + ' records');

                // Filter by delivered status
                var deliveredTrackings = await this.db.getAllTrackings({ delivered: true });
                this.pass('Delivered filter returned ' + deliveredTrackings.length + ' records');

                // Filter by delivery signal
                var inTransit = await this.db.getAllTrackings({ deliverySignal: 'IN_TRANSIT' });
                this.pass('IN_TRANSIT filter returned ' + inTransit.length + ' records');

            } catch (err) {
                this.fail('Filter query failed: ' + err.message);
            }
        },

        /**
         * Test: Stale trackings query
         */
        testStaleTrackings: async function() {
            console.log('\n[TEST] Stale Trackings Query');

            try {
                // Create old tracking (last checked 1 hour ago)
                var oldDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

                var staleTracking = {
                    awb: 'STALE123456789',
                    carrier: 'UPS',
                    dateShipped: '2026-01-15',
                    status: 'In transit',
                    deliverySignal: 'IN_TRANSIT',
                    delivered: false,
                    lastChecked: oldDate,
                    lastUpdated: oldDate,
                    origin: { city: 'Miami', state: 'FL', country: 'US', postalCode: null },
                    destination: { city: 'Seattle', state: 'WA', country: 'US', postalCode: '98101' },
                    events: [],
                    estimatedDelivery: null,
                    note: '',
                    tags: [],
                    rawPayloadId: null
                };

                await this.db.saveTracking(staleTracking);

                // Query for stale trackings (cooldown: 10 minutes)
                var cooldown = 10 * 60 * 1000;
                var staleTrackings = await this.db.getStaleTrackings(cooldown);

                this.pass('Found ' + staleTrackings.length + ' stale trackings');

            } catch (err) {
                this.fail('Stale trackings query failed: ' + err.message);
            }
        },

        /**
         * Test: Raw payload storage
         */
        testRawPayloads: async function() {
            console.log('\n[TEST] Raw Payload Storage');

            var rawPayload = {
                awb: 'TEST123456789',
                carrier: 'DHL',
                timestamp: new Date().toISOString(),
                apiVersion: 'v2',
                httpStatus: 200,
                error: null,
                payload: {
                    shipments: [
                        {
                            id: 'TEST123456789',
                            service: 'express',
                            status: {
                                statusCode: 'transit',
                                status: 'In transit'
                            }
                        }
                    ]
                }
            };

            try {
                var payloadId = await this.db.saveRawPayload(rawPayload);
                this.pass('Saved raw payload with ID: ' + payloadId);

                var retrieved = await this.db.getRawPayload(payloadId);
                if (retrieved && retrieved.awb === 'TEST123456789') {
                    this.pass('Retrieved raw payload successfully');
                } else {
                    this.fail('Raw payload retrieval failed');
                }

            } catch (err) {
                this.fail('Raw payload test failed: ' + err.message);
            }
        },

        /**
         * Test: Prune old payloads
         */
        testPrunePayloads: async function() {
            console.log('\n[TEST] Prune Old Payloads');

            try {
                // Create multiple payloads for same AWB
                for (var i = 0; i < 10; i++) {
                    var payload = {
                        awb: 'TEST123456789',
                        carrier: 'DHL',
                        timestamp: new Date(Date.now() - i * 60 * 1000).toISOString(),
                        apiVersion: 'v2',
                        httpStatus: 200,
                        error: null,
                        payload: { data: 'payload ' + i }
                    };

                    await this.db.saveRawPayload(payload);
                }

                // Prune (keep only 5)
                var deletedCount = await this.db.pruneOldPayloads('TEST123456789', 5);
                this.pass('Pruned ' + deletedCount + ' old payloads');

            } catch (err) {
                this.fail('Prune payloads failed: ' + err.message);
            }
        },

        /**
         * Test: Settings storage
         */
        testSettings: async function() {
            console.log('\n[TEST] Settings Storage');

            try {
                // Save settings
                await this.db.saveSetting('queryEngine', {
                    cooldownMinutes: 10,
                    batchSize: 10,
                    enableForceRefresh: true
                });

                await this.db.saveSetting('apiKeys', {
                    DHL: 'test_dhl_key',
                    FedEx: 'test_fedex_key',
                    UPS: 'test_ups_key'
                });

                this.pass('Saved settings');

                // Retrieve settings
                var queryConfig = await this.db.getSetting('queryEngine');
                if (queryConfig && queryConfig.cooldownMinutes === 10) {
                    this.pass('Retrieved settings successfully');
                } else {
                    this.fail('Settings retrieval failed');
                }

            } catch (err) {
                this.fail('Settings test failed: ' + err.message);
            }
        },

        /**
         * Test: Database statistics
         */
        testStats: async function() {
            console.log('\n[TEST] Database Statistics');

            try {
                var stats = await this.db.getStats();

                console.log('Stats:', JSON.stringify(stats, null, 2));

                if (stats.totalTrackings > 0) {
                    this.pass('Stats: ' + stats.totalTrackings + ' total, ' +
                             stats.activeCount + ' active, ' +
                             stats.deliveredCount + ' delivered');
                } else {
                    this.fail('Stats returned 0 trackings');
                }

            } catch (err) {
                this.fail('Stats test failed: ' + err.message);
            }
        },

        /**
         * Test: Delete tracking
         */
        testDelete: async function() {
            console.log('\n[TEST] Delete Tracking');

            try {
                await this.db.deleteTracking('TEST123456789');
                this.pass('Deleted tracking');

                var tracking = await this.db.getTracking('TEST123456789');
                if (tracking === null) {
                    this.pass('Tracking confirmed deleted');
                } else {
                    this.fail('Tracking still exists after delete');
                }

            } catch (err) {
                this.fail('Delete test failed: ' + err.message);
            }
        },

        /**
         * Record test pass
         */
        pass: function(message) {
            console.log('✅ PASS:', message);
            this.results.push({ status: 'PASS', message: message });
        },

        /**
         * Record test failure
         */
        fail: function(message) {
            console.error('❌ FAIL:', message);
            this.results.push({ status: 'FAIL', message: message });
        },

        /**
         * Print test results summary
         */
        printResults: function() {
            console.log('\n' + '='.repeat(60));
            console.log('TEST RESULTS SUMMARY');
            console.log('='.repeat(60));

            var passed = this.results.filter(function(r) { return r.status === 'PASS'; }).length;
            var failed = this.results.filter(function(r) { return r.status === 'FAIL'; }).length;

            console.log('Total Tests:', this.results.length);
            console.log('Passed:', passed);
            console.log('Failed:', failed);

            if (failed === 0) {
                console.log('\n🎉 ALL TESTS PASSED!');
            } else {
                console.log('\n⚠️ SOME TESTS FAILED');
            }

            console.log('='.repeat(60));
        },

        /**
         * Clean up (clear all test data)
         */
        cleanup: async function() {
            console.log('\n[CLEANUP] Clearing all test data');

            try {
                await this.db.clearAll();
                console.log('✅ Test data cleared');

                this.db.close();
                console.log('✅ Database closed');

            } catch (err) {
                console.error('Cleanup failed:', err);
            }
        }
    };

    // Export to global scope
    window.TestRunner = TestRunner;

    // Auto-run if loaded in test page
    if (window.location.pathname.includes('test')) {
        window.addEventListener('DOMContentLoaded', function() {
            TestRunner.runAll();
        });
    }

})(window);
