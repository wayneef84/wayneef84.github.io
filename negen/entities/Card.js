/**
 * negen/entities/Card.js
 * A "Hybrid" Entity representing a Playing Card.
 * Logic: Suit/Rank data.
 * Visual: DOM Element (Layer 1) with 3D CSS flips.
 */
(function(global) {
    'use strict';

    var Card = function(suit, rank, renderer) {
        this.suit = suit;
        this.rank = rank;
        this.isFaceUp = false;

        // Visual State
        this.x = 0;
        this.y = 0;
        this.rotation = 0;

        // Create DOM Element
        // Structure: .card > .card-inner > (.card-front + .card-back)
        this.element = renderer.createDOMEntity('negen-card');
        this.element.innerHTML =
            '<div class="card-inner">' +
                '<div class="card-front">' + this._getSymbol() + '</div>' +
                '<div class="card-back"></div>' +
            '</div>';

        // Apply basic styles dynamically (or rely on CSS class)
        this._styleElement();
    };

    Card.prototype._styleElement = function() {
        var el = this.element;
        el.style.width = '100px';
        el.style.height = '140px';
        el.style.perspective = '1000px';

        // Inner container for flip
        var inner = el.querySelector('.card-inner');
        inner.style.position = 'relative';
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.textAlign = 'center';
        inner.style.transition = 'transform 0.6s';
        inner.style.transformStyle = 'preserve-3d';

        // Faces
        var faces = el.querySelectorAll('.card-front, .card-back');
        for (var i = 0; i < faces.length; i++) {
            faces[i].style.position = 'absolute';
            faces[i].style.width = '100%';
            faces[i].style.height = '100%';
            faces[i].style.backfaceVisibility = 'hidden';
            faces[i].style.display = 'flex';
            faces[i].style.alignItems = 'center';
            faces[i].style.justifyContent = 'center';
            faces[i].style.fontSize = '24px';
            faces[i].style.border = '1px solid #ccc';
            faces[i].style.borderRadius = '8px';
            faces[i].style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        }

        var front = el.querySelector('.card-front');
        front.style.backgroundColor = '#fff';
        front.style.color = (this.suit === 'HEARTS' || this.suit === 'DIAMONDS') ? 'red' : 'black';

        var back = el.querySelector('.card-back');
        back.style.backgroundColor = '#2c3e50'; // Dark Blue Back
        back.style.transform = 'rotateY(180deg)';
    };

    Card.prototype._getSymbol = function() {
        var suitIcons = {
            'HEARTS': '♥',
            'DIAMONDS': '♦',
            'CLUBS': '♣',
            'SPADES': '♠'
        };
        return this.rank + '<br>' + (suitIcons[this.suit] || '?');
    };

    Card.prototype.flip = function() {
        this.isFaceUp = !this.isFaceUp;
        var inner = this.element.querySelector('.card-inner');
        if (this.isFaceUp) {
            inner.style.transform = 'rotateY(0deg)'; // Show Front
        } else {
            inner.style.transform = 'rotateY(180deg)'; // Show Back
        }
    };

    Card.prototype.setPosition = function(x, y, rotation) {
        this.x = x;
        this.y = y;
        this.rotation = rotation || 0;
        // Note: The Renderer will actually apply this to the DOM
        // during the draw() phase, or we can apply it immediately here.
        // For strict Phase 2 compliance, let's assume the Scene handles the drawing via Renderer.
    };

    // Export
    global.Negen = global.Negen || {};
    global.Negen.Entities = global.Negen.Entities || {};
    global.Negen.Entities.Card = Card;

})(typeof window !== 'undefined' ? window : this);
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
