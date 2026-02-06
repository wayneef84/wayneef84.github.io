document.addEventListener('DOMContentLoaded', () => {
    const storage = new StorageManager();
    const generator = new GeneratorManager();
    let scanner = null; // Initialized later

    // --- State ---
    let currentTab = 'scan';
    let lastResult = null;
    const settings = storage.getSettings();

    // --- Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.tab-content');
    const scanModeSelect = document.getElementById('scanMode');

    // Settings Elements
    const setVibrate = document.getElementById('set-vibrate');
    const setFrame = document.getElementById('set-frame');
    const setFlash = document.getElementById('set-flash');

    // --- Init ---
    init();

    function init() {
        // Restore Settings
        if (settings.detectMode) scanModeSelect.value = settings.detectMode;
        if (settings.feedbackVibrate !== undefined) setVibrate.checked = settings.feedbackVibrate;
        if (settings.feedbackFrame) setFrame.value = settings.feedbackFrame;
        if (settings.feedbackFlash) setFlash.value = settings.feedbackFlash;

        // Initialize Scanner
        scanner = new ScannerManager('reader', {
            onSuccess: onScanSuccess,
            onInitError: (err) => {
                document.getElementById('scan-status').innerText = "Camera Error: " + err;
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
        }
    }

    function startScanner() {
        if (!scanner) return;
        const mode = scanModeSelect.value;
        const statusEl = document.getElementById('scan-status');
        statusEl.innerText = `Starting ${mode}...`;

        scanner.start(mode).then(() => {
            statusEl.innerText = `Scanning (${mode})...`;
        }).catch(err => {
            statusEl.innerText = `Error: ${err}`;
        });
    }

    function onScanSuccess(text, result, mode) {
        // Trigger Feedback
        triggerFeedback();

        // Stop scanning when result found
        scanner.stop();

        lastResult = { text, format: result.result?.format?.formatName || 'Unknown', mode };

        // Show Modal
        const modal = document.getElementById('scan-result');
        document.getElementById('result-type').innerText = `Type: ${lastResult.format}`;
        document.getElementById('result-text').value = text;
        modal.classList.remove('hidden');

        // If OCR Mode, copy immediately
        if (mode === 'OCR') {
            copyResult(true);
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
