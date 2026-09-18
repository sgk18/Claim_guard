import type { FraudSignal, RiskAssessment, RiskLevel } from "@/types";

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED";
  rulesTriggered: string[];
}

export function calculateDeterministicRiskScore(signals: FraudSignal[]): RiskScoreResult {
  let score = 0;
  const rulesTriggered: string[] = [];

  for (const sig of signals) {
    score += sig.scoreImpact;
    if (!rulesTriggered.includes(sig.type)) {
      rulesTriggered.push(sig.type);
    }
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  // Determine Level:
  // 0 - 29: LOW
  // 30 - 59: MEDIUM
  // 60 - 79: HIGH
  // 80 - 100: CRITICAL
  let level: RiskLevel = "LOW";
  let recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED" = "APPROVE_RECOMMENDED";

  if (score >= 80) {
    level = "CRITICAL";
    recommendedAction = "REJECT_RECOMMENDED";
  } else if (score >= 60) {
    level = "HIGH";
    recommendedAction = "MANUAL_REVIEW";
  } else if (score >= 30) {
    level = "MEDIUM";
    recommendedAction = "MANUAL_REVIEW";
  } else {
    level = "LOW";
    recommendedAction = "APPROVE_RECOMMENDED";
  }

  return {
    score,
    level,
    recommendedAction,
    rulesTriggered,
  };
}

export function synthesizeRiskSummary(signals: FraudSignal[], level: RiskLevel, score: number): string {
  if (signals.length === 0) {
    return "All deterministic policy, duplicate, and validation checks passed. Claim appears clean and within bounds.";
  }

  const signalSummaries = signals.map((s) => s.description).join(" ");
  return `Risk score evaluated at ${score}/100 (${level}). Signals flagged: ${signalSummaries}`;
}
