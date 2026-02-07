import Engine from '../../negen/core/Engine.js';
import InputManager from '../../negen/input/InputManager.js';
import AudioManager from '../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../negen/graphics/CanvasRenderer.js';
import SkyScene from './SkyScene.js';

// Init
const canvas = document.getElementById('gameCanvas');
const engine = new Engine({
    canvas: canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, window.innerWidth, window.innerHeight));

const scene = new SkyScene(engine);
engine.loadScene(scene);

// Start
document.addEventListener('click', () => {
    if (!engine.audio.ctx) {
        engine.audio.init();
    } else if (engine.audio.ctx.state === 'suspended') {
        engine.audio.ctx.resume();
    }
}, { once: true });

engine.start();

// Resize
window.addEventListener('resize', () => {
    engine.renderer.resize(window.innerWidth, window.innerHeight);
    scene.reset(); // Reset on resize for simplicity
});

window.negen = engine;
