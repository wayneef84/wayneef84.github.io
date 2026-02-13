class UIManager {
    constructor(simEngine, emuAdapter) {
        this.simEngine = simEngine;
        this.emuAdapter = emuAdapter;
        this.keys = document.querySelectorAll('.key');
    }

    init() {
        this.keys.forEach(key => {
            key.addEventListener('click', (e) => {
                const btn = e.target.closest('.key');
                if (btn) this.handleInput(btn);
            });
            // Handle touchstart for better mobile responsiveness if needed, but click works for now
        });
    }

    handleInput(button) {
        const keyData = button.dataset.key;

        // Visual feedback
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 100);

        console.log("Key pressed:", keyData);

        // Basic Navigation Simulation for Menu
        if (keyData === 'UP') {
            this.simEngine.moveCursor('UP');
        } else if (keyData === 'DOWN') {
            this.simEngine.moveCursor('DOWN');
        } else if (keyData === 'ENTER') {
            alert("Initialization Required: Please Load ROM to execute Z80 binary.");
        } else if (["1", "2", "3", "4"].includes(keyData)) {
             // Directly select menu item
             alert("Initialization Required: Please Load ROM to execute Z80 binary.");
        } else {
            // Other keys
            // For now, just log or do nothing.
        }
    }
}
