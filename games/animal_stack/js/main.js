import Engine from '../../negen/core/Engine.js';
import InputManager from '../../negen/input/InputManager.js';
import AudioManager from '../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../negen/graphics/CanvasRenderer.js';
import AnimalStackScene from './AnimalStackScene.js';

const canvas = document.getElementById('negenCanvas');
const engine = new Engine({
    canvas: canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, window.innerWidth, window.innerHeight));

const scene = new AnimalStackScene(engine);
engine.loadScene(scene);

function start() {
    engine.audio.init();
    engine.start();
    document.getElementById('startOverlay').style.display = 'none';
}

document.getElementById('startOverlay').addEventListener('click', start);

window.addEventListener('resize', () => {
    if(engine.renderer) engine.renderer.resize(window.innerWidth, window.innerHeight);
});
