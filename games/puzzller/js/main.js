document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    game.start();

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
