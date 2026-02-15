'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioAsset {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  category: 'ui' | 'notification' | 'ambient' | 'voice';
}

interface AudioSettings {
  masterVolume: number;
  uiVolume: number;
  notificationVolume: number;
  ambientVolume: number;
  voiceVolume: number;
  enabled: boolean;
  respectUserPreferences: boolean;
}

const DEFAULT_AUDIO_ASSETS: AudioAsset[] = [
  {
    id: 'bell-ring',
    name: 'Bell Ring',
    url: '/sounds/temple-bell.mp3',
    volume: 0.7,
    loop: false,
    category: 'ui',
  },
  {
    id: 'success-chime',
    name: 'Success Chime',
    url: '/sounds/success-chime.mp3',
    volume: 0.5,
    loop: false,
    category: 'notification',
  },
  {
    id: 'button-click',
    name: 'Button Click',
    url: '/sounds/button-click.mp3',
    volume: 0.3,
    loop: false,
    category: 'ui',
  },
  {
    id: 'notification-pop',
    name: 'Notification',
    url: '/sounds/notification.mp3',
    volume: 0.6,
    loop: false,
    category: 'notification',
  },
  {
    id: 'ambient-office',
    name: 'Office Ambience',
    url: '/sounds/ambient-office.mp3',
    volume: 0.2,
    loop: true,
    category: 'ambient',
  },
  {
    id: 'typing-sound',
    name: 'Typing Sound',
    url: '/sounds/typing.mp3',
    volume: 0.4,
    loop: false,
    category: 'ui',
  },
  {
    id: 'message-sent',
    name: 'Message Sent',
    url: '/sounds/message-sent.mp3',
    volume: 0.5,
    loop: false,
    category: 'notification',
  },
];

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  uiVolume: 0.8,
  notificationVolume: 0.9,
  ambientVolume: 0.3,
  voiceVolume: 1.0,
  enabled: true,
  respectUserPreferences: true,
};

export const useAudioSystem = () => {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const categoryGainNodes = useRef<Map<string, GainNode>>(new Map());
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode[]>>(new Map());

  // Initialize Web Audio API
  const initializeAudioContext = useCallback(async () => {
    if (isInitialized || !settings.enabled) return;

    try {
      setIsLoading(true);

      // Create Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }

      audioContextRef.current = new AudioContextClass();

      // Create master gain node
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = settings.masterVolume;

      // Create category-specific gain nodes
      const categories = ['ui', 'notification', 'ambient', 'voice'];
      categories.forEach(category => {
        const gainNode = audioContextRef.current!.createGain();
        gainNode.connect(gainNodeRef.current!);

        const volumeKey = `${category}Volume` as keyof AudioSettings;
        gainNode.gain.value = (settings[volumeKey] as number) || 1.0;

        categoryGainNodes.current.set(category, gainNode);
      });

      // Load audio assets
      await loadAudioAssets();

      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize audio system');
      console.error('Audio system initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [settings.enabled, settings.masterVolume]);

  // Load audio assets
  const loadAudioAssets = async () => {
    if (!audioContextRef.current) return;

    const loadPromises = DEFAULT_AUDIO_ASSETS.map(async asset => {
      try {
        const response = await fetch(asset.url);
        if (!response.ok) {
          console.warn(`Failed to load audio asset: ${asset.name}`);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        audioBuffersRef.current.set(asset.id, audioBuffer);
      } catch (err) {
        console.warn(`Error loading audio asset ${asset.name}:`, err);
      }
    });

    await Promise.all(loadPromises);
  };

  // Play audio by ID
  const playAudio = useCallback(
    async (
      audioId: string,
      options: {
        volume?: number;
        playbackRate?: number;
        delay?: number;
        loop?: boolean;
      } = {}
    ) => {
      if (!settings.enabled || !isInitialized || !audioContextRef.current || !gainNodeRef.current) {
        return null;
      }

      const audioBuffer = audioBuffersRef.current.get(audioId);
      if (!audioBuffer) {
        console.warn(`Audio asset not found: ${audioId}`);
        return null;
      }

      const asset = DEFAULT_AUDIO_ASSETS.find(a => a.id === audioId);
      if (!asset) return null;

      try {
        // Resume audio context if needed
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        // Create source and gain nodes
        const source = audioContextRef.current.createBufferSource();
        const gainNode = audioContextRef.current.createGain();

        source.buffer = audioBuffer;
        source.loop = options.loop ?? asset.loop;
        source.playbackRate.value = options.playbackRate ?? 1.0;

        // Set volume
        const categoryGain = categoryGainNodes.current.get(asset.category);
        const finalVolume = (options.volume ?? asset.volume) * settings.masterVolume;
        gainNode.gain.value = finalVolume;

        // Connect nodes
        source.connect(gainNode);
        if (categoryGain) {
          gainNode.connect(categoryGain);
        } else {
          gainNode.connect(gainNodeRef.current);
        }

        // Track active sources
        const activeSources = activeSourcesRef.current.get(audioId) || [];
        activeSources.push(source);
        activeSourcesRef.current.set(audioId, activeSources);

        // Handle source ended
        source.onended = () => {
          const sources = activeSourcesRef.current.get(audioId) || [];
          const index = sources.indexOf(source);
          if (index > -1) {
            sources.splice(index, 1);
            activeSourcesRef.current.set(audioId, sources);
          }
        };

        // Start playback
        const startTime = audioContextRef.current.currentTime + (options.delay || 0);
        source.start(startTime);

        return source;
      } catch (err) {
        console.error(`Failed to play audio ${audioId}:`, err);
        return null;
      }
    },
    [settings.enabled, settings.masterVolume, isInitialized]
  );

  // Stop specific audio
  const stopAudio = useCallback((audioId: string) => {
    const activeSources = activeSourcesRef.current.get(audioId) || [];
    activeSources.forEach(source => {
      try {
        source.stop();
      } catch (err) {
        // Source might already be stopped
      }
    });
    activeSourcesRef.current.set(audioId, []);
  }, []);

  // Stop all audio
  const stopAllAudio = useCallback(() => {
    activeSourcesRef.current.forEach((sources, audioId) => {
      sources.forEach(source => {
        try {
          source.stop();
        } catch (err) {
          // Source might already be stopped
        }
      });
    });
    activeSourcesRef.current.clear();
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };

      // Update gain nodes if audio context is initialized
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.value = updated.masterVolume;

        categoryGainNodes.current.forEach((gainNode, category) => {
          const volumeKey = `${category}Volume` as keyof AudioSettings;
          gainNode.gain.value = (updated[volumeKey] as number) || 1.0;
        });
      }

      // Save to localStorage
      localStorage.setItem('bell24h-audio-settings', JSON.stringify(updated));

      return updated;
    });
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bell24h-audio-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn('Failed to parse saved audio settings');
      }
    }
  }, []);

  // Auto-initialize on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isInitialized && settings.enabled) {
        initializeAudioContext();
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [initializeAudioContext, isInitialized, settings.enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAllAudio]);

  // Convenience methods for common sounds
  const playBellSound = useCallback(
    (options?: Parameters<typeof playAudio>[1]) => playAudio('bell-ring', options),
    [playAudio]
  );

  const playSuccessSound = useCallback(
    (options?: Parameters<typeof playAudio>[1]) => playAudio('success-chime', options),
    [playAudio]
  );

  const playClickSound = useCallback(
    (options?: Parameters<typeof playAudio>[1]) => playAudio('button-click', options),
    [playAudio]
  );

  const playNotificationSound = useCallback(
    (options?: Parameters<typeof playAudio>[1]) => playAudio('notification-pop', options),
    [playAudio]
  );

  // Create audio sequence
  const playSequence = useCallback(
    async (
      sequence: Array<{
        audioId: string;
        delay?: number;
        options?: Parameters<typeof playAudio>[1];
      }>
    ) => {
      let totalDelay = 0;

      for (const step of sequence) {
        totalDelay += step.delay || 0;
        setTimeout(() => {
          playAudio(step.audioId, step.options);
        }, totalDelay * 1000);
      }
    },
    [playAudio]
  );

  return {
    // State
    settings,
    isInitialized,
    isLoading,
    error,

    // Core methods
    initializeAudioContext,
    playAudio,
    stopAudio,
    stopAllAudio,
    updateSettings,
    playSequence,

    // Convenience methods
    playBellSound,
    playSuccessSound,
    playClickSound,
    playNotificationSound,

    // Asset info
    availableAssets: DEFAULT_AUDIO_ASSETS,
  };
};
