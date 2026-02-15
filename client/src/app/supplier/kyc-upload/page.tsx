'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KYCuploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: string}>({});
  const [error, setError] = useState('');

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/supplier/upload-kyc', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedFiles(prev => ({
          ...prev,
          [documentType]: data.url
        }));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, documentType);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, documentType);
    }
  };

  const documents = [
    { type: 'gst', name: 'GST Certificate', required: true },
    { type: 'pan', name: 'PAN Card', required: true },
    { type: 'aadhar', name: 'Aadhar Card', required: false },
    { type: 'bank', name: 'Bank Statement', required: false },
    { type: 'trade', name: 'Trade License', required: false },
    { type: 'iso', name: 'ISO Certificate', required: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification</h1>
            <p className="text-gray-600">Upload your business documents for verification</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.type}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-amber-400 transition-colors"
                onDrop={(e) => handleDrop(e, doc.type)}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg className="h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">{doc.name}</h3>
                    {doc.required && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Required
                      </span>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {uploadedFiles[doc.type] ? (
                        <span className="text-green-600">✓ Uploaded</span>
                      ) : (
                        'Drag and drop or click to upload'
                      )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      id={`file-${doc.type}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(e, doc.type)}
                    />
                    <label
                      htmlFor={`file-${doc.type}`}
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Back
            </button>
            <button
              onClick={() => router.push('/supplier/dashboard')}
              disabled={uploading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Continue to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
