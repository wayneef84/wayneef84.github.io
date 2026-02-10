/**
 * OCRManager - Dual-driver text recognition with Smart Canvas pipeline
 *
 * Primary Driver: Tesseract.js (offline, works everywhere)
 * Legacy Driver: Native TextDetector API (Chrome/Edge experimental)
 *
 * User's driver preference is saved via StorageManager.
 * Default: Native TextDetector when available, else Tesseract.js.
 *
 * All processing happens client-side. No images are sent to any server.
 */

/* POST-MORTEM ANALYSIS & FIXES
 * ============================================================================
 * Previous OCR attempts on digital screens produced "garbage" data because:
 *
 * 1. RAW INPUT ISSUE: The raw <video> element was passed directly to Tesseract.
 *    Digital screens have sub-pixel rendering, anti-aliasing, and varying
 *    brightness that confuse OCR engines into seeing noise patterns.
 *
 * 2. CONFIG GAPS: Tesseract was initialized with default parameters:
 *    - No `tessedit_char_whitelist` → engine tried to match ALL Unicode chars
 *    - Default PSM (Page Segmentation Mode 3 = "fully automatic") → treats
 *      the frame as a full page, not a single line of text
 *    - No DPI hint → engine assumed low-density input
 *
 * 3. LACK OF CONSTRAINTS: No image pre-processing was applied:
 *    - No upscaling (Tesseract needs ~300 DPI equivalent)
 *    - No binarization (grayscale screen content has gradients that blur edges)
 *    - ROI cropping existed but canvas was not resized to match ROI dimensions,
 *      causing the cropped region to be stretched/distorted
 *
 * FIXES APPLIED IN THIS VERSION:
 * - Smart Canvas Pipeline: upscale 2.5x → grayscale → threshold binarization
 * - Tesseract Strict Mode: PSM 7 (single line), char whitelist, DPI 300
 * - Canvas sized to actual ROI pixel dimensions before upscaling
 * - Dual-button UI separates evidence capture from text extraction
 * ============================================================================
 */

var OCRManager = (function() {

    // Driver constants
    var DRIVER_TESSERACT = 'tesseract';
    var DRIVER_NATIVE = 'native';

    // Pre-processing constants
    var UPSCALE_FACTOR = 2.5;
    var BINARIZE_THRESHOLD = 128; // 0-255, pixels below = black, above = white
    var TARGET_DPI = 300;

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
        this._debounceMs = 3000;

        // Config
        this.alphanumericOnly = false;
        this.minTextLength = 3;
        this.filterMode = 'NONE';   // NONE, REGEX
        this.filterValue = '';       // filter value depends on mode
        this.confirmPopup = true;    // show confirmation modal on OCR result
        this.confidenceThreshold = 40; // minimum Tesseract confidence (0-100)
        this.preprocessingMode = 'TRIM'; // TRIM, NONE, REMOVE_ALL, NORMALIZE
        this.textTransform = 'NONE'; // NONE, UPPERCASE, LOWERCASE
        this.roi = null; // { enabled, top, left, width, height } in %
        this.binarizeEnabled = true; // Smart Canvas binarization
        this.binarizeThreshold = BINARIZE_THRESHOLD;

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
        if (opts.minTextLength !== undefined) this.minTextLength = parseInt(opts.minTextLength, 10);
        if (opts.debounceMs !== undefined) this._debounceMs = opts.debounceMs;
        if (opts.filterMode !== undefined) this.filterMode = opts.filterMode;
        if (opts.filterValue !== undefined) this.filterValue = opts.filterValue;
        if (opts.confirmPopup !== undefined) this.confirmPopup = opts.confirmPopup;
        if (opts.confidenceThreshold !== undefined) this.confidenceThreshold = opts.confidenceThreshold;
        if (opts.preprocessingMode !== undefined) this.preprocessingMode = opts.preprocessingMode;
        if (opts.textTransform !== undefined) this.textTransform = opts.textTransform;
        if (opts.roi !== undefined) this.roi = opts.roi;
        if (opts.binarizeEnabled !== undefined) this.binarizeEnabled = opts.binarizeEnabled;
        if (opts.binarizeThreshold !== undefined) this.binarizeThreshold = opts.binarizeThreshold;
    };

    /**
     * Returns list of available drivers
     */
    OCRManager.prototype.getAvailableDrivers = function() {
        var drivers = [];
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
     */
    OCRManager.prototype.resolveDriver = function(preferredDriver) {
        if (preferredDriver === DRIVER_NATIVE && this.nativeDetector) {
            return DRIVER_NATIVE;
        }
        if (preferredDriver === DRIVER_TESSERACT && typeof Tesseract !== 'undefined') {
            return DRIVER_TESSERACT;
        }
        if (this.nativeDetector) {
            return DRIVER_NATIVE;
        }
        if (typeof Tesseract !== 'undefined') {
            return DRIVER_TESSERACT;
        }
        return null;
    };

    /**
     * Initialize Tesseract.js worker with STRICT MODE parameters.
     *
     * Key settings:
     * - PSM 7: Treat image as a single text line
     * - Char whitelist: Only A-Z, 0-9 (eliminates garbage symbols)
     * - DPI 300: Force high-density interpretation
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

            // Apply strict mode parameters
            return worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz',
                tessedit_pageseg_mode: '7',  // Single text line
                user_defined_dpi: String(TARGET_DPI)
            });
        }).then(function() {
            self.tesseractReady = true;
            console.log('OCRManager: Tesseract worker ready (Strict Mode: PSM 7, whitelist, DPI ' + TARGET_DPI + ')');
        });
    };

    /**
     * Smart Canvas Pre-Processing Pipeline
     *
     * Transforms a raw video frame into a high-contrast, binarized image
     * optimized for OCR. Steps:
     *   1. ROI crop (if enabled) - extract only the region of interest
     *   2. Upscale by 2.5x - Tesseract needs high DPI input
     *   3. Grayscale conversion - remove color noise
     *   4. Threshold binarization - strict black/white for maximum contrast
     *
     * @param {HTMLVideoElement} video - The source video element
     * @param {Object} roi - ROI config { enabled, top, left, width, height } in %
     * @param {boolean} binarize - Whether to apply binarization
     * @returns {Object} { canvas, imageDataUri } - processed canvas and JPEG snapshot
     */
    OCRManager.prototype._preprocessFrame = function(video, roi, binarize) {
        var vw = video.videoWidth;
        var vh = video.videoHeight;

        // Step 1: Calculate source region (ROI or full frame)
        var sx = 0, sy = 0, sw = vw, sh = vh;
        if (roi && roi.enabled) {
            sx = Math.round((roi.left / 100) * vw);
            sy = Math.round((roi.top / 100) * vh);
            sw = Math.round((roi.width / 100) * vw);
            sh = Math.round((roi.height / 100) * vh);
        }

        // Step 2: Create upscaled canvas
        var scaledW = Math.round(sw * UPSCALE_FACTOR);
        var scaledH = Math.round(sh * UPSCALE_FACTOR);

        var procCanvas = document.createElement('canvas');
        procCanvas.width = scaledW;
        procCanvas.height = scaledH;
        var ctx = procCanvas.getContext('2d');

        // Draw source region scaled up
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, scaledW, scaledH);

        // Step 3 & 4: Grayscale + Binarization
        if (binarize) {
            var imageData = ctx.getImageData(0, 0, scaledW, scaledH);
            var data = imageData.data;
            var threshold = this.binarizeThreshold;

            for (var i = 0; i < data.length; i += 4) {
                // Luminance formula (ITU-R BT.601)
                var gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                // Binarize: below threshold = black (0), above = white (255)
                var val = gray < threshold ? 0 : 255;
                data[i] = val;
                data[i + 1] = val;
                data[i + 2] = val;
                // Alpha stays 255
            }

            ctx.putImageData(imageData, 0, 0);
        }

        // Capture processed image as JPEG for evidence/history
        var imageDataUri = '';
        try {
            imageDataUri = procCanvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
            console.warn('OCRManager: Failed to capture processed image', e);
        }

        return { canvas: procCanvas, imageDataUri: imageDataUri };
    };

    /**
     * Capture a raw (unprocessed) snapshot for evidence purposes.
     * Always captures the full video frame at native resolution.
     *
     * @returns {string} JPEG data URI of the raw frame
     */
    OCRManager.prototype._captureRawEvidence = function() {
        if (!this.video) return '';

        var vw = this.video.videoWidth;
        var vh = this.video.videoHeight;

        var rawCanvas = document.createElement('canvas');
        rawCanvas.width = vw;
        rawCanvas.height = vh;
        var ctx = rawCanvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, vw, vh);

        try {
            return rawCanvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
            console.warn('OCRManager: Failed to capture raw evidence', e);
            return '';
        }
    };

    /**
     * Start scanning with specified driver preference
     */
    OCRManager.prototype.start = function(mode, preferredDriver, deviceId) {
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

            // Create offscreen canvas for frame capture (used as fallback)
            self.canvas = document.createElement('canvas');
            self.canvasCtx = self.canvas.getContext('2d');

            container.innerHTML = '';
            container.appendChild(self.video);

            var constraints = {
                video: { facingMode: 'environment' }
            };
            if (deviceId) {
                constraints.video = { deviceId: { exact: deviceId } };
            }

            return navigator.mediaDevices.getUserMedia(constraints).catch(function(cameraErr) {
                console.warn('OCRManager: Preferred camera failed, trying fallback', cameraErr);
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
            // Set canvas size to match video (fallback canvas)
            self.canvas.width = self.video.videoWidth;
            self.canvas.height = self.video.videoHeight;

            // If using Tesseract, initialize worker with strict params
            if (self.activeDriver === DRIVER_TESSERACT) {
                return self.initTesseract();
            }
        }).then(function() {
            self.isScanning = true;

            if (self.callbacks.onDriverReady) {
                self.callbacks.onDriverReady(self.activeDriver);
            }

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
     * Filter detected text based on config.
     */
    OCRManager.prototype._filterText = function(rawText) {
        var text = rawText;

        // 1. Preprocessing
        if (this.preprocessingMode === 'REMOVE_ALL') {
            text = text.replace(/\s+/g, '');
        } else if (this.preprocessingMode === 'NORMALIZE') {
            text = text.replace(/\s+/g, ' ').trim();
        } else if (this.preprocessingMode === 'TRIM') {
            text = text.trim();
        }

        // 2. Text Transformation
        if (this.textTransform === 'UPPERCASE') {
            text = text.toUpperCase();
        } else if (this.textTransform === 'LOWERCASE') {
            text = text.toLowerCase();
        }

        // 3. Alphanumeric Filter (if enabled)
        if (this.alphanumericOnly) {
            text = text.replace(/[^a-zA-Z0-9 ]/g, '');
            if (this.preprocessingMode !== 'NONE') text = text.trim();
        }

        // Apply advanced filter based on mode
        if (this.filterMode === 'NONE' || !this.filterValue) {
            return text;
        }

        if (this.filterMode === 'REGEX') {
            try {
                var regex = new RegExp(this.filterValue);
                if (!regex.test(text)) {
                    return '';
                }
            } catch (e) {
                console.warn('OCRManager: Invalid regex filter', e);
            }
            return text;
        }

        return text;
    };

    /**
     * Check if text passes the minimum length filter.
     * If minTextLength is 0 (off), accept any non-empty text.
     * Otherwise require at least minTextLength characters.
     */
    OCRManager.prototype._passesLengthFilter = function(text) {
        if (!text || text.length === 0) return false;
        if (this.minTextLength === 0) return true; // 0 = off, accept all
        return text.length >= this.minTextLength;
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
     * Tesseract.js detection using Smart Canvas pipeline
     */
    OCRManager.prototype._detectTesseract = function() {
        var self = this;

        if (!this.tesseractWorker || !this.video) {
            return Promise.resolve();
        }

        // Use Smart Canvas pipeline
        var processed = this._preprocessFrame(this.video, this.roi, this.binarizeEnabled);

        return this.tesseractWorker.recognize(processed.canvas).then(function(result) {
            if (!self.isScanning) return;

            var confidence = result && result.data && result.data.confidence ? result.data.confidence : 0;
            if (confidence < self.confidenceThreshold) return;

            var rawText = result && result.data && result.data.text ? result.data.text : '';
            var filtered = self._filterText(rawText);

            if (self._passesLengthFilter(filtered) && !self._isDuplicate(filtered)) {
                if (self.callbacks.onSuccess) {
                    self.callbacks.onSuccess(filtered, {
                        result: { format: { formatName: 'TEXT_OCR' } },
                        confidence: confidence,
                        imageDataUri: processed.imageDataUri
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

            // Filter results by ROI if enabled
            if (self.roi && self.roi.enabled) {
                var vw = self.video.videoWidth;
                var vh = self.video.videoHeight;
                var roiX = (self.roi.left / 100) * vw;
                var roiY = (self.roi.top / 100) * vh;
                var roiW = (self.roi.width / 100) * vw;
                var roiH = (self.roi.height / 100) * vh;

                texts = texts.filter(function(t) {
                    var box = t.boundingBox;
                    var centerX = box.x + box.width / 2;
                    var centerY = box.y + box.height / 2;
                    return (centerX >= roiX && centerX <= (roiX + roiW) &&
                            centerY >= roiY && centerY <= (roiY + roiH));
                });
                if (texts.length === 0) return;
            }

            texts.sort(function(a, b) {
                if (Math.abs(a.boundingBox.y - b.boundingBox.y) > 20) {
                    return a.boundingBox.y - b.boundingBox.y;
                }
                return a.boundingBox.x - b.boundingBox.x;
            });

            var rawText = texts.map(function(t) { return t.rawValue; }).join(' ');
            var filtered = self._filterText(rawText);

            if (self._passesLengthFilter(filtered) && !self._isDuplicate(filtered)) {
                if (self.callbacks.onSuccess) {
                    self.callbacks.onSuccess(filtered, {
                        result: { format: { formatName: 'TEXT_OCR' } }
                    }, 'TEXT_OCR');
                }
            }
        });
    };

    /**
     * Screenshot Evidence: Capture raw frame for evidence, independent of OCR.
     * Always works, even if OCR fails.
     *
     * @returns {Promise} resolves with { imageDataUri }
     */
    OCRManager.prototype.screenshotEvidence = function() {
        if (!this.video) {
            return Promise.reject(new Error('Camera not active'));
        }

        var imageDataUri = this._captureRawEvidence();
        return Promise.resolve({ imageDataUri: imageDataUri });
    };

    /**
     * Scan & Verify: Capture frame, run through Smart Canvas pipeline, OCR it.
     * Pauses live scanning during recognition.
     *
     * @returns {Promise} resolves with { text, processedImageUri, rawImageUri }
     */
    OCRManager.prototype.scanAndVerify = function() {
        var self = this;

        if (!this.video) {
            return Promise.reject(new Error('Camera not active'));
        }

        // Pause live loop
        var wasScanning = this.isScanning;
        this.isScanning = false;
        if (this._loopTimer) {
            clearTimeout(this._loopTimer);
            this._loopTimer = null;
        }

        // Capture raw evidence first
        var rawImageUri = this._captureRawEvidence();

        // Run Smart Canvas pipeline
        var processed = this._preprocessFrame(this.video, this.roi, this.binarizeEnabled);

        var detectPromise;
        if (this.activeDriver === DRIVER_TESSERACT && this.tesseractWorker) {
            detectPromise = this.tesseractWorker.recognize(processed.canvas).then(function(result) {
                var text = result && result.data && result.data.text ? result.data.text.trim() : '';
                var confidence = result && result.data && result.data.confidence ? result.data.confidence : 0;
                return { text: text, confidence: confidence };
            });
        } else if (this.activeDriver === DRIVER_NATIVE && this.nativeDetector) {
            detectPromise = this.nativeDetector.detect(this.video).then(function(texts) {
                if (!texts || texts.length === 0) return { text: '', confidence: 0 };
                texts.sort(function(a, b) {
                    if (Math.abs(a.boundingBox.y - b.boundingBox.y) > 20) {
                        return a.boundingBox.y - b.boundingBox.y;
                    }
                    return a.boundingBox.x - b.boundingBox.x;
                });
                return {
                    text: texts.map(function(t) { return t.rawValue; }).join(' ').trim(),
                    confidence: 100 // Native API doesn't provide confidence
                };
            });
        } else {
            detectPromise = Promise.resolve({ text: '', confidence: 0 });
        }

        return detectPromise.then(function(ocrResult) {
            var filtered = self._filterText(ocrResult.text);

            // Adhere to Exact Text Length (if set)
            if (!self._passesLengthFilter(filtered)) {
                filtered = ''; // Treat as no result if length doesn't match
            }

            return {
                text: filtered,
                confidence: ocrResult.confidence,
                processedImageUri: processed.imageDataUri,
                rawImageUri: rawImageUri
            };
        }).catch(function(err) {
            console.error('OCRManager scanAndVerify error:', err);
            // Resume scanning on error
            if (wasScanning) {
                self.isScanning = true;
                self._detectLoop();
            }
            throw err;
        });
    };

    /**
     * Legacy snapshot method (kept for backward compatibility).
     * Now delegates to scanAndVerify.
     */
    OCRManager.prototype.snapshot = function() {
        var self = this;
        return this.scanAndVerify().then(function(result) {
            // Map to legacy format
            var filtered = result.text;
            var imageDataUri = result.rawImageUri || result.processedImageUri;

            if (self._passesLengthFilter(filtered)) {
                if (self.callbacks.onSuccess) {
                    self.callbacks.onSuccess(filtered, {
                        result: { format: { formatName: 'TEXT_OCR' } },
                        imageDataUri: imageDataUri
                    }, 'TEXT_OCR');
                }
            }

            return { text: filtered, imageDataUri: imageDataUri };
        });
    };

    // Expose driver constants
    OCRManager.DRIVER_TESSERACT = DRIVER_TESSERACT;
    OCRManager.DRIVER_NATIVE = DRIVER_NATIVE;

    return OCRManager;
})();
