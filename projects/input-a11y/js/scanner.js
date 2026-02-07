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
                await this.instance.stop().catch(e => console.error("Error stopping", e));
                this.isScanning = false;
                try { this.instance.clear(); } catch(e) {}
            })();
            await this.stopPromise;
            this.stopPromise = null;
        }
    }
}
