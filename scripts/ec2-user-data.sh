#!/usr/bin/env bash
set -e

exec > >(tee -a /var/log/claimguard-init.log) 2>&1
echo "=== ClaimGuard AWS Provisioning Initialized: $(date) ==="

# 1. Update packages and install Node.js 20 & NGINX
echo "--> Installing Node.js 20, NGINX, and utilities..."
dnf clean all
dnf update -y
# Install Node.js 20 LTS repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs npm nginx tar git

node --version
npm --version
nginx -v

# 2. Prepare Application Directory
echo "--> Setting up /opt/claimguard..."
mkdir -p /opt/claimguard
cd /opt/claimguard

# 3. Download and Extract Production Bundle from S3
echo "--> Fetching deployment archive from S3..."
aws s3 cp s3://claimguard-receipts-464642803462/deployments/claimguard-deploy.tar.gz /tmp/claimguard-deploy.tar.gz --region ap-southeast-2
tar -xzf /tmp/claimguard-deploy.tar.gz -C /opt/claimguard

# 4. Install Dependencies
echo "--> Installing Next.js production dependencies..."
npm install --omit=dev --legacy-peer-deps

echo "--> Installing Fastify server production dependencies..."
cd /opt/claimguard/server
npm install --omit=dev --legacy-peer-deps
cd /opt/claimguard

# 5. Configure NGINX Reverse Proxy
echo "--> Applying NGINX reverse-proxy configuration..."
cp /opt/claimguard/nginx/claimguard-ec2.conf /etc/nginx/nginx.conf
nginx -t
systemctl enable nginx
systemctl restart nginx

# 6. Create Fastify Server systemd service
echo "--> Registering claimguard-server systemd service..."
cat << 'EOF' > /etc/systemd/system/claimguard-server.service
[Unit]
Description=ClaimGuard Fastify Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/claimguard/server
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOST=127.0.0.1
Environment=AWS_REGION=ap-southeast-2
Environment=AWS_S3_BUCKET=claimguard-receipts-464642803462
Environment=CLAIMGUARD_MOCK_MODE=true
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7. Create Next.js Web App systemd service
echo "--> Registering claimguard-web systemd service..."
cat << 'EOF' > /etc/systemd/system/claimguard-web.service
[Unit]
Description=ClaimGuard Next.js Web App
After=network.target claimguard-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/claimguard
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=127.0.0.1
Environment=AWS_REGION=ap-southeast-2
Environment=AWS_S3_BUCKET=claimguard-receipts-464642803462
Environment=CLAIMGUARD_MOCK_MODE=true
ExecStart=/usr/bin/npx next start -p 3000 -H 127.0.0.1
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 8. Start Services
echo "--> Starting ClaimGuard systemd units..."
systemctl daemon-reload
systemctl enable --now claimguard-server
systemctl enable --now claimguard-web
systemctl restart nginx

# 9. Verify local health
sleep 5
echo "--> Testing internal endpoints..."
curl -s -o /dev/null -w "NGINX healthz: %{http_code}\n" http://127.0.0.1/healthz
curl -s -o /dev/null -w "Fastify server-health: %{http_code}\n" http://127.0.0.1/server-health
curl -s -o /dev/null -w "Next.js root: %{http_code}\n" http://127.0.0.1/

echo "=== ClaimGuard AWS Provisioning Completed: $(date) ==="
