import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface FileVersion {
  id: string;
  version: number;
  filename: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  checksum: string;
  metadata: Record<string, any>;
}

export interface FileAnnotation {
  id: string;
  fileId: string;
  userId: string;
  type: 'comment' | 'highlight' | 'drawing' | 'text';
  content: string;
  position?: { x: number; y: number; width?: number; height?: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkUploadResult {
  success: FileVersion[];
  failed: Array<{ filename: string; error: string }>;
  total: number;
  processed: number;
}

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  category: string;
  isPublic: boolean;
  versions: FileVersion[];
  annotations: FileAnnotation[];
  permissions: {
    read: string[];
    write: string[];
    delete: string[];
  };
}

class AdvancedFileManagementService {
  private s3Client: S3Client;
  private bucketName: string;
  private versionControl: Map<string, FileVersion[]> = new Map();
  private annotations: Map<string, FileAnnotation[]> = new Map();

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET || 'bell24h-files';
  }

  // Bulk Upload with Progress Tracking
  async bulkUpload(
    files: File[],
    userId: string,
    category: string = 'general',
    tags: string[] = [],
    onProgress?: (progress: number) => void
  ): Promise<BulkUploadResult> {
    const results: BulkUploadResult = {
      success: [],
      failed: [],
      total: files.length,
      processed: 0,
    };

    const uploadPromises = files.map(async (file, index) => {
      try {
        const fileVersion = await this.uploadFile(file, userId, category, tags);
        results.success.push(fileVersion);

        if (onProgress) {
          results.processed++;
          onProgress((results.processed / results.total) * 100);
        }

        return fileVersion;
      } catch (error) {
        results.failed.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (onProgress) {
          results.processed++;
          onProgress((results.processed / results.total) * 100);
        }
      }
    });

    await Promise.all(uploadPromises);
    return results;
  }

  // Single File Upload with Version Control
  async uploadFile(
    file: File,
    userId: string,
    category: string = 'general',
    tags: string[] = []
  ): Promise<FileVersion> {
    const fileId = this.generateFileId();
    const version = await this.getNextVersion(fileId);
    const checksum = await this.calculateChecksum(file);

    const key = `${category}/${fileId}/v${version}/${file.name}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: file.type,
      Metadata: {
        userId,
        category,
        tags: tags.join(','),
        checksum,
        version: version.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(uploadCommand);

    const fileVersion: FileVersion = {
      id: fileId,
      version,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: userId,
      checksum,
      metadata: {
        category,
        tags,
        mimeType: file.type,
      },
    };

    // Store version in memory (in production, use database)
    if (!this.versionControl.has(fileId)) {
      this.versionControl.set(fileId, []);
    }
    this.versionControl.get(fileId)!.push(fileVersion);

    return fileVersion;
  }

  // Version Control Methods
  async getFileVersions(fileId: string): Promise<FileVersion[]> {
    return this.versionControl.get(fileId) || [];
  }

  async getFileVersion(fileId: string, version: number): Promise<FileVersion | null> {
    const versions = await this.getFileVersions(fileId);
    return versions.find(v => v.version === version) || null;
  }

  async rollbackToVersion(fileId: string, version: number, userId: string): Promise<FileVersion> {
    const targetVersion = await this.getFileVersion(fileId, version);
    if (!targetVersion) {
      throw new Error(`Version ${version} not found for file ${fileId}`);
    }

    // Create a new version based on the target version
    const newVersion = await this.getNextVersion(fileId);
    const key = `${targetVersion.metadata.category}/${fileId}/v${newVersion}/${targetVersion.filename}`;
    const sourceKey = `${targetVersion.metadata.category}/${fileId}/v${version}/${targetVersion.filename}`;

    // Use CopyObjectCommand for S3 copy
    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: key,
      Metadata: {
        userId,
        category: targetVersion.metadata.category,
        tags: targetVersion.metadata.tags.join(','),
        checksum: targetVersion.checksum,
        version: newVersion.toString(),
        uploadedAt: new Date().toISOString(),
        rolledBackFrom: version.toString(),
      },
      MetadataDirective: 'REPLACE',
    });

    await this.s3Client.send(copyCommand);

    const rolledBackVersion: FileVersion = {
      ...targetVersion,
      version: newVersion,
      uploadedAt: new Date(),
      uploadedBy: userId,
      metadata: {
        ...targetVersion.metadata,
        rolledBackFrom: version,
      },
    };

    this.versionControl.get(fileId)!.push(rolledBackVersion);
    return rolledBackVersion;
  }

  // File Annotations
  async addAnnotation(
    fileId: string,
    userId: string,
    type: FileAnnotation['type'],
    content: string,
    position?: FileAnnotation['position']
  ): Promise<FileAnnotation> {
    const annotation: FileAnnotation = {
      id: this.generateAnnotationId(),
      fileId,
      userId,
      type,
      content,
      position,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.annotations.has(fileId)) {
      this.annotations.set(fileId, []);
    }
    this.annotations.get(fileId)!.push(annotation);

    return annotation;
  }

  async getAnnotations(fileId: string): Promise<FileAnnotation[]> {
    return this.annotations.get(fileId) || [];
  }

  async updateAnnotation(
    annotationId: string,
    fileId: string,
    updates: Partial<Pick<FileAnnotation, 'content' | 'position'>>
  ): Promise<FileAnnotation | null> {
    const annotations = this.annotations.get(fileId);
    if (!annotations) return null;

    const annotationIndex = annotations.findIndex(a => a.id === annotationId);
    if (annotationIndex === -1) return null;

    annotations[annotationIndex] = {
      ...annotations[annotationIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return annotations[annotationIndex];
  }

  async deleteAnnotation(annotationId: string, fileId: string): Promise<boolean> {
    const annotations = this.annotations.get(fileId);
    if (!annotations) return false;

    const initialLength = annotations.length;
    const filteredAnnotations = annotations.filter(a => a.id !== annotationId);

    if (filteredAnnotations.length === initialLength) return false;

    this.annotations.set(fileId, filteredAnnotations);
    return true;
  }

  // File Management
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const versions = await this.getFileVersions(fileId);
    if (versions.length === 0) return null;

    const latestVersion = versions[versions.length - 1];
    const annotations = await this.getAnnotations(fileId);

    return {
      id: fileId,
      filename: latestVersion.filename,
      originalName: latestVersion.filename,
      mimeType: latestVersion.metadata.mimeType,
      size: latestVersion.size,
      checksum: latestVersion.checksum,
      uploadedBy: latestVersion.uploadedBy,
      uploadedAt: latestVersion.uploadedAt,
      tags: latestVersion.metadata.tags,
      category: latestVersion.metadata.category,
      isPublic: false, // Default to private
      versions,
      annotations,
      permissions: {
        read: [latestVersion.uploadedBy],
        write: [latestVersion.uploadedBy],
        delete: [latestVersion.uploadedBy],
      },
    };
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const metadata = await this.getFileMetadata(fileId);
    if (!metadata) return false;

    // Check permissions
    if (!metadata.permissions.delete.includes(userId)) {
      throw new Error('Insufficient permissions to delete file');
    }

    // Delete all versions from S3
    const versions = await this.getFileVersions(fileId);
    const deletePromises = versions.map(async version => {
      const key = `${version.metadata.category}/${fileId}/v${version.version}/${version.filename}`;
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return this.s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);

    // Clean up local data
    this.versionControl.delete(fileId);
    this.annotations.delete(fileId);

    return true;
  }

  async getSignedDownloadUrl(fileId: string, version?: number): Promise<string> {
    const versions = await this.getFileVersions(fileId);
    if (versions.length === 0) {
      throw new Error('File not found');
    }

    const targetVersion = version
      ? versions.find(v => v.version === version)
      : versions[versions.length - 1];

    if (!targetVersion) {
      throw new Error(`Version ${version} not found`);
    }

    const key = `${targetVersion.metadata.category}/${fileId}/v${targetVersion.version}/${targetVersion.filename}`;
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  // Search and Filter
  async searchFiles(
    query: string,
    userId: string,
    filters?: {
      category?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      sizeRange?: { min: number; max: number };
    }
  ): Promise<FileMetadata[]> {
    // In a real implementation, this would query a database
    // For now, return mock data
    return [];
  }

  // Utility Methods
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnnotationId(): string {
    return `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getNextVersion(fileId: string): Promise<number> {
    const versions = await this.getFileVersions(fileId);
    return versions.length + 1;
  }

  private async calculateChecksum(file: File): Promise<string> {
    // In a real implementation, calculate SHA-256 hash
    return `checksum_${Date.now()}_${file.size}`;
  }
}

export const advancedFileManagementService = new AdvancedFileManagementService();
