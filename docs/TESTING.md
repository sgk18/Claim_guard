# CLAIMGUARD — Testing Architecture & Verification Guide

## 1. Testing Pyramid

ClaimGuard relies on a three-tier testing pyramid:

1. **Deterministic Unit Tests**:
   - Indian GSTIN syntax, state-code checksums, and PAN extraction (`src/services/fraud/gstin.ts`).
   - Perceptual image hashing and Hamming distance duplicate thresholds (`src/services/fraud/perceptualHash.ts`).
   - Category matching, spending anomaly bounds, and policy ceilings (`src/services/fraud/rules.ts`).
   - Deterministic 0–100 risk scoring algorithm and tier boundaries (`src/services/risk/engine.ts`).

2. **Integration API Tests**:
   - `/api/claims/upload` multipart file handling, size validation, and mock OCR extraction.
   - `/api/claims` claim submission with state transitions (`PENDING`, `REVIEW_REQUIRED`).
   - `/api/claims/:id/approve` and `/api/claims/:id/reject` manager decision recording with immutable audit logs.
   - `/api/manager/stats` KPI metric calculation.

3. **End-to-End User Journey Tests**:
   - Automated browser simulation of the complete employee upload → OCR review → claim submission → manager review → approve/reject lifecycle.

---

## 2. Running Automated Tests

```bash
# Run unit and integration test suite
npm test

# Run Next.js production build check
npm run build
```
