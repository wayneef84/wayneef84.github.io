import Engine from '../../../negen/core/Engine.js';
import InputManager from '../../../negen/input/InputManager.js';
import AudioManager from '../../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../../negen/graphics/CanvasRenderer.js';
import PongScene from './PongScene.js';

const canvas = document.getElementById('negenCanvas');
// Pong is typically landscape
const engine = new Engine({
    canvas: canvas,
    width: 800,
    height: 600
});

engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, 800, 600));

const scene = new PongScene(engine);
engine.loadScene(scene);

function start() {
    engine.audio.init();
    engine.start();
    document.getElementById('startOverlay').style.display = 'none';
    canvas.removeEventListener('click', start);
    canvas.removeEventListener('touchstart', start);
    // Also remove from overlay just in case
    document.getElementById('startOverlay').removeEventListener('click', start);
}

canvas.addEventListener('click', start);
canvas.addEventListener('touchstart', start, {passive: false});
document.getElementById('startOverlay').addEventListener('click', start);
document.getElementById('startOverlay').addEventListener('touchstart', start, {passive: false});
