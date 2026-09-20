/**
 * CSAD (Claim Submission & Audit Detection) Appliance Engine
 * ClaimGuard Enterprise Financial Audit & Spend Defense System
 */

export const SUPPORTED_CATEGORIES = [
  "fuel",
  "meals",
  "food",
  "lodging",
  "travel",
  "office_supplies",
  "other",
] as const;

export type ExpenseCategoryType = (typeof SUPPORTED_CATEGORIES)[number];

export const DAILY_CATEGORY_CAPS: Record<string, number> = {
  fuel: 5000,
  meals: 2500,
  food: 2500,
  lodging: 10000,
};

export const GSTIN_CHAR_MAP = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const INDIAN_STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

export interface ClaimIntakePayload {
  claimId: string;
  employeeId: string;
  organizationId: string;
  amount: number;
  category: string;
  date: string;
  receiptUri: string;
  vendorName?: string;
  gstin?: string;
  notes?: string;
}

export interface IntakeValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedPayload?: ClaimIntakePayload;
}

/**
 * 1. Claim Submission & Intake Validation
 */
export function validateClaimSubmissionIntake(payload: Partial<ClaimIntakePayload>): IntakeValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { isValid: false, errors: ["Claim intake payload is required and must be an object"] };
  }

  // 1. Mandatory metadata check
  if (!payload.claimId || !String(payload.claimId).trim()) {
    errors.push("Missing required field: claim ID is required");
  }
  if (!payload.employeeId || !String(payload.employeeId).trim()) {
    errors.push("Missing required field: employee ID is required");
  }
  if (!payload.organizationId || !String(payload.organizationId).trim()) {
    errors.push("Missing required field: organization ID is required");
  }
  if (!payload.date || !String(payload.date).trim()) {
    errors.push("Missing required field: claim date is required");
  } else {
    const parsedDate = new Date(payload.date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Invalid date format: date must be a valid ISO-8601 or YYYY-MM-DD date");
    }
  }
  if (!payload.receiptUri || !String(payload.receiptUri).trim()) {
    errors.push("Missing required field: receipt URI is required");
  }

  // 2. Amount boundary validation
  if (payload.amount === undefined || payload.amount === null || typeof payload.amount !== "number" || isNaN(payload.amount)) {
    errors.push("Missing required field: amount must be a valid number");
  } else if (payload.amount <= 0) {
    errors.push(`Invalid claim amount: amount must be strictly positive (> 0), received ${payload.amount}`);
  }

  // 3. Category validation
  if (!payload.category || !String(payload.category).trim()) {
    errors.push("Missing required field: expense category is required");
  } else {
    const normalizedCategory = payload.category.trim().toLowerCase();
    if (!SUPPORTED_CATEGORIES.includes(normalizedCategory as ExpenseCategoryType)) {
      errors.push(
        `Unsupported category: '${payload.category}'. Supported categories: ${SUPPORTED_CATEGORIES.join(", ")}`
      );
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const sanitizedPayload: ClaimIntakePayload = {
    claimId: String(payload.claimId!).trim(),
    employeeId: String(payload.employeeId!).trim(),
    organizationId: String(payload.organizationId!).trim(),
    amount: Number(payload.amount),
    category: String(payload.category!).trim().toLowerCase(),
    date: String(payload.date!).trim(),
    receiptUri: String(payload.receiptUri!).trim(),
    vendorName: payload.vendorName ? String(payload.vendorName).trim() : undefined,
    gstin: payload.gstin ? String(payload.gstin).trim().toUpperCase() : undefined,
    notes: payload.notes ? String(payload.notes).trim() : undefined,
  };

  return {
    isValid: true,
    errors: [],
    sanitizedPayload,
  };
}

/**
 * 2. Perceptual Hashing & Duplicate Bill Detection
 */
export function computePerceptualHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2) return 64;
  if (hash1 === hash2) return 0;

  const h1 = hash1.trim().toLowerCase();
  const h2 = hash2.trim().toLowerCase();

  // If length mismatch, return maximum 64-bit distance
  if (h1.length !== h2.length) {
    return 64;
  }

  // 64-bit Hex Perceptual Bitwise Distance
  const isHex = /^[0-9a-f]+$/i.test(h1) && /^[0-9a-f]+$/i.test(h2);
  if (isHex) {
    let distance = 0;
    for (let i = 0; i < h1.length; i++) {
      const v1 = parseInt(h1[i], 16);
      const v2 = parseInt(h2[i], 16);
      let xor = v1 ^ v2;
      while (xor > 0) {
        distance += xor & 1;
        xor >>= 1;
      }
    }
    return distance;
  }

  // Fallback to character hamming difference
  let charDiff = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) charDiff++;
  }
  return charDiff;
}

export type DuplicateMatchType = "EXACT_DUPLICATE" | "SUSPECTED_NEAR_DUPLICATE" | "DISTINCT_BILL";

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  matchType: DuplicateMatchType;
  distance: number;
  matchedClaimId: string | null;
  confidence: number;
  description: string;
}

export function detectDuplicateReceipt(
  currentHash: string,
  existingReceipts: Array<{ claimId: string; hash: string; employeeId?: string; date?: string }>
): DuplicateDetectionResult {
  if (!currentHash || !currentHash.trim() || !existingReceipts || existingReceipts.length === 0) {
    return {
      isDuplicate: false,
      matchType: "DISTINCT_BILL",
      distance: 64,
      matchedClaimId: null,
      confidence: 1.0,
      description: "Clean unique bill. No existing receipt matches.",
    };
  }

  let minDistance = Infinity;
  let bestMatch: { claimId: string; hash: string } | null = null;

  for (const existing of existingReceipts) {
    const dist = computePerceptualHammingDistance(currentHash, existing.hash);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = existing;
    }
  }

  if (minDistance === 0 && bestMatch) {
    return {
      isDuplicate: true,
      matchType: "EXACT_DUPLICATE",
      distance: 0,
      matchedClaimId: bestMatch.claimId,
      confidence: 1.0,
      description: `Exact duplicate match detected (Hamming distance 0). Matches claim #${bestMatch.claimId}.`,
    };
  }

  if (minDistance <= 8 && bestMatch) {
    const confidence = Number((1 - minDistance / 64).toFixed(2));
    return {
      isDuplicate: true,
      matchType: "SUSPECTED_NEAR_DUPLICATE",
      distance: minDistance,
      matchedClaimId: bestMatch.claimId,
      confidence,
      description: `Near-duplicate match detected (Hamming distance ${minDistance} <= 8). Suspected re-photographed or cropped duplicate of claim #${bestMatch.claimId}.`,
    };
  }

  return {
    isDuplicate: false,
    matchType: "DISTINCT_BILL",
    distance: minDistance === Infinity ? 64 : minDistance,
    matchedClaimId: null,
    confidence: 1.0,
    description: `Clean unique bill. Perceptual distance ${minDistance} > 10 distinct threshold.`,
  };
}

/**
 * 3. GSTIN Modulo-36 Checksum & State Code Verification
 */
export interface GSTINVerificationResult {
  isValid: boolean;
  normalizedGSTIN?: string;
  stateCode?: string;
  stateName?: string;
  pan?: string;
  calculatedCheckChar?: string;
  providedCheckChar?: string;
  error?: string;
}

export function computeGSTINModulo36CheckChar(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = GSTIN_CHAR_MAP.indexOf(first14[i]);
    const multiplier = i % 2 === 0 ? 1 : 2;
    const product = codePoint * multiplier;
    const digitSum = Math.floor(product / 36) + (product % 36);
    sum += digitSum;
  }
  const remainder = sum % 36;
  const checkCodeIndex = (36 - remainder) % 36;
  return GSTIN_CHAR_MAP[checkCodeIndex];
}

export function verifyGSTINModulo36(gstin?: string): GSTINVerificationResult {
  if (!gstin || !gstin.trim()) {
    return { isValid: false, error: "GSTIN is missing or empty" };
  }

  const cleaned = gstin.trim().toUpperCase();

  // Length check
  if (cleaned.length !== 15) {
    return {
      isValid: false,
      error: `Invalid GSTIN length: expected 15 characters, received ${cleaned.length}`,
    };
  }

  // Alphanumeric character set check
  for (let i = 0; i < cleaned.length; i++) {
    if (!GSTIN_CHAR_MAP.includes(cleaned[i])) {
      return {
        isValid: false,
        error: `Invalid character '${cleaned[i]}' in GSTIN. Only uppercase A-Z and digits 0-9 are permitted.`,
      };
    }
  }

  // Regex structure check: 2 digits + 5 PAN alpha + 4 PAN digits + 1 PAN alpha + 1 entity + 'Z' + 1 check
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleaned)) {
    return {
      isValid: false,
      error: "Invalid GSTIN format: failed standard 15-character PAN and entity pattern",
    };
  }

  // State code boundary check (01 - 38)
  const stateCode = cleaned.slice(0, 2);
  const stateNum = parseInt(stateCode, 10);
  if (stateNum < 1 || stateNum > 38 || !INDIAN_STATE_CODES[stateCode]) {
    return {
      isValid: false,
      stateCode,
      error: `Invalid Indian state code '${stateCode}'. Valid state codes are within range 01-38.`,
    };
  }

  const stateName = INDIAN_STATE_CODES[stateCode];
  const pan = cleaned.slice(2, 12);
  const providedCheckChar = cleaned[14];

  // Modulo-36 Checksum algorithm
  const calculatedCheckChar = computeGSTINModulo36CheckChar(cleaned.slice(0, 14));

  if (calculatedCheckChar !== providedCheckChar) {
    return {
      isValid: false,
      normalizedGSTIN: cleaned,
      stateCode,
      stateName,
      pan,
      calculatedCheckChar,
      providedCheckChar,
      error: `GSTIN Modulo-36 checksum mismatch: expected check character '${calculatedCheckChar}', but received '${providedCheckChar}'.`,
    };
  }

  return {
    isValid: true,
    normalizedGSTIN: cleaned,
    stateCode,
    stateName,
    pan,
    calculatedCheckChar,
    providedCheckChar,
  };
}

/**
 * 4. Historical Spend & Amount Anomaly Engine
 */
export type AnomalySeverity = "NORMAL" | "WARNING" | "SEVERE";

export interface AnomalyEvaluationResult {
  isAnomaly: boolean;
  severity: AnomalySeverity;
  multiplier: number;
  description: string;
  historicalAverage: number;
  currentAmount: number;
}

export function evaluateSpendAnomaly(
  currentAmount: number,
  historical30DayAverage: number
): AnomalyEvaluationResult {
  if (historical30DayAverage <= 0 || currentAmount <= 0) {
    return {
      isAnomaly: false,
      severity: "NORMAL",
      multiplier: 1.0,
      description: "No historical baseline or zero spend: normal grace evaluation.",
      historicalAverage: historical30DayAverage,
      currentAmount,
    };
  }

  const multiplier = Number((currentAmount / historical30DayAverage).toFixed(2));

  if (multiplier > 5.0) {
    return {
      isAnomaly: true,
      severity: "SEVERE",
      multiplier,
      description: `Severe spend anomaly: claim amount ₹${currentAmount.toLocaleString()} is ${multiplier}x above 30-day historical average (₹${historical30DayAverage.toLocaleString()}). Exceeds 5x severe threshold.`,
      historicalAverage: historical30DayAverage,
      currentAmount,
    };
  }

  if (multiplier > 2.0) {
    return {
      isAnomaly: true,
      severity: "WARNING",
      multiplier,
      description: `Spend warning anomaly: claim amount ₹${currentAmount.toLocaleString()} is ${multiplier}x above 30-day historical average (₹${historical30DayAverage.toLocaleString()}). Exceeds 2x warning threshold.`,
      historicalAverage: historical30DayAverage,
      currentAmount,
    };
  }

  return {
    isAnomaly: false,
    severity: "NORMAL",
    multiplier,
    description: `Claim amount ₹${currentAmount.toLocaleString()} is within normal variance (${multiplier}x <= 2x historical average).`,
    historicalAverage: historical30DayAverage,
    currentAmount,
  };
}

/**
 * 5. Category & Policy Limit Breaches
 */
export interface PolicyEvaluationResult {
  hasBreach: boolean;
  limitBreached: boolean;
  categoryMismatch: boolean;
  capAmount?: number;
  overageAmount: number;
  claimedCategory: string;
  extractedCategory?: string;
  reasons: string[];
}

export function evaluatePolicyLimits(
  claimedCategory: string,
  amount: number,
  extractedReceiptCategory?: string,
  customDailyCaps: Record<string, number> = DAILY_CATEGORY_CAPS
): PolicyEvaluationResult {
  const normClaimed = claimedCategory.trim().toLowerCase();
  const reasons: string[] = [];
  let limitBreached = false;
  let overageAmount = 0;
  const cap = customDailyCaps[normClaimed];

  if (cap !== undefined && amount > cap) {
    limitBreached = true;
    overageAmount = amount - cap;
    reasons.push(
      `Daily limit breach: amount ₹${amount.toLocaleString()} exceeds ₹${cap.toLocaleString()} cap for ${normClaimed} by ₹${overageAmount.toLocaleString()}`
    );
  }

  let categoryMismatch = false;
  if (extractedReceiptCategory && extractedReceiptCategory.trim()) {
    const normExtracted = extractedReceiptCategory.trim().toLowerCase();
    const isEquivalent =
      (normClaimed === "meals" && normExtracted === "food") ||
      (normClaimed === "food" && normExtracted === "meals");

    if (normClaimed !== normExtracted && !isEquivalent) {
      categoryMismatch = true;
      reasons.push(
        `Category mismatch: receipt OCR extracted '${extractedReceiptCategory}' expense, but claimed under '${claimedCategory}'`
      );
    }
  }

  return {
    hasBreach: limitBreached || categoryMismatch,
    limitBreached,
    categoryMismatch,
    capAmount: cap,
    overageAmount,
    claimedCategory: normClaimed,
    extractedCategory: extractedReceiptCategory,
    reasons,
  };
}

/**
 * 6. Multi-Signal Compounding Risk Calculation
 */
export type CSADRiskBand = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface CSADSignalItem {
  code: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  baseImpact: number;
  description: string;
}

export interface CSADRiskScoreResult {
  score: number;
  rawScore: number;
  band: CSADRiskBand;
  compoundingMultiplier: number;
  recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED";
  signalCount: number;
  signals: CSADSignalItem[];
}

export function calculateCompoundingRiskScore(signals: CSADSignalItem[]): CSADRiskScoreResult {
  if (!signals || signals.length === 0) {
    return {
      score: 0,
      rawScore: 0,
      band: "LOW",
      compoundingMultiplier: 1.0,
      recommendedAction: "APPROVE_RECOMMENDED",
      signalCount: 0,
      signals: [],
    };
  }

  let additiveScore = 0;
  for (const sig of signals) {
    additiveScore += sig.baseImpact;
  }

  // Multi-signal compounding formula:
  // For each additional signal beyond the first, compound by 15%
  const compoundingMultiplier = signals.length > 1 ? Number((1 + 0.15 * (signals.length - 1)).toFixed(2)) : 1.0;
  const rawScore = Math.round(additiveScore * compoundingMultiplier);
  const score = Math.min(100, Math.max(0, rawScore));

  let band: CSADRiskBand = "LOW";
  let recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED" = "APPROVE_RECOMMENDED";

  // Severity bands:
  // LOW: < 30
  // MEDIUM: 30 - 59
  // HIGH: 60 - 84
  // CRITICAL: >= 85
  if (score >= 85) {
    band = "CRITICAL";
    recommendedAction = "REJECT_RECOMMENDED";
  } else if (score >= 60) {
    band = "HIGH";
    recommendedAction = "MANUAL_REVIEW";
  } else if (score >= 30) {
    band = "MEDIUM";
    recommendedAction = "MANUAL_REVIEW";
  } else {
    band = "LOW";
    recommendedAction = "APPROVE_RECOMMENDED";
  }

  return {
    score,
    rawScore,
    band,
    compoundingMultiplier,
    recommendedAction,
    signalCount: signals.length,
    signals,
  };
}

/**
 * 7. Immutable Audit Trail & State Transitions & GST ITC Staging
 */
export type CSADClaimState = "SUBMITTED" | "APPROVED" | "REJECTED";

export interface AuditRecord {
  id: string;
  claimId: string;
  timestamp: string;
  actorType: "MANAGER" | "SYSTEM" | "EMPLOYEE";
  actorId: string;
  action: "CLAIM_SUBMITTED" | "CLAIM_APPROVED" | "CLAIM_REJECTED";
  previousState: CSADClaimState | null;
  newState: CSADClaimState;
  payloadDiff: Record<string, any>;
}

export interface CSADClaimRecord {
  claimId: string;
  employeeId: string;
  organizationId: string;
  amount: number;
  category: string;
  date: string;
  receiptUri: string;
  status: CSADClaimState;
  gstin?: string;
  managerId?: string;
  managerNotes?: string;
  auditTrail: AuditRecord[];
  itcStagedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export function createCSADClaim(payload: ClaimIntakePayload): CSADClaimRecord {
  const now = new Date().toISOString();
  const initialAudit: AuditRecord = {
    id: `aud_${Date.now()}_init`,
    claimId: payload.claimId,
    timestamp: now,
    actorType: "EMPLOYEE",
    actorId: payload.employeeId,
    action: "CLAIM_SUBMITTED",
    previousState: null,
    newState: "SUBMITTED",
    payloadDiff: {
      amount: payload.amount,
      category: payload.category,
      receiptUri: payload.receiptUri,
      date: payload.date,
    },
  };

  return {
    claimId: payload.claimId,
    employeeId: payload.employeeId,
    organizationId: payload.organizationId,
    amount: payload.amount,
    category: payload.category,
    date: payload.date,
    receiptUri: payload.receiptUri,
    status: "SUBMITTED",
    gstin: payload.gstin,
    auditTrail: [initialAudit],
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionClaimState(
  claim: CSADClaimRecord,
  targetState: "APPROVED" | "REJECTED",
  manager: { managerId?: string; notes?: string }
): { claim: CSADClaimRecord; auditEntry: AuditRecord } {
  // 1. Mandatory manager identity attribution
  if (!manager || !manager.managerId || !manager.managerId.trim()) {
    throw new Error("Manager identity attribution is required for state transitions");
  }

  // 2. Validate current state transition rules
  if (claim.status !== "SUBMITTED") {
    throw new Error(
      `Invalid state transition: cannot transition claim from '${claim.status}' to '${targetState}'. Only 'SUBMITTED' claims can be transitioned.`
    );
  }

  if (targetState !== "APPROVED" && targetState !== "REJECTED") {
    throw new Error(`Unsupported target state: '${targetState}'. Expected 'APPROVED' or 'REJECTED'.`);
  }

  const now = new Date().toISOString();
  const previousState = claim.status;
  const action = targetState === "APPROVED" ? "CLAIM_APPROVED" : "CLAIM_REJECTED";

  const auditEntry: AuditRecord = {
    id: `aud_${Date.now()}_${targetState.toLowerCase()}`,
    claimId: claim.claimId,
    timestamp: now,
    actorType: "MANAGER",
    actorId: manager.managerId.trim(),
    action,
    previousState,
    newState: targetState,
    payloadDiff: {
      status: { from: previousState, to: targetState },
      managerId: manager.managerId.trim(),
      notes: manager.notes || `Claim ${targetState.toLowerCase()} by manager`,
    },
  };

  const updatedClaim: CSADClaimRecord = {
    ...claim,
    status: targetState,
    managerId: manager.managerId.trim(),
    managerNotes: manager.notes,
    auditTrail: [...claim.auditTrail, auditEntry],
    updatedAt: now,
  };

  return { claim: updatedClaim, auditEntry };
}

/**
 * GST Input Tax Credit (ITC) Staging Calculation
 * Eligible categories receive 18% ITC staging if valid GSTIN is present.
 */
export interface GSTITCStagingResult {
  isEligible: boolean;
  eligibleCategory: boolean;
  hasValidGSTIN: boolean;
  itcRate: number;
  itcStagedAmount: number;
  ineligibleReason?: string;
}

export const ITC_ELIGIBLE_CATEGORIES = [
  "fuel",
  "lodging",
  "travel",
  "office_supplies",
  "food",
  "meals",
];

export function calculateGSTITCStaging(
  amount: number,
  category: string,
  isGSTINValid: boolean
): GSTITCStagingResult {
  const normCategory = category.trim().toLowerCase();
  const eligibleCategory = ITC_ELIGIBLE_CATEGORIES.includes(normCategory);

  if (!isGSTINValid) {
    return {
      isEligible: false,
      eligibleCategory,
      hasValidGSTIN: false,
      itcRate: 0.18,
      itcStagedAmount: 0,
      ineligibleReason: "Vendor GSTIN is missing or failed Modulo-36 checksum verification",
    };
  }

  if (!eligibleCategory) {
    return {
      isEligible: false,
      eligibleCategory: false,
      hasValidGSTIN: true,
      itcRate: 0.18,
      itcStagedAmount: 0,
      ineligibleReason: `Expense category '${category}' is not eligible for GST ITC staging under standard tax policy`,
    };
  }

  // 18% Input Tax Credit staging: (amount * 0.18) / 1.18 rounded to 2 decimal places
  const itcStagedAmount = Math.round(((amount * 0.18) / 1.18) * 100) / 100;

  return {
    isEligible: true,
    eligibleCategory: true,
    hasValidGSTIN: true,
    itcRate: 0.18,
    itcStagedAmount,
  };
}

/**
 * 8. CSAD Appliance Diagnostic Health Runner
 */
export interface CSADHealthReport {
  status: "HEALTHY" | "DEGRADED" | "FAILING";
  appliance: string;
  timestamp: string;
  subsystems: {
    intakeValidator: { status: "PASS" | "FAIL"; checksPassed: number };
    perceptualHashEngine: { status: "PASS" | "FAIL"; checksPassed: number };
    gstinChecksumEngine: { status: "PASS" | "FAIL"; checksPassed: number };
    anomalyEngine: { status: "PASS" | "FAIL"; checksPassed: number };
    policyEngine: { status: "PASS" | "FAIL"; checksPassed: number };
    riskScorer: { status: "PASS" | "FAIL"; checksPassed: number };
    auditStateMachine: { status: "PASS" | "FAIL"; checksPassed: number };
    itcStagingEngine: { status: "PASS" | "FAIL"; checksPassed: number };
  };
  metrics: {
    totalSubsystems: number;
    passedSubsystems: number;
    totalChecks: number;
    durationMs: number;
  };
}

export function runCSADDiagnostics(): CSADHealthReport {
  const startTime = Date.now();
  let totalChecks = 0;

  // 1. Intake Validator Check
  let intakePassed = 0;
  const validIntake = validateClaimSubmissionIntake({
    claimId: "CLM-DIAG-01",
    employeeId: "EMP-001",
    organizationId: "ORG-001",
    amount: 1250,
    category: "fuel",
    date: "2026-09-20",
    receiptUri: "/receipts/diag.jpg",
  });
  if (validIntake.isValid) intakePassed++;
  const invalidIntake = validateClaimSubmissionIntake({ amount: -100 });
  if (!invalidIntake.isValid) intakePassed++;
  totalChecks += 2;

  // 2. Perceptual Hash Engine Check
  let hashPassed = 0;
  const dist0 = computePerceptualHammingDistance("a1b2c3d4e5f60718", "a1b2c3d4e5f60718");
  if (dist0 === 0) hashPassed++;
  const dupCheck = detectDuplicateReceipt("a1b2c3d4e5f60718", [
    { claimId: "CLM-P1", hash: "a1b2c3d4e5f60718" },
  ]);
  if (dupCheck.matchType === "EXACT_DUPLICATE") hashPassed++;
  totalChecks += 2;

  // 3. GSTIN Checksum Engine Check
  let gstinPassed = 0;
  const karnatakaGST = verifyGSTINModulo36("29AAACI1681G1ZL");
  if (karnatakaGST.isValid && karnatakaGST.stateCode === "29") gstinPassed++;
  const invalidGstin = verifyGSTINModulo36("INVALID_GSTIN_123");
  if (!invalidGstin.isValid) gstinPassed++;
  totalChecks += 2;

  // 4. Anomaly Engine Check
  let anomPassed = 0;
  const anom2x = evaluateSpendAnomaly(5000, 2000); // 2.5x -> WARNING
  if (anom2x.severity === "WARNING") anomPassed++;
  const anom5x = evaluateSpendAnomaly(12000, 2000); // 6x -> SEVERE
  if (anom5x.severity === "SEVERE") anomPassed++;
  totalChecks += 2;

  // 5. Policy Engine Check
  let polPassed = 0;
  const polFuelBreach = evaluatePolicyLimits("fuel", 6500);
  if (polFuelBreach.hasBreach && polFuelBreach.limitBreached) polPassed++;
  const polMismatch = evaluatePolicyLimits("fuel", 1000, "food");
  if (polMismatch.categoryMismatch) polPassed++;
  totalChecks += 2;

  // 6. Risk Scorer Check
  let riskPassed = 0;
  const riskLow = calculateCompoundingRiskScore([]);
  if (riskLow.band === "LOW" && riskLow.score === 0) riskPassed++;
  const riskCrit = calculateCompoundingRiskScore([
    { code: "DUP", severity: "HIGH", baseImpact: 45, description: "Duplicate" },
    { code: "SEV_ANOM", severity: "HIGH", baseImpact: 35, description: "Severe Anomaly" },
    { code: "POL_BREACH", severity: "HIGH", baseImpact: 25, description: "Policy Breach" },
  ]);
  if (riskCrit.band === "CRITICAL" && riskCrit.score >= 85) riskPassed++;
  totalChecks += 2;

  // 7. Audit State Machine Check
  let statePassed = 0;
  const testClaim = createCSADClaim({
    claimId: "CLM-DIAG-ST",
    employeeId: "EMP-01",
    organizationId: "ORG-01",
    amount: 1500,
    category: "fuel",
    date: "2026-09-20",
    receiptUri: "/rcpt.jpg",
  });
  if (testClaim.status === "SUBMITTED") statePassed++;
  const { claim: approvedClaim } = transitionClaimState(testClaim, "APPROVED", {
    managerId: "MGR-01",
    notes: "Verified",
  });
  if (approvedClaim.status === "APPROVED" && approvedClaim.auditTrail.length === 2) statePassed++;
  totalChecks += 2;

  // 8. ITC Staging Check
  let itcPassed = 0;
  const itcRes = calculateGSTITCStaging(1180, "fuel", true);
  if (itcRes.isEligible && itcRes.itcStagedAmount === 180) itcPassed++;
  totalChecks += 1;

  const subsystems = {
    intakeValidator: { status: (intakePassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: intakePassed },
    perceptualHashEngine: { status: (hashPassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: hashPassed },
    gstinChecksumEngine: { status: (gstinPassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: gstinPassed },
    anomalyEngine: { status: (anomPassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: anomPassed },
    policyEngine: { status: (polPassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: polPassed },
    riskScorer: { status: (riskPassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: riskPassed },
    auditStateMachine: { status: (statePassed === 2 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: statePassed },
    itcStagingEngine: { status: (itcPassed === 1 ? "PASS" : "FAIL") as "PASS" | "FAIL", checksPassed: itcPassed },
  };

  const allPassed = Object.values(subsystems).every((s) => s.status === "PASS");

  return {
    status: allPassed ? "HEALTHY" : "DEGRADED",
    appliance: "CSAD-ClaimGuard-v1",
    timestamp: new Date().toISOString(),
    subsystems,
    metrics: {
      totalSubsystems: Object.keys(subsystems).length,
      passedSubsystems: Object.values(subsystems).filter((s) => s.status === "PASS").length,
      totalChecks,
      durationMs: Date.now() - startTime,
    },
  };
}
