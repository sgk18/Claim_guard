export type ClaimStatus =
  | "DRAFT"
  | "PROCESSING"
  | "PENDING"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "FAILED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ExpenseCategory = "fuel" | "food" | "travel" | "lodging" | "misc";

export type SignalType =
  | "DUPLICATE_RECEIPT"
  | "AMOUNT_ANOMALY"
  | "DATE_MISMATCH"
  | "CATEGORY_MISMATCH"
  | "POLICY_VIOLATION"
  | "GSTIN_SIGNAL"
  | "WEEKEND_CLAIM"
  | "LOW_OCR_CONFIDENCE";

export type SignalSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Company {
  id: string;
  name: string;
  code?: string;
  gstin?: string;
  currency: string;
  createdAt: string;
}

export interface Manager {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  historicalClaimCount: number;
  historicalClaimAvg: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  companyId: string;
  category: ExpenseCategory;
  maxSingleClaim: number;
  dailyCap?: number;
  requiresGstin: boolean;
  description: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  claimId: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  imageHash: string; // Perceptual dHash / sha256
  rawOcrText?: string;
  ocrConfidence: {
    vendorName: number;
    amount: number;
    date: number;
    category: number;
    gstin?: number;
  };
  createdAt: string;
}

export interface FraudSignal {
  id: string;
  claimId: string;
  type: SignalType;
  severity: SignalSeverity;
  scoreImpact: number;
  description: string;
  confidence: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  claimId: string;
  score: number; // 0 - 100
  level: RiskLevel;
  recommendedAction: "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REJECT_RECOMMENDED";
  summary: string;
  rulesTriggered: string[];
  signals: FraudSignal[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  claimId: string;
  actorType: "EMPLOYEE" | "SYSTEM_OCR" | "SYSTEM_FRAUD_ENGINE" | "MANAGER";
  actorId: string;
  action:
    | "CLAIM_CREATED"
    | "RECEIPT_UPLOADED"
    | "OCR_COMPLETED"
    | "FRAUD_EVALUATED"
    | "CLAIM_SUBMITTED"
    | "CLAIM_APPROVED"
    | "CLAIM_REJECTED";
  details: Record<string, any>;
  createdAt: string;
}

export interface Trip {
  id: string;
  employeeId: string;
  title: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED";
  createdAt: string;
}

export interface Message {
  id: string;
  claimId?: string;
  employeeId: string;
  sender: "EMPLOYEE" | "CLAIMGUARD_BOT";
  content: string;
  messageType: "TEXT" | "IMAGE_PROMPT" | "EXTRACTED_CARD" | "STATUS_UPDATE" | "ACTION_BUTTONS";
  payload?: any;
  createdAt: string;
}

export interface Claim {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: Employee;
  tripId?: string;
  trip?: Trip;
  receipt?: Receipt;
  status: ClaimStatus;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  vendorName: string;
  claimDate: string;
  gstin?: string;
  managerId?: string;
  managerNotes?: string;
  riskAssessment?: RiskAssessment;
  auditLogs?: AuditLog[];
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
  confidence: {
    vendorName: number;
    amount: number;
    date: number;
    category: number;
    gstin?: number;
  };
  rawText?: string;
  needsReview: boolean;
}

export interface ManagerStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  highRiskClaims: number;
  potentialFraudDetectedAmount: number;
  potentialGstItcAmount: number;
  avgProcessingHours: number;
}
