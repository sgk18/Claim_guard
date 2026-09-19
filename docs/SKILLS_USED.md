# ClaimGuard — Skills Registry & Utilization Matrix

This document tracks all agent skills identified, installed, or leveraged for the ClaimGuard unified build across mobile, web, backend, database, and cloud infrastructure.

---

## 1. Skills Utilization Table

| Skill Name | Purpose | Installation Method | Scope | Assigned Subagents | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`mobile-app-ui-design`** | Mobile UI/UX screen design, thumb zone layout, Flutter component patterns, 8-pt grid, 60/30/10 palette rules | Installed via `npx skills add ceorkm/mobile-app-ui-design` into `.agents/skills/` | Project / Mobile | `MOBILE UI/UX DESIGNER`, `FLUTTER ENGINEER` | Required reference for professional Flutter mobile app UX/UI design across Manager and Employee flows |
| **`design-system`** | Enforcing typography, color palettes, spacing tokens, and component standards | Existing Global (`.agents/skills/design-system`) | Project-wide | `DESIGN SYSTEM ENGINEER`, `WEB ENGINEER`, `FLUTTER ENGINEER` | Ensures visual identity parity between Web and Mobile applications |
| **`codebase-design`** | Deep module design, clean boundaries, decoupled providers | Existing Global (`.gemini/config/skills/codebase-design`) | Architecture | `PRODUCT ARCHITECT`, `BACKEND ARCHITECT`, `MOBILE ARCHITECT` | Guarantees provider interfaces (`DatabaseProvider`, `StorageProvider`, `OCRProvider`, etc.) remain modular |
| **`domain-modeling`** | Data modeling, ubiquitous domain language, and entity consistency | Existing Global (`.gemini/config/skills/domain-modeling`) | Architecture / DB | `PRODUCT ARCHITECT`, `SUPABASE ENGINEER` | Aligns organization, join-code, claim, risk, and fraud domain models across Flutter, Web, and Backend |
| **`amazon-bedrock`** | AWS Bedrock integration, Anthropic Claude prompt design for risk summaries | Existing Global (`.agents/skills/amazon-bedrock`) | Backend / Cloud | `AI ENGINEER`, `AWS INFRASTRUCTURE ENGINEER` | Direct guidance on invoking Bedrock models for manager narratives without granting AI decision authority |
| **`aws-serverless`** | Serverless orchestration, Lambda functions, Step Functions state machines | Existing Global (`.agents/skills/aws-serverless`) | Cloud Infrastructure | `AWS ARCHITECT`, `AWS INFRASTRUCTURE ENGINEER` | Implements the Textract -> Fraud -> Risk -> Bedrock pipeline |
| **`aws-storage`** | S3 private buckets, pre-signed upload URLs, bucket policies | Existing Global (`.agents/skills/aws-storage`) | Cloud / Security | `AWS INFRASTRUCTURE ENGINEER`, `SECURITY ENGINEER` | Enforces private receipt storage and prevents public object exposure |
| **`aws-iam`** | Least-privilege IAM policies, ECS task execution roles, SCP/RCP compliance | Existing Global (`.agents/skills/aws-iam`) | Cloud Security | `SECURITY ENGINEER`, `AWS ARCHITECT` | Adheres to high help-level AWS project constraints |
| **`security-audit`** | IDOR analysis, join-code brute force mitigation, session validation, RLS review | Existing Global (`.agents/skills/security-audit`) | Security | `SECURITY ENGINEER` | Guarantees multi-tenant isolation between organizations and between employees |
| **`tdd`** | Test-driven development, unit and regression testing | Existing Global (`.gemini/config/skills/tdd`) | Testing | `BACKEND ENGINEER`, `FLUTTER TEST ENGINEER`, `QA ENGINEER` | Ensures deterministic verification logic (GSTIN, pHash, score thresholds) is covered by automated unit tests |
| **`qa-plan`** | End-to-end verification scenario planning across mobile, web, and server | Existing Global (`.agents/skills/qa-plan`) | Verification | `QA ENGINEER`, `E2E TEST ENGINEER` | Maps and verifies the full lifecycle flow from join code to manager claim approval |
| **`code-review`** | Standards and specification compliance verification | Existing Global (`.gemini/config/skills/code-review`) | Quality Gate | `FINAL INTEGRATION REVIEWER`, `FINAL UI REVIEWER` | Ensures zero mockups, real API communication, and compliance with all design rules |
