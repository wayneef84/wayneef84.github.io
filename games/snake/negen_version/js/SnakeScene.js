import Scene from '../../../../negen/core/Scene.js';
import Synthesizer from '../../../../negen/audio/Synthesizer.js';
import ControlOverlay from '../../../../negen/ui/ControlOverlay.js';

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

        // Systems
        this.synth = new Synthesizer(engine.audio);
        this.controls = new ControlOverlay(engine);
    }

    init() {
        this.resize();
        this.resetGame();

        // Bind Controls
        this.engine.input.bindAction('UP', ['ArrowUp', 'KeyW', 'Gamepad_Axis_1_Neg', 'Virtual_UP']);
        this.engine.input.bindAction('DOWN', ['ArrowDown', 'KeyS', 'Gamepad_Axis_1_Pos', 'Virtual_DOWN']);
        this.engine.input.bindAction('LEFT', ['ArrowLeft', 'KeyA', 'Gamepad_Axis_0_Neg', 'Virtual_LEFT']);
        this.engine.input.bindAction('RIGHT', ['ArrowRight', 'KeyD', 'Gamepad_Axis_0_Pos', 'Virtual_RIGHT']);
        this.engine.input.bindAction('CONFIRM', ['Space', 'Enter', 'Gamepad_Btn_0', 'Virtual_A']);

        // Setup Overlay
        this.controls.setLayout('dpad');

        // Bind window resize
        window.addEventListener('resize', () => this.resize());
        console.log("Snake Scene Initialized via NEGEN");
    }

    enter() {
        this.resetGame();
        this.controls.active = true;
    }

    exit() {
        this.controls.active = false; // Hide overlay
    }

    resize() {
        const maxSize = Math.min(window.innerWidth - 20, window.innerHeight - 200, 600); // 200px buffer for controls
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

        // DOM update
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
            valid = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
        }
    }

    update(dt) {
        if (this.isGameOver) {
            if (this.engine.input.isJustPressed('CONFIRM') || this.engine.input.pointer.isPressed) {
                this.resetGame();
            }
            return;
        }

        this.handleInput();

        // Game Loop Logic
        this.tickTimer += dt;
        const currentSpeedMs = Math.max(50, 110 - (this.score * 2)); // Speed up

        if (this.tickTimer * 1000 >= currentSpeedMs) {
            this.tickTimer = 0;
            this.gameTick();
        }
    }

    handleInput() {
        const input = this.engine.input;

        if (input.isActive('LEFT')) this.setDirection(-1, 0);
        if (input.isActive('RIGHT')) this.setDirection(1, 0);
        if (input.isActive('UP')) this.setDirection(0, -1);
        if (input.isActive('DOWN')) this.setDirection(0, 1);
    }

    setDirection(x, y) {
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

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.synth.playEat();

            const scoreEl = document.getElementById('scoreDisplay');
            if(scoreEl) scoreEl.textContent = this.score;

            this.spawnFood();
        } else {
            this.snake.pop();
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.synth.playCrash();
    }

    draw(renderer) {
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

        // UI
        if (this.isGameOver) {
            const w = renderer.width;
            const h = renderer.height;
            renderer.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            renderer.ctx.fillRect(0, 0, w, h);
            renderer.drawText("GAME OVER", w/2, h/2 - 20, 40, '#fff');
            renderer.drawText("Score: " + this.score, w/2, h/2 + 30, 25, '#ccc');
            renderer.drawText("Press Button to Retry", w/2, h/2 + 70, 20, '#fff');
        }
    }
}
