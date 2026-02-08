/**
 * OCRManager - Dual-driver text recognition
 *
 * Primary Driver: Tesseract.js (offline, works everywhere)
 * Legacy Driver: Native TextDetector API (Chrome/Edge experimental)
 *
 * User's driver preference is saved via StorageManager.
 * Default: Native TextDetector when available, else Tesseract.js.
 */

// Use IIFE to avoid ES6 class syntax for ES5 compat on older tablets
var OCRManager = (function() {

    // Driver constants
    var DRIVER_TESSERACT = 'tesseract';
    var DRIVER_NATIVE = 'native';

    function OCRManager(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks || {}; // { onSuccess, onInitError, onDriverReady }
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.canvasCtx = null;
        this.isScanning = false;
        this.tesseractWorker = null;
        this.tesseractReady = false;
        this.nativeDetector = null;
        this.activeDriver = null;
        this._loopTimer = null;
        this._lastText = '';
        this._lastTextTime = 0;
        this._debounceMs = 2000;

        // Config
        this.alphanumericOnly = false;
        this.minTextLength = 2;

        // Check native TextDetector support
        if ('TextDetector' in window) {
            try {
                this.nativeDetector = new TextDetector();
            } catch (e) {
                console.warn('OCRManager: TextDetector init failed', e);
                this.nativeDetector = null;
            }
        }
    }

    /**
     * Update filter settings at runtime.
     */
    OCRManager.prototype.configure = function(opts) {
        if (opts.alphanumericOnly !== undefined) this.alphanumericOnly = opts.alphanumericOnly;
        if (opts.minTextLength !== undefined) this.minTextLength = opts.minTextLength;
        if (opts.debounceMs !== undefined) this._debounceMs = opts.debounceMs;
    };

    /**
     * Returns list of available drivers
     */
    OCRManager.prototype.getAvailableDrivers = function() {
        var drivers = [];
        // Tesseract is always available if the script loaded
        if (typeof Tesseract !== 'undefined') {
            drivers.push({
                id: DRIVER_TESSERACT,
                label: 'Tesseract.js (Offline)',
                available: true
            });
        }
        drivers.push({
            id: DRIVER_NATIVE,
            label: 'Native TextDetector (Browser)',
            available: !!this.nativeDetector
        });
        return drivers;
    };

    /**
     * Check if any OCR driver is supported
     */
    OCRManager.prototype.isSupported = function() {
        return !!this.nativeDetector || typeof Tesseract !== 'undefined';
    };

    /**
     * Resolve which driver to use.
     * Priority: user preference > native (if available) > tesseract
     */
    OCRManager.prototype.resolveDriver = function(preferredDriver) {
        if (preferredDriver === DRIVER_NATIVE && this.nativeDetector) {
            return DRIVER_NATIVE;
        }
        if (preferredDriver === DRIVER_TESSERACT && typeof Tesseract !== 'undefined') {
            return DRIVER_TESSERACT;
        }

        // Default: native if available, else tesseract
        if (this.nativeDetector) {
            return DRIVER_NATIVE;
        }
        if (typeof Tesseract !== 'undefined') {
            return DRIVER_TESSERACT;
        }

        return null;
    };

    /**
     * Initialize Tesseract.js worker with local assets
     */
    OCRManager.prototype.initTesseract = function() {
        var self = this;

        if (this.tesseractReady && this.tesseractWorker) {
            return Promise.resolve();
        }

        if (typeof Tesseract === 'undefined') {
            return Promise.reject(new Error('Tesseract.js not loaded'));
        }

        return Tesseract.createWorker('eng', 1, {
            workerPath: './assets/worker.min.js',
            corePath: './assets/tesseract-core-simd.wasm.js',
            langPath: './assets/',
            cacheMethod: 'none'
        }).then(function(worker) {
            self.tesseractWorker = worker;
            self.tesseractReady = true;
            console.log('OCRManager: Tesseract worker ready');
        });
    };

    /**
     * Start scanning with specified driver preference
     * @param {string} mode - 'TEXT_OCR'
     * @param {string} preferredDriver - 'tesseract' | 'native' | undefined
     */
    OCRManager.prototype.start = function(mode, preferredDriver) {
        var self = this;
        var driver = this.resolveDriver(preferredDriver);

        console.log('OCRManager.start: mode=' + mode + ', driver=' + driver);

        if (!driver) {
            var msg = 'No OCR driver available. Tesseract.js failed to load and native TextDetector is not supported.';
            if (self.callbacks.onInitError) {
                self.callbacks.onInitError(msg);
            }
            return Promise.reject(new Error(msg));
        }

        return this.stop().then(function() {
            self.activeDriver = driver;
            self._lastText = '';
            self._lastTextTime = 0;

            var container = document.getElementById(self.elementId);
            if (!container) {
                throw new Error('Scanner container not found');
            }

            // Create video element
            self.video = document.createElement('video');
            self.video.style.width = '100%';
            self.video.style.height = '100%';
            self.video.style.objectFit = 'cover';
            self.video.setAttribute('autoplay', '');
            self.video.setAttribute('muted', '');
            self.video.setAttribute('playsinline', '');

            // Create offscreen canvas for Tesseract frame capture
            self.canvas = document.createElement('canvas');
            self.canvasCtx = self.canvas.getContext('2d');

            container.innerHTML = '';
            container.appendChild(self.video);

            return navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            }).catch(function(cameraErr) {
                console.warn('OCRManager: Environment camera failed, trying any camera', cameraErr);
                return navigator.mediaDevices.getUserMedia({ video: true });
            });
        }).then(function(stream) {
            self.stream = stream;
            self.video.srcObject = stream;

            return new Promise(function(resolve) {
                self.video.onloadedmetadata = function() {
                    resolve();
                };
            });
        }).then(function() {
            return self.video.play();
        }).then(function() {
            // Set canvas size to match video
            self.canvas.width = self.video.videoWidth;
            self.canvas.height = self.video.videoHeight;

            // If using Tesseract, initialize worker
            if (self.activeDriver === DRIVER_TESSERACT) {
                return self.initTesseract();
            }
        }).then(function() {
            self.isScanning = true;

            // Notify which driver is active
            if (self.callbacks.onDriverReady) {
                self.callbacks.onDriverReady(self.activeDriver);
            }

            // Start detection loop
            self._detectLoop();
        }).catch(function(err) {
            console.error('OCRManager start error:', err);
            if (self.callbacks.onInitError) {
                self.callbacks.onInitError(err.message || String(err));
            }
        });
    };

    /**
     * Stop scanning and release resources
     */
    OCRManager.prototype.stop = function() {
        this.isScanning = false;

        if (this._loopTimer) {
            clearTimeout(this._loopTimer);
            this._loopTimer = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(function(track) { track.stop(); });
            this.stream = null;
        }

        if (this.video) {
            this.video.srcObject = null;
            this.video.remove();
            this.video = null;
        }

        this.canvas = null;
        this.canvasCtx = null;

        var container = document.getElementById(this.elementId);
        if (container) {
            container.innerHTML = '';
        }

        return Promise.resolve();
    };

    /**
     * Terminate Tesseract worker (call on page unload)
     */
    OCRManager.prototype.terminate = function() {
        var self = this;
        return this.stop().then(function() {
            if (self.tesseractWorker) {
                return self.tesseractWorker.terminate().then(function() {
                    self.tesseractWorker = null;
                    self.tesseractReady = false;
                });
            }
        });
    };

    /**
     * Filter detected text based on config
     */
    OCRManager.prototype._filterText = function(rawText) {
        var text = rawText;
        if (this.alphanumericOnly) {
            text = text.replace(/[^a-zA-Z0-9 ]/g, '').trim();
            text = text.replace(/\s+/g, ' ');
        } else {
            text = text.trim();
        }
        return text;
    };

    /**
     * Debounce duplicate results
     */
    OCRManager.prototype._isDuplicate = function(text) {
        var now = Date.now();
        if (text === this._lastText && (now - this._lastTextTime) < this._debounceMs) {
            return true;
        }
        this._lastText = text;
        this._lastTextTime = now;
        return false;
    };

    /**
     * Main detection loop - dispatches to active driver
     */
    OCRManager.prototype._detectLoop = function() {
        var self = this;

        if (!this.isScanning || !this.video) return;

        if (this.video.readyState < this.video.HAVE_ENOUGH_DATA) {
            this._loopTimer = setTimeout(function() {
                self._detectLoop();
            }, 200);
            return;
        }

        var detectPromise;
        if (this.activeDriver === DRIVER_TESSERACT) {
            detectPromise = this._detectTesseract();
        } else if (this.activeDriver === DRIVER_NATIVE) {
            detectPromise = this._detectNative();
        } else {
            return;
        }

        detectPromise.then(function() {
            if (!self.isScanning) return;
            var delay = self.activeDriver === DRIVER_TESSERACT ? 500 : 200;
            self._loopTimer = setTimeout(function() {
                if (self.isScanning) {
                    requestAnimationFrame(function() { self._detectLoop(); });
                }
            }, delay);
        }).catch(function(e) {
            console.error('OCRManager detection error:', e);
            if (self.isScanning) {
                self._loopTimer = setTimeout(function() {
                    self._detectLoop();
                }, 1000);
            }
        });
    };

    /**
     * Tesseract.js detection on current video frame
     */
    OCRManager.prototype._detectTesseract = function() {
        var self = this;

        if (!this.tesseractWorker || !this.canvas || !this.video) {
            return Promise.resolve();
        }

        this.canvasCtx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        return this.tesseractWorker.recognize(this.canvas).then(function(result) {
            if (!self.isScanning) return;

            var rawText = result && result.data && result.data.text ? result.data.text : '';
            var filtered = self._filterText(rawText);

            if (filtered.length >= self.minTextLength && !self._isDuplicate(filtered)) {
                if (self.callbacks.onSuccess) {
                    self.callbacks.onSuccess(filtered, {
                        result: { format: { formatName: 'TEXT_OCR' } }
                    }, 'TEXT_OCR');
                }
            }
        });
    };

    /**
     * Native TextDetector detection on current video frame
     */
    OCRManager.prototype._detectNative = function() {
        var self = this;

        if (!this.nativeDetector || !this.video) {
            return Promise.resolve();
        }

        return this.nativeDetector.detect(this.video).then(function(texts) {
            if (!self.isScanning || !texts || texts.length === 0) return;

            texts.sort(function(a, b) {
                if (Math.abs(a.boundingBox.y - b.boundingBox.y) > 20) {
                    return a.boundingBox.y - b.boundingBox.y;
                }
                return a.boundingBox.x - b.boundingBox.x;
            });

            var rawText = texts.map(function(t) { return t.rawValue; }).join(' ');
            var filtered = self._filterText(rawText);

            if (filtered.length >= self.minTextLength && !self._isDuplicate(filtered)) {
                if (self.callbacks.onSuccess) {
                    self.callbacks.onSuccess(filtered, {
                        result: { format: { formatName: 'TEXT_OCR' } }
                    }, 'TEXT_OCR');
                }
            }
        });
    };

    // Expose driver constants
    OCRManager.DRIVER_TESSERACT = DRIVER_TESSERACT;
    OCRManager.DRIVER_NATIVE = DRIVER_NATIVE;

    return OCRManager;
})();
