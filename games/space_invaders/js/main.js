import Engine from '../../../negen/core/Engine.js';
import InputManager from '../../../negen/input/InputManager.js';
import AudioManager from '../../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../../negen/graphics/CanvasRenderer.js';
import InvadersScene from './InvadersScene.js';

const canvas = document.getElementById('negenCanvas');
// Vertical aspect ratio
const engine = new Engine({
    canvas: canvas,
    width: 600,
    height: 800
});

engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, 600, 800));

const scene = new InvadersScene(engine);
engine.loadScene(scene);

function start() {
    engine.audio.init();
    engine.start();
    document.getElementById('startOverlay').style.display = 'none';

    // Remove listeners
    canvas.removeEventListener('click', start);
    canvas.removeEventListener('touchstart', start);
    document.getElementById('startOverlay').removeEventListener('click', start);
    document.getElementById('startOverlay').removeEventListener('touchstart', start);
    window.removeEventListener('keydown', handleKeyStart);
}

function handleKeyStart(e) {
    if (e.code === 'Enter' || e.code === 'Space') {
        if (e.code === 'Space') e.preventDefault();
        start();
    }
}

// Bind Start Inputs (Touch, Click, Keyboard)
canvas.addEventListener('click', start);
canvas.addEventListener('touchstart', start, {passive: false});

const overlay = document.getElementById('startOverlay');
overlay.addEventListener('click', start);
overlay.addEventListener('touchstart', start, {passive: false});

window.addEventListener('keydown', handleKeyStart);
