class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.backgroundMusic = null;
        this.isInitialized = false;
        this.isMusicPlaying = false;
        this.isMuted = false;
        this.currentTrack = 0;
        
        // Volume settings
        this.masterVolume = 0.3;
        this.musicVolume = 0.2;
        this.sfxVolume = 0.4;
    }

    async init() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Connect gain nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
            
            this.isInitialized = true;
            console.log('Audio system initialized');
            
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.isInitialized = false;
        }
    }

    // Start the background music loop
    startBackgroundMusic() {
        if (!this.isInitialized || this.isMusicPlaying || this.isMuted) return;
        
        this.playBackgroundMusic();
        this.isMusicPlaying = true;
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
        this.isMusicPlaying = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopBackgroundMusic();
            if (this.musicGain) {
                this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        } else {
            if (this.musicGain) {
                this.musicGain.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
            }
            if (!this.isMusicPlaying) {
                this.startBackgroundMusic();
            }
        }
        
        return this.isMuted;
    }

    nextTrack() {
        this.currentTrack = (this.currentTrack + 1) % 3;
        if (this.isMusicPlaying) {
            this.stopBackgroundMusic();
            setTimeout(() => {
                this.startBackgroundMusic();
            }, 100);
        }
    }

    // Generate and play catchy background music
    playBackgroundMusic() {
        if (!this.isInitialized) return;

        const duration = 12; // 12 second loop for more complex melody
        const startTime = this.audioContext.currentTime;
        
        // Create a catchy melody with multiple instruments
        this.playMelodyLine(startTime, duration);
        this.playBassLine(startTime, duration);
        this.playPercussion(startTime, duration);
        this.playHarmonies(startTime, duration);
        
        // Schedule the next loop
        setTimeout(() => {
            if (this.isMusicPlaying) {
                this.playBackgroundMusic();
            }
        }, duration * 1000);
    }

    // Generate melody based on current track
    playMelodyLine(startTime, duration) {
        const melodies = [
            this.getUpbeatMelody1(), 
            this.getUpbeatMelody2(), 
            this.getUpbeatMelody3()
        ];
        const notes = melodies[this.currentTrack % melodies.length];

        notes.forEach(note => {
            this.createToneWithVibrato(note.freq, startTime + note.start, note.duration, 'sine', 0.15, this.musicGain);
        });
    }

    // Energetic melody 1 - Dance-like
    getUpbeatMelody1() {
        return [
            // High energy opening
            { freq: 523.25, start: 0, duration: 0.3 },    // C5
            { freq: 587.33, start: 0.4, duration: 0.3 },  // D5
            { freq: 659.25, start: 0.8, duration: 0.4 },  // E5
            { freq: 783.99, start: 1.5, duration: 0.5 },  // G5
            
            // Bouncy rhythm
            { freq: 659.25, start: 2.2, duration: 0.3 },  // E5
            { freq: 587.33, start: 2.6, duration: 0.3 },  // D5
            { freq: 659.25, start: 3, duration: 0.3 },    // E5
            { freq: 783.99, start: 3.5, duration: 0.5 },  // G5
            
            // Exciting climb
            { freq: 880.00, start: 4.2, duration: 0.4 },  // A5
            { freq: 783.99, start: 4.7, duration: 0.3 },  // G5
            { freq: 659.25, start: 5.1, duration: 0.4 },  // E5
            { freq: 587.33, start: 5.7, duration: 0.8 },  // D5
            
            // Triumphant finish
            { freq: 783.99, start: 6.8, duration: 0.4 },  // G5
            { freq: 880.00, start: 7.3, duration: 0.4 },  // A5
            { freq: 1046.5, start: 7.8, duration: 1.2 },  // C6 (big finish)
            
            // Quick resolution
            { freq: 783.99, start: 9.2, duration: 0.4 },  // G5
            { freq: 523.25, start: 9.8, duration: 1.2 },  // C5
        ];
    }

    // Energetic melody 2 - Playful
    getUpbeatMelody2() {
        return [
            // Playful opening
            { freq: 440.00, start: 0, duration: 0.2 },    // A4
            { freq: 523.25, start: 0.3, duration: 0.2 },  // C5
            { freq: 659.25, start: 0.6, duration: 0.3 },  // E5
            { freq: 523.25, start: 1, duration: 0.2 },    // C5
            { freq: 659.25, start: 1.3, duration: 0.5 },  // E5
            
            // Happy bounce
            { freq: 783.99, start: 2, duration: 0.3 },    // G5
            { freq: 659.25, start: 2.4, duration: 0.3 },  // E5
            { freq: 783.99, start: 2.8, duration: 0.4 },  // G5
            { freq: 880.00, start: 3.4, duration: 0.6 },  // A5
            
            // Cheerful pattern
            { freq: 783.99, start: 4.2, duration: 0.2 },  // G5
            { freq: 659.25, start: 4.5, duration: 0.2 },  // E5
            { freq: 783.99, start: 4.8, duration: 0.2 },  // G5
            { freq: 1046.5, start: 5.2, duration: 0.8 },  // C6
            
            // Energetic conclusion
            { freq: 880.00, start: 6.2, duration: 0.3 },  // A5
            { freq: 783.99, start: 6.6, duration: 0.3 },  // G5
            { freq: 659.25, start: 7, duration: 0.5 },    // E5
            { freq: 523.25, start: 7.7, duration: 1.3 },  // C5
        ];
    }

    // Energetic melody 3 - Adventure theme
    getUpbeatMelody3() {
        return [
            // Adventure opening
            { freq: 587.33, start: 0, duration: 0.4 },    // D5
            { freq: 659.25, start: 0.5, duration: 0.4 },  // E5
            { freq: 739.99, start: 1, duration: 0.3 },    // F#5
            { freq: 880.00, start: 1.4, duration: 0.6 },  // A5
            
            // Heroic rhythm
            { freq: 783.99, start: 2.2, duration: 0.3 },  // G5
            { freq: 659.25, start: 2.6, duration: 0.3 },  // E5
            { freq: 587.33, start: 3, duration: 0.4 },    // D5
            { freq: 659.25, start: 3.6, duration: 0.6 },  // E5
            
            // Epic climb
            { freq: 739.99, start: 4.4, duration: 0.4 },  // F#5
            { freq: 880.00, start: 4.9, duration: 0.4 },  // A5
            { freq: 987.77, start: 5.4, duration: 0.5 },  // B5
            { freq: 1174.7, start: 6, duration: 0.8 },    // D6
            
            // Victory finale
            { freq: 1046.5, start: 7, duration: 0.4 },    // C6
            { freq: 880.00, start: 7.5, duration: 0.4 },  // A5
            { freq: 783.99, start: 8, duration: 0.5 },    // G5
            { freq: 587.33, start: 8.7, duration: 1.3 },  // D5
        ];
    }

    // Bouncy bass line
    playBassLine(startTime, duration) {
        const bassNotes = [
            // More rhythmic bass pattern
            { freq: 98.00, start: 0, duration: 0.8 },     // G2
            { freq: 98.00, start: 1, duration: 0.4 },     // G2
            { freq: 123.47, start: 1.5, duration: 0.5 },  // B2
            
            { freq: 130.81, start: 2.5, duration: 0.8 },  // C3
            { freq: 130.81, start: 3.5, duration: 0.4 },  // C3
            { freq: 146.83, start: 4, duration: 0.5 },    // D3
            
            { freq: 98.00, start: 5, duration: 0.8 },     // G2
            { freq: 130.81, start: 6, duration: 0.8 },    // C3
            { freq: 146.83, start: 7, duration: 1 },      // D3
            
            { freq: 123.47, start: 8.5, duration: 0.5 },  // B2
            { freq: 130.81, start: 9.5, duration: 0.5 },  // C3
            { freq: 98.00, start: 10.5, duration: 1.5 },  // G2
        ];

        bassNotes.forEach(note => {
            this.createTone(note.freq, startTime + note.start, note.duration, 'sawtooth', 0.1, this.musicGain);
        });
    }

    // Add percussion for rhythm
    playPercussion(startTime, duration) {
        // Simple but effective percussion pattern
        for (let i = 0; i < 24; i++) {
            const time = startTime + i * 0.5;
            
            if (i % 4 === 0) {
                // Kick drum on beats 1 and 3
                this.createTone(60, time, 0.1, 'sine', 0.15, this.musicGain);
            }
            if (i % 4 === 2) {
                // Snare on beats 2 and 4
                this.createNoise(time, 0.05, 0.08, this.musicGain);
            }
            if (i % 2 === 1) {
                // Hi-hat on off-beats
                this.createTone(8000 + Math.random() * 2000, time, 0.03, 'square', 0.03, this.musicGain);
            }
        }
    }

    // Harmony parts for richness
    playHarmonies(startTime, duration) {
        const harmonies = [
            { freq: 293.66, start: 2, duration: 1 },     // D4 harmony
            { freq: 329.63, start: 4, duration: 1 },     // E4 harmony
            { freq: 369.99, start: 7.5, duration: 1 },   // F#4 harmony
            { freq: 329.63, start: 10.5, duration: 1.5 }, // E4 resolution
        ];

        harmonies.forEach(harmony => {
            this.createTone(harmony.freq, startTime + harmony.start, harmony.duration, 'triangle', 0.06, this.musicGain);
        });
    }

    // Enhanced tone creation with vibrato
    createToneWithVibrato(frequency, startTime, duration, waveType = 'sine', volume = 0.1, gainNode = null) {
        if (!this.isInitialized) return;

        const oscillator = this.audioContext.createOscillator();
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        const envelope = this.audioContext.createGain();
        
        // Setup vibrato
        vibrato.frequency.setValueAtTime(5, startTime); // 5Hz vibrato
        vibratoGain.gain.setValueAtTime(3, startTime); // Subtle vibrato depth
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = waveType;
        
        // ADSR envelope for natural sound
        envelope.gain.setValueAtTime(0, startTime);
        envelope.gain.linearRampToValueAtTime(volume, startTime + 0.1); // Attack
        envelope.gain.linearRampToValueAtTime(volume * 0.8, startTime + 0.2); // Decay
        envelope.gain.setValueAtTime(volume * 0.7, startTime + duration - 0.1); // Sustain
        envelope.gain.linearRampToValueAtTime(0, startTime + duration); // Release
        
        oscillator.connect(envelope);
        envelope.connect(gainNode || this.sfxGain);
        
        oscillator.start(startTime);
        vibrato.start(startTime);
        oscillator.stop(startTime + duration);
        vibrato.stop(startTime + duration);
        
        return oscillator;
    }

    // Create noise for percussion
    createNoise(startTime, duration, volume, gainNode) {
        if (!this.isInitialized) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const envelope = this.audioContext.createGain();
        
        noise.buffer = buffer;
        
        envelope.gain.setValueAtTime(volume, startTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        noise.connect(envelope);
        envelope.connect(gainNode);
        
        noise.start(startTime);
    }

    // Create a tone with the specified parameters
    createTone(frequency, startTime, duration, waveType = 'sine', volume = 0.1, gainNode = null) {
        if (!this.isInitialized) return;

        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = waveType;
        
        // ADSR envelope for natural sound
        envelope.gain.setValueAtTime(0, startTime);
        envelope.gain.linearRampToValueAtTime(volume, startTime + 0.05); // Attack
        envelope.gain.linearRampToValueAtTime(volume * 0.8, startTime + 0.1); // Decay
        envelope.gain.setValueAtTime(volume * 0.6, startTime + duration - 0.1); // Sustain
        envelope.gain.linearRampToValueAtTime(0, startTime + duration); // Release
        
        oscillator.connect(envelope);
        envelope.connect(gainNode || this.sfxGain);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
        
        return oscillator;
    }

    // Pleasant slithering/scurrying sound for mouse movement
    playMovementSound() {
        if (!this.isInitialized) return;

        const startTime = this.audioContext.currentTime;
        const duration = 0.3;
        
        // Create a soft, scratchy sound like tiny paws on stone
        for (let i = 0; i < 8; i++) {
            const frequency = 800 + Math.random() * 400; // Random high frequencies
            const delay = i * 0.03;
            const volume = 0.08 * (1 - i / 8); // Fade out
            
            this.createTone(frequency, startTime + delay, 0.05, 'sawtooth', volume);
        }
        
        // Add a subtle low rumble for the body movement
        this.createTone(120 + Math.random() * 80, startTime, duration, 'triangle', 0.03);
    }

    // Buzzing sound for wall collision
    playWallBumpSound() {
        if (!this.isInitialized) return;

        const startTime = this.audioContext.currentTime;
        const duration = 0.2;
        
        // Create a harsh buzzing sound
        const frequency = 150 + Math.random() * 100;
        
        // Main buzz
        this.createTone(frequency, startTime, duration, 'square', 0.15);
        
        // Add some high-frequency noise
        for (let i = 0; i < 5; i++) {
            const noiseFreq = 1000 + Math.random() * 2000;
            this.createTone(noiseFreq, startTime + i * 0.02, 0.03, 'square', 0.05);
        }
        
        // Low thump
        this.createTone(80, startTime, 0.1, 'sine', 0.2);
    }

    // Victory fanfare
    playVictorySound() {
        if (!this.isInitialized) return;

        const startTime = this.audioContext.currentTime;
        
        // Triumphant ascending scale
        const victoryNotes = [
            { freq: 523.25, start: 0, duration: 0.3 },    // C5
            { freq: 659.25, start: 0.2, duration: 0.3 },  // E5
            { freq: 783.99, start: 0.4, duration: 0.3 },  // G5
            { freq: 1046.5, start: 0.6, duration: 0.8 },  // C6 (long)
        ];

        victoryNotes.forEach(note => {
            this.createTone(note.freq, startTime + note.start, note.duration, 'sine', 0.2);
            // Add harmony
            this.createTone(note.freq * 1.25, startTime + note.start, note.duration, 'triangle', 0.1);
        });
    }

    // Firework explosion sound
    playFireworkExplosion() {
        if (!this.isInitialized) return;

        const startTime = this.audioContext.currentTime;
        const duration = 0.8;
        
        // Main explosion boom - low frequency burst
        const boom = this.audioContext.createOscillator();
        const boomEnv = this.audioContext.createGain();
        const boomFilter = this.audioContext.createBiquadFilter();
        
        boom.type = 'sawtooth';
        boom.frequency.setValueAtTime(60, startTime);
        boom.frequency.exponentialRampToValueAtTime(30, startTime + duration);
        
        boomFilter.type = 'lowpass';
        boomFilter.frequency.setValueAtTime(200, startTime);
        boomFilter.frequency.exponentialRampToValueAtTime(80, startTime + duration);
        
        boomEnv.gain.setValueAtTime(0, startTime);
        boomEnv.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        boomEnv.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        boom.connect(boomFilter);
        boomFilter.connect(boomEnv);
        boomEnv.connect(this.sfxGain);
        
        boom.start(startTime);
        boom.stop(startTime + duration);
        
        // High frequency sparkles and crackles
        for (let i = 0; i < 12; i++) {
            const delay = i * 0.05 + Math.random() * 0.1;
            const sparkleFreq = 800 + Math.random() * 2000;
            const sparkleDuration = 0.1 + Math.random() * 0.2;
            
            this.createTone(sparkleFreq, startTime + delay, sparkleDuration, 'square', 0.08);
            
            // Add some noise bursts for realistic crackle
            if (Math.random() < 0.6) {
                this.createNoise(startTime + delay, sparkleDuration * 0.3, 0.05, this.sfxGain);
            }
        }
        
        // Whistling sound for ascending effect
        const whistle = this.audioContext.createOscillator();
        const whistleEnv = this.audioContext.createGain();
        const whistleFilter = this.audioContext.createBiquadFilter();
        
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(400, startTime);
        whistle.frequency.linearRampToValueAtTime(1200, startTime + 0.3);
        whistle.frequency.linearRampToValueAtTime(800, startTime + 0.6);
        
        whistleFilter.type = 'bandpass';
        whistleFilter.frequency.setValueAtTime(1000, startTime);
        whistleFilter.Q.setValueAtTime(5, startTime);
        
        whistleEnv.gain.setValueAtTime(0, startTime);
        whistleEnv.gain.linearRampToValueAtTime(0.08, startTime + 0.1);
        whistleEnv.gain.linearRampToValueAtTime(0.04, startTime + 0.4);
        whistleEnv.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
        
        whistle.connect(whistleFilter);
        whistleFilter.connect(whistleEnv);
        whistleEnv.connect(this.sfxGain);
        
        whistle.start(startTime);
        whistle.stop(startTime + 0.6);
    }

    // Launch sound for fireworks
    playFireworkLaunch() {
        if (!this.isInitialized) return;

        const startTime = this.audioContext.currentTime;
        const duration = 0.6;
        
        // Whoosh sound
        const whoosh = this.audioContext.createOscillator();
        const whooshEnv = this.audioContext.createGain();
        const whooshFilter = this.audioContext.createBiquadFilter();
        
        whoosh.type = 'sawtooth';
        whoosh.frequency.setValueAtTime(120, startTime);
        whoosh.frequency.linearRampToValueAtTime(400, startTime + duration);
        
        whooshFilter.type = 'highpass';
        whooshFilter.frequency.setValueAtTime(100, startTime);
        whooshFilter.frequency.linearRampToValueAtTime(300, startTime + duration);
        
        whooshEnv.gain.setValueAtTime(0, startTime);
        whooshEnv.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        whooshEnv.gain.linearRampToValueAtTime(0.15, startTime + 0.3);
        whooshEnv.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        whoosh.connect(whooshFilter);
        whooshFilter.connect(whooshEnv);
        whooshEnv.connect(this.sfxGain);
        
        whoosh.start(startTime);
        whoosh.stop(startTime + duration);
        
        // Add some noise for realistic effect
        this.createNoise(startTime, duration * 0.3, 0.03, this.sfxGain);
    }

    // Initialize audio on first user interaction (required by browsers)
    async initOnUserInteraction() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        if (!this.isInitialized) {
            await this.init();
        }
    }
}

// Global audio manager instance
const Audio = new AudioManager();