# Slide 5: Employee Experience — Mobile-First Simplicity

## SLIDE PURPOSE
Showcase the frictionless mobile employee interface built with Flutter, demonstrating how complex verification machinery is hidden behind an intuitive, lightweight receipt capture experience.

## SAY THIS (40s)
"For employees in the field, submitting an expense cannot feel like doing tax accounting. ClaimGuard delivers a mobile-first interface built in Flutter. The employee simply taps the camera, aligns the receipt inside the viewfinder guide, and snaps the photo. Within seconds, the app returns a structured preview showing the extracted merchant name, amount, date, and category. The employee can verify or adjust any low-confidence field with one tap, add optional travel context, and hit submit. From there, real-time push cards keep them informed of verification progress and approval status without endless email threads."

## SIMPLE EXPLANATION
Field employees don't need any training. They open the app, take a picture of their receipt, see the details filled in automatically, and tap submit. They can see right away when their claim is received, checked, and approved.

## TECHNICAL EXPLANATION
The mobile client is built in Flutter 3.44 with Dart 3.12, utilizing reactive state management and localized device camera integration. It communicates with the backend via stateless Bearer token authentication, sending either multipart image streams or base64 payloads to `/api/v1/receipts/upload`.

## WHY IT MATTERS
When expense filing is tedious, employees postpone submissions for weeks, causing sudden budget spikes and lost receipts. Immediate mobile capture keeps submissions timely and organized.

## IMPORTANT CAVEAT
The mobile application intentionally contains zero privileged business logic or fraud rule definitions. All security boundaries and evaluations execute exclusively on the authenticated backend.

## TRANSITION
"Now that the claim is submitted, let's switch to the manager's screen and look at the review experience."
