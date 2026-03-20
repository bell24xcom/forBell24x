'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VoiceRFQData {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  specifications: string[];
  timeline: string;
  budget: string;
  status: 'draft' | 'active' | 'quoted' | 'completed';
  createdAt: string;
  createdVia: 'voice' | 'manual';
}

export default function VoiceRFQPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [generatedRFQ, setGeneratedRFQ] = useState<VoiceRFQData | null>(null);
  const [recentRFQs, setRecentRFQs] = useState<VoiceRFQData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load recent RFQs on mount
    loadRecentRFQs();
  }, []);

  const loadRecentRFQs = async () => {
    try {
      const response = await fetch('/api/voice-rfq/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentRFQs(data.rfqs || []);
      }
    } catch (error) {
      console.error('Error loading recent RFQs:', error);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      audioChunksRef.current = [];

      // Get microphone access with fallback strategy
      let stream: MediaStream;
      try {
        // Try with high-quality constraints first
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000
          }
        });
      } catch (constraintError) {
        // Fallback to basic audio if constraints fail
        console.log('High-quality constraints failed, using basic audio');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create audio blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Process the audio
        await processAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('🎤 Microphone access denied. Click the lock/camera icon in your browser address bar, allow microphone access, then refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setError('🎤 No microphone found. Please connect a microphone and try again.');
      } else {
        setError('🎤 Cannot access microphone: ' + err.message);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioBlob = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setTranscript('Transcribing audio...');

    try {
      // COMBINED: Transcribe + Extract in ONE API call
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice-rfq/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Processing failed');
      }

      const data = await response.json();

      // Check if we got valid data
      if (!data.success) {
        throw new Error(data.error || 'API returned unsuccessful response');
      }

      console.log('API response:', data);

      // Set transcription
      const transcription = data.transcription || '';
      setTranscript(transcription);

      // Check for API key issues
      if (data.debug && !data.debug.groqKeyPresent) {
        setError('⚠️ GROQ_API_KEY not configured in Vercel. Using demo mode.');
      }

      // Set extracted RFQ data (already structured!)
      if (data.extractedData) {
        // Helper: treat "Not specified", "null", empty, etc. as missing
        const clean = (val: any) => {
          if (!val) return null;
          const s = String(val).trim().toLowerCase();
          if (['not specified', 'null', 'n/a', 'none', 'undefined', ''].includes(s)) return null;
          return String(val).trim();
        };

        const productName = clean(data.extractedData.product);
        const rfq: VoiceRFQData = {
          id: `voice-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: productName || `Voice RFQ - ${transcription.substring(0, 50)}`,
          description: transcription,
          category: clean(data.extractedData.category) || 'Other',
          quantity: data.extractedData.quantity && clean(data.extractedData.quantity)
            ? `${data.extractedData.quantity} ${data.extractedData.unit || 'units'}`
            : '1 units',
          specifications: clean(data.extractedData.specifications)
            ? [data.extractedData.specifications]
            : [],
          timeline: clean(data.extractedData.urgency) || 'flexible',
          budget: data.extractedData.budgetMin && data.extractedData.budgetMax
            ? `₹${data.extractedData.budgetMin} - ₹${data.extractedData.budgetMax}`
            : data.extractedData.budgetMin
            ? `₹${data.extractedData.budgetMin}+`
            : 'To be discussed',
          status: 'draft',
          createdAt: new Date().toISOString(),
          createdVia: 'voice',
        };

        console.log('[Voice RFQ] Setting generatedRFQ:', rfq);
        setGeneratedRFQ(rfq);
        console.log('[Voice RFQ] State should be updated now');
        loadRecentRFQs(); // Refresh recent RFQs
      } else {
        console.error('[Voice RFQ] No extractedData in API response:', data);
        setError('⚠️ No structured data extracted from audio');
      }
    } catch (error) {
      setError('Error processing audio: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Audio processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processVoiceInput = async (voiceText: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/voice-rfq/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceText }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedRFQ(data.rfq);
        loadRecentRFQs(); // Refresh recent RFQs
      } else {
        setError('Failed to process voice input');
      }
    } catch (error) {
      setError('Error processing voice input');
      console.error('Voice processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveRFQ = async () => {
    if (!generatedRFQ) return;

    try {
      const response = await fetch('/api/voice-rfq/save', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedRFQ),
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok && responseData.success) {
        setGeneratedRFQ(null);
        setTranscript('');
        loadRecentRFQs();
        router.push('/dashboard/rfqs');
      } else if (response.status === 401) {
        setError('Please login to save your RFQ. Redirecting...');
        setTimeout(() => {
          router.push('/auth/phone-email');
        }, 2000);
      } else {
        setError(`Failed to save RFQ: ${responseData.error || responseData.message || 'Unknown error'} (${response.status})`);
      }
    } catch (error) {
      setError('Network error saving RFQ: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Save RFQ error:', error);
    }
  };

  const discardRFQ = () => {
    setGeneratedRFQ(null);
    setTranscript('');
  };
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer min-h-[44px]">
          ← Back
        </button>
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Voice RFQ</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Create RFQs using voice commands and AI-powered natural language processing
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Voice Interface */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎤</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Create RFQ with Voice</h2>
              <p className="text-lg text-slate-300 mb-8">
                Simply speak your requirements and our AI will create a detailed RFQ for you
              </p>
            </div>

            <div className="page-header">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/30 flex items-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none min-h-[52px]"
                >
                  <span className="mr-2">🎤</span>
                  {isProcessing ? 'Processing...' : 'Start Recording'}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-700 active:scale-95 transition-all flex items-center mx-auto animate-pulse min-h-[52px]"
                >
                  <span className="mr-2">⏹️</span>
                  Stop Recording
                </button>
              )}
              <p className="text-sm text-slate-300 mt-3">
                {isRecording ? 'Speak now...' : 'Click to start recording'}
              </p>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-300 mb-2">Voice Transcript:</h4>
                <p className="text-blue-200">{transcript}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/40 border border-red-700 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-red-300 mb-2">Error:</h4>
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Debug: Show if RFQ data exists */}
            {transcript && !generatedRFQ && (
              <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg mb-6">
                <p className="text-yellow-300 text-base">⏳ Extracting RFQ data... (If this stays, data extraction failed)</p>
              </div>
            )}

            {/* Generated RFQ Display */}
            {generatedRFQ && (
              <div className="bg-slate-800 border border-emerald-700/50 p-6 rounded-xl mb-6">
                <h4 className="font-semibold text-emerald-400 mb-4 text-xl">✅ Generated RFQ:</h4>
                <div className="space-y-3">
                  <div className="text-base">
                    <strong className="text-slate-300">Title:</strong> <span className="text-white">{generatedRFQ.title || 'N/A'}</span>
                  </div>
                  <div className="text-base">
                    <strong className="text-slate-300">Category:</strong> <span className="text-white">{generatedRFQ.category || 'N/A'}</span>
                  </div>
                  <div className="text-base">
                    <strong className="text-slate-300">Description:</strong> <span className="text-white">{generatedRFQ.description || 'N/A'}</span>
                  </div>
                  <div className="text-base">
                    <strong className="text-slate-300">Quantity:</strong> <span className="text-white">{generatedRFQ.quantity || 'N/A'}</span>
                  </div>
                  <div className="text-base">
                    <strong className="text-slate-300">Timeline:</strong> <span className="text-white">{generatedRFQ.timeline || 'N/A'}</span>
                  </div>
                  <div className="text-base">
                    <strong className="text-slate-300">Budget:</strong> <span className="text-white">{generatedRFQ.budget || 'N/A'}</span>
                  </div>
                  <div className="text-base">
                    <strong className="text-slate-300">Specifications:</strong>
                    {generatedRFQ.specifications && generatedRFQ.specifications.length > 0 ? (
                      <ul className="list-disc list-inside ml-4 text-white">
                        {generatedRFQ.specifications.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400"> N/A</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={saveRFQ}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 font-semibold min-h-[44px]"
                  >
                    Save RFQ
                  </button>
                  <button
                    onClick={discardRFQ}
                    className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-600 active:scale-95 transition-all font-semibold min-h-[44px]"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Voice Commands Examples */}
            <div className="bg-slate-800/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Voice Commands Examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong>"I need 1000 cotton t-shirts"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong>"Looking for steel pipes for construction"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong>"Need pharmaceutical packaging materials"</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong>"Require automotive parts delivery in 2 weeks"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong>"Want to buy agricultural equipment"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300">
                      <strong>"Need IT services for my company"</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">How It Works</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Speak Your Requirements</h4>
                    <p className="text-sm text-slate-300">Describe what you need in natural language</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">AI Processing</h4>
                    <p className="text-sm text-slate-300">Our AI extracts key details and creates structured RFQ</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Review & Edit</h4>
                    <p className="text-sm text-slate-300">Review the generated RFQ and make adjustments</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Submit RFQ</h4>
                    <p className="text-sm text-slate-300">Send to relevant suppliers automatically</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Features</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-slate-300">Multi-language support (Hindi, English)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-slate-300">Automatic category detection</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-slate-300">Quantity and specification extraction</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-slate-300">Timeline and budget estimation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-slate-300">Smart supplier matching</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-slate-300">Voice-to-text accuracy 95%+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Voice RFQs */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Voice RFQs</h3>
            <div className="space-y-4">
              {recentRFQs.length > 0 ? (
                recentRFQs.map((rfq) => (
                  <div key={rfq.id} className="flex items-center justify-between p-4 border border-slate-600 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <div>
                      <p className="font-medium text-white">{rfq.title}</p>
                      <p className="text-sm text-slate-300">
                        Created {new Date(rfq.createdAt).toLocaleDateString()} via {rfq.createdVia}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`badge-${rfq.status === 'active' ? 'success' : rfq.status === 'quoted' ? 'info' : rfq.status === 'completed' ? 'warning' : 'error'}`}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </span>
                      <button className="btn-outline text-sm px-4 py-2">View</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-300">No recent voice RFQs found</p>
                  <p className="text-sm text-slate-400 mt-2">Create your first voice RFQ above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
