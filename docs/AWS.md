# CLAIMGUARD — AWS Cloud Architecture & Serverless Pipeline

## 1. Cloud Architecture Overview
While ClaimGuard uses **Supabase PostgreSQL** as its primary application database, AWS provides the dedicated document ingestion, serverless OCR, and AI explanation backbone:

```
+-----------------------------------------------------------------------------------+
|                           AWS CLOUD PROCESSING BACKBONE                           |
|                                                                                   |
|  [ S3 Object Storage ]                                                            |
|  - Encrypted multi-part receipt uploads (KMS SSE-S3)                              |
|  - Lifecycle tiering: 90 days standard -> Glacier Instant Retrieval               |
|                                                                                   |
|  [ EventBridge ]                                                                  |
|  - Captures 'ObjectCreated' events from S3                                        |
|  - Dispatches to Step Functions state machine                                     |
|                                                                                   |
|  [ Step Functions Orchestrator ]                                                  |
|  - State machine definition: aws/step-functions/claim_processing_workflow.json    |
|  - Retries with exponential backoff on Textract throttling                        |
|                                                                                   |
|  [ Textract Document Intelligence ]                                               |
|  - AnalyzeExpense API: Extracts vendor, line items, totals, dates, GSTINs         |
|  - Generates confidence score maps per detected key-value pair                    |
|                                                                                   |
|  [ Bedrock Model Invocation ]                                                     |
|  - Model: Anthropic Claude 3.5 Sonnet / Haiku (ap-south-1)                         |
|  - Synthesizes explainable risk narratives and manager action tips                |
|  - Strict JSON schema enforcement                                                 |
|                                                                                   |
|  [ CloudWatch & IAM ]                                                             |
|  - Centralized structured JSON logging                                            |
|  - Least privilege IAM roles per Lambda function                                  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Target Production Workflow (Step-by-Step)
1. **Employee Upload**: Receipt image uploaded to private S3 bucket (`claimguard-receipts-prod`).
2. **Event Dispatch**: EventBridge routes `s3:ObjectCreated` event to AWS Step Functions.
3. **OCR Extraction**: Lambda invokes `textract:AnalyzeExpense`.
4. **Deterministic Rules**: Normalizer runs perceptual duplicate hashing, amount anomaly vs historical employee averages, category validation, and 15-digit GSTIN checksums.
5. **Deterministic Risk Score**: Computed on 0–100 integer scale.
6. **Bedrock Explanation**: Formulates natural-language rationale for the manager.
7. **Supabase Sync**: Results persisted to Supabase `claims`, `receipts`, and `risk_assessments` tables.
8. **Manager Decision**: Finance manager inspects evidence and decides in the dashboard.
