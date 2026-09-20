import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { OCRProvider } from "./index";
import { ExpenseCategory, ExtractedReceiptData } from "@/types";
import { TesseractOCRService } from "./tesseractEngine";
import { MockOCRProvider } from "./mock";

const VALID_CATEGORIES: ExpenseCategory[] = ["fuel", "food", "travel", "lodging", "misc"];
const SUPPORTED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const PROMPT = `You are extracting structured data from a photo of an Indian expense receipt for a fraud-verification system. Read the receipt carefully, including handwritten or low-quality text, and respond with ONLY a JSON object (no prose outside it) in this exact shape:

{
  "vendorName": "business/vendor name as printed",
  "amount": <number, the final payable total in the receipt's currency>,
  "currency": "3-letter code, e.g. INR",
  "date": "YYYY-MM-DD",
  "category": "one of: fuel, food, travel, lodging, misc",
  "gstin": "15-character Indian GSTIN if visible, else omit the field",
  "confidence": {
    "vendorName": <0-1, your confidence this text is correct>,
    "amount": <0-1>,
    "date": <0-1>,
    "category": <0-1>,
    "gstin": <0-1, omit if no GSTIN found>
  },
  "rawText": "every line of text you can read on the receipt, verbatim, newline-separated",
  "needsReview": <true if the image is blurry, cropped, or any critical field is uncertain>
}

Important rules for "amount":
- Many Indian fuel-pump receipts print no field literally labeled "Total". If you see "Rate" (price per litre) and "Volume"/"Quantity" (litres) but no total, compute amount = Rate x Volume and set confidence.amount around 0.6-0.7 to reflect it's computed, not printed.
- If a field like "Amount(Rs)" or "Amount Due" is printed directly, use that value and prefer it over computing Rate x Volume.
- Never return 0 for amount unless the receipt truly has no readable pricing information at all.

Respond with the JSON object only.`;

interface RawBedrockExtraction {
  vendorName?: string;
  amount?: number;
  currency?: string;
  date?: string;
  category?: string;
  gstin?: string;
  confidence?: {
    vendorName?: number;
    amount?: number;
    date?: number;
    category?: number;
    gstin?: number;
  };
  rawText?: string;
  needsReview?: boolean;
}

function clamp01(n: unknown, fallback: number): number {
  const num = typeof n === "number" ? n : parseFloat(String(n));
  if (!Number.isFinite(num)) return fallback;
  return Math.min(1, Math.max(0, num));
}

function normalizeDate(raw: unknown): string {
  if (typeof raw === "string") {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }
  return new Date().toISOString().split("T")[0];
}

function normalizeCategory(raw: unknown): ExpenseCategory {
  return VALID_CATEGORIES.includes(raw as ExpenseCategory) ? (raw as ExpenseCategory) : "misc";
}

function extractJson(text: string): RawBedrockExtraction | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export class BedrockVisionOCRProvider implements OCRProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private tesseractService: TesseractOCRService;
  private fallbackProvider: MockOCRProvider;

  constructor() {
    const region =
      process.env.AWS_BEDROCK_REGION ||
      process.env.AWS_REGION ||
      "ap-southeast-2";

    this.client = new BedrockRuntimeClient({
      region,
    });

    // Default to Amazon Nova Lite (amazon.nova-lite-v1:0) for fast, free-tier/low-cost multimodal OCR,
    // or allow overriding via AWS_BEDROCK_OCR_MODEL_ID.
    this.modelId =
      process.env.AWS_BEDROCK_OCR_MODEL_ID ||
      process.env.AWS_BEDROCK_MODEL_ID ||
      "amazon.nova-lite-v1:0";

    this.tesseractService = new TesseractOCRService();
    this.fallbackProvider = new MockOCRProvider();
  }

  async processReceipt(imageBuffer: Buffer, fileName: string, mimeType?: string): Promise<ExtractedReceiptData> {
    const mediaType = mimeType && SUPPORTED_MEDIA_TYPES.has(mimeType) ? mimeType : "image/jpeg";
    const isNova = this.modelId.startsWith("amazon.nova");
    const isClaude = this.modelId.startsWith("anthropic.claude");

    try {
      let requestBody: string;

      if (isNova) {
        // Amazon Nova Vision multimodal request format
        const format = mediaType.replace("image/", "").replace("jpeg", "jpeg");
        requestBody = JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  image: {
                    format,
                    source: {
                      bytes: imageBuffer.toString("base64"),
                    },
                  },
                },
                {
                  text: PROMPT,
                },
              ],
            },
          ],
          inferenceConfig: {
            maxTokens: 1200,
            temperature: 0.1,
          },
        });
      } else {
        // Anthropic Claude Messages API format
        requestBody = JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1200,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: imageBuffer.toString("base64"),
                  },
                },
                { type: "text", text: PROMPT },
              ],
            },
          ],
        });
      }

      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: Buffer.from(requestBody),
      });

      const response = await this.client.send(command);
      const payload = JSON.parse(new TextDecoder().decode(response.body));

      let text = "";
      if (isNova) {
        text = payload.output?.message?.content?.[0]?.text ?? "";
      } else {
        text = payload.content?.[0]?.text ?? "";
      }

      const parsed = extractJson(text);

      if (!parsed) {
        throw new Error("Bedrock OCR response did not contain parseable JSON");
      }

      const amount = typeof parsed.amount === "number" ? parsed.amount : parseFloat(String(parsed.amount));
      const confidence = {
        vendorName: clamp01(parsed.confidence?.vendorName, 0.95),
        amount: clamp01(parsed.confidence?.amount, 0.95),
        date: clamp01(parsed.confidence?.date, 0.95),
        category: clamp01(parsed.confidence?.category, 0.95),
        gstin: parsed.gstin ? clamp01(parsed.confidence?.gstin, 0.95) : undefined,
      };

      const needsReview =
        Boolean(parsed.needsReview) ||
        confidence.vendorName < 0.7 ||
        confidence.amount < 0.7 ||
        confidence.date < 0.7 ||
        !Number.isFinite(amount) ||
        amount <= 0;

      return {
        vendorName: parsed.vendorName || "Unknown Vendor",
        amount: Number.isFinite(amount) ? amount : 0,
        currency: parsed.currency || "INR",
        date: normalizeDate(parsed.date),
        category: normalizeCategory(parsed.category),
        gstin: parsed.gstin || undefined,
        confidence,
        rawText: `[Bedrock OCR Model: ${this.modelId}]\n` + (parsed.rawText || ""),
        needsReview,
      };
    } catch (err: any) {
      console.warn(
        `[BedrockVisionOCR] Bedrock invocation returned (${err.name || err.message}). Performing real optical OCR directly on uploaded image pixels via Tesseract.`
      );

      try {
        const realOcr = await this.tesseractService.processReceipt(imageBuffer, fileName);
        return {
          ...realOcr,
          rawText:
            `[OCR Engine: Optical Character Recognition (Bedrock Note: ${err.message?.substring(0, 60) || err.name})]\n` +
            (realOcr.rawText || ""),
        };
      } catch (ocrErr: any) {
        console.warn(`[BedrockVisionOCR] Local OCR also encountered issue (${ocrErr.message}). Falling back to heuristic extractor.`);
        const fallback = await this.fallbackProvider.processReceipt(imageBuffer, fileName);
        return {
          ...fallback,
          rawText: `[Fallback: ${err.message?.substring(0, 80) || "Rate Limited"}]\n` + (fallback.rawText || ""),
        };
      }
    }
  }
}
