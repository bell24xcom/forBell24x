'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Tag } from 'lucide-react';

interface FileUpload {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface ProductForm {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  basePrice: string;
  minOrderQty: string;
  unit: string;
  specifications: string;
  tags: string[];
  images: FileUpload[];
  videos: FileUpload[];
  documents: FileUpload[];
}

export default function ProductManagement() {
  const { data: session, status } = () => ({ data: { user: { id: "user", email: "user@company.com", name: "Business User" } }, status: "authenticated" });
  const [activeTab, setActiveTab] = useState('add');
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    basePrice: '',
    minOrderQty: '',
    unit: 'pieces',
    specifications: '',
    tags: [],
    images: [],
    videos: [],
    documents: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Removed status loading check since mock auth always returns 'authenticated'

  if (!session) {
    redirect('/login');
  }

  const handleFileUpload = async (files: FileList, type: 'images' | 'videos' | 'documents') => {
    setUploading(true);

    // Simulate file upload
    for (let file of Array.from(files)) {
      const fileUrl = URL.createObjectURL(file);
      setProductForm(prev => ({
        ...prev,
        [type]: [
          ...prev[type],
          {
            name: file.name,
            url: fileUrl,
            size: file.size,
            type: file.type,
          },
        ],
      }));
    }

    setUploading(false);
  };

  const removeFile = (index: number, type: 'images' | 'videos' | 'documents') => {
    setProductForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <h1 className='text-2xl font-bold text-gray-900'>Product Management</h1>
            <div className='flex space-x-4'>
              <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'>
                <span>👁️</span>
                <span>Preview</span>
              </button>
              <button className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'>
                <span>💾</span>
                <span>Save Product</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Product Form */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6'>Product Details</h3>

              <div className='space-y-6'>
                {/* Basic Information */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Product Name
                    </label>
                    <input
                      type='text'
                      value={productForm.name}
                      onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='e.g., Industrial Steel Pipes Grade 316L'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
                    <select
                      value={productForm.category}
                      onChange={e =>
                        setProductForm(prev => ({ ...prev, category: e.target.value }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value=''>Select Category</option>
                      <option value='chemicals'>Chemicals & Materials</option>
                      <option value='automotive'>Automotive & Transportation</option>
                      <option value='electronics'>Electronics & Technology</option>
                      <option value='machinery'>Machinery & Equipment</option>
                      <option value='textiles'>Textiles & Apparel</option>
                      <option value='food'>Food & Agriculture</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={e =>
                      setProductForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Detailed product description, features, and benefits...'
                  />
                </div>

                {/* Pricing & Quantity */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Base Price
                    </label>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                        ₹
                      </span>
                      <input
                        type='text'
                        value={productForm.basePrice}
                        onChange={e =>
                          setProductForm(prev => ({ ...prev, basePrice: e.target.value }))
                        }
                        className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='1,000'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Min Order Qty
                    </label>
                    <input
                      type='text'
                      value={productForm.minOrderQty}
                      onChange={e =>
                        setProductForm(prev => ({ ...prev, minOrderQty: e.target.value }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='100'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Unit</label>
                    <select
                      value={productForm.unit}
                      onChange={e => setProductForm(prev => ({ ...prev, unit: e.target.value }))}
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='pieces'>Pieces</option>
                      <option value='kg'>Kilograms</option>
                      <option value='tons'>Tons</option>
                      <option value='meters'>Meters</option>
                      <option value='liters'>Liters</option>
                      <option value='boxes'>Boxes</option>
                    </select>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Technical Specifications
                  </label>
                  <textarea
                    value={productForm.specifications}
                    onChange={e =>
                      setProductForm(prev => ({ ...prev, specifications: e.target.value }))
                    }
                    rows={3}
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Material: Stainless Steel 316L, Diameter: 50mm, Length: 6m, Wall Thickness: 3mm...'
                  />
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-6'>Product Media</h3>

              {/* Image Upload */}
              <div className='mb-8'>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Product Images
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFileUpload(e.dataTransfer.files, 'images');
                  }}
                >
                  <span>📄</span>
                  <p className='text-gray-600 mb-2'>Drag and drop images here, or</p>
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={e => e.target.files && handleFileUpload(e.target.files, 'images')}
                    className='hidden'
                    id='image-upload'
                  />
                  <label
                    htmlFor='image-upload'
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors'
                  >
                    Choose Images
                  </label>
                  <p className='text-xs text-gray-500 mt-2'>PNG, JPG, WEBP up to 10MB each</p>
                </div>

                {/* Image Preview */}
                {productForm.images.length > 0 && (
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                    {productForm.images.map((image, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className='w-full h-24 object-cover rounded-lg border border-gray-200'
                        />
                        <button
                          onClick={() => removeFile(index, 'images')}
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <span>❌</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className='mb-8'>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Product Videos
                </label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <span>🎥</span>
                  <p className='text-gray-600 mb-2'>Upload product demonstration videos</p>
                  <input
                    type='file'
                    multiple
                    accept='video/*'
                    onChange={e => e.target.files && handleFileUpload(e.target.files, 'videos')}
                    className='hidden'
                    id='video-upload'
                  />
                  <label
                    htmlFor='video-upload'
                    className='bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition-colors'
                  >
                    Choose Videos
                  </label>
                  <p className='text-xs text-gray-500 mt-2'>MP4, AVI, MOV up to 100MB each</p>
                </div>

                {/* Video Preview */}
                {productForm.videos.length > 0 && (
                  <div className='space-y-3 mt-4'>
                    {productForm.videos.map((video, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <span>🎥</span>
                          <span className='text-sm font-medium'>{video.name}</span>
                          <span className='text-xs text-gray-500'>
                            ({(video.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index, 'videos')}
                          className='text-red-600 hover:text-red-800 transition-colors'
                        >
                          <span>❌</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Catalogs & Certificates
                </label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                  <span>📄</span>
                  <p className='text-gray-600 mb-2'>
                    Upload product catalogs, certificates, and documentation
                  </p>
                  <input
                    type='file'
                    multiple
                    accept='.pdf,.doc,.docx,.xls,.xlsx'
                    onChange={e => e.target.files && handleFileUpload(e.target.files, 'documents')}
                    className='hidden'
                    id='document-upload'
                  />
                  <label
                    htmlFor='document-upload'
                    className='bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700 transition-colors'
                  >
                    Choose Documents
                  </label>
                  <p className='text-xs text-gray-500 mt-2'>PDF, DOC, XLS up to 25MB each</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Preview & Tips */}
          <div className='space-y-6'>
            {/* Product Preview */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-4'>Preview</h4>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <div className='w-full h-32 bg-gray-100 flex items-center justify-center'>
                  {productForm.images.length > 0 ? (
                    <img
                      src={productForm.images[0].url}
                      alt='Preview'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>
                <div className='p-4'>
                  <h5 className='font-semibold text-gray-900 mb-1'>
                    {productForm.name || 'Product Name'}
                  </h5>
                  <p className='text-sm text-gray-600 mb-2'>{productForm.category || 'Category'}</p>
                  <div className='flex justify-between items-center'>
                    <span className='font-bold text-green-600'>
                      {productForm.basePrice ? `₹${productForm.basePrice}` : 'Price not set'}
                    </span>
                    <span className='text-xs text-gray-500'>{productForm.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className='bg-blue-50 rounded-xl border border-blue-200 p-6'>
              <h4 className='text-lg font-semibold text-blue-900 mb-4'>
                Tips for Better Visibility
              </h4>
              <div className='space-y-3 text-sm'>
                <div className='flex items-start space-x-2'>
                  <span>⭐</span>
                  <span className='text-blue-800'>
                    Add high-quality images from multiple angles
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span>🎥</span>
                  <span className='text-blue-800'>
                    Include demonstration videos to increase engagement
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <Tag className='w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0' />
                  <span className='text-blue-800'>
                    Use relevant keywords in product name and description
                  </span>
                </div>
                <div className='flex items-start space-x-2'>
                  <span>📈</span>
                  <span className='text-blue-800'>Competitive pricing increases inquiry rates</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
              <h4 className='text-lg font-semibold text-gray-900 mb-4'>Expected Performance</h4>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Estimated Views/Month</span>
                  <span className='font-semibold text-gray-900'>500-800</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Expected Inquiries</span>
                  <span className='font-semibold text-gray-900'>25-40</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Conversion Rate</span>
                  <span className='font-semibold text-gray-900'>5-8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
