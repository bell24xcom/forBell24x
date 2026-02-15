import axios from 'axios';
import { logger } from '../../utils/logger';
import { s3Service } from '../storage/S3Service';

interface MediaUploadResponse {
  id: string;
  url: string;
}

export class MediaHandler {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async uploadMedia(mediaUrl: string, type: 'image' | 'video' | 'document' | 'audio'): Promise<string> {
    try {
      // Download media from URL
      const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      // Upload to S3
      const s3Key = `whatsapp-media/${type}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await s3Service.uploadFile(buffer, s3Key, {
        contentType: this.getContentType(type),
        public: true
      });

      // Get S3 URL
      const s3Url = await s3Service.getSignedUrl(s3Key);

      // Upload to WhatsApp
      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', type);
      formData.append('file', buffer, {
        filename: s3Key,
        contentType: this.getContentType(type)
      });

      const uploadResponse = await axios.post(
        `${this.baseUrl}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      logger.info('Media uploaded successfully', { type, s3Key });
      return uploadResponse.data.id;
    } catch (error) {
      logger.error('Error uploading media', { error, type });
      throw error;
    }
  }

  async downloadMedia(mediaId: string): Promise<Buffer> {
    try {
      // Get media URL from WhatsApp
      const response = await axios.get(
        `${this.baseUrl}/media/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const mediaUrl = response.data.url;

      // Download media
      const mediaResponse = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return Buffer.from(mediaResponse.data);
    } catch (error) {
      logger.error('Error downloading media', { error, mediaId });
      throw error;
    }
  }

  async deleteMedia(mediaId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/media/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      logger.info('Media deleted successfully', { mediaId });
    } catch (error) {
      logger.error('Error deleting media', { error, mediaId });
      throw error;
    }
  }

  private getContentType(type: 'image' | 'video' | 'document' | 'audio'): string {
    switch (type) {
      case 'image':
        return 'image/jpeg';
      case 'video':
        return 'video/mp4';
      case 'document':
        return 'application/pdf';
      case 'audio':
        return 'audio/mpeg';
      default:
        return 'application/octet-stream';
    }
  }

  async validateMedia(file: Buffer, type: 'image' | 'video' | 'document' | 'audio'): Promise<boolean> {
    try {
      // Check file size
      const maxSize = this.getMaxSize(type);
      if (file.length > maxSize) {
        throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
      }

      // Validate file format
      const isValid = await this.validateFileFormat(file, type);
      if (!isValid) {
        throw new Error(`Invalid file format for ${type}`);
      }

      return true;
    } catch (error) {
      logger.error('Error validating media', { error, type });
      return false;
    }
  }

  private getMaxSize(type: 'image' | 'video' | 'document' | 'audio'): number {
    switch (type) {
      case 'image':
        return 5 * 1024 * 1024; // 5MB
      case 'video':
        return 16 * 1024 * 1024; // 16MB
      case 'document':
        return 100 * 1024 * 1024; // 100MB
      case 'audio':
        return 16 * 1024 * 1024; // 16MB
      default:
        return 5 * 1024 * 1024; // 5MB
    }
  }

  private async validateFileFormat(file: Buffer, type: 'image' | 'video' | 'document' | 'audio'): Promise<boolean> {
    // Implement file format validation logic
    // This is a placeholder - you would need to implement actual file format validation
    return true;
  }

  async optimizeMedia(file: Buffer, type: 'image' | 'video' | 'document' | 'audio'): Promise<Buffer> {
    try {
      // Implement media optimization logic
      // This is a placeholder - you would need to implement actual media optimization
      return file;
    } catch (error) {
      logger.error('Error optimizing media', { error, type });
      throw error;
    }
  }
} 