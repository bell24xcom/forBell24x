'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, StopCircle, Play, RotateCcw, Upload, CheckCircle, X, Loader2 } from 'lucide-react';

interface VideoRFQProps {
  category: string;
  city: string;
  onComplete?: (videoBlob: Blob, metadata: any) => void;
  onCancel?: () => void;
}

export const VideoRFQ: React.FC<VideoRFQProps> = ({ category, city, onComplete, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [step, setStep] = useState<'idle' | 'recording' | 'preview' | 'uploading' | 'success'>('idle');
  const [timer, setTimer] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setRecordedBlob(blob);
        setStep('preview');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setStep('recording');
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      alert("Please allow camera and microphone access to record a Video RFQ.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setVideoUrl(null);
    setRecordedBlob(null);
    setStep('idle');
    setTimer(0);
  };

  const handleSubmit = async () => {
    if (!recordedBlob) return;
    setStep('uploading');
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, 'video-rfq.webm');
      formData.append('context', `Category: ${category}, City: ${city}`);

      // Show progress while real upload runs
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev >= 85 ? 85 : prev + 5));
      }, 300);

      const res = await fetch('/api/video-rfq', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadProgress(100);
      setStep('success');
      if (onComplete) {
        onComplete(recordedBlob, {
          category,
          city,
          rfqId: data.rfqId,
          extractedInfo: data.extractedInfo,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('[VideoRFQ] Submit error:', err);
      setStep('preview'); // let user retry
      alert('Failed to submit your Video RFQ. Please try again.');
    }
  };

    const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" />
            Video RFQ: {category} in {city}
          </h3>
          <p className="text-slate-400 text-xs">Show, don&apos;t just tell. Get better quotes.</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {step === 'idle' && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-indigo-400" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">Record your requirement</h4>
            <p className="text-slate-400 text-center max-w-sm mb-8">
              Describe your {category} needs in a 60-second video. Mention quantity, quality, and delivery dates.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={startRecording}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition"
              >
                <Mic className="w-5 h-5" /> Start Recording
              </button>
              <label className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition cursor-pointer">
                <Upload className="w-5 h-5" /> Upload Video
                <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRecordedBlob(file);
                    setVideoUrl(URL.createObjectURL(file));
                    setStep('preview');
                  }
                }} />
              </label>
            </div>
          </div>
        )}

        {(step === 'recording' || step === 'preview') && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              muted={step === 'recording'} 
              controls={step === 'preview'}
              src={videoUrl || undefined}
              className="w-full h-full object-contain"
            />
            
            {step === 'recording' && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                REC {formatTime(timer)}
              </div>
            )}
          </div>
        )}

        {step === 'uploading' && (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <h4 className="text-xl font-semibold text-white mb-2">Analyzing your Video RFQ...</h4>
            <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-slate-400 text-sm mt-2">{uploadProgress}% uploaded</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">Video RFQ Received!</h4>
            <p className="text-slate-300 max-w-sm mb-8">
              We&apos;ve saved your request for {category} in {city}. <br/>
              <span className="text-indigo-400 font-semibold">Try without login:</span> We&apos;ll find matching suppliers in the next few minutes.
            </p>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl transition"
              onClick={() => window.location.href = '/dashboard?guest=true'}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {step === 'recording' && (
        <div className="bg-slate-800 p-4 flex justify-center border-t border-slate-700">
          <button 
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-xl flex items-center gap-2 transition"
          >
            <StopCircle className="w-5 h-5" /> Stop Recording
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="bg-slate-800 p-4 flex justify-between items-center border-t border-slate-700">
          <button 
            onClick={resetRecording}
            className="text-slate-300 hover:text-white flex items-center gap-2 font-medium transition"
          >
            <RotateCcw className="w-4 h-4" /> Re-record
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-10 rounded-xl flex items-center gap-2 transition"
          >
            Submit Video RFQ <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
