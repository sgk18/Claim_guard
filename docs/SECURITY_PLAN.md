# CLAIMGUARD — Security Architecture & Plan

## 1. Zero-Trust Server-Side Validation
1. **Never Trust Client Claims**:
   - Amounts, vendors, dates, categories, risk scores, and employee identities submitted by the frontend are strictly re-verified and computed on the backend.
   - The frontend cannot set or mutate `status`, `riskScore`, `severity`, or audit logs directly.
2. **Schema & Input Validation**:
   - All REST bodies validated with strict runtime schema parsers (Zod / TypeScript guard validators).
   - Numerical amounts validated for positive non-zero decimals, upper bounded by sane enterprise caps (e.g. ₹5,00,000 max single transaction).
   - Dates validated against realistic boundaries (e.g. receipts cannot be dated in the future, nor older than 90 days).

---

## 2. Secure File Upload Policy
1. **Allowed File Types**:
   - `image/jpeg` (`.jpg`, `.jpeg`)
   - `image/png` (`.png`)
   - `image/webp` (`.webp`)
   - Explicitly rejects: `.exe`, `.sh`, `.bat`, `.js`, `.php`, `.svg` (prevents SVG XSS), `.zip`, etc.
2. **Double Verification (Extension + Magic Bytes)**:
   - Does not solely inspect the filename extension.
   - Validates file magic numbers (e.g. `FF D8 FF` for JPEG, `89 50 4E 47` for PNG).
3. **Storage Sanitization**:
   - Uploaded files are stripped of original client filenames.
   - Assigned randomized cryptographically secure UUID names (e.g. `rcpt_8f4a9b2c3d.jpg`).
   - Saved outside the executable web root or in sandboxed object storage (`/uploads/receipts` or S3).
   - Size limit strictly enforced: **Maximum 10 MB**; payload larger than 10 MB aborted immediately.

---

## 3. Authorization & RBAC
- **Employee Role (`FIELD_EXECUTIVE`)**:
  - Can only submit receipts and view their own claims and history.
  - Strictly blocked from accessing `/api/manager/*` or modifying claims.
- **Manager Role (`FINANCE_MANAGER`)**:
  - Can view all submitted claims across their company/department.
  - Sole authority to invoke `/api/claims/:id/approve` or `/api/claims/:id/reject`.
- **System Service Account**:
  - OCR, fraud scoring, and audit log appending run under isolated server-side workers.

---

## 4. Immutable Audit Trail
- System enforces append-only semantics for the `audit_logs` table.
- Logs include: actor identity (`EMPLOYEE`, `SYSTEM`, `MANAGER`), action type, timestamp, IP/UserAgent metadata, and change delta.
- Audit records cannot be edited or deleted via any public API route.

---

## 5. Defense Against Common Vulnerabilities
| Threat | Mitigation |
|---|---|
| **IDOR** (Insecure Direct Object References) | Claims enforce ownership checks: employees can only fetch claims matching their authenticated `employeeId`. |
| **Path Traversal** | Sanitized storage filepaths using static prefixes and generated UUIDs; zero client-controlled path concatenation. |
| **CSRF & Injection** | Strict JSON REST APIs with Content-Type checks, parameterized database queries, and CORS boundaries. |
| **Secret Leakage** | All API keys and AWS tokens isolated to `.env.local`. Zero secrets bundled to client scripts (`NEXT_PUBLIC_` restricted strictly to client URLs). |
