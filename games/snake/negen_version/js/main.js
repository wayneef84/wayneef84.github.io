import Engine from '../../../../negen/core/Engine.mjs';
import InputManager from '../../../../negen/input/InputManager.js';
import AudioManager from '../../../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../../../negen/graphics/CanvasRenderer.js';
import SnakeScene from './SnakeScene.js';
import BattleRoyaleScene from './BattleRoyaleScene.js';

// Init NEGEN
const canvas = document.getElementById('negenCanvas');
const engine = new Engine({
    canvas: canvas,
    width: window.innerWidth,
    height: window.innerHeight
});

// Register Systems
engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, window.innerWidth, window.innerHeight));

// Simple Mode Switching Logic
let currentScene = null;

function loadMode(mode) {
    if(mode === 'classic') {
        currentScene = new SnakeScene(engine);
    } else if (mode === 'battle') {
        currentScene = new BattleRoyaleScene(engine);
    }
    engine.loadScene(currentScene);
}

// Start with Classic by default, but UI needs to allow switching
// For now, we'll hack the UI to add a mode selector
loadMode('classic');

// Start on first input (AudioContext unlock)
function start() {
    engine.audio.init(); // Must be user triggered
    engine.start();
    document.getElementById('startOverlay').style.display = 'none';

    // Bind touch/mouse for start
    // canvas.removeEventListener('click', start);
    // canvas.removeEventListener('touchstart', start);
}

// Add Mode Buttons to Overlay
const overlay = document.getElementById('startOverlay');
const btnContainer = document.createElement('div');
btnContainer.style.display = 'flex';
btnContainer.style.gap = '20px';
btnContainer.style.marginTop = '20px';

const btnClassic = document.createElement('button');
btnClassic.className = 'btn';
btnClassic.innerText = 'CLASSIC';
btnClassic.onclick = (e) => {
    e.stopPropagation();
    loadMode('classic');
    start();
};

const btnBattle = document.createElement('button');
btnBattle.className = 'btn';
btnBattle.innerText = 'BATTLE 360';
btnBattle.style.background = '#00ffff';
btnBattle.style.color = '#000';
btnBattle.onclick = (e) => {
    e.stopPropagation();
    loadMode('battle');
    start();
};

// Replace existing button
const oldBtn = overlay.querySelector('.btn');
if(oldBtn) oldBtn.remove();

btnContainer.appendChild(btnClassic);
btnContainer.appendChild(btnBattle);
overlay.appendChild(btnContainer);

// Also handle resize for full screen canvas
window.addEventListener('resize', () => {
    if(engine.renderer) engine.renderer.resize(window.innerWidth, window.innerHeight);
    if(currentScene && currentScene.resize) currentScene.resize();
});

// Make Engine globally accessible for debug
window.negen = engine;
