'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Building2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { calculateTrafficPricing, getPricingDisplay } from '@/lib/traffic-pricing';

interface ProductUploadProps {
  onUploadComplete?: (productId: string) => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  uploaded: boolean;
  url?: string;
}

export default function ProductUpload({ onUploadComplete }: ProductUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pricingPreview, setPricingPreview] = useState<any>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Remove file
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // AI description generation
  const generateAIDescription = async () => {
    if (!brand || !name || !category) {
      alert('Please fill in brand, name, and category first');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, name, category }),
      });

      if (response.ok) {
        const data = await response.json();
        setDescription(data.description);
      }
    } catch (error) {
      console.error('Error generating AI description:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  // Calculate pricing preview
  const calculatePricing = () => {
    if (!basePrice || !category) return;

    const price = parseFloat(basePrice);
    const config = {
      basePrice: price,
      impressions: 100, // Sample data
      clicks: 10,
      conversions: 2,
      trafficTier: 'BRONZE' as const,
      category,
      msmeDiscount: true,
    };

    const pricing = calculateTrafficPricing(config);
    const display = getPricingDisplay(pricing);
    setPricingPreview({ ...pricing, display });
  };

  // Upload product
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !brand || !category || !basePrice || files.length === 0) {
      alert('Please fill in all required fields and upload at least one image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload images first
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('folder', 'products');

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedFiles.push(data.url);
          setUploadProgress(((i + 1) / files.length) * 50); // 50% for image uploads
        }
      }

      // Create product
      const productData = {
        name,
        brand,
        description,
        images: uploadedFiles,
        basePrice: parseFloat(basePrice),
        category,
        subcategory: '',
        specifications: {},
      };

      const productResponse = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (productResponse.ok) {
        const product = await productResponse.json();
        setUploadProgress(100);
        onUploadComplete?.(product.id);
        
        // Reset form
        setFiles([]);
        setName('');
        setBrand('');
        setDescription('');
        setCategory('');
        setBasePrice('');
        setPricingPreview(null);
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      alert('Failed to upload product. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Product</h2>
        <p className="text-gray-600">Showcase your products with AI-powered descriptions and traffic-based pricing</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-8">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Product Images (Max 5)
          </label>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop images here, or click to select files
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, WebP (Max 10MB each)
                </p>
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div key={file.id} className="relative group">
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Brand *
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter brand name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="steel">Steel</option>
              <option value="aluminum">Aluminum</option>
              <option value="copper">Copper</option>
              <option value="machinery">Machinery</option>
              <option value="electronics">Electronics</option>
              <option value="textiles">Textiles</option>
              <option value="chemicals">Chemicals</option>
              <option value="automotive">Automotive</option>
              <option value="construction">Construction</option>
              <option value="agriculture">Agriculture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Base Price (₹) *
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => {
                setBasePrice(e.target.value);
                if (e.target.value && category) {
                  calculatePricing();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter base price"
              required
            />
          </div>
        </div>

        {/* AI Description */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Product Description
            </label>
            <button
              type="button"
              onClick={generateAIDescription}
              disabled={aiGenerating || !brand || !name || !category}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {aiGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter product description or generate with AI..."
          />
        </div>

        {/* Traffic Pricing Preview */}
        {pricingPreview && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Traffic-Based Pricing Preview
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">Base Price</div>
                <div className="text-2xl font-bold text-gray-900">{pricingPreview.display.basePrice}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">Traffic Price</div>
                <div className="text-2xl font-bold text-blue-600">{pricingPreview.display.trafficPrice}</div>
                <div className="text-sm text-green-600">+{pricingPreview.display.trafficMultiplier}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="text-sm text-gray-600">MSME Price</div>
                <div className="text-2xl font-bold text-purple-600">{pricingPreview.display.msmePrice}</div>
                <div className="text-sm text-purple-600">-15% discount</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">CPM:</span> {pricingPreview.display.cpm}
              </div>
              <div>
                <span className="text-gray-600">Conversion:</span> {pricingPreview.display.conversionRate}
              </div>
              <div>
                <span className="text-gray-600">Traffic Boost:</span> {pricingPreview.display.trafficMultiplier}
              </div>
              <div>
                <span className="text-gray-600">Tier Boost:</span> {pricingPreview.display.tierMultiplier}
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">Uploading product...</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-blue-600 mt-1">{uploadProgress.toFixed(0)}% complete</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !name || !brand || !category || !basePrice || files.length === 0}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}
