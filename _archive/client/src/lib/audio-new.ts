import React from 'react';

// Web Audio Font Player for better cross-browser compatibility
type SoundPreset = {
  name: string;
  preset: number;
  notes: Array<{ pitch: number; duration: number; volume: number }>;
};

// Define sound presets using Web Audio Font presets
const SOUND_PRESETS: Record<string, SoundPreset> = {
  rfqReceived: {
    name: 'RFQ Received',
    preset: 3, // Synth Lead preset
    notes: [
      { pitch: 72, duration: 0.5, volume: 1.0 },
      { pitch: 76, duration: 0.25, volume: 0.8 },
      { pitch: 79, duration: 0.75, volume: 0.9 },
    ],
  },
  matchFound: {
    name: 'Match Found',
    preset: 5, // Electric Piano preset
    notes: [
      { pitch: 60, duration: 0.2, volume: 1.0 },
      { pitch: 64, duration: 0.2, volume: 0.9 },
      { pitch: 67, duration: 0.6, volume: 0.8 },
    ],
  },
  transactionComplete: {
    name: 'Transaction Complete',
    preset: 9, // Glockenspiel preset
    notes: [
      { pitch: 84, duration: 0.1, volume: 0.9 },
      { pitch: 84, duration: 0.1, volume: 0.8 },
      { pitch: 84, duration: 0.2, volume: 0.7 },
      { pitch: 84, duration: 0.1, volume: 0.6 },
      { pitch: 84, duration: 0.1, volume: 0.5 },
    ],
  },
  success: {
    name: 'Success',
    preset: 1, // Piano preset
    notes: [
      { pitch: 64, duration: 0.1, volume: 0.8 },
      { pitch: 67, duration: 0.1, volume: 0.9 },
      { pitch: 72, duration: 0.3, volume: 1.0 },
    ],
  },
  error: {
    name: 'Error',
    preset: 2, // Electric Piano 1 preset
    notes: [
      { pitch: 60, duration: 0.1, volume: 1.0 },
      { pitch: 58, duration: 0.1, volume: 0.9 },
      { pitch: 56, duration: 0.3, volume: 0.8 },
    ],
  },
};

export class BellSoundEffects {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.5;
  public isInitialized: boolean = false;
  private gainNode: GainNode | null = null;

  constructor() {
    this.initializeAudio();
  }

  public initializeAudio() {
    // Skip if already initialized or in SSR
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // @ts-ignore - Web Audio API types
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.gainNode.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (error) {
      console.error('Web Audio API is not supported in this browser', error);
    }
  }

  // Set volume for all sounds (0.0 to 1.0)
  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  // Get current volume
  public getVolume(): number {
    return this.volume;
  }

  // Play a single note
  private playNote(frequency: number, duration: number, volume: number) {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume * this.volume;

    const now = this.audioContext.currentTime;
    oscillator.start(now);
    oscillator.stop(now + duration);

    // Clean up
    oscillator.onended = () => {
      gainNode.disconnect();
    };
  }

  // Convert MIDI note to frequency
  private midiToFreq(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // Play RFQ received sound
  public playRfqReceived() {
    this.playSound('rfqReceived');
  }

  // Play match found sound
  public playMatchFound() {
    this.playSound('matchFound');
  }

  // Play transaction complete sound
  public playTransactionComplete() {
    this.playSound('transactionComplete');
  }

  // Play success sound
  public playSuccess() {
    this.playSound('success');
  }

  // Play error sound
  public playError() {
    this.playSound('error');
  }

  // Internal method to play a sound
  private playSound(soundKey: keyof typeof SOUND_PRESETS) {
    if (typeof window === 'undefined') return; // Skip in SSR

    if (!this.audioContext || !this.isInitialized) {
      this.initializeAudio();
      if (!this.audioContext || !this.isInitialized) {
        console.warn('Audio context not initialized');
        return;
      }
    }

    const preset = SOUND_PRESETS[soundKey];
    if (!preset) {
      console.warn(`Sound preset '${soundKey}' not found`);
      return;
    }

    // Resume audio context if it's in a suspended state (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    // Play each note in the sequence
    const now = this.audioContext.currentTime;
    let currentTime = 0;

    preset.notes.forEach(note => {
      const frequency = this.midiToFreq(note.pitch);
      setTimeout(() => {
        this.playNote(frequency, note.duration, note.volume);
      }, currentTime * 1000);
      currentTime += note.duration;
    });
  }
}

// Create a single instance of the sound effects
const bellSounds = new BellSoundEffects();

// React hook to use the sound effects
export const useAudio = () => {
  // Ensure audio context is initialized when the hook is used
  React.useEffect(() => {
    if (!bellSounds.isInitialized) {
      bellSounds.initializeAudio();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return bellSounds;
};

// Export for direct usage
export default bellSounds;
