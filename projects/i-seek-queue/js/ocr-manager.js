class OCRManager {
    constructor(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks; // { onSuccess, onError, onInitError }
        this.video = null;
        this.canvas = null;
        this.stream = null;
        this.isScanning = false;
        this.animationFrameId = null;
        this.detector = null;
        this.lastText = "";
        this.consecutiveFrames = 0;
    }

    async start() {
        if (!window.TextDetector) {
            const err = new Error("TextDetector API not supported in this browser. Enable experimental web platform features.");
            if (this.callbacks.onInitError) this.callbacks.onInitError(err);
            return;
        }

        try {
            this.detector = new TextDetector();
            const container = document.getElementById(this.elementId);
            if (!container) throw new Error(`Element ${this.elementId} not found`);

            // Clear container
            container.innerHTML = '';
            container.style.position = 'relative';
            container.style.background = '#000';

            // Create Video
            this.video = document.createElement('video');
            this.video.setAttribute('playsinline', '');
            this.video.style.width = '100%';
            this.video.style.height = '100%';
            this.video.style.objectFit = 'cover';

            // Create Canvas Overlay
            this.canvas = document.createElement('canvas');
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';

            container.appendChild(this.video);
            container.appendChild(this.canvas);

            // Get Stream
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            this.video.srcObject = this.stream;

            await this.video.play();

            // Set Canvas Size to match Video
            this.updateCanvasSize();
            window.addEventListener('resize', this.updateCanvasSize.bind(this));

            this.isScanning = true;
            this.scanLoop();

        } catch (err) {
            console.error("OCR Start Error", err);
            if (this.callbacks.onInitError) this.callbacks.onInitError(err);
        }
    }

    updateCanvasSize() {
        if (this.video && this.canvas) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        }
    }

    async scanLoop() {
        if (!this.isScanning || !this.video || !this.detector) return;

        try {
            // Detect
            const detectedTexts = await this.detector.detect(this.video);

            if (!this.isScanning) return; // Check if stopped during await

            // Draw
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (detectedTexts.length > 0) {
                // Visualize
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 2;
                ctx.font = '16px Arial';
                ctx.fillStyle = '#00FF00';

                let fullText = [];

                detectedTexts.forEach(text => {
                    const { boundingBox, rawValue } = text;
                    ctx.strokeRect(
                        boundingBox.x,
                        boundingBox.y,
                        boundingBox.width,
                        boundingBox.height
                    );
                    // ctx.fillText(rawValue, boundingBox.x, boundingBox.y - 5);
                    fullText.push(rawValue);
                });

                const joinedText = fullText.join('\n');

                // Simple Debounce / Stabilization
                // We want to return text if it's substantial and stable for a moment?
                // Or just return immediately? User wants "Live stream".
                // If we return immediately, the UI might flicker or popup might trigger too fast.
                // But app.js handles the "Stop on Success" logic.
                // So we just report it.

                if (joinedText.trim().length > 0) {
                    if (this.callbacks.onSuccess) {
                        // Pass detected text
                        this.callbacks.onSuccess(joinedText, { result: { format: { formatName: 'OCR_TEXT' } } }, 'OCR');
                    }
                }
            }

        } catch (e) {
            console.warn("OCR Detection Error", e);
        }

        this.animationFrameId = requestAnimationFrame(this.scanLoop.bind(this));
    }

    stop() {
        this.isScanning = false;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.video) {
            this.video.pause();
            this.video.srcObject = null;
            this.video.remove();
            this.video = null;
        }

        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }

        window.removeEventListener('resize', this.updateCanvasSize.bind(this));

        const container = document.getElementById(this.elementId);
        if (container) container.innerHTML = '';
    }
}
