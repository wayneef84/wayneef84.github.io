class ScannerManager {
    constructor(elementId, callbacks) {
        this.elementId = elementId;
        this.callbacks = callbacks; // { onSuccess, onError }
        this.instance = null;
        this.isScanning = false;
    }

    async start(mode) {
        try {
            // Stop existing if running
            if (this.instance) {
                if (this.isScanning) {
                    await this.instance.stop().catch(err => console.warn("Failed to stop scanner", err));
                }
                try { this.instance.clear(); } catch(e) {} // Clear element
                this.instance = null;
            }

            this.isScanning = false;

            // Configure Formats
            let formatsToSupport = undefined; // Auto

            const H5F = window.Html5QrcodeSupportedFormats;

            if (mode === 'OCR') {
                // OCR Mode: Auto detect
                formatsToSupport = undefined;
            } else if (mode === 'AUTO') {
                formatsToSupport = undefined;
            } else {
                // Specific Format
                if (H5F && H5F[mode] !== undefined) {
                    formatsToSupport = [ H5F[mode] ];
                } else {
                    console.warn(`Unknown mode ${mode}, defaulting to Auto`);
                    formatsToSupport = undefined;
                }
            }

            // Create Instance with config
            // Note: Html5Qrcode constructor takes (elementId, verboseOrConfig)
            const config = {
                formatsToSupport: formatsToSupport,
                verbose: false
            };

            this.instance = new Html5Qrcode(this.elementId, config);

            // Start
            const cameraConfig = { facingMode: "environment" }; // Prefer back camera

            await this.instance.start(
                cameraConfig,
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText, decodedResult) => {
                    if (this.callbacks.onSuccess) {
                        this.callbacks.onSuccess(decodedText, decodedResult, mode);
                    }
                },
                (errorMessage) => {
                    // Ignore frame errors usually, but can log if needed
                    // if (this.callbacks.onError) this.callbacks.onError(errorMessage);
                }
            );
            this.isScanning = true;
        } catch (err) {
            console.error("Error starting scanner", err);
            // Propagate error so UI can show it
            if (this.callbacks.onInitError) {
                this.callbacks.onInitError(err);
            }
        }
    }

    async stop() {
        if (this.stopPromise) return this.stopPromise;

        if (this.instance && this.isScanning) {
            this.stopPromise = (async () => {
                await this.instance.stop().catch(e => {
                    // Suppress NotFoundError which can happen if DOM is already altered
                    if (e && (e.name === 'NotFoundError' || (e.message && e.message.includes("removeChild")))) {
                         console.warn("Scanner stop: Element not found, force cleaning");
                    } else {
                         console.error("Error stopping scanner", e);
                    }
                });

                this.isScanning = false;
                try { await this.instance.clear(); } catch(e) {}

                // Manual Cleanup: Ensure video element tracks are stopped if library missed them
                const container = document.getElementById(this.elementId);
                if (container) {
                    const video = container.querySelector('video');
                    if (video && video.srcObject) {
                        const tracks = video.srcObject.getTracks();
                        tracks.forEach(track => track.stop());
                        video.srcObject = null;
                    }
                }
            })();
            await this.stopPromise;
            this.stopPromise = null;
        }
    }
}
