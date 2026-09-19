import { InMemoryClaimRepository } from "../repositories/claimRepository.js";
import { InMemoryOrganizationRepository } from "../repositories/organizationRepository.js";
import { PgClaimRepository } from "../repositories/pgClaimRepository.js";
import { closePool, getPool } from "./pool.js";

// Loads the demo data (the same data the in-memory repositories start with) into Postgres.
// Idempotent: existing rows are left alone. Demo sessions and the demo join code are NOT
// seeded, because they use well-known tokens that must not exist in a cloud database.
const DEFAULT_ORG_ID = "a0000000-0000-0000-0000-000000000001";

async function main() {
  const pool = getPool();
  const memClaims = new InMemoryClaimRepository();
  const memOrgs = new InMemoryOrganizationRepository() as any;
  const pgClaims = new PgClaimRepository(pool);

  // Demo people and their membership in the default organization.
  for (const p of memOrgs.profiles.values()) {
    await pool.query(
      `INSERT INTO profiles (id, full_name, email, phone) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.fullName, p.email ?? null, p.phone ?? null]
    );
  }
  for (const m of memOrgs.members.values()) {
    await pool.query(
      `INSERT INTO organization_members (organization_id, user_id, role, department)
       VALUES ($1,$2,$3,$4) ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [m.organizationId, m.userId, m.role, m.department]
    );
  }

  // Claim-side employee directory.
  const employees = [...(memClaims as any).employees.values()];
  for (const e of employees) {
    await pool.query(
      `INSERT INTO employees (id, name, email, phone, role, department, company_id, historical_claim_count, historical_claim_avg)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [e.id, e.name, e.email, e.phone ?? null, e.role, e.department, e.companyId, e.historicalClaimCount, e.historicalClaimAvg]
    );
  }

  // Claims with their receipts, risk assessments, signals and audit trail.
  let inserted = 0;
  for (const claim of await memClaims.getClaims()) {
    const exists = await pool.query("SELECT 1 FROM claims WHERE id = $1", [claim.id]);
    if (exists.rowCount) continue;
    await pgClaims.createClaim({ ...claim, organizationId: DEFAULT_ORG_ID });
    inserted++;
  }
  console.log(`[db:seed] ${employees.length} employees checked, ${inserted} claims inserted.`);
}

main()
  .catch((e) => {
    console.error("[db:seed] failed:", e.message);
    process.exitCode = 1;
  })
  .finally(closePool);
