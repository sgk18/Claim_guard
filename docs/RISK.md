# ClaimGuard Risk Scoring & Evidence States

ClaimGuard computes an objective **0 to 100 Risk Score** for every expense claim and maps it to **evidence-based authenticity states**.

---

## 1. Risk Score Formula

The total risk score is a deterministic summation of signal impacts, bounded between 0 and 100:

$$\text{Raw Score} = \sum_{i=1}^{m} \text{SignalImpact}_i + \text{BaseAdjustment}$$

$$\text{Final Risk Score} = \min(100, \max(0, \text{Raw Score}))$$

### Risk Tiers

| Score Range | Risk Level | Manager Recommendation | Default Review Routing |
|---|---|---|---|
| **0 – 24** | `LOW` | `APPROVE_RECOMMENDED` | Auto-clear or single-click batch approval |
| **25 – 49** | `MEDIUM` | `MANUAL_REVIEW_REQUIRED` | Standard manager queue with highlighted signals |
| **50 – 74** | `HIGH` | `INVESTIGATION_REQUIRED` | Flagged for audit, duplicate comparison view |
| **75 – 100** | `CRITICAL` | `REJECT_RECOMMENDED` | Block auto-approval, manager review with mandatory notes |

---

## 2. Evidence-Based Authenticity States

To prevent misleading claims of "100% Real" or "100% Authentic", ClaimGuard uses strictly qualified, evidence-backed state nomenclature:

```
[ VERIFIED ] ────────── Valid tax identifier (GSTIN), clear OCR (>90%), zero fraud signals.
[ LIKELY VALID ] ────── Minor warning (e.g. slight date deviation), valid math.
[ REVIEW REQUIRED ] ─── Amount anomaly or policy threshold breach needing human sign-off.
[ SUSPICIOUS ] ──────── Duplicate receipt hash or invalid checksum detected.
[ UNABLE TO VERIFY ] ── Blurred image, unreadable merchant, low OCR confidence (<70%).
```

### State Mapping Logic

```typescript
export function deriveAuthenticityState(score: number, signals: FraudSignal[]): AuthenticityState {
  // Low OCR confidence or unreadable text
  const unreadable = signals.some(s => s.type === "OCR_LOW_CONFIDENCE");
  if (unreadable) return "UNABLE_TO_VERIFY";

  // Critical fraud violations (duplicate image, invalid tax identity)
  const isSuspicious = signals.some(s => s.type === "DUPLICATE_RECEIPT" || s.type === "INVALID_GSTIN");
  if (isSuspicious || score >= 60) return "SUSPICIOUS";

  // Moderate warnings (amount anomaly, policy cap)
  if (score >= 25 || signals.length > 0) return "REVIEW_REQUIRED";

  // Highly confident verification
  if (score === 0) return "VERIFIED";

  return "LIKELY_VALID";
}
```

---

## 3. UI Token Presentation

Evidence states are rendered identically across both the Flutter mobile application and the Next.js web application:

| State | Foreground Color | Background Color | Border Color |
|---|---|---|---|
| `VERIFIED` | `#16A34A` (Green) | `#F0FDF4` | `#BBF7D0` |
| `LIKELY VALID` | `#2563EB` (Blue) | `#EFF6FF` | `#BFDBFE` |
| `REVIEW REQUIRED` | `#D97706` (Amber) | `#FFFBEB` | `#FDE68A` |
| `SUSPICIOUS` | `#DC2626` (Red) | `#FEF2F2` | `#FECACA` |
| `UNABLE TO VERIFY`| `#64748B` (Slate) | `#F8FAFC` | `#E2E8F0` |

*Design Guardrail: No neon accents, no pulsating indicators. Clean, legible enterprise styling.*
