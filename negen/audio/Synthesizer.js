/**
 * NEGEN Synthesizer
 * A lightweight wrapper around Web Audio API for generating retro sounds on the fly.
 * Removes dependencies on external mp3/wav files for simple effects.
 */
export default class Synthesizer {
    constructor(audioManager) {
        this.audioManager = audioManager;
    }

    get ctx() {
        return this.audioManager.ctx;
    }

    /**
     * Plays a simple tone.
     * @param {number} freq - Frequency in Hz
     * @param {string} type - Waveform type ('sine', 'square', 'sawtooth', 'triangle')
     * @param {number} duration - Duration in seconds
     * @param {number} [slideTo] - Frequency to slide to (optional)
     * @param {number} [vol=0.1] - Volume (0.0 to 1.0)
     */
    playTone(freq, type = 'sine', duration = 0.1, slideTo = null, vol = 0.1) {
        if (this.audioManager.isMuted || !this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            if (slideTo) {
                osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
            }

            // Envelope: Attack (Instant) -> Decay (Exponential)
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioManager.masterGain); // Route through master volume

            osc.start();
            osc.stop(this.ctx.currentTime + duration);

            // Cleanup
            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };

        } catch (e) {
            console.warn('Synthesizer Error:', e);
        }
    }

    /**
     * Preset: "Eat" (Snake, Collectible)
     */
    playEat() {
        this.playTone(600, 'sine', 0.1, 800, 0.1);
    }

    /**
     * Preset: "Crash" (Game Over, Hit)
     */
    playCrash() {
        this.playTone(150, 'sawtooth', 0.4, 50, 0.2);
    }

    /**
     * Preset: "Jump" (Platformer)
     */
    playJump() {
        this.playTone(150, 'square', 0.2, 300, 0.1);
    }

    /**
     * Preset: "Select" (UI Click)
     */
    playSelect() {
        this.playTone(800, 'triangle', 0.05, null, 0.05);
    }
}
