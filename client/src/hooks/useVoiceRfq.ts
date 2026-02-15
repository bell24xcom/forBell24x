import { useState, useCallback } from 'react';

export interface VoiceRfqState {
  isRecording: boolean;
  isProcessing: boolean;
  transcription: string;
  extractedInfo: any;
  error: string | null;
  audioBlob: Blob | null;
  recordingTime: number;
}

export interface VoiceRfqActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  processAudio: (blob: Blob) => Promise<void>;
  reset: () => void;
  setLanguage: (language: string) => void;
}

export function useVoiceRfq() {
  const [state, setState] = useState<VoiceRfqState>({
    isRecording: false,
    isProcessing: false,
    transcription: '',
    extractedInfo: null,
    error: null,
    audioBlob: null,
    recordingTime: 0,
  });

  const [language, setLanguage] = useState('auto');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isRecording: true, recordingTime: 0 }));

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setState(prev => ({ ...prev, audioBlob: blob }));

        // Auto-process the audio
        processAudio(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks([]);

      // Start timer
      const interval = setInterval(() => {
        setState(prev => ({ ...prev, recordingTime: prev.recordingTime + 1 }));
      }, 1000);
      setTimer(interval);
    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Unable to access microphone. Please check permissions.',
        isRecording: false,
      }));
    }
  }, [audioChunks]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && state.isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, isRecording: false }));

      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }
  }, [mediaRecorder, state.isRecording, timer]);

  const processAudio = useCallback(
    async (blob: Blob) => {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      try {
        const formData = new FormData();
        formData.append('audio', blob, 'voice_rfq.webm');
        formData.append('language', language);

        const response = await fetch('/api/rfqs/voice', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process audio');
        }

        const data = await response.json();

        setState(prev => ({
          ...prev,
          transcription: data.transcription.text,
          extractedInfo: data.extractedInfo,
          isProcessing: false,
        }));
      } catch (error) {
        console.error('Error processing audio:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to process audio',
          isProcessing: false,
        }));
      }
    },
    [language]
  );

  const reset = useCallback(() => {
    setState({
      isRecording: false,
      isProcessing: false,
      transcription: '',
      extractedInfo: null,
      error: null,
      audioBlob: null,
      recordingTime: 0,
    });
    setAudioChunks([]);

    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [timer]);

  const setLanguageHandler = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  const actions: VoiceRfqActions = {
    startRecording,
    stopRecording,
    processAudio,
    reset,
    setLanguage: setLanguageHandler,
  };

  return { state, actions, language };
}
