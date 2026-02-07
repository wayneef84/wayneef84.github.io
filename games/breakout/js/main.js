import Engine from '../../../negen/core/Engine.js';
import InputManager from '../../../negen/input/InputManager.js';
import AudioManager from '../../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../../negen/graphics/CanvasRenderer.js';
import BreakoutScene from './BreakoutScene.js';

const canvas = document.getElementById('negenCanvas');
const engine = new Engine({
    canvas: canvas,
    width: 600,
    height: 800
});

engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, 600, 800));

const scene = new BreakoutScene(engine);
engine.loadScene(scene);

function start() {
    engine.audio.init();
    engine.start();
    document.getElementById('startOverlay').style.display = 'none';
    canvas.removeEventListener('click', start);
    canvas.removeEventListener('touchstart', start);
}

canvas.addEventListener('click', start);
canvas.addEventListener('touchstart', start, {passive: false});
document.getElementById('startOverlay').addEventListener('click', start);
document.getElementById('startOverlay').addEventListener('touchstart', start, {passive: false});
