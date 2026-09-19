import crypto from "crypto";
import pg from "pg";
import {
  AuditLog,
  JoinCode,
  Organization,
  OrganizationMember,
  Profile,
  Role,
  Session,
} from "../types/index.js";
import { IOrganizationRepository } from "./organizationRepository.js";

const iso = (d: Date | string): string => (d instanceof Date ? d.toISOString() : new Date(d).toISOString());
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

function mapOrg(r: any, activeJoinCode?: string): Organization {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    currency: r.currency,
    gstin: r.gstin ?? undefined,
    activeJoinCode,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function mapProfile(r: any): Profile {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    avatarUrl: r.avatar_url ?? undefined,
    createdAt: iso(r.created_at),
  };
}

function mapJoinCode(r: any): JoinCode {
  return {
    id: r.id,
    organizationId: r.organization_id,
    code: r.code,
    status: r.status,
    maxUses: r.max_uses,
    timesUsed: r.times_used,
    expiresAt: iso(r.expires_at),
    createdBy: r.created_by ?? undefined,
    createdAt: iso(r.created_at),
  };
}

export class PgOrganizationRepository implements IOrganizationRepository {
  constructor(private pool: pg.Pool) {}

  async createOrganization(name: string, currency = "INR", gstin?: string): Promise<Organization> {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "org";
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${crypto.randomBytes(2).toString("hex")}`;
      try {
        const { rows } = await this.pool.query(
          "INSERT INTO organizations (name, slug, currency, gstin) VALUES ($1,$2,$3,$4) RETURNING *",
          [name, slug, currency, gstin ?? null]
        );
        return mapOrg(rows[0]);
      } catch (e: any) {
        if (e.code !== "23505") throw e; // retry only on slug collision
      }
    }
    throw new Error("Could not allocate a unique organization slug");
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    const { rows } = await this.pool.query("SELECT * FROM organizations WHERE id = $1", [id]);
    if (!rows[0]) return null;
    const code = await this.getActiveJoinCodeForOrg(id);
    return mapOrg(rows[0], code?.code);
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const { rows } = await this.pool.query("SELECT * FROM organizations WHERE slug = $1", [slug]);
    if (!rows[0]) return null;
    const code = await this.getActiveJoinCodeForOrg(rows[0].id);
    return mapOrg(rows[0], code?.code);
  }

  async createProfile(fullName: string, email?: string, phone?: string): Promise<Profile> {
    const { rows } = await this.pool.query(
      "INSERT INTO profiles (full_name, email, phone) VALUES ($1,$2,$3) RETURNING *",
      [fullName, email ?? null, phone ?? null]
    );
    return mapProfile(rows[0]);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const { rows } = await this.pool.query("SELECT * FROM profiles WHERE id = $1", [id]);
    return rows[0] ? mapProfile(rows[0]) : null;
  }

  private mapMember(r: any): OrganizationMember {
    return {
      id: r.id,
      organizationId: r.organization_id,
      userId: r.user_id,
      role: r.role,
      department: r.department,
      status: r.status,
      profile: r.p_id
        ? mapProfile({ id: r.p_id, full_name: r.full_name, email: r.email, phone: r.phone, avatar_url: r.avatar_url, created_at: r.p_created_at })
        : undefined,
      joinedAt: iso(r.joined_at),
    };
  }

  private static readonly MEMBER_SELECT = `
    SELECT m.*, p.id AS p_id, p.full_name, p.email, p.phone, p.avatar_url, p.created_at AS p_created_at
      FROM organization_members m LEFT JOIN profiles p ON p.id = m.user_id`;

  async addMember(organizationId: string, userId: string, role: Role, department = "Field Operations"): Promise<OrganizationMember> {
    // Re-adding an existing member resets them to ACTIVE, like the in-memory map overwrite.
    await this.pool.query(
      `INSERT INTO organization_members (organization_id, user_id, role, department, status)
       VALUES ($1,$2,$3,$4,'ACTIVE')
       ON CONFLICT (organization_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, department = EXCLUDED.department, status = 'ACTIVE', joined_at = NOW()`,
      [organizationId, userId, role, department]
    );
    return (await this.getMember(organizationId, userId))!;
  }

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { rows } = await this.pool.query(
      `${PgOrganizationRepository.MEMBER_SELECT} WHERE m.organization_id = $1 AND m.status <> 'REMOVED' ORDER BY m.joined_at`,
      [organizationId]
    );
    return rows.map((r) => this.mapMember(r));
  }

  async getMember(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    const { rows } = await this.pool.query(
      `${PgOrganizationRepository.MEMBER_SELECT} WHERE m.organization_id = $1 AND m.user_id = $2`,
      [organizationId, userId]
    );
    return rows[0] ? this.mapMember(rows[0]) : null;
  }

  async updateMemberStatus(organizationId: string, userId: string, status: "ACTIVE" | "SUSPENDED" | "REMOVED"): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      "UPDATE organization_members SET status = $3 WHERE organization_id = $1 AND user_id = $2",
      [organizationId, userId, status]
    );
    return (rowCount ?? 0) > 0;
  }

  async createJoinCode(organizationId: string, createdBy?: string, maxUses = 100, validityDays = 30): Promise<JoinCode> {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE join_codes SET status = 'EXPIRED' WHERE organization_id = $1 AND status = 'ACTIVE'",
        [organizationId]
      );
      for (let attempt = 0; attempt < 5; attempt++) {
        let body = "";
        for (let i = 0; i < 6; i++) body += chars.charAt(crypto.randomInt(chars.length));
        const code = `CG-${body}`;
        try {
          await client.query("SAVEPOINT try_code");
          const { rows } = await client.query(
            `INSERT INTO join_codes (organization_id, code, max_uses, expires_at, created_by)
             VALUES ($1,$2,$3, NOW() + make_interval(days => $4), $5) RETURNING *`,
            [organizationId, code, maxUses, validityDays, createdBy ?? null]
          );
          await client.query("COMMIT");
          return mapJoinCode(rows[0]);
        } catch (e: any) {
          if (e.code !== "23505") throw e;
          await client.query("ROLLBACK TO SAVEPOINT try_code");
        }
      }
      throw new Error("Could not generate a unique join code");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw e;
    } finally {
      client.release();
    }
  }

  async getJoinCode(code: string): Promise<JoinCode | null> {
    const { rows } = await this.pool.query("SELECT * FROM join_codes WHERE code = $1", [code.toUpperCase().trim()]);
    return rows[0] ? mapJoinCode(rows[0]) : null;
  }

  async getActiveJoinCodeForOrg(organizationId: string): Promise<JoinCode | null> {
    await this.pool.query(
      "UPDATE join_codes SET status = 'EXPIRED' WHERE organization_id = $1 AND status = 'ACTIVE' AND expires_at <= NOW()",
      [organizationId]
    );
    const { rows } = await this.pool.query(
      "SELECT * FROM join_codes WHERE organization_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1",
      [organizationId]
    );
    return rows[0] ? mapJoinCode(rows[0]) : null;
  }

  async revokeJoinCode(code: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      "UPDATE join_codes SET status = 'REVOKED' WHERE code = $1",
      [code.toUpperCase().trim()]
    );
    return (rowCount ?? 0) > 0;
  }

  async incrementJoinCodeUsage(code: string): Promise<void> {
    await this.pool.query(
      `UPDATE join_codes
          SET times_used = times_used + 1,
              status = CASE WHEN times_used + 1 >= max_uses THEN 'EXPIRED' ELSE status END
        WHERE code = $1`,
      [code.toUpperCase().trim()]
    );
  }

  async createSession(userId: string, organizationId: string, role: Role): Promise<Session> {
    const profile = await this.getProfileById(userId);
    const org = await this.getOrganizationById(organizationId);
    if (!profile || !org) throw new Error("Invalid userId or organizationId for session");

    const token = `cg_sess_${crypto.randomBytes(24).toString("hex")}`;
    const { rows } = await this.pool.query(
      `INSERT INTO sessions (token_hash, user_id, organization_id, role, expires_at)
       VALUES ($1,$2,$3,$4, NOW() + INTERVAL '30 days') RETURNING *`,
      [sha256(token), userId, organizationId, role]
    );
    return {
      id: rows[0].id,
      token,
      userId,
      organizationId,
      role,
      profile,
      organization: org,
      expiresAt: iso(rows[0].expires_at),
      createdAt: iso(rows[0].created_at),
    };
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const hash = sha256(token);
    const { rows } = await this.pool.query("SELECT * FROM sessions WHERE token_hash = $1", [hash]);
    const s = rows[0];
    if (!s) return null;
    if (new Date(s.expires_at) < new Date()) {
      await this.pool.query("DELETE FROM sessions WHERE token_hash = $1", [hash]);
      return null;
    }
    const [profile, org] = await Promise.all([this.getProfileById(s.user_id), this.getOrganizationById(s.organization_id)]);
    if (!profile || !org) return null;
    return {
      id: s.id,
      token,
      userId: s.user_id,
      organizationId: s.organization_id,
      role: s.role,
      profile,
      organization: org,
      expiresAt: iso(s.expires_at),
      createdAt: iso(s.created_at),
    };
  }

  async revokeSession(token: string): Promise<boolean> {
    const { rowCount } = await this.pool.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
    return (rowCount ?? 0) > 0;
  }

  async addAuditLog(log: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    const id = crypto.randomUUID();
    const { rows } = await this.pool.query(
      `INSERT INTO audit_logs (id, organization_id, claim_id, actor_type, actor_id, actor_name, action, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING created_at`,
      [
        id, log.organizationId ?? null, log.claimId ?? null, log.actorType, log.actorId ?? null,
        log.actorName ?? null, log.action, JSON.stringify(log.details ?? {}),
      ]
    );
    return { ...log, id, createdAt: iso(rows[0].created_at) };
  }

  async getAuditLogs(organizationId: string, claimId?: string): Promise<AuditLog[]> {
    const { rows } = await this.pool.query(
      `SELECT * FROM audit_logs WHERE organization_id = $1 AND ($2::text IS NULL OR claim_id = $2)
        ORDER BY created_at DESC`,
      [organizationId, claimId ?? null]
    );
    return rows.map((r) => ({
      id: r.id,
      organizationId: r.organization_id ?? undefined,
      claimId: r.claim_id ?? undefined,
      actorType: r.actor_type,
      actorId: r.actor_id ?? undefined,
      actorName: r.actor_name ?? undefined,
      action: r.action,
      details: r.details ?? undefined,
      createdAt: iso(r.created_at),
    }));
  }
}
