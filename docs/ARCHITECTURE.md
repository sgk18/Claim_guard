# CLAIMGUARD — System Architecture & Provider Topology

## 1. System Topology & Layers

ClaimGuard separates concerns into four distinct layers:

```
+-------------------------------------------------------------------------------+
|                             1. CLIENT SURFACES                                |
|                                                                               |
|   /employee : Mobile-First Conversational WebView (WhatsApp-like interaction) |
|   /manager  : Operations Finance Dashboard (KPIs, Queue, Split Review)       |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                             2. API & CHANNEL LAYER                            |
|                                                                               |
|   - REST API Endpoints (/api/claims, /api/employees, /api/manager)            |
|   - NotificationChannel Abstraction (WebViewChannel vs. WhatsAppChannel)      |
|   - WhatsApp Webhook (/api/whatsapp/webhook)                                  |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                       3. CORE ENGINES & PROVIDERS                             |
|                                                                               |
|   +-----------------------+  +-----------------------+  +-------------------+ |
|   | ReceiptStorageProvider|  | OCRProvider           |  | AIProvider        | |
|   | (Local / S3)          |  | (Mock / Textract)     |  | (Mock / Bedrock)  | |
|   +-----------------------+  +-----------------------+  +-------------------+ |
|                                                                               |
|   +-------------------------------------------------------------------------+ |
|   | Deterministic Fraud & Risk Engines                                      | |
|   | - Perceptual Image Fingerprinting (Hamming Distance <= 2)               | |
|   | - Historical Spending Anomaly Calculator (>2x Avg)                      | |
|   | - Policy Limits Validator                                               | |
|   | - Category Mismatch Detector                                            | |
|   | - India GSTIN Validator (State codes, PAN, check digit)                 | |
|   | - Deterministic 0-100 Scorer (Low, Med, High, Critical)                 | |
|   +-------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                           4. DATA & AUDIT STORE                               |
|                                                                               |
|   - Transactional In-Memory / SQLite persistence                              |
|   - 50+ pre-seeded realistic Indian claims covering all edge scenarios        |
|   - Append-only immutable Audit Trail                                         |
+-------------------------------------------------------------------------------+
```

---

## 2. Key Design Patterns
1. **Provider Strategy Pattern**:
   Allows zero-friction swapping between Mock Mode (`MockLocalReceiptStorageProvider`, `MockOCRProvider`, `MockAIProvider`, `WebViewChannel`) and AWS/Meta production providers without touching core claim evaluation logic.
2. **Deterministic Risk Scorer**:
   Scoring logic lives in pure, reproducible TypeScript functions. Zero unpredictability or hallucinatory score penalties.
3. **Channel-Agnostic Core**:
   Whether a message arrives from the Next.js WebView or a Meta WhatsApp Webhook, it enters the same standard claim submission and evaluation pipeline.
