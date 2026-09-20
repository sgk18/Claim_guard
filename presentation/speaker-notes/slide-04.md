# Slide 4: Complete Workflow — One Workflow, Multiple Layers

## SLIDE PURPOSE
Break down the complete receipt verification lifecycle into 7 clear, sequential stages: Capture, Extract, Validate, Detect, Assess, Review, and Audit.

## SAY THIS (45s)
"ClaimGuard structures receipt verification into seven rigorous stages. First, Capture: the employee captures a photo on their mobile device. Second, Extract: AWS Textract extracts vendors, amounts, dates, and tax numbers with per-field confidence scores. Third, Validate: deterministic rules check mathematical consistency, date windows, and tax ID structure. Fourth, Detect: the engine computes image perceptual hashes to identify duplicates and checks historical spending anomalies. Fifth, Assess: signals compound into a deterministic 0 to 100 risk score and evidence state. Sixth, Review: the manager reviews the claim in an operations cockpit with highlighted evidence. And seventh, Audit: every action, flag, and approval is permanently logged in an immutable audit trail."

## SIMPLE EXPLANATION
A receipt moves through seven simple checkpoints: it is snapped on a phone, read by the computer, checked against company rules, scanned for duplicates, scored for risk, reviewed by a manager, and recorded permanently for auditors.

## TECHNICAL EXPLANATION
The pipeline transitions through stateful boundaries: from client-side capture to multi-part S3 upload, event-driven Textract extraction, in-memory heuristic validation, perceptual hash lookup (Hamming distance <= 5), deterministic risk scoring, manager action dispatch, and Supabase audit row creation.

## WHY IT MATTERS
Breaking the verification process into distinct layers prevents hidden failure points. If OCR confidence is low, the pipeline flags it immediately rather than hallucinating wrong numbers.

## IMPORTANT CAVEAT
Each stage is loosely coupled and observable. If any upstream stage fails (such as an unreadable blurry photo), subsequent stages degrade gracefully into a human-review state rather than throwing unhandled runtime exceptions.

## TRANSITION
"Now let's step into the shoes of the field employee and see how this feels on a mobile phone."
