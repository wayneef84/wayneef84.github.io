/**
 * negen/assets/AssetLoader.js
 * Promise-based asset loader for the Hybrid Engine.
 * Supports Images and Audio with a shared cache.
 */
(function(global) {
    'use strict';

    var AssetLoader = {
        cache: {
            images: {},
            audio: {}
        },

        /**
         * Load a bundle of assets (mixed types).
         * @param {Array<string>} urls - List of file paths.
         * @returns {Promise} Resolves when all assets are loaded.
         */
        loadBundle: function(urls) {
            var promises = urls.map(function(url) {
                if (url.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
                    return AssetLoader.loadImage(url);
                } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
                    return AssetLoader.loadAudio(url);
                } else {
                    console.warn('AssetLoader: Unknown file type for ' + url);
                    return Promise.resolve(null);
                }
            });
            return Promise.all(promises);
        },

        /**
         * Load a single image.
         */
        loadImage: function(url) {
            // Check cache
            if (AssetLoader.cache.images[url]) {
                return Promise.resolve(AssetLoader.cache.images[url]);
            }

            return new Promise(function(resolve, reject) {
                var img = new Image();
                img.onload = function() {
                    AssetLoader.cache.images[url] = img;
                    resolve(img);
                };
                img.onerror = function() {
                    console.error('AssetLoader: Failed to load image ' + url);
                    reject(new Error('Failed to load image: ' + url));
                };
                img.src = url;
            });
        },

        /**
         * Load a single audio file (via XHR/ArrayBuffer).
         */
        loadAudio: function(url) {
            // Check cache
            if (AssetLoader.cache.audio[url]) {
                return Promise.resolve(AssetLoader.cache.audio[url]);
            }

            // Requires AudioContext to decode
            var audioCtx = (global.Negen && global.Negen.Audio)
                         ? global.Negen.Audio.context
                         : (new (window.AudioContext || window.webkitAudioContext)());

            return new Promise(function(resolve, reject) {
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';

                request.onload = function() {
                    audioCtx.decodeAudioData(request.response, function(buffer) {
                        AssetLoader.cache.audio[url] = buffer;
                        resolve(buffer);
                    }, function(err) {
                        console.error('AssetLoader: Failed to decode audio ' + url);
                        reject(err);
                    });
                };

                request.onerror = function() {
                    console.error('AssetLoader: Network error loading ' + url);
                    reject(new Error('Network error loading audio: ' + url));
                };

                request.send();
            });
        },

        /**
         * Get an asset from cache synchronously.
         */
        get: function(url) {
            return AssetLoader.cache.images[url] || AssetLoader.cache.audio[url];
        }
    };

    // Export
    global.Negen = global.Negen || {};
    global.Negen.AssetLoader = AssetLoader;

})(typeof window !== 'undefined' ? window : this);
