import Scene from '../../../../negen/core/Scene.js';

export default class BattleRoyaleScene extends Scene {
    constructor(engine) {
        super(engine);

        // Constants
        this.SNAKE_SPEED = 150; // pixels per second
        this.TURN_SPEED = 4; // radians per second
        this.SNAKE_RADIUS = 5;
        this.FOOD_RADIUS = 4;
        this.SPACING = 4; // Distance between segments

        // State
        this.snake = []; // Array of {x, y}
        this.dots = []; // Food/Dead snake particles
        this.enemies = []; // AI Snakes

        this.angle = 0; // Current heading (radians)
        this.score = 0;
        this.isGameOver = false;

        // Colors
        this.color = '#ff00cc';
        this.enemyColors = ['#ff0000', '#00ff00', '#ffff00', '#00ffff'];
    }

    init() {
        this.resetGame();
    }

    resetGame() {
        // Init Player
        this.angle = -Math.PI / 2; // Up
        const startX = this.engine.renderer.width / 2;
        const startY = this.engine.renderer.height / 2;

        this.snake = [];
        // Create initial length
        for(let i=0; i<20; i++) {
            this.snake.push({
                x: startX,
                y: startY + (i * this.SPACING)
            });
        }

        // Init Enemies
        this.enemies = [];
        for(let i=0; i<3; i++) {
            this.spawnEnemy();
        }

        // Init Dots
        this.dots = [];
        for(let i=0; i<50; i++) {
            this.spawnDot();
        }

        this.score = 0;
        this.isGameOver = false;
    }

    spawnDot(x, y, value=1) {
        if (x === undefined) x = Math.random() * this.engine.renderer.width;
        if (y === undefined) y = Math.random() * this.engine.renderer.height;

        this.dots.push({
            x, y,
            color: `hsl(${Math.random()*360}, 100%, 50%)`,
            value
        });
    }

    spawnEnemy() {
        const x = Math.random() * this.engine.renderer.width;
        const y = Math.random() * this.engine.renderer.height;
        const body = [];
        for(let k=0; k<15; k++) body.push({x, y: y+k*4});

        this.enemies.push({
            body: body,
            angle: Math.random() * Math.PI * 2,
            color: this.enemyColors[Math.floor(Math.random() * this.enemyColors.length)],
            alive: true
        });
    }

    update(dt) {
        const dtSec = dt / 1000;

        if (this.isGameOver) {
            if (this.engine.input.pointer.isPressed) this.resetGame();
            return;
        }

        // --- PLAYER INPUT ---
        const input = this.engine.input;
        if (input.isKeyPressed('ArrowLeft')) this.angle -= this.TURN_SPEED * dtSec;
        if (input.isKeyPressed('ArrowRight')) this.angle += this.TURN_SPEED * dtSec;

        // Simple touch steering (touch left side = left, right side = right)
        if (input.pointer.isPressed) {
            const centerX = this.engine.renderer.width / 2;
            if (input.pointer.x < centerX) this.angle -= this.TURN_SPEED * dtSec;
            else this.angle += this.TURN_SPEED * dtSec;
        }

        // --- MOVE PLAYER ---
        this.moveSnake(this.snake, this.angle, this.SNAKE_SPEED * dtSec);

        // --- MOVE ENEMIES ---
        this.enemies.forEach(enemy => {
            if(!enemy.alive) return;
            // Basic AI: Random wander with slight steering
            if(Math.random() < 0.05) enemy.angle += (Math.random()-0.5);

            // Avoid boundaries
            const head = enemy.body[0];
            if(head.x < 20) enemy.angle = 0;
            if(head.x > this.engine.renderer.width - 20) enemy.angle = Math.PI;
            if(head.y < 20) enemy.angle = Math.PI/2;
            if(head.y > this.engine.renderer.height - 20) enemy.angle = -Math.PI/2;

            this.moveSnake(enemy.body, enemy.angle, this.SNAKE_SPEED * 0.8 * dtSec);
        });

        // --- COLLISIONS ---
        this.checkCollisions();
    }

    moveSnake(body, angle, distance) {
        const head = body[0];
        const newHead = {
            x: head.x + Math.cos(angle) * distance,
            y: head.y + Math.sin(angle) * distance
        };

        // Wrap around world? Or Wall death? Let's do Wall Death for Battle Royale feel
        // or Wrap for ease. Let's do Wrap for now to keep it simple.
        if(newHead.x < 0) newHead.x = this.engine.renderer.width;
        if(newHead.x > this.engine.renderer.width) newHead.x = 0;
        if(newHead.y < 0) newHead.y = this.engine.renderer.height;
        if(newHead.y > this.engine.renderer.height) newHead.y = 0;

        body.unshift(newHead);

        // Growth logic: if we didn't eat, pop the tail.
        // We handle "did we eat" in checkCollisions, if we eat we just don't pop this frame?
        // Actually, easier to always grow then pop if "growth pending" is 0.
        // For smooth movement in this simple vector implementation, we just pop last segment
        // unless we want to grow.
        // HACK: Just pop for now, grow in collision.
        body.pop();
    }

    // Helper to grow snake
    growSnake(body, amount=1) {
        const tail = body[body.length-1];
        for(let i=0; i<amount; i++) {
            body.push({...tail});
        }
    }

    checkCollisions() {
        const playerHead = this.snake[0];

        // 1. Player vs Dots
        for(let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            const dx = playerHead.x - dot.x;
            const dy = playerHead.y - dot.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < this.SNAKE_RADIUS + this.FOOD_RADIUS) {
                this.dots.splice(i, 1);
                this.score += dot.value;
                this.growSnake(this.snake, 1);
                this.spawnDot(); // Keep world populated
                this.engine.audio.playTone(800 + (this.score*10), 'sine', 0.05);
            }
        }

        // 2. Player vs Enemies (Head to Body)
        this.enemies.forEach(enemy => {
            if(!enemy.alive) return;

            // Check if Player hits Enemy Body
            for(let seg of enemy.body) {
                const dx = playerHead.x - seg.x;
                const dy = playerHead.y - seg.y;
                if(Math.sqrt(dx*dx + dy*dy) < this.SNAKE_RADIUS * 2) {
                    this.die(); // Player dies
                }
            }

            // Check if Enemy hits Player Body
            const enemyHead = enemy.body[0];
            for(let seg of this.snake) {
                const dx = enemyHead.x - seg.x;
                const dy = enemyHead.y - seg.y;
                if(Math.sqrt(dx*dx + dy*dy) < this.SNAKE_RADIUS * 2) {
                    // Enemy dies!
                    this.killEnemy(enemy);
                }
            }
        });
    }

    killEnemy(enemy) {
        enemy.alive = false;
        // Turn body into dots
        enemy.body.forEach((seg, i) => {
            if(i % 2 === 0) this.spawnDot(seg.x, seg.y, 5);
        });
        this.engine.audio.playTone(200, 'sawtooth', 0.5);

        // Respawn later?
        setTimeout(() => this.spawnEnemy(), 3000);
    }

    die() {
        if(this.isGameOver) return;
        this.isGameOver = true;
        this.engine.audio.playTone(100, 'sawtooth', 1.0);
    }

    draw(renderer) {
        renderer.clear('#1a0510');

        // Draw Dots
        this.dots.forEach(dot => {
            renderer.drawCircleEffect(dot.x, dot.y, this.FOOD_RADIUS, dot.color, 5, dot.color);
        });

        // Draw Enemies
        this.enemies.forEach(enemy => {
            if(!enemy.alive) return;
            this.drawSnakeBody(renderer, enemy.body, enemy.color);
        });

        // Draw Player
        if (!this.isGameOver) {
            this.drawSnakeBody(renderer, this.snake, this.color);
        }

        // UI
        renderer.drawText(`SCORE: ${this.score}`, 10, 30, 20, '#fff', 'left');

        if (this.isGameOver) {
            renderer.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            renderer.ctx.fillRect(0,0, renderer.width, renderer.height);
            renderer.drawText("GAME OVER", renderer.width/2, renderer.height/2, 50, '#fff');
            renderer.drawText("Tap to Restart", renderer.width/2, renderer.height/2 + 50, 30, '#ccc');
        }
    }

    drawSnakeBody(renderer, body, color) {
        // Draw segments as circles
        for(let i=0; i<body.length; i++) {
            const seg = body[i];
            const size = this.SNAKE_RADIUS * 2;
            // Optimization: Skip every other segment for drawing if tight
            renderer.ctx.fillStyle = color;
            renderer.ctx.beginPath();
            renderer.ctx.arc(seg.x, seg.y, this.SNAKE_RADIUS, 0, Math.PI*2);
            renderer.ctx.fill();
        }

        // Glow on head
        if(body.length > 0) {
            const head = body[0];
            renderer.drawCircleEffect(head.x, head.y, this.SNAKE_RADIUS, '#fff', 15, color);
        }
    }
}
