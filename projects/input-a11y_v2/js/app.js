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
    var tempSettings = null; // Transactional settings object
    var userHasInteracted = false;

    // --- Elements ---
    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabs = document.querySelectorAll('.tab-content');
    var videoSourceSelect = document.getElementById('videoSource');
    var scanModeSelect = document.getElementById('scanMode');
    var driverRow = document.getElementById('driver-row');
    var ocrDriverSelect = document.getElementById('ocrDriver');
    var snapshotRow = document.getElementById('snapshot-row');
    var btnScreenshot = document.getElementById('btn-screenshot');
    var btnScanVerify = document.getElementById('btn-scan-verify');

    // Detection Overlay Elements
    var detectionOverlay = document.getElementById('detection-overlay');
    var detectionBox = document.getElementById('detection-box');
    var detectionValue = document.getElementById('detection-value');

    // Character Count Indicator
    var charCountIndicator = document.getElementById('char-count-indicator');

    // Scan Settings Panel Elements
    var scanSettingsToggle = document.getElementById('scan-settings-toggle');
    var scanSettingsPanel = document.getElementById('scan-settings-panel');
    var settingsChevron = document.getElementById('settings-chevron');
    var scanTextTransform = document.getElementById('scan-text-transform');
    var scanCharMode = document.getElementById('scan-char-mode');
    var scanCharCount = document.getElementById('scan-char-count');
    var textTransformRow = document.getElementById('text-transform-row');
    var charCountRow = document.getElementById('char-count-row');

    // Settings Elements (now in Settings tab)
    var setAction = document.getElementById('set-action');
    // Verify Modal Elements
    var verifyModal = document.getElementById('verify-modal');
    var candidateList = document.getElementById('candidate-list');
    var btnVerifyCancel = document.getElementById('btn-verify-cancel');
    var closeVerify = document.querySelector('.close-verify');

    var setBaseUrl = document.getElementById('set-base-url');
    var urlConfig = document.getElementById('url-config');
    var setAddValueToUrl = document.getElementById('set-add-value-to-url');
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
    var setOcrPreprocess = document.getElementById('set-ocr-preprocess');
    var setOcrShowRaw = document.getElementById('set-ocr-show-raw');
    var setOcrScanLine = document.getElementById('set-ocr-scan-line');
    var setOcrShowResize = document.getElementById('set-ocr-show-resize');
    var setTextTransform = document.getElementById('set-text-transform');

    // OCR Resize Controls (Scan Tab)
    var btnScanResize = document.getElementById('btn-scan-resize');
    var scanResizeOverlay = document.getElementById('scan-resize-overlay');
    var scanRoiWSlider = document.getElementById('scan-roi-w-slider');
    var scanRoiHSlider = document.getElementById('scan-roi-h-slider');

    // OCR Scan Region (ROI) - Auto-centered, user adjusts size only
    var setOcrRoiEnabled = document.getElementById('set-ocr-roi-enabled');
    var roiSettingsGroup = document.getElementById('roi-settings-group');
    var setOcrRoiWidth = document.getElementById('set-ocr-roi-width');
    var setOcrRoiHeight = document.getElementById('set-ocr-roi-height');
    var roiWidthVal = document.getElementById('ocr-roi-width-val');
    var roiHeightVal = document.getElementById('ocr-roi-height-val');

    // OCR Tuning
    var setOcrConfidence = document.getElementById('set-ocr-confidence');
    var ocrConfidenceVal = document.getElementById('ocr-confidence-val');
    var setOcrDebounce = document.getElementById('set-ocr-debounce');
    var ocrDebounceVal = document.getElementById('ocr-debounce-val');

    // Character count controls in Settings tab
    var setCharMode = document.getElementById('set-char-mode');
    var setCharCount = document.getElementById('set-char-count');

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
        // Populate video sources
        populateVideoSources();
        if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange !== undefined) {
            navigator.mediaDevices.ondevicechange = populateVideoSources;
        }

        // Restore Settings
        if (settings.detectMode) scanModeSelect.value = settings.detectMode;
        if (settings.actionMode) setAction.value = settings.actionMode;
        if (settings.baseUrl) setBaseUrl.value = settings.baseUrl;
        if (setAddValueToUrl && settings.addValueToUrl !== undefined) setAddValueToUrl.checked = settings.addValueToUrl;
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
        if (setOcrPreprocess && settings.ocrPreprocessingMode) {
            setOcrPreprocess.value = settings.ocrPreprocessingMode;
        }
        if (setOcrShowRaw && settings.ocrShowRaw !== undefined) {
            setOcrShowRaw.checked = settings.ocrShowRaw;
        }
        if (setOcrScanLine && settings.ocrScanLine !== undefined) {
            setOcrScanLine.checked = settings.ocrScanLine;
        }
        if (setOcrShowResize && settings.ocrShowResize !== undefined) {
            setOcrShowResize.checked = settings.ocrShowResize;
        }
        if (setTextTransform && settings.ocrTextTransform) {
            setTextTransform.value = settings.ocrTextTransform;
        }

        // Restore OCR ROI settings (auto-centered, size only)
        if (setOcrRoiEnabled) {
            if (settings.ocrRoiEnabled !== undefined) {
                setOcrRoiEnabled.checked = settings.ocrRoiEnabled;
            } else {
                setOcrRoiEnabled.checked = true;
                settings.ocrRoiEnabled = true;
            }
        }
        var currentW = settings.ocrRoiWidth || 70; // Default 70%
        var currentH = settings.ocrRoiHeight || 10; // Default 10%

        if (setOcrRoiWidth) setOcrRoiWidth.value = currentW;
        if (setOcrRoiHeight) setOcrRoiHeight.value = currentH;
        if (roiWidthVal) roiWidthVal.innerText = currentW;
        if (roiHeightVal) roiHeightVal.innerText = currentH;

        // Sync scan sliders
        if (scanRoiWSlider) scanRoiWSlider.value = currentW;
        if (scanRoiHSlider) scanRoiHSlider.value = currentH;

        updateRoiUI();
        updateResizeControlsVisibility();

        // Restore character count mode (stored as min length for now)
        var charMode = 'OFF';
        if (settings.ocrMinLength && settings.ocrMinLength > 0) {
            charMode = 'MIN'; // Default to MIN for backward compatibility
        }
        if (settings.ocrCharMode) charMode = settings.ocrCharMode;
        var charCountValue = settings.ocrMinLength || 4;

        // Sync scan tab
        if (scanCharMode) scanCharMode.value = charMode;
        if (scanCharCount) {
            scanCharCount.value = charCountValue;
            scanCharCount.disabled = (charMode === 'OFF');
        }

        // Sync settings tab
        if (setCharMode) setCharMode.value = charMode;
        if (setCharCount) {
            setCharCount.value = charCountValue;
            setCharCount.disabled = (charMode === 'OFF');
        }

        // Restore text transform in scan tab
        if (scanTextTransform && settings.ocrTextTransform) {
            scanTextTransform.value = settings.ocrTextTransform;
        }

        // Toggle visibility based on scan mode
        updateScanSettingsVisibility();

        // Restore OCR tuning
        if (setOcrConfidence) {
            setOcrConfidence.value = settings.ocrConfidence || 40;
            if (ocrConfidenceVal) ocrConfidenceVal.innerText = setOcrConfidence.value;
        }
        if (setOcrDebounce) {
            setOcrDebounce.value = settings.ocrDebounce || 3000;
            if (ocrDebounceVal) ocrDebounceVal.innerText = setOcrDebounce.value;
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

        // Initialize Settings Transaction State
        initSettingsTransaction();

        if (currentTab === 'scan') {
            showStartButton();
        }
    }

    function initSettingsTransaction() {
        tempSettings = JSON.parse(JSON.stringify(settings));
    }

    function buildRoiConfig() {
        var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
        var enabled = (s.ocrRoiEnabled !== undefined) ? s.ocrRoiEnabled : true;
        var w = parseInt(s.ocrRoiWidth, 10) || 70;
        var h = parseInt(s.ocrRoiHeight, 10) || 10;
        // Auto-center: derive top/left from width/height
        var left = Math.max(0, Math.round((100 - w) / 2));
        var top = Math.max(0, Math.round((100 - h) / 2));
        return { enabled: enabled, top: top, left: left, width: w, height: h };
    }

    function applyOCRFilterConfig() {
        if (!ocrManager) return;
        var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
        var roiConfig = buildRoiConfig();

        var minLength = (s.ocrMinLength !== undefined) ? parseInt(s.ocrMinLength, 10) : 0;
        var charMode = s.ocrCharMode || 'OFF';

        ocrManager.configure({
            filterMode: s.ocrFilterMode || 'NONE',
            filterValue: s.ocrFilterValue || '',
            confirmPopup: s.ocrConfirmPopup !== undefined ? s.ocrConfirmPopup : true,
            confidenceThreshold: parseInt(s.ocrConfidence, 10) || 40,
            debounceMs: parseInt(s.ocrDebounce, 10) || 3000,
            minTextLength: minLength,
            charMode: charMode,
            preprocessingMode: s.ocrPreprocessingMode || 'TRIM',
            textTransform: s.ocrTextTransform || 'NONE',
            roi: roiConfig
        });

        updateRoiOverlay(roiConfig);
        updateScanLineVisibility();
    }

    function updateScanSettingsVisibility() {
        var isOCR = scanModeSelect.value === 'TEXT_OCR' || scanModeSelect.value === 'AUTO';

        if (textTransformRow) {
            textTransformRow.classList.toggle('hidden', !isOCR);
        }
        if (charCountRow) {
            charCountRow.classList.toggle('hidden', !isOCR);
        }

        updateCharCountIndicator();
    }

    function updateCharCountIndicator() {
        if (!charCountIndicator) return;

        var isOCR = scanModeSelect.value === 'TEXT_OCR' || scanModeSelect.value === 'AUTO';
        var mode = settings.ocrCharMode || 'OFF';
        var count = settings.ocrMinLength || 0;

        if (!isOCR || mode === 'OFF') {
            charCountIndicator.classList.add('hidden');
            return;
        }

        var label = '';
        if (mode === 'MIN') label = 'Min: ' + count;
        else if (mode === 'MAX') label = 'Max: ' + count;
        else if (mode === 'REQ') label = 'Req: ' + count;

        charCountIndicator.innerText = label;
        charCountIndicator.classList.remove('hidden');
    }

    function toggleScanSettings() {
        if (!scanSettingsPanel || !settingsChevron) return;

        if (scanSettingsPanel.classList.contains('hidden')) {
            scanSettingsPanel.classList.remove('hidden');
            settingsChevron.classList.add('rotated');
        } else {
            scanSettingsPanel.classList.add('hidden');
            settingsChevron.classList.remove('rotated');
        }
    }

    function updateResizeControlsVisibility() {
        if (!btnScanResize) return;
        var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
        var show = (s.ocrShowResize !== undefined) ? s.ocrShowResize : true;

        if (show) {
            btnScanResize.classList.remove('hidden');
        } else {
            btnScanResize.classList.add('hidden');
            if (scanResizeOverlay) scanResizeOverlay.classList.add('hidden');
        }
    }

    function updateRoiUI() {
        if (!roiSettingsGroup) return;
        var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
        if (s.ocrRoiEnabled) {
            roiSettingsGroup.classList.remove('hidden');
        } else {
            roiSettingsGroup.classList.add('hidden');
        }
    }

    function updateRoiOverlay(roi) {
        var overlay = document.getElementById('scan-roi-overlay');
        var scanLine = document.getElementById('scan-line');

        var isOCR = (scanModeSelect.value === 'TEXT_OCR' || scanModeSelect.value === 'AUTO');
        if (roi.enabled && isOCR) {
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.style.top = roi.top + '%';
                overlay.style.left = roi.left + '%';
                overlay.style.width = roi.width + '%';
                overlay.style.height = roi.height + '%';
            }
            // Position scan line at vertical center of ROI
            if (scanLine) {
                scanLine.style.top = (roi.top + roi.height / 2) + '%';
            }
        } else {
            if (overlay) overlay.classList.add('hidden');
            // Fall back to 50% center when ROI is disabled
            if (scanLine) scanLine.style.top = '50%';
        }
    }

    function updateScanLineVisibility() {
        var scanLine = document.getElementById('scan-line');
        if (!scanLine) return;

        var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
        var showLine = (s.ocrScanLine !== undefined) ? s.ocrScanLine : true;

        var isOCR = (scanModeSelect.value === 'TEXT_OCR' || scanModeSelect.value === 'AUTO');
        if (isOCR && showLine) {
            scanLine.style.display = 'block';
        } else {
            scanLine.style.display = 'none';
        }
    }

    function applyBarcodeConfig() {
        if (!scanner) return;
        var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
        scanner.configure({
            fps: parseInt(s.barcodeFps, 10) || 10,
            qrboxWidth: parseInt(s.barcodeBoxWidth, 10) || 250,
            qrboxHeight: parseInt(s.barcodeBoxHeight, 10) || 250
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

    function populateVideoSources() {
        if (!videoSourceSelect) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.warn('enumerateDevices not supported');
            return;
        }

        navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                var videoDevices = devices.filter(function(device) {
                    return device.kind === 'videoinput';
                });

                var currentVal = videoSourceSelect.value || settings.deviceId;
                videoSourceSelect.innerHTML = '';

                // Add "Default / Auto" option
                var defaultOpt = document.createElement('option');
                defaultOpt.value = '';
                defaultOpt.text = 'Auto / Default Camera';
                videoSourceSelect.appendChild(defaultOpt);

                videoDevices.forEach(function(device, index) {
                    var option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || 'Camera ' + (index + 1);
                    videoSourceSelect.appendChild(option);
                });

                if (currentVal) {
                    // Check if device still exists
                    var exists = videoDevices.some(function(d) { return d.deviceId === currentVal; });
                    if (exists) {
                        videoSourceSelect.value = currentVal;
                    } else {
                        videoSourceSelect.value = '';
                        settings.deviceId = ''; // Reset if lost
                    }
                } else {
                    videoSourceSelect.value = '';
                }
            })
            .catch(function(err) {
                console.error(err.name + ": " + err.message);
            });
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
        // Updated to use individual blocks for clearer UI
        if (!setFilterMode) return;
        var mode = setFilterMode.value;

        // Hide legacy rows if present
        if (filterValueRow) filterValueRow.classList.add('hidden');

        // Toggle Blocks
        var blocks = document.querySelectorAll('.filter-block');
        for(var i=0; i<blocks.length; i++) blocks[i].classList.add('hidden');

        var activeInput = null;

        if (mode === 'REGEX') {
            document.getElementById('filter-block-regex').classList.remove('hidden');
            activeInput = document.getElementById('set-filter-regex');
        }

        // Hints & Constraints
        if (filterHint) {
            filterHint.classList.remove('hidden');
            if (mode === 'REGEX') {
                filterHint.innerText = 'JavaScript regex. Default: Alphanumeric, 10 chars.';
                // Enforce Default if empty
                if (activeInput && !activeInput.value) {
                    activeInput.value = '^[a-zA-Z0-9]{10}$';
                    if (tempSettings) tempSettings.ocrFilterValue = activeInput.value;
                    else { settings.ocrFilterValue = activeInput.value; storage.saveSettings(settings); }
                }
            } else {
                filterHint.classList.add('hidden');
            }
        }

        // Bind events for the specific inputs to update the shared setting
        if (activeInput) {
            activeInput.oninput = function(e) {
                var val = e.target.value;
                if (tempSettings) tempSettings.ocrFilterValue = val;
                else { settings.ocrFilterValue = val; storage.saveSettings(settings); }
                applyOCRFilterConfig();
            };
            // Restore current value
            var currentVal = tempSettings ? tempSettings.ocrFilterValue : settings.ocrFilterValue;
            if (currentVal) activeInput.value = currentVal;
        }
    }

    function bindEvents() {
        // Tabs
        for (var i = 0; i < tabBtns.length; i++) {
            tabBtns[i].addEventListener('click', function() {
                switchTab(this.dataset.tab);
            });
        }

        // Settings Buttons
        var btnSave = document.getElementById('btn-settings-save');
        var btnCancel = document.getElementById('btn-settings-cancel');
        var btnDefault = document.getElementById('btn-settings-default');

        if (btnSave) btnSave.addEventListener('click', saveSettings);
        if (btnCancel) btnCancel.addEventListener('click', cancelSettings);
        if (btnDefault) btnDefault.addEventListener('click', defaultSettings);

        // --- DIRECT ACTION INPUTS (Apply immediately in Scan mode, or use temp in Settings) ---
        // Note: Video Source & Scan Mode are top-level controls, not in "Settings" tab usually,
        // but if moved there, they should use temp. Assuming they are in Scan tab:
        if (videoSourceSelect) {
            videoSourceSelect.addEventListener('change', function(e) {
                settings.deviceId = e.target.value;
                storage.saveSettings(settings);
                if (currentTab === 'scan' && userHasInteracted) startScanner();
            });
        }
        scanModeSelect.addEventListener('change', function(e) {
            settings.detectMode = e.target.value;
            storage.saveSettings(settings);
            updateDriverRowVisibility();
            updateScanLineVisibility();
            updateScanSettingsVisibility();
            applyOCRFilterConfig();
            if (currentTab === 'scan' && userHasInteracted) startScanner();
        });

        // Scan settings toggle
        if (scanSettingsToggle) {
            scanSettingsToggle.addEventListener('click', toggleScanSettings);
        }

        // Scan tab: Text transform
        if (scanTextTransform) {
            scanTextTransform.addEventListener('change', function(e) {
                settings.ocrTextTransform = e.target.value;
                storage.saveSettings(settings);
                if (setTextTransform) setTextTransform.value = e.target.value;
                applyOCRFilterConfig();
            });
        }

        // Scan tab: Character count mode
        if (scanCharMode) {
            scanCharMode.addEventListener('change', function(e) {
                var mode = e.target.value;
                settings.ocrCharMode = mode;
                storage.saveSettings(settings);

                // Enable/disable count input
                if (scanCharCount) {
                    scanCharCount.disabled = (mode === 'OFF');
                    if (mode !== 'OFF') {
                        var count = parseInt(scanCharCount.value, 10) || 4;
                        settings.ocrMinLength = count;
                        storage.saveSettings(settings);
                    } else {
                        settings.ocrMinLength = 0;
                        storage.saveSettings(settings);
                    }
                }

                // Sync with Settings tab
                if (setCharMode) setCharMode.value = mode;
                if (setCharCount) {
                    setCharCount.value = settings.ocrMinLength || 4;
                    setCharCount.disabled = (mode === 'OFF');
                }

                updateCharCountIndicator();
                applyOCRFilterConfig();
            });
        }

        // Scan tab: Character count value
        if (scanCharCount) {
            scanCharCount.addEventListener('change', function(e) {
                var count = parseInt(e.target.value, 10);
                if (isNaN(count) || count < 1) count = 1;
                this.value = count;

                settings.ocrMinLength = count;
                storage.saveSettings(settings);

                // Sync with Settings tab
                if (setCharCount) setCharCount.value = count;

                updateCharCountIndicator();
                applyOCRFilterConfig();
            });
        }

        // Settings tab: Character mode
        if (setCharMode) {
            setCharMode.addEventListener('change', function(e) {
                var mode = e.target.value;
                settings.ocrCharMode = mode;
                storage.saveSettings(settings);

                // Enable/disable count input
                if (setCharCount) {
                    setCharCount.disabled = (mode === 'OFF');
                    if (mode !== 'OFF') {
                        var count = parseInt(setCharCount.value, 10) || 4;
                        settings.ocrMinLength = count;
                        storage.saveSettings(settings);
                    } else {
                        settings.ocrMinLength = 0;
                        storage.saveSettings(settings);
                    }
                }

                // Sync with scan tab
                if (scanCharMode) scanCharMode.value = mode;
                if (scanCharCount) {
                    scanCharCount.value = settings.ocrMinLength || 4;
                    scanCharCount.disabled = (mode === 'OFF');
                }

                updateCharCountIndicator();
                applyOCRFilterConfig();
            });
        }

        // Settings tab: Character count value
        if (setCharCount) {
            setCharCount.addEventListener('change', function(e) {
                var count = parseInt(e.target.value, 10);
                if (isNaN(count) || count < 1) count = 1;
                this.value = count;

                settings.ocrMinLength = count;
                storage.saveSettings(settings);

                // Sync with scan tab
                if (scanCharCount) scanCharCount.value = count;

                updateCharCountIndicator();
                applyOCRFilterConfig();
            });
        }
        if (ocrDriverSelect) {
            ocrDriverSelect.addEventListener('change', function(e) {
                settings.ocrDriver = e.target.value;
                storage.saveSettings(settings);
                if (currentTab === 'scan' && scanModeSelect.value === 'TEXT_OCR' && userHasInteracted) startScanner();
            });
        }

        // --- SETTINGS TAB INPUTS (Use tempSettings) ---
        // Helper to update setting
        function updateSetting(key, value) {
            if (currentTab === 'settings' && tempSettings) {
                tempSettings[key] = value;
            } else {
                settings[key] = value;
                storage.saveSettings(settings);
            }
        }

        setAction.addEventListener('change', function(e) { updateSetting('actionMode', e.target.value); updateActionUI(); });
        setBaseUrl.addEventListener('input', function(e) { updateSetting('baseUrl', e.target.value); });
        if (setAddValueToUrl) setAddValueToUrl.addEventListener('change', function(e) { updateSetting('addValueToUrl', e.target.checked); });
        setVibrate.addEventListener('change', function(e) { updateSetting('feedbackVibrate', e.target.checked); });
        setFrame.addEventListener('change', function(e) { updateSetting('feedbackFrame', e.target.value); });
        setFlash.addEventListener('change', function(e) { updateSetting('feedbackFlash', e.target.value); });

        if (setConfirmPopup) setConfirmPopup.addEventListener('change', function(e) {
            updateSetting('ocrConfirmPopup', e.target.checked);
            applyOCRFilterConfig();
        });
        if (setFilterMode) setFilterMode.addEventListener('change', function(e) {
            updateSetting('ocrFilterMode', e.target.value);
            updateFilterUI();
            applyOCRFilterConfig();
        });
        if (setFilterValue) setFilterValue.addEventListener('input', function(e) {
            updateSetting('ocrFilterValue', e.target.value);
            applyOCRFilterConfig();
        });
        if (setOcrPreprocess) setOcrPreprocess.addEventListener('change', function(e) {
            updateSetting('ocrPreprocessingMode', e.target.value);
            applyOCRFilterConfig();
        });
        if (setOcrShowRaw) setOcrShowRaw.addEventListener('change', function(e) {
            updateSetting('ocrShowRaw', e.target.checked);
        });
        if (setOcrScanLine) setOcrScanLine.addEventListener('change', function(e) {
            updateSetting('ocrScanLine', e.target.checked);
            updateScanLineVisibility();
        });
        if (setOcrShowResize) setOcrShowResize.addEventListener('change', function(e) {
            updateSetting('ocrShowResize', e.target.checked);
            updateResizeControlsVisibility();
        });
        if (setTextTransform) setTextTransform.addEventListener('change', function(e) {
            updateSetting('ocrTextTransform', e.target.value);
            applyOCRFilterConfig();
        });

        // OCR ROI (auto-centered, size only)
        if (setOcrRoiEnabled) setOcrRoiEnabled.addEventListener('change', function(e) {
            updateSetting('ocrRoiEnabled', e.target.checked);
            updateRoiUI();
            applyOCRFilterConfig();
        });

        // Shared apply function for ROI that syncs both sets of sliders
        var applyROI = function() {
            // Update other sliders if changed from one place
            // Note: bindRangeSlider updates 'settings' or 'tempSettings'
            // We need to propagate that value to the other UI elements
            var s = (currentTab === 'settings' && tempSettings) ? tempSettings : settings;
            if (scanRoiWSlider && setOcrRoiWidth) {
                if (parseInt(scanRoiWSlider.value) !== s.ocrRoiWidth) scanRoiWSlider.value = s.ocrRoiWidth;
                if (parseInt(setOcrRoiWidth.value) !== s.ocrRoiWidth) {
                    setOcrRoiWidth.value = s.ocrRoiWidth;
                    if (roiWidthVal) roiWidthVal.innerText = s.ocrRoiWidth;
                }
            }
            if (scanRoiHSlider && setOcrRoiHeight) {
                if (parseInt(scanRoiHSlider.value) !== s.ocrRoiHeight) scanRoiHSlider.value = s.ocrRoiHeight;
                if (parseInt(setOcrRoiHeight.value) !== s.ocrRoiHeight) {
                    setOcrRoiHeight.value = s.ocrRoiHeight;
                    if (roiHeightVal) roiHeightVal.innerText = s.ocrRoiHeight;
                }
            }
            applyOCRFilterConfig();
        };

        bindRangeSlider(setOcrRoiWidth, roiWidthVal, 'ocrRoiWidth', applyROI);
        bindRangeSlider(setOcrRoiHeight, roiHeightVal, 'ocrRoiHeight', applyROI);

        // Bind Scan Tab Sliders (Direct update to main settings as they are live)
        if (scanRoiWSlider) {
            scanRoiWSlider.addEventListener('input', function(e) {
                var val = parseInt(e.target.value, 10);
                settings.ocrRoiWidth = val;
                storage.saveSettings(settings);
                applyROI();
            });
        }
        if (scanRoiHSlider) {
            scanRoiHSlider.addEventListener('input', function(e) {
                var val = parseInt(e.target.value, 10);
                settings.ocrRoiHeight = val;
                storage.saveSettings(settings);
                applyROI();
            });
        }

        if (btnScanResize && scanResizeOverlay) {
            btnScanResize.addEventListener('click', function() {
                if (scanResizeOverlay.classList.contains('hidden')) {
                    scanResizeOverlay.classList.remove('hidden');
                } else {
                    scanResizeOverlay.classList.add('hidden');
                }
            });
        }

        // OCR Tuning Sliders
        bindRangeSlider(setOcrConfidence, ocrConfidenceVal, 'ocrConfidence', applyOCRFilterConfig);
        bindRangeSlider(setOcrDebounce, ocrDebounceVal, 'ocrDebounce', applyOCRFilterConfig);

        // Barcode Tuning Sliders
        bindRangeSlider(setBarcodeFps, barcodeFpsVal, 'barcodeFps', applyBarcodeConfig);
        bindRangeSlider(setBarcodeBoxW, barcodeBoxWVal, 'barcodeBoxWidth', applyBarcodeConfig);
        bindRangeSlider(setBarcodeBoxH, barcodeBoxHVal, 'barcodeBoxHeight', applyBarcodeConfig);

        // Initialize Manual Toggles
        setupManualToggles();

        // Screenshot Evidence Button — captures raw frame, always works
        if (btnScreenshot) {
            btnScreenshot.addEventListener('click', function() {
                if (!ocrManager) return;
                btnScreenshot.disabled = true;
                btnScreenshot.innerText = 'Capturing...';

                ocrManager.screenshotEvidence().then(function(result) {
                    btnScreenshot.disabled = false;
                    btnScreenshot.innerText = 'Screenshot Evidence';

                    var imageDataUri = (result && result.imageDataUri) ? result.imageDataUri : '';

                    // Always save to history as evidence
                    storage.addItem('SCANNED', {
                        content: '(screenshot evidence)',
                        format: 'EVIDENCE',
                        mode: 'TEXT_OCR',
                        image: imageDataUri
                    });
                    renderHistory();

                    document.getElementById('scan-status').innerText = 'Screenshot saved to history.';
                    showToast('Evidence captured');
                }).catch(function() {
                    btnScreenshot.disabled = false;
                    btnScreenshot.innerText = 'Screenshot Evidence';
                    document.getElementById('scan-status').innerText = 'Screenshot failed. Try again.';
                });
            });
        }

        // Scan & Verify Button — runs Smart Canvas pipeline + OCR
        if (btnScanVerify) {
            btnScanVerify.addEventListener('click', function() {
                if (!ocrManager) return;
                btnScanVerify.disabled = true;
                btnScanVerify.innerText = 'Processing...';
                document.getElementById('scan-status').innerText = 'Running OCR pipeline...';

                ocrManager.scanAndVerify().then(function(result) {
                    btnScanVerify.disabled = false;
                    btnScanVerify.innerText = 'Scan & Verify';

                    var text = (result && result.text) ? result.text : '';
                    var rawImage = (result && result.rawImageUri) ? result.rawImageUri : '';
                    var processedImage = (result && result.processedImageUri) ? result.processedImageUri : '';

                    // Save to history with both images
                    storage.addItem('SCANNED', {
                        content: text || '(no text detected)',
                        format: 'OCR_SCAN',
                        mode: 'TEXT_OCR',
                        image: rawImage || processedImage
                    });
                    renderHistory();

                    if (!text || text.length < 2) {
                        document.getElementById('scan-status').innerText = 'Text not detected. Try adjusting position.';
                        showToast('Text not detected');
                        // Resume live scanning
                        ocrManager.isScanning = true;
                        ocrManager._detectLoop();
                    } else {
                        // Show verification modal with detected text
                        document.getElementById('scan-status').innerText = 'Text detected. Verify below.';

                        // Check action mode
                        if (settings.actionMode === 'URL_INPUT' || settings.actionMode === 'URL_LOOKUP') {
                            handleScanToVerify(text);
                        } else {
                            // Show result modal
                            var modal = document.getElementById('scan-result');
                            document.getElementById('result-type').innerText = 'Type: OCR_SCAN (Confidence: ' + (result.confidence || 0).toFixed(0) + '%)';
                            document.getElementById('result-text').value = text;

                            var resultImg = document.getElementById('result-image');
                            if (resultImg) {
                                if (processedImage) {
                                    resultImg.src = processedImage;
                                    resultImg.classList.remove('hidden');
                                } else {
                                    resultImg.classList.add('hidden');
                                }
                            }

                            modal.classList.remove('hidden');
                            copyResult(true); // auto-copy
                        }
                    }
                }).catch(function() {
                    btnScanVerify.disabled = false;
                    btnScanVerify.innerText = 'Scan & Verify';
                    document.getElementById('scan-status').innerText = 'Scan failed. Try again.';
                    showToast('Scan failed');
                });
            });
        }

        // Scan Result Actions
        document.getElementById('btn-copy').addEventListener('click', copyResult);
        document.getElementById('btn-rescan').addEventListener('click', closeResultModal);
        document.querySelector('.close-modal').addEventListener('click', closeResultModal);
        document.getElementById('btn-save-scan').addEventListener('click', saveCurrentScan);

        // Verify Modal Actions
        if (btnVerifyCancel) btnVerifyCancel.addEventListener('click', closeVerifyModal);
        if (closeVerify) closeVerify.addEventListener('click', closeVerifyModal);

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

        // --- Auto-restart camera when user returns to this tab/window ---
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && currentTab === 'scan' && userHasInteracted) {
                // Check if any modal is open — don't restart if user is in a modal
                var scanResult = document.getElementById('scan-result');
                var verifyMod = document.getElementById('verify-modal');
                var scanResultOpen = scanResult && !scanResult.classList.contains('hidden');
                var verifyOpen = verifyMod && !verifyMod.classList.contains('hidden');

                if (!scanResultOpen && !verifyOpen) {
                    startScanner();
                }
            }
        });

        // --- Cleanup Tesseract worker on page unload ---
        window.addEventListener('beforeunload', function() {
            if (ocrManager) ocrManager.terminate();
        });

        // --- Keyboard: Escape closes modals ---
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Check detection overlay
                if (detectionOverlay && !detectionOverlay.classList.contains('hidden')) {
                    hideDetectionOverlay();
                    startScanner();
                    return;
                }
                var scanResult = document.getElementById('scan-result');
                if (scanResult && !scanResult.classList.contains('hidden')) {
                    closeResultModal();
                    return;
                }
                if (verifyModal && !verifyModal.classList.contains('hidden')) {
                    closeVerifyModal();
                    return;
                }
                if (previewModal && !previewModal.classList.contains('hidden')) {
                    closeImagePreview();
                    return;
                }
                if (editModal && !editModal.classList.contains('hidden')) {
                    closeEditEntry();
                    return;
                }
            }
        });
    }

    function bindRangeSlider(inputEl, displayEl, settingsKey, applyFn) {
        if (!inputEl) return;

        // Sync range -> display & settings
        inputEl.addEventListener('input', function(e) {
            var val = parseInt(e.target.value, 10);
            updateVal(val);
        });

        // Handle linked manual text input if present
        var manualInput = document.getElementById(inputEl.id + '-manual');
        if (manualInput) {
            manualInput.addEventListener('change', function(e) {
                var val = parseInt(e.target.value, 10);
                if (isNaN(val)) return;

                // Enforce Min/Max from range attributes
                var min = parseInt(inputEl.min, 10);
                var max = parseInt(inputEl.max, 10);
                if (val < min) val = min;
                // Allow exceeding max for "Manual Override" (except strictly bounded values like confidence)
                if (settingsKey === 'ocrConfidence' && val > 100) val = 100;

                inputEl.value = val; // Sync slider visual
                updateVal(val);
            });
        }

        function updateVal(val) {
            if (currentTab === 'settings' && tempSettings) {
                tempSettings[settingsKey] = val;
            } else {
                settings[settingsKey] = val;
                storage.saveSettings(settings);
            }
            if (displayEl) displayEl.innerText = val;
            if (applyFn) applyFn();
        }
    }

    function setupManualToggles() {
        var toggles = document.querySelectorAll('.manual-toggle-btn');
        for (var i = 0; i < toggles.length; i++) {
            toggles[i].addEventListener('click', function() {
                var targetId = this.dataset.target;
                var rangeInput = document.getElementById(targetId);
                var manualInput = document.getElementById(targetId + '-manual');
                var displaySpan = document.getElementById(targetId.replace('set-', '') + '-val');

                if (manualInput.classList.contains('hidden')) {
                    // Switch to Manual
                    manualInput.classList.remove('hidden');
                    if (rangeInput) rangeInput.classList.add('hidden');
                    if (displaySpan) displaySpan.classList.add('hidden');
                    this.innerText = '🎚️'; // Switch icon to Slider
                    this.title = "Switch to Slider";
                } else {
                    // Switch to Slider
                    manualInput.classList.add('hidden');
                    if (rangeInput) rangeInput.classList.remove('hidden');
                    if (displaySpan) displaySpan.classList.remove('hidden');
                    this.innerText = '⌨️'; // Switch icon to Keyboard
                    this.title = "Toggle Manual Input";
                }
            });
        }
    }

    function getChangeCount() {
        if (!tempSettings) return 0;
        var count = 0;
        var keys = Object.keys(tempSettings);
        for (var i=0; i<keys.length; i++) {
            var k = keys[i];
            if (JSON.stringify(tempSettings[k]) !== JSON.stringify(settings[k])) {
                count++;
            }
        }
        return count;
    }

    function saveSettings() {
        var count = getChangeCount();
        if (count === 0) {
            switchTab('scan');
            return;
        }
        if (confirm('Save ' + count + ' changes?')) {
            settings = JSON.parse(JSON.stringify(tempSettings));
            storage.saveSettings(settings);
            initSettingsTransaction(); // reset temp
            applyOCRFilterConfig();
            applyBarcodeConfig();
            switchTab('scan');
        }
    }

    function cancelSettings() {
        var count = getChangeCount();
        if (count > 0) {
            if (!confirm('Discard ' + count + ' unsaved changes?')) {
                return;
            }
        }
        initSettingsTransaction(); // Revert temp to match saved
        // Re-init UI elements to match settings
        init();
        switchTab('scan');
    }

    function defaultSettings() {
        if (confirm('Revert all settings to defaults? This cannot be undone.')) {
            storage.clearSettings(); // Clears LS
            settings = storage.getSettings(); // Reloads defaults
            initSettingsTransaction();
            init(); // Refresh UI
            alert('Settings reset to defaults.');
        }
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
            ocrManager.start('TEXT_OCR', preferredDriver, settings.deviceId).catch(function(err) {
                statusEl.innerText = 'Text Scanner Failed: ' + err;
            });
            return;
        }

        // Barcode scanning
        if (!scanner) return;
        statusEl.innerText = 'Starting ' + mode + '...';

        scanner.start(mode, settings.deviceId).then(function() {
            statusEl.innerText = 'Scanning (' + mode + ')...';
        }).catch(function(err) {
            statusEl.innerText = 'Error: ' + err;
        });
    }

    function showDetectionOverlay(text, result, mode) {
        if (!detectionOverlay || !detectionValue) return;

        // Stop scanning
        stopAll();

        // Truncate text if too long
        var displayText = text;
        var MAX_LENGTH = 50;
        if (displayText.length > MAX_LENGTH) {
            displayText = displayText.substring(0, MAX_LENGTH) + '...';
        }

        detectionValue.innerText = displayText;
        detectionOverlay.classList.remove('hidden');

        var formatName = 'Unknown';
        if (result && result.result && result.result.format && result.result.format.formatName) {
            formatName = result.result.format.formatName;
        }

        var imageDataUri = (result && result.imageDataUri) ? result.imageDataUri : '';
        lastResult = { text: text, format: formatName, mode: mode, image: imageDataUri };
        lastSnapshotImage = imageDataUri;

        // Click to navigate
        detectionBox.onclick = function() {
            hideDetectionOverlay();

            // Save to history
            storage.addItem('SCANNED', {
                content: text,
                format: formatName,
                mode: mode,
                image: imageDataUri
            });
            renderHistory();

            // URL Input mode - navigate to URL
            if (settings.actionMode === 'URL_INPUT' || settings.actionMode === 'URL_LOOKUP') {
                executeUrlRedirect(text);
            } else {
                // For other modes, just copy and restart
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(function() { showToast('Copied: ' + text.substring(0, 30)); })
                        .catch(function() { showToast('Text detected'); });
                } else {
                    showToast('Text detected');
                }
                startScanner();
            }
        };

        // Click outside to dismiss
        detectionOverlay.onclick = function(e) {
            if (e.target === detectionOverlay) {
                hideDetectionOverlay();
                startScanner();
            }
        };
    }

    function hideDetectionOverlay() {
        if (detectionOverlay) {
            detectionOverlay.classList.add('hidden');
            if (detectionBox) detectionBox.onclick = null;
            detectionOverlay.onclick = null;
        }
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

        // Raw Text Feedback (if enabled)
        if (settings.ocrShowRaw) {
            // text passed here is after filtering, but it's the result satisfied by the filter.
            // For true debug, we'd need OCRManager to emit raw via a different channel, but this works for "what was found".
            document.getElementById('scan-status').innerText = 'Found: ' + text.substring(0, 50) + (text.length>50?'...':'');
        }

        // URL Input mode OR OCR without confirm popup - show detection overlay
        if (settings.actionMode === 'URL_INPUT' || settings.actionMode === 'URL_LOOKUP') {
            showDetectionOverlay(text, result, mode);
            return;
        }

        // OCR mode: check confirm popup
        if (mode === 'TEXT_OCR' || mode === 'OCR') {
            if (!settings.ocrConfirmPopup) {
                // Show detection overlay instead of auto-copying
                showDetectionOverlay(text, result, mode);
                return;
            }
        }

        // Show Modal (traditional flow)
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

    function buildUrl(value) {
        var baseUrl = settings.baseUrl || 'https://www.google.com/search?q=';

        // Ensure protocol for window.open
        if (!/^https?:\/\//i.test(baseUrl)) {
            baseUrl = 'https://' + baseUrl;
        }

        if (settings.addValueToUrl) {
            // Append value to end of URL
            return baseUrl + encodeURIComponent(value);
        }

        // If addValueToUrl is OFF, just return the base URL
        return baseUrl;
    }

    function executeUrlRedirect(text) {
        // Always copy value to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(function() { showToast('Copied!'); })
                .catch(function() { showToast('Scan complete'); });
        }

        var url = buildUrl(text);
        window.open(url, '_blank');
        startScanner();
    }

    function handleScanToVerify(text) {
        if (!text) return;

        // 1. Pre-Processing: Split by newlines and remove whitespace from each candidate
        var rawCandidates = text.split(/[\r\n]+/);
        var candidates = [];

        for (var i = 0; i < rawCandidates.length; i++) {
            var clean = rawCandidates[i].replace(/\s+/g, '');
            if (clean.length > 0 && candidates.indexOf(clean) === -1) {
                candidates.push(clean);
            }
        }

        if (candidates.length === 0) {
            showToast('No valid text found');
            startScanner();
            return;
        }

        // 2. User Verification (The Modal)
        if (candidateList) {
            candidateList.innerHTML = '';
            for (var j = 0; j < candidates.length; j++) {
                var candidate = candidates[j];
                var li = document.createElement('li');
                var btn = document.createElement('button');
                btn.className = 'candidate-btn';
                btn.textContent = candidate;

                // Closure to capture candidate
                (function(val) {
                    btn.addEventListener('click', function() {
                        // Save selected candidate to history
                        storage.addItem('SCANNED', {
                            content: val,
                            format: 'TEXT_OCR',
                            mode: 'TEXT_OCR',
                            image: lastSnapshotImage || ''
                        });
                        renderHistory();

                        closeVerifyModal(true); // silent close (don't restart yet)
                        executeUrlRedirect(val);
                    });
                })(candidate);

                li.appendChild(btn);
                candidateList.appendChild(li);
            }
        }

        if (verifyModal) verifyModal.classList.remove('hidden');
    }

    function closeVerifyModal(silent) {
        if (verifyModal) verifyModal.classList.add('hidden');
        // If passed explicit true, we skip restart (caller handles it)
        // If event object (click) or undefined, we restart.
        if (silent !== true) startScanner();
    }

    // Make verify modal backdrop clickable to dismiss
    if (verifyModal) {
        verifyModal.addEventListener('click', function(e) {
            if (e.target === verifyModal) {
                closeVerifyModal();
            }
        });
    }

    function showToast(message) {
        var toast = document.getElementById('toast-msg');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-msg';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
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
        if (currentTab === 'scan' && userHasInteracted) {
            startScanner();
        }
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

        generator.generate('qr-output', text);

        var qrOutput = document.getElementById('qr-output');
        if (qrOutput) qrOutput.style.display = 'block';

        var genActions = document.getElementById('gen-actions');
        if (genActions) genActions.classList.remove('hidden');

        storage.addItem('CREATED', {
            content: text,
            format: 'QR_CODE'
        });
        renderHistory();
    }

    function renderHistory() {
        var created = storage.getHistory('CREATED');
        var scanned = storage.getHistory('SCANNED');

        renderList(scanned, 'history-scanned');
        renderList(created, 'history-created');
    }

    // --- Image Preview Modal ---
    var previewModal = document.getElementById('image-preview-modal');
    var previewImage = document.getElementById('preview-image');
    var previewSaveLink = document.getElementById('preview-save-link');
    var closePreview = document.querySelector('.close-preview');

    function openImagePreview(imageSrc) {
        if (!previewModal || !previewImage) return;
        previewImage.src = imageSrc;
        previewSaveLink.href = imageSrc;
        previewModal.classList.remove('hidden');
    }

    function closeImagePreview() {
        if (previewModal) previewModal.classList.add('hidden');
    }

    if (closePreview) closePreview.addEventListener('click', closeImagePreview);
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) closeImagePreview();
        });
    }

    // --- Edit Entry Modal ---
    var editModal = document.getElementById('edit-entry-modal');
    var editText = document.getElementById('edit-entry-text');
    var btnEditSave = document.getElementById('btn-edit-save');
    var btnEditCancel = document.getElementById('btn-edit-cancel');
    var btnEditDelete = document.getElementById('btn-edit-delete');
    var closeEdit = document.querySelector('.close-edit');
    var _editEntryId = null;
    var _editEntryType = null;
    var _editOriginalContent = '';

    function openEditEntry(type, id, currentContent) {
        _editEntryId = id;
        _editEntryType = type;
        _editOriginalContent = currentContent || '';
        if (editText) editText.value = _editOriginalContent;
        if (editModal) editModal.classList.remove('hidden');
    }

    function hasEditPendingChanges() {
        if (!editText) return false;
        return editText.value !== _editOriginalContent;
    }

    function closeEditEntry(force) {
        if (!force && hasEditPendingChanges()) {
            if (!confirm('Discard unsaved changes?')) return;
        }
        if (editText) editText.value = _editOriginalContent;
        if (editModal) editModal.classList.add('hidden');
        _editEntryId = null;
        _editEntryType = null;
        _editOriginalContent = '';
    }

    function saveEditEntry() {
        if (!_editEntryId || !_editEntryType) return;
        var newContent = editText ? editText.value : '';
        if (newContent === '') {
            showToast('Content cannot be empty');
            return;
        }
        storage.updateItem(_editEntryType, _editEntryId, { content: newContent });
        _editOriginalContent = newContent; // Match so close doesn't prompt
        closeEditEntry(true);
        renderHistory();
        showToast('Entry updated');
    }

    function deleteEditEntry() {
        if (!_editEntryId || !_editEntryType) return;
        if (!confirm('Delete this entry? This cannot be undone.')) return;
        storage.removeItem(_editEntryType, _editEntryId);
        _editOriginalContent = ''; // Clear so close doesn't prompt
        closeEditEntry(true);
        renderHistory();
        showToast('Entry deleted');
    }

    function deleteHistoryItem(type, id) {
        if (!confirm('Delete this entry?')) return;
        storage.removeItem(type, id);
        renderHistory();
        showToast('Entry deleted');
    }

    function openUrlForItem(content) {
        // Always copy value to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(content)
                .then(function() { showToast('Copied!'); })
                .catch(function() {});
        }

        var url = buildUrl(content);
        window.open(url, '_blank');
    }

    if (closeEdit) closeEdit.addEventListener('click', function() { closeEditEntry(); });
    if (btnEditCancel) btnEditCancel.addEventListener('click', function() { closeEditEntry(); });
    if (btnEditSave) btnEditSave.addEventListener('click', saveEditEntry);
    if (btnEditDelete) btnEditDelete.addEventListener('click', deleteEditEntry);
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) closeEditEntry();
        });
    }

    // --- History Rendering ---
    function isUrlMode() {
        return settings.actionMode === 'URL_INPUT' || settings.actionMode === 'URL_LOOKUP';
    }

    function renderList(list, elementId) {
        var ul = document.getElementById(elementId);
        var type = (elementId === 'history-scanned') ? 'SCANNED' : 'CREATED';
        ul.innerHTML = '';
        if (list.length === 0) {
            ul.innerHTML = '<li class="empty">No items yet</li>';
            return;
        }
        for (var i = 0; i < list.length; i++) {
            (function(item) {
                var li = document.createElement('li');
                var time = new Date(item.timestamp).toLocaleString();

                // --- Top row: thumbnail + content (click to copy) ---
                var topRow = document.createElement('div');
                topRow.className = 'hist-row';

                // Thumbnail — clicking opens image preview
                if (item.image) {
                    var thumb = document.createElement('img');
                    thumb.className = 'hist-thumb';
                    thumb.src = item.image;
                    thumb.alt = 'Snapshot';
                    thumb.title = 'Click to preview image';
                    thumb.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openImagePreview(item.image);
                    });
                    topRow.appendChild(thumb);
                }

                // Info section
                var info = document.createElement('div');
                info.className = 'hist-info';

                var contentDiv = document.createElement('div');
                contentDiv.className = 'hist-content';
                contentDiv.textContent = item.content || '';
                info.appendChild(contentDiv);

                var formatSpan = document.createElement('span');
                formatSpan.className = 'hist-format';
                formatSpan.textContent = item.format || 'QR';
                info.appendChild(formatSpan);

                topRow.appendChild(info);
                li.appendChild(topRow);

                // --- Bottom row: timestamp above, action buttons below ---
                var bottomRow = document.createElement('div');
                bottomRow.className = 'hist-bottom';

                var timeDiv = document.createElement('div');
                timeDiv.className = 'hist-timestamp';
                timeDiv.textContent = time;
                bottomRow.appendChild(timeDiv);

                var actionsDiv = document.createElement('div');
                actionsDiv.className = 'hist-actions-row';

                // Google Lens / Image Search Button (if image exists)
                if (item.image) {
                    var lensBtn = document.createElement('button');
                    lensBtn.className = 'hist-action-btn hist-lens-btn';
                    lensBtn.textContent = '📷'; // Camera icon
                    lensBtn.title = 'Google Lens Search';
                    lensBtn.setAttribute('aria-label', 'Google Lens Search');
                    lensBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        searchImageOnGoogle(item.image);
                    });
                    actionsDiv.appendChild(lensBtn);
                }

                // Open URL button (only if URL_INPUT mode is active)
                if (isUrlMode()) {
                    var urlBtn = document.createElement('button');
                    urlBtn.className = 'hist-action-btn hist-url-btn';
                    urlBtn.textContent = '\uD83D\uDD17'; // Link icon 🔗
                    urlBtn.title = 'Open URL';
                    urlBtn.setAttribute('aria-label', 'Open URL');
                    urlBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openUrlForItem(item.content);
                    });
                    actionsDiv.appendChild(urlBtn);
                }

                // Edit button
                var editBtn = document.createElement('button');
                editBtn.className = 'hist-action-btn hist-edit-btn';
                editBtn.textContent = '\u270E'; // Pencil icon ✎
                editBtn.title = 'Edit entry';
                editBtn.setAttribute('aria-label', 'Edit entry');
                editBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openEditEntry(type, item.id, item.content);
                });
                actionsDiv.appendChild(editBtn);

                // Delete button
                var delBtn = document.createElement('button');
                delBtn.className = 'hist-action-btn hist-delete-btn';
                delBtn.textContent = '\uD83D\uDDD1'; // Wastebasket icon 🗑
                delBtn.title = 'Delete entry';
                delBtn.setAttribute('aria-label', 'Delete entry');
                delBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteHistoryItem(type, item.id);
                });
                actionsDiv.appendChild(delBtn);

                bottomRow.appendChild(actionsDiv);
                li.appendChild(bottomRow);

                // Clicking text area copies to clipboard
                li.title = 'Click to copy';
                li.addEventListener('click', function() {
                    var content = item.content || '';
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(content).then(function() {
                            showToast('Copied!');
                        });
                    }
                });

                ul.appendChild(li);
            })(list[i]);
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

    function searchImageOnGoogle(base64Data) {
        if (!base64Data) return;

        // Extract raw base64 string (remove data URI prefix if present)
        var content = base64Data;
        if (content.indexOf(',') !== -1) {
            content = content.split(',')[1];
        }

        // Create a hidden form to submit to Google Search by Image
        // Note: 'image_content' parameter works with base64 data in multipart/form-data
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.google.com/searchbyimage/upload';
        form.target = '_blank';
        form.enctype = 'multipart/form-data';
        form.style.display = 'none';

        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'image_content';
        input.value = content;

        form.appendChild(input);
        document.body.appendChild(form);

        try {
            form.submit();
            showToast('Opening Google Lens...');
        } catch (e) {
            console.error('Image search failed', e);
            showToast('Search failed');
        }

        // Clean up
        setTimeout(function() {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        }, 2000);
    }
});
