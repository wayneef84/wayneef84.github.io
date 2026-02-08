import Scene from '../../../negen/core/Scene.js';
import PhysicsEngine, { Body } from './PhysicsEngine.js';

export default class AnimalStackScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;

        this.physics = new PhysicsEngine();
        this.physics.gravity = 300; // Slower gravity for "Cute Physics"

        // Ground Body
        const groundY = this.height - 50;
        const groundBody = new Body(this.width/2, groundY + 50, [
            {x: -this.width/2, y: -50}, {x: this.width/2, y: -50},
            {x: this.width/2, y: 50}, {x: -this.width/2, y: 50}
        ], true);
        this.physics.addBody(groundBody);

        this.groundY = groundY;

        this.currentPiece = null;
        this.score = 0;
        this.gameOver = false;
        this.state = 'hover'; // hover, dropping, landed

        // Animal Shapes (Boxy Pig, Triangular Chicken, L-Shape Giraffe)
        // Vertices relative to center
        this.shapes = {
            pig: {
                color: '#FFC0CB',
                verts: [{x:-25, y:-15}, {x:25, y:-15}, {x:25, y:15}, {x:-25, y:15}], // Box
                emoji: '🐷'
            },
            chicken: {
                color: '#FFD700',
                verts: [{x:0, y:-20}, {x:20, y:20}, {x:-20, y:20}], // Triangle
                emoji: '🐔'
            },
            giraffe: {
                color: '#FFA500',
                verts: [
                    {x:-15, y:-30}, {x:15, y:-30},
                    {x:15, y:30}, {x:-15, y:30} // Tall Box (Simplified from L for now to avoid convex decomposition issues with SAT)
                ],
                emoji: '🦒'
            }
        };

        this.spawnNewPiece();

        this.engine.input.bindAction('DROP', ['Space']);
    }

    spawnNewPiece() {
        const keys = Object.keys(this.shapes);
        const typeKey = keys[Math.floor(Math.random() * keys.length)];
        const type = this.shapes[typeKey];

        // Spawn at top center
        this.currentPiece = new Body(this.width/2, 50, type.verts);
        this.currentPiece.color = type.color;
        this.currentPiece.emoji = type.emoji;
        this.currentPiece.scale = {x: 1, y: 1};
        this.currentPiece.squishTimer = 0;

        // Don't add to physics engine yet (manual control)
        this.state = 'hover';
    }

    update(dt) {
        const dtSec = dt/1000;

        // Physics Step
        this.physics.update(dt);

        // Squish Animation
        for(let b of this.physics.bodies) {
            if(b.squishTimer > 0) {
                b.squishTimer -= dtSec;
                const t = b.squishTimer * 10; // Fast pulse
                b.scale = { x: 1 + Math.sin(t)*0.2, y: 1 - Math.sin(t)*0.2 };
                if (b.squishTimer <= 0) b.scale = {x:1, y:1};
            }
        }

        if (this.state === 'hover') {
            // Control
            if (this.engine.input.keys['ArrowLeft']) this.currentPiece.x -= 200 * dtSec;
            if (this.engine.input.keys['ArrowRight']) this.currentPiece.x += 200 * dtSec;

            // Rotation
            if (this.engine.input.keys['KeyZ']) this.currentPiece.angle -= 2 * dtSec;
            if (this.engine.input.keys['KeyX']) this.currentPiece.angle += 2 * dtSec;

            this.currentPiece.x = Math.max(50, Math.min(this.width-50, this.currentPiece.x));
            this.currentPiece.updateVertices(); // Update visual rotation

            // Drop
            if (this.engine.input.isJustPressed('DROP') || this.engine.input.pointer.isPressed) {
                this.state = 'dropping';
                this.physics.addBody(this.currentPiece);
                this.currentPiece.vy = 100; // Initial push
                this.engine.audio.playTone(400, 'sine', 0.1);
            }
        } else if (this.state === 'dropping') {
            // Check if landed (velocity near zero)
            if (Math.abs(this.currentPiece.vy) < 5 && Math.abs(this.currentPiece.vx) < 5 && this.currentPiece.y > 100) {
                // Assume landed
                // Apply Squish
                if (!this.currentPiece.squishTimer) {
                    this.currentPiece.squishTimer = 0.3;
                    this.engine.audio.playTone(200, 'sine', 0.1);
                }

                // Wait for squish to finish before spawning next?
                if (this.currentPiece.squishTimer <= 0.1) {
                    this.score++;
                    this.spawnNewPiece();
                }
            }

            // Check falling off
            if (this.currentPiece.y > this.height) {
                this.gameOver = true;
                this.engine.audio.playTone(100, 'sawtooth', 0.5);
            }
        }

        if (this.gameOver && this.engine.input.pointer.isPressed) {
            // Reset
            // Remove all bodies except ground
            this.physics.bodies = [this.physics.bodies[0]];
            this.score = 0;
            this.gameOver = false;
            this.spawnNewPiece();
        }
    }

    draw(renderer) {
        renderer.clear('#87CEEB'); // Sky Blue

        // Ground
        renderer.ctx.fillStyle = '#4CAF50';
        renderer.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // Draw Physics Bodies
        for (let b of this.physics.bodies) {
            if (b.static) continue; // Ground drawn manually
            this.drawBody(renderer, b);
        }

        // Draw Current Hover Piece
        if (this.state === 'hover') {
            this.drawBody(renderer, this.currentPiece);
        }

        // UI
        renderer.drawText(`Stack Height: ${this.score}`, 20, 40, 24, '#fff', 'left');

        if(this.gameOver) {
            renderer.drawText("TOPPLED!", this.width/2, this.height/2, 50, '#f00');
            renderer.drawText("Tap to Retry", this.width/2, this.height/2 + 60, 20, '#fff');
        }
    }

    drawBody(renderer, b) {
        const ctx = renderer.ctx;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.angle);

        if (b.scale) {
            ctx.scale(b.scale.x, b.scale.y);
        }

        ctx.beginPath();
        ctx.fillStyle = b.color || '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (b.vertices.length > 0) {
            ctx.moveTo(b.vertices[0].x, b.vertices[0].y);
            for(let i=1; i<b.vertices.length; i++) {
                ctx.lineTo(b.vertices[i].x, b.vertices[i].y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Emoji
        if (b.emoji) {
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.emoji, 0, 0);
        }

        ctx.restore();
    }
}
