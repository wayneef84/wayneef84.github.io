import Scene from '../../../negen/core/Scene.js';
import InvadersScene from './InvadersScene.js';
import BuilderScene from './BuilderScene.js';

export default class MenuScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;
        this.playBtn  = { x: this.width/2 - 100, y: 300, w: 200, h: 50, text: 'PLAY CLASSIC' };
        this.buildBtn = { x: this.width/2 - 100, y: 400, w: 200, h: 50, text: 'LEVEL BUILDER' };
    }

    update(dt) {
        if (this.engine.input.pointer.isPressed) {
            var mx = this.engine.input.pointer.x;
            var my = this.engine.input.pointer.y;

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
