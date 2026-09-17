import { IClaimRepository } from "../repositories/claimRepository.js";
import { evaluateFraudSignals } from "../domain/rules.js";
import { RiskService } from "./riskService.js";
import { MessagingProvider } from "../providers/messaging.js";
import { Claim, ClaimStatus, AuditLog } from "../types/index.js";

export class ClaimService {
  private claimRepo: IClaimRepository;
  private riskService: RiskService;
  private messagingProvider: MessagingProvider;

  constructor(
    claimRepo: IClaimRepository,
    riskService: RiskService,
    messagingProvider: MessagingProvider
  ) {
    this.claimRepo = claimRepo;
    this.riskService = riskService;
    this.messagingProvider = messagingProvider;
  }

  async getAllClaims(): Promise<Claim[]> {
    return this.claimRepo.getClaims();
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

  async submitClaim(input: {
    employeeId: string;
    vendorName: string;
    amount: number;
    claimDate: string;
    category: any;
    gstin?: string;
    receipt?: any;
    employeeNotes?: string;
  }): Promise<Claim> {
    const employee = await this.claimRepo.getEmployee(input.employeeId);
    const historicalClaims = await this.claimRepo.getHistoricalClaimsForComparison();
    const claimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Run Deterministic Fraud Checks
    const signals = evaluateFraudSignals({
      claimId,
      vendorName: input.vendorName,
      amount: input.amount,
      category: input.category,
      claimDate: input.claimDate,
      gstin: input.gstin,
      perceptualHash: input.receipt?.perceptualHash,
      historicalClaims,
      employeeHistoricalAvg: employee?.historicalClaimAvg,
    });

    // 2. Run Deterministic Risk Calculation
    const riskAssessment = await this.riskService.calculateRisk(
      claimId,
      signals,
      {
        amount: input.amount,
        vendorName: input.vendorName,
        category: input.category,
        claimDate: input.claimDate,
      }
    );

    // Initial status:
    // If low risk (score < 30) -> PENDING or AUTO-APPROVED if policy dictates.
    // In ClaimGuard ("AI Assists, Humans Decide"), medium, high, and critical require manager review.
    let status: ClaimStatus = "PENDING";
    if (riskAssessment.level === "CRITICAL" || riskAssessment.level === "HIGH") {
      status = "REVIEW_REQUIRED";
    } else if (riskAssessment.level === "MEDIUM") {
      status = "REVIEW_REQUIRED";
    }

    const auditLogs: AuditLog[] = [
      {
        id: `aud_${Date.now()}_1`,
        claimId,
        actorType: "EMPLOYEE",
        actorId: input.employeeId,
        action: "CLAIM_SUBMITTED",
        details: { amount: input.amount, vendor: input.vendorName },
        createdAt: new Date().toISOString(),
      },
      {
        id: `aud_${Date.now()}_2`,
        claimId,
        actorType: "SYSTEM_FRAUD_ENGINE",
        action: "RISK_EVALUATED",
        details: { score: riskAssessment.score, level: riskAssessment.level, flags: signals.length },
        createdAt: new Date().toISOString(),
      },
    ];

    const claim: Claim = {
      id: claimId,
      employeeId: input.employeeId,
      companyId: employee?.companyId || "comp_apex_01",
      vendorName: input.vendorName,
      amount: input.amount,
      currency: "INR",
      claimDate: input.claimDate,
      category: input.category,
      gstin: input.gstin,
      status,
      employeeNotes: input.employeeNotes,
      receipt: input.receipt ? {
        id: `rcpt_${claimId}`,
        claimId,
        fileName: input.receipt.fileName || "receipt.jpg",
        fileUrl: input.receipt.fileUrl || "/receipts/demo_indian_oil.jpg",
        fileSizeBytes: input.receipt.fileSizeBytes || 250000,
        mimeType: input.receipt.mimeType || "image/jpeg",
        storageKey: input.receipt.storageKey || "receipts/demo.jpg",
        perceptualHash: input.receipt.perceptualHash,
        rawOcrText: input.receipt.rawOcrText,
        createdAt: new Date().toISOString(),
      } : undefined,
      riskAssessment,
      auditLogs,
      employee: employee || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.claimRepo.createClaim(claim);

    // Notify employee of submission state
    await this.messagingProvider.sendMessage({
      recipientId: input.employeeId,
      text: `Claim ${claimId} submitted for ₹${input.amount.toLocaleString()}. Current status: ${status}.`,
    });

    return claim;
  }

  async approveClaim(claimId: string, managerId: string, notes: string): Promise<Claim | null> {
    const updated = await this.claimRepo.updateClaimStatus(claimId, "APPROVED", notes);
    if (!updated) return null;

    const auditLog: AuditLog = {
      id: `aud_${Date.now()}`,
      claimId,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLAIM_APPROVED",
      details: { notes, timestamp: new Date().toISOString() },
      createdAt: new Date().toISOString(),
    };
    await this.claimRepo.addAuditLog(claimId, auditLog);

    await this.messagingProvider.sendMessage({
      recipientId: updated.employeeId,
      text: `Your claim ${claimId} (₹${updated.amount.toLocaleString()}) has been APPROVED by your manager.`,
    });

    return updated;
  }

  async rejectClaim(claimId: string, managerId: string, notes: string): Promise<Claim | null> {
    const updated = await this.claimRepo.updateClaimStatus(claimId, "REJECTED", notes);
    if (!updated) return null;

    const auditLog: AuditLog = {
      id: `aud_${Date.now()}`,
      claimId,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLAIM_REJECTED",
      details: { notes, timestamp: new Date().toISOString() },
      createdAt: new Date().toISOString(),
    };
    await this.claimRepo.addAuditLog(claimId, auditLog);

    await this.messagingProvider.sendMessage({
      recipientId: updated.employeeId,
      text: `Notice: Your claim ${claimId} (₹${updated.amount.toLocaleString()}) was REJECTED: ${notes}`,
    });

    return updated;
  }

  async requestClarification(claimId: string, managerId: string, question: string): Promise<Claim | null> {
    const updated = await this.claimRepo.updateClaimStatus(claimId, "ACTION_REQUIRED", question);
    if (!updated) return null;

    const auditLog: AuditLog = {
      id: `aud_${Date.now()}`,
      claimId,
      actorType: "MANAGER",
      actorId: managerId,
      action: "CLARIFICATION_REQUESTED",
      details: { question },
      createdAt: new Date().toISOString(),
    };
    await this.claimRepo.addAuditLog(claimId, auditLog);

    await this.messagingProvider.sendMessage({
      recipientId: updated.employeeId,
      text: `Manager inquiry for claim ${claimId}: "${question}". Please submit clarification.`,
    });

    return updated;
  }
}
