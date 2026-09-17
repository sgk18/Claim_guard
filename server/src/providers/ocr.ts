import { ExtractedReceiptData } from "../types/index.js";

export interface OCRProvider {
  extractReceipt(buffer: Buffer, fileName: string): Promise<{
    extracted: ExtractedReceiptData;
    rawText: string;
    perceptualHash: string;
  }>;
}

export class MockOCRProvider implements OCRProvider {
  async extractReceipt(buffer: Buffer, fileName: string) {
    const lower = fileName.toLowerCase();

    // Default Fuel extraction
    let vendorName = "Indian Oil Corporation Ltd";
    let amount = 3850;
    let date = new Date().toISOString().split("T")[0];
    let category: any = "fuel";
    let gstin = "29AAACI1681G1Z1";
    let confidence = { vendor: 0.98, amount: 0.99, date: 0.95, overall: 0.97 };
    let needsReview = false;

    if (lower.includes("hotel") || lower.includes("lodging") || lower.includes("taj")) {
      vendorName = "The Taj Gateway Hotel";
      amount = 7499;
      category = "lodging";
      gstin = "27AAACT1234F1Z5";
      confidence = { vendor: 0.95, amount: 0.96, date: 0.92, overall: 0.94 };
    } else if (lower.includes("food") || lower.includes("bikanervala") || lower.includes("restaurant")) {
      vendorName = "Bikanervala Sweets & Restaurant";
      amount = 850;
      category = "food";
      gstin = "07AAACB5678J1Z9";
      confidence = { vendor: 0.96, amount: 0.97, date: 0.94, overall: 0.95 };
    } else if (lower.includes("low") || lower.includes("blurred") || lower.includes("crinkled")) {
      vendorName = "Raju Auto Fuels";
      amount = 2400;
      confidence = { vendor: 0.62, amount: 0.68, date: 0.70, overall: 0.66 };
      needsReview = true;
    }

    // Generate perceptual image hash
    let hashNum = 0;
    for (let i = 0; i < Math.min(buffer.length, 100); i++) {
      hashNum = (hashNum * 31 + buffer[i]) >>> 0;
    }
    const hash = (lower.includes("dup") || lower.includes("copy"))
      ? "a1b2c3d4e5f60000" // deterministic known duplicate
      : hashNum.toString(16).padStart(16, "0").slice(0, 16);

    const rawText = `[OCR PROCESSED]\nVENDOR: ${vendorName}\nDATE: ${date}\nAMOUNT: INR ${amount}\nGSTIN: ${gstin}\nCONFIDENCE: ${(confidence.overall * 100).toFixed(1)}%`;

    return {
      extracted: {
        vendorName,
        amount,
        currency: "INR",
        date,
        category,
        gstin,
        lineItems: [{ description: `${category.toUpperCase()} Charge`, amount }],
        confidence,
        needsReview,
      },
      rawText,
      perceptualHash: hash,
    };
  }
}
