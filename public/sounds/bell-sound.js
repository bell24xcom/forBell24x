// Bell24H Temple Bell Sound Generator
// Web Audio API implementation for immediate bell sound functionality

class TempleBellSound {
  constructor() {
    this.audioContext = null;
    this.isSupported = true;
    this.init();
  }

  async init() {
    try {
      // Check if Web Audio API is supported
      if (!window.AudioContext && !window.webkitAudioContext) {
        this.isSupported = false;
        console.log('Web Audio API not supported');
        return;
      }

      // Initialize AudioContext only when needed (user interaction)
      this.createAudioContext = () => {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
      };
    } catch (error) {
      console.log('Audio initialization error:', error);
      this.isSupported = false;
    }
  }

  // Generate temple bell sound with Web Audio API
  async playBellSound(duration = 2.5) {
    if (!this.isSupported) return;

    try {
      const audioContext = this.createAudioContext();
      
      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create bell sound using multiple oscillators
      this.createBellTone(audioContext, duration);
    } catch (error) {
      console.log('Bell sound play error:', error);
    }
  }

  createBellTone(audioContext, duration) {
    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // Create multiple harmonics for rich bell sound
    const frequencies = [523, 659, 784, 1047, 1318]; // C5, E5, G5, C6, E6
    const volumes = [0.3, 0.2, 0.15, 0.1, 0.05];

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      oscillator.connect(oscGain);
      oscGain.connect(gainNode);
      
      // Set oscillator type and frequency
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);
      
      // Create bell-like envelope
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(volumes[index], now + 0.01);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      // Start and stop oscillator
      oscillator.start(now);
      oscillator.stop(now + duration);
    });

    // Master volume envelope
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  // Check if audio is supported
  isAudioSupported() {
    return this.isSupported;
  }
}

// Create global instance
window.templeBellSound = new TempleBellSound();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TempleBellSound;
} 