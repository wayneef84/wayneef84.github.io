import Scene from '../../../negen/core/Scene.js';
import Physics from '../../../negen/utils/Physics.js';
import MathUtils from '../../../negen/utils/MathUtils.js';
import ParticleSystem from '../../../negen/graphics/ParticleSystem.js';

export default class BreakoutScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;

        this.particles = new ParticleSystem();

        this.paddle = { x: this.width/2 - 50, y: this.height - 50, w: 100, h: 20, color: '#0f0' };
        this.ball = { x: this.width/2, y: this.height/2, radius: 8, dx: 4, dy: -4, color: '#fff' };

        this.bricks = [];
        this.setupLevel();

        this.score = 0;
        this.lives = 3;
        this.state = 'playing'; // playing, gameover
    }

    setupLevel() {
        const rows = 5;
        const cols = 8;
        const padding = 10;
        const brickW = (this.width - (cols+1)*padding) / cols;
        const brickH = 20;

        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                this.bricks.push({
                    x: padding + c*(brickW+padding),
                    y: 60 + r*(brickH+padding),
                    w: brickW,
                    h: brickH,
                    active: true,
                    color: `hsl(${r * 40}, 70%, 50%)`
                });
            }
        }
    }

    update(dt) {
        if (this.state !== 'playing') {
            if (this.engine.input.pointer.isPressed || this.engine.input.keys['Space']) {
                this.resetGame();
            }
            return;
        }

        // Paddle (Keyboard)
        if (this.engine.input.keys['ArrowLeft']) this.paddle.x -= 8;
        if (this.engine.input.keys['ArrowRight']) this.paddle.x += 8;

        // Paddle (Mouse/Touch)
        // If mouse is moved, use it
        if (this.engine.input.pointer.isDown || (this.engine.input.pointer.x > 0)) {
             // Simple tracking
             if (this.engine.input.pointer.x > 0) {
                 this.paddle.x = this.engine.input.pointer.x - this.paddle.w/2;
             }
        }

        this.paddle.x = MathUtils.clamp(this.paddle.x, 0, this.width - this.paddle.w);

        // Ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Walls
        if (this.ball.x < 0 + this.ball.radius || this.ball.x > this.width - this.ball.radius) this.ball.dx *= -1;
        if (this.ball.y < 0 + this.ball.radius) this.ball.dy *= -1;

        // Death
        if (this.ball.y > this.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.state = 'gameover';
            } else {
                this.resetBall();
            }
        }

        // Paddle Collision
        if (Physics.checkAABB(
            {x: this.ball.x - this.ball.radius, y: this.ball.y - this.ball.radius, w: this.ball.radius*2, h: this.ball.radius*2},
            this.paddle
        )) {
            // Only bounce if moving down
            if (this.ball.dy > 0) {
                this.ball.dy *= -1;
                this.ball.y = this.paddle.y - this.ball.radius - 1;

                // Angled bounce
                const center = this.paddle.x + this.paddle.w/2;
                const diff = this.ball.x - center;
                this.ball.dx = diff * 0.15;

                this.engine.audio.playTone(220, 'square', 0.1);

                // Particles on paddle hit
                this.particles.emit(this.ball.x, this.ball.y, 5, { color: '#0f0', speed: 2, life: 0.5 });
            }
        }

        // Brick Collision
        const ballRect = {x: this.ball.x - this.ball.radius, y: this.ball.y - this.ball.radius, w: this.ball.radius*2, h: this.ball.radius*2};

        for (let brick of this.bricks) {
            if (!brick.active) continue;

            if (Physics.checkAABB(ballRect, brick)) {
                brick.active = false;
                this.ball.dy *= -1;
                this.score += 10;
                this.engine.audio.playTone(440 + (this.score), 'sine', 0.05);

                // Explosion
                this.particles.emit(
                    brick.x + brick.w/2,
                    brick.y + brick.h/2,
                    15,
                    { color: brick.color, speed: 4, life: 0.8 }
                );

                break;
            }
        }

        this.particles.update(dt);
    }

    resetBall() {
        this.ball.x = this.width/2;
        this.ball.y = this.height/2;
        this.ball.dy = -4;
        this.ball.dx = (Math.random() > 0.5 ? 4 : -4);
    }

    resetGame() {
        this.lives = 3;
        this.score = 0;
        this.state = 'playing';
        this.bricks = [];
        this.setupLevel();
        this.resetBall();
    }

    draw(renderer) {
        renderer.clear('#111');

        // Bricks
        for (let brick of this.bricks) {
            if (brick.active) {
                renderer.drawRectEffect(brick.x, brick.y, brick.w, brick.h, brick.color, 10, brick.color);
            }
        }

        // Particles
        this.particles.draw(renderer);

        // Paddle
        renderer.drawRectEffect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, this.paddle.color, 15, this.paddle.color);

        // Ball
        renderer.drawCircleEffect(this.ball.x, this.ball.y, this.ball.radius, this.ball.color, 10, '#fff');

        // UI
        renderer.drawText(`Score: ${this.score}`, 20, 30, 20, '#fff', 'left');
        renderer.drawText(`Lives: ${this.lives}`, this.width - 20, 30, 20, '#fff', 'right');

        if (this.state === 'gameover') {
            renderer.drawText('GAME OVER', this.width/2, this.height/2, 40, '#f00');
            renderer.drawText('Tap to Restart', this.width/2, this.height/2 + 50, 20, '#fff');
        }
    }
}
