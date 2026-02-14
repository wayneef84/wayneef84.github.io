class AudioEngine {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentTrackUrl = null;
    }

    /**
     * Search for tracks using iTunes Search API
     * @param {string} term Search term (e.g., genre or artist)
     * @param {number} limit Number of results to return
     * @returns {Promise<Array>} List of track objects
     */
    async searchTracks(term, limit = 20) {
        try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&limit=${limit}&media=music&entity=song`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`iTunes API Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Filter results to ensure they have previewUrl and trackName
            return data.results.filter(track => track.previewUrl && track.trackName && track.artistName);
        } catch (error) {
            console.error("AudioEngine search failed:", error);
            throw error;
        }
    }

    /**
     * Play a track from a URL
     * @param {string} url Preview URL
     * @returns {Promise<void>}
     */
    async play(url) {
        if (this.audio) {
            this.stop();
        }

        this.currentTrackUrl = url;
        this.audio = new Audio(url);
        this.isPlaying = true;

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            if (this.onTrackEnd) {
                this.onTrackEnd();
            }
        });

        try {
            await this.audio.play();
        } catch (error) {
            console.error("Playback failed:", error);
            this.isPlaying = false;
            throw error;
        }
    }

    /**
     * Stop playback
     */
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
        this.isPlaying = false;
        this.currentTrackUrl = null;
    }

    /**
     * Pause playback
     */
    pause() {
        if (this.audio && this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    /**
     * Resume playback
     */
    resume() {
        if (this.audio && !this.isPlaying && this.currentTrackUrl) {
            this.audio.play().catch(e => console.error("Resume failed:", e));
            this.isPlaying = true;
        }
    }

    /**
     * Set a callback for when the track ends naturally
     * @param {Function} callback
     */
    setTrackEndCallback(callback) {
        this.onTrackEnd = callback;
    }
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.AudioEngine = AudioEngine;
}
