/**
 * ScannerManager - Barcode/QR scanning via html5-qrcode
 *
 * ES5-compatible IIFE pattern for older tablet support.
 */
var ScannerManager = (function() {

    function ScannerManager(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks || {}; // { onSuccess, onInitError }
        this.instance = null;
        this.isScanning = false;
        this.stopPromise = null;

        // Configurable scan parameters
        this.fps = 10;
        this.qrboxWidth = 250;
        this.qrboxHeight = 250;
    }

    ScannerManager.prototype.configure = function(opts) {
        if (opts.fps !== undefined) this.fps = opts.fps;
        if (opts.qrboxWidth !== undefined) this.qrboxWidth = opts.qrboxWidth;
        if (opts.qrboxHeight !== undefined) this.qrboxHeight = opts.qrboxHeight;
    };

    ScannerManager.prototype.start = function(mode, deviceId) {
        var self = this;

        // Stop existing if running
        var prep;
        if (this.instance) {
            prep = (this.isScanning
                ? this.instance.stop().catch(function(err) { console.warn("Failed to stop scanner", err); })
                : Promise.resolve()
            ).then(function() {
                try { self.instance.clear(); } catch(e) {}
                self.instance = null;
                self.isScanning = false;
            });
        } else {
            prep = Promise.resolve();
            this.isScanning = false;
        }

        return prep.then(function() {
            // Configure Formats
            var formatsToSupport;
            var H5F = window.Html5QrcodeSupportedFormats;

            if (mode === 'OCR' || mode === 'AUTO') {
                formatsToSupport = undefined;
            } else {
                if (H5F && H5F[mode] !== undefined) {
                    formatsToSupport = [H5F[mode]];
                } else {
                    console.warn('Unknown mode ' + mode + ', defaulting to Auto');
                    formatsToSupport = undefined;
                }
            }

            var config = {
                formatsToSupport: formatsToSupport,
                verbose: false
            };

            self.instance = new Html5Qrcode(self.elementId, config);

            var cameraConfig = { facingMode: "environment" };
            if (deviceId) {
                cameraConfig = { deviceId: { exact: deviceId } };
            }

            return self.instance.start(
                cameraConfig,
                { fps: self.fps, qrbox: { width: self.qrboxWidth, height: self.qrboxHeight } },
                function(decodedText, decodedResult) {
                    if (self.callbacks.onSuccess) {
                        self.callbacks.onSuccess(decodedText, decodedResult, mode);
                    }
                },
                function() {
                    // Ignore per-frame errors
                }
            );
        }).then(function() {
            self.isScanning = true;
        }).catch(function(err) {
            console.error("Error starting scanner", err);
            if (self.callbacks.onInitError) {
                self.callbacks.onInitError(err);
            }
        });
    };

    ScannerManager.prototype.stop = function() {
        var self = this;

        if (this.stopPromise) return this.stopPromise;

        if (!this.instance || !this.isScanning) {
            return Promise.resolve();
        }

        this.stopPromise = this.instance.stop().catch(function(e) {
            if (e && (e.name === 'NotFoundError' || (e.message && e.message.indexOf("removeChild") !== -1))) {
                console.warn("Scanner stop: Element not found, force cleaning");
            } else {
                console.error("Error stopping scanner", e);
            }
        }).then(function() {
            self.isScanning = false;
            try { self.instance.clear(); } catch(e) {}

            // Manual Cleanup: Ensure video element tracks are stopped
            var container = document.getElementById(self.elementId);
            if (container) {
                var video = container.querySelector('video');
                if (video && video.srcObject) {
                    var tracks = video.srcObject.getTracks();
                    for (var i = 0; i < tracks.length; i++) {
                        tracks[i].stop();
                    }
                    video.srcObject = null;
                }
            }

            self.stopPromise = null;
        });

        return this.stopPromise;
    };

    return ScannerManager;
})();
