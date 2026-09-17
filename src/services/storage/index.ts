export interface StoredFile {
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  imageHash: string;
}

export interface ReceiptStorageProvider {
  uploadReceipt(buffer: Buffer, originalFilename: string, mimeType: string): Promise<StoredFile>;
  getReceiptUrl(fileUrl: string): Promise<string>;
}
