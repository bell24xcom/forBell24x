'use client';

import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Square, Upload, FileText, Clock, CheckCircle } from 'lucide-react';

export default function VoiceRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<any>(null);
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqDescription, setRfqDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
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
        console.error('Error accessing microphone:', err);
        alert('Please allow microphone access to record voice RFQ');
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const submitVoiceRFQ = () => {
    if (!audioBlob || !rfqTitle || !category) {
      alert('Please complete all required fields and record your voice');
      return;
    }

    // Simulate API call
    console.log('Submitting voice RFQ:', {
      title: rfqTitle,
      description: rfqDescription,
      category,
      audioBlob,
      duration: recordingTime
    });

    alert('Voice RFQ submitted successfully!');
    
    // Reset form
    setRfqTitle('');
    setRfqDescription('');
    setCategory('');
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice RFQ</h1>
          <p className="text-gray-600">Record your requirements using voice for faster RFQ creation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Recording: {formatTime(recordingTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Your RFQ</h2>
          
          {/* Recording Controls */}
          <div className="text-center mb-6">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
            }`}>
              {isRecording ? (
                <MicOff className="w-12 h-12 text-red-600" />
              ) : (
                <Mic className="w-12 h-12 text-gray-600" />
              )}
            </div>
            
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">{formatTime(recordingTime)}</p>
              <p className="text-sm text-gray-600">
                {isRecording ? 'Recording...' : 'Ready to record'}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Mic className="w-5 h-5 mr-2" />
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
          </div>

          {/* Playback Controls */}
          {audioUrl && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Recording Playback</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={playRecording}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                <span className="text-sm text-gray-600">Duration: {formatTime(recordingTime)}</span>
              </div>
            </div>
          )}
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
              <h3 className="text-sm font-medium text-blue-900 mb-2">Voice Recording Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Mention quantity, specifications, and delivery requirements</li>
                <li>• Include your budget range if possible</li>
                <li>• Keep recording under 5 minutes for best results</li>
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
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {audioBlob ? 'Voice recorded' : 'No voice recording'}
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
            onClick={submitVoiceRFQ}
            disabled={!audioBlob || !rfqTitle || !category}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5 mr-2" />
            Submit Voice RFQ
          </button>
        </div>
      </div>

      {/* Recent Voice RFQs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Voice RFQs</h2>
        <div className="space-y-3">
          {[
            { id: 'VRFQ-001', title: 'Steel Rods - 1000 units', status: 'active', duration: '2:30', createdAt: '2024-01-15' },
            { id: 'VRFQ-002', title: 'Automotive Parts - 500 units', status: 'completed', duration: '1:45', createdAt: '2024-01-14' },
            { id: 'VRFQ-003', title: 'Chemical Solvents - 200L', status: 'pending', duration: '3:15', createdAt: '2024-01-13' },
          ].map((rfq) => (
            <div key={rfq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Mic className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                  <p className="text-xs text-gray-500">Duration: {rfq.duration} • {rfq.createdAt}</p>
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