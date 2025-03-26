declare module 'aws-sdk' {
  export class S3 {
    constructor(config: any);
    upload(params: any): { promise: () => Promise<S3.ManagedUpload.SendData> };
    getSignedUrl(operation: string, params: any): string;
    deleteObject(params: any): { promise: () => Promise<S3.DeleteObjectOutput> };
  }
  
  export namespace S3 {
    namespace ManagedUpload {
      interface SendData {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
      }
    }
    
    interface DeleteObjectOutput {
      DeleteMarker?: boolean;
      VersionId?: string;
      RequestCharged?: string;
    }
  }
}