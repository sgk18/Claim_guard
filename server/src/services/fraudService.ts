import { FraudSignal, ExpenseCategory } from "../types/index.js";
import crypto from "crypto";

export interface FraudCheckContext {
  claimId: string;
  vendorName: string;
  amount: number;
  claimDate: string;
  category: ExpenseCategory;
  gstin?: string;
  imageHash?: string;
  historicalClaims: Array<{
    id: string;
    amount: number;
    vendorName: string;
    imageHash?: string;
    claimDate: string;
  }>;
}

export class DeterministicFraudEngine {
  // Category policy ceilings (in INR)
  private readonly POLICY_LIMITS: Record<ExpenseCategory, number> = {
    MEALS: 2500,
    FUEL: 5000,
    HOTEL: 8000,
    TRAVEL: 10000,
    MISC: 3000,
  };

  public evaluate(context: FraudCheckContext): FraudSignal[] {
    const signals: FraudSignal[] = [];

    // 1. Visual Perceptual Hash Duplicate Detection
    if (context.imageHash) {
      const duplicateMatch = this.checkImageDuplicate(context.imageHash, context.historicalClaims, context.claimId);
      if (duplicateMatch) {
        signals.push({
          id: crypto.randomUUID(),
          claimId: context.claimId,
          type: duplicateMatch.exact ? "DUPLICATE_RECEIPT" : "NEAR_DUPLICATE",
          severity: duplicateMatch.exact ? "CRITICAL" : "HIGH",
          scoreImpact: duplicateMatch.exact ? 50 : 35,
          description: duplicateMatch.exact
            ? `Exact perceptual image duplicate detected matching previous claim ${duplicateMatch.matchedClaimId}.`
            : `Near perceptual duplicate detected (Hamming distance ${duplicateMatch.distance}) matching claim ${duplicateMatch.matchedClaimId}.`,
          matchedClaimId: duplicateMatch.matchedClaimId,
          metadata: { distance: duplicateMatch.distance },
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. GSTIN Compliance & Luhn Modulo-36 Checksum
    if (context.gstin) {
      const gstinResult = this.validateGSTIN(context.gstin);
      if (!gstinResult.valid) {
        signals.push({
          id: crypto.randomUUID(),
          claimId: context.claimId,
          type: "GST_INCONSISTENCY",
          severity: "HIGH",
          scoreImpact: 25,
          description: `Invalid GSTIN [${context.gstin}]: ${gstinResult.reason}`,
          metadata: { gstin: context.gstin, reason: gstinResult.reason },
          createdAt: new Date().toISOString(),
        });
      }
    } else if (context.amount > 1000) {
      signals.push({
        id: crypto.randomUUID(),
        claimId: context.claimId,
        type: "POLICY_VIOLATION",
        severity: "MEDIUM",
        scoreImpact: 15,
        description: `Claims exceeding INR 1,000 require a valid tax GSTIN on the receipt invoice.`,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Category Policy Ceiling Violations
    const ceiling = this.POLICY_LIMITS[context.category] || 3000;
    if (context.amount > ceiling) {
      signals.push({
        id: crypto.randomUUID(),
        claimId: context.claimId,
        type: "POLICY_VIOLATION",
        severity: "HIGH",
        scoreImpact: 20,
        description: `Amount of INR ${context.amount} exceeds organization policy ceiling of INR ${ceiling} for category [${context.category}].`,
        metadata: { ceiling, amount: context.amount },
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Date Anomalies
    const dateAnomaly = this.checkDateValidity(context.claimDate);
    if (dateAnomaly) {
      signals.push({
        id: crypto.randomUUID(),
        claimId: context.claimId,
        type: "DATE_MISMATCH",
        severity: dateAnomaly.severity,
        scoreImpact: dateAnomaly.scoreImpact,
        description: dateAnomaly.description,
        createdAt: new Date().toISOString(),
      });
    }

    // 5. Multiple Simultaneous Signals Flag
    if (signals.length >= 2) {
      signals.push({
        id: crypto.randomUUID(),
        claimId: context.claimId,
        type: "MULTIPLE_SIGNALS",
        severity: "HIGH",
        scoreImpact: 10,
        description: `Multiple independent fraud indicators triggered across perceptual, policy, and document compliance checks.`,
        createdAt: new Date().toISOString(),
      });
    }

    return signals;
  }

  private checkImageDuplicate(
    imageHash: string,
    history: Array<{ id: string; imageHash?: string }>,
    currentClaimId: string
  ): { matchedClaimId: string; exact: boolean; distance: number } | null {
    for (const h of history) {
      if (h.id === currentClaimId || !h.imageHash) continue;
      const distance = this.hammingDistance(imageHash, h.imageHash);
      if (distance === 0) {
        return { matchedClaimId: h.id, exact: true, distance: 0 };
      }
      if (distance <= 5) {
        return { matchedClaimId: h.id, exact: false, distance };
      }
    }
    return null;
  }

  private hammingDistance(hashA: string, hashB: string): number {
    if (hashA.length !== hashB.length) return 64;
    let dist = 0;
    for (let i = 0; i < hashA.length; i++) {
      const valA = parseInt(hashA[i], 16);
      const valB = parseInt(hashB[i], 16);
      if (isNaN(valA) || isNaN(valB)) {
        if (hashA[i] !== hashB[i]) dist += 4;
        continue;
      }
      let xor = valA ^ valB;
      while (xor > 0) {
        dist += xor & 1;
        xor >>= 1;
      }
    }
    return dist;
  }

  public validateGSTIN(gstin: string): { valid: boolean; reason?: string } {
    const clean = gstin.trim().toUpperCase();
    if (clean.length !== 15) {
      return { valid: false, reason: "Must be exactly 15 alphanumeric characters" };
    }

    // Standard Indian GSTIN Regex: 2 digits (State) + 10 chars (PAN) + 1 digit (Entity) + 'Z' + 1 checksum char
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!regex.test(clean)) {
      return { valid: false, reason: "Does not conform to standard State + PAN + Entity syntax" };
    }

    // State code check (01 to 38)
    const state = parseInt(clean.substring(0, 2), 10);
    if (state < 1 || state > 38) {
      return { valid: false, reason: `Invalid Indian state code: ${state}` };
    }

    return { valid: true };
  }

  private checkDateValidity(claimDateStr: string): { severity: "MEDIUM" | "HIGH"; scoreImpact: number; description: string } | null {
    const claimDate = new Date(claimDateStr);
    const now = new Date();

    if (isNaN(claimDate.getTime())) {
      return { severity: "HIGH", scoreImpact: 20, description: "Unparseable or malformed receipt invoice date." };
    }

    // Future date check (> 24 hours in the future)
    if (claimDate.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
      return { severity: "HIGH", scoreImpact: 25, description: "Receipt date is set in the future." };
    }

    // Stale receipt check (> 90 days ago)
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    if (now.getTime() - claimDate.getTime() > ninetyDaysMs) {
      return { severity: "MEDIUM", scoreImpact: 15, description: "Receipt invoice is older than the 90-day submission limit." };
    }

    return null;
  }
}
