import { Claim, Employee, AuditLog, ClaimStatus } from "../types/index.js";

export interface IClaimRepository {
  getClaims(): Promise<Claim[]>;
  getClaimById(id: string): Promise<Claim | null>;
  createClaim(claim: Claim): Promise<Claim>;
  /** Persist edits made to an already-loaded claim (vendor, amount, notes, status...). */
  saveClaim(claim: Claim): Promise<void>;
  updateClaimStatus(id: string, status: ClaimStatus, managerNotes?: string): Promise<Claim | null>;
  getEmployee(id: string): Promise<Employee | null>;
  getEmployeeClaims(employeeId: string): Promise<Claim[]>;
  addAuditLog(claimId: string, log: AuditLog): Promise<void>;
  getHistoricalClaimsForComparison(): Promise<Array<{ id: string; amount: number; vendorName: string; perceptualHash?: string; claimDate: string }>>;
}

export class InMemoryClaimRepository implements IClaimRepository {
  private claims: Map<string, Claim> = new Map();
  private employees: Map<string, Employee> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Employees
    const emps: Employee[] = [
      { id: "emp_rahul_102", name: "Rahul Kumar", email: "rahul.k@apexlogistics.in", phone: "+919876543210", role: "Field Sales Representative", department: "Regional Sales", companyId: "comp_apex_01", historicalClaimCount: 38, historicalClaimAvg: 1850 },
      { id: "emp_ananya_103", name: "Ananya Iyer", email: "ananya.i@apexlogistics.in", phone: "+919876543211", role: "Site Quality Auditor", department: "Operations", companyId: "comp_apex_01", historicalClaimCount: 42, historicalClaimAvg: 2400 },
      { id: "emp_vikram_104", name: "Vikram Singh", email: "vikram.s@apexlogistics.in", phone: "+919876543212", role: "Fleet Logistics Lead", department: "Fleet Management", companyId: "comp_apex_01", historicalClaimCount: 55, historicalClaimAvg: 3100 },
      { id: "emp_sneha_105", name: "Sneha Patel", email: "sneha.p@apexlogistics.in", role: "Field Service Engineer", department: "Engineering", companyId: "comp_apex_01", historicalClaimCount: 29, historicalClaimAvg: 2150 },
      { id: "emp_rohit_106", name: "Rohit Verma", email: "rohit.v@apexlogistics.in", role: "Territory Manager", department: "Commercial", companyId: "comp_apex_01", historicalClaimCount: 64, historicalClaimAvg: 3800 },
      { id: "emp_meera_107", name: "Meera Nair", email: "meera.n@apexlogistics.in", role: "Supply Chain Analyst", department: "Procurement", companyId: "comp_apex_01", historicalClaimCount: 19, historicalClaimAvg: 1650 },
      { id: "emp_arjun_108", name: "Arjun Reddy", email: "arjun.r@apexlogistics.in", role: "Senior Route Supervisor", department: "Fleet Management", companyId: "comp_apex_01", historicalClaimCount: 47, historicalClaimAvg: 2900 },
      { id: "emp_pooja_109", name: "Pooja Das", email: "pooja.d@apexlogistics.in", role: "Operations Associate", department: "Logistics Support", companyId: "comp_apex_01", historicalClaimCount: 15, historicalClaimAvg: 1200 },
      { id: "emp_karan_110", name: "Karan Malhotra", email: "karan.m@apexlogistics.in", role: "Regional Auditor", department: "Compliance", companyId: "comp_apex_01", historicalClaimCount: 31, historicalClaimAvg: 2600 },
      { id: "emp_divya_111", name: "Divya Joshi", email: "divya.j@apexlogistics.in", role: "Client Operations Lead", department: "Client Services", companyId: "comp_apex_01", historicalClaimCount: 22, historicalClaimAvg: 2050 },
    ];
    emps.forEach((e) => this.employees.set(e.id, e));

    // 2. Baseline Claim for Duplicate Comparison
    const baselineClaim: Claim = {
      id: "CLM-3108",
      employeeId: "emp_vikram_104",
      companyId: "comp_apex_01",
      vendorName: "Indian Oil Corporation Ltd",
      amount: 3850,
      currency: "INR",
      claimDate: "2026-09-02",
      category: "fuel",
      gstin: "29AAACI1681G1Z1",
      status: "APPROVED",
      managerNotes: "Approved routine monthly route fuel bill.",
      createdAt: "2026-09-02T10:30:00Z",
      updatedAt: "2026-09-02T14:15:00Z",
      receipt: {
        id: "rcpt_3108",
        claimId: "CLM-3108",
        fileName: "indian_oil_sep02.jpg",
        fileUrl: "/receipts/demo_indian_oil.jpg",
        fileSizeBytes: 245000,
        mimeType: "image/jpeg",
        storageKey: "receipts/demo_indian_oil.jpg",
        perceptualHash: "a1b2c3d4e5f60000",
        rawOcrText: "INDIAN OIL CORP LTD\nDate: 02/09/2026\nTotal: INR 3,850",
        createdAt: "2026-09-02T10:30:00Z",
      },
      employee: emps[2],
      riskAssessment: {
        id: "risk_3108",
        claimId: "CLM-3108",
        score: 10,
        level: "LOW",
        summary: "Clean verified fuel invoice matching travel schedule.",
        recommendedAction: "APPROVE_RECOMMENDED",
        signals: [],
        rulesTriggered: [],
        createdAt: "2026-09-02T10:31:00Z",
      },
      auditLogs: [
        { id: "aud_1", claimId: "CLM-3108", actorType: "EMPLOYEE", action: "CLAIM_SUBMITTED", createdAt: "2026-09-02T10:30:00Z" },
        { id: "aud_2", claimId: "CLM-3108", actorType: "MANAGER", action: "CLAIM_APPROVED", details: { note: "Approved routine fuel." }, createdAt: "2026-09-02T14:15:00Z" },
      ],
    };
    this.claims.set(baselineClaim.id, baselineClaim);

    // 3. Suspected Duplicate Claim
    const dupClaim: Claim = {
      id: "CLM-4471",
      employeeId: "emp_rahul_102",
      companyId: "comp_apex_01",
      vendorName: "Indian Oil Corporation Ltd",
      amount: 3850,
      currency: "INR",
      claimDate: "2026-09-17",
      category: "fuel",
      gstin: "29AAACI1681G1Z1",
      status: "REVIEW_REQUIRED",
      createdAt: "2026-09-17T09:15:00Z",
      updatedAt: "2026-09-17T09:16:00Z",
      receipt: {
        id: "rcpt_4471",
        claimId: "CLM-4471",
        fileName: "fuel_bill_resubmitted.jpg",
        fileUrl: "/receipts/demo_indian_oil.jpg",
        fileSizeBytes: 245000,
        mimeType: "image/jpeg",
        storageKey: "receipts/demo_indian_oil.jpg",
        perceptualHash: "a1b2c3d4e5f60000",
        rawOcrText: "INDIAN OIL CORP LTD\nDate: 02/09/2026\nTotal: INR 3,850",
        createdAt: "2026-09-17T09:15:00Z",
      },
      employee: emps[0],
      riskAssessment: {
        id: "risk_4471",
        claimId: "CLM-4471",
        score: 85,
        level: "CRITICAL",
        summary: "Perceptual duplicate detected matching historical claim CLM-3108 (Vikram Singh, INR 3,850). Duplicate bill resubmission suspected.",
        recommendedAction: "REJECT_RECOMMENDED",
        signals: [
          {
            id: "sig_dup_1",
            claimId: "CLM-4471",
            type: "DUPLICATE_RECEIPT",
            severity: "CRITICAL",
            scoreImpact: 40,
            description: "Identical image fingerprint to approved claim CLM-3108.",
            matchedClaimId: "CLM-3108",
            createdAt: "2026-09-17T09:15:30Z",
          },
          {
            id: "sig_anom_1",
            claimId: "CLM-4471",
            type: "AMOUNT_ANOMALY",
            severity: "HIGH",
            scoreImpact: 15,
            description: "Amount of INR 3,850 exceeds employee average by 208%.",
            createdAt: "2026-09-17T09:15:30Z",
          },
        ],
        rulesTriggered: ["DUPLICATE_RECEIPT", "AMOUNT_ANOMALY"],
        createdAt: "2026-09-17T09:15:35Z",
      },
      auditLogs: [
        { id: "aud_3", claimId: "CLM-4471", actorType: "EMPLOYEE", action: "CLAIM_SUBMITTED", createdAt: "2026-09-17T09:15:00Z" },
        { id: "aud_4", claimId: "CLM-4471", actorType: "SYSTEM_FRAUD_ENGINE", action: "RISK_EVALUATED", details: { score: 85, level: "CRITICAL" }, createdAt: "2026-09-17T09:15:35Z" },
      ],
    };
    this.claims.set(dupClaim.id, dupClaim);

    // 4. Generate 50+ claims across categories
    const vendors = [
      { name: "HP Fuel Station — Hebbal", cat: "fuel" as const, avg: 2200, gstin: "29AABCH1234F1Z3" },
      { name: "The Taj Gateway Hotel", cat: "lodging" as const, avg: 6500, gstin: "29AAACT5566G1Z2" },
      { name: "Bikanervala Sweets & Dining", cat: "food" as const, avg: 850, gstin: "07AAACB1122J1Z8" },
      { name: "Blue Dart Express Logistics", cat: "misc" as const, avg: 1400, gstin: "27AAACB3344K1Z4" },
      { name: "Ola Corporate Fleet", cat: "travel" as const, avg: 980, gstin: "29AAAC09988H1Z1" },
    ];

    const statuses: ClaimStatus[] = ["APPROVED", "APPROVED", "REVIEW_REQUIRED", "PENDING", "REJECTED"];

    for (let i = 1; i <= 50; i++) {
      const id = `CLM-${5000 + i}`;
      const v = vendors[i % vendors.length];
      const emp = emps[i % emps.length];
      const status = statuses[i % statuses.length];
      const score = status === "REJECTED" ? 75 : status === "REVIEW_REQUIRED" ? 45 : 15;
      const level = score > 60 ? "HIGH" : score > 30 ? "MEDIUM" : "LOW";

      const c: Claim = {
        id,
        employeeId: emp.id,
        companyId: emp.companyId,
        vendorName: v.name,
        amount: Math.round(v.avg * (0.8 + (i % 5) * 0.1)),
        currency: "INR",
        claimDate: `2026-09-${String(Math.max(1, (i % 17) + 1)).padStart(2, "0")}`,
        category: v.cat,
        gstin: v.gstin,
        status,
        managerNotes: status === "APPROVED" ? "Verified and approved." : status === "REJECTED" ? "Receipt disallowed." : undefined,
        createdAt: `2026-09-${String(Math.max(1, (i % 17) + 1)).padStart(2, "0")}T08:00:00Z`,
        updatedAt: `2026-09-${String(Math.max(1, (i % 17) + 1)).padStart(2, "0")}T12:00:00Z`,
        employee: emp,
        receipt: {
          id: `rcpt_${id}`,
          claimId: id,
          fileName: `${v.cat}_bill_${id}.jpg`,
          fileUrl: "/receipts/demo_indian_oil.jpg",
          fileSizeBytes: 180000 + (i * 1200),
          mimeType: "image/jpeg",
          storageKey: `receipts/${id}.jpg`,
          perceptualHash: `hash_${i}_00000000`,
          createdAt: `2026-09-${String(Math.max(1, (i % 17) + 1)).padStart(2, "0")}T08:00:00Z`,
        },
        riskAssessment: {
          id: `risk_${id}`,
          claimId: id,
          score,
          level,
          summary: `Automated assessment completed. Score: ${score}/100.`,
          recommendedAction: score > 60 ? "REJECT_RECOMMENDED" : score > 30 ? "REVIEW_RECOMMENDED" : "APPROVE_RECOMMENDED",
          signals: score > 30 ? [{
            id: `sig_${id}_1`,
            claimId: id,
            type: "AMOUNT_ANOMALY",
            severity: level,
            scoreImpact: score,
            description: "Expense verified against policy ceilings.",
            createdAt: `2026-09-17T08:00:00Z`,
          }] : [],
          rulesTriggered: score > 30 ? ["AMOUNT_ANOMALY"] : [],
          createdAt: `2026-09-17T08:00:00Z`,
        },
        auditLogs: [
          { id: `aud_${id}_1`, claimId: id, actorType: "EMPLOYEE", action: "CLAIM_SUBMITTED", createdAt: `2026-09-17T08:00:00Z` },
        ],
      };
      this.claims.set(id, c);
    }
  }

  async getClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getClaimById(id: string): Promise<Claim | null> {
    return this.claims.get(id) || null;
  }

  async createClaim(claim: Claim): Promise<Claim> {
    this.claims.set(claim.id, claim);
    return claim;
  }

  async saveClaim(claim: Claim): Promise<void> {
    this.claims.set(claim.id, claim);
  }

  async updateClaimStatus(id: string, status: ClaimStatus, managerNotes?: string): Promise<Claim | null> {
    const claim = this.claims.get(id);
    if (!claim) return null;
    claim.status = status;
    if (managerNotes) claim.managerNotes = managerNotes;
    claim.updatedAt = new Date().toISOString();
    return claim;
  }

  async getEmployee(id: string): Promise<Employee | null> {
    return this.employees.get(id) || null;
  }

  async getEmployeeClaims(employeeId: string): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter((c) => c.employeeId === employeeId);
  }

  async addAuditLog(claimId: string, log: AuditLog): Promise<void> {
    const claim = this.claims.get(claimId);
    if (claim) {
      if (!claim.auditLogs) claim.auditLogs = [];
      claim.auditLogs.push(log);
    }
  }

  async getHistoricalClaimsForComparison() {
    return Array.from(this.claims.values()).map((c) => ({
      id: c.id,
      amount: c.amount,
      vendorName: c.vendorName,
      perceptualHash: c.receipt?.perceptualHash,
      claimDate: c.claimDate,
    }));
  }
}
