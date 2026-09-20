# Slide 9: Risk Engine — Decision-Ready Risk Prioritization

## SLIDE PURPOSE
Explain how ClaimGuard aggregates multiple fraud signals into a bounded 0–100 deterministic risk score and maps them to 5 qualified evidence authenticity states.

## SAY THIS (45s)
"A manager reviewing hundreds of claims cannot mentally juggle six independent mathematical probabilities simultaneously. The ClaimGuard Risk Engine aggregates these signals into an objective zero-to-one-hundred integer score. Each signal carries an explicit, configurable point impact: a duplicate receipt adds 40 points; an invalid tax checksum adds 25 points; an amount anomaly adds 20 points. Compounding violations quickly push a claim into higher severity tiers: Low, Medium, High, or Critical. From this score, ClaimGuard derives one of five qualified evidence states: Verified, Likely Valid, Review Required, Suspicious, or Unable to Verify. Notice our deliberate language: we never claim a receipt is '100% Guaranteed Genuine'. We state clearly what the evidence shows."

## SIMPLE EXPLANATION
Instead of giving managers a confusing list of technical warnings, ClaimGuard adds up the risk points into an easy score from 0 to 100 and labels the claim with a clear badge: green for Verified, amber for Review Required, or red for Suspicious.

## TECHNICAL EXPLANATION
$$\text{Score} = \min\left(100, \max\left(0, \sum \text{Impact}_i\right)\right)$$
Scores 0–24 map to LOW (Approve Recommended), 25–49 to MEDIUM (Manual Review Required), 50–74 to HIGH (Investigation Required), and 75–100 to CRITICAL (Reject Recommended). The authenticity state machine checks for low OCR confidence first (`UNABLE_TO_VERIFY`), then duplicate/checksum violations (`SUSPICIOUS`), then policy anomalies (`REVIEW_REQUIRED`), and finally zero-signal claims (`VERIFIED`).

## WHY IT MATTERS
Risk tiers allow organizations to implement triage routing: low-risk claims under policy caps can be batched with one click, while high-risk claims are automatically routed to senior compliance officers.

## IMPORTANT CAVEAT
The weights and point thresholds presented here are illustrative defaults configured for Indian SME and field enterprise operations. Organizations can calibrate threshold weights to match their specific industry risk tolerance.

## TRANSITION
"Now that we understand how deterministic risk scoring works, where does Artificial Intelligence fit in? Let's look at what AI does, and what it does NOT do."
