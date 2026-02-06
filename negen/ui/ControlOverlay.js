/**
 * ControlOverlay.js
 * A reusable UI system for Virtual Gamepad Controls (Buttons, D-Pads, Joysticks).
 * Renders on top of the Game Canvas or via a separate DOM layer.
 *
 * DESIGN:
 * - Uses DOM elements for better accessibility and touch handling than Canvas UI.
 * - Auto-detects Mobile/Touch to show itself.
 * - Dispatches keyboard events or injects into InputManager.
 */

export default class ControlOverlay {
    constructor(engine) {
        this.engine = engine;
        this.container = null;
        this.active = false;
        this.layout = 'none'; // 'dpad', 'arcade', 'single'
        this.onInput = null; // Callback: (action, state) => {}
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'negen-control-overlay';
        Object.assign(this.container.style, {
            position: 'absolute',
            top: '0', left: '0', width: '100%', height: '100%',
            pointerEvents: 'none', // Allow clicks through empty space
            zIndex: '1000',
            display: 'none',
            overflow: 'hidden'
        });

        // Append to engine container or body
        // Assuming engine.canvas is in a wrapper or body
        document.body.appendChild(this.container);

        // Detect touch
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) {
            this.active = true;
            this.container.style.display = 'block';
        }
    }

    setLayout(type) {
        if (!this.container) this.init();
        this.container.innerHTML = ''; // Clear existing
        this.layout = type;

        if (!this.active) return; // Don't build if not touch

        switch(type) {
            case 'dpad':
                this._buildDPad();
                this._buildActionBtn('A', 'right', 'bottom');
                break;
            case 'arcade':
                this._buildDPad(); // or Joystick
                this._buildActionBtn('B', 'right', 'bottom', { right: '90px', bottom: '40px'});
                this._buildActionBtn('A', 'right', 'bottom');
                break;
            case 'single':
                // Giant invisible tap zone? or just one button
                this._buildActionBtn('ACTION', 'center', 'bottom', { width: '100%', height: '50%', bottom: '0', left: '0', opacity: '0.1' });
                break;
        }
    }

    _buildDPad() {
        const dpad = document.createElement('div');
        Object.assign(dpad.style, {
            position: 'absolute',
            bottom: '40px', left: '40px',
            width: '150px', height: '150px',
            pointerEvents: 'auto'
        });

        // Simple cross layout
        const makeBtn = (dir, css) => {
            const btn = document.createElement('div');
            btn.className = `negen-dpad-${dir}`;
            Object.assign(btn.style, {
                position: 'absolute',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)'
            }, css);

            this._bindTouch(btn, dir.toUpperCase()); // "UP", "DOWN"
            dpad.appendChild(btn);
        };

        const size = '50px';
        makeBtn('up', { top: '0', left: '50px', width: size, height: size });
        makeBtn('down', { bottom: '0', left: '50px', width: size, height: size });
        makeBtn('left', { top: '50px', left: '0', width: size, height: size });
        makeBtn('right', { top: '50px', right: '0', width: size, height: size });

        this.container.appendChild(dpad);
    }

    _buildActionBtn(label, anchorX, anchorY, overrides = {}) {
        const btn = document.createElement('div');
        Object.assign(btn.style, {
            position: 'absolute',
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'rgba(0, 255, 255, 0.2)',
            border: '2px solid rgba(0, 255, 255, 0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'white', fontWeight: 'bold', fontFamily: 'monospace',
            pointerEvents: 'auto',
            userSelect: 'none',
            [anchorX]: '40px',
            [anchorY]: '40px'
        }, overrides);

        btn.innerText = label;
        this._bindTouch(btn, label);
        this.container.appendChild(btn);
    }

    _bindTouch(el, actionName) {
        const start = (e) => {
            e.preventDefault();
            e.stopPropagation();
            el.style.background = 'rgba(255, 255, 255, 0.5)';
            // Inject into InputManager
            this._trigger(actionName, true);
        };
        const end = (e) => {
            e.preventDefault();
            e.stopPropagation();
            el.style.background = 'rgba(255, 255, 255, 0.2)'; // Revert (simplified)
            this._trigger(actionName, false);
        };

        el.addEventListener('touchstart', start, {passive: false});
        el.addEventListener('touchend', end, {passive: false});
        el.addEventListener('mousedown', start); // Debug on desktop
        el.addEventListener('mouseup', end);
    }

    _trigger(virtualKey, isDown) {
        // We inject these as "Virtual Keys" into the InputManager keys object
        // This is a hack to allow seamless profile binding.
        // e.g. InputManager.bindAction('JUMP', ['Space', 'Virtual_A']);
        if (this.engine.input) {
            const code = `Virtual_${virtualKey}`; // Virtual_UP, Virtual_A
            this.engine.input.keys[code] = isDown;
        }
    }
}
