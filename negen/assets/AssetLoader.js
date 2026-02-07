export default class AssetLoader {
    constructor() {
        this.images = {};
        this.json = {};
    }

    /**
     * Load an image and cache it.
     * @param {string} key Unique key for the asset
     * @param {string} src URL source
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            if (this.images[key]) {
                resolve(this.images[key]);
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                resolve(img);
            };
            img.onerror = (e) => {
                console.error(`Failed to load image: ${src}`, e);
                reject(e);
            };
            img.src = src;
        });
    }

    /**
     * Load a JSON file and cache it.
     * @param {string} key Unique key
     * @param {string} src URL source
     * @returns {Promise<Object>}
     */
    loadJSON(key, src) {
        return fetch(src)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.json[key] = data;
                return data;
            });
    }

    getImage(key) {
        return this.images[key];
    }

    getJSON(key) {
        return this.json[key];
    }
}
