(function() {
    'use strict';

    var cracker;
    var timerInterval; // For UI timer display
    var startTime;
    var isRunning = false;
    var delay = 0.5; // Default minimum
    var animationFrameId;
    var lastFrameTime = 0;
    var accumulatedTime = 0;
    var idleTimer;

    // Logarithmic Scale Constants
    // y = a * b^x
    // range: 0.5 to 50
    // slider: 0 to 100
    var LOG_MIN = 0.5;
    var LOG_MAX = 50;
    var SLIDER_MAX = 100;
    // 50 = 0.5 * b^100 => 100 = b^100 => b = 100^(1/100)
    var LOG_A = 0.5;
    var LOG_B = Math.pow(LOG_MAX / LOG_MIN, 1 / SLIDER_MAX);

    var ANCHORS = [0.5, 1, 5, 25, 50];

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
        confDelaySlider: document.getElementById('config-delay'), // Slider
        confDelayInput: document.getElementById('delay-input'),   // Number Input

        customContainer: document.getElementById('custom-pattern-container'),
        customInput: document.getElementById('custom-pattern-input'),

        // User Race Elements
        userGuessInput: document.getElementById('user-guess'),
        btnUserSubmit: document.getElementById('btn-user-submit'),

        modal: document.getElementById('modal-overlay'),
        manualInput: document.getElementById('manual-input'),
        btnManualConfirm: document.getElementById('btn-manual-confirm'),
        btnManualCancel: document.getElementById('btn-manual-cancel')
    };

    function init() {
        cracker = new CodeCracker();
        bindEvents();

        // Init Delay
        delay = LOG_MIN;
        updateDelayUI(delay);

        updateConfig();
        generateNewTarget();
    }

    function getDelayFromSlider(val) {
        return LOG_A * Math.pow(LOG_B, val);
    }

    function getSliderFromDelay(ms) {
        if (ms < LOG_MIN) ms = LOG_MIN;
        if (ms > LOG_MAX) ms = LOG_MAX;
        // x = log_b(y/a) = ln(y/a) / ln(b)
        return Math.log(ms / LOG_A) / Math.log(LOG_B);
    }

    function updateDelayUI(ms) {
        // Snap to anchors if close (within 5% relative difference?)
        // Actually, just let the input be precise, but snap slider visually?
        // Let's implement snapping on the SLIDER input event.

        els.confDelayInput.value = parseFloat(ms.toFixed(2));
        els.confDelaySlider.value = getSliderFromDelay(ms);
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
            updateInputMode();
            generateNewTarget();
        });

        els.confLength.addEventListener('change', function() {
            updateConfig();
            generateNewTarget();
        });

        els.customInput.addEventListener('input', function() {
             updateConfig();
        });

        els.customInput.addEventListener('blur', function() {
            generateNewTarget();
        });

        els.confStrategy.addEventListener('change', function() {
            updateConfig();
            if (!isRunning) cracker.reset();
        });

        // Delay Slider Logic
        els.confDelaySlider.addEventListener('input', function() {
            var val = parseFloat(this.value);
            var calculatedDelay = getDelayFromSlider(val);

            // Snapping
            // Find nearest anchor
            var nearest = null;
            var minDiff = Infinity;

            for (var i = 0; i < ANCHORS.length; i++) {
                var anchor = ANCHORS[i];
                var diff = Math.abs(calculatedDelay - anchor);
                if (diff < minDiff) {
                    minDiff = diff;
                    nearest = anchor;
                }
            }

            // If we are close to an anchor (e.g., within 10% of the anchor value logic distance)
            // Or just check raw difference?
            // Let's say if we are within 5 slider steps of the anchor's slider position
            var nearestSliderVal = getSliderFromDelay(nearest);
            if (Math.abs(val - nearestSliderVal) < 3) {
                 calculatedDelay = nearest;
                 // Don't snap the slider handle while dragging, it feels weird.
                 // Just snap the value used.
            }

            delay = calculatedDelay;
            els.confDelayInput.value = parseFloat(delay.toFixed(2));
        });

        // Delay Input Logic
        els.confDelayInput.addEventListener('change', function() {
            var val = parseFloat(this.value);
            if (isNaN(val)) val = LOG_MIN;
            if (val < LOG_MIN) val = LOG_MIN;
            // if (val > LOG_MAX) val = LOG_MAX; // Allow higher custom input? Prompt says 50, but maybe manual allows more?
            // Let's clamp to max 500 as per HTML attribute, but slider only goes to 50.
            // Wait, previous max was 500. Prompt says "millisecond ranges (0.5 to 50 ms)".
            // Let's stick to the prompt's focus but allow the input to go higher if needed?
            // "y = a * b^x" implies mapping. If input > 50, slider stays at max.

            delay = val;
            els.confDelaySlider.value = getSliderFromDelay(delay);
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

            if (cracker.isValidConfig(code)) {
                cracker.setTarget(code);
                updateDisplay();
                els.modal.classList.add('hidden');
                resetGame();
            } else {
                alert("Code does not match current configuration rules!");
            }
        });

        // User Race Logic
        els.btnUserSubmit.addEventListener('click', handleUserGuess);
        els.userGuessInput.addEventListener('keypress', function(e) {
            resetIdleTimer();
            if (e.key === 'Enter') handleUserGuess();
        });

        els.userGuessInput.addEventListener('input', resetIdleTimer);
        els.userGuessInput.addEventListener('focus', resetIdleTimer);
        els.userGuessInput.addEventListener('blur', clearIdleTimer);
    }

    function updateInputMode() {
        // "Numeric Fields ... Triggers UI_KEYBOARD_TYPE_NUMBER"
        // "Alpha Fields ... Triggers standard QWERTY"
        var mode = els.confMode.value;
        if (mode === 'numeric') {
            els.userGuessInput.inputMode = 'numeric'; // or 'decimal'
            els.userGuessInput.setAttribute('pattern', '[0-9]*');
        } else {
            els.userGuessInput.inputMode = 'text';
            els.userGuessInput.removeAttribute('pattern');
        }
    }

    // Glow / Idle Timer
    function resetIdleTimer() {
        els.userGuessInput.classList.remove('glow');
        clearTimeout(idleTimer);

        if (isRunning && !els.userGuessInput.disabled) {
            idleTimer = setTimeout(function() {
                els.userGuessInput.classList.add('glow');
            }, 5000);
        }
    }

    function clearIdleTimer() {
        clearTimeout(idleTimer);
        els.userGuessInput.classList.remove('glow');
    }

    function handleUserGuess() {
        if (!isRunning) return;
        resetIdleTimer();

        var guess = els.userGuessInput.value.trim().toUpperCase();
        if (guess === cracker.target) {
            victory('USER');
        } else {
            // Optional: Visual feedback for wrong guess?
            els.userGuessInput.style.borderColor = 'red';
            setTimeout(function() {
                els.userGuessInput.style.borderColor = '';
            }, 500);
        }
        els.userGuessInput.value = '';
    }

    function updateConfig() {
        var mode = els.confMode.value;
        var len = parseInt(els.confLength.value, 10);
        var strat = els.confStrategy.value;
        var pattern = els.customInput.value || 'N-A';

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
    }

    function resetGame() {
        cracker.reset();
        els.guessDisplay.textContent = '----';
        els.guessDisplay.classList.remove('success');
        els.targetDisplay.classList.remove('revealed');

        // Mask the target
        var masked = '';
        for (var i=0; i < cracker.target.length; i++) masked += '*';
        els.targetDisplay.textContent = masked;

        els.statusText.textContent = 'READY';
        els.statusText.style.color = 'var(--text-color)';

        els.timer.textContent = '00:00:000';
        els.attempts.textContent = '0';
        els.speed.textContent = '0/s';

        // Reset User Input
        els.userGuessInput.value = '';
        els.userGuessInput.disabled = true;
        els.btnUserSubmit.disabled = true;

        clearIdleTimer();
    }

    function start() {
        if (isRunning) return;

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

        // Enable User Input
        els.userGuessInput.disabled = false;
        els.btnUserSubmit.disabled = false;
        els.userGuessInput.focus();

        updateInputMode();
        resetIdleTimer();

        timerInterval = setInterval(updateTimer, 37);

        lastFrameTime = performance.now();
        accumulatedTime = 0;
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationFrameId);

        clearIdleTimer();

        els.statusText.textContent = 'STOPPED';
        els.statusText.style.color = '#ff4444';

        els.btnStart.disabled = false;
        els.btnStop.disabled = true;
        els.btnNewTarget.disabled = false;
        els.btnSetTarget.disabled = false;
        els.confMode.disabled = false;
        els.confLength.disabled = els.confMode.value === 'custom';

        // Disable User Input
        els.userGuessInput.disabled = true;
        els.btnUserSubmit.disabled = true;
    }

    function gameLoop(timestamp) {
        if (!isRunning) return;

        var delta = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        accumulatedTime += delta;

        // High Precision Step
        // If delay is very small, we might process multiple steps per frame.
        // If delay is large, we wait until accumulatedTime >= delay.

        // Safety cap to prevent freezing if delay is too small for JS to keep up
        var maxStepsPerFrame = 1000;
        var steps = 0;

        while (accumulatedTime >= delay && isRunning) {
            accumulatedTime -= delay;
            var won = processStep();
            steps++;
            if (won) break;

            if (steps > maxStepsPerFrame) {
                // We are falling behind. Drop accumulated time to avoid spiral.
                accumulatedTime = 0;
                break;
            }
        }

        if (isRunning) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function processStep() {
        var guess = cracker.nextGuess();
        els.guessDisplay.textContent = guess;
        els.attempts.textContent = cracker.attempts;

        if (cracker.checkMatch()) {
            victory('SYSTEM');
            return true;
        }
        return false;
    }

    function victory(winner) {
        stop(); // This clears timers

        // Reveal Target
        els.targetDisplay.textContent = cracker.target;
        els.targetDisplay.classList.add('revealed');
        els.guessDisplay.classList.add('success');

        if (winner === 'USER') {
            els.statusText.textContent = 'USER INTERCEPTED';
            els.statusText.style.color = '#38bdf8'; // Cyan
        } else {
            els.statusText.textContent = 'SYSTEM CRACKED';
            els.statusText.style.color = '#00ff00'; // Green
        }
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
        // Only update if not running (manual set)
        // If running, it stays masked until victory
        if (!isRunning) {
             var masked = '';
             for (var i=0; i < cracker.target.length; i++) masked += '*';
             els.targetDisplay.textContent = masked;
        }
    }

    // Init on load
    window.addEventListener('DOMContentLoaded', init);

})();
