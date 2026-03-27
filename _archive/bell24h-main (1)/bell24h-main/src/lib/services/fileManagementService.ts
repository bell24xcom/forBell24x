export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  tags: string[];
  annotations: FileAnnotation[];
  permissions: FilePermissions;
  checksum: string;
  thumbnailUrl?: string;
}

export interface FileAnnotation {
  id: string;
  type: 'text' | 'drawing' | 'highlight' | 'comment';
  content: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdBy: string;
  createdAt: string;
  replies: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface FilePermissions {
  read: string[];
  write: string[];
  delete: string[];
  share: string[];
}

export interface FileVersion {
  version: number;
  fileId: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  changes: string;
  size: number;
}

export interface BulkUploadResult {
  success: boolean;
  files: FileMetadata[];
  errors: string[];
  totalFiles: number;
  successfulUploads: number;
  failedUploads: number;
}

export class FileManagementService {
  private static instance: FileManagementService;
  private supabase: any;

  static getInstance(): FileManagementService {
    if (!FileManagementService.instance) {
      FileManagementService.instance = new FileManagementService();
    }
    return FileManagementService.instance;
  }

  constructor() {
    // Initialize Supabase client only if credentials exist; otherwise create a no-op stub
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      this.supabase = require('@supabase/supabase-js').createClient(url, key);
    } else {
      this.supabase = {
        storage: { from: () => ({ upload: async () => ({ data: null, error: { message: 'disabled' } }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
        from: () => ({ select: async () => ({ data: [], error: null }), insert: async () => ({ error: null }), update: async () => ({ error: null }), delete: async () => ({ error: null }) })
      };
    }
  }

  async uploadFile(file: File, metadata: Partial<FileMetadata>): Promise<FileMetadata> {
    try {
      // Generate unique file ID
      const fileId = this.generateFileId();

      // Calculate file checksum
      const checksum = await this.calculateChecksum(file);

      // Upload to Supabase Storage when enabled; otherwise create a temporary blob URL
      let publicUrl = '';
      if (!this.supabase?.storage || this.supabase?.__disabled) {
        publicUrl = URL.createObjectURL(file);
      } else {
        const { error } = await this.supabase.storage
          .from('files')
          .upload(`${fileId}/${file.name}`, file);
        if (error) throw error;
        const { data: urlData } = this.supabase.storage
          .from('files')
          .getPublicUrl(`${fileId}/${file.name}`);
        publicUrl = urlData.publicUrl;
      }

      // Create file metadata
      const fileMetadata: FileMetadata = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        uploadedBy: metadata.uploadedBy || 'anonymous',
        uploadedAt: new Date().toISOString(),
        version: 1,
        tags: metadata.tags || [],
        annotations: metadata.annotations || [],
        permissions: metadata.permissions || {
          read: ['*'],
          write: [metadata.uploadedBy || 'anonymous'],
          delete: [metadata.uploadedBy || 'anonymous'],
          share: [metadata.uploadedBy || 'anonymous'],
        },
        checksum,
        thumbnailUrl: await this.generateThumbnail(file, fileId),
      };

      // Store metadata in database
      await this.storeFileMetadata(fileMetadata);

      return fileMetadata;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async bulkUploadFiles(files: File[], metadata: Partial<FileMetadata>): Promise<BulkUploadResult> {
    const result: BulkUploadResult = {
      success: true,
      files: [],
      errors: [],
      totalFiles: files.length,
      successfulUploads: 0,
      failedUploads: 0,
    };

    // Process files in batches of 5
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      const batchPromises = batch.map(async file => {
        try {
          const fileMetadata = await this.uploadFile(file, metadata);
          result.files.push(fileMetadata);
          result.successfulUploads++;
        } catch (error) {
          result.errors.push(`Failed to upload ${file.name}: ${error}`);
          result.failedUploads++;
        }
      });

      await Promise.all(batchPromises);
    }

    result.success = result.failedUploads === 0;
    return result;
  }

  async updateFile(fileId: string, newFile: File, changes: string): Promise<FileVersion> {
    try {
      // Get current file metadata
      const currentMetadata = await this.getFileMetadata(fileId);
      if (!currentMetadata) {
        throw new Error('File not found');
      }

      // Calculate new checksum
      const checksum = await this.calculateChecksum(newFile);

      // Upload new version
      const newVersion = currentMetadata.version + 1;
      const { data, error } = await this.supabase.storage
        .from('files')
        .upload(`${fileId}/v${newVersion}/${newFile.name}`, newFile);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('files')
        .getPublicUrl(`${fileId}/v${newVersion}/${newFile.name}`);

      // Create version record
      const version: FileVersion = {
        version: newVersion,
        fileId,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentMetadata.uploadedBy,
        changes,
        size: newFile.size,
      };

      // Store version in database
      await this.storeFileVersion(version);

      // Update main file metadata
      const updatedMetadata: FileMetadata = {
        ...currentMetadata,
        version: newVersion,
        url: urlData.publicUrl,
        size: newFile.size,
        checksum,
      };

      await this.updateFileMetadata(updatedMetadata);

      return version;
    } catch (error) {
      console.error('Error updating file:', error);
      throw new Error('Failed to update file');
    }
  }

  async getFileVersions(fileId: string): Promise<FileVersion[]> {
    try {
      const { data, error } = await this.supabase
        .from('file_versions')
        .select('*')
        .eq('file_id', fileId)
        .order('version', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting file versions:', error);
      return [];
    }
  }

  async addAnnotation(
    fileId: string,
    annotation: Omit<FileAnnotation, 'id' | 'createdAt'>
  ): Promise<FileAnnotation> {
    try {
      const newAnnotation: FileAnnotation = {
        ...annotation,
        id: this.generateAnnotationId(),
        createdAt: new Date().toISOString(),
      };

      // Get current file metadata
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        throw new Error('File not found');
      }

      // Add annotation to file
      const updatedAnnotations = [...metadata.annotations, newAnnotation];

      await this.updateFileMetadata({
        ...metadata,
        annotations: updatedAnnotations,
      });

      return newAnnotation;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw new Error('Failed to add annotation');
    }
  }

  async updateAnnotation(
    fileId: string,
    annotationId: string,
    updates: Partial<FileAnnotation>
  ): Promise<FileAnnotation> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        throw new Error('File not found');
      }

      const annotationIndex = metadata.annotations.findIndex(a => a.id === annotationId);
      if (annotationIndex === -1) {
        throw new Error('Annotation not found');
      }

      const updatedAnnotations = [...metadata.annotations];
      updatedAnnotations[annotationIndex] = {
        ...updatedAnnotations[annotationIndex],
        ...updates,
      };

      await this.updateFileMetadata({
        ...metadata,
        annotations: updatedAnnotations,
      });

      return updatedAnnotations[annotationIndex];
    } catch (error) {
      console.error('Error updating annotation:', error);
      throw new Error('Failed to update annotation');
    }
  }

  async addAnnotationReply(
    fileId: string,
    annotationId: string,
    reply: Omit<AnnotationReply, 'id' | 'createdAt'>
  ): Promise<AnnotationReply> {
    try {
      const newReply: AnnotationReply = {
        ...reply,
        id: this.generateReplyId(),
        createdAt: new Date().toISOString(),
      };

      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        throw new Error('File not found');
      }

      const annotationIndex = metadata.annotations.findIndex(a => a.id === annotationId);
      if (annotationIndex === -1) {
        throw new Error('Annotation not found');
      }

      const updatedAnnotations = [...metadata.annotations];
      updatedAnnotations[annotationIndex] = {
        ...updatedAnnotations[annotationIndex],
        replies: [...updatedAnnotations[annotationIndex].replies, newReply],
      };

      await this.updateFileMetadata({
        ...metadata,
        annotations: updatedAnnotations,
      });

      return newReply;
    } catch (error) {
      console.error('Error adding annotation reply:', error);
      throw new Error('Failed to add annotation reply');
    }
  }

  async searchFiles(
    query: string,
    filters?: {
      tags?: string[];
      uploadedBy?: string;
      dateRange?: { start: string; end: string };
      fileTypes?: string[];
    }
  ): Promise<FileMetadata[]> {
    try {
      let supabaseQuery = this.supabase.from('files').select('*');

      // Apply text search
      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,tags.cs.{${query}}`);
      }

      // Apply filters
      if (filters?.tags) {
        supabaseQuery = supabaseQuery.overlaps('tags', filters.tags);
      }

      if (filters?.uploadedBy) {
        supabaseQuery = supabaseQuery.eq('uploaded_by', filters.uploadedBy);
      }

      if (filters?.dateRange) {
        supabaseQuery = supabaseQuery
          .gte('uploaded_at', filters.dateRange.start)
          .lte('uploaded_at', filters.dateRange.end);
      }

      if (filters?.fileTypes) {
        supabaseQuery = supabaseQuery.in('type', filters.fileTypes);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        throw new Error('File not found');
      }

      // Check permissions
      if (
        !metadata.permissions.delete.includes(userId) &&
        !metadata.permissions.delete.includes('*')
      ) {
        throw new Error('Insufficient permissions');
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('files')
        .remove([`${fileId}/`]);

      if (storageError) throw storageError;

      // Delete metadata from database
      const { error: dbError } = await this.supabase.from('files').delete().eq('id', fileId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async shareFile(
    fileId: string,
    userId: string,
    shareWith: string[],
    permissions: Partial<FilePermissions>
  ): Promise<boolean> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) {
        throw new Error('File not found');
      }

      // Check permissions
      if (
        !metadata.permissions.share.includes(userId) &&
        !metadata.permissions.share.includes('*')
      ) {
        throw new Error('Insufficient permissions');
      }

      // Update permissions
      const updatedPermissions: FilePermissions = {
        read: [...new Set([...metadata.permissions.read, ...shareWith])],
        write: permissions.write
          ? [...new Set([...metadata.permissions.write, ...shareWith])]
          : metadata.permissions.write,
        delete: permissions.delete
          ? [...new Set([...metadata.permissions.delete, ...shareWith])]
          : metadata.permissions.delete,
        share: permissions.share
          ? [...new Set([...metadata.permissions.share, ...shareWith])]
          : metadata.permissions.share,
      };

      await this.updateFileMetadata({
        ...metadata,
        permissions: updatedPermissions,
      });

      return true;
    } catch (error) {
      console.error('Error sharing file:', error);
      return false;
    }
  }

  // Private helper methods
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnnotationId(): string {
    return `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReplyId(): string {
    return `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async generateThumbnail(file: File, fileId: string): Promise<string | undefined> {
    if (!file.type.startsWith('image/')) {
      return undefined;
    }

    try {
      // Create thumbnail using Canvas API
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise(resolve => {
        img.onload = () => {
          canvas.width = 200;
          canvas.height = 200;
          ctx?.drawImage(img, 0, 0, 200, 200);

          canvas.toBlob(
            async blob => {
              if (blob) {
                const { data, error } = await this.supabase.storage
                  .from('thumbnails')
                  .upload(`${fileId}/thumb.jpg`, blob);

                if (!error) {
                  const { data: urlData } = this.supabase.storage
                    .from('thumbnails')
                    .getPublicUrl(`${fileId}/thumb.jpg`);
                  resolve(urlData.publicUrl);
                }
              }
              resolve(undefined);
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return undefined;
    }
  }

  private async storeFileMetadata(metadata: FileMetadata): Promise<void> {
    const { error } = await this.supabase.from('files').insert({
      id: metadata.id,
      name: metadata.name,
      size: metadata.size,
      type: metadata.type,
      url: metadata.url,
      uploaded_by: metadata.uploadedBy,
      uploaded_at: metadata.uploadedAt,
      version: metadata.version,
      tags: metadata.tags,
      annotations: metadata.annotations,
      permissions: metadata.permissions,
      checksum: metadata.checksum,
      thumbnail_url: metadata.thumbnailUrl,
    });

    if (error) throw error;
  }

  private async updateFileMetadata(metadata: FileMetadata): Promise<void> {
    const { error } = await this.supabase
      .from('files')
      .update({
        name: metadata.name,
        size: metadata.size,
        type: metadata.type,
        url: metadata.url,
        version: metadata.version,
        tags: metadata.tags,
        annotations: metadata.annotations,
        permissions: metadata.permissions,
        checksum: metadata.checksum,
        thumbnail_url: metadata.thumbnailUrl,
      })
      .eq('id', metadata.id);

    if (error) throw error;
  }

  private async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const { data, error } = await this.supabase.from('files').select('*').eq('id', fileId).single();

    if (error) return null;

    return data;
  }

  private async storeFileVersion(version: FileVersion): Promise<void> {
    const { error } = await this.supabase.from('file_versions').insert({
      version: version.version,
      file_id: version.fileId,
      url: version.url,
      uploaded_at: version.uploadedAt,
      uploaded_by: version.uploadedBy,
      changes: version.changes,
      size: version.size,
    });

    if (error) throw error;
  }
}

export const fileManagementService = FileManagementService.getInstance();
