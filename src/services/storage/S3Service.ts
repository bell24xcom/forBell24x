import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
}

export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
  }

  async uploadFile(
    file: Buffer | Readable,
    key: string,
    options: UploadOptions = {}
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: options.contentType,
      Metadata: options.metadata,
      ACL: options.public ? 'public-read' : 'private',
    });

    await this.client.send(command);
    return key;
  }

  async uploadFileWithUniqueKey(
    file: Buffer | Readable,
    prefix: string,
    options: UploadOptions = {}
  ): Promise<string> {
    const key = `${prefix}/${uuidv4()}`;
    return this.uploadFile(file, key, options);
  }

  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    const stream = response.Body as Readable;
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async listFiles(prefix: string): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const response = await this.client.send(command);
    return (response.Contents || []).map((item) => item.Key as string);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    // Copy to new location
    const copyCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: destinationKey,
      CopySource: `${this.bucket}/${sourceKey}`,
    });

    await this.client.send(copyCommand);

    // Delete from old location
    await this.deleteFile(sourceKey);
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: destinationKey,
      CopySource: `${this.bucket}/${sourceKey}`,
    });

    await this.client.send(command);
  }

  async getFileMetadata(key: string): Promise<Record<string, string>> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    return response.Metadata || {};
  }

  async updateFileMetadata(
    key: string,
    metadata: Record<string, string>
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      CopySource: `${this.bucket}/${key}`,
      Metadata: metadata,
      MetadataDirective: 'REPLACE',
    });

    await this.client.send(command);
  }
}

export const s3Service = new S3Service({
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || 'bell24h-storage',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
}); 