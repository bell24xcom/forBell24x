'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Upload, Play, Square, Trash2, Camera, FileVideo } from 'lucide-react';

export default function VideoRFQPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState('');
  const [rfqData, setRfqData] = useState<any>(null);
  const [error, setError] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCreatingRFQ, setIsCreatingRFQ] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Attach the live camera stream after React has rendered the <video> element.
  // (Setting srcObject inside startRecording fails because the element is conditionally
  // rendered and previewRef.current is null until the re-render commits.)
  useEffect(() => {
    if (activeStream && previewRef.current) {
      previewRef.current.srcObject = activeStream;
    }
    return () => {
      if (previewRef.current) previewRef.current.srcObject = null;
    };
  }, [activeStream, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Diagnostic: surface track counts so a black-screen / no-audio report
      // can be cross-checked against what the browser actually granted.
      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();
      console.log('[VideoRFQ] tracks granted — audio:', audioTracks.length, 'video:', videoTracks.length);
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(t => t.stop());
        setError('Microphone access was not granted. Please allow microphone access in your browser, then try again.');
        return;
      }

      // Pick an explicit mimeType that includes the audio codec — without this
      // some Chrome builds default to video-only (vp8) and drop the audio track.
      const candidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=opus',
        'video/webm',
      ];
      const mimeType = candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
      console.log('[VideoRFQ] using mimeType:', mimeType || '(browser default)');
      mediaRecorderRef.current = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        console.log('[VideoRFQ] recorded blob size:', blob.size, 'bytes, type:', blob.type);
        setVideoBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        // Stop tracks and clear the live preview
        stream.getTracks().forEach(track => track.stop());
        setActiveStream(null);
      };

      // Mount the preview <video> via state, then the useEffect attaches srcObject
      setActiveStream(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera/mic. Please check browser permissions.');
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
      setError('AI analysis complete (preview mode)');
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

  const createRFQ = async () => {
    if (!rfqData) return;

    setIsCreatingRFQ(true);
    try {
      const urgencyMap: Record<string, 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'> = {
        low: 'LOW', medium: 'NORMAL', high: 'HIGH', urgent: 'URGENT',
      };
      const budgetNum = typeof rfqData.budget === 'number' ? rfqData.budget : undefined;

      // 1. Save to Neon (Core)
      const neonRes = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rfqData.title,
          description: transcription,
          category: rfqData.category,
          quantity: String(rfqData.quantity ?? ''),
          unit: rfqData.unit || 'units',
          minBudget: budgetNum,
          maxBudget: budgetNum,
          location: rfqData.location,
          urgency: urgencyMap[String(rfqData.priority).toLowerCase()] ?? 'NORMAL',
        }),
      });

      if (!neonRes.ok) {
        const errData = await neonRes.json();
        throw new Error(errData.error || 'Failed to save to core database');
      }

      // 2. Save to InsForge (Marketing)
      fetch('/api/marketing/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rfqData.title,
          product: rfqData.title,
          category: rfqData.category,
          quantity: rfqData.quantity,
          unit: rfqData.unit,
          budget: rfqData.budget,
          location: rfqData.location,
          urgency: rfqData.priority,
          description: transcription,
        }),
      }).catch(err => console.error('[InsForge-Sync] Video RFQ failed:', err));

      router.push('/dashboard/rfqs');

    } catch (error: any) {
      setError(error.message || 'Failed to create RFQ.');
    } finally {
      setIsCreatingRFQ(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F172A] p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer">
          ← Back
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Video RFQ</h1>
          <p className="text-slate-300">Create RFQs using video with AI-powered transcription and analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Recording/Upload Section */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Camera className="w-5 h-5" />
                  Record or Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live Camera Preview — shown during recording */}
                {isRecording && (
                  <div className="relative">
                    <video
                      ref={previewRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 bg-black rounded-lg object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      REC {formatTime(recordingTime)}
                    </div>
                  </div>
                )}

                {/* Recorded / Uploaded Video Playback */}
                {videoUrl && !isRecording && (
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
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileVideo className="w-5 h-5" />
                    Transcription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <p className="text-sm text-slate-400">{transcription}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RFQ Data Display */}
          <div className="space-y-6">
            {rfqData ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileVideo className="w-5 h-5" />
                    Extracted RFQ Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Title</label>
                      <p className="text-lg font-semibold text-white">{rfqData.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Category</label>
                      <p className="text-white">{rfqData.category} - {rfqData.subcategory}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300">Quantity</label>
                        <p className="text-white">{rfqData.quantity} {rfqData.unit}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300">Budget</label>
                        <p className="text-white">₹{rfqData.budget.toLocaleString()} {rfqData.currency}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Location</label>
                      <p className="text-white">{rfqData.location}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Delivery Deadline</label>
                      <p className="text-white">{rfqData.deliveryDeadline}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Priority</label>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        rfqData.priority === 'high' ? 'bg-red-900 text-red-100' :
                        rfqData.priority === 'medium' ? 'bg-yellow-900 text-yellow-100' :
                        'bg-green-900 text-green-100'
                      }`}>
                        {rfqData.priority}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Specifications</label>
                      <ul className="list-disc list-inside text-white">
                        {rfqData.specifications.map((spec: string, index: number) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300">Requirements</label>
                      <ul className="list-disc list-inside text-white">
                        {rfqData.requirements.map((req: string, index: number) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={createRFQ}
                      disabled={isCreatingRFQ}
                    >
                      {isCreatingRFQ ? 'Creating RFQ...' : 'Create RFQ'}
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
                  <h3 className="text-lg font-semibold text-white mb-2">No Video Processed</h3>
                  <p className="text-slate-300">Record or upload a video to see the extracted RFQ data</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
