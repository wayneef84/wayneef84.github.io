/**
 * DAD'S SLOTS - AUDIO ENGINE
 * File: js/audio.js
 * Version: 2.0
 * 
 * Uses Web Audio API to synthesize slot machine sounds
 * No external audio files required!
 */

class SlotAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3; // Master volume (0-1)
        this.initialized = false;
        this.bgMusic = null; // Current background music Audio element
        this.bgMusicVolume = 0.15; // Background music volume (0-1)
        this.currentMusicUrl = null;
    }

    // Must be called from a user gesture (click/tap) due to browser autoplay policies
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log("🔊 Audio Engine initialized");
        } catch (e) {
            console.warn("Audio not supported:", e);
            this.enabled = false;
        }
    }

    // Resume context if suspended (browser autoplay policy)
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;

        // Toggle background music
        if (this.bgMusic) {
            if (this.enabled) {
                this.bgMusic.play().catch(e => console.warn('Could not play music:', e));
            } else {
                this.bgMusic.pause();
            }
        }

        return this.enabled;
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
    }

    // --- SOUND GENERATORS ---

    // Button click / UI feedback
    playClick() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.value = 800;
        osc.type = 'square';
        
        gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
        gain.gain.exponentialDecayTo?.(0.01, this.ctx.currentTime + 0.05) ||
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // Reel spin - continuous ticker sound
    playSpinTick() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.value = 200 + Math.random() * 100;
        osc.type = 'triangle';
        
        gain.gain.setValueAtTime(this.volume * 0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.03);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.03);
    }

    // Reel stop - satisfying thunk
    playReelStop() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    // Small win - cheerful ding
    playWinSmall() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const notes = [523, 659, 784]; // C5, E5, G5 - major chord arpeggio
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            const startTime = this.ctx.currentTime + (i * 0.08);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    // Big win - triumphant fanfare
    playWinBig() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        // Fanfare notes: C-E-G-C(high)
        const notes = [
            { freq: 523, time: 0, duration: 0.15 },
            { freq: 659, time: 0.12, duration: 0.15 },
            { freq: 784, time: 0.24, duration: 0.15 },
            { freq: 1047, time: 0.36, duration: 0.5 }
        ];
        
        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.frequency.value = note.freq;
            osc.type = 'triangle';
            
            const startTime = this.ctx.currentTime + note.time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
            gain.gain.setValueAtTime(this.volume * 0.4, startTime + note.duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
            
            osc.start(startTime);
            osc.stop(startTime + note.duration);
        });

        // Add sparkle overlay
        for (let i = 0; i < 8; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.frequency.value = 2000 + Math.random() * 2000;
            osc.type = 'sine';
            
            const startTime = this.ctx.currentTime + 0.4 + (i * 0.05);
            gain.gain.setValueAtTime(this.volume * 0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        }
    }

    // Jackpot - extended celebration
    playJackpot() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        // Play big win first
        this.playWinBig();
        
        // Then add coin shower sounds
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                if (!this.ctx) return;
                
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.frequency.value = 1500 + Math.random() * 1500;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
                
                osc.start(this.ctx.currentTime);
                osc.stop(this.ctx.currentTime + 0.08);
            }, 600 + i * 50);
        }
    }

    // No win - subtle disappointed sound
    playNoWin() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.volume * 0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.2);
    }

    // Error sound
    playError() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.value = 150;
        osc.type = 'square';

        gain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    // --- BACKGROUND MUSIC ---

    loadBackgroundMusic(url) {
        // If same music is already loaded, don't reload
        if (this.currentMusicUrl === url && this.bgMusic) {
            return;
        }

        // Stop and clean up old music
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.src = '';
            this.bgMusic = null;
        }

        // No music for this theme
        if (!url) {
            this.currentMusicUrl = null;
            return;
        }

        // Load new music
        this.bgMusic = new Audio(url);
        this.bgMusic.loop = true;
        this.bgMusic.volume = this.bgMusicVolume;
        this.currentMusicUrl = url;

        // Auto-play if audio is enabled
        if (this.enabled) {
            this.bgMusic.play().catch(e => {
                console.warn('Background music autoplay blocked. User interaction required:', e);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    }

    setBgMusicVolume(val) {
        this.bgMusicVolume = Math.max(0, Math.min(1, val));
        if (this.bgMusic) {
            this.bgMusic.volume = this.bgMusicVolume;
        }
    }
}

// Global instance
const slotAudio = new SlotAudio();
