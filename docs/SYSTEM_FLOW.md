# ClaimGuard — End-to-End System Flow & Verification Lifecycle

**Product Tagline**: Flag it before you pay it.  
**Core Principle**: AI Assists. Humans Decide.

---

## 1. Complete End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Emp as Field Employee
    participant WV as Employee WebView (/employee)
    participant API as Standalone API (Fastify /api/v1)
    participant Sto as StorageProvider (S3 / Mock)
    participant OCR as OCRProvider (Textract / Mock)
    participant Fraud as Deterministic Fraud Engine
    participant Risk as Deterministic Risk Engine
    participant AI as AIProvider (Bedrock / Mock)
    participant DB as Supabase PostgreSQL
    actor Mgr as Finance Manager
    participant Dash as Manager Dashboard (/manager)

    Emp->>WV: Uploads Receipt (Camera/File)
    WV->>API: POST /api/v1/receipts/upload (Multipart)
    API->>API: Validate MIME Magic Bytes (JPEG/PNG/WebP) & File Size (<10MB)
    API->>Sto: Upload Binary File
    Sto-->>API: fileUrl, storageKey
    API->>OCR: Extract Receipt Data & Perceptual Hash
    OCR-->>API: Extracted Data (Vendor, Amount, Date, GSTIN, Confidence)
    API-->>WV: Return Extracted Fields & Draft Receipt

    WV->>Emp: Displays Extracted Fields Card
    Emp->>WV: Confirms (or corrects) Fields & Clicks "Submit Claim"
    WV->>API: POST /api/v1/claims (employeeId, vendor, amount, date, category, gstin)

    API->>DB: Query Employee Baseline & Historical Claims
    DB-->>API: historicalClaimAvg, recent claims

    API->>Fraud: Evaluate Deterministic Rules
    Note over Fraud: 1. Perceptual Duplicate Hash<br/>2. Amount Anomaly (>2x avg)<br/>3. Policy Cap Breach<br/>4. Date Itinerary Mismatch<br/>5. GSTIN Format & Modulo-36 Check
    Fraud-->>API: FraudSignal[] list

    API->>Risk: Calculate Deterministic Score (0–100)
    Risk->>Risk: Score Sum & Tier Assignment (LOW, MEDIUM, HIGH, CRITICAL)
    Risk->>AI: Generate Structured Risk Narrative & Tips
    AI-->>Risk: Explainable summary & recommendations
    Risk-->>API: RiskAssessment entity

    API->>DB: Persist Claim, Receipt, Signals, RiskAssessment & AuditLog
    API-->>WV: Return Claim Confirmation & Initial Status (PENDING/REVIEW_REQUIRED)

    Note over Dash,Mgr: Manager Operations Flow
    Mgr->>Dash: Opens Dashboard & Claims Queue
    Dash->>API: GET /api/v1/claims
    API->>DB: Fetch claims queue
    DB-->>API: Claims list with risk levels
    API-->>Dash: Display KPI stats & Queue

    Mgr->>Dash: Clicks Suspected Claim (e.g., CLM-4471)
    Dash->>API: GET /api/v1/claims/CLM-4471
    API-->>Dash: Full Claim Data + Matched Historical Receipt for Split Comparator
    Dash->>Mgr: Renders Receipt Viewer, Side-by-Side Comparator, Risk Signals, AI Tips

    alt Manager Approves
        Mgr->>Dash: Clicks "Approve Claim" with Decision Note
        Dash->>API: POST /api/v1/claims/CLM-4471/approve
        API->>DB: Update Status = APPROVED, Append AuditLog (actorType=MANAGER)
        API->>WV: Dispatch Outbound Message to Employee ("Claim APPROVED")
    else Manager Rejects
        Mgr->>Dash: Clicks "Reject Claim" with Rejection Reason
        Dash->>API: POST /api/v1/claims/CLM-4471/reject
        API->>DB: Update Status = REJECTED, Append AuditLog (actorType=MANAGER)
        API->>WV: Dispatch Outbound Message to Employee ("Claim REJECTED: ...")
    end
```

---

## 2. Key Lifecycle Stages

### Stage 1: Client Ingestion & Sanitization
1. Receipt is captured or uploaded via the mobile WebView.
2. File is inspected for binary signatures (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `RIFF...WEBP` for WebP). Unsafe or oversized files (>10MB) are rejected immediately with HTTP 415 / 413.

### Stage 2: Optical Extraction & Normalization
1. OCR extracts textual fields: Vendor Name, Total Amount, Transaction Date, Indian GSTIN (15-character statutory tax ID).
2. Per-field optical confidence scores are generated. If confidence falls below 70%, the card visually prompts the employee to verify values before submission.
3. A 64-bit DCT perceptual image fingerprint is calculated from the raw receipt pixels.

### Stage 3: Deterministic Rule Verification
Business rules run without nondeterministic LLM interference:
- **Duplicate Receipt**: Compares perceptual hash against all prior approved company claims using bitwise Hamming distance ($\le 4$ bits distance = exact duplicate, $\le 8$ bits = near duplicate).
- **Amount Anomaly**: Flags if requested amount exceeds $2.0\times$ the employee's verified historical claim average.
- **Policy Ceiling**: Flags if amount breaches category caps (e.g. Fuel ₹4,000, Food ₹1,500).
- **GSTIN Validation**: Validates 15-character alphanumeric format, state code (01–38), and modulo-36 checksum.

### Stage 4: Risk Scoring & AI Explanation
1. Risk score is computed as a deterministic 0–100 integer:
   - Duplicate receipt: $+40$
   - Policy violation: $+20$
   - Amount anomaly: $+15$
   - Date mismatch: $+15$
   - Category breach: $+10$
   - GSTIN mismatch: $+15$
2. AI (AWS Bedrock / Mock Provider) takes the structured claim metadata and triggered signals, synthesizing an operational explanation with concrete managerial recommendations.

### Stage 5: Manager Decision & Audit Immutability
1. High and Critical claims appear prominently on the manager review queue.
2. The manager reviews the dual-pane workspace with image zoom and side-by-side visual duplicate comparison.
3. Every approval, rejection, or clarification request appends an immutable audit event recording `actorId`, `action`, `timestamp`, and `details`.
