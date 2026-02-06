import MathUtils from '../utils/MathUtils.js';

class Particle {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        const speed = config.speed || 2;
        this.vx = MathUtils.randomRange(config.minVx || -speed, config.maxVx || speed);
        this.vy = MathUtils.randomRange(config.minVy || -speed, config.maxVy || speed);
        this.life = config.life || 1.0;
        this.decay = config.decay || 0.02;
        this.size = config.size || 5;
        this.color = config.color || '#fff';
        this.active = true;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.95; // Shrink

        if (this.life <= 0 || this.size < 0.5) {
            this.active = false;
        }
    }
}

export default class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count = 10, config = {}) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, config));
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(dt);
            if (!p.active) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(renderer) {
        renderer.ctx.save();
        for (const p of this.particles) {
            renderer.ctx.globalAlpha = Math.max(0, p.life);
            renderer.drawRect(p.x, p.y, p.size, p.size, p.color);
        }
        renderer.ctx.restore();
    }
}
