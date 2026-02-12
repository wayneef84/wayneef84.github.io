/**
 * Common Utilities for Flash Classics Collection
 * ES5 Compatibility Mode
 */

(function() {
    // Polyfill requestAnimationFrame
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Simple Game State Manager
var GameState = {
    MENU: 0,
    PLAYING: 1,
    GAMEOVER: 2
};

// Utility Functions
var Utils = {
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    rectIntersect: function(r1, r2) {
        return !(r2.left > r1.right ||
                 r2.right < r1.left ||
                 r2.top > r1.bottom ||
                 r2.bottom < r1.top);
    },

    // Simple AABB Collision
    checkCollision: function(rect1, rect2) {
        return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y);
    },

    // Handle touch/mouse unification
    addInputListener: function(element, callback) {
        element.addEventListener('mousedown', function(e) {
            e.preventDefault();
            callback(true, e); // Pressed
        });
        element.addEventListener('mouseup', function(e) {
            e.preventDefault();
            callback(false, e); // Released
        });
        element.addEventListener('touchstart', function(e) {
            e.preventDefault(); // Prevent scrolling
            callback(true, e.touches[0]); // Pressed
        }, {passive: false});
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            callback(false, e); // Released
        }, {passive: false});
    }
};
