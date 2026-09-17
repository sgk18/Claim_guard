export type ClaimStatus =
  | "PENDING"
  | "PROCESSING"
  | "ACTION_REQUIRED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "FAILED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ExpenseCategory = "fuel" | "food" | "travel" | "lodging" | "misc";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  companyId: string;
  historicalClaimCount: number;
  historicalClaimAvg: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

export interface Receipt {
  id: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey: string;
  perceptualHash?: string;
  rawOcrText?: string;
  createdAt: string;
}

export interface FraudSignal {
  id: string;
  claimId: string;
  type:
    | "DUPLICATE_RECEIPT"
    | "NEAR_DUPLICATE"
    | "AMOUNT_ANOMALY"
    | "POLICY_VIOLATION"
    | "DATE_MISMATCH"
    | "CATEGORY_MISMATCH"
    | "GST_INCONSISTENCY"
    | "MULTIPLE_SIGNALS";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  scoreImpact: number;
  description: string;
  matchedClaimId?: string;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  claimId: string;
  score: number; // 0–100
  level: RiskLevel;
  summary: string;
  recommendedAction: "APPROVE_RECOMMENDED" | "REJECT_RECOMMENDED" | "REVIEW_RECOMMENDED";
  signals: FraudSignal[];
  rulesTriggered: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  claimId: string;
  actorType: "EMPLOYEE" | "MANAGER" | "SYSTEM_OCR" | "SYSTEM_FRAUD_ENGINE" | "SYSTEM_AI";
  actorId?: string;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Claim {
  id: string;
  employeeId: string;
  companyId: string;
  vendorName: string;
  amount: number;
  currency: string;
  claimDate: string;
  category: ExpenseCategory;
  gstin?: string;
  status: ClaimStatus;
  managerNotes?: string;
  employeeNotes?: string;
  receipt?: Receipt;
  riskAssessment?: RiskAssessment;
  auditLogs?: AuditLog[];
  employee?: Employee;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedReceiptData {
  vendorName: string;
  amount: number;
  currency: string;
  date: string;
  category: ExpenseCategory;
  gstin?: string;
  lineItems?: Array<{ description: string; amount: number }>;
  confidence: {
    vendor: number;
    amount: number;
    date: number;
    overall: number;
  };
  needsReview: boolean;
}
