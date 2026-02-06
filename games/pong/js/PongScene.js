import Scene from '../../../negen/core/Scene.js';
import Physics from '../../../negen/utils/Physics.js';
import MathUtils from '../../../negen/utils/MathUtils.js';

export default class PongScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;

        this.paddleW = 15;
        this.paddleH = 80;
        const padY = this.height/2 - this.paddleH/2;

        // Left Paddle (Player)
        this.p1 = { x: 50, y: padY, w: this.paddleW, h: this.paddleH, score: 0, color: '#fff' };

        // Right Paddle (CPU)
        this.p2 = { x: this.width - 50 - this.paddleW, y: padY, w: this.paddleW, h: this.paddleH, score: 0, color: '#fff' };

        // Ball
        this.ball = { x: this.width/2, y: this.height/2, w: 15, h: 15, dx: 0, dy: 0, speed: 6 };

        this.resetBall();

        this.dividerStyle = { x: this.width/2 - 2, w: 4, h: 20, gap: 15 };
    }

    resetBall(winner) {
        this.ball.x = this.width/2 - this.ball.w/2;
        this.ball.y = this.height/2 - this.ball.h/2;
        this.ball.speed = 6;

        // Serve to the loser or random
        let dir = winner === 'p1' ? 1 : (winner === 'p2' ? -1 : (Math.random() > 0.5 ? 1 : -1));

        this.ball.dx = dir * this.ball.speed;
        this.ball.dy = (Math.random() * 2 - 1) * 4;
    }

    update(dt) {
        // P1 Input (Mouse/Touch or Keys)
        if (this.engine.input.keys['ArrowUp'] || this.engine.input.keys['KeyW']) {
            this.p1.y -= 8;
        }
        if (this.engine.input.keys['ArrowDown'] || this.engine.input.keys['KeyS']) {
            this.p1.y += 8;
        }

        // Mouse follow (Y only)
        if (this.engine.input.pointer.isDown || this.engine.input.pointer.y > 0) {
            // Only update if we have moved recently or are touching
            if (this.engine.input.pointer.y > 0) {
                 // Lerp for smoothness
                 this.p1.y = MathUtils.lerp(this.p1.y, this.engine.input.pointer.y - this.p1.h/2, 0.2);
            }
        }

        this.p1.y = MathUtils.clamp(this.p1.y, 10, this.height - this.p1.h - 10);

        // CPU AI
        // Simple tracking with error/delay
        const targetY = this.ball.y - this.p2.h/2;
        const diff = targetY - this.p2.y;

        // AI Speed limit
        const aiSpeed = 5;
        if (Math.abs(diff) > aiSpeed) {
            this.p2.y += Math.sign(diff) * aiSpeed;
        } else {
            this.p2.y += diff;
        }
        this.p2.y = MathUtils.clamp(this.p2.y, 10, this.height - this.p2.h - 10);

        // Ball Movement
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Top/Bottom bounce
        if (this.ball.y < 0 || this.ball.y > this.height - this.ball.h) {
            this.ball.dy *= -1;
            this.engine.audio.playTone(100, 'square', 0.05);
        }

        // Scoring
        if (this.ball.x < 0) {
            this.p2.score++;
            this.engine.audio.playTone(50, 'sawtooth', 0.5);
            this.resetBall('p2');
        } else if (this.ball.x > this.width) {
            this.p1.score++;
            this.engine.audio.playTone(400, 'square', 0.2);
            this.resetBall('p1');
        }

        // Paddle Collisions
        if (this.ball.dx < 0 && Physics.checkAABB(this.ball, this.p1)) {
            this.handlePaddleHit(this.p1);
        } else if (this.ball.dx > 0 && Physics.checkAABB(this.ball, this.p2)) {
            this.handlePaddleHit(this.p2);
        }
    }

    handlePaddleHit(paddle) {
        this.ball.dx *= -1.05; // Speed up slightly
        this.ball.dx = MathUtils.clamp(this.ball.dx, -15, 15);

        // English (Angle control) based on where it hit the paddle
        const center = paddle.y + paddle.h/2;
        const ballCenter = this.ball.y + this.ball.h/2;
        const diff = ballCenter - center;
        this.ball.dy = diff * 0.3;

        this.engine.audio.playTone(200, 'square', 0.1);
    }

    draw(renderer) {
        renderer.clear('#000');

        // Divider
        renderer.ctx.fillStyle = '#fff';
        for (let y = 10; y < this.height; y += this.dividerStyle.h + this.dividerStyle.gap) {
            renderer.ctx.fillRect(this.dividerStyle.x, y, this.dividerStyle.w, this.dividerStyle.h);
        }

        // Paddles
        renderer.drawRect(this.p1.x, this.p1.y, this.p1.w, this.p1.h, this.p1.color);
        renderer.drawRect(this.p2.x, this.p2.y, this.p2.w, this.p2.h, this.p2.color);

        // Ball (Square for retro feel)
        renderer.drawRect(this.ball.x, this.ball.y, this.ball.w, this.ball.h, '#fff');

        // Score
        renderer.drawText(this.p1.score, this.width/4, 80, 60, '#fff');
        renderer.drawText(this.p2.score, this.width*3/4, 80, 60, '#fff');
    }
}
