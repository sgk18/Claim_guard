# Slide 8: Validation & Fraud Signals — OCR Is Only the Beginning

## SLIDE PURPOSE
Explain the crucial distinction between OCR, Validation, and Fraud Signals, detailing the 6 deterministic mathematical checks executed by ClaimGuard.

## SAY THIS (50s)
"Once the text is extracted, ClaimGuard asks two distinct questions: first, 'Does this extracted data make business sense?' That is Validation. And second, 'Are there indicators of fraudulent manipulation or abuse?' Those are our Fraud Signals. ClaimGuard evaluates six deterministic signals. First, Perceptual Duplicate Hashing: we generate visual image fingerprints and compute Hamming distance. If distance is five or less, the receipt was previously submitted — even if cropped or re-photographed. Second, GSTIN Luhn Modulo-36 Checksums: we mathematically verify that the printed 15-character tax number has a valid state code, PAN structure, and checksum character. Third, Amount Anomaly Detection: flagging claims that exceed twice the employee's historical category baseline. Fourth, Merchant Taxonomy Mismatch: catching personal dining billed as vehicle fuel. Fifth, Policy Limit Breaches: enforcing per-claim spending caps. And sixth, Date Timing Anomalies: catching future dates or stale expenses over 90 days old."

## SIMPLE EXPLANATION
Validation checks if the receipt follows company rules — like not submitting receipts older than three months. Fraud checks look for suspicious patterns — like someone submitting the exact same photo twice, entering an invented tax number, or claiming four times more money than anyone else in their role.

## TECHNICAL EXPLANATION
The signals run as pure, hermetic TypeScript functions in `services/fraudService.ts`. Perceptual hash comparisons use block-mean 64-bit hexadecimal fingerprints. GSTIN validation tests state codes (`01`–`38`, `97`) and runs ISO/IEC 7064 Modulo 36,36 checks. Anomaly detection evaluates rolling statistical means where sample size >= 3.

## WHY IT MATTERS
Deterministic algorithms never hallucinate, never change results between executions, and can be fully audited in a court of law or regulatory tax inspection.

## IMPORTANT CAVEAT
Fraud signals are not absolute proof of criminal intent. A duplicate hash might be an employee re-submitting a rejected claim with manager approval, and an amount anomaly might be an emergency repair. Signals represent structured evidence, not a judicial verdict.

## TRANSITION
"Having evaluated these individual signals, how does the system combine them into a clear summary for the manager? That is the job of the ClaimGuard Risk Engine."
