import MathUtils from '../utils/MathUtils.js';

export default class Entity {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.active = true;
        this.color = '#fff';
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(renderer) {
        if (!this.active) return;
        renderer.drawRect(this.x, this.y, this.width, this.height, this.color);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: this.width,
            h: this.height
        };
    }
}
