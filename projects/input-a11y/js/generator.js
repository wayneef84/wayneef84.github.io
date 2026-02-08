/**
 * GeneratorManager - QR code generation and download
 *
 * ES5-compatible IIFE pattern for older tablet support.
 */
var GeneratorManager = (function() {

    function GeneratorManager() {
        // no-op constructor
    }

    GeneratorManager.prototype.generate = function(containerId, text) {
        var container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!text) return;

        try {
            new QRCode(container, {
                text: text,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            console.error("QR Generation failed", e);
            container.innerText = "Error generating QR";
        }
    };

    GeneratorManager.prototype.download = function(containerId, filename) {
        filename = filename || "qrcode.png";

        var container = document.getElementById(containerId);
        if (!container) return;

        var img = container.querySelector("img");
        if (img && img.src && img.src.indexOf('data:image') === 0) {
            this._triggerDownload(img.src, filename);
            return;
        }

        var canvas = container.querySelector("canvas");
        if (canvas) {
            var dataUrl = canvas.toDataURL("image/png");
            this._triggerDownload(dataUrl, filename);
            return;
        }

        alert("No QR code available to download. Please generate one first.");
    };

    GeneratorManager.prototype._triggerDownload = function(url, filename) {
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return GeneratorManager;
})();
