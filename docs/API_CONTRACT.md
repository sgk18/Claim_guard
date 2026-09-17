# CLAIMGUARD — API Contract & Specification

Base URL: `/api`
All timestamps are ISO 8601 UTC strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
Currency defaults to `INR` (`₹`).

---

## 1. Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "POLICY_LIMIT_EXCEEDED",
    "message": "Claim amount exceeds the policy cap for category fuel.",
    "details": null
  },
  "requestId": "req_8f10b2c9"
}
```

---

## 2. Employee Endpoints

### 2.1 Employee Profile & Context
- **`GET /api/employees/:id`**
  - **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "id": "emp_rahul_102",
      "name": "Rahul Kumar",
      "email": "rahul.k@induslogistics.in",
      "phone": "+919876543210",
      "department": "Field Sales",
      "role": "Senior Sales Executive",
      "stats": {
        "historicalClaimCount": 42,
        "historicalClaimAvg": 1640.00,
        "activeTrip": {
          "id": "trip_blr_mys_01",
          "title": "Bengaluru - Mysuru Client Tour",
          "startDate": "2026-09-15",
          "endDate": "2026-09-18"
        }
      }
    }
  }
  ```

### 2.2 Upload & OCR Extraction
- **`POST /api/claims/upload`**
  - **Content-Type**: `multipart/form-data`
  - **Fields**:
    - `file`: Image binary (JPEG, PNG, WebP; max 10MB)
    - `employeeId`: string
  - **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "draftId": "drf_90218a",
      "receipt": {
        "fileUrl": "/uploads/receipts/rcpt_90218a.jpg",
        "mimeType": "image/jpeg",
        "sizeBytes": 348120,
        "imageHash": "a1f0c4391e4b889d"
      },
      "extracted": {
        "vendorName": "Indian Oil Corporation Ltd",
        "amount": 3850.00,
        "currency": "INR",
        "date": "2026-09-17",
        "category": "fuel",
        "gstin": "29AAACI1681G1ZS",
        "confidence": {
          "vendorName": 0.98,
          "amount": 0.99,
          "date": 0.94,
          "category": 0.92,
          "gstin": 0.88
        },
        "needsReview": false
      }
    }
  }
  ```

### 2.3 Submit Claim (Confirm or Edit)
- **`POST /api/claims`**
  - **Body**:
  ```json
  {
    "draftId": "drf_90218a",
    "employeeId": "emp_rahul_102",
    "vendorName": "Indian Oil Corporation Ltd",
    "amount": 3850.00,
    "currency": "INR",
    "date": "2026-09-17",
    "category": "fuel",
    "gstin": "29AAACI1681G1ZS",
    "employeeNotes": "Refueled company utility vehicle near Mysuru expressway"
  }
  ```
  - **Response 201 Created**:
  ```json
  {
    "success": true,
    "data": {
      "id": "CLM-4471",
      "status": "REVIEW_REQUIRED",
      "amount": 3850.00,
      "currency": "INR",
      "vendorName": "Indian Oil Corporation Ltd",
      "date": "2026-09-17",
      "category": "fuel",
      "gstin": "29AAACI1681G1ZS",
      "risk": {
        "score": 78,
        "level": "HIGH",
        "recommendedAction": "MANUAL_REVIEW",
        "summary": "Similar receipt hash match detected and amount is 135% above historical average for fuel.",
        "signals": [
          {
            "type": "DUPLICATE_RECEIPT",
            "severity": "HIGH",
            "scoreImpact": 40,
            "description": "Visual receipt match (98%) detected with claim CLM-3902 submitted on 2026-08-14."
          },
          {
            "type": "AMOUNT_ANOMALY",
            "severity": "MEDIUM",
            "scoreImpact": 15,
            "description": "Amount ₹3,850 exceeds employee historical fuel claim average (₹1,640) by 135%."
          },
          {
            "type": "POLICY_VIOLATION",
            "severity": "MEDIUM",
            "scoreImpact": 20,
            "description": "Exceeds daily fuel limit policy cap of ₹2,500.00."
          }
        ]
      },
      "createdAt": "2026-09-17T14:49:10.000Z"
    }
  }
  ```

### 2.4 Employee Claims History
- **`GET /api/employees/:id/claims`**
  - Query params: `status`, `page`, `limit`
  - Returns array of historical claims with status badges.

---

## 3. Manager Endpoints

### 3.1 Dashboard Statistics
- **`GET /api/manager/stats`**
  - **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "totalClaims": 142,
      "pendingClaims": 18,
      "approvedClaims": 114,
      "rejectedClaims": 10,
      "highRiskClaims": 8,
      "potentialFraudDetectedAmount": 46250.00,
      "potentialGstItcAmount": 18940.00,
      "avgProcessingHours": 2.4
    }
  }
  ```

### 3.2 List Claims
- **`GET /api/claims`**
  - Query params:
    - `status`: `ALL | PENDING | REVIEW_REQUIRED | APPROVED | REJECTED`
    - `riskLevel`: `ALL | LOW | MEDIUM | HIGH | CRITICAL`
    - `search`: string (vendor, employee name, claim ID)
    - `sortBy`: `date | amount | riskScore`
    - `sortOrder`: `asc | desc`
    - `page`: number
    - `limit`: number
  - Returns paginated list of claims with aggregated risk summary.

### 3.3 Claim Detail
- **`GET /api/claims/:id`**
  - Returns full claim object:
    - Claim metadata
    - Submitting employee profile + historical metrics
    - Associated Trip (if any)
    - Receipt image URL + OCR confidence per field + raw extracted text
    - Full Risk Assessment: 0–100 score, Low/Medium/High/Critical badge, itemized signals with metadata diffs
    - If duplicate signal exists: matched comparison receipt and previous claim summary
    - Immutable Audit Log entries

### 3.4 Manager Action: Approve
- **`POST /api/claims/:id/approve`**
  - **Body**:
  ```json
  {
    "managerId": "mgr_priya_01",
    "notes": "Approved after verifying long-distance vehicle assignment with fleet manager."
  }
  ```
  - **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "id": "CLM-4471",
      "status": "APPROVED",
      "managerNotes": "Approved after verifying long-distance vehicle assignment with fleet manager.",
      "updatedAt": "2026-09-17T15:02:00.000Z"
    }
  }
  ```

### 3.5 Manager Action: Reject
- **`POST /api/claims/:id/reject`**
  - **Body**:
  ```json
  {
    "managerId": "mgr_priya_01",
    "notes": "Rejected: Receipt photo is an exact duplicate of Amit's claim from last month."
  }
  ```
  - **Response 200 OK**:
  ```json
  {
    "success": true,
    "data": {
      "id": "CLM-4471",
      "status": "REJECTED",
      "managerNotes": "Rejected: Receipt photo is an exact duplicate of Amit's claim from last month.",
      "updatedAt": "2026-09-17T15:02:00.000Z"
    }
  }
  ```

### 3.6 Claim Audit Trail
- **`GET /api/claims/:id/audit`**
  - Returns chronological list of all immutable audit entries for compliance inspection.

---

## 4. Webhook / WhatsApp Adapter Endpoints
- **`POST /api/whatsapp/webhook`**
  - Standard Meta webhook contract verifying payload tokens, receiving inbound messages, parsing media receipts, and passing to the agnostic ClaimGuard processing service.
