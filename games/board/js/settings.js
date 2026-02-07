/**
 * SETTINGS MENU
 * File: js/settings.js
 */

class SettingsMenu {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'settings-menu';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: '2100', // Above overlay
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
        });

        const panel = document.createElement('div');
        Object.assign(panel.style, {
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '15px',
            width: '300px',
            color: '#333',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center'
        });

        const title = document.createElement('h2');
        title.textContent = 'Settings';
        panel.appendChild(title);

        // Sound Toggle
        this.addToggle(panel, 'Sound Effects', true);
        this.addToggle(panel, 'Background Music', false);
        this.addToggle(panel, 'Dark Mode', false);

        // Close Button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        Object.assign(closeBtn.style, {
            marginTop: '20px',
            padding: '10px 30px',
            fontSize: '16px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        });
        closeBtn.onclick = () => this.hide();
        panel.appendChild(closeBtn);

        this.container.appendChild(panel);
        document.body.appendChild(this.container);
    }

    addToggle(parent, labelText, checked) {
        const row = document.createElement('div');
        Object.assign(row.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            margin: '15px 0'
        });

        const label = document.createElement('span');
        label.textContent = labelText;
        label.style.fontWeight = 'bold';

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = checked;
        toggle.style.transform = 'scale(1.5)';

        row.appendChild(label);
        row.appendChild(toggle);
        parent.appendChild(row);
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
