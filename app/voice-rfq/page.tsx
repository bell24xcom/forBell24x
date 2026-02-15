'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [generatedRFQ, setGeneratedRFQ] = useState<VoiceRFQData | null>(null);
  const [recentRFQs, setRecentRFQs] = useState<VoiceRFQData[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        setError('Speech recognition error: ' + event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        if (transcript.trim()) {
          processVoiceInput(transcript);
        }
      };

      setRecognition(recognitionInstance);
    }

    // Load recent RFQs
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

  const startRecording = () => {
    if (!recognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    setError(null);
    setTranscript('');
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedRFQ),
      });

      if (response.ok) {
        setGeneratedRFQ(null);
        setTranscript('');
        loadRecentRFQs();
        alert('RFQ saved successfully!');
      } else {
        setError('Failed to save RFQ');
      }
    } catch (error) {
      setError('Error saving RFQ');
      console.error('Save RFQ error:', error);
    }
  };

  const discardRFQ = () => {
    setGeneratedRFQ(null);
    setTranscript('');
  };
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">Voice RFQ</h1>
          <p className="page-subtitle">
            Create RFQs using voice commands and AI-powered natural language processing
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Voice Interface */}
          <div className="card card-hover mb-8">
            <div className="page-header">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎤</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Create RFQ with Voice</h2>
              <p className="text-lg text-neutral-600 mb-8">
                Simply speak your requirements and our AI will create a detailed RFQ for you
              </p>
            </div>

            <div className="page-header">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors flex items-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">🎤</span>
                  {isProcessing ? 'Processing...' : 'Start Recording'}
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-700 transition-colors flex items-center mx-auto animate-pulse"
                >
                  <span className="mr-2">⏹️</span>
                  Stop Recording
                </button>
              )}
              <p className="text-sm text-neutral-600 mt-3">
                {isRecording ? 'Speak now...' : 'Click to start recording'}
              </p>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Voice Transcript:</h4>
                <p className="text-blue-800">{transcript}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-red-900 mb-2">Error:</h4>
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Generated RFQ Display */}
            {generatedRFQ && (
              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h4 className="font-semibold text-green-900 mb-4">Generated RFQ:</h4>
                <div className="space-y-3">
                  <div>
                    <strong>Title:</strong> {generatedRFQ.title}
                  </div>
                  <div>
                    <strong>Category:</strong> {generatedRFQ.category}
                  </div>
                  <div>
                    <strong>Description:</strong> {generatedRFQ.description}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {generatedRFQ.quantity}
                  </div>
                  <div>
                    <strong>Timeline:</strong> {generatedRFQ.timeline}
                  </div>
                  <div>
                    <strong>Budget:</strong> {generatedRFQ.budget}
                  </div>
                  <div>
                    <strong>Specifications:</strong>
                    <ul className="list-disc list-inside ml-4">
                      {generatedRFQ.specifications.map((spec, index) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={saveRFQ}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save RFQ
                  </button>
                  <button 
                    onClick={discardRFQ}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Voice Commands Examples */}
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Voice Commands Examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700">
                      <strong>"I need 1000 cotton t-shirts"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700">
                      <strong>"Looking for steel pipes for construction"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700">
                      <strong>"Need pharmaceutical packaging materials"</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700">
                      <strong>"Require automotive parts delivery in 2 weeks"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700">
                      <strong>"Want to buy agricultural equipment"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-neutral-200">
                    <p className="text-sm text-neutral-700">
                      <strong>"Need IT services for my company"</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">How It Works</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Speak Your Requirements</h4>
                    <p className="text-sm text-neutral-600">Describe what you need in natural language</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">AI Processing</h4>
                    <p className="text-sm text-neutral-600">Our AI extracts key details and creates structured RFQ</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Review & Edit</h4>
                    <p className="text-sm text-neutral-600">Review the generated RFQ and make adjustments</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Submit RFQ</h4>
                    <p className="text-sm text-neutral-600">Send to relevant suppliers automatically</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">Features</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-neutral-700">Multi-language support (Hindi, English)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-neutral-700">Automatic category detection</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-neutral-700">Quantity and specification extraction</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-neutral-700">Timeline and budget estimation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-neutral-700">Smart supplier matching</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-neutral-700">Voice-to-text accuracy 95%+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Voice RFQs */}
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recent Voice RFQs</h3>
            <div className="space-y-4">
              {recentRFQs.length > 0 ? (
                recentRFQs.map((rfq) => (
                  <div key={rfq.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="font-medium text-neutral-900">{rfq.title}</p>
                      <p className="text-sm text-neutral-600">
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
                  <p className="text-neutral-600">No recent voice RFQs found</p>
                  <p className="text-sm text-neutral-500 mt-2">Create your first voice RFQ above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
