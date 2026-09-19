import {
  TextractClient,
  AnalyzeExpenseCommand,
  ExpenseDocument,
  ExpenseField,
} from "@aws-sdk/client-textract";
import { OCRProvider } from "./index";
import { ExpenseCategory, ExtractedReceiptData } from "@/types";

// Matches a standard 15-character Indian GSTIN (e.g. 29AAACI1681G1ZS).
const GSTIN_PATTERN = /\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]\b/;

// Fuel-pump slips print "Amount(Rs): 00367.05" rather than a field labeled
// "Total" -- AnalyzeExpense's SummaryField ontology has no AMOUNT type, so
// this pattern is what actually carries the payable total on that format.
const AMOUNT_LINE_PATTERN = /amount\s*\(?rs\.?\)?\s*:?\s*₹?\s*([\d,]+\.\d{1,2})/i;
const RATE_LINE_PATTERN = /rate\s*\(?rs\.?\s*\/?\s*l\)?\s*:?\s*([\d,]+\.\d+)/i;
const VOLUME_LINE_PATTERN = /volume\s*\(?l\)?\s*:?\s*([\d,]+\.\d+)/i;

const CATEGORY_KEYWORDS: Array<{ category: ExpenseCategory; keywords: string[] }> = [
  { category: "fuel", keywords: ["petrol", "diesel", "fuel", "oil corp", "hp ", "bharat petroleum", "indian oil", "filling station"] },
  { category: "food", keywords: ["restaurant", "cafe", "hotel", "dining", "food", "kitchen", "bar", "bakery"] },
  { category: "lodging", keywords: ["hotel", "inn", "resort", "lodge", "stay", "rooms"] },
  { category: "travel", keywords: ["airlines", "airways", "cab", "taxi", "uber", "ola", "railway", "irctc", "toll"] },
];

function guessCategory(vendorName: string, rawText: string): ExpenseCategory {
  const haystack = `${vendorName} ${rawText}`.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      return category;
    }
  }
  return "misc";
}

function findField(fields: ExpenseField[], types: string[]): ExpenseField | undefined {
  return fields.find((f) => f.Type?.Text && types.includes(f.Type.Text));
}

function findLineItemField(expenseDoc: ExpenseDocument | undefined, types: string[]): ExpenseField | undefined {
  for (const group of expenseDoc?.LineItemGroups ?? []) {
    for (const item of group.LineItems ?? []) {
      const field = findField(item.LineItemExpenseFields ?? [], types);
      if (field) return field;
    }
  }
  return undefined;
}

function fieldConfidence(field: ExpenseField | undefined): number {
  const conf = field?.ValueDetection?.Confidence;
  return typeof conf === "number" ? conf / 100 : 0;
}

function parseAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString().split("T")[0];
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return new Date().toISOString().split("T")[0];
}

interface ResolvedAmount {
  amount: number;
  confidence: number;
}

// AnalyzeExpense only reliably tags an amount when the receipt uses a
// standard TOTAL/SUBTOTAL/line-item-PRICE layout. Indian fuel-pump slips
// instead print an unlabeled-to-Textract "Amount(Rs)" line, or in some
// cases only Rate + Volume with no total printed at all. Walk down that
// chain of decreasing reliability rather than returning 0.
function resolveAmount(
  totalField: ExpenseField | undefined,
  rawText: string
): ResolvedAmount {
  const fieldAmount = parseAmount(totalField?.ValueDetection?.Text);
  if (fieldAmount > 0) {
    return { amount: fieldAmount, confidence: fieldConfidence(totalField) };
  }

  const amountLineMatch = rawText.match(AMOUNT_LINE_PATTERN);
  if (amountLineMatch) {
    // Not a Textract-scored field, but it's an exact match on the printed
    // amount text, so treat it as reasonably (not fully) trustworthy.
    return { amount: parseAmount(amountLineMatch[1]), confidence: 0.8 };
  }

  const rateMatch = rawText.match(RATE_LINE_PATTERN);
  const volumeMatch = rawText.match(VOLUME_LINE_PATTERN);
  if (rateMatch && volumeMatch) {
    const computed = Math.round(parseAmount(rateMatch[1]) * parseAmount(volumeMatch[1]) * 100) / 100;
    // Computed, not printed -- pump rounding means this can be a few paise
    // off the real total, so confidence is deliberately kept below the 0.70
    // review threshold to force a manager glance at the source image.
    return { amount: computed, confidence: 0.6 };
  }

  return { amount: 0, confidence: 0 };
}

export class TextractOCRProvider implements OCRProvider {
  private client: TextractClient;

  constructor() {
    this.client = new TextractClient({
      region: process.env.AWS_TEXTRACT_REGION || process.env.AWS_REGION || "ap-south-1",
    });
  }

  async processReceipt(imageBuffer: Buffer, _fileName: string): Promise<ExtractedReceiptData> {
    const command = new AnalyzeExpenseCommand({
      Document: { Bytes: imageBuffer },
    });

    const response = await this.client.send(command);
    const expenseDoc = response.ExpenseDocuments?.[0];
    const summaryFields = expenseDoc?.SummaryFields ?? [];

    const vendorField = findField(summaryFields, ["VENDOR_NAME", "NAME"]);
    const totalField =
      findField(summaryFields, ["TOTAL", "AMOUNT_DUE", "SUBTOTAL", "AMOUNT_PAID"]) ??
      findLineItemField(expenseDoc, ["PRICE", "TOTAL"]);
    const dateField = findField(summaryFields, ["INVOICE_RECEIPT_DATE", "DUE_DATE"]);

    // Prefer the full per-line OCR text (Blocks) when Textract returns it --
    // it captures labels like "Rate(Rs/L)" that never make it into a
    // classified SummaryField/LineItemField at all. Fall back to
    // concatenating the classified fields when Blocks is absent.
    const blockLines = (expenseDoc?.Blocks ?? [])
      .filter((b) => b.BlockType === "LINE" && b.Text)
      .map((b) => b.Text as string);
    const summaryValues = summaryFields.map((f) => f.ValueDetection?.Text || "");
    const lineItemValues = (expenseDoc?.LineItemGroups ?? [])
      .flatMap((group) => group.LineItems ?? [])
      .flatMap((item) => (item.LineItemExpenseFields ?? []).map((f) => f.ValueDetection?.Text || ""));
    const rawText = (blockLines.length ? blockLines : [...summaryValues, ...lineItemValues])
      .filter(Boolean)
      .join("\n");
    const gstinMatch = rawText.match(GSTIN_PATTERN);

    const vendorName = vendorField?.ValueDetection?.Text || "Unknown Vendor";
    const { amount, confidence: amountConfidence } = resolveAmount(totalField, rawText);
    const date = parseDate(dateField?.ValueDetection?.Text);
    const category = guessCategory(vendorName, rawText);

    const confidence = {
      vendorName: fieldConfidence(vendorField),
      amount: amountConfidence,
      date: fieldConfidence(dateField),
      // Category is a keyword heuristic on top of OCR text, not a
      // Textract-scored field, so it's assigned a fixed moderate confidence.
      category: 0.75,
      gstin: gstinMatch ? 0.9 : undefined,
    };

    const needsReview =
      confidence.vendorName < 0.7 || confidence.amount < 0.7 || confidence.date < 0.7 || amount === 0;

    return {
      vendorName,
      amount,
      currency: "INR",
      date,
      category,
      gstin: gstinMatch?.[0],
      confidence,
      rawText,
      needsReview,
    };
  }
}
