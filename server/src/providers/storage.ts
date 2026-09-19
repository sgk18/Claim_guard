export interface StorageUploadResult {
  fileUrl: string;
  storageKey: string;
  fileSizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  uploadReceipt(buffer: Buffer, fileName: string, mimeType: string): Promise<StorageUploadResult>;
  getSignedDownloadUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
}

export class MockStorageProvider implements StorageProvider {
  async uploadReceipt(buffer: Buffer, fileName: string, mimeType: string): Promise<StorageUploadResult> {
    const storageKey = `receipts/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    return {
      fileUrl: `/receipts/${fileName}`,
      storageKey,
      fileSizeBytes: buffer.length,
      mimeType,
    };
  }

  async getSignedDownloadUrl(storageKey: string, expiresInSeconds: number = 3600): Promise<string> {
    return `https://mock-s3.amazonaws.com/${storageKey}?signed=true&expires=${expiresInSeconds}`;
  }
}

export class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;

  constructor(bucket: string, region: string = "ap-southeast-2") {
    this.bucket = bucket;
    this.region = region;
  }

  async uploadReceipt(buffer: Buffer, fileName: string, mimeType: string): Promise<StorageUploadResult> {
    const storageKey = `receipts/${Date.now()}_${fileName}`;
    return {
      fileUrl: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${storageKey}`,
      storageKey,
      fileSizeBytes: buffer.length,
      mimeType,
    };
  }

  async getSignedDownloadUrl(storageKey: string, expiresInSeconds: number = 3600): Promise<string> {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${storageKey}?X-Amz-Signature=active&expires=${expiresInSeconds}`;
  }
}
