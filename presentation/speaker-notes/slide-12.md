# Slide 12: Complete Data Pipeline — The 15-Step Receipt Journey

## SLIDE PURPOSE
Walk step-by-step through the 15 discrete phases of a single receipt's lifecycle, establishing technical credibility for engineering judges and clarity for executive audiences.

## SAY THIS (55s)
"Let's trace the complete journey of a single receipt through ClaimGuard. 
Step 1: The employee captures a photo on Flutter mobile.
Step 2: The app uploads the encrypted image to our backend API.
Step 3: The API generates a pending claim entity with state SUBMITTED.
Step 4: The receipt image is stored in a private S3 bucket with KMS encryption.
Step 5: EventBridge detects the upload and triggers AWS Textract.
Step 6: Textract parses document key-values and line items.
Step 7: The normalizer standardizes dates, amounts, and GSTIN strings.
Step 8: Mathematical validation checks arithmetic and policy caps.
Step 9: The fraud engine tests perceptual hashes and anomaly deviations.
Step 10: The risk engine calculates the 0 to 100 score and assigns an evidence state.
Step 11: AWS Bedrock generates a natural-language summary of findings.
Step 12: All records synchronize to Supabase PostgreSQL under RLS policies.
Step 13: The manager receives real-time evidence in their operations queue.
Step 14: The manager approves or rejects, writing an immutable audit log row.
And Step 15: The employee receives an instant status update on their phone."

## SIMPLE EXPLANATION
This is the complete relay race of a receipt: the phone uploads it, the cloud reads it, the computer double-checks the numbers, the fraud engine looks for tricks, the AI writes a summary, the database records the facts, the manager makes the final decision, and the phone gets the result. Everything happens in seconds.

## TECHNICAL EXPLANATION
The pipeline operates as an asynchronous state machine:
`UPLOADED` -> `INGESTED` -> `OCR_COMPLETED` -> `VALIDATED` -> `SIGNALS_EVALUATED` -> `RISK_SCORED` -> `AWAITING_MANAGER_DECISION` -> `DECIDED` -> `AUDIT_COMMITTED`.
Each stage writes transactional audit markers, allowing complete timeline reconstruction and distributed tracing via AWS CloudWatch and Supabase change feeds.

## WHY IT MATTERS
When an auditor or tax official questions an expense claim months later, ClaimGuard can replay the exact sequence: the original image hash, the Textract confidence scores, the mathematical flags triggered, and the specific manager's cryptographic identity and timestamp.

## IMPORTANT CAVEAT
In offline or demo mode, this exact pipeline executes hermetically through local mock providers (`MockOCRProvider`, `MockAIProvider`), ensuring flawless demonstration reliability even without active cloud connectivity.

## TRANSITION
"Now let's examine how employees and managers connect to the platform in the first place: our organization join code onboarding architecture."
