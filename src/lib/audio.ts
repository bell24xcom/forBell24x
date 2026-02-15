import * as React from 'react';

// Simple audio implementation using the Web Audio API
class BellSoundEffects {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private volume: number = 0.5;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);
      this.isInitialized = true;

      // Resume audio context on user interaction
      const resumeAudio = () => {
        if (this.audioContext?.state === 'suspended') {
          this.audioContext.resume();
        }
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
      };

      document.addEventListener('click', resumeAudio);
      document.addEventListener('touchstart', resumeAudio);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  // Get current volume
  getVolume(): number {
    return this.volume;
  }

  // Play a sound from a URL
  async playSound(url: string) {
    if (!this.audioContext || !this.isInitialized) {
      console.warn('Audio not initialized');
      return;
    }

    try {
      // Try to get the buffer from cache
      let buffer = this.buffers.get(url);

      // If not in cache, load it
      if (!buffer) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.buffers.set(url, buffer);
      }

      // Play the sound
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode || this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Convenience methods for specific sounds
  async playRfqReceived() {
    await this.playSound('/sounds/rfq-received.mp3');
  }

  async playMatchFound() {
    await this.playSound('/sounds/match-found.mp3');
  }

  async playTransactionComplete() {
    await this.playSound('/sounds/transaction-complete.mp3');
  }

  async playSuccess() {
    await this.playSound('/sounds/success.mp3');
  }

  async playError() {
    await this.playSound('/sounds/error.mp3');
  }
}

// Create a single instance of the sound effects
const bellSounds = new BellSoundEffects();

// React hook to use the sound effects
export const useAudio = () => {
  // Ensure audio context is initialized when the hook is used
  React.useEffect(() => {
    bellSounds.initialize();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return {
    playRfqReceived: () => bellSounds.playRfqReceived(),
    playMatchFound: () => bellSounds.playMatchFound(),
    playTransactionComplete: () => bellSounds.playTransactionComplete(),
    playSuccess: () => bellSounds.playSuccess(),
    playError: () => bellSounds.playError(),
    setVolume: (volume: number) => bellSounds.setVolume(volume),
    getVolume: () => bellSounds.getVolume(),
  };
};

// Export for direct usage
export default bellSounds;
