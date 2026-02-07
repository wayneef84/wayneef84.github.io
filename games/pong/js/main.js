import Engine from '../../../negen/core/Engine.mjs';
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

function start(e) {
    if (e && (e.type === 'touchstart' || e.type === 'keydown')) {
        if (e.cancelable) e.preventDefault();
    }

    if (!engine.audio.ctx) {
        engine.audio.init();
    }
    if (engine.audio.ctx && engine.audio.ctx.state === 'suspended') {
        engine.audio.ctx.resume();
    }

    engine.start();
    document.getElementById('startOverlay').style.display = 'none';

    // Cleanup
    document.removeEventListener('click', start);
    document.removeEventListener('touchstart', start);
    document.removeEventListener('keydown', start);
}

// Attach to document to ensure tap anywhere works
document.addEventListener('click', start);
document.addEventListener('touchstart', start, {passive: false});
document.addEventListener('keydown', start);
