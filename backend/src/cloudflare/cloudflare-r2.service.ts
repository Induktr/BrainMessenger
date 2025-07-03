import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger } from '@nestjs/common';

@Injectable()
export class CloudflareR2Service {
  private readonly s3Client: S3Client;
  public readonly bucketName: string;
  private readonly logger = new Logger(CloudflareR2Service.name);

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY');
    const bucketName = this.configService.get<string>('R2_BUCKET');

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing Cloudflare R2 configuration in environment variables (R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET)');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
    this.bucketName = bucketName!;
  }

  /**
   * Upload a file stream or buffer to Cloudflare R2
   * @param streamOrBuffer - The readable stream or buffer of the file
   * @param key - The key (path/filename) to give the file in R2 (e.g., 'uploads/my-file.jpg')
   * @param contentType - The MIME type of the file (e.g., 'image/jpeg')
   * @param contentLength - The size of the file in bytes
   * @returns Promise with upload result metadata (like ETag)
   */
   async uploadFile(streamOrBuffer: Readable | Buffer, key: string, contentType: string, contentLength: number): Promise<{ ETag?: string; Location: string }> {
     try {
       const command = new PutObjectCommand({
         Bucket: this.bucketName,
         Key: key,
         Body: streamOrBuffer, // Accept either Readable or Buffer
         ContentType: contentType,
         ContentLength: contentLength, // Explicitly set content length
         ACL: 'public-read', // Ensure this is uncommented for public access
       });
   
       const output = await this.s3Client.send(command);
      // Construct the public URL using the R2_PUBLIC_URL environment variable
      const r2PublicUrl = this.configService.get<string>('R2_PUBLIC_URL');
      if (!r2PublicUrl) {
        this.logger.warn('R2_PUBLIC_URL not found in config. Public avatar URL may be incorrect.');
        // Fallback to the previous method if R2_PUBLIC_URL is not set
        const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
        if (!accountId) {
           this.logger.warn('R2_ACCOUNT_ID also not found. Public avatar URL construction failed.');
           // Fallback to endpoint if both R2_PUBLIC_URL and R2_ACCOUNT_ID are missing
           const endpoint = this.configService.get<string>('R2_ENDPOINT');
           const publicUrl = `${endpoint}/${this.bucketName}/${key}`;
           return { ETag: output.ETag, Location: publicUrl };
        }
        const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${this.bucketName}/${key}`;
        return { ETag: output.ETag, Location: publicUrl };
      }

      // Ensure the base URL doesn't have a trailing slash and the key doesn't have a leading slash
      const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
      const objectKey = key.startsWith('/') ? key.slice(1) : key;

      const publicUrl = `${baseUrl}/${this.bucketName}/${objectKey}`;
      return { ETag: output.ETag, Location: publicUrl };

    } catch (error) {
      this.logger.error('CloudflareR2Service - Detailed error during uploadFile:', error);
      if (error instanceof Error) {
        this.logger.error('CloudflareR2Service - Error name:', error.name);
        this.logger.error('CloudflareR2Service - Error message:', error.message);
        if ('code' in error) {
          this.logger.error('CloudflareR2Service - Error code:', (error as any).code);
        }
        if ('stack' in error) {
          this.logger.error('CloudflareR2Service - Error stack:', error.stack);
        }
      }
      throw new InternalServerErrorException('Failed to upload file to R2.');
    }
  }

  /**
   * Delete a file from Cloudflare R2
   * @param key - The key (path/filename) of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(key: string): Promise<any> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      this.logger.error(`Error deleting file ${key} from R2:`, error);
      throw new InternalServerErrorException('Failed to delete file from R2.');
    }
  }

  /**
   * Generate a pre-signed URL for accessing a private file (optional)
   * @param key - The key (path/filename) of the file in R2
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   * @returns Promise resolving to the pre-signed URL string
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
     const command = new GetObjectCommand({
       Bucket: this.bucketName,
       Key: key,
     });
     try {
       return await getSignedUrl(this.s3Client, command, { expiresIn });
     } catch (error) {
       this.logger.error(`Error generating signed URL for ${key}:`, error);
       throw new InternalServerErrorException('Failed to generate signed URL.');
     }
  }

  /**
   * Get object metadata from Cloudflare R2
   * @param key - The key (path/filename) of the file in R2
   * @returns Promise resolving to the object metadata (including ContentLength)
   */
  async getObjectMetadata(key: string): Promise<any> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const output = await this.s3Client.send(command);
      return output;
    } catch (error) {
      this.logger.error(`Error getting object metadata for ${key} from R2:`, error);
      throw new InternalServerErrorException('Failed to get file metadata from R2.');
    }
  }
}