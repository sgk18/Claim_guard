# CLAIMGUARD — Skills Used

This document records the specialized engineering and architectural skills evaluated, selected, and applied across the ClaimGuard project lifecycle according to Section 0 and Section 1.

| Skill | Purpose | Agent Using It | Why It Was Selected | Status |
|---|---|---|---|---|
| **`s0xdk/refactoring-ui`** | Visual hierarchy, spacing scales, contrast minimums, and strict no-decoration UI discipline. | UX/UI Designer, Design Systems Engineer, UI Reviewer | Provides battle-tested rules for the 40/30/20/10 composition, brutalist 2px contrast borders, tactile depth, and strict exclusion of emojis/decorative noise. | Newly Retrieved via `ui-skills` |
| **`codebase-design`** | Designing deep modules with small interfaces, clean seams, and high caller leverage. | Principal Architect, Backend Architect, AWS Cloud Architect | Used to design isolated provider abstractions (`StorageProvider`, `OCRProvider`, `AIProvider`, `MessagingProvider`) and ensure no shallow pass-through layers. | Already Installed |
| **`domain-modeling`** | Enforcing strict vocabulary and domain consistency (`Claim`, `Receipt`, `FraudSignal`, `RiskAssessment`, `AuditLog`). | Product Architect, Database Engineer | Prevents overloaded terminology between employee expense claims, duplicate image hashes, and manager clearance states. | Already Installed |
| **`modern-web-guidance`** | Best practices for modern Next.js App Router, accessible semantic HTML, and responsive CSS tokens. | Frontend Architect, UX/UI Designer, Design Systems Engineer | Guides the tokenized palette without hardcoded hexes and mobile-first responsive chat bubbles. | Already Installed |
| **`tdd`** | Test-driven verification for deterministic rules (perceptual hashing, GSTIN validation, and anomaly bounds). | Fraud Detection Engineer, Risk Engine Engineer, QA Engineer | Ensures 100% deterministic reproducibility for mathematical thresholds and policy caps without depending on nondeterministic LLMs. | Already Installed |
| **`writing-for-agents`** | Structured agent contracts, handoffs, and documentation standards. | DevOps Engineer, Documentation Engineer, Final Reviewer | Ensures consistent handoffs across all 24 subagents and clean Markdown technical documentation. | Already Installed |
| **`code-review`** | Standards and specification compliance review across all changes. | Final Architecture Reviewer, Final Product Reviewer | Used to audit adherence to the no-decoration rule, strict zero-emoji mandate, and server-side authorization checks. | Already Installed |

---

## Skill Validation & Constraints Record

- **`s0xdk/refactoring-ui`**:
  - *Applicable Area*: UI styling, layout hierarchy, and contrast compliance.
  - *Hard Constraints Enforced*: Never use color as only signal; no emojis as icons; 2px borders for brutalist structure; tactile elevation for claymorphic depth.
- **`codebase-design`**:
  - *Applicable Area*: `src/services/` and `src/db/`.
  - *Limitation*: Focuses on interface design; actual runtime execution relies on TypeScript strict mode.
- **`tdd`**:
  - *Applicable Area*: `tests/` directory with Node test runner.
  - *Limitation*: Validates deterministic code paths; AI explanations are validated against structural JSON schema constraints.
