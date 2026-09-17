# ClaimGuard — Real-Time Expense Verification & Fraud Prevention

> **"Flag it before you pay it."**

ClaimGuard is an India-first, real-time expense verification and fraud-prevention platform for distributed field workforces. 

Field employees submit expense receipts through a lightweight, zero-installation mobile-first WhatsApp-inspired WebView. The backend instantly extracts structured data via OCR, evaluates deterministic fraud rules (duplicate perceptual hashing, historical amount anomalies, category mismatches, policy ceilings, and Indian GSTIN compliance), computes a deterministic 0–100 risk score, and generates human-readable explainable AI risk narratives for finance managers.

---

## 🚀 Core Product Principle

**AI ASSISTS. HUMANS DECIDE.**

Never make the AI the final authority over an employee's reimbursement claim. The AI and risk engine provide evidence, confidence scores, signals, and recommendations. The finance operations manager retains full authority over approval and rejection.

---

## 🌟 Key Capabilities & Architecture

- **📱 Mobile-First Employee WebView (`/employee`)**:
  - Conversational WhatsApp-style chat interface with responsive dimensions (375x812, 390x844, 412x915, and desktop).
  - Receipt upload with camera support, drag-and-drop, and 1-click test scenario presets.
  - Interactive Extracted Fields Card with low-confidence OCR indicators.
  - Inline field correction modal prior to submission.
  - Real-time status tracking and submitted claims history drawer.

- **🛡️ Finance Manager Operations Dashboard (`/manager`)**:
  - Live KPI metrics (Total Claims, Pending Review, High Risk, Fraud Prevented ₹, Potential GST/ITC ₹).
  - Searchable, filterable claims table (Risk Tier, Status, Category).
  - Deep-dive Claim Review (`/manager/claims/[id]`) with zoomable split-view receipt viewer and raw OCR inspector.
  - Side-by-side **Duplicate Comparator** displaying visual receipt proof when duplicate claims are detected.
  - Itemized Risk Signal breakdown with deterministic score impact (+40, +25, +20, etc.).
  - One-click Approve or Reject modal with mandatory manager audit notes.
  - Immutable chronological audit timeline.

- **🇮🇳 India-First Verification Engine**:
  - Perceptual image hashing for duplicate detection (exact and re-photographed bills).
  - 15-digit GSTIN validation with state-code extraction (e.g. 29 = Karnataka) and ITC tax eligibility logic.
  - Historical spending anomaly calculation vs employee average.
  - Category mismatch detection (e.g. Barbeque Nation dining claimed as fuel).

- **🔌 Decoupled Channel Architecture**:
  - Backend is 100% agnostic to the fronting messaging channel via `MessagingProvider`.
  - Seamlessly switches between `WebViewChannel` and official Meta WhatsApp Cloud API (`WhatsAppChannel`).

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ (Tested on Node.js v25.6.0)
- npm 9+

### 2. Installation
```bash
git clone <repo-url>
cd Claim_guard
npm install
```

### 3. Generate Demo Receipt Assets
```bash
python scripts/generate_demo_receipts.py
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Employee WebView**: [http://localhost:3000/employee](http://localhost:3000/employee)
- **Manager Dashboard**: [http://localhost:3000/manager](http://localhost:3000/manager)

---

## 🧪 7 Canonical Demo Scenarios

| Scenario | Bill Details | Expected Risk | Triggered Signals |
|---|---|---|---|
| **1. Clean Claim** | Indian Oil Fuel ₹1,850 | **LOW (0-29)** | None. Valid GSTIN & within policy. |
| **2. Duplicate Receipt** | Indian Oil Fuel ₹3,850 (Re-submitted) | **HIGH (78)** | `DUPLICATE_RECEIPT` (Matches #CLM-3902), `AMOUNT_ANOMALY`. |
| **3. Amount Anomaly** | Indian Oil Fuel ₹8,500 | **MEDIUM/HIGH (55)** | `AMOUNT_ANOMALY` (6.0x employee average), `POLICY_VIOLATION`. |
| **4. Category Mismatch** | Barbeque Nation Dining ₹2,450 | **HIGH (65)** | `CATEGORY_MISMATCH` (Dining claimed as Fuel). |
| **5. Policy Violation** | BPCL Fuel ₹7,800 | **HIGH (60)** | `POLICY_VIOLATION` (Exceeds ₹5,000 policy cap). |
| **6. Low OCR Confidence** | Smudged/Blurry receipt | **REVIEW REQUIRED** | `LOW_OCR_CONFIDENCE` (Prompts employee correction). |
| **7. Multiple Signals** | Duplicate + ₹9,200 + Invalid GSTIN | **CRITICAL (95)** | `DUPLICATE_RECEIPT` + `AMOUNT_ANOMALY` + `POLICY_VIOLATION` + `GSTIN_SIGNAL`. |

---

## 📚 Technical Documentation
- [PRODUCT_SPEC.md](file:///c:/projects/Claim_guard/docs/PRODUCT_SPEC.md)
- [USER_FLOWS.md](file:///c:/projects/Claim_guard/docs/USER_FLOWS.md)
- [DATABASE_SCHEMA.md](file:///c:/projects/Claim_guard/docs/DATABASE_SCHEMA.md)
- [API_CONTRACT.md](file:///c:/projects/Claim_guard/docs/API_CONTRACT.md)
- [SECURITY_PLAN.md](file:///c:/projects/Claim_guard/docs/SECURITY_PLAN.md)
- [FINAL_ARCHITECTURE.md](file:///c:/projects/Claim_guard/docs/FINAL_ARCHITECTURE.md)
- [WHATSAPP_INTEGRATION.md](file:///c:/projects/Claim_guard/docs/WHATSAPP_INTEGRATION.md)
