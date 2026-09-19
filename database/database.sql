-- ClaimGuard: Relational schema
-- Postgres-flavored SQL. Compatible with SQLite for hackathon MVP with minor tweaks
-- (see notes at bottom: SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT, etc.)

-- =========================================================
-- 1. ORGANIZATIONS & USERS
-- =========================================================

CREATE TABLE organizations (
    org_id          SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    gstin           VARCHAR(15),              -- org's own GSTIN, for ITC filing
    plan_tier       VARCHAR(50) DEFAULT 'standard',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
    employee_id     SERIAL PRIMARY KEY,
    org_id          INTEGER NOT NULL REFERENCES organizations(org_id),
    full_name       VARCHAR(255) NOT NULL,
    phone_number    VARCHAR(20) NOT NULL UNIQUE,   -- WhatsApp identity
    role            VARCHAR(50) NOT NULL DEFAULT 'field_agent', -- field_agent | manager | finance_admin
    department      VARCHAR(100),                  -- logistics | fmcg_sales | pharma_rep
    manager_id      INTEGER REFERENCES employees(employee_id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_org ON employees(org_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);

-- =========================================================
-- 2. POLICY CONFIGURATION
-- =========================================================

CREATE TABLE policy_config (
    policy_id           SERIAL PRIMARY KEY,
    org_id              INTEGER NOT NULL REFERENCES organizations(org_id),
    category            VARCHAR(50) NOT NULL,      -- fuel | toll | travel | per_diem | meals
    max_amount           NUMERIC(12,2),             -- per-claim ceiling for this category
    auto_approve_amount  NUMERIC(12,2),             -- below this + above confidence threshold -> auto-approve
    auto_approve_confidence NUMERIC(5,2) DEFAULT 0.90,
    requires_route_match BOOLEAN NOT NULL DEFAULT FALSE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_org_category ON policy_config(org_id, category);

-- =========================================================
-- 3. TRIP MANIFESTS (for route/policy agent)
-- =========================================================

CREATE TABLE trips (
    trip_id         SERIAL PRIMARY KEY,
    employee_id     INTEGER NOT NULL REFERENCES employees(employee_id),
    start_time      TIMESTAMP NOT NULL,
    end_time        TIMESTAMP,
    planned_route   TEXT,                       -- serialized waypoints / GeoJSON
    status          VARCHAR(20) DEFAULT 'active' -- active | completed | cancelled
);

CREATE TABLE trip_gps_pings (
    ping_id         SERIAL PRIMARY KEY,
    trip_id         INTEGER NOT NULL REFERENCES trips(trip_id),
    lat             NUMERIC(9,6) NOT NULL,
    lng             NUMERIC(9,6) NOT NULL,
    recorded_at     TIMESTAMP NOT NULL
    -- Note (Section 10, route-validation privacy risk): scope pings to trip windows
    -- tied to specific claims, not continuous tracking.
);

CREATE INDEX idx_pings_trip ON trip_gps_pings(trip_id);

-- =========================================================
-- 4. CLAIMS (core table)
-- =========================================================

CREATE TABLE claims (
    claim_id            SERIAL PRIMARY KEY,
    org_id              INTEGER NOT NULL REFERENCES organizations(org_id),
    employee_id         INTEGER NOT NULL REFERENCES employees(employee_id),
    trip_id             INTEGER REFERENCES trips(trip_id),
    raw_image_s3_key    VARCHAR(512) NOT NULL,      -- pointer to S3 raw receipt
    whatsapp_message_id VARCHAR(100),
    caption_text        TEXT,                       -- optional voice-note transcript / caption
    status               VARCHAR(30) NOT NULL DEFAULT 'received',
        -- received | extracted | scored | pending_manager | auto_approved | approved | rejected | paid
    submitted_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    decided_at           TIMESTAMP,
    decided_by           INTEGER REFERENCES employees(employee_id) -- NULL if auto-approved
);

CREATE INDEX idx_claims_org_status ON claims(org_id, status);
CREATE INDEX idx_claims_employee ON claims(employee_id);
CREATE INDEX idx_claims_submitted ON claims(submitted_at);

-- =========================================================
-- 5. EXTRACTION AGENT OUTPUT
-- =========================================================

CREATE TABLE claim_extractions (
    extraction_id       SERIAL PRIMARY KEY,
    claim_id            INTEGER NOT NULL UNIQUE REFERENCES claims(claim_id),
    vendor_name          VARCHAR(255),
    amount                NUMERIC(12,2),
    currency              VARCHAR(3) DEFAULT 'INR',
    claim_date            DATE,
    gstin                 VARCHAR(15),
    category              VARCHAR(50),
    perceptual_hash        VARCHAR(64),         -- for duplicate/near-duplicate detection
    vendor_confidence      NUMERIC(5,2),
    amount_confidence      NUMERIC(5,2),
    date_confidence        NUMERIC(5,2),
    gstin_confidence       NUMERIC(5,2),
    low_confidence_flag    BOOLEAN NOT NULL DEFAULT FALSE,  -- routes to manager review
    extracted_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extractions_hash ON claim_extractions(perceptual_hash);
CREATE INDEX idx_extractions_gstin ON claim_extractions(gstin);

-- =========================================================
-- 6. DUPLICATE & CURRENCY AGENT OUTPUT
-- =========================================================

CREATE TABLE duplicate_flags (
    flag_id             SERIAL PRIMARY KEY,
    claim_id            INTEGER NOT NULL REFERENCES claims(claim_id),
    matched_claim_id    INTEGER REFERENCES claims(claim_id),  -- the earlier claim it matches
    match_type          VARCHAR(20) NOT NULL,   -- exact | near_duplicate | currency_mismatch
    similarity_score    NUMERIC(5,2),
    detected_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dupflags_claim ON duplicate_flags(claim_id);

-- =========================================================
-- 7. POLICY & ROUTE AGENT OUTPUT
-- =========================================================

CREATE TABLE policy_checks (
    check_id            SERIAL PRIMARY KEY,
    claim_id            INTEGER NOT NULL UNIQUE REFERENCES claims(claim_id),
    policy_id           INTEGER REFERENCES policy_config(policy_id),
    within_amount_limit BOOLEAN,
    route_match         BOOLEAN,               -- consistent with trip manifest / GPS pings
    route_distance_delta_km NUMERIC(8,2),
    checked_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 8. GSTIN / ITC AGENT OUTPUT
-- =========================================================

CREATE TABLE gst_itc_records (
    itc_id               SERIAL PRIMARY KEY,
    claim_id             INTEGER NOT NULL UNIQUE REFERENCES claims(claim_id),
    gstin_valid           BOOLEAN,
    gstin_checksum_valid  BOOLEAN,
    itc_eligible          BOOLEAN,
    itc_amount             NUMERIC(12,2),
    filing_period          VARCHAR(7),          -- e.g. '2026-09'
    staged_for_recovery    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 9. RISK SCORING (Bedrock agent)
-- =========================================================

CREATE TABLE risk_scores (
    risk_id             SERIAL PRIMARY KEY,
    claim_id            INTEGER NOT NULL UNIQUE REFERENCES claims(claim_id),
    score                NUMERIC(5,2) NOT NULL,      -- e.g. 0-100
    reason_summary        TEXT NOT NULL,              -- plain-language explanation, not a bare number
    contributing_agents   TEXT,                        -- JSON array: which agents fed the score
    scored_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_riskscores_score ON risk_scores(score);

-- =========================================================
-- 10. EMPLOYEE BEHAVIORAL PROFILE
-- =========================================================

CREATE TABLE employee_risk_profiles (
    employee_id             INTEGER PRIMARY KEY REFERENCES employees(employee_id),
    total_claims             INTEGER NOT NULL DEFAULT 0,
    flagged_claims            INTEGER NOT NULL DEFAULT 0,
    avg_risk_score             NUMERIC(5,2),
    last_flagged_at            TIMESTAMP,
    updated_at                 TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 11. MANAGER DECISIONS
-- =========================================================

CREATE TABLE claim_decisions (
    decision_id         SERIAL PRIMARY KEY,
    claim_id            INTEGER NOT NULL UNIQUE REFERENCES claims(claim_id),
    decision              VARCHAR(20) NOT NULL,   -- approved | rejected | auto_approved
    decided_by             INTEGER REFERENCES employees(employee_id),
    decision_channel        VARCHAR(20),           -- whatsapp | dashboard
    manager_comment          TEXT,
    decided_at               TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 12. AUDIT TRAIL (immutable, append-only)
-- =========================================================

CREATE TABLE audit_log (
    audit_id             SERIAL PRIMARY KEY,
    claim_id             INTEGER NOT NULL REFERENCES claims(claim_id),
    event_type            VARCHAR(50) NOT NULL,   -- submitted | extracted | scored | flagged | decided | paid
    event_payload          TEXT,                    -- JSON snapshot at time of event
    s3_audit_bundle_key    VARCHAR(512),           -- immutable bundle location (S3 Object Lock)
    recorded_at             TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_claim ON audit_log(claim_id);
CREATE INDEX idx_audit_event_type ON audit_log(event_type);

-- =========================================================
-- 13. ACCOUNTING RECONCILIATION (Tally / Zoho Books / SAP)
-- =========================================================

CREATE TABLE reconciliation_exports (
    export_id            SERIAL PRIMARY KEY,
    org_id               INTEGER NOT NULL REFERENCES organizations(org_id),
    connector             VARCHAR(20) NOT NULL,   -- tally | zoho_books | sap
    claim_ids              TEXT NOT NULL,          -- JSON array of claim_id
    export_status           VARCHAR(20) DEFAULT 'pending', -- pending | success | failed
    exported_at              TIMESTAMP
);

-- =========================================================
-- NOTES
-- =========================================================
-- 1. SQLite (hackathon MVP): replace SERIAL with INTEGER PRIMARY KEY AUTOINCREMENT,
--    drop NUMERIC precision args (use REAL), and TIMESTAMP defaults become
--    DEFAULT CURRENT_TIMESTAMP.
-- 2. For the hackathon demo (Section 9 of the report), you only strictly need:
--    employees, claims, claim_extractions, risk_scores, claim_decisions.
--    Add duplicate_flags once you want to demo the duplicate-catch feature.
-- 3. In production this logical model maps onto DynamoDB as documented in the
--    report (single-table or per-entity tables: claims, policy, audit) --
--    this SQL schema is provided as the relational equivalent for prototyping,
--    reporting queries, or if you choose RDS/Postgres over DynamoDB for the pilot.
-- 4. audit_log is intentionally append-only at the application layer (no UPDATE/DELETE
--    grants) to satisfy the immutable audit trail requirement in Section 5.1.
