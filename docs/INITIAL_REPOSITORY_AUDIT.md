# ClaimGuard — Initial Repository Audit

**Date**: 2026-09-17  
**Auditor**: Lead Engineering Orchestrator / System Architect  
**Purpose**: Comprehensive audit of existing codebase, dependencies, architecture, and configuration prior to modular separation.

---

## 1. Executive Summary

ClaimGuard is an India-first automated expense verification and fraud prevention platform for field workforces.
The repository currently contains:
- A responsive **Next.js 15 (React 19, TypeScript, Tailwind CSS)** frontend application providing the Employee Mobile WebView (`/employee`), Manager Operations Dashboard (`/manager`), and Claim Detail Review Workspace (`/manager/claims/[id]`).
- Core deterministic verification engines:
  - **Visual Duplicate Receipt Engine**: 64-bit DCT perceptual image fingerprinting (`src/services/fraud/perceptualHash.ts`).
  - **GSTIN Compliance Engine**: 15-character state code and Luhn modulo-36 checksum validator (`src/services/fraud/gstin.ts`).
  - **Deterministic Policy & Anomaly Rules**: Daily allowances, category ceilings, and historical variance checks (`src/services/fraud/rules.ts`).
  - **Configurable Risk Engine**: 0–100 deterministic risk scoring with `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` tiers (`src/services/risk/engine.ts`).
  - **Decoupled Messaging Provider**: Abstraction supporting `WebViewChannel` and `WhatsAppChannel` webhook adapters (`src/services/messaging/`).
- Primary Database architecture defined for **Supabase PostgreSQL** (`supabase/migrations/20260917000001_create_claimguard_schema.sql` and `supabase/seed/seed.sql`).
- AWS cloud architecture templates defined in `aws/step-functions/claim_processing_workflow.json`.

---

## 2. Directory Structure Inventory

```
c:\projects\Claim_guard\
├── .env.example                     # Environment variable blueprint
├── .env.local                       # Local environment overrides
├── .gitignore                       # Git ignore specifications
├── next.config.ts                   # Next.js bundler configuration
├── package.json                     # Root npm package metadata and scripts
├── tailwind.config.ts               # Tailwind CSS color tokens and design system
├── tsconfig.json                    # TypeScript strict type-checking configuration
├── aws/
│   └── step-functions/
│       └── claim_processing_workflow.json # AWS Step Functions state machine definition
├── docs/                            # Engineering architecture specifications
│   ├── AGENTS.md                    # 24 Specialized Subagent Registry
│   ├── API.md                       # Comprehensive API contract
│   ├── AWS.md                       # AWS Cloud Architecture
│   ├── DATABASE.md                  # Relational schema and seed data
│   ├── DESIGN_SYSTEM.md             # Color tokens, typography, and UX rules
│   ├── QA_REPORT.md                 # Complete verification and test report
│   ├── SECURITY.md                  # Security, authentication, and RLS policies
│   ├── SKILLS_USED.md               # Skill discovery and utilization registry
│   ├── SUPABASE.md                  # Supabase database setup and migrations
│   ├── TESTING.md                   # Test suite documentation
│   └── WHATSAPP.md                  # WhatsApp Business Cloud API adapter spec
├── public/                          # Static assets and test receipt images
├── src/
│   ├── app/                         # Next.js App Router pages and API routes
│   │   ├── api/                     # Local API routes (to be decoupled to standalone server)
│   │   ├── employee/                # Employee Mobile WebView UI
│   │   ├── manager/                 # Manager Dashboard and Claim Review UI
│   │   ├── globals.css              # Ambient mesh backdrops and custom styles
│   │   └── page.tsx                 # Portal Landing Page
│   ├── components/                  # Shared UI components
│   │   ├── employee/                # Chat shell, receipt uploader, extracted card
│   │   └── manager/                 # KPI cards, table, receipt viewer, duplicate comparator
│   ├── db/                          # In-memory mock store and seed data
│   ├── services/                    # Fraud, OCR, AI, Messaging, Storage providers
│   └── types/                       # TypeScript entity definitions and schemas
├── supabase/
│   ├── migrations/                  # PostgreSQL 11-table migration schema
│   └── seed/                        # SQL seed for 10 employees and 50+ claims
└── tests/
    └── claimguard.test.mjs          # Core engine unit and integration test suite
```

---

## 3. Dependency Analysis

### Production Dependencies
- `next`: `^15.1.0` (React framework for frontend application)
- `react`: `^19.0.0`
- `react-dom`: `^19.0.0`
- `clsx`: `^2.1.1` (CSS class utility)
- `tailwind-merge`: `^2.5.5` (Tailwind class resolution)
- `lucide-react`: `^1.16.0` (Icon library; strict zero-emoji enforcement)

### Development Dependencies
- `typescript`: `^5.7.2`
- `tailwindcss`: `^3.4.16`
- `postcss`: `^8.4.49`
- `autoprefixer`: `^10.6.1`
- `@types/node`: `^22.10.2`

---

## 4. Architectural Separation Target

In compliance with **Section 10**, the core backend business logic must not be coupled to Next.js serverless functions.
A separate, standalone backend service will be established under:
```
server/
├── Dockerfile                       # Multi-stage production container
├── .dockerignore                    # Docker ignore rules
├── package.json                     # Standalone server dependencies (Fastify, TypeScript)
├── tsconfig.json                    # Server-specific TypeScript config
└── src/
    ├── config/                      # Environment variables, AWS & Supabase config
    ├── api/                         # Fastify server instance & route registration
    ├── routes/                      # Route handlers (/api/v1/claims, /api/v1/receipts, /health)
    ├── controllers/                 # Request/response controllers
    ├── services/                    # Claims, Fraud, Risk, Policy, OCR, AI, Messaging
    ├── domain/                      # Domain entities, value objects, and business rules
    ├── repositories/                # Database repository interfaces and Supabase implementations
    ├── providers/                   # StorageProvider, OCRProvider, AIProvider, MessagingProvider
    ├── middleware/                  # Auth, CORS, rate limiting, request validation
    └── types/                       # Core shared interfaces
```

---

## 5. Audit Findings & Preservation Commitments

1. **Do Not Rewrite Frontend**: The existing Next.js frontend has been audited and styled to Ultra-Clean Modern Light Mode (`ambient-mesh-bg`, white card surfaces, brand-orange micro-accents). It will be preserved and configured to proxy or target the standalone backend API.
2. **Zero-Emoji Compliance**: Zero emoji icons exist in the codebase. All UI components use Lucide icons.
3. **Core Engine Verification**: The 9/9 test suite in `tests/claimguard.test.mjs` verifies the deterministic business logic and must continue to pass across all refactors.
