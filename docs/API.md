# CLAIMGUARD — API Reference

Base URL: `/api`
All timestamps are ISO 8601 UTC strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
All amounts in INR (`₹`).

---

## 1. Employee Endpoints
- **`GET /api/employees/:id`**
  - Fetches employee profile, department, historical claim average, and active trip itinerary.
- **`GET /api/employees/:id/claims`**
  - Returns paginated list of claims submitted by the employee with status and category.
- **`POST /api/claims/upload`**
  - Accepts `multipart/form-data` with `file` and `employeeId`.
  - Performs magic-byte file validation, perceptual image fingerprinting, and OCR extraction.
  - Returns `{ draftId, receipt: { fileUrl, imageHash }, extracted: { vendorName, amount, date, category, gstin, confidence } }`.
- **`POST /api/claims`**
  - Confirms or edits draft receipt values.
  - Executes deterministic fraud rules (duplicate, anomaly, policy cap, category, GSTIN).
  - Calculates deterministic risk score (0–100 scale).
  - Synthesizes explainable AI risk narrative.
  - Records immutable audit log entries.
  - Returns the newly created Claim object (`CLM-XXXX`).

---

## 2. Manager Endpoints
- **`GET /api/manager/stats`**
  - Returns real-time KPI metrics:
    `{ totalClaims, pendingClaims, approvedClaims, rejectedClaims, highRiskClaims, potentialFraudDetectedAmount, potentialGstItcAmount, avgProcessingHours }`.
- **`GET /api/claims`**
  - Filterable by `status`, `riskLevel`, `category`, `search`, and `employeeId`.
- **`GET /api/claims/:id`**
  - Deep-dive claim details: enriched employee profile, trip, receipt, OCR confidences, itemized risk signals, and matched duplicate claim (if detected).
- **`POST /api/claims/:id/approve`**
  - Body: `{ managerId, notes }`.
  - Transitions claim status to `APPROVED`, records manager decision in audit log.
- **`POST /api/claims/:id/reject`**
  - Body: `{ managerId, notes }`.
  - Transitions claim status to `REJECTED`, records rejection reason in audit log.
- **`GET /api/claims/:id/audit`**
  - Returns chronological immutable audit trail.

---

## 3. Webhook Endpoints
- **`GET /api/whatsapp/webhook`**
  - Verifies hub challenge token for Meta Graph API.
- **`POST /api/whatsapp/webhook`**
  - Inbound media and message webhook receiver.
