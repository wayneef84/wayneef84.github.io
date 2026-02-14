document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    game.start();

    // Canvas Swipe Controls
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        // Threshold for swipe
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
            return;
        }

        let key = '';
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal
            key = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
        } else {
            // Vertical
            key = dy > 0 ? 'ArrowDown' : 'ArrowUp';
        }

        if (key) {
            game.input.simulateKey(key, true);
            setTimeout(() => game.input.simulateKey(key, false), 50);
        }
    }, { passive: false });

    // Touch Controls Binding
    const controls = {
        'btn-up': 'ArrowUp',
        'btn-down': 'ArrowDown',
        'btn-left': 'ArrowLeft',
        'btn-right': 'ArrowRight',
        'btn-enter': 'Enter',
        'btn-esc': 'Escape',
        'btn-r': 'KeyR',
        'btn-c': 'KeyC'
    };

    function bindBtn(id, code) {
        const btn = document.getElementById(id);
        if (!btn) return;

        // Helper to trigger key down
        const press = (e) => {
            if (e.cancelable) e.preventDefault();
            game.input.simulateKey(code, true);
            btn.classList.add('active');
        };

        // Helper to trigger key up
        const release = (e) => {
            if (e.cancelable) e.preventDefault();
            game.input.simulateKey(code, false);
            btn.classList.remove('active');
        };

        // Touch events
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });

        // Mouse events for testing on desktop
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
    }

    Object.keys(controls).forEach(id => {
        bindBtn(id, controls[id]);
    });
});
