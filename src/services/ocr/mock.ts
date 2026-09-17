import { OCRProvider } from "./index";
import { ExtractedReceiptData } from "@/types";

export class MockOCRProvider implements OCRProvider {
  async processReceipt(imageBuffer: Buffer, fileName: string): Promise<ExtractedReceiptData> {
    const lowerName = fileName.toLowerCase();

    // Scenario 6: Low OCR Confidence / Blurry test
    if (lowerName.includes("blur") || lowerName.includes("unclear") || lowerName.includes("damaged")) {
      return {
        vendorName: "HP Auto Care (Unclear)",
        amount: 0,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        category: "fuel",
        gstin: "",
        confidence: {
          vendorName: 0.52,
          amount: 0.41,
          date: 0.65,
          category: 0.60,
          gstin: 0.20,
        },
        rawText: "HP AUTO CARE... SLIP NO: ??? ... AMT: [SMUDGED] ... DATE: 17/??/2026",
        needsReview: true,
      };
    }

    // Scenario 4: Restaurant/Bar receipt (Category mismatch test)
    if (lowerName.includes("food") || lowerName.includes("restaurant") || lowerName.includes("dining") || lowerName.includes("bar")) {
      return {
        vendorName: "Barbeque Nation Hospitality",
        amount: 2450.00,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        category: "food",
        gstin: "29AABCB3982Q1ZQ",
        confidence: {
          vendorName: 0.96,
          amount: 0.98,
          date: 0.95,
          category: 0.94,
          gstin: 0.91,
        },
        rawText: "BARBEQUE NATION HOSPITALITY LTD\nINVOICE: BN-BLR-8921\nTABLE: 12\nTOTAL: INR 2,450.00\nGSTIN: 29AABCB3982Q1ZQ\nTHANK YOU VISIT AGAIN",
        needsReview: false,
      };
    }

    // Scenario 5: Policy violation (e.g. ₹7,800 fuel)
    if (lowerName.includes("high") || lowerName.includes("violation") || lowerName.includes("7800")) {
      return {
        vendorName: "Bharat Petroleum Corporation",
        amount: 7800.00,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        category: "fuel",
        gstin: "27AAACB2902M1ZT",
        confidence: {
          vendorName: 0.98,
          amount: 0.99,
          date: 0.96,
          category: 0.95,
          gstin: 0.92,
        },
        rawText: "BHARAT PETROLEUM\nRETAIL OUTLET #4410\nDIESEL NORMAL: 82.10 LTRS\nRATE: 95.00/L\nTOTAL AMOUNT: INR 7,800.00\nGSTIN: 27AAACB2902M1ZT",
        needsReview: false,
      };
    }

    // Scenario 3: Amount anomaly (₹8,500)
    if (lowerName.includes("anomaly") || lowerName.includes("8500")) {
      return {
        vendorName: "Indian Oil Corporation Ltd",
        amount: 8500.00,
        currency: "INR",
        date: new Date().toISOString().split("T")[0],
        category: "fuel",
        gstin: "29AAACI1681G1ZS",
        confidence: {
          vendorName: 0.97,
          amount: 0.98,
          date: 0.94,
          category: 0.96,
          gstin: 0.93,
        },
        rawText: "INDIAN OIL CORP LTD\nFUEL RECEIPT # IOC-9921\nSPEED PETROL: 85.0 LTRS\nTOTAL: INR 8,500.00\nGSTIN: 29AAACI1681G1ZS",
        needsReview: false,
      };
    }

    // Default: Realistic Indian Oil Fuel Receipt (Standard Clean / Duplicate Scenario)
    return {
      vendorName: "Indian Oil Corporation Ltd",
      amount: 3850.00,
      currency: "INR",
      date: new Date().toISOString().split("T")[0],
      category: "fuel",
      gstin: "29AAACI1681G1ZS",
      confidence: {
        vendorName: 0.98,
        amount: 0.99,
        date: 0.94,
        category: 0.95,
        gstin: 0.90,
      },
      rawText: "INDIAN OIL CORPORATION LTD\nDEALER: HIGHWAY SERVICE STATION\nBILL NO: 44710\nFUEL: DIESEL\nVOLUME: 42.77 LTR\nAMOUNT: INR 3,850.00\nDATE: 17-09-2026 10:24 AM\nGSTIN: 29AAACI1681G1ZS\nTRANSACTION APPROVED",
      needsReview: false,
    };
  }
}
