/**
 * NEGEN Renderer (Base)
 * Abstract base class for rendering strategies.
 */
export default class Renderer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    clear() {
        console.warn("Renderer.clear() not implemented");
    }

    render(scene) {
        console.warn("Renderer.render() not implemented");
    }
}
