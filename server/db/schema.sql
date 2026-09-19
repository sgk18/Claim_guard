-- ClaimGuard application schema for AWS Aurora PostgreSQL.
-- Lives in its own schema ("app") so it does not collide with the report
-- schema in database/database.sql, which uses the public schema.
-- Derived from supabase/migrations/20260919000001_v2_organizations_and_sessions.sql,
-- adapted for plain Postgres (no Supabase roles / RLS) and for the ID and status
-- values the server code actually uses.

CREATE SCHEMA IF NOT EXISTS app;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS app.organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    gstin       VARCHAR(15),
    currency    VARCHAR(3) NOT NULL DEFAULT 'INR',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles (application-level identity)
CREATE TABLE IF NOT EXISTS app.profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    phone       VARCHAR(20),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organization members
CREATE TABLE IF NOT EXISTS app.organization_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
    role            VARCHAR(32) NOT NULL CHECK (role IN ('MANAGER', 'EMPLOYEE', 'ADMIN')),
    department      VARCHAR(100) NOT NULL DEFAULT 'General',
    status          VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REMOVED')),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_app_members_org ON app.organization_members(organization_id);

-- 4. Join codes
CREATE TABLE IF NOT EXISTS app.join_codes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    code            VARCHAR(32) UNIQUE NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    max_uses        INT NOT NULL DEFAULT 100,
    times_used      INT NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_by      UUID REFERENCES app.profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_join_codes_org ON app.join_codes(organization_id);

-- 5. Sessions (only a SHA-256 hash of the bearer token is stored)
CREATE TABLE IF NOT EXISTS app.sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash      VARCHAR(64) UNIQUE NOT NULL,
    user_id         UUID NOT NULL REFERENCES app.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    role            VARCHAR(32) NOT NULL CHECK (role IN ('MANAGER', 'EMPLOYEE', 'ADMIN')),
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Employee directory used by the claims side (ids are free-form text)
CREATE TABLE IF NOT EXISTS app.employees (
    id                       TEXT PRIMARY KEY,
    name                     VARCHAR(255) NOT NULL,
    email                    VARCHAR(255) NOT NULL,
    phone                    VARCHAR(20),
    role                     VARCHAR(100) NOT NULL,
    department               VARCHAR(100) NOT NULL,
    company_id               TEXT NOT NULL,
    historical_claim_count   INT NOT NULL DEFAULT 0,
    historical_claim_avg     NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 7. Claims (id is a business id such as CLM-4471; employee_id may be a profile UUID or an employees.id)
CREATE TABLE IF NOT EXISTS app.claims (
    id               VARCHAR(64) PRIMARY KEY,
    organization_id  UUID REFERENCES app.organizations(id) ON DELETE CASCADE,
    company_id       TEXT,
    employee_id      TEXT NOT NULL,
    employee_name    VARCHAR(255),
    status           VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
                        'DRAFT', 'PENDING', 'PROCESSING', 'ACTION_REQUIRED', 'REVIEW_REQUIRED',
                        'APPROVED', 'REJECTED', 'CLARIFICATION_REQUESTED', 'FAILED')),
    amount           NUMERIC(12, 2) NOT NULL,
    currency         VARCHAR(3) NOT NULL DEFAULT 'INR',
    category         VARCHAR(64) NOT NULL,
    vendor_name      VARCHAR(255) NOT NULL,
    claim_date       DATE NOT NULL,
    gstin            VARCHAR(15),
    manager_notes    TEXT,
    employee_notes   TEXT,
    rejection_reason TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_claims_org ON app.claims(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_claims_employee ON app.claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_app_claims_status ON app.claims(status);
CREATE INDEX IF NOT EXISTS idx_app_claims_created ON app.claims(created_at DESC);

-- 8. Receipts
CREATE TABLE IF NOT EXISTS app.receipts (
    id               TEXT PRIMARY KEY,
    claim_id         VARCHAR(64) NOT NULL REFERENCES app.claims(id) ON DELETE CASCADE,
    file_url         TEXT NOT NULL,
    file_name        VARCHAR(255) NOT NULL,
    mime_type        VARCHAR(100) NOT NULL,
    file_size        INT NOT NULL,
    storage_key      TEXT NOT NULL,
    image_hash       VARCHAR(64),
    perceptual_hash  VARCHAR(64),
    raw_ocr_text     TEXT,
    ocr_confidence   JSONB NOT NULL DEFAULT '{}'::jsonb,
    line_items       JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_receipts_claim ON app.receipts(claim_id);
CREATE INDEX IF NOT EXISTS idx_app_receipts_phash ON app.receipts(perceptual_hash);

-- 9. Risk assessments (one per claim)
CREATE TABLE IF NOT EXISTS app.risk_assessments (
    id                 TEXT PRIMARY KEY,
    claim_id           VARCHAR(64) UNIQUE NOT NULL REFERENCES app.claims(id) ON DELETE CASCADE,
    score              INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    level              VARCHAR(16) NOT NULL CHECK (level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    authenticity_state VARCHAR(32),
    recommended_action VARCHAR(32) NOT NULL,
    summary            TEXT NOT NULL,
    ai_narrative       TEXT,
    rules_triggered    JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Fraud signals
CREATE TABLE IF NOT EXISTS app.fraud_signals (
    id                TEXT PRIMARY KEY,
    claim_id          VARCHAR(64) NOT NULL REFERENCES app.claims(id) ON DELETE CASCADE,
    type              VARCHAR(64) NOT NULL,
    severity          VARCHAR(16) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    score_impact      INT NOT NULL,
    description       TEXT NOT NULL,
    matched_claim_id  VARCHAR(64),
    metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_signals_claim ON app.fraud_signals(claim_id);

-- 11. Audit logs (append-only at the application layer)
CREATE TABLE IF NOT EXISTS app.audit_logs (
    id               TEXT PRIMARY KEY,
    organization_id  UUID REFERENCES app.organizations(id) ON DELETE CASCADE,
    claim_id         VARCHAR(64) REFERENCES app.claims(id) ON DELETE SET NULL,
    actor_type       VARCHAR(32) NOT NULL,
    actor_id         VARCHAR(64),
    actor_name       VARCHAR(255),
    action           VARCHAR(64) NOT NULL,
    details          JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_audit_org ON app.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_audit_claim ON app.audit_logs(claim_id);

-- Default organization referenced by ClaimService when no organization is supplied.
INSERT INTO app.organizations (id, name, slug, gstin, currency)
VALUES ('a0000000-0000-0000-0000-000000000001', 'ABC Technologies Pvt Ltd', 'abc-tech', '27AABCA1234F1Z5', 'INR')
ON CONFLICT (id) DO NOTHING;
