export type ClaimStatus =
  | "DRAFT"
  | "PENDING"
  | "PROCESSING"
  | "ACTION_REQUIRED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "CLARIFICATION_REQUESTED"
  | "FAILED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AuthenticityState =
  | "VERIFIED"
  | "LIKELY VALID"
  | "REVIEW REQUIRED"
  | "SUSPICIOUS"
  | "UNABLE TO VERIFY";

export type ExpenseCategory =
  | "MEALS"
  | "FUEL"
  | "HOTEL"
  | "TRAVEL"
  | "MISC"
  | "fuel"
  | "food"
  | "lodging"
  | "travel"
  | "misc";

export type Role = "MANAGER" | "EMPLOYEE" | "ADMIN";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: string;
  gstin?: string;
  activeJoinCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

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

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  department: string;
  status: "ACTIVE" | "SUSPENDED" | "REMOVED";
  profile?: Profile;
  joinedAt: string;
}

export interface JoinCode {
  id: string;
  organizationId: string;
  code: string; // e.g. CG-7K4P9X
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  maxUses: number;
  timesUsed: number;
  expiresAt: string;
  createdBy?: string;
  createdAt: string;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  organizationId: string;
  role: Role;
  profile: Profile;
  organization: Organization;
  expiresAt: string;
  createdAt: string;
}

export interface ReceiptLineItem {
  item?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  amount: number;
}

export interface Receipt {
  id: string;
  claimId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  storageKey: string;
  imageHash?: string;
  perceptualHash?: string;
  rawOcrText?: string;
  ocrConfidence?: Record<string, number>;
  lineItems?: ReceiptLineItem[];
  createdAt: string;
}

export interface ExtractedReceiptData {
  vendorName: string;
  amount: number;
  currency: string;
  date: string;
  category: any;
  gstin?: string;
  lineItems: ReceiptLineItem[];
  ocrConfidence: number; // 0.0 - 1.0
  inconsistencies: string[];
  rawText?: string;
  confidence?: Record<string, number>;
  needsReview?: boolean;
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
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  claimId: string;
  score: number; // 0–100
  level: RiskLevel;
  authenticityState?: AuthenticityState;
  recommendedAction:
    | "APPROVE"
    | "REJECT"
    | "REVIEW"
    | "CLARIFICATION"
    | "APPROVE_RECOMMENDED"
    | "REJECT_RECOMMENDED"
    | "REVIEW_RECOMMENDED";
  summary: string;
  aiNarrative?: string;
  signals: FraudSignal[];
  rulesTriggered: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId?: string;
  claimId?: string;
  actorType: "EMPLOYEE" | "MANAGER" | "SYSTEM" | "SYSTEM_OCR" | "SYSTEM_FRAUD_ENGINE" | "SYSTEM_AI";
  actorId?: string;
  actorName?: string;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Claim {
  id: string;
  organizationId?: string;
  companyId?: string;
  employeeId: string;
  employeeName?: string;
  vendorName: string;
  amount: number;
  currency: string;
  claimDate: string;
  category: ExpenseCategory;
  gstin?: string;
  status: ClaimStatus;
  managerNotes?: string;
  employeeNotes?: string;
  rejectionReason?: string;
  employee?: Employee;
  receipt?: Receipt;
  riskAssessment?: RiskAssessment;
  auditLogs?: AuditLog[];
  matchedClaim?: Claim;
  createdAt: string;
  updatedAt: string;
}
