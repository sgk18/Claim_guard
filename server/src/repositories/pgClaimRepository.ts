import pg from "pg";
import {
  AuditLog,
  Claim,
  ClaimStatus,
  Employee,
  FraudSignal,
  Receipt,
  RiskAssessment,
} from "../types/index.js";
import { IClaimRepository } from "./claimRepository.js";

const iso = (d: Date | string | null | undefined): string =>
  d instanceof Date ? d.toISOString() : d ? new Date(d).toISOString() : new Date().toISOString();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapEmployee(r: any): Employee {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    role: r.role,
    department: r.department,
    companyId: r.company_id,
    historicalClaimCount: Number(r.historical_claim_count),
    historicalClaimAvg: Number(r.historical_claim_avg),
  };
}

function mapReceipt(r: any): Receipt {
  return {
    id: r.id,
    claimId: r.claim_id,
    fileName: r.file_name,
    fileUrl: r.file_url,
    fileSizeBytes: r.file_size,
    mimeType: r.mime_type,
    storageKey: r.storage_key,
    imageHash: r.image_hash ?? undefined,
    perceptualHash: r.perceptual_hash ?? undefined,
    rawOcrText: r.raw_ocr_text ?? undefined,
    ocrConfidence: r.ocr_confidence ?? undefined,
    lineItems: r.line_items ?? undefined,
    createdAt: iso(r.created_at),
  };
}

function mapSignal(r: any): FraudSignal {
  return {
    id: r.id,
    claimId: r.claim_id,
    type: r.type,
    severity: r.severity,
    scoreImpact: r.score_impact,
    description: r.description,
    matchedClaimId: r.matched_claim_id ?? undefined,
    metadata: r.metadata && Object.keys(r.metadata).length ? r.metadata : undefined,
    createdAt: iso(r.created_at),
  };
}

function mapAudit(r: any): AuditLog {
  return {
    id: r.id,
    organizationId: r.organization_id ?? undefined,
    claimId: r.claim_id ?? undefined,
    actorType: r.actor_type,
    actorId: r.actor_id ?? undefined,
    actorName: r.actor_name ?? undefined,
    action: r.action,
    details: r.details ?? undefined,
    createdAt: iso(r.created_at),
  };
}

export class PgClaimRepository implements IClaimRepository {
  constructor(private pool: pg.Pool) {}

  /** Attach employee, receipt, risk assessment (with signals) and audit logs to claim rows. */
  private async hydrate(rows: any[]): Promise<Claim[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);
    const empIds = [...new Set(rows.map((r) => r.employee_id))];

    const [receipts, risks, signals, audits, emps] = await Promise.all([
      this.pool.query("SELECT * FROM receipts WHERE claim_id = ANY($1)", [ids]),
      this.pool.query("SELECT * FROM risk_assessments WHERE claim_id = ANY($1)", [ids]),
      this.pool.query("SELECT * FROM fraud_signals WHERE claim_id = ANY($1) ORDER BY created_at, id", [ids]),
      this.pool.query("SELECT * FROM audit_logs WHERE claim_id = ANY($1) ORDER BY created_at, id", [ids]),
      this.pool.query("SELECT * FROM employees WHERE id = ANY($1)", [empIds]),
    ]);

    const receiptBy = new Map(receipts.rows.map((r) => [r.claim_id, mapReceipt(r)]));
    const signalsBy = new Map<string, FraudSignal[]>();
    for (const s of signals.rows) {
      const list = signalsBy.get(s.claim_id) ?? [];
      list.push(mapSignal(s));
      signalsBy.set(s.claim_id, list);
    }
    const riskBy = new Map<string, RiskAssessment>(
      risks.rows.map((r) => [
        r.claim_id,
        {
          id: r.id,
          claimId: r.claim_id,
          score: r.score,
          level: r.level,
          authenticityState: r.authenticity_state ?? undefined,
          recommendedAction: r.recommended_action,
          summary: r.summary,
          aiNarrative: r.ai_narrative ?? undefined,
          signals: signalsBy.get(r.claim_id) ?? [],
          rulesTriggered: r.rules_triggered ?? [],
          createdAt: iso(r.created_at),
        },
      ])
    );
    const auditBy = new Map<string, AuditLog[]>();
    for (const a of audits.rows) {
      const list = auditBy.get(a.claim_id) ?? [];
      list.push(mapAudit(a));
      auditBy.set(a.claim_id, list);
    }
    const empBy = new Map(emps.rows.map((e) => [e.id, mapEmployee(e)]));

    return rows.map((r): Claim => ({
      id: r.id,
      organizationId: r.organization_id ?? undefined,
      companyId: r.company_id ?? undefined,
      employeeId: r.employee_id,
      employeeName: r.employee_name ?? empBy.get(r.employee_id)?.name ?? undefined,
      vendorName: r.vendor_name,
      amount: Number(r.amount),
      currency: r.currency,
      claimDate: r.claim_date,
      category: r.category,
      gstin: r.gstin ?? undefined,
      status: r.status,
      managerNotes: r.manager_notes ?? undefined,
      employeeNotes: r.employee_notes ?? undefined,
      rejectionReason: r.rejection_reason ?? undefined,
      employee: empBy.get(r.employee_id),
      receipt: receiptBy.get(r.id),
      riskAssessment: riskBy.get(r.id),
      auditLogs: auditBy.get(r.id) ?? [],
      createdAt: iso(r.created_at),
      updatedAt: iso(r.updated_at),
    }));
  }

  async getClaims(): Promise<Claim[]> {
    const { rows } = await this.pool.query("SELECT * FROM claims ORDER BY created_at DESC");
    return this.hydrate(rows);
  }

  async getClaimById(id: string): Promise<Claim | null> {
    const { rows } = await this.pool.query("SELECT * FROM claims WHERE id = $1", [id]);
    return (await this.hydrate(rows))[0] ?? null;
  }

  async createClaim(claim: Claim): Promise<Claim> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO claims (id, organization_id, company_id, employee_id, employee_name, status, amount, currency,
                             category, vendor_name, claim_date, gstin, manager_notes, employee_notes, rejection_reason,
                             created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          claim.id, claim.organizationId ?? null, claim.companyId ?? null, claim.employeeId,
          claim.employeeName ?? claim.employee?.name ?? null, claim.status, claim.amount, claim.currency,
          claim.category, claim.vendorName, claim.claimDate, claim.gstin ?? null, claim.managerNotes ?? null,
          claim.employeeNotes ?? null, claim.rejectionReason ?? null, claim.createdAt, claim.updatedAt,
        ]
      );

      const r = claim.receipt;
      if (r) {
        await client.query(
          `INSERT INTO receipts (id, claim_id, file_url, file_name, mime_type, file_size, storage_key, image_hash,
                                 perceptual_hash, raw_ocr_text, ocr_confidence, line_items, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            r.id, claim.id, r.fileUrl, r.fileName, r.mimeType, r.fileSizeBytes, r.storageKey, r.imageHash ?? null,
            r.perceptualHash ?? null, r.rawOcrText ?? null, JSON.stringify(r.ocrConfidence ?? {}),
            JSON.stringify(r.lineItems ?? []), r.createdAt,
          ]
        );
      }

      const ra = claim.riskAssessment;
      if (ra) {
        await client.query(
          `INSERT INTO risk_assessments (id, claim_id, score, level, authenticity_state, recommended_action, summary,
                                         ai_narrative, rules_triggered, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            ra.id, claim.id, ra.score, ra.level, ra.authenticityState ?? null, ra.recommendedAction, ra.summary,
            ra.aiNarrative ?? null, JSON.stringify(ra.rulesTriggered ?? []), ra.createdAt,
          ]
        );
        for (const s of ra.signals ?? []) {
          await client.query(
            `INSERT INTO fraud_signals (id, claim_id, type, severity, score_impact, description, matched_claim_id,
                                        metadata, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
              s.id, claim.id, s.type, s.severity, s.scoreImpact, s.description, s.matchedClaimId ?? null,
              JSON.stringify(s.metadata ?? {}), s.createdAt,
            ]
          );
        }
      }

      for (const a of claim.auditLogs ?? []) {
        await this.insertAudit(client, claim.id, claim.organizationId, a);
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
    return claim;
  }

  async saveClaim(claim: Claim): Promise<void> {
    await this.pool.query(
      `UPDATE claims SET vendor_name=$2, amount=$3, category=$4, claim_date=$5, gstin=$6, status=$7,
                         manager_notes=$8, employee_notes=$9, rejection_reason=$10, updated_at=$11
       WHERE id=$1`,
      [
        claim.id, claim.vendorName, claim.amount, claim.category, claim.claimDate, claim.gstin ?? null, claim.status,
        claim.managerNotes ?? null, claim.employeeNotes ?? null, claim.rejectionReason ?? null, claim.updatedAt,
      ]
    );
  }

  async updateClaimStatus(id: string, status: ClaimStatus, managerNotes?: string): Promise<Claim | null> {
    const { rowCount } = await this.pool.query(
      `UPDATE claims
          SET status = $2::varchar,
              manager_notes = COALESCE($3::text, manager_notes),
              rejection_reason = CASE WHEN $2::varchar = 'REJECTED' THEN COALESCE($3::text, rejection_reason) ELSE rejection_reason END,
              updated_at = NOW()
        WHERE id = $1`,
      [id, status, managerNotes ?? null]
    );
    if (!rowCount) return null;
    return this.getClaimById(id);
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const direct = await this.pool.query("SELECT * FROM employees WHERE id = $1", [id]);
    if (direct.rows[0]) return mapEmployee(direct.rows[0]);

    // Employees who joined through an organization are profiles, not directory rows.
    if (!UUID_RE.test(id)) return null;
    const { rows } = await this.pool.query(
      `SELECT p.id, p.full_name, p.email, p.phone, m.organization_id, m.department, m.role,
              (SELECT COUNT(*) FROM claims c WHERE c.employee_id = p.id::text) AS claim_count,
              (SELECT COALESCE(AVG(c.amount), 0) FROM claims c WHERE c.employee_id = p.id::text) AS claim_avg
         FROM profiles p
         LEFT JOIN organization_members m ON m.user_id = p.id AND m.status = 'ACTIVE'
        WHERE p.id = $1
        LIMIT 1`,
      [id]
    );
    const p = rows[0];
    if (!p) return null;
    return {
      id: p.id,
      name: p.full_name,
      email: p.email ?? "",
      phone: p.phone ?? undefined,
      role: p.role ?? "EMPLOYEE",
      department: p.department ?? "General",
      companyId: p.organization_id ?? "",
      historicalClaimCount: Number(p.claim_count),
      historicalClaimAvg: Number(p.claim_avg),
    };
  }

  async getEmployeeClaims(employeeId: string): Promise<Claim[]> {
    const { rows } = await this.pool.query(
      "SELECT * FROM claims WHERE employee_id = $1 ORDER BY created_at DESC",
      [employeeId]
    );
    return this.hydrate(rows);
  }

  private async insertAudit(
    q: { query: pg.Pool["query"] },
    claimId: string,
    fallbackOrgId: string | undefined,
    log: AuditLog
  ): Promise<void> {
    await q.query(
      `INSERT INTO audit_logs (id, organization_id, claim_id, actor_type, actor_id, actor_name, action, details, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        log.id, log.organizationId ?? fallbackOrgId ?? null, claimId, log.actorType, log.actorId ?? null,
        log.actorName ?? null, log.action, JSON.stringify(log.details ?? {}), log.createdAt,
      ]
    );
  }

  async addAuditLog(claimId: string, log: AuditLog): Promise<void> {
    const { rows } = await this.pool.query("SELECT organization_id FROM claims WHERE id = $1", [claimId]);
    if (!rows[0]) return; // mirrors the in-memory repository: unknown claims are ignored
    await this.insertAudit(this.pool, claimId, rows[0].organization_id ?? undefined, log);
  }

  async getHistoricalClaimsForComparison() {
    const { rows } = await this.pool.query(
      `SELECT c.id, c.amount, c.vendor_name, c.claim_date,
              COALESCE(r.perceptual_hash, r.image_hash) AS hash
         FROM claims c LEFT JOIN receipts r ON r.claim_id = c.id`
    );
    return rows.map((r) => ({
      id: r.id as string,
      amount: Number(r.amount),
      vendorName: r.vendor_name as string,
      perceptualHash: (r.hash ?? undefined) as string | undefined,
      claimDate: r.claim_date as string,
    }));
  }
}
