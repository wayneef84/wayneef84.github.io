/**
 * negen/graphics/Renderer.js
 * The "Hybrid Renderer" for Phase 2.
 * Manages Layer 0 (Canvas) and Layer 1 (DOM) simultaneously.
 */
(function(global) {
    'use strict';

    var Renderer = function(containerId) {
        this.container = document.getElementById(containerId) || document.body;

        // Layer 0: Canvas (Background / High Perf)
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'negen-layer-0';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none'; // Passthrough to DOM layer
        this.ctx = this.canvas.getContext('2d');

        // Layer 1: DOM (UI / Cards)
        this.uiLayer = document.createElement('div');
        this.uiLayer.id = 'game-ui';
        this.uiLayer.className = 'negen-layer-1';
        this.uiLayer.style.position = 'absolute';
        this.uiLayer.style.top = '0';
        this.uiLayer.style.left = '0';
        this.uiLayer.style.width = '100%';
        this.uiLayer.style.height = '100%';
        this.uiLayer.style.zIndex = '1';
        this.uiLayer.style.overflow = 'hidden';

        // Append layers
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.uiLayer);

        // Handle Resize
        this._resize = this._resize.bind(this);
        window.addEventListener('resize', this._resize);
        this._resize(); // Initial sizing
    };

    Renderer.prototype._resize = function() {
        var rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        // Resize Canvas (handle DPI if needed later, simple for now)
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    };

    /**
     * Clears the Canvas layer.
     * DOM layer doesn't need "clearing" per se, as elements are persistent.
     */
    Renderer.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    };

    /**
     * Layer 0: Draw a sprite/image to the canvas.
     */
    Renderer.prototype.drawSprite = function(image, x, y, width, height) {
        if (!image) return;
        // Optional scaling
        var w = width || image.width;
        var h = height || image.height;
        this.ctx.drawImage(image, x, y, w, h);
    };

    /**
     * Layer 1: Update a DOM element's position via CSS Transform.
     * This is much more performant than updating top/left.
     */
    Renderer.prototype.drawDOM = function(element, x, y, rotation) {
        if (!element) return;

        // Ensure element is in the DOM layer
        if (element.parentNode !== this.uiLayer) {
            this.uiLayer.appendChild(element);
        }

        var transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
        if (rotation) {
            transform += ' rotate(' + rotation + 'deg)';
        }
        element.style.transform = transform;
    };

    /**
     * Helper to create a DOM element for Layer 1
     */
    Renderer.prototype.createDOMEntity = function(className, content) {
        var el = document.createElement('div');
        el.className = className;
        el.innerHTML = content || '';
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.willChange = 'transform'; // Hint browser for optimization
        this.uiLayer.appendChild(el);
        return el;
    };

    /**
     * Remove a DOM element
     */
    Renderer.prototype.removeDOMEntity = function(element) {
        if (element && element.parentNode === this.uiLayer) {
            this.uiLayer.removeChild(element);
        }
    };

    // Export
    global.Negen = global.Negen || {};
    global.Negen.Renderer = Renderer;

})(typeof window !== 'undefined' ? window : this);
