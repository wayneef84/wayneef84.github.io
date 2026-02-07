class OCRManager {
    constructor(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks; // { onSuccess, onInitError, onStatusChange }
        this.stream = null;
        this.video = null;
        this.isScanning = false;
        this.detector = null;

        // Backend configuration
        this.backendUrl = 'http://localhost:5000';
        this.useBackend = false;
        this.backendChecked = false;

        // Native detector check
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

    async checkBackend() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout

            const response = await fetch(`${this.backendUrl}/status`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'online') {
                    console.log("Local OCR Backend found:", data);
                    this.useBackend = true;
                    return true;
                }
            }
        } catch (e) {
            console.log("Local OCR Backend not reachable (offline mode).");
        }
        this.useBackend = false;
        return false;
    }

    async start(mode) {
        console.log("OCRManager.start called with mode:", mode);

        // Check for backend before failing on missing TextDetector
        await this.checkBackend();

        if (!this.detector && !this.useBackend) {
            const msg = "Text Recognition (OCR) not supported. Please use Chrome/Edge on Android/Desktop (enable Experimental Web Platform features) OR run the local Python OCR server.";
            console.error(msg);
            if (this.callbacks.onInitError) {
                this.callbacks.onInitError(msg);
            }
            throw new Error(msg);
        }

        if (this.useBackend && this.callbacks.onStatusChange) {
            this.callbacks.onStatusChange("Connected to Local OCR Server");
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
        if (!this.isScanning || !this.video) return;

        let nextFrameDelay = 200; // Default fast delay for native

        try {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {

                if (this.useBackend) {
                    // --- Backend Mode ---
                    nextFrameDelay = 1000; // Slower for network calls

                    // Capture frame to canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = this.video.videoWidth;
                    canvas.height = this.video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(this.video, 0, 0);

                    // Convert to blob
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));

                    const formData = new FormData();
                    formData.append('image', blob, 'frame.jpg');

                    try {
                        const res = await fetch(`${this.backendUrl}/ocr`, {
                            method: 'POST',
                            body: formData
                        });

                        if (res.ok) {
                            const data = await res.json();
                            if (data.results && data.results.length > 0) {
                                // Format is already compatible from backend
                                const fullText = data.text; // backend returns joined text
                                if (fullText && fullText.trim().length > 0) {
                                     if (this.callbacks.onSuccess) {
                                         this.callbacks.onSuccess(fullText, { result: { format: { formatName: 'TEXT_OCR_LOCAL' } } }, 'TEXT_OCR');
                                     }
                                }
                            }
                        }
                    } catch (netErr) {
                        console.warn("Backend OCR request failed", netErr);
                    }

                } else if (this.detector) {
                    // --- Native Mode ---
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
            }
        } catch (e) {
            console.error("Detection failed", e);
        }

        if (this.isScanning) {
            setTimeout(() => {
                if (this.isScanning) requestAnimationFrame(() => this.detectLoop());
            }, nextFrameDelay);
        }
    }
}
