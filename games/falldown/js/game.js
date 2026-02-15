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
    powerups: [],

    score: 0,
    level: 1,
    lives: 3,
    invincible: false,
    invincibleTimer: 0,
    speedMultiplier: 1.0,
    speedTimer: 0,
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
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
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
        this.level = 1;
        this.lives = 3;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.speedMultiplier = 1.0;
        this.speedTimer = 0;
        this.currentSpeed = this.baseSpeed;
        this.platforms = [];
        this.powerups = [];

        if (typeof UIManager !== 'undefined') {
            if (UIManager.updateLevel) UIManager.updateLevel(this.level);
            if (UIManager.updateLives) UIManager.updateLives(this.lives);
        }

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

        // Level scaling: Shrink gap by 2px per level
        const levelShrink = (this.level - 1) * 2;
        minGap = Math.max(30, minGap - levelShrink);
        maxGap = Math.max(40, maxGap - levelShrink);

        const gapWidth = minGap + Math.random() * (maxGap - minGap);
        const gapX = Math.random() * (this.width - gapWidth);

        this.platforms.push({
            y: y,
            height: this.PLATFORM_HEIGHT,
            gaps: [{start: gapX, end: gapX + gapWidth}]
        });

        // Spawn Powerup (10% chance)
        if (Math.random() < 0.1) {
            let spawnX = 0;
            const buffer = 20;
            // Decide left or right of gap
            if (gapX > buffer * 2 && Math.random() < 0.5) {
                spawnX = Math.random() * (gapX - buffer) + buffer/2;
            } else if (this.width - (gapX + gapWidth) > buffer * 2) {
                const start = gapX + gapWidth;
                spawnX = start + Math.random() * (this.width - start - buffer) + buffer/2;
            } else {
                return; // No space
            }

            this.powerups.push({
                x: spawnX,
                y: y - 10,
                type: ['speed', 'slow', 'ghost'][Math.floor(Math.random() * 3)],
                radius: 8
            });
        }
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
        // Timers
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        if (this.speedTimer > 0) {
            this.speedTimer -= dt;
            if (this.speedTimer <= 0) {
                this.speedMultiplier = 1.0;
            }
        }

        // 1. Update Game Speed (accelerate slowly over time)
        this.currentSpeed += dt * 2;

        // 2. Move Platforms (UP)
        for (let p of this.platforms) {
            p.y -= this.currentSpeed * dt;
        }

        // Move Powerups (UP)
        for (let p of this.powerups) {
            p.y -= this.currentSpeed * dt;
        }

        // Remove off-screen entities (top)
        this.platforms = this.platforms.filter(p => p.y + p.height > 0);
        this.powerups = this.powerups.filter(p => p.y + 20 > 0);

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
        const control = InputManager.getControlState(this.player.x); // { direction, intensity }

        // Horizontal Movement
        this.player.vx = control.direction * this.PLAYER_SPEED * this.speedMultiplier * control.intensity;
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

        // Optimized: only check platforms near player
        for (let p of this.platforms) {
            // Pass through if invincible/ghost
            if (this.invincible) continue;

            const pTop = p.y;
            // Estimated position in previous frame to detect crossing
            const prevPTop = pTop + this.currentSpeed * dt;

            const prevPlayerBottom = this.player.y + this.player.radius;
            const nextPlayerBottom = nextY + this.player.radius;

            // Check if we crossed the platform top edge
            // Tolerance +5 allows for "resting" logic where player is slightly inside/above
            if (prevPlayerBottom <= prevPTop + 5 && nextPlayerBottom >= pTop) {

                // Check if in gap
                let inGap = false;
                for (let gap of p.gaps) {
                    if (this.player.x > gap.start && this.player.x < gap.end) {
                        inGap = true;
                        break;
                    }
                }

                if (!inGap) {
                    // Collision!
                    // Snap to top
                    nextY = pTop - this.player.radius;
                    this.player.vy = 0;
                    onPlatform = true;
                }
            }
        }

        this.player.y = nextY;

        // Check Powerup Collisions
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const pup = this.powerups[i];
            const dx = this.player.x - pup.x;
            const dy = this.player.y - pup.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < this.player.radius + pup.radius) {
                this.applyPowerup(pup.type);
                this.powerups.splice(i, 1);
            }
        }

        // If on platform, we are naturally moved up by the platform in the next frame
        // because the platform moves up and we are constrained by gravity/collision next frame.
        // Wait, if we set vy=0, gravity increases vy next frame.
        // next frame: platform y decreases (moves up).
        // player y increases (gravity).
        // Collision check will catch it again and snap to top.
        // Perfect.

        // Game Over check (Top of screen)
        if (this.player.y - this.player.radius <= 0) {
            if (this.lives > 1) {
                this.loseLife();
            } else {
                this.gameOver();
            }
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

            // Level Up (Every 500 points)
            if (this.score > this.level * 500) {
                this.level++;
                this.currentSpeed += 30;
                if (typeof UIManager !== 'undefined' && UIManager.updateLevel) {
                    UIManager.updateLevel(this.level);
                }
            }

            if (typeof UIManager !== 'undefined') {
                UIManager.updateScore(Math.floor(this.score));
            }
        }
    },

    loseLife: function() {
        this.lives--;
        if (typeof UIManager !== 'undefined' && UIManager.updateLives) {
            UIManager.updateLives(this.lives);
        }

        // Respawn logic
        this.player.y = 100;
        this.player.vy = 0;
        this.invincible = true;
        this.invincibleTimer = 2.0; // 2 seconds

        // Clear top platforms to make safe entry
        this.platforms = this.platforms.filter(p => p.y > 200);
    },

    applyPowerup: function(type) {
        switch(type) {
            case 'speed':
                this.speedMultiplier = 1.5;
                this.speedTimer = 5.0;
                break;
            case 'slow':
                this.currentSpeed = Math.max(50, this.currentSpeed * 0.5);
                break;
            case 'ghost':
                this.invincible = true;
                this.invincibleTimer = 5.0;
                break;
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

        // Draw Powerups
        for (let p of this.powerups) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

            switch(p.type) {
                case 'speed': this.ctx.fillStyle = '#3498db'; break; // Blue
                case 'slow': this.ctx.fillStyle = '#2ecc71'; break; // Green
                case 'ghost': this.ctx.fillStyle = '#f1c40f'; break; // Yellow
                default: this.ctx.fillStyle = '#ffffff';
            }

            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Glow effect
            if (this.theme === 'neon') {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.ctx.fillStyle;
                this.ctx.stroke(); // Stroke again for glow
                this.ctx.shadowBlur = 0;
            }
        }

        // Draw Player
        if (this.player) {
            // Flash if invincible
            if (!this.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
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
