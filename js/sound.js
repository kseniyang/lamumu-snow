class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    // Resume audio context (required for user interaction)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Create retro 8-bit style sounds
    createSound(frequency, duration, type = 'square', volume = null) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            this.resume();
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const vol = volume !== null ? volume : this.volume;
            gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }
    
    // Create complex sounds with multiple tones
    createComplexSound(notes, type = 'square', volume = null) {
        if (!this.enabled || !this.audioContext) return;
        
        notes.forEach(note => {
            setTimeout(() => {
                this.createSound(note.frequency, note.duration, type, volume);
            }, note.delay || 0);
        });
    }
    
    // Game-specific sound effects
    playJump() {
        // Quick upward "boing" sound
        this.createSound(220, 0.1, 'square', 0.2);
        setTimeout(() => this.createSound(330, 0.08, 'square', 0.15), 50);
    }
    
    playShoot() {
        // Whoosh sound for throwing snowball
        this.createSound(150, 0.15, 'sawtooth', 0.25);
        setTimeout(() => this.createSound(100, 0.1, 'sawtooth', 0.2), 80);
    }
    
    playHit() {
        // Impact sound when snowball hits enemy
        this.createSound(80, 0.1, 'square', 0.3);
        setTimeout(() => this.createSound(60, 0.08, 'square', 0.2), 50);
    }
    
    playFreeze() {
        // Crystalline freezing sound
        this.createComplexSound([
            { frequency: 800, duration: 0.1, delay: 0 },
            { frequency: 1000, duration: 0.08, delay: 50 },
            { frequency: 1200, duration: 0.06, delay: 100 }
        ], 'sine', 0.2);
    }
    
    playPush() {
        // Powerful push sound
        this.createSound(100, 0.2, 'square', 0.35);
        setTimeout(() => this.createSound(150, 0.15, 'square', 0.25), 100);
    }
    
    playEnemyDeath() {
        // Descending "pop" sound
        this.createComplexSound([
            { frequency: 400, duration: 0.1, delay: 0 },
            { frequency: 300, duration: 0.1, delay: 80 },
            { frequency: 200, duration: 0.15, delay: 160 }
        ], 'square', 0.3);
    }
    
    playPlayerDeath() {
        // Sad descending melody
        this.createComplexSound([
            { frequency: 330, duration: 0.2, delay: 0 },
            { frequency: 294, duration: 0.2, delay: 200 },
            { frequency: 262, duration: 0.2, delay: 400 },
            { frequency: 220, duration: 0.4, delay: 600 }
        ], 'triangle', 0.25);
    }
    
    playLevelComplete() {
        // Victory fanfare
        this.createComplexSound([
            { frequency: 523, duration: 0.2, delay: 0 },    // C5
            { frequency: 659, duration: 0.2, delay: 200 },  // E5
            { frequency: 784, duration: 0.2, delay: 400 },  // G5
            { frequency: 1047, duration: 0.4, delay: 600 }  // C6
        ], 'triangle', 0.3);
    }
    
    playGameOver() {
        // Dramatic game over sound
        this.createComplexSound([
            { frequency: 220, duration: 0.3, delay: 0 },
            { frequency: 196, duration: 0.3, delay: 300 },
            { frequency: 175, duration: 0.3, delay: 600 },
            { frequency: 147, duration: 0.6, delay: 900 }
        ], 'sawtooth', 0.3);
    }
    
    playAngerIncrease() {
        // Menacing anger sound
        this.createSound(60, 0.3, 'sawtooth', 0.2);
        setTimeout(() => this.createSound(80, 0.2, 'sawtooth', 0.25), 150);
    }
    
    playPickup() {
        // Pleasant pickup sound
        this.createComplexSound([
            { frequency: 523, duration: 0.1, delay: 0 },
            { frequency: 659, duration: 0.1, delay: 80 },
            { frequency: 784, duration: 0.15, delay: 160 }
        ], 'sine', 0.2);
    }
    
    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    // Set volume (0.0 to 1.0)
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}
