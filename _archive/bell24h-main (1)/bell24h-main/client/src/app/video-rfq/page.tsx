'use client';

import { Info, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { Suspense, lazy, useState } from 'react';

// Lazy load heavy components to improve initial page load
const VideoPlayer = lazy(() => import('@/components/ui/VideoPlayer'));

interface VideoRFQData {
  title: string;
  description: string;
  category: string;
  budget: string;
  timeline: string;
  videoFile: File | null;
  videoUrl: string;
}

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className='flex items-center justify-center p-4'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600'></div>
  </div>
);

export default function VideoRFQPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<VideoRFQData>({
    title: '',
    description: '',
    category: '',
    budget: '',
    timeline: '',
    videoFile: null,
    videoUrl: '',
  });

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, videoFile: file }));
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = async () => {
    console.log('Submitting Video RFQ:', formData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/dashboard?tab=buying');
  };

  const categories = [
    'Electronics',
    'Machinery',
    'Chemicals',
    'Textiles',
    'Automotive',
    'Construction',
    'Healthcare',
    'Food & Beverage',
    'Other',
  ];

  return (
    <div className='min-h-screen bg-orange-50'>
      {/* Simplified Header - Reduced CSS complexity */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => router.back()}
                className='p-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <span>←</span>
              </button>
              <div>
                <h1 className='text-xl font-bold text-gray-900 flex items-center'>
                  <span>🎥</span>
                  Video RFQ Creation
                </h1>
                <p className='text-sm text-gray-500'>
                  Visual requirements for better understanding
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 text-sm text-gray-500'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <div className='w-8 h-0.5 bg-gray-200'></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {step === 1 && (
          <div className='space-y-8'>
            {/* Video Upload Section - Optimized */}
            <div className='bg-white rounded-xl shadow-lg p-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
                <span>📄</span>
                Upload Your Video
              </h2>

              {!videoPreview ? (
                <div className='border-2 border-dashed border-orange-300 rounded-xl p-12 text-center bg-orange-50'>
                  <div className='flex flex-col items-center'>
                    <div className='w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6'>
                      <span>📷</span>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                      Record or Upload Your Requirements
                    </h3>
                    <p className='text-gray-600 mb-6 max-w-md'>
                      Upload a video explaining your requirements, specifications, or examples. This
                      helps suppliers understand exactly what you need.
                    </p>
                    <input
                      type='file'
                      accept='video/*'
                      onChange={handleVideoUpload}
                      className='hidden'
                      id='video-upload'
                    />
                    <label
                      htmlFor='video-upload'
                      className='px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer font-medium flex items-center transition-colors'
                    >
                      <span>⬆️</span>
                      Select Video File
                    </label>
                    <p className='text-xs text-gray-500 mt-3'>Supports MP4, MOV, AVI (Max 100MB)</p>
                  </div>
                </div>
              ) : (
                <div className='space-y-6'>
                  {isUploading && (
                    <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-orange-800'>Uploading...</span>
                        <span className='text-sm text-orange-600'>{uploadProgress}%</span>
                      </div>
                      <div className='w-full bg-orange-200 rounded-full h-2'>
                        <div
                          className='bg-orange-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className='relative bg-black rounded-xl overflow-hidden'>
                    <Suspense fallback={<LoadingSpinner />}>
                      <video
                        src={videoPreview}
                        className='w-full h-80 object-contain'
                        controls
                        preload='metadata'
                      />
                    </Suspense>
                    <button
                      onClick={() => {
                        setVideoPreview('');
                        setFormData(prev => ({ ...prev, videoFile: null }));
                      }}
                      className='absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors'
                    >
                      <span>⬆️</span>
                    </button>
                  </div>

                  <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                    <div className='flex items-center'>
                      <span>✅</span>
                      <span className='text-green-800 font-medium'>
                        Video uploaded successfully!
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simplified Benefits Section - Reduced complexity */}
            <div className='bg-blue-50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                <Info className='h-5 w-5 mr-2 text-blue-600' />
                Why Use Video RFQs?
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-start space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium text-gray-900'>Higher Response Rates</div>
                    <div className='text-sm text-gray-600'>
                      73% more supplier responses than text-only RFQs
                    </div>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium text-gray-900'>Better Understanding</div>
                    <div className='text-sm text-gray-600'>
                      Visual context reduces miscommunication by 65%
                    </div>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium text-gray-900'>Faster Quotes</div>
                    <div className='text-sm text-gray-600'>Suppliers provide quotes 40% faster</div>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <span>✅</span>
                  <div>
                    <div className='font-medium text-gray-900'>Quality Matches</div>
                    <div className='text-sm text-gray-600'>
                      Improved supplier-requirement matching accuracy
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {videoPreview && (
              <div className='flex justify-end'>
                <button
                  onClick={() => setStep(2)}
                  className='px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium flex items-center transition-colors'
                >
                  Continue to Details
                  <span>←</span>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className='space-y-8'>
            {/* RFQ Details Form */}
            <div className='bg-white rounded-xl shadow-lg p-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>RFQ Details</h2>

              <div className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    RFQ Title *
                  </label>
                  <input
                    type='text'
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder='e.g., Custom Steel Components for Manufacturing'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                  >
                    <option value=''>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Written Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder='Additional text description to complement your video...'
                    rows={4}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Budget Range
                    </label>
                    <input
                      type='text'
                      value={formData.budget}
                      onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder='e.g., ₹50,000 - ₹2,00,000'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Timeline</label>
                    <input
                      type='text'
                      value={formData.timeline}
                      onChange={e => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                      placeholder='e.g., 30 days'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Video Preview</h3>
              <div className='bg-black rounded-lg overflow-hidden'>
                <Suspense fallback={<LoadingSpinner />}>
                  <video
                    src={videoPreview}
                    className='w-full h-48 object-contain'
                    controls
                    preload='metadata'
                  />
                </Suspense>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-between'>
              <button
                onClick={() => setStep(1)}
                className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors'
              >
                Back to Video
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title || !formData.category}
                className='px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center transition-colors'
              >
                <Send className='h-5 w-5 mr-2' />
                Submit Video RFQ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
