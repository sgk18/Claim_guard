import {
  Organization,
  Profile,
  OrganizationMember,
  JoinCode,
  Session,
  AuditLog,
  Role,
} from "../types/index.js";
import crypto from "crypto";

export interface IOrganizationRepository {
  createOrganization(name: string, currency?: string, gstin?: string): Promise<Organization>;
  getOrganizationById(id: string): Promise<Organization | null>;
  getOrganizationBySlug(slug: string): Promise<Organization | null>;
  createProfile(fullName: string, email?: string, phone?: string): Promise<Profile>;
  getProfileById(id: string): Promise<Profile | null>;
  addMember(organizationId: string, userId: string, role: Role, department?: string): Promise<OrganizationMember>;
  getMembers(organizationId: string): Promise<OrganizationMember[]>;
  getMember(organizationId: string, userId: string): Promise<OrganizationMember | null>;
  updateMemberStatus(organizationId: string, userId: string, status: "ACTIVE" | "SUSPENDED" | "REMOVED"): Promise<boolean>;
  createJoinCode(organizationId: string, createdBy?: string, maxUses?: number, validityDays?: number): Promise<JoinCode>;
  getJoinCode(code: string): Promise<JoinCode | null>;
  getActiveJoinCodeForOrg(organizationId: string): Promise<JoinCode | null>;
  revokeJoinCode(code: string): Promise<boolean>;
  incrementJoinCodeUsage(code: string): Promise<void>;
  createSession(userId: string, organizationId: string, role: Role): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | null>;
  revokeSession(token: string): Promise<boolean>;
  addAuditLog(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog>;
  getAuditLogs(organizationId: string, claimId?: string): Promise<AuditLog[]>;
}

export class InMemoryOrganizationRepository implements IOrganizationRepository {
  private organizations: Map<string, Organization> = new Map();
  private profiles: Map<string, Profile> = new Map();
  private members: Map<string, OrganizationMember> = new Map();
  private joinCodes: Map<string, JoinCode> = new Map();
  private sessions: Map<string, Session> = new Map();
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed default Org: ABC Technologies Pvt Ltd
    const orgId = "a0000000-0000-0000-0000-000000000001";
    const org: Organization = {
      id: orgId,
      name: "ABC Technologies Pvt Ltd",
      slug: "abc-tech",
      currency: "INR",
      gstin: "27AABCA1234F1Z5",
      activeJoinCode: "CG-7K4P9X",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.organizations.set(orgId, org);

    // Seed Manager Profile: Priya Sharma
    const mgrId = "b0000000-0000-0000-0000-000000000001";
    const mgrProfile: Profile = {
      id: mgrId,
      fullName: "Priya Sharma",
      email: "priya.sharma@abctech.example.com",
      phone: "+919876543210",
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(mgrId, mgrProfile);

    // Seed Employee Profile: Rahul Kumar
    const empId = "b0000000-0000-0000-0000-000000000002";
    const empProfile: Profile = {
      id: empId,
      fullName: "Rahul Kumar",
      email: "rahul.kumar@abctech.example.com",
      phone: "+919812345678",
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(empId, empProfile);

    // Add Memberships
    this.members.set(`${orgId}:${mgrId}`, {
      id: "mem-mgr-1",
      organizationId: orgId,
      userId: mgrId,
      role: "MANAGER",
      department: "Finance & Operations",
      status: "ACTIVE",
      profile: mgrProfile,
      joinedAt: new Date().toISOString(),
    });

    this.members.set(`${orgId}:${empId}`, {
      id: "mem-emp-1",
      organizationId: orgId,
      userId: empId,
      role: "EMPLOYEE",
      department: "Field Sales",
      status: "ACTIVE",
      profile: empProfile,
      joinedAt: new Date().toISOString(),
    });

    // Seed Join Code CG-7K4P9X
    const code = "CG-7K4P9X";
    this.joinCodes.set(code, {
      id: "jc-1",
      organizationId: orgId,
      code,
      status: "ACTIVE",
      maxUses: 100,
      timesUsed: 1,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: mgrId,
      createdAt: new Date().toISOString(),
    });

    // Seed Default Active Sessions for immediate review
    const mgrToken = "mgr_session_token_priya";
    this.sessions.set(mgrToken, {
      id: "sess-mgr-1",
      token: mgrToken,
      userId: mgrId,
      organizationId: orgId,
      role: "MANAGER",
      profile: mgrProfile,
      organization: org,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });

    const empToken = "emp_session_token_rahul";
    this.sessions.set(empToken, {
      id: "sess-emp-1",
      token: empToken,
      userId: empId,
      organizationId: orgId,
      role: "EMPLOYEE",
      profile: empProfile,
      organization: org,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  async createOrganization(name: string, currency = "INR", gstin?: string): Promise<Organization> {
    const id = crypto.randomUUID();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const org: Organization = {
      id,
      name,
      slug,
      currency,
      gstin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.organizations.set(id, org);
    return org;
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const org = this.organizations.get(id);
    if (!org) return null;
    const activeCode = await this.getActiveJoinCodeForOrg(id);
    return { ...org, activeJoinCode: activeCode?.code };
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    for (const org of this.organizations.values()) {
      if (org.slug === slug) {
        const activeCode = await this.getActiveJoinCodeForOrg(org.id);
        return { ...org, activeJoinCode: activeCode?.code };
      }
    }
    return null;
  }

  async createProfile(fullName: string, email?: string, phone?: string): Promise<Profile> {
    const id = crypto.randomUUID();
    const profile: Profile = {
      id,
      fullName,
      email,
      phone,
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async getProfileById(id: string): Promise<Profile | null> {
    return this.profiles.get(id) || null;
  }

  async addMember(organizationId: string, userId: string, role: Role, department = "Field Operations"): Promise<OrganizationMember> {
    const key = `${organizationId}:${userId}`;
    const profile = await this.getProfileById(userId);
    const member: OrganizationMember = {
      id: crypto.randomUUID(),
      organizationId,
      userId,
      role,
      department,
      status: "ACTIVE",
      profile: profile || undefined,
      joinedAt: new Date().toISOString(),
    };
    this.members.set(key, member);
    return member;
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const list: OrganizationMember[] = [];
    for (const m of this.members.values()) {
      if (m.organizationId === organizationId && m.status !== "REMOVED") {
        const profile = await this.getProfileById(m.userId);
        list.push({ ...m, profile: profile || undefined });
      }
    }
    return list;
  }

  async getMember(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    const m = this.members.get(`${organizationId}:${userId}`);
    if (!m) return null;
    const profile = await this.getProfileById(userId);
    return { ...m, profile: profile || undefined };
  }

  async updateMemberStatus(organizationId: string, userId: string, status: "ACTIVE" | "SUSPENDED" | "REMOVED"): Promise<boolean> {
    const key = `${organizationId}:${userId}`;
    const m = this.members.get(key);
    if (!m) return false;
    m.status = status;
    this.members.set(key, m);
    return true;
  }

  async createJoinCode(organizationId: string, createdBy?: string, maxUses = 100, validityDays = 30): Promise<JoinCode> {
    // Invalidate existing active codes for this org
    for (const jc of this.joinCodes.values()) {
      if (jc.organizationId === organizationId && jc.status === "ACTIVE") {
        jc.status = "EXPIRED";
      }
    }

    // Generate readable code: CG-XXXXXX (6 alphanumeric chars)
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let codeBody = "";
    for (let i = 0; i < 6; i++) {
      codeBody += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `CG-${codeBody}`;

    const joinCode: JoinCode = {
      id: crypto.randomUUID(),
      organizationId,
      code,
      status: "ACTIVE",
      maxUses,
      timesUsed: 0,
      expiresAt: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
      createdBy,
      createdAt: new Date().toISOString(),
    };

    this.joinCodes.set(code, joinCode);

    // Update org activeJoinCode
    const org = this.organizations.get(organizationId);
    if (org) {
      org.activeJoinCode = code;
    }

    return joinCode;
  }

  async getJoinCode(code: string): Promise<JoinCode | null> {
    return this.joinCodes.get(code.toUpperCase().trim()) || null;
  }

  async getActiveJoinCodeForOrg(organizationId: string): Promise<JoinCode | null> {
    for (const jc of this.joinCodes.values()) {
      if (jc.organizationId === organizationId && jc.status === "ACTIVE") {
        if (new Date(jc.expiresAt) > new Date()) {
          return jc;
        } else {
          jc.status = "EXPIRED";
        }
      }
    }
    return null;
  }

  async revokeJoinCode(code: string): Promise<boolean> {
    const jc = this.joinCodes.get(code.toUpperCase().trim());
    if (!jc) return false;
    jc.status = "REVOKED";
    const org = this.organizations.get(jc.organizationId);
    if (org && org.activeJoinCode === code) {
      delete org.activeJoinCode;
    }
    return true;
  }

  async incrementJoinCodeUsage(code: string): Promise<void> {
    const jc = this.joinCodes.get(code.toUpperCase().trim());
    if (jc) {
      jc.timesUsed += 1;
      if (jc.timesUsed >= jc.maxUses) {
        jc.status = "EXPIRED";
      }
    }
  }

  async createSession(userId: string, organizationId: string, role: Role): Promise<Session> {
    const token = `cg_sess_${crypto.randomBytes(24).toString("hex")}`;
    const profile = await this.getProfileById(userId);
    const org = await this.getOrganizationById(organizationId);
    if (!profile || !org) throw new Error("Invalid userId or organizationId for session");

    const session: Session = {
      id: crypto.randomUUID(),
      token,
      userId,
      organizationId,
      role,
      profile,
      organization: org,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(token, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const sess = this.sessions.get(token);
    if (!sess) return null;
    if (new Date(sess.expiresAt) < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    return sess;
  }

  async revokeSession(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  async addAuditLog(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const audit: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(audit);
    return audit;
  }

  async getAuditLogs(organizationId: string, claimId?: string): Promise<AuditLog[]> {
    return this.auditLogs.filter((l) => {
      if (l.organizationId !== organizationId) return false;
      if (claimId && l.claimId !== claimId) return false;
      return true;
    });
  }
}
