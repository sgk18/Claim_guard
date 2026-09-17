# CLAIMGUARD — Deployment & Production Guide

## 1. Hosting Architecture
ClaimGuard is packaged as a standard Next.js application that can be deployed on:
- **Vercel** / **AWS Amplify** / **Cloudflare Pages** (Serverless)
- **AWS ECS (Fargate) / Docker** (Containerized)
- **Node.js PM2 / Linux VM** (Standalone server)

---

## 2. Docker Deployment
A production multi-stage Dockerfile can be built as follows:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 3. Production Environment Checklist
| Variable | Value | Purpose |
|---|---|---|
| `CLAIMGUARD_MOCK_MODE` | `false` | Switch from local mocks to AWS & Meta APIs |
| `AWS_REGION` | `ap-south-1` | Mumbai region for lowest Indian latency & data residency |
| `AWS_S3_BUCKET` | `claimguard-prod-receipts` | Secure private S3 receipt store |
| `AWS_TEXTRACT_REGION` | `ap-south-1` | AWS Textract document OCR |
| `AWS_BEDROCK_MODEL_ID` | `anthropic.claude-3-5-sonnet-20241022-v2:0` | Bedrock structured risk explanation |
| `WHATSAPP_PHONE_NUMBER_ID`| Meta Business Account Phone ID | For WhatsApp Cloud platform messages |
| `WHATSAPP_ACCESS_TOKEN` | System User Permanent Token | Meta Graph API authorization |
