import test from "node:test";
import assert from "node:assert/strict";

import { db } from "../src/db/store.ts";
import { GET as getClaims, POST as createClaim } from "../src/app/api/claims/route.ts";
import { GET as getClaimById } from "../src/app/api/claims/[id]/route.ts";
import { POST as approveClaim } from "../src/app/api/claims/[id]/approve/route.ts";
import { POST as rejectClaim } from "../src/app/api/claims/[id]/reject/route.ts";
import { GET as getClaimAudit } from "../src/app/api/claims/[id]/audit/route.ts";
import { GET as verifyWhatsAppWebhook, POST as postWhatsAppWebhook } from "../src/app/api/whatsapp/webhook/route.ts";

test("API: GET /api/claims returns initial seeded claims", async () => {
  const req = new Request("http://localhost:3000/api/claims");
  const res = await getClaims(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.total > 0);
});

test("API: GET /api/claims filters by status and category", async () => {
  const req = new Request("http://localhost:3000/api/claims?status=APPROVED&category=fuel");
  const res = await getClaims(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  for (const c of json.data) {
    assert.equal(c.status, "APPROVED");
    assert.equal(c.category, "fuel");
  }
});

test("API: GET /api/claims search filter handles missing employee without crashing", async () => {
  // Save temporary claim without employee to test safe chaining bug fix
  const testClaimId = `CLM-TEST-NOEMP-${Date.now()}`;
  db.saveClaim({
    id: testClaimId,
    companyId: "comp_test",
    employeeId: "emp_orphan",
    vendorName: "Orphaned Vendor Gas",
    amount: 1500,
    currency: "INR",
    date: "2026-03-15",
    category: "fuel",
    status: "PENDING",
    receiptUrl: "/mock.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // employee intentionally omitted/undefined
  });

  const req = new Request(`http://localhost:3000/api/claims?search=Orphaned`);
  const res = await getClaims(req);
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.ok(json.data.some((c) => c.id === testClaimId));
});

test("API: GET /api/claims/[id] retrieves claim details with matched duplicate if present", async () => {
  const req = new Request("http://localhost:3000/api/claims/CLM-4471");
  const res = await getClaimById(req, { params: Promise.resolve({ id: "CLM-4471" }) });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.id, "CLM-4471");
});

test("API: GET /api/claims/[id] returns 404 for non-existent claim", async () => {
  const req = new Request("http://localhost:3000/api/claims/CLM-NONEXISTENT-9999");
  const res = await getClaimById(req, { params: Promise.resolve({ id: "CLM-NONEXISTENT-9999" }) });
  const json = await res.json();

  assert.equal(res.status, 404);
  assert.equal(json.success, false);
});

test("API: POST /api/claims/[id]/approve records manager approval and audit entry", async () => {
  const testId = `CLM-APPR-${Date.now()}`;
  db.saveClaim({
    id: testId,
    companyId: "comp_1",
    employeeId: "emp_1",
    vendorName: "Test Cafe",
    amount: 500,
    currency: "INR",
    date: "2026-03-10",
    category: "food",
    status: "PENDING",
    receiptUrl: "/receipt.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const req = new Request(`http://localhost:3000/api/claims/${testId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ managerId: "mgr_sunil", notes: "Approved after receipt inspection" }),
  });

  const res = await approveClaim(req, { params: Promise.resolve({ id: testId }) });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.status, "APPROVED");
  assert.equal(json.data.managerId, "mgr_sunil");

  // Verify audit log
  const auditReq = new Request(`http://localhost:3000/api/claims/${testId}/audit`);
  const auditRes = await getClaimAudit(auditReq, { params: Promise.resolve({ id: testId }) });
  const auditJson = await auditRes.json();

  assert.equal(auditRes.status, 200);
  assert.ok(auditJson.data.some((a) => a.action === "CLAIM_APPROVED" && a.actorId === "mgr_sunil"));
});

test("API: POST /api/claims/[id]/reject records manager rejection and audit entry", async () => {
  const testId = `CLM-REJ-${Date.now()}`;
  db.saveClaim({
    id: testId,
    companyId: "comp_1",
    employeeId: "emp_1",
    vendorName: "Night Club Bar",
    amount: 12000,
    currency: "INR",
    date: "2026-03-10",
    category: "food",
    status: "PENDING",
    receiptUrl: "/receipt.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const req = new Request(`http://localhost:3000/api/claims/${testId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ managerId: "mgr_priya", notes: "Non-allowable personal leisure expense" }),
  });

  const res = await rejectClaim(req, { params: Promise.resolve({ id: testId }) });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.success, true);
  assert.equal(json.data.status, "REJECTED");
  assert.equal(json.data.managerId, "mgr_priya");
});

test("API: WhatsApp Webhook GET validates subscription token challenge", async () => {
  const challenge = "CHALLENGE_STRING_12345";
  const req = new Request(
    `http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=claimguard_verify_token&hub.challenge=${challenge}`
  );
  const res = await verifyWhatsAppWebhook(req);

  assert.equal(res.status, 200);
  const text = await res.text();
  assert.equal(text, challenge);
});

test("API: WhatsApp Webhook GET rejects invalid subscription token", async () => {
  const req = new Request(
    "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=test"
  );
  const res = await verifyWhatsAppWebhook(req);

  assert.equal(res.status, 403);
});
