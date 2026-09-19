import { IClaimRepository } from "../repositories/claimRepository.js";
import { DeterministicFraudEngine } from "./fraudService.js";
import { ConfigurableRiskEngine } from "./riskService.js";
import { BedrockAIService } from "./aiService.js";
import { MessagingProvider } from "../providers/messaging.js";
import { Claim, ClaimStatus, AuditLog, ExpenseCategory, Receipt } from "../types/index.js";
import crypto from "crypto";

export interface SubmitClaimInput {
  organizationId?: string;
  employeeId: string;
  vendorName: string;
  amount: number;
  currency?: string;
  claimDate: string;
  category: ExpenseCategory;
  gstin?: string;
  receipt?: Receipt;
  employeeNotes?: string;
}

export class ClaimService {
  private claimRepo: IClaimRepository;
  private fraudEngine: DeterministicFraudEngine;
  private riskEngine: ConfigurableRiskEngine;
  private aiService: BedrockAIService;
  private messagingProvider: MessagingProvider;

  constructor(
    claimRepo: IClaimRepository,
    messagingProvider: MessagingProvider
  ) {
    this.claimRepo = claimRepo;
    this.fraudEngine = new DeterministicFraudEngine();
    this.riskEngine = new ConfigurableRiskEngine();
    this.aiService = new BedrockAIService();
    this.messagingProvider = messagingProvider;
  }

  async getAllClaims(filter?: { organizationId?: string; employeeId?: string; status?: ClaimStatus }): Promise<Claim[]> {
    let claims = await this.claimRepo.getClaims();
    if (filter?.organizationId) {
      claims = claims.filter((c) => !c.organizationId || c.organizationId === filter.organizationId);
    }
    if (filter?.employeeId) {
      claims = claims.filter((c) => c.employeeId === filter.employeeId);
    }
    if (filter?.status) {
      claims = claims.filter((c) => c.status === filter.status);
    }
    return claims;
  }

  async getClaim(id: string): Promise<Claim | null> {
    const claim = await this.claimRepo.getClaimById(id);
    if (!claim) return null;

    // Check if matched duplicate claim exists for comparison
    const dupSignal = claim.riskAssessment?.signals?.find(
      (s) => s.type === "DUPLICATE_RECEIPT" || s.type === "NEAR_DUPLICATE"
    );
    if (dupSignal?.matchedClaimId) {
      const matched = await this.claimRepo.getClaimById(dupSignal.matchedClaimId);
      return { ...claim, matchedClaim: matched || undefined } as any;
    }
    return claim;
  }

  async submitClaim(input: SubmitClaimInput): Promise<Claim> {
    const claimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const orgId = input.organizationId || "a0000000-0000-0000-0000-000000000001";
    const currency = input.currency || "INR";

    // 1. Get historical claims for comparison
    const rawHistory = await this.claimRepo.getHistoricalClaimsForComparison();
    const historicalClaims = rawHistory.map((h) => ({
      id: h.id,
      amount: h.amount,
      vendorName: h.vendorName,
      imageHash: h.perceptualHash,
      claimDate: h.claimDate,
    }));

    // 2. Run Deterministic Fraud Checks
    const signals = this.fraudEngine.evaluate({
      claimId,
      vendorName: input.vendorName,
      amount: input.amount,
      claimDate: input.claimDate,
      category: input.category,
      gstin: input.gstin,
      imageHash: input.receipt?.imageHash,
      historicalClaims,
    });

    // 3. Run Configurable Risk Scoring
    const ocrConf = input.receipt?.ocrConfidence?.total || 0.95;
    const riskAssessment = this.riskEngine.calculateRisk({
      claimId,
      signals,
      ocrConfidence: ocrConf,
      amount: input.amount,
    });

    // 4. Generate AI Explanation (AWS Bedrock Claude 3.5 Sonnet)
    const aiNarrative = await this.aiService.generateManagerExplanation({
      claimId,
      vendorName: input.vendorName,
      amount: input.amount,
      currency,
      category: input.category,
      claimDate: input.claimDate,
      gstin: input.gstin,
      authenticityState: riskAssessment.authenticityState || "REVIEW REQUIRED",
      score: riskAssessment.score,
      signals,
    });
    riskAssessment.aiNarrative = aiNarrative;

    // 5. Derive Initial Status
    let status: ClaimStatus = "PENDING";
    if (riskAssessment.authenticityState === "SUSPICIOUS" || riskAssessment.level === "CRITICAL") {
      status = "REVIEW_REQUIRED";
    }

    const employee = await this.claimRepo.getEmployee(input.employeeId);

    const claim: Claim = {
      id: claimId,
      organizationId: orgId,
      employeeId: input.employeeId,
      employeeName: employee?.name || "Employee",
      vendorName: input.vendorName,
      amount: input.amount,
      currency,
      claimDate: input.claimDate,
      category: input.category,
      gstin: input.gstin,
      status,
      employeeNotes: input.employeeNotes,
      receipt: input.receipt,
      riskAssessment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.claimRepo.createClaim(claim);

    // 6. Record Audit Log
    await this.claimRepo.addAuditLog(claimId, {
      id: crypto.randomUUID(),
      claimId,
      organizationId: orgId,
      actorType: "EMPLOYEE",
      actorId: input.employeeId,
      actorName: employee?.name,
      action: "CLAIM_SUBMITTED",
      details: {
        amount: input.amount,
        vendor: input.vendorName,
        authenticityState: riskAssessment.authenticityState,
        riskScore: riskAssessment.score,
      },
      createdAt: new Date().toISOString(),
    });

    // 7. Emit Notification
    try {
      await this.messagingProvider.sendNotification({
        to: input.employeeId,
        channel: "webview",
        template: "claim_submitted",
        variables: {
          claimId,
          amount: `${currency} ${input.amount}`,
          vendor: input.vendorName,
        },
      });
    } catch (e) {
      console.warn("Notification dispatch skipped:", e);
    }

    return claim;
  }

  async confirmClaim(id: string, confirmedData: Partial<Claim>): Promise<Claim | null> {
    const claim = await this.claimRepo.getClaimById(id);
    if (!claim) return null;

    if (confirmedData.vendorName) claim.vendorName = confirmedData.vendorName;
    if (confirmedData.amount) claim.amount = confirmedData.amount;
    if (confirmedData.category) claim.category = confirmedData.category;
    if (confirmedData.claimDate) claim.claimDate = confirmedData.claimDate;
    if (confirmedData.gstin) claim.gstin = confirmedData.gstin;

    claim.status = "PENDING";
    claim.updatedAt = new Date().toISOString();

    await this.claimRepo.addAuditLog(id, {
      id: crypto.randomUUID(),
      claimId: id,
      organizationId: claim.organizationId,
      actorType: "EMPLOYEE",
      actorId: claim.employeeId,
      action: "CLAIM_CONFIRMED_BY_EMPLOYEE",
      details: confirmedData,
      createdAt: new Date().toISOString(),
    });

    return claim;
  }

  async approveClaim(id: string, managerId: string, notes?: string): Promise<Claim | null> {
    const updated = await this.claimRepo.updateClaimStatus(id, "APPROVED", notes);
    if (!updated) return null;

    await this.claimRepo.addAuditLog(id, {
      id: crypto.randomUUID(),
      claimId: id,
      organizationId: updated.organizationId,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLAIM_APPROVED",
      details: { notes: notes || "Approved" },
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  async rejectClaim(id: string, managerId: string, reason: string): Promise<Claim | null> {
    if (!reason || reason.trim() === "") {
      throw new Error("Rejection reason is mandatory");
    }

    const updated = await this.claimRepo.updateClaimStatus(id, "REJECTED", reason);
    if (!updated) return null;

    updated.rejectionReason = reason;

    await this.claimRepo.addAuditLog(id, {
      id: crypto.randomUUID(),
      claimId: id,
      organizationId: updated.organizationId,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLAIM_REJECTED",
      details: { reason },
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  async requestClarification(id: string, managerId: string, message: string): Promise<Claim | null> {
    const updated = await this.claimRepo.updateClaimStatus(id, "CLARIFICATION_REQUESTED", message);
    if (!updated) return null;

    await this.claimRepo.addAuditLog(id, {
      id: crypto.randomUUID(),
      claimId: id,
      organizationId: updated.organizationId,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLARIFICATION_REQUESTED",
      details: { message },
      createdAt: new Date().toISOString(),
    });

    return updated;
  }

  async getAuditHistory(id: string): Promise<AuditLog[]> {
    const claim = await this.claimRepo.getClaimById(id);
    return (claim as any)?.auditLogs || [];
  }
}
