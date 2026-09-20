# Slide 6: Manager Experience — The Full Operational Picture

## SLIDE PURPOSE
Demonstrate how the Manager Operations Dashboard converts disparate verification signals into a decision-ready cockpit with split-screen receipt review, risk tier filtering, and one-click actions.

## SAY THIS (45s)
"On the manager's side, ClaimGuard replaces endless spreadsheet rows with an operations cockpit. The manager sees a live queue filtered by risk: Low Risk claims that are safe for rapid approval, and Medium, High, or Critical claims that require attention. Opening a claim reveals a split-screen workspace: the original high-resolution receipt on the left with bounding box overlays, and structured verification evidence on the right. The manager sees the exact OCR extracted values, the mathematical risk score, any flagged duplicate claims side-by-side, and an AI-generated explanation summarizing key findings. With a single click, they can Approve, Reject, or Request Clarification with mandatory audit notes."

## SIMPLE EXPLANATION
Instead of hunting through receipts, managers get an organized screen that shows the receipt on one side and all the facts on the other: what was bought, whether the price is normal, if the receipt was used before, and whether company rules were followed. Approving or rejecting takes one click.

## TECHNICAL EXPLANATION
The manager surface is built on Next.js 15 with React 19 and Tailwind CSS, fetching filtered claim collections via Server Components and reactive client state. The UI directly reflects PostgreSQL Row Level Security rules, ensuring managers only view and act upon claims belonging to their assigned company ID.

## WHY IT MATTERS
Managers typically spend 5 to 10 minutes cross-checking a single non-standard claim. By organizing extracted fields and rule violations side-by-side with the original image, review time drops significantly.

## IMPORTANT CAVEAT
The dashboard is an evidence viewer, not an automated gatekeeper. The manager retains full discretionary authority to override flags if a legitimate business justification exists.

## TRANSITION
"Now let's dive under the hood and examine the first foundational technical layer: Optical Character Recognition."
