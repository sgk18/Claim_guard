# ClaimGuard — Standalone Backend Architecture & Service Guide

**Runtime**: Node.js 22 LTS  
**Framework**: Fastify 4.x (High-performance, schema-validated HTTP engine)  
**Language**: TypeScript 5.7 (Strict Mode)  
**Location**: `server/`

---

## 1. Architectural Philosophy

In compliance with **Section 10**, all primary business logic, fraud rules, risk calculation, audit trail generation, and external cloud integrations reside inside the standalone `server/` application.
The browser and frontend clients are treated as untrusted presentation layers. All risk assessments, employee averages, and clearance states are evaluated server-side.

---

## 2. Directory Structure

```
server/
├── Dockerfile                   # Multi-stage production container (Alpine)
├── .dockerignore                # Build context exclusion rules
├── package.json                 # Fastify, CORS, multipart dependencies
├── tsconfig.json                # Server TypeScript compilation config
├── dist/                        # Compiled JavaScript artifacts
├── src/
│   ├── app.ts                   # Fastify server instance, plugin registration, DI
│   ├── index.ts                 # Server entrypoint and port binding
│   ├── config/
│   │   └── index.ts             # Environment variables (port, host, mock mode)
│   ├── types/
│   │   └── index.ts             # Entity definitions (Claim, Receipt, FraudSignal, etc.)
│   ├── domain/
│   │   ├── gstin.ts             # 15-character Indian GSTIN modulo-36 validator
│   │   ├── perceptualHash.ts    # 64-bit DCT Hamming distance comparator
│   │   └── rules.ts             # Deterministic fraud engine rules
│   ├── providers/
│   │   ├── storage.ts           # StorageProvider (S3 / Mock)
│   │   ├── ocr.ts               # OCRProvider (Textract / Mock)
│   │   ├── ai.ts                # AIProvider (Bedrock / Mock)
│   │   └── messaging.ts         # MessagingProvider (WebView / WhatsApp)
│   ├── repositories/
│   │   └── claimRepository.ts   # IClaimRepository & InMemory / Supabase impl
│   ├── services/
│   │   ├── claimService.ts      # Claim orchestration lifecycle
│   │   └── riskService.ts       # 0–100 deterministic risk scoring & AI synthesis
│   ├── controllers/
│   │   ├── claimController.ts   # Claim endpoints controller
│   │   └── receiptController.ts # Receipt upload & magic-byte validation controller
│   └── routes/
│       ├── claims.ts            # /api/v1/claims route definitions
│       ├── receipts.ts          # /api/v1/receipts route definitions
│       └── health.ts            # /health and /ready endpoints
└── tests/
    └── server.test.mjs          # Standalone server integration tests
```

---

## 3. Provider Abstraction Pattern

The backend communicates with third-party cloud infrastructure strictly through clean interfaces:

```typescript
// Storage
export interface StorageProvider {
  uploadReceipt(buffer: Buffer, fileName: string, mimeType: string): Promise<StorageUploadResult>;
  getSignedDownloadUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
}

// OCR
export interface OCRProvider {
  extractReceipt(buffer: Buffer, fileName: string): Promise<{
    extracted: ExtractedReceiptData;
    rawText: string;
    perceptualHash: string;
  }>;
}

// AI
export interface AIProvider {
  explainRisk(claimData: any, riskAssessment: any): Promise<RiskExplanation>;
}

// Messaging
export interface MessagingProvider {
  channelName: string;
  sendMessage(message: OutboundMessage): Promise<{ success: boolean; messageId: string }>;
}
```

### Mock Mode (`CLAIMGUARD_MOCK_MODE=true`)
When mock mode is enabled:
- `MockStorageProvider` stores files locally or references demo assets.
- `MockOCRProvider` deterministically extracts Indian vendor names and amounts.
- `MockAIProvider` generates structured explainable risk narratives without external API billing.
- `WebViewMessagingProvider` handles notifications without WhatsApp Business API fees.

When deployed to production (`CLAIMGUARD_MOCK_MODE=false`), real providers (`S3StorageProvider`, `TextractOCRProvider`, `BedrockAIProvider`, `WhatsAppMessagingProvider`) take over with zero modifications to business logic.

---

## 4. API Endpoints Reference

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/health` | Liveness health check | 200 |
| `GET` | `/ready` | Subsystem readiness check | 200 |
| `GET` | `/api/v1/claims` | List all claims with risk scores | 200 |
| `GET` | `/api/v1/claims/:id` | Get claim detail with matched duplicate claim | 200 |
| `POST` | `/api/v1/claims` | Submit new claim (runs fraud & risk engines) | 201 |
| `POST` | `/api/v1/claims/:id/approve` | Manager clearance with decision notes | 200 |
| `POST` | `/api/v1/claims/:id/reject` | Manager rejection with mandatory reason | 200 |
| `POST` | `/api/v1/claims/:id/clarification` | Request additional employee info | 200 |
| `GET` | `/api/v1/claims/:id/audit` | Immutable audit trail for claim | 200 |
| `POST` | `/api/v1/receipts/upload` | Multipart receipt upload & OCR extraction | 200 |

---

## 5. Running the Standalone Server

### Local Development
```bash
cd server
npm run build
npm start
```
Server listens on `http://0.0.0.0:3001`.

### Docker Production Execution
```bash
cd server
docker build -t claimguard-server:latest .
docker run -p 3001:3001 --env-file ../.env.example claimguard-server:latest
```
Container healthcheck verifies `http://localhost:3001/health` every 30 seconds.
