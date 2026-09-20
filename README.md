# ClaimGuard — Real-Time Expense Verification & Fraud Prevention Platform

> **"Flag it before you pay it."**  
> *An India-first, real-time expense verification and deterministic fraud-prevention platform for distributed field workforces.*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.25-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.28-black?style=flat&logo=fastify)](https://fastify.dev/)
[![Flutter](https://img.shields.io/badge/Flutter-Mobile%20%26%20Web-02569B?style=flat&logo=flutter)](https://flutter.dev/)
[![AWS](https://img.shields.io/badge/AWS-ap--southeast--2-FF9900?style=flat&logo=amazon-aws)](https://aws.amazon.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Automated%20Tests-28%2F28%20PASS-brightgreen?style=flat)](tests/)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=flat)](LICENSE)

---

## 1. What ClaimGuard Is & Why It Exists

### The Core Problem in Indian Field Operations
Enterprises and fast-growing businesses across India deploy hundreds of distributed field agents every day:
- **Freight and logistics fleet managers** refueling trucks at highway petrol bunks.
- **FMCG sales officers** traveling across Tier-2 and Tier-3 distributor networks.
- **Pharmaceutical medical representatives** hosting doctor dinners and regional detailing sessions.
- **Site inspection technicians** incurring daily food, toll, and transit expenses.

Traditionally, expense reimbursement for these teams is broken, plagued by:
1. **Endless Paper & WhatsApp Chaos**: Bills are stuffed in wallets, faded by thermal printer heat, crumpled, or dumped in unindexed WhatsApp group chats weeks later.
2. **Accidental & Intentional Duplicate Resubmissions**: The same fuel or hotel bill is resubmitted in a later month or shared between colleagues.
3. **Padded & Altered Amounts**: Small pen alterations on physical receipts or inflated taxi totals.
4. **Category Misclassification**: Weekend family dining or personal liquor claimed under "Client Meals" or "Vehicle Fuel".
5. **Tax Ineligibility & Lost Input Tax Credit (ITC)**: Receipts with fake, inactive, or missing GSTINs cause companies to lose 18–28% GST tax credits or face tax audit penalties.
6. **Finance Bottlenecks**: Finance teams spend 40% of their month manually auditing paper bills, cross-checking bank slips, and arguing with employees.

### Why Existing Solutions Fail in India
Global enterprise suites like **SAP Concur**, **Expensify**, or **Coupa** were designed for corporate desktop users in North America and Western Europe. In the Indian field context:
- **Prohibitive Cost**: Charging \$10 to \$25 per user/month is unjustifiable for field agents claiming ₹300 to ₹1,500 daily allowances.
- **High App-Installation Resistance**: Field employees refuse to install heavy corporate apps on entry-level Android devices with limited storage.
- **Zero Indian Tax Intelligence**: Global tools have no native understanding of India's 15-digit GSTIN structure, state tax codes, or GST Input Tax Credit (ITC) reconciliation.
- **No Perceptual Image Matching**: They cannot detect when a physical receipt was photographed twice from slightly different angles or lighting conditions.

---

## 2. Core Product Principles

### 1. "AI Assists. Humans Decide."
> **Never make the AI the final authority over an employee's reimbursement claim.**  
The risk engine surfaces hard evidence, duplicate image side-by-side proofs, tax validation status, mathematical deviation scores, and AI-synthesized explanations. However, the finance operations manager retains full authority over approval and rejection. This preserves employee trust, maintains human accountability, and ensures audit compliance.

### 2. "Deterministic Rules First, AI Second"
Math, policy ceilings, perceptual duplicate image hashing, and GSTIN Luhn Modulo-36 checksums are **100% deterministic code**. AI (Anthropic Claude on Amazon Bedrock) is strictly employed to resolve extraction ambiguities, format data, and synthesize clear, human-readable risk narratives for managers—never as an unaccountable black-box score generator.

### 3. "Zero-Friction, Zero-Install Mobile Flow"
Field employees access ClaimGuard through an ultra-lightweight, mobile-first responsive WebView (`/employee`) that feels identical to a WhatsApp conversation: message bubbles, immediate progress ticks, instant OCR previews, and an inline field correction card. No app store installation is mandated.

### 4. "No Silent Failures"
If an image is blurred or OCR confidence falls below 70%, ClaimGuard immediately prompts the employee to verify and correct the extracted total and merchant name *before* submission, eliminating days of back-and-forth email disputes.

---

## 3. High-Level System Architecture

ClaimGuard is structured as a decoupled, multi-tier system separating high-performance ingestion, deterministic risk computation, fullstack presentation, and cloud storage:

```
                                  +---------------------------------------+
                                  |         FIELD EMPLOYEES               |
                                  | - WhatsApp-Inspired Mobile WebView    |
                                  | - Flutter Cross-Platform Client       |
                                  | - Future WhatsApp Cloud API Adapter   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
+---------------------------------------------------------------------------------------------------------+
|                                        NGINX REVERSE PROXY (:80)                                         |
|                       Routes /api/v1/* to Fastify Backend and /* to Next.js Frontend                    |
+------------------------------------+------------------------------------+-------------------------------+
                                     |                                    |
                                     v                                    v
     +-----------------------------------------------+    +-----------------------------------------------+
     |         FASTIFY STANDALONE BACKEND (:3001)    |    |         NEXT.JS 15 WEB APPLICATION (:3000)    |
     | - Sub-10ms response latency                   |    | - App Router & React 19 Server Components     |
     | - Decoupled Provider Interfaces:              |    | - Employee Mobile WebView (/employee)         |
     |     * StorageProvider (S3 / Local / Mock)     |    | - Finance Operations Cockpit (/manager)       |
     |     * OCRProvider (AWS Textract / Mock)       |    | - Deep-Dive Claim Auditor (/manager/claims/id)|
     |     * MessagingProvider (WhatsApp / Web)      |    | - Real-time KPI Dashboards & CSV Exports      |
     +-----------------------+-----------------------+    +-----------------------+-----------------------+
                             |                                                    |
                             +-------------------------+--------------------------+
                                                       |
                                                       v
+---------------------------------------------------------------------------------------------------------+
|                                    DETERMINISTIC FRAUD & RISK ENGINE                                    |
|  1. Perceptual dHash Duplicate Matcher (Hamming Distance <= 5)                         [+40 pts]       |
|  2. Indian GSTIN Luhn Modulo-36 Checksum & State Code Validator                        [+25 pts]       |
|  3. Historical Spending Anomaly Multiplier (> 2.0x Moving Average)                     [+20 pts]       |
|  4. Semantic Category & Vendor Taxonomy Mismatch Detector                             [+20 pts]       |
|  5. Company Policy Limits & Tax Threshold Enforcement                                  [+15 pts]       |
|  6. Date Timing & Weekend Submission Validator                                         [+10 pts]       |
|  --> Computes Objective 0-100 Risk Score & Maps to Evidence Authenticity States                         |
+------------------------------------------------------+--------------------------------------------------+
                                                       |
                        +------------------------------+------------------------------+
                        |                                                             |
                        v                                                             v
+-----------------------------------------------+             +-----------------------------------------------+
|         AWS CLOUD BACKBONE (ap-southeast-2)   |             |           SUPABASE POSTGRESQL DATABASE        |
| - S3 Receipts Bucket (KMS AES-256 Encrypted)  |             | - 11 Relational Tables with Foreign Keys      |
| - EC2 Amazon Linux 2023 (systemd supervised)  |             | - Row-Level Security (RLS) Policy Isolation   |
| - AWS Systems Manager (SSM) zero-port admin   |             | - UUID Primary Keys & Perceptual Hash Indexes |
| - CloudFront Global HTTPS Edge Distribution   |             | - Immutable Audit Log Ledger                  |
+-----------------------------------------------+             +-----------------------------------------------+
```

---

## 4. Key Capabilities & Product Modules

### 4.1. Mobile-First Employee Experience (`/employee`)
- **Conversational Chat Stream**: Visual progress updates mimicking real-time chat ticks: `Image Uploaded` → `OCR Analyzing` → `Evaluating Policies` → `Secured`.
- **Intelligent Camera & File Upload**: Accepts JPEG, PNG, and WebP up to 25MB with client-side thumbnail generation and drag-and-drop support.
- **One-Click Test Scenarios**: In-app scenario selector allowing users to simulate Clean claims, Duplicates, Anomalies, and Policy breaches instantly.
- **Interactive Extracted Fields Card**: Live summary of detected vendor, total amount, expense category, claim date, and GSTIN.
- **Inline Correction Modal**: Low-confidence OCR extractions (smudged totals, ambiguous dates) trigger an inline edit dialog prior to submission.
- **Real-Time Claim History Drawer**: Field reps can track submission history, reimbursement status, and manager review notes on the road.

### 4.2. Finance Operations Cockpit (`/manager`)
- **Executive KPI Cards**: Real-time business metrics:
  - *Total Claims Processed*
  - *Pending Manager Reviews*
  - *High/Critical Risk Detected*
  - *Fraud Prevented (INR)*
  - *Eligible Input Tax Credit Recovered (INR)*
- **Multi-Dimensional Search & Filtering**: Filter claims by Risk Tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), Approval Status (`PENDING`, `APPROVED`, `REJECTED`), and Category (`fuel`, `food`, `travel`, `lodging`, `misc`).
- **Deep-Dive Audit Inspector (`/manager/claims/[id]`)**:
  - **Split-Screen Zoomable Receipt Viewer**: High-resolution image inspection alongside extracted structured data.
  - **Side-by-Side Duplicate Comparator**: If a duplicate receipt is suspected, the dashboard loads the historical matching claim side-by-side with visual comparison proof, matched submitter name, and date.
  - **Raw OCR Inspector**: Collapsible drawer showing verbatim text extracted by OCR with field-by-field confidence scores.
  - **Itemized Risk Signal Breakdown**: Mathematical score contribution for every triggered rule (+40, +25, +20).
  - **Explainable AI Narrative**: Synthesized summary translating raw signals into executive action recommendations.
  - **Approval / Rejection Action Modal**: Requires mandatory manager audit notes for rejected or override-approved claims.
  - **Immutable Audit Timeline**: Chronological event ledger recording every action from submission to payment clearance.

---

## 5. The Verification & Fraud Detection Engine

ClaimGuard enforces deterministic fraud detection. Every claim receives an objective **0 to 100 Risk Score** calculated from mathematical signals:

$$\text{Final Risk Score} = \min\left(100, \max\left(0, \sum_{i=1}^{n} \text{SignalImpact}_i\right)\right)$$

### 5.1. Deterministic Fraud Signals

| Signal Code | Severity | Score Impact | Algorithm & Trigger Condition |
|---|---|---|---|
| `DUPLICATE_RECEIPT` | **HIGH** | **+40** | **Perceptual Image Hash (dHash)** with Hamming Distance $\le 5$ against historical receipts, or identical Vendor + Amount + Date within 60 days. |
| `INVALID_GSTIN` | **MEDIUM** | **+25** | **Indian GSTIN Checksum**: Validates 15-character structure, matches 2-digit state code (01–38), and computes Luhn Modulo-36 check digit. |
| `AMOUNT_ANOMALY` | **MEDIUM** | **+20** | **Statistical Outlier**: Claim amount exceeds **$2.0\times$** the employee's historical moving average for that category (minimum 3 prior claims). |
| `CATEGORY_MISMATCH`| **MEDIUM** | **+20** | **Taxonomy Cross-Check**: Vendor semantics contradict declared category (e.g. Barbeque Nation dining receipt claimed under `fuel`). |
| `POLICY_VIOLATION` | **HIGH** | **+15** | **Company Policy Ceiling**: Claim exceeds category max allowance (e.g. > ₹5,000 for single meal) or lacks required tax invoice identifier. |
| `DATE_MISMATCH` | **LOW** | **+10** | **Temporal Anomaly**: Receipt dated in the future, older than submission cutoff window (30 days), or unapproved weekend expenditure. |
| `LOW_OCR_CONFIDENCE`| **INFO** | **+0** | **Extraction Quality**: Triggered when OCR character confidence is $< 70\%$, prompting employee inline self-correction. |

### 5.2. Evidence-Based Authenticity States

To prevent ambiguous claims of "100% Verified", ClaimGuard derives qualified authenticity states:

| Authenticity State | Score Range | Default Manager Action | UI Indicator |
|---|---|---|---|
| **`VERIFIED`** | 0 – 24 | `APPROVE_RECOMMENDED` | Green badge, instant one-click approval recommended. |
| **`LIKELY_VALID`** | 25 – 49 | `MANUAL_REVIEW` | Blue badge, minor warnings; standard verification. |
| **`REVIEW_REQUIRED`**| 50 – 74 | `INVESTIGATION_REQUIRED`| Amber badge, amount anomaly or policy cap breach. |
| **`SUSPICIOUS`** | 75 – 100 | `REJECT_RECOMMENDED` | Red badge, duplicate receipt hash or forged GSTIN. |
| **`UNABLE_TO_VERIFY`**| Any | `EMPLOYEE_RETRY` | Slate badge, blurry image or unreadable receipt text. |

---

## 6. Canonical Demo Scenarios

ClaimGuard includes a built-in scenario simulator pre-configured with 50+ realistic Indian expense claims:

| # | Scenario Name | Bill Details | Risk Score | Expected State | Primary Triggered Signals |
|---|---|---|---|---|---|
| **1** | **Clean Routine Claim** | Indian Oil Fuel ₹1,850 | **0 / 100** | `VERIFIED` | None. Valid Karnataka GSTIN, matches historical route average. |
| **2** | **Duplicate Receipt** | Indian Oil Fuel ₹3,850 | **78 / 100** | `SUSPICIOUS` | `DUPLICATE_RECEIPT` (Matches #CLM-3902), `AMOUNT_ANOMALY`. |
| **3** | **Amount Anomaly** | Indian Oil Fuel ₹8,500 | **55 / 100** | `REVIEW_REQUIRED`| `AMOUNT_ANOMALY` ($6.0\times$ employee average), `POLICY_VIOLATION`. |
| **4** | **Category Mismatch** | Barbeque Nation ₹2,450 | **65 / 100** | `REVIEW_REQUIRED`| `CATEGORY_MISMATCH` (Dining claimed as Fuel), `POLICY_VIOLATION`. |
| **5** | **Policy Cap Violation** | BPCL Highway Fuel ₹7,800| **60 / 100** | `REVIEW_REQUIRED`| `POLICY_VIOLATION` (Exceeds ₹5,000 category ceiling). |
| **6** | **Low OCR Confidence** | Smudged Thermal Bill | **N/A** | `UNABLE_TO_VERIFY`| `LOW_OCR_CONFIDENCE` (Prompts employee inline self-correction). |
| **7** | **Compounding Fraud** | Duplicate + ₹9,200 + Fake GST| **95 / 100** | `SUSPICIOUS` | `DUPLICATE_RECEIPT` + `AMOUNT_ANOMALY` + `INVALID_GSTIN`. |

---

## 7. Cloud Infrastructure & AWS Architecture

The production environment is deployed in AWS Region **`ap-southeast-2`** (Sydney) under the New AWS Experience:

- **Amazon EC2**: `t3.small` instance (`i-0bc769876453d54a2`) running Amazon Linux 2023 with systemd service supervision.
- **Unified NGINX Gateway**: Listens on port 80 with Gzip compression, 25MB body upload limits, and SSL termination readiness.
- **Amazon S3**: Private encrypted receipt storage (`claimguard-receipts-464642803462`) with AES-256 SSE encryption and strict public access block.
- **AWS Systems Manager (SSM)**: Zero-port remote infrastructure management eliminating exposed SSH/bastion risks.
- **Fastify Backend Microservice**: Runs on Node.js 20 with in-memory fallback and Supabase PostgreSQL pool adapters.
- **Next.js 15 Web App**: Pre-rendered SSR pages with React 19 server actions.

### Live Production Endpoints

| Interface | URL | Description |
|---|---|---|
| **Marketing & Product Landing** | `http://3.106.192.153/` | Value proposition, ROI calculator, and overview |
| **Employee Mobile WebView** | `http://3.106.192.153/employee` | WhatsApp-style conversational receipt upload |
| **Finance Manager Dashboard** | `http://3.106.192.153/manager` | Operations audit queue, risk breakdown, and analytics |
| **Claims REST API Root** | `http://3.106.192.153/api/v1/claims`| Fastify REST endpoints returning seeded claims |
| **Backend Server Health Probe** | `http://3.106.192.153/server-health`| Fastify process status and uptime monitor |
| **NGINX Gateway Health Probe** | `http://3.106.192.153/healthz` | Reverse proxy load-balancer probe |

---

## 8. Database Schema & Data Integrity

The persistence layer is modeled in **PostgreSQL** across 11 relational tables with strict referential integrity and Row-Level Security:

```
+----------------+       +----------------+       +----------------+
|   companies    | <---  |   employees    | <---  |     trips      |
+----------------+       +----------------+       +----------------+
        |                        |                        |
        v                        v                        v
+----------------+       +----------------+       +----------------+
|    policies    |       |     claims     | <---> |    receipts    |
+----------------+       +----------------+       +----------------+
                                 |                        |
        +------------------------+------------------------+
        |                        |                        |
        v                        v                        v
+----------------+       +----------------+       +----------------+
| risk_assessment|       |   audit_logs   |       |ocr_extractions |
+----------------+       +----------------+       +----------------+
        |
        v
+----------------+
|  risk_signals  |
+----------------+
```

### Table Definitions & Roles
1. `companies`: Multi-tenant organization profile and company tax identifiers.
2. `employees`: Field agent profiles, department roles, and moving historical spending averages (`historicalClaimAvg`, `historicalClaimCount`).
3. `policies`: Category spending limits, daily caps, and mandatory GSTIN thresholds.
4. `trips`: Optional itinerary or route pairing for transit expense verification.
5. `claims`: Core expense records with lifecycle states (`PENDING`, `APPROVED`, `REJECTED`).
6. `receipts`: Metadata, file storage URLs, and 64-bit perceptual image hashes (`imageHash`).
7. `ocr_extractions`: Raw extracted text, vendor candidates, line items, and confidence maps.
8. `risk_assessments`: Deterministic 0–100 risk score, risk level, and explainable AI narrative.
9. `risk_signals`: Individual triggered rules with mathematical score impacts and metadata.
10. `audit_logs`: Append-only, immutable event ledger tracking submitters, managers, and notes.
11. `gstin_verifications`: State codes, PAN extraction, and Input Tax Credit eligibility cache.

---

## 9. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Web Frontend** | Next.js 15.5 (App Router), React 19, Tailwind CSS, Lucide Icons, TypeScript 5.7 |
| **Mobile Client** | Flutter 3.x (Web, Android, iOS), Provider State Management, Clean Architecture |
| **Backend Microservice** | Fastify 4.28, TypeScript 5.7, `@fastify/cors`, `@fastify/multipart` |
| **Database & Auth** | Supabase PostgreSQL 15, Row-Level Security (RLS), Connection Pooling (`pg`) |
| **Cloud & DevOps** | AWS EC2 (AL2023), AWS S3, NGINX 1.30, AWS Systems Manager (SSM), Terraform |
| **AI & Document OCR** | AWS Textract AnalyzeExpense, Amazon Bedrock (Anthropic Claude 3.5 Sonnet) |
| **Testing Framework** | Native Node.js Test Runner (`node --test`), `tsx`, 28 Automated Tests |

---

## 10. Quick Start & Local Development

### Prerequisites
- Node.js 18+ (Node.js 20 LTS recommended)
- npm 9+
- Git

### 1. Installation
```bash
# Clone repository
git clone https://github.com/sgk18/Claim_guard.git
cd Claim_guard

# Install frontend dependencies
npm install

# Install standalone server dependencies
cd server
npm install
cd ..
```

### 2. Run Automated Test Suites (28/28 Tests Passing)
```bash
# Run Next.js domain engine & API tests (20/20 PASS)
npm test

# Run Fastify standalone server integration tests (8/8 PASS)
npm --prefix server test
```

### 3. Start Development Servers

#### Option A: Next.js Integrated Application (Port 3000)
```bash
npm run dev
```
Open in browser:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Employee WebView**: [http://localhost:3000/employee](http://localhost:3000/employee)
- **Manager Operations Dashboard**: [http://localhost:3000/manager](http://localhost:3000/manager)

#### Option B: Standalone Fastify Backend API (Port 3001)
```bash
cd server
npm run build
npm start
```
Endpoints:
- `GET http://localhost:3001/health`
- `GET http://localhost:3001/ready`
- `GET http://localhost:3001/api/v1/claims`

#### Option C: Production Docker Deployment
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 11. Comprehensive Documentation Index

The complete ClaimGuard design, architecture, and compliance documentation suite is available in the [`docs/`](docs/) directory:

| Document | Topic & Content |
|---|---|
| [PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) | Product vision, target personas, user journeys, and MVP requirements |
| [FRAUD.md](docs/FRAUD.md) | Deterministic fraud detection algorithms, dHash formulas, and GSTIN Luhn Mod-36 |
| [RISK.md](docs/RISK.md) | 0–100 risk scoring formula, authenticity state definitions, and review thresholds |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | High-level system architecture, component boundaries, and provider contracts |
| [SYSTEM_FLOW.md](docs/SYSTEM_FLOW.md) | End-to-end receipt lifecycle Mermaid sequence diagrams |
| [API.md](docs/API.md) | REST API data contracts, schema specifications, and response formats |
| [BACKEND.md](docs/BACKEND.md) | Fastify microservice architecture, service layer, and controller definitions |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Supabase PostgreSQL schema, relational tables, and foreign keys |
| [RLS.md](docs/RLS.md) | Row-Level Security policies, tenant isolation, and audit permission matrices |
| [MOBILE_ARCHITECTURE.md](docs/MOBILE_ARCHITECTURE.md) | Flutter client architecture, state management, and offline receipt capture |
| [AWS.md](docs/AWS.md) | AWS cloud infrastructure, S3 bucket encryption, and Step Functions workflow |
| [AWS_HOSTING_STEP_BY_STEP.md](docs/AWS_HOSTING_STEP_BY_STEP.md) | Step-by-step operational runbook for AWS EC2, NGINX, and S3 provisioning |
| [SECURITY.md](docs/SECURITY.md) | Threat modeling, cryptographic hashing, and secret protection standards |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Color tokens, typography, glassmorphism specs, and mobile styling rules |
| [QA_REPORT.md](docs/QA_REPORT.md) | Comprehensive test report, 36-item Section 49 audit gate, and scenario coverage |
| [WHATSAPP_INTEGRATION.md](docs/WHATSAPP_INTEGRATION.md) | WhatsApp Business Platform Cloud API architecture and webhook contracts |

---

## 12. Security & Compliance Safeguards

- **Immutable Audit Trail**: Every status change, manager approval, or rejection note creates an unalterable row in `audit_logs` with actor ID, timestamp, and metadata.
- **Deterministic Explainability**: Every risk score increment can be traced to a specific line of code and mathematical rule.
- **KMS AES-256 Storage Encryption**: Receipt images stored in Amazon S3 are encrypted at rest with public access blocked.
- **Tenant Isolation**: Multi-tenant data segregation enforced through company foreign keys and PostgreSQL Row-Level Security policies.
- **Zero Open Administrative Ports**: The production cloud host relies on AWS Systems Manager (SSM) session tokens instead of exposed SSH ports.

---

## 13. License & Copyright

Copyright © 2026 ClaimGuard Technologies. All rights reserved.  
Proprietary financial verification and fraud-prevention software.
