'use client';

import { useState } from 'react';

export default function VoiceRFQPage() {
  const [audio, setAudio] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudio(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!audio) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('audio', audio);
    const res = await fetch('/api/voice/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setResult(data.text || data.message);
    setUploading(false);
  };

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Voice RFQ (Speech-to-Text)</h1>
      <input type="file" accept="audio/*" onChange={handleAudioChange} />
      <button
        className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg"
        onClick={handleUpload}
        disabled={!audio || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload & Transcribe'}
      </button>
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">{result}</div>
      )}
    </main>
  );
}
