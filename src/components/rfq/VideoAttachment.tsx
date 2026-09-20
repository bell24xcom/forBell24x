'use client';

/**
 * Video RFQ attachment — capture/upload/preview/play/delete/replace.
 * Marketplace Certification Sprint, Part D: UI only, no AI. Uploads
 * directly to Cloudinary via the existing signed-upload endpoint
 * (/api/cloudinary/upload-signature), then records the resulting URL
 * against the RFQ via /api/rfq/[id]/video — never touches Groq, never
 * transcribes, never extracts.
 */

import { useEffect, useRef, useState } from 'react';
import { Video, Upload, Play, Trash2, RotateCcw, Loader2, CheckCircle } from 'lucide-react';

interface VideoAttachmentProps {
  rfqId: string;
  initialVideoUrl?: string | null;
  /** Called after a successful attach/replace/delete so the parent can refresh rfq state. */
  onChange?: (videoUrl: string | null) => void;
}

type Step = 'idle' | 'recording' | 'preview' | 'uploading' | 'attached';

export function VideoAttachment({ rfqId, initialVideoUrl, onChange }: VideoAttachmentProps) {
  const [step, setStep] = useState<Step>(initialVideoUrl ? 'attached' : 'idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl ?? null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setVideoUrl(initialVideoUrl ?? null);
    setStep(initialVideoUrl ? 'attached' : 'idle');
  }, [initialVideoUrl]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  async function startRecording() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setLocalPreviewUrl(URL.createObjectURL(blob));
        setStep('preview');
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
      setStep('recording');
    } catch {
      setError('Camera/microphone access denied. You can upload a video file instead.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function handleFilePicked(file: File) {
    setRecordedBlob(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setStep('preview');
  }

  function resetToIdle() {
    setRecordedBlob(null);
    setLocalPreviewUrl(null);
    setStep('idle');
    setError('');
  }

  async function uploadAndAttach() {
    if (!recordedBlob) return;
    setStep('uploading');
    setUploadProgress(5);
    setError('');
    try {
      const sigRes = await fetch('/api/cloudinary/upload-signature', {
        method: 'POST',
        credentials: 'include',
      });
      const sig = await sigRes.json();
      if (!sig.success) throw new Error(sig.error || 'Could not get upload credentials');

      const form = new FormData();
      form.append('file', recordedBlob, 'rfq-video.webm');
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('signature', sig.signature);
      form.append('upload_preset', sig.uploadPreset);
      form.append('folder', sig.folder);

      setUploadProgress(20);
      const uploadRes = await fetch(sig.uploadUrl, { method: 'POST', body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData?.error?.message || 'Upload to Cloudinary failed');

      setUploadProgress(85);
      const attachRes = await fetch(`/api/rfq/${rfqId}/video`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: uploadData.secure_url, videoPublicId: uploadData.public_id }),
      });
      const attachData = await attachRes.json();
      if (!attachData.success) throw new Error(attachData.error || 'Could not save video to your RFQ');

      setUploadProgress(100);
      setVideoUrl(attachData.rfq.videoUrl);
      setStep('attached');
      onChange?.(attachData.rfq.videoUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      setStep('preview');
    }
  }

  async function deleteVideo() {
    setError('');
    try {
      const res = await fetch(`/api/rfq/${rfqId}/video`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Could not remove video');
      setVideoUrl(null);
      setStep('idle');
      onChange?.(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Remove failed');
    }
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
        <Video className="w-4 h-4 text-purple-400" /> Requirement video
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {step === 'idle' && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startRecording}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5" /> Record video
          </button>
          <label className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Upload video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFilePicked(e.target.files[0])}
            />
          </label>
        </div>
      )}

      {(step === 'recording' || step === 'preview') && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-md">
            <video
              ref={videoRef}
              autoPlay
              muted={step === 'recording'}
              controls={step === 'preview'}
              src={step === 'preview' ? localPreviewUrl ?? undefined : undefined}
              className="w-full h-full object-contain"
            />
          </div>
          {step === 'recording' ? (
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-700 hover:bg-red-600 text-white"
            >
              Stop recording
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetToIdle}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-record
              </button>
              <button
                type="button"
                onClick={uploadAndAttach}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Attach to RFQ
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'uploading' && (
        <div className="flex items-center gap-3 text-slate-300 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" /> Uploading… {uploadProgress}%
        </div>
      )}

      {step === 'attached' && videoUrl && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-w-md">
            <video src={videoUrl} controls className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetToIdle}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replace video
            </button>
            <button
              type="button"
              onClick={deleteVideo}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-800 hover:bg-red-700 text-white flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
