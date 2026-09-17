# CLAIMGUARD — Subagent System & Operational Roster

This document records the responsibilities, execution handoffs, and reports for all 24 specialized subagents.

---

## 1. Subagent Roster & Responsibilities

| Subagent ID & Name | Core Responsibility | Key Deliverables / Seams |
|---|---|---|
| **AGENT 01 — Product Architect** | Defines user journeys, MVP boundaries, risk boundaries, and core product principles. | `docs/PRODUCT_SPEC.md`, `docs/USER_FLOWS.md` |
| **AGENT 02 — UX/UI Designer** | Designs mobile WebView and finance manager screens adhering to 40/30/20/10 composition. | Wireframes, component specifications |
| **AGENT 03 — Design System Engineer** | Implements centralized design tokens with exact palette (`#F97316`, `#FDBA74`, `#0F172A`, `#334155`, `#F8FAFC`). | `src/app/globals.css`, `tailwind.config.ts`, `docs/DESIGN_SYSTEM.md` |
| **AGENT 04 — Frontend Architect** | Establishes Next.js App Router architecture, component boundaries, and state flow. | Shared UI component interfaces |
| **AGENT 05 — Frontend Engineer** | Builds responsive conversational WebView, receipt uploader, and split manager dashboard. | `src/app/employee/`, `src/app/manager/`, `src/components/` |
| **AGENT 06 — Backend Architect** | Defines REST API contracts, service providers, and channel-agnostic messaging boundaries. | `docs/API_CONTRACT.md`, `docs/FINAL_ARCHITECTURE.md` |
| **AGENT 07 — Backend Engineer** | Implements Next.js route handlers (`/api/claims`, `/api/employees`, `/api/manager`). | `src/app/api/` route handlers |
| **AGENT 08 — Supabase Database Engineer** | Designs PostgreSQL schema with UUID keys, indexes, migrations, and seed scripts. | `supabase/migrations/`, `supabase/seed/`, `docs/SUPABASE.md` |
| **AGENT 09 — AWS Cloud Architect** | Designs S3, Textract, Step Functions, EventBridge, and Bedrock target architecture. | `docs/AWS.md`, workflow diagrams |
| **AGENT 10 — AWS Implementation Engineer** | Implements provider implementations and infrastructure templates. | `aws/infrastructure/`, `aws/lambda/`, `src/services/` |
| **AGENT 11 — OCR Engineer** | Builds receipt extraction pipeline with per-field confidence scoring. | `src/services/ocr/` (Mock & Textract) |
| **AGENT 12 — Fraud Detection Engineer** | Implements deterministic fraud rules (duplicate perceptual hash, anomaly, category mismatch). | `src/services/fraud/rules.ts`, `perceptualHash.ts` |
| **AGENT 13 — AI/Bedrock Engineer** | Implements structured Bedrock risk explanation and manager recommendations. | `src/services/ai/` |
| **AGENT 14 — Risk Engine Engineer** | Implements deterministic 0–100 risk scoring algorithm and tier boundaries. | `src/services/risk/engine.ts` |
| **AGENT 15 — Messaging/WhatsApp Architect** | Designs decoupled channel abstraction (`MessagingProvider`, `WebViewChannel`, `WhatsAppChannel`). | `src/services/messaging/`, `docs/WHATSAPP.md` |
| **AGENT 16 — Security Engineer** | Audits magic bytes, RBAC, IDOR, input sanitization, and secret isolation. | `docs/SECURITY.md`, upload validators |
| **AGENT 17 — QA Engineer** | Executes automated test suites, validates demo scenarios, and generates QA report. | `tests/claimguard.test.mjs`, `docs/QA_REPORT.md` |
| **AGENT 18 — E2E Testing Engineer** | Automates end-to-end receipt upload to manager approval lifecycle. | `tests/e2e.test.mjs`, browser subagent verification |
| **AGENT 19 — Performance Engineer** | Audits page load times, image compression, and API latency. | Performance benchmarks in `docs/QA_REPORT.md` |
| **AGENT 20 — Accessibility Engineer** | Verifies semantic HTML, touch targets, contrast ratios, and keyboard navigation. | Accessibility audit in `docs/QA_REPORT.md` |
| **AGENT 21 — DevOps Engineer** | Configures Docker, build pipelines, environment configurations, and dev server. | Dockerfile, `.env.example`, package scripts |
| **AGENT 22 — Documentation Engineer** | Authors practical technical manuals, database guides, and API specifications. | `README.md`, `ARCHITECTURE.md`, `API.md` |
| **AGENT 23 — Final Architecture Reviewer** | Verifies seam depth, provider isolation, and absence of premature complexity. | Architectural review signoff |
| **AGENT 24 — Final Product Reviewer** | Enforces "AI Assists, Humans Decide" and zero-decoration aesthetic policy. | Product integrity signoff |

---

## 2. Inter-Agent Handoff Chain

```
[Agent 01: Product Architect] 
       ↓ (User Flows & Scope)
[Agent 02 & 03: UX & Design System] 
       ↓ (Strict Palette & Tokens)
[Agent 04 & 06: Frontend & Backend Architects] 
       ↓ (API Contracts & Seams)
[Agent 08: Supabase Database Engineer] 
       ↓ (PostgreSQL Tables & Seeds)
[Agent 11, 12, 13, 14: Core Engines (OCR, Fraud, Risk, AI)] 
       ↓ (Deterministic Scoring & Structured Explanations)
[Agent 05 & 07: Frontend & Backend Engineers] 
       ↓ (Working Full-Stack Application)
[Agent 16, 17, 18, 19, 20: Security, QA, E2E, Performance, A11y] 
       ↓ (Automated Passes & Audit Reports)
[Agent 23 & 24: Final Architectural & Product Reviewers]
```
