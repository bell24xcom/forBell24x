'use client';

import { Upload, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ProductDisplayProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setUploading(true);

      // Simulate file upload to Cloudinary
      const uploadPromises = acceptedFiles.map(file => {
        return new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () => {
            // Simulate upload delay
            setTimeout(() => {
              resolve(reader.result as string);
            }, 1000);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(uploadPromises).then(uploadedUrls => {
        const newImages = [...images, ...uploadedUrls].slice(0, maxImages);
        onImagesChange(newImages);
        setUploading(false);
      });
    },
    [images, onImagesChange, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages || uploading,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Product Images</h3>
        <span className='text-sm text-gray-500'>
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {images.map((image, index) => (
          <div key={index} className='relative group'>
            <img
              src={image}
              alt={`Product ${index + 1}`}
              className='w-full h-32 object-cover rounded-lg border-2 border-gray-200'
            />
            <button
              onClick={() => removeImage(index)}
              className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Upload Area */}
        {images.length < maxImages && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className='mx-auto h-8 w-8 text-gray-400 mb-2' />
            {uploading ? (
              <p className='text-sm text-gray-500'>Uploading...</p>
            ) : (
              <div>
                <p className='text-sm text-gray-600'>
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className='text-xs text-gray-400 mt-1'>or click to select</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className='flex items-center space-x-2 text-sm text-gray-600'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
          <span>Processing images...</span>
        </div>
      )}

      {/* Help Text */}
      <div className='text-xs text-gray-500'>
        <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 5MB per image</p>
        <p>• Recommended size: 800x600 pixels or larger</p>
      </div>
    </div>
  );
};

export default ProductDisplay;
