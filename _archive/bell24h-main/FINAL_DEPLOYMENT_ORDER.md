# 🚀 BELL24h Final Deployment Order - 20 Minutes

## ✅ Correct Order: SHAP/LIME API First → n8n Workflows Second

**Reason**: n8n workflows depend on the SHAP/LIME API being live first. They call `https://api.bell24h.com/api/v1/ai/explain` - if the API is down, n8n workflows will fail.

## 📋 Deployment Steps (20 Minutes Total)

### STEP 1: Deploy SHAP/LIME + FastAPI (10 minutes) ✅

#### 1.1: SSH into Oracle VM
```bash
ssh ubuntu@YOUR_ORACLE_PUBLIC_IP
```

#### 1.2: Update Code
```bash
cd ~/bell24h
git pull origin main
```

#### 1.3: Deploy Backend
```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Build Docker image
- ✅ Start container with auto-restart
- ✅ Configure Caddy with HTTPS
- ✅ Test health endpoint

#### 1.4: Verify API is Live
```bash
curl https://api.bell24h.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "production",
  "service": "bell24h-backend"
}
```

#### 1.5: Test SHAP API
```bash
curl -X POST https://api.bell24h.com/api/v1/ai/explain-match/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 125000,
    "lead_time": 7,
    "supplier_rating": 4.8,
    "distance_km": 89,
    "past_on_time_rate": 0.97
  }'
```

Expected: SHAP JSON with `feature_importance`, `model_used`, `shap_plots`

---

### STEP 2: Import n8n Workflows (10 minutes) ✅

#### 2.1: Access n8n Editor
Open browser: `https://n8n.bell24h.com` (or `http://YOUR_ORACLE_VM_IP:5678`)

#### 2.2: Import RFQ AI Matching Workflow
1. Click **"Workflows"** → **"Import from File"**
2. Select `backend/n8n/workflows/rfq-ai-matching.json`
3. Click **"Import"**

#### 2.3: Import Marketing Automation Workflow
1. Click **"Workflows"** → **"Import from File"**
2. Select `backend/n8n/workflows/marketing-automation.json`
3. Click **"Import"**

#### 2.4: Configure Environment Variables
In n8n Settings → Environment Variables, add:
```env
MSG91_API_KEY=your_msg91_api_key
MSG91_RFQ_WINNER_TEMPLATE_ID=your_template_id
MSG91_WELCOME_TEMPLATE_ID=your_welcome_template_id
MSG91_VERIFICATION_REMINDER_TEMPLATE_ID=your_reminder_template_id
GOOGLE_SHEETS_RFQ_LOG_ID=your_sheet_id (optional)
GOOGLE_SHEETS_SUPPLIERS_ID=your_sheet_id (optional)
```

#### 2.5: Configure Google Sheets (Optional)
1. Click on **"Google Sheets - Log Win"** node
2. Click **"Connect Google Sheets"**
3. Follow OAuth flow
4. Repeat for other Google Sheets nodes

#### 2.6: Activate Workflows
1. Open each workflow
2. Toggle **"Active"** switch
3. Workflows are now live

#### 2.7: Test Workflows
```bash
# Test RFQ webhook
curl -X POST https://n8n.bell24h.com/webhook/rfq-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1001,
    "price": 125000,
    "lead_time": 7,
    "supplier_rating": 4.8,
    "distance_km": 89,
    "past_on_time_rate": 0.97,
    "supplier_id": 1,
    "supplier_phone": "+919819049523"
  }'

# Test Supplier webhook
curl -X POST https://n8n.bell24h.com/webhook/supplier-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Test Supplier",
    "mobile": "+919819049523",
    "email": "test@example.com"
  }'
```

Or use the test script:
```bash
cd backend/n8n
chmod +x test-workflows.sh
./test-workflows.sh
```

---

### STEP 3: Update Frontend (Automatic) ✅

#### 3.1: Push to GitHub
```bash
cd ~/bell24h
git add .
git commit -m "prod: FINAL LIVE — SHAP/LIME + n8n workflows active"
git push origin main
```

#### 3.2: Vercel Auto-Deploy
Vercel will automatically deploy the frontend.

#### 3.3: Verify Frontend
- Open `https://bell24h.com`
- Test OTP login
- Test AI Insights page
- Verify SHAP/LIME visualizations

---

## 🎯 Final URLs After Deployment

| URL | Status | Purpose |
|-----|--------|---------|
| `https://bell24h.com` | ✅ LIVE | Main frontend (Vercel) |
| `https://api.bell24h.com/api/health` | ✅ LIVE | Backend health check |
| `https://api.bell24h.com/api/v1/ai/explain` | ✅ LIVE | SHAP/LIME API |
| `https://n8n.bell24h.com` | ✅ LIVE | n8n editor |
| `https://n8n.bell24h.com/webhook/rfq-new` | ✅ LIVE | RFQ webhook |
| `https://n8n.bell24h.com/webhook/supplier-new` | ✅ LIVE | Supplier webhook |
| `https://bell24h.com/dashboard/ai-insights` | ✅ LIVE | AI Insights page |

---

## ✅ Success Criteria

After deployment, verify:
- [x] `https://api.bell24h.com/api/health` returns healthy
- [x] SHAP API responds with feature importance
- [x] n8n workflows imported and activated
- [x] RFQ webhook triggers workflow
- [x] Supplier webhook triggers workflow
- [x] Frontend loads correctly
- [x] OTP login works
- [x] AI Insights shows SHAP/LIME
- [x] Docker container running
- [x] Caddy + SSL active
- [x] Zero server cost

---

## 📚 Documentation

- **Backend Deployment**: `backend/DEPLOYMENT.md`
- **n8n Workflow Setup**: `backend/n8n/N8N_WORKFLOW_SETUP.md`
- **n8n Workflows**: `backend/n8n/README.md`
- **Production Checklist**: `backend/PRODUCTION_CHECKLIST.md`

---

## 🐛 Troubleshooting

### API Not Responding
1. Check Docker: `docker ps | grep bell24h-prod`
2. Check logs: `docker logs bell24h-prod`
3. Test locally: `curl http://localhost:8000/api/health`

### n8n Workflows Not Triggering
1. Check if workflow is **Active**
2. Verify webhook URL is correct
3. Check n8n logs: `docker logs n8n`
4. Verify API backend is running

### SHAP API Failing
1. Check backend logs: `docker logs bell24h-prod`
2. Verify model file: `ls -lh backend/app/models/rfq_model.pkl`
3. Test API directly: `curl https://api.bell24h.com/api/v1/ai/explain-match/1 -X POST`

---

## 🎉 Deployment Complete!

Your BELL24h platform is now fully deployed with:
- ✅ FastAPI backend with SHAP/LIME
- ✅ n8n workflows for RFQ AI Matching and Marketing Automation
- ✅ Frontend on Vercel
- ✅ HTTPS with Caddy
- ✅ Zero server cost

**Total Time**: 20 minutes
**Status**: ✅ LIVE

---

**🚀 BELL24h Empire is LIVE!**

