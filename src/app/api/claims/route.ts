import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/store";
import { evaluateFraudSignals } from "@/services/fraud/rules";
import { calculateDeterministicRiskScore } from "@/services/risk/engine";
import { MockAIProvider } from "@/services/ai/mock";
import { Claim, AuditLog, ExpenseCategory } from "@/types";

const aiProvider = new MockAIProvider();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const riskLevel = searchParams.get("riskLevel");
    const category = searchParams.get("category");
    const employeeId = searchParams.get("employeeId");
    const search = searchParams.get("search")?.toLowerCase();

    let claims = db.getClaims();

    if (status && status !== "ALL") {
      claims = claims.filter((c) => c.status === status);
    }
    if (riskLevel && riskLevel !== "ALL") {
      claims = claims.filter((c) => c.riskAssessment?.level === riskLevel);
    }
    if (category && category !== "ALL") {
      claims = claims.filter((c) => c.category === category);
    }
    if (employeeId) {
      claims = claims.filter((c) => c.employeeId === employeeId);
    }
    if (search) {
      claims = claims.filter(
        (c) =>
          c.id.toLowerCase().includes(search) ||
          c.vendorName.toLowerCase().includes(search) ||
          (c.employee?.name?.toLowerCase().includes(search) ?? false) ||
          c.category.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      data: claims,
      total: claims.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to retrieve claims" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId, employeeId, vendorName, amount, currency = "INR", date, category, gstin, employeeNotes } = body;

    if (!employeeId || !vendorName || amount === undefined || !date || !category) {
      return NextResponse.json(
        { success: false, error: { message: "Missing required claim fields" } },
        { status: 400 }
      );
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: { message: `Employee ${employeeId} not found` } },
        { status: 404 }
      );
    }

    const draft = draftId ? db.getDraft(draftId) : null;
    const policy = db.getPolicyByCategory(category);
    const trip = db.getActiveTripForEmployee(employeeId);
    const existingClaims = db.getClaims();

    // 1. Prepare receipt context
    const receiptData = {
      imageHash: draft?.receipt?.imageHash || `hash_${Math.random().toString(36).substring(2, 9)}`,
      ocrConfidence: draft?.extracted?.confidence || {
        vendorName: 1.0,
        amount: 1.0,
        date: 1.0,
        category: 1.0,
      },
      extractedCategory: draft?.extracted?.category,
    };

    // 2. Run Deterministic Fraud Signals
    const signals = evaluateFraudSignals({
      claim: {
        amount: Number(amount),
        category,
        vendorName,
        claimDate: date,
        gstin,
        tripId: trip?.id,
      },
      receipt: receiptData,
      employee,
      policy,
      trip,
      existingClaims,
    });

    // 3. Compute Deterministic Risk Score
    const riskResult = calculateDeterministicRiskScore(signals);

    // 4. Run AI Explanation Layer
    const aiExplanation = await aiProvider.explainRiskSignals(
      {
        amount: Number(amount),
        vendorName,
        category,
        date,
      },
      signals,
      riskResult.score,
      riskResult.level
    );

    // 5. Generate Claim ID
    const claimSeq = db.getClaims().length + 4480;
    const claimId = `CLM-${claimSeq}`;
    const now = new Date().toISOString();

    // Assign claimId to signals
    for (const s of signals) {
      s.claimId = claimId;
    }

    const claimStatus = riskResult.level === "LOW" ? "PENDING" : "REVIEW_REQUIRED";

    const newClaim: Claim = {
      id: claimId,
      companyId: employee.companyId,
      employeeId: employee.id,
      employee,
      tripId: trip?.id,
      trip,
      status: claimStatus,
      amount: Number(amount),
      currency,
      category: category as ExpenseCategory,
      vendorName,
      claimDate: date,
      gstin,
      receipt: {
        id: `rcpt_${claimId.toLowerCase()}`,
        claimId,
        fileUrl: draft?.receipt?.fileUrl || "/receipts/demo_indian_oil.jpg",
        fileName: draft?.receipt?.fileName || "receipt.jpg",
        mimeType: draft?.receipt?.mimeType || "image/jpeg",
        fileSize: draft?.receipt?.sizeBytes || 240000,
        imageHash: receiptData.imageHash,
        rawOcrText: draft?.extracted?.rawText,
        ocrConfidence: receiptData.ocrConfidence,
        createdAt: now,
      },
      riskAssessment: {
        id: `risk_${claimId.toLowerCase()}`,
        claimId,
        score: riskResult.score,
        level: riskResult.level,
        recommendedAction: riskResult.recommendedAction,
        summary: aiExplanation.executiveSummary,
        rulesTriggered: riskResult.rulesTriggered,
        signals,
        createdAt: now,
      },
      auditLogs: [
        {
          id: `aud_${Date.now()}_1`,
          claimId,
          actorType: "EMPLOYEE",
          actorId: employee.id,
          action: "CLAIM_SUBMITTED",
          details: { amount: Number(amount), vendor: vendorName, category, date, employeeNotes },
          createdAt: now,
        },
        {
          id: `aud_${Date.now()}_2`,
          claimId,
          actorType: "SYSTEM_FRAUD_ENGINE",
          actorId: "system_fraud_engine",
          action: "FRAUD_EVALUATED",
          details: {
            score: riskResult.score,
            level: riskResult.level,
            signalCount: signals.length,
            recommendedAction: riskResult.recommendedAction,
          },
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    db.saveClaim(newClaim);

    return NextResponse.json(
      {
        success: true,
        data: newClaim,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { message: err.message || "Failed to submit claim" } },
      { status: 500 }
    );
  }
}
