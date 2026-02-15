# BELL24h Production Deployment Guide

## 🚀 Quick Start - Deploy to Oracle VM

### Prerequisites
- Oracle VM with Ubuntu (2 vCPU, 1GB RAM, 180GB disk)
- Domain: `bell24h.com` configured
- SSH access to Oracle VM
- Docker installed (or use the deploy script to install it)

### Step 1: Update DNS Records

Go to your domain registrar (GoDaddy/Namecheap) and add:

```
A     @        → 76.76.21.21                  # Vercel root
CNAME www      → cname.vercel-dns.com
CNAME api      → YOUR_ORACLE_PUBLIC_IP        # Replace with actual Oracle VM IP
```

### Step 2: SSH into Oracle VM

```bash
ssh ubuntu@YOUR_ORACLE_PUBLIC_IP
```

### Step 3: Clone/Update Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/bell24h.git || cd bell24h && git pull origin main
cd bell24h/backend
```

### Step 4: Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Install Docker (if not installed)
- ✅ Install Caddy (if not installed)
- ✅ Build Docker image
- ✅ Stop old container
- ✅ Start new container
- ✅ Configure Caddy with HTTPS
- ✅ Test health endpoint

### Step 5: Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build Docker image
docker build -t bell24h-backend:latest .

# Stop old container
docker stop bell24h-prod || true
docker rm bell24h-prod || true

# Run new container
docker run -d \
    --name bell24h-prod \
    --restart unless-stopped \
    -p 8000:8000 \
    -v $(pwd)/app/models:/app/app/models:ro \
    -v $(pwd)/data:/app/data:ro \
    -v /var/log/bell24h:/var/log/bell24h \
    bell24h-backend:latest

# Install Caddy
sudo apt update
sudo apt install -y caddy

# Copy Caddyfile
sudo cp Caddyfile /etc/caddy/Caddyfile

# Update email in Caddyfile (replace sanika@bell24h.com with your email)
sudo nano /etc/caddy/Caddyfile

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy
```

### Step 6: Verify Deployment

```bash
# Check container status
docker ps | grep bell24h-prod

# Check container logs
docker logs -f bell24h-prod

# Test health endpoint
curl http://localhost:8000/api/health

# Test HTTPS endpoint (from your local machine)
curl https://api.bell24h.com/api/health

# Check Caddy status
sudo systemctl status caddy

# Check Caddy logs
sudo tail -f /var/log/caddy/bell24h-api.log
```

## 🔄 Update Frontend (Vercel)

### Step 1: Update Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - `NEXT_PUBLIC_BACKEND_URL=https://api.bell24h.com`
   - `BACKEND_URL=https://api.bell24h.com`
   - `NEXT_PUBLIC_APP_URL=https://bell24h.com`

### Step 2: Deploy to Vercel

```bash
cd client
git add .
git commit -m "prod: Update API URLs for production"
git push origin main
```

Vercel will automatically deploy.

## 📊 Monitoring

### View Backend Logs
```bash
docker logs -f bell24h-prod
```

### View Caddy Logs
```bash
sudo tail -f /var/log/caddy/bell24h-api.log
```

### Check Container Health
```bash
docker ps
docker inspect bell24h-prod | grep Health -A 10
```

### Restart Services
```bash
# Restart backend
docker restart bell24h-prod

# Restart Caddy
sudo systemctl restart caddy
```

## 🔒 Security

### Firewall Setup (Ubuntu)
```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5678/tcp  # n8n (if needed)
sudo ufw enable
```

### SSL Certificates
Caddy automatically handles Let's Encrypt certificates. Make sure:
- Your domain DNS points to the Oracle VM IP
- Port 80 and 443 are open
- Email in Caddyfile is valid

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs bell24h-prod

# Check if port is in use
sudo netstat -tulpn | grep 8000

# Check Docker status
sudo systemctl status docker
```

### Caddy won't start
```bash
# Check Caddy logs
sudo journalctl -u caddy -f

# Validate Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile

# Check if ports are available
sudo netstat -tulpn | grep -E '80|443'
```

### Backend not responding
```bash
# Test local endpoint
curl http://localhost:8000/api/health

# Check container logs
docker logs bell24h-prod

# Restart container
docker restart bell24h-prod
```

### Model not loading
```bash
# Check if model file exists
ls -lh app/models/rfq_model.pkl

# Check container logs for model loading errors
docker logs bell24h-prod | grep -i model

# Verify model file is mounted correctly
docker exec bell24h-prod ls -la /app/app/models/
```

## 📝 Environment Variables

### Backend (Docker)
Set in `docker run` command or use `.env` file:
```bash
-e ENVIRONMENT=production
-e MSG91_API_KEY=your_key
-e MSG91_SENDER_ID=your_sender_id
```

### Frontend (Vercel)
Set in Vercel Dashboard:
- `NEXT_PUBLIC_BACKEND_URL=https://api.bell24h.com`
- `BACKEND_URL=https://api.bell24h.com`
- `NEXT_PUBLIC_APP_URL=https://bell24h.com`

## 🎯 Success Criteria

After deployment, verify:
- ✅ https://api.bell24h.com/api/health returns `{"status":"healthy","version":"production"}`
- ✅ https://bell24h.com loads correctly
- ✅ OTP login works with MSG91
- ✅ AI Insights page shows SHAP/LIME visualizations
- ✅ Docker container is running: `docker ps | grep bell24h-prod`
- ✅ Caddy is running: `sudo systemctl status caddy`
- ✅ SSL certificate is valid (check browser padlock)

## 🤖 n8n Workflow Setup

### Step 1: Access n8n Editor

Open your browser and go to:
```
https://n8n.bell24h.com
```

Or if not using HTTPS:
```
http://YOUR_ORACLE_VM_IP:5678
```

### Step 2: Import Workflows

1. Click **"Workflows"** in the left sidebar
2. Click **"Import from File"** or **"+"** → **"Import from File"**
3. Import `backend/n8n/workflows/rfq-ai-matching.json`
4. Import `backend/n8n/workflows/marketing-automation.json`

### Step 3: Configure Environment Variables

1. Go to **Settings** → **Environment Variables** in n8n
2. Add the following variables:

```env
MSG91_API_KEY=your_msg91_api_key_here
MSG91_RFQ_WINNER_TEMPLATE_ID=your_template_id_here
MSG91_WELCOME_TEMPLATE_ID=your_welcome_template_id_here
MSG91_VERIFICATION_REMINDER_TEMPLATE_ID=your_reminder_template_id_here
GOOGLE_SHEETS_RFQ_LOG_ID=your_google_sheets_id_here (optional)
GOOGLE_SHEETS_SUPPLIERS_ID=your_google_sheets_id_here (optional)
```

### Step 4: Activate Workflows

1. Open each workflow
2. Toggle the **"Active"** switch at the top right
3. Workflows are now live and will trigger on webhook calls

### Step 5: Test Workflows

Run the test script:
```bash
cd backend/n8n
chmod +x test-workflows.sh
./test-workflows.sh
```

Or test manually:
```bash
# Test RFQ webhook
curl -X POST https://n8n.bell24h.com/webhook/rfq-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1001,
    "price": 125000,
    "supplier_id": 1,
    "supplier_phone": "+919819049523"
  }'
```

### Step 6: Update Caddy for n8n HTTPS

If n8n is not yet accessible via HTTPS, update Caddyfile:

```bash
sudo nano /etc/caddy/Caddyfile
```

Add n8n configuration:
```
n8n.bell24h.com {
    reverse_proxy localhost:5678
    tls sanika@bell24h.com
}
```

Restart Caddy:
```bash
sudo systemctl restart caddy
```

For detailed n8n workflow setup, see [n8n/N8N_WORKFLOW_SETUP.md](./n8n/N8N_WORKFLOW_SETUP.md)

## 🚀 Next Steps

1. Set up monitoring (Sentry, LogRocket, etc.)
2. Configure backups for database
3. Set up CI/CD for automatic deployments
4. Add rate limiting
5. Set up load balancing (if needed)
6. Import and activate n8n workflows (see above)

---

**Deployment Complete! 🎉**

Your BELL24h backend is now live at https://api.bell24h.com
Your n8n workflows are ready to import at https://n8n.bell24h.com

