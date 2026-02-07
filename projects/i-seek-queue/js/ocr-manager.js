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
        this.isSupported = false;
    }

    async start() {
        // 1. Check Support, but don't abort immediately
        this.isSupported = !!window.TextDetector;

        try {
            const container = document.getElementById(this.elementId);
            if (!container) throw new Error(`Element ${this.elementId} not found`);

            // Clear container
            container.innerHTML = '';
            container.style.position = 'relative';
            container.style.background = '#000';
            container.style.overflow = 'hidden'; // Ensure video doesn't spill

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

            // Create Overlay Message if not supported
            if (!this.isSupported) {
                const msg = document.createElement('div');
                msg.style.position = 'absolute';
                msg.style.top = '50%';
                msg.style.left = '50%';
                msg.style.transform = 'translate(-50%, -50%)';
                msg.style.color = '#ff4444';
                msg.style.background = 'rgba(0,0,0,0.7)';
                msg.style.padding = '10px';
                msg.style.borderRadius = '5px';
                msg.style.textAlign = 'center';
                msg.innerHTML = '⚠️ OCR Not Supported<br><small>Enable "Experimental Web Platform features"</small>';
                container.appendChild(msg);

                // Notify UI but don't stop execution so video can still show
                if (this.callbacks.onInitError) {
                    this.callbacks.onInitError(new Error("Browser does not support TextDetector API"));
                }
            } else {
                this.detector = new TextDetector();
            }

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
        if (!this.isScanning || !this.video) return;

        // If not supported, just loop to keep alive (or stop loop entirely? User might want to just see camera)
        if (!this.detector) {
            // Maybe check occasionally? No, API support won't change at runtime.
            // Just return for now, video is playing.
            return;
        }

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
