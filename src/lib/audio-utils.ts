// Simple audio utilities for the Bell24H application

type SoundType = 'success' | 'error' | 'notification' | 'match' | 'upload';

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private sounds: Record<SoundType, string> = {
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',
    notification: '/sounds/notification.mp3',
    match: '/sounds/match-found.mp3',
    upload: '/sounds/upload.mp3',
  };
  private volume: number = 0.5;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async playSoundFile(url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async playSuccess() {
    await this.playSoundFile(this.sounds.success);
  }

  async playError() {
    await this.playSoundFile(this.sounds.error);
  }

  async playNotification() {
    await this.playSoundFile(this.sounds.notification);
  }

  async playMatchFound() {
    await this.playSoundFile(this.sounds.match);
  }

  async playUpload() {
    await this.playSoundFile(this.sounds.upload);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

// Create a single instance of the audio player
const audioPlayer = new AudioPlayer();

export const useAudio = () => {
  return {
    playSuccess: () => audioPlayer.playSuccess().catch(console.error),
    playError: () => audioPlayer.playError().catch(console.error),
    playNotification: () => audioPlayer.playNotification().catch(console.error),
    playMatchFound: () => audioPlayer.playMatchFound().catch(console.error),
    playUpload: () => audioPlayer.playUpload().catch(console.error),
    setVolume: (volume: number) => audioPlayer.setVolume(volume),
  };
};

export default audioPlayer;
