// games/jigsaw/js/storage.js

var Storage = (function() {
    var PREFIX = 'jigsaw_';

    function save(key, data) {
        try {
            var json = JSON.stringify(data);
            localStorage.setItem(PREFIX + key, json);
            return true;
        } catch (e) {
            console.error("Storage failed:", e);
            if (e.name === 'QuotaExceededError') {
                alert("Storage full! Cannot save puzzle. Try a smaller image.");
            }
            return false;
        }
    }

    function load(key) {
        try {
            var json = localStorage.getItem(PREFIX + key);
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.error("Load failed:", e);
            return null;
        }
    }

    function clear(key) {
        localStorage.removeItem(PREFIX + key);
    }

    // Special handling for images to compress if needed
    function saveImage(dataUrl) {
        // limit check?
        // For now, just try to save.
        return save('image', dataUrl);
    }

    function loadImage() {
        return load('image');
    }

    return {
        save: save,
        load: load,
        clear: clear,
        saveImage: saveImage,
        loadImage: loadImage
    };
})();
