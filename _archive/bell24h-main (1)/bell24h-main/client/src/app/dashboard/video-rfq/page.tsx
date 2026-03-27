'use client';

import React, { useState, useRef } from 'react';
import { Video, VideoOff, Play, Pause, Square, Upload, FileText, Clock, CheckCircle, Camera, Trash2 } from 'lucide-react';

export default function VideoRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<any>(null);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqDescription, setRfqDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'video/webm'
        });
        const chunks = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setVideoBlob(blob);
          setVideoUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      })
      .catch(err => {
        console.error('Error accessing camera:', err);
        alert('Please allow camera and microphone access to record video RFQ');
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const playVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setVideoBlob(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const removeVideo = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setUploadedFile(null);
    setRecordingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitVideoRFQ = () => {
    if (!videoBlob || !rfqTitle || !category) {
      alert('Please complete all required fields and record/upload your video');
      return;
    }

    // Simulate API call
    console.log('Submitting video RFQ:', {
      title: rfqTitle,
      description: rfqDescription,
      category,
      videoBlob,
      duration: recordingTime
    });

    alert('Video RFQ submitted successfully!');
    
    // Reset form
    setRfqTitle('');
    setRfqDescription('');
    setCategory('');
    setVideoBlob(null);
    setVideoUrl(null);
    setUploadedFile(null);
    setRecordingTime(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video RFQ</h1>
          <p className="text-gray-600">Record or upload video to create engaging RFQs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Recording: {formatTime(recordingTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Recording/Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Video RFQ</h2>
          
          {/* Video Preview */}
          {videoUrl ? (
            <div className="mb-6">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-64 object-cover"
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={playVideo}
                    className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-70 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">Duration: {formatTime(recordingTime)}</span>
                <button
                  onClick={removeVideo}
                  className="flex items-center text-red-600 hover:text-red-700 text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No video recorded or uploaded</p>
                </div>
              </div>
            </div>
          )}

          {/* Recording Controls */}
          <div className="text-center mb-6">
            <div className="flex justify-center space-x-4 mb-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Or upload existing video</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mx-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </button>
            </div>
          </div>
        </div>

        {/* RFQ Details Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RFQ Title *
              </label>
              <input
                type="text"
                value={rfqTitle}
                onChange={(e) => setRfqTitle(e.target.value)}
                placeholder="Enter RFQ title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category...</option>
                <option value="steel-metal">Steel & Metal</option>
                <option value="automotive">Automotive</option>
                <option value="chemicals">Chemicals</option>
                <option value="electronics">Electronics</option>
                <option value="textiles">Textiles</option>
                <option value="construction">Construction</option>
                <option value="machinery">Machinery</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Description
              </label>
              <textarea
                value={rfqDescription}
                onChange={(e) => setRfqDescription(e.target.value)}
                placeholder="Add any additional details..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Video Recording Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting and clear audio</li>
                <li>• Show products or specifications visually when possible</li>
                <li>• Keep videos under 5 minutes for best engagement</li>
                <li>• Speak clearly and mention all requirements</li>
                <li>• Include quantity, quality standards, and delivery timeline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Video className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {videoBlob ? 'Video ready' : 'No video uploaded'}
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {rfqTitle && category ? 'Details complete' : 'Details incomplete'}
              </span>
            </div>
          </div>
          
          <button
            onClick={submitVideoRFQ}
            disabled={!videoBlob || !rfqTitle || !category}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5 mr-2" />
            Submit Video RFQ
          </button>
        </div>
      </div>

      {/* Recent Video RFQs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Video RFQs</h2>
        <div className="space-y-3">
          {[
            { id: 'VRFQ-001', title: 'Steel Rods - 1000 units', status: 'active', duration: '2:30', views: 15, createdAt: '2024-01-15' },
            { id: 'VRFQ-002', title: 'Automotive Parts - 500 units', status: 'completed', duration: '1:45', views: 28, createdAt: '2024-01-14' },
            { id: 'VRFQ-003', title: 'Chemical Solvents - 200L', status: 'pending', duration: '3:15', views: 8, createdAt: '2024-01-13' },
          ].map((rfq) => (
            <div key={rfq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Video className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                  <p className="text-xs text-gray-500">
                    Duration: {rfq.duration} • Views: {rfq.views} • {rfq.createdAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rfq.status === 'active' ? 'bg-green-100 text-green-800' :
                  rfq.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rfq.status}
                </span>
                <button className="text-blue-600 hover:text-blue-700 text-sm">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}