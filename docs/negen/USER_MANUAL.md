# NEGEN User Manual

**Attributor:** Jules
**Last Updated:** 2024-02-04 12:05 UTC (Estimated)

## Welcome to NEGEN

NEGEN (New Engine) is the custom game engine powering the F.O.N.G. platform. This manual will guide you through setting up a project and creating your first game.

## Getting Started

### 1. Project Setup
NEGEN assumes a standard directory structure. Your game should reside in `games/<your_game>/`.
You will need an `index.html` file and an entry point script (usually `game.js` or `main.js`).

### 2. The HTML Boilerplate
Your HTML file needs a `<canvas>` element and should import the engine as a module.

```html
<!DOCTYPE html>
<html>
<head>
    <title>My NEGEN Game</title>
    <link rel="stylesheet" href="../../negen/style.css">
</head>
<body>
    <div id="game-container">
        <canvas id="gameCanvas"></canvas>
    </div>
    <script type="module" src="game.js"></script>
</body>
</html>
```

### 3. The Entry Point (`game.js`)
Initialize the engine and load your first scene.

```javascript
import { Engine, InputManager, CanvasRenderer, AudioManager } from '../../negen/index.js';
import MyScene from './MyScene.js';

// 1. Config
const canvas = document.getElementById('gameCanvas');
const engine = new Engine({
    canvas: canvas,
    width: 800,
    height: 600
});

// 2. Register Systems
engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, 800, 600));

// 3. Load Scene & Start
const startScene = new MyScene(engine);
engine.loadScene(startScene);
engine.start();
```

## Creating a Scene

All game logic lives in Scenes. Create a class that extends `Scene`.

```javascript
import { Scene } from '../../negen/index.js';

export default class MyScene extends Scene {
    init() {
        // Called once on creation
        this.playerX = 400;
        this.playerY = 300;
    }

    update(dt) {
        // specific logic
        const input = this.engine.input;

        // Move with Arrow Keys
        if (input.isKeyDown('ArrowLeft')) this.playerX -= 5;
        if (input.isKeyDown('ArrowRight')) this.playerX += 5;

        // Play sound on Click
        if (input.pointer.isPressed) {
            this.engine.audio.playTone(440, 'sine', 0.1);
        }
    }

    draw(renderer) {
        // Draw Player
        renderer.drawRect(this.playerX, this.playerY, 50, 50, '#00ff00');

        // Draw Text
        renderer.drawText("Hello NEGEN!", 400, 100, 24, '#ffffff');
    }
}
```

## Common Tasks

### Handling Input
Use `this.engine.input` in your `update()` method.
*   **Keyboard:** `isKeyDown('KeyA')`, `isKeyPressed('Space')`.
*   **Mouse/Touch:** `pointer.x`, `pointer.y`, `pointer.isPressed`.

### Playing Audio
Use `this.engine.audio`.
*   **Synth:** `playTone(frequency, type, duration)` is great for retro effects.
*   **Mute:** `toggleMute()` handles global muting.

### Loading Assets
Use the `AssetLoader` (if registered) or manual imports.
```javascript
// In init() or a loading scene
await this.engine.assets.loadImage('player', 'player.png');

// In draw()
const img = this.engine.assets.getImage('player');
renderer.drawImage(img, x, y);
```
