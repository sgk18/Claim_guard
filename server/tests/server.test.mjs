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

  test("POST /api/v1/claims evaluates clean claim and sets low risk", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/claims",
      payload: {
        employeeId: "emp_rahul_102",
        vendorName: "Bharat Petroleum Fuel Station",
        amount: 1450,
        claimDate: "2026-09-17",
        category: "fuel",
        gstin: "29AAACB1234D1Z2",
      },
    });

    assert.equal(response.statusCode, 201);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.riskAssessment.level, "LOW");
    assert.ok(body.data.riskAssessment.score < 30);
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
        notes: "Visual duplicate of fuel receipt. Disallowed.",
      },
    });

    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.success, true);
    assert.equal(body.data.status, "REJECTED");
  });

  test("GET /api/v1/claims/:id/audit returns immutable audit logs", async () => {
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
