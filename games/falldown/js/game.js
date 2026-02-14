/**
 * game.js
 * Main game engine for Fall Down.
 */

const Game = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    state: 'MENU', // MENU, PLAYING, GAMEOVER, PAUSED
    animationId: null,
    lastTime: 0,

    // Game entities
    player: null,
    platforms: [],

    score: 0,
    baseSpeed: 0,
    currentSpeed: 0,

    // Settings
    theme: 'classic',
    difficulty: 'normal',

    // Constants
    PLAYER_RADIUS: 10,
    PLATFORM_HEIGHT: 15,
    PLATFORM_GAP: 120, // Vertical distance between platforms
    GRAVITY: 800,
    PLAYER_SPEED: 350,

    init: function() {
        console.log("Game initializing...");
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error("Canvas element not found!");
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // Handle resize
        window.addEventListener('resize', () => this.resize());
        this.resize();

        // Load settings
        if (typeof StorageManager !== 'undefined') {
            const settings = StorageManager.getSettings();
            this.setTheme(settings.theme || 'classic');
            this.setDifficulty(settings.difficulty || 'normal');
        }

        // Start loop
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    },

    resize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    },

    setTheme: function(themeName) {
        this.theme = themeName;
        document.body.className = 'theme-' + themeName;
    },

    setDifficulty: function(difficulty) {
        this.difficulty = difficulty;
        switch(difficulty) {
            case 'easy':
                this.baseSpeed = 100; // Pixels per second
                break;
            case 'hard':
                this.baseSpeed = 250;
                break;
            case 'normal':
            default:
                this.baseSpeed = 160;
                break;
        }
    },

    start: function() {
        this.reset();
        this.state = 'PLAYING';
        if (typeof UIManager !== 'undefined') {
            UIManager.showHUD();
            UIManager.hideMenu();
        }
    },

    reset: function() {
        this.score = 0;
        this.currentSpeed = this.baseSpeed;
        this.platforms = [];

        // Initialize player
        this.player = {
            x: this.width / 2,
            y: 50,
            vx: 0,
            vy: 0,
            radius: this.PLAYER_RADIUS
        };

        // Generate initial platforms
        // Start filling from bottom up to leave space at top
        let startY = this.height;
        while (startY < this.height * 2) {
             this.generatePlatform(startY);
             startY += this.PLATFORM_GAP;
        }
    },

    generatePlatform: function(y) {
        // Gap width based on difficulty
        let minGap = 70;
        let maxGap = 120;

        if (this.difficulty === 'hard') {
            minGap = 50;
            maxGap = 90;
        } else if (this.difficulty === 'easy') {
            minGap = 90;
            maxGap = 150;
        }

        const gapWidth = minGap + Math.random() * (maxGap - minGap);
        const gapX = Math.random() * (this.width - gapWidth);

        this.platforms.push({
            y: y,
            height: this.PLATFORM_HEIGHT,
            gaps: [{start: gapX, end: gapX + gapWidth}]
        });
    },

    loop: function(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Cap dt to prevent huge jumps if tab inactive
        const safeDt = Math.min(dt, 0.1);

        if (this.state === 'PLAYING') {
            this.update(safeDt);
        }

        this.draw();

        this.animationId = requestAnimationFrame((t) => this.loop(t));
    },

    update: function(dt) {
        // 1. Update Game Speed (accelerate slowly over time)
        this.currentSpeed += dt * 2;

        // 2. Move Platforms (UP)
        for (let p of this.platforms) {
            p.y -= this.currentSpeed * dt;
        }

        // Remove off-screen platforms (top)
        this.platforms = this.platforms.filter(p => p.y + p.height > 0);

        // Add new platforms at bottom
        const lastPlatform = this.platforms[this.platforms.length - 1];
        if (lastPlatform) {
            // If the last platform has moved up enough to fit a new one
            if (lastPlatform.y < this.height + 100) { // Keep buffer below screen
                 this.generatePlatform(lastPlatform.y + this.PLATFORM_GAP);
            }
        } else {
            this.generatePlatform(this.height);
        }

        // 3. Move Player
        const control = InputManager.getControlState(); // { direction, intensity }

        // Horizontal Movement
        this.player.vx = control.direction * this.PLAYER_SPEED * control.intensity;
        this.player.x += this.player.vx * dt;

        // Wall collisions
        if (this.player.x < this.player.radius) {
            this.player.x = this.player.radius;
            this.player.vx = 0;
        } else if (this.player.x > this.width - this.player.radius) {
            this.player.x = this.width - this.player.radius;
            this.player.vx = 0;
        }

        // Vertical Movement (Gravity)
        this.player.vy += this.GRAVITY * dt;
        let nextY = this.player.y + this.player.vy * dt;

        // Platform Collisions
        let onPlatform = false;

        // We check if we crossed a platform boundary
        // Optimized: only check platforms near player
        for (let p of this.platforms) {
            // Platform top edge
            const pTop = p.y;
            const pBottom = p.y + p.height;

            // Check if player is within vertical range of platform
            // We use previous Y and next Y to detect crossing
            const playerBottom = this.player.y + this.player.radius;
            const nextPlayerBottom = nextY + this.player.radius;

            // Crossing the top of a platform downwards
            if (playerBottom <= pTop + 5 && nextPlayerBottom >= pTop) {
                // Check if in gap
                let inGap = false;
                for (let gap of p.gaps) {
                    if (this.player.x > gap.start && this.player.x < gap.end) {
                        inGap = true;
                        break;
                    }
                }

                if (!inGap) {
                    // Landed
                    nextY = pTop - this.player.radius;
                    this.player.vy = 0;
                    onPlatform = true;
                }
            }
        }

        this.player.y = nextY;

        // If on platform, we are naturally moved up by the platform in the next frame
        // because the platform moves up and we are constrained by gravity/collision next frame.
        // Wait, if we set vy=0, gravity increases vy next frame.
        // next frame: platform y decreases (moves up).
        // player y increases (gravity).
        // Collision check will catch it again and snap to top.
        // Perfect.

        // Game Over check (Top of screen)
        if (this.player.y - this.player.radius <= 0) {
            this.gameOver();
        }

        // Bottom check (Floor)
        if (this.player.y + this.player.radius >= this.height) {
            this.player.y = this.height - this.player.radius;
            this.player.vy = 0;
        }

        // Score update (based on survival time * speed factor)
        // Or simply add points for each platform passed?
        // Time based is smoother.
        if (this.state === 'PLAYING') {
            this.score += dt * (this.currentSpeed / 10);
            if (typeof UIManager !== 'undefined') {
                UIManager.updateScore(Math.floor(this.score));
            }
        }
    },

    draw: function() {
        // Clear screen
        const colors = this.getThemeColors();

        // Background
        if (this.theme === 'modern') {
            const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#2c3e50');
            grad.addColorStop(1, '#000000');
            this.ctx.fillStyle = grad;
        } else {
            this.ctx.fillStyle = colors.background;
        }
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Apply global effects for Neon
        if (this.theme === 'neon') {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = colors.platform;
        } else {
            this.ctx.shadowBlur = 0;
        }

        // Draw Platforms
        this.ctx.fillStyle = colors.platform;
        for (let p of this.platforms) {
            // Draw left segment
            let currentX = 0;
            for (let gap of p.gaps) {
                if (this.theme === 'modern') {
                    this.drawRoundedRect(currentX, p.y, gap.start - currentX, p.height, 5);
                } else {
                    this.ctx.fillRect(currentX, p.y, gap.start - currentX, p.height);
                }
                currentX = gap.end;
            }
            // Draw right segment
            if (this.theme === 'modern') {
                this.drawRoundedRect(currentX, p.y, this.width - currentX, p.height, 5);
            } else {
                this.ctx.fillRect(currentX, p.y, this.width - currentX, p.height);
            }
        }

        // Draw Player
        if (this.player) {
            this.ctx.fillStyle = colors.player;
            if (this.theme === 'neon') {
                this.ctx.shadowColor = colors.player;
            }

            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Highlights
            if (this.theme === 'modern') {
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
                this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
                this.ctx.beginPath();
                this.ctx.arc(this.player.x - this.player.radius*0.3, this.player.y - this.player.radius*0.3, this.player.radius * 0.4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Reset shadow
        this.ctx.shadowBlur = 0;
    },

    drawRoundedRect: function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
        this.ctx.fill();
    },

    gameOver: function() {
        this.state = 'GAMEOVER';

        // Check High Score
        let isNewHigh = false;
        if (typeof StorageManager !== 'undefined') {
            const finalScore = Math.floor(this.score);
            isNewHigh = StorageManager.isHighScore(finalScore);

            // If not a high score but we want to show it in list, we save it?
            // Usually we only ask name if it's a high score.
        }

        if (typeof UIManager !== 'undefined') {
            UIManager.showGameOver(Math.floor(this.score), isNewHigh);
        }
    },

    getThemeColors: function() {
        const colors = {
            classic: { background: '#000000', player: '#ff0000', platform: '#00ff00', text: '#ffffff' },
            modern: { background: '#2c3e50', player: '#e74c3c', platform: '#ecf0f1', text: '#ecf0f1' },
            neon: { background: '#050505', player: '#ff00ff', platform: '#00ffff', text: '#ffff00' }
        };
        return colors[this.theme] || colors.classic;
    }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}
