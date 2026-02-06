/**
 * BOARD GAME OVERLAY
 * File: js/overlay.js
 * Handles game selection and navigation
 */

class GameOverlay {
    constructor(onSelect, onSettings) {
        this.onSelect = onSelect;
        this.onSettings = onSettings;
        this.container = null;
        this.isVisible = false;

        this.games = [
            { id: 'xiangqi', name: 'Xiangqi', icon: '♟️', color: '#d32f2f' },
            { id: 'chess', name: 'Chess', icon: '♔', color: '#424242' },
            { id: 'checkers', name: 'Checkers', icon: '◎', color: '#d84315' },
            { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌', color: '#1976d2' },
            { id: 'connect4', name: 'Connect 4', icon: '🔴', color: '#fbc02d' },
            { id: 'mancala', name: 'Mancala', icon: '🥣', color: '#5d4037' },
            { id: 'dots', name: 'Dots & Boxes', icon: '⚄', color: '#388e3c' },
            { id: 'battleship', name: 'Battleship', icon: '⚓', color: '#0288d1' }
        ];

        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'game-overlay';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: '2000',
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        });

        // Header
        const header = document.createElement('h1');
        header.textContent = "Select a Game";
        header.style.marginBottom = '30px';
        this.container.appendChild(header);

        // Grid
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '20px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '70vh',
            overflowY: 'auto',
            padding: '20px'
        });

        this.games.forEach(game => {
            const card = document.createElement('div');
            Object.assign(card.style, {
                backgroundColor: game.color,
                borderRadius: '15px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s',
                aspectRatio: '1/1'
            });

            card.onmouseover = () => card.style.transform = 'scale(1.05)';
            card.onmouseout = () => card.style.transform = 'scale(1.0)';
            card.onclick = () => this.selectGame(game.id);

            const icon = document.createElement('div');
            icon.textContent = game.icon;
            icon.style.fontSize = '48px';
            icon.style.marginBottom = '10px';

            const label = document.createElement('div');
            label.textContent = game.name;
            label.style.fontWeight = 'bold';
            label.style.textAlign = 'center';

            card.appendChild(icon);
            card.appendChild(label);
            grid.appendChild(card);
        });

        this.container.appendChild(grid);

        // Footer Buttons
        const footer = document.createElement('div');
        footer.style.marginTop = '30px';

        const settingsBtn = document.createElement('button');
        settingsBtn.textContent = '⚙ Settings';
        this.styleButton(settingsBtn);
        settingsBtn.onclick = () => {
             if(this.onSettings) this.onSettings();
        };

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        this.styleButton(closeBtn);
        closeBtn.style.marginLeft = '20px';
        closeBtn.style.backgroundColor = '#666';
        closeBtn.onclick = () => this.hide();

        footer.appendChild(settingsBtn);
        footer.appendChild(closeBtn);
        this.container.appendChild(footer);

        document.body.appendChild(this.container);
    }

    styleButton(btn) {
        Object.assign(btn.style, {
            padding: '10px 20px',
            fontSize: '18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#ff9800',
            color: 'white',
            cursor: 'pointer'
        });
    }

    show() {
        this.container.style.display = 'flex';
        this.isVisible = true;
    }

    hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    selectGame(id) {
        this.hide();
        if (this.onSelect) this.onSelect(id);
    }
}
