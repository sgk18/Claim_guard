# CLAIMGUARD — Supabase Architecture & Database Guide

## 1. Role as Primary Database
As mandated by Section 22 and Section 51, **Supabase PostgreSQL is the primary application database** for ClaimGuard. It serves all transactional entities, relational queries, real-time audit event streams, and role-based row security.

```
+---------------------------------------------------------------------------------+
|                           SUPABASE POSTGRESQL (PRIMARY)                         |
|                                                                                 |
|  - companies: Client organizations and master GSTINs                           |
|  - employees: Field staff profiles, benchmarks, and phone numbers               |
|  - managers: Finance and compliance approvers                                   |
|  - policies: Spending thresholds, category rules, and GST mandates             |
|  - trips: Authorized field routes and schedules                                 |
|  - claims: Transactional claim records with state machine                       |
|  - receipts: Image metadata, perceptual hashes, and OCR field confidences       |
|  - fraud_signals: Itemized rule violations with confidence and impact scores    |
|  - risk_assessments: Deterministic 0-100 scores and AI explanations             |
|  - audit_logs: Append-only immutable compliance history                         |
|  - messages: Conversational interactions                                        |
+---------------------------------------------------------------------------------+
```

---

## 2. Row Level Security (RLS) Policies
1. **Employees**:
   - Can read only their own profile: `auth.uid() = employee.user_id`.
   - Can select and insert claims where `employee_id = auth.uid()`.
   - Cannot mutate claim `status`, `risk_score`, or `manager_notes`.
2. **Managers**:
   - Can view all claims belonging to their `company_id`.
   - Can update claim `status` to `APPROVED` or `REJECTED` and insert corresponding `audit_logs`.
3. **Audit Trail**:
   - Append-only policy: `INSERT` allowed for authenticated actors and service workers; `UPDATE` and `DELETE` strictly revoked.

---

## 3. Database Migrations & Seeding
- **Migration Directory**: `supabase/migrations/20260917000001_create_claimguard_schema.sql`
- **Seed Script**: `supabase/seed/seed.sql`
- Executable locally via Supabase CLI:
  ```bash
  supabase db reset
  ```
