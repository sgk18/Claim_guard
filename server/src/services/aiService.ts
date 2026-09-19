import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { FraudSignal, AuthenticityState } from "../types/index.js";

export interface AIEvaluationPrompt {
  claimId: string;
  vendorName: string;
  amount: number;
  currency: string;
  category: string;
  claimDate: string;
  gstin?: string;
  authenticityState: AuthenticityState;
  score: number;
  signals: FraudSignal[];
}

export class BedrockAIService {
  private client: BedrockRuntimeClient | null = null;
  private region: string;

  constructor() {
    this.region = process.env.AWS_REGION || "us-east-1";
    // Initialize Bedrock if AWS credentials exist
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.client = new BedrockRuntimeClient({ region: this.region });
    }
  }

  public async generateManagerExplanation(context: AIEvaluationPrompt): Promise<string> {
    if (this.client) {
      try {
        const promptText = `You are ClaimGuard AI, an expense audit explanation assistant.
Analyze this expense submission and synthesize a concise, objective 2-3 sentence risk explanation for the finance manager.
Claim Details:
- Vendor: ${context.vendorName}
- Amount: ${context.currency} ${context.amount}
- Category: ${context.category}
- Date: ${context.claimDate}
- GSTIN: ${context.gstin || "None"}
- Authenticity State: ${context.authenticityState}
- Risk Score: ${context.score}/100
- Triggered Signals: ${context.signals.map((s) => `${s.type} (${s.severity}): ${s.description}`).join("; ") || "None"}

Rules:
- State facts objectively.
- Do NOT approve or reject the claim.
- Highlight specific discrepancies if present.`;

        const payload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 300,
          messages: [{ role: "user", content: promptText }],
        };

        const command = new InvokeModelCommand({
          modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
          contentType: "application/json",
          accept: "application/json",
          body: Buffer.from(JSON.stringify(payload)),
        });

        const response = await this.client.send(command);
        const decoded = JSON.parse(new TextDecoder().decode(response.body));
        return decoded.content?.[0]?.text?.trim() || this.generateDeterministicSummary(context);
      } catch (err) {
        console.warn("Bedrock invoke failed, falling back to deterministic explanation:", err);
      }
    }

    return this.generateDeterministicSummary(context);
  }

  public async generateEmployeeSummary(context: AIEvaluationPrompt): Promise<string> {
    if (context.authenticityState === "VERIFIED" || context.authenticityState === "LIKELY VALID") {
      return `Receipt for ${context.vendorName} (${context.currency} ${context.amount}) verified cleanly. Your claim is ready for manager approval.`;
    }
    if (context.authenticityState === "SUSPICIOUS") {
      return `Potential duplicate or severe inconsistency detected with your receipt. Please ensure you have submitted the original invoice.`;
    }
    return `Receipt processed. Your manager will review this claim due to policy or verification flags.`;
  }

  private generateDeterministicSummary(context: AIEvaluationPrompt): string {
    if (context.signals.length === 0) {
      return `Invoice from ${context.vendorName} (${context.currency} ${context.amount}) verified cleanly. Tax calculations and merchant credentials conform to company expense policies with zero duplicate image signals.`;
    }

    const signalDescriptions = context.signals.map((s) => s.description).join(" ");
    return `Claim evaluated as [${context.authenticityState}] with a risk score of ${context.score}/100. Key findings: ${signalDescriptions}`;
  }
}
