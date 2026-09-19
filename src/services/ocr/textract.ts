import {
  TextractClient,
  AnalyzeExpenseCommand,
  ExpenseField,
} from "@aws-sdk/client-textract";
import { OCRProvider } from "./index";
import { ExpenseCategory, ExtractedReceiptData } from "@/types";

// Matches a standard 15-character Indian GSTIN (e.g. 29AAACI1681G1ZS).
const GSTIN_PATTERN = /\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]\b/;

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
    const totalField = findField(summaryFields, ["TOTAL", "AMOUNT_DUE", "SUBTOTAL"]);
    const dateField = findField(summaryFields, ["INVOICE_RECEIPT_DATE", "DUE_DATE"]);

    // AnalyzeExpense has no dedicated GSTIN field; scan every extracted
    // value for the standard GSTIN pattern instead.
    const allValues = summaryFields.map((f) => f.ValueDetection?.Text || "").join(" ");
    const lineItemText = (expenseDoc?.LineItemGroups ?? [])
      .flatMap((group) => group.LineItems ?? [])
      .flatMap((item) => (item.LineItemExpenseFields ?? []).map((f) => f.ValueDetection?.Text || ""))
      .join(" ");
    const rawText = [allValues, lineItemText].filter(Boolean).join(" ");
    const gstinMatch = rawText.match(GSTIN_PATTERN);

    const vendorName = vendorField?.ValueDetection?.Text || "Unknown Vendor";
    const amount = parseAmount(totalField?.ValueDetection?.Text);
    const date = parseDate(dateField?.ValueDetection?.Text);
    const category = guessCategory(vendorName, rawText);

    const confidence = {
      vendorName: fieldConfidence(vendorField),
      amount: fieldConfidence(totalField),
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
