import {
  RiskAssessment,
  RiskLevel,
  AuthenticityState,
  FraudSignal,
} from "../types/index.js";
import crypto from "crypto";

export interface RiskEvaluationInput {
  claimId: string;
  signals: FraudSignal[];
  ocrConfidence: number; // 0.0 - 1.0
  amount: number;
}

export class ConfigurableRiskEngine {
  public calculateRisk(input: RiskEvaluationInput): RiskAssessment {
    // 1. Calculate baseline risk score from triggered fraud signals
    let totalScore = 0;
    const rulesTriggered: string[] = [];

    for (const sig of input.signals) {
      totalScore += sig.scoreImpact;
      if (!rulesTriggered.includes(sig.type)) {
        rulesTriggered.push(sig.type);
      }
    }

    // Adjust for OCR confidence: lower OCR confidence adds uncertainty risk
    if (input.ocrConfidence < 0.6) {
      totalScore += 20;
      rulesTriggered.push("LOW_OCR_CONFIDENCE");
    } else if (input.ocrConfidence < 0.8) {
      totalScore += 10;
    }

    // Clamp score to 0–100 range
    const score = Math.min(100, Math.max(0, totalScore));

    // 2. Derive Risk Level
    let level: RiskLevel;
    if (score < 30) {
      level = "LOW";
    } else if (score < 60) {
      level = "MEDIUM";
    } else if (score < 85) {
      level = "HIGH";
    } else {
      level = "CRITICAL";
    }

    // 3. Derive Evidence-Based Authenticity State (Section 17)
    // Never output absolute "100% REAL"
    let authenticityState: AuthenticityState;
    if (input.ocrConfidence < 0.5) {
      authenticityState = "UNABLE TO VERIFY";
    } else if (score >= 80 || rulesTriggered.includes("DUPLICATE_RECEIPT")) {
      authenticityState = "SUSPICIOUS";
    } else if (score >= 40) {
      authenticityState = "REVIEW REQUIRED";
    } else if (score >= 20) {
      authenticityState = "LIKELY VALID";
    } else {
      authenticityState = "VERIFIED";
    }

    // 4. Recommend Action
    let recommendedAction: "APPROVE" | "REJECT" | "REVIEW" | "CLARIFICATION";
    if (authenticityState === "VERIFIED" && score <= 20) {
      recommendedAction = "APPROVE";
    } else if (authenticityState === "SUSPICIOUS") {
      recommendedAction = "REJECT";
    } else if (authenticityState === "UNABLE TO VERIFY") {
      recommendedAction = "CLARIFICATION";
    } else {
      recommendedAction = "REVIEW";
    }

    // 5. Generate Summary
    let summary: string;
    if (input.signals.length === 0) {
      summary = `Receipt details verified cleanly with ${(input.ocrConfidence * 100).toFixed(0)}% OCR confidence. Compliant with company policy.`;
    } else {
      summary = `${input.signals.length} verification signal(s) flagged: ${rulesTriggered.join(", ")}. Risk score: ${score}/100.`;
    }

    return {
      id: crypto.randomUUID(),
      claimId: input.claimId,
      score,
      level,
      authenticityState,
      recommendedAction,
      summary,
      signals: input.signals,
      rulesTriggered,
      createdAt: new Date().toISOString(),
    };
  }
}
