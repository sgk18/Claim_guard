# ClaimGuard — MCP Configuration Specification

**Status**: Active / Production Blueprint  
**Standard**: Model Context Protocol (MCP) Integration for Development & Operations  
**Security Boundary**: Development infrastructure only. Production runtime does NOT depend on MCP.

---

## 1. Overview

The Model Context Protocol (MCP) provides standardized context and tool execution interfaces during engineering, database inspection, design reconciliation, and automated testing phases.

ClaimGuard defines clear boundaries:
- **Development & CI**: MCP tools may be invoked to inspect schemas, query cloud metrics, or automate headless browser tests.
- **Production Runtime**: The ClaimGuard Fastify backend and Next.js frontend depend strictly on compiled application code, standard AWS SDKs, and Supabase client libraries.

---

## 2. Configured & Recommended MCP Servers

### A. Supabase Database MCP (`@modelcontextprotocol/server-postgres` / `supabase-mcp`)
- **Purpose**: Schema migration verification, index performance evaluation, RLS policy validation.
- **Tools**:
  - `query_schema`: Inspect tables (`claims`, `receipts`, `fraud_signals`, `risk_assessments`, `audit_logs`).
  - `explain_query`: Validate execution plans on foreign key lookups and JSONB queries.
  - `validate_rls`: Confirm that non-admin database roles cannot select claims across different tenant companies.
- **Security Rule**: Uses isolated read-only or development database connection strings. Service-role master keys are never stored in client-accessible MCP configs.

### B. AWS Cloud MCP (`aws-mcp`)
- **Purpose**: CloudWatch metric monitoring, S3 signed URL lifecycle inspection, Step Functions execution status tracing.
- **Tools**:
  - `get_step_functions_execution`: Trace receipt processing state machine transitions.
  - `inspect_s3_bucket_policy`: Verify bucket encryption (AES-256) and public access blocks.
  - `get_cloudwatch_alarms`: Audit error rates and Lambda cold-start latency.
- **Security Rule**: Operates under an IAM Development Role with strict read-only access to staging resources.

### C. Playwright Testing MCP (`playwright-mcp`)
- **Purpose**: End-to-end browser automation, regression testing, and mobile responsiveness validation.
- **Tools**:
  - `navigate`: Open employee WebView (`/employee`) and manager dashboard (`/manager`).
  - `screenshot`: Capture visual regression artifacts.
  - `interact`: Emulate receipt file upload, form submission, and manager approval clicks.

### D. GitHub MCP (`github-mcp`)
- **Purpose**: Issue tracking, PR reviews, CI workflow triggers.
- **Tools**:
  - `inspect_workflow_runs`: Verify GitHub Actions status.
  - `manage_releases`: Tag semantic version releases.

---

## 3. Configuration Template (`mcp_config.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:[DEV_PASSWORD]@db.[REF].supabase.co:5432/postgres"
      ],
      "env": {
        "DEBUG": "false"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"],
      "env": {
        "HEADLESS": "true"
      }
    }
  }
}
```

---

## 4. Least-Privilege & Secret Protection Rules

1. **Zero Secret Leakage**: No AWS access keys, Supabase service-role keys, or Bedrock tokens are committed into MCP configuration files or logs.
2. **Read-Only Scope**: Development MCP tools operate with read-only scopes on production databases.
3. **Audit Trail**: Every automated schema or environment inspection is logged in the project audit notes.
