import Scene from '../../../../negen/core/Scene.js';

export default class SnakeScene extends Scene {
    constructor(engine) {
        super(engine);

        // Game Constants
        this.PALETTE = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800'];
        this.TILE_COUNT = 20;
        this.GRID_SIZE = 0; // Calculated

        // Game State
        this.snake = [];
        this.direction = { x: 0, y: -1 };
        this.pendingDirection = { x: 0, y: -1 };
        this.food = null;
        this.score = 0;
        this.isGameOver = false;

        // Timing
        this.tickTimer = 0;
        this.tickRate = 100; // ms per tick

        this.currentMode = 'neon'; // Default
    }

    init() {
        this.resize();
        this.resetGame();

        // Bind window resize
        window.addEventListener('resize', () => this.resize());

        console.log("Snake Scene Initialized via NEGEN");
    }

    enter() {
        this.resetGame();
    }

    resize() {
        // Simple sizing logic similar to original
        const maxSize = Math.min(window.innerWidth - 20, window.innerHeight - 100, 600);
        if (this.engine.renderer && this.engine.renderer.resize) {
            this.engine.renderer.resize(maxSize, maxSize);
        }
        this.GRID_SIZE = maxSize / this.TILE_COUNT;
    }

    resetGame() {
        this.snake = [
            { x: 10, y: 15, color: '#fff' },
            { x: 10, y: 16, color: '#fff' },
            { x: 10, y: 17, color: '#fff' }
        ];
        this.direction = { x: 0, y: -1 };
        this.pendingDirection = { x: 0, y: -1 };
        this.score = 0;
        this.isGameOver = false;
        this.spawnFood();
        this.tickTimer = 0;

        // DOM update (optional/hybrid approach)
        const scoreEl = document.getElementById('scoreDisplay');
        if(scoreEl) scoreEl.textContent = "0";
    }

    spawnFood() {
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * this.TILE_COUNT),
                y: Math.floor(Math.random() * this.TILE_COUNT),
                color: this.PALETTE[Math.floor(Math.random() * this.PALETTE.length)]
            };
            // Collision check
            valid = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
        }
    }

    update(dt) {
        if (this.isGameOver) {
            // Restart on tap
            if (this.engine.input.pointer.isPressed) {
                this.resetGame();
            }
            return;
        }

        this.handleInput();

        // Game Loop Logic (Tick based)
        this.tickTimer += dt;

        // Adaptive speed
        const currentSpeed = Math.max(50, 110 - (this.score * 2));

        if (this.tickTimer >= currentSpeed) {
            this.tickTimer = 0;
            this.gameTick();
        }
    }

    handleInput() {
        const input = this.engine.input;

        // Keyboard
        if (input.isKeyPressed('ArrowLeft')) this.setDirection(-1, 0);
        if (input.isKeyPressed('ArrowRight')) this.setDirection(1, 0);
        if (input.isKeyPressed('ArrowUp')) this.setDirection(0, -1);
        if (input.isKeyPressed('ArrowDown')) this.setDirection(0, 1);

        // Touch (Simple relative turning for now, swipe could be added to InputManager)
        if (input.pointer.isPressed) {
            // Ignore if game over tap
            if (this.isGameOver) return;

            const centerX = this.engine.renderer.width / 2;
            if (input.pointer.x < centerX) {
                // Turn Left relative to current direction
                this.turnLeft();
            } else {
                this.turnRight();
            }
        }
    }

    turnLeft() {
        const newDir = { x: this.direction.y, y: -this.direction.x };
        this.setDirection(newDir.x, newDir.y);
    }

    turnRight() {
        const newDir = { x: -this.direction.y, y: this.direction.x };
        this.setDirection(newDir.x, newDir.y);
    }

    setDirection(x, y) {
        // Prevent 180 turns
        if (x === -this.direction.x && y === -this.direction.y) return;
        this.pendingDirection = { x, y };
    }

    gameTick() {
        this.direction = this.pendingDirection;

        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Wall Collision
        if (head.x < 0 || head.x >= this.TILE_COUNT || head.y < 0 || head.y >= this.TILE_COUNT) {
            this.gameOver();
            return;
        }

        // Self Collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver();
            return;
        }

        // Add Head
        this.snake.unshift(head);

        // Eat Food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.engine.audio.playTone(600, 'sine', 0.1); // Beep!

            // DOM Update
            const scoreEl = document.getElementById('scoreDisplay');
            if(scoreEl) scoreEl.textContent = this.score;

            this.spawnFood();
        } else {
            // Remove Tail
            this.snake.pop();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.engine.audio.playTone(150, 'sawtooth', 0.4); // Crash!
    }

    draw(renderer) {
        // Background
        renderer.clear('#240a1e');

        // Draw Snake
        this.snake.forEach((seg, i) => {
            const x = seg.x * this.GRID_SIZE;
            const y = seg.y * this.GRID_SIZE;
            const size = this.GRID_SIZE - 2;

            let color = seg.color || '#fff';
            let blur = 10;

            if (i === 0) {
                color = '#ffffff';
                blur = 20;
            } else {
                const hue = 320 - (i * 4);
                color = `hsl(${hue}, 100%, 50%)`;
            }

            renderer.drawRectEffect(x + 1, y + 1, size, size, color, blur, color);
        });

        // Draw Food
        if (this.food) {
            const x = this.food.x * this.GRID_SIZE + this.GRID_SIZE/2;
            const y = this.food.y * this.GRID_SIZE + this.GRID_SIZE/2;

            renderer.drawCircleEffect(x, y, this.GRID_SIZE/2 - 4, '#00ffff', 15, '#00ffff');
        }

        // Game Over Overlay
        if (this.isGameOver) {
            const w = renderer.width;
            const h = renderer.height;
            renderer.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            renderer.ctx.fillRect(0, 0, w, h);

            renderer.drawText("GAME OVER", w/2, h/2 - 20, 40, '#fff');
            renderer.drawText("Score: " + this.score, w/2, h/2 + 30, 25, '#ccc');
            renderer.drawText("Tap to Retry", w/2, h/2 + 70, 20, '#fff');
        }
    }
}
