import Entity from '../core/Entity.js';

export default class Card extends Entity {
    constructor(uuid, suit, rank) {
        super();
        this.uuid = uuid;
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;

        // Visual State
        this.rotation = 0; // Z-axis rotation (0-360)
        this.flipProgress = 0; // 0 (Back) to 1 (Front)
        this.targetX = 0;
        this.targetY = 0;
        this.scale = 1;

        // Visual Assets (Texture / DOM Element)
        // Hybrid Renderer: If DOM, this.element is set. If Canvas, uses assets.
        this.element = null;
    }

    // Logic
    flip() {
        this.faceUp = !this.faceUp;
        // Animation logic handled in update() via Lerp
    }

    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    // Update (Physics/Animation)
    update(dt) {
        // Simple Lerp for movement
        const speed = 10 * dt;
        this.x += (this.targetX - this.x) * speed;
        this.y += (this.targetY - this.y) * speed;

        // Snap if close
        if (Math.abs(this.targetX - this.x) < 0.5) this.x = this.targetX;
        if (Math.abs(this.targetY - this.y) < 0.5) this.y = this.targetY;

        // Sync DOM if exists
        if (this.element) {
            this.syncDOM();
        }
    }

    syncDOM() {
        if(!this.element) return;

        const transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg) scale(${this.scale})`;
        this.element.style.transform = transform;
        this.element.dataset.face = this.faceUp ? 'up' : 'down';

        // CSS handles the visual flip via dataset or class
        // but we can also force it here if using 3D transforms
    }
}
