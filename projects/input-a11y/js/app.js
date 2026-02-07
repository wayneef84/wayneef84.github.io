document.addEventListener('DOMContentLoaded', () => {
    const storage = new StorageManager();
    const generator = new GeneratorManager();
    let scanner = null; // Initialized later
    let ocrManager = null; // Initialized later

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
        if (settings.feedbackFrame) setFrame.value = settings.feedbackFrame;
        if (settings.feedbackFlash) setFlash.value = settings.feedbackFlash;

        updateActionUI();

        // Initialize Scanner
        scanner = new ScannerManager('reader', {
            onSuccess: onScanSuccess,
            onInitError: (err) => {
                document.getElementById('scan-status').innerText = "Camera Error: " + err;
            }
        });

        // Initialize OCR
        if (typeof OCRManager !== 'undefined') {
            ocrManager = new OCRManager('reader', {
                onSuccess: onScanSuccess,
                onInitError: (err) => {
                    document.getElementById('scan-status').innerText = "OCR Error: " + err;
                }
            });
        }

        // Generate Homepage QR
        generator.generate('homepage-qr', 'https://wayneef84.github.io/');

        // Generate Mobile Page QR
        generator.generate('mobile-page-qr', window.location.href);

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

        setBaseUrl.addEventListener('input', (e) => {
            settings.baseUrl = e.target.value;
            storage.saveSettings(settings);
        });

        // Feedback Settings
        setVibrate.addEventListener('change', (e) => {
            settings.feedbackVibrate = e.target.checked;
            storage.saveSettings(settings);
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
        document.getElementById('btn-copy').addEventListener('click', copyResult);
        document.getElementById('btn-rescan').addEventListener('click', closeResultModal);
        document.querySelector('.close-modal').addEventListener('click', closeResultModal);
        document.getElementById('btn-save-scan').addEventListener('click', saveCurrentScan);

        // Generate Actions
        document.getElementById('btn-generate').addEventListener('click', generateQR);
        document.getElementById('btn-download').addEventListener('click', () => generator.download('qr-output', 'input_a11y_qr.png'));

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

    async function switchTab(tabId) {
        currentTab = tabId;

        // Update UI
        tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        tabs.forEach(tab => tab.classList.toggle('active', tab.id === tabId));

        // Logic
        if (tabId === 'scan') {
            await startScanner();
        } else {
            if (scanner) await scanner.stop();
            if (ocrManager) await ocrManager.stop();
        }
    }

    async function startScanner() {
        // Stop both first to be safe
        if (scanner) await scanner.stop();
        if (ocrManager) await ocrManager.stop();

        const mode = scanModeSelect.value;
        const statusEl = document.getElementById('scan-status');

        if (mode === 'TEXT_OCR') {
            statusEl.innerText = "Starting OCR...";
            if (ocrManager) {
                ocrManager.start('TEXT_OCR').then(() => {
                     statusEl.innerText = "OCR Active. Point at text.";
                }).catch(err => {
                    statusEl.innerText = "OCR Start Failed: " + err;
                });
            } else {
                statusEl.innerText = "OCR Manager not loaded.";
            }
            return;
        }

        if (!scanner) return;
        statusEl.innerText = `Starting ${mode}...`;

        scanner.start(mode).then(() => {
            statusEl.innerText = `Scanning (${mode})...`;
        }).catch(err => {
            statusEl.innerText = `Error: ${err}`;
        });
    }

    async function onScanSuccess(text, result, mode) {
        // Trigger Feedback
        triggerFeedback();

        // Stop scanning when result found
        if (scanner) await scanner.stop();
        if (ocrManager) await ocrManager.stop();

        lastResult = { text, format: result.result?.format?.formatName || 'Unknown', mode };

        // Check Action Mode
        if (settings.actionMode === 'URL_INPUT' || settings.actionMode === 'URL_LOOKUP') {
            handleUrlInput(text);
            return;
        }

        // Show Modal (Free Scan)
        const modal = document.getElementById('scan-result');
        document.getElementById('result-type').innerText = `Type: ${lastResult.format}`;
        document.getElementById('result-text').value = text;
        modal.classList.remove('hidden');

        // If OCR Mode (deprecated name for Copy Mode), copy immediately
        if (mode === 'OCR') {
            copyResult(true);
        }
    }

    function handleUrlInput(text) {
        // Copy to clipboard first
        navigator.clipboard.writeText(text)
            .then(() => showToast("Copied!"))
            .catch(e => console.warn("Clipboard failed", e));

        let baseUrl = settings.baseUrl || 'https://www.google.com/search?q=';
        // Ensure protocol
        if (!/^https?:\/\//i.test(baseUrl)) {
            baseUrl = 'https://' + baseUrl;
        }

        const url = baseUrl + text;

        // Open immediately
        window.open(url, '_blank');
        startScanner(); // Restart scan
    }

    function showToast(message) {
        let toast = document.getElementById('toast-msg');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-msg';
            toast.style.position = 'fixed';
            toast.style.bottom = '80px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '20px';
            toast.style.zIndex = '1000';
            toast.style.transition = 'opacity 0.3s';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.style.opacity = '1';
        setTimeout(() => {
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
            // Use a temporary notification or just alert
            const btn = document.getElementById('btn-copy');
            const originalText = btn.innerText;
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = originalText, 1000);
        }
    }

    function saveCurrentScan() {
        if (!lastResult) return;
        storage.addItem('SCANNED', {
            content: lastResult.text,
            format: lastResult.format,
            mode: lastResult.mode
        });
        // Feedback
        const btn = document.getElementById('btn-save-scan');
        btn.innerText = "Saved!";
        setTimeout(() => btn.innerText = "Save to History", 1500);
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
                // Add click to regenerate or copy?
                li.addEventListener('click', () => {
                    // Copy to clipboard
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
