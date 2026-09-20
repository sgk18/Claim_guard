# ClaimGuard Custom Image Generation Log

This document records the visual prompts, technical parameters, and styling criteria used to generate high-fidelity product imagery for the ClaimGuard Master Pitch Deck.

---

## 1. Visual Identity & Creative Direction

- **Brand Aesthetic**: Enterprise Modern Fintech, Serious B2B SaaS, Precise Geometric Product Framing.
- **Palette Consistency**:
  - Primary Action Accent: `#F97316` (Vibrant Orange)
  - Secondary Accent: `#FDBA74` (Warm Peach)
  - Surface Dark: `#0F172A` (Deep Navy)
  - Neutral Structural Slate: `#334155` / `#64748B`
  - Canvas Light: `#F8FAFC` (Off-White)
- **Design Philosophy**: Strict elimination of fake cybersecurity clichés (no green neon LEDs, no terminal hackers, no robot brains). All UI elements display realistic Indian financial compliance data (INR currency, 15-character GSTINs, valid expense categories).

---

## 2. Generated Asset Registry

| File Name | Aspect Ratio | Slide Placement | Visual Purpose |
|---|---|---|---|
| `cover-ecosystem.jpg` | 16:9 | Slide 1 (Cover) & Slide 15 (Closing) | Unified ecosystem visual showcasing the smartphone scanner and desktop operations portal. |
| `employee-mobile.jpg` | 16:9 | Slide 5 (Employee Experience) | Handheld Flutter mobile scanner capturing a fuel receipt with instant verified extraction card. |
| `manager-dashboard.jpg` | 16:9 | Slide 6 (Manager Experience) | Operations split-screen review portal showing receipt inspection, GSTIN status, and risk gauge. |
| `ocr-extraction.jpg` | 16:9 | Slide 7 (Receipt OCR Pipeline) | Visual transformation from raw paper receipt bounding boxes into structured key-value JSON schema. |
| `fraud-risk.jpg` | 16:9 | Slide 8 & Slide 9 (Signals & Risk Engine) | Compounding signal convergence (duplicate perceptual hash, anomaly spike, GSTIN check) into risk gauge. |
| `onboarding-pairing.jpg` | 16:9 | Slide 13 (Organization & Join Code) | Fast organization pairing flow showing manager 6-character join code generation and employee connection. |

---

## 3. Prompts & Parameters

### Asset 1: `cover-ecosystem.jpg`
- **Tool**: `generate_image`
- **Aspect Ratio**: `16:9`
- **Prompt**:
  > "High quality premium product visualization of ClaimGuard enterprise expense verification platform. An elegant smartphone displaying a sleek mobile receipt scanner app with orange and dark navy accents, floating alongside a clean desktop web browser showing an expense review dashboard with structured financial metrics and audit status. Professional studio lighting, subtle soft shadows, clean slate and off-white backdrop, minimal modern fintech aesthetic, precise geometric layout, no clutter, no cheesy stock models."

### Asset 2: `employee-mobile.jpg`
- **Tool**: `generate_image`
- **Aspect Ratio**: `16:9`
- **Prompt**:
  > "A clean, modern product UI display of a mobile smartphone screen showing the ClaimGuard employee expense app. Interface shows a receipt capture camera view with orange target framing lines, followed by a neatly parsed summary card showing Vendor: Indian Oil Corp, Date: 19 Sep 2026, Amount: 3850 INR, with a green Verified tag. Minimalist UI, Dark Navy top header, crisp typography, clean white and slate card layout, soft studio lighting."

### Asset 3: `manager-dashboard.jpg`
- **Tool**: `generate_image`
- **Aspect Ratio**: `16:9`
- **Prompt**:
  > "High resolution UI screenshot mockup of the ClaimGuard manager operations portal on a clean modern monitor display. Left pane shows a scanned receipt image with highlighted bounding boxes. Right pane shows structured fields: Vendor Indian Oil Corp, Total 3850 INR, 15-character GSTIN, with an Evidence Card showing 'VERIFIED' status, zero fraud flags, a Risk Score gauge showing 12/100 (LOW Risk), and prominent 'Approve' and 'Reject' action buttons with dark navy and orange accents. Enterprise financial software aesthetic, crisp typography, clean grid layout."

### Asset 4: `ocr-extraction.jpg`
- **Tool**: `generate_image`
- **Aspect Ratio**: `16:9`
- **Prompt**:
  > "Professional product illustration of document OCR intelligence for financial receipts. On the left, a realistic paper receipt with glowing crisp orange bounding boxes identifying Vendor, Date, Line Items, and Total. High-tech subtle data stream connecting it to the right side where a clean structured JSON schema and key-value cards emerge with 98% confidence indicators. Elegant dark navy slate background, minimalist clean lines, modern enterprise fintech presentation."

### Asset 5: `fraud-risk.jpg`
- **Tool**: `generate_image`
- **Aspect Ratio**: `16:9`
- **Prompt**:
  > "Modern enterprise visual diagram of fraud detection and risk prioritization for financial claims. Several clean verification cards arranged cleanly: Duplicate Receipt Check with hash match warning, Amount Anomaly Check showing deviation spike, Indian Tax GSTIN Checksum with valid checkmark. The signals converge into a central Risk Assessment Scorecard showing a circular gauge with 4 risk tiers: Low, Medium, High, Critical, and a bold amber status chip reading 'REVIEW REQUIRED'. Dark navy background, subtle orange and peach accents, high-end fintech aesthetics."

### Asset 6: `onboarding-pairing.jpg`
- **Tool**: `generate_image`
- **Aspect Ratio**: `16:9`
- **Prompt**:
  > "Modern fintech product visualization showing organizational onboarding and secure device pairing. On the left, a manager dashboard generates a 6-character organizational join code 'CG-7842' with access control settings. On the right, an employee smartphone enters the code to instantly connect to the company expense workspace without passwords or social logins. Crisp minimal design, dark navy slate background, orange accent highlights, high fidelity UI rendering."
