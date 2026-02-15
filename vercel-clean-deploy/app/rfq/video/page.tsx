// app/rfq/video/page.tsx - Video RFQ Page
'use client';

import { Pause, Play, Send, Trash2, Upload, Video, VideoOff } from 'lucide-react';
import { useState } from 'react';

export default function VideoRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 120 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 120000);

    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Please allow camera and microphone access to record video RFQ');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const playRecording = () => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.play();
      setIsPlaying(true);
      video.onended = () => setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setTranscript('');
  };

  const processVideoRFQ = async () => {
    if (!videoBlob) return;

    setLoading(true);
    try {
      // Simulate video processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock transcript
      setTranscript('I need to show you this product sample. I need 500 pieces of this exact design in different colors. The material should be cotton blend. Budget is around ₹75,000. I need delivery within 3 weeks. Please send quotes with samples.');

    } catch (error) {
      console.error('Error processing video:', error);
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
              Video RFQ - Coming Soon
            </h1>
            <p className="text-gray-600">
              Record video RFQ with product samples and get AI-powered analysis
            </p>
          </div>

          {/* Coming Soon Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-purple-800">
                  Video RFQ Feature Coming Soon
                </h3>
                <p className="text-purple-700 mt-1">
                  We're developing an advanced video RFQ system. This feature will allow you to:
                </p>
                <ul className="list-disc list-inside text-purple-700 mt-2 space-y-1">
                  <li>Record video RFQ with product samples and demonstrations</li>
                  <li>Get AI-powered video analysis and transcription</li>
                  <li>Extract product specifications from video content</li>
                  <li>Match with suppliers based on visual requirements</li>
                  <li>Share video RFQ with multiple suppliers instantly</li>
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
                    <Video className="h-5 w-5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <VideoOff className="h-5 w-5" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              {/* Video Player */}
              {videoUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Your Video</h3>
                  <div className="flex items-center space-x-4">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full max-w-md rounded-lg"
                    />
                    <div className="flex flex-col space-y-2">
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
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">AI Analysis</h3>
                  <p className="text-gray-700">{transcript}</p>
                </div>
              )}

              {/* Process Button */}
              {videoBlob && !transcript && (
                <div className="flex justify-center">
                  <button
                    onClick={processVideoRFQ}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                    <span>{loading ? 'Processing...' : 'Process Video RFQ'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Recording</h3>
              <p className="text-gray-600">Record video RFQ with product samples and demonstrations</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Get AI-powered video analysis and product specification extraction</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">Match with suppliers based on visual requirements</p>
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
