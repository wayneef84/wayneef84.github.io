import Scene from '../../../negen/core/Scene.js';
import Physics from '../../../negen/utils/Physics.js';
import MathUtils from '../../../negen/utils/MathUtils.js';
import ParticleSystem from '../../../negen/graphics/ParticleSystem.js';

export default class PongScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;
        this.particleSystem = new ParticleSystem();

        this.paddleW = 15;
        this.paddleH = 80;
        const padY = this.height/2 - this.paddleH/2;

        // Left Paddle (Player) - Cyan Neon
        this.p1 = {
            x: 50, y: padY, w: this.paddleW, h: this.paddleH,
            score: 0, color: '#0ff',
            prevY: padY, velocity: 0
        };

        // Right Paddle (CPU) - Magenta Neon
        this.p2 = {
            x: this.width - 50 - this.paddleW, y: padY, w: this.paddleW, h: this.paddleH,
            score: 0, color: '#f0f',
            prevY: padY, velocity: 0
        };

        // Ball - Bright White
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
        this.particleSystem.update(dt);

        // Track previous positions for velocity calc
        this.p1.prevY = this.p1.y;
        this.p2.prevY = this.p2.y;

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

        // Calculate P1 Velocity (smoothed)
        this.p1.velocity = (this.p1.y - this.p1.prevY);

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

        // Calculate P2 Velocity
        this.p2.velocity = (this.p2.y - this.p2.prevY);

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

        // Base deflection
        this.ball.dy = diff * 0.3;

        // Add Kinetic Spin (Paddle Velocity influence)
        // If paddle is moving, it drags the ball vertically
        this.ball.dy += paddle.velocity * 0.5;

        // Particle Splash
        const impactSpeed = Math.abs(this.ball.dx) + Math.abs(this.ball.dy);
        const pCount = Math.floor(MathUtils.clamp(impactSpeed * 2, 10, 50));

        // Emit towards center of screen roughly
        const emitDirX = this.ball.dx > 0 ? 1 : -1; // Ball is moving AWAY from paddle now? No, dx just flipped.
        // If ball.dx is positive, it hit left paddle and is moving right.

        this.particleSystem.emit(this.ball.x, this.ball.y, pCount, {
            color: paddle.color,
            speed: impactSpeed * 0.3,
            life: 0.8
        });

        this.engine.audio.playTone(200 + Math.abs(paddle.velocity)*10, 'square', 0.1);
    }

    draw(renderer) {
        // Use abstract methods instead of direct ctx access
        renderer.clear('#050510'); // Dark void background

        // Draw Particles
        this.particleSystem.draw(renderer);

        // Divider (Cyan/Magenta Gradient feel using opacity)
        for (let y = 10; y < this.height; y += this.dividerStyle.h + this.dividerStyle.gap) {
            renderer.drawRect(this.dividerStyle.x, y, this.dividerStyle.w, this.dividerStyle.h, 'rgba(255, 255, 255, 0.2)');
        }

        // Draw Kinetic Paddles
        this.drawPaddle(renderer, this.p1);
        this.drawSpinMeter(renderer, this.p1); // Draw meter for P1
        this.drawPaddle(renderer, this.p2);
        // this.drawSpinMeter(renderer, this.p2); // CPU doesn't really need a visual meter, but consistent

        // Ball (Glowing)
        renderer.drawRectEffect(this.ball.x, this.ball.y, this.ball.w, this.ball.h, '#fff', 10, '#fff');

        // Score (Parallax/Floating)
        renderer.ctx.save();
        renderer.ctx.globalAlpha = 0.5;
        renderer.drawText(this.p1.score, this.width/4, 120, 100, this.p1.color);
        renderer.drawText(this.p2.score, this.width*3/4, 120, 100, this.p2.color);
        renderer.ctx.restore();
    }

    drawPaddle(renderer, paddle) {
        const ctx = renderer.ctx;
        const isLeft = paddle.x < this.width / 2;

        // Tilt based on velocity to create "Kinetic" angle
        // If moving UP (vel < 0), we want to deflect UP.
        // P1 (Right Face): Needs Top Right > Bottom Right (\ shape) -> Tilt > 0
        // P2 (Left Face): Needs Top Left < Bottom Left (/ shape) -> Tilt < 0? No.
        // P2 Ball moves -> hits / (TL > BL?).
        // / surface deflects UP.
        // / implies Top Left is to the Right of Bottom Left (TL > BL).

        // Let's stick to visual logic:
        // Moving UP -> Top part leads? No, drag means top trails.
        // But for gameplay "Paddle Angles", we want the angle to help the player.
        // Moving UP -> Angle paddle to hit UP.

        const tilt = -paddle.velocity * 0.8;

        ctx.beginPath();
        ctx.fillStyle = paddle.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = paddle.color;

        if (isLeft) {
            // P1: Flat Left, Tilted Right Impact Face
            // If vel < 0 (UP), tilt > 0.
            // TR = x+w + tilt. BR = x+w - tilt.
            // TR > BR (\). Hits UP. Correct.

            ctx.moveTo(paddle.x, paddle.y); // TL
            ctx.lineTo(paddle.x + paddle.w + tilt, paddle.y); // TR (Variable)
            ctx.lineTo(paddle.x + paddle.w - tilt, paddle.y + paddle.h); // BR (Variable)
            ctx.lineTo(paddle.x, paddle.y + paddle.h); // BL
        } else {
            // P2: Tilted Left Impact Face, Flat Right
            // If vel < 0 (UP), tilt > 0.
            // TL = x + tilt. BL = x - tilt.
            // TL > BL (/). Hits UP. Correct.

            ctx.moveTo(paddle.x + tilt, paddle.y); // TL (Variable)
            ctx.lineTo(paddle.x + paddle.w, paddle.y); // TR
            ctx.lineTo(paddle.x + paddle.w, paddle.y + paddle.h); // BR
            ctx.lineTo(paddle.x - tilt, paddle.y + paddle.h); // BL (Variable)
        }

        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawSpinMeter(renderer, paddle) {
        if (Math.abs(paddle.velocity) < 0.5) return;

        const ctx = renderer.ctx;
        const x = paddle.x + paddle.w/2;
        const y = paddle.y + paddle.h/2;

        // Radius slightly larger than paddle height half
        const r = paddle.h/2 + 15;

        // Arc length based on velocity
        const angle = Math.min(Math.PI/2, Math.abs(paddle.velocity) * 0.1);
        const startAngle = paddle.x < this.width/2 ? -Math.PI/2 : Math.PI/2; // Different side?

        // Draw an arc indicating spin
        ctx.beginPath();
        ctx.strokeStyle = paddle.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;

        // Arc centered at paddle center
        // If moving down (vel > 0), arc downwards?
        // Let's just draw a curve representing intensity.

        // Side check
        const isLeft = paddle.x < this.width/2;
        const centerAngle = isLeft ? 0 : Math.PI; // Face inward

        ctx.arc(x, y, r, centerAngle - angle, centerAngle + angle);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = 1;
    }
}
