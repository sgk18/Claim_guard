# ClaimGuard Master Product Pitch Presentation Package

Welcome to the official presentation package for **ClaimGuard: Intelligent Expense & Receipt Verification**.

This directory contains the pitch-ready, dual-format presentation artifacts designed for both executive business evaluators and engineering architecture judges.

---

## 1. Directory Structure

```
presentation/
├── index.html                   <- Standalone interactive 16:9 HTML presentation
├── styles.css                   <- Custom design system (40% Minimal, 30% Brutal, 20% Glass, 10% Clay)
├── script.js                    <- Keyboard navigation & speaker notes controller
├── README.md                    <- This documentation guide
├── presentation-script.md       <- Full master spoken presentation script (~10 mins)
├── demo-script.md               <- 19-step live synchronized product demonstration script
├── audio/
│   └── audio-script.md          <- Conversational audio voiceover script with pauses
├── speaker-notes/
│   ├── slide-01.md              <- Slide 1: Cover
│   ├── slide-02.md              <- Slide 2: Problem
│   ├── slide-03.md              <- Slide 3: Core Idea
│   ├── slide-04.md              <- Slide 4: Complete Workflow
│   ├── slide-05.md              <- Slide 5: Employee Experience
│   ├── slide-06.md              <- Slide 6: Manager Experience
│   ├── slide-07.md              <- Slide 7: OCR
│   ├── slide-08.md              <- Slide 8: Validation + Fraud Signals
│   ├── slide-09.md              <- Slide 9: Risk Engine
│   ├── slide-10.md              <- Slide 10: AI Boundaries
│   ├── slide-11.md              <- Slide 11: System Architecture
│   ├── slide-12.md              <- Slide 12: 15-Step Data Pipeline
│   ├── slide-13.md              <- Slide 13: Organization + Join Code
│   ├── slide-14.md              <- Slide 14: Expected Outcomes
│   └── slide-15.md              <- Slide 15: Roadmap & Strategic Close
└── images/
    ├── cover-ecosystem.jpg      <- Mobile + Web product hero visualization
    ├── employee-mobile.jpg      <- Flutter mobile receipt camera & summary card
    ├── manager-dashboard.jpg    <- Split-screen operations review cockpit
    ├── ocr-extraction.jpg       <- Document OCR bounding box data flow
    ├── fraud-risk.jpg           <- Compounding fraud signals & risk gauge
    └── onboarding-pairing.jpg   <- Organization 6-char join code device pairing
```

---

## 2. Interactive HTML Presentation Controls

To launch the presentation, simply open `presentation/index.html` in any modern web browser.

| Key / Control | Action | Details |
|---|---|---|
| `Right Arrow` / `Space` / `Page Down` | **Next Slide** | Advances to the next slide with smooth fade transition |
| `Left Arrow` / `Page Up` | **Previous Slide** | Returns to the preceding slide |
| `Home` | **Slide 1** | Instantly returns to the Cover slide |
| `End` | **Slide 15** | Jumps directly to the Closing slide |
| `P` | **Toggle Speaker Notes** | Opens the slide-out prompter with spoken track, simple explanation, and caveats |
| `Esc` | **15-Slide Overview** | Injects interactive thumbnail grid to jump to any slide |
| `F` | **Toggle Fullscreen** | Expands presentation canvas to fill display with 16:9 aspect lock |

---

## 3. Editable PowerPoint Presentation (`ClaimGuard_Product_Pitch.pptx`)

Located in the workspace root:
`c:\projects\Claim_guard\ClaimGuard_Product_Pitch.pptx`

- **Format**: Native Microsoft PowerPoint 16:9 Widescreen (`13.333" x 7.5"`).
- **Colors**: Calibrated ClaimGuard palette (Orange `#F97316`, Peach `#FDBA74`, Navy `#0F172A`, Slate `#334155`).
- **Speaker Notes**: Every slide contains the full speaker notes embedded in PowerPoint's native presenter notes panel.
- **Regeneration**: If needed, the presentation can be recompiled by running:
  ```bash
  python scripts/generate_pitch_pptx.py
  ```

---

## 4. Design & Delivery Guardrails

- **No False Claims**: The presentation strictly adheres to honest positioning (no claims of "100% fraud detection" or fabricated metrics).
- **Strict Distinction**: Active, implemented features (Flutter mobile, Fastify API, Textract OCR, 6 deterministic fraud rules, Bedrock narrative, Manager dashboard) are clearly distinguished from planned enterprise integrations (WhatsApp, SAP, Tally).
- **Dual Audiences**: Every slide includes both an intuitive business explanation and a rigorous technical implementation deep-dive.
