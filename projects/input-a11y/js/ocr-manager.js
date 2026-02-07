class OCRManager {
    constructor(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks; // { onSuccess, onInitError }
        this.stream = null;
        this.video = null;
        this.isScanning = false;
        this.detector = null;

        if ('TextDetector' in window) {
            try {
                this.detector = new TextDetector();
            } catch (e) {
                console.warn("TextDetector detected but failed to init", e);
            }
        } else {
             console.warn("TextDetector API not found in window object.");
        }
    }

    async start(mode) {
        console.log("OCRManager.start called with mode:", mode);

        if (!this.detector) {
            const msg = "Text Recognition (OCR) not supported in this browser. Please use Chrome/Edge on Android/Desktop or enable 'Experimental Web Platform features'.";
            console.error(msg);
            if (this.callbacks.onInitError) {
                this.callbacks.onInitError(msg);
            }
            throw new Error(msg);
        }

        try {
            // Stop existing if running
            await this.stop();

            const container = document.getElementById(this.elementId);
            if (!container) throw new Error("Scanner container not found");

            // Create Video Element
            console.log("Creating video element for OCR...");
            this.video = document.createElement('video');
            this.video.style.width = '100%';
            this.video.style.height = '100%';
            this.video.style.objectFit = 'cover';
            this.video.setAttribute('autoplay', '');
            this.video.setAttribute('muted', '');
            this.video.setAttribute('playsinline', '');

            // Clear previous content
            container.innerHTML = '';
            container.appendChild(this.video);

            // Get Stream
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
            } catch (cameraErr) {
                 // Fallback if environment camera not found
                 console.warn("Environment camera failed, trying user facing", cameraErr);
                 this.stream = await navigator.mediaDevices.getUserMedia({
                     video: true
                 });
            }

            this.video.srcObject = this.stream;

            // Wait for video metadata to load before playing
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    resolve();
                };
            });

            await this.video.play();
            this.isScanning = true;

            // Start Loop
            this.detectLoop();

        } catch (err) {
            console.error("OCR Start Error", err);
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

    async detectLoop() {
        if (!this.isScanning || !this.video || !this.detector) return;

        try {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                const texts = await this.detector.detect(this.video);

                if (texts && texts.length > 0) {
                    // Sort by vertical position (y) then horizontal (x) to maintain reading order
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
            console.error("Detection failed", e);
        }

        if (this.isScanning) {
            // Throttle slightly to save battery/CPU?
            // requestAnimationFrame is usually 60fps, maybe too fast for OCR.
            // Let's do it every 500ms? Or 200ms?
            // User wants "text recognition isn't working", implies they want it snappy.
            // But OCR is heavy.
            setTimeout(() => {
                if (this.isScanning) requestAnimationFrame(() => this.detectLoop());
            }, 200);
        }
    }
}
