document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport');
    const logOutput = document.getElementById('console-log');
    const navBtns = document.querySelectorAll('.nav-btn');
    const audioToggle = document.querySelector('.audio-toggle');

    let isMuted = true;

    // Typewriter effect state
    let typeQueue = [];
    let isTyping = false;

    function log(message) {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const line = `[${timestamp}] ${message}`;

        const p = document.createElement('div');
        p.className = 'log-entry';
        p.textContent = line;
        logOutput.appendChild(p);
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    function typeWriterLog(message) {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const fullText = `[${timestamp}] ${message}`;

        const p = document.createElement('div');
        p.className = 'log-entry';
        logOutput.appendChild(p);

        let i = 0;
        const speed = 20;

        function type() {
            if (i < fullText.length) {
                p.textContent += fullText.charAt(i);
                i++;
                logOutput.scrollTop = logOutput.scrollHeight;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Init
    typeWriterLog('System Initialized. Awaiting input...');

    // Load first artifact by default after delay
    setTimeout(() => {
        navBtns[0].click();
    }, 1500);

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Active state
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.dataset.target;
            const desc = btn.dataset.desc;

            log(`Accessing ${target}...`);

            // Iframe load
            viewport.src = target;

            // Description Log
            setTimeout(() => {
                typeWriterLog(desc);
            }, 500);

            // Play sound (simulated if we had audio files, for now just log)
            if (!isMuted) {
                // beep();
            }
        });
    });

    audioToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        audioToggle.textContent = isMuted ? '[MUTE AUDIO]' : '[AUDIO ON]';
        log(`Audio system ${isMuted ? 'disabled' : 'enabled'}.`);
    });
});
