-- ============================================================
-- CLAIMGUARD — SUPABASE POSTGRESQL PRODUCTION SCHEMA MIGRATION
-- Migration: 20260917000001_create_claimguard_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(64) DEFAULT 'FIELD_EXECUTIVE',
    department VARCHAR(100) DEFAULT 'Field Operations',
    historical_claim_count INT DEFAULT 0,
    historical_claim_avg DECIMAL(12, 2) DEFAULT 0.00,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_phone ON public.employees(phone);

-- 3. MANAGERS
CREATE TABLE IF NOT EXISTS public.managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(64) DEFAULT 'FINANCE_MANAGER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLICIES
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category VARCHAR(32) NOT NULL,
    max_single_claim DECIMAL(12, 2) NOT NULL,
    daily_cap DECIMAL(12, 2),
    requires_gstin BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policies_company_category ON public.policies(company_id, category);

-- 5. TRIPS
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_employee ON public.trips(employee_id);

-- 6. CLAIMS
CREATE TABLE IF NOT EXISTS public.claims (
    id VARCHAR(64) PRIMARY KEY, -- e.g. CLM-4471
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    category VARCHAR(32) NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    claim_date DATE NOT NULL,
    gstin VARCHAR(15),
    manager_id UUID REFERENCES public.managers(id) ON DELETE SET NULL,
    manager_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_employee ON public.claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_date ON public.claims(claim_date);

-- 7. RECEIPTS
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    image_hash VARCHAR(64) NOT NULL,
    raw_ocr_text TEXT,
    ocr_confidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_hash ON public.receipts(image_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_claim ON public.receipts(claim_id);

-- 8. FRAUD SIGNALS
CREATE TABLE IF NOT EXISTS public.fraud_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    score_impact INT NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(4, 2) DEFAULT 1.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_signals_claim ON public.fraud_signals(claim_id);
CREATE INDEX IF NOT EXISTS idx_fraud_signals_type ON public.fraud_signals(type);

-- 9. RISK ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) UNIQUE NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    score INT NOT NULL,
    level VARCHAR(16) NOT NULL,
    recommended_action VARCHAR(32) NOT NULL,
    summary TEXT NOT NULL,
    rules_triggered JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
    actor_type VARCHAR(32) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_claim ON public.audit_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at);

-- 11. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_id VARCHAR(64) REFERENCES public.claims(id) ON DELETE SET NULL,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    sender VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(32) NOT NULL DEFAULT 'TEXT',
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_employee ON public.messages(employee_id);
