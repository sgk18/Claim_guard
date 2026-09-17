import test from "node:test";
import assert from "node:assert/strict";

import { validateGSTIN } from "../src/services/fraud/gstin.ts";
import { computeHammingDistance, areImagesSimilar } from "../src/services/fraud/perceptualHash.ts";
import { evaluateFraudSignals } from "../src/services/fraud/rules.ts";
import { calculateDeterministicRiskScore } from "../src/services/risk/engine.ts";

test("GSTIN Validation - Valid Karnataka GSTIN", () => {
  const res = validateGSTIN("29AAACI1681G1ZS");
  assert.equal(res.isValid, true);
  assert.equal(res.stateCode, "29");
  assert.equal(res.stateName, "Karnataka");
});

test("GSTIN Validation - Invalid GSTIN length or characters", () => {
  const res = validateGSTIN("INVALID123");
  assert.equal(res.isValid, false);
  assert.match(res.error, /Invalid GSTIN format/);
});

test("Perceptual Hash - Similarity and distance check", () => {
  const hash1 = "a1b2c3d4e5f60718";
  const hash2 = "a1b2c3d4e5f60718"; // identical
  const hash3 = "a1b2c3d4e5f60719"; // 1 char diff

  assert.equal(areImagesSimilar(hash1, hash2), true);
  assert.equal(areImagesSimilar(hash1, hash3), true);
  assert.equal(computeHammingDistance(hash1, hash3), 1);
});

test("Scenario 1: Clean Claim Evaluation (LOW Risk)", () => {
  const mockEmployee = {
    id: "emp_1",
    companyId: "comp_1",
    name: "Rahul Kumar",
    email: "r@test.in",
    phone: "+919876543210",
    role: "Sales",
    department: "Sales",
    historicalClaimCount: 20,
    historicalClaimAvg: 2000,
    createdAt: "2026-01-01",
  };

  const mockPolicy = {
    id: "pol_1",
    companyId: "comp_1",
    category: "fuel",
    maxSingleClaim: 5000,
    requiresGstin: true,
    description: "Fuel max 5000",
    createdAt: "2026-01-01",
  };

  const signals = evaluateFraudSignals({
    claim: {
      amount: 1850,
      category: "fuel",
      vendorName: "Indian Oil",
      claimDate: "2026-09-16",
      gstin: "29AAACI1681G1ZS",
    },
    receipt: {
      imageHash: "hash_unique_1850",
      ocrConfidence: { vendorName: 0.98, amount: 0.99, date: 0.95, category: 0.95 },
      extractedCategory: "fuel",
    },
    employee: mockEmployee,
    policy: mockPolicy,
    existingClaims: [],
  });

  const risk = calculateDeterministicRiskScore(signals);
  assert.equal(signals.length, 0);
  assert.equal(risk.score, 0);
  assert.equal(risk.level, "LOW");
  assert.equal(risk.recommendedAction, "APPROVE_RECOMMENDED");
});

test("Scenario 2: Duplicate Receipt Detection (HIGH Risk)", () => {
  const mockEmployee = {
    id: "emp_1",
    companyId: "comp_1",
    name: "Rahul Kumar",
    email: "r@test.in",
    phone: "+919876543210",
    role: "Sales",
    department: "Sales",
    historicalClaimCount: 20,
    historicalClaimAvg: 2000,
    createdAt: "2026-01-01",
  };

  const existingClaims = [
    {
      id: "CLM-3902",
      companyId: "comp_1",
      employeeId: "emp_amit_103",
      status: "APPROVED",
      amount: 3850,
      currency: "INR",
      category: "fuel",
      vendorName: "Indian Oil",
      claimDate: "2026-08-14",
      receipt: {
        id: "rcpt_old",
        claimId: "CLM-3902",
        fileUrl: "/receipts/demo_indian_oil.jpg",
        fileName: "old.jpg",
        mimeType: "image/jpeg",
        fileSize: 1000,
        imageHash: "hash_duplicate_target",
        ocrConfidence: { vendorName: 0.99, amount: 0.99, date: 0.99, category: 0.99 },
        createdAt: "2026-08-14",
      },
      createdAt: "2026-08-14",
      updatedAt: "2026-08-14",
    },
  ];

  const signals = evaluateFraudSignals({
    claim: {
      amount: 3850,
      category: "fuel",
      vendorName: "Indian Oil",
      claimDate: "2026-09-17",
      gstin: "29AAACI1681G1ZS",
    },
    receipt: {
      imageHash: "hash_duplicate_target", // Exact collision
      ocrConfidence: { vendorName: 0.98, amount: 0.99, date: 0.95, category: 0.95 },
    },
    employee: mockEmployee,
    existingClaims,
  });

  const dupSignal = signals.find((s) => s.type === "DUPLICATE_RECEIPT");
  assert.ok(dupSignal, "Duplicate signal should be triggered");
  assert.equal(dupSignal.scoreImpact, 40);

  const risk = calculateDeterministicRiskScore(signals);
  assert.ok(risk.score >= 40);
});

test("Scenario 3: Amount Anomaly (>2x Employee Average)", () => {
  const mockEmployee = {
    id: "emp_1",
    companyId: "comp_1",
    name: "Rahul Kumar",
    email: "r@test.in",
    phone: "+919876543210",
    role: "Sales",
    department: "Sales",
    historicalClaimCount: 20,
    historicalClaimAvg: 1500, // Average is 1500
    createdAt: "2026-01-01",
  };

  const signals = evaluateFraudSignals({
    claim: {
      amount: 8500, // 5.6x average!
      category: "fuel",
      vendorName: "Indian Oil",
      claimDate: "2026-09-17",
    },
    receipt: {
      imageHash: "hash_anom",
      ocrConfidence: { vendorName: 0.98, amount: 0.99, date: 0.95, category: 0.95 },
    },
    employee: mockEmployee,
    existingClaims: [],
  });

  const anomSignal = signals.find((s) => s.type === "AMOUNT_ANOMALY");
  assert.ok(anomSignal, "Amount anomaly should be triggered");
});

test("Scenario 4: Category Mismatch (Dining claimed as Fuel)", () => {
  const mockEmployee = {
    id: "emp_1",
    companyId: "comp_1",
    name: "Rahul Kumar",
    email: "r@test.in",
    phone: "+919876543210",
    role: "Sales",
    department: "Sales",
    historicalClaimCount: 20,
    historicalClaimAvg: 2000,
    createdAt: "2026-01-01",
  };

  const signals = evaluateFraudSignals({
    claim: {
      amount: 2450,
      category: "fuel", // Claimed as fuel
      vendorName: "Barbeque Nation",
      claimDate: "2026-09-17",
    },
    receipt: {
      imageHash: "hash_bbq",
      ocrConfidence: { vendorName: 0.98, amount: 0.99, date: 0.95, category: 0.95 },
      extractedCategory: "food", // Extracted as food
    },
    employee: mockEmployee,
    existingClaims: [],
  });

  const catSignal = signals.find((s) => s.type === "CATEGORY_MISMATCH");
  assert.ok(catSignal, "Category mismatch should be triggered");
});

test("Scenario 5: Policy Violation (Exceeds Policy Cap)", () => {
  const mockEmployee = {
    id: "emp_1",
    companyId: "comp_1",
    name: "Rahul Kumar",
    email: "r@test.in",
    phone: "+919876543210",
    role: "Sales",
    department: "Sales",
    historicalClaimCount: 20,
    historicalClaimAvg: 2000,
    createdAt: "2026-01-01",
  };

  const mockPolicy = {
    id: "pol_fuel",
    companyId: "comp_1",
    category: "fuel",
    maxSingleClaim: 5000, // Cap is 5000
    requiresGstin: true,
    description: "Fuel cap",
    createdAt: "2026-01-01",
  };

  const signals = evaluateFraudSignals({
    claim: {
      amount: 7800, // Exceeds cap
      category: "fuel",
      vendorName: "BPCL",
      claimDate: "2026-09-17",
      gstin: "29AAACI1681G1ZS",
    },
    receipt: {
      imageHash: "hash_bpcl",
      ocrConfidence: { vendorName: 0.98, amount: 0.99, date: 0.95, category: 0.95 },
    },
    employee: mockEmployee,
    policy: mockPolicy,
    existingClaims: [],
  });

  const polSignal = signals.find((s) => s.type === "POLICY_VIOLATION");
  assert.ok(polSignal, "Policy violation should be triggered");
});

test("Scenario 7: Multiple Compounding Signals -> CRITICAL Risk", () => {
  const mockEmployee = {
    id: "emp_1",
    companyId: "comp_1",
    name: "Rahul Kumar",
    email: "r@test.in",
    phone: "+919876543210",
    role: "Sales",
    department: "Sales",
    historicalClaimCount: 20,
    historicalClaimAvg: 2000,
    createdAt: "2026-01-01",
  };

  const mockPolicy = {
    id: "pol_fuel",
    companyId: "comp_1",
    category: "fuel",
    maxSingleClaim: 5000,
    requiresGstin: true,
    description: "Fuel cap",
    createdAt: "2026-01-01",
  };

  const existingClaims = [
    {
      id: "CLM-3902",
      companyId: "comp_1",
      employeeId: "emp_other",
      status: "APPROVED",
      amount: 9200,
      currency: "INR",
      category: "fuel",
      vendorName: "IOCL",
      claimDate: "2026-08-14",
      receipt: {
        id: "rcpt_1",
        claimId: "CLM-3902",
        fileUrl: "",
        fileName: "",
        mimeType: "",
        fileSize: 100,
        imageHash: "hash_target_multi",
        ocrConfidence: { vendorName: 1, amount: 1, date: 1, category: 1 },
        createdAt: "",
      },
      createdAt: "",
      updatedAt: "",
    },
  ];

  const signals = evaluateFraudSignals({
    claim: {
      amount: 9200, // Anomaly + Policy breach
      category: "fuel",
      vendorName: "IOCL",
      claimDate: "2026-09-17",
      gstin: "INVALID_GSTIN_123", // GSTIN violation
    },
    receipt: {
      imageHash: "hash_target_multi", // Duplicate!
      ocrConfidence: { vendorName: 0.98, amount: 0.99, date: 0.95, category: 0.95 },
    },
    employee: mockEmployee,
    policy: mockPolicy,
    existingClaims,
  });

  const risk = calculateDeterministicRiskScore(signals);
  assert.ok(signals.length >= 3, `Expected at least 3 signals, got ${signals.length}`);
  assert.ok(risk.score >= 80, `Expected score >= 80, got ${risk.score}`);
  assert.equal(risk.level, "CRITICAL");
  assert.equal(risk.recommendedAction, "REJECT_RECOMMENDED");
});
