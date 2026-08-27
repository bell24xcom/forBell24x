'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AiSparkle from '@/components/ui/AiSparkle';

const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

type Category = {
  id: number;
  name: string;
  slug: string;
};

// /api/rfq/create's Zod schema requires the uppercase enum values below —
// the UI's lowercase select values (including 'critical', which has no
// matching enum member) must be mapped before submission or every request
// 400s regardless of what else is filled in.
const URGENCY_MAP: Record<string, 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'> = {
  low: 'LOW',
  normal: 'NORMAL',
  high: 'HIGH',
  critical: 'URGENT',
};

export default function CreateRFQPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    unit: '',
    minBudget: '',
    maxBudget: '',
    timeline: '',
    location: '',
    requirements: '',
    urgency: 'normal'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Video upload state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPublicId, setVideoPublicId] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoError, setVideoError] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Fetch categories from API on component mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories?level=1', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { id: 1, name: 'Textiles & Garments', slug: 'textiles-garments' },
          { id: 2, name: 'Pharmaceuticals', slug: 'pharmaceuticals' },
          { id: 3, name: 'Agricultural Products', slug: 'agricultural-products' },
          { id: 4, name: 'Automotive Parts', slug: 'automotive-parts' },
          { id: 5, name: 'IT Services', slug: 'it-services' },
        ]);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideoError('');
    setVideoUrl('');
    setVideoPublicId('');
    setVideoFile(null);
    if (!file) return;
    if (file.type !== 'video/mp4') {
      setVideoError('Only MP4 files are supported.');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      setVideoError('Video must be 50MB or smaller.');
      return;
    }
    setVideoFile(file);
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;
    setVideoUploading(true);
    setVideoError('');
    setVideoUploadProgress(0);
    try {
      // Step 1: get signed upload credentials
      const sigRes = await fetch('/api/cloudinary/upload-signature', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: 'video' }),
      });
      if (!sigRes.ok) {
        const sigData = await sigRes.json().catch(() => ({}));
        if (sigRes.status === 401) {
          setVideoError('Please log in to upload a video.');
        } else {
          setVideoError(sigData.error || 'Video upload is not available. Your requirement will be saved without a video.');
        }
        setVideoUploading(false);
        return;
      }
      const { signature, timestamp, apiKey, cloudName, folder, uploadUrl } = await sigRes.json();

      // Step 2: upload directly to Cloudinary
      const body = new FormData();
      body.append('file', videoFile);
      body.append('api_key', apiKey);
      body.append('timestamp', String(timestamp));
      body.append('signature', signature);
      body.append('folder', folder);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable) setVideoUploadProgress(Math.round((ev.loaded / ev.total) * 100));
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText);
            setVideoUrl(result.secure_url);
            setVideoPublicId(result.public_id);
            setVideoUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.open('POST', uploadUrl);
        xhr.send(body);
      });
    } catch (err: any) {
      setVideoError(err.message || 'Upload failed. Please try again.');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoUrl('');
    setVideoPublicId('');
    setVideoUploadProgress(0);
    setVideoError('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Save to Neon (Core Platform)
      // minBudget/maxBudget must be numbers (schema: z.number()) and urgency
      // must match the uppercase enum — the raw formData values are strings
      // and lowercase respectively, which 400 every time otherwise.
      const payload: Record<string, unknown> = {
        ...formData,
        minBudget: formData.minBudget ? Number(formData.minBudget) : undefined,
        maxBudget: formData.maxBudget ? Number(formData.maxBudget) : undefined,
        urgency: URGENCY_MAP[formData.urgency] || 'NORMAL',
      };
      if (videoUrl) {
        payload.videoUrl = videoUrl;
        payload.videoPublicId = videoPublicId;
      }
      const neonRes = await fetch('/api/rfq/create', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!neonRes.ok) {
        const data = await neonRes.json();
        throw new Error(data.error || 'Failed to save to core database');
      }

      // 2. ALSO save to InsForge (Marketing Engine) - Async Fire & Forget style
      fetch('/api/marketing/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(err => console.error('[InsForge-Sync] Failed:', err));

      setSuccess(true);
      setTimeout(() => {
        router.push('/rfq');
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">RFQ Created Successfully!</h2>
            <p className="text-slate-300 mb-2">Your request for quotation has been submitted.</p>
            <p className="text-sm text-slate-500">Redirecting to RFQ dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Create Request for Quotation
          </h1>
          <p className="text-lg text-slate-300">
            Describe what you need and get quotes from verified suppliers
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-300">
                  RFQ Title *
                </label>
                <AiSparkle
                  fieldName="RFQ Title"
                  currentValue={formData.title || formData.description || ''}
                  context={formData.category}
                  onSuggestion={(text) => setFormData(prev => ({ ...prev, title: text }))}
                />
              </div>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g., Need 1000 units of LED bulbs"
              />
            </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Product/Service Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                    Product/Service Description *
                  </label>
                  <AiSparkle
                    fieldName="RFQ Description"
                    currentValue={formData.description || formData.title}
                    context={formData.category}
                    onSuggestion={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  />
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Describe the product or service you need in detail..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
                    Quantity *
                  </label>
                  <input 
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-slate-300 mb-2">
                    Unit *
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select Unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                    <option value="hours">Hours</option>
                    <option value="units">Units</option>
                    <option value="boxes">Boxes</option>
                    <option value="pairs">Pairs</option>
                    <option value="sets">Sets</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Budget Range (INR) *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      id="minBudget"
                      name="minBudget"
                      type="number"
                      required
                      value={formData.minBudget}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Minimum"
                      min="0"
                    />
                    <label className="text-xs text-slate-400 mt-1">Minimum Budget</label>
                  </div>
                  <div>
                    <input 
                      id="maxBudget"
                      name="maxBudget"
                      type="number"
                      required
                      value={formData.maxBudget}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Maximum"
                      min="0"
                    />
                    <label className="text-xs text-slate-400 mt-1">Maximum Budget</label>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-2">
                  Delivery Location *
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeline" className="block text-sm font-medium text-slate-300 mb-2">
                    Delivery Timeline *
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    required
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Select Timeline</option>
                    <option value="1-week">Within 1 week</option>
                    <option value="2-weeks">Within 2 weeks</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="2-months">Within 2 months</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-slate-300 mb-2">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="low">Low - No rush</option>
                    <option value="normal">Normal - Standard timeline</option>
                    <option value="high">High - Urgent</option>
                    <option value="critical">Critical - ASAP</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Any specific requirements, certifications, quality standards, or preferences..."
                />
              </div>

              {/* Video Requirement Upload — shown only when NEXT_PUBLIC_VIDEO_RFQ_ENABLED=true */}
              {process.env.NEXT_PUBLIC_VIDEO_RFQ_ENABLED === 'true' && <div className="border border-slate-700 rounded-xl p-5 bg-slate-900/40">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <label className="text-sm font-medium text-slate-300">Video Requirement <span className="text-slate-500 font-normal">(optional)</span></label>
                </div>
                <p className="text-xs text-slate-500 mb-4">Upload an MP4 video showing your requirement. Suppliers will watch before quoting. Max 50MB.</p>

                {videoUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-green-300 text-sm font-medium">Video uploaded</p>
                        <p className="text-green-400/70 text-xs truncate">{videoFile?.name}</p>
                      </div>
                      <button type="button" onClick={handleRemoveVideo} className="text-slate-400 hover:text-red-400 transition-colors text-xs">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4"
                        onChange={handleVideoSelect}
                        className="hidden"
                        id="video-upload-input"
                      />
                      <label
                        htmlFor="video-upload-input"
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-600 hover:border-purple-500 text-slate-300 hover:text-purple-300 rounded-lg text-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {videoFile ? videoFile.name : 'Choose MP4 file'}
                      </label>
                      {videoFile && !videoUploading && (
                        <button
                          type="button"
                          onClick={handleVideoUpload}
                          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Upload Video
                        </button>
                      )}
                    </div>

                    {videoUploading && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Uploading…</span>
                          <span>{videoUploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${videoUploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {videoError && (
                      <p className="text-red-400 text-xs">{videoError}</p>
                    )}
                  </div>
                )}
              </div>}

            <div className="space-y-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating RFQ...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Submit RFQ
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
