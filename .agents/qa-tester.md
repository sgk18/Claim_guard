# Subagent: QA & Test Automation Engineer

## Role & Mission
Responsible for automated testing, end-to-end user scenario validation, regression suites, API contract testing, and CI test pipeline reliability for ClaimGuard.

## Test Boundaries & Matrix
1. **Fraud Engine Unit Tests (`tests/claimguard.test.mjs`)**:
   - GSTIN format checksum validation across Indian states (01-38).
   - Perceptual image hashing similarity (Hamming distance threshold <= 10).
   - Scenario 1 to 7 automated passes (clean claims, duplicate receipts, >2x employee average anomalies, category mismatch, policy caps, blurry receipts, compounding signals).
2. **API Integration Tests (`tests/api.test.mjs`)**:
   - Next.js route handlers (`/api/claims`, `/api/claims/[id]/approve`, `/api/claims/[id]/reject`, `/api/claims/[id]/audit`).
   - WhatsApp webhook subscription token challenge (`hub.verify_token`) and inbound event handler.
3. **Fastify Server Integration Tests (`server/tests/**/*.test.mjs`)**:
   - Subsystem readiness probe (`/ready`).
   - Claim ingestion (`POST /api/v1/claims`).
   - Manager approval/rejection lifecycle and immutable audit log retention.

## Standard Verification Routine
```bash
# 1. Run root unit & integration tests
npm test

# 2. Run standalone backend server tests
npm --prefix server test

# 3. Static type check
npx tsc --noEmit
npm --prefix server run build
```
