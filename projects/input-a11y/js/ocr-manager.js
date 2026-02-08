class OCRManager {
    constructor(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks; // { onSuccess, onInitError }
        this.stream = null;
        this.video = null;
        this.isScanning = false;

        // Native TextDetector Support
        this.detector = null;
        if ('TextDetector' in window) {
            try {
                this.detector = new TextDetector();
                console.log("[OCR] Native TextDetector initialized.");
            } catch (e) {
                console.warn("[OCR] TextDetector detected but failed to init", e);
            }
        } else {
            console.log("[OCR] Native TextDetector not supported.");
        }

        // Tesseract Support
        this.tesseractWorker = null;
        this.isTesseractReady = false;

        // Canvas for capturing frames
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    async initTesseract() {
        if (this.tesseractWorker) return; // Already initialized

        if (typeof Tesseract === 'undefined') {
            const err = "Tesseract library object is undefined. Check if tesseract.min.js loaded.";
            console.error("[OCR] " + err);
            throw new Error(err);
        }

        console.log("[OCR] Initializing Tesseract Worker...");
        try {
            // Create worker with explicit local paths
            this.tesseractWorker = await Tesseract.createWorker('eng', 1, {
                workerPath: './assets/worker.min.js',
                corePath: './assets/tesseract-core.wasm.js',
                langPath: './assets/',
                logger: m => {
                    // Optional: Log progress
                    // console.log("[OCR Progress]", m);
                }
            });
            this.isTesseractReady = true;
            console.log("[OCR] Tesseract Worker Ready.");
        } catch (err) {
            console.error("[OCR] Failed to initialize Tesseract:", err);
            throw new Error("Failed to load OCR Engine: " + err.message);
        }
    }

    async start(mode) {
        console.log("[OCR] OCRManager.start called with mode:", mode);

        // Determine Engine
        let useTesseract = false;
        if (mode === 'TEXT_OCR') {
            // Check Tesseract availability
            if (typeof Tesseract !== 'undefined') {
                useTesseract = true;
                console.log("[OCR] Selecting Tesseract engine.");
            } else {
                console.warn("[OCR] Tesseract global not found. Falling back to native?");
            }

            if (!useTesseract && !this.detector) {
                const msg = "Text Recognition (OCR) not supported. Tesseract library missing and native API not found.";
                console.error("[OCR] " + msg);
                if (this.callbacks.onInitError) this.callbacks.onInitError(msg);
                throw new Error(msg);
            }
        }

        try {
            await this.stop();

            // Init Tesseract if needed
            if (useTesseract) {
                console.log("[OCR] Awaiting Tesseract initialization...");
                await this.initTesseract();
            }

            const container = document.getElementById(this.elementId);
            if (!container) throw new Error("Scanner container not found");

            // Create Video Element
            this.video = document.createElement('video');
            this.video.style.width = '100%';
            this.video.style.height = '100%';
            this.video.style.objectFit = 'cover';
            this.video.setAttribute('autoplay', '');
            this.video.setAttribute('muted', '');
            this.video.setAttribute('playsinline', '');

            container.innerHTML = '';
            container.appendChild(this.video);

            // Get Stream
            console.log("[OCR] Requesting camera stream...");
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
            } catch (cameraErr) {
                 console.warn("[OCR] Environment camera failed, trying user facing", cameraErr);
                 this.stream = await navigator.mediaDevices.getUserMedia({
                     video: true
                 });
            }

            this.video.srcObject = this.stream;

            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => resolve();
            });

            await this.video.play();
            this.isScanning = true;
            console.log("[OCR] Camera started. Beginning detection loop.");

            // Start Loop
            if (useTesseract) {
                this.detectLoopTesseract();
            } else {
                this.detectLoopNative();
            }

        } catch (err) {
            console.error("[OCR] Start Error", err);
            if (this.callbacks.onInitError) {
                this.callbacks.onInitError(err.message);
            }
        }
    }

    async stop() {
        this.isScanning = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
            this.video.remove();
            this.video = null;
        }
        const container = document.getElementById(this.elementId);
        if (container) container.innerHTML = '';
    }

    async detectLoopNative() {
        if (!this.isScanning || !this.video || !this.detector) return;

        try {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                const texts = await this.detector.detect(this.video);

                if (texts && texts.length > 0) {
                    texts.sort((a, b) => {
                        if (Math.abs(a.boundingBox.y - b.boundingBox.y) > 20) {
                            return a.boundingBox.y - b.boundingBox.y;
                        }
                        return a.boundingBox.x - b.boundingBox.x;
                    });

                    const fullText = texts.map(t => t.rawValue).join('\n');

                    if (fullText.trim().length > 0) {
                         if (this.callbacks.onSuccess) {
                             this.callbacks.onSuccess(fullText, { result: { format: { formatName: 'TEXT_OCR' } } }, 'TEXT_OCR');
                         }
                    }
                }
            }
        } catch (e) {
            console.error("Native Detection failed", e);
        }

        if (this.isScanning) {
            setTimeout(() => {
                if (this.isScanning) requestAnimationFrame(() => this.detectLoopNative());
            }, 200);
        }
    }

    async detectLoopTesseract() {
        if (!this.isScanning || !this.video || !this.tesseractWorker) return;

        try {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                // Capture frame
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

                // Recognize
                const { data: { text } } = await this.tesseractWorker.recognize(this.canvas);

                if (text && text.trim().length > 0) {
                    if (this.callbacks.onSuccess) {
                        this.callbacks.onSuccess(text.trim(), { result: { format: { formatName: 'TEXT_OCR_TESSERACT' } } }, 'TEXT_OCR');
                    }
                }
            }
        } catch (e) {
            console.error("Tesseract Detection failed", e);
        }

        if (this.isScanning) {
            // Tesseract is slow, so we just call the next loop immediately after the previous one finishes
            // But let's add a small delay to yield UI thread if needed
            setTimeout(() => {
                this.detectLoopTesseract();
            }, 100);
        }
    }
}
