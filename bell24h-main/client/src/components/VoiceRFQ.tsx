'use client';

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
          </button>
        )}

        {isRecording && (
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

