-- ============================================================
-- CLAIMGUARD — SUPABASE POSTGRESQL V2 PRODUCTION SCHEMA MIGRATION
-- Migration: 20260919000001_v2_organizations_and_sessions.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    gstin VARCHAR(15),
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- 2. USERS / PROFILES (Decoupled application-level identity)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZATION MEMBERS (Role mapping: MANAGER or EMPLOYEE)
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('MANAGER', 'EMPLOYEE', 'ADMIN')),
    department VARCHAR(100) DEFAULT 'General',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REMOVED')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON public.organization_members(organization_id, status);

-- 4. JOIN CODES (Manager-generated codes for onboarding)
CREATE TABLE IF NOT EXISTS public.join_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. CG-7K4P9X
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    max_uses INT DEFAULT 100,
    times_used INT DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_join_codes_code ON public.join_codes(code);
CREATE INDEX IF NOT EXISTS idx_join_codes_org ON public.join_codes(organization_id);

-- 5. SESSIONS & DEVICE IDENTITIES
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('MANAGER', 'EMPLOYEE', 'ADMIN')),
    device_name VARCHAR(128),
    device_id VARCHAR(128),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON public.sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_org ON public.sessions(user_id, organization_id);

-- 6. POLICIES
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    max_single_claim DECIMAL(12, 2) NOT NULL,
    daily_cap DECIMAL(12, 2),
    requires_gstin BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policies_org_cat ON public.policies(organization_id, category);

-- 7. CLAIMS
CREATE TABLE IF NOT EXISTS public.claims (
    id VARCHAR(64) PRIMARY KEY, -- e.g. CLM-4471
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION_REQUESTED')),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    category VARCHAR(64) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    claim_date DATE NOT NULL,
    gstin VARCHAR(15),
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    manager_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_org ON public.claims(organization_id);
CREATE INDEX IF NOT EXISTS idx_claims_employee ON public.claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_date ON public.claims(claim_date);

-- 8. RECEIPTS
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    image_hash VARCHAR(64) NOT NULL, -- 64-bit DCT perceptual hash
    raw_ocr_text TEXT,
    ocr_confidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    line_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_hash ON public.receipts(image_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_claim ON public.receipts(claim_id);

-- 9. FRAUD SIGNALS (Deterministic evidence flags)
CREATE TABLE IF NOT EXISTS public.fraud_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- DUPLICATE_RECEIPT, AMOUNT_ANOMALY, GSTIN_INVALID, DATE_MISMATCH, etc.
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    score_impact INT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(4, 2) DEFAULT 1.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_claim ON public.fraud_signals(claim_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_type ON public.fraud_signals(type);

-- 10. RISK ASSESSMENTS (0-100 score + evidence state)
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) UNIQUE NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    level VARCHAR(16) NOT NULL CHECK (level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    authenticity_state VARCHAR(32) NOT NULL DEFAULT 'REVIEW REQUIRED' CHECK (authenticity_state IN ('VERIFIED', 'LIKELY VALID', 'REVIEW REQUIRED', 'SUSPICIOUS', 'UNABLE TO VERIFY')),
    recommended_action VARCHAR(32) NOT NULL,
    summary TEXT NOT NULL,
    ai_narrative TEXT, -- Generated by AWS Bedrock Claude 3.5 Sonnet
    rules_triggered JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_claim ON public.risk_assessments(claim_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON public.risk_assessments(level);

-- 11. AUDIT LOGS (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    claim_id VARCHAR(64) REFERENCES public.claims(id) ON DELETE SET NULL,
    actor_type VARCHAR(32) NOT NULL CHECK (actor_type IN ('MANAGER', 'EMPLOYEE', 'SYSTEM')),
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255),
    action VARCHAR(64) NOT NULL, -- CLAIM_SUBMITTED, CLAIM_APPROVED, CLAIM_REJECTED, JOIN_CODE_GENERATED, etc.
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_claim ON public.audit_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- 12. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Base RLS Policies: Service role has full access; tenants isolated by organization_id
CREATE POLICY service_role_all ON public.organizations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_claims ON public.claims FOR ALL TO service_role USING (true);
CREATE POLICY service_role_receipts ON public.receipts FOR ALL TO service_role USING (true);
CREATE POLICY service_role_fraud ON public.fraud_signals FOR ALL TO service_role USING (true);
CREATE POLICY service_role_risk ON public.risk_assessments FOR ALL TO service_role USING (true);
CREATE POLICY service_role_audit ON public.audit_logs FOR ALL TO service_role USING (true);
