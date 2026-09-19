import { FastifyRequest, FastifyReply } from "fastify";
import { OrganizationService } from "../services/organizationService.js";

export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  public registerOrganization = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any;
      const result = await this.orgService.registerManagerOrganization({
        name: body.name,
        currency: body.currency,
        gstin: body.gstin,
        managerName: body.managerName,
        email: body.email,
        phone: body.phone,
      });

      return reply.status(201).send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || "Failed to register organization",
      });
    }
  };

  public joinOrganization = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any;
      const result = await this.orgService.joinWithCode({
        code: body.code,
        employeeName: body.employeeName,
        email: body.email,
        phone: body.phone,
      });

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return reply.status(400).send({
        success: false,
        error: err.message || "Failed to join organization",
      });
    }
  };

  public regenerateJoinCode = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any;
      const orgId = body.organizationId;
      if (!orgId) {
        return reply.status(400).send({ success: false, error: "organizationId is required" });
      }

      const joinCode = await this.orgService.regenerateJoinCode(orgId, body.managerId);
      return reply.status(200).send({
        success: true,
        data: joinCode,
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: err.message || "Failed to regenerate join code",
      });
    }
  };

  public revokeJoinCode = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = req.body as any;
      const { organizationId, code, managerId } = body;
      if (!organizationId || !code) {
        return reply.status(400).send({ success: false, error: "organizationId and code are required" });
      }

      const revoked = await this.orgService.revokeJoinCode(organizationId, code, managerId);
      return reply.status(200).send({
        success: revoked,
        message: revoked ? "Join code revoked successfully" : "Code not found",
      });
    } catch (err: any) {
      return reply.status(500).send({
        success: false,
        error: err.message || "Failed to revoke join code",
      });
    }
  };

  public getOrganization = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const org = await this.orgService.getOrganization(req.params.id);
      if (!org) {
        return reply.status(404).send({ success: false, error: "Organization not found" });
      }
      return reply.status(200).send({ success: true, data: org });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  };

  public getEmployees = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const employees = await this.orgService.getEmployees(req.params.id);
      return reply.status(200).send({ success: true, data: employees });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  };

  public removeEmployee = async (
    req: FastifyRequest<{ Params: { id: string; employeeId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id, employeeId } = req.params;
      const removed = await this.orgService.removeEmployee(id, employeeId);
      return reply.status(200).send({
        success: removed,
        message: removed ? "Employee removed from organization" : "Employee not found",
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  };

  public suspendEmployee = async (
    req: FastifyRequest<{ Params: { id: string; employeeId: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id, employeeId } = req.params;
      const suspended = await this.orgService.suspendEmployee(id, employeeId);
      return reply.status(200).send({
        success: suspended,
        message: suspended ? "Employee status toggled" : "Employee not found",
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  };
}
