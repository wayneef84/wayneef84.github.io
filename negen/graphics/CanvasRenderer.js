import Renderer from './Renderer.js';

/**
 * NEGEN Canvas Renderer
 * Standard 2D Context renderer.
 */
export default class CanvasRenderer {
    constructor(canvas, width, height) {
        // Manually inherit properties instead of extending via super()
        // This avoids any weird module-to-IIFE prototype chain issues
        // We can just implement the methods we need.

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Handle High DPI displays
        this.dpr = window.devicePixelRatio || 1;
        this.resize(width, height);
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;

        // Use CSS for display size, but set aspect ratio to maintain proportions
        this.canvas.style.aspectRatio = `${width}/${height}`;

        this.ctx.scale(this.dpr, this.dpr);
    }

    clear(color = '#000000') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // --- Primitives ---

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
    }

    drawRectEffect(x, y, w, h, color, blur = 0, shadowColor = 'transparent') {
        this.ctx.shadowBlur = blur;
        this.ctx.shadowColor = shadowColor;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, w, h);
        this.ctx.shadowBlur = 0; // Reset
    }

    drawCircle(x, y, radius, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    drawCircleEffect(x, y, radius, color, blur = 0, shadowColor = 'transparent') {
        this.ctx.shadowBlur = blur;
        this.ctx.shadowColor = shadowColor;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawText(text, x, y, size = 20, color = '#fff', align = 'center') {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px sans-serif`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    drawImage(img, ...args) {
        if (!img) return;
        this.ctx.drawImage(img, ...args);
    }

    // Legacy DOM methods - needed if scenes use them, but Pong/SpaceInvaders use mostly canvas
    // Copy these from Renderer.js if needed or stub them
    drawDOM(element, x, y, rotation) {
        // Simple stub or implementation if games rely on it
        // Pong doesn't seem to use it.
    }
}
