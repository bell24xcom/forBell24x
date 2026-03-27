'use client';

import React, { useState, useRef, useEffect } from 'react';
import MicrophonePermissionGuide from './MicrophonePermissionGuide';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, transcript: string) => void;
  onTranscriptChange?: (transcript: string) => void;
  maxDuration?: number; // in seconds
  className?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceRecorder({
  onRecordingComplete,
  onTranscriptChange,
  maxDuration = 300, // 5 minutes default
  className = '',
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<
    'granted' | 'denied' | 'prompt' | 'checking'
  >('checking');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }

    // Check microphone permissions
    checkMicrophonePermission();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        setPermissionState(permission.state);

        permission.addEventListener('change', () => {
          setPermissionState(permission.state);
        });
      } else {
        // Fallback for browsers without permissions API
        setPermissionState('prompt');
      }
    } catch (error) {
      console.warn('Could not check microphone permission:', error);
      setPermissionState('prompt');
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after getting permission
      setPermissionState('granted');
      return true;
    } catch (error: any) {
      console.error('Microphone permission denied:', error);
      setPermissionState('denied');

      let errorMessage = 'Microphone access denied. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage +=
          'Please click the 🔒 lock icon in your address bar and allow microphone access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage += 'Please check your browser settings and allow microphone access.';
      }

      setPermissionError(errorMessage);
      return false;
    }
  };

  const startRecording = async () => {
    // Check permissions first
    if (permissionState === 'denied') {
      await requestMicrophonePermission();
      if (permissionState === 'denied') {
        return;
      }
    } else if (permissionState === 'prompt') {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setPermissionError(null);

      // Start speech recognition if supported
      if (speechSupported) {
        startSpeechRecognition();
      }

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      await requestMicrophonePermission();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  const startSpeechRecognition = () => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsTranscribing(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = transcript + finalTranscript;
      setTranscript(fullTranscript);
      onTranscriptChange?.(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      setIsTranscribing(false);
      if (audioBlob && transcript) {
        onRecordingComplete?.(audioBlob, transcript);
      }
    };

    recognition.start();
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setTranscript('');
    setRecordingTime(0);
    setIsPlaying(false);
    setIsTranscribing(false);
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `rfq-voice-${Date.now()}.webm`;
      a.click();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWaveformBars = () => {
    const bars = [];
    for (let i = 0; i < 20; i++) {
      const height = isRecording ? Math.random() * 100 + 20 : 20;
      bars.push(
        <div
          key={i}
          className={`w-1 bg-blue-500 rounded-full transition-all duration-150 ${
            isRecording ? 'animate-pulse' : ''
          }`}
          style={{ height: `${height}%` }}
        />
      );
    }
    return bars;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className='text-center mb-6'>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>Voice RFQ Recorder</h3>
        <p className='text-gray-600 text-sm'>
          Record your requirements in voice and we'll transcribe it automatically
        </p>
      </div>

      {/* Waveform Visualization */}
      <div className='flex items-end justify-center space-x-1 h-24 mb-6 bg-gray-50 rounded-lg p-4'>
        {getWaveformBars()}
      </div>

      {/* Permission Status */}
      {permissionState === 'checking' && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center'>
          <div className='flex items-center justify-center'>
            <span>🔄</span>
            <span className='text-blue-800 text-sm'>Checking microphone permissions...</span>
          </div>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
          <div className='flex items-start'>
            <span>🎤</span>
            <div>
              <h4 className='font-semibold text-red-800 mb-1'>Microphone Access Required</h4>
              <p className='text-red-700 text-sm mb-3'>
                {permissionError || 'Please allow microphone access to record voice RFQs.'}
              </p>
              <div className='space-y-2 text-sm text-red-600'>
                <p>
                  <strong>Chrome/Edge:</strong> Click the 🔒 lock icon → Change Microphone to
                  "Allow"
                </p>
                <p>
                  <strong>Firefox:</strong> Click the microphone icon in address bar → "Allow"
                </p>
                <p>
                  <strong>Safari:</strong> Safari → Preferences → Websites → Microphone → Allow
                </p>
              </div>
              <div className='flex items-center space-x-3 mt-3'>
                <button
                  onClick={requestMicrophonePermission}
                  className='px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition'
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowPermissionGuide(true)}
                  className='px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center'
                >
                  <HelpCircle className='h-4 w-4 mr-1' />
                  Help
                </button>
                <a
                  href='/mic-test'
                  target='_blank'
                  className='px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition'
                >
                  Test Mic
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {permissionState === 'prompt' && (
        <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center'>
          <div className='flex items-center justify-center'>
            <span>🎤</span>
            <span className='text-yellow-800 text-sm'>
              Click record to grant microphone permission
            </span>
          </div>
        </div>
      )}

      {permissionState === 'granted' && !isRecording && !audioUrl && (
        <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center'>
          <div className='flex items-center justify-center'>
            <span>🎤</span>
            <span className='text-green-800 text-sm'>
              Microphone ready - Click to start recording
            </span>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className='flex items-center justify-center space-x-4 mb-6'>
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={permissionState === 'denied'}
            className={`flex items-center justify-center w-16 h-16 text-white rounded-full transition-all duration-200 ${
              permissionState === 'denied'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 transform hover:scale-105'
            }`}
          >
            {permissionState === 'denied' ? (
              <span>🎤</span>
            ) : (
              <span>🎤</span>
            )}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className='flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full animate-pulse'
          >
            <Square className='h-6 w-6' />
          </button>
        )}

        {audioUrl && (
          <>
            {!isPlaying ? (
              <button
                onClick={playAudio}
                className='flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition'
              >
                <span>▶️</span>
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className='flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full'
              >
                <span>⏸️</span>
              </button>
            )}
          </>
        )}

        {audioUrl && (
          <>
            <button
              onClick={downloadAudio}
              className='flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition'
            >
              <span>⬇️</span>
            </button>
            <button
              onClick={resetRecording}
              className='flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition'
            >
              <span>🔄</span>
            </button>
          </>
        )}
      </div>

      {/* Recording Time */}
      <div className='text-center mb-4'>
        <div className='text-2xl font-mono text-gray-800'>{formatTime(recordingTime)}</div>
        <div className='text-sm text-gray-500'>
          {isRecording ? 'Recording...' : audioUrl ? 'Recording complete' : 'Ready to record'}
        </div>
        {isTranscribing && (
          <div className='flex items-center justify-center mt-2'>
            <span>🔄</span>
            <span className='text-sm text-blue-600'>Transcribing...</span>
          </div>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className='mt-6'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='font-semibold text-gray-900'>Live Transcript</h4>
            {speechSupported && (
              <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded'>
                Auto-transcribed
              </span>
            )}
          </div>
          <div className='bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto'>
            <p className='text-gray-700 text-sm'>{transcript}</p>
          </div>
        </div>
      )}

      {!speechSupported && (
        <div className='mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
          <p className='text-amber-800 text-sm'>
            Speech recognition is not supported in this browser. You can still record audio and add
            text manually.
          </p>
        </div>
      )}

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className='hidden'
        />
      )}

      {/* Permission Guide Modal */}
      <MicrophonePermissionGuide
        isOpen={showPermissionGuide}
        onClose={() => setShowPermissionGuide(false)}
      />
    </div>
  );
}
