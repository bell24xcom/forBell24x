import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bell24h/rfq-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
    transformation: [
      { width: 1280, height: 720, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  }
});

// Create multer upload middleware
export const videoUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 1 // Max number of files
  }
});

// Upload video with privacy masking
export async function uploadVideoWithPrivacy(
  videoFile: Express.Multer.File,
  privacyOptions: {
    maskBuyerDetails?: boolean;
    maskSensitiveInfo?: boolean;
  } = {}
) {
  try {
    // Upload to temporary folder first
    const tempUpload = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: 'video',
      folder: 'bell24h/temp',
      overwrite: true
    });

    // Apply privacy transformations if needed
    const transformations = [];
    
    if (privacyOptions.maskBuyerDetails) {
      transformations.push({
        overlay: {
          font_family: "Arial",
          font_size: 40,
          text: "Details Hidden"
        },
        color: "#FFFFFF",
        opacity: 80
      });
    }

    // Generate final video URL with transformations
    const finalVideo = await cloudinary.uploader.explicit(tempUpload.public_id, {
      type: 'upload',
      resource_type: 'video',
      eager: transformations,
      eager_async: true,
      notification_url: `${process.env.API_BASE_URL}/api/video-processing/webhook`
    });

    return {
      publicId: finalVideo.public_id,
      url: finalVideo.secure_url,
      duration: finalVideo.duration,
      format: finalVideo.format,
      bytes: finalVideo.bytes
    };

  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
}

// Delete video
export async function deleteVideo(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Error deleting video from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary;
