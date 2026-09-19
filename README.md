# ClaimGuard — Real-Time Expense Verification & Fraud Prevention

> **"Flag it before you pay it."**

ClaimGuard is an enterprise, real-time expense verification and fraud-prevention platform for distributed field workforces. 

The system delivers a unified experience spanning a native **Flutter mobile application**, a responsive **Next.js web application**, an independent **Fastify backend server**, a **Supabase PostgreSQL database**, and an **AWS cloud infrastructure** pipeline (S3, Textract, Bedrock Claude 3.5 Sonnet, Step Functions).

---

## Core Product Principle

**AI ASSISTS. HUMANS DECIDE.**

Never make artificial intelligence the final authority over an employee's reimbursement claim. The AI and deterministic risk engine provide evidence, confidence scores, signals, and recommendations. The finance operations manager retains full authority over approval and rejection.

---

## Key Platform Components

```mermaid
graph TD
    subgraph Mobile Client ["Flutter Mobile App (apps/mobile)"]
        EmpMobile[Employee Experience<br/>Dashboard • Scanner • History]
        MgrMobile[Manager Experience<br/>Queue • Deep Dive • Staff • More]
    end

    subgraph Web Client ["Next.js Web App (src)"]
        EmpWeb["Employee WebView (/employee)"]
        MgrWeb["Manager Operations (/manager)"]
    end

    subgraph Core Backend ["Standalone Fastify Backend (server)"]
        AuthService[Simple Identity & Join Codes]
        FraudEngine[Deterministic Fraud Rules Engine]
        RiskEngine[0-100 Risk Engine & Evidence States]
        AIEngine[AWS Bedrock Explanatory Narrative]
    end

    subgraph Cloud Infrastructure ["AWS & Database"]
        S3[AWS S3 Encrypted Receipts]
        Textract[AWS Textract OCR / Line Items]
        Supabase[(Supabase PostgreSQL + RLS)]
    end

    Mobile Client -->|REST API /api/v1| CoreBackend
    Web Client -->|REST API /api/v1| CoreBackend
    CoreBackend --> S3
    CoreBackend --> Textract
    CoreBackend --> Supabase
```

### 1. Flutter Mobile Application (`apps/mobile/`)
- **Single Binary, Dual Persona**: Dynamic role switching between **Employee Shell** and **Manager Shell** without app restarts.
- **Employee Experience**: Clean receipt scanner with camera/sample injection, instant OCR field extraction, line item breakdown, and real-time claim status tracking.
- **Manager Experience**: Live KPI metrics (Claims Pending, High Risk, Field Staff), high-priority action queue, detailed signal breakdown, and one-click approve/reject actions with mandatory notes.
- **Staff Onboarding**: Join code redemption (`CG-XXXXXX`) for instant device provisioning without third-party OAuth.
- **Android Ready**: MinSdk 21, TargetSdk 34, tested APK build pipeline with zero-issue static analysis (`dart analyze`).

### 2. Next.js Web Application (`src/`)
- **Employee WebView (`/employee`)**: Mobile-first conversational receipt uploader, line-item validation modal, and submission drawer.
- **Manager Portal (`/manager`)**: Split-view receipt zoom, side-by-side duplicate comparator, live audit trail, and department filtering.

### 3. Standalone Fastify Backend Server (`server/`)
- Independent TypeScript microservice running on port `3001` with sub-10ms latency.
- Comprehensive REST API endpoints under `/api/v1` for organizations, sessions, claims, receipts, and audit logs.
- Multi-tenant data model with active join-code generation and verification.
- Hermetic test suite with 14/14 unit and integration tests passing.

### 4. Deterministic Fraud Detection & 0–100 Risk Engine
- **Perceptual Image Hash Duplicate Detection**: Hamming distance $\le 5$ flags exact and cropped re-submissions (+40 points).
- **Indian GSTIN Checksum**: Luhn modulo-36 verification and official 2-digit state code validation (+25 points).
- **Spending Anomaly**: Flags claims $> 2.0\times$ employee category historical average (+20 points).
- **Category Mismatch**: Cross-references vendor taxonomy to detect misattributed expenses (+20 points).
- **Evidence-Based Authenticity States**: Strictly avoids misleading "100% Real" claims; derives evidence states: `VERIFIED`, `LIKELY VALID`, `REVIEW REQUIRED`, `SUSPICIOUS`, and `UNABLE TO VERIFY`.
- **Explainable AI**: AWS Bedrock Claude 3.5 Sonnet generates structured natural-language narratives for managers without making autonomous decisions.

### 5. Supabase PostgreSQL & Multi-Tenant RLS
- Complete schema migration (`supabase/migrations/20260919000001_v2_organizations_and_sessions.sql`) with 11 tables.
- Row-Level Security (RLS) enforcing strict tenant isolation across organizations and employee roles.
- Seed data (`supabase/seed/seed.sql`) pre-loaded with ABC Technologies, active join code `CG-7K4P9X`, manager Priya Sharma, employee Rahul Kumar, and benchmark claim records.

### 6. AWS Single-Region Cloud Infrastructure
- Fully defined in Terraform (`aws/infrastructure/main.tf`): VPC, ECS Fargate, ECR, S3 bucket with AES-256 encryption, Step Functions (`aws/step-functions/claim_processing_workflow.json`), and CloudWatch logging.

---

## Quick Start & Commands

### 1. Prerequisites
- Node.js 18+ (Node.js v25 detected)
- Flutter SDK 3.24+ (Flutter 3.44 detected at `C:\flutter`)
- Java JDK 17+ (JDK 26 detected)

### 2. Run Standalone Backend Server (Port 3001)
```bash
cd server
npm install
npm run build
npm start
```
Run backend tests:
```bash
npm --prefix server test
```

### 3. Run Flutter Mobile App (Android / Web / Desktop)
```bash
cd apps/mobile
C:\flutter\bin\cache\dart-sdk\bin\dart.exe analyze lib test
flutter run
```
Build Android APK:
```bash
cd apps/mobile
flutter build apk --debug
# Output: apps/mobile/build/app/outputs/flutter-apk/app-debug.apk
```
*See detailed APK instructions in [docs/APK_BUILD.md](file:///c:/projects/Claim_guard/docs/APK_BUILD.md).*

### 4. Run Next.js Web Experience (Port 3000)
```bash
npm install
npm run dev
```
Run root fraud engine test suite:
```bash
npm test
```

---

## Canonical Test Scenarios

| Scenario | Bill Details | Expected Risk | Triggered Signals | Evidence State |
|---|---|---|---|---|
| **1. Clean Claim** | Indian Oil Fuel ₹1,850 | **LOW (0)** | None. Valid GSTIN & within policy. | `VERIFIED` |
| **2. Duplicate Receipt** | Indian Oil Fuel ₹3,850 (Re-submitted) | **HIGH (40+)** | `DUPLICATE_RECEIPT` (Matches #CLM-3902). | `SUSPICIOUS` |
| **3. Amount Anomaly** | Indian Oil Fuel ₹8,500 | **MEDIUM (20+)** | `AMOUNT_ANOMALY` (5.6x employee average). | `REVIEW REQUIRED` |
| **4. Category Mismatch** | Barbeque Nation Dining ₹2,450 | **MEDIUM (20+)** | `CATEGORY_MISMATCH` (Dining claimed as Fuel). | `REVIEW REQUIRED` |
| **5. Policy Violation** | BPCL Fuel ₹7,800 | **MEDIUM (15+)** | `POLICY_VIOLATION` (Exceeds ₹5,000 policy cap). | `REVIEW REQUIRED` |
| **6. Multiple Signals** | Duplicate + ₹9,200 + Invalid GSTIN | **CRITICAL (80+)** | `DUPLICATE_RECEIPT` + `AMOUNT_ANOMALY` + `POLICY_VIOLATION` + `INVALID_GSTIN`. | `SUSPICIOUS` |

---

## Documentation Suite

| Document | Description |
|---|---|
| [APK_BUILD.md](file:///c:/projects/Claim_guard/docs/APK_BUILD.md) | Step-by-step Android debug & release APK build and signing guide |
| [MOBILE_ARCHITECTURE.md](file:///c:/projects/Claim_guard/docs/MOBILE_ARCHITECTURE.md) | Flutter mobile application architecture, screens, and shell routing |
| [FLUTTER.md](file:///c:/projects/Claim_guard/docs/FLUTTER.md) | Flutter runtime setup, dependencies, design system, and testing |
| [FRAUD.md](file:///c:/projects/Claim_guard/docs/FRAUD.md) | Deterministic fraud detection rules, GSTIN checksum, and image hashing |
| [RISK.md](file:///c:/projects/Claim_guard/docs/RISK.md) | 0–100 risk scoring formula and evidence-based state definitions |
| [OCR.md](file:///c:/projects/Claim_guard/docs/OCR.md) | AWS Textract document analysis and line item extraction |
| [BACKEND.md](file:///c:/projects/Claim_guard/docs/BACKEND.md) | Fastify server architecture, controllers, and services |
| [API.md](file:///c:/projects/Claim_guard/docs/API.md) | Comprehensive REST API contract (`/api/v1`) |
| [DATABASE.md](file:///c:/projects/Claim_guard/docs/DATABASE.md) | Supabase PostgreSQL schema and table definitions |
| [RLS.md](file:///c:/projects/Claim_guard/docs/RLS.md) | PostgreSQL Row-Level Security policies and access matrix |
| [AWS.md](file:///c:/projects/Claim_guard/docs/AWS.md) | Single-region ECS, ECR, S3, Step Functions, and EventBridge infrastructure |
| [SECURITY.md](file:///c:/projects/Claim_guard/docs/SECURITY.md) | Threat modeling, secret protection, and authorization checks |
| [TESTING.md](file:///c:/projects/Claim_guard/docs/TESTING.md) | Automated testing strategy across backend, web, and mobile |
| [DESIGN_SYSTEM.md](file:///c:/projects/Claim_guard/docs/DESIGN_SYSTEM.md) | Visual design tokens, color palette, typography, and styling rules |
| [ENVIRONMENT_AUDIT.md](file:///c:/projects/Claim_guard/docs/ENVIRONMENT_AUDIT.md) | Detected developer toolchains and environment inventory |
| [SKILLS_USED.md](file:///c:/projects/Claim_guard/docs/SKILLS_USED.md) | Installed agent skills and capability matrix |
| [MCP_CONFIGURATION.md](file:///c:/projects/Claim_guard/docs/MCP_CONFIGURATION.md) | Model Context Protocol integration guidelines |
| [QA_REPORT.md](file:///c:/projects/Claim_guard/docs/QA_REPORT.md) | Quality assurance audit and verification scorecard |
| [WHATSAPP.md](file:///c:/projects/Claim_guard/docs/WHATSAPP.md) | Future WhatsApp Cloud API adapter architecture |
