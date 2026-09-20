# Slide 10: AI — Assistance, Not Autonomous Control

## SLIDE PURPOSE
Delineate the precise boundary of Generative AI within ClaimGuard, establishing that AI serves strictly as an explanatory synthesis layer, while authorization, security controls, and approvals remain deterministic and human-controlled.

## SAY THIS (50s)
"In enterprise financial software, putting an unconstrained generative AI in charge of approving or rejecting money transfers is reckless. ClaimGuard draws a strict, non-negotiable boundary around the role of AI. What does AI do? It translates complex mathematical signals into plain-English explanations. When Claude 3.5 Sonnet is invoked on AWS Bedrock, it synthesizes the duplicate hash match, the amount anomaly, and the employee history into a two-sentence narrative that tells the manager exactly what went wrong and what to check. What does AI NOT do? AI never approves a claim. AI never rejects a claim. AI cannot override security rules, cannot mutate database records, and cannot bypass human authorization. Deterministic code does the math; human managers make the decision; AI simply explains the evidence."

## SIMPLE EXPLANATION
Artificial Intelligence is our research assistant, not our boss. It reads through all the technical data and writes a clear summary for the manager in plain English. But it is never allowed to spend company money, change records, or approve or reject claims on its own.

## TECHNICAL EXPLANATION
ClaimGuard invokes Anthropic Claude 3.5 on AWS Bedrock via strict JSON schema enforcement. The model receives raw telemetry (OCR fields, confidence maps, triggered rule IDs, mathematical delta ratios) and outputs structured fields (`summaryNarrative`, `keyConcerns`, `recommendedInspectionSteps`). The model has no write access or database mutation capabilities.

## WHY IT MATTERS
Auditors and enterprise compliance officers will reject black-box financial systems that cannot explain their reasoning. By restricting LLMs to narrative synthesis, ClaimGuard ensures total auditability.

## IMPORTANT CAVEAT
LLMs can experience variability in tone or formatting if not tightly controlled. ClaimGuard enforces temperature=0 and validates Bedrock JSON output against a strict Zod runtime schema before rendering to the frontend.

## TRANSITION
"Now that we've seen both the math and the AI layer, let's look at the overarching cloud and backend architecture that powers the entire system."
