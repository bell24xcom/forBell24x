// app/rfq/voice/page.tsx - Voice RFQ Page
'use client';

import { Mic, MicOff, Pause, Play, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function VoiceRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 60 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 60000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record voice RFQ');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript('');
  };

  const processVoiceRFQ = async () => {
    if (!audioBlob) return;

    setLoading(true);
    try {
      // Simulate voice processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock transcript
      setTranscript('I need 1000 pieces of cotton t-shirts in various sizes. Budget is around ₹50,000. Need delivery within 2 weeks. Please send quotes.');

    } catch (error) {
      console.error('Error processing voice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Voice RFQ - Coming Soon
            </h1>
            <p className="text-gray-600">
              Record your RFQ requirements using voice and get AI-powered transcription
            </p>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mic className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-amber-800">
                  Voice RFQ Feature Coming Soon
                </h3>
                <p className="text-amber-700 mt-1">
                  We're working on an advanced voice-to-text RFQ system. This feature will allow you to:
                </p>
                <ul className="list-disc list-inside text-amber-700 mt-2 space-y-1">
                  <li>Record your RFQ requirements using voice</li>
                  <li>Get AI-powered transcription and formatting</li>
                  <li>Automatically extract key details (quantity, budget, timeline)</li>
                  <li>Send to multiple suppliers with one click</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo Interface */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Demo Interface</h2>

            <div className="space-y-6">
              {/* Recording Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Mic className="h-5 w-5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <MicOff className="h-5 w-5" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              {/* Audio Player */}
              {audioUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Your Recording</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={playRecording}
                      disabled={isPlaying}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      <span>{isPlaying ? 'Playing...' : 'Play'}</span>
                    </button>

                    <button
                      onClick={deleteRecording}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Transcription</h3>
                  <p className="text-gray-700">{transcript}</p>
                </div>
              )}

              {/* Process Button */}
              {audioBlob && !transcript && (
                <div className="flex justify-center">
                  <button
                    onClick={processVoiceRFQ}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                    <span>{loading ? 'Processing...' : 'Process Voice RFQ'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Recording</h3>
              <p className="text-gray-600">Record your RFQ requirements naturally using voice</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Transcription</h3>
              <p className="text-gray-600">Get accurate transcription with AI-powered processing</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Send</h3>
              <p className="text-gray-600">Automatically send to relevant suppliers</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <a
              href="/rfq/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Use Text RFQ Instead
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
