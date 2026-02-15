'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Upload, Play, Square, Trash2, Camera, FileVideo } from 'lucide-react';

export default function VideoRFQPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState('');
  const [rfqData, setRfqData] = useState<any>(null);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

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
      setError('');
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
        setVideoUrl(URL.createObjectURL(file));
        setError('');
      } else {
        setError('Please select a valid video file (MP4, MOV, AVI)');
      }
    }
  };

  const processVideoRFQ = async () => {
    const videoToProcess = videoBlob || uploadedFile;
    
    if (!videoToProcess) {
      setError('No video to process. Please record or upload a video first.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', videoToProcess, 'video-rfq.webm');
      formData.append('type', videoBlob ? 'recording' : 'upload');

      const response = await fetch('/api/video-rfq', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setTranscription(result.transcription);
        setRfqData(result.extractedInfo);
      } else {
        setError(result.error || 'Failed to process video RFQ');
      }
    } catch (error) {
      console.error('Video RFQ processing error:', error);
      
      // Provide fallback mock data for testing
      const mockTranscription = "I need 50 units of industrial machinery for our manufacturing plant in Mumbai. Budget is around 2 lakhs. Need delivery within 3 weeks.";
      const mockRfqData = {
        title: "Industrial Machinery - 50 units",
        description: mockTranscription,
        category: "Machinery & Equipment",
        subcategory: "Industrial Machinery",
        quantity: 50,
        unit: "units",
        budget: 200000,
        currency: "INR",
        location: "Mumbai",
        deliveryDeadline: "3 weeks",
        priority: "medium",
        specifications: ["Industrial grade", "Manufacturing use"],
        requirements: ["Quality certification", "Installation support"]
      };

      setTranscription(mockTranscription);
      setRfqData(mockRfqData);
      setError('Using demo data - API connection failed. This is normal for testing.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetVideo = () => {
    setVideoBlob(null);
    setUploadedFile(null);
    setVideoUrl(null);
    setTranscription('');
    setRfqData(null);
    setError('');
    setRecordingTime(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video RFQ Creator</h1>
          <p className="text-gray-600">Create RFQs using video with AI-powered transcription and analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Recording/Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Record or Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                {videoUrl && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="w-full h-64 bg-black rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={resetVideo}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recording Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="flex items-center gap-2"
                      disabled={!!videoUrl}
                    >
                      <Video className="w-4 h-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop Recording ({formatTime(recordingTime)})
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    disabled={!!videoUrl}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Video
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Process Button */}
                {videoUrl && (
                  <Button
                    onClick={processVideoRFQ}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Video...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Process Video RFQ
                      </>
                    )}
                  </Button>
                )}

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcription */}
            {transcription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Transcription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{transcription}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RFQ Data Display */}
          <div className="space-y-6">
            {rfqData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Extracted RFQ Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Title</label>
                      <p className="text-lg font-semibold text-gray-900">{rfqData.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Category</label>
                      <p className="text-gray-900">{rfqData.category} - {rfqData.subcategory}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Quantity</label>
                        <p className="text-gray-900">{rfqData.quantity} {rfqData.unit}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Budget</label>
                        <p className="text-gray-900">₹{rfqData.budget.toLocaleString()} {rfqData.currency}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{rfqData.location}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Delivery Deadline</label>
                      <p className="text-gray-900">{rfqData.deliveryDeadline}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        rfqData.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rfqData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rfqData.priority}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Specifications</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {rfqData.specifications.map((spec: string, index: number) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Requirements</label>
                      <ul className="list-disc list-inside text-gray-900">
                        {rfqData.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      Create RFQ
                    </Button>
                    <Button variant="outline" onClick={resetVideo}>
                      Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Video Processed</h3>
                  <p className="text-gray-600">Record or upload a video to see the extracted RFQ data</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
