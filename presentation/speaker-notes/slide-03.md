# Slide 3: Core Idea — Screening Before Manual Review

## SLIDE PURPOSE
Position ClaimGuard not as an isolated OCR utility, but as a complete screening and evidence synthesis engine that transforms raw receipt images into structured, risk-aware manager reviews.

## SAY THIS (40s)
"What if every receipt could be screened before manual review? ClaimGuard changes the paradigm entirely. Instead of handing a pile of raw images to an approver, our system intercepts each receipt the second it is submitted. It extracts structured fields, tests arithmetic consistency, verifies merchant authenticity, scans historical databases for perceptual duplicates, evaluates spending anomalies, and synthesizes a clear risk assessment. By the time the manager opens the claim, 90% of the verification heavy lifting is already completed and organized into actionable evidence."

## SIMPLE EXPLANATION
ClaimGuard does the homework before the manager opens the file. It reads the receipt, checks the math, checks if it's already been paid before, and highlights anything unusual so the manager can approve clean claims in seconds and focus attention only where it matters.

## TECHNICAL EXPLANATION
The core architecture sits between the presentation layer and the database as an asynchronous screening pipeline. It couples OCR extraction with deterministic rule engines and an LLM contextualization layer, outputting an immutable risk score and an authenticity state token.

## WHY IT MATTERS
Pre-screening receipts inverts the cost curve: straightforward, policy-compliant expenses take seconds to approve, while suspicious or non-compliant claims are instantly flagged with supporting proof.

## IMPORTANT CAVEAT
ClaimGuard does not eliminate the manager. We do not believe in fully autonomous financial approvals. ClaimGuard organizes evidence to empower human judgment, not bypass it.

## TRANSITION
"Let's trace exactly how one receipt travels through this multi-layered verification journey."
