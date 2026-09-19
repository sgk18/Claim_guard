import { NextRequest, NextResponse } from "next/server";
import { MockLocalReceiptStorageProvider } from "@/services/storage/mock";
import { getOCRProvider } from "@/services/providers";
import { db } from "@/db/store";
import crypto from "crypto";

const storageProvider = new MockLocalReceiptStorageProvider();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const employeeId = (formData.get("employeeId") as string) || "emp_rahul_102";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided in form data" } },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload & store securely
    const storedFile = await storageProvider.uploadReceipt(buffer, file.name, file.type);

    // 2. Run OCR extraction
    const extractedData = await getOCRProvider().processReceipt(buffer, file.name);

    // 3. Save draft in database
    const draftId = `drf_${crypto.randomUUID().substring(0, 8)}`;
    db.saveDraft(draftId, {
      receipt: storedFile,
      extracted: extractedData,
    });

    return NextResponse.json({
      success: true,
      data: {
        draftId,
        receipt: storedFile,
        extracted: extractedData,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to process receipt upload" } },
      { status: 500 }
    );
  }
}
