import { FraudSignal, RiskLevel } from "@/types";

export interface AIExplanationResult {
  riskLevel: RiskLevel;
  riskScore: number;
  executiveSummary: string;
  reasons: Array<{
    type: string;
    severity: string;
    explanation: string;
  }>;
  recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED";
  managerTip: string;
}

export interface AIProvider {
  explainRiskSignals(
    claimData: {
      amount: number;
      vendorName: string;
      category: string;
      date: string;
    },
    signals: FraudSignal[],
    deterministicScore: number,
    deterministicLevel: RiskLevel
  ): Promise<AIExplanationResult>;
}
