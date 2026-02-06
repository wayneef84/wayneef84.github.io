class SprunkiQRManager {
    constructor() {
        this.scanMode = 'import'; // 'import' or 'copy'
        this.injectHTML();
        this.bindEvents();
    }

    injectHTML() {
        // QR Display Modal
        const disp = document.createElement('div');
        disp.className = 'modal-overlay';
        disp.id = 'qrDisplayModal';
        disp.innerHTML = `
            <div class="modal" style="text-align: center;">
                <h2>Share Sprunki</h2>
                <div id="qrCanvas" class="qr-canvas"></div>
                <p style="font-size: 0.8rem; color: #aaa; margin-top: 10px;">Scan this with another device to import.</p>
                <div class="btn-row" style="justify-content: center;">
                    <button class="btn btn-secondary" id="btnCloseQR">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(disp);

        // Scanner Modal
        const scan = document.createElement('div');
        scan.className = 'modal-overlay';
        scan.id = 'scannerModal';
        scan.innerHTML = `
            <div class="modal">
                <h2>Scan</h2>
                <div style="margin-bottom: 10px; display: flex; justify-content: center; gap: 10px; align-items: center;">
                    <label style="font-size: 0.9rem; color: #aaa;">Mode:</label>
                    <select id="scanModeSelect" style="background: #333; color: white; border: 1px solid #555; padding: 4px; border-radius: 4px;">
                        <option value="import">Import Sprunki</option>
                        <option value="copy">Scan Text / Barcode (Copy)</option>
                    </select>
                </div>
                <div id="reader" class="scanner-box"></div>
                <div class="btn-row" style="justify-content: center; margin-top: 10px;">
                    <button class="btn btn-secondary" id="btnStopScan">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(scan);
    }

    bindEvents() {
        document.getElementById('btnCloseQR').onclick = () => {
            document.getElementById('qrDisplayModal').classList.remove('active');
            document.getElementById('qrCanvas').innerHTML = ''; // Clear previous
        };

        document.getElementById('btnStopScan').onclick = () => this.stopScan();

        document.getElementById('scanModeSelect').onchange = (e) => {
            this.scanMode = e.target.value;
        };
    }

    generateQR(charData) {
        const modal = document.getElementById('qrDisplayModal');
        const canvas = document.getElementById('qrCanvas');

        // Minify data
        const payload = {
            n: charData.name,
            t: charData.type,
            i: charData.img,
            a: charData.audio,
            c: charData.crop || {x:50, y:50, scale:1}
        };
        const json = JSON.stringify(payload);

        // Use Shared Library
        window.QRMaster.generate(canvas, json, { width: 200, height: 200 });

        modal.classList.add('active');
    }

    startScan() {
        document.getElementById('scannerModal').classList.add('active');

        // Use Shared Library
        window.QRMaster.startScanner(
            "reader",
            (txt) => this.onScanSuccess(txt),
            (err) => { /* ignore frame errors */ },
            { qrbox: {width: 250, height: 250} }
        );
    }

    stopScan() {
        window.QRMaster.stopScanner().then(() => {
            document.getElementById('scannerModal').classList.remove('active');
        });
    }

    async onScanSuccess(decodedText) {
        this.stopScan();

        if (this.scanMode === 'copy') {
            // Use Shared Library Utility
            window.QRMaster.copyToClipboard(decodedText).then(() => {
                alert(`Scanned: ${decodedText}\n\nCopied to clipboard!`);
            }).catch(() => {
                prompt(`Scanned (Copy manually):`, decodedText);
            });
            return;
        }

        // IMPORT MODE
        try {
            const payload = JSON.parse(decodedText);
            // Reconstruct full object
            const charData = {
                name: payload.n || 'Unknown',
                type: payload.t || 'beats',
                img: payload.i,
                audio: payload.a,
                crop: payload.c
            };

            if (!charData.img || !charData.audio) throw new Error('Invalid QR Data');

            await window.CustomSprunkiManager.saveCharacter({
                ...charData,
                id: `custom_${Date.now()}`,
                pack_id: 'custom',
                custom: true
            });

            alert(`Imported "${charData.name}" successfully! Reloading...`);
            location.reload();

        } catch (e) {
            alert('Failed to parse Sprunki data.\n\nDid you mean to use "Scan Text" mode?');
            console.error(e);
        }
    }
}

window.SprunkiQR = new SprunkiQRManager();
