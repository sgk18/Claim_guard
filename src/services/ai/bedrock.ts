import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { AIProvider, AIExplanationResult } from "./index";
import { FraudSignal, RiskLevel } from "@/types";
import { MockAIProvider } from "./mock";

const ACTION_BY_LEVEL: Record<RiskLevel, AIExplanationResult["recommendedAction"]> = {
  LOW: "APPROVE_RECOMMENDED",
  MEDIUM: "MANUAL_REVIEW",
  HIGH: "MANUAL_REVIEW",
  CRITICAL: "REJECT_RECOMMENDED",
};

// Bedrock only writes the manager-facing narrative. It never re-scores the
// claim or overrides which action is recommended -- that stays deterministic,
// computed upstream by src/services/risk/engine.ts.
export class BedrockAIProvider implements AIProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;
  private fallback = new MockAIProvider();

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || "ap-south-1",
    });
    this.modelId = process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20241022-v2:0";
  }

  async explainRiskSignals(
    claimData: { amount: number; vendorName: string; category: string; date: string },
    signals: FraudSignal[],
    deterministicScore: number,
    deterministicLevel: RiskLevel
  ): Promise<AIExplanationResult> {
    const recommendedAction = ACTION_BY_LEVEL[deterministicLevel];
    const reasons = signals.map((s) => ({
      type: s.type,
      severity: s.severity,
      explanation: s.description,
    }));

    if (signals.length === 0) {
      // Nothing flagged -- no need to spend a model call explaining a clean claim.
      return this.fallback.explainRiskSignals(claimData, signals, deterministicScore, deterministicLevel);
    }

    try {
      const prompt = this.buildPrompt(claimData, signals, deterministicScore, deterministicLevel);
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const response = await this.client.send(command);
      const payload = JSON.parse(new TextDecoder().decode(response.body));
      const text: string = payload.content?.[0]?.text ?? "";
      const parsed = this.extractJson(text);

      return {
        riskLevel: deterministicLevel,
        riskScore: deterministicScore,
        executiveSummary: parsed.executiveSummary || `Risk score ${deterministicScore}/100 (${deterministicLevel}).`,
        reasons: parsed.reasons?.length ? parsed.reasons : reasons,
        recommendedAction,
        managerTip: parsed.managerTip || "Review the flagged signals before deciding.",
      };
    } catch {
      // A model/network failure must never block claim submission -- fall
      // back to the deterministic-text explainer.
      return this.fallback.explainRiskSignals(claimData, signals, deterministicScore, deterministicLevel);
    }
  }

  private buildPrompt(
    claimData: { amount: number; vendorName: string; category: string; date: string },
    signals: FraudSignal[],
    deterministicScore: number,
    deterministicLevel: RiskLevel
  ): string {
    return `You are writing a manager-facing summary for an expense claim risk review. You do not decide approve/reject -- a deterministic rule engine already computed the score and flagged signals below. Only explain them clearly.

Claim: ₹${claimData.amount} at "${claimData.vendorName}", category "${claimData.category}", dated ${claimData.date}.
Deterministic risk score: ${deterministicScore}/100 (${deterministicLevel}).
Flagged signals:
${signals.map((s) => `- [${s.type}, ${s.severity}] ${s.description}`).join("\n")}

Respond with ONLY a JSON object, no prose outside it, in this exact shape:
{
  "executiveSummary": "1-2 sentence plain-language summary of why this claim is risky",
  "reasons": [{"type": "SIGNAL_TYPE", "severity": "LOW|MEDIUM|HIGH", "explanation": "clear one-sentence explanation"}],
  "managerTip": "one actionable sentence telling the manager what to check or do next"
}
Include one "reasons" entry per flagged signal above, in the same order, preserving their "type" and "severity" exactly.`;
  }

  private extractJson(text: string): Partial<AIExplanationResult> {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}
