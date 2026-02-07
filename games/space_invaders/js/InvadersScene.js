import Scene from '../../../negen/core/Scene.js';
import Physics from '../../../negen/utils/Physics.js';
import MathUtils from '../../../negen/utils/MathUtils.js';
import Timer from '../../../negen/utils/Timer.js';
import ParticleSystem from '../../../negen/graphics/ParticleSystem.js';

export default class InvadersScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;
        this.timer = new Timer();
        this.particles = new ParticleSystem();

        this.player = { x: this.width/2 - 20, y: this.height - 50, w: 40, h: 20, color: '#0f0', speed: 5 };

        this.bullets = []; // {x, y, w, h, dy, color, type: 'player'|'enemy'}
        this.enemies = []; // {x, y, w, h, color, active: true}

        this.enemyRows = 5;
        this.enemyCols = 11;
        this.enemyDir = 1; // 1 = right, -1 = left
        this.enemySpeed = 10; // Pixel jump per step
        this.enemyStepTimer = 0;
        this.enemyStepInterval = 1000; // ms

        this.setupLevel();

        this.score = 0;
        this.lives = 3;
        this.state = 'playing';

        // Bind FIRE action so we can use isJustPressed for single-shot firing
        this.engine.input.bindAction('FIRE', ['Space'], 150);
    }

    setupLevel() {
        const startX = 50;
        const startY = 80;
        const gap = 15;
        const w = 30;
        const h = 20;

        this.enemies = [];
        for (let r=0; r<this.enemyRows; r++) {
            for (let c=0; c<this.enemyCols; c++) {
                this.enemies.push({
                    x: startX + c * (w + gap),
                    y: startY + r * (h + gap),
                    w: w,
                    h: h,
                    active: true,
                    color: '#fff',
                    row: r,
                    col: c
                });
            }
        }
    }

    update(dt) {
        this.timer.update(dt);
        if (this.state !== 'playing') return;

        // --- Player ---
        if (this.engine.input.keys['ArrowLeft']) this.player.x -= this.player.speed;
        if (this.engine.input.keys['ArrowRight']) this.player.x += this.player.speed;

        // Touch
        if (this.engine.input.pointer.isDown) {
            if (this.engine.input.pointer.x < this.width/2) this.player.x -= this.player.speed;
            else this.player.x += this.player.speed;
        }

        this.player.x = MathUtils.clamp(this.player.x, 10, this.width - this.player.w - 10);

        // Shoot
        if (this.engine.input.isJustPressed('FIRE') || this.engine.input.pointer.isPressed) {
            // Limit player bullets
            if (this.bullets.filter(b => b.type === 'player').length < 1) {
                this.bullets.push({
                    x: this.player.x + this.player.w/2 - 2,
                    y: this.player.y - 10,
                    w: 4,
                    h: 10,
                    dy: -10,
                    color: '#0f0',
                    type: 'player'
                });
                this.engine.audio.playTone(880, 'square', 0.1);
            }
        }

        // --- Enemies ---
        this.enemyStepTimer += dt;
        if (this.enemyStepTimer >= this.enemyStepInterval) {
            this.stepEnemies();
            this.enemyStepTimer = 0;
        }

        // Random Enemy Shot
        if (Math.random() < 0.02) {
             const activeEnemies = this.enemies.filter(e => e.active);
             if (activeEnemies.length > 0) {
                 const shooter = activeEnemies[MathUtils.randomInt(0, activeEnemies.length-1)];
                 this.bullets.push({
                     x: shooter.x + shooter.w/2 - 2,
                     y: shooter.y + shooter.h,
                     w: 4,
                     h: 10,
                     dy: 5,
                     color: '#fff',
                     type: 'enemy'
                 });
             }
        }

        // --- Bullets ---
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            b.y += b.dy;

            // Bounds
            if (b.y < 0 || b.y > this.height) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Collision
            let hit = false;

            if (b.type === 'player') {
                for (let e of this.enemies) {
                    if (e.active && Physics.checkAABB(b, e)) {
                        e.active = false;
                        hit = true;
                        this.score += 10;
                        this.engine.audio.playTone(200, 'noise', 0.1); // Explosion

                        // Particles
                        this.particles.emit(e.x + e.w/2, e.y + e.h/2, 10, { color: '#fff', size: 4, life: 0.6 });

                        // Speed up
                        this.enemyStepInterval = Math.max(100, this.enemyStepInterval * 0.98);
                        break;
                    }
                }
            } else if (b.type === 'enemy') {
                if (Physics.checkAABB(b, this.player)) {
                    hit = true;
                    this.lives--;
                    this.engine.audio.playTone(100, 'sawtooth', 0.5);
                    this.particles.emit(this.player.x + this.player.w/2, this.player.y, 20, { color: '#0f0', size: 5, life: 1.0 });

                    if (this.lives <= 0) {
                        this.state = 'gameover';
                    }
                }
            }

            if (hit) {
                this.bullets.splice(i, 1);
            }
        }

        this.particles.update(dt);

        // Check win
        if (!this.enemies.some(e => e.active)) {
             // Respawn harder?
             this.setupLevel();
             this.enemyStepInterval *= 0.8;
        }
    }

    stepEnemies() {
        let moveDown = false;
        const activeEnemies = this.enemies.filter(e => e.active);

        // Check edges
        for (let e of activeEnemies) {
            if (this.enemyDir === 1 && e.x + e.w > this.width - 20) {
                moveDown = true;
            } else if (this.enemyDir === -1 && e.x < 20) {
                moveDown = true;
            }
        }

        if (moveDown) {
            this.enemyDir *= -1;
            for (let e of this.enemies) {
                e.y += 20;
            }
            // Check invasion
            for (let e of activeEnemies) {
                if (e.y + e.h >= this.player.y) {
                    this.state = 'gameover';
                }
            }
        } else {
            for (let e of this.enemies) {
                e.x += this.enemySpeed * this.enemyDir;
            }
        }
        this.engine.audio.playTone(100 - (this.enemyStepInterval/20), 'square', 0.05);
    }

    draw(renderer) {
        renderer.clear('#000');

        // Player
        renderer.drawRect(this.player.x, this.player.y, this.player.w, this.player.h, this.player.color);
        // Player turret
        renderer.drawRect(this.player.x + this.player.w/2 - 5, this.player.y - 5, 10, 5, this.player.color);

        // Enemies
        for (let e of this.enemies) {
            if (e.active) {
                // Simple alien shape (box with eyes?)
                renderer.drawRect(e.x, e.y, e.w, e.h, e.color);
                renderer.drawRect(e.x + 5, e.y + 5, 5, 5, '#000'); // Eye
                renderer.drawRect(e.x + e.w - 10, e.y + 5, 5, 5, '#000'); // Eye
            }
        }

        this.particles.draw(renderer);

        // Bullets
        for (let b of this.bullets) {
            renderer.drawRect(b.x, b.y, b.w, b.h, b.color);
        }

        // UI
        renderer.drawText(`SCORE: ${this.score}`, 20, 30, 20, '#fff', 'left');
        renderer.drawText(`LIVES: ${this.lives}`, this.width - 20, 30, 20, '#fff', 'right');

        if (this.state === 'gameover') {
            renderer.drawText('GAME OVER', this.width/2, this.height/2, 40, '#f00');
        }
    }
}
