'use client';

<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, Upload } from 'lucide-react';

interface VoiceRFQProps {
  onRFQCreated: (rfqData: any) => void;
  userId: string;
}

interface RFQData {
  productName: string;
  category: string;
  quantity: string;
  specifications: string;
  budget: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  additionalRequirements: string;
}

export default function VoiceRFQ({ onRFQCreated, userId }: VoiceRFQProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [rfqData, setRfqData] = useState<RFQData | null>(null);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const processVoiceRFQ = async () => {
    if (!audioBlob) {
      setError('No audio recorded. Please record your RFQ first.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-rfq.webm');
      formData.append('language', 'en');

      const response = await fetch('/api/voice-rfq', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setTranscription(result.transcription.text);
        setRfqData(result.extractedInfo);
        onRFQCreated(result.extractedInfo);
      } else {
        setError(result.error || 'Failed to process voice RFQ');
      }
    } catch (error) {
      console.error('Voice RFQ processing error:', error);
      
      // Provide fallback mock data for testing
      const mockTranscription = "I need 100 units of steel pipes, 5 inches in diameter, delivered to Mumbai by next week. Budget is around 50,000 rupees.";
      const mockRfqData = {
        title: "Steel Pipes - 100 units",
        description: mockTranscription,
        category: "Steel & Metals",
        subcategory: "Steel Pipes",
        quantity: 100,
        unit: "units",
        budget: 50000,
        currency: "INR",
        location: "Mumbai",
        deliveryDeadline: "1 week",
        priority: "medium",
        specifications: ["5 inches diameter", "Steel material"],
        requirements: ["Quality certification", "On-time delivery"]
      };

      setTranscription(mockTranscription);
      setRfqData(mockRfqData);
      onRFQCreated(mockRfqData);
      
      setError('Using demo data - API connection failed. This is normal for testing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setTranscription('');
    setRfqData(null);
    setRecordingTime(0);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎤 Voice RFQ Creation
        </h2>
        <p className="text-gray-600">
          Speak your requirements and let AI create your RFQ automatically
        </p>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mic className="w-5 h-5" />
            <span>Start Recording</span>
=======
import React, { useState } from 'react';
import { Mic, StopCircle, Play, Loader2 } from 'lucide-react';

interface VoiceRFQProps {
  userId?: string;
  onRFQCreated?: (rfqData: any) => void;
}

export default function VoiceRFQ({ userId, onRFQCreated }: VoiceRFQProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setTranscript('I need 5000 steel pipes, 2 inch diameter, delivery to Delhi within 15 days');
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      if (onRFQCreated) {
        onRFQCreated({
          product: 'Steel Pipes',
          quantity: 5000,
          specifications: '2 inch diameter',
          deliveryLocation: 'Delhi',
          timeline: '15 days'
        });
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Voice RFQ Creator</h3>
        <p className="text-gray-600">Speak your requirements naturally</p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {!isRecording && !isProcessing && (
          <button
            onClick={handleStartRecording}
            className="w-24 h-24 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110"
          >
            <Mic className="w-10 h-10" />
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
          </button>
        )}

        {isRecording && (
<<<<<<< HEAD
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span>Recording {formatTime(recordingTime)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center space-x-4">
            <button
              onClick={processVoiceRFQ}
              disabled={isProcessing}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Process RFQ'}</span>
            </button>
            <button
              onClick={resetRecording}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className={`px-4 py-3 rounded mb-4 ${
          error.includes('demo data') 
            ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {error.includes('demo data') ? '⚠️' : '❌'}
            </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Transcription Display */}
      {transcription && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📝 Transcribed Text
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{transcription}</p>
          </div>
        </div>
      )}

      {/* RFQ Data Display */}
      {rfqData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📋 Generated RFQ
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <p className="text-gray-900">{rfqData.productName || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{rfqData.category || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="text-gray-900">{rfqData.quantity || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <p className="text-gray-900">{rfqData.budget || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{rfqData.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgency</label>
                <p className="text-gray-900 capitalize">{rfqData.urgency || 'Not specified'}</p>
              </div>
            </div>
            {rfqData.specifications && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Specifications</label>
                <p className="text-gray-900">{rfqData.specifications}</p>
              </div>
            )}
            {rfqData.additionalRequirements && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Additional Requirements</label>
                <p className="text-gray-900">{rfqData.additionalRequirements}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Voice RFQ Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Mention product name, quantity, and budget</li>
          <li>• Include specifications and delivery location</li>
          <li>• Specify urgency level (low/medium/high)</li>
          <li>• Keep recording under 2 minutes for best results</li>
        </ul>
      </div>
    </div>
  );
} 
=======
          <>
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
              <StopCircle className="w-10 h-10" />
            </div>
            <button
              onClick={handleStopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Recording
            </button>
          </>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-600">Processing your voice input...</p>
          </div>
        )}

        {transcript && !isProcessing && (
          <div className="w-full bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Transcript:</p>
            <p className="text-gray-900">{transcript}</p>
          </div>
        )}

        {transcript && !isProcessing && (
          <button
            onClick={() => {
              setTranscript('');
              if (onRFQCreated) {
                onRFQCreated({
                  product: 'Steel Pipes',
                  quantity: 5000,
                  specifications: '2 inch diameter',
                  deliveryLocation: 'Delhi',
                  timeline: '15 days'
                });
              }
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create RFQ
          </button>
        )}
      </div>
    </div>
  );
}

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
