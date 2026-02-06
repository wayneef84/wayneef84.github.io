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
            if (e.key === 'Enter') handleUserGuess();
        });
    }

    function handleUserGuess() {
        if (!isRunning) return;

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
        // Don't update display here, handled in resetGame to keep masked
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

        timerInterval = setInterval(updateTimer, 37);
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

        // Disable User Input
        els.userGuessInput.disabled = true;
        els.btnUserSubmit.disabled = true;
    }

    function gameLoop() {
        if (!isRunning) return;

        var loopStart = Date.now();

        if (delay > 0) {
             processStep();
             if (isRunning) {
                 setTimeout(gameLoop, delay);
             }
        } else {
            while (Date.now() - loopStart < 16 && isRunning) {
                if (processStep()) break;
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
            victory('SYSTEM');
            return true;
        }
        return false;
    }

    function victory(winner) {
        stop();

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
