import { IOrganizationRepository } from "../repositories/organizationRepository.js";
import { Organization, JoinCode, Session, OrganizationMember, Role } from "../types/index.js";

export interface CreateOrganizationDTO {
  name: string;
  currency?: string;
  gstin?: string;
  managerName: string;
  email?: string;
  phone?: string;
}

export interface JoinOrganizationDTO {
  code: string;
  employeeName: string;
  email?: string;
  phone?: string;
}

export class OrganizationService {
  constructor(private orgRepo: IOrganizationRepository) {}

  public async registerManagerOrganization(dto: CreateOrganizationDTO): Promise<{
    organization: Organization;
    joinCode: JoinCode;
    session: Session;
  }> {
    if (!dto.name || !dto.managerName) {
      throw new Error("Company name and manager name are required");
    }

    // 1. Create Organization
    const organization = await this.orgRepo.createOrganization(dto.name, dto.currency || "INR", dto.gstin);

    // 2. Create Manager Profile
    const managerProfile = await this.orgRepo.createProfile(dto.managerName, dto.email, dto.phone);

    // 3. Add Manager Membership
    await this.orgRepo.addMember(organization.id, managerProfile.id, "MANAGER", "Management");

    // 4. Generate Join Code (e.g. CG-7K4P9X)
    const joinCode = await this.orgRepo.createJoinCode(organization.id, managerProfile.id, 100, 30);
    organization.activeJoinCode = joinCode.code;

    // 5. Create Manager Session
    const session = await this.orgRepo.createSession(managerProfile.id, organization.id, "MANAGER");

    // 6. Audit Log
    await this.orgRepo.addAuditLog({
      organizationId: organization.id,
      actorType: "MANAGER",
      actorId: managerProfile.id,
      actorName: managerProfile.fullName,
      action: "ORGANIZATION_CREATED",
      details: { organizationName: organization.name, joinCode: joinCode.code },
    });

    return { organization, joinCode, session };
  }

  public async joinWithCode(dto: JoinOrganizationDTO): Promise<{
    session: Session;
    organization: Organization;
  }> {
    if (!dto.code || !dto.employeeName) {
      throw new Error("Join code and employee name are required");
    }

    const cleanCode = dto.code.trim().toUpperCase();
    const joinCode = await this.orgRepo.getJoinCode(cleanCode);

    if (!joinCode) {
      throw new Error("Invalid join code");
    }

    if (joinCode.status !== "ACTIVE") {
      throw new Error(`Join code is ${joinCode.status.toLowerCase()}`);
    }

    if (new Date(joinCode.expiresAt) < new Date()) {
      await this.orgRepo.revokeJoinCode(cleanCode);
      throw new Error("Join code has expired");
    }

    if (joinCode.timesUsed >= joinCode.maxUses) {
      throw new Error("Join code has reached maximum capacity");
    }

    const organization = await this.orgRepo.getOrganizationById(joinCode.organizationId);
    if (!organization) {
      throw new Error("Organization not found for this join code");
    }

    // 1. Create Employee Profile
    const employeeProfile = await this.orgRepo.createProfile(dto.employeeName, dto.email, dto.phone);

    // 2. Add Employee Membership
    await this.orgRepo.addMember(organization.id, employeeProfile.id, "EMPLOYEE", "Field Operations");

    // 3. Increment join code usage
    await this.orgRepo.incrementJoinCodeUsage(cleanCode);

    // 4. Generate secure session token
    const session = await this.orgRepo.createSession(employeeProfile.id, organization.id, "EMPLOYEE");

    // 5. Audit Log
    await this.orgRepo.addAuditLog({
      organizationId: organization.id,
      actorType: "EMPLOYEE",
      actorId: employeeProfile.id,
      actorName: employeeProfile.fullName,
      action: "EMPLOYEE_JOINED",
      details: { joinCode: cleanCode },
    });

    return { session, organization };
  }

  public async regenerateJoinCode(organizationId: string, managerId?: string): Promise<JoinCode> {
    const newCode = await this.orgRepo.createJoinCode(organizationId, managerId);
    await this.orgRepo.addAuditLog({
      organizationId,
      actorType: "MANAGER",
      actorId: managerId || "system",
      action: "JOIN_CODE_REGENERATED",
      details: { code: newCode.code },
    });
    return newCode;
  }

  public async revokeJoinCode(organizationId: string, code: string, managerId?: string): Promise<boolean> {
    const success = await this.orgRepo.revokeJoinCode(code);
    if (success) {
      await this.orgRepo.addAuditLog({
        organizationId,
        actorType: "MANAGER",
        actorId: managerId || "system",
        action: "JOIN_CODE_REVOKED",
        details: { code },
      });
    }
    return success;
  }

  public async getOrganization(id: string): Promise<Organization | null> {
    return this.orgRepo.getOrganizationById(id);
  }

  public async getEmployees(organizationId: string): Promise<OrganizationMember[]> {
    return this.orgRepo.getMembers(organizationId);
  }

  public async removeEmployee(organizationId: string, employeeId: string, managerId?: string): Promise<boolean> {
    const success = await this.orgRepo.updateMemberStatus(organizationId, employeeId, "REMOVED");
    if (success) {
      await this.orgRepo.addAuditLog({
        organizationId,
        actorType: "MANAGER",
        actorId: managerId || "system",
        action: "EMPLOYEE_REMOVED",
        details: { employeeId },
      });
    }
    return success;
  }

  public async suspendEmployee(organizationId: string, employeeId: string, managerId?: string): Promise<boolean> {
    const member = await this.orgRepo.getMember(organizationId, employeeId);
    if (!member) return false;
    const newStatus = member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const success = await this.orgRepo.updateMemberStatus(organizationId, employeeId, newStatus);
    if (success) {
      await this.orgRepo.addAuditLog({
        organizationId,
        actorType: "MANAGER",
        actorId: managerId || "system",
        action: newStatus === "SUSPENDED" ? "EMPLOYEE_SUSPENDED" : "EMPLOYEE_REINSTATED",
        details: { employeeId, newStatus },
      });
    }
    return success;
  }

  public async validateSession(token: string): Promise<Session | null> {
    return this.orgRepo.getSessionByToken(token);
  }
}
