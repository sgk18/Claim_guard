# Slide 1: Cover — ClaimGuard

## SLIDE PURPOSE
Introduce ClaimGuard clearly in 20 to 30 seconds as an intelligent expense and receipt verification platform connecting field receipt submission, automated analysis, and manager decision-making.

## SAY THIS (30s)
"Welcome everyone. Today we are presenting ClaimGuard — an intelligent expense and receipt verification platform designed for distributed organizations. In modern field teams, receipt submission and expense validation are often disconnected, slow, and heavily manual. ClaimGuard bridges that gap: from the moment an employee snaps a photo of a receipt in the field, our platform extracts the data, validates it against policy, runs deterministic fraud checks, organizes risk signals, and presents decision-ready evidence directly to the finance manager."

## SIMPLE EXPLANATION
ClaimGuard is a digital platform that makes it painless for field staff to submit receipts while giving finance managers instant, structured verification so they don't have to manually inspect every paper bill or worry about duplicate payouts.

## TECHNICAL EXPLANATION
ClaimGuard combines a lightweight Flutter mobile client with a Fastify REST API, AWS document ingestion (S3, Textract), deterministic fraud rule scoring, Claude 3.5 Bedrock narrative explanation, and Supabase PostgreSQL with Row Level Security.

## WHY IT MATTERS
Organizations bleed money and administrative hours through manual receipt audits, delayed submissions, and unspotted duplicate claims. A single unified workflow solves this at the source.

## IMPORTANT CAVEAT
ClaimGuard is not an autonomous black-box that silently approves payouts. It is a decision-support and verification system designed to keep humans firmly in control.

## TRANSITION
"To understand why this unified approach is necessary, let's look at the reality of expense verification today."
