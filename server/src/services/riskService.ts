import { FraudSignal, RiskAssessment, RiskLevel } from "../types/index.js";
import { AIProvider } from "../providers/ai.js";

export class RiskService {
  private aiProvider: AIProvider;

  constructor(aiProvider: AIProvider) {
    this.aiProvider = aiProvider;
  }

  async calculateRisk(
    claimId: string,
    signals: FraudSignal[],
    claimData: { amount: number; vendorName: string; category: string; claimDate: string }
  ): Promise<RiskAssessment> {
    // 1. Calculate raw score sum
    const rawScore = signals.reduce((acc, sig) => acc + sig.scoreImpact, 0);
    const score = Math.min(100, Math.max(0, rawScore));

    // 2. Classify tier
    let level: RiskLevel = "LOW";
    if (score >= 80 || signals.some((s) => s.severity === "CRITICAL")) {
      level = "CRITICAL";
    } else if (score >= 60 || signals.some((s) => s.severity === "HIGH")) {
      level = "HIGH";
    } else if (score >= 30) {
      level = "MEDIUM";
    }

    // 3. Obtain AI Risk Explanation
    const explanation = await this.aiProvider.explainRisk(claimData, { score, level, signals });

    return {
      id: `risk_${Date.now()}`,
      claimId,
      score,
      level,
      summary: explanation.summary,
      recommendedAction: explanation.recommendedAction,
      signals,
      rulesTriggered: signals.map((s) => s.type),
      createdAt: new Date().toISOString(),
    };
  }
}
