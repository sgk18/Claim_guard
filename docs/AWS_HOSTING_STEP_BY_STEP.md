# ClaimGuard — Complete Step-by-Step AWS Hosting Guide with NGINX

This guide provides an end-to-end walkthrough for deploying **ClaimGuard** (Next.js Frontend + Fastify Backend + NGINX Reverse Proxy + AWS Serverless Services) to Amazon Web Services (AWS).

---

## Architecture Overview

```
                        INTERNET (Users / Mobile WhatsApp Webhook)
                                       │
                                       ▼ (Port 80 / 443 HTTPS)
            ┌────────────────────────────────────────────────────────┐
            │                  AWS EC2 / ECS Service                 │
            │                                                        │
            │   ┌────────────────────────────────────────────────┐   │
            │   │               NGINX Reverse Proxy              │   │
            │   │   - SSL/TLS Termination (Let's Encrypt / ACM)  │   │
            │   │   - 25MB Body Size for High-Res Receipts       │   │
            │   │   - Gzip Compression & Static Asset Caching    │   │
            │   │   - Security Headers & Health Checks (/healthz)│   │
            │   └───────────────┬────────────────┬───────────────┘   │
            │                   │                │                   │
            │    / (Web UI)     │                │ /api/v1/*         │
            │    & Next.js API  │                │                   │
            │                   ▼                ▼                   │
            │         ┌────────────────┐   ┌────────────────┐        │
            │         │  Next.js App   │   │ Fastify Server │        │
            │         │  (Port 3000)   │   │  (Port 3001)   │        │
            │         └────────────────┘   └───────┬────────┘        │
            └──────────────────────────────────────┼─────────────────┘
                                                   │
                ┌──────────────────────────────────┴─────────────────┐
                ▼                                  ▼                 ▼
        [ AWS S3 Bucket ]                  [ AWS Textract ]   [ AWS Bedrock ]
    Private receipt storage               AnalyzeExpense OCR   Claude 3.5 Sonnet
    (AES256 Server-Side KMS)              Key-value parser     AI Risk Narratives
```

---

## Deployment Options

ClaimGuard supports two primary deployment topologies on AWS:
* **Option A (Recommended & Fastest): AWS EC2 + Docker Compose + NGINX** — Ideal for production MVPs, predictable monthly costs, single-box management with automated SSL.
* **Option B (Enterprise / Multi-AZ): AWS ECS Fargate + Application Load Balancer (ALB)** — Fully managed serverless containers with auto-scaling across multiple availability zones.

---

# OPTION A: Step-by-Step AWS EC2 + NGINX Deployment

### Step 1: Launch an AWS EC2 Instance
1. Open the [AWS Management Console](https://console.aws.amazon.com/) and navigate to **EC2** in your chosen region (e.g., `ap-south-1` Mumbai or `us-east-1`).
2. Click **Launch Instance**:
   - **Name**: `claimguard-production`
   - **OS Image**: **Ubuntu Server 24.04 LTS** (64-bit x86 or ARM64)
   - **Instance Type**: `t3.medium` (2 vCPU, 4 GB RAM) or `t4g.medium` (Graviton)
   - **Key Pair**: Select or generate a `.pem` SSH key pair (e.g., `claimguard-key.pem`)
3. **Network Settings**:
   - Create a Security Group with the following inbound rules:
     - **SSH (Port 22)**: `My IP` (Restricted to your IP address)
     - **HTTP (Port 80)**: `0.0.0.0/0` (Anywhere)
     - **HTTPS (Port 443)**: `0.0.0.0/0` (Anywhere)
4. **Storage**: General Purpose SSD (`gp3`), minimum **30 GB**.
5. Click **Launch Instance**.

---

### Step 2: Create IAM Role for EC2 (No Hardcoded AWS Keys)
To allow the EC2 server to interact with S3, Textract, and Bedrock without baking AWS access keys into code:
1. In the AWS Console, open **IAM** > **Roles** > **Create Role**.
2. Select **Trusted Entity**: **AWS Service** > **EC2**.
3. Attach policies (or create a custom inline policy):
   - `AmazonS3FullAccess` (or restricted to `arn:aws:s3:::claimguard-receipts-*`)
   - `AmazonTextractFullAccess`
   - `AmazonBedrockFullAccess` (specifically `bedrock:InvokeModel`)
4. Name the role `ClaimGuardEC2Role` and create it.
5. In the EC2 console, right-click your instance > **Security** > **Modify IAM Role** > Select `ClaimGuardEC2Role` > **Update IAM role**.

---

### Step 3: Connect to EC2 and Install Docker
Connect to your EC2 instance via SSH:
```bash
ssh -i "claimguard-key.pem" ubuntu@<YOUR-EC2-PUBLIC-IP>
```

Run updates and install Docker + Docker Compose:
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Docker & prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release git

# 3. Add official Docker GPG key & repo
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine and Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5. Allow ubuntu user to execute docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 4: Clone ClaimGuard and Configure Environment
```bash
# Clone the repository
git clone https://github.com/sgk18/Claim_guard.git
cd Claim_guard

# Create production .env.local file
cp .env.example .env.local
nano .env.local
```

Populate the production configuration in `.env.local`:
```env
# AWS Infrastructure
AWS_REGION=ap-south-1
AWS_S3_BUCKET=claimguard-receipts-production
AWS_TEXTRACT_REGION=ap-south-1
AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# Operational mode (false = use real AWS S3/Textract/Bedrock)
CLAIMGUARD_MOCK_MODE=false

# Supabase Production Keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# WhatsApp Cloud API (Optional for WhatsApp receipt bot)
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

---

### Step 5: Start the Full Stack with NGINX
Build and launch all services in detached mode using `docker-compose.prod.yml`:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Verify that all three containers are healthy and running:
```bash
docker compose -f docker-compose.prod.yml ps
```
You should see:
- `claimguard-nginx`: Up (Ports `0.0.0.0:80->80/tcp`, `0.0.0.0:443->443/tcp`)
- `claimguard-web`: Up (Port `3000/tcp`)
- `claimguard-server`: Up (Port `3001/tcp`)

Test the NGINX reverse proxy from the terminal:
```bash
# Test NGINX health check endpoint
curl -i http://localhost/healthz

# Test Fastify Server health through NGINX
curl -i http://localhost/server-health

# Test Next.js homepage through NGINX
curl -i http://localhost/
```

---

### Step 6: Configure Domain & SSL/TLS (HTTPS)
1. Point your domain (e.g. `claimguard.yourcompany.com`) to your EC2 Elastic IP using an **A Record** in Route 53 or your DNS registrar.
2. Install Certbot to generate free, auto-renewing Let's Encrypt SSL certificates:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
3. Request SSL certificate:
```bash
sudo certbot certonly --standalone -d claimguard.yourcompany.com
```
4. Link the certificates into `certbot/conf/` or enable SSL in `nginx/nginx.conf` and reload NGINX:
```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

# OPTION B: Step-by-Step AWS ECS Fargate + Terraform

For enterprise, zero-server-maintenance deployments with automated rolling updates:

### Step 1: Configure AWS CLI & Terraform Locally
```bash
# Install Terraform 1.5+ and AWS CLI v2
aws configure
# Specify your AWS Access Key, Secret Key, and Default Region (e.g. ap-south-1)
```

### Step 2: Build & Push Docker Images to Amazon ECR
```bash
# Log in to Amazon ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# 1. Build and push Next.js Web App
docker build -t claimguard-web .
docker tag claimguard-web:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/claimguard-web:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/claimguard-web:latest

# 2. Build and push Fastify Server
docker build -t claimguard-server ./server
docker tag claimguard-server:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/claimguard-server:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/claimguard-server:latest
```

### Step 3: Deploy Terraform Infrastructure
```bash
cd aws/infrastructure

# Initialize Terraform
terraform init

# Review execution plan
terraform plan

# Apply infrastructure (creates VPC, S3 bucket, ECS cluster, Task definitions, IAM roles)
terraform apply -auto-approve
```

---

## Maintenance & Operational Commands

| Command | Purpose |
|---|---|
| `docker compose -f docker-compose.prod.yml logs -f nginx` | Stream real-time NGINX access & error logs |
| `docker compose -f docker-compose.prod.yml logs -f server` | Stream Fastify fraud processing logs |
| `docker compose -f docker-compose.prod.yml logs -f web` | Stream Next.js web application logs |
| `docker compose -f docker-compose.prod.yml restart nginx` | Restart NGINX without touching Node services |
| `docker compose -f docker-compose.prod.yml down` | Gracefully stop the stack |
| `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d` | Deploy new code updates with zero friction |
