# CLAIMGUARD — Final Consolidated Architecture & Multi-Agent Review

## 1. Multi-Agent Discovery & Review Synthesis

The specialized virtual review panel conducted cross-discipline analysis of the ClaimGuard specifications:

### 1.1 Architectural Conflicts Identified & Resolved
1. **Frontend vs. Backend Claim Creation Boundary**:
   - *Issue*: Should the initial upload directly create an active claim, or a draft/staging record?
   - *Resolution*: Two-stage lifecycle:
     `POST /api/claims/upload` creates an ephemeral draft receipt and extracts fields via OCR.
     `POST /api/claims` confirms or edits the fields, creating the permanent Claim (`CLM-XXXX`) and triggering fraud/risk rules.
     This prevents ghost or aborted claims if an employee leaves the upload midway.
2. **Deterministic Rules vs. AI Risk Scoring Boundary**:
   - *Issue*: Should Bedrock/OpenAI calculate the risk score?
   - *Resolution*: **NO.** Strict adherence to Product Principle #30: Math and scores are 100% deterministic (0–100 integer score computed via weighted rules in `DeterministicRiskEngine`).
   - The AI layer is strictly downstream: it receives the computed signals and generates human-readable explanations, contextualizing the findings for the finance manager.
3. **WhatsApp Decoupling Strategy**:
   - *Issue*: How to avoid polluting the core domain with WhatsApp payload types?
   - *Resolution*: Created the `NotificationChannel` / `MessagingProvider` abstraction:
     - `WebViewChannel` sends UI state/updates to the web chat.
     - `WhatsAppChannel` adapts inbound/outbound Meta Cloud API payloads to the identical agnostic ClaimGuard service interface.

---

## 2. Component & System Topology

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT CLIENTS                                    |
|                                                                                   |
|  [ Employee WebView (Mobile) ]                      [ Manager Dashboard (Desktop) ]
|  - Next.js / React 19 / Tailwind                    - Modern Finance Ops UI       |
|  - Modern WhatsApp-style Chat                       - KPI Stats & Risk Matrix     |
|  - Camera/File Uploader                             - Split-view Receipt Viewer   |
|  - Inline Extracted Verification                    - Duplicate Comparer          |
|  - Realtime Status Tracker                          - 1-Click Approve/Reject      |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                            NEXT.JS API LAYER (REST)                               |
|                                                                                   |
|  /api/claims (upload, list, detail, submit)                                       |
|  /api/claims/:id/approve | /api/claims/:id/reject                                 |
|  /api/employees/:id | /api/manager/stats                                          |
|  /api/whatsapp/webhook (Adapter endpoint)                                         |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                        CORE DOMAIN SERVICES & PROVIDERS                           |
|                                                                                   |
|  +-------------------------+  +--------------------------+  +-------------------+ |
|  | StorageProvider         |  | OCRProvider              |  | AIProvider        | |
|  | - MockLocalStorage      |  | - MockOCRProvider        |  | - MockAIProvider  | |
|  | - S3StorageProvider     |  | - TextractOCRProvider    |  | - BedrockProvider | |
|  +-------------------------+  +--------------------------+  +-------------------+ |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  | Deterministic Fraud & Risk Engine                                            | |
|  | - Perceptual Image Hash Matcher (Exact & Near Duplicate)                     | |
|  | - Historical Amount Anomaly Calculator (vs. Employee Average)               | |
|  | - Policy Cap Validator (Fuel, Meals, Stay)                                   | |
|  | - Category Mismatch Detector (e.g. Dining vs Fuel)                           | |
|  | - India GSTIN Validator (Regex, State code, Checksum)                        | |
|  | - Deterministic 0-100 Risk Scorer (Low, Medium, High, Critical)              | |
|  +------------------------------------------------------------------------------+ |
|                                                                                   |
|  +------------------------------------------------------------------------------+ |
|  | Agnostic Messaging & Channel Adapter                                         | |
|  | - WebViewChannel (Web conversation stream)                                   | |
|  | - WhatsAppChannel (Meta Graph API webhook & cloud sender)                    | |
|  +------------------------------------------------------------------------------+ |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                       DATA LAYER & AUDIT PERSISTENCE                              |
|                                                                                   |
|  - Repository Pattern with in-memory / JSON / SQLite persistence                  |
|  - 50+ pre-seeded realistic Indian field claims & test scenarios                  |
|  - Append-only immutable Audit Log                                                |
+-----------------------------------------------------------------------------------+
```

---

## 3. Project File Tree & Layout

```
claimguard/
├── .env.example
├── .env.local
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── USER_FLOWS.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_CONTRACT.md
│   ├── SECURITY_PLAN.md
│   └── FINAL_ARCHITECTURE.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Landing / Role selector
│   │   ├── employee/
│   │   │   └── page.tsx                 # Mobile-first WhatsApp-style WebView
│   │   ├── manager/
│   │   │   ├── page.tsx                 # Operations Dashboard & Claim Table
│   │   │   └── claims/[id]/page.tsx     # Deep-dive Claim Review & Comparison
│   │   └── api/
│   │       ├── claims/
│   │       │   ├── route.ts             # POST (submit), GET (list)
│   │       │   ├── upload/route.ts      # POST (upload & extract)
│   │       │   └── [id]/
│   │       │       ├── route.ts         # GET (detail)
│   │       │       ├── approve/route.ts # POST (approve)
│   │       │       ├── reject/route.ts  # POST (reject)
│   │       │       └── audit/route.ts   # GET (audit trail)
│   │       ├── employees/[id]/route.ts  # GET (employee profile & stats)
│   │       ├── manager/stats/route.ts   # GET (KPI metrics)
│   │       └── whatsapp/webhook/route.ts# POST/GET (WhatsApp adapter)
│   ├── components/
│   │   ├── employee/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ReceiptUploader.tsx
│   │   │   ├── ExtractedCard.tsx
│   │   │   ├── CorrectionModal.tsx
│   │   │   ├── ClaimStatusBadge.tsx
│   │   │   └── HistoryDrawer.tsx
│   │   ├── manager/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── ClaimTable.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   ├── ReceiptViewer.tsx
│   │   │   ├── DuplicateComparator.tsx
│   │   │   ├── RiskSignalBreakdown.tsx
│   │   │   ├── ApprovalModal.tsx
│   │   │   └── AuditTimeline.tsx
│   │   └── shared/
│   │       ├── Navbar.tsx
│   │       └── Toast.tsx
│   ├── services/
│   │   ├── storage/
│   │   │   ├── index.ts                 # StorageProvider interface
│   │   │   ├── mock.ts                  # MockLocalReceiptStorageProvider
│   │   │   └── s3.ts                    # S3ReceiptStorageProvider
│   │   ├── ocr/
│   │   │   ├── index.ts                 # OCRProvider interface
│   │   │   ├── mock.ts                  # MockOCRProvider (with confidence)
│   │   │   └── textract.ts              # TextractOCRProvider
│   │   ├── fraud/
│   │   │   ├── rules.ts                 # Deterministic fraud checks
│   │   │   ├── perceptualHash.ts        # Image fingerprinting & duplicate check
│   │   │   └── gstin.ts                 # GSTIN verification & checksum
│   │   ├── risk/
│   │   │   └── engine.ts                # Deterministic 0-100 risk scoring
│   │   ├── ai/
│   │   │   ├── index.ts                 # AIProvider interface
│   │   │   ├── mock.ts                  # MockAIProvider
│   │   │   └── bedrock.ts               # BedrockAIProvider
│   │   └── messaging/
│   │       ├── index.ts                 # MessagingProvider interface
│   │       ├── webview.ts               # WebViewChannel
│   │       └── whatsapp.ts              # WhatsAppChannel adapter
│   ├── db/
│   │   ├── schema.ts                    # TypeScript types matching tables
│   │   ├── store.ts                     # In-memory transactional data store
│   │   └── seed.ts                      # 50+ realistic Indian claims seed data
│   └── types/
│       └── index.ts                     # Shared API & Domain Types
├── tests/
│   ├── fraud-engine.test.ts
│   ├── risk-engine.test.ts
│   ├── api-claims.test.ts
│   └── upload-security.test.ts
└── package.json
```

---

## 4. 7 Canonical Demo Scenarios Verified by Architecture
1. **Scenario 1 — Clean Claim**: Indian Oil ₹1,850 fuel receipt. No duplicate, within daily ₹2,500 limit, valid GSTIN. **Result: Risk Score 8 (LOW)**.
2. **Scenario 2 — Duplicate Receipt**: Same receipt uploaded twice by different or same employee. **Result: Risk Score 75+ (HIGH) with side-by-side comparison proof**.
3. **Scenario 3 — Amount Anomaly**: ₹8,500 fuel claim against historical ₹1,500 average. **Result: Risk Score 55 (MEDIUM/HIGH)**.
4. **Scenario 4 — Category Mismatch**: Restaurant/Bar receipt filed under Fuel category. **Result: Risk Score 65 (HIGH)**.
5. **Scenario 5 — Policy Violation**: ₹7,500 claim against ₹5,000 policy ceiling. **Result: Risk Score 60 (HIGH)**.
6. **Scenario 6 — Low OCR Confidence**: Blurry photo flags low confidence (<0.7) and prompts employee correction card.
7. **Scenario 7 — Multiple Signals**: Duplicate + Amount Anomaly + Policy Breach. **Result: Risk Score 95 (CRITICAL)**.
