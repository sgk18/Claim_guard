import { RiskLevel, FraudSignal } from "../types/index.js";

export interface RiskExplanation {
  summary: string;
  recommendedAction: "APPROVE_RECOMMENDED" | "REJECT_RECOMMENDED" | "REVIEW_RECOMMENDED";
  managerTips: string[];
}

export interface AIProvider {
  explainRisk(
    claimData: {
      amount: number;
      vendorName: string;
      category: string;
      claimDate: string;
    },
    riskAssessment: {
      score: number;
      level: RiskLevel;
      signals: FraudSignal[];
    }
  ): Promise<RiskExplanation>;
}

export class MockAIProvider implements AIProvider {
  async explainRisk(
    claimData: { amount: number; vendorName: string; category: string; claimDate: string },
    riskAssessment: { score: number; level: RiskLevel; signals: FraudSignal[] }
  ): Promise<RiskExplanation> {
    const { score, level, signals } = riskAssessment;

    if (level === "CRITICAL" || score >= 80) {
      return {
        summary: `Multiple high-severity risk signals detected. This claim presents visual duplicate characteristics and substantial policy deviations. Immediate review and justification required before disbursing funds.`,
        recommendedAction: "REJECT_RECOMMENDED",
        managerTips: [
          "Compare the receipt image against historical submissions.",
          "Check if fuel or lodging was already reimbursed for this trip route.",
          "Contact employee for original tax invoice before clearance.",
        ],
      };
    }

    if (level === "HIGH" || score >= 60) {
      const reasons = signals.map((s) => s.type.replace(/_/g, " ").toLowerCase()).join(", ");
      return {
        summary: `Claim flagged with high risk due to ${reasons || "policy deviations"}. Verify documentation validity against travel itinerary.`,
        recommendedAction: "REVIEW_RECOMMENDED",
        managerTips: [
          "Verify the GSTIN matches the vendor on the state tax portal.",
          "Request supervisor confirmation for the expense exception.",
        ],
      };
    }

    if (level === "MEDIUM" || score >= 30) {
      return {
        summary: `Minor policy variance or moderate historical deviation detected. The claim is eligible for clearance subject to standard verification.`,
        recommendedAction: "REVIEW_RECOMMENDED",
        managerTips: [
          "Verify the date coincides with the active assignment window.",
        ],
      };
    }

    return {
      summary: `Clean submission verified. Extracted receipt values, GSTIN format, and expenditure amounts are within permissible guidelines.`,
      recommendedAction: "APPROVE_RECOMMENDED",
      managerTips: [
        "Receipt is compliant with company expense policy. Standard approval safe.",
      ],
    };
  }
}
