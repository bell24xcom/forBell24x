'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Mic, Square, Play, Pause, Upload, FileText, DollarSign, Calendar } from 'lucide-react';

interface VideoRFQData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  requirements: string;
}

export default function VideoRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [rfqData, setRfqData] = useState<VideoRFQData>({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    requirements: ''
  });
  const [currentStep, setCurrentStep] = useState<'recording' | 'details' | 'review'>('recording');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        setCurrentStep('details');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [isRecording]);

  const togglePlayback = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleInputChange = (field: keyof VideoRFQData, value: string) => {
    setRfqData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', rfqData.title);
      formData.append('description', rfqData.description);
      formData.append('budget', rfqData.budget);
      formData.append('deadline', rfqData.deadline);
      formData.append('category', rfqData.category);
      formData.append('requirements', rfqData.requirements);
      
      if (videoBlob) {
        formData.append('video', videoBlob, 'rfq-video.webm');
      }

      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Video RFQ submitted successfully!');
        // Reset form
        setRfqData({
          title: '',
          description: '',
          budget: '',
          deadline: '',
          category: '',
          requirements: ''
        });
        setVideoBlob(null);
        setVideoUrl('');
        setCurrentStep('recording');
      }
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      alert('Error submitting RFQ. Please try again.');
    }
  };

  const retakeVideo = () => {
    setVideoBlob(null);
    setVideoUrl('');
    setCurrentStep('recording');
  };

  if (currentStep === 'details') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Video RFQ</h2>
          <p className="text-gray-600">Add details to help suppliers understand your requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Video Preview</h3>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-64 object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-16 h-16 text-white" />
                ) : (
                  <Play className="w-16 h-16 text-white" />
                )}
              </button>
            </div>
            <button
              onClick={retakeVideo}
              className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Retake Video
            </button>
          </div>

          {/* RFQ Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">RFQ Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rfqData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief title for your RFQ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rfqData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of your requirements"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={rfqData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rfqData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={rfqData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="textiles">Textiles</option>
                <option value="automotive">Automotive</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="machinery">Machinery</option>
                <option value="chemicals">Chemicals</option>
                <option value="food">Food & Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Requirements
              </label>
              <textarea
                value={rfqData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Technical specifications, quality standards, certifications needed"
              />
            </div>

            <button
              onClick={() => setCurrentStep('review')}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Review & Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Video RFQ</h2>
          <p className="text-gray-600">Please review all details before submitting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">RFQ Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Title:</span>
                <span className="text-gray-900">{rfqData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Category:</span>
                <span className="text-gray-900">{rfqData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Budget:</span>
                <span className="text-gray-900">₹{rfqData.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Deadline:</span>
                <span className="text-gray-900">{rfqData.deadline}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
            <p className="text-gray-700">{rfqData.description}</p>
            
            {rfqData.requirements && (
              <>
                <h4 className="font-medium text-gray-800 mt-4 mb-2">Technical Requirements</h4>
                <p className="text-gray-700">{rfqData.requirements}</p>
              </>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('details')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Details
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit RFQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Video RFQ</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Record a video explaining your requirements and get matched with the best suppliers. 
          Your video will be automatically transcribed and analyzed for better matching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Record Video</h3>
          <p className="text-sm text-gray-600">Use your camera to explain requirements</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Add Details</h3>
          <p className="text-sm text-gray-600">Fill in budget, deadline, and specifications</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Submit & Match</h3>
          <p className="text-sm text-gray-600">Get matched with qualified suppliers</p>
        </div>
      </div>

      <div className="text-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="inline-flex items-center px-8 py-4 bg-red-600 text-white text-lg font-medium rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Camera className="w-6 h-6 mr-3" />
            Start Recording RFQ
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-gray-700">Recording...</span>
            </div>
            <button
              onClick={stopRecording}
              className="inline-flex items-center px-8 py-4 bg-gray-800 text-white text-lg font-medium rounded-full hover:bg-gray-900 transition-all duration-200 shadow-lg"
            >
              <Square className="w-6 h-6 mr-3" />
              Stop Recording
            </button>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Make sure you have good lighting and speak clearly</p>
          <p>Recommended duration: 1-3 minutes</p>
        </div>
      </div>
    </div>
  );
}
