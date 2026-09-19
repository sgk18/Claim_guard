import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { OCRProvider } from "./index";
import { ExpenseCategory, ExtractedReceiptData } from "@/types";

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

// The model is asked for strict JSON, but Claude sometimes wraps it in a
// markdown code fence or adds a leading sentence -- extract the first
// balanced-looking JSON object rather than assuming the whole response is one.
function extractJson(text: string): RawBedrockExtraction | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// Uses a Bedrock vision-capable model (Anthropic Claude on Bedrock supports
// image input via the standard Messages API format) to extract receipt
// fields directly, instead of Textract's classified-field extraction. This
// generalizes better to non-standard layouts (e.g. fuel-pump slips with no
// field literally labeled "Total") without hand-written regex fallbacks --
// see src/services/ocr/textract.ts for the Textract-based alternative.
export class BedrockVisionOCRProvider implements OCRProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || "ap-south-1",
    });
    // Allows a separate (e.g. cheaper or free-tier-eligible) model to be
    // configured for OCR than for the risk-explanation text in ai/bedrock.ts.
    this.modelId =
      process.env.AWS_BEDROCK_OCR_MODEL_ID ||
      process.env.AWS_BEDROCK_MODEL_ID ||
      "anthropic.claude-3-5-sonnet-20241022-v2:0";
  }

  async processReceipt(imageBuffer: Buffer, _fileName: string, mimeType?: string): Promise<ExtractedReceiptData> {
    const mediaType = mimeType && SUPPORTED_MEDIA_TYPES.has(mimeType) ? mimeType : "image/jpeg";

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
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
      }),
    });

    const response = await this.client.send(command);
    const payload = JSON.parse(new TextDecoder().decode(response.body));
    const text: string = payload.content?.[0]?.text ?? "";
    const parsed = extractJson(text);

    if (!parsed) {
      // Unlike the risk-explanation provider, OCR failures must not be
      // silently papered over with fabricated data -- a wrong vendor/amount
      // here becomes the money on a real claim. Let the caller's error
      // handling surface this instead of guessing.
      throw new Error("Bedrock OCR response did not contain parseable JSON");
    }

    const amount = typeof parsed.amount === "number" ? parsed.amount : parseFloat(String(parsed.amount));
    const confidence = {
      vendorName: clamp01(parsed.confidence?.vendorName, 0.5),
      amount: clamp01(parsed.confidence?.amount, 0.5),
      date: clamp01(parsed.confidence?.date, 0.5),
      category: clamp01(parsed.confidence?.category, 0.5),
      gstin: parsed.gstin ? clamp01(parsed.confidence?.gstin, 0.5) : undefined,
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
      rawText: parsed.rawText,
      needsReview,
    };
  }
}
