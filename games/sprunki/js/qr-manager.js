/**
 * SprunkiQR - QR Generation and Scanning Manager (ES5)
 */
var SprunkiQR = (function () {
    var scanMode = 'import'; // 'import' or 'copy'

    function injectHTML() {
        // QR Display Modal
        var disp = document.createElement('div');
        disp.className = 'modal-overlay';
        disp.id = 'qrDisplayModal';
        disp.innerHTML =
            '<div class="modal" style="text-align: center;">' +
                '<h2>Share Sprunki</h2>' +
                '<div id="qrCanvas" class="qr-canvas"></div>' +
                '<p style="font-size: 0.8rem; color: #aaa; margin-top: 10px;">Scan this with another device to import.</p>' +
                '<div class="btn-row" style="justify-content: center;">' +
                    '<button class="btn btn-secondary" id="btnCloseQR">Close</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(disp);

        // Scanner Modal
        var scan = document.createElement('div');
        scan.className = 'modal-overlay';
        scan.id = 'scannerModal';
        scan.innerHTML =
            '<div class="modal">' +
                '<h2>Scan</h2>' +
                '<div style="margin-bottom: 10px; display: flex; justify-content: center; gap: 10px; align-items: center;">' +
                    '<label style="font-size: 0.9rem; color: #aaa;">Mode:</label>' +
                    '<select id="scanModeSelect" style="background: #333; color: white; border: 1px solid #555; padding: 4px; border-radius: 4px;">' +
                        '<option value="import">Import Sprunki</option>' +
                        '<option value="copy">Scan Text / Barcode (Copy)</option>' +
                    '</select>' +
                '</div>' +
                '<div id="reader" class="scanner-box"></div>' +
                '<div class="btn-row" style="justify-content: center; margin-top: 10px;">' +
                    '<button class="btn btn-secondary" id="btnStopScan">Cancel</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(scan);
    }

    function bindEvents() {
        document.getElementById('btnCloseQR').onclick = function () {
            document.getElementById('qrDisplayModal').classList.remove('active');
            document.getElementById('qrCanvas').innerHTML = '';
        };

        document.getElementById('btnStopScan').onclick = function () { stopScan(); };

        document.getElementById('scanModeSelect').onchange = function (e) {
            scanMode = e.target.value;
        };
    }

    function generateQR(charData) {
        var modal = document.getElementById('qrDisplayModal');
        var canvas = document.getElementById('qrCanvas');

        var payload = {
            n: charData.name,
            t: charData.type,
            i: charData.img,
            a: charData.audio,
            c: charData.crop || { x: 50, y: 50, scale: 1 }
        };
        var json = JSON.stringify(payload);

        window.QRMaster.generate(canvas, json, { width: 200, height: 200 });
        modal.classList.add('active');
    }

    function startScan() {
        document.getElementById('scannerModal').classList.add('active');

        window.QRMaster.startScanner(
            'reader',
            function (txt) { onScanSuccess(txt); },
            function () { /* ignore frame errors */ },
            { qrbox: { width: 250, height: 250 } }
        );
    }

    function stopScan() {
        window.QRMaster.stopScanner().then(function () {
            document.getElementById('scannerModal').classList.remove('active');
        });
    }

    function onScanSuccess(decodedText) {
        stopScan();

        if (scanMode === 'copy') {
            window.QRMaster.copyToClipboard(decodedText).then(function () {
                alert('Scanned: ' + decodedText + '\n\nCopied to clipboard!');
            })['catch'](function () {
                prompt('Scanned (Copy manually):', decodedText);
            });
            return;
        }

        // IMPORT MODE
        try {
            var payload = JSON.parse(decodedText);
            var charData = {
                name: payload.n || 'Unknown',
                type: payload.t || 'beats',
                img: payload.i,
                audio: payload.a,
                crop: payload.c
            };

            if (!charData.img || !charData.audio) throw new Error('Invalid QR Data');

            window.CustomSprunkiManager.saveCharacter({
                name: charData.name,
                type: charData.type,
                img: charData.img,
                audio: charData.audio,
                crop: charData.crop,
                id: 'custom_' + Date.now(),
                pack_id: 'custom',
                custom: true
            });

            alert('Imported "' + charData.name + '" successfully! Reloading...');
            location.reload();

        } catch (e) {
            alert('Failed to parse Sprunki data.\n\nDid you mean to use "Scan Text" mode?');
            console.error(e);
        }
    }

    // Initialize
    injectHTML();
    bindEvents();

    return {
        generateQR: generateQR,
        startScan: startScan,
        stopScan: stopScan
    };
})();

window.SprunkiQR = SprunkiQR;
