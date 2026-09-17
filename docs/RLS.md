# ClaimGuard — Supabase Row-Level Security (RLS) & Multi-Tenant Isolation

**Database**: Supabase PostgreSQL 15+  
**Security Standard**: Strict Row-Level Security with zero trust on client presentation layer

---

## 1. Security Architecture Principles

1. **Defense in Depth**: Authorization is enforced both in the API server middleware and at the PostgreSQL database engine layer via Row-Level Security (RLS).
2. **Never Trust Client Claims**: Client headers or request bodies supplying `employeeId`, `companyId`, or `role` are never accepted without JWT signature verification against `auth.uid()`.
3. **Tenant Data Segregation**: Every table (`employees`, `claims`, `receipts`, `policies`, `fraud_signals`, `risk_assessments`, `audit_logs`) includes a `company_id` foreign key.
4. **Immutable Audit Trails**: The `audit_logs` table allows only `INSERT` and `SELECT` operations. Updates and deletions are strictly revoked at the database role level.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Entity / Action | `EMPLOYEE` Role | `MANAGER` Role | `ADMIN` Role |
|---|---|---|---|
| **View Own Profile** | ✅ READ | ✅ READ | ✅ READ / WRITE |
| **Submit New Claim** | ✅ CREATE (Own `employee_id`) | ❌ NO | ✅ CREATE |
| **View Claims Queue** | ❌ (Own claims only) | ✅ READ (Company claims) | ✅ READ (All company claims) |
| **Approve / Reject Claim** | ❌ NO | ✅ UPDATE (Authorized status) | ✅ UPDATE |
| **View Fraud Signals & Risk** | ❌ NO | ✅ READ | ✅ READ / WRITE |
| **Upload Receipt** | ✅ CREATE (Own claim) | ❌ NO | ✅ CREATE |
| **View Audit Logs** | ❌ (Own claim events only) | ✅ READ (Full audit history) | ✅ READ |
| **Modify Audit Logs** | ❌ FORBIDDEN (PostgreSQL REVOKE) | ❌ FORBIDDEN | ❌ FORBIDDEN |

---

## 3. SQL RLS Policy Implementation

```sql
-- Enable Row Level Security across all core tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 1. CLAIMS TABLE POLICIES
-- -------------------------------------------------------------

-- Employees can ONLY select their own submitted claims
CREATE POLICY "employees_select_own_claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Employees can ONLY insert claims tied to their own verified employee_id
CREATE POLICY "employees_insert_own_claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Managers can SELECT all claims for companies they manage
CREATE POLICY "managers_select_company_claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM managers WHERE user_id = auth.uid()
    )
  );

-- Managers can UPDATE claims for approval/rejection notes within their company
CREATE POLICY "managers_update_company_claims"
  ON claims
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM managers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM managers WHERE user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- 2. FRAUD SIGNALS & RISK ASSESSMENTS (Manager / Admin Only)
-- -------------------------------------------------------------

-- Employees CANNOT read internal fraud signals or perceptual match details
CREATE POLICY "managers_select_fraud_signals"
  ON fraud_signals
  FOR SELECT
  TO authenticated
  USING (
    claim_id IN (
      SELECT c.id FROM claims c
      JOIN managers m ON m.company_id = c.company_id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "managers_select_risk_assessments"
  ON risk_assessments
  FOR SELECT
  TO authenticated
  USING (
    claim_id IN (
      SELECT c.id FROM claims c
      JOIN managers m ON m.company_id = c.company_id
      WHERE m.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------
-- 3. AUDIT LOGS (Append-Only Enforcement)
-- -------------------------------------------------------------

-- Revoke UPDATE and DELETE for all roles
REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon, public;

-- Managers can read full audit history
CREATE POLICY "managers_select_audit_logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    claim_id IN (
      SELECT c.id FROM claims c
      JOIN managers m ON m.company_id = c.company_id
      WHERE m.user_id = auth.uid()
    )
  );
```

---

## 4. Verification & Testing

RLS policies are validated via automated tests in `tests/claimguard.test.mjs` and `server/tests/server.test.mjs`:
- Attempting to query claims without matching `user_id` returns an empty array.
- Attempting to approve or reject a claim as an employee returns `HTTP 403 Forbidden`.
- Attempting to update or delete `audit_logs` records results in a PostgreSQL constraint violation error.
