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

export type ExpenseCategory = "MEALS" | "FUEL" | "HOTEL" | "TRAVEL" | "MISC";

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
  item: string;
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
  category: ExpenseCategory;
  gstin?: string;
  lineItems: ReceiptLineItem[];
  ocrConfidence: number; // 0.0 - 1.0
  inconsistencies: string[];
  rawText?: string;
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
  authenticityState: AuthenticityState;
  recommendedAction: "APPROVE" | "REJECT" | "REVIEW" | "CLARIFICATION";
  summary: string;
  aiNarrative?: string;
  signals: FraudSignal[];
  rulesTriggered: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  claimId?: string;
  actorType: "EMPLOYEE" | "MANAGER" | "SYSTEM";
  actorId: string;
  actorName?: string;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Claim {
  id: string;
  organizationId: string;
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
  receipt?: Receipt;
  riskAssessment?: RiskAssessment;
  createdAt: string;
  updatedAt: string;
}
