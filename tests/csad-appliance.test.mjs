import test, { describe } from "node:test";
import assert from "node:assert/strict";

import {
  validateClaimSubmissionIntake,
  computePerceptualHammingDistance,
  detectDuplicateReceipt,
  computeGSTINModulo36CheckChar,
  verifyGSTINModulo36,
  evaluateSpendAnomaly,
  evaluatePolicyLimits,
  calculateCompoundingRiskScore,
  createCSADClaim,
  transitionClaimState,
  calculateGSTITCStaging,
  runCSADDiagnostics,
  DAILY_CATEGORY_CAPS,
  SUPPORTED_CATEGORIES,
  INDIAN_STATE_CODES,
} from "../src/services/csad/index.ts";

export { runCSADDiagnostics };

describe("CSAD Appliance Test Suite", () => {
  // =========================================================================
  // 1. Claim Submission & Intake Validation
  // =========================================================================
  describe("1. Claim Submission & Intake Validation", () => {
    const validPayload = {
      claimId: "CLM-9001",
      employeeId: "EMP-410",
      organizationId: "ORG-ALPHA",
      amount: 3450.5,
      category: "fuel",
      date: "2026-09-18",
      receiptUri: "https://storage.claimguard.internal/receipts/rcpt-9001.jpg",
      vendorName: "Shell Fuel Station Indiranagar",
      gstin: "29AAACI1681G1ZL",
      notes: "Field travel to customer site",
    };

    test("Intake: Valid claim payload passes validation with sanitized data", () => {
      const res = validateClaimSubmissionIntake(validPayload);
      assert.equal(res.isValid, true);
      assert.equal(res.errors.length, 0);
      assert.ok(res.sanitizedPayload);
      assert.equal(res.sanitizedPayload.claimId, "CLM-9001");
      assert.equal(res.sanitizedPayload.amount, 3450.5);
      assert.equal(res.sanitizedPayload.category, "fuel");
    });

    test("Intake: Missing claimId is rejected", () => {
      const { claimId, ...incomplete } = validPayload;
      const res = validateClaimSubmissionIntake(incomplete);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /claim ID is required/i.test(e)));
    });

    test("Intake: Missing employeeId is rejected", () => {
      const { employeeId, ...incomplete } = validPayload;
      const res = validateClaimSubmissionIntake(incomplete);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /employee ID is required/i.test(e)));
    });

    test("Intake: Missing organizationId is rejected", () => {
      const { organizationId, ...incomplete } = validPayload;
      const res = validateClaimSubmissionIntake(incomplete);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /organization ID is required/i.test(e)));
    });

    test("Intake: Missing or invalid date is rejected", () => {
      const missingDate = validateClaimSubmissionIntake({ ...validPayload, date: "" });
      assert.equal(missingDate.isValid, false);
      assert.ok(missingDate.errors.some((e) => /claim date is required/i.test(e)));

      const invalidDate = validateClaimSubmissionIntake({ ...validPayload, date: "not-a-valid-date" });
      assert.equal(invalidDate.isValid, false);
      assert.ok(invalidDate.errors.some((e) => /Invalid date format/i.test(e)));
    });

    test("Intake: Missing receiptUri is rejected", () => {
      const { receiptUri, ...incomplete } = validPayload;
      const res = validateClaimSubmissionIntake(incomplete);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /receipt URI is required/i.test(e)));
    });

    test("Intake Edge Case: Negative amount is rejected with descriptive error", () => {
      const res = validateClaimSubmissionIntake({ ...validPayload, amount: -500 });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /must be strictly positive/i.test(e)));
    });

    test("Intake Edge Case: Zero amount is rejected", () => {
      const res = validateClaimSubmissionIntake({ ...validPayload, amount: 0 });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /must be strictly positive/i.test(e)));
    });

    test("Intake Edge Case: Non-numeric amount is rejected", () => {
      const res = validateClaimSubmissionIntake({ ...validPayload, amount: NaN });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /amount must be a valid number/i.test(e)));
    });

    test("Intake Edge Case: Unsupported category handling", () => {
      const res = validateClaimSubmissionIntake({ ...validPayload, category: "cryptocurrency" });
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => /Unsupported category: 'cryptocurrency'/i.test(e)));
    });

    test("Intake: All supported categories are accepted and normalized", () => {
      for (const cat of SUPPORTED_CATEGORIES) {
        const res = validateClaimSubmissionIntake({ ...validPayload, category: cat.toUpperCase() });
        assert.equal(res.isValid, true, `Category ${cat} should be valid`);
        assert.equal(res.sanitizedPayload?.category, cat);
      }
    });
  });

  // =========================================================================
  // 2. Perceptual Hashing & Duplicate Bill Detection
  // =========================================================================
  describe("2. Perceptual Hashing & Duplicate Bill Detection", () => {
    test("Perceptual Hash: Distance 0 represents identical hashes", () => {
      const h1 = "a1b2c3d4e5f60718";
      const h2 = "a1b2c3d4e5f60718";
      assert.equal(computePerceptualHammingDistance(h1, h2), 0);
    });

    test("Perceptual Hash: Bitwise Hamming distance computation for hex strings", () => {
      // 0x0 (0000) vs 0x1 (0001) -> 1 bit difference
      const h1 = "0000000000000000";
      const h2 = "0000000000000001";
      assert.equal(computePerceptualHammingDistance(h1, h2), 1);

      // 0x0 vs 0xf (1111) -> 4 bits difference
      const h3 = "000000000000000f";
      assert.equal(computePerceptualHammingDistance(h1, h3), 4);
    });

    test("Duplicate Detection: Exact hash match (distance 0 -> EXACT_DUPLICATE)", () => {
      const targetHash = "e8f12a4b8c9d0012";
      const existing = [
        { claimId: "CLM-3101", hash: targetHash, employeeId: "EMP-101", date: "2026-08-10" },
        { claimId: "CLM-3102", hash: "ffffffffffffffff", employeeId: "EMP-102", date: "2026-08-11" },
      ];

      const res = detectDuplicateReceipt(targetHash, existing);
      assert.equal(res.isDuplicate, true);
      assert.equal(res.matchType, "EXACT_DUPLICATE");
      assert.equal(res.distance, 0);
      assert.equal(res.matchedClaimId, "CLM-3101");
      assert.equal(res.confidence, 1.0);
    });

    test("Duplicate Detection: Near-duplicate match (Hamming distance <= 8 -> SUSPECTED_NEAR_DUPLICATE)", () => {
      // h1 and h2 differ by 3 bits
      const h1 = "0000000000000000";
      const hNear = "0000000000000007"; // 0x7 = 0111 (3 bits)
      assert.equal(computePerceptualHammingDistance(h1, hNear), 3);

      const existing = [{ claimId: "CLM-PREV-88", hash: h1, employeeId: "EMP-88" }];
      const res = detectDuplicateReceipt(hNear, existing);

      assert.equal(res.isDuplicate, true);
      assert.equal(res.matchType, "SUSPECTED_NEAR_DUPLICATE");
      assert.equal(res.distance, 3);
      assert.equal(res.matchedClaimId, "CLM-PREV-88");
      assert.ok(res.confidence >= 0.85);
    });

    test("Duplicate Detection: Boundary near-duplicate match (Hamming distance exactly 8)", () => {
      // 8 bits difference: 0x00 vs 0xff in last two chars
      const h1 = "0000000000000000";
      const h8 = "00000000000000ff"; // 8 bits
      assert.equal(computePerceptualHammingDistance(h1, h8), 8);

      const existing = [{ claimId: "CLM-PREV-B8", hash: h1 }];
      const res = detectDuplicateReceipt(h8, existing);

      assert.equal(res.isDuplicate, true);
      assert.equal(res.matchType, "SUSPECTED_NEAR_DUPLICATE");
      assert.equal(res.distance, 8);
    });

    test("Duplicate Detection: Distinct bills (Hamming distance > 10 -> DISTINCT_BILL)", () => {
      const h1 = "0000000000000000";
      const hFar = "0000000000000fff"; // 12 bits diff
      const dist = computePerceptualHammingDistance(h1, hFar);
      assert.equal(dist, 12);
      assert.ok(dist > 10);

      const existing = [{ claimId: "CLM-DISTINCT", hash: h1 }];
      const res = detectDuplicateReceipt(hFar, existing);

      assert.equal(res.isDuplicate, false);
      assert.equal(res.matchType, "DISTINCT_BILL");
      assert.equal(res.matchedClaimId, null);
    });

    test("Perceptual Hash Edge Cases: Empty hashes and length mismatches", () => {
      assert.equal(computePerceptualHammingDistance("", ""), 64);
      assert.equal(computePerceptualHammingDistance("1234", "123456"), 64);
      const res = detectDuplicateReceipt("", []);
      assert.equal(res.isDuplicate, false);
    });
  });

  // =========================================================================
  // 3. GSTIN Modulo-36 Checksum & State Code Verification
  // =========================================================================
  describe("3. GSTIN Modulo-36 Checksum & State Code Verification", () => {
    test("GSTIN Checksum: Valid Karnataka GSTIN (State 29)", () => {
      const res = verifyGSTINModulo36("29AAACI1681G1ZL");
      assert.equal(res.isValid, true);
      assert.equal(res.stateCode, "29");
      assert.equal(res.stateName, "Karnataka");
      assert.equal(res.pan, "AAACI1681G");
      assert.equal(res.calculatedCheckChar, "L");
      assert.equal(res.providedCheckChar, "L");
    });

    test("GSTIN Checksum: Valid Maharashtra GSTIN (State 27)", () => {
      const res = verifyGSTINModulo36("27AABCU9603R1ZN");
      assert.equal(res.isValid, true);
      assert.equal(res.stateCode, "27");
      assert.equal(res.stateName, "Maharashtra");
      assert.equal(res.pan, "AABCU9603R");
      assert.equal(res.calculatedCheckChar, "N");
      assert.equal(res.providedCheckChar, "N");
    });

    test("GSTIN Checksum: Valid Delhi GSTIN (State 07)", () => {
      const res = verifyGSTINModulo36("07AAAAA0000A1Z4");
      assert.equal(res.isValid, true);
      assert.equal(res.stateCode, "07");
      assert.equal(res.stateName, "Delhi");
      assert.equal(res.pan, "AAAAA0000A");
      assert.equal(res.calculatedCheckChar, "4");
    });

    test("GSTIN Checksum: Valid Karnataka alternative format", () => {
      const res = verifyGSTINModulo36("29ABCDE1234F1ZW");
      assert.equal(res.isValid, true);
      assert.equal(res.stateCode, "29");
      assert.equal(res.calculatedCheckChar, "W");
    });

    test("GSTIN Checksum Edge Case: Lower-case normalization", () => {
      const res = verifyGSTINModulo36("27aabcu9603r1zn");
      assert.equal(res.isValid, true);
      assert.equal(res.normalizedGSTIN, "27AABCU9603R1ZN");
      assert.equal(res.stateCode, "27");
      assert.equal(res.stateName, "Maharashtra");
    });

    test("GSTIN Checksum Edge Case: Invalid lengths", () => {
      const tooShort = verifyGSTINModulo36("29AAACI1681G1Z"); // 14 chars
      assert.equal(tooShort.isValid, false);
      assert.match(tooShort.error, /Invalid GSTIN length/);

      const tooLong = verifyGSTINModulo36("29AAACI1681G1ZL99"); // 17 chars
      assert.equal(tooLong.isValid, false);
      assert.match(tooLong.error, /Invalid GSTIN length/);
    });

    test("GSTIN Checksum Edge Case: Invalid characters and special symbols", () => {
      const withSymbol = verifyGSTINModulo36("27AABCU9603R1Z!");
      assert.equal(withSymbol.isValid, false);
      assert.match(withSymbol.error, /Invalid character/);
    });

    test("GSTIN Checksum Edge Case: State code boundaries", () => {
      // 00 is invalid
      const zeroState = verifyGSTINModulo36("00AAAAA0000A1Z5");
      assert.equal(zeroState.isValid, false);
      assert.match(zeroState.error, /Invalid Indian state code/);

      // 39 is out of range (max is 38 Ladakh)
      const outOfRangeState = verifyGSTINModulo36("39AAAAA0000A1Z3");
      assert.equal(outOfRangeState.isValid, false);
      assert.match(outOfRangeState.error, /Invalid Indian state code/);

      // 38 Ladakh is a valid state code
      assert.equal(INDIAN_STATE_CODES["38"], "Ladakh");
    });

    test("GSTIN Checksum Edge Case: Tampered check character fails validation", () => {
      // 27AABCU9603R1ZN is valid, changing 'N' to 'M' must fail
      const tampered = verifyGSTINModulo36("27AABCU9603R1ZM");
      assert.equal(tampered.isValid, false);
      assert.match(tampered.error, /GSTIN Modulo-36 checksum mismatch/);
      assert.equal(tampered.calculatedCheckChar, "N");
      assert.equal(tampered.providedCheckChar, "M");
    });

    test("GSTIN Checksum Edge Case: Empty or whitespace input", () => {
      assert.equal(verifyGSTINModulo36("").isValid, false);
      assert.equal(verifyGSTINModulo36("   ").isValid, false);
      assert.equal(verifyGSTINModulo36(undefined).isValid, false);
    });
  });

  // =========================================================================
  // 4. Historical Spend & Amount Anomaly Engine
  // =========================================================================
  describe("4. Historical Spend & Amount Anomaly Engine", () => {
    test("Anomaly: Amount within baseline variance (<= 2x average) is NORMAL", () => {
      const avg = 2000;
      const res = evaluateSpendAnomaly(2500, avg); // 1.25x
      assert.equal(res.isAnomaly, false);
      assert.equal(res.severity, "NORMAL");
      assert.equal(res.multiplier, 1.25);
    });

    test("Anomaly: Exactly 2.0x baseline boundary is NORMAL", () => {
      const avg = 2000;
      const res = evaluateSpendAnomaly(4000, avg); // 2.0x
      assert.equal(res.isAnomaly, false);
      assert.equal(res.severity, "NORMAL");
      assert.equal(res.multiplier, 2.0);
    });

    test("Anomaly: > 2x triggers spend WARNING anomaly", () => {
      const avg = 2000;
      const res = evaluateSpendAnomaly(5200, avg); // 2.6x
      assert.equal(res.isAnomaly, true);
      assert.equal(res.severity, "WARNING");
      assert.equal(res.multiplier, 2.6);
      assert.match(res.description, /Exceeds 2x warning threshold/);
    });

    test("Anomaly: Exactly 5.0x baseline boundary is WARNING", () => {
      const avg = 1500;
      const res = evaluateSpendAnomaly(7500, avg); // 5.0x
      assert.equal(res.isAnomaly, true);
      assert.equal(res.severity, "WARNING");
      assert.equal(res.multiplier, 5.0);
    });

    test("Anomaly: > 5x triggers SEVERE anomaly", () => {
      const avg = 1500;
      const res = evaluateSpendAnomaly(9000, avg); // 6.0x
      assert.equal(res.isAnomaly, true);
      assert.equal(res.severity, "SEVERE");
      assert.equal(res.multiplier, 6.0);
      assert.match(res.description, /Exceeds 5x severe threshold/);
    });

    test("Anomaly Edge Case: Zero or negative historical spend handles gracefully", () => {
      const res1 = evaluateSpendAnomaly(3500, 0);
      assert.equal(res1.isAnomaly, false);
      assert.equal(res1.severity, "NORMAL");

      const res2 = evaluateSpendAnomaly(-100, 1000);
      assert.equal(res2.isAnomaly, false);
    });
  });

  // =========================================================================
  // 5. Category & Policy Limit Breaches
  // =========================================================================
  describe("5. Category & Policy Limit Breaches", () => {
    test("Policy Limits: Daily cap constants verification", () => {
      assert.equal(DAILY_CATEGORY_CAPS.fuel, 5000);
      assert.equal(DAILY_CATEGORY_CAPS.meals, 2500);
      assert.equal(DAILY_CATEGORY_CAPS.lodging, 10000);
    });

    test("Policy Limits: Fuel claim within cap (₹4,800 <= ₹5,000) passes", () => {
      const res = evaluatePolicyLimits("fuel", 4800);
      assert.equal(res.hasBreach, false);
      assert.equal(res.limitBreached, false);
      assert.equal(res.overageAmount, 0);
    });

    test("Policy Limits: Fuel claim exceeding cap (₹6,500 > ₹5,000) triggers breach", () => {
      const res = evaluatePolicyLimits("fuel", 6500);
      assert.equal(res.hasBreach, true);
      assert.equal(res.limitBreached, true);
      assert.equal(res.overageAmount, 1500);
      assert.ok(res.reasons.some((r) => /exceeds ₹5,000 cap for fuel/i.test(r)));
    });

    test("Policy Limits: Meals claim exceeding cap (₹3,200 > ₹2,500) triggers breach", () => {
      const res = evaluatePolicyLimits("meals", 3200);
      assert.equal(res.hasBreach, true);
      assert.equal(res.limitBreached, true);
      assert.equal(res.overageAmount, 700);
      assert.ok(res.reasons.some((r) => /exceeds ₹2,500 cap for meals/i.test(r)));
    });

    test("Policy Limits: Lodging claim exceeding cap (₹13,500 > ₹10,000) triggers breach", () => {
      const res = evaluatePolicyLimits("lodging", 13500);
      assert.equal(res.hasBreach, true);
      assert.equal(res.limitBreached, true);
      assert.equal(res.overageAmount, 3500);
      assert.ok(res.reasons.some((r) => /exceeds ₹10,000 cap for lodging/i.test(r)));
    });

    test("Policy Limits: Category mismatch (Dining claimed as Fuel)", () => {
      const res = evaluatePolicyLimits("fuel", 1200, "food");
      assert.equal(res.hasBreach, true);
      assert.equal(res.categoryMismatch, true);
      assert.ok(res.reasons.some((r) => /receipt OCR extracted 'food' expense, but claimed under 'fuel'/i.test(r)));
    });

    test("Policy Limits: Equivalent categories (food vs meals) do not trigger mismatch", () => {
      const res1 = evaluatePolicyLimits("meals", 800, "food");
      assert.equal(res1.categoryMismatch, false);

      const res2 = evaluatePolicyLimits("food", 800, "meals");
      assert.equal(res2.categoryMismatch, false);
    });
  });

  // =========================================================================
  // 6. Multi-Signal Compounding Risk Calculation
  // =========================================================================
  describe("6. Multi-Signal Compounding Risk Calculation", () => {
    test("Risk Scoring: Zero signals yields score 0 and LOW band", () => {
      const res = calculateCompoundingRiskScore([]);
      assert.equal(res.score, 0);
      assert.equal(res.band, "LOW");
      assert.equal(res.recommendedAction, "APPROVE_RECOMMENDED");
    });

    test("Risk Scoring: Single signal within LOW band (<30)", () => {
      const res = calculateCompoundingRiskScore([
        { code: "WARNING_ANOMALY", severity: "MEDIUM", baseImpact: 20, description: "Spend 2.3x" },
      ]);
      assert.equal(res.score, 20);
      assert.equal(res.band, "LOW");
      assert.equal(res.recommendedAction, "APPROVE_RECOMMENDED");
    });

    test("Risk Scoring: Single or dual signals within MEDIUM band (30-59)", () => {
      const res = calculateCompoundingRiskScore([
        { code: "POLICY_BREACH", severity: "HIGH", baseImpact: 35, description: "Fuel cap overage" },
      ]);
      assert.equal(res.score, 35);
      assert.equal(res.band, "MEDIUM");
      assert.equal(res.recommendedAction, "MANUAL_REVIEW");
    });

    test("Risk Scoring: HIGH severity band (60-84)", () => {
      const res = calculateCompoundingRiskScore([
        { code: "NEAR_DUP", severity: "HIGH", baseImpact: 40, description: "Near duplicate receipt" },
        { code: "WARN_ANOMALY", severity: "MEDIUM", baseImpact: 20, description: "Amount warning" },
      ]);
      // Additive = 60, 2 signals -> compounding factor 1 + 0.15 = 1.15 -> 69
      assert.equal(res.score, 69);
      assert.equal(res.band, "HIGH");
      assert.equal(res.recommendedAction, "MANUAL_REVIEW");
    });

    test("Risk Scoring: Multi-signal compounding escalation into CRITICAL band (>=85)", () => {
      const signals = [
        { code: "DUPLICATE_RECEIPT", severity: "HIGH", baseImpact: 45, description: "Exact receipt duplicate" },
        { code: "SEVERE_ANOMALY", severity: "HIGH", baseImpact: 35, description: "Spend > 5x baseline" },
        { code: "POLICY_BREACH", severity: "HIGH", baseImpact: 25, description: "Over lodging cap" },
      ];
      // Additive = 105, 3 signals -> multiplier 1 + 0.30 = 1.30 -> rawScore = 137, capped at 100
      const res = calculateCompoundingRiskScore(signals);
      assert.equal(res.score, 100);
      assert.equal(res.band, "CRITICAL");
      assert.equal(res.recommendedAction, "REJECT_RECOMMENDED");
    });

    test("Risk Scoring: Strict capping at 100 maximum", () => {
      const excessiveSignals = [
        { code: "S1", severity: "CRITICAL", baseImpact: 60, description: "Sig 1" },
        { code: "S2", severity: "CRITICAL", baseImpact: 60, description: "Sig 2" },
        { code: "S3", severity: "CRITICAL", baseImpact: 60, description: "Sig 3" },
      ];
      const res = calculateCompoundingRiskScore(excessiveSignals);
      assert.equal(res.score, 100);
      assert.ok(res.rawScore > 100);
    });
  });

  // =========================================================================
  // 7. Immutable Audit Trail & State Transitions & GST ITC Staging
  // =========================================================================
  describe("7. Immutable Audit Trail, State Transitions & GST ITC Staging", () => {
    test("Audit Trail: Claim creation initializes SUBMITTED state and employee audit log", () => {
      const claim = createCSADClaim({
        claimId: "CLM-AUDIT-101",
        employeeId: "EMP-900",
        organizationId: "ORG-ACME",
        amount: 2400,
        category: "fuel",
        date: "2026-09-19",
        receiptUri: "/receipts/900.png",
      });

      assert.equal(claim.status, "SUBMITTED");
      assert.equal(claim.auditTrail.length, 1);
      assert.equal(claim.auditTrail[0].action, "CLAIM_SUBMITTED");
      assert.equal(claim.auditTrail[0].actorId, "EMP-900");
      assert.equal(claim.auditTrail[0].actorType, "EMPLOYEE");
      assert.equal(claim.auditTrail[0].previousState, null);
      assert.equal(claim.auditTrail[0].newState, "SUBMITTED");
      assert.ok(claim.auditTrail[0].timestamp);
    });

    test("State Transition: SUBMITTED -> APPROVED with manager attribution", () => {
      const initial = createCSADClaim({
        claimId: "CLM-AUDIT-102",
        employeeId: "EMP-900",
        organizationId: "ORG-ACME",
        amount: 1500,
        category: "meals",
        date: "2026-09-19",
        receiptUri: "/receipts/102.png",
      });

      const { claim: approved, auditEntry } = transitionClaimState(initial, "APPROVED", {
        managerId: "MGR-MEERA",
        notes: "Audited and verified against customer agenda",
      });

      assert.equal(approved.status, "APPROVED");
      assert.equal(approved.managerId, "MGR-MEERA");
      assert.equal(approved.auditTrail.length, 2);
      assert.equal(auditEntry.action, "CLAIM_APPROVED");
      assert.equal(auditEntry.actorType, "MANAGER");
      assert.equal(auditEntry.actorId, "MGR-MEERA");
      assert.equal(auditEntry.previousState, "SUBMITTED");
      assert.equal(auditEntry.newState, "APPROVED");
      assert.equal(auditEntry.payloadDiff.status.to, "APPROVED");
    });

    test("State Transition: SUBMITTED -> REJECTED with mandatory manager attribution and reason", () => {
      const initial = createCSADClaim({
        claimId: "CLM-AUDIT-103",
        employeeId: "EMP-900",
        organizationId: "ORG-ACME",
        amount: 8500,
        category: "fuel",
        date: "2026-09-19",
        receiptUri: "/receipts/103.png",
      });

      const { claim: rejected, auditEntry } = transitionClaimState(initial, "REJECTED", {
        managerId: "MGR-VIKRAM",
        notes: "Exceeds vehicle tank capacity and daily limit without justification",
      });

      assert.equal(rejected.status, "REJECTED");
      assert.equal(rejected.managerId, "MGR-VIKRAM");
      assert.equal(rejected.auditTrail.length, 2);
      assert.equal(auditEntry.action, "CLAIM_REJECTED");
      assert.equal(auditEntry.previousState, "SUBMITTED");
      assert.equal(auditEntry.newState, "REJECTED");
    });

    test("State Integrity: Disallowing state transition without manager identity attribution", () => {
      const initial = createCSADClaim({
        claimId: "CLM-AUDIT-104",
        employeeId: "EMP-900",
        organizationId: "ORG-ACME",
        amount: 1200,
        category: "fuel",
        date: "2026-09-19",
        receiptUri: "/receipts/104.png",
      });

      assert.throws(
        () => {
          transitionClaimState(initial, "APPROVED", { managerId: "" });
        },
        /Manager identity attribution is required/
      );

      assert.throws(
        () => {
          transitionClaimState(initial, "APPROVED", undefined);
        },
        /Manager identity attribution is required/
      );
    });

    test("State Integrity: Disallowing invalid transition from terminal states", () => {
      const initial = createCSADClaim({
        claimId: "CLM-AUDIT-105",
        employeeId: "EMP-900",
        organizationId: "ORG-ACME",
        amount: 1200,
        category: "fuel",
        date: "2026-09-19",
        receiptUri: "/receipts/105.png",
      });

      const { claim: approved } = transitionClaimState(initial, "APPROVED", { managerId: "MGR-1" });

      // Attempting to transition from APPROVED to REJECTED directly should fail
      assert.throws(() => {
        transitionClaimState(approved, "REJECTED", { managerId: "MGR-2" });
      }, /Invalid state transition/);
    });

    test("GST ITC Staging: Eligible category with valid GSTIN stages 18% tax credit", () => {
      // Amount ₹1,180 (GST inclusive at 18%: base ₹1,000 + ₹180 ITC)
      const res = calculateGSTITCStaging(1180, "fuel", true);
      assert.equal(res.isEligible, true);
      assert.equal(res.itcRate, 0.18);
      assert.equal(res.itcStagedAmount, 180);
      assert.equal(res.hasValidGSTIN, true);
    });

    test("GST ITC Staging: Non-eligible category stages ₹0 ITC", () => {
      const res = calculateGSTITCStaging(5000, "entertainment_personal", true);
      assert.equal(res.isEligible, false);
      assert.equal(res.itcStagedAmount, 0);
      assert.match(res.ineligibleReason, /not eligible for GST ITC/);
    });

    test("GST ITC Staging: Missing or invalid GSTIN disallows ITC staging", () => {
      const res = calculateGSTITCStaging(2500, "lodging", false);
      assert.equal(res.isEligible, false);
      assert.equal(res.itcStagedAmount, 0);
      assert.match(res.ineligibleReason, /Vendor GSTIN is missing or failed Modulo-36/);
    });
  });

  // =========================================================================
  // 8. CSAD Appliance Diagnostic Health Runner
  // =========================================================================
  describe("8. CSAD Appliance Diagnostic Health Runner", () => {
    test("Diagnostics: runCSADDiagnostics executes and reports HEALTHY status", () => {
      const report = runCSADDiagnostics();
      assert.ok(report);
      assert.equal(report.status, "HEALTHY");
      assert.equal(report.appliance, "CSAD-ClaimGuard-v1");
      assert.ok(report.timestamp);

      // Verify all 8 subsystems pass
      const { subsystems } = report;
      assert.equal(subsystems.intakeValidator.status, "PASS");
      assert.equal(subsystems.perceptualHashEngine.status, "PASS");
      assert.equal(subsystems.gstinChecksumEngine.status, "PASS");
      assert.equal(subsystems.anomalyEngine.status, "PASS");
      assert.equal(subsystems.policyEngine.status, "PASS");
      assert.equal(subsystems.riskScorer.status, "PASS");
      assert.equal(subsystems.auditStateMachine.status, "PASS");
      assert.equal(subsystems.itcStagingEngine.status, "PASS");

      // Verify metrics
      assert.equal(report.metrics.totalSubsystems, 8);
      assert.equal(report.metrics.passedSubsystems, 8);
      assert.ok(report.metrics.totalChecks >= 15);
      assert.ok(typeof report.metrics.durationMs === "number");
    });
  });
});
