// Client-side Cloudinary utilities (no server-side imports)

// File type configurations
export const UPLOAD_CONFIGS = {
  PRODUCT_IMAGES: {
    folder: 'bell24h/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 10 * 1024 * 1024, // 10MB
    resource_type: 'image' as const,
  },
  PRODUCT_VIDEOS: {
    folder: 'bell24h/products/videos',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    max_file_size: 100 * 1024 * 1024, // 100MB
    resource_type: 'video' as const,
  },
  DOCUMENTS: {
    folder: 'bell24h/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    max_file_size: 25 * 1024 * 1024, // 25MB
    resource_type: 'raw' as const,
  },
  CERTIFICATES: {
    folder: 'bell24h/certificates',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    max_file_size: 15 * 1024 * 1024, // 15MB
    resource_type: 'image' as const,
  },
  PROFILE_IMAGES: {
    folder: 'bell24h/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 5 * 1024 * 1024, // 5MB
    resource_type: 'image' as const,
  },
  COMPANY_LOGOS: {
    folder: 'bell24h/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg'],
    max_file_size: 5 * 1024 * 1024, // 5MB
    resource_type: 'image' as const,
  },
  RFQ_ATTACHMENTS: {
    folder: 'bell24h/rfq',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xls', 'xlsx', 'dwg', 'step'],
    max_file_size: 50 * 1024 * 1024, // 50MB
    resource_type: 'auto' as const,
  },
};

// File type validation
export const validateFileType = (file: File, configKey: keyof typeof UPLOAD_CONFIGS): boolean => {
  const config = UPLOAD_CONFIGS[configKey];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (!fileExtension || !config.allowed_formats.includes(fileExtension)) {
    return false;
  }

  if (file.size > config.max_file_size) {
    return false;
  }

  return true;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get MIME type from file name
export const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
};

// Upload file via API route
export const uploadFileToAPI = async (
  file: File,
  uploadType: keyof typeof UPLOAD_CONFIGS,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadType', uploadType);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress?.(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
};

// Generate optimized image URL (client-side URL construction)
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'bell24h';
  let transformations = [];

  if (width || height) {
    transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_limit`);
  }

  transformations.push(`q_${quality}`);
  transformations.push('f_auto');

  const transformationString = transformations.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;
};

// Generate video thumbnail URL
export const generateVideoThumbnail = (publicId: string): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'bell24h';
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_300,c_fill,q_auto,f_jpg/${publicId}.jpg`;
};
