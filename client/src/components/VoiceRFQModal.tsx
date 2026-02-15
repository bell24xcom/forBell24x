'use client';
import { useState, useRef, useEffect } from 'react';

interface VoiceRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRFQCreated: (rfqData: any) => void;
}

export default function VoiceRFQModal({ isOpen, onClose, onRFQCreated }: VoiceRFQModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState('auto');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
  ];

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTranscription('');
      setExtractedData(null);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        processVoiceInput(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const processVoiceInput = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'voice_rfq.webm');
      formData.append('language', language);

      const response = await fetch('/api/voice-rfq', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process voice input');
      }

      const data = await response.json();

      setTranscription(data.transcription.text);
      setExtractedData(data.extractedInfo);

      // Auto-fill RFQ data
      const rfqData = {
        title: data.extractedInfo.title || 'Voice RFQ',
        description: data.extractedInfo.description || data.transcription.text,
        category: data.extractedInfo.category || 'General',
        budget: data.extractedInfo.budget?.toString() || '',
        quantity: data.extractedInfo.quantity?.toString() || '1',
        deliveryDeadline: data.extractedInfo.deliveryDeadline || '',
        requirements: data.extractedInfo.requirements || [],
        location: data.extractedInfo.location || '',
        priority: data.extractedInfo.priority || 'medium',
      };

      onRFQCreated(rfqData);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setError(error instanceof Error ? error.message : 'Failed to process voice input');

      // Fallback to mock data
      const mockTranscription =
        'I need 500 units of industrial sensors for temperature monitoring. Budget is around 50,000 rupees. Need delivery within 2 weeks. Must be waterproof and have wireless connectivity.';
      setTranscription(mockTranscription);

      const mockData = {
        title: 'Industrial Temperature Sensors',
        description: mockTranscription,
        category: 'Electronics & Components',
        quantity: 500,
        budget: 50000,
        deliveryDeadline: '2024-02-15',
        requirements: ['Waterproof', 'Wireless connectivity', 'Temperature monitoring'],
        location: 'Mumbai, India',
        priority: 'high',
      };

      setExtractedData(mockData);
      onRFQCreated(mockData);
    } finally {
      setIsProcessing(false);
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const retryRecording = () => {
    setError(null);
    setTranscription('');
    setExtractedData(null);
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-slate-700'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-amber-500/20 rounded-lg'>
              <span>🎤</span>
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>Voice RFQ Creation</h2>
              <p className='text-slate-400 text-sm'>
                Speak your requirements and we'll create an RFQ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-white transition-colors'
          >
            <span>❌</span>
          </button>
        </div>

        {/* Language Selection */}
        <div className='p-6 border-b border-slate-700'>
          <div className='flex items-center space-x-2 mb-3'>
            <Languages className='h-4 w-4 text-slate-400' />
            <label className='text-sm font-medium text-white'>Language</label>
          </div>
          <div className='grid grid-cols-3 gap-2'>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  language === lang.code
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recording Section */}
        <div className='p-6'>
          {!audioBlob ? (
            <div className='text-center'>
              <div className='mb-6'>
                <div
                  className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {isRecording ? (
                    <span>🎤</span>
                  ) : (
                    <span>🎤</span>
                  )}
                </div>

                {isRecording && (
                  <div className='text-2xl font-mono text-white mb-2'>
                    {formatTime(recordingTime)}
                  </div>
                )}

                <p className='text-slate-400 mb-6'>
                  {isRecording
                    ? 'Recording... Speak clearly about your requirements'
                    : 'Click the microphone to start recording your RFQ requirements'}
                </p>
              </div>

              <div className='flex justify-center space-x-4'>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isProcessing}
                    className='bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                  >
                    <span>🎤</span>
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className='bg-red-500 text-white px-8 py-3 rounded-xl hover:bg-red-600 font-semibold transition-all duration-200 flex items-center space-x-2'
                  >
                    <span>🎤</span>
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Audio Playback */}
              <div className='bg-slate-700/50 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-white font-medium'>Recording Preview</h3>
                  <span className='text-slate-400 text-sm'>{formatTime(recordingTime)}</span>
                </div>

                <div className='flex items-center space-x-4'>
                  <button
                    onClick={isPlaying ? pauseRecording : playRecording}
                    className='p-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors'
                  >
                    {isPlaying ? <span>⏸️</span> : <span>▶️</span>}
                  </button>

                  <div className='flex-1'>
                    <div className='w-full bg-slate-600 rounded-full h-2'>
                      <div className='bg-amber-500 h-2 rounded-full' style={{ width: '0%' }}></div>
                    </div>
                  </div>

                  <span>🔊</span>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl || undefined}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className='bg-blue-500/20 border border-blue-500/30 rounded-xl p-4'>
                  <div className='flex items-center space-x-3'>
                    <Loader2 className='h-5 w-5 text-blue-400 animate-spin' />
                    <div>
                      <p className='text-blue-400 font-medium'>Processing your voice input...</p>
                      <p className='text-blue-300 text-sm'>
                        Transcribing and extracting RFQ details
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className='bg-red-500/20 border border-red-500/30 rounded-xl p-4'>
                  <div className='flex items-center space-x-3'>
                    <AlertCircle className='h-5 w-5 text-red-400' />
                    <div>
                      <p className='text-red-400 font-medium'>Error</p>
                      <p className='text-red-300 text-sm'>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {transcription && !isProcessing && (
                <div className='space-y-4'>
                  <div className='bg-green-500/20 border border-green-500/30 rounded-xl p-4'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <span>✅</span>
                      <h3 className='text-green-400 font-medium'>Transcription Complete</h3>
                    </div>
                    <p className='text-green-300 text-sm'>{transcription}</p>
                  </div>

                  {extractedData && (
                    <div className='bg-slate-700/50 rounded-xl p-4'>
                      <h3 className='text-white font-medium mb-3'>Extracted RFQ Details</h3>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-slate-400'>Title:</span>
                          <p className='text-white font-medium'>{extractedData.title}</p>
                        </div>
                        <div>
                          <span className='text-slate-400'>Category:</span>
                          <p className='text-white font-medium'>{extractedData.category}</p>
                        </div>
                        <div>
                          <span className='text-slate-400'>Quantity:</span>
                          <p className='text-white font-medium'>{extractedData.quantity}</p>
                        </div>
                        <div>
                          <span className='text-slate-400'>Budget:</span>
                          <p className='text-white font-medium'>
                            ₹{extractedData.budget?.toLocaleString()}
                          </p>
                        </div>
                        {extractedData.requirements && extractedData.requirements.length > 0 && (
                          <div className='col-span-2'>
                            <span className='text-slate-400'>Requirements:</span>
                            <div className='flex flex-wrap gap-2 mt-1'>
                              {extractedData.requirements.map((req: string, index: number) => (
                                <span
                                  key={index}
                                  className='px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs'
                                >
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex justify-between pt-4'>
                <button
                  onClick={retryRecording}
                  className='px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors'
                >
                  Record Again
                </button>

                <div className='flex space-x-3'>
                  <button
                    onClick={onClose}
                    className='px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors'
                  >
                    Cancel
                  </button>

                  {extractedData && (
                    <button
                      onClick={() => {
                        onRFQCreated(extractedData);
                        onClose();
                      }}
                      className='px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors'
                    >
                      Create RFQ
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
