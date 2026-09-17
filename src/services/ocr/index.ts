import { ExtractedReceiptData } from "@/types";

export interface OCRProvider {
  processReceipt(imageBuffer: Buffer, fileName: string): Promise<ExtractedReceiptData>;
}
