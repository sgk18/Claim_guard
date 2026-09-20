# ClaimGuard Audio Narration Script (Voiceover / TTS Ready)

**Narration Instructions:**
- Conversational, warm, authoritative, and steady pacing.
- Short sentences with explicit pauses `[pause]` (approx. 1 to 1.5 seconds).
- Acronyms spelled phonetically or expanded on first introduction (e.g., "O-C-R", "G-S-T-I-N", "P-P-T-X").
- Total duration: ~8.5 minutes.

---

### Segment 1: Welcome to ClaimGuard
Welcome to ClaimGuard. [pause] 

ClaimGuard is an intelligent expense and receipt verification platform built for modern distributed teams. [pause] 

In field operations, receipt submission and expense auditing are often slow, disconnected, and heavily manual. [pause] ClaimGuard bridges that entire gap. [pause] 

From the second an employee takes a photo of a receipt in the field, our platform extracts the data, validates it against policy, runs mathematical fraud checks, and presents decision-ready evidence directly to the finance manager. [pause] 

From receipt submission to risk-aware decision making. [pause] That is ClaimGuard. [pause]

---

### Segment 2: The Problem with Manual Verification
Today, expense verification across most organizations is still an uphill battle. [pause] 

Field executives collect paper receipts in their pockets, or forward blurry photos over chat apps. [pause] Weeks later, a finance manager sits down to decipher faded thermal ink, re-type totals into spreadsheets, and cross-reference dates. [pause] 

When hundreds of receipts arrive every month, humans simply cannot catch every duplicate bill, every personal meal claimed as business fuel, or every fake tax number. [pause] 

The result? [pause] Chronic reimbursement delays, expensive duplicate payouts, and endless uncertainty. [pause]

---

### Segment 3: The Core Idea
What if every single receipt could be screened before a manager ever spends a second reviewing it? [pause] 

That is the core idea behind ClaimGuard. [pause] 

We are not just an Optical Character Recognition tool. [pause] ClaimGuard is an end-to-end verification pipeline. [pause] 

The moment a receipt enters the system, it is automatically read, checked for mathematical consistency, compared against historical spending habits, scanned for duplicate images, and scored for risk. [pause] 

When the manager opens their queue, ninety percent of the verification work is already completed. [pause]

---

### Segment 4: One Workflow, Seven Layers
Let us look at the complete receipt journey through ClaimGuard's seven verification layers. [pause] 

First, Capture: the employee snaps a photo on mobile. [pause] 

Second, Extract: Amazon Textract parses the text, amounts, dates, and tax numbers. [pause] 

Third, Validate: business rules check mathematical consistency and policy caps. [pause] 

Fourth, Detect: our fraud engine checks perceptual image fingerprints to stop duplicates. [pause] 

Fifth, Assess: all signals combine into a clear zero to one-hundred risk score. [pause] 

Sixth, Review: the manager reviews the claim in an operations cockpit with side-by-side evidence. [pause] 

And seventh, Audit: every action and flag is recorded permanently in an immutable audit trail. [pause]

---

### Segment 5: The Field Employee Experience
For field staff on the road, filing an expense cannot feel like filing taxes. [pause] 

ClaimGuard provides a clean, mobile-first experience built with Flutter. [pause] 

The employee opens the app, taps the camera, and frames the receipt. [pause] Within seconds, a neat preview card shows the extracted vendor, date, and amount. [pause] 

The employee can verify any field with one tap, add a quick note, and submit. [pause] 

Real-time status cards keep them updated as their claim moves from submitted, to verified, to approved. [pause] Simple, transparent, and fast. [pause]

---

### Segment 6: The Manager Cockpit
On the manager's side, ClaimGuard replaces messy spreadsheets with a dedicated operations dashboard. [pause] 

Claims are automatically organized by risk priority. [pause] Low-risk claims are ready for quick approval, while high-risk items get immediate attention. [pause] 

Clicking any claim opens a split-screen view: the original receipt on the left, and structured verification evidence on the right. [pause] 

Managers can see the extracted data, the risk score, any duplicate receipts side-by-side, and an Artificial Intelligence summary explaining key findings. [pause] 

Approving or rejecting takes just one click with mandatory audit notes. [pause]

---

### Segment 7: Understanding Document O-C-R
Now, let us discuss Optical Character Recognition, or O-C-R. [pause] 

O-C-R simply answers one question: 'What letters and numbers are printed on this piece of paper?' [pause] 

ClaimGuard uses Amazon Web Services Textract to identify vendors, totals, dates, and fifteen-character Indian Goods and Services Tax numbers, alongside confidence scores for every field. [pause] 

However, successful O-C-R does not mean a receipt is genuine. [pause] A completely fake, fabricated receipt printed on paper will extract with one-hundred percent O-C-R confidence. [pause] 

That is why O-C-R is only the starting point of our pipeline. [pause]

---

### Segment 8: Validation and Fraud Signals
Once the text is extracted, ClaimGuard asks two deeper questions: [pause] 

'Does this data make business sense?' That is Validation. [pause] 

And 'Are there suspicious signs of abuse?' Those are our Fraud Signals. [pause] 

ClaimGuard runs six deterministic mathematical checks: [pause] 
perceptual duplicate image hashing; [pause] 
official tax identification checksum verification; [pause] 
historical amount anomaly detection; [pause] 
merchant category cross-referencing; [pause] 
company policy limit enforcement; [pause] 
and timing consistency checks. [pause] 

Every signal produces concrete, verifiable evidence. [pause]

---

### Segment 9: The Deterministic Risk Engine
A manager cannot balance six different mathematical checks in their head at the same time. [pause] 

The ClaimGuard Risk Engine aggregates these signals into an objective zero-to-one-hundred score. [pause] 

Each signal adds explicit risk points: a duplicate receipt adds forty points; an invalid tax checksum adds twenty-five points; an unusual amount spike adds twenty points. [pause] 

Compounding violations move a claim into clear tiers: Low, Medium, High, or Critical. [pause] 

From this score, ClaimGuard assigns one of five qualified evidence states: Verified, Likely Valid, Review Required, Suspicious, or Unable to Verify. [pause] 

We never say a receipt is 'guaranteed genuine'. We state clearly what the evidence proves. [pause]

---

### Segment 10: Where Artificial Intelligence Fits In
In financial software, letting generative Artificial Intelligence approve or reject company payments on its own is dangerous. [pause] 

ClaimGuard sets a strict boundary. [pause] 

What does A-I do? [pause] It acts as an explanation layer. [pause] When Claude runs on Amazon Web Services Bedrock, it translates complex mathematical signals and employee history into a clear, two-sentence explanation for the manager. [pause] 

What does A-I NOT do? [pause] A-I never approves a claim. [pause] A-I never rejects a claim. [pause] A-I cannot override security policies, and cannot touch database records. [pause] 

Deterministic code does the math. [pause] Human managers make the decision. [pause] A-I simply explains the evidence. [pause]

---

### Segment 11: Enterprise Cloud Architecture
ClaimGuard is architected as a connected, multi-tier enterprise platform. [pause] 

Our Flutter mobile app and Next dot j-s web portal never communicate directly with raw databases. [pause] Instead, all requests flow through our Fastify R-E-S-T A-P-I, which enforces authentication and company isolation. [pause] 

For structured records, Supabase Postgre-S-Q-L provides our primary relational database with Row Level Security. [pause] 

Meanwhile, Amazon Web Services provides the processing backbone: S-3 for encrypted receipt storage, Textract for O-C-R, Step Functions for orchestration, EventBridge for event routing, Bedrock for A-I narratives, and CloudWatch for monitoring. [pause]

---

### Segment 12: The Receipt Journey Step by Step
Let us follow one receipt through the complete fifteen-step data pipeline: [pause] 

The employee captures the receipt on their phone. [pause] 
The image is encrypted and uploaded to our A-P-I. [pause] 
The receipt is stored in private S-3 storage. [pause] 
EventBridge triggers Amazon Textract. [pause] 
Structured fields are extracted and normalized. [pause] 
Mathematical validation and policy checks run. [pause] 
The fraud engine checks duplicate hashes and anomaly ratios. [pause] 
The risk engine calculates the score and evidence state. [pause] 
Bedrock writes a plain-English summary. [pause] 
All data synchronizes to Supabase. [pause] 
The manager inspects the evidence in their dashboard. [pause] 
The manager approves or rejects the claim. [pause] 
An immutable audit log row is created. [pause] 
And the employee receives an instant update on their mobile device. [pause]

---

### Segment 13: Simple Onboarding and Controlled Access
Deploying software to field staff often fails because of complicated onboarding. [pause] 

Requiring corporate email logins or complex passwords for remote staff leads to confusion and support calls. [pause] 

ClaimGuard solves this with an onboarding Join Code model. [pause] 

A manager creates an organization workspace and generates a temporary six-character join code — like 'C-G seven eight four two'. [pause] 

The employee enters this code once into their mobile app, and their device session is immediately paired to that company. [pause] 

No corporate passwords, no social logins, and total security control. [pause]

---

### Segment 14: What ClaimGuard Improves
What outcomes is ClaimGuard designed to improve? [pause] 

First: Less Repetitive Manual Verification. Automated data entry and math checks free managers from tedious receipt auditing. [pause] 

Second: Faster Review Cycles. Employees get reimbursed in hours or days instead of weeks. [pause] 

Third: Earlier Suspicious Signals. Spotting duplicate bills and invalid tax numbers before money leaves company accounts. [pause] 

And fourth: Centralized Visibility. Complete, auditable oversight across all branches from a single screen. [pause]

---

### Segment 15: The Future of ClaimGuard
To close: ClaimGuard transforms receipt verification from a painful manual chore into a modern, risk-aware workflow. [pause] 

Our roadmap expands in five phases: [pause] 
Phase One is our core receipt verification platform, which is fully operational today. [pause] 
Phase Two expands risk intelligence with rolling ninety-day baselines. [pause] 
Phase Three brings organization-wide analytics. [pause] 
Phase Four introduces optional WhatsApp conversational submission as a future integration. [pause] 
And Phase Five adds enterprise E-R-P connectors into SAP and Tally. [pause] 

From receipt submission to risk-aware decision making. [pause] 
That is ClaimGuard. [pause] Thank you.
