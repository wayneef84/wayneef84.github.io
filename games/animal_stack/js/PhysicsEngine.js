export default class PhysicsEngine {
    constructor() {
        this.gravity = 500;
        this.bodies = [];
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const idx = this.bodies.indexOf(body);
        if (idx !== -1) this.bodies.splice(idx, 1);
    }

    update(dt) {
        const dtSec = dt / 1000;

        // Integration
        for (let b of this.bodies) {
            if (b.static) continue;

            b.vy += this.gravity * dtSec;
            b.vx *= 0.99; // Damping
            b.vy *= 0.99;
            b.va *= 0.95; // Angular damping

            b.x += b.vx * dtSec;
            b.y += b.vy * dtSec;
            b.angle += b.va * dtSec;

            b.updateVertices();
        }

        // Collision Detection & Resolution (Very simple iterative solver)
        const iterations = 4;
        for (let i=0; i<iterations; i++) {
            for (let j=0; j<this.bodies.length; j++) {
                for (let k=j+1; k<this.bodies.length; k++) {
                    const b1 = this.bodies[j];
                    const b2 = this.bodies[k];
                    if (b1.static && b2.static) continue;

                    const collision = this.checkCollision(b1, b2);
                    if (collision) {
                        this.resolveCollision(b1, b2, collision);
                    }
                }
            }
        }
    }

    // SAT (Separating Axis Theorem)
    checkCollision(b1, b2) {
        let overlap = Infinity;
        let smallestAxis = null;

        const axes1 = b1.getAxes();
        const axes2 = b2.getAxes();
        const axes = axes1.concat(axes2);

        for (let axis of axes) {
            const p1 = b1.project(axis);
            const p2 = b2.project(axis);

            if (!this.overlap(p1, p2)) {
                return null; // Separating axis found
            } else {
                const o = this.getOverlap(p1, p2);
                if (o < overlap) {
                    overlap = o;
                    smallestAxis = axis;
                }
            }
        }

        return { overlap, axis: smallestAxis };
    }

    overlap(p1, p2) {
        return Math.max(p1.min, p2.min) <= Math.min(p1.max, p2.max);
    }

    getOverlap(p1, p2) {
        return Math.min(p1.max, p2.max) - Math.max(p1.min, p2.min);
    }

    resolveCollision(b1, b2, collision) {
        const normal = collision.axis;
        const overlap = collision.overlap;

        // Correct direction so normal points from b1 to b2
        const center1 = b1.getCenter();
        const center2 = b2.getCenter();
        const dir = { x: center2.x - center1.x, y: center2.y - center1.y };

        if (dir.x * normal.x + dir.y * normal.y < 0) {
            normal.x = -normal.x;
            normal.y = -normal.y;
        }

        // Separate bodies
        const totalMass = (b1.static ? 0 : 1) + (b2.static ? 0 : 1); // Assume equal mass for simplicity unless static
        if (totalMass === 0) return;

        if (!b1.static) {
            b1.x -= normal.x * overlap * (b2.static ? 1 : 0.5);
            b1.y -= normal.y * overlap * (b2.static ? 1 : 0.5);
            b1.updateVertices();
            // Kill velocity along normal
             const dot = b1.vx * normal.x + b1.vy * normal.y;
             if (dot > 0) {
                 b1.vx -= dot * normal.x;
                 b1.vy -= dot * normal.y;
             }
        }
        if (!b2.static) {
            b2.x += normal.x * overlap * (b1.static ? 1 : 0.5);
            b2.y += normal.y * overlap * (b1.static ? 1 : 0.5);
            b2.updateVertices();
             const dot = b2.vx * normal.x + b2.vy * normal.y;
             if (dot < 0) {
                 b2.vx -= dot * normal.x;
                 b2.vy -= dot * normal.y;
             }
        }

        // Simple friction/rotation impulse could be added here but keeping it basic for "Stack"
    }
}

export class Body {
    constructor(x, y, vertices, isStatic = false) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.vertices = vertices; // Relative to center (0,0)
        this.transformedVertices = [];
        this.static = isStatic;
        this.vx = 0;
        this.vy = 0;
        this.va = 0;
        this.updateVertices();
    }

    updateVertices() {
        this.transformedVertices = this.vertices.map(v => {
            const cos = Math.cos(this.angle);
            const sin = Math.sin(this.angle);
            return {
                x: this.x + (v.x * cos - v.y * sin),
                y: this.y + (v.x * sin + v.y * cos)
            };
        });
    }

    getAxes() {
        const axes = [];
        for (let i = 0; i < this.transformedVertices.length; i++) {
            const p1 = this.transformedVertices[i];
            const p2 = this.transformedVertices[(i + 1) % this.transformedVertices.length];
            const edge = { x: p1.x - p2.x, y: p1.y - p2.y };
            const normal = { x: -edge.y, y: edge.x };
            // Normalize
            const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            axes.push({ x: normal.x / len, y: normal.y / len });
        }
        return axes;
    }

    project(axis) {
        let min = Infinity;
        let max = -Infinity;
        for (let v of this.transformedVertices) {
            const dot = v.x * axis.x + v.y * axis.y;
            if (dot < min) min = dot;
            if (dot > max) max = dot;
        }
        return { min, max };
    }

    getCenter() {
        return { x: this.x, y: this.y };
    }
}
