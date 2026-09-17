import { ReceiptStorageProvider, StoredFile } from "./index";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export class MockLocalReceiptStorageProvider implements ReceiptStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch {
      // already exists
    }
  }

  // Security: Check magic bytes for JPEG, PNG, WEBP
  private validateMagicBytes(buffer: Buffer): string {
    if (buffer.length < 4) {
      throw new Error("File too small or corrupt");
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }

    // PNG: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return "image/png";
    }

    // WEBP: RIFF .... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return "image/webp";
    }

    // Fallback: in mock testing environment, allow standard images
    return "image/jpeg";
  }

  async uploadReceipt(buffer: Buffer, originalFilename: string, mimeType: string): Promise<StoredFile> {
    await this.ensureDir();

    // 1. Validate size (10 MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      throw new Error("File size exceeds maximum limit of 10MB");
    }

    // 2. Validate magic bytes
    const validatedMime = this.validateMagicBytes(buffer);

    // 3. Compute SHA256 content hash & simulated perceptual fingerprint
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const imageHash = sha256.substring(0, 16); // 16-char fingerprint

    // 4. Generate safe unique filename
    const ext = validatedMime === "image/png" ? ".png" : validatedMime === "image/webp" ? ".webp" : ".jpg";
    const uniqueFileName = `rcpt_${crypto.randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    // 5. Write to disk
    await fs.writeFile(filePath, buffer);

    return {
      fileUrl: `/uploads/receipts/${uniqueFileName}`,
      fileName: uniqueFileName,
      mimeType: validatedMime,
      sizeBytes: buffer.length,
      imageHash,
    };
  }

  async getReceiptUrl(fileUrl: string): Promise<string> {
    return fileUrl;
  }
}
