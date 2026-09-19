# ClaimGuard — Model Context Protocol (MCP) Configuration

This document specifies the Model Context Protocol (MCP) server integration strategy for the ClaimGuard platform development lifecycle.

---

## 1. Principles & Boundaries

1. **Development Assistance Only**: MCP tools are strictly developer/orchestrator tooling used during coding, database management, testing, and cloud inspection.
2. **Zero Client Dependency**: The production Flutter mobile application, Next.js web application, and standalone Fastify backend do **not** depend on MCP runtime.
3. **Least Privilege**: All MCP servers operate with scoped access matching the environment security boundaries.

---

## 2. Server Matrix

| Server | Role / Purpose | Type | Integration Target |
| :--- | :--- | :--- | :--- |
| **AWS MCP** | Query AWS resources (S3 buckets, Step Functions, CloudWatch logs, ECS services) during cloud orchestration | Cloud Dev | AWS selected region infrastructure |
| **Supabase MCP** | Inspect PostgreSQL schemas, run database migrations, verify RLS policies, inspect seed data | Database Dev | Supabase PostgreSQL project |
| **Playwright MCP** | Automate browser-based E2E scenarios for Web `/employee` and `/manager` workflows | Testing | Local Next.js dev server (`http://localhost:3000`) |
| **GitHub MCP** | Manage CI/CD workflows, pull requests, issue tracking, and repository releases | DevOps | Repository `sgk18/Claim_guard` |
| **Blender MCP** | 3D / visual asset generation (available locally in user environment) | Assets | Optional marketing/diagram asset generation |

---

## 3. Configuration Template (`mcp_config.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "env:SUPABASE_SERVICE_ROLE_KEY"
      }
    },
    "aws": {
      "command": "npx",
      "args": ["-y", "@aws/mcp-server"],
      "env": {
        "AWS_REGION": "selected-region"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

---

## 4. Operational Guardrails

- Never embed MCP credentials or keys into Flutter `pubspec.yaml`, Android build configurations, or client web source code.
- Fastify server communicates with Supabase through standard PostgreSQL connections (`pg` / `@supabase/supabase-js`) and with AWS via the official AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/client-textract`, `@aws-sdk/client-bedrock-runtime`).
