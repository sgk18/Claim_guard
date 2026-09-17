# CLAIMGUARD — Product Specification (MVP)
**Tagline:** *Flag it before you pay it.*

## 1. Executive Overview & Problem Statement
Distributed field workforces across India (sales representatives, field service engineers, logistics and site technicians) incur daily travel, food, accommodation, and fuel expenses. Currently, organizations suffer from:
- Delayed submissions and endless paper/WhatsApp receipt threads.
- Accidental duplicate submissions across billing cycles.
- Fabricated or altered receipts and inflated amounts.
- Category violations (e.g., claiming alcohol/fine-dining under field meals, or personal weekend expenses under weekday fuel).
- Ineligible GST claims and lost Input Tax Credit (ITC) due to invalid or missing vendor GSTINs.

**ClaimGuard** provides an India-first, real-time expense verification and fraud-prevention platform. The employee interacts through an ultra-lightweight, mobile-first responsive WebView that mimics a messaging/WhatsApp flow with zero app installation required. Under the hood, OCR extracts data, deterministic fraud checks and risk scoring run instantly, and explainable AI synthesizes clear risk narratives. Finance managers review and make the final approval/rejection decision through a dedicated Operations Dashboard.

---

## 2. Core Product Principles
1. **AI Assists, Humans Decide**: The AI/risk engine provides signals, confidence scores, evidence snippets, and recommendations. The manager retains sole authority over final claim approval or rejection.
2. **Deterministic Rules First, AI Second**: Math, policy caps, duplicate perceptual hashing, and GSTIN regex/checksum checks are 100% deterministic code. AI is strictly leveraged for normalization, entity extraction ambiguity resolution, and human-readable risk explanation.
3. **Frictionless Mobile-First Experience**: No native app download required. The WebView feels like a WhatsApp conversation: message bubbles, photo uploads, immediate feedback, inline review cards, and status tracking.
4. **Channel-Agnostic Core Architecture**: The core claim processing engine does not know or care whether the receipt was submitted through the Employee WebView or the WhatsApp Business Platform. All messaging interacts via a `NotificationChannel` / `MessagingProvider` abstraction.
5. **No Silent Failures**: Low-confidence OCR extractions prompt employee verification rather than guessing incorrectly.

---

## 3. Personas & Roles
- **Field Employee (e.g., Rahul Kumar, Field Executive)**:
  - Submits receipts on-the-go via mobile browser.
  - Reviews extracted fields, corrects typos, and tracks claim status in real-time.
- **Finance / Operations Manager (e.g., Priya Sharma, Finance Controller)**:
  - Reviews pending claims filtered by risk tier (Low, Medium, High, Critical).
  - Inspects receipts side-by-side with extracted data, policy flags, and duplicate comparisons.
  - Approves or rejects with audit comments.
- **System / Compliance Auditor**:
  - Reviews immutable audit trails of every claim lifecycle event (upload, OCR, rules, risk score, manager action).

---

## 4. MVP Scope vs Future Scope

### Phase 1–6 (MVP Scope - Current)
- **Employee Experience (`/employee`)**:
  - Welcome & Employee Switcher / Session Context.
  - WhatsApp-like Conversational Stream.
  - Camera / Image File Upload (JPEG, PNG, WEBP, up to 10MB) with client-side preview.
  - Live processing feedback (Received → OCR Extracting → Checking Rules).
  - Extracted receipt summary card with inline field verification/correction.
  - Real-time submission confirmation & Claim Status Tracking.
  - Claim History drawer with status filters.
- **Core Processing Engine**:
  - Receipt Storage Provider (Local File / Mock S3).
  - OCR Engine (Structured receipt extraction with field-level confidence).
  - Deterministic Fraud Engine (Duplicate image hash check, amount anomaly vs historical average, policy violation cap, category mismatch, GSTIN validation).
  - Deterministic Risk Scoring Engine (0–100 scale, Low/Medium/High/Critical).
  - AI Risk Explanation Layer (Structured risk breakdown with human-readable rationale).
- **Manager Operations Dashboard (`/manager`)**:
  - KPI Metrics (Total Claims, Pending, Approved, Rejected, High Risk, Fraud Prevented, GST/ITC).
  - Searchable & filterable claims table.
  - Detailed Claim Review view: Split-screen receipt viewer, extracted fields, highlighted risk signals, duplicate comparison visualizer, and audit timeline.
  - One-click Approve / Reject with reason notes.
- **Mock Mode**: Complete out-of-the-box offline execution (`CLAIMGUARD_MOCK_MODE=true`) with 50+ pre-seeded realistic Indian expense claims and demo scenarios.

### Future Scope (Post-MVP)
- Official WhatsApp Cloud API / Webhook Integration (via implemented adapter).
- Live GST Portal / ClearTax API verification for 2B reconciliation.
- GPS trip route cross-referencing and toll toll-booth receipt pairing.
- ERP export (Tally XML, Zoho Books API, SAP RFC).
- Machine learning behavioral profiling over 90-day rolling windows.
