import { FraudSignal, ExpenseCategory } from "../types/index.js";
import { isPerceptualDuplicate } from "./perceptualHash.js";
import { validateGSTIN } from "./gstin.js";

export interface PolicyLimits {
  categoryCaps: Record<ExpenseCategory, number>;
  dailyMax: number;
}

export const DEFAULT_POLICY_LIMITS: PolicyLimits = {
  categoryCaps: {
    fuel: 4000,
    food: 1500,
    travel: 6000,
    lodging: 5000,
    misc: 2000,
  },
  dailyMax: 10000,
};

export interface FraudEvaluationInput {
  claimId: string;
  vendorName: string;
  amount: number;
  category: ExpenseCategory;
  claimDate: string;
  gstin?: string;
  perceptualHash?: string;
  historicalClaims: Array<{
    id: string;
    amount: number;
    vendorName: string;
    perceptualHash?: string;
    claimDate: string;
  }>;
  employeeHistoricalAvg?: number;
  tripWindow?: { startDate: string; endDate: string };
  policyLimits?: PolicyLimits;
}

export function evaluateFraudSignals(input: FraudEvaluationInput): FraudSignal[] {
  const signals: FraudSignal[] = [];
  const limits = input.policyLimits || DEFAULT_POLICY_LIMITS;

  // 1. DUPLICATE RECEIPT CHECK (Perceptual Hash Exact/Near Match)
  if (input.perceptualHash) {
    for (const hist of input.historicalClaims) {
      if (hist.id !== input.claimId && hist.perceptualHash) {
        if (isPerceptualDuplicate(input.perceptualHash, hist.perceptualHash, 4)) {
          signals.push({
            id: `sig_dup_${Date.now()}`,
            claimId: input.claimId,
            type: "DUPLICATE_RECEIPT",
            severity: "CRITICAL",
            scoreImpact: 40,
            description: `Perceptual duplicate detected matching historical claim ${hist.id} (₹${hist.amount.toLocaleString()}). Visual fingerprint matches previous submission.`,
            matchedClaimId: hist.id,
            createdAt: new Date().toISOString(),
          });
          break;
        } else if (isPerceptualDuplicate(input.perceptualHash, hist.perceptualHash, 8)) {
          signals.push({
            id: `sig_neardup_${Date.now()}`,
            claimId: input.claimId,
            type: "NEAR_DUPLICATE",
            severity: "HIGH",
            scoreImpact: 25,
            description: `High perceptual similarity with historical claim ${hist.id}. Receipt may be a cropped or re-photographed copy.`,
            matchedClaimId: hist.id,
            createdAt: new Date().toISOString(),
          });
          break;
        }
      }
    }
  }

  // 2. AMOUNT ANOMALY (>2.0x employee's historical average)
  if (input.employeeHistoricalAvg && input.employeeHistoricalAvg > 0) {
    const ratio = input.amount / input.employeeHistoricalAvg;
    if (ratio > 2.0) {
      signals.push({
        id: `sig_anom_${Date.now()}`,
        claimId: input.claimId,
        type: "AMOUNT_ANOMALY",
        severity: ratio > 3.0 ? "HIGH" : "MEDIUM",
        scoreImpact: 15,
        description: `Expenditure of ₹${input.amount.toLocaleString()} is ${(ratio * 100).toFixed(0)}% of employee baseline average (₹${input.employeeHistoricalAvg.toLocaleString()}).`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 3. POLICY CAP VIOLATION
  const cap = limits.categoryCaps[input.category] || limits.dailyMax;
  if (input.amount > cap) {
    signals.push({
      id: `sig_pol_${Date.now()}`,
      claimId: input.claimId,
      type: "POLICY_VIOLATION",
      severity: input.amount > cap * 1.5 ? "HIGH" : "MEDIUM",
      scoreImpact: 20,
      description: `Claim amount of ₹${input.amount.toLocaleString()} exceeds permissible ₹${cap.toLocaleString()} cap for '${input.category}'.`,
      createdAt: new Date().toISOString(),
    });
  }

  // 4. CATEGORY MISMATCH
  const vendorLower = input.vendorName.toLowerCase();
  if (input.category === "fuel" && (vendorLower.includes("bikanervala") || vendorLower.includes("restaurant") || vendorLower.includes("hotel"))) {
    signals.push({
      id: `sig_cat_${Date.now()}`,
      claimId: input.claimId,
      type: "CATEGORY_MISMATCH",
      severity: "MEDIUM",
      scoreImpact: 10,
      description: `Vendor '${input.vendorName}' identified as food/hospitality establishment but claimed under 'fuel'.`,
      createdAt: new Date().toISOString(),
    });
  }

  // 5. DATE MISMATCH (outside designated trip dates)
  if (input.tripWindow && input.claimDate) {
    const { startDate, endDate } = input.tripWindow;
    if (input.claimDate < startDate || input.claimDate > endDate) {
      signals.push({
        id: `sig_date_${Date.now()}`,
        claimId: input.claimId,
        type: "DATE_MISMATCH",
        severity: "MEDIUM",
        scoreImpact: 15,
        description: `Receipt date (${input.claimDate}) falls outside designated travel itinerary window (${startDate} to ${endDate}).`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 6. GST INCONSISTENCY
  if (input.gstin) {
    const gstResult = validateGSTIN(input.gstin);
    if (!gstResult.isValid) {
      signals.push({
        id: `sig_gst_${Date.now()}`,
        claimId: input.claimId,
        type: "GST_INCONSISTENCY",
        severity: "HIGH",
        scoreImpact: 15,
        description: `GSTIN '${input.gstin}' failed statutory compliance check: ${gstResult.error}. Tax credit disallowance risk.`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 7. MULTIPLE SIGNALS COMPOUNDING
  if (signals.length >= 3) {
    signals.push({
      id: `sig_mult_${Date.now()}`,
      claimId: input.claimId,
      type: "MULTIPLE_SIGNALS",
      severity: "CRITICAL",
      scoreImpact: 10,
      description: `Compounding fraud risk: ${signals.length} distinct verification breaches triggered concurrently.`,
      createdAt: new Date().toISOString(),
    });
  }

  return signals;
}
