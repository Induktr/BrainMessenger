import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  private s3: S3;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  /**
   * Upload a file to AWS S3
   * @param file - The file buffer to upload
   * @param fileName - The name to give the file in S3
   * @returns Promise with upload result
   */
  async uploadFile(file: Buffer, fileName: string): Promise<S3.ManagedUpload.SendData> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: `uploads/${fileName}`,
      Body: file,
      ACL: 'private',
    };
    
    return this.s3.upload(params).promise();
  }

  /**
   * Generate a signed URL for accessing a private file
   * @param fileName - The file name in S3
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   * @returns Signed URL for file access
   */
  getSignedUrl(fileName: string, expiresIn: number = 3600): string {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: `uploads/${fileName}`,
      Expires: expiresIn,
    };
    
    return this.s3.getSignedUrl('getObject', params);
  }

  /**
   * Generate a pre-signed URL for direct client-side upload
   * @param fileName - The file name to be used in S3
   * @param contentType - The content type of the file
   * @param expiresIn - URL expiration time in seconds (default: 3600)
   * @returns Pre-signed URL for direct upload
   */
  getPresignedUploadUrl(fileName: string, contentType: string, expiresIn: number = 3600): string {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: `uploads/${fileName}`,
      Expires: expiresIn,
      ContentType: contentType,
      ACL: 'private',
    };
    
    return this.s3.getSignedUrl('putObject', params);
  }

  /**
   * Delete a file from S3
   * @param fileName - The file name to delete
   * @returns Promise with deletion result
   */
  async deleteFile(fileName: string): Promise<S3.DeleteObjectOutput> {
    const params = {
      Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      Key: `uploads/${fileName}`,
    };
    
    return this.s3.deleteObject(params).promise();
  }
}