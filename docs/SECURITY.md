# CLAIMGUARD — Security Architecture & Threat Model

## 1. Zero-Trust Server-Side Enforcement
ClaimGuard enforces strict server-side validation on every sensitive field:
- **Client Amounts & Totals**: Never trusted from client input without server-side policy re-verification.
- **Client Risk Scores & Severities**: Computed 100% server-side in `DeterministicRiskEngine`.
- **Approval Actions**: Strictly restricted to authenticated manager identities; audit records cannot be mutated or deleted.

---

## 2. File Upload Hardening
1. **Magic Bytes Validation**:
   - Every uploaded receipt buffer is checked against its binary magic bytes before being written to disk:
     - JPEG: `FF D8 FF`
     - PNG: `89 50 4E 47`
     - WebP: `52 49 46 46 .... 57 45 42 50`
   - Files with mismatched extensions or executable headers are rejected with an explicit 400 error.
2. **Path Traversal Protection**:
   - User-supplied filenames are never used in disk paths.
   - Files are stored with cryptographically random UUIDs (`rcpt_${crypto.randomUUID()}.${ext}`).
3. **Payload Size Caps**:
   - Maximum upload payload is capped at **10 MB**.

---

## 3. IDOR & RBAC Protection
- Employees can only view claims where `employeeId` matches their authenticated profile.
- Managers can only view and approve claims within their authorized company domain.
- Immutable audit log records have append-only semantics.

---

## 4. Secret Isolation
- All AWS credentials, Bedrock model IDs, Supabase service keys, and WhatsApp tokens are isolated to `.env.local`.
- Zero private keys are exposed to client-side bundles.
