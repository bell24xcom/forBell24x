import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/AuthContext';

export default function VoiceRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [rfqData, setRFQData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('hi');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const { user } = useSession();

  const languages = [
    { value: 'hi', label: 'Hindi' },
    { value: 'en', label: 'English' },
    { value: 'mr', label: 'Marathi' },
    { value: 'gu', label: 'Gujarati' },
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Please allow microphone access to record audio');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current!.src = audioUrl;
      audioRef.current!.play();
    }
  };

  const deleteAudio = () => {
    setAudioBlob(null);
    setTranscript('');
    setRFQData(null);
    setError('');
  };

  const processWithAI = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audioBase64', audioBlobToBase64(audioBlob));
      formData.append('audioFormat', 'webm');
      formData.append('language', language);

      const response = await fetch('/api/rfq/voice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process RFQ');
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setRFQData(data.rfq);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRFQ = async () => {
    if (!rfqData) return;

    try {
      // In a real implementation, this would submit the RFQ to the server
      console.log('Submitting RFQ:', rfqData);
      router.push('/dashboard/rfqs');
    } catch (err) {
      setError('Failed to submit RFQ');
    }
  };

  const audioBlobToBase64 = (blob: Blob): string => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Voice RFQ</h1>
          <p className="text-slate-400">
            Record your RFQ requirements and let AI transcribe and extract key details
          </p>
        </div>

        {/* Language Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-indigo-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Recording Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Record Your RFQ</h2>
            <p className="text-slate-400">
              Click the microphone to start recording your RFQ requirements
            </p>
          </div>

          <div className="flex justify-center items-center gap-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6h4M4 18h16" />
                </svg>
                Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Start Recording
              </button>
            )}

            {audioBlob && (
              <button
                onClick={playAudio}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 018 0z" />
                </svg>
                Play
              </button>
            )}
          </div>

          {isRecording && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-400">Recording...</span>
            </div>
          )}
        </div>

        {/* Audio Controls */}
        {audioBlob && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recorded Audio</h3>
              <button
                onClick={deleteAudio}
                className="text-red-500 hover:text-red-600"
              >
                Delete Recording
              </button>
            </div>
            <audio ref={audioRef} controls className="w-full" />
          </div>
        )}

        {/* AI Processing */}
        {audioBlob && !rfqData && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Process with AI</h3>
              <p className="text-slate-400">
                AI will transcribe your audio and extract RFQ details
              </p>
            </div>
            <button
              onClick={processWithAI}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Processing with AI...
                </span>
              ) : (
                'Process with AI'
              )}
            </button>
          </div>
        )}

        {/* AI Results */}
        {rfqData && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">AI Results</h3>
              <p className="text-slate-400">
                AI has extracted the following details from your RFQ
              </p>
            </div>

            {/* Transcript */}
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <h4 className="font-medium mb-2">Transcript</h4>
              <p className="text-sm text-slate-300">{transcript}</p>
            </div>

            {/* Extracted RFQ Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Title</h4>
                <p className="text-sm text-slate-300">{rfqData.title}</p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Category</h4>
                <p className="text-sm text-slate-300">{rfqData.category}</p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-slate-300">{rfqData.description}</p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Quantity</h4>
                <p className="text-sm text-slate-300">{rfqData.quantity}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={submitRFQ}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
              >
                Submit RFQ
              </button>
              <button
                onClick={deleteAudio}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg"
              >
                Re-record
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}