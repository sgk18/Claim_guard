import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildServer } from "../dist/app.js";

describe("ClaimGuard Standalone Fastify Server Integration Tests", async () => {
  const server = buildServer();

  test("GET /health returns healthy status and uptime", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.status, "HEALTHY");
    assert.equal(body.service, "claimguard-server");
  });

  test("GET /ready returns subsystem readiness", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/ready",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.ready, true);
    assert.equal(body.database, "CONNECTED");
    assert.equal(body.fraudEngine, "READY");
  });

  // Organization & Join Code Tests
  test("POST /api/v1/organizations creates organization, manager profile, and active join code", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/organizations",
      payload: {
        name: "Zenith Field Services",
        managerName: "Vikram Malhotra",
        email: "vikram@zenith.example.com",
        phone: "+919876500001",
        currency: "INR",
      },
    });

    assert.equal(response.statusCode, 201);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.organization.name, "Zenith Field Services");
    assert.ok(body.data.joinCode.code.startsWith("CG-"));
    assert.equal(body.data.session.role, "MANAGER");
    assert.ok(body.data.session.token.startsWith("cg_sess_"));
  });

  test("POST /api/v1/organizations/join validates join code and creates employee session", async () => {
    // 1. Join using the pre-seeded ABC Technologies join code: CG-7K4P9X
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/organizations/join",
      payload: {
        code: "CG-7K4P9X",
        employeeName: "Sanjay Singhania",
        email: "sanjay@abctech.example.com",
        phone: "+919812300002",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.session.role, "EMPLOYEE");
    assert.equal(body.data.session.profile.fullName, "Sanjay Singhania");
    assert.equal(body.data.organization.slug, "abc-tech");
  });

  test("POST /api/v1/organizations/join rejects invalid join code", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/organizations/join",
      payload: {
        code: "INVALID-CODE",
        employeeName: "Hacker User",
      },
    });

    assert.equal(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert.equal(body.success, false);
  });

  test("POST /api/v1/organizations/join-code/regenerate creates fresh join code", async () => {
    const orgId = "a0000000-0000-0000-0000-000000000001";
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/organizations/join-code/regenerate",
      payload: {
        organizationId: orgId,
      },
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.ok(body.data.code.startsWith("CG-"));
    assert.equal(body.data.status, "ACTIVE");
  });

  test("GET /api/v1/organizations/:id/employees returns member list", async () => {
    const orgId = "a0000000-0000-0000-0000-000000000001";
    const response = await server.inject({
      method: "GET",
      url: `/api/v1/organizations/${orgId}/employees`,
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 2);
  });

  // Claim Lifecycle Tests
  test("GET /api/v1/claims returns pre-seeded claims queue", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/claims",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.ok(body.count >= 50);
  });

  test("GET /api/v1/claims/CLM-4471 retrieves suspected duplicate with evidence", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/claims/CLM-4471",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.id, "CLM-4471");
    assert.equal(body.data.riskAssessment.level, "CRITICAL");
    assert.ok(body.data.riskAssessment.score >= 80);
    assert.ok(body.data.matchedClaim !== undefined);
  });

  test("POST /api/v1/claims evaluates clean claim and sets low risk with evidence state", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/claims",
      payload: {
        employeeId: "emp_rahul_102",
        vendorName: "Bharat Petroleum Fuel Station",
        amount: 1450,
        claimDate: "2026-09-17",
        category: "FUEL",
        gstin: "29AAACB1234D1Z2",
      },
    });

    assert.equal(response.statusCode, 201);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.riskAssessment.level, "LOW");
    assert.equal(body.data.riskAssessment.authenticityState, "VERIFIED");
    assert.ok(body.data.riskAssessment.score < 30);
  });

  test("POST /api/v1/claims/:id/confirm allows employee to verify receipt data", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/claims/CLM-4471/confirm",
      payload: {
        vendorName: "Indian Oil Corporation Ltd - Verified",
        amount: 3850,
      },
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.vendorName, "Indian Oil Corporation Ltd - Verified");
  });

  test("POST /api/v1/claims/:id/approve records manager clearance", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/claims/CLM-4471/approve",
      payload: {
        managerId: "mgr_priya_01",
        notes: "Approved exception with supervisor authorization.",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.status, "APPROVED");
  });

  test("POST /api/v1/claims/:id/reject disallows claim and logs reason", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/claims/CLM-4471/reject",
      payload: {
        managerId: "mgr_priya_01",
        reason: "Duplicate bill resubmitted; original bill CLM-3108 already reimbursed.",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.status, "REJECTED");
  });

  test("GET /api/v1/claims/:id/audit returns append-only audit trail", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/v1/claims/CLM-4471/audit",
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 2);
  });
});
