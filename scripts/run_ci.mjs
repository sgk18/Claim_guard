#!/usr/bin/env node

/**
 * ClaimGuard Local CI/CD Test Appliance Runner
 * Sequentially executes the full deterministic QA and verification pipeline:
 *  1. Deterministic Engine Tests
 *  2. API & Verification Suite
 *  3. Full CSAD / Claim Validation Suite
 *  4. Fastify Standalone Server Tests
 *  5. Frontend Build Verification
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

const pipelineSteps = [
  {
    id: "STEP-1",
    name: "Deterministic Engine Tests",
    command: "node",
    args: ["--import", "tsx", "--test", "tests/claimguard.test.mjs"],
  },
  {
    id: "STEP-2",
    name: "API & Verification Suite",
    command: "node",
    args: ["--import", "tsx", "--test", "tests/api.test.mjs"],
  },
  {
    id: "STEP-3",
    name: "Full CSAD / Claim Validation Suite",
    command: "node",
    args: ["--import", "tsx", "--test", "tests/csad-appliance.test.mjs"],
  },
  {
    id: "STEP-4",
    name: "Fastify Standalone Server Tests",
    command: "node",
    args: ["--test", "server/tests/server.test.mjs"],
  },
  {
    id: "STEP-5",
    name: "Frontend Build Verification",
    command: process.platform === "win32" ? "npx.cmd" : "npx",
    args: ["tsc", "--noEmit"],
  },
];

console.log(`${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}${CYAN} CLAIMGUARD CI/CD APPLIANCE & QA PIPELINE RUNNER     ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}`);
console.log(`Started at: ${new Date().toISOString()}\n`);

const results = [];
let allPassed = true;
const pipelineStart = Date.now();

for (const step of pipelineSteps) {
  const stepStart = Date.now();
  console.log(`${BOLD}[RUNNING]${RESET} ${step.id}: ${step.name}...`);

  const proc = spawnSync(step.command, step.args, {
    stdio: "inherit",
    env: { ...process.env, CI: "true", NODE_ENV: "test" },
    shell: process.platform === "win32",
  });

  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
  const status = proc.status === 0 ? "PASSED" : "FAILED";

  if (proc.status !== 0) {
    allPassed = false;
  }

  results.push({
    ...step,
    status,
    exitCode: proc.status,
    durationSec: duration,
  });

  if (proc.status === 0) {
    console.log(`${GREEN}✔ ${step.id} (${step.name}) PASSED in ${duration}s${RESET}\n`);
  } else {
    console.error(`${RED}✖ ${step.id} (${step.name}) FAILED with exit code ${proc.status} in ${duration}s${RESET}\n`);
    // Fail-fast or continue? In standard QA pipelines, report full matrix
  }
}

const totalDuration = ((Date.now() - pipelineStart) / 1000).toFixed(2);

console.log(`${BOLD}${CYAN}======================================================${RESET}`);
console.log(`${BOLD}${CYAN} CI/CD PIPELINE EXECUTION SUMMARY                    ${RESET}`);
console.log(`${BOLD}${CYAN}======================================================${RESET}`);

for (const res of results) {
  const badge = res.status === "PASSED" ? `${GREEN}[PASS]${RESET}` : `${RED}[FAIL]${RESET}`;
  console.log(`  ${badge} ${res.id.padEnd(8)} ${res.name.padEnd(40)} ${res.durationSec}s`);
}

console.log(`\nTotal Pipeline Duration: ${totalDuration}s`);

if (allPassed) {
  console.log(`${BOLD}${GREEN}======================================================${RESET}`);
  console.log(`${BOLD}${GREEN} ✔ ALL CI/CD PIPELINE CHECKS PASSED (EXIT CODE 0)     ${RESET}`);
  console.log(`${BOLD}${GREEN}======================================================${RESET}\n`);
  process.exit(0);
} else {
  console.error(`${BOLD}${RED}======================================================${RESET}`);
  console.error(`${BOLD}${RED} ✖ CI/CD PIPELINE FAILED (EXIT CODE 1)                ${RESET}`);
  console.error(`${BOLD}${RED}======================================================${RESET}\n`);
  process.exit(1);
}
