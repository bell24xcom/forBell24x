'use client';

import React, { useState, useCallback, useRef } from 'react';
import { UPLOAD_CONFIGS, validateFileType, formatFileSize } from '@/lib/cloudinary-client';

export interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
}

interface FileUploadProps {
  uploadType: keyof typeof UPLOAD_CONFIGS;
  maxFiles?: number;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onFilesChange?: (files: UploadedFile[]) => void;
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowMultiple?: boolean;
  existingFiles?: UploadedFile[];
}

export default function FileUpload({
  uploadType,
  maxFiles = 10,
  onUploadComplete,
  onFilesChange,
  acceptedFileTypes,
  className = '',
  disabled = false,
  showPreview = true,
  allowMultiple = true,
  existingFiles = [],
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = UPLOAD_CONFIGS[uploadType];

  // Generate preview for images and videos
  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise(resolve => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      } else {
        resolve('');
      }
    });
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (selectedFiles: File[]) => {
      if (disabled) return;

      const validFiles: UploadedFile[] = [];
      const totalFiles = files.length + selectedFiles.length;

      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      for (const file of selectedFiles) {
        if (!validateFileType(file, uploadType)) {
          alert(
            `Invalid file type or size for ${file.name}. Allowed: ${config.allowed_formats.join(
              ', '
            )} (max ${formatFileSize(config.max_file_size)})`
          );
          continue;
        }

        const preview = await generatePreview(file);

        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          uploadProgress: 0,
          status: 'pending',
        });
      }

      if (validFiles.length > 0) {
        const updatedFiles = allowMultiple ? [...files, ...validFiles] : validFiles;
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
      }
    },
    [files, uploadType, config, maxFiles, disabled, allowMultiple, onFilesChange, generatePreview]
  );

  // Handle drag events
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileSelect(droppedFiles);
    },
    [disabled, handleFileSelect]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      handleFileSelect(selectedFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect]
  );

  // Upload single file
  const uploadFile = useCallback(
    async (fileData: UploadedFile): Promise<void> => {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('uploadType', uploadType);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileData.id
                ? {
                    ...f,
                    status: 'success',
                    uploadProgress: 100,
                    cloudinaryUrl: result.url,
                    cloudinaryPublicId: result.public_id,
                  }
                : f
            )
          );
        } else {
          setFiles(prev =>
            prev.map(f =>
              f.id === fileData.id ? { ...f, status: 'error', error: result.error } : f
            )
          );
        }
      } catch (error) {
        setFiles(prev =>
          prev.map(f =>
            f.id === fileData.id ? { ...f, status: 'error', error: 'Upload failed' } : f
          )
        );
      }
    },
    [uploadType]
  );

  // Upload all files
  const uploadAllFiles = useCallback(async () => {
    setIsUploading(true);

    const pendingFiles = files.filter(f => f.status === 'pending');

    // Update status to uploading
    setFiles(prev => prev.map(f => (f.status === 'pending' ? { ...f, status: 'uploading' } : f)));

    // Upload files in parallel
    const uploadPromises = pendingFiles.map(fileData => uploadFile(fileData));

    try {
      await Promise.all(uploadPromises);
      onUploadComplete?.(files);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFile, onUploadComplete]);

  // Remove file
  const removeFile = useCallback(
    (fileId: string) => {
      const updatedFiles = files.filter(f => f.id !== fileId);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    },
    [files, onFilesChange]
  );

  // Retry upload for failed files
  const retryUpload = useCallback((fileId: string) => {
    setFiles(prev =>
      prev.map(f =>
        f.id === fileId ? { ...f, status: 'pending', error: undefined, uploadProgress: 0 } : f
      )
    );
  }, []);

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <span>🖼️</span>;
    if (file.type.startsWith('video/')) return <span>🎥</span>;
    if (file.type.includes('pdf')) return <span>📄</span>;
    return <span>📄</span>;
  };

  // Get status indicator
  const getStatusIndicator = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <span>✅</span>;
      case 'error':
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      case 'uploading':
        return <Loader2 className='h-5 w-5 text-blue-500 animate-spin' />;
      default:
        return <span>⬆️</span>;
    }
  };

  const hasPendingFiles = files.some(f => f.status === 'pending');
  const hasFiles = files.length > 0;

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type='file'
          multiple={allowMultiple}
          accept={
            acceptedFileTypes?.join(',') || config.allowed_formats.map(f => `.${f}`).join(',')
          }
          onChange={handleInputChange}
          className='hidden'
          disabled={disabled}
        />

        <div className='space-y-4'>
          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
            <span>⬆️</span>
          </div>

          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>
              {isDragOver ? 'Drop files here' : 'Upload Files'}
            </h3>
            <p className='text-gray-600 mb-2'>Drag & drop files here or click to browse</p>
            <p className='text-sm text-gray-500'>
              Supported: {config.allowed_formats.join(', ')} • Max size:{' '}
              {formatFileSize(config.max_file_size)}
              {maxFiles > 1 && ` • Up to ${maxFiles} files`}
            </p>
          </div>

          {!hasFiles && (
            <button
              type='button'
              disabled={disabled}
              className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition'
            >
              <span>➕</span>
              Choose Files
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      {hasFiles && (
        <div className='mt-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='text-lg font-semibold text-gray-800'>
              Selected Files ({files.length}/{maxFiles})
            </h4>
            {hasPendingFiles && (
              <button
                onClick={uploadAllFiles}
                disabled={isUploading || disabled}
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition'
              >
                {isUploading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span>⬆️</span>
                    Upload All
                  </>
                )}
              </button>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4'>
            {files.map(fileData => (
              <div
                key={fileData.id}
                className='flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition'
              >
                {/* File Preview/Icon */}
                <div className='flex-shrink-0'>
                  {showPreview && fileData.preview ? (
                    <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100'>
                      <img
                        src={fileData.preview}
                        alt={fileData.file.name}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ) : (
                    <div className='w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center'>
                      {getFileIcon(fileData.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2 mb-1'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {fileData.file.name}
                    </p>
                    {getStatusIndicator(fileData.status)}
                  </div>

                  <p className='text-sm text-gray-500 mb-2'>{formatFileSize(fileData.file.size)}</p>

                  {/* Progress Bar */}
                  {fileData.status === 'uploading' && (
                    <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${fileData.uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {fileData.status === 'error' && fileData.error && (
                    <p className='text-sm text-red-600 mb-2'>{fileData.error}</p>
                  )}

                  {/* Success URL */}
                  {fileData.status === 'success' && fileData.cloudinaryUrl && (
                    <div className='flex items-center space-x-2'>
                      <a
                        href={fileData.cloudinaryUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center text-sm text-blue-600 hover:text-blue-700'
                      >
                        <span>👁️</span>
                        View
                      </a>
                      <a
                        href={fileData.cloudinaryUrl}
                        download
                        className='inline-flex items-center text-sm text-green-600 hover:text-green-700'
                      >
                        <span>⬇️</span>
                        Download
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className='flex items-center space-x-2'>
                  {fileData.status === 'error' && (
                    <button
                      onClick={() => retryUpload(fileData.id)}
                      className='p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition'
                      title='Retry upload'
                    >
                      <span>🔄</span>
                    </button>
                  )}

                  <button
                    onClick={() => removeFile(fileData.id)}
                    disabled={fileData.status === 'uploading'}
                    className='p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Remove file'
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
