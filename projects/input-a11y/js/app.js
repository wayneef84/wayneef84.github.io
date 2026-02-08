document.addEventListener('DOMContentLoaded', function() {
    var storage = new StorageManager();
    var generator = new GeneratorManager();
    var scanner = null;
    var ocrManager = null;

    // --- State ---
    var currentTab = 'scan';
    var lastResult = null;
    var lastSnapshotImage = '';
    var settings = storage.getSettings();
    var userHasInteracted = false;

    // --- Elements ---
    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabs = document.querySelectorAll('.tab-content');
    var scanModeSelect = document.getElementById('scanMode');
    var driverRow = document.getElementById('driver-row');
    var ocrDriverSelect = document.getElementById('ocrDriver');
    var snapshotRow = document.getElementById('snapshot-row');
    var btnSnapshot = document.getElementById('btn-snapshot');

    // Settings Elements (now in Settings tab)
    var setAction = document.getElementById('set-action');
    var setBaseUrl = document.getElementById('set-base-url');
    var urlConfig = document.getElementById('url-config');
    var setVibrate = document.getElementById('set-vibrate');
    var setFrame = document.getElementById('set-frame');
    var setFlash = document.getElementById('set-flash');

    // OCR Filter Settings
    var setConfirmPopup = document.getElementById('set-confirm-popup');
    var setFilterMode = document.getElementById('set-filter-mode');
    var filterValueRow = document.getElementById('filter-value-row');
    var filterValueLabel = document.getElementById('filter-value-label');
    var setFilterValue = document.getElementById('set-filter-value');
    var filterHint = document.getElementById('filter-hint');

    // OCR Tuning
    var setOcrConfidence = document.getElementById('set-ocr-confidence');
    var ocrConfidenceVal = document.getElementById('ocr-confidence-val');
    var setOcrDebounce = document.getElementById('set-ocr-debounce');
    var ocrDebounceVal = document.getElementById('ocr-debounce-val');
    var setOcrMinLength = document.getElementById('set-ocr-minlength');
    var ocrMinLengthVal = document.getElementById('ocr-minlength-val');

    // Barcode Settings
    var setBarcodeFps = document.getElementById('set-barcode-fps');
    var barcodeFpsVal = document.getElementById('barcode-fps-val');
    var setBarcodeBoxW = document.getElementById('set-barcode-box-w');
    var barcodeBoxWVal = document.getElementById('barcode-box-w-val');
    var setBarcodeBoxH = document.getElementById('set-barcode-box-h');
    var barcodeBoxHVal = document.getElementById('barcode-box-h-val');

    // --- Init ---
    init();

    function init() {
        // Restore Settings
        if (settings.detectMode) scanModeSelect.value = settings.detectMode;
        if (settings.actionMode) setAction.value = settings.actionMode;
        if (settings.baseUrl) setBaseUrl.value = settings.baseUrl;
        if (settings.feedbackVibrate !== undefined) setVibrate.checked = settings.feedbackVibrate;
        if (settings.feedbackFrame) setFrame.value = settings.feedbackFrame;
        if (settings.feedbackFlash) setFlash.value = settings.feedbackFlash;

        // Restore OCR filter settings
        if (setConfirmPopup && settings.ocrConfirmPopup !== undefined) {
            setConfirmPopup.checked = settings.ocrConfirmPopup;
        }
        if (setFilterMode && settings.ocrFilterMode) {
            setFilterMode.value = settings.ocrFilterMode;
        }
        if (setFilterValue && settings.ocrFilterValue) {
            setFilterValue.value = settings.ocrFilterValue;
        }

        // Restore OCR tuning
        if (setOcrConfidence) {
            setOcrConfidence.value = settings.ocrConfidence || 40;
            if (ocrConfidenceVal) ocrConfidenceVal.innerText = setOcrConfidence.value;
        }
        if (setOcrDebounce) {
            setOcrDebounce.value = settings.ocrDebounce || 3000;
            if (ocrDebounceVal) ocrDebounceVal.innerText = setOcrDebounce.value;
        }
        if (setOcrMinLength) {
            setOcrMinLength.value = settings.ocrMinLength || 3;
            if (ocrMinLengthVal) ocrMinLengthVal.innerText = setOcrMinLength.value;
        }

        // Restore barcode settings
        if (setBarcodeFps) {
            setBarcodeFps.value = settings.barcodeFps || 10;
            if (barcodeFpsVal) barcodeFpsVal.innerText = setBarcodeFps.value;
        }
        if (setBarcodeBoxW) {
            setBarcodeBoxW.value = settings.barcodeBoxWidth || 250;
            if (barcodeBoxWVal) barcodeBoxWVal.innerText = setBarcodeBoxW.value;
        }
        if (setBarcodeBoxH) {
            setBarcodeBoxH.value = settings.barcodeBoxHeight || 250;
            if (barcodeBoxHVal) barcodeBoxHVal.innerText = setBarcodeBoxH.value;
        }

        updateActionUI();
        updateFilterUI();

        // Initialize Barcode Scanner
        scanner = new ScannerManager('reader', {
            onSuccess: onScanSuccess,
            onInitError: function(err) {
                document.getElementById('scan-status').innerText = 'Camera Error: ' + err;
            }
        });
        applyBarcodeConfig();

        // Initialize OCR Manager
        if (typeof OCRManager !== 'undefined') {
            ocrManager = new OCRManager('reader', {
                onSuccess: onScanSuccess,
                onInitError: function(err) {
                    document.getElementById('scan-status').innerText = 'OCR Error: ' + err;
                },
                onDriverReady: function(driver) {
                    var label = driver === OCRManager.DRIVER_NATIVE
                        ? 'Native TextDetector'
                        : 'Tesseract.js';
                    document.getElementById('scan-status').innerText = 'Text Scanner Active (' + label + '). Point at text.';
                }
            });
            applyOCRFilterConfig();
            populateDriverSelector();
        }

        // Restore driver preference
        if (settings.ocrDriver && ocrDriverSelect) {
            ocrDriverSelect.value = settings.ocrDriver;
        }

        updateDriverRowVisibility();
        renderHistory();
        bindEvents();

        if (currentTab === 'scan') {
            showStartButton();
        }
    }

    function applyOCRFilterConfig() {
        if (!ocrManager) return;
        ocrManager.configure({
            filterMode: settings.ocrFilterMode || 'NONE',
            filterValue: settings.ocrFilterValue || '',
            confirmPopup: settings.ocrConfirmPopup !== undefined ? settings.ocrConfirmPopup : true,
            confidenceThreshold: parseInt(settings.ocrConfidence, 10) || 40,
            debounceMs: parseInt(settings.ocrDebounce, 10) || 3000,
            minTextLength: parseInt(settings.ocrMinLength, 10) || 3
        });
    }

    function applyBarcodeConfig() {
        if (!scanner) return;
        scanner.configure({
            fps: parseInt(settings.barcodeFps, 10) || 10,
            qrboxWidth: parseInt(settings.barcodeBoxWidth, 10) || 250,
            qrboxHeight: parseInt(settings.barcodeBoxHeight, 10) || 250
        });
    }

    function showStartButton() {
        var statusEl = document.getElementById('scan-status');
        statusEl.innerText = 'Tap the button below to start scanning.';

        var container = document.getElementById('reader-container');
        if (document.getElementById('btn-start-scan')) return;

        var btn = document.createElement('button');
        btn.id = 'btn-start-scan';
        btn.className = 'start-scan-btn';
        btn.innerText = 'Start Scanner';
        btn.addEventListener('click', function() {
            userHasInteracted = true;
            btn.remove();
            startScanner();
        });
        container.parentNode.insertBefore(btn, container.nextSibling);
    }

    function removeStartButton() {
        var btn = document.getElementById('btn-start-scan');
        if (btn) btn.remove();
    }

    function populateDriverSelector() {
        if (!ocrManager || !ocrDriverSelect) return;

        var drivers = ocrManager.getAvailableDrivers();
        ocrDriverSelect.innerHTML = '';

        for (var i = 0; i < drivers.length; i++) {
            var opt = document.createElement('option');
            opt.value = drivers[i].id;
            opt.textContent = drivers[i].label;
            if (!drivers[i].available) {
                opt.disabled = true;
                opt.textContent += ' (Not Available)';
            }
            ocrDriverSelect.appendChild(opt);
        }

        if (settings.ocrDriver) {
            ocrDriverSelect.value = settings.ocrDriver;
        } else {
            var hasNative = false;
            for (var j = 0; j < drivers.length; j++) {
                if (drivers[j].id === 'native' && drivers[j].available) {
                    hasNative = true;
                    break;
                }
            }
            ocrDriverSelect.value = hasNative ? 'native' : 'tesseract';
        }
    }

    function updateDriverRowVisibility() {
        var isOCR = scanModeSelect.value === 'TEXT_OCR';
        if (driverRow) {
            if (isOCR) { driverRow.classList.remove('hidden'); }
            else { driverRow.classList.add('hidden'); }
        }
        if (snapshotRow) {
            if (isOCR && userHasInteracted) { snapshotRow.classList.remove('hidden'); }
            else { snapshotRow.classList.add('hidden'); }
        }
    }

    function updateFilterUI() {
        if (!setFilterMode) return;

        var mode = setFilterMode.value;
        var showValue = (mode !== 'NONE');

        if (filterValueRow) {
            if (showValue) { filterValueRow.classList.remove('hidden'); }
            else { filterValueRow.classList.add('hidden'); }
        }

        if (filterValueLabel && setFilterValue) {
            if (mode === 'MIN_CHARS') {
                filterValueLabel.innerText = 'Min Chars:';
                setFilterValue.placeholder = 'e.g. 5';
                setFilterValue.type = 'number';
            } else if (mode === 'REGEX') {
                filterValueLabel.innerText = 'Pattern:';
                setFilterValue.placeholder = 'e.g. ^[A-Z]{3}\\d+';
                setFilterValue.type = 'text';
            } else if (mode === 'FORMAT') {
                filterValueLabel.innerText = 'Format:';
                setFilterValue.placeholder = 'e.g. ANNNAAA';
                setFilterValue.type = 'text';
            } else {
                setFilterValue.type = 'text';
                setFilterValue.placeholder = '';
            }
        }

        if (filterHint) {
            if (mode === 'FORMAT') {
                filterHint.innerText = 'A = letter, N = number. e.g. ANNNAAA matches B123XYZ';
                filterHint.classList.remove('hidden');
            } else if (mode === 'REGEX') {
                filterHint.innerText = 'JavaScript regex pattern to match against detected text';
                filterHint.classList.remove('hidden');
            } else if (mode === 'MIN_CHARS') {
                filterHint.innerText = 'Only accept text with at least this many characters';
                filterHint.classList.remove('hidden');
            } else {
                filterHint.classList.add('hidden');
            }
        }
    }

    function bindEvents() {
        // Tabs
        for (var i = 0; i < tabBtns.length; i++) {
            tabBtns[i].addEventListener('click', function() {
                switchTab(this.dataset.tab);
            });
        }

        // Scan Mode
        scanModeSelect.addEventListener('change', function(e) {
            settings.detectMode = e.target.value;
            storage.saveSettings(settings);
            updateDriverRowVisibility();
            if (currentTab === 'scan' && userHasInteracted) {
                startScanner();
            }
        });

        // OCR Driver selector
        if (ocrDriverSelect) {
            ocrDriverSelect.addEventListener('change', function(e) {
                settings.ocrDriver = e.target.value;
                storage.saveSettings(settings);
                if (currentTab === 'scan' && scanModeSelect.value === 'TEXT_OCR' && userHasInteracted) {
                    startScanner();
                }
            });
        }

        // Action Settings
        setAction.addEventListener('change', function(e) {
            settings.actionMode = e.target.value;
            storage.saveSettings(settings);
            updateActionUI();
        });

        setBaseUrl.addEventListener('input', function(e) {
            settings.baseUrl = e.target.value;
            storage.saveSettings(settings);
        });

        // Feedback Settings
        setVibrate.addEventListener('change', function(e) {
            settings.feedbackVibrate = e.target.checked;
            storage.saveSettings(settings);
        });
        setFrame.addEventListener('change', function(e) {
            settings.feedbackFrame = e.target.value;
            storage.saveSettings(settings);
        });
        setFlash.addEventListener('change', function(e) {
            settings.feedbackFlash = e.target.value;
            storage.saveSettings(settings);
        });

        // OCR Filter Settings
        if (setConfirmPopup) {
            setConfirmPopup.addEventListener('change', function(e) {
                settings.ocrConfirmPopup = e.target.checked;
                storage.saveSettings(settings);
                applyOCRFilterConfig();
            });
        }
        if (setFilterMode) {
            setFilterMode.addEventListener('change', function(e) {
                settings.ocrFilterMode = e.target.value;
                storage.saveSettings(settings);
                updateFilterUI();
                applyOCRFilterConfig();
            });
        }
        if (setFilterValue) {
            setFilterValue.addEventListener('input', function(e) {
                settings.ocrFilterValue = e.target.value;
                storage.saveSettings(settings);
                applyOCRFilterConfig();
            });
        }

        // OCR Tuning Sliders
        bindRangeSlider(setOcrConfidence, ocrConfidenceVal, 'ocrConfidence', applyOCRFilterConfig);
        bindRangeSlider(setOcrDebounce, ocrDebounceVal, 'ocrDebounce', applyOCRFilterConfig);
        bindRangeSlider(setOcrMinLength, ocrMinLengthVal, 'ocrMinLength', applyOCRFilterConfig);

        // Barcode Tuning Sliders
        bindRangeSlider(setBarcodeFps, barcodeFpsVal, 'barcodeFps', applyBarcodeConfig);
        bindRangeSlider(setBarcodeBoxW, barcodeBoxWVal, 'barcodeBoxWidth', applyBarcodeConfig);
        bindRangeSlider(setBarcodeBoxH, barcodeBoxHVal, 'barcodeBoxHeight', applyBarcodeConfig);

        // Snapshot Button
        if (btnSnapshot) {
            btnSnapshot.addEventListener('click', function() {
                if (!ocrManager) return;
                btnSnapshot.disabled = true;
                btnSnapshot.innerText = 'Scanning...';
                document.getElementById('scan-status').innerText = 'Capturing snapshot...';

                ocrManager.snapshot().then(function(result) {
                    btnSnapshot.disabled = false;
                    btnSnapshot.innerText = 'Snapshot';

                    var text = (result && result.text) ? result.text : '';
                    var imageDataUri = (result && result.imageDataUri) ? result.imageDataUri : '';

                    // Always save snapshot to history (with image), regardless of text
                    storage.addItem('SCANNED', {
                        content: text || '(no text detected)',
                        format: 'SNAPSHOT',
                        mode: 'TEXT_OCR',
                        image: imageDataUri
                    });
                    renderHistory();

                    if (!text || text.length < 2) {
                        document.getElementById('scan-status').innerText = 'Snapshot saved to history. No text detected.';
                        ocrManager.isScanning = true;
                        ocrManager._detectLoop();
                    } else {
                        document.getElementById('scan-status').innerText = 'Snapshot saved. Text: ' + text.substring(0, 40);
                    }
                }).catch(function() {
                    btnSnapshot.disabled = false;
                    btnSnapshot.innerText = 'Snapshot';
                    document.getElementById('scan-status').innerText = 'Snapshot failed. Try again.';
                });
            });
        }

        // Scan Result Actions
        document.getElementById('btn-copy').addEventListener('click', copyResult);
        document.getElementById('btn-rescan').addEventListener('click', closeResultModal);
        document.querySelector('.close-modal').addEventListener('click', closeResultModal);
        document.getElementById('btn-save-scan').addEventListener('click', saveCurrentScan);

        // Generate Actions
        document.getElementById('btn-generate').addEventListener('click', generateQR);
        document.getElementById('btn-download').addEventListener('click', function() {
            generator.download('qr-output', 'input_a11y_qr.png');
        });

        // History Actions
        document.getElementById('clear-created').addEventListener('click', function() {
            storage.clearHistory('CREATED');
            renderHistory();
        });
        document.getElementById('clear-scanned').addEventListener('click', function() {
            storage.clearHistory('SCANNED');
            renderHistory();
        });
    }

    function bindRangeSlider(inputEl, displayEl, settingsKey, applyFn) {
        if (!inputEl) return;
        inputEl.addEventListener('input', function(e) {
            settings[settingsKey] = parseInt(e.target.value, 10);
            if (displayEl) displayEl.innerText = e.target.value;
            storage.saveSettings(settings);
            if (applyFn) applyFn();
        });
    }

    function switchTab(tabId) {
        currentTab = tabId;

        for (var i = 0; i < tabBtns.length; i++) {
            if (tabBtns[i].dataset.tab === tabId) {
                tabBtns[i].classList.add('active');
            } else {
                tabBtns[i].classList.remove('active');
            }
        }
        for (var j = 0; j < tabs.length; j++) {
            if (tabs[j].id === tabId) {
                tabs[j].classList.add('active');
            } else {
                tabs[j].classList.remove('active');
            }
        }

        if (tabId === 'scan') {
            if (userHasInteracted) {
                startScanner();
            } else {
                showStartButton();
            }
        } else {
            stopAll();
        }

        // Re-render history when switching to history tab
        if (tabId === 'history') {
            renderHistory();
        }
    }

    function stopAll() {
        if (scanner) scanner.stop();
        if (ocrManager) ocrManager.stop();
    }

    function startScanner() {
        stopAll();
        removeStartButton();

        var mode = scanModeSelect.value;
        var statusEl = document.getElementById('scan-status');

        if (mode === 'TEXT_OCR') {
            statusEl.innerText = 'Starting Text Scanner...';
            if (!ocrManager) {
                statusEl.innerText = 'OCR not available. OCRManager not loaded.';
                return;
            }
            if (!ocrManager.isSupported()) {
                statusEl.innerText = 'No OCR engine available.';
                return;
            }
            if (snapshotRow) snapshotRow.classList.remove('hidden');

            var preferredDriver = ocrDriverSelect ? ocrDriverSelect.value : '';
            ocrManager.start('TEXT_OCR', preferredDriver).catch(function(err) {
                statusEl.innerText = 'Text Scanner Failed: ' + err;
            });
            return;
        }

        // Barcode scanning
        if (!scanner) return;
        statusEl.innerText = 'Starting ' + mode + '...';

        scanner.start(mode).then(function() {
            statusEl.innerText = 'Scanning (' + mode + ')...';
        }).catch(function(err) {
            statusEl.innerText = 'Error: ' + err;
        });
    }

    function onScanSuccess(text, result, mode) {
        triggerFeedback();

        var formatName = 'Unknown';
        if (result && result.result && result.result.format && result.result.format.formatName) {
            formatName = result.result.format.formatName;
        }

        var imageDataUri = (result && result.imageDataUri) ? result.imageDataUri : '';
        lastResult = { text: text, format: formatName, mode: mode, image: imageDataUri };
        lastSnapshotImage = imageDataUri;

        // URL Input mode
        if (settings.actionMode === 'URL_INPUT' || settings.actionMode === 'URL_LOOKUP') {
            stopAll();
            handleUrlInput(text);
            return;
        }

        // OCR mode: check confirm popup
        if (mode === 'TEXT_OCR' || mode === 'OCR') {
            if (!settings.ocrConfirmPopup) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(function() { showToast('Copied: ' + text.substring(0, 30)); })
                        .catch(function() { showToast('Text detected'); });
                } else {
                    showToast('Text detected');
                }
                storage.addItem('SCANNED', {
                    content: text,
                    format: formatName,
                    mode: mode,
                    image: imageDataUri
                });
                return;
            }
        }

        // Show Modal
        stopAll();
        var modal = document.getElementById('scan-result');
        document.getElementById('result-type').innerText = 'Type: ' + formatName;
        document.getElementById('result-text').value = text;

        // Show snapshot image in modal if available
        var resultImg = document.getElementById('result-image');
        if (resultImg) {
            if (imageDataUri) {
                resultImg.src = imageDataUri;
                resultImg.classList.remove('hidden');
            } else {
                resultImg.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');

        if (mode === 'TEXT_OCR' || mode === 'OCR') {
            copyResult(true);
        }
    }

    function handleUrlInput(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(function() { showToast('Copied!'); })
                .catch(function() { showToast('Scan complete'); });
        }

        var baseUrl = settings.baseUrl || 'https://www.google.com/search?q=';
        if (!/^https?:\/\//i.test(baseUrl)) {
            baseUrl = 'https://' + baseUrl;
        }

        var url = baseUrl + encodeURIComponent(text);
        window.open(url, '_blank');
        startScanner();
    }

    function showToast(message) {
        var toast = document.getElementById('toast-msg');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-msg';
            toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
                'background:rgba(0,0,0,0.85);color:white;padding:10px 20px;border-radius:20px;' +
                'z-index:1000;transition:opacity 0.3s;font-size:0.9rem;';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.opacity = '1';
        setTimeout(function() {
            toast.style.opacity = '0';
        }, 2000);
    }

    function updateActionUI() {
        if (setAction.value === 'URL_INPUT' || setAction.value === 'URL_LOOKUP') {
            urlConfig.classList.remove('hidden');
        } else {
            urlConfig.classList.add('hidden');
        }
    }

    function triggerFeedback() {
        if (settings.feedbackVibrate && navigator.vibrate) {
            navigator.vibrate(200);
        }

        var DURATION = 300;

        if (settings.feedbackFrame !== 'OFF') {
            var frameEl = settings.feedbackFrame === 'SCREEN' ? document.body : document.getElementById('reader');
            var frameCls = settings.feedbackFrame === 'SCREEN' ? 'feedback-frame-screen' : 'feedback-frame-scanner';
            if (frameEl) {
                frameEl.classList.add(frameCls);
                setTimeout(function() { frameEl.classList.remove(frameCls); }, DURATION);
            }
        }

        if (settings.feedbackFlash !== 'OFF') {
            var flashEl = settings.feedbackFlash === 'SCREEN' ? document.body : document.getElementById('reader');
            var flashCls = settings.feedbackFlash === 'SCREEN' ? 'feedback-flash-screen' : 'feedback-flash-scanner';
            if (flashEl) {
                flashEl.classList.add(flashCls);
                setTimeout(function() { flashEl.classList.remove(flashCls); }, DURATION);
            }
        }
    }

    function closeResultModal() {
        document.getElementById('scan-result').classList.add('hidden');
        startScanner();
    }

    function copyResult(silent) {
        var textEl = document.getElementById('result-text');
        textEl.select();
        document.execCommand('copy');
        if (!silent) {
            var btn = document.getElementById('btn-copy');
            var originalText = btn.innerText;
            btn.innerText = 'Copied!';
            setTimeout(function() { btn.innerText = originalText; }, 1000);
        }
    }

    function saveCurrentScan() {
        if (!lastResult) return;
        storage.addItem('SCANNED', {
            content: lastResult.text,
            format: lastResult.format,
            mode: lastResult.mode,
            image: lastResult.image || ''
        });
        var btn = document.getElementById('btn-save-scan');
        btn.innerText = 'Saved!';
        setTimeout(function() { btn.innerText = 'Save to History'; }, 1500);
        renderHistory();
    }

    function generateQR() {
        var text = document.getElementById('gen-text').value;
        if (!text) return alert('Please enter text');

        storage.addItem('CREATED', {
            content: text,
            format: 'QR_CODE'
        });
        renderHistory();
        alert('Content saved to History (Visual QR generation is disabled).');
    }

    function renderHistory() {
        var created = storage.getHistory('CREATED');
        var scanned = storage.getHistory('SCANNED');

        renderList(scanned, 'history-scanned');
        renderList(created, 'history-created');
    }

    function renderList(list, elementId) {
        var ul = document.getElementById(elementId);
        ul.innerHTML = '';
        if (list.length === 0) {
            ul.innerHTML = '<li class="empty">No items yet</li>';
            return;
        }
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var li = document.createElement('li');
            var time = new Date(item.timestamp).toLocaleString();

            var thumbHtml = '';
            if (item.image) {
                thumbHtml = '<img class="hist-thumb" src="' + item.image + '" alt="Snapshot">';
            }

            li.innerHTML =
                '<div class="hist-row">' +
                thumbHtml +
                '<div class="hist-info">' +
                '<div class="hist-content">' + escapeHtml(item.content) + '</div>' +
                '<div class="hist-meta">' +
                '<span>' + (item.format || 'QR') + '</span>' +
                '<span>' + time + '</span>' +
                '</div>' +
                '</div>' +
                '</div>';
            li.setAttribute('data-content', item.content);
            li.title = 'Click to copy';
            li.addEventListener('click', function() {
                var content = this.getAttribute('data-content');
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(content).then(function() {
                        showToast('Copied!');
                    });
                }
            });
            ul.appendChild(li);
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
