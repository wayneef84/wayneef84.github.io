/**
 * QRMaster - Shared Library for F.O.N.G. Projects
 * Wraps qrcode.js and html5-qrcode for standardized usage.
 */
class QRMaster {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
    }

    /**
     * Generates a QR Code inside the target element.
     * @param {HTMLElement} element - The container element.
     * @param {string} text - The data to encode.
     * @param {object} options - Optional {width, height, colorDark, colorLight}
     */
    generate(element, text, options = {}) {
        if (!element) return console.error('QRMaster: No element provided for generation');
        element.innerHTML = ''; // Clear previous

        new QRCode(element, {
            text: text,
            width: options.width || 200,
            height: options.height || 200,
            colorDark: options.colorDark || "#000000",
            colorLight: options.colorLight || "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    /**
     * Starts the Camera Scanner in a given container.
     * @param {string} elementId - The ID of the HTML element to render camera in.
     * @param {function} onSuccess - Callback(decodedText, decodedResult)
     * @param {function} onError - Optional Callback(errorMessage)
     * @param {object} config - Optional config overrides
     */
    startScanner(elementId, onSuccess, onError, config = {}) {
        if (typeof Html5QrcodeScanner === 'undefined') {
            console.error('QRMaster: Html5QrcodeScanner lib not loaded.');
            if(onError) onError('Library missing');
            return;
        }

        // Stop existing if any (safety)
        if (this.scanner) {
            this.stopScanner().then(() => {
                this._initScanner(elementId, onSuccess, onError, config);
            });
        } else {
            this._initScanner(elementId, onSuccess, onError, config);
        }
    }

    _initScanner(elementId, onSuccess, onError, config) {
        const defaults = {
            fps: 10,
            qrbox: {width: 250, height: 250},
            aspectRatio: 1.0
        };

        const finalConfig = { ...defaults, ...config };

        this.scanner = new Html5QrcodeScanner(elementId, finalConfig, /* verbose= */ false);

        this.scanner.render(
            (txt, res) => {
                onSuccess(txt, res);
            },
            (err) => {
                if (onError) onError(err);
            }
        );
        this.isScanning = true;
    }

    /**
     * Stops and clears the scanner.
     * @returns {Promise}
     */
    stopScanner() {
        if (this.scanner) {
            return this.scanner.clear().then(() => {
                this.scanner = null;
                this.isScanning = false;
            }).catch(err => {
                console.error("QRMaster: Failed to clear scanner", err);
                this.scanner = null;
            });
        }
        return Promise.resolve();
    }

    /**
     * Utility: Copy text to clipboard (Input Simulation)
     */
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback
            return new Promise((resolve, reject) => {
                try {
                    // Create textarea to select
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.position = "fixed";  // Avoid scrolling to bottom
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    if(successful) resolve(); else reject('execCommand fail');
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}

// Global Instance
window.QRMaster = new QRMaster();
