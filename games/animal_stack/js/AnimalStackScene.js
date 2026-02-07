import Scene from '../../../negen/core/Scene.js';

export default class AnimalStackScene extends Scene {
    constructor(engine) {
        super(engine);

        // Physics constants (Simplified custom physics since we can't import Matter.js easily without external script)
        this.gravity = 500; // px/s^2
        this.groundY = 0;

        // Game State
        this.currentPiece = null;
        this.stack = []; // Resting pieces
        this.score = 0;
        this.gameOver = false;

        // Assets (Using placeholders/emojis for now as requested "cutouts")
        this.animals = [
            { id: 'cow', emoji: '🐄', w: 60, h: 40, color: '#fff' },
            { id: 'pig', emoji: '🐖', w: 50, h: 30, color: '#pink' },
            { id: 'chicken', emoji: '🐓', w: 30, h: 30, color: '#orange' },
            { id: 'sheep', emoji: '🐑', w: 50, h: 40, color: '#white' }
        ];
    }

    init() {
        this.groundY = this.engine.renderer.height - 50;
        this.spawnNewPiece();
    }

    spawnNewPiece() {
        const type = this.animals[Math.floor(Math.random() * this.animals.length)];
        this.currentPiece = {
            ...type,
            x: this.engine.renderer.width / 2,
            y: 50,
            vx: 0,
            vy: 0,
            angle: 0,
            va: 0, // angular velocity
            isFalling: false
        };
    }

    update(dt) {
        if(this.gameOver) {
             if (this.engine.input.pointer.isPressed) this.reset();
             return;
        }

        const dtSec = dt / 1000;
        const input = this.engine.input;

        if (!this.currentPiece.isFalling) {
            // Hover Phase
            // Move left/right
            if(input.isKeyPressed('ArrowLeft')) this.currentPiece.x -= 200 * dtSec;
            if(input.isKeyPressed('ArrowRight')) this.currentPiece.x += 200 * dtSec;

            // Rotate
            if(input.isKeyPressed('z')) this.currentPiece.angle -= 2 * dtSec;
            if(input.isKeyPressed('x')) this.currentPiece.angle += 2 * dtSec;

            // Mouse/Touch follow x
            if(input.pointer.isPressed) {
                 this.currentPiece.x = input.pointer.x;
                 // Drop on release logic would need "wasPressed" tracking,
                 // for now let's use spacebar or tap bottom of screen?
                 // Let's just use Space/Click to drop
            }

            // Drop Trigger
            if (input.isKeyPressed(' ') || (input.pointer.isPressed && input.pointer.y > this.engine.renderer.height/2)) {
                this.currentPiece.isFalling = true;
                this.engine.audio.playTone(400, 'sine', 0.1);
            }

        } else {
            // Falling Phase (Simple AABB-ish physics)
            const p = this.currentPiece;
            p.vy += this.gravity * dtSec;
            p.y += p.vy * dtSec;

            // Ground Collision
            if (p.y + p.h/2 >= this.groundY) {
                p.y = this.groundY - p.h/2;
                p.vy = 0;
                this.lockPiece();
            }

            // Stack Collision (Very simplified: check overlap with top of stack)
            for(let other of this.stack) {
                // AABB Check
                if (Math.abs(p.x - other.x) < (p.w/2 + other.w/2) &&
                    Math.abs(p.y - other.y) < (p.h/2 + other.h/2)) {

                    // Landed on top?
                    if (p.y < other.y) {
                         p.y = other.y - other.h/2 - p.h/2;
                         p.vy = 0;
                         this.lockPiece();
                    }
                }
            }

            // Fall off screen?
            if (p.y > this.engine.renderer.height) {
                this.gameOver = true;
                this.engine.audio.playTone(100, 'sawtooth', 0.5);
            }
        }
    }

    lockPiece() {
        this.stack.push(this.currentPiece);
        this.score++;
        this.engine.audio.playTone(600 + (this.score*50), 'sine', 0.1);
        this.spawnNewPiece();
    }

    reset() {
        this.stack = [];
        this.score = 0;
        this.gameOver = false;
        this.spawnNewPiece();
    }

    draw(renderer) {
        renderer.clear('#87CEEB'); // Sky Blue

        // Ground
        renderer.ctx.fillStyle = '#4CAF50';
        renderer.ctx.fillRect(0, this.groundY, renderer.width, renderer.height - this.groundY);

        // Draw Stack
        this.stack.forEach(p => this.drawPiece(renderer, p));

        // Draw Current
        if(this.currentPiece) this.drawPiece(renderer, this.currentPiece);

        // UI
        renderer.drawText(`Height: ${this.score}`, 20, 40, 30, '#fff', 'left');

        if(this.gameOver) {
            renderer.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            renderer.ctx.fillRect(0,0,renderer.width, renderer.height);
            renderer.drawText("TOPPLED!", renderer.width/2, renderer.height/2, 50, '#fff');
        }
    }

    drawPiece(renderer, p) {
        renderer.ctx.save();
        renderer.ctx.translate(p.x, p.y);
        renderer.ctx.rotate(p.angle);

        // Box
        renderer.ctx.fillStyle = p.color || '#fff';
        renderer.ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        renderer.ctx.strokeStyle = '#000';
        renderer.ctx.strokeRect(-p.w/2, -p.h/2, p.w, p.h);

        // Emoji Center
        renderer.ctx.font = '20px Arial';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.textBaseline = 'middle';
        renderer.ctx.fillText(p.emoji, 0, 0);

        renderer.ctx.restore();
    }
}
