import Engine from '../../../negen/core/Engine.js';
import InputManager from '../../../negen/input/InputManager.js';
import AudioManager from '../../../negen/audio/AudioManager.js';
import CanvasRenderer from '../../../negen/graphics/CanvasRenderer.js';
import InvadersScene from './InvadersScene.js';
import BuilderScene from './BuilderScene.js';
import Scene from '../../../negen/core/Scene.js';

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

class MenuScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;
        this.playBtn = { x: this.width/2 - 100, y: 300, w: 200, h: 50, text: 'PLAY CLASSIC' };
        this.buildBtn = { x: this.width/2 - 100, y: 400, w: 200, h: 50, text: 'LEVEL BUILDER' };
    }

    update(dt) {
        if (this.engine.input.pointer.isPressed) {
            const mx = this.engine.input.pointer.x;
            const my = this.engine.input.pointer.y;

            if (this.checkBtn(mx, my, this.playBtn)) {
                this.engine.loadScene(new InvadersScene());
            } else if (this.checkBtn(mx, my, this.buildBtn)) {
                this.engine.loadScene(new BuilderScene());
            }
        }
    }

    checkBtn(mx, my, btn) {
        return mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h;
    }

    draw(renderer) {
        renderer.clear('#111');
        renderer.drawText("SPACE INVADERS", this.width/2, 150, 40, '#fff');

        this.drawBtn(renderer, this.playBtn, '#0f0');
        this.drawBtn(renderer, this.buildBtn, '#00f');
    }

    drawBtn(renderer, btn, color) {
        renderer.ctx.fillStyle = color;
        renderer.ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        renderer.ctx.fillStyle = '#000';
        renderer.ctx.font = '20px Arial';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.textBaseline = 'middle';
        renderer.ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + btn.h/2);
    }
}

const scene = new MenuScene(engine);
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
