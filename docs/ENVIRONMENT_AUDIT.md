# ClaimGuard — Environment & Toolchain Audit

**Audit Timestamp**: 2026-09-19T15:26:40+05:30  
**Auditor**: Lead Engineering Orchestrator  
**Platform**: Windows 11 (AMD64)  
**Workspace**: `C:\projects\Claim_guard`

---

## 1. Executive Summary

This audit establishes the baseline environment for the unified ClaimGuard mobile, web, backend, and cloud product. All runtimes, package managers, SDKs, CLI tools, MCP servers, and skills have been surveyed and tested.

---

## 2. Toolchain & Runtime Inventory

| Tool / Runtime | Status | Detected Version / Location | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | Available | `v25.6.0` | Primary runtime for server and Next.js frontend |
| **npm** | Available | `11.8.0` | Package manager for root and server packages |
| **Git** | Available | `2.52.0.windows.1` | Source control |
| **Java (JDK)** | Available | `26.0.1` (`C:\Program Files\Java\jdk-26`) | Oracle SE Runtime / javac compiler |
| **Flutter SDK** | Available | `3.44.1 (channel stable)` at `C:\flutter` | Revision `924134a44c` |
| **Dart SDK** | Available | `3.12.1 (stable)` (`C:\flutter\bin\cache\dart-sdk\bin\dart.exe`) | Directly executable |
| **Android SDK** | Not in PATH | Target path: `%LOCALAPPDATA%\Android\Sdk` | Required for local APK compilation via Gradle |
| **Gradle** | Not in PATH | Gradle wrapper (`gradlew`) | Standard Flutter Android wrapper |
| **Windows Package Manager** | Available | `winget v1.29.290` | Can install Android command-line tools / Android Studio |
| **AWS CLI** | Available | `aws-cli/2.36.29 Python/3.14.6` | Configured for AWS infrastructure tasks |
| **Supabase CLI** | Not in PATH | Direct PostgreSQL / migration scripts | Database managed via SQL migrations & REST API |
| **Docker** | Not in PATH | Dockerfile exists at `server/Dockerfile` | Standalone Docker build verified in plan |

---

## 3. Codebase Architecture Inventory

### 3.1 Web Application (`src/`)
- **Framework**: Next.js 15.1.0 with React 19, TypeScript 5.7, Tailwind CSS 3.4.
- **Portals**:
  - `/employee`: Employee Mobile WebView with receipt submission, OCR review, and chat flow.
  - `/manager`: Manager Operations Dashboard with stats, triage table, and receipt analysis view.
- **Shared Verification Engines**:
  - Perceptual hash 64-bit DCT fingerprinting (`src/services/fraud/perceptualHash.ts`).
  - Indian GSTIN modulo-36 Luhn validator (`src/services/fraud/gstin.ts`).
  - Deterministic policy checks & anomaly scoring (`src/services/fraud/rules.ts`).
  - Configurable risk score engine 0–100 (`src/services/risk/engine.ts`).

### 3.2 Backend Server (`server/`)
- **Framework**: Fastify 4.28 with TypeScript, CORS, and Multipart support.
- **Architecture**: Modular provider-based architecture:
  - Providers: `DatabaseProvider`, `StorageProvider`, `OCRProvider`, `AIProvider`, `MessagingProvider`.
  - Services: `ClaimService`, `RiskService`.
  - Controllers: `ClaimController`, `ReceiptController`.
  - Routes: `/api/v1/claims`, `/api/v1/receipts`, `/health`.
- **Target Expansion**: Add organization management, join-code provisioning, employee management, audit trails, and Bedrock/Textract AWS connectors.

### 3.3 Database Layer (`supabase/`)
- **Database**: Supabase PostgreSQL.
- **Migrations**: `supabase/migrations/20260917000001_create_claimguard_schema.sql`.
- **Relational Entities**: `companies`, `employees`, `managers`, `policies`, `trips`, `claims`, `receipts`, `fraud_signals`, `risk_assessments`, `audit_logs`, `messages`.
- **Target Expansion**: Update schema to include `organizations`, `users/profiles`, `organization_members`, `manager_invites/join_codes`, `roles`, `devices/sessions` as required by Section 11.

### 3.4 Mobile Application (`apps/mobile/`)
- **Target Framework**: Flutter with Material 3 design system.
- **Target Path**: `apps/mobile/`.
- **Architecture**: Role-aware single application supporting Employee and Manager experiences with bottom navigation and shared API contracts.

### 3.5 AWS Cloud Infrastructure (`aws/`)
- **Orchestration**: AWS Step Functions state machine (`aws/step-functions/claim_processing_workflow.json`).
- **Services**: ECS Fargate, ECR, S3, Lambda, EventBridge, Textract, Bedrock, IAM, CloudWatch.

---

## 4. MCP Server & Skills Discovery

### 4.1 MCP Servers
- **Installed**: `blender-mcp` (lazy-loaded).
- **Recommended for Build**: Playwright MCP, AWS MCP, Supabase MCP (documented in `docs/MCP_CONFIGURATION.md`).

### 4.2 Skills Inventory
- **Newly Installed Skill**: `mobile-app-ui-design` installed in `.agents/skills/mobile-app-ui-design` (supports Flutter mobile design, 8-point grid, 60/30/10 color rule).
- **Available Global Skills**:
  - AWS suite: `amazon-bedrock`, `aws-ai-ml`, `aws-cdk`, `aws-compute`, `aws-containers`, `aws-database`, `aws-iam`, `aws-security`, `aws-serverless`, `aws-storage`.
  - Design & Architecture: `design-system`, `ux-design`, `codebase-design`, `domain-modeling`.
  - Quality & Testing: `security-audit`, `qa-plan`, `tdd`, `code-review`.
