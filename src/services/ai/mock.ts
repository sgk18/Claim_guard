import { AIProvider, AIExplanationResult } from "./index";
import { FraudSignal, RiskLevel } from "@/types";

export class MockAIProvider implements AIProvider {
  async explainRiskSignals(
    claimData: {
      amount: number;
      vendorName: string;
      category: string;
      date: string;
    },
    signals: FraudSignal[],
    deterministicScore: number,
    deterministicLevel: RiskLevel
  ): Promise<AIExplanationResult> {
    const reasons = signals.map((s) => ({
      type: s.type,
      severity: s.severity,
      explanation: s.description,
    }));

    let executiveSummary = "";
    let managerTip = "";
    let recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED" = "MANUAL_REVIEW";

    if (deterministicLevel === "LOW") {
      executiveSummary = `Claim for ₹${claimData.amount.toLocaleString()} at ${claimData.vendorName} aligns with company expense policies and historical employee spending patterns.`;
      managerTip = "Standard claim within typical limits. Safe for one-click approval.";
      recommendedAction = "APPROVE_RECOMMENDED";
    } else if (deterministicLevel === "MEDIUM") {
      executiveSummary = `Claim flagged for moderate variance. Requires operational verification before payout.`;
      managerTip = "Verify whether this trip or expense had prior supervisor clearance.";
      recommendedAction = "MANUAL_REVIEW";
    } else if (deterministicLevel === "HIGH") {
      executiveSummary = `High-risk flags identified: multiple policy, duplicate, or amount discrepancies detected.`;
      managerTip = "Review the original comparison receipt image or request employee clarification before processing.";
      recommendedAction = "MANUAL_REVIEW";
    } else {
      executiveSummary = `Critical risk detected: severe duplicate or multiple compounding fraud flags present.`;
      managerTip = "Recommended for rejection or escalation to finance compliance.";
      recommendedAction = "REJECT_RECOMMENDED";
    }

    return {
      riskLevel: deterministicLevel,
      riskScore: deterministicScore,
      executiveSummary,
      reasons,
      recommendedAction,
      managerTip,
    };
  }
}
