/**
 * NEGEN Audio Manager
 * Wrapper for Web Audio API.
 */
export default class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.buffers = {}; // Store loaded audio buffers
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            console.log("NEGEN Audio Initialized");
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : Math.max(0, Math.min(1, value));
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            if (this.masterGain) this.masterGain.gain.value = 0;
        } else {
            // Restore volume (assume 1.0 for now, could store prev volume)
            if (this.masterGain) this.masterGain.gain.value = 1.0;
        }
        return this.isMuted;
    }

    /**
     * Synthesize a simple tone (like Snake)
     * @param {number} frequency Hz
     * @param {string} type 'sine', 'square', 'sawtooth', 'triangle'
     * @param {number} duration Seconds
     */
    playTone(frequency, type = 'sine', duration = 0.1) {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        // Envelope
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
}
