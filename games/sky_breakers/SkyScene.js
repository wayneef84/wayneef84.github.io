/**
 * SKYbreakers - Game Scene
 * A vertical flappy-style game using NEGEN.
 */
import Scene from '../../negen/core/Scene.js';
import Entity from '../../negen/core/Entity.js';
import Synthesizer from '../../negen/audio/Synthesizer.js';
import ControlOverlay from '../../negen/ui/ControlOverlay.js';
import MathUtils from '../../negen/utils/MathUtils.js';

class Player extends Entity {
    constructor() {
        super(50, 200, 30, 30);
        this.vy = 0;
        this.gravity = 800;
        this.jumpForce = -350;
        this.color = '#00ffff';
    }

    update(dt) {
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;
    }

    jump() {
        this.vy = this.jumpForce;
    }
}

class Obstacle extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.passed = false;
        this.color = '#ff0066';
    }

    update(dt, speed) {
        this.x -= speed * dt;
    }
}

export default class SkyScene extends Scene {
    constructor(engine) {
        super(engine);
        this.synth = new Synthesizer(engine.audio);
        this.controls = new ControlOverlay(engine);

        // Game Params
        this.speed = 200;
        this.gapSize = 150;
        this.spawnTimer = 0;
        this.spawnRate = 1.8; // Seconds

        // State
        this.state = 'READY'; // READY, PLAYING, GAMEOVER
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('sky_highscore') || '0');

        this.player = new Player();
        this.obstacles = [];
        this.particles = [];
    }

    init() {
        this.engine.input.bindAction('JUMP', ['Space', 'ArrowUp', 'MouseLeft', 'Touch', 'Gamepad_Btn_0', 'Virtual_ACTION']);
        this.controls.setLayout('single'); // Giant button
        this.reset();
    }

    enter() {
        this.controls.active = true;
    }

    exit() {
        this.controls.active = false;
    }

    reset() {
        this.state = 'READY';
        this.score = 0;
        this.speed = 200;
        this.player.y = this.engine.renderer.height / 2;
        this.player.vy = 0;
        this.obstacles = [];
        this.spawnTimer = 0;

        // DOM UI
        document.getElementById('score').innerText = '0';
        document.getElementById('msg').innerText = 'TAP TO FLY';
        document.getElementById('msg').style.display = 'block';
    }

    update(dt) {
        // Input Handling
        if (this.engine.input.isJustPressed('JUMP')) {
            if (this.state === 'READY') {
                this.state = 'PLAYING';
                document.getElementById('msg').style.display = 'none';
                this.player.jump();
                this.synth.playJump();
            } else if (this.state === 'PLAYING') {
                this.player.jump();
                this.synth.playJump();
            } else if (this.state === 'GAMEOVER') {
                this.reset();
            }
        }

        if (this.state !== 'PLAYING') return;

        // Physics
        this.player.update(dt);

        // Floor/Ceiling Collision
        if (this.player.y < 0 || this.player.y + this.player.height > this.engine.renderer.height) {
            this.gameOver();
        }

        // Obstacles
        this.spawnTimer += dt;
        if (this.spawnTimer > this.spawnRate) {
            this.spawnObstacle();
            this.spawnTimer = 0;
            // Ramp up difficulty
            if (this.speed < 400) this.speed += 5;
            if (this.spawnRate > 1.0) this.spawnRate -= 0.02;
        }

        // Update Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            ob.update(dt, this.speed);

            // AABB Collision
            if (this.checkCollision(this.player, ob)) {
                this.gameOver();
            }

            // Score
            if (!ob.passed && ob.x + ob.width < this.player.x) {
                // Only count top pipe to avoid double score
                if (ob.y === 0) {
                    this.score++;
                    this.synth.playTone(600 + (this.score * 10), 'sine', 0.1);
                    document.getElementById('score').innerText = this.score;
                    ob.passed = true;
                }
            }

            // Cleanup
            if (ob.x + ob.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    spawnObstacle() {
        const h = this.engine.renderer.height;
        const minHeight = 50;
        const maxY = h - minHeight - this.gapSize;
        const topHeight = MathUtils.randomRange(minHeight, maxY);

        const pipeW = 60;

        // Top Pipe
        this.obstacles.push(new Obstacle(this.engine.renderer.width, 0, pipeW, topHeight));

        // Bottom Pipe
        const botY = topHeight + this.gapSize;
        this.obstacles.push(new Obstacle(this.engine.renderer.width, botY, pipeW, h - botY));
    }

    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.synth.playCrash();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('sky_highscore', this.highScore);
        }

        document.getElementById('msg').innerHTML = `CRASHED<br><span style="font-size:0.5em">SCORE: ${this.score}<br>BEST: ${this.highScore}</span>`;
        document.getElementById('msg').style.display = 'block';
    }

    draw(renderer) {
        renderer.clear('#0f172a'); // Dark Blue

        // Draw Player
        // renderer.drawRectEffect(this.player.x, this.player.y, this.player.width, this.player.height, '#00ffff', 10, '#00ffff');
        // Let's use Circle for player
        renderer.drawCircleEffect(
            this.player.x + this.player.width/2,
            this.player.y + this.player.height/2,
            this.player.width/2,
            this.player.color, 15, this.player.color
        );

        // Draw Obstacles
        this.obstacles.forEach(ob => {
            renderer.drawRectEffect(ob.x, ob.y, ob.width, ob.height, '#ff0066', 5, '#ff0066');
            // Decorative stripe
            renderer.drawRect(ob.x + 5, ob.y, 5, ob.height, 'rgba(255,255,255,0.3)');
        });

        // Ground line
        renderer.drawRect(0, renderer.height - 2, renderer.width, 2, '#fff');
    }
}
