'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface RecordingOptions {
  audio: boolean;
  microphone: boolean;
  resolution: '720p' | '1080p' | '4K';
  frameRate: 30 | 60;
  quality: 'high' | 'medium' | 'low';
  captureArea: 'fullscreen' | 'window' | 'tab';
}

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [options, setOptions] = useState<RecordingOptions>({
    audio: true,
    microphone: true,
    resolution: '1080p',
    frameRate: 30,
    quality: 'high',
    captureArea: 'tab',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const resolutionSettings = {
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4K': { width: 3840, height: 2160 },
  };

  const startRecording = useCallback(async () => {
    try {
      setError('');

      // Get screen capture stream
      const constraints: any = {
        video: {
          ...resolutionSettings[options.resolution],
          frameRate: options.frameRate,
        },
      };

      if (options.captureArea === 'fullscreen') {
        constraints.video.mediaSource = 'screen';
      } else if (options.captureArea === 'window') {
        constraints.video.mediaSource = 'window';
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      let tracks = displayStream.getTracks();

      // Add microphone audio if enabled
      if (options.microphone) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            },
          });
          tracks = [...tracks, ...audioStream.getTracks()];
        } catch (audioError) {
          console.warn('Microphone access denied:', audioError);
        }
      }

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Configure MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
        ? 'video/webm; codecs=vp9'
        : 'video/webm';

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond:
          options.quality === 'high' ? 5000000 : options.quality === 'medium' ? 2500000 : 1000000,
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        stopTimer();
      };

      // Handle stream ending (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      startTimer();
    } catch (err: any) {
      setError(`Recording failed: ${err.message}`);
      console.error('Recording error:', err);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setPreviewUrl('');
    setRecordingTime(0);
    chunksRef.current = [];
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bell24h-demo-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const uploadToCloudinary = async () => {
    if (!recordedBlob) return;

    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, 'demo-recording.webm');
      formData.append('upload_preset', 'bell24h_demos');
      formData.append('resource_type', 'video');

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload successful:', result);
      alert('Demo video uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
          🎬 Bell24H Demo Video Creator
        </h2>
        <p className='text-gray-600 dark:text-gray-300'>
          Create professional demo videos to showcase Bell24H features
        </p>
      </div>

      {/* Recording Controls */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Control Panel */}
        <div className='space-y-6'>
          <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
              <span>⚙️</span>
              Recording Settings
            </h3>

            <div className='space-y-4'>
              {/* Resolution */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Resolution
                </label>
                <select
                  value={options.resolution}
                  onChange={e => setOptions({ ...options, resolution: e.target.value as any })}
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  disabled={isRecording}
                >
                  <option value='720p'>720p (1280x720)</option>
                  <option value='1080p'>1080p (1920x1080)</option>
                  <option value='4K'>4K (3840x2160)</option>
                </select>
              </div>

              {/* Frame Rate */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Frame Rate
                </label>
                <select
                  value={options.frameRate}
                  onChange={e =>
                    setOptions({ ...options, frameRate: parseInt(e.target.value) as any })
                  }
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  disabled={isRecording}
                >
                  <option value={30}>30 FPS</option>
                  <option value={60}>60 FPS</option>
                </select>
              </div>

              {/* Capture Area */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Capture Area
                </label>
                <select
                  value={options.captureArea}
                  onChange={e => setOptions({ ...options, captureArea: e.target.value as any })}
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  disabled={isRecording}
                >
                  <option value='tab'>Current Tab</option>
                  <option value='window'>Window</option>
                  <option value='fullscreen'>Full Screen</option>
                </select>
              </div>

              {/* Audio Options */}
              <div className='space-y-2'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={options.microphone}
                    onChange={e => setOptions({ ...options, microphone: e.target.checked })}
                    className='mr-2'
                    disabled={isRecording}
                  />
                  <span>🎤</span>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Include Microphone
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Recording Status */}
          <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
                <Timer className='h-5 w-5 mr-2' />
                Recording Status
              </h3>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isRecording
                    ? isPaused
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
              </div>
            </div>

            <div className='text-center'>
              <div className='text-3xl font-mono font-bold text-gray-900 dark:text-white mb-2'>
                {formatTime(recordingTime)}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                {isRecording
                  ? isPaused
                    ? 'Recording paused'
                    : 'Recording in progress...'
                  : 'Click start to begin recording'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='space-y-6'>
          <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Controls</h3>

            <div className='grid grid-cols-2 gap-3 mb-4'>
              {!isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startRecording}
                  className='flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold'
                >
                  <span>🎥</span>
                  Start Recording
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopRecording}
                  className='flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold'
                >
                  <Square className='h-5 w-5 mr-2' />
                  Stop
                </motion.button>
              )}

              {isRecording && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={pauseRecording}
                  className='flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold'
                >
                  {isPaused ? (
                    <span>▶️</span>
                  ) : (
                    <span>⏸️</span>
                  )}
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
              )}
            </div>

            {recordedBlob && (
              <div className='space-y-3'>
                <div className='flex space-x-3'>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadRecording}
                    className='flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold'
                  >
                    <span>⬇️</span>
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={uploadToCloudinary}
                    className='flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold'
                  >
                    <span>⬆️</span>
                    Upload
                  </motion.button>
                </div>
                <button
                  onClick={resetRecording}
                  className='w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium'
                >
                  New Recording
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4'>
              <div className='flex items-center text-red-800 dark:text-red-200'>
                <AlertCircle className='h-5 w-5 mr-2' />
                <span className='font-semibold'>Error:</span>
              </div>
              <p className='text-red-700 dark:text-red-300 mt-1 text-sm'>{error}</p>
            </div>
          )}

          {/* Demo Tips */}
          <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4'>
            <h4 className='font-semibold text-blue-800 dark:text-blue-200 mb-2'>
              💡 Demo Video Tips:
            </h4>
            <ul className='text-sm text-blue-700 dark:text-blue-300 space-y-1'>
              <li>• Start with a clear intro explaining the feature</li>
              <li>• Use slow, deliberate movements</li>
              <li>• Highlight key UI elements as you interact</li>
              <li>• End with a summary of benefits</li>
              <li>• Keep videos under 3 minutes for engagement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'
        >
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Preview Recording
          </h3>
          <video
            src={previewUrl}
            controls
            className='w-full rounded-lg shadow-lg'
            style={{ maxHeight: '400px' }}
          >
            Your browser does not support the video tag.
          </video>
        </motion.div>
      )}
    </div>
  );
}
