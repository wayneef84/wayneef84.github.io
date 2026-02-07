document.addEventListener('DOMContentLoaded', () => {
    const storage = new StorageManager();
    const generator = new GeneratorManager();
    let scanner = null;
    let ocrScanner = null;

    // --- State ---
    let currentTab = 'scan';
    let lastResult = null;
    const settings = storage.getSettings();

    // --- Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab-content');
    const scanModeSelect = document.getElementById('scanMode');

    // Settings Elements
    const setAction = document.getElementById('set-action');
    const setBaseUrl = document.getElementById('set-base-url');
    const urlConfig = document.getElementById('url-config');
    const setVibrate = document.getElementById('set-vibrate');
    const setRegion = document.getElementById('set-region');
    const setFrame = document.getElementById('set-frame');
    const setFlash = document.getElementById('set-flash');

    // --- Init ---
    init();

    function init() {
        // Restore Settings
        if (settings.detectMode) scanModeSelect.value = settings.detectMode;
        if (settings.actionMode) setAction.value = settings.actionMode;
        if (settings.baseUrl) setBaseUrl.value = settings.baseUrl;
        if (settings.feedbackVibrate !== undefined) setVibrate.checked = settings.feedbackVibrate;
        if (settings.scanRegion) setRegion.value = settings.scanRegion;
        if (settings.feedbackFrame) setFrame.value = settings.feedbackFrame;
        if (settings.feedbackFlash) setFlash.value = settings.feedbackFlash;

        updateActionUI();

        // Initialize Scanners
        scanner = new ScannerManager('reader', {
            onSuccess: onScanSuccess,
            onInitError: (err) => {
                document.getElementById('scan-status').innerText = "Camera Error: " + err;
            }
        });

        ocrScanner = new OCRManager('reader', {
            onSuccess: onScanSuccess,
            onInitError: (err) => {
                document.getElementById('scan-status').innerText = "OCR Error: " + err.message;
            }
        });

        // Generate Homepage QR
        generator.generate('homepage-qr', 'https://wayneef84.github.io/');

        // Render History
        renderHistory();

        bindEvents();

        // Start Scanner if on Scan tab (Default)
        if (currentTab === 'scan') {
            startScanner();
        }
    }

    function bindEvents() {
        // Tabs
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });

        // Scan Mode
        scanModeSelect.addEventListener('change', (e) => {
            settings.detectMode = e.target.value;
            storage.saveSettings(settings);
            // Restart Scanner if active
            if (currentTab === 'scan') {
                startScanner();
            }
        });

        // Action Settings
        setAction.addEventListener('change', (e) => {
            settings.actionMode = e.target.value;
            storage.saveSettings(settings);
            updateActionUI();
        });

        // Use 'input' for live updates as requested
        setBaseUrl.addEventListener('input', (e) => {
            settings.baseUrl = e.target.value;
            storage.saveSettings(settings);
        });

        // Feedback Settings
        setVibrate.addEventListener('change', (e) => {
            settings.feedbackVibrate = e.target.checked;
            storage.saveSettings(settings);
        });
        setRegion.addEventListener('change', (e) => {
            settings.scanRegion = e.target.value;
            storage.saveSettings(settings);
            // Restart if active
            if (currentTab === 'scan') {
                startScanner();
            }
        });
        setFrame.addEventListener('change', (e) => {
            settings.feedbackFrame = e.target.value;
            storage.saveSettings(settings);
        });
        setFlash.addEventListener('change', (e) => {
            settings.feedbackFlash = e.target.value;
            storage.saveSettings(settings);
        });

        // Scan Result Actions
        document.getElementById('btn-copy').addEventListener('click', () => copyResult());
        document.getElementById('btn-rescan').addEventListener('click', closeResultModal);
        document.querySelector('.close-modal').addEventListener('click', closeResultModal);
        document.getElementById('btn-save-scan').addEventListener('click', () => {
            if (lastResult) {
                saveScan(lastResult.text, lastResult.format, lastResult.mode);
                // Feedback
                const btn = document.getElementById('btn-save-scan');
                const orig = btn.innerText;
                btn.innerText = "Saved!";
                setTimeout(() => btn.innerText = orig, 1500);
            }
        });

        // Generate Actions
        document.getElementById('btn-generate').addEventListener('click', generateQR);
        document.getElementById('btn-download').addEventListener('click', () => generator.download('qr-output', 'iseekqueue_qr.png'));

        // History Actions
        document.getElementById('clear-created').addEventListener('click', () => {
            storage.clearHistory('CREATED');
            renderHistory();
        });
        document.getElementById('clear-scanned').addEventListener('click', () => {
            storage.clearHistory('SCANNED');
            renderHistory();
        });
    }

    function switchTab(tabId) {
        currentTab = tabId;

        // Update UI
        tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        tabs.forEach(tab => tab.classList.toggle('active', tab.id === tabId));

        // Logic
        if (tabId === 'scan') {
            startScanner();
        } else {
            if (scanner) scanner.stop();
            if (ocrScanner) ocrScanner.stop();
        }
    }

    async function startScanner() {
        const mode = scanModeSelect.value;
        const region = setRegion.value || 'BOX';
        const statusEl = document.getElementById('scan-status');

        // Stop both first
        if (scanner) await scanner.stop();
        if (ocrScanner) ocrScanner.stop();

        statusEl.innerText = `Starting ${mode}...`;

        if (mode === 'OCR') {
             ocrScanner.start().then(() => {
                 if (ocrScanner.isSupported) {
                     statusEl.innerText = `Scanning (OCR Text)...`;
                 } else {
                     statusEl.innerText = `Camera Active (OCR Unsupported)`;
                 }
             }).catch(err => {
                 statusEl.innerText = `Error: ${err.message}`;
                 // If TextDetector is missing, maybe fallback to Auto?
                 if (err.message.includes("not supported")) {
                     alert(err.message);
                 }
             });
        } else {
             scanner.start(mode, region).then(() => {
                 statusEl.innerText = `Scanning (${mode})...`;
             }).catch(err => {
                 statusEl.innerText = `Error: ${err}`;
             });
        }
    }

    function onScanSuccess(text, result, mode) {
        // Trigger Feedback
        triggerFeedback();

        // Stop scanning when result found
        if (mode === 'OCR') {
             ocrScanner.stop();
        } else {
             scanner.stop();
        }

        lastResult = { text, format: result.result?.format?.formatName || 'Unknown', mode };

        // Check Action Mode (Processing Mode)
        if (settings.actionMode === 'URL_LOOKUP') {
            handleProcessingMode(text);
            return;
        }

        // Show Modal (Free Scan)
        const modal = document.getElementById('scan-result');
        document.getElementById('result-type').innerText = `Type: ${lastResult.format}`;
        document.getElementById('result-text').value = text;
        modal.classList.remove('hidden');
    }

    function handleProcessingMode(text) {
        // 1. Copy to clipboard
        navigator.clipboard.writeText(text).catch(e => console.warn("Clipboard failed", e));

        // 2. Save to History (Fixing bug)
        saveScan(text, lastResult.format, lastResult.mode);

        // 3. Prepare URL
        const baseUrl = settings.baseUrl || 'https://www.google.com/search?q=';
        const url = baseUrl + encodeURIComponent(text); // Should we encode? Usually yes for query params. But user might just paste base URL. I'll encode to be safe for query params.

        // Wait, if Base URL is just a prefix, maybe they want raw concatenation?
        // E.g. "https://site.com/id/" + "12345"
        // E.g. "https://google.com/?q=" + "hello world"
        // I'll stick to raw concatenation as per original logic, but maybe safer?
        // Original logic was raw concatenation: `baseUrl + text`.
        // I will keep raw concatenation to maintain flexibility unless user asks.
        const finalUrl = baseUrl + text;

        // 4. Confirm and Open
        if (confirm(`Result Copied!\n\nValue: ${text}\n\nOpen link?\n${finalUrl}`)) {
            window.open(finalUrl, '_blank');
            startScanner(); // Restart scan immediately
        } else {
            // If cancelled, show modal so they can edit or see details
            const modal = document.getElementById('scan-result');
            document.getElementById('result-type').innerText = `Type: ${lastResult.format}`;
            document.getElementById('result-text').value = text;
            modal.classList.remove('hidden');
        }
    }

    function updateActionUI() {
        if (setAction.value === 'URL_LOOKUP') {
            urlConfig.classList.remove('hidden');
        } else {
            urlConfig.classList.add('hidden');
        }
    }

    function triggerFeedback() {
        // Vibrate
        if (settings.feedbackVibrate && navigator.vibrate) {
            navigator.vibrate(200);
        }

        const DURATION = 300;

        // Visual Frame
        if (settings.feedbackFrame !== 'OFF') {
            const el = settings.feedbackFrame === 'SCREEN' ? document.body : document.getElementById('reader');
            const cls = settings.feedbackFrame === 'SCREEN' ? 'feedback-frame-screen' : 'feedback-frame-scanner';
            if (el) {
                el.classList.add(cls);
                setTimeout(() => el.classList.remove(cls), DURATION);
            }
        }

        // Screen Flash
        if (settings.feedbackFlash !== 'OFF') {
            const el = settings.feedbackFlash === 'SCREEN' ? document.body : document.getElementById('reader');
            const cls = settings.feedbackFlash === 'SCREEN' ? 'feedback-flash-screen' : 'feedback-flash-scanner';
            if (el) {
                el.classList.add(cls);
                setTimeout(() => el.classList.remove(cls), DURATION);
            }
        }
    }

    function closeResultModal() {
        document.getElementById('scan-result').classList.add('hidden');
        startScanner(); // Restart
    }

    function copyResult(silent = false) {
        const text = document.getElementById('result-text');
        text.select();
        document.execCommand('copy');
        if (!silent) {
            const btn = document.getElementById('btn-copy');
            const originalText = btn.innerText;
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = originalText, 1000);
        }
    }

    function saveScan(content, format, mode) {
        storage.addItem('SCANNED', {
            content: content,
            format: format,
            mode: mode
        });
        renderHistory();
    }

    function generateQR() {
        const text = document.getElementById('gen-text').value;
        if (!text) return alert("Please enter text");

        document.getElementById('qr-output').style.display = 'block';
        generator.generate('qr-output', text);
        document.getElementById('gen-actions').classList.remove('hidden');

        // Auto Save to History
        storage.addItem('CREATED', {
            content: text,
            format: 'QR_CODE'
        });
        renderHistory();
    }

    function renderHistory() {
        const created = storage.getHistory('CREATED');
        const scanned = storage.getHistory('SCANNED');

        const renderList = (list, elementId) => {
            const ul = document.getElementById(elementId);
            ul.innerHTML = '';
            if (list.length === 0) {
                ul.innerHTML = '<li class="empty">No history</li>';
                return;
            }
            list.forEach(item => {
                const li = document.createElement('li');
                const time = new Date(item.timestamp).toLocaleString();
                li.innerHTML = `
                    <div class="hist-content">${escapeHtml(item.content)}</div>
                    <div class="hist-meta">
                        <span>${item.format || 'QR'}</span>
                        <span class="hist-time">${time}</span>
                    </div>
                `;
                li.addEventListener('click', () => {
                    navigator.clipboard.writeText(item.content).then(() => {
                        alert("Copied: " + item.content);
                    });
                });
                li.title = "Click to copy";
                ul.appendChild(li);
            });
        };

        renderList(created, 'history-created');
        renderList(scanned, 'history-scanned');
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
