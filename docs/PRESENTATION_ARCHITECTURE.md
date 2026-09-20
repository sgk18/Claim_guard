# ClaimGuard Presentation Architecture & Layout Specification

## 1. System Design & Slide Philosophy

The ClaimGuard presentation is designed around the core product thesis:
**From receipt submission to risk-aware decision making.**

The presentation balances dual audiences:
1. **Executive / Non-Technical Audience**: Focuses on workflow friction, human burden, intuitive mobile submission, centralized manager visibility, and business outcomes.
2. **Technical / Engineering Audience**: Focuses on AWS serverless orchestration (S3, Textract, Step Functions, EventBridge, Bedrock), deterministic fraud math (Hamming distance, Luhn modulo 36), Supabase PostgreSQL row-level security, and channel-agnostic API design.

---

## 2. 15-Slide Presentation Architecture

| Slide # | Slide Title | Layout Archetype | Primary Visual Asset | Core Spoken Message |
|---|---|---|---|---|
| **01** | CLAIMGUARD: Intelligent Expense & Receipt Verification | Cover Hero Split | `cover-ecosystem.jpg` | Connects employee mobile submission, automated validation, and manager review. |
| **02** | Expense verification is still too manual | 4-Stage Problem Sequence | Vector Process Flow | Repetitive manual checking causes delays, duplicate payouts, and limited visibility. |
| **03** | What if every receipt could be screened before manual review? | Core Thesis & Funnel | Vector Screening Funnel | OCR is only the first transformation; multi-layer screening precedes human review. |
| **04** | One workflow. Multiple verification layers. | 7-Stage Pipeline Matrix | Vector Pipeline Cards | 7 sequential stages from Capture to Audit Trail without gaps or dark silos. |
| **05** | For employees, submitting a claim becomes simple | Mobile Spotlight | `employee-mobile.jpg` | Lightweight Flutter app; employee focuses on receipt capture without seeing cloud complexity. |
| **06** | Managers see the entire picture | Operations Split-Screen | `manager-dashboard.jpg` | Evidence-first dashboard showing side-by-side receipt inspection, risk tiers, and single-click actions. |
| **07** | From image to structured information (OCR) | Extraction Stream | `ocr-extraction.jpg` | AWS Textract extracts fields with confidence scores; OCR reads text but does not verify authenticity. |
| **08** | OCR is only the beginning: Validation & Fraud Signals | Signal Multi-Card Grid | `fraud-risk.jpg` | 6 deterministic signals (Duplicate Hash, GSTIN Luhn, Anomaly, Category, Policy, Date) evaluate validity. |
| **09** | Turn multiple signals into a decision-ready risk view | Risk Engine & Authenticity Tiers | Risk Scorecard & Chips | Deterministic 0–100 score synthesized into 5 evidence states (Verified, Likely Valid, Review Required, Suspicious, Unable to Verify). |
| **10** | AI assists the review. It does not replace it. | Dual-Column Boundary Card | Comparison Table (Can vs Cannot) | AI synthesizes plain-English risk narratives; deterministic code and human approvers retain authority. |
| **11** | Built as a connected, scalable platform | Layered Architecture Diagram | Scalable Vector Topology | Clients (Flutter/Web) -> Fastify REST API -> Core Logic -> Supabase PostgreSQL & AWS Serverless. |
| **12** | Follow one receipt through the system | 15-Step End-to-End Data Pipeline | Detailed Sequential Data Flow | Step-by-step lifecycle from mobile camera upload through S3, Textract, Bedrock, and manager sign-off. |
| **13** | Simple onboarding. Controlled access. | Identity & Pairing Architecture | `onboarding-pairing.jpg` | Manager organization workspace with temporary 6-character join code; no social login or password lock-in. |
| **14** | What ClaimGuard is designed to improve | 4 KPI Impact Blocks | Clean Brutalist Metric Cards | Less manual verification, faster review cycles, earlier fraud signals, and unified audit visibility. |
| **15** | From receipt verification to an intelligent expense workflow | Roadmap & Strategic Closing | Multi-Phase Roadmap & Cover | Strategic horizon (Verification -> Risk Intelligence -> Org Analytics -> WhatsApp & ERP Integrations). |

---

## 3. Responsive 16:9 Viewport Container Model

The presentation enforces a strict 16:9 widescreen presentation canvas (`1920x1080` target):

```css
.presentation-viewport {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0B1120;
  overflow: hidden;
}

.slide-deck {
  position: relative;
  width: min(100vw, 177.78vh);
  height: min(100vh, 56.25vw);
  aspect-ratio: 16 / 9;
  background-color: #F8FAFC;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
```

---

## 4. Keyboard Controls & Presenter Interactions

| Key / Control | Action | Scope |
|---|---|---|
| `Right Arrow` / `Space` / `Page Down` | Next Slide | Standard navigation |
| `Left Arrow` / `Page Up` | Previous Slide | Standard navigation |
| `Home` | Jump to Slide 1 (Cover) | Fast navigation |
| `End` | Jump to Slide 15 (Closing) | Fast navigation |
| `F` | Toggle Fullscreen Mode | Presentation display |
| `P` | Toggle Speaker Notes Drawer | Live speaker prompter |
| `Esc` | Toggle 15-Slide Overview Grid | Interactive slide selector |
