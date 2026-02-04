class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('oracle_muted') === 'true';
        this.initialized = false;
    }

    init() {
        if (this.initialized) {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return;
        }

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('oracle_muted', this.muted);
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    playShake() {
        if (this.muted || !this.ctx) return;

        // Ensure context is running
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;
        const duration = 0.8;

        // White Noise for liquid slosh
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass Filter (muffled liquid sound)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + duration);

        // Gain Envelope
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.8, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(t);
        noise.stop(t + duration);
    }

    playReveal() {
        if (this.muted || !this.ctx) return;

        if (this.ctx.state === 'suspended') this.ctx.resume();

        const t = this.ctx.currentTime;

        // Oscillator for "Ding"
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.1); // Slight pitch bend

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05); // Quick attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0); // Long decay

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 2.0);
    }
}
