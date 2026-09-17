import { FastifyRequest, FastifyReply } from "fastify";
import { ClaimService } from "../services/claimService.js";

export class ClaimController {
  private claimService: ClaimService;

  constructor(claimService: ClaimService) {
    this.claimService = claimService;
  }

  async getAll(req: FastifyRequest, reply: FastifyReply) {
    const claims = await this.claimService.getAllClaims();
    return reply.send({ success: true, count: claims.length, data: claims });
  }

  async getById(req: any, reply: FastifyReply) {
    const claim = await this.claimService.getClaim(req.params.id);
    if (!claim) {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "Claim not found" } });
    }
    return reply.send({ success: true, data: claim });
  }

  async submit(req: FastifyRequest, reply: FastifyReply) {
    const body = (req.body || {}) as any;
    if (!body.vendorName || !body.amount) {
      return reply.code(400).send({
        success: false,
        error: { code: "VALIDATION_FAILED", message: "vendorName and amount are required" },
      });
    }

    const claim = await this.claimService.submitClaim({
      employeeId: body.employeeId || "emp_rahul_102",
      vendorName: body.vendorName,
      amount: Number(body.amount),
      claimDate: body.claimDate || new Date().toISOString().split("T")[0],
      category: body.category || "misc",
      gstin: body.gstin,
      receipt: body.receipt,
      employeeNotes: body.employeeNotes,
    });

    return reply.code(201).send({ success: true, data: claim });
  }

  async approve(req: any, reply: FastifyReply) {
    const claimId = req.params.id;
    const { managerId = "mgr_priya_01", notes = "Approved via verification portal." } = req.body || {};

    const claim = await this.claimService.approveClaim(claimId, managerId, notes);
    if (!claim) {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "Claim not found" } });
    }
    return reply.send({ success: true, data: claim, message: "Claim approved successfully" });
  }

  async reject(req: any, reply: FastifyReply) {
    const claimId = req.params.id;
    const { managerId = "mgr_priya_01", notes = "Claim disallowed under policy rules." } = req.body || {};

    const claim = await this.claimService.rejectClaim(claimId, managerId, notes);
    if (!claim) {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "Claim not found" } });
    }
    return reply.send({ success: true, data: claim, message: "Claim rejected" });
  }

  async requestClarification(req: any, reply: FastifyReply) {
    const claimId = req.params.id;
    const { managerId = "mgr_priya_01", question = "Please provide additional receipt detail." } = req.body || {};

    const claim = await this.claimService.requestClarification(claimId, managerId, question);
    if (!claim) {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "Claim not found" } });
    }
    return reply.send({ success: true, data: claim, message: "Clarification request dispatched" });
  }

  async getAuditLogs(req: any, reply: FastifyReply) {
    const claim = await this.claimService.getClaim(req.params.id);
    if (!claim) {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "Claim not found" } });
    }
    return reply.send({ success: true, data: claim.auditLogs || [] });
  }
}
