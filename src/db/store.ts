import { Claim, Employee, Policy, Trip, Company, Manager, AuditLog, ManagerStats, ExtractedReceiptData } from "@/types";
import { SEED_COMPANY, SEED_MANAGER, SEED_EMPLOYEES, SEED_POLICIES, SEED_TRIPS, generateSeedClaims } from "./seed";

class DatabaseStore {
  public company: Company = SEED_COMPANY;
  public manager: Manager = SEED_MANAGER;
  public employees: Map<string, Employee> = new Map();
  public policies: Map<string, Policy> = new Map();
  public trips: Map<string, Trip> = new Map();
  public claims: Map<string, Claim> = new Map();
  public drafts: Map<string, { receipt: any; extracted: ExtractedReceiptData }> = new Map();

  private initialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.initialized) return;

    for (const emp of SEED_EMPLOYEES) {
      this.employees.set(emp.id, emp);
    }
    for (const pol of SEED_POLICIES) {
      this.policies.set(pol.id, pol);
    }
    for (const trp of SEED_TRIPS) {
      this.trips.set(trp.id, trp);
    }

    const seedClaims = generateSeedClaims();
    for (const clm of seedClaims) {
      // Enrich with employee reference
      if (!clm.employee && clm.employeeId) {
        clm.employee = this.employees.get(clm.employeeId);
      }
      if (!clm.trip && clm.tripId) {
        clm.trip = this.trips.get(clm.tripId);
      }
      this.claims.set(clm.id, clm);
    }

    this.initialized = true;
  }

  public getClaims(): Claim[] {
    return Array.from(this.claims.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getClaimById(id: string): Claim | undefined {
    const claim = this.claims.get(id);
    if (!claim) return undefined;
    if (!claim.employee && claim.employeeId) {
      claim.employee = this.employees.get(claim.employeeId);
    }
    if (!claim.trip && claim.tripId) {
      claim.trip = this.trips.get(claim.tripId);
    }
    return claim;
  }

  public getEmployeeById(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  public getClaimsByEmployee(employeeId: string): Claim[] {
    return this.getClaims().filter((c) => c.employeeId === employeeId);
  }

  public getPolicyByCategory(category: string): Policy | undefined {
    return Array.from(this.policies.values()).find((p) => p.category === category);
  }

  public getActiveTripForEmployee(employeeId: string): Trip | undefined {
    return Array.from(this.trips.values()).find(
      (t) => t.employeeId === employeeId && t.status === "ACTIVE"
    );
  }

  public saveDraft(draftId: string, data: { receipt: any; extracted: ExtractedReceiptData }) {
    this.drafts.set(draftId, data);
  }

  public getDraft(draftId: string) {
    return this.drafts.get(draftId);
  }

  public saveClaim(claim: Claim): Claim {
    if (!claim.employee && claim.employeeId) {
      claim.employee = this.employees.get(claim.employeeId);
    }
    this.claims.set(claim.id, claim);
    return claim;
  }

  public addAuditLog(claimId: string, log: AuditLog) {
    const claim = this.claims.get(claimId);
    if (claim) {
      if (!claim.auditLogs) claim.auditLogs = [];
      claim.auditLogs.push(log);
    }
  }

  public getManagerStats(): ManagerStats {
    const all = Array.from(this.claims.values());
    const pending = all.filter((c) => c.status === "PENDING" || c.status === "REVIEW_REQUIRED").length;
    const approved = all.filter((c) => c.status === "APPROVED").length;
    const rejected = all.filter((c) => c.status === "REJECTED").length;
    const highRisk = all.filter(
      (c) => c.riskAssessment?.level === "HIGH" || c.riskAssessment?.level === "CRITICAL"
    ).length;

    // Potential fraud amount = sum of rejected or critical claims
    const fraudAmt = all
      .filter((c) => c.status === "REJECTED" || c.riskAssessment?.level === "CRITICAL")
      .reduce((acc, c) => acc + c.amount, 0);

    // Potential GST ITC = ~18% on approved claims with valid GSTIN
    const itcAmt = all
      .filter((c) => c.status === "APPROVED" && c.gstin)
      .reduce((acc, c) => acc + (c.amount * 0.18) / 1.18, 0);

    return {
      totalClaims: all.length,
      pendingClaims: pending,
      approvedClaims: approved,
      rejectedClaims: rejected,
      highRiskClaims: highRisk,
      potentialFraudDetectedAmount: Math.round(fraudAmt),
      potentialGstItcAmount: Math.round(itcAmt),
      avgProcessingHours: 2.1,
    };
  }
}

// Global singleton pattern in Next.js development
const globalForDb = global as unknown as { dbStore: DatabaseStore };
export const db = globalForDb.dbStore || new DatabaseStore();
if (process.env.NODE_ENV !== "production") globalForDb.dbStore = db;
