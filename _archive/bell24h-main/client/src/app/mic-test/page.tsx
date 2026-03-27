'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function MicrophoneTestPage() {
  const [permissionState, setPermissionState] = useState<
    'checking' | 'granted' | 'denied' | 'prompt'
  >('checking');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  React.useEffect(() => {
    checkPermissions();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const addTestResult = (test: string, status: 'pass' | 'fail' | 'info', message: string) => {
    setTestResults(prev => [
      ...prev,
      { test, status, message, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const checkPermissions = async () => {
    addTestResult('Permission Check', 'info', 'Checking microphone permissions...');

    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        addTestResult('Permissions API', 'pass', `Permission state: ${permission.state}`);
        setPermissionState(permission.state);
      } else {
        addTestResult(
          'Permissions API',
          'info',
          'Permissions API not available, will prompt on access'
        );
        setPermissionState('prompt');
      }

      // Check if getUserMedia is available
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        addTestResult('MediaDevices API', 'pass', 'getUserMedia is available');
      } else {
        addTestResult('MediaDevices API', 'fail', 'getUserMedia not supported in this browser');
        return;
      }

      // Check for microphone devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');

      if (audioInputs.length > 0) {
        addTestResult('Hardware Check', 'pass', `Found ${audioInputs.length} microphone(s)`);
        audioInputs.forEach((device, index) => {
          addTestResult(
            'Microphone Device',
            'info',
            `Device ${index + 1}: ${device.label || 'Unknown microphone'}`
          );
        });
      } else {
        addTestResult('Hardware Check', 'fail', 'No microphone devices found');
      }
    } catch (error: any) {
      addTestResult('Permission Check', 'fail', `Error: ${error.message}`);
    }
  };

  const testMicrophone = async () => {
    try {
      addTestResult('Microphone Test', 'info', 'Requesting microphone access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      addTestResult('Microphone Access', 'pass', 'Microphone access granted!');
      setPermissionState('granted');

      // Test audio levels
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (analyser && isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };

      setIsRecording(true);
      updateAudioLevel();
      addTestResult('Audio Level Test', 'pass', 'Monitoring audio levels...');

      // Test MediaRecorder
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        addTestResult('MediaRecorder', 'pass', 'MediaRecorder is working');
      } catch (recorderError: any) {
        addTestResult('MediaRecorder', 'fail', `MediaRecorder error: ${recorderError.message}`);
      }
    } catch (error: any) {
      addTestResult('Microphone Test', 'fail', `Failed: ${error.message}`);
      setPermissionState('denied');

      if (error.name === 'NotAllowedError') {
        addTestResult('Permission Error', 'fail', 'Microphone access denied by user or system');
      } else if (error.name === 'NotFoundError') {
        addTestResult('Hardware Error', 'fail', 'No microphone device found');
      } else if (error.name === 'NotReadableError') {
        addTestResult('Hardware Error', 'fail', 'Microphone is being used by another application');
      } else {
        addTestResult('Unknown Error', 'fail', `Error type: ${error.name}`);
      }
    }
  };

  const stopTest = () => {
    setIsRecording(false);
    setAudioLevel(0);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    addTestResult('Test Stopped', 'info', 'Microphone test stopped');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center mb-6'>
          <Link href='/voice-rfq' className='text-gray-600 hover:text-blue-600 mr-4'>
            <span>←</span>
          </Link>
          <h1 className='text-2xl font-bold text-gray-900'>🎤 Microphone Diagnostic Tool</h1>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <p className='text-gray-600 mb-6'>Test your microphone and diagnose any issues</p>

          {/* Control Buttons */}
          <div className='flex items-center space-x-4 mb-6'>
            {!isRecording ? (
              <button
                onClick={testMicrophone}
                className='flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
              >
                <span>🎤</span>
                <span>Test Microphone</span>
              </button>
            ) : (
              <button
                onClick={stopTest}
                className='flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'
              >
                <span>🎤</span>
                <span>Stop Test</span>
              </button>
            )}

            <button
              onClick={checkPermissions}
              className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition'
            >
              Recheck
            </button>

            <button
              onClick={clearResults}
              className='px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition'
            >
              Clear
            </button>
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className='mb-6 p-4 bg-green-50 rounded-lg'>
              <div className='flex items-center space-x-3 mb-2'>
                <span>🔊</span>
                <span className='font-semibold text-green-800'>
                  Audio Level: {Math.round(audioLevel)}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-4'>
                <div
                  className='bg-green-500 h-4 rounded-full transition-all duration-100'
                  style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                ></div>
              </div>
              <p className='text-sm text-green-700 mt-2'>
                {audioLevel > 5 ? '✅ Microphone is working!' : '⚠️ Try speaking louder...'}
              </p>
            </div>
          )}

          {/* Permission Status */}
          <div className='mb-6 p-4 rounded-lg border'>
            <h3 className='font-semibold mb-2'>Permission Status:</h3>
            <div className='flex items-center space-x-2'>
              {permissionState === 'granted' && (
                <>
                  <span>✅</span>
                  <span className='text-green-700'>✅ Microphone access granted</span>
                </>
              )}
              {permissionState === 'denied' && (
                <>
                  <AlertCircle className='h-5 w-5 text-red-500' />
                  <span className='text-red-700'>❌ Microphone access denied</span>
                </>
              )}
              {permissionState === 'prompt' && (
                <>
                  <AlertCircle className='h-5 w-5 text-yellow-500' />
                  <span className='text-yellow-700'>⚠️ Permission needed</span>
                </>
              )}
              {permissionState === 'checking' && (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
                  <span className='text-blue-700'>🔍 Checking...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Test Results</h2>

          {testResults.length === 0 ? (
            <p className='text-gray-500'>No tests run yet. Click "Test Microphone" to start.</p>
          ) : (
            <div className='space-y-2'>
              {testResults.map((result, index) => (
                <div key={index} className='flex items-center space-x-3 p-3 rounded-lg bg-gray-50'>
                  {result.status === 'pass' && (
                    <span>✅</span>
                  )}
                  {result.status === 'fail' && (
                    <AlertCircle className='h-5 w-5 text-red-500 flex-shrink-0' />
                  )}
                  {result.status === 'info' && (
                    <div className='h-5 w-5 rounded-full bg-blue-500 flex-shrink-0'></div>
                  )}

                  <div className='flex-grow'>
                    <div className='flex items-center justify-between'>
                      <span className='font-semibold text-gray-900'>{result.test}</span>
                      <span className='text-xs text-gray-500'>{result.timestamp}</span>
                    </div>
                    <p className='text-sm text-gray-600'>{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Fix Guide */}
        <div className='bg-blue-50 rounded-xl p-6'>
          <h3 className='font-bold text-blue-800 mb-3'>🔧 Quick Fixes:</h3>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <h4 className='font-semibold text-blue-700 mb-2'>Browser Permissions:</h4>
              <ul className='space-y-1 text-blue-600'>
                <li>• Click 🔒 lock icon in address bar</li>
                <li>• Change Microphone to "Allow"</li>
                <li>• Refresh the page (F5)</li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold text-blue-700 mb-2'>System Settings:</h4>
              <ul className='space-y-1 text-blue-600'>
                <li>• Windows Settings → Privacy → Microphone</li>
                <li>• Enable "Allow apps to access microphone"</li>
                <li>• Check Device Manager for disabled mics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
