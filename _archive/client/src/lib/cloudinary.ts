import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'bell24h',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Check if Cloudinary is configured
export function isCloudinaryConfigured(): boolean {
  return !!(
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME) &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Get missing Cloudinary environment variables
export function getMissingCloudinaryVars(): string[] {
  const missing: string[] = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    missing.push('CLOUDINARY_CLOUD_NAME');
  }
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
  return missing;
}

// File type configurations
export const UPLOAD_CONFIGS = {
  PRODUCT_IMAGES: {
    folder: 'bell24h/products',
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' },
      { format: 'webp' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 10 * 1024 * 1024, // 10MB
    resource_type: 'image' as const,
  },
  PRODUCT_VIDEOS: {
    folder: 'bell24h/products/videos',
    transformation: [
      { width: 1280, height: 720, crop: 'limit', quality: 'auto' },
      { format: 'mp4' },
    ],
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
    transformation: [
      { width: 1200, height: 900, crop: 'limit', quality: 'auto' },
      { format: 'pdf' },
    ],
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    max_file_size: 15 * 1024 * 1024, // 15MB
    resource_type: 'image' as const,
  },
  PROFILE_IMAGES: {
    folder: 'bell24h/profiles',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      { format: 'webp' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    max_file_size: 5 * 1024 * 1024, // 5MB
    resource_type: 'image' as const,
  },
  COMPANY_LOGOS: {
    folder: 'bell24h/logos',
    transformation: [
      { width: 300, height: 300, crop: 'limit', quality: 'auto', background: 'white' },
      { format: 'png' },
    ],
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

// Upload presets for different file types
export const UPLOAD_PRESETS = {
  PRODUCT_IMAGE: 'bell24h_product_images',
  PRODUCT_VIDEO: 'bell24h_product_videos',
  DOCUMENT: 'bell24h_documents',
  CERTIFICATE: 'bell24h_certificates',
  PROFILE: 'bell24h_profiles',
  LOGO: 'bell24h_logos',
  RFQ: 'bell24h_rfq_attachments',
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

// Generate secure upload signature
export const generateUploadSignature = (uploadConfig: any) => {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder: uploadConfig.folder,
    timestamp,
    upload_preset: uploadConfig.preset,
  };

  return {
    signature: cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!),
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  };
};

// Upload file to Cloudinary
export const uploadToCloudinary = async (
  file: Buffer | string,
  configKey: keyof typeof UPLOAD_CONFIGS,
  fileName?: string,
  userId?: string
): Promise<any> => {
  try {
    const config = UPLOAD_CONFIGS[configKey];

    const uploadOptions: any = {
      folder: `${config.folder}/${userId || 'anonymous'}`,
      resource_type: config.resource_type,
      public_id: fileName ? fileName.split('.')[0] : undefined,
      overwrite: true,
      invalidate: true,
      notification_url: `${process.env.NEXTAUTH_URL}/api/cloudinary/webhook`,
      tags: ['bell24h', configKey.toLowerCase(), userId || 'anonymous'],
    };

    // Add transformations for images and videos
    if ('transformation' in config && config.transformation) {
      uploadOptions.transformation = config.transformation;
    }

    const result = await cloudinary.uploader.upload(file as string, uploadOptions);

    return {
      success: true,
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: string = 'image'
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Generate thumbnails for videos
export const generateVideoThumbnail = (publicId: string): string => {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    transformation: [{ width: 300, height: 200, crop: 'fill' }, { quality: 'auto' }],
  });
};

// Get optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string => {
  return cloudinary.url(publicId, {
    transformation: [{ width, height, crop: 'limit', quality }, { format: 'auto' }],
  });
};

// Bulk upload handler
export const bulkUploadToCloudinary = async (
  files: Array<{ buffer: Buffer; fileName: string }>,
  configKey: keyof typeof UPLOAD_CONFIGS,
  userId?: string
): Promise<any[]> => {
  const uploadPromises = files.map(({ buffer, fileName }) =>
    uploadToCloudinary(buffer.toString('base64'), configKey, fileName, userId)
  );

  try {
    const results = await Promise.allSettled(uploadPromises);
    return results.map((result, index) => ({
      fileName: files[index].fileName,
      result:
        result.status === 'fulfilled' ? result.value : { success: false, error: 'Upload failed' },
    }));
  } catch (error) {
    console.error('Bulk upload error:', error);
    throw error;
  }
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// MIME type validation
export const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
};

export default cloudinary;
