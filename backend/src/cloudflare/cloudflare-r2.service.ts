import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // For generating signed URLs if needed

@Injectable()
export class CloudflareR2Service {
  private readonly s3Client: S3Client;
  public readonly bucketName: string; // Make bucketName public

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY');
    const bucketName = this.configService.get<string>('R2_BUCKET');

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Missing Cloudflare R2 configuration in environment variables (R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET)');
    }

    this.s3Client = new S3Client({
      region: 'auto', // R2 typically uses 'auto'
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId!, // Add non-null assertion
        secretAccessKey: secretAccessKey!, // Add non-null assertion
      },
    });
    this.bucketName = bucketName!; // Add non-null assertion
  }

  /**
   * Upload a file stream to Cloudflare R2
   * @param stream - The readable stream of the file
   * @param key - The key (path/filename) to give the file in R2 (e.g., 'uploads/my-file.jpg')
   * @param contentType - The MIME type of the file (e.g., 'image/jpeg')
   * @returns Promise with upload result metadata (like ETag)
   */
  async uploadFile(stream: Readable, key: string, contentType: string): Promise<{ ETag?: string; Location: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: stream,
      ContentType: contentType,
      // ACL: 'public-read', // Uncomment if you want files to be publicly readable by default
    });

    try {
      const output = await this.s3Client.send(command);
      // Construct the public URL (adjust if using custom domain or different URL structure)
      const endpoint = this.configService.get<string>('R2_ENDPOINT');
      const publicUrl = `${endpoint}/${this.bucketName}/${key}`;
      return { ETag: output.ETag, Location: publicUrl };
    } catch (error) {
      console.error('Error uploading file to R2:', error);
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
      console.error(`Error deleting file ${key} from R2:`, error);
      // Decide if you want to throw an error or just log it
      // For example, if the file didn't exist, deletion might fail but that could be okay.
      // Consider checking error type if more granular handling is needed.
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
       console.error(`Error generating signed URL for ${key}:`, error);
       throw new InternalServerErrorException('Failed to generate signed URL.');
     }
  }

  // Add other methods as needed (e.g., getFileStream, generatePresignedPostUrl)
}