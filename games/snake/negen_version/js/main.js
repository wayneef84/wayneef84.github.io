import Engine from '../../../../negen/core/Engine.js';
import InputManager from '../../../../negen/input/InputManager.js';
import AudioManager from '../../../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../../../negen/graphics/CanvasRenderer.js';
import SnakeScene from './SnakeScene.js';

// Init NEGEN
const canvas = document.getElementById('negenCanvas');
const engine = new Engine({
    canvas: canvas,
    width: 600,
    height: 600
});

// Register Systems
engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, 600, 600));

// Load Scene
const snakeScene = new SnakeScene(engine);
engine.loadScene(snakeScene);

// Start on first input (AudioContext unlock)
function start() {
    engine.audio.init(); // Must be user triggered
    engine.start();
    document.getElementById('startOverlay').style.display = 'none';

    // Bind touch/mouse for start
    canvas.removeEventListener('click', start);
    canvas.removeEventListener('touchstart', start);
}

canvas.addEventListener('click', start);
canvas.addEventListener('touchstart', start, {passive: false});

// Make Engine globally accessible for debug
window.negen = engine;
