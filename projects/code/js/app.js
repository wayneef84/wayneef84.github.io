(function() {
    'use strict';

    var cracker;
    var timerInterval;
    var startTime;
    var isRunning = false;
    var delay = 0;

    // DOM Elements
    var els = {
        targetDisplay: document.getElementById('target-display'),
        guessDisplay: document.getElementById('guess-display'),
        statusText: document.getElementById('status-text'),
        timer: document.getElementById('timer'),
        attempts: document.getElementById('attempts-count'),
        speed: document.getElementById('speed-display'),

        btnStart: document.getElementById('btn-start'),
        btnStop: document.getElementById('btn-stop'),
        btnNewTarget: document.getElementById('btn-new-target'),
        btnSetTarget: document.getElementById('btn-set-target'),

        confMode: document.getElementById('config-mode'),
        confLength: document.getElementById('config-length'),
        confStrategy: document.getElementById('config-strategy'),
        confDelay: document.getElementById('config-delay'),
        delayVal: document.getElementById('delay-val'),

        customContainer: document.getElementById('custom-pattern-container'),
        customInput: document.getElementById('custom-pattern-input'),

        modal: document.getElementById('modal-overlay'),
        manualInput: document.getElementById('manual-input'),
        btnManualConfirm: document.getElementById('btn-manual-confirm'),
        btnManualCancel: document.getElementById('btn-manual-cancel')
    };

    function init() {
        cracker = new CodeCracker();
        bindEvents();
        updateConfig();
        generateNewTarget();
    }

    function bindEvents() {
        // Settings Changes
        els.confMode.addEventListener('change', function() {
            var isCustom = this.value === 'custom';
            if (isCustom) {
                els.customContainer.classList.remove('hidden');
                els.confLength.disabled = true;
            } else {
                els.customContainer.classList.add('hidden');
                els.confLength.disabled = false;
            }
            updateConfig();
            generateNewTarget(); // Mode change invalidates current target/slots
        });

        els.confLength.addEventListener('change', function() {
            updateConfig();
            generateNewTarget();
        });

        els.customInput.addEventListener('input', function() {
             // Debounce or just wait for blur?
             // For now, let's update on blur or manual trigger.
             // But actually, we need to rebuild slots.
             updateConfig();
             // Don't auto-generate target while typing, might be annoying.
        });

        els.customInput.addEventListener('blur', function() {
            generateNewTarget();
        });

        els.confStrategy.addEventListener('change', function() {
            updateConfig();
            // Changing strategy shouldn't necessarily reset target,
            // but it should reset attempts if running.
            if (!isRunning) cracker.reset();
        });

        els.confDelay.addEventListener('input', function() {
            delay = parseInt(this.value, 10);
            els.delayVal.textContent = delay;
        });

        // Controls
        els.btnStart.addEventListener('click', start);
        els.btnStop.addEventListener('click', stop);
        els.btnNewTarget.addEventListener('click', generateNewTarget);

        // Manual Target Modal
        els.btnSetTarget.addEventListener('click', function() {
            els.modal.classList.remove('hidden');
            els.manualInput.value = '';
            els.manualInput.focus();
        });

        els.btnManualCancel.addEventListener('click', function() {
            els.modal.classList.add('hidden');
        });

        els.btnManualConfirm.addEventListener('click', function() {
            var code = els.manualInput.value.trim().toUpperCase();
            if (!code) return;

            // If we are in standard mode, does this fit?
            // If custom mode, does it fit?
            // Simpler approach: Set the code, and if it doesn't match current config,
            // we might fail finding it (if sequential).
            // Let's verify against current cracker config.

            if (cracker.isValidConfig(code)) {
                cracker.setTarget(code);
                updateDisplay();
                els.modal.classList.add('hidden');
                resetGame();
            } else {
                alert("Code does not match current configuration rules!");
            }
        });
    }

    function updateConfig() {
        var mode = els.confMode.value;
        var len = parseInt(els.confLength.value, 10);
        var strat = els.confStrategy.value;
        var pattern = els.customInput.value || 'N-A'; // Default fallback

        cracker.configure({
            mode: mode,
            length: len,
            pattern: pattern,
            strategy: strat
        });
    }

    function generateNewTarget() {
        stop();
        cracker.generateTarget();
        resetGame();
        updateDisplay();
    }

    function resetGame() {
        cracker.reset();
        els.guessDisplay.textContent = '----';
        els.guessDisplay.classList.remove('success');
        els.targetDisplay.classList.remove('revealed');
        // els.targetDisplay.textContent = '????'; // Keep it revealed? Plan said maybe.
        // User plan: "until it matches those 4 digits".
        // Let's show the target.
        els.targetDisplay.textContent = cracker.target;

        els.statusText.textContent = 'READY';
        els.statusText.style.color = 'var(--text-color)';

        els.timer.textContent = '00:00:000';
        els.attempts.textContent = '0';
        els.speed.textContent = '0/s';
    }

    function start() {
        if (isRunning) return;

        // If already solved, reset first
        if (cracker.checkMatch()) {
            resetGame();
        }

        isRunning = true;
        startTime = Date.now();
        els.statusText.textContent = 'RUNNING';
        els.statusText.style.color = '#ffd700'; // Gold

        els.btnStart.disabled = true;
        els.btnStop.disabled = false;
        els.btnNewTarget.disabled = true;
        els.btnSetTarget.disabled = true;
        els.confMode.disabled = true;
        els.confLength.disabled = true;

        // Timer Loop
        timerInterval = setInterval(updateTimer, 37); // ~30fps for timer

        // Game Loop
        gameLoop();
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);

        els.statusText.textContent = 'STOPPED';
        els.statusText.style.color = '#ff4444';

        els.btnStart.disabled = false;
        els.btnStop.disabled = true;
        els.btnNewTarget.disabled = false;
        els.btnSetTarget.disabled = false;
        els.confMode.disabled = false;
        els.confLength.disabled = els.confMode.value === 'custom';
    }

    function gameLoop() {
        if (!isRunning) return;

        var loopStart = Date.now();

        // If delay is 0, we try to crunch as many as possible per frame
        // to make it look fast, but not freeze browser.
        // If delay > 0, we do one per delay.

        if (delay > 0) {
             processStep();
             if (isRunning) {
                 setTimeout(gameLoop, delay);
             }
        } else {
            // Batch processing for 0 delay
            // Run for max 16ms (one frame)
            while (Date.now() - loopStart < 16 && isRunning) {
                if (processStep()) break; // Found it
            }
            if (isRunning) {
                requestAnimationFrame(gameLoop);
            }
        }
    }

    function processStep() {
        var guess = cracker.nextGuess();
        els.guessDisplay.textContent = guess;
        els.attempts.textContent = cracker.attempts;

        if (cracker.checkMatch()) {
            victory();
            return true; // Stop processing
        }
        return false;
    }

    function victory() {
        stop();
        els.statusText.textContent = 'MATCH FOUND';
        els.statusText.style.color = '#00ff00';
        els.guessDisplay.classList.add('success');
        els.targetDisplay.classList.add('revealed');
    }

    function updateTimer() {
        var now = Date.now();
        var delta = now - startTime;

        var ms = delta % 1000;
        var s = Math.floor((delta / 1000) % 60);
        var m = Math.floor((delta / (1000 * 60)) % 60);

        els.timer.textContent =
            (m < 10 ? '0' + m : m) + ':' +
            (s < 10 ? '0' + s : s) + ':' +
            (ms < 100 ? (ms < 10 ? '00' + ms : '0' + ms) : ms);

        // Speed (Attempts / sec)
        var secs = delta / 1000;
        if (secs > 0) {
            var speed = Math.floor(cracker.attempts / secs);
            els.speed.textContent = speed + '/s';
        }
    }

    function updateDisplay() {
        els.targetDisplay.textContent = cracker.target;
        els.attempts.textContent = cracker.attempts;
    }

    // Init on load
    window.addEventListener('DOMContentLoaded', init);

})();
