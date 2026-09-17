import type { Claim, Employee, Policy, Trip, FraudSignal, ExtractedReceiptData } from "../../types/index.ts";
import { areImagesSimilar } from "./perceptualHash.ts";
import { validateGSTIN } from "./gstin.ts";

export interface FraudEvaluationContext {
  claim: {
    amount: number;
    category: string;
    vendorName: string;
    claimDate: string;
    gstin?: string;
    tripId?: string;
  };
  receipt: {
    imageHash: string;
    ocrConfidence: ExtractedReceiptData["confidence"];
    extractedCategory?: string;
  };
  employee: Employee;
  policy?: Policy;
  trip?: Trip;
  existingClaims: Claim[];
}

export function evaluateFraudSignals(ctx: FraudEvaluationContext): FraudSignal[] {
  const signals: FraudSignal[] = [];
  const { claim, receipt, employee, policy, trip, existingClaims } = ctx;

  // 1. DUPLICATE_RECEIPT Check
  // Check image hash match or identical vendor + amount + date within 60 days
  const duplicateClaim = existingClaims.find((prev) => {
    // Check perceptual image hash
    if (prev.receipt && areImagesSimilar(prev.receipt.imageHash, receipt.imageHash)) {
      return true;
    }
    // Check identical vendor + exact amount + identical date
    if (
      prev.vendorName.toLowerCase().trim() === claim.vendorName.toLowerCase().trim() &&
      Math.abs(prev.amount - claim.amount) < 0.01 &&
      prev.claimDate === claim.claimDate
    ) {
      return true;
    }
    return false;
  });

  if (duplicateClaim) {
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "DUPLICATE_RECEIPT",
      severity: "HIGH",
      scoreImpact: 40,
      description: `High-confidence duplicate detected. Matches claim #${duplicateClaim.id} submitted on ${duplicateClaim.claimDate} by ${duplicateClaim.employee?.name || "another employee"}.`,
      confidence: 0.98,
      metadata: {
        matchedClaimId: duplicateClaim.id,
        matchedEmployeeName: duplicateClaim.employee?.name,
        matchedDate: duplicateClaim.claimDate,
        matchedAmount: duplicateClaim.amount,
      },
      createdAt: new Date().toISOString(),
    });
  }

  // 2. AMOUNT_ANOMALY Check
  // If employee has a historical claim average and current claim is > 2x average
  if (employee.historicalClaimAvg > 0 && claim.amount > employee.historicalClaimAvg * 2) {
    const multiplier = (claim.amount / employee.historicalClaimAvg).toFixed(1);
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "AMOUNT_ANOMALY",
      severity: "MEDIUM",
      scoreImpact: 15,
      description: `Claim amount of ₹${claim.amount.toLocaleString()} is ${multiplier}x above employee's historical average of ₹${employee.historicalClaimAvg.toLocaleString()}.`,
      confidence: 0.90,
      metadata: {
        historicalAvg: employee.historicalClaimAvg,
        currentAmount: claim.amount,
        ratio: multiplier,
      },
      createdAt: new Date().toISOString(),
    });
  }

  // 3. POLICY_VIOLATION Check
  if (policy && claim.amount > policy.maxSingleClaim) {
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "POLICY_VIOLATION",
      severity: "HIGH",
      scoreImpact: 20,
      description: `Amount ₹${claim.amount.toLocaleString()} exceeds company policy limit of ₹${policy.maxSingleClaim.toLocaleString()} for ${policy.category}.`,
      confidence: 1.0,
      metadata: {
        limit: policy.maxSingleClaim,
        category: policy.category,
        excess: claim.amount - policy.maxSingleClaim,
      },
      createdAt: new Date().toISOString(),
    });
  }

  // 4. CATEGORY_MISMATCH Check
  if (receipt.extractedCategory && receipt.extractedCategory !== claim.category) {
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "CATEGORY_MISMATCH",
      severity: "HIGH",
      scoreImpact: 15,
      description: `Receipt text indicates a '${receipt.extractedCategory}' expense (e.g. food/restaurant), but was claimed under '${claim.category}'.`,
      confidence: 0.85,
      metadata: {
        claimedCategory: claim.category,
        extractedCategory: receipt.extractedCategory,
      },
      createdAt: new Date().toISOString(),
    });
  }

  // 5. DATE_MISMATCH Check
  const claimDateObj = new Date(claim.claimDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (claimDateObj > today) {
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "DATE_MISMATCH",
      severity: "HIGH",
      scoreImpact: 25,
      description: `Receipt date (${claim.claimDate}) is in the future.`,
      confidence: 1.0,
      createdAt: new Date().toISOString(),
    });
  } else if (trip) {
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    if (claimDateObj < tripStart || claimDateObj > tripEnd) {
      signals.push({
        id: `sig_${Math.random().toString(36).substring(2, 9)}`,
        claimId: "",
        type: "DATE_MISMATCH",
        severity: "MEDIUM",
        scoreImpact: 15,
        description: `Receipt date ${claim.claimDate} does not align with active trip '${trip.title}' (${trip.startDate} to ${trip.endDate}).`,
        confidence: 0.85,
        metadata: {
          tripTitle: trip.title,
          tripStart: trip.startDate,
          tripEnd: trip.endDate,
        },
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 6. GSTIN_SIGNAL Check
  if (claim.gstin) {
    const gstinResult = validateGSTIN(claim.gstin);
    if (!gstinResult.isValid) {
      signals.push({
        id: `sig_${Math.random().toString(36).substring(2, 9)}`,
        claimId: "",
        type: "GSTIN_SIGNAL",
        severity: "LOW",
        scoreImpact: 10,
        description: `Vendor GSTIN format is invalid: ${gstinResult.error}. ITC claim may be disallowed.`,
        confidence: 0.95,
        createdAt: new Date().toISOString(),
      });
    }
  } else if (policy?.requiresGstin) {
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "GSTIN_SIGNAL",
      severity: "MEDIUM",
      scoreImpact: 15,
      description: `Vendor GSTIN is missing. Company policy requires a valid GST invoice for tax deduction.`,
      confidence: 1.0,
      createdAt: new Date().toISOString(),
    });
  }

  // 7. LOW_OCR_CONFIDENCE Check
  if (
    receipt.ocrConfidence.amount < 0.70 ||
    receipt.ocrConfidence.vendorName < 0.70 ||
    receipt.ocrConfidence.date < 0.70
  ) {
    signals.push({
      id: `sig_${Math.random().toString(36).substring(2, 9)}`,
      claimId: "",
      type: "LOW_OCR_CONFIDENCE",
      severity: "LOW",
      scoreImpact: 10,
      description: `Low OCR extraction confidence. Critical receipt fields were unreadable or blurry and required manual employee entry.`,
      confidence: 0.95,
      metadata: receipt.ocrConfidence,
      createdAt: new Date().toISOString(),
    });
  }

  return signals;
}
