# Slide 11: Architecture — Connected, Scalable Enterprise Platform

## SLIDE PURPOSE
Present the multi-tier architectural topology of ClaimGuard, explaining why clients communicate through a dedicated API, why Supabase is the primary database, and why AWS handles specialized cloud ingestion.

## SAY THIS (50s)
"ClaimGuard is architected as a decoupled, multi-tier enterprise platform. At the presentation tier, we have our Flutter mobile client for field staff and our Next.js web application for finance controllers. Neither client talks directly to raw cloud infrastructure or storage buckets. Instead, all requests pass through the ClaimGuard Fastify REST API. The API layer enforces session authentication, role-based authorization, and organization isolation. Below the API sit our core domains: Claim Lifecycle, Receipt Processing, Fraud Rules, Risk Scoring, and Immutable Auditing. For persistence, Supabase PostgreSQL acts as our single source of truth for relational data, foreign keys, and Row Level Security. Meanwhile, AWS provides specialized serverless processing: S3 for encrypted receipt storage, Textract for document OCR, Step Functions for asynchronous orchestration, EventBridge for event dispatch, Bedrock for AI explanation, and CloudWatch for observability."

## SIMPLE EXPLANATION
The platform is organized into clean layers like a modern office: the apps on phones and laptops talk to a secure central API door. Behind that door, our backend manages accounts and checks rules. We use Supabase to keep all company records and user accounts strictly organized, while Amazon Web Services handles heavy-duty tasks like document scanning and AI explanations.

## TECHNICAL EXPLANATION
The architecture separates transactional relational persistence (Supabase PostgreSQL with RLS) from heavy computational workloads (AWS serverless). The Fastify backend utilizes a Provider Strategy Pattern (`ReceiptStorageProvider`, `OCRProvider`, `AIProvider`), allowing the system to run in hermetic offline mock mode or scale horizontally on AWS without altering core claim state machines.

## WHY IT MATTERS
Direct client-to-database connections violate enterprise security standards. Centralizing business logic behind an authenticated API ensures that sensitive fraud rules, cryptographic salts, and API keys are never exposed on mobile devices.

## IMPORTANT CAVEAT
Service-role Supabase tokens and AWS administrator IAM credentials are strictly restricted to the server environment. The frontend clients only receive scoped, short-lived JWT tokens.

## TRANSITION
"To see how these architectural components collaborate in real-time, let's trace the complete lifecycle of one receipt from capture to final reimbursement."
