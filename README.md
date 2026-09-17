# ClaimGuard — Real-Time Expense Verification & Fraud Prevention

> **"Flag it before you pay it."**

ClaimGuard is an India-first, real-time expense verification and fraud-prevention platform for distributed field workforces. 

Field employees submit expense receipts through a lightweight, zero-installation mobile-first WhatsApp-inspired WebView. The backend instantly extracts structured data via OCR, evaluates deterministic fraud rules (duplicate perceptual hashing, historical amount anomalies, category mismatches, policy ceilings, and Indian GSTIN compliance), computes a deterministic 0–100 risk score, and generates human-readable explainable AI risk narratives for finance managers.

---

## Core Product Principle

**AI ASSISTS. HUMANS DECIDE.**

Never make the AI the final authority over an employee's reimbursement claim. The AI and risk engine provide evidence, confidence scores, signals, and recommendations. The finance operations manager retains full authority over approval and rejection.

---

## Key Capabilities & Architecture

- **Mobile-First Employee WebView (`/employee`)**:
  - Conversational chat interface responsive across mobile viewports (375x812, 390x844, 412x915) and desktop.
  - Receipt upload with drag-and-drop, file picker, and 1-click test scenario presets.
  - Interactive Extracted Fields Card with low-confidence OCR indicators.
  - Inline field correction modal prior to submission.
  - Real-time status tracking and submitted claims history drawer.

- **Finance Manager Operations Dashboard (`/manager`)**:
  - Live KPI metrics: Total Claims, Pending Review, High Risk, Fraud Prevented (INR), Potential GST/ITC (INR).
  - Searchable, filterable claims table (Risk Tier, Status, Category).
  - Deep-dive Claim Review (`/manager/claims/[id]`) with zoomable split-view receipt viewer and raw OCR inspector.
  - Side-by-side Duplicate Comparator displaying visual receipt proof when duplicate claims are detected.
  - Itemized Risk Signal breakdown with deterministic score impact (+40, +25, +20, etc.).
  - One-click Approve or Reject modal with mandatory manager audit notes.
  - Immutable chronological audit timeline.

- **India-First Verification Engine**:
  - Perceptual image hashing for duplicate detection (exact and re-photographed bills).
  - 15-digit GSTIN validation with state-code extraction (e.g., 29 = Karnataka) and ITC tax eligibility logic.
  - Historical spending anomaly calculation vs employee average.
  - Category mismatch detection (e.g., dining claimed as fuel).

- **Decoupled Standalone Server (`server/`)**:
  - Fastify 4.x TypeScript microservice with sub-10ms response times.
  - Decoupled `StorageProvider`, `OCRProvider`, `AIProvider`, and `MessagingProvider` interfaces.
  - Runs in standalone mode or inside multi-stage Alpine Docker container.
  - Full test suite: 8/8 Fastify API tests passing, 9/9 domain engine tests passing.

- **Cloud & Database Architecture**:
  - Supabase PostgreSQL schema with 11 relational tables, UUID primary keys, and Row-Level Security (RLS).
  - AWS Infrastructure defined via Terraform IaC (`aws/infrastructure/main.tf`): VPC, ECS Fargate, ECR, S3, Step Functions, EventBridge, CloudWatch.

---

## Quick Start

### 1. Prerequisites
- Node.js 18+ (Tested on Node.js v20+)
- npm 9+

### 2. Installation
```bash
# Clone repository
git clone <repo-url>
cd Claim_guard

# Install frontend dependencies
npm install

# Install standalone server dependencies
cd server
npm install
cd ..
```

### 3. Generate Demo Receipt Assets
```bash
python scripts/generate_demo_receipts.py
```

### 4. Run Automated Test Suites
```bash
# Run domain engine unit tests (9/9 PASS)
npm test

# Run standalone Fastify server integration tests (8/8 PASS)
npm --prefix server test
```

### 5. Start Development Servers

**Option A: Next.js Integrated Application (Port 3000)**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000):
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Employee WebView**: [http://localhost:3000/employee](http://localhost:3000/employee)
- **Manager Dashboard**: [http://localhost:3000/manager](http://localhost:3000/manager)

**Option B: Standalone Fastify Backend Server (Port 3001)**
```bash
cd server
npm start
```
Endpoints:
- `GET http://localhost:3001/health`
- `GET http://localhost:3001/ready`
- `GET http://localhost:3001/api/v1/claims`
- `POST http://localhost:3001/api/v1/claims`

**Option C: Docker Containerization**
```bash
cd server
docker build -t claimguard-api:latest .
docker run -p 3001:3001 -e CLAIMGUARD_MOCK_MODE=true claimguard-api:latest
```

---

## Canonical Demo Scenarios

| Scenario | Bill Details | Expected Risk | Triggered Signals |
|---|---|---|---|
| **1. Clean Claim** | Indian Oil Fuel ₹1,850 | **LOW (0-29)** | None. Valid GSTIN & within policy. |
| **2. Duplicate Receipt** | Indian Oil Fuel ₹3,850 (Re-submitted) | **HIGH (78)** | `DUPLICATE_RECEIPT` (Matches #CLM-3902), `AMOUNT_ANOMALY`. |
| **3. Amount Anomaly** | Indian Oil Fuel ₹8,500 | **MEDIUM/HIGH (55)** | `AMOUNT_ANOMALY` (6.0x employee average), `POLICY_VIOLATION`. |
| **4. Category Mismatch** | Barbeque Nation Dining ₹2,450 | **HIGH (65)** | `CATEGORY_MISMATCH` (Dining claimed as Fuel). |
| **5. Policy Violation** | BPCL Fuel ₹7,800 | **HIGH (60)** | `POLICY_VIOLATION` (Exceeds ₹5,000 policy cap). |
| **6. Low OCR Confidence** | Smudged/Blurry receipt | **REVIEW REQUIRED** | `LOW_OCR_CONFIDENCE` (Prompts employee correction). |
| **7. Multiple Signals** | Duplicate + ₹9,200 + Invalid GSTIN | **CRITICAL (95)** | `DUPLICATE_RECEIPT` + `AMOUNT_ANOMALY` + `POLICY_VIOLATION` + `GSTIN_SIGNAL`. |

---

## Architecture & Documentation Suite

| Document | Description |
|---|---|
| [INITIAL_REPOSITORY_AUDIT.md](file:///c:/projects/Claim_guard/docs/INITIAL_REPOSITORY_AUDIT.md) | Baseline inventory of codebase, packages, and components |
| [ARCHITECTURE.md](file:///c:/projects/Claim_guard/docs/ARCHITECTURE.md) | High-level system architecture and component boundaries |
| [SYSTEM_FLOW.md](file:///c:/projects/Claim_guard/docs/SYSTEM_FLOW.md) | End-to-end receipt lifecycle Mermaid sequence flows |
| [API.md](file:///c:/projects/Claim_guard/docs/API.md) | REST API endpoints and data contracts (`/api/v1`) |
| [BACKEND.md](file:///c:/projects/Claim_guard/docs/BACKEND.md) | Standalone Fastify architecture, services, and repositories |
| [DATABASE.md](file:///c:/projects/Claim_guard/docs/DATABASE.md) | Supabase PostgreSQL schema and table definitions |
| [RLS.md](file:///c:/projects/Claim_guard/docs/RLS.md) | PostgreSQL Row-Level Security policies and access matrix |
| [AWS.md](file:///c:/projects/Claim_guard/docs/AWS.md) | ECS, ECR, S3, Step Functions, and EventBridge infrastructure |
| [SECURITY.md](file:///c:/projects/Claim_guard/docs/SECURITY.md) | Threat modeling, secret protection, and authorization checks |
| [TESTING.md](file:///c:/projects/Claim_guard/docs/TESTING.md) | Testing strategy, automated unit/integration test specifications |
| [DESIGN_SYSTEM.md](file:///c:/projects/Claim_guard/docs/DESIGN_SYSTEM.md) | Visual design tokens, color palette, typography, and styling rules |
| [SKILLS_USED.md](file:///c:/projects/Claim_guard/docs/SKILLS_USED.md) | Agent skills inventory and architectural rationale |
| [MCP_CONFIGURATION.md](file:///c:/projects/Claim_guard/docs/MCP_CONFIGURATION.md) | Model Context Protocol integration guidelines |
| [AGENTS.md](file:///c:/projects/Claim_guard/docs/AGENTS.md) | 24-subagent operational roster and delegation matrix |
| [QA_REPORT.md](file:///c:/projects/Claim_guard/docs/QA_REPORT.md) | Comprehensive QA report & 36-item Section 49 quality gate |
| [WHATSAPP.md](file:///c:/projects/Claim_guard/docs/WHATSAPP.md) | Future WhatsApp Cloud API adapter architecture |
