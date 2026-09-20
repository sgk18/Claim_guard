# Slide 13: Organization & Join Code — Frictionless, Controlled Onboarding

## SLIDE PURPOSE
Explain ClaimGuard's organization creation and temporary join code pairing model, highlighting the intentional absence of third-party social login dependencies for field staff.

## SAY THIS (45s)
"Onboarding distributed field teams presents a unique security and usability challenge. Requiring corporate email addresses, Google logins, or complex passwords for drivers, field technicians, or remote contractors causes massive drop-off and support tickets. ClaimGuard implements a frictionless, cryptographically secure Join Code architecture. A finance manager creates an organization in the dashboard and generates a temporary, 6-character alpha-numeric join code — like 'CG-7842' — with an expiration window and configurable role permissions. The field employee opens the mobile app, enters the code, and their device session is securely provisioned and bound to that organization. The join code is strictly an onboarding handshake, not a permanent password. Once validated, the server establishes a secure device token stored in encrypted local storage."

## SIMPLE EXPLANATION
To connect an employee to their company, the manager generates a simple 6-letter join code. The employee types it into their phone once, and their device is immediately and safely linked to the company account. No passwords, no corporate Google logins, and no confusion.

## TECHNICAL EXPLANATION
Join codes are hashed with SHA-256 and stored with short TTLs in the `organization_join_codes` table. The endpoint `/api/v1/auth/join` validates the code, decrements usage allowances, creates a row in `organization_memberships`, and issues a scoped JWT access token and refresh token stored via `flutter_secure_storage`.

## WHY IT MATTERS
Enterprise rollout speed depends directly on onboarding friction. Organizations can deploy ClaimGuard to hundreds of field personnel in minutes simply by distributing an organization code via WhatsApp or SMS.

## IMPORTANT CAVEAT
Join codes expire automatically after a configurable window (typically 15 to 60 minutes) or single use, preventing unauthorized access if a code is forwarded or leaked.

## TRANSITION
"Now that we've seen how the entire platform operates from onboarding to approval, what measurable business outcomes does ClaimGuard deliver?"
