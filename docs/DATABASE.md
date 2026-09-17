# CLAIMGUARD — Database & Persistence Guide

## 1. Relational Entities
The ClaimGuard database architecture stores 10 core entities:
1. `companies` — Organizations using ClaimGuard with default currency and GSTIN.
2. `employees` — Field staff with role, department, and historical claim benchmarks.
3. `policies` — Spending caps, category rules, and GST receipt prerequisites.
4. `trips` — Business itineraries against which date and route claims are cross-referenced.
5. `claims` — Master claim records (`CLM-XXXX`) with status transitions.
6. `receipts` — Uploaded image records with perceptual hash and field-level OCR confidences.
7. `fraud_signals` — Itemized rule violation flags and score impacts.
8. `risk_assessments` — Deterministic 0-100 score, tier, and AI explanation narrative.
9. `audit_logs` — Immutable chronological records of every mutation and manager action.
10. `messages` — Conversational chat message stream.

---

## 2. Seed Data Architecture
`src/db/seed.ts` loads:
- **10 Field Employees**: Across sales, service engineering, fleet maintenance, and site operations.
- **3 Operations Managers**: Led by Priya Sharma (Finance Controller).
- **51 Realistic Indian Claims**: Pre-seeded with authentic fuel stations (Indian Oil, Bharat Petroleum, Shell), dining bills (Barbeque Nation, Udupi Grand), hotel bookings (Ginger Hotels, Treebo), and transport tickets.
- **All 7 Canonical Test Scenarios**: Ready for immediate dashboard demonstration without manual setup.
